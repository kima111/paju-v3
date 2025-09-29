'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import type { MenuItem } from '../lib/database';

interface DynamicMenuProps {
  menuType?: 'breakfast' | 'lunch' | 'dinner';
  limit?: number;
}

export default function DynamicMenu({ menuType, limit }: DynamicMenuProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMenuItems = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/menu/items');
      
      if (!response.ok) {
        throw new Error('Failed to fetch menu items');
      }

      const data = await response.json();
      let filteredItems = data.filter((item: MenuItem) => item.isAvailable);
      
      // Filter by menu type if specified
      if (menuType) {
        filteredItems = filteredItems.filter((item: MenuItem) => item.menuType === menuType);
      }
      
      // Limit items if specified
      if (limit) {
        filteredItems = filteredItems.slice(0, limit);
      }
      
      setMenuItems(filteredItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching menu items:', err);
    } finally {
      setLoading(false);
    }
  }, [menuType, limit]);

  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-16">
        {Array.from({ length: limit || 6 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="aspect-square bg-zinc-800 mb-8 rounded-sm"></div>
            <div className="space-y-4">
              <div className="h-6 bg-zinc-800 rounded w-3/4"></div>
              <div className="h-4 bg-zinc-800 rounded w-full"></div>
              <div className="h-4 bg-zinc-800 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-white/60 text-sm">Unable to load menu items</p>
        <button 
          onClick={fetchMenuItems}
          className="mt-4 text-white/80 hover:text-white text-xs tracking-wider uppercase underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (menuItems.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-white/60 text-sm">No menu items available at this time</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-16">
      {menuItems.map((item) => (
        <div key={item.id} className="group cursor-pointer">
          <div className="relative aspect-square bg-zinc-900 mb-8 overflow-hidden rounded-sm">
            {item.imageUrl ? (
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-85 group-hover:opacity-100"
                onError={(e) => {
                  // Fallback to placeholder if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                <span className="text-zinc-600 text-sm">No Image</span>
              </div>
            )}
          </div>
          <div className="space-y-4">
            <h3 className="font-light text-xl tracking-wide">{item.title}</h3>
            <p className="text-white/60 text-sm leading-loose">{item.description}</p>
            <div className="flex justify-between items-center">
              <div className="text-white/40 text-xs tracking-wider">${item.price}</div>
              {item.category && (
                <div className="text-white/30 text-xs tracking-wider uppercase">
                  {item.category}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}