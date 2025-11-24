// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';

import Login from './pages/Login.jsx';

import AlumnoHome from './pages/alumno/AlumnoHome.jsx';
import CrearReserva from './pages/alumno/CrearReserva.jsx';
import MisReservas from './pages/alumno/MisReservas.jsx';

import AdminHome from './pages/admin/AdminHome.jsx';
import Participantes from './pages/admin/Participantes.jsx';
import Salas from './pages/admin/Salas.jsx';
import Reservas from './pages/admin/Reservas.jsx';
import Sanciones from './pages/admin/Sanciones.jsx';
import Asistencia from './pages/admin/Asistencia.jsx';
import Reportes from './pages/admin/Reportes.jsx'; // 👈 nuevo import

export default function App() {
  const { user } = useAuth();

  // Si no hay usuario logueado, mostramos solo el login
  if (!user) {
    return <Login />;
  }

  // Rutas para ADMIN
  if (user.es_admin) {
    return (
      <Routes>
        <Route path="/" element={<AdminHome />} />
        <Route path="/participantes" element={<Participantes />} />
        <Route path="/salas" element={<Salas />} />
        <Route path="/reservas" element={<Reservas />} />
        <Route path="/sanciones" element={<Sanciones />} />
        <Route path="/asistencia/:id" element={<Asistencia />} />
        <Route path="/reportes" element={<Reportes />} /> {/* ruta nueva */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    );
  }

  // Rutas para ALUMNO
  return (
    <Routes>
      <Route path="/" element={<AlumnoHome />} />
      <Route path="/crear-reserva" element={<CrearReserva />} />
      <Route path="/mis-reservas" element={<MisReservas />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
