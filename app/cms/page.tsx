'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import MenuManagement from '../../components/cms/MenuManagement';
import HoursManagement from '../../components/cms/HoursManagement';

export default function CMSPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('menu');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/verify', {
        credentials: 'include',
      });
      if (response.ok) {
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        setIsAuthenticated(true);
        router.refresh();
      } else {
        const data = await response.json();
        setLoginError(data.error || 'Login failed');
      }
    } catch {
      setLoginError('Network error occurred');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      setIsAuthenticated(false);
      setUsername('');
      setPassword('');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-6">
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl font-light tracking-tight mb-4">
              PAJU CMS
            </h1>
            <div className="w-16 h-px bg-white/30 mx-auto"></div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {loginError && (
              <div className="bg-red-900/20 border border-red-600/30 text-red-400 px-4 py-3 rounded text-sm">
                {loginError}
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
                autoComplete="username"
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
                autoComplete="current-password"
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 focus:border-white/30 focus:outline-none text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-white text-black py-3 px-4 text-xs tracking-wider uppercase transition-all duration-300 hover:bg-white/90"
            >
              Login
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-white/40">
              Default credentials: admin / admin123
            </p>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/"
              className="text-xs text-white/40 hover:text-white/60 transition-colors"
            >
              ← Back to website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="font-display text-2xl font-light tracking-tight">
              PAJU CMS
            </h1>
            
            <div className="flex items-center space-x-6">
              <a 
                href="/" 
                target="_blank"
                className="text-xs tracking-wider uppercase text-white/60 hover:text-white transition-colors"
              >
                View Site
              </a>
              <button
                onClick={handleLogout}
                className="text-xs tracking-wider uppercase text-white/60 hover:text-white transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('menu')}
              className={`py-4 text-xs tracking-wider uppercase border-b-2 transition-colors ${
                activeTab === 'menu'
                  ? 'border-white text-white'
                  : 'border-transparent text-white/60 hover:text-white'
              }`}
            >
              Menu Management
            </button>
            <button
              onClick={() => setActiveTab('hours')}
              className={`py-4 text-xs tracking-wider uppercase border-b-2 transition-colors ${
                activeTab === 'hours'
                  ? 'border-white text-white'
                  : 'border-transparent text-white/60 hover:text-white'
              }`}
            >
              Restaurant Hours
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'menu' && <MenuManagement />}
        {activeTab === 'hours' && <HoursManagement />}
      </main>
    </div>
  );
}