import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getComercio } from '../services/api.js';
import {
  ArrowLeft, Phone, Mail, Instagram, MapPin,
  Clock, Store, Users, AlertCircle,
} from 'lucide-react';

const COLORES_CATEGORIA = {
  ferretería: 'bg-amber-100 text-amber-800',
  comida:     'bg-green-100 text-green-800',
  artesanía:  'bg-purple-100 text-purple-800',
  servicios:  'bg-blue-100 text-blue-800',
  tienda:     'bg-pink-100 text-pink-800',
  farmacia:   'bg-teal-100 text-teal-800',
  ropa:       'bg-rose-100 text-rose-800',
};

function BotonContacto({ href, icono: Icono, texto, variante }) {
  const estilos = {
    whatsapp: 'bg-whatsapp hover:bg-whatsapp-dark text-white',
    correo:   'bg-navy-700 hover:bg-navy-800 text-white',
    instagram:'bg-gray-100 hover:bg-gray-200 text-gray-800',
  };
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`
        flex items-center justify-center gap-3
        min-h-[52px] px-5 rounded-xl
        font-semibold text-[16px]
        transition-colors duration-150
        ${estilos[variante]}
      `}
    >
      <Icono size={20} strokeWidth={2} aria-hidden="true" />
      {texto}
    </a>
  );
}

function FilaInfo({ icono: Icono, etiqueta, valor }) {
  if (!valor) return null;
  return (
    <div className="flex items-start gap-3">
      <Icono size={20} className="text-navy-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
      <div>
        <p className="text-[13px] text-gray-400 font-medium">{etiqueta}</p>
        <p className="text-[17px] text-gray-800">{valor}</p>
      </div>
    </div>
  );
}

export default function FichaPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [comercio, setComercio] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setCargando(true);
    setError(null);
    getComercio(id)
      .then(data => setComercio(data))
      .catch(err => setError(err.message || 'No pudimos cargar el comercio.'))
      .finally(() => setCargando(false));
  }, [id]);

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 rounded-full border-4 border-navy-200 border-t-navy-700 animate-spin" aria-label="Cargando" />
      </div>
    );
  }

  if (error || !comercio) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8 text-center min-h-screen">
        <AlertCircle size={48} className="text-red-400" aria-hidden="true" />
        <p className="text-[18px] text-gray-700">{error || 'Comercio no encontrado.'}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-3 rounded-pill bg-navy-700 text-white font-medium text-[16px] min-h-[48px]"
        >
          Volver
        </button>
      </div>
    );
  }

  const galeria = Array.isArray(comercio.galeria_urls) ? comercio.galeria_urls : [];
  const horario = comercio.horario
    ? typeof comercio.horario === 'string'
      ? comercio.horario
      : JSON.stringify(comercio.horario)
    : null;
  const colorCat = COLORES_CATEGORIA[comercio.categoria] || 'bg-gray-100 text-gray-700';

  return (
    <div className="min-h-screen bg-gray-50 pb-tab-bar">
      {/* Hero */}
      <div className="relative bg-navy-800 w-full aspect-video max-h-64 overflow-hidden">
        {comercio.foto_perfil_url ? (
          <img
            src={comercio.foto_perfil_url}
            alt={comercio.nombre}
            className="w-full h-full object-cover opacity-80"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Store size={72} className="text-navy-400" aria-hidden="true" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/60 to-transparent" />

        <button
          onClick={() => navigate(-1)}
          className="
            absolute top-4 left-4
            w-10 h-10 rounded-full
            bg-black/30 backdrop-blur-sm text-white
            flex items-center justify-center
            hover:bg-black/50 transition-colors
          "
          aria-label="Volver"
        >
          <ArrowLeft size={20} aria-hidden="true" />
        </button>
      </div>

      <div className="px-4 -mt-4 relative z-10 flex flex-col gap-4">
        {/* Tarjeta principal */}
        <div className="bg-white rounded-card shadow-card px-5 py-4">
          <h1 className="text-[26px] font-bold text-navy-900 leading-tight">{comercio.nombre}</h1>
          {comercio.categoria && (
            <span className={`inline-block mt-1 text-[13px] font-medium px-3 py-0.5 rounded-full ${colorCat}`}>
              {comercio.categoria}
            </span>
          )}
          {comercio.descripcion && (
            <p className="mt-3 text-[17px] text-gray-700 leading-relaxed">{comercio.descripcion}</p>
          )}
        </div>

        {/* Info */}
        {(comercio.direccion_texto || horario || comercio.colaboradores) && (
          <div className="bg-white rounded-card shadow-card px-5 py-4 flex flex-col gap-4">
            <FilaInfo icono={MapPin} etiqueta="Dirección" valor={comercio.direccion_texto} />
            <FilaInfo icono={Clock} etiqueta="Horario" valor={horario} />
            <FilaInfo icono={Users} etiqueta="Equipo" valor={comercio.colaboradores} />
          </div>
        )}

        {/* Galería */}
        {galeria.length > 0 && (
          <div>
            <h2 className="text-[16px] font-semibold text-gray-700 mb-2 px-1">Fotos</h2>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4" role="list" aria-label="Galería de fotos">
              {galeria.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`Foto ${i + 1} de ${comercio.nombre}`}
                  className="flex-shrink-0 w-40 h-28 rounded-xl object-cover shadow-card"
                  role="listitem"
                />
              ))}
            </div>
          </div>
        )}

        {/* Contacto */}
        <div className="bg-white rounded-card shadow-card px-5 py-4">
          <h2 className="text-[17px] font-semibold text-gray-800 mb-3">Contactar</h2>
          <div className="flex flex-col gap-3">
            {comercio.contacto_whatsapp && (
              <BotonContacto
                href={`https://wa.me/52${comercio.contacto_whatsapp.replace(/\D/g, '')}`}
                icono={Phone}
                texto="Contactar por WhatsApp"
                variante="whatsapp"
              />
            )}
            {comercio.contacto_correo && (
              <BotonContacto
                href={`mailto:${comercio.contacto_correo}`}
                icono={Mail}
                texto="Enviar correo"
                variante="correo"
              />
            )}
            {comercio.contacto_instagram && (
              <BotonContacto
                href={`https://instagram.com/${comercio.contacto_instagram.replace('@', '')}`}
                icono={Instagram}
                texto="Ver en Instagram"
                variante="instagram"
              />
            )}
            {!comercio.contacto_whatsapp && !comercio.contacto_correo && !comercio.contacto_instagram && (
              <p className="text-[16px] text-gray-400 text-center py-2">
                Este negocio no tiene contacto registrado aún.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
