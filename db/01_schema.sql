-- Crear base de datos y usarla
CREATE DATABASE IF NOT EXISTS salas_estudio;
USE salas_estudio;

-- 1) Facultad
CREATE TABLE facultad (
    id_facultad      INT AUTO_INCREMENT,
    nombre           VARCHAR(100) NOT NULL,
    PRIMARY KEY (id_facultad),
    UNIQUE (nombre)
);

-- 2) Edificio
CREATE TABLE edificio (
    nombre_edificio  VARCHAR(100),
    direccion        VARCHAR(150) NOT NULL,
    departamento     VARCHAR(100) NOT NULL,
    PRIMARY KEY (nombre_edificio)
);

-- 3) Participante
CREATE TABLE participante (
    ci          VARCHAR(15),
    nombre      VARCHAR(100) NOT NULL,
    apellido    VARCHAR(100) NOT NULL,
    email       VARCHAR(150) NOT NULL,
    PRIMARY KEY (ci),
    UNIQUE (email)
);

-- 4) Programa académico
CREATE TABLE programa_academico (
    nombre_programa  VARCHAR(100),
    id_facultad      INT NOT NULL,
    tipo             ENUM('grado', 'posgrado') NOT NULL,
    PRIMARY KEY (nombre_programa),
    CONSTRAINT fk_programa_facultad
        FOREIGN KEY (id_facultad)
        REFERENCES facultad (id_facultad)
);

-- 5) Login (relacionado a participante vía email)
CREATE TABLE login (
    correo      VARCHAR(150),
    contrasena  VARCHAR(255) NOT NULL,
    PRIMARY KEY (correo),
    CONSTRAINT fk_login_participante
        FOREIGN KEY (correo)
        REFERENCES participante (email)
);

-- 6) Sala
CREATE TABLE sala (
    id_sala           INT AUTO_INCREMENT,
    nombre_sala       VARCHAR(100) NOT NULL,
    nombre_edificio   VARCHAR(100) NOT NULL,
    piso              INT NOT NULL,
    capacidad         INT NOT NULL,
    es_grupal         TINYINT(1) NOT NULL DEFAULT 1,
    tiene_pc          TINYINT(1) NOT NULL DEFAULT 0,
    es_silenciosa     TINYINT(1) NOT NULL DEFAULT 0,
    PRIMARY KEY (id_sala),
    CONSTRAINT fk_sala_edificio
        FOREIGN KEY (nombre_edificio)
        REFERENCES edificio (nombre_edificio)
);

-- 7) Turno
CREATE TABLE turno (
    id_turno      INT AUTO_INCREMENT,
    hora_inicio   TIME NOT NULL,
    hora_fin      TIME NOT NULL,
    descripcion   VARCHAR(100),
    PRIMARY KEY (id_turno)
);

-- 8) Participante en Programa Académico (tabla intermedia)
CREATE TABLE participante_programa_academico (
    ci               VARCHAR(15),
    nombre_programa  VARCHAR(100),
    PRIMARY KEY (ci, nombre_programa),
    CONSTRAINT fk_pp_ci
        FOREIGN KEY (ci)
        REFERENCES participante (ci),
    CONSTRAINT fk_pp_programa
        FOREIGN KEY (nombre_programa)
        REFERENCES programa_academico (nombre_programa)
);

-- 9) Reserva
CREATE TABLE reserva (
    id_reserva       INT AUTO_INCREMENT,
    fecha            DATE NOT NULL,
    id_sala          INT NOT NULL,
    id_turno         INT NOT NULL,
    ci_responsable   VARCHAR(15) NOT NULL,
    estado           ENUM('activa', 'cancelada', 'finalizada') NOT NULL DEFAULT 'activa',
    PRIMARY KEY (id_reserva),
    CONSTRAINT fk_reserva_sala
        FOREIGN KEY (id_sala)
        REFERENCES sala (id_sala),
    CONSTRAINT fk_reserva_turno
        FOREIGN KEY (id_turno)
        REFERENCES turno (id_turno),
    CONSTRAINT fk_reserva_responsable
        FOREIGN KEY (ci_responsable)
        REFERENCES participante (ci)
);

-- 10) Participantes que forman parte de una reserva
CREATE TABLE reserva_participante (
    id_reserva   INT,
    ci           VARCHAR(15),
    es_responsable TINYINT(1) NOT NULL DEFAULT 0,
    PRIMARY KEY (id_reserva, ci),
    CONSTRAINT fk_rp_reserva
        FOREIGN KEY (id_reserva)
        REFERENCES reserva (id_reserva),
    CONSTRAINT fk_rp_participante
        FOREIGN KEY (ci)
        REFERENCES participante (ci)
);

-- 11) Sanciones a participantes
CREATE TABLE sancion_participante (
    id_sancion     INT AUTO_INCREMENT,
    ci             VARCHAR(15) NOT NULL,
    fecha_inicio   DATE NOT NULL,
    fecha_fin      DATE NOT NULL,
    motivo         TEXT NOT NULL,
    id_reserva     INT NULL,
    PRIMARY KEY (id_sancion),
    CONSTRAINT fk_sancion_participante
        FOREIGN KEY (ci)
        REFERENCES participante (ci),
    CONSTRAINT fk_sancion_reserva
        FOREIGN KEY (id_reserva)
        REFERENCES reserva (id_reserva)
);
