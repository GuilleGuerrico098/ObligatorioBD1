import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar.jsx';

export default function AdminHome() {
  return (
    <>
      <Navbar />
      <div className="page">
        <div className="page-header">
          <h1 className="page-title">Panel administrativo</h1>
          <p className="page-subtitle">
            Gestión de participantes, salas, reservas y sanciones.
          </p>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0, marginBottom: 16 }}>Módulos disponibles</h3>

          <div className="card-grid">
            <Link
              to="/participantes"
              style={{
                display: 'block',
                padding: 16,
                borderRadius: 8,
                border: '1px solid #e0e0e0',
                backgroundColor: '#f9fafb',
                textDecoration: 'none',
                color: '#004b8d',
                fontWeight: 500,
                boxShadow: '0 1px 3px rgba(15,23,42,0.08)',
              }}
            >
              <div style={{ fontSize: 16, marginBottom: 4 }}>ABM Participantes</div>
              <div style={{ fontSize: 13, color: '#555' }}>
                Altas, bajas y modificaciones de usuarios habilitados.
              </div>
            </Link>

            <Link
              to="/salas"
              style={{
                display: 'block',
                padding: 16,
                borderRadius: 8,
                border: '1px solid #e0e0e0',
                backgroundColor: '#f9fafb',
                textDecoration: 'none',
                color: '#004b8d',
                fontWeight: 500,
                boxShadow: '0 1px 3px rgba(15,23,42,0.08)',
              }}
            >
              <div style={{ fontSize: 16, marginBottom: 4 }}>ABM Salas</div>
              <div style={{ fontSize: 13, color: '#555' }}>
                Definí salas, edificios, capacidades y tipo de uso.
              </div>
            </Link>

            <Link
              to="/reservas"
              style={{
                display: 'block',
                padding: 16,
                borderRadius: 8,
                border: '1px solid #e0e0e0',
                backgroundColor: '#f9fafb',
                textDecoration: 'none',
                color: '#004b8d',
                fontWeight: 500,
                boxShadow: '0 1px 3px rgba(15,23,42,0.08)',
              }}
            >
              <div style={{ fontSize: 16, marginBottom: 4 }}>ABM Reservas</div>
              <div style={{ fontSize: 13, color: '#555' }}>
                Revisá, modificá o cancelá reservas existentes.
              </div>
            </Link>

            <Link
              to="/sanciones"
              style={{
                display: 'block',
                padding: 16,
                borderRadius: 8,
                border: '1px solid #e0e0e0',
                backgroundColor: '#f9fafb',
                textDecoration: 'none',
                color: '#004b8d',
                fontWeight: 500,
                boxShadow: '0 1px 3px rgba(15,23,42,0.08)',
              }}
            >
              <div style={{ fontSize: 16, marginBottom: 4 }}>ABM Sanciones</div>
              <div style={{ fontSize: 13, color: '#555' }}>
                Consultá y administrá sanciones de participantes.
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
