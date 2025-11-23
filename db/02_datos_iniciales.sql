USE salas_estudio;

-- ===========================
-- FACULTADES
-- ===========================
INSERT INTO facultad (nombre) VALUES
('Facultad de Ingeniería y Tecnologías'),
('Facultad de Ciencias Empresariales'),
('Facultad de Humanidades y Comunicación');

-- ===========================
-- EDIFICIOS
-- ===========================
INSERT INTO edificio (nombre_edificio, direccion, departamento) VALUES
('Sede Central', 'Av. 8 de Octubre 2738', 'Montevideo'),
('Sagrado Corazón', 'Av. 8 de Octubre 2801', 'Montevideo'),
('Campus Punta del Este', 'Av. Roosevelt 1234', 'Maldonado');

-- ===========================
-- PROGRAMAS ACADÉMICOS
-- ===========================
-- Suponemos:
-- id_facultad 1 = Ingeniería
-- id_facultad 2 = Empresariales
-- id_facultad 3 = Humanidades

INSERT INTO programa_academico (nombre_programa, id_facultad, tipo) VALUES
('Ingeniería en Informática', 1, 'grado'),
('Ingeniería en Telecomunicaciones', 1, 'grado'),
('Maestría en Data Science', 1, 'posgrado'),
('Licenciatura en Administración de Empresas', 2, 'grado'),
('MBA', 2, 'posgrado');

-- ===========================
-- PARTICIPANTES
-- ===========================
-- tipo: 'grado' | 'posgrado' | 'docente'

INSERT INTO participante (ci, nombre, apellido, email, tipo) VALUES
('48011222', 'Guillermo', 'Guerrico', 'guillermo.guerrico@ucu.edu.uy', 'grado'),
('49022333', 'Lucía', 'Pérez', 'lucia.perez@ucu.edu.uy', 'grado'),
('50033444', 'Santiago', 'Aguerre', 'santiago.aguerre@ucu.edu.uy', 'posgrado'),
('51144555', 'María', 'Rodríguez', 'maria.rodriguez@ucu.edu.uy', 'posgrado'),
('52255666', 'Ignacio', 'Ruiz', 'ignacio.ruiz@ucu.edu.uy', 'docente'),
('53366777', 'Ana', 'Fernández', 'ana.fernandez@ucu.edu.uy', 'docente');

-- ===========================
-- RELACIÓN PARTICIPANTE - PROGRAMA
-- ===========================
INSERT INTO participante_programa_academico (ci, nombre_programa) VALUES
('48011222', 'Ingeniería en Informática'),
('49022333', 'Ingeniería en Informática'),
('50033444', 'Maestría en Data Science'),
('51144555', 'MBA');

-- Docentes en principio no se asocian a programa_academico

-- ===========================
-- LOGIN (simple, sin hash, para pruebas)
-- ===========================
INSERT INTO login (correo, contrasena) VALUES
('guillermo.guerrico@ucu.edu.uy', 'alumno123'),
('lucia.perez@ucu.edu.uy', 'alumno123'),
('santiago.aguerre@ucu.edu.uy', 'posgrado123'),
('maria.rodriguez@ucu.edu.uy', 'posgrado123'),
('ignacio.ruiz@ucu.edu.uy', 'docente123'),
('ana.fernandez@ucu.edu.uy', 'docente123');

-- ===========================
-- SALAS
-- tipo: 'uso_libre', 'exclusiva_posgrado', 'exclusiva_docente'
-- ===========================
INSERT INTO sala
(nombre_sala, nombre_edificio, piso, capacidad, es_grupal, tiene_pc, es_silenciosa, tipo)
VALUES
('Sala 101', 'Sede Central', 1, 6, 1, 1, 0, 'uso_libre'),
('Sala 102', 'Sede Central', 1, 4, 1, 0, 1, 'uso_libre'),
('Sala 201', 'Sede Central', 2, 10, 1, 1, 0, 'exclusiva_posgrado'),
('Sala 301', 'Sagrado Corazón', 3, 8, 1, 1, 1, 'exclusiva_docente'),
('Sala 10',  'Campus Punta del Este', 1, 6, 1, 0, 0, 'uso_libre'),
('Sala 11',  'Campus Punta del Este', 1, 2, 0, 0, 1, 'uso_libre');

-- ===========================
-- TURNOS (bloques de 1 hora de 08:00 a 23:00)
-- ===========================
INSERT INTO turno (hora_inicio, hora_fin, descripcion) VALUES
('08:00:00', '09:00:00', 'Horario 08:00 - 09:00'),
('09:00:00', '10:00:00', 'Horario 09:00 - 10:00'),
('10:00:00', '11:00:00', 'Horario 10:00 - 11:00'),
('11:00:00', '12:00:00', 'Horario 11:00 - 12:00'),
('12:00:00', '13:00:00', 'Horario 12:00 - 13:00'),
('13:00:00', '14:00:00', 'Horario 13:00 - 14:00'),
('14:00:00', '15:00:00', 'Horario 14:00 - 15:00'),
('15:00:00', '16:00:00', 'Horario 15:00 - 16:00'),
('16:00:00', '17:00:00', 'Horario 16:00 - 17:00'),
('17:00:00', '18:00:00', 'Horario 17:00 - 18:00'),
('18:00:00', '19:00:00', 'Horario 18:00 - 19:00'),
('19:00:00', '20:00:00', 'Horario 19:00 - 20:00'),
('20:00:00', '21:00:00', 'Horario 20:00 - 21:00'),
('21:00:00', '22:00:00', 'Horario 21:00 - 22:00'),
('22:00:00', '23:00:00', 'Horario 22:00 - 23:00');

-- ===========================
-- RESERVAS DE EJEMPLO
-- ===========================
-- Supongamos:
-- id_sala:
--   1 = Sala 101 (uso libre, Sede Central)
--   2 = Sala 102
--   3 = Sala 201 (exclusiva_posgrado)
--   4 = Sala 301 (exclusiva_docente)
-- id_turno:
--   3 = 10:00 - 11:00
--   4 = 11:00 - 12:00
--   5 = 12:00 - 13:00

-- Reserva 1: Guillermo (grado) reserva Sala 101 para hoy a 10:00
INSERT INTO reserva (fecha, id_sala, id_turno, ci_responsable, estado) VALUES
(CURDATE(), 1, 3, '48011222', 'activa');

-- Reserva 2: Santiago (posgrado) reserva Sala 201 (posgrado) a 11:00
INSERT INTO reserva (fecha, id_sala, id_turno, ci_responsable, estado) VALUES
(CURDATE(), 3, 4, '50033444', 'activa');

-- Reserva 3: Ignacio (docente) reserva Sala 301 (docente) a 12:00
INSERT INTO reserva (fecha, id_sala, id_turno, ci_responsable, estado) VALUES
(CURDATE(), 4, 5, '52255666', 'activa');

-- ===========================
-- PARTICIPANTES POR RESERVA
-- ===========================
-- Obtenemos id_reserva suponiendo que son 1,2,3 en orden de inserción
-- (si no, se puede consultar con SELECT * FROM reserva; después)

-- Reserva 1: Guillermo responsable, Lucía acompañante
INSERT INTO reserva_participante (id_reserva, ci, es_responsable, asistio) VALUES
(1, '48011222', 1, 1),
(1, '49022333', 0, 1);

-- Reserva 2: Santiago responsable solamente
INSERT INTO reserva_participante (id_reserva, ci, es_responsable, asistio) VALUES
(2, '50033444', 1, 1);

-- Reserva 3: Ignacio responsable, pero nadie asiste (ejemplo para sanción)
INSERT INTO reserva_participante (id_reserva, ci, es_responsable, asistio) VALUES
(3, '52255666', 1, 0);

-- ===========================
-- SANCIONES EJEMPLO
-- ===========================
-- Sancionamos a Ignacio por inasistencia total en la reserva 3
-- +2 meses desde hoy

INSERT INTO sancion_participante (ci, fecha_inicio, fecha_fin, motivo, id_reserva) VALUES
(
  '52255666',
  CURDATE(),
  DATE_ADD(CURDATE(), INTERVAL 2 MONTH),
  'Inasistencia de todos los participantes a la reserva 3',
  3
);
