from fastapi import APIRouter
from db import get_connection

router = APIRouter(prefix="/participantes", tags=["Participantes"])

@router.get("/")
def listar_participantes():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM participante")
    result = cursor.fetchall()
    cursor.close()
    conn.close()
    return result
