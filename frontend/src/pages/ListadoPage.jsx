import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useComerciosList } from '../context/ComerciosContext.jsx';
import { MapPin, Store, AlertCircle, RefreshCw } from 'lucide-react';

const CATEGORIAS = ['Todas', 'comida', 'ferretería', 'artesanía', 'servicios', 'tienda', 'farmacia', 'ropa'];

const COLORES_CATEGORIA = {
  ferretería: 'bg-amber-100 text-amber-800 border-amber-200',
  comida:     'bg-green-100 text-green-800 border-green-200',
  artesanía:  'bg-purple-100 text-purple-800 border-purple-200',
  servicios:  'bg-blue-100 text-blue-800 border-blue-200',
  tienda:     'bg-pink-100 text-pink-800 border-pink-200',
  farmacia:   'bg-teal-100 text-teal-800 border-teal-200',
  ropa:       'bg-rose-100 text-rose-800 border-rose-200',
};

function TarjetaComercio({ comercio }) {
  const navigate = useNavigate();
  const colorCls = COLORES_CATEGORIA[comercio.categoria] || 'bg-gray-100 text-gray-700 border-gray-200';

  return (
    <button
      onClick={() => navigate(`/comercios/${comercio.id}`)}
      className="
        w-full text-left bg-white rounded-card shadow-card
        hover:shadow-card-hover active:scale-[0.99]
        transition-all duration-150 overflow-hidden
        flex items-stretch min-h-[88px]
      "
    >
      {/* Foto o placeholder */}
      <div className="w-24 flex-shrink-0 bg-navy-50 flex items-center justify-center overflow-hidden">
        {comercio.foto_perfil_url ? (
          <img
            src={comercio.foto_perfil_url}
            alt={comercio.nombre}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-1 text-navy-300">
            <Store size={26} aria-hidden="true" />
            <span className="text-[15px] font-bold text-navy-400" aria-hidden="true">
              {comercio.nombre?.charAt(0)?.toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Información */}
      <div className="flex-1 px-4 py-3 flex flex-col justify-between">
        <div>
          <p className="font-semibold text-navy-900 text-[17px] leading-tight line-clamp-1">
            {comercio.nombre}
          </p>
          {comercio.descripcion && (
            <p className="text-gray-500 text-[14px] mt-0.5 line-clamp-2 leading-snug">
              {comercio.descripcion}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {comercio.categoria && (
            <span className={`text-[12px] font-medium px-2 py-0.5 rounded-full border ${colorCls}`}>
              {comercio.categoria}
            </span>
          )}
          {comercio.direccion_texto && (
            <span className="text-[12px] text-gray-400 flex items-center gap-1 truncate">
              <MapPin size={11} aria-hidden="true" />
              {comercio.direccion_texto}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

export default function ListadoPage() {
  const { comercios, cargando, error, recargar } = useComerciosList();
  const [filtro, setFiltro] = useState('Todas');

  const filtrados = filtro === 'Todas'
    ? comercios
    : comercios.filter(c => c.categoria === filtro);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Encabezado fijo */}
      <div className="bg-white border-b border-gray-100 px-4 pt-10 pb-3 sticky top-0 z-10">
        <h1 className="text-[26px] font-bold text-navy-900">Comercios</h1>
        <p className="text-[15px] text-gray-500 mt-0.5">
          {comercios.length} negocio{comercios.length !== 1 ? 's' : ''} registrado{comercios.length !== 1 ? 's' : ''}
        </p>

        {/* Chips de categoría */}
        <div
          className="flex gap-2 mt-3 overflow-x-auto pb-1 -mx-4 px-4"
          role="group"
          aria-label="Filtrar por categoría"
        >
          {CATEGORIAS.map(cat => (
            <button
              key={cat}
              onClick={() => setFiltro(cat)}
              className={`
                flex-shrink-0 px-4 py-2 rounded-pill text-[14px] font-medium border
                transition-colors min-h-[36px]
                ${filtro === cat
                  ? 'bg-navy-700 text-white border-navy-700'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-navy-300'
                }
              `}
              aria-pressed={filtro === cat}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 pb-tab-bar">
        {cargando && (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 rounded-full border-4 border-navy-200 border-t-navy-700 animate-spin" aria-label="Cargando comercios" />
          </div>
        )}

        {error && !cargando && (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <AlertCircle size={40} className="text-red-400" aria-hidden="true" />
            <p className="text-[18px] text-gray-700">{error}</p>
            <button
              onClick={recargar}
              className="flex items-center gap-2 px-6 py-3 rounded-pill bg-navy-700 text-white text-[16px] font-medium min-h-[48px]"
            >
              <RefreshCw size={16} aria-hidden="true" />
              Intentar de nuevo
            </button>
          </div>
        )}

        {!cargando && !error && filtrados.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <Store size={48} className="text-gray-300" aria-hidden="true" />
            <p className="text-[18px] text-gray-500">
              {filtro === 'Todas'
                ? 'Aún no hay comercios registrados en esta zona.'
                : `No hay comercios en la categoría "${filtro}".`}
            </p>
          </div>
        )}

        {!cargando && !error && filtrados.length > 0 && (
          <div className="flex flex-col gap-3" role="list" aria-label="Lista de comercios">
            {filtrados.map(c => (
              <div key={c.id} role="listitem">
                <TarjetaComercio comercio={c} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
