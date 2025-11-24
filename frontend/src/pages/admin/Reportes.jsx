import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar.jsx';
import { apiGet } from '../../api';
import { useAuth } from '../../context/AuthContext';

export default function Reportes() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    async function cargar() {
      setCargando(true);
      setMensaje('');
      try {
        const resp = await apiGet('/reportes/resumen');
        setData(resp);
      } catch (e) {
        console.error(e);
        setMensaje(e.message || 'Error al cargar reportes');
      } finally {
        setCargando(false);
      }
    }
    cargar();
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

  if (cargando && !data) {
    return (
      <>
        <Navbar />
        <div className="card">
          <p>Cargando reportes...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="card">
        <h2>Reportes y estadísticas</h2>
        {mensaje && <div className="alert">{mensaje}</div>}

        {!data && !cargando && (
          <p>No hay datos de reportes disponibles.</p>
        )}

        {data && (
          <>
            {/* 1) Salas más reservadas */}
            <section style={{ marginTop: 16 }}>
              <h3>Salas más reservadas</h3>
              {data.salas_mas_reservadas.length === 0 ? (
                <p>No hay reservas registradas.</p>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Sala</th>
                      <th>Edificio</th>
                      <th>Cantidad de reservas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.salas_mas_reservadas.map((s) => (
                      <tr key={s.id_sala}>
                        <td>{s.nombre_sala}</td>
                        <td>{s.edificio}</td>
                        <td>{s.cantidad_reservas}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>

            {/* 2) Turnos más demandados */}
            <section style={{ marginTop: 16 }}>
              <h3>Turnos más demandados</h3>
              {data.turnos_mas_demandados.length === 0 ? (
                <p>No hay reservas registradas.</p>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Turno</th>
                      <th>Cantidad de reservas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.turnos_mas_demandados.map((t) => (
                      <tr key={t.id_turno}>
                        <td>
                          {String(t.hora_inicio).slice(0, 5)} -{' '}
                          {String(t.hora_fin).slice(0, 5)}
                        </td>
                        <td>{t.cantidad_reservas}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>

            {/* 3) Promedio de participantes por sala */}
            <section style={{ marginTop: 16 }}>
              <h3>Promedio de participantes por sala</h3>
              {data.promedio_participantes_por_sala.length === 0 ? (
                <p>No hay datos.</p>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Sala</th>
                      <th>Edificio</th>
                      <th>Promedio de participantes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.promedio_participantes_por_sala.map((s) => (
                      <tr key={s.id_sala}>
                        <td>{s.nombre_sala}</td>
                        <td>{s.edificio}</td>
                        <td>{Number(s.promedio_participantes).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>

            {/* 4) Reservas por carrera y facultad */}
            <section style={{ marginTop: 16 }}>
              <h3>Cantidad de reservas por carrera y facultad</h3>
              {data.reservas_por_carrera_facultad.length === 0 ? (
                <p>No hay datos.</p>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Facultad</th>
                      <th>Carrera</th>
                      <th>Reservas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.reservas_por_carrera_facultad.map((r, idx) => (
                      <tr key={idx}>
                        <td>{r.facultad}</td>
                        <td>{r.carrera}</td>
                        <td>{r.cantidad_reservas}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>

            {/* 5) Ocupación por edificio */}
            <section style={{ marginTop: 16 }}>
              <h3>Porcentaje de ocupación de salas por edificio</h3>
              {data.ocupacion_por_edificio.length === 0 ? (
                <p>No hay datos.</p>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Edificio</th>
                      <th>Reservas</th>
                      <th>Capacidad total (slots)</th>
                      <th>Participantes totales</th>
                      <th>% Ocupación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.ocupacion_por_edificio.map((e, idx) => (
                      <tr key={idx}>
                        <td>{e.edificio}</td>
                        <td>{e.reservas}</td>
                        <td>{e.capacidad_total}</td>
                        <td>{e.participantes_totales}</td>
                        <td>{e.porcentaje_ocupacion}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>

            {/* 6) Reservas y asistencias por tipo */}
            <section style={{ marginTop: 16 }}>
              <h3>Reservas y asistencias por tipo de participante</h3>
              {data.reservas_y_asistencias_por_tipo.length === 0 ? (
                <p>No hay datos.</p>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Tipo</th>
                      <th>Reservas</th>
                      <th>Asistencias</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.reservas_y_asistencias_por_tipo.map((r, idx) => (
                      <tr key={idx}>
                        <td>{r.tipo}</td>
                        <td>{r.reservas}</td>
                        <td>{r.asistencias}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>

            {/* 7) Sanciones por tipo */}
            <section style={{ marginTop: 16 }}>
              <h3>Cantidad de sanciones por tipo de participante</h3>
              {data.sanciones_por_tipo.length === 0 ? (
                <p>No hay datos.</p>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Tipo</th>
                      <th>Sanciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.sanciones_por_tipo.map((s, idx) => (
                      <tr key={idx}>
                        <td>{s.tipo}</td>
                        <td>{s.sanciones}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>

            {/* 8) Uso de reservas */}
            <section style={{ marginTop: 16 }}>
              <h3>Uso de reservas</h3>
              <table className="table">
                <tbody>
                  <tr>
                    <td>Total reservas</td>
                    <td>{data.uso_reservas.total_reservas}</td>
                  </tr>
                  <tr>
                    <td>Usadas (con asistencia)</td>
                    <td>
                      {data.uso_reservas.usadas} (
                      {data.uso_reservas.porcentaje_usadas}%)
                    </td>
                  </tr>
                  <tr>
                    <td>Canceladas</td>
                    <td>
                      {data.uso_reservas.canceladas} (
                      {data.uso_reservas.porcentaje_canceladas}%)
                    </td>
                  </tr>
                  <tr>
                    <td>Sin asistencia</td>
                    <td>
                      {data.uso_reservas.sin_asistencia} (
                      {data.uso_reservas.porcentaje_sin_asistencia}%)
                    </td>
                  </tr>
                </tbody>
              </table>
            </section>

            {/* 9) Top participantes */}
            <section style={{ marginTop: 16 }}>
              <h3>Top 5 participantes con más reservas</h3>
              {data.top_participantes.length === 0 ? (
                <p>No hay datos.</p>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>CI</th>
                      <th>Nombre</th>
                      <th>Apellido</th>
                      <th>Tipo</th>
                      <th>Cantidad de reservas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.top_participantes.map((p) => (
                      <tr key={p.ci}>
                        <td>{p.ci}</td>
                        <td>{p.nombre}</td>
                        <td>{p.apellido}</td>
                        <td>{p.tipo}</td>
                        <td>{p.cantidad_reservas}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>

            {/* 10) Reservas por tipo de sala */}
            <section style={{ marginTop: 16 }}>
              <h3>Reservas por tipo de sala</h3>
              {data.reservas_por_tipo_sala.length === 0 ? (
                <p>No hay datos.</p>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Tipo de sala</th>
                      <th>Cantidad de reservas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.reservas_por_tipo_sala.map((r, idx) => (
                      <tr key={idx}>
                        <td>{r.tipo_sala}</td>
                        <td>{r.cantidad_reservas}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>

            {/* 11) Reservas por día de la semana */}
            <section style={{ marginTop: 16 }}>
              <h3>Reservas por día de la semana</h3>
              {data.reservas_por_dia_semana.length === 0 ? (
                <p>No hay datos.</p>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Día</th>
                      <th>Cantidad de reservas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.reservas_por_dia_semana.map((r, idx) => (
                      <tr key={idx}>
                        <td>{r.nombre_dia}</td>
                        <td>{r.cantidad_reservas}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          </>
        )}
      </div>
    </>
  );
}
