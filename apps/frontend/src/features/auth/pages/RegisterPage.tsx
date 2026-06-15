import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRegister } from '@hooks/useAuth';
import { Logo } from '@components/ui/Logo';

const schema = z.object({
  name:     z.string().min(2, 'At least 2 characters').max(50),
  username: z.string().min(3, 'At least 3 characters').max(30)
              .regex(/^[a-z0-9_]+$/, 'Lowercase letters, numbers and _ only'),
  email:    z.string().email('Enter a valid email'),
  password: z.string()
              .min(8, 'At least 8 characters')
              .regex(/[A-Z]/, 'Include at least one uppercase letter')
              .regex(/[0-9]/, 'Include at least one number'),
});
type FormData = z.infer<typeof schema>;

function FieldIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
      {children}
    </span>
  );
}

export default function RegisterPage() {
  const [showPw, setShowPw] = useState(false);
  const register_ = useRegister();

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
              Join your squad.<br />Split smarter.
            </h1>
            <p className="text-teal-200 mt-4 text-lg leading-relaxed">
              Track shared expenses, settle up<br />instantly and keep everyone happy.
            </p>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col gap-5 w-full max-w-xs">
              {[
                { icon: 'M12 4v16m8-8H4', title: 'Add expenses instantly', desc: 'Log bills in seconds, split any way you like' },
                { icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', title: 'Always balanced', desc: 'Smart debt simplification keeps it fair' },
                { icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', title: 'Settle with UPI', desc: 'Generate payment links right in the app' },
              ].map((f) => (
                <div key={f.title} className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-4.5 h-4.5 text-teal-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={f.icon} />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{f.title}</p>
                    <p className="text-teal-300 text-xs mt-0.5">{f.desc}</p>
                  </div>
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
                <h2 className="text-2xl font-bold text-gray-900">Create account</h2>
                <p className="text-sm text-gray-500 mt-1.5">Join SquadSplit — it's free</p>
              </div>

              <form onSubmit={handleSubmit((d) => register_.mutate(d))} className="flex flex-col gap-4" noValidate>

                {/* Full name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Full name</label>
                  <div className="relative">
                    <FieldIcon>
                      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </FieldIcon>
                    <input
                      type="text" autoComplete="name" placeholder="Your full name"
                      {...register('name')}
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 placeholder:text-gray-400 transition-all ${errors.name ? 'border-red-400' : 'border-gray-300'}`}
                    />
                  </div>
                  {errors.name && <p className="text-xs text-red-500 pl-1">{errors.name.message}</p>}
                </div>

                {/* Username */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Username</label>
                  <div className="relative">
                    <FieldIcon>
                      <span className="text-sm font-medium">@</span>
                    </FieldIcon>
                    <input
                      type="text" autoComplete="username" placeholder="your_username"
                      {...register('username')}
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 placeholder:text-gray-400 transition-all ${errors.username ? 'border-red-400' : 'border-gray-300'}`}
                    />
                  </div>
                  {errors.username && <p className="text-xs text-red-500 pl-1">{errors.username.message}</p>}
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <div className="relative">
                    <FieldIcon>
                      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </FieldIcon>
                    <input
                      type="email" autoComplete="email" placeholder="you@example.com"
                      {...register('email')}
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 placeholder:text-gray-400 transition-all ${errors.email ? 'border-red-400' : 'border-gray-300'}`}
                    />
                  </div>
                  {errors.email && <p className="text-xs text-red-500 pl-1">{errors.email.message}</p>}
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Password</label>
                  <div className="relative">
                    <FieldIcon>
                      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </FieldIcon>
                    <input
                      type={showPw ? 'text' : 'password'} autoComplete="new-password"
                      placeholder="Create a password"
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

                  {/* Password strength checklist */}
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

                <button
                  type="submit"
                  disabled={register_.isPending}
                  className="w-full bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-semibold py-3.5 rounded-xl transition-colors mt-1 text-sm disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-teal-600/25 flex items-center justify-center gap-2"
                >
                  {register_.isPending ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Creating account…
                    </>
                  ) : 'Create Account'}
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-6">
                Already have an account?{' '}
                <Link to="/login" className="text-teal-600 hover:text-teal-700 font-semibold transition-colors">
                  Sign In
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
