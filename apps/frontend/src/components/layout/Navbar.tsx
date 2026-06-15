import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@store/auth.store';
import { useNotificationStore } from '@store/notification.store';
import { Avatar } from '@components/ui';
import { useLogout } from '@hooks/useAuth';
import { Logo } from '@components/ui/Logo';

interface NavbarProps { onMenuClick: () => void; }

export function Navbar({ onMenuClick }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef   = useRef<HTMLDivElement>(null);
  const user        = useAuthStore((s) => s.user);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const logout      = useLogout();

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center gap-3 px-4 lg:px-6 shrink-0 sticky top-0 z-10">

      {/* Mobile: hamburger */}
      <button
        className="lg:hidden p-2 -ml-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile: logo */}
      <Link to="/" className="lg:hidden">
        <Logo size="sm" />
      </Link>

      {/* Desktop: search bar */}
      <button
        className="hidden lg:flex items-center gap-2.5 bg-gray-100 hover:bg-gray-200/80 transition-colors rounded-xl px-4 py-2.5 text-sm text-gray-400 w-72 xl:w-96"
        onClick={() => {/* TODO: open command palette */}}
      >
        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className="flex-1 text-left">Search for groups, friends...</span>
        <kbd className="text-[10px] bg-white border border-gray-300 rounded-md px-1.5 py-0.5 font-mono text-gray-400">
          ⌘K
        </kbd>
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Desktop: Friends link */}
      <Link
        to="/friends"
        className="hidden lg:flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Friends
      </Link>

      {/* Notifications bell */}
      <Link
        to="/notifications"
        className="relative p-2 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all"
        aria-label="Notifications"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold px-0.5">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Link>

      {/* User menu */}
      <div ref={menuRef} className="relative">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <Avatar name={user?.name ?? 'User'} src={user?.avatarUrl} size="sm" />
          <span className="hidden lg:block text-sm font-medium text-gray-900 max-w-[120px] truncate">
            {user?.name ?? 'User'}
          </span>
          <svg
            className={`hidden lg:block w-4 h-4 text-gray-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-gray-200 rounded-xl shadow-lg shadow-gray-200/80 py-1 z-50">
            <div className="px-3.5 py-2.5 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
            <Link
              to="/profile"
              className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Profile
            </Link>
            <div className="border-t border-gray-100 mt-1 pt-1">
              <button
                onClick={() => { logout.mutate(); setMenuOpen(false); }}
                className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Log Out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
