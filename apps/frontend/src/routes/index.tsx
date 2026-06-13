import { createBrowserRouter, Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuthStore } from '@store/auth.store';

// Layouts
import AppLayout from '@components/layout/AppLayout';

// Auth pages
import LoginPage          from '@features/auth/pages/LoginPage';
import RegisterPage       from '@features/auth/pages/RegisterPage';
import ForgotPasswordPage from '@features/auth/pages/ForgotPasswordPage';
import ResetPasswordPage  from '@features/auth/pages/ResetPasswordPage';
import VerifyEmailPage    from '@features/auth/pages/VerifyEmailPage';
import JoinGroupPage      from '@features/groups/pages/JoinGroupPage';

// App pages
import DashboardPage     from '@features/dashboard/pages/DashboardPage';
import GroupsPage        from '@features/groups/pages/GroupsPage';
import GroupDetailPage   from '@features/groups/pages/GroupDetailPage';
import ExpenseDetailPage from '@features/expenses/pages/ExpenseDetailPage';
import SettlementsPage   from '@features/settlements/pages/SettlementsPage';
import NotificationsPage from '@features/notifications/pages/NotificationsPage';
import ActivityPage      from '@features/activity/pages/ActivityPage';
import ProfilePage       from '@features/profile/pages/ProfilePage';
import FriendsPage       from '@features/friends/pages/FriendsPage';

function RequireAuth({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function RequireGuest({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <Navigate to="/" replace /> : <>{children}</>;
}

export const router = createBrowserRouter([
  // ─── Auth routes (guest only) ──────────────────────────────────────────────
  {
    path: '/login',
    element: <RequireGuest><LoginPage /></RequireGuest>,
  },
  {
    path: '/register',
    element: <RequireGuest><RegisterPage /></RequireGuest>,
  },
  {
    path: '/forgot-password',
    element: <RequireGuest><ForgotPasswordPage /></RequireGuest>,
  },
  {
    path: '/reset-password',
    element: <RequireGuest><ResetPasswordPage /></RequireGuest>,
  },
  {
    path: '/verify-email',
    element: <RequireGuest><VerifyEmailPage /></RequireGuest>,
  },
  {
    path: '/join/:code',
    element: <JoinGroupPage />,
  },

  // ─── Protected app routes ──────────────────────────────────────────────────
  {
    element: <RequireAuth><AppLayout /></RequireAuth>,
    children: [
      { index: true,                   element: <DashboardPage /> },
      { path: 'groups',                element: <GroupsPage /> },
      { path: 'groups/:groupId',       element: <GroupDetailPage /> },
      { path: 'expenses/:expenseId',   element: <ExpenseDetailPage /> },
      { path: 'settlements',           element: <SettlementsPage /> },
      { path: 'notifications',         element: <NotificationsPage /> },
      { path: 'activity',              element: <ActivityPage /> },
      { path: 'friends',               element: <FriendsPage /> },
      { path: 'profile',               element: <ProfilePage /> },
    ],
  },

  // ─── Fallback ──────────────────────────────────────────────────────────────
  { path: '*', element: <Navigate to="/" replace /> },
]);
