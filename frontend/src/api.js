// frontend/src/api.js

const API_URL = 'http://localhost:8000';

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Error en la API');
  }

  if (res.status === 204) {
    return null;
  }

  try {
    return await res.json();
  } catch {
    return null;
  }
}

export function apiGet(path) {
  return apiFetch(path);
}

export function apiPost(path, body) {
  return apiFetch(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function apiPut(path, body) {
  return apiFetch(path, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

// 🔹 Lo volvemos a exponer porque Reservas.jsx (y capaz otros) lo usan
export function apiPatch(path, body) {
  return apiFetch(path, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function apiDelete(path) {
  return apiFetch(path, {
    method: 'DELETE',
  });
}
