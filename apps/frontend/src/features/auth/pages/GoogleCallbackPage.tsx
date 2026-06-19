import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@store/auth.store';

export default function GoogleCallbackPage() {
  const setAuth  = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  useEffect(() => {
    const hash   = window.location.hash.slice(1);
    const params = new URLSearchParams(hash);

    const accessToken  = params.get('accessToken');
    const refreshToken = params.get('refreshToken');
    const userStr      = params.get('user');

    if (accessToken && refreshToken && userStr) {
      try {
        const user = JSON.parse(userStr);
        setAuth(user, accessToken, refreshToken);
        const redirect = sessionStorage.getItem('redirectAfterLogin');
        if (redirect) { sessionStorage.removeItem('redirectAfterLogin'); navigate(redirect, { replace: true }); }
        else navigate('/', { replace: true });
        return;
      } catch { /* fall through to error redirect */ }
    }

    navigate('/login?error=google_auth_failed', { replace: true });
  }, [setAuth, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex items-center gap-3 text-gray-500">
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        Completing sign in...
      </div>
    </div>
  );
}