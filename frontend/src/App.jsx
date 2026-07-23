import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginAdmin from "./pages/LoginAdmin";
import RecuperarSenha from "./pages/RecuperarSenha";
import RedefinirSenha from "./pages/RedefinirSenha";
import LoginUsuario from "./pages/LoginUsuario";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginAdmin />} /> {/* Login do Admin/Developer*/}
        <Route path="/recuperar-senha" element={<RecuperarSenha />} />
        <Route path="/redefinir-senha/:token" element={<RedefinirSenha />} />
        <Route path="/acesso" element={<LoginUsuario />} /> {/* Login do usuário/enfermeiro */}
      </Routes>
    </BrowserRouter>
  );
}
