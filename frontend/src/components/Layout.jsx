import { Outlet, useLocation } from 'react-router-dom';
import TabBar from './TabBar.jsx';
import ChatFAB from './ChatFAB.jsx';

const RUTAS_SIN_NAV = ['/login'];

export default function Layout() {
  const { pathname } = useLocation();
  const mostrarNav = !RUTAS_SIN_NAV.includes(pathname);

  return (
    <div className="flex flex-col min-h-dvh bg-gray-50">
      <main className={`flex-1 ${mostrarNav ? 'pb-tab-bar' : ''}`}>
        <Outlet />
      </main>
      {mostrarNav && (
        <>
          <TabBar />
          <ChatFAB />
        </>
      )}
    </div>
  );
}
