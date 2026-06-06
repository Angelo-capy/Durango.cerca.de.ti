/**
 * Capa de servicios — acceso a la API del backend.
 * Cambia VITE_API_URL en .env para apuntar a producción.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ────────────────────────────────────────────────
// Utilidad base
// ────────────────────────────────────────────────

async function request(path, options = {}) {
  const token = localStorage.getItem('jwt');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    // Intenta leer el mensaje de error del backend
    let mensaje = 'Error de servidor. Intenta de nuevo.';
    try {
      const data = await res.json();
      mensaje = data.mensaje || data.message || mensaje;
    } catch (_) {
      // noop
    }
    const error = new Error(mensaje);
    error.status = res.status;
    throw error;
  }

  // 204 No Content — sin cuerpo
  if (res.status === 204) return null;

  return res.json();
}

// ────────────────────────────────────────────────
// Comercios
// ────────────────────────────────────────────────

/** Obtiene la lista completa de comercios. */
export async function getComerciosList() {
  return request('/api/comercios');
}

/** Obtiene la ficha de un comercio por ID. */
export async function getComercio(id) {
  return request(`/api/comercios/${id}`);
}

/** Crea un nuevo comercio (requiere auth). */
export async function crearComercio(data) {
  return request('/api/comercios', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/** Edita un comercio existente (requiere auth). */
export async function editarComercio(id, data) {
  return request(`/api/comercios/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/** Elimina un comercio (requiere auth). */
export async function eliminarComercio(id) {
  return request(`/api/comercios/${id}`, { method: 'DELETE' });
}

// ────────────────────────────────────────────────
// Subida de imágenes
// ────────────────────────────────────────────────

/**
 * Sube una imagen al backend y devuelve la URL pública.
 * @param {File} archivo
 * @returns {Promise<{ url: string }>}
 */
export async function subirImagen(archivo) {
  const token = localStorage.getItem('jwt');
  const formData = new FormData();
  formData.append('imagen', archivo);

  const res = await fetch(`${BASE_URL}/api/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (!res.ok) {
    let mensaje = 'No pudimos subir la imagen.';
    try {
      const data = await res.json();
      mensaje = data.error || mensaje;
    } catch (_) {
      // noop
    }
    throw new Error(mensaje);
  }

  return res.json();
}

// ────────────────────────────────────────────────
// Chatbot Gemini
// ────────────────────────────────────────────────

/**
 * Envía una pregunta al chatbot.
 * @param {string} pregunta — texto del usuario
 * @param {{ lat: number, lng: number } | null} ubicacion
 */
export async function enviarChat(pregunta, ubicacion = null) {
  return request('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ query: pregunta, location: ubicacion }),
  });
}

// ────────────────────────────────────────────────
// Autenticación Google
// ────────────────────────────────────────────────

/**
 * Valida el credential de Google OAuth en el backend y recibe un JWT.
 * @param {string} credential — token de identidad de Google
 */
export async function loginGoogle(credential) {
  const data = await request('/api/auth/google', {
    method: 'POST',
    body: JSON.stringify({ token: credential }),
  });
  return data; // { token, usuario }
}
