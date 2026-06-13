import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { groupsApi } from '../groups.api';
import { useAuthStore } from '@store/auth.store';

export default function JoinGroupPage() {
  const { code }   = useParams<{ code: string }>();
  const navigate   = useNavigate();
  const isAuth     = useAuthStore((s) => s.isAuthenticated);

  const [status, setStatus] = useState<'joining' | 'success' | 'already' | 'error'>('joining');
  const [groupName, setGroupName] = useState('');

  useEffect(() => {
    if (!isAuth) {
      // Save the join URL so we can redirect back after login
      sessionStorage.setItem('redirectAfterLogin', `/join/${code}`);
      navigate('/login', { replace: true });
      return;
    }
    if (!code) { setStatus('error'); return; }

    groupsApi.joinByInvite(code)
      .then((group: any) => {
        setGroupName(group?.name ?? 'the group');
        setStatus('success');
        setTimeout(() => navigate(`/groups/${group.id}`, { replace: true }), 2000);
      })
      .catch((err: any) => {
        const msg = err?.response?.data?.message ?? '';
        if (msg.toLowerCase().includes('already')) setStatus('already');
        else setStatus('error');
      });
  }, [code, isAuth]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-5">

      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-10">
        <div className="w-10 h-10 rounded-xl bg-teal-600 shadow-sm flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <span className="text-xl font-bold text-gray-900">Squad<span className="text-teal-600">Split</span></span>
      </div>

      <div className="w-full max-w-sm">
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/80 px-8 py-10 text-center">

          {status === 'joining' && (
            <>
              <svg className="animate-spin w-10 h-10 text-teal-600 mx-auto mb-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <p className="text-gray-600 font-medium">Joining group…</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">You're in!</h2>
              <p className="text-sm text-gray-500 mt-2">You joined <span className="font-semibold text-gray-700">{groupName}</span>. Redirecting…</p>
            </>
          )}

          {status === 'already' && (
            <>
              <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-5">
                <svg className="w-8 h-8 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Already a member</h2>
              <p className="text-sm text-gray-500 mt-2">You're already in this group.</p>
              <Link to="/groups" className="block mt-6 w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm">
                Go to Groups
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Invalid invite link</h2>
              <p className="text-sm text-gray-500 mt-2">This link may have expired or doesn't exist.</p>
              <Link to="/" className="block mt-6 w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm">
                Go to Dashboard
              </Link>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
