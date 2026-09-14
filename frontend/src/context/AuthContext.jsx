import { createContext, useContext, useEffect, useState } from 'react';
import * as api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const token = api.getToken();

    if (!token) {
      setCarregando(false);
      return;
    }

    api.getMe()
      .then((dados) => setUsuario(dados))
      .catch(() => api.clearToken())
      .finally(() => setCarregando(false));
  }, []);

  async function entrar(cpf, senha) {
    const { token, usuario: dados } = await api.login(cpf, senha);
    api.setToken(token);
    setUsuario(dados);
  }

  function sair() {
    api.clearToken();
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, carregando, entrar, sair }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
