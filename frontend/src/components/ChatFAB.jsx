import { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';
import ChatPanel from './ChatPanel.jsx';

export default function ChatFAB() {
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      {abierto && <ChatPanel onCerrar={() => setAbierto(false)} />}

      <button
        onClick={() => setAbierto(prev => !prev)}
        className="
          fixed z-50 right-4
          flex items-center justify-center
          w-14 h-14 rounded-full
          bg-navy-700 text-white
          shadow-fab
          transition-all duration-200
          hover:bg-navy-800 hover:scale-105
          active:scale-95
          focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-navy-300
        "
        style={{ bottom: 'calc(var(--tab-bar-height) + 16px)' }}
        aria-label={abierto ? 'Cerrar asistente' : 'Abrir asistente Gemini'}
        aria-expanded={abierto}
      >
        {abierto
          ? <X size={22} strokeWidth={2.5} aria-hidden="true" />
          : <MessageSquare size={22} strokeWidth={2} aria-hidden="true" />
        }
      </button>
    </>
  );
}
