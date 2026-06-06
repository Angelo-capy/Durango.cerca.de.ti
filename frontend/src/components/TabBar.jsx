/**
 * TabBar — barra de navegación inferior fija.
 * Cubre RF-06..11 (acceso a mapa, listado y perfil de comerciante).
 * Botones ≥ 48×48px (accesibilidad 50+).
 */

import { NavLink, useLocation } from 'react-router-dom';
import { Map, List, Store } from 'lucide-react';

const TABS = [
  {
    href: '/',
    label: 'Mapa',
    icono: Map,
    exact: true,
  },
  {
    href: '/comercios',
    label: 'Comercios',
    icono: List,
  },
  {
    href: '/mi-comercio',
    label: 'Mi negocio',
    icono: Store,
  },
];

export default function TabBar() {
  const location = useLocation();

  function esActivo(tab) {
    if (tab.exact) return location.pathname === tab.href;
    return location.pathname.startsWith(tab.href);
  }

  return (
    <nav
      className="
        fixed bottom-0 inset-x-0 z-40
        bg-white border-t border-gray-200
        flex items-stretch
        safe-area-inset-bottom
      "
      style={{ height: 'var(--tab-bar-height)' }}
      aria-label="Navegación principal"
    >
      {TABS.map((tab) => {
        const Icono = tab.icono;
        const activo = esActivo(tab);

        return (
          <NavLink
            key={tab.href}
            to={tab.href}
            className="
              flex-1 flex flex-col items-center justify-center gap-0.5
              min-h-[48px] px-2
              transition-colors duration-150
              focus-visible:bg-navy-50
            "
            aria-current={activo ? 'page' : undefined}
          >
            <Icono
              size={24}
              strokeWidth={activo ? 2.5 : 1.75}
              className={activo ? 'text-navy-700' : 'text-gray-400'}
              aria-hidden="true"
            />
            <span
              className={`
                text-[12px] font-medium leading-none mt-0.5
                ${activo ? 'text-navy-700' : 'text-gray-400'}
              `}
            >
              {tab.label}
            </span>

            {/* Indicador activo */}
            {activo && (
              <span
                className="absolute bottom-0 w-8 h-0.5 rounded-full bg-navy-700"
                aria-hidden="true"
              />
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}
