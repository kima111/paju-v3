'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import HoursManagement from '../../../components/cms/HoursManagement';

export default function HoursCMSPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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
      } else {
        router.push('/cms');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/cms');
    } finally {
      setIsLoading(false);
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
    return null;
  }

  return (
    <div className="min-h-screen bg-black">
      <header className="bg-zinc-900 shadow-sm border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <a href="/cms" className="text-white/60 hover:text-white">
                ← Back to CMS
              </a>
              <h1 className="text-xl font-semibold text-white">Restaurant Hours</h1>
            </div>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-white"
            >
              View Website
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <HoursManagement />
      </main>
    </div>
  );
}