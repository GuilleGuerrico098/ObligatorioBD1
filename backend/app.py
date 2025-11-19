from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import participantes, salas, reservas

app = FastAPI()

# 👇 CORS para permitir que la app web llame al backend
origins = [
    "http://localhost:8081",
    "http://127.0.0.1:8081",
    "http://localhost:19006",  # a veces Expo usa este
    "http://127.0.0.1:19006",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # si querés ser amplio en desarrollo, podes dejar "*" 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "API funcionando correctamente"}

app.include_router(participantes.router)
app.include_router(salas.router)
app.include_router(reservas.router)
