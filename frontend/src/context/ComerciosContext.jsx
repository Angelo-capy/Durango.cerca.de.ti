/**
 * ComerciosContext — lista global de comercios.
 * Se carga una vez al montar la app y se comparte en todas las pantallas
 * para evitar múltiples llamadas al backend.
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getComerciosList } from '../services/api.js';

const ComerciosContext = createContext(null);

export function ComerciosProvider({ children }) {
  const [comercios, setComerciosList] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await getComerciosList();
      setComerciosList(Array.isArray(data) ? data : data.comercios || []);
    } catch (err) {
      setError(err.message || 'No pudimos conectarnos. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return (
    <ComerciosContext.Provider
      value={{ comercios, cargando, error, recargar: cargar }}
    >
      {children}
    </ComerciosContext.Provider>
  );
}

export function useComerciosList() {
  const ctx = useContext(ComerciosContext);
  if (!ctx) throw new Error('useComerciosList debe usarse dentro de <ComerciosProvider>');
  return ctx;
}
