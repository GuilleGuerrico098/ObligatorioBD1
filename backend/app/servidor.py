from datetime import date, time as time_type, timedelta
from typing import List, Dict

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .conexion import get_connection


app = FastAPI(title="API Salas de Estudio UCU", version="3.0.0")

# ------------------ CORS ------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------ Modelos ------------------


class LoginRequest(BaseModel):
    correo: str
    contrasena: str


class ParticipanteCreate(BaseModel):
    # OJO: acá no valido con regex para no romper nada
    ci: str
    nombre: str
    apellido: str
    email: str
    tipo: str   # espero 'grado' | 'posgrado' | 'docente'


class ReservaCreate(BaseModel):
    fecha: date
    id_sala: int
    hora_inicio: time_type          # "HH:MM"
    duracion_horas: int = Field(..., ge=1, le=2)
    ci_responsable: str
    participantes_ci: List[str]


class AsistenciaUpdate(BaseModel):
    asistentes: List[str]


class SalaCreate(BaseModel):
    nombre_sala: str
    nombre_edificio: str
    piso: int
    capacidad: int
    tipo: str   # 'uso_libre' | 'exclusiva_posgrado' | 'exclusiva_docente'


class SancionCreate(BaseModel):
    ci: str
    motivo: str
    dias: int = 60


# ------------------ Helpers ------------------


def _validar_tipo_sala_con_participantes(tipo_sala: str, tipos_participantes: Dict[str, str]):
    # Valida tipos de sala vs tipos de participante
    if tipo_sala == "uso_libre":
        return

    if tipo_sala == "exclusiva_posgrado":
        no_permitidos = [ci for ci, t in tipos_participantes.items() if t == "grado"]
        if no_permitidos:
            raise HTTPException(
                status_code=400,
                detail="Solo posgrado y docentes pueden reservar esta sala. CI no permitidas: "
                + ", ".join(no_permitidos),
            )

    if tipo_sala == "exclusiva_docente":
        no_permitidos = [ci for ci, t in tipos_participantes.items() if t != "docente"]
        if no_permitidos:
            raise HTTPException(
                status_code=400,
                detail="Solo docentes pueden reservar esta sala. CI no permitidas: "
                + ", ".join(no_permitidos),
            )


def _calcular_rango_semana(fecha: date):
    # Devuelve lunes y domingo de la semana de fecha
    lunes = fecha - timedelta(days=fecha.weekday())
    domingo = lunes + timedelta(days=6)
    return lunes, domingo


def _format_time_for_json(value):
    # Convierte TIME/timedelta a 'HH:MM:SS'
    if value is None:
        return None

    from datetime import timedelta as TD, time as TTIME

    if isinstance(value, TD):
        total_seconds = value.seconds
        h = total_seconds // 3600
        m = (total_seconds % 3600) // 60
        return f"{h:02d}:{m:02d}:00"

    if isinstance(value, TTIME):
        return value.strftime("%H:%M:%S")

    return str(value)


# ------------------ Básico ------------------


@app.get("/health")
def health():
    return {"status": "ok"}


# ------------------ Login ------------------


@app.post("/login")
def login(data: LoginRequest):
    # Login contra tabla login + participante
    conn = get_connection()
    try:
        cur = conn.cursor(dictionary=True)
        cur.execute(
            """
            SELECT p.ci,
                   p.nombre,
                   p.apellido,
                   p.email,
                   p.tipo,
                   l.correo,
                   l.es_admin
            FROM login l
            JOIN participante p ON p.ci = l.ci_participante
            WHERE l.correo = %s AND l.contrasena = %s
            """,
            (data.correo, data.contrasena),
        )
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=401, detail="Correo o contraseña incorrectos")

        return {
            "ci": row["ci"],
            "nombre": row["nombre"],
            "apellido": row["apellido"],
            "correo": row["correo"],
            "email": row["email"],
            "tipo": row["tipo"],
            "esAdmin": bool(row.get("es_admin", 0)),
        }
    finally:
        conn.close()


# ------------------ Participantes ------------------


@app.get("/participantes")
def listar_participantes():
    # Lista participantes
    conn = get_connection()
    try:
        cur = conn.cursor(dictionary=True)
        cur.execute("SELECT ci, nombre, apellido, email, tipo FROM participante ORDER BY nombre")
        return cur.fetchall()
    finally:
        conn.close()


@app.post("/participantes")
def crear_participante(data: ParticipanteCreate):
    # Crea participante
    conn = get_connection()
    try:
        cur = conn.cursor()

        # CI duplicada
        cur.execute("SELECT ci FROM participante WHERE ci = %s", (data.ci,))
        if cur.fetchone():
            raise HTTPException(
                status_code=400,
                detail="Ya existe un participante con esa cédula",
            )

        # EMAIL duplicado (tus columnas tienen UNIQUE en email)
        cur.execute("SELECT email FROM participante WHERE email = %s", (data.email,))
        if cur.fetchone():
            raise HTTPException(
                status_code=400,
                detail="Ya existe un participante con ese correo",
            )

        # Inserto
        cur.execute(
            """
            INSERT INTO participante (ci, nombre, apellido, email, tipo)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (data.ci, data.nombre, data.apellido, data.email, data.tipo),
        )

        conn.commit()
        return {"ok": True}
    finally:
        conn.close()


@app.delete("/participantes/{ci}")
def borrar_participante(ci: str):
    # Borra participante por CI
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute("DELETE FROM reserva_participante WHERE ci = %s", (ci,))
        cur.execute("DELETE FROM sancion_participante WHERE ci = %s", (ci,))
        cur.execute("DELETE FROM participante WHERE ci = %s", (ci,))
        conn.commit()
        return {"ok": True}
    finally:
        conn.close()


# ------------------ Salas ------------------


@app.get("/salas")
def listar_salas():
    # Lista salas
    conn = get_connection()
    try:
        cur = conn.cursor(dictionary=True)
        cur.execute(
            """
            SELECT id_sala,
                   nombre_sala,
                   nombre_edificio,
                   capacidad,
                   tipo
            FROM sala
            ORDER BY nombre_sala
            """
        )
        return cur.fetchall()
    finally:
        conn.close()


@app.post("/salas")
def crear_sala(data: SalaCreate):
    # Crea sala
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO sala (nombre_sala, nombre_edificio, piso, capacidad, tipo)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (data.nombre_sala, data.nombre_edificio, data.piso, data.capacidad, data.tipo),
        )
        conn.commit()
        return {"ok": True}
    finally:
        conn.close()


@app.delete("/salas/{id_sala}")
def borrar_sala(id_sala: int):
    # Borra sala por id
    conn = get_connection()
    try:
        cur = conn.cursor()
        # limpio reservas de esa sala
        cur.execute("SELECT id_reserva FROM reserva WHERE id_sala = %s", (id_sala,))
        ids = [r[0] for r in cur.fetchall()]
        if ids:
            in_clause = ",".join(["%s"] * len(ids))
            cur.execute(f"DELETE FROM reserva_participante WHERE id_reserva IN ({in_clause})", ids)
            cur.execute(f"DELETE FROM sancion_participante WHERE id_reserva IN ({in_clause})", ids)
            cur.execute(f"DELETE FROM reserva WHERE id_reserva IN ({in_clause})", ids)
        cur.execute("DELETE FROM sala WHERE id_sala = %s", (id_sala,))
        conn.commit()
        return {"ok": True}
    finally:
        conn.close()


# ------------------ Reservas (crear) ------------------


@app.post("/reservas")
def crear_reserva(data: ReservaCreate):
    # Crea reserva con validaciones
    hora_inicio = data.hora_inicio

    if hora_inicio.minute != 0:
        raise HTTPException(status_code=400, detail="La hora de inicio debe ser en punto (minutos 00).")

    if hora_inicio.hour < 8 or hora_inicio.hour > 22:
        raise HTTPException(status_code=400, detail="Inicio debe estar entre 08:00 y 22:00.")

    hora_fin_hour = hora_inicio.hour + data.duracion_horas
    if hora_fin_hour > 23:
        raise HTTPException(status_code=400, detail="La reserva no puede terminar después de las 23:00.")

    hora_fin = time_type(hour=hora_fin_hour, minute=0)

    participantes_ci = list(dict.fromkeys(ci.strip() for ci in data.participantes_ci if ci.strip()))
    if not participantes_ci:
        raise HTTPException(status_code=400, detail="Debe indicarse al menos un participante.")

    if data.ci_responsable not in participantes_ci:
        participantes_ci.insert(0, data.ci_responsable)

    conn = get_connection()
    try:
        cur = conn.cursor(dictionary=True)

        # Sala
        cur.execute("SELECT id_sala, capacidad, tipo FROM sala WHERE id_sala = %s", (data.id_sala,))
        sala = cur.fetchone()
        if not sala:
            raise HTTPException(status_code=404, detail="Sala no encontrada.")

        capacidad = sala["capacidad"]
        tipo_sala = sala["tipo"]

        if len(participantes_ci) > capacidad:
            raise HTTPException(
                status_code=400,
                detail=f"Hay {len(participantes_ci)} participantes y la capacidad es {capacidad}.",
            )

        # Participantes y tipos
        placeholders = ",".join(["%s"] * len(participantes_ci))
        cur.execute(
            f"SELECT ci, tipo FROM participante WHERE ci IN ({placeholders})",
            participantes_ci,
        )
        rows = cur.fetchall()
        tipos_participantes = {r["ci"]: r["tipo"] for r in rows}
        faltantes = [ci for ci in participantes_ci if ci not in tipos_participantes]
        if faltantes:
            raise HTTPException(
                status_code=400,
                detail="Hay participantes que no existen: " + ", ".join(faltantes),
            )

        # Sanciones vigentes
        hoy = data.fecha
        cur.execute(
            f"""
            SELECT DISTINCT ci
            FROM sancion_participante
            WHERE ci IN ({placeholders})
              AND %s BETWEEN fecha_inicio AND fecha_fin
            """,
            participantes_ci + [hoy],
        )
        sancionados = [r["ci"] for r in cur.fetchall()]
        if sancionados:
            raise HTTPException(
                status_code=400,
                detail="Estos participantes tienen sanción vigente: " + ", ".join(sancionados),
            )

        # Tipo de sala vs participantes
        _validar_tipo_sala_con_participantes(tipo_sala, tipos_participantes)

        # Restricciones grado en uso_libre
        if tipo_sala == "uso_libre":
            grado_cis = [ci for ci, t in tipos_participantes.items() if t == "grado"]

            if grado_cis:
                placeholders_grado = ",".join(["%s"] * len(grado_cis))
                # max 2 horas por día
                cur.execute(
                    f"""
                    SELECT rp.ci,
                           COALESCE(
                             SUM(TIME_TO_SEC(TIMEDIFF(r.hora_fin, r.hora_inicio)) / 3600),
                             0
                           ) AS horas
                    FROM reserva r
                    JOIN reserva_participante rp ON rp.id_reserva = r.id_reserva
                    JOIN sala s ON s.id_sala = r.id_sala
                    WHERE r.fecha = %s
                      AND s.tipo = 'uso_libre'
                      AND r.estado = 'activa'
                      AND rp.ci IN ({placeholders_grado})
                    GROUP BY rp.ci
                    """,
                    [data.fecha] + grado_cis,
                )
                horas_ya = {r["ci"]: float(r["horas"]) for r in cur.fetchall()}
                for ci in grado_cis:
                    if horas_ya.get(ci, 0.0) + data.duracion_horas > 2:
                        raise HTTPException(
                            status_code=400,
                            detail=f"CI {ci} excede las 2 horas por día en salas de uso libre.",
                        )

                # max 3 reservas por semana
                lunes, domingo = _calcular_rango_semana(data.fecha)
                cur.execute(
                    f"""
                    SELECT rp.ci, COUNT(*) AS cantidad
                    FROM reserva r
                    JOIN reserva_participante rp ON rp.id_reserva = r.id_reserva
                    JOIN sala s ON s.id_sala = r.id_sala
                    WHERE r.fecha BETWEEN %s AND %s
                      AND s.tipo = 'uso_libre'
                      AND r.estado = 'activa'
                      AND rp.ci IN ({placeholders_grado})
                    GROUP BY rp.ci
                    """,
                    [lunes, domingo] + grado_cis,
                )
                reservas_sem = {r["ci"]: int(r["cantidad"]) for r in cur.fetchall()}
                for ci in grado_cis:
                    if reservas_sem.get(ci, 0) + 1 > 3:
                        raise HTTPException(
                            status_code=400,
                            detail=f"CI {ci} excede las 3 reservas activas por semana en salas de uso libre.",
                        )

        # Superposición en sala / fecha
        cur.execute(
            """
            SELECT hora_inicio, hora_fin
            FROM reserva
            WHERE id_sala = %s
              AND fecha = %s
              AND estado = 'activa'
            """,
            (data.id_sala, data.fecha),
        )
        for r in cur.fetchall():
            ini_exist: time_type = r["hora_inicio"]
            fin_exist: time_type = r["hora_fin"]
            if not (hora_fin <= ini_exist or hora_inicio >= fin_exist):
                raise HTTPException(
                    status_code=400,
                    detail="Ya existe una reserva activa para esa sala en ese horario.",
                )

        # Insert reserva
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO reserva (id_sala, fecha, hora_inicio, hora_fin, ci_responsable, estado)
            VALUES (%s, %s, %s, %s, %s, 'activa')
            """,
            (data.id_sala, data.fecha, hora_inicio, hora_fin, data.ci_responsable),
        )
        id_reserva = cur.lastrowid

        # Insert participantes
        for ci in participantes_ci:
            es_responsable = 1 if ci == data.ci_responsable else 0
            cur.execute(
                """
                INSERT INTO reserva_participante (id_reserva, ci, es_responsable, asistio)
                VALUES (%s, %s, %s, 'pendiente')
                """,
                (id_reserva, ci, es_responsable),
            )

        conn.commit()
        return {"id_reserva": id_reserva}
    finally:
        conn.close()


# ------------------ Mis reservas ------------------


@app.get("/mis-reservas/{ci}")
def mis_reservas(ci: str):
    # Reservas donde participa una CI
    conn = get_connection()
    try:
        cur = conn.cursor(dictionary=True)
        cur.execute(
            """
            SELECT
                r.id_reserva,
                r.fecha,
                r.hora_inicio,
                r.hora_fin,
                r.ci_responsable,
                s.nombre_sala,
                CASE
                    WHEN CONCAT(r.fecha, ' ', r.hora_fin) < NOW() THEN 'pasada'
                    WHEN CONCAT(r.fecha, ' ', r.hora_inicio) > NOW() THEN 'futura'
                    ELSE 'activa'
                END AS situacion
            FROM reserva r
            JOIN reserva_participante rp ON rp.id_reserva = r.id_reserva
            JOIN sala s ON s.id_sala = r.id_sala
            WHERE rp.ci = %s
            ORDER BY r.fecha DESC, r.hora_inicio DESC
            """,
            (ci,),
        )
        filas = cur.fetchall()
        for r in filas:
            r["hora_inicio"] = _format_time_for_json(r["hora_inicio"])
            r["hora_fin"] = _format_time_for_json(r["hora_fin"])
        return filas
    finally:
        conn.close()


# ------------------ Reservas admin ------------------


@app.get("/reservas-admin")
def reservas_admin():
    # Lista de reservas para admin
    conn = get_connection()
    try:
        cur = conn.cursor(dictionary=True)
        cur.execute(
            """
            SELECT
                r.id_reserva,
                r.fecha,
                r.hora_inicio,
                r.hora_fin,
                r.estado,
                s.nombre_sala
            FROM reserva r
            JOIN sala s ON s.id_sala = r.id_sala
            ORDER BY r.fecha DESC, r.hora_inicio DESC
            """
        )
        filas = cur.fetchall()
        for r in filas:
            r["hora_inicio"] = _format_time_for_json(r["hora_inicio"])
            r["hora_fin"] = _format_time_for_json(r["hora_fin"])
        return filas
    finally:
        conn.close()


# ------------------ Asistencia y sanciones auto ------------------


@app.put("/reservas/{id_reserva}/asistencia")
def registrar_asistencia(id_reserva: int, data: AsistenciaUpdate):
    # Registra asistencia y penaliza si nadie fue
    conn = get_connection()
    try:
        cur = conn.cursor(dictionary=True)

        cur.execute("SELECT ci FROM reserva_participante WHERE id_reserva = %s", (id_reserva,))
        participantes = [r["ci"] for r in cur.fetchall()]
        if not participantes:
            raise HTTPException(status_code=404, detail="La reserva no tiene participantes.")

        asistentes = set(data.asistentes)

        cur2 = conn.cursor()
        for ci in participantes:
            estado = "asistio" if ci in asistentes else "no_asistio"
            cur2.execute(
                """
                UPDATE reserva_participante
                SET asistio = %s
                WHERE id_reserva = %s AND ci = %s
                """,
                (estado, id_reserva, ci),
            )

        if len(asistentes) == 0:
            cur.execute("SELECT fecha FROM reserva WHERE id_reserva = %s", (id_reserva,))
            row = cur.fetchone()
            if not row:
                raise HTTPException(status_code=404, detail="Reserva no encontrada.")
            fecha_reserva: date = row["fecha"]
            fecha_fin = fecha_reserva + timedelta(days=60)

            cur3 = conn.cursor()
            for ci in participantes:
                cur3.execute(
                    """
                    INSERT INTO sancion_participante (ci, fecha_inicio, fecha_fin, motivo, id_reserva)
                    VALUES (%s, %s, %s, %s, %s)
                    """,
                    (ci, fecha_reserva, fecha_fin, "No asistencia a reserva", id_reserva),
                )

        cur.execute("UPDATE reserva SET estado = 'finalizada' WHERE id_reserva = %s", (id_reserva,))
        conn.commit()
        return {"ok": True}
    finally:
        conn.close()


# ------------------ Sanciones ------------------


@app.get("/sanciones")
def listar_sanciones():
    # Lista sanciones
    conn = get_connection()
    try:
        cur = conn.cursor(dictionary=True)
        cur.execute(
            """
            SELECT
                s.id_sancion,
                s.ci,
                s.motivo,
                s.fecha_inicio,
                s.fecha_fin,
                p.nombre,
                p.apellido
            FROM sancion_participante s
            LEFT JOIN participante p ON p.ci = s.ci
            ORDER BY s.fecha_inicio DESC
            """
        )
        return cur.fetchall()
    finally:
        conn.close()


@app.post("/sanciones")
def crear_sancion(data: SancionCreate):
    # Crea sanción manual
    conn = get_connection()
    try:
        cur = conn.cursor()
        hoy = date.today()
        fin = hoy + timedelta(days=data.dias)
        cur.execute(
            """
            INSERT INTO sancion_participante (ci, fecha_inicio, fecha_fin, motivo)
            VALUES (%s, %s, %s, %s)
            """,
            (data.ci, hoy, fin, data.motivo),
        )
        conn.commit()
        return {"ok": True}
    finally:
        conn.close()


@app.delete("/sanciones/{id_sancion}")
def borrar_sancion(id_sancion: int):
    # Borra sanción por id
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute("DELETE FROM sancion_participante WHERE id_sancion = %s", (id_sancion,))
        conn.commit()
        return {"ok": True}
    finally:
        conn.close()
