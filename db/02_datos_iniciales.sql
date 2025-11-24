USE salas_estudio;

-- ================================
-- FACULTADES
-- ================================
INSERT INTO facultad (nombre) VALUES
('Ingeniería'),
('Empresariales'),
('Derecho'),
('Humanidades');

-- ================================
-- EDIFICIOS
-- ================================
INSERT INTO edificio (nombre_edificio, direccion, departamento) VALUES
('Aulario', 'Av. 8 de Octubre 2738', 'Montevideo'),
('Biblioteca', 'Av. 8 de Octubre 2738', 'Montevideo'),
('Liberal Arts', 'Av. 8 de Octubre 2738', 'Montevideo');

-- ================================
-- PROGRAMAS ACADÉMICOS
-- ================================
INSERT INTO programa_academico (nombre_programa, id_facultad, tipo) VALUES
('Ingeniería Informática', 1, 'grado'),
('Maestría en Educación', 4, 'posgrado'),
('Docencia Universitaria', 1, 'posgrado'),
('MBA', 2, 'posgrado');

-- ================================
-- PARTICIPANTES
-- ================================
INSERT INTO participante (ci, nombre, apellido, email, tipo) VALUES
('41234567', 'Admin', 'Demo', 'admin@ucu.edu.uy', 'docente'),
('55325342', 'Alumno', 'Demo', 'alumno@ucu.edu.uy', 'grado'),
('50111222', 'Juancito', 'Pérez', 'juancito@ucu.edu.uy', 'grado'),
('60999888', 'Ana', 'Docente', 'ana.docente@ucu.edu.uy', 'docente');

-- ================================
-- LOGIN
-- ================================
INSERT INTO login (correo, contrasena, es_admin) VALUES
('admin@ucu.edu.uy', 'admin123', 1),
('alumno@ucu.edu.uy', 'alumno123', 0),
('juancito@ucu.edu.uy', 'juan123', 0),
('ana.docente@ucu.edu.uy', 'docente123', 0);

-- ================================
-- PARTICIPANTE–PROGRAMA
-- ================================
INSERT INTO participante_programa_academico (ci_participante, nombre_programa, rol) VALUES
('41234567', 'Docencia Universitaria', 'docente'),
('55325342', 'Ingeniería Informática', 'alumno'),
('50111222', 'Ingeniería Informática', 'alumno'),
('60999888', 'MBA', 'docente');

-- ================================
-- SALAS
-- ================================
INSERT INTO sala (nombre_sala, edificio, capacidad, tipo_sala) VALUES
('SALA A1', 'Aulario', 6, 'uso_libre'),
('SALA A2', 'Aulario', 4, 'uso_libre'),
('SALA B1', 'Biblioteca', 2, 'uso_libre'),
('SALA POS1', 'Aulario', 8, 'exclusiva_posgrado'),
('SALA DOC1', 'Liberal Arts', 10, 'exclusiva_docente');

-- ================================
-- TURNOS (08:00 → 23:00, bloques 1h)
-- ================================
INSERT INTO turno (hora_inicio, hora_fin) VALUES
('08:00:00', '09:00:00'),
('09:00:00', '10:00:00'),
('10:00:00', '11:00:00'),
('11:00:00', '12:00:00'),
('12:00:00', '13:00:00'),
('13:00:00', '14:00:00'),
('14:00:00', '15:00:00'),
('15:00:00', '16:00:00'),
('16:00:00', '17:00:00'),
('17:00:00', '18:00:00'),
('18:00:00', '19:00:00'),
('19:00:00', '20:00:00'),
('20:00:00', '21:00:00'),
('21:00:00', '22:00:00'),
('22:00:00', '23:00:00');
