import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { notificationsApi } from '@features/notifications/notifications.api';
import { useNotificationStore } from '@store/notification.store';

// ─── Mobile bottom navigation ─────────────────────────────────────────────────
function MobileBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const base = 'flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 text-[10px] font-medium transition-colors';

  function handleFab() {
    if (location.pathname === '/') {
      navigate('/?new=1');
    } else {
      navigate('/groups?new=1');
    }
  }
  return (
    <nav className="fixed bottom-0 inset-x-0 z-20 lg:hidden bg-white border-t border-gray-200 flex items-center pb-1">
      <NavLink to="/" end
        className={({ isActive }) => clsx(base, isActive ? 'text-teal-600' : 'text-gray-400')}
      >
        {({ isActive }) => (
          <>
            <svg className={clsx('w-5 h-5', isActive ? 'text-teal-600' : 'text-gray-400')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Dashboard
          </>
        )}
      </NavLink>

      <NavLink to="/groups"
        className={({ isActive }) => clsx(base, isActive ? 'text-teal-600' : 'text-gray-400')}
      >
        {({ isActive }) => (
          <>
            <svg className={clsx('w-5 h-5', isActive ? 'text-teal-600' : 'text-gray-400')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Groups
          </>
        )}
      </NavLink>

      {/* Center FAB */}
      <div className="flex-1 flex items-center justify-center">
        <button
          className="w-12 h-12 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-full flex items-center justify-center shadow-lg shadow-teal-600/35 transition-colors -mt-5"
          onClick={handleFab}
          aria-label="Add new"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      <NavLink to="/friends"
        className={({ isActive }) => clsx(base, isActive ? 'text-teal-600' : 'text-gray-400')}
      >
        {({ isActive }) => (
          <>
            <svg className={clsx('w-5 h-5', isActive ? 'text-teal-600' : 'text-gray-400')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Friends
          </>
        )}
      </NavLink>

      <NavLink to="/activity"
        className={({ isActive }) => clsx(base, isActive ? 'text-teal-600' : 'text-gray-400')}
      >
        {({ isActive }) => (
          <>
            <svg className={clsx('w-5 h-5', isActive ? 'text-teal-600' : 'text-gray-400')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Activity
          </>
        )}
      </NavLink>
    </nav>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────
export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);

  useEffect(() => {
    notificationsApi.list()
      .then((data) => setUnreadCount(data.unreadCount))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Shift content right on desktop (sidebar is fixed-position) */}
      <div className="lg:ml-[220px] flex flex-col min-h-screen">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 lg:p-6 pb-36 lg:pb-6 overflow-auto">
          <Outlet />
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}
