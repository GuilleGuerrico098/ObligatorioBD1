📘 Sistema de Gestión de Salas de Estudio – UCU
Proyecto Obligatorio – Bases de Datos I

Este proyecto implementa un sistema completo para la gestión de reservas de salas de estudio, incluyendo:

Gestión de participantes

Gestión de salas

Reservas con restricciones reales (2h/día, 3 por semana, exclusividad docente/posgrado, etc.)

Sanciones automáticas

Asistencia

Panel administrador

Reportes avanzados en un único endpoint /reportes/resumen

API REST en FastAPI

Base de datos MySQL en Docker

Interfaz web React

ESTRUCTURA DEL PROYECTO
ObligatorioBD1/
│
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── database.py
│   │   └── servidor.py
│   │
│   ├── db/
│   │   ├── 01_schema.sql              
│   │   └── 02_datos_iniciales.sql     
│   │
│   ├── requirements.txt
│   ├── Dockerfile
│   └── docker-compose.yml
│
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   └── Navbar.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── AdminHome.jsx
│   │   │   │   ├── Asistencia.jsx
│   │   │   │   ├── Participantes.jsx
│   │   │   │   ├── Reportes.jsx
│   │   │   │   ├── Reservas.jsx
│   │   │   │   ├── Salas.jsx
│   │   │   │   └── Sanciones.jsx
│   │   │   ├── alumno/
│   │   │   │   ├── AlumnoHome.jsx
│   │   │   │   ├── CrearReserva.jsx
│   │   │   │   └── MisReservas.jsx
│   │   │   └── Login.jsx
│   │   │
│   │   ├── api.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── public/
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
└── README.md

📘 Instructivo para ejecutar el proyecto de forma local
React + Vite · FastAPI · MySQL · Docker

A continuación detallo los pasos necesarios para levantar el sistema completo (backend, base de datos y frontend) en un entorno local utilizando Docker, FastAPI y React con Vite.

🐳 1. Levantar backend y base de datos con Docker

Abrir una terminal en la carpeta:

ObligatorioBD1/backend


Construir e iniciar los contenedores (API + MySQL):

docker compose up --build


Esto levanta dos contenedores:

Contenedor	Servicio	Puerto
salas_db	MySQL	3307 → 3306
salas_api	FastAPI	8000

Verificar que el contenedor de MySQL está corriendo:

docker ps


El contenedor salas_db debe aparecer como “Up”.

🗄️ 2. Crear la base de datos (schema)

Con MySQL ya levantado, acceder al contenedor:

docker exec -it salas_db mysql -u root -p


(La contraseña es la definida en el archivo docker-compose.yml).

Dentro del cliente MySQL ejecutar:

SOURCE /db/01_schema.sql;


Este script crea toda la estructura de tablas del sistema.

🧪 3. Cargar los datos iniciales

Sin salir del cliente MySQL:

SOURCE /db/02_datos_iniciales.sql;


Recomiendo verificar que la información se cargó correctamente:

SELECT * FROM participante;
SELECT * FROM sala;
SELECT * FROM turno;

🚀 4. Backend (FastAPI) funcionando

Una vez Docker está en ejecución, la API queda disponible automáticamente:

Base URL del backend:
http://localhost:8000

Documentación interactiva (Swagger):
http://localhost:8000/docs

No es necesario ejecutar ningún comando adicional: la API corre dentro del contenedor.

💻 5. Ejecutar el frontend (React + Vite)

Abrir una terminal en:

ObligatorioBD1/frontend


Instalar dependencias del proyecto:

npm install


Ejecutar la aplicación en modo desarrollo:

npm run dev


Vite iniciará un servidor local, generalmente en:

👉 http://localhost:5173

Si el puerto está ocupado, Vite asignará uno nuevo (se verá en consola).

🔐 6. Usuarios de prueba incluidos en los datos iniciales
Rol	Email	Contraseña
Administrador	admin@ucu.edu.uy
	admin123
Alumno (Demo)	alumno@ucu.edu.uy
	alumno123
Alumno (Juan)	juancito@ucu.edu.uy
	juan123
Docente (Ana)	ana.docente@ucu.edu.uy
	docente123
🧠 7. Funcionamiento básico del sistema
Administradores

Acceden al panel de administración.

Alta, baja y modificación de participantes.

Gestión completa de salas.

Creación y modificación de reservas.

Registro de asistencias.

Gestión de sanciones.

Acceso a reportes estadísticos.

Estudiantes, posgrado y docentes

Inician sesión según su tipo de usuario.

Pueden realizar reservas propias.

Consultan sus reservas activas.