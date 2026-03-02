'use client';

import { useState, type FormEvent } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { ArrowRight, ShieldCheck } from 'lucide-react';
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
    <div className="min-h-screen bg-[var(--bg)] px-4 py-6 md:px-6 md:py-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-7xl gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="hidden overflow-hidden rounded-[24px] border border-[var(--border)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--brand-primary)_10%,var(--surface-1)),color-mix(in_srgb,var(--surface-2)_86%,transparent))] p-8 shadow-[var(--shadow-soft)] lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-1)] px-3 py-1 text-xs font-medium text-[var(--text-2)]">
              <ShieldCheck size={14} />
              Admin workspace access
            </div>
            <h1 className="display-heading mt-6 max-w-xl text-5xl text-[var(--text-1)]">
              Manage interview content in a cleaner editorial workspace.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-[var(--text-2)]">
              Sign in to review question quality, update bilingual explanations, and maintain the interview library used by learners.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-5">
              <p className="text-xs uppercase tracking-[0.12em] text-[var(--text-3)]">Secure access</p>
              <p className="mt-3 text-sm leading-relaxed text-[var(--text-2)]">
                Only allowlisted admin accounts can enter the content workspace.
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] p-5">
              <p className="text-xs uppercase tracking-[0.12em] text-[var(--text-3)]">Fast workflow</p>
              <p className="mt-3 text-sm leading-relaxed text-[var(--text-2)]">
                Parse mixed drafts, review structured output, and publish updates without changing the learner experience.
              </p>
            </div>
          </div>
        </section>

        <div className="flex items-center justify-center">
          <Card className="w-full max-w-xl p-6 md:p-8">
            <div className="mb-6">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--text-3)]">
                Sign in
              </p>
              <h2 className="display-heading mt-2 text-3xl text-[var(--text-1)] md:text-4xl">
                Access the admin panel
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
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[var(--text-2)]">
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
                <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-[var(--text-2)]">
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
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
