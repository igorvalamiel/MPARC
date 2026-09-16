const API_URL = 'http://localhost:3000';
const TOKEN_KEY = 'mparc_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export async function login(cpf, senha) {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cpf, senha }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Erro ao efetuar login');
  }

  return data; // { token, usuario }
}

export async function getMe() {
  const token = getToken();

  const res = await fetch(`${API_URL}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Erro ao buscar usuário');
  }

  return data;
}

export async function getFluxogramas() {
  const token = getToken();

  const res = await fetch(`${API_URL}/fluxogramas`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Erro ao buscar fluxogramas');
  }

  return data;
}

export async function getFluxograma(id) {
  const token = getToken();

  const res = await fetch(`${API_URL}/fluxogramas/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Erro ao buscar fluxograma');
  }

  return data;
}