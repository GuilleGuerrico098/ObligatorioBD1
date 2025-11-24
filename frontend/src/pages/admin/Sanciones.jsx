// frontend/src/pages/admin/Sanciones.jsx
import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar.jsx';
import { apiGet, apiPost, apiDelete } from '../../api';
import { useAuth } from '../../context/AuthContext';

export default function Sanciones() {
  const { user } = useAuth();

  const [sanciones, setSanciones] = useState([]);
  const [ci, setCi] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [motivo, setMotivo] = useState('');
  const [idReserva, setIdReserva] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

  async function cargarSanciones() {
    try {
      const data = await apiGet('/sanciones');
      setSanciones(data || []);
    } catch (e) {
      console.error(e);
      setMensaje('Error al obtener sanciones.');
    }
  }

  useEffect(() => {
    cargarSanciones();
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

  async function handleSubmit(e) {
    e.preventDefault();
    setMensaje('');

    if (!ci || !fechaInicio || !fechaFin || !motivo) {
      setMensaje('CI, fechas y motivo son obligatorios.');
      return;
    }

    const body = {
      ci_participante: ci,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      motivo,
      id_reserva: idReserva ? Number(idReserva) : null,
    };

    setCargando(true);
    try {
      await apiPost('/sanciones', body);
      setMensaje('Sanción creada correctamente.');
      setCi('');
      setFechaInicio('');
      setFechaFin('');
      setMotivo('');
      setIdReserva('');
      await cargarSanciones();
    } catch (err) {
      console.error(err);
      setMensaje(err.message || 'Error al crear sanción.');
    } finally {
      setCargando(false);
    }
  }

  async function eliminarSancion(id) {
    const ok = window.confirm(
      `¿Seguro que querés eliminar la sanción #${id}?`
    );
    if (!ok) return;

    try {
      await apiDelete(`/sanciones/${id}`);
      await cargarSanciones();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Error al eliminar sanción.');
    }
  }

  return (
    <>
      <Navbar />
      <div className="card">
        <h2>Sanciones</h2>
        <p>Alta, baja y modificación de sanciones aplicadas a participantes.</p>

        {mensaje && <div className="alert">{mensaje}</div>}

        <h3>Nueva sanción</h3>
        <form onSubmit={handleSubmit} style={{ maxWidth: 520 }}>
          <div style={{ marginBottom: 10 }}>
            <label>CI participante</label>
            <input
              type="text"
              value={ci}
              onChange={(e) => setCi(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: 10 }}>
            <label>Fecha inicio</label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: 10 }}>
            <label>Fecha fin</label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: 10 }}>
            <label>Motivo</label>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              rows={2}
              placeholder="Ej: No se presentó a la reserva del día..."
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label>ID reserva (opcional)</label>
            <input
              type="number"
              min="1"
              value={idReserva}
              onChange={(e) => setIdReserva(e.target.value)}
              placeholder="ID de la reserva asociada"
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="btn-primary"
          >
            {cargando ? 'Guardando...' : 'Guardar sanción'}
          </button>
        </form>
      </div>

      <div className="card">
        <h3>Listado de sanciones</h3>
        {sanciones.length === 0 ? (
          <p>No hay sanciones registradas.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>CI participante</th>
                <th>Fecha inicio</th>
                <th>Fecha fin</th>
                <th>Motivo</th>
                <th>ID reserva</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sanciones.map((s) => (
                <tr key={s.id_sancion}>
                  <td>{s.id_sancion}</td>
                  <td>{s.ci_participante}</td>
                  <td>{s.fecha_inicio}</td>
                  <td>{s.fecha_fin}</td>
                  <td>{s.motivo}</td>
                  <td>{s.id_reserva || '-'}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => eliminarSancion(s.id_sancion)}
                      className="btn-danger"
                      style={{ padding: '6px 10px' }}
                    >
                      Borrar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
