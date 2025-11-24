import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar.jsx';
import { apiGet, apiPost, apiPut, apiDelete } from '../../api.js';

export default function Salas() {
  const [salas, setSalas] = useState([]);

  const [nombreSala, setNombreSala] = useState('');
  const [edificio, setEdificio] = useState('');
  const [capacidad, setCapacidad] = useState('');
  const [tipoSala, setTipoSala] = useState('libre');

  const [editando, setEditando] = useState(null);
  const [cargando, setCargando] = useState(false);
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

  const cargarSalas = async () => {
    try {
      const data = await apiGet('/salas');
      setSalas(data || []);
    } catch (e) {
      console.error(e);
      setError('Error al obtener salas');
    }
  };

  useEffect(() => {
    cargarSalas();
  }, []);

  const limpiarFormulario = () => {
    setNombreSala('');
    setEdificio('');
    setCapacidad('');
    setTipoSala('libre');
    setEditando(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!nombreSala || !edificio || !capacidad) {
      setError('Todos los campos son obligatorios');
      return;
    }

    const capNum = Number(capacidad);
    if (Number.isNaN(capNum) || capNum <= 0) {
      setError('La capacidad debe ser un número mayor a 0');
      return;
    }

    setCargando(true);
    try {
      if (editando) {
        await apiPut('/salas/actualizar', {
          nombre_sala: nombreSala,
          edificio,
          capacidad: capNum,
          tipo_sala: tipoSala,
        });
      } else {
        await apiPost('/salas', {
          nombre_sala: nombreSala,
          edificio,
          capacidad: capNum,
          tipo_sala: tipoSala,
        });
      }

      await cargarSalas();
      limpiarFormulario();
    } catch (e) {
      console.error(e);
      alert(e.message);
    } finally {
      setCargando(false);
    }
  };

  const comenzarEdicion = (s) => {
    setEditando({ nombre_sala: s.nombre_sala, edificio: s.edificio });
    setNombreSala(s.nombre_sala);
    setEdificio(s.edificio);
    setCapacidad(String(s.capacidad));
    setTipoSala(s.tipo_sala || 'libre');
    setError('');
  };

  const cancelarEdicion = () => {
    limpiarFormulario();
  };

  const eliminarSala = async (sala) => {
    const ok = window.confirm(
      `¿Seguro que querés eliminar la sala "${sala.nombre_sala}"?`
    );
    if (!ok) return;

    try {
      await apiDelete(
        `/salas/${encodeURIComponent(sala.nombre_sala)}/${encodeURIComponent(
          sala.edificio
        )}`
      );
      await cargarSalas();
    } catch (e) {
      console.error(e);
      alert(e.message);
    }
  };

  return (
    <>
      <Navbar />
      <div className="card">
        <h2>ABM de salas</h2>

        {error && <div className="alert">{error}</div>}

        <h3>{editando ? 'Modificar sala' : 'Nueva sala'}</h3>

        <form onSubmit={handleSubmit} style={{ maxWidth: 520 }}>
          <div style={{ marginBottom: 10 }}>
            <label>Nombre de sala</label>
            <input
              type="text"
              value={nombreSala}
              onChange={(e) => setNombreSala(e.target.value)}
              disabled={!!editando}
            />
          </div>

          <div style={{ marginBottom: 10 }}>
            <label>Edificio</label>
            <input
              type="text"
              value={edificio}
              onChange={(e) => setEdificio(e.target.value)}
              disabled={!!editando}
            />
          </div>

          <div style={{ marginBottom: 10 }}>
            <label>Capacidad</label>
            <input
              type="number"
              min="1"
              value={capacidad}
              onChange={(e) => setCapacidad(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label>Tipo de sala</label>
            <select
              value={tipoSala}
              onChange={(e) => setTipoSala(e.target.value)}
            >
              <option value="libre">Uso libre</option>
              <option value="posgrado">Exclusiva posgrado</option>
              <option value="docente">Exclusiva docentes</option>
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
                : editando
                ? 'Guardar cambios'
                : 'Agregar sala'}
            </button>

            {editando && (
              <button
                type="button"
                style={botonOutline}
                onClick={cancelarEdicion}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card">
        <h3>Listado de salas</h3>
        {salas.length === 0 ? (
          <p>No hay salas cargadas.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Sala</th>
                <th>Edificio</th>
                <th>Capacidad</th>
                <th>Tipo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {salas.map((s) => (
                <tr key={`${s.nombre_sala}-${s.edificio}`}>
                  <td>{s.nombre_sala}</td>
                  <td>{s.edificio}</td>
                  <td>{s.capacidad}</td>
                  <td>{s.tipo_sala}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => comenzarEdicion(s)}
                      style={{ ...botonPrimario, padding: '6px 10px', marginRight: 8 }}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => eliminarSala(s)}
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
    </>
  );
}
