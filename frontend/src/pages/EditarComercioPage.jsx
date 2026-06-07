import { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useComerciosList } from '../context/ComerciosContext.jsx';
import { crearComercio, editarComercio, subirImagen } from '../services/api.js';
import { ArrowLeft, Save, Upload, Trash2, Image as ImageIcon } from 'lucide-react';
import MiniMapaUbicacion from '../components/MiniMapaUbicacion.jsx';

const CATEGORIAS = ['comida', 'ferretería', 'artesanía', 'servicios', 'tienda', 'farmacia', 'ropa', 'otro'];

const ESTILO_INPUT = `
  w-full px-4 py-3 rounded-xl border border-gray-200
  bg-white text-[17px] text-gray-800
  focus:outline-none focus:ring-2 focus:ring-navy-300 focus:border-navy-400
  transition-shadow placeholder-gray-300
`;

function Campo({ label, descripcion, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[16px] font-semibold text-gray-800">{label}</label>
      {descripcion && (
        <p className="text-[14px] text-gray-400 leading-snug">{descripcion}</p>
      )}
      {children}
      {error && (
        <p className="text-[14px] text-red-600" role="alert">{error}</p>
      )}
    </div>
  );
}

export default function EditarComercioPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { recargar } = useComerciosList();
  const comercioExistente = location.state?.comercio || null;

  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    categoria: '',
    direccion_texto: '',
    lat: '',
    lng: '',
    horario: '',
    contacto_whatsapp: '',
    contacto_correo: '',
    contacto_instagram: '',
    foto_perfil_url: '',
    ...(comercioExistente || {}),
    galeria_urls: Array.isArray(comercioExistente?.galeria_urls)
      ? comercioExistente.galeria_urls
      : [],
  });

  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState(null);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const inputFotoRef = useRef(null);

  function set(campo, valor) {
    setForm(prev => ({ ...prev, [campo]: valor }));
    if (errores[campo]) setErrores(prev => ({ ...prev, [campo]: null }));
  }

  function validar() {
    const e = {};
    if (!form.nombre.trim()) e.nombre = 'El nombre es obligatorio.';
    if ((form.descripcion?.length || 0) > 280) {
      e.descripcion = 'La descripción no puede superar los 280 caracteres.';
    }
    if (form.contacto_whatsapp &&
      !/^\d{10}$/.test(form.contacto_whatsapp.replace(/[\s\-]/g, ''))) {
      e.contacto_whatsapp = 'Escribe el número sin espacios ni guiones (10 dígitos, ej. 6181234567).';
    }
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const e2 = validar();
    if (Object.keys(e2).length) {
      setErrores(e2);
      return;
    }

    setGuardando(true);
    setErrorGeneral(null);

    const payload = {
      ...form,
      lat: form.lat !== '' && form.lat != null ? parseFloat(form.lat) : null,
      lng: form.lng !== '' && form.lng != null ? parseFloat(form.lng) : null,
      owner_google_id: user?.sub || user?.google_id,
    };

    try {
      if (comercioExistente?.id) {
        await editarComercio(comercioExistente.id, payload);
      } else {
        await crearComercio(payload);
      }
      recargar();
      navigate('/mi-comercio');
    } catch (err) {
      setErrorGeneral(err.message || 'No pudimos guardar. Intenta de nuevo.');
    } finally {
      setGuardando(false);
    }
  }

  function actualizarUbicacion({ lat, lng, direccion_texto }) {
    setForm(prev => ({
      ...prev,
      lat,
      lng,
      // Solo sobrescribir si el geocoder devolvió algo; preservamos lo que el usuario haya escrito
      ...(direccion_texto ? { direccion_texto } : {}),
    }));
  }

  async function handleFotoChange(e) {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    if (archivo.size > 5 * 1024 * 1024) {
      setErrores(prev => ({ ...prev, foto_perfil_url: 'La imagen no puede pesar más de 5MB.' }));
      return;
    }

    setSubiendoFoto(true);
    setErrores(prev => ({ ...prev, foto_perfil_url: null }));

    try {
      const { url } = await subirImagen(archivo);
      set('foto_perfil_url', url);
    } catch (err) {
      setErrores(prev => ({
        ...prev,
        foto_perfil_url: err.message || 'No pudimos subir la imagen. Intenta de nuevo.',
      }));
    } finally {
      setSubiendoFoto(false);
      if (inputFotoRef.current) inputFotoRef.current.value = '';
    }
  }

  function quitarFoto() {
    set('foto_perfil_url', '');
  }

  const descLen = form.descripcion?.length || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Encabezado */}
      <div className="bg-navy-800 px-4 pt-10 pb-5 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors flex-shrink-0"
          aria-label="Volver"
        >
          <ArrowLeft size={20} aria-hidden="true" />
        </button>
        <h1 className="text-[22px] font-bold text-white">
          {comercioExistente ? 'Editar negocio' : 'Registrar negocio'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} noValidate className="px-4 py-6 pb-tab-bar flex flex-col gap-5">
        {errorGeneral && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3" role="alert">
            <p className="text-[16px] text-red-700">{errorGeneral}</p>
          </div>
        )}

        <Campo label="Nombre del negocio *" error={errores.nombre}>
          <input
            type="text"
            value={form.nombre}
            onChange={e => set('nombre', e.target.value)}
            placeholder="Ej. Ferretería El Martillo"
            className={`${ESTILO_INPUT} min-h-[52px]`}
            maxLength={100}
            required
            aria-required="true"
          />
        </Campo>

        <Campo
          label="¿Qué vendes o haces?"
          descripcion="Cuéntale a tus clientes qué ofreces (máximo 280 caracteres)."
          error={errores.descripcion}
        >
          <textarea
            value={form.descripcion}
            onChange={e => set('descripcion', e.target.value)}
            placeholder="Ej. Vendemos herramientas, pinturas y materiales de construcción para el hogar y obra."
            rows={3}
            className={`${ESTILO_INPUT} resize-none`}
            maxLength={300}
          />
          <p className={`text-[13px] text-right ${descLen > 280 ? 'text-red-500' : 'text-gray-400'}`}>
            {descLen}/280
          </p>
        </Campo>

        <Campo label="Categoría">
          <select
            value={form.categoria}
            onChange={e => set('categoria', e.target.value)}
            className={`${ESTILO_INPUT} min-h-[52px]`}
          >
            <option value="">Selecciona una categoría</option>
            {CATEGORIAS.map(c => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
        </Campo>

        <Campo
          label="Ubicación en el mapa"
          descripcion="Arrastra el pin o toca el mapa para colocarlo justo donde está tu negocio."
        >
          <MiniMapaUbicacion
            lat={form.lat}
            lng={form.lng}
            direccionPadre={form.direccion_texto}
            onChange={actualizarUbicacion}
          />
        </Campo>

        <Campo
          label="Dirección"
          descripcion="La detectamos automáticamente al colocar el pin. Puedes corregirla si hace falta."
        >
          <input
            type="text"
            value={form.direccion_texto}
            onChange={e => set('direccion_texto', e.target.value)}
            placeholder="Ej. Calle Constitución 123, Centro, Durango"
            className={`${ESTILO_INPUT} min-h-[52px]`}
          />
        </Campo>

        <Campo
          label="Horario"
          descripcion='Escribe como prefieras, ej. "Lun-Sáb de 9am a 7pm".'
        >
          <input
            type="text"
            value={form.horario}
            onChange={e => set('horario', e.target.value)}
            placeholder="Lun-Vie 9am–7pm, Sáb 9am–2pm"
            className={`${ESTILO_INPUT} min-h-[52px]`}
          />
        </Campo>

        <Campo
          label="WhatsApp"
          descripcion="Solo el número de 10 dígitos, sin +52 ni espacios."
          error={errores.contacto_whatsapp}
        >
          <input
            type="tel"
            value={form.contacto_whatsapp}
            onChange={e => set('contacto_whatsapp', e.target.value)}
            placeholder="6181234567"
            maxLength={10}
            className={`${ESTILO_INPUT} min-h-[52px]`}
          />
        </Campo>

        <Campo label="Correo electrónico">
          <input
            type="email"
            value={form.contacto_correo}
            onChange={e => set('contacto_correo', e.target.value)}
            placeholder="mi.negocio@correo.com"
            className={`${ESTILO_INPUT} min-h-[52px]`}
          />
        </Campo>

        <Campo label="Instagram" descripcion="Solo el nombre de usuario, sin @.">
          <input
            type="text"
            value={form.contacto_instagram}
            onChange={e => set('contacto_instagram', e.target.value)}
            placeholder="mi_negocio_durango"
            className={`${ESTILO_INPUT} min-h-[52px]`}
          />
        </Campo>

        <Campo
          label="Foto principal de tu negocio"
          descripcion="Sube una foto o logo desde tu celular o computadora (máx. 5MB)."
          error={errores.foto_perfil_url}
        >
          <input
            ref={inputFotoRef}
            type="file"
            accept="image/*"
            onChange={handleFotoChange}
            className="hidden"
            aria-hidden="true"
          />

          {!form.foto_perfil_url && (
            <button
              type="button"
              onClick={() => inputFotoRef.current?.click()}
              disabled={subiendoFoto}
              className="
                flex flex-col items-center justify-center gap-2
                w-full min-h-[160px] rounded-xl
                border-2 border-dashed border-gray-300 bg-gray-50
                text-gray-500
                hover:border-navy-400 hover:bg-navy-50/40 hover:text-navy-700
                disabled:opacity-60 disabled:cursor-not-allowed
                transition-colors
              "
            >
              {subiendoFoto ? (
                <>
                  <div
                    className="w-8 h-8 rounded-full border-4 border-navy-200 border-t-navy-700 animate-spin"
                    aria-label="Subiendo imagen"
                  />
                  <span className="text-[16px] font-medium">Subiendo imagen…</span>
                </>
              ) : (
                <>
                  <Upload size={32} aria-hidden="true" />
                  <span className="text-[16px] font-semibold">Elegir foto desde mi dispositivo</span>
                  <span className="text-[13px] text-gray-400">JPG, PNG o WebP — hasta 5MB</span>
                </>
              )}
            </button>
          )}

          {form.foto_perfil_url && (
            <div className="flex flex-col gap-2">
              <div className="relative">
                <img
                  src={form.foto_perfil_url}
                  alt="Vista previa de la foto de tu negocio"
                  className="w-full h-48 object-cover rounded-xl border border-gray-200"
                />
                {subiendoFoto && (
                  <div className="absolute inset-0 bg-white/70 rounded-xl flex items-center justify-center">
                    <div
                      className="w-8 h-8 rounded-full border-4 border-navy-200 border-t-navy-700 animate-spin"
                      aria-label="Subiendo imagen"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => inputFotoRef.current?.click()}
                  disabled={subiendoFoto}
                  className="
                    flex-1 flex items-center justify-center gap-2
                    min-h-[48px] rounded-xl
                    bg-white border border-gray-300 text-gray-700
                    font-semibold text-[15px]
                    hover:bg-gray-50
                    disabled:opacity-60 disabled:cursor-not-allowed
                    transition-colors
                  "
                >
                  <ImageIcon size={18} aria-hidden="true" />
                  Cambiar foto
                </button>
                <button
                  type="button"
                  onClick={quitarFoto}
                  disabled={subiendoFoto}
                  className="
                    flex items-center justify-center gap-2
                    min-h-[48px] px-4 rounded-xl
                    bg-white border border-red-200 text-red-600
                    font-semibold text-[15px]
                    hover:bg-red-50
                    disabled:opacity-60 disabled:cursor-not-allowed
                    transition-colors
                  "
                  aria-label="Quitar foto"
                >
                  <Trash2 size={18} aria-hidden="true" />
                  Quitar
                </button>
              </div>
            </div>
          )}
        </Campo>

        <button
          type="submit"
          disabled={guardando}
          className="
            flex items-center justify-center gap-3
            min-h-[56px] rounded-xl
            bg-navy-700 text-white
            font-bold text-[18px]
            hover:bg-navy-800
            disabled:opacity-60 disabled:cursor-not-allowed
            transition-colors shadow-fab mt-2
          "
        >
          {guardando ? (
            <div className="w-6 h-6 rounded-full border-4 border-white/30 border-t-white animate-spin" aria-label="Guardando" />
          ) : (
            <>
              <Save size={22} aria-hidden="true" />
              {comercioExistente ? 'Guardar cambios' : 'Publicar mi negocio'}
            </>
          )}
        </button>
      </form>
    </div>
  );
}
