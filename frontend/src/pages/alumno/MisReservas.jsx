import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar.jsx';
import { apiGet } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

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

export default function MisReservas() {
  const { user, logout } = useAuth();
  const [reservas, setReservas] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    async function cargar() {
      try {
        const data = await apiGet(
          `/reservas/mias?ci=${encodeURIComponent(user.ci)}`
        );
        setReservas(data || []);
      } catch (e) {
        console.error(e);
        setMensaje('Error al cargar reservas');
      }
    }

    cargar();
  }, [user]);

  if (!user) {
    return <p>Debe iniciar sesión.</p>;
  }

  return (
    <>
      <Navbar />
      <div style={{ padding: 24 }}>
        <h2>Mis reservas</h2>
        <p>Listado de las reservas donde sos responsable o participante.</p>

        {mensaje && (
          <div
            style={{
              marginTop: 12,
              marginBottom: 12,
              padding: 10,
              borderRadius: 4,
              backgroundColor: '#fee',
            }}
          >
            {mensaje}
          </div>
        )}

        {reservas.length === 0 ? (
          <p>No tiene reservas registradas.</p>
        ) : (
          <table
            style={{
              borderCollapse: 'collapse',
              width: '100%',
              marginTop: 16,
            }}
          >
            <thead>
              <tr>
                <th style={{ border: '1px solid #ccc', padding: 8 }}>Fecha</th>
                <th style={{ border: '1px solid #ccc', padding: 8 }}>Sala</th>
                <th style={{ border: '1px solid #ccc', padding: 8 }}>Edificio</th>
                <th style={{ border: '1px solid #ccc', padding: 8 }}>Horario</th>
                <th style={{ border: '1px solid #ccc', padding: 8 }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {reservas.map((r) => (
                <tr key={r.id_reserva}>
                  <td style={{ border: '1px solid #ccc', padding: 8 }}>{r.fecha}</td>
                  <td style={{ border: '1px solid #ccc', padding: 8 }}>{r.nombre_sala}</td>
                  <td style={{ border: '1px solid #ccc', padding: 8 }}>{r.edificio}</td>
                  <td style={{ border: '1px solid #ccc', padding: 8 }}>
                    {formatHora(r.hora_inicio)} - {formatHora(r.hora_fin)}
                  </td>
                  <td style={{ border: '1px solid #ccc', padding: 8 }}>{r.estado}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div
          style={{
            marginTop: 20,
            display: 'flex',
            gap: 10,
          }}
        >
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
