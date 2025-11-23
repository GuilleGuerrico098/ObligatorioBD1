import uvicorn

if __name__ == "__main__":
  # Punto de entrada para correrlo con: python -m backend.app.start
  uvicorn.run("app.servidor:app", host="0.0.0.0", port=8000, reload=True)
