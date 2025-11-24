import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar.jsx';
import { apiGet, apiPost } from '../../api';
import { useAuth } from '../../context/AuthContext';

function formatHora(value) {
  if (!value) return '';
  if (typeof value === 'string') return value.slice(0, 5);
  const hh = String(Math.floor(value / 3600)).padStart(2, '0');
  const mm = String(Math.floor((value % 3600) / 60)).padStart(2, '0');
  return `${hh}:${mm}`;
}

export default function CrearReserva() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [salas, setSalas] = useState([]);
  const [turnos, setTurnos] = useState([]);

  const [fecha, setFecha] = useState('');
  const [idSalaSeleccionada, setIdSalaSeleccionada] = useState('');
  const [idTurnoSeleccionado, setIdTurnoSeleccionado] = useState('');

  const [ciResponsable, setCiResponsable] = useState(user?.ci || '');
  const [companerosTexto, setCompanerosTexto] = useState('');

  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    async function cargarDatos() {
      try {
        const [salasData, turnosData] = await Promise.all([
          apiGet('/salas'),
          apiGet('/turnos'),
        ]);
        setSalas(salasData || []);
        setTurnos(turnosData || []);
      } catch (e) {
        console.error(e);
        setMensaje('Error al cargar salas y turnos.');
      }
    }
    cargarDatos();
  }, []);

  if (!user) return <p>Debe iniciar sesión.</p>;

  async function handleSubmit(e) {
    e.preventDefault();
    setMensaje('');

    if (!fecha || !idSalaSeleccionada || !idTurnoSeleccionado) {
      setMensaje('Complete todos los campos.');
      return;
    }

    const sala = salas.find((s) => String(s.id_sala) === idSalaSeleccionada);

    const extra = companerosTexto
      .split(/[,\s]+/)
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    const participantes = Array.from(new Set([...extra, ciResponsable]));

    try {
      setCargando(true);
      await apiPost('/reservas', {
        fecha,
        nombre_sala: sala.nombre_sala,
        edificio: sala.edificio,
        id_turno: Number(idTurnoSeleccionado),
        ci_responsable: ciResponsable,
        participantes,
      });
      setMensaje('Reserva creada correctamente.');
      setCompanerosTexto('');
    } catch (err) {
      console.error(err);
      setMensaje(err.message || 'Error al crear reserva.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <>
      <Navbar />

      <div style={{ padding: 24 }}>
        <h2>Crear reserva</h2>
        <p>Seleccioná la fecha, sala y turno, y agregá los compañeros que participan.</p>

        {mensaje && (
          <div
            style={{
              marginTop: 12,
              marginBottom: 12,
              padding: 10,
              borderRadius: 4,
              backgroundColor: '#eef',
            }}
          >
            {mensaje}
          </div>
        )}

        
        <form onSubmit={handleSubmit}>
          <table
            style={{
              borderCollapse: 'collapse',
              width: '100%',
              marginTop: 16,
            }}
          >
            <tbody>
              <tr>
                <th style={{ border: '1px solid #ccc', padding: 8, width: '200px', textAlign: 'left' }}>
                  Fecha
                </th>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>
                  <input
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    style={{ width: '100%', padding: 6 }}
                  />
                </td>
              </tr>

              <tr>
                <th style={{ border: '1px solid #ccc', padding: 8 }}>CI responsable</th>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>
                  <input
                    type="text"
                    value={ciResponsable}
                    onChange={(e) => setCiResponsable(e.target.value)}
                    style={{ width: '100%', padding: 6 }}
                  />
                </td>
              </tr>

              <tr>
                <th style={{ border: '1px solid #ccc', padding: 8 }}>CIs de compañeros</th>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>
                  <textarea
                    value={companerosTexto}
                    onChange={(e) => setCompanerosTexto(e.target.value)}
                    rows={2}
                    style={{ width: '100%', padding: 6 }}
                    placeholder="Ej: 51234567, 49876543 43322111"
                  />
                  <div style={{ fontSize: 12, marginTop: 4, color: '#555' }}>
                    Separá las cédulas por coma o espacio.
                  </div>
                </td>
              </tr>

              <tr>
                <th style={{ border: '1px solid #ccc', padding: 8 }}>Sala</th>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>
                  <select
                    value={idSalaSeleccionada}
                    onChange={(e) => setIdSalaSeleccionada(e.target.value)}
                    style={{ width: '100%', padding: 6 }}
                  >
                    <option value="">Seleccione una sala</option>
                    {salas.map((s) => (
                      <option key={s.id_sala} value={s.id_sala}>
                        {s.edificio} - {s.nombre_sala} (cap. {s.capacidad})
                      </option>
                    ))}
                  </select>
                </td>
              </tr>

              <tr>
                <th style={{ border: '1px solid #ccc', padding: 8 }}>Turno</th>
                <td style={{ border: '1px solid #ccc', padding: 8 }}>
                  <select
                    value={idTurnoSeleccionado}
                    onChange={(e) => setIdTurnoSeleccionado(e.target.value)}
                    style={{ width: '100%', padding: 6 }}
                  >
                    <option value="">Seleccione un turno</option>
                    {turnos.map((t) => (
                      <option key={t.id_turno} value={t.id_turno}>
                        {formatHora(t.hora_inicio)} - {formatHora(t.hora_fin)}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            </tbody>
          </table>

          <div style={{ marginTop: 20 }}>
            <button
              type="submit"
              disabled={cargando}
              style={{
                padding: '8px 14px',
                borderRadius: 4,
                border: '1px solid #004b8d',
                backgroundColor: '#004b8d',
                color: 'white',
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              {cargando ? 'Creando...' : 'Crear reserva'}
            </button>
          </div>
        </form>

        
        <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={() => navigate('/')}
            style={{
              padding: '8px 14px',
              borderRadius: 4,
              border: '1px solid #004b8d',
              backgroundColor: 'white',
              color: '#004b8d',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            Volver al inicio
          </button>

          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/');
            }}
            style={{
              padding: '8px 14px',
              borderRadius: 4,
              border: '1px solid #dc3545',
              backgroundColor: '#dc3545',
              color: 'white',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </>
  );
}
