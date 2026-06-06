import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginGoogle as loginGoogleApi } from '../services/api.js';

const AuthContext = createContext(null);

const STORAGE_KEY = 'durango_usuario';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
    setCargando(false);
  }, []);

  const login = useCallback(async (googleCredential) => {
    const data = await loginGoogleApi(googleCredential);
    // Backend returns { usuario } — no JWT in current implementation
    const usuario = data.usuario || data;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usuario));
    setUser(usuario);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, cargando }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
