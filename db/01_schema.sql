DROP DATABASE IF EXISTS salas_estudio;
CREATE DATABASE salas_estudio;
USE salas_estudio;

-- ============================
--          FACULTAD
-- ============================
CREATE TABLE facultad (
    id_facultad INT AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    PRIMARY KEY (id_facultad)
);

-- ============================
--          EDIFICIO
-- ============================
CREATE TABLE edificio (
    nombre_edificio VARCHAR(100),
    direccion VARCHAR(150) NOT NULL,
    departamento VARCHAR(100) NOT NULL,
    PRIMARY KEY (nombre_edificio)
);

-- ============================
--         PARTICIPANTE
-- ============================
CREATE TABLE participante (
    ci VARCHAR(15),
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    tipo ENUM('grado','posgrado','docente') NOT NULL,
    PRIMARY KEY (ci)
);

-- ============================
--     PROGRAMA ACADÉMICO
-- ============================
CREATE TABLE programa_academico (
    nombre_programa VARCHAR(100),
    id_facultad INT NOT NULL,
    tipo ENUM('grado','posgrado') NOT NULL,
    PRIMARY KEY (nombre_programa),
    FOREIGN KEY (id_facultad) REFERENCES facultad(id_facultad)
);

-- ============================
-- REL PARTICIPANTE - PROGRAMA
-- ============================
CREATE TABLE participante_programa_academico (
    ci VARCHAR(15),
    nombre_programa VARCHAR(100),
    PRIMARY KEY (ci, nombre_programa),
    FOREIGN KEY (ci) REFERENCES participante(ci),
    FOREIGN KEY (nombre_programa) REFERENCES programa_academico(nombre_programa)
);

-- ============================
--       LOGIN / SESIÓN
-- ============================
CREATE TABLE login (
    correo VARCHAR(150),
    contrasena VARCHAR(255) NOT NULL,
    PRIMARY KEY (correo),
    FOREIGN KEY (correo) REFERENCES participante(email)
);

-- ============================
--            SALA
-- ============================
CREATE TABLE sala (
    id_sala INT AUTO_INCREMENT,
    nombre_sala VARCHAR(100) NOT NULL,
    nombre_edificio VARCHAR(100) NOT NULL,
    piso INT NOT NULL,
    capacidad INT NOT NULL,
    es_grupal TINYINT(1) NOT NULL DEFAULT 1,
    tiene_pc TINYINT(1) NOT NULL DEFAULT 0,
    es_silenciosa TINYINT(1) NOT NULL DEFAULT 0,
    tipo ENUM('uso_libre','exclusiva_posgrado','exclusiva_docente') 
         NOT NULL DEFAULT 'uso_libre',
    PRIMARY KEY (id_sala),
    FOREIGN KEY (nombre_edificio) REFERENCES edificio(nombre_edificio)
);

-- ============================
--           TURNO
-- ============================
-- Nota: NO se usan para bloques fijos.
-- Pero el modelo oficial del obligatorio los menciona.
-- Servirán como referencia para auditorías o consultas.
CREATE TABLE turno (
    id_turno INT AUTO_INCREMENT,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    descripcion VARCHAR(100),
    PRIMARY KEY (id_turno)
);

-- ============================
--           RESERVA
-- ============================
CREATE TABLE reserva (
    id_reserva INT AUTO_INCREMENT,
    fecha DATE NOT NULL,
    id_sala INT NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    ci_responsable VARCHAR(15) NOT NULL,
    estado ENUM('activa','cancelada','finalizada','sin_asistencia')
        NOT NULL DEFAULT 'activa',
    PRIMARY KEY (id_reserva),
    FOREIGN KEY (id_sala) REFERENCES sala(id_sala),
    FOREIGN KEY (ci_responsable) REFERENCES participante(ci)
);

-- ============================
--   PARTICIPANTES POR RESERVA
-- ============================
CREATE TABLE reserva_participante (
    id_reserva INT,
    ci VARCHAR(15),
    es_responsable TINYINT(1) NOT NULL DEFAULT 0,
    asistio ENUM('pendiente','asistio','no_asistio') 
        NOT NULL DEFAULT 'pendiente',
    PRIMARY KEY (id_reserva, ci),
    FOREIGN KEY (id_reserva) REFERENCES reserva(id_reserva),
    FOREIGN KEY (ci) REFERENCES participante(ci)
);

-- ============================
--          SANCIONES
-- ============================
CREATE TABLE sancion_participante (
    id_sancion INT AUTO_INCREMENT,
    ci VARCHAR(15) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    motivo TEXT NOT NULL,
    id_reserva INT NULL,
    PRIMARY KEY (id_sancion),
    FOREIGN KEY (ci) REFERENCES participante(ci),
    FOREIGN KEY (id_reserva) REFERENCES reserva(id_reserva)
);
