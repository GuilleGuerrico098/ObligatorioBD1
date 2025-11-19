from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, conlist
from typing import List
from datetime import date, timedelta

from db import get_connection

router = APIRouter(prefix="/reservas", tags=["Reservas"])


# ======== MODELOS DE ENTRADA ========

class ReservaCreate(BaseModel):
    id_sala: int
    fecha: date
    id_turno: int
    ci_responsable: str
    participantes: conlist(str, min_items=1)  # lista de CIs, al menos 1


# ======== ENDPOINTS ========

@router.get("/")
def listar_reservas():
    """
    Lista todas las reservas (básico, ya lo teníamos).
    """
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT r.id_reserva, r.fecha, r.id_sala, r.id_turno, r.ci_responsable, r.estado
        FROM reserva r
    """)
    result = cursor.fetchall()
    cursor.close()
    conn.close()
    return result


@router.post("/")
def crear_reserva(datos: ReservaCreate):
    """
    Crea una reserva nueva aplicando reglas del obligatorio:
    - Sala debe existir
    - Turno debe existir
    - Capacidad de sala
    - Sala libre en ese turno
    - Participantes sin sanción vigente
    - Máximo 2 reservas activas por día por participante
    - Máximo 3 reservas activas por semana por participante
    """

    conn = get_connection()
    conn.start_transaction()
    cursor = conn.cursor(dictionary=True)

    try:
        # 1) Verificar que la sala exista y traer capacidad
        cursor.execute(
            "SELECT id_sala, capacidad FROM sala WHERE id_sala = %s",
            (datos.id_sala,)
        )
        sala = cursor.fetchone()
        if not sala:
            raise HTTPException(status_code=404, detail="Sala no encontrada")

        # 2) Verificar que el turno exista
        cursor.execute(
            "SELECT id_turno FROM turno WHERE id_turno = %s",
            (datos.id_turno,)
        )
        turno = cursor.fetchone()
        if not turno:
            raise HTTPException(status_code=404, detail="Turno no encontrado")

        # 3) Asegurarnos de que el responsable esté en la lista de participantes
        participantes = list(set(datos.participantes))  # eliminamos duplicados
        if datos.ci_responsable not in participantes:
            participantes.append(datos.ci_responsable)

        # 4) Verificar capacidad de la sala
        if len(participantes) > sala["capacidad"]:
            raise HTTPException(
                status_code=400,
                detail=f"La sala tiene capacidad {sala['capacidad']} y se intentan registrar {len(participantes)} participantes"
            )

        # 5) Verificar que la sala esté libre en esa fecha y turno
        cursor.execute(
            """
            SELECT COUNT(*) AS cant
            FROM reserva
            WHERE id_sala = %s
              AND fecha = %s
              AND id_turno = %s
              AND estado = 'activa'
            """,
            (datos.id_sala, datos.fecha, datos.id_turno)
        )
        ocupacion = cursor.fetchone()["cant"]
        if ocupacion > 0:
            raise HTTPException(
                status_code=409,
                detail="La sala ya está reservada en ese turno y fecha"
            )

        # 6) Validaciones por participante (sanciones, horas/día, reservas/semana)
        fecha_reserva = datos.fecha
        semana_inicio = fecha_reserva - timedelta(days=6)  # 7 días para atrás

        for ci in participantes:
            # 6.1) Sanción vigente
            cursor.execute(
                """
                SELECT COUNT(*) AS cant
                FROM sancion_participante
                WHERE ci = %s
                  AND %s BETWEEN fecha_inicio AND fecha_fin
                """,
                (ci, fecha_reserva)
            )
            sanciones = cursor.fetchone()["cant"]
            if sanciones > 0:
                raise HTTPException(
                    status_code=403,
                    detail=f"El participante {ci} tiene una sanción vigente y no puede reservar"
                )

            # 6.2) Máximo 2 reservas activas en el mismo día
            cursor.execute(
                """
                SELECT COUNT(*) AS cant
                FROM reserva r
                JOIN reserva_participante rp ON r.id_reserva = rp.id_reserva
                WHERE rp.ci = %s
                  AND r.fecha = %s
                  AND r.estado = 'activa'
                """,
                (ci, fecha_reserva)
            )
            reservas_dia = cursor.fetchone()["cant"]
            if reservas_dia >= 2:
                raise HTTPException(
                    status_code=409,
                    detail=f"El participante {ci} ya tiene {reservas_dia} reservas activas ese día (máximo 2 horas diarias)"
                )

            # 6.3) Máximo 3 reservas activas en la misma semana
            cursor.execute(
                """
                SELECT COUNT(*) AS cant
                FROM reserva r
                JOIN reserva_participante rp ON r.id_reserva = rp.id_reserva
                WHERE rp.ci = %s
                  AND r.fecha BETWEEN %s AND %s
                  AND r.estado = 'activa'
                """,
                (ci, semana_inicio, fecha_reserva)
            )
            reservas_semana = cursor.fetchone()["cant"]
            if reservas_semana >= 3:
                raise HTTPException(
                    status_code=409,
                    detail=f"El participante {ci} ya tiene {reservas_semana} reservas activas en la semana (máximo 3)"
                )

        # 7) Insertar la reserva
        cursor.execute(
            """
            INSERT INTO reserva (fecha, id_sala, id_turno, ci_responsable, estado)
            VALUES (%s, %s, %s, %s, 'activa')
            """,
            (datos.fecha, datos.id_sala, datos.id_turno, datos.ci_responsable)
        )
        id_reserva = cursor.lastrowid

        # 8) Insertar los participantes de la reserva
        for ci in participantes:
            es_responsable = 1 if ci == datos.ci_responsable else 0
            cursor.execute(
                """
                INSERT INTO reserva_participante (id_reserva, ci, es_responsable)
                VALUES (%s, %s, %s)
                """,
                (id_reserva, ci, es_responsable)
            )

        conn.commit()

        return {
            "id_reserva": id_reserva,
            "mensaje": "Reserva creada correctamente",
            "participantes": participantes
        }

    except HTTPException:
        conn.rollback()
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()
