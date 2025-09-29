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
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: '400px', width: '100%', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', padding: '24px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: '0 0 8px 0' }}>PAJU CMS</h1>
            <p style={{ color: '#6b7280', margin: 0 }}>Content Management System</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label htmlFor="username" style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  color: '#111827',
                  backgroundColor: 'white',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                required
                autoComplete="username"
              />
            </div>

            <div>
              <label htmlFor="password" style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  color: '#111827',
                  backgroundColor: 'white',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                required
                autoComplete="current-password"
              />
            </div>

            {loginError && (
              <div style={{ color: '#dc2626', fontSize: '14px' }}>{loginError}</div>
            )}

            <button
              type="submit"
              style={{
                width: '100%',
                backgroundColor: '#2563eb',
                color: 'white',
                padding: '10px 16px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Login
            </button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <Link
              href="/"
              style={{ fontSize: '14px', color: '#6b7280', textDecoration: 'none' }}
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