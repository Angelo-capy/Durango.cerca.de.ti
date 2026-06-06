import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Send, Bot, User, X, MapPin } from 'lucide-react';
import { useComerciosList } from '../context/ComerciosContext.jsx';
import { enviarChat } from '../services/api.js';

function extraerMencionados(texto, comercios) {
  if (!comercios.length || !texto) return [];
  return comercios.filter(c =>
    c.nombre && texto.toLowerCase().includes(c.nombre.toLowerCase())
  );
}

function BurbujaMensaje({ mensaje, comercios }) {
  const esBot = mensaje.rol === 'bot';
  const mencionados = esBot ? extraerMencionados(mensaje.texto, comercios) : [];

  return (
    <div className={`flex gap-2 ${esBot ? 'items-start' : 'items-start flex-row-reverse'}`}>
      <div className={`
        flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
        ${esBot ? 'bg-navy-100 text-navy-700' : 'bg-gray-200 text-gray-600'}
      `}>
        {esBot
          ? <Bot size={16} aria-hidden="true" />
          : <User size={16} aria-hidden="true" />
        }
      </div>

      <div className="max-w-[80%] flex flex-col gap-2">
        <div className={`
          rounded-2xl px-4 py-3 text-[17px] leading-relaxed
          ${esBot
            ? 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-card'
            : 'bg-navy-700 text-white rounded-tr-sm'
          }
        `}>
          {mensaje.texto.split('\n').map((linea, i) => (
            <p key={i} className={linea === '' ? 'h-2' : undefined}>{linea}</p>
          ))}
        </div>

        {mencionados.length > 0 && (
          <div className="flex flex-col gap-1.5">
            {mencionados.map(c => (
              <Link
                key={c.id}
                to={`/comercios/${c.id}`}
                className="
                  flex items-center gap-2 px-3 py-2 rounded-xl
                  bg-navy-50 border border-navy-200
                  text-navy-700 text-[14px] font-medium
                  hover:bg-navy-100 transition-colors
                "
              >
                <MapPin size={14} aria-hidden="true" />
                <span className="flex-1 truncate">{c.nombre}</span>
                {c.direccion_texto && (
                  <span className="text-gray-400 font-normal text-[12px] flex-shrink-0">
                    {c.direccion_texto}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Pensando() {
  return (
    <div className="flex gap-2 items-start">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-navy-100 text-navy-700 flex items-center justify-center">
        <Bot size={16} aria-hidden="true" />
      </div>
      <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-5 py-4 shadow-card">
        <div className="flex gap-1.5 items-center" aria-label="El asistente está pensando">
          <span className="w-2 h-2 rounded-full bg-navy-400 dot-1" />
          <span className="w-2 h-2 rounded-full bg-navy-400 dot-2" />
          <span className="w-2 h-2 rounded-full bg-navy-400 dot-3" />
        </div>
      </div>
    </div>
  );
}

export default function ChatPanel({ onCerrar }) {
  const [mensajes, setMensajes] = useState([{
    rol: 'bot',
    texto: '¡Hola! Soy tu asistente local de Durango.\n\nPregúntame cualquier cosa: "¿dónde como barato cerca?", "¿hay ferreterías abiertas?", "¿dónde compro artesanías?"',
  }]);
  const [input, setInput] = useState('');
  const [pensando, setPensando] = useState(false);
  const [ubicacion, setUbicacion] = useState(null);
  const listaRef = useRef(null);
  const inputRef = useRef(null);
  const { comercios } = useComerciosList();

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      pos => setUbicacion({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setUbicacion(null)
    );
  }, []);

  useEffect(() => {
    if (listaRef.current) {
      listaRef.current.scrollTop = listaRef.current.scrollHeight;
    }
  }, [mensajes, pensando]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const enviar = useCallback(async () => {
    const texto = input.trim();
    if (!texto || pensando) return;

    setInput('');
    setMensajes(prev => [...prev, { rol: 'usuario', texto }]);
    setPensando(true);

    try {
      const data = await enviarChat(texto, ubicacion);
      setMensajes(prev => [
        ...prev,
        { rol: 'bot', texto: data.response || 'No obtuve respuesta. Intenta de nuevo.' },
      ]);
    } catch {
      setMensajes(prev => [
        ...prev,
        { rol: 'bot', texto: 'No pudimos conectarnos al asistente. Revisa tu conexión e intenta de nuevo.' },
      ]);
    } finally {
      setPensando(false);
    }
  }, [input, pensando, ubicacion]);

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviar();
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30 animate-fade-in"
        onClick={onCerrar}
        aria-hidden="true"
      />

      <div
        className="
          fixed inset-x-0 bottom-0 z-50
          flex flex-col bg-gray-50
          rounded-t-panel shadow-panel
          animate-slide-up
        "
        style={{ height: '85dvh' }}
        role="dialog"
        aria-modal="true"
        aria-label="Asistente local de Durango"
      >
        {/* Encabezado */}
        <div className="flex items-center gap-3 px-4 py-4 bg-white rounded-t-panel border-b border-gray-100">
          <div className="w-9 h-9 rounded-full bg-navy-700 flex items-center justify-center flex-shrink-0">
            <Bot size={18} className="text-white" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-navy-900 text-[17px] leading-tight">Asistente Durango</p>
            <p className="text-gray-400 text-[13px]">Con tecnología Gemini</p>
          </div>
          <button
            onClick={onCerrar}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
            aria-label="Cerrar asistente"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Lista de mensajes */}
        <div
          ref={listaRef}
          className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-4"
          aria-live="polite"
        >
          {mensajes.map((m, i) => (
            <BurbujaMensaje key={i} mensaje={m} comercios={comercios} />
          ))}
          {pensando && <Pensando />}
        </div>

        {/* Input */}
        <div className="px-4 py-3 bg-white border-t border-gray-100">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="¿Qué buscas en Durango?"
              rows={1}
              className="
                flex-1 resize-none
                bg-gray-100 rounded-2xl
                px-4 py-3
                text-[17px] text-gray-800
                placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-navy-300
                transition-shadow
                max-h-28 overflow-y-auto
              "
              disabled={pensando}
              aria-label="Escribe tu pregunta"
            />
            <button
              onClick={enviar}
              disabled={!input.trim() || pensando}
              className="
                flex-shrink-0 w-12 h-12 rounded-full
                bg-navy-700 text-white
                flex items-center justify-center
                disabled:opacity-40 disabled:cursor-not-allowed
                hover:bg-navy-800 active:scale-95
                transition-all
              "
              aria-label="Enviar pregunta"
            >
              <Send size={18} strokeWidth={2.5} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
