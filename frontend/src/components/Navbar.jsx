import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 20px',
        backgroundColor: '#004b8d',
        color: 'white',
        marginBottom: 20,
      }}
    >
      <div>
        <strong>Salas UCU</strong>
        {user && (
          <span style={{ marginLeft: 15, fontSize: 14 }}>
            ({user.es_admin ? 'Admin' : 'Alumno'} - {user.nombre || user.correo})
          </span>
        )}
      </div>

      <nav style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
          Inicio
        </Link>

        {/* Link a reportes solo para admin */}
        {user?.es_admin && (
          <Link to="/reportes" style={{ color: 'white', textDecoration: 'none' }}>
            Reportes
          </Link>
        )}

        <button
          onClick={handleLogout}
          style={{
            padding: '4px 10px',
            borderRadius: 4,
            border: 'none',
            backgroundColor: 'white',
            color: '#004b8d',
            cursor: 'pointer',
            fontSize: 14,
          }}
        >
          Cerrar sesión
        </button>
      </nav>
    </header>
  );
}
