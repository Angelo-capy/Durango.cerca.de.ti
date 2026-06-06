import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext.jsx';
import { MapPin } from 'lucide-react';

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    navigate('/mi-comercio', { replace: true });
    return null;
  }

  async function handleExito(credentialResponse) {
    try {
      await login(credentialResponse.credential);
      navigate('/mi-comercio', { replace: true });
    } catch {
      alert('No pudimos iniciar sesión. Intenta de nuevo.');
    }
  }

  return (
    <div className="min-h-screen bg-navy-900 flex flex-col items-center justify-center px-6 py-12">
      {/* Identidad */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
          <MapPin size={28} className="text-white" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-[30px] font-bold text-white leading-tight">Durango</h1>
          <p className="text-navy-300 text-[17px] leading-tight">cerca de ti</p>
        </div>
      </div>

      <p className="text-navy-200 text-center text-[17px] mt-6 mb-10 max-w-xs leading-relaxed">
        Publica tu negocio y llega a más clientes en Durango sin complicaciones.
      </p>

      {/* Tarjeta de login */}
      <div className="bg-white rounded-2xl px-6 py-8 w-full max-w-sm shadow-xl">
        <h2 className="text-[22px] font-bold text-navy-900 text-center mb-2">
          Registra tu negocio
        </h2>
        <p className="text-[16px] text-gray-500 text-center mb-7 leading-relaxed">
          Usa tu cuenta de Google para entrar. Es gratis y toma menos de 5 minutos.
        </p>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleExito}
            onError={() => alert('No pudimos conectarnos con Google. Intenta de nuevo.')}
            text="signin_with"
            shape="rectangular"
            size="large"
            width="280"
            locale="es_MX"
          />
        </div>

        <p className="text-[13px] text-gray-400 text-center mt-6 leading-relaxed">
          Solo para comerciantes de Durango. Los ciudadanos pueden explorar sin registrarse.
        </p>
      </div>

      <button
        onClick={() => navigate('/')}
        className="mt-8 text-navy-300 text-[16px] underline underline-offset-2 hover:text-white transition-colors"
      >
        Explorar comercios sin entrar
      </button>
    </div>
  );
}
