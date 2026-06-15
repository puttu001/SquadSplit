import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLogin } from '@hooks/useAuth';

const schema = z.object({
  email:    z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
type FormData = z.infer<typeof schema>;

// ─── Logo ─────────────────────────────────────────────────────────────────────
function Logo({ variant = 'light' }: { variant?: 'light' | 'dark' }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center
        ${variant === 'light' ? 'bg-white/20' : 'bg-teal-600 shadow-sm'}`}>
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <span className={`text-xl font-bold ${variant === 'light' ? 'text-white' : 'text-gray-900'}`}>
        Squad<span className={variant === 'light' ? 'text-teal-200' : 'text-teal-600'}>Split</span>
      </span>
    </div>
  );
}

// ─── Illustration SVG ─────────────────────────────────────────────────────────
function SquadIllustration() {
  return (
    <svg
      viewBox="0 0 400 270"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-sm mx-auto"
      aria-hidden="true"
    >
      {/* Ground shadow */}
      <ellipse cx="200" cy="224" rx="165" ry="50" fill="rgba(255,255,255,0.05)" />

      {/* ── Floating badge: Clipboard (left) ─────────────────────────────── */}
      <rect x="34" y="20" width="56" height="56" rx="15" fill="rgba(255,255,255,0.15)" />
      <rect x="49" y="31" width="26" height="34" rx="3" fill="white" opacity="0.95" />
      <rect x="55" y="28" width="14" height="9" rx="4.5"
        fill="white" opacity="0.9" stroke="#0d9488" strokeWidth="1.5" />
      <line x1="54" y1="44" x2="70" y2="44" stroke="#0d9488" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="54" y1="50" x2="70" y2="50" stroke="#0d9488" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="54" y1="56" x2="64" y2="56" stroke="#14b8a6" strokeWidth="1.5" strokeLinecap="round" />

      {/* ── Floating badge: Rupee (center) ───────────────────────────────── */}
      <rect x="172" y="6" width="56" height="56" rx="15" fill="rgba(255,255,255,0.15)" />
      <circle cx="200" cy="34" r="20" fill="white" opacity="0.92" />
      <text x="200" y="42" textAnchor="middle" fill="#0f766e"
        fontSize="22" fontWeight="700" fontFamily="system-ui,sans-serif">₹</text>

      {/* ── Floating badge: People (right) ───────────────────────────────── */}
      <rect x="310" y="20" width="56" height="56" rx="15" fill="rgba(255,255,255,0.15)" />
      <circle cx="328" cy="44" r="9"  fill="white" opacity="0.92" />
      <path d="M315 66 Q315 55 328 55 Q341 55 341 66" fill="white" opacity="0.92" />
      <circle cx="342" cy="43" r="8"  fill="white" opacity="0.70" />
      <path d="M330 65 Q330 55 342 55 Q354 55 354 65" fill="white" opacity="0.70" />

      {/* ── Table ────────────────────────────────────────────────────────── */}
      <rect x="52" y="204" width="296" height="11" rx="5.5" fill="rgba(255,255,255,0.28)" />
      <rect x="80"  y="215" width="11" height="32" rx="5.5" fill="rgba(255,255,255,0.18)" />
      <rect x="309" y="215" width="11" height="32" rx="5.5" fill="rgba(255,255,255,0.18)" />

      {/* ── Person 1 — left (teal hoodie, holding phone) ─────────────────── */}
      <circle cx="104" cy="150" r="27" fill="#F4A261" />
      <path d="M79 148 Q79 120 104 118 Q129 120 129 148" fill="#292524" />
      <rect x="98" y="174" width="12" height="13" rx="3" fill="#F4A261" />
      <path d="M70 204 L82 176 Q104 168 126 176 L138 204 Z" fill="#0d9488" />
      <rect x="96" y="188" width="16" height="13" rx="4" fill="#0a7a70" />
      {/* Phone */}
      <rect x="130" y="172" width="14" height="24" rx="3" fill="#1f2937" />
      <rect x="132" y="174" width="10" height="18" rx="2" fill="#60a5fa" opacity="0.55" />

      {/* ── Person 2 — center (yellow top, long hair, pointing) ──────────── */}
      {/* Long hair strands (drawn before head so head overlaps them) */}
      <path d="M172 137 C170 158 170 180 172 204"
        stroke="#1c1917" strokeWidth="11" strokeLinecap="round" fill="none" />
      <path d="M228 137 C230 158 230 180 228 204"
        stroke="#1c1917" strokeWidth="11" strokeLinecap="round" fill="none" />
      <circle cx="200" cy="140" r="31" fill="#FBBF24" />
      <path d="M172 137 Q172 107 200 104 Q228 107 228 137" fill="#1c1917" />
      <rect x="194" y="168" width="12" height="13" rx="3" fill="#FBBF24" />
      <path d="M160 204 L172 172 Q200 163 228 172 L240 204 Z" fill="#f59e0b" />
      {/* Pointing arm */}
      <path d="M228 179 Q250 167 262 160"
        stroke="#F4A261" strokeWidth="14" strokeLinecap="round" fill="none" />

      {/* ── Person 3 — right (blue hoodie) ───────────────────────────────── */}
      <circle cx="296" cy="150" r="27" fill="#FDDCB5" />
      <path d="M271 148 Q271 120 296 118 Q321 120 321 148" fill="#374151" />
      <rect x="290" y="174" width="12" height="13" rx="3" fill="#FDDCB5" />
      <path d="M262 204 L274 176 Q296 168 318 176 L330 204 Z" fill="#3b82f6" />
      <path d="M290 176 L296 188 L302 176" fill="#2563eb" />

      {/* ── Receipt on table ─────────────────────────────────────────────── */}
      <rect x="166" y="162" width="68" height="52" rx="5" fill="white" opacity="0.97" />
      <rect x="166" y="162" width="68" height="11" rx="5" fill="#99f6e4" />
      <rect x="166" y="168" width="68" height="5"  fill="#99f6e4" />
      <line x1="174" y1="181" x2="226" y2="181" stroke="#e5e7eb" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="174" y1="188" x2="218" y2="188" stroke="#e5e7eb" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="174" y1="195" x2="226" y2="195" stroke="#e5e7eb" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="174" y1="201" x2="226" y2="201" stroke="#0d9488" strokeWidth="1"   strokeLinecap="round" />
      <text x="175" y="210" fontSize="7.5" fill="#0f766e" fontWeight="700"
        fontFamily="system-ui,sans-serif">Total  ₹120.00</text>
    </svg>
  );
}

// ─── Feature item ─────────────────────────────────────────────────────────────
const FEATURES = [
  {
    label: 'Secure',
    desc:  'Your data is safe with us',
    icon: (
      <svg className="w-5 h-5 text-teal-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    label: 'Fast & Simple',
    desc:  'Split bills in just a few taps',
    icon: (
      <svg className="w-5 h-5 text-teal-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    label: 'Made for Groups',
    desc:  'Perfect for trips, roommates & more',
    icon: (
      <svg className="w-5 h-5 text-teal-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
] as const;

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const [showPw, setShowPw] = useState(false);
  const login = useLogin();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  return (
    <div className="min-h-screen flex">

      {/* ════════════════════════════════════════════════════════════════════
          LEFT PANEL — visible on lg+ only
      ════════════════════════════════════════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-1/2 bg-teal-700 flex-col px-12 py-10 relative overflow-hidden">
        {/* Decorative blurred circles */}
        <div className="absolute -top-28 -left-28 w-96 h-96 bg-teal-600/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-28 -right-28 w-96 h-96 bg-teal-900/50 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full">
          {/* Logo */}
          <Logo variant="light" />

          {/* Headline */}
          <div className="mt-14">
            <h1 className="text-[2.6rem] font-bold text-white leading-tight tracking-tight">
              Split expenses.<br />Stay friends.
            </h1>
            <p className="text-teal-200 mt-4 text-lg leading-relaxed">
              Easily split bills, track expenses<br />and settle up with your squad.
            </p>
          </div>

          {/* Illustration */}
          <div className="flex-1 flex items-center justify-center py-4">
            <SquadIllustration />
          </div>

          {/* Feature badges */}
          <div className="flex gap-6">
            {FEATURES.map((f) => (
              <div key={f.label} className="flex items-start gap-2.5">
                <div className="mt-0.5">{f.icon}</div>
                <div>
                  <p className="text-white text-sm font-semibold">{f.label}</p>
                  <p className="text-teal-300 text-xs mt-0.5 leading-tight">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          RIGHT PANEL — full width on mobile, half on desktop
      ════════════════════════════════════════════════════════════════════ */}
      <div className="w-full lg:w-1/2 flex flex-col min-h-screen bg-gray-50">

        {/* Mobile-only logo */}
        <div className="lg:hidden flex justify-center pt-10 pb-2">
          <Logo variant="dark" />
        </div>

        {/* Centered form */}
        <div className="flex-1 flex items-center justify-center px-5 py-8">
          <div className="w-full max-w-sm">
            <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/80 px-8 py-10">

              {/* Card header */}
              <div className="text-center mb-7">
                <h2 className="text-2xl font-bold text-gray-900">Welcome back!</h2>
                <p className="text-sm text-gray-500 mt-1.5">Log in to your account to continue</p>
              </div>

              <form
                onSubmit={handleSubmit((data) => login.mutate(data))}
                className="flex flex-col gap-4"
                noValidate
              >
                {/* ── Email ── */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-[18px] h-[18px] text-gray-400" fill="none"
                        stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </span>
                    <input
                      type="email"
                      autoComplete="email"
                      placeholder="Enter your email"
                      {...register('email')}
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm bg-white
                        focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500
                        placeholder:text-gray-400 transition-all
                        ${errors.email ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : 'border-gray-300'}`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-500 pl-1">{errors.email.message}</p>
                  )}
                </div>

                {/* ── Password ── */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Password</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-[18px] h-[18px] text-gray-400" fill="none"
                        stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </span>
                    <input
                      type={showPw ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      {...register('password')}
                      className={`w-full pl-11 pr-12 py-3 rounded-xl border text-sm bg-white
                        focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500
                        placeholder:text-gray-400 transition-all
                        ${errors.password ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : 'border-gray-300'}`}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPw((v) => !v)}
                      aria-label={showPw ? 'Hide password' : 'Show password'}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400
                        hover:text-gray-600 transition-colors"
                    >
                      {showPw ? (
                        /* Eye-off */
                        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        /* Eye */
                        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-500 pl-1">{errors.password.message}</p>
                  )}
                </div>

                {/* Forgot password */}
                <div className="flex justify-end -mt-1">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>

                {/* API error */}
                {login.isError && (
                  <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                    <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-red-600">
                      {(login.error as { response?: { data?: { message?: string } } })
                        ?.response?.data?.message ?? 'Invalid email or password'}
                    </p>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={login.isPending}
                  className="w-full bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white
                    font-semibold py-3.5 rounded-xl transition-colors mt-1 text-sm
                    disabled:opacity-60 disabled:cursor-not-allowed
                    shadow-lg shadow-teal-600/25
                    flex items-center justify-center gap-2"
                >
                  {login.isPending ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10"
                          stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Signing in…
                    </>
                  ) : (
                    'Log In'
                  )}
                </button>
              </form>

              {/* Sign up */}
              <p className="text-center text-sm text-gray-500 mt-6">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="text-teal-600 hover:text-teal-700 font-semibold transition-colors"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="py-5 flex justify-center gap-6">
          <a href="#" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
            Privacy Policy
          </a>
          <a href="#" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
            Terms of Service
          </a>
          <a href="#" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
            Contact Us
          </a>
        </div>
      </div>

    </div>
  );
}
