import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '../auth.api';
import toast from 'react-hot-toast';
import { Logo } from '@components/ui/Logo';

const schema = z.object({
  password: z.string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Include at least one uppercase letter')
    .regex(/[0-9]/, 'Include at least one number'),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, {
  message: "Passwords don't match",
  path: ['confirm'],
});
type FormData = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const [params]  = useSearchParams();
  const navigate  = useNavigate();
  const token     = params.get('token') ?? '';

  const [showPw, setShowPw]         = useState(false);
  const [showCf, setShowCf]         = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]       = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  });

  const pw = watch('password', '');
  const rules = [
    { label: 'At least 8 characters', ok: pw.length >= 8 },
    { label: 'One uppercase letter',  ok: /[A-Z]/.test(pw) },
    { label: 'One number',            ok: /[0-9]/.test(pw) },
  ];

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-5">
        <Logo variant="dark" />
        <div className="mt-10 w-full max-w-sm">
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/80 px-8 py-10 text-center">
            <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Invalid link</h2>
            <p className="text-sm text-gray-500 mt-2">
              This password reset link is missing or invalid. Request a new one.
            </p>
            <Link
              to="/forgot-password"
              className="block mt-7 w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3.5 rounded-xl transition-colors text-sm text-center shadow-lg shadow-teal-600/25"
            >
              Request reset link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-5">
        <Logo variant="dark" />
        <div className="mt-10 w-full max-w-sm">
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/80 px-8 py-10 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Password reset!</h2>
            <p className="text-sm text-gray-500 mt-2">
              Your password has been updated. You can now log in with your new password.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="mt-7 w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3.5 rounded-xl transition-colors shadow-lg shadow-teal-600/25 text-sm"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  async function onSubmit(data: FormData) {
    setSubmitting(true);
    try {
      await authApi.resetPassword(token, data.password);
      setSuccess(true);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? '';
      if (msg.toLowerCase().includes('expired') || msg.toLowerCase().includes('invalid')) {
        toast.error('This reset link has expired. Please request a new one.');
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* ── Left panel (lg+) ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-teal-700 flex-col px-12 py-10 relative overflow-hidden">
        <div className="absolute -top-28 -left-28 w-96 h-96 bg-teal-600/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-28 -right-28 w-96 h-96 bg-teal-900/50 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full">
          <Logo variant="light" />

          <div className="mt-14">
            <h1 className="text-[2.6rem] font-bold text-white leading-tight tracking-tight">
              New password,<br />same squad.
            </h1>
            <p className="text-teal-200 mt-4 text-lg leading-relaxed">
              Choose something strong so your<br />account stays secure.
            </p>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col gap-5 w-full max-w-xs">
              {[
                'At least 8 characters long',
                'One uppercase letter (A–Z)',
                'At least one number (0–9)',
              ].map((label) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-teal-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-teal-100 text-sm">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="w-full lg:w-1/2 flex flex-col min-h-screen bg-gray-50">

        <div className="lg:hidden flex justify-center pt-10 pb-2">
          <Logo variant="dark" />
        </div>

        <div className="flex-1 flex items-center justify-center px-5 py-8">
          <div className="w-full max-w-sm">
            <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/80 px-8 py-10">

              <div className="text-center mb-7">
                <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Set new password</h2>
                <p className="text-sm text-gray-500 mt-1.5">Must be at least 8 characters.</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>

                {/* New password */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">New password</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </span>
                    <input
                      type={showPw ? 'text' : 'password'} autoComplete="new-password"
                      placeholder="Create a new password"
                      {...register('password')}
                      className={`w-full pl-11 pr-12 py-3 rounded-xl border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 placeholder:text-gray-400 transition-all ${errors.password ? 'border-red-400' : 'border-gray-300'}`}
                    />
                    <button type="button" tabIndex={-1} onClick={() => setShowPw((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                      {showPw ? (
                        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>

                  {pw.length > 0 && (
                    <div className="flex flex-col gap-1 mt-1">
                      {rules.map((r) => (
                        <div key={r.label} className="flex items-center gap-1.5">
                          <svg className={`w-3.5 h-3.5 shrink-0 ${r.ok ? 'text-green-500' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className={`text-xs ${r.ok ? 'text-green-600' : 'text-gray-400'}`}>{r.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Confirm password</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </span>
                    <input
                      type={showCf ? 'text' : 'password'} autoComplete="new-password"
                      placeholder="Repeat your password"
                      {...register('confirm')}
                      className={`w-full pl-11 pr-12 py-3 rounded-xl border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 placeholder:text-gray-400 transition-all ${errors.confirm ? 'border-red-400' : 'border-gray-300'}`}
                    />
                    <button type="button" tabIndex={-1} onClick={() => setShowCf((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                      {showCf ? (
                        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.confirm && <p className="text-xs text-red-500 pl-1">{errors.confirm.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-semibold py-3.5 rounded-xl transition-colors mt-1 text-sm disabled:opacity-60 shadow-lg shadow-teal-600/25 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Saving…
                    </>
                  ) : 'Reset Password'}
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-6">
                <Link to="/login" className="text-teal-600 hover:text-teal-700 font-semibold transition-colors">
                  Back to Login
                </Link>
              </p>
            </div>
          </div>
        </div>

        <div className="py-5 flex justify-center gap-6">
          <a href="#" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Privacy Policy</a>
          <a href="#" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Terms of Service</a>
        </div>
      </div>
    </div>
  );
}
