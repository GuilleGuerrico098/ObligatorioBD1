USE salas_estudio;

-- Facultades
INSERT INTO facultad (nombre) VALUES
('Facultad de Ingeniería y Tecnologías'),
('Facultad de Ciencias Empresariales'),
('Facultad de Psicología');

-- Edificios
INSERT INTO edificio (nombre_edificio, direccion, departamento) VALUES
('Edificio Central', 'Av. Principal 1234', 'Montevideo'),
('Campus Pocitos', 'Bvar. España 4321', 'Montevideo');

-- Programas académicos
INSERT INTO programa_academico (nombre_programa, id_facultad, tipo) VALUES
('Ingeniería en Informática', 1, 'grado'),
('Licenciatura en Sistemas', 1, 'grado'),
('MBA', 2, 'posgrado'),
('Psicología Clínica', 3, 'grado');

-- Participantes
INSERT INTO participante (ci, nombre, apellido, email) VALUES
('4.123.456-7', 'Guillermo', 'Guerrico', 'guillermo.guerrico@ucu.edu.uy'),
('4.234.567-8', 'Santiago', 'Aguerre', 'santiago.aguerre@ucu.edu.uy'),
('4.345.678-9', 'Lucas', 'Fernández', 'lucas.fernandez@ucu.edu.uy'),
('3.987.654-3', 'Ana', 'García', 'ana.garcia@ucu.edu.uy'),
('3.876.543-2', 'María', 'Pérez', 'maria.perez@ucu.edu.uy');

-- Login (usuarios del sistema)
INSERT INTO login (correo, contrasena) VALUES
('guillermo.guerrico@ucu.edu.uy', '1234'),
('santiago.aguerre@ucu.edu.uy', '1234'),
('lucas.fernandez@ucu.edu.uy', '1234'),
('ana.garcia@ucu.edu.uy', '1234'),
('maria.perez@ucu.edu.uy', '1234');

-- Participantes en programas académicos
INSERT INTO participante_programa_academico (ci, nombre_programa) VALUES
('4.123.456-7', 'Ingeniería en Informática'),
('4.234.567-8', 'Ingeniería en Informática'),
('4.345.678-9', 'Licenciatura en Sistemas'),
('3.987.654-3', 'MBA'),
('3.876.543-2', 'Psicología Clínica');

-- Turnos
INSERT INTO turno (hora_inicio, hora_fin, descripcion) VALUES
('08:00:00', '10:00:00', 'Turno matutino 1'),
('10:00:00', '12:00:00', 'Turno matutino 2'),
('14:00:00', '16:00:00', 'Turno vespertino 1'),
('16:00:00', '18:00:00', 'Turno vespertino 2');

-- Salas (pensando ya en RN: grupales, silenciosas, con/sin PC)
INSERT INTO sala (nombre_sala, nombre_edificio, piso, capacidad, es_grupal, tiene_pc, es_silenciosa) VALUES
('Sala 101', 'Edificio Central', 1, 6, 1, 1, 0),
('Sala 102', 'Edificio Central', 1, 4, 1, 0, 1),
('Sala 201', 'Edificio Central', 2, 10, 1, 1, 0),
('Sala A1', 'Campus Pocitos', 1, 2, 0, 0, 1),
('Sala A2', 'Campus Pocitos', 1, 4, 1, 0, 1);

-- Reservas de ejemplo
INSERT INTO reserva (fecha, id_sala, id_turno, ci_responsable, estado) VALUES
('2025-11-20', 1, 1, '4.123.456-7', 'activa'),
('2025-11-20', 2, 2, '4.234.567-8', 'activa'),
('2025-11-21', 3, 3, '4.345.678-9', 'finalizada'),
('2025-11-21', 4, 4, '3.987.654-3', 'cancelada');

-- Participantes por reserva
INSERT INTO reserva_participante (id_reserva, ci, es_responsable) VALUES
(1, '4.123.456-7', 1),
(1, '4.234.567-8', 0),
(1, '4.345.678-9', 0),
(2, '4.234.567-8', 1),
(2, '3.987.654-3', 0),
(3, '4.345.678-9', 1),
(3, '4.123.456-7', 0),
(4, '3.987.654-3', 1);

-- Sanciones de ejemplo
INSERT INTO sancion_participante (ci, fecha_inicio, fecha_fin, motivo, id_reserva) VALUES
('4.345.678-9', '2025-11-22', '2025-11-29', 'No asistencia sin aviso', 3),
('3.987.654-3', '2025-11-21', '2025-11-25', 'Cancelación fuera de plazo', 4);
