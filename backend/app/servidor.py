from typing import Optional, List, Literal
from datetime import date, time, timedelta
from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr

from .database import get_connection

app = FastAPI(title="Salas de estudio UCU - Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class LoginRequest(BaseModel):
    correo: EmailStr
    contrasena: str


class LoginResponse(BaseModel):
    correo: EmailStr
    nombre: str
    ci: str
    es_admin: bool


class ParticipanteCreate(BaseModel):
    ci: str
    nombre: str
    apellido: str
    email: EmailStr
    tipo: Literal["grado", "posgrado", "docente"]


class ParticipanteUpdate(BaseModel):
    nombre: str
    apellido: str
    email: EmailStr
    tipo: Literal["grado", "posgrado", "docente"]


class SalaCreate(BaseModel):
    nombre_sala: str
    edificio: str
    capacidad: int
    tipo_sala: str


class SalaUpdate(BaseModel):
    nombre_sala: str
    edificio: str
    capacidad: int
    tipo_sala: str


class ReservaCreate(BaseModel):
    fecha: date
    nombre_sala: str
    edificio: str
    id_turno: int
    ci_responsable: str
    participantes: List[str]


class ReservaUpdate(BaseModel):
    fecha: date
    nombre_sala: str
    edificio: str
    id_turno: int


class SancionCreate(BaseModel):
    ci_participante: str
    fecha_inicio: date
    fecha_fin: date
    motivo: str
    id_reserva: Optional[int] = None


class AsistenciaUpdate(BaseModel):
    presentes: List[str]


def get_db():
    conn = get_connection()
    try:
        yield conn
    finally:
        conn.close()


@app.post("/login", response_model=LoginResponse)
def login(datos: LoginRequest, db=Depends(get_db)):
    cur = db.cursor(dictionary=True)

    cur.execute(
        """
        SELECT p.ci,
               p.nombre,
               p.apellido,
               p.email,
               l.contrasena
        FROM login l
        JOIN participante p ON p.email = l.correo
        WHERE l.correo = %s
        """,
        (datos.correo,),
    )
    row = cur.fetchone()

    if not row or row["contrasena"] != datos.contrasena:
        raise HTTPException(status_code=401, detail="Credenciales inválidas")

    cur.execute(
        """
        SELECT COUNT(*) AS es_docente
        FROM participante_programa_academico ppa
        WHERE ppa.ci_participante = %s AND ppa.rol = 'docente'
        """,
        (row["ci"],),
    )
    es_docente = cur.fetchone()["es_docente"] > 0

    return LoginResponse(
        correo=row["email"],
        nombre=row["nombre"],
        ci=row["ci"],
        es_admin=es_docente,
    )


@app.get("/participantes")
def listar_participantes(db=Depends(get_db)):
    cur = db.cursor(dictionary=True)
    cur.execute(
        """
        SELECT ci, nombre, apellido, email, tipo
        FROM participante
        ORDER BY apellido, nombre
        """
    )
    rows = cur.fetchall()
    return rows


@app.post("/participantes")
def crear_participante(body: ParticipanteCreate, db=Depends(get_db)):
    cur = db.cursor()
    try:
        cur.execute(
            """
            INSERT INTO participante (ci, nombre, apellido, email, tipo)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (body.ci, body.nombre, body.apellido, body.email, body.tipo),
        )
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    return {"message": "Participante creado"}


@app.delete("/participantes/{ci}")
def borrar_participante(ci: str, db=Depends(get_db)):
    cur = db.cursor()

    # Obtener email antes de borrar
    cur.execute("SELECT email FROM participante WHERE ci = %s", (ci,))
    row = cur.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Participante no encontrado")

    email = row[0]

    try:
     
        cur.execute("DELETE FROM login WHERE correo = %s", (email,))

        
        cur.execute("DELETE FROM participante_programa_academico WHERE ci_participante = %s", (ci,))

        cur.execute("DELETE FROM reserva_participante WHERE ci_participante = %s", (ci,))

       
        cur.execute("DELETE FROM sancion_participante WHERE ci_participante = %s", (ci,))

      
        cur.execute("DELETE FROM participante WHERE ci = %s", (ci,))

        db.commit()

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

    return {"message": "Participante eliminado correctamente"}

@app.put("/participantes/{ci}")
def actualizar_participante(ci: str, body: ParticipanteUpdate, db=Depends(get_db)):
    cur = db.cursor()

    cur.execute("SELECT email FROM participante WHERE ci = %s", (ci,))
    row = cur.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Participante no encontrado")

    email_anterior = row[0]

    try:
        cur.execute(
            """
            UPDATE participante
            SET nombre = %s,
                apellido = %s,
                email = %s,
                tipo = %s
            WHERE ci = %s
            """,
            (body.nombre, body.apellido, body.email, body.tipo, ci),
        )

        cur.execute(
            """
            UPDATE login
            SET correo = %s
            WHERE correo = %s
            """,
            (body.email, email_anterior),
        )

        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

    return {"message": "Participante actualizado"}


@app.get("/salas")
def listar_salas(db=Depends(get_db)):
    cur = db.cursor(dictionary=True)
    cur.execute(
        """
        SELECT id_sala, nombre_sala, edificio, capacidad, tipo_sala
        FROM sala
        ORDER BY edificio, nombre_sala
        """
    )
    return cur.fetchall()


@app.post("/salas")
def crear_sala(body: SalaCreate, db=Depends(get_db)):
    cur = db.cursor()
    try:
        cur.execute(
            """
            INSERT INTO sala (nombre_sala, edificio, capacidad, tipo_sala)
            VALUES (%s, %s, %s, %s)
            """,
            (body.nombre_sala, body.edificio, body.capacidad, body.tipo_sala),
        )
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

    return {"message": "Sala creada"}


@app.put("/salas/actualizar")
def actualizar_sala(body: SalaUpdate, db=Depends(get_db)):
    cur = db.cursor()
    try:
        cur.execute(
            """
            UPDATE sala
            SET capacidad = %s,
                tipo_sala = %s
            WHERE nombre_sala = %s
              AND edificio = %s
            """,
            (body.capacidad, body.tipo_sala, body.nombre_sala, body.edificio),
        )

        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Sala no encontrada")

        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

    return {"message": "Sala actualizada"}


@app.delete("/salas/{nombre_sala}/{edificio}")
def eliminar_sala(nombre_sala: str, edificio: str, db=Depends(get_db)):
    cur = db.cursor()
    try:
   
        cur.execute(
            "SELECT id_sala FROM sala WHERE nombre_sala = %s AND edificio = %s",
            (nombre_sala, edificio),
        )
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Sala no encontrada")

        id_sala = row[0]

        cur.execute("""
            DELETE rp FROM reserva_participante rp
            JOIN reserva r ON r.id_reserva = rp.id_reserva
            WHERE r.id_sala = %s
        """, (id_sala,))

        
        cur.execute("""
            DELETE sp FROM sancion_participante sp
            JOIN reserva r ON r.id_reserva = sp.id_reserva
            WHERE r.id_sala = %s
        """, (id_sala,))

        cur.execute("DELETE FROM reserva WHERE id_sala = %s", (id_sala,))

     
        cur.execute(
            "DELETE FROM sala WHERE id_sala = %s",
            (id_sala,),
        )

        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Sala no encontrada")

        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

    return {"message": "Sala eliminada"}


@app.get("/turnos")
def listar_turnos(db=Depends(get_db)):
    cur = db.cursor(dictionary=True)
    cur.execute(
        "SELECT id_turno, hora_inicio, hora_fin FROM turno ORDER BY hora_inicio"
    )
    return cur.fetchall()


def hay_choque_reserva(
    db,
    id_sala: int,
    fecha: date,
    id_turno: int,
    excluir_id: Optional[int] = None,
) -> bool:
    cur = db.cursor()

    query = """
        SELECT COUNT(*)
        FROM reserva
        WHERE id_sala = %s
          AND fecha = %s
          AND id_turno = %s
          AND estado = 'activa'
    """
    params = [id_sala, fecha, id_turno]

    if excluir_id is not None:
        query += " AND id_reserva <> %s"
        params.append(excluir_id)

    cur.execute(query, params)
    (count,) = cur.fetchone()
    return count > 0


def participante_tiene_sancion_activa(db, ci: str, fecha: date) -> bool:
    cur = db.cursor()
    cur.execute(
        """
        SELECT COUNT(*)
        FROM sancion_participante
        WHERE ci_participante = %s
          AND %s BETWEEN fecha_inicio AND fecha_fin
        """,
        (ci, fecha),
    )
    (count,) = cur.fetchone()
    return count > 0


def validar_limites_participante(
    db,
    ci: str,
    fecha: date,
    id_turno: int,
    minutos_turno: int,
    tipo_sala: str,
    excluir_id: Optional[int] = None,
):
    cur = db.cursor()

    cur.execute(
        "SELECT tipo FROM participante WHERE ci = %s",
        (ci,),
    )
    row = cur.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail=f"Participante {ci} no existe")
    tipo_participante = row[0]

    if participante_tiene_sancion_activa(db, ci, fecha):
        raise HTTPException(
            status_code=400,
            detail=f"El participante {ci} tiene una sanción activa para esa fecha y no puede reservar",
        )

    if tipo_sala == "exclusiva_docente":
        if tipo_participante != "docente":
            raise HTTPException(
                status_code=400,
                detail=f"Solo docentes pueden reservar en salas exclusivas de docentes (CI {ci})",
            )
        return

    if tipo_sala == "exclusiva_posgrado":
        if tipo_participante != "posgrado":
            raise HTTPException(
                status_code=400,
                detail=f"Solo estudiantes de posgrado pueden reservar en salas exclusivas de posgrado (CI {ci})",
            )
        return

    cur.execute(
        """
        SELECT COALESCE(
            SUM(
                TIMESTAMPDIFF(
                    MINUTE,
                    t.hora_inicio,
                    t.hora_fin
                )
            ), 0
        ) AS minutos
        FROM reserva r
        JOIN reserva_participante rp ON r.id_reserva = rp.id_reserva
        JOIN turno t ON r.id_turno = t.id_turno
        WHERE rp.ci_participante = %s
          AND r.fecha = %s
          AND r.estado = 'activa'
        """
        + (" AND r.id_reserva <> %s" if excluir_id is not None else ""),
        (ci, fecha) + ((excluir_id,) if excluir_id is not None else ()),
    )
    (minutos_existentes,) = cur.fetchone()
    if minutos_existentes + minutos_turno > 120:
        raise HTTPException(
            status_code=400,
            detail=f"El participante {ci} supera el máximo de 2 horas diarias de reserva para esa fecha",
        )

    inicio_semana = fecha - timedelta(days=6)

    cur.execute(
        """
        SELECT COUNT(*)
        FROM reserva r
        JOIN reserva_participante rp ON r.id_reserva = rp.id_reserva
        WHERE rp.ci_participante = %s
          AND r.fecha BETWEEN %s AND %s
          AND r.estado = 'activa'
        """
        + (" AND r.id_reserva <> %s" if excluir_id is not None else ""),
        (ci, inicio_semana, fecha)
        + ((excluir_id,) if excluir_id is not None else ()),
    )
    (cant_semana,) = cur.fetchone()
    if cant_semana + 1 > 3:
        raise HTTPException(
            status_code=400,
            detail=f"El participante {ci} supera el máximo de 3 reservas activas en la semana",
        )


@app.get("/reservas")
def listar_reservas(db=Depends(get_db)):
    cur = db.cursor(dictionary=True)
    cur.execute(
        """
        SELECT
            r.id_reserva,
            r.fecha,
            r.estado,
            r.id_turno,
            t.hora_inicio,
            t.hora_fin,
            s.id_sala,
            s.nombre_sala,
            s.edificio,
            s.capacidad,
            s.tipo_sala,
            p.ci          AS ci_responsable,
            p.nombre      AS nombre_responsable,
            p.apellido    AS apellido_responsable
        FROM reserva r
        JOIN sala s          ON r.id_sala = s.id_sala
        JOIN participante p  ON r.ci_responsable = p.ci
        JOIN turno t         ON r.id_turno = t.id_turno
        ORDER BY r.fecha DESC, t.hora_inicio
        """
    )
    return cur.fetchall()


@app.get("/reservas/mias")
def listar_reservas_mias(ci: str, db=Depends(get_db)):
    cur = db.cursor(dictionary=True)
    cur.execute(
        """
        SELECT
            r.id_reserva,
            r.fecha,
            r.estado,
            r.id_turno,
            t.hora_inicio,
            t.hora_fin,
            s.nombre_sala,
            s.edificio
        FROM reserva r
        JOIN reserva_participante rp ON r.id_reserva = rp.id_reserva
        JOIN sala s                  ON r.id_sala = s.id_sala
        JOIN turno t                 ON r.id_turno = t.id_turno
        WHERE rp.ci_participante = %s
        ORDER BY r.fecha DESC, t.hora_inicio
        """,
        (ci,),
    )
    return cur.fetchall()


@app.get("/reservas/{id_reserva}/participantes")
def listar_participantes_reserva(id_reserva: int, db=Depends(get_db)):
    cur = db.cursor(dictionary=True)
    cur.execute(
        """
        SELECT
            rp.ci_participante,
            p.nombre,
            p.apellido,
            rp.es_responsable,
            rp.asistio
        FROM reserva_participante rp
        JOIN participante p ON p.ci = rp.ci_participante
        WHERE rp.id_reserva = %s
        ORDER BY rp.es_responsable DESC, p.apellido, p.nombre
        """,
        (id_reserva,),
    )
    return cur.fetchall()
def participante_sancionado(db, ci: str):
    cur = db.cursor()
    cur.execute(
        """
        SELECT COUNT(*)
        FROM sancion_participante
        WHERE ci_participante = %s
          AND CURDATE() BETWEEN fecha_inicio AND fecha_fin
        """,
        (ci,)
    )
    (cant,) = cur.fetchone()
    return cant > 0


@app.post("/reservas/{id_reserva}/asistencia")
def registrar_asistencia(
    id_reserva: int, body: AsistenciaUpdate, db=Depends(get_db)
):
    presentes = set(body.presentes)

    cur = db.cursor()

    cur.execute(
        "SELECT fecha FROM reserva WHERE id_reserva = %s",
        (id_reserva,),
    )
    row = cur.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
    fecha_reserva = row[0]

    cur.execute(
        "SELECT ci_participante FROM reserva_participante WHERE id_reserva = %s",
        (id_reserva,),
    )
    participantes_rows = cur.fetchall()
    participantes = [r[0] for r in participantes_rows]
    if not participantes:
        raise HTTPException(
            status_code=400,
            detail="La reserva no tiene participantes registrados",
        )

    try:
        for ci in participantes:
            asistio = 1 if ci in presentes else 0
            cur.execute(
                """
                UPDATE reserva_participante
                SET asistio = %s
                WHERE id_reserva = %s AND ci_participante = %s
                """,
                (asistio, id_reserva, ci),
            )

        if not presentes:
            fecha_inicio = fecha_reserva
            fecha_fin = fecha_reserva + timedelta(days=60)
            for ci in participantes:
                cur.execute(
                    """
                    INSERT INTO sancion_participante
                        (ci_participante, fecha_inicio, fecha_fin, motivo, id_reserva)
                    VALUES (%s, %s, %s, %s, %s)
                    """,
                    (
                        ci,
                        fecha_inicio,
                        fecha_fin,
                        "Ausencia a la reserva sin aviso",
                        id_reserva,
                    ),
                )

        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

    return {"message": "Asistencia registrada"}


@app.post("/reservas")
def crear_reserva(body: ReservaCreate, db=Depends(get_db)):
    if not body.participantes:
        raise HTTPException(status_code=400, detail="Debe haber al menos un participante")

    participantes = list(dict.fromkeys(body.participantes))
    if body.ci_responsable not in participantes:
        participantes.insert(0, body.ci_responsable)

    cur = db.cursor()

    cur.execute(
        """
        SELECT id_sala, capacidad, tipo_sala
        FROM sala
        WHERE nombre_sala = %s AND edificio = %s
        """,
        (body.nombre_sala, body.edificio),
    )
    row = cur.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Sala no encontrada")

    id_sala, capacidad, tipo_sala = row

    if len(participantes) > capacidad:
        raise HTTPException(
            status_code=400,
            detail=f"La sala admite hasta {capacidad} participantes",
        )

    cur.execute(
        """
        SELECT TIMESTAMPDIFF(
                   MINUTE,
                   hora_inicio,
                   hora_fin
               ) AS minutos
        FROM turno
        WHERE id_turno = %s
        """,
        (body.id_turno,),
    )
    row = cur.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Turno no encontrado")
    minutos_turno = row[0]

    if hay_choque_reserva(db, id_sala, body.fecha, body.id_turno):
        raise HTTPException(
            status_code=400,
            detail="Ya existe una reserva activa para esa sala en ese turno",
        )

    for ci_par in participantes:
        validar_limites_participante(
            db,
            ci_par,
            body.fecha,
            body.id_turno,
            minutos_turno,
            tipo_sala,
        )

    try:
        cur.execute(
            """
            INSERT INTO reserva (fecha, id_sala, id_turno, ci_responsable, estado)
            VALUES (%s, %s, %s, %s, 'activa')
            """,
            (
                body.fecha,
                id_sala,
                body.id_turno,
                body.ci_responsable,
            ),
        )
        id_reserva = cur.lastrowid

        for ci_par in participantes:
            cur.execute(
                """
                INSERT INTO reserva_participante
                    (id_reserva, ci_participante, es_responsable, asistio)
                VALUES (%s, %s, %s, 0)
                """,
                (
                    id_reserva,
                    ci_par,
                    1 if ci_par == body.ci_responsable else 0,
                ),
            )

        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

    return {"message": "Reserva creada", "id_reserva": id_reserva}


@app.put("/reservas/{id_reserva}")
def modificar_reserva(id_reserva: int, body: ReservaUpdate, db=Depends(get_db)):
    cur = db.cursor()

    cur.execute(
        """
        SELECT id_sala, capacidad, tipo_sala
        FROM sala
        WHERE nombre_sala = %s AND edificio = %s
        """,
        (body.nombre_sala, body.edificio),
    )
    row = cur.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Sala no encontrada")
    id_sala, capacidad, tipo_sala = row

    cur.execute(
        """
        SELECT TIMESTAMPDIFF(
                   MINUTE,
                   hora_inicio,
                   hora_fin
               ) AS minutos
        FROM turno
        WHERE id_turno = %s
        """,
        (body.id_turno,),
    )
    row = cur.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Turno no encontrado")
    minutos_turno = row[0]

    if hay_choque_reserva(
        db, id_sala, body.fecha, body.id_turno, excluir_id=id_reserva
    ):
        raise HTTPException(
            status_code=400,
            detail="Ya existe una reserva activa para esa sala en ese turno",
        )

    cur.execute(
        """
        SELECT ci_participante
        FROM reserva_participante
        WHERE id_reserva = %s
        """,
        (id_reserva,),
    )
    participantes = [row[0] for row in cur.fetchall()]

    for ci_par in participantes:
        validar_limites_participante(
            db,
            ci_par,
            body.fecha,
            body.id_turno,
            minutos_turno,
            tipo_sala,
            excluir_id=id_reserva,
        )

    try:
        cur.execute(
            """
            UPDATE reserva
            SET fecha = %s,
                id_sala = %s,
                id_turno = %s
            WHERE id_reserva = %s
            """,
            (
                body.fecha,
                id_sala,
                body.id_turno,
                id_reserva,
            ),
        )
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Reserva no encontrada")
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

    return {"message": "Reserva modificada"}


@app.delete("/reservas/{id_reserva}")
def cancelar_reserva(id_reserva: int, db=Depends(get_db)):
    cur = db.cursor()
    try:
        cur.execute(
            """
            UPDATE reserva
            SET estado = 'cancelada'
            WHERE id_reserva = %s AND estado = 'activa'
            """,
            (id_reserva,),
        )
        if cur.rowcount == 0:
            raise HTTPException(
                status_code=404,
                detail="Reserva no encontrada o ya cancelada",
            )
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

    return {"message": "Reserva cancelada"}


@app.get("/sanciones")
def listar_sanciones(db=Depends(get_db)):
    cur = db.cursor(dictionary=True)
    cur.execute(
        """
        SELECT id_sancion, ci_participante, fecha_inicio, fecha_fin, motivo, id_reserva
        FROM sancion_participante
        ORDER BY fecha_inicio DESC
        """
    )
    return cur.fetchall()


@app.post("/sanciones")
def crear_sancion(body: SancionCreate, db=Depends(get_db)):
    cur = db.cursor()
    try:
        cur.execute(
            """
            INSERT INTO sancion_participante
                (ci_participante, fecha_inicio, fecha_fin, motivo, id_reserva)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (
                body.ci_participante,
                body.fecha_inicio,
                body.fecha_fin,
                body.motivo,
                body.id_reserva,
            ),
        )
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    return {"message": "Sanción creada"}


@app.delete("/sanciones/{id_sancion}")
def eliminar_sancion(id_sancion: int, db=Depends(get_db)):
    cur = db.cursor()
    try:
        cur.execute(
            "DELETE FROM sancion_participante WHERE id_sancion = %s",
            (id_sancion,),
        )
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Sanción no encontrada")
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    return {"message": "Sanción eliminada"}

@app.get("/reportes/resumen")
def reportes_resumen(db=Depends(get_db)):
    cur = db.cursor(dictionary=True)

    # ----------------------------------------
    # 1) SALAS MÁS RESERVADAS
    # ----------------------------------------
    cur.execute("""
        SELECT s.id_sala, s.edificio, s.nombre_sala, COUNT(*) AS cantidad_reservas
        FROM reserva r
        JOIN sala s ON s.id_sala = r.id_sala
        GROUP BY s.id_sala, s.edificio, s.nombre_sala
        ORDER BY cantidad_reservas DESC
    """)
    salas_mas_reservadas = cur.fetchall()

    # ----------------------------------------
    # 2) TURNOS MÁS DEMANDADOS
    # ----------------------------------------
    cur.execute("""
        SELECT t.id_turno, t.hora_inicio, t.hora_fin, COUNT(*) AS cantidad_reservas
        FROM reserva r
        JOIN turno t ON t.id_turno = r.id_turno
        GROUP BY t.id_turno, t.hora_inicio, t.hora_fin
        ORDER BY cantidad_reservas DESC
    """)
    turnos_mas_demandados = cur.fetchall()

    # ----------------------------------------
    # 3) PROMEDIO PARTICIPANTES POR SALA
    # ----------------------------------------
    cur.execute("""
        SELECT 
            s.id_sala, s.edificio, s.nombre_sala,
            AVG(sub.cant_participantes) AS promedio_participantes
        FROM (
            SELECT r.id_reserva, r.id_sala,
                   COUNT(rp.ci_participante) AS cant_participantes
            FROM reserva r
            JOIN reserva_participante rp ON rp.id_reserva = r.id_reserva
            GROUP BY r.id_reserva, r.id_sala
        ) sub
        JOIN sala s ON s.id_sala = sub.id_sala
        GROUP BY s.id_sala, s.edificio, s.nombre_sala
    """)
    promedio_participantes_por_sala = cur.fetchall()

    reservas_por_carrera_facultad = []

    # ----------------------------------------
    # 5) OCUPACIÓN POR EDIFICIO
    # ----------------------------------------
    cur.execute("""
        SELECT s.edificio, COUNT(*) AS reservas
        FROM reserva r
        JOIN sala s ON s.id_sala = r.id_sala
        GROUP BY s.edificio
    """)
    reservas_por_edificio = cur.fetchall()

    ocupacion_por_edificio = [
        {
            "edificio": r["edificio"],
            "reservas": r["reservas"],
            "capacidad_total": 0,
            "participantes_totales": 0,
            "porcentaje_ocupacion": 0
        }
        for r in reservas_por_edificio
    ]

    # ----------------------------------------
    # 6) RESERVAS Y ASISTENCIAS POR TIPO
    # ----------------------------------------
    cur.execute("""
        SELECT p.tipo,
               COUNT(DISTINCT r.id_reserva) AS reservas,
               SUM(CASE WHEN rp.asistio = 1 THEN 1 ELSE 0 END) AS asistencias
        FROM reserva_participante rp
        JOIN reserva r ON r.id_reserva = rp.id_reserva
        JOIN participante p ON p.ci = rp.ci_participante
        GROUP BY p.tipo
    """)
    reservas_y_asistencias_por_tipo = cur.fetchall()

    # ----------------------------------------
    # 7) SANCIONES POR TIPO
    # ----------------------------------------
    cur.execute("""
        SELECT p.tipo, COUNT(*) AS sanciones
        FROM sancion_participante sp
        JOIN participante p ON p.ci = sp.ci_participante
        GROUP BY p.tipo
    """)
    sanciones_por_tipo = cur.fetchall()

    # ----------------------------------------
    # 8) USO DE RESERVAS
    # ----------------------------------------
    cur.execute("SELECT COUNT(*) AS total FROM reserva")
    total = cur.fetchone()["total"]

    cur.execute("""
        SELECT COUNT(DISTINCT r.id_reserva) AS usadas
        FROM reserva r
        JOIN reserva_participante rp ON rp.id_reserva = r.id_reserva
        WHERE rp.asistio = 1
    """)
    usadas = cur.fetchone()["usadas"]

    cur.execute("SELECT COUNT(*) AS canceladas FROM reserva WHERE estado = 'cancelada'")
    canceladas = cur.fetchone()["canceladas"]

    cur.execute("""
        SELECT COUNT(*) AS sin_asistencia
        FROM reserva r
        WHERE r.estado = 'activa'
          AND NOT EXISTS (
              SELECT 1 FROM reserva_participante rp
              WHERE rp.id_reserva = r.id_reserva AND rp.asistio = 1
          )
    """)
    sin_asistencia = cur.fetchone()["sin_asistencia"]

    uso_reservas = {
        "total_reservas": total,
        "usadas": usadas,
        "canceladas": canceladas,
        "sin_asistencia": sin_asistencia,
        "porcentaje_usadas": round((usadas / total * 100) if total else 0, 2),
        "porcentaje_canceladas": round((canceladas / total * 100) if total else 0, 2),
        "porcentaje_sin_asistencia": round((sin_asistencia / total * 100) if total else 0, 2),
    }

    # ----------------------------------------
    # 9) TOP PARTICIPANTES
    # ----------------------------------------
    cur.execute("""
        SELECT p.ci, p.nombre, p.apellido, p.tipo,
               COUNT(rp.id_reserva) AS cantidad_reservas
        FROM participante p
        JOIN reserva_participante rp ON rp.ci_participante = p.ci
        GROUP BY p.ci
        ORDER BY cantidad_reservas DESC
        LIMIT 5
    """)
    top_participantes = cur.fetchall()

    # ----------------------------------------
    # 10) RESERVAS POR TIPO DE SALA
    # ----------------------------------------
    cur.execute("""
        SELECT s.tipo_sala, COUNT(*) AS cantidad_reservas
        FROM reserva r
        JOIN sala s ON s.id_sala = r.id_sala
        GROUP BY s.tipo_sala
    """)
    reservas_por_tipo_sala = cur.fetchall()

    # ----------------------------------------
    # 11) RESERVAS POR DÍA DE LA SEMANA
    # ----------------------------------------
    cur.execute("""
        SELECT 
            DAYNAME(fecha) AS nombre_dia,
            COUNT(*) AS cantidad_reservas
        FROM reserva
        GROUP BY nombre_dia
    """)
    reservas_por_dia_semana = cur.fetchall()

    return {
        "salas_mas_reservadas": salas_mas_reservadas,
        "turnos_mas_demandados": turnos_mas_demandados,
        "promedio_participantes_por_sala": promedio_participantes_por_sala,
        "reservas_por_carrera_facultad": reservas_por_carrera_facultad,
        "ocupacion_por_edificio": ocupacion_por_edificio,
        "reservas_y_asistencias_por_tipo": reservas_y_asistencias_por_tipo,
        "sanciones_por_tipo": sanciones_por_tipo,
        "uso_reservas": uso_reservas,
        "top_participantes": top_participantes,
        "reservas_por_tipo_sala": reservas_por_tipo_sala,
        "reservas_por_dia_semana": reservas_por_dia_semana,
    }
