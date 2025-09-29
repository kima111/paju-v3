'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CategoryForm from '../../../components/cms/CategoryForm';

export default function CategoriesCMSPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchCategories();
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

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/menu/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
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
              <h1 className="text-xl font-semibold text-white">Menu Categories</h1>
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
        <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Current Categories</h2>
          <p className="text-white/60 mb-6">
            Categories are managed through the Menu Management section. When you add menu items, 
            you can create new categories or use existing ones.
          </p>
          
          {categories.length === 0 ? (
            <p className="text-white/50">No categories available. Add menu items to create categories.</p>
          ) : (
            <div className="space-y-2">
              {categories.map((category, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-zinc-800 rounded-md"
                >
                  <span className="font-medium text-white">{category}</span>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-6">
            <a
              href="/cms/menu"
              className="inline-flex items-center px-4 py-2 bg-white text-black rounded-md hover:bg-white/90"
            >
              Manage Menu Items & Categories
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}