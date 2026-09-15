import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Login from './pages/Login';
import Home from './pages/Home';
import Classificacoes from './pages/Classificacoes';
import NovaClassificacao from './pages/NovaClassificacao';
import Perfil from './pages/Perfil';


function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route
          path="/classificacoes"
          element={
            <ProtectedRoute>
              <Classificacoes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/classificacoes/nova"
          element={
            <ProtectedRoute>
              <NovaClassificacao />
            </ProtectedRoute>
          }
        />
        <Route
          path="/perfil"
          element={
            <ProtectedRoute>
              <Perfil />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;
