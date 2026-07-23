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