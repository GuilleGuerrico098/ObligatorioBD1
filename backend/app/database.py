import os
import mysql.connector

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "db"),
    "port": int(os.getenv("DB_PORT", "3306")),
    "database": os.getenv("DB_NAME", "salas_estudio"),
    "user": os.getenv("DB_USER", "salas_user"),
    "password": os.getenv("DB_PASSWORD", "salas_pass"),
}

def get_connection():
    return mysql.connector.connect(**DB_CONFIG)
