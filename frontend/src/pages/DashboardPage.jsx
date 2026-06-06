import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getComerciosList } from '../services/api.js';
import { Store, Plus, Edit3, Eye, LogOut, MapPin } from 'lucide-react';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [miComercio, setMiComercio] = useState(null);
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
        setMiComercio(mio || null);
      })
      .catch(() => setMiComercio(null))
      .finally(() => setCargando(false));
  }, [user]);

  function cerrarSesion() {
    logout();
    navigate('/');
  }

  const nombreUsuario = user?.nombre || user?.name || 'Comerciante';
  const inicial = nombreUsuario.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-navy-800 px-4 pt-12 pb-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-[18px]" aria-hidden="true">{inicial}</span>
            </div>
            <div>
              <p className="text-white font-semibold text-[17px]">{nombreUsuario}</p>
              <p className="text-navy-300 text-[13px]">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={cerrarSesion}
            className="flex items-center gap-1.5 text-navy-300 text-[14px] hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-white/10 min-h-[40px]"
          >
            <LogOut size={16} aria-hidden="true" />
            Salir
          </button>
        </div>
        <h1 className="text-[26px] font-bold text-white">Mi negocio</h1>
      </div>

      <div className="px-4 py-6 pb-tab-bar">
        {cargando ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 rounded-full border-4 border-navy-200 border-t-navy-700 animate-spin" aria-label="Cargando" />
          </div>
        ) : miComercio ? (
          /* Tiene comercio registrado */
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-card shadow-card overflow-hidden">
              <div className="h-40 bg-navy-100 flex items-center justify-center overflow-hidden">
                {miComercio.foto_perfil_url ? (
                  <img
                    src={miComercio.foto_perfil_url}
                    alt={miComercio.nombre}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Store size={52} className="text-navy-300" aria-hidden="true" />
                )}
              </div>
              <div className="px-5 py-4">
                <h2 className="text-[22px] font-bold text-navy-900">{miComercio.nombre}</h2>
                {miComercio.categoria && (
                  <span className="inline-block mt-1 text-[13px] px-3 py-0.5 rounded-full bg-navy-100 text-navy-700 font-medium">
                    {miComercio.categoria}
                  </span>
                )}
                {miComercio.descripcion && (
                  <p className="mt-2 text-[16px] text-gray-600 leading-relaxed">{miComercio.descripcion}</p>
                )}
                {miComercio.direccion_texto && (
                  <p className="mt-2 text-[14px] text-gray-400 flex items-center gap-1">
                    <MapPin size={13} aria-hidden="true" />
                    {miComercio.direccion_texto}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => navigate('/mi-comercio/editar', { state: { comercio: miComercio } })}
              className="
                flex items-center justify-center gap-3
                min-h-[52px] rounded-xl
                bg-navy-700 text-white
                font-semibold text-[17px]
                hover:bg-navy-800 transition-colors
              "
            >
              <Edit3 size={20} aria-hidden="true" />
              Editar mi negocio
            </button>

            <button
              onClick={() => navigate(`/comercios/${miComercio.id}`)}
              className="
                flex items-center justify-center gap-3
                min-h-[52px] rounded-xl
                bg-white border-2 border-navy-200 text-navy-700
                font-semibold text-[17px]
                hover:border-navy-400 transition-colors
              "
            >
              <Eye size={20} aria-hidden="true" />
              Ver como lo ve el cliente
            </button>
          </div>
        ) : (
          /* No tiene comercio */
          <div className="flex flex-col items-center text-center gap-5 py-10">
            <div className="w-24 h-24 rounded-3xl bg-navy-100 flex items-center justify-center">
              <Store size={48} className="text-navy-400" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-[22px] font-bold text-navy-900">Tu negocio no está aquí todavía</h2>
              <p className="text-[17px] text-gray-500 mt-2 leading-relaxed max-w-xs">
                Regístralo en menos de 5 minutos y empieza a recibir clientes locales.
              </p>
            </div>
            <button
              onClick={() => navigate('/mi-comercio/editar')}
              className="
                flex items-center gap-3
                min-h-[52px] px-8 rounded-xl
                bg-navy-700 text-white
                font-semibold text-[18px]
                hover:bg-navy-800 transition-colors
                shadow-fab
              "
            >
              <Plus size={22} aria-hidden="true" />
              Registrar mi negocio
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
