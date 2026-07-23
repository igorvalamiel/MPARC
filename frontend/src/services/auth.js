import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
});

export async function login(email, senha) {
  const response = await api.post("/auth/login", { email, senha });
  const { token } = response.data;
  localStorage.setItem("token", token);
  return response.data;
}

export function logout() {
  localStorage.removeItem("token");
}

export function getToken() {
  return localStorage.getItem("token");
}

// Função para solicitar recuperação de senha
export async function solicitarRecuperacaoSenha(email) {
  const response = await fetch('/api/recuperar-senha', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  
  if (!response.ok) {
    const error = new Error('Falha na solicitação');
    error.response = response;
    throw error;
  }
  
  return response.json();
}

// Função para redefinir a senha com o token
export async function redefinirSenha(token, novaSenha) {
  const response = await fetch('/api/redefinir-senha', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, novaSenha }),
  });
  
  if (!response.ok) {
    const error = new Error('Falha na redefinição');
    error.response = response;
    throw error;
  }
  
  return response.json();
}