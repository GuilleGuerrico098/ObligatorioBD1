import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar.jsx';

export default function AlumnoHome() {
  return (
    <>
      <Navbar />
      <div className="page">
        <div className="page-header">
          <h1 className="page-title">Panel del alumno</h1>
          <p className="page-subtitle">
            Desde aquí podés crear y consultar tus reservas de salas de estudio.
          </p>
        </div>

        <div className="card-grid">
          <div className="card">
            <h3 className="card-section-title">Crear nueva reserva</h3>
            <p className="page-subtitle">
              Elegí fecha, sala y turno, y agregá las cédulas de tus compañeros.
            </p>
            <Link to="/crear-reserva" className="btn-primary">
              Ir a crear reserva
            </Link>
          </div>

          <div className="card">
            <h3 className="card-section-title">Ver mis reservas</h3>
            <p className="page-subtitle">
              Consultá tus reservas activas, canceladas y pasadas.
            </p>
            <Link to="/mis-reservas" className="btn-outline">
              Ver mis reservas
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
