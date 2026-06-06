import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import MapaPage from './pages/MapaPage.jsx';
import ListadoPage from './pages/ListadoPage.jsx';
import FichaPage from './pages/FichaPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import EditarComercioPage from './pages/EditarComercioPage.jsx';
import PreviewPage from './pages/PreviewPage.jsx';
import { useAuth } from './context/AuthContext.jsx';

function RutaProtegida({ children }) {
  const { user, cargando } = useAuth();
  if (cargando) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 rounded-full border-4 border-navy-200 border-t-navy-700 animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<MapaPage />} />
        <Route path="comercios" element={<ListadoPage />} />
        <Route path="comercios/:id" element={<FichaPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route
          path="mi-comercio"
          element={<RutaProtegida><DashboardPage /></RutaProtegida>}
        />
        <Route
          path="mi-comercio/editar"
          element={<RutaProtegida><EditarComercioPage /></RutaProtegida>}
        />
        <Route
          path="mi-comercio/preview"
          element={<RutaProtegida><PreviewPage /></RutaProtegida>}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
