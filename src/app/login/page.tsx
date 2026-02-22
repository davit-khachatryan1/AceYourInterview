import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { app } from '@/lib/firebase'; // Make sure app is exported from firebase.ts

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError(null);
    const auth = getAuth(app);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Redirect to admin page on successful login
      window.location.href = '/admin';
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-background flex items-center justify-center">
      <div className="max-w-md w-full bg-white/10 p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-white text-center mb-6">Admin Login</h1>
        <form onSubmit={handleLogin}>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <div className="mb-4">
            <label htmlFor="email" className="block text-white/80 mb-2">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-background border border-white/20 rounded-md p-2 text-white"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-white/80 mb-2">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-background border border-white/20 rounded-md p-2 text-white"
            />
          </div>
          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full bg-cobalt-blue text-white py-2 rounded-md hover:bg-opacity-90 transition-colors duration-200"
          >
            {isLoggingIn ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
