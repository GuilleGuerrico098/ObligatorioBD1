import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { apiPost } from '../api.js';

export default function Login() {
  const { login } = useAuth();
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [cargando, setCargando] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setCargando(true);
    setErrorMsg('');

    try {
      const data = await apiPost('/login', {
        correo: correo.trim(),
        contrasena,
      });

      // Backend devuelve: { correo, nombre, ci, es_admin }
      if (!data || !data.correo) {
        throw new Error('Respuesta inesperada del servidor');
      }

      // Guarda el usuario en el contexto
      login(data);

      // Si tenés routing, acá podés redirigir según es_admin
      // por ejemplo:
      // if (data.es_admin) navigate('/admin');
      // else navigate('/alumno');

    } catch (err) {
      setErrorMsg(err.message || 'Error al iniciar sesión');
    } finally {
      setCargando(false);
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
      }}
    >
      <div
        style={{
          width: 360,
          padding: 24,
          borderRadius: 8,
          backgroundColor: 'white',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        }}
      >
        <h2 style={{ marginBottom: 20, textAlign: 'center' }}>
          Ingreso al sistema
        </h2>

        {errorMsg && (
          <div
            style={{
              backgroundColor: '#ffdddd',
              padding: 10,
              borderRadius: 4,
              color: '#a00',
              marginBottom: 15,
              textAlign: 'center',
              border: '1px solid #ddaaaa',
            }}
          >
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4 }}>Correo</label>
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
              style={{
                width: '100%',
                padding: 8,
                borderRadius: 4,
                border: '1px solid #ccc',
              }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4 }}>
              Contraseña
            </label>
            <input
              type="password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              required
              style={{
                width: '100%',
                padding: 8,
                borderRadius: 4,
                border: '1px solid #ccc',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            style={{
              width: '100%',
              padding: 10,
              borderRadius: 4,
              border: 'none',
              backgroundColor: '#004b8d',
              color: 'white',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            {cargando ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}
