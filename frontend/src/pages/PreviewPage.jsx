import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getComerciosList } from '../services/api.js';
import FichaPage from './FichaPage.jsx';

export default function PreviewPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [comercioId, setComercioId] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!user) return;
    getComerciosList()
      .then(data => {
        const lista = Array.isArray(data) ? data : data.comercios || [];
        const mio = lista.find(c =>
          c.owner_google_id === (user.sub || user.google_id) ||
          c.usuario_id === user.id
        );
        if (mio) {
          setComercioId(mio.id);
        } else {
          navigate('/mi-comercio/editar', { replace: true });
        }
      })
      .catch(() => navigate('/mi-comercio', { replace: true }))
      .finally(() => setCargando(false));
  }, [user, navigate]);

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 rounded-full border-4 border-navy-200 border-t-navy-700 animate-spin" aria-label="Cargando" />
      </div>
    );
  }

  if (!comercioId) return null;

  // Mounts FichaPage directly — it reads the :id param from the URL but we
  // can't set params here, so we render FichaPage via the route instead.
  // This component acts as a redirect to the real ficha route.
  navigate(`/comercios/${comercioId}`, { replace: true });
  return null;
}
