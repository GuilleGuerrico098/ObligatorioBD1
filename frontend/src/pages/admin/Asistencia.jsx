import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar.jsx';
import { apiGet, apiPost } from '../../api';

export default function Asistencia() {
  const { id } = useParams();
  const [lista, setLista] = useState([]);
  const [presentes, setPresentes] = useState(new Set());
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    async function cargar() {
      try {
        const datos = await apiGet(`/reservas/${id}/participantes`);
        setLista(datos || []);
      } catch (e) {
        console.error(e);
        setMensaje('Error obteniendo participantes');
      }
    }
    cargar();
  }, [id]);

  const togglePresente = (ci) => {
    const copia = new Set(presentes);
    copia.has(ci) ? copia.delete(ci) : copia.add(ci);
    setPresentes(copia);
  };

  const guardar = async () => {
    setMensaje("");

    try {
      await apiPost(`/reservas/${id}/asistencia`, {
        presentes: Array.from(presentes),
      });

      setMensaje("✔️ Asistencia guardada correctamente.");

      // desaparecer mensaje a los 3 segundos
      setTimeout(() => setMensaje(""), 3000);

    } catch (e) {
      console.error(e);
      setMensaje("❌ Error guardando asistencia");
    }
  };

  return (
    <>
      <Navbar />
      <div className="card" style={{ maxWidth: 600 }}>
        <h2>Asistencia reserva #{id}</h2>

        {mensaje && (
          <div className="alert" style={{ marginBottom: 12 }}>
            {mensaje}
          </div>
        )}

        {lista.length === 0 ? (
          <p>No hay participantes cargados.</p>
        ) : (
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
              {lista.map((p) => (
                <tr key={p.ci_participante}>
                  <td>{p.ci_participante}</td>
                  <td>{p.nombre}</td>
                  <td>{p.apellido}</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={presentes.has(p.ci_participante)}
                      onChange={() => togglePresente(p.ci_participante)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <button
          onClick={guardar}
          className="btn-primary"
          style={{ marginTop: 12 }}
        >
          Guardar asistencia
        </button>
      </div>
    </>
  );
}
