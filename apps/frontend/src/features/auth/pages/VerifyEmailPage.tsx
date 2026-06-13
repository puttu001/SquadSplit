import { useState, useRef, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { authApi } from '../auth.api';
import toast from 'react-hot-toast';

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-10 h-10 rounded-xl bg-teal-600 shadow-sm flex items-center justify-center">
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <span className="text-xl font-bold text-gray-900">
        Squad<span className="text-teal-600">Split</span>
      </span>
    </div>
  );
}

export default function VerifyEmailPage() {
  const [params]  = useSearchParams();
  const navigate  = useNavigate();
  const email     = params.get('email') ?? '';

  const [digits, setDigits]         = useState(['', '', '', '', '', '']);
  const [verifying, setVerifying]   = useState(false);
  const [resending, setResending]   = useState(false);
  const [countdown, setCountdown]   = useState(0);
  const [error, setError]           = useState('');
  const inputRefs                   = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first box on mount
  useEffect(() => { inputRefs.current[0]?.focus(); }, []);

  // Resend countdown
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  function handleChange(index: number, value: string) {
    // Allow pasting full OTP
    if (value.length === 6 && /^\d{6}$/.test(value)) {
      const next = value.split('');
      setDigits(next);
      inputRefs.current[5]?.focus();
      return;
    }
    if (!/^\d*$/.test(value)) return; // digits only
    const next = [...digits];
    next[index] = value.slice(-1); // take last char if somehow multiple
    setDigits(next);
    setError('');
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const otp = digits.join('');
    if (otp.length < 6) { setError('Enter the 6-digit code from your email'); return; }
    if (!email)         { setError('Email missing — go back and register again'); return; }

    setVerifying(true);
    setError('');
    try {
      await authApi.verifyEmail(email, otp);
      toast.success('Email verified!');
      navigate('/login');
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Invalid or expired code';
      setError(msg);
      // Clear boxes on wrong code
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setVerifying(false);
    }
  }

  async function handleResend() {
    if (resending || countdown > 0 || !email) return;
    setResending(true);
    try {
      await authApi.resendVerification(email);
      toast.success('New code sent!');
      setCountdown(60);
      setDigits(['', '', '', '', '', '']);
      setError('');
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to resend code');
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-5">
      <Logo />

      <div className="mt-10 w-full max-w-sm">
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/80 px-8 py-10">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Check your email</h2>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
              We sent a 6-digit code to<br />
              <span className="font-semibold text-gray-700">{email || 'your email'}</span>
            </p>
          </div>

          {/* OTP boxes */}
          <form onSubmit={handleSubmit}>
            <div className="flex gap-2.5 justify-center mb-2">
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={d}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className={`w-11 h-13 text-center text-xl font-bold rounded-xl border-2 focus:outline-none transition-all
                    ${error ? 'border-red-400 bg-red-50' : d ? 'border-teal-500 bg-teal-50' : 'border-gray-200 bg-gray-50'}
                    focus:border-teal-500 focus:bg-white`}
                  style={{ height: '52px' }}
                />
              ))}
            </div>

            {error && (
              <p className="text-center text-xs text-red-500 mb-4">{error}</p>
            )}

            <button
              type="submit"
              disabled={verifying || digits.join('').length < 6}
              className="w-full mt-4 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-semibold py-3.5 rounded-xl transition-colors text-sm disabled:opacity-60 shadow-lg shadow-teal-600/25 flex items-center justify-center gap-2"
            >
              {verifying ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Verifying…
                </>
              ) : 'Verify Email'}
            </button>
          </form>

          {/* Resend */}
          <div className="mt-6 pt-5 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-400 mb-2">Didn't receive the code?</p>
            <button
              onClick={handleResend}
              disabled={resending || countdown > 0}
              className="text-sm font-semibold text-teal-600 hover:text-teal-700 disabled:text-gray-400 transition-colors"
            >
              {countdown > 0 ? `Resend in ${countdown}s` : resending ? 'Sending…' : 'Resend code'}
            </button>
          </div>

          <Link to="/login" className="block mt-4 text-center text-sm text-gray-400 hover:text-gray-600 transition-colors">
            Back to login
          </Link>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">Code expires in 15 minutes</p>
      </div>
    </div>
  );
}
