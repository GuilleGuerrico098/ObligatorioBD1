import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar.jsx';
import { apiGet, apiPost, apiPut, apiDelete } from '../../api';
import { useAuth } from '../../context/AuthContext';

function formatHora(value) {
  if (value == null) return '';
  if (typeof value === 'number') {
    const total = value;
    const hh = String(Math.floor(total / 3600)).padStart(2, '0');
    const mm = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
    return `${hh}:${mm}`;
  }
  if (typeof value === 'string') {
    return value.slice(0, 5);
  }
  return String(value);
}

export default function ReservasAdmin() {
  const { user } = useAuth();
  const [reservas, setReservas] = useState([]);
  const [salas, setSalas] = useState([]);
  const [turnos, setTurnos] = useState([]);

  const [fechaNueva, setFechaNueva] = useState('');
  const [salaNueva, setSalaNueva] = useState('');
  const [turnoNuevo, setTurnoNuevo] = useState('');
  const [ciResponsable, setCiResponsable] = useState('');

  const [editandoId, setEditandoId] = useState(null);
  const [editFecha, setEditFecha] = useState('');
  const [editSala, setEditSala] = useState('');
  const [editTurno, setEditTurno] = useState('');

  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);
  const [participantesAsistencia, setParticipantesAsistencia] = useState([]);
  const [mensajeAsistencia, setMensajeAsistencia] = useState('');

  const botonPrimario = {
    padding: '8px 14px',
    borderRadius: 4,
    border: '1px solid #004b8d',
    backgroundColor: '#004b8d',
    color: 'white',
    cursor: 'pointer',
    fontWeight: 500,
  };

  const botonOutline = {
    padding: '8px 14px',
    borderRadius: 4,
    border: '1px solid #004b8d',
    backgroundColor: 'white',
    color: '#004b8d',
    cursor: 'pointer',
    fontWeight: 500,
  };

  const botonDanger = {
    padding: '6px 10px',
    borderRadius: 4,
    border: '1px solid #dc3545',
    backgroundColor: '#dc3545',
    color: 'white',
    cursor: 'pointer',
    fontWeight: 500,
  };

  useEffect(() => {
    async function cargar() {
      try {
        const [resData, salasData, turnosData] = await Promise.all([
          apiGet('/reservas'),
          apiGet('/salas'),
          apiGet('/turnos'),
        ]);
        setReservas(resData || []);
        setSalas(salasData || []);
        setTurnos(turnosData || []);
      } catch (e) {
        console.error(e);
        setMensaje('Error al cargar datos');
      }
    }
    cargar();
  }, []);

  if (!user || !user.es_admin) {
    return (
      <>
        <Navbar />
        <div className="card">
          <p>Acceso restringido. Debe ser administrador.</p>
        </div>
      </>
    );
  }

  function encontrarSalaPorId(id) {
    return salas.find((s) => String(s.id_sala) === String(id));
  }

  async function recargarReservas() {
    const resData = await apiGet('/reservas');
    setReservas(resData || []);
  }

  async function handleCrear(e) {
    e.preventDefault();
    setMensaje('');

    if (!fechaNueva || !salaNueva || !turnoNuevo || !ciResponsable) {
      setMensaje('Complete todos los campos de alta.');
      return;
    }

    const sala = encontrarSalaPorId(salaNueva);
    if (!sala) {
      setMensaje('Sala inválida.');
      return;
    }

    const body = {
      fecha: fechaNueva,
      nombre_sala: sala.nombre_sala,
      edificio: sala.edificio,
      id_turno: Number(turnoNuevo),
      ci_responsable: ciResponsable,
      participantes: [ciResponsable],
    };

    setCargando(true);
    try {
      await apiPost('/reservas', body);
      setMensaje('Reserva creada correctamente.');
      setFechaNueva('');
      setSalaNueva('');
      setTurnoNuevo('');
      setCiResponsable('');
      await recargarReservas();
    } catch (err) {
      console.error(err);
      setMensaje(err.message || 'Error al crear reserva.');
    } finally {
      setCargando(false);
    }
  }

  function empezarEdicion(r) {
    setEditandoId(r.id_reserva);
    setEditFecha(r.fecha);
    const salaObj = salas.find(
      (s) => s.nombre_sala === r.nombre_sala && s.edificio === r.edificio
    );
    setEditSala(salaObj ? String(salaObj.id_sala) : '');
    setEditTurno(String(r.id_turno));
  }

  function cancelarEdicion() {
    setEditandoId(null);
    setEditFecha('');
    setEditSala('');
    setEditTurno('');
  }

  async function guardarEdicion(e) {
    e.preventDefault();
    if (!editFecha || !editSala || !editTurno) {
      setMensaje('Complete todos los campos de edición.');
      return;
    }

    const sala = encontrarSalaPorId(editSala);
    if (!sala) {
      setMensaje('Sala inválida.');
      return;
    }

    const body = {
      fecha: editFecha,
      nombre_sala: sala.nombre_sala,
      edificio: sala.edificio,
      id_turno: Number(editTurno),
    };

    setCargando(true);
    try {
      await apiPut(`/reservas/${editandoId}`, body);
      setMensaje('Reserva modificada correctamente.');
      cancelarEdicion();
      await recargarReservas();
    } catch (err) {
      console.error(err);
      setMensaje(err.message || 'Error al modificar reserva.');
    } finally {
      setCargando(false);
    }
  }

  async function cancelarReserva(id) {
    if (!window.confirm('¿Cancelar esta reserva?')) return;
    setCargando(true);
    setMensaje('');
    try {
      await apiDelete(`/reservas/${id}`);
      setMensaje('Reserva cancelada.');
      await recargarReservas();
    } catch (err) {
      console.error(err);
      setMensaje(err.message || 'Error al cancelar reserva.');
    } finally {
      setCargando(false);
    }
  }

  async function cargarAsistencias(reserva) {
    setMensajeAsistencia('');
    setReservaSeleccionada(reserva);
    try {
      const data = await apiGet(`/reservas/${reserva.id_reserva}/participantes`);
      setParticipantesAsistencia(
        (data || []).map((p) => ({
          ci_participante: p.ci_participante,
          nombre: p.nombre,
          apellido: p.apellido,
          asistio: p.asistio === 1 || p.asistio === true,
        }))
      );
    } catch (e) {
      console.error(e);
      setMensajeAsistencia('Error al cargar participantes de la reserva.');
    }
  }

  function toggleAsistencia(ci) {
    setParticipantesAsistencia((prev) =>
      prev.map((p) =>
        p.ci_participante === ci ? { ...p, asistio: !p.asistio } : p
      )
    );
  }

  // 🔴 AQUÍ ESTABA EL PROBLEMA: llamabas PUT /reservas/{id}/asistencias
  // ✅ Ahora usamos POST /reservas/{id}/asistencia y enviamos "presentes"
  async function guardarAsistencias() {
    if (!reservaSeleccionada) return;
    setMensajeAsistencia('');

    const presentes = participantesAsistencia
      .filter((p) => p.asistio)
      .map((p) => p.ci_participante);

    try {
      const resp = await apiPost(
        `/reservas/${reservaSeleccionada.id_reserva}/asistencia`,
        { presentes }
      );
      setMensajeAsistencia(
        resp && resp.message
          ? resp.message
          : 'Asistencias registradas correctamente.'
      );
      // opcional: refrescar reservas
      // await recargarReservas();
    } catch (e) {
      console.error(e);
      setMensajeAsistencia(e.message || 'Error al registrar asistencias.');
    }
  }

  return (
    <>
      <Navbar />
      <div className="card">
        <h2>Administración de reservas</h2>

        {mensaje && <div className="alert">{mensaje}</div>}

        <h3>Alta de reserva</h3>
        <form onSubmit={handleCrear} style={{ maxWidth: 500, marginBottom: 24 }}>
          <div style={{ marginBottom: 8 }}>
            <label>Fecha</label>
            <input
              type="date"
              value={fechaNueva}
              onChange={(e) => setFechaNueva(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: 8 }}>
            <label>Sala</label>
            <select
              value={salaNueva}
              onChange={(e) => setSalaNueva(e.target.value)}
            >
              <option value="">Seleccione sala</option>
              {salas.map((s) => (
                <option key={s.id_sala} value={s.id_sala}>
                  {s.edificio} - {s.nombre_sala}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 8 }}>
            <label>Turno</label>
            <select
              value={turnoNuevo}
              onChange={(e) => setTurnoNuevo(e.target.value)}
            >
              <option value="">Seleccione turno</option>
              {turnos.map((t) => (
                <option key={t.id_turno} value={t.id_turno}>
                  {formatHora(t.hora_inicio)} - {formatHora(t.hora_fin)}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 8 }}>
            <label>CI responsable</label>
            <input
              type="text"
              value={ciResponsable}
              onChange={(e) => setCiResponsable(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            style={botonPrimario}
          >
            {cargando ? 'Procesando...' : 'Crear reserva'}
          </button>
        </form>

        <h3>Listado de reservas</h3>

        {reservas.length === 0 ? (
          <p>No hay reservas registradas.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha</th>
                <th>Sala</th>
                <th>Edificio</th>
                <th>Horario</th>
                <th>Responsable</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reservas.map((r) =>
                editandoId === r.id_reserva ? (
                  <tr key={r.id_reserva}>
                    <td>{r.id_reserva}</td>
                    <td>
                      <input
                        type="date"
                        value={editFecha}
                        onChange={(e) => setEditFecha(e.target.value)}
                      />
                    </td>
                    <td>
                      <select
                        value={editSala}
                        onChange={(e) => setEditSala(e.target.value)}
                      >
                        <option value="">Sala</option>
                        {salas.map((s) => (
                          <option key={s.id_sala} value={s.id_sala}>
                            {s.edificio} - {s.nombre_sala}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>{r.edificio}</td>
                    <td>
                      <select
                        value={editTurno}
                        onChange={(e) => setEditTurno(e.target.value)}
                      >
                        <option value="">Turno</option>
                        {turnos.map((t) => (
                          <option key={t.id_turno} value={t.id_turno}>
                            {formatHora(t.hora_inicio)} - {formatHora(t.hora_fin)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      {r.nombre_responsable} {r.apellido_responsable}
                    </td>
                    <td>{r.estado}</td>
                    <td>
                      <button
                        onClick={guardarEdicion}
                        style={{ ...botonPrimario, padding: '6px 10px', marginRight: 8 }}
                      >
                        Guardar
                      </button>
                      <button
                        onClick={cancelarEdicion}
                        style={{ ...botonOutline, padding: '6px 10px', marginRight: 8 }}
                      >
                        Cancelar
                      </button>
                    </td>
                  </tr>
                ) : (
                  <tr key={r.id_reserva}>
                    <td>{r.id_reserva}</td>
                    <td>{r.fecha}</td>
                    <td>{r.nombre_sala}</td>
                    <td>{r.edificio}</td>
                    <td>
                      {formatHora(r.hora_inicio)} - {formatHora(r.hora_fin)}
                    </td>
                    <td>
                      {r.nombre_responsable} {r.apellido_responsable}
                    </td>
                    <td>{r.estado}</td>
                    <td>
                      <button
                        onClick={() => empezarEdicion(r)}
                        style={{ ...botonPrimario, padding: '6px 10px', marginRight: 8 }}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => cancelarReserva(r.id_reserva)}
                        style={{ ...botonDanger, marginRight: 8 }}
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => cargarAsistencias(r)}
                        style={{ ...botonOutline, padding: '6px 10px' }}
                      >
                        Asistencia
                      </button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        )}
      </div>

      {reservaSeleccionada && (
        <div className="card">
          <h3>
            Asistencia reserva #{reservaSeleccionada.id_reserva} -{' '}
            {reservaSeleccionada.fecha}
          </h3>
          <p className="page-subtitle">
            Marcá quiénes asistieron. Si ninguno asiste se generan sanciones por 2 meses.
          </p>

          {mensajeAsistencia && <div className="alert">{mensajeAsistencia}</div>}

          {participantesAsistencia.length === 0 ? (
            <p>No hay participantes registrados en esta reserva.</p>
          ) : (
            <>
              <table className="table">
                <thead>
                  <tr>
                    <th>CI</th>
                    <th>Nombre</th>
                    <th>Apellido</th>
                    <th>Asistió</th>
                  </tr>
                </thead>
                <tbody>
                  {participantesAsistencia.map((p) => (
                    <tr key={p.ci_participante}>
                      <td>{p.ci_participante}</td>
                      <td>{p.nombre}</td>
                      <td>{p.apellido}</td>
                      <td>
                        <input
                          type="checkbox"
                          checked={p.asistio}
                          onChange={() => toggleAsistencia(p.ci_participante)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ marginTop: 12 }}>
                <button
                  type="button"
                  onClick={guardarAsistencias}
                  style={botonPrimario}
                >
                  Guardar asistencia
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
