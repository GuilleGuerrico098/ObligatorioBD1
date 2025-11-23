import os
import time
import mysql.connector
from mysql.connector import pooling

# Configuración de la conexión, usando variables de entorno
DB_CONFIG = {
    "host": os.getenv("DB_HOST", "db"),
    "port": int(os.getenv("DB_PORT", "3306")),
    "user": os.getenv("DB_USER", "salas_user"),
    "password": os.getenv("DB_PASSWORD", "salas_pass"),
    "database": os.getenv("DB_NAME", "salas_estudio"),
}

connection_pool = None


def init_pool():
    """
    Inicializa el pool de conexiones (solo una vez).
    Reintenta algunas veces por si el contenedor de la BD todavía no arrancó.
    """
    global connection_pool
    if connection_pool is not None:
        return

    intentos = 5
    espera = 2
    ultimo_error = None

    for _ in range(intentos):
        try:
            connection_pool = pooling.MySQLConnectionPool(
                pool_name="salas_pool",
                pool_size=5,
                **DB_CONFIG,
            )
            return
        except mysql.connector.Error as e:
            ultimo_error = e
            time.sleep(espera)

    # Si después de varios intentos no se pudo conectar, levantamos el último error
    raise ultimo_error


def get_connection():
    """
    Devuelve una conexión del pool.
    """
    if connection_pool is None:
        init_pool()
    return connection_pool.get_connection()
