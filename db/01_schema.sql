DROP DATABASE IF EXISTS salas_estudio;
CREATE DATABASE salas_estudio CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE salas_estudio;

-- ============================
--          FACULTAD
-- ============================
CREATE TABLE facultad (
    id_facultad INT AUTO_INCREMENT,
    nombre      VARCHAR(100) NOT NULL,
    PRIMARY KEY (id_facultad),
    UNIQUE KEY uq_facultad_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================
--          EDIFICIO
-- ============================
CREATE TABLE edificio (
    nombre_edificio VARCHAR(100) NOT NULL,
    direccion       VARCHAR(150) NOT NULL,
    departamento    VARCHAR(100) NOT NULL,
    PRIMARY KEY (nombre_edificio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================
--         PARTICIPANTE
-- ============================
CREATE TABLE participante (
    ci       VARCHAR(15)  NOT NULL,
    nombre   VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email    VARCHAR(150) NOT NULL,
    tipo     ENUM('grado','posgrado','docente') NOT NULL,
    PRIMARY KEY (ci),
    UNIQUE KEY uq_participante_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================
--       LOGIN / USUARIOS
-- ============================
CREATE TABLE login (
    correo     VARCHAR(150) NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    es_admin   TINYINT(1) NOT NULL DEFAULT 0,
    PRIMARY KEY (correo),
    CONSTRAINT fk_login_participante
        FOREIGN KEY (correo) REFERENCES participante(email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================
--     PROGRAMA ACADÉMICO
-- ============================
CREATE TABLE programa_academico (
    nombre_programa VARCHAR(100) NOT NULL,
    id_facultad     INT NOT NULL,
    tipo            ENUM('grado','posgrado') NOT NULL,
    PRIMARY KEY (nombre_programa),
    CONSTRAINT fk_prog_fac
        FOREIGN KEY (id_facultad) REFERENCES facultad(id_facultad)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================
-- REL PARTICIPANTE - PROGRAMA
-- ============================
CREATE TABLE participante_programa_academico (
    id_alumno_programa INT AUTO_INCREMENT,
    ci_participante    VARCHAR(15)  NOT NULL,
    nombre_programa    VARCHAR(100) NOT NULL,
    rol                ENUM('alumno','docente') NOT NULL,
    PRIMARY KEY (id_alumno_programa),
    UNIQUE KEY uq_participante_programa (ci_participante, nombre_programa),
    CONSTRAINT fk_pp_ci
        FOREIGN KEY (ci_participante) REFERENCES participante(ci),
    CONSTRAINT fk_pp_prog
        FOREIGN KEY (nombre_programa) REFERENCES programa_academico(nombre_programa)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================
--            SALA
-- ============================
CREATE TABLE sala (
    id_sala      INT AUTO_INCREMENT,
    nombre_sala  VARCHAR(100) NOT NULL,
    edificio     VARCHAR(100) NOT NULL,
    capacidad    INT NOT NULL,
    tipo_sala    ENUM('uso_libre','exclusiva_posgrado','exclusiva_docente')
                 NOT NULL DEFAULT 'uso_libre',
    PRIMARY KEY (id_sala),
    UNIQUE KEY uq_sala_nombre_edificio (nombre_sala, edificio),
    CONSTRAINT fk_sala_edificio
        FOREIGN KEY (edificio) REFERENCES edificio(nombre_edificio),
    CONSTRAINT chk_sala_capacidad
        CHECK (capacidad > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================
--           TURNO
-- ============================
CREATE TABLE turno (
    id_turno    INT AUTO_INCREMENT,
    hora_inicio TIME NOT NULL,
    hora_fin    TIME NOT NULL,
    PRIMARY KEY (id_turno),
    CONSTRAINT chk_turno_horas
        CHECK (hora_inicio < hora_fin)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================
--           RESERVA
-- ============================
CREATE TABLE reserva (
    id_reserva     INT AUTO_INCREMENT,
    fecha          DATE NOT NULL,
    id_sala        INT NOT NULL,
    id_turno       INT NOT NULL,
    ci_responsable VARCHAR(15) NOT NULL,
    estado         ENUM('activa','cancelada','sin_asistencia','finalizada')
                   NOT NULL DEFAULT 'activa',
    PRIMARY KEY (id_reserva),
    CONSTRAINT fk_reserva_sala
        FOREIGN KEY (id_sala) REFERENCES sala(id_sala),
    CONSTRAINT fk_reserva_turno
        FOREIGN KEY (id_turno) REFERENCES turno(id_turno),
    CONSTRAINT fk_reserva_responsable
        FOREIGN KEY (ci_responsable) REFERENCES participante(ci),
    CONSTRAINT uq_reserva_sala_turno_estado
        UNIQUE (id_sala, fecha, id_turno, estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================
--   PARTICIPANTES POR RESERVA
-- ============================
CREATE TABLE reserva_participante (
    id_reserva             INT NOT NULL,
    ci_participante        VARCHAR(15) NOT NULL,
    fecha_solicitud_reserva DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    asistencia             TINYINT(1) NOT NULL DEFAULT 0,
    es_responsable         TINYINT(1) NOT NULL DEFAULT 0,
    PRIMARY KEY (id_reserva, ci_participante),
    CONSTRAINT fk_rp_reserva
        FOREIGN KEY (id_reserva) REFERENCES reserva(id_reserva),
    CONSTRAINT fk_rp_ci
        FOREIGN KEY (ci_participante) REFERENCES participante(ci)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================
--          SANCIONES
-- ============================
CREATE TABLE sancion_participante (
    id_sancion      INT AUTO_INCREMENT,
    ci_participante VARCHAR(15) NOT NULL,
    fecha_inicio    DATE NOT NULL,
    fecha_fin       DATE NOT NULL,
    motivo          VARCHAR(255) NOT NULL,
    id_reserva      INT NULL,
    PRIMARY KEY (id_sancion),
    CONSTRAINT fk_sancion_ci
        FOREIGN KEY (ci_participante) REFERENCES participante(ci),
    CONSTRAINT fk_sancion_reserva
        FOREIGN KEY (id_reserva) REFERENCES reserva(id_reserva),
    CONSTRAINT chk_sancion_fechas
        CHECK (fecha_fin > fecha_inicio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
