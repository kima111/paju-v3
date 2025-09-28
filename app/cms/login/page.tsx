'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CMSLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/cms/dashboard');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch {
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl font-light tracking-tight mb-4">
            PAJU CMS
          </h1>
          <div className="w-16 h-px bg-white/30 mx-auto"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-900/20 border border-red-600/30 text-red-400 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="username" className="block text-xs tracking-wider uppercase text-white/60 mb-2">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 focus:border-white/30 focus:outline-none text-white"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs tracking-wider uppercase text-white/60 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 focus:border-white/30 focus:outline-none text-white"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-white text-black py-3 px-4 text-xs tracking-wider uppercase transition-all duration-300 hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs text-white/40">
            Default credentials: admin / admin123
          </p>
        </div>
      </div>
    </div>
  );
}