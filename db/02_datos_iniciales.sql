USE salas_estudio;

-- ============================================
--               FACULTADES
-- ============================================
INSERT INTO facultad (nombre)
VALUES 
    ('Ingeniería y Tecnologías'),
    ('Ciencias Empresariales'),
    ('Ciencias Humanas'),
    ('Psicología');

-- ============================================
--               EDIFICIOS
-- ============================================
INSERT INTO edificio (nombre_edificio, direccion, departamento)
VALUES
    ('Central', 'Av. 8 de Octubre 2738', 'Montevideo'),
    ('Pereira', 'Av. José Batlle y Ordóñez 3360', 'Montevideo'),
    ('Biblioteca', 'Av. 8 de Octubre 2738 - Ala B', 'Montevideo');

-- ============================================
--           PROGRAMAS ACADÉMICOS
-- ============================================
INSERT INTO programa_academico (nombre_programa, id_facultad, tipo)
VALUES
    ('Ingeniería en Informática', 1, 'grado'),
    ('Ingeniería en Telecomunicaciones', 1, 'grado'),
    ('MBA', 2, 'posgrado'),
    ('Psicología Clínica', 4, 'posgrado');

-- ============================================
--               PARTICIPANTES
-- ============================================
INSERT INTO participante (ci, nombre, apellido, email, tipo)
VALUES
    ('41234567', 'Juan', 'Pérez', 'juan.perez@ucu.edu.uy', 'grado'),
    ('43322119', 'Ana', 'López', 'ana.lopez@ucu.edu.uy', 'posgrado'),
    ('59876543', 'María', 'García', 'maria.garcia@ucu.edu.uy', 'docente'),
    ('45566777', 'Sofía', 'Martínez', 'sofia.martinez@ucu.edu.uy', 'grado'),
    ('52233445', 'Lucas', 'Fernández', 'lucas.fernandez@ucu.edu.uy', 'grado');

-- Relación participante–programa
INSERT INTO participante_programa_academico (ci, nombre_programa)
VALUES
    ('41234567', 'Ingeniería en Informática'),
    ('45566777', 'Ingeniería en Informática'),
    ('52233445', 'Ingeniería en Telecomunicaciones'),
    ('43322119', 'MBA');

-- ============================================
--                LOGIN
-- ============================================
-- Contraseñas sin encriptar por ahora (luego lo haremos bien)
INSERT INTO login (correo, contrasena)
VALUES
    ('juan.perez@ucu.edu.uy', '1234'),
    ('ana.lopez@ucu.edu.uy', '1234'),
    ('maria.garcia@ucu.edu.uy', '1234'),
    ('sofia.martinez@ucu.edu.uy', '1234'),
    ('lucas.fernandez@ucu.edu.uy', '1234');

-- ============================================
--                   SALAS
-- ============================================
INSERT INTO sala (nombre_sala, nombre_edificio, piso, capacidad, es_grupal, tiene_pc, es_silenciosa, tipo)
VALUES
    ('Sala 101', 'Central', 1, 4, 1, 0, 0, 'uso_libre'),
    ('Sala 203', 'Pereira', 2, 6, 1, 1, 0, 'exclusiva_posgrado'),
    ('Sala 005', 'Biblioteca', 0, 3, 0, 0, 1, 'exclusiva_docente'),
    ('Sala 110', 'Central', 1, 10, 1, 1, 0, 'uso_libre');

-- ============================================
--                 TURNOS (opcional)
-- ============================================
-- Aunque no los usemos para reservas (usamos hora_inicio/hora_fin),
-- los dejamos como pide el obligatorio.
INSERT INTO turno (hora_inicio, hora_fin, descripcion)
VALUES
    ('08:00:00', '09:00:00', 'Bloque 1'),
    ('09:00:00', '10:00:00', 'Bloque 2'),
    ('10:00:00', '11:00:00', 'Bloque 3'),
    ('11:00:00', '12:00:00', 'Bloque 4');

-- ============================================
--               RESERVAS EJEMPLO
-- ============================================
INSERT INTO reserva (fecha, id_sala, hora_inicio, hora_fin, ci_responsable, estado)
VALUES
    ('2025-03-10', 1, '08:00:00', '10:00:00', '41234567', 'activa'),
    ('2025-03-11', 2, '09:00:00', '11:00:00', '43322119', 'activa');

-- Participantes de cada reserva
INSERT INTO reserva_participante (id_reserva, ci, es_responsable, asistio)
VALUES
    (1, '41234567', 1, 'pendiente'),
    (1, '45566777', 0, 'pendiente'),
    (2, '43322119', 1, 'pendiente'),
    (2, '59876543', 0, 'pendiente');

-- ============================================
--                SANCIONES EJEMPLO
-- ============================================
INSERT INTO sancion_participante (ci, fecha_inicio, fecha_fin, motivo, id_reserva)
VALUES
    ('45566777', '2025-02-01', '2025-04-01', 'Inasistencia total a la reserva del 5/1/2025', 1);
