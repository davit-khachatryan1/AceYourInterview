'use client';

import { useState, type FormEvent } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { LogIn, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
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
    <div className="min-h-screen bg-[var(--bg)] px-4 py-10 md:px-6 md:py-14">
      <div className="mx-auto grid w-full max-w-6xl gap-6 md:grid-cols-[1.2fr_1fr]">
        <section className="panel-surface hidden p-8 md:block">
          <div className="inline-flex items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-3)]">
            <ShieldCheck size={12} />
            Restricted Access
          </div>
          <h1 className="display-heading mt-4 text-5xl">AceYourInterview Admin</h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-[var(--text-2)]">
            Sign in with an allowlisted account to manage bilingual questions, examples, and quality controls.
          </p>
        </section>

        <section className="panel-surface p-6 md:p-7">
          <h2 className="display-heading text-4xl">Sign In</h2>
          <p className="mt-1 text-sm text-[var(--text-2)]">Only allowlisted admin accounts can enter.</p>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            {error && (
              <p className="rounded-xl border border-[color-mix(in_srgb,var(--burnt-tangerine)_45%,var(--border))] bg-[color-mix(in_srgb,var(--burnt-tangerine)_16%,transparent)] p-2.5 text-sm text-[var(--text-1)]">
                {error}
              </p>
            )}

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm text-[var(--text-2)]">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="search-input w-full"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm text-[var(--text-2)]">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="search-input w-full"
                autoComplete="current-password"
                required
              />
            </div>

            <button type="submit" disabled={isLoggingIn} className="btn-primary inline-flex w-full items-center justify-center gap-2 py-2.5 text-sm font-semibold">
              <LogIn size={15} />
              {isLoggingIn ? 'Signing in...' : 'Login'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default LoginPage;
