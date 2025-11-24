import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar.jsx';
import { apiGet, apiPost, apiPut, apiDelete } from '../../api.js';

export default function Participantes() {
  const [participantes, setParticipantes] = useState([]);
  const [ci, setCi] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [tipo, setTipo] = useState('grado');
  const [cargando, setCargando] = useState(false);
  const [editandoCi, setEditandoCi] = useState(null);
  const [error, setError] = useState('');

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

  const cargarParticipantes = async () => {
    try {
      const data = await apiGet('/participantes');
      setParticipantes(data || []);
    } catch (e) {
      console.error(e);
      setError('Error al obtener participantes');
    }
  };

  useEffect(() => {
    cargarParticipantes();
  }, []);

  const limpiarFormulario = () => {
    setCi('');
    setNombre('');
    setApellido('');
    setEmail('');
    setTipo('grado');
    setEditandoCi(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!ci && !editandoCi) {
      setError('La CI es obligatoria');
      return;
    }
    if (!nombre || !apellido || !email) {
      setError('Todos los campos son obligatorios');
      return;
    }

    setCargando(true);
    try {
      if (editandoCi) {
        await apiPut(`/participantes/${encodeURIComponent(editandoCi)}`, {
          nombre,
          apellido,
          email,
          tipo,
        });
      } else {
        await apiPost('/participantes', {
          ci,
          nombre,
          apellido,
          email,
          tipo,
        });
      }

      await cargarParticipantes();
      limpiarFormulario();
    } catch (e) {
      console.error(e);
      alert(e.message);
    } finally {
      setCargando(false);
    }
  };

  const comenzarEdicion = (p) => {
    setEditandoCi(p.ci);
    setCi(p.ci);
    setNombre(p.nombre);
    setApellido(p.apellido);
    setEmail(p.email);
    setTipo(p.tipo || 'grado');
    setError('');
  };

  const cancelarEdicion = () => {
    limpiarFormulario();
  };

  const eliminarParticipante = async (ciParticipante) => {
    const ok = window.confirm(
      `¿Seguro que querés eliminar al participante con CI ${ciParticipante}?`
    );
    if (!ok) return;

    try {
      await apiDelete(`/participantes/${encodeURIComponent(ciParticipante)}`);
      await cargarParticipantes();
    } catch (e) {
      console.error(e);
      alert(e.message);
    }
  };

  return (
    <>
      <Navbar />
      <div className="card">
        <div style={{ marginBottom: 12 }}>
          <h2 className="page-title">ABM de participantes</h2>
          <p className="page-subtitle">
            Alta, baja y modificación de usuarios habilitados a reservar salas.
          </p>
        </div>

        {error && <div className="alert">{error}</div>}

        <div className="card-grid">
          <div>
            <h3 className="card-section-title">
              {editandoCi ? 'Modificar participante' : 'Nuevo participante'}
            </h3>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 10 }}>
                <label>CI</label>
                <input
                  type="text"
                  value={ci}
                  onChange={(e) => setCi(e.target.value)}
                  disabled={!!editandoCi}
                />
              </div>

              <div style={{ marginBottom: 10 }}>
                <label>Nombre</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </div>

              <div style={{ marginBottom: 10 }}>
                <label>Apellido</label>
                <input
                  type="text"
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                />
              </div>

              <div style={{ marginBottom: 10 }}>
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label>Tipo</label>
                <select
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                >
                  <option value="grado">Alumno de grado</option>
                  <option value="posgrado">Alumno de posgrado</option>
                  <option value="docente">Docente</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="submit"
                  disabled={cargando}
                  style={botonPrimario}
                >
                  {cargando
                    ? 'Guardando...'
                    : editandoCi
                    ? 'Guardar cambios'
                    : 'Agregar participante'}
                </button>

                {editandoCi && (
                  <button
                    type="button"
                    onClick={cancelarEdicion}
                    style={botonOutline}
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>

          <div>
            <h3 className="card-section-title">Listado de participantes</h3>
            {participantes.length === 0 ? (
              <p>No hay participantes cargados.</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>CI</th>
                    <th>Nombre</th>
                    <th>Apellido</th>
                    <th>Email</th>
                    <th>Tipo</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {participantes.map((p) => (
                    <tr key={p.ci}>
                      <td>{p.ci}</td>
                      <td>{p.nombre}</td>
                      <td>{p.apellido}</td>
                      <td>{p.email}</td>
                      <td>{p.tipo}</td>
                      <td>
                        <button
                          type="button"
                          onClick={() => comenzarEdicion(p)}
                          style={{ ...botonPrimario, padding: '6px 10px', marginRight: 8 }}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => eliminarParticipante(p.ci)}
                          style={botonDanger}
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
        </div>
      </div>
    </>
  );
}
