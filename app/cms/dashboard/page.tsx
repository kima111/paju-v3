'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MenuManagement from '../../../components/cms/MenuManagement';
import HoursManagement from '../../../components/cms/HoursManagement';

export default function CMSDashboard() {
  const [activeTab, setActiveTab] = useState('menu');
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated (simple client-side check)
    // In production, you'd want a more robust auth check
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/menu/items');
        if (response.status === 401) {
          router.push('/cms/login');
        }
      } catch (error) {
        router.push('/cms/login');
      }
    };
    
    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/cms/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

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