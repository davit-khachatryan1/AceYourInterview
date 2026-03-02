'use client';

import { useState, type FormEvent } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { ArrowRight, BookOpen, Lock, ShieldCheck, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { auth } from '@/lib/firebase';

const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoggingIn(true);
    setError(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace('/admin');
    } catch (loginError) {
      setError((loginError as Error).message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-1)]">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">

        {/* ── Left hero panel ── */}
        <section className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between">
          {/* Orb glows */}
          <div
            className="pointer-events-none absolute -right-24 -top-24 h-[480px] w-[480px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.28) 0%, transparent 70%)', filter: 'blur(72px)' }}
          />
          <div
            className="pointer-events-none absolute -bottom-16 left-0 h-80 w-80 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.22) 0%, transparent 70%)', filter: 'blur(60px)' }}
          />
          <div
            className="pointer-events-none absolute left-1/3 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)', filter: 'blur(50px)' }}
          />

          {/* Subtle gradient overlay on the panel */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: 'linear-gradient(160deg, rgba(124,58,237,0.07) 0%, rgba(236,72,153,0.04) 50%, transparent 100%)' }}
          />

          {/* Border on the right */}
          <div className="absolute inset-y-0 right-0 w-px bg-[var(--border)]" />

          {/* Content */}
          <div className="relative px-8 py-10 xl:px-12">
            {/* Brand badge */}
            <div className="mb-10 inline-flex items-center gap-2.5">
              <div
                className="grid h-9 w-9 place-items-center rounded-xl text-white"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#ec4899)', boxShadow: '0 0 18px rgba(124,58,237,0.5)' }}
              >
                <BookOpen size={16} />
              </div>
              <span
                className="text-sm font-bold"
                style={{ background: 'linear-gradient(135deg,#a78bfa,#f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
              >
                AceYourInterview
              </span>
            </div>

            {/* Status pill */}
            <div
              className="mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold"
              style={{ borderColor: 'rgba(167,139,250,0.3)', background: 'rgba(124,58,237,0.1)', color: '#a78bfa' }}
            >
              <ShieldCheck size={12} />
              Admin workspace access
            </div>

            {/* Hero heading */}
            <h1 className="display-heading max-w-xl text-5xl">
              <span style={{ background: 'linear-gradient(135deg,#f1f5f9 20%,#a78bfa 70%,#f472b6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Keep the interview library accurate, structured, and easy to maintain.
              </span>
            </h1>

            <p className="mt-5 max-w-lg text-base leading-relaxed text-[var(--text-2)]">
              Sign in to review bilingual content, parse mixed drafts into structured fields, and update the question library without changing the learner-facing flow.
            </p>
          </div>

          {/* Bottom info cards */}
          <div className="relative grid gap-4 px-8 pb-10 md:grid-cols-2 xl:px-12">
            <div
              className="rounded-[20px] border p-5"
              style={{ borderColor: 'rgba(124,58,237,0.25)', background: 'rgba(124,58,237,0.08)' }}
            >
              <div
                className="mb-3 grid h-9 w-9 place-items-center rounded-xl"
                style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.25)' }}
              >
                <Lock size={15} style={{ color: '#a78bfa' }} />
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.12em]" style={{ color: '#a78bfa' }}>Protected access</p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-2)]">
                Only authenticated admin accounts can enter the content workspace.
              </p>
            </div>

            <div
              className="rounded-[20px] border p-5"
              style={{ borderColor: 'rgba(236,72,153,0.22)', background: 'rgba(236,72,153,0.07)' }}
            >
              <div
                className="mb-3 grid h-9 w-9 place-items-center rounded-xl"
                style={{ background: 'rgba(236,72,153,0.12)', border: '1px solid rgba(236,72,153,0.22)' }}
              >
                <Zap size={15} style={{ color: '#f472b6' }} />
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.12em]" style={{ color: '#f472b6' }}>Publishing flow</p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-2)]">
                Parse, review, and save structured questions while preserving the public site output.
              </p>
            </div>
          </div>
        </section>

        {/* ── Right login form ── */}
        <section className="relative flex items-center justify-center overflow-hidden px-4 py-8 md:px-6">
          {/* Subtle pink orb behind form */}
          <div
            className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full opacity-40"
            style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.2) 0%, transparent 70%)', filter: 'blur(50px)' }}
          />

          <Card className="relative w-full max-w-lg p-6 md:p-8">
            {/* Gradient top accent line */}
            <div
              className="absolute inset-x-0 top-0 h-[2px] rounded-t-[var(--radius-xl)]"
              style={{ background: 'linear-gradient(90deg,#7c3aed,#ec4899)' }}
            />

            <div className="mb-6">
              {/* Icon */}
              <div
                className="mb-4 grid h-12 w-12 place-items-center rounded-2xl text-white"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#ec4899)', boxShadow: '0 0 22px rgba(124,58,237,0.45)' }}
              >
                <ShieldCheck size={22} />
              </div>

              {/* Badge */}
              <div
                className="mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold"
                style={{ borderColor: 'rgba(124,58,237,0.28)', background: 'rgba(124,58,237,0.09)', color: '#a78bfa' }}
              >
                <ShieldCheck size={12} />
                Sign in
              </div>

              {/* Heading */}
              <h2 className="display-heading text-3xl md:text-4xl">
                Access the{' '}
                <span style={{ background: 'linear-gradient(135deg,#a78bfa,#f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  admin panel
                </span>
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[var(--text-2)]">
                Use your Firebase email and password to continue to the question control center.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <p className="rounded-2xl border border-[var(--status-warning-border)] bg-[var(--status-warning-bg)] p-3 text-sm text-[var(--text-1)]">
                  {error}
                </p>
              )}

              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-[var(--text-1)]">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-[var(--text-1)]">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>

              <Button type="submit" disabled={isLoggingIn} className="mt-2 w-full">
                {isLoggingIn ? 'Signing in...' : 'Sign In'}
                <ArrowRight size={15} />
              </Button>
            </form>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default LoginPage;
