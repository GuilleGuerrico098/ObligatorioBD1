// api.js – capa única para TODO el frontend (alumno + admin)

const API_URL = "http://localhost:8000";

// ------------------ Helper genérico ------------------

async function request(path, options = {}) {
  const res = await fetch(API_URL + path, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const text = await res.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!res.ok) {
    const msg =
      data?.detail ||
      data?.error ||
      res.statusText ||
      "Error en la API";
    throw new Error(msg);
  }

  return data;
}

// ------------------ Login + usuario actual ------------------

export function login(correo, contrasena) {
  return request("/login", {
    method: "POST",
    body: JSON.stringify({ correo, contrasena }),
  });
}

// Estado local del usuario logueado (alumno o admin)
let usuarioActual = null;

export function setUsuarioActual(u) {
  usuarioActual = u;
}

export function getUsuarioActual() {
  return usuarioActual;
}

// ------------------ Salas (alumno + admin) ------------------

export function obtenerSalas() {
  return request("/salas");
}

// Alias para usar siempre listarSalas() en pantallas admin
export function listarSalas() {
  return obtenerSalas();
}

export function crearSala(payload) {
  // { nombre_sala, nombre_edificio, piso, capacidad, tipo }
  return request("/salas", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ------------------ Participantes (admin) ------------------

export function listarParticipantes() {
  return request("/participantes");
}

export function crearParticipante(payload) {
  // { ci, nombre, apellido, email, tipo: 'grado'|'posgrado'|'docente' }
  return request("/participantes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function borrarParticipante(ci) {
  return request(`/participantes/${encodeURIComponent(ci)}`, {
    method: "DELETE",
  });
}

// ------------------ Reservas alumno ------------------

export function crearReserva(payload) {
  // {
  //   fecha: 'YYYY-MM-DD',
  //   id_sala: number,
  //   hora_inicio: 'HH:MM',
  //   duracion_horas: number,
  //   ci_responsable: string,
  //   participantes_ci: string[]
  // }
  return request("/reservas", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function listarReservasPorCi(ci) {
  return request(`/mis-reservas/${encodeURIComponent(ci)}`);
}

// ------------------ Reservas admin ------------------

export function listarReservasAdmin() {
  return request("/reservas-admin");
}

// ------------------ Asistencia / sanciones auto ------------------

export function registrarAsistencia(idReserva, asistentesCi) {
  return request(`/reservas/${idReserva}/asistencia`, {
    method: "PUT",
    body: JSON.stringify({ asistentes: asistentesCi }),
  });
}

// ------------------ Sanciones (admin) ------------------

export function listarSanciones() {
  return request("/sanciones");
}

// La usamos desde CrearSancionAdmin(ci, motivo, dias?)
export function crearSancion(ci, motivo, dias = 60) {
  return request("/sanciones", {
    method: "POST",
    body: JSON.stringify({ ci, motivo, dias }),
  });
}

export function borrarSancion(id) {
  return request(`/sanciones/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
