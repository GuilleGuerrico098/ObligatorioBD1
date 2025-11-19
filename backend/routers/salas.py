from fastapi import APIRouter
from db import get_connection

router = APIRouter(prefix="/salas", tags=["Salas"])

@router.get("/")
def listar_salas():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM sala")
    result = cursor.fetchall()
    cursor.close()
    conn.close()
    return result
