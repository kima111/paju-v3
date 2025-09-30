'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { MenuItem } from '../lib/database';

export default function MenuSection() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [enabledMenus, setEnabledMenus] = useState<('breakfast' | 'lunch' | 'dinner')[]>([]);
  const [activeMenu, setActiveMenu] = useState<'breakfast' | 'lunch' | 'dinner'>('dinner');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnabledMenus();
    fetchMenuItems();
  }, []);

  const fetchEnabledMenus = async () => {
    try {
      const response = await fetch('/api/menu/enabled');
      if (response.ok) {
        const menus = await response.json();
        setEnabledMenus(menus);
        // Set active menu to the first enabled menu, or dinner as fallback
        if (menus.length > 0) {
          setActiveMenu(menus.includes('dinner') ? 'dinner' : menus[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching enabled menus:', error);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const response = await fetch('/api/menu/items');
      if (response.ok) {
        const items = await response.json();
        setMenuItems(items.filter((item: MenuItem) => item.isAvailable));
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  // Only show items from enabled menus
  const filteredItems = menuItems.filter(item => 
    item.menuType === activeMenu && enabledMenus.includes(item.menuType)
  );
  const categories = [...new Set(filteredItems.map(item => item.category))];

  if (loading) {
    return (
      <section id="menu" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <div className="text-xs tracking-[0.3em] uppercase text-white/60 mb-6">Our Menu</div>
            <h2 className="font-display text-4xl md:text-5xl font-light">
              Loading Menu...
            </h2>
          </div>
        </div>
      </section>
    );
  }

  // If no menus are enabled, don't show the menu section
  if (enabledMenus.length === 0) {
    return (
      <section id="menu" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <div className="text-xs tracking-[0.3em] uppercase text-white/60 mb-6">Our Menu</div>
            <h2 className="font-display text-4xl md:text-5xl font-light">
              Menu Currently Unavailable
            </h2>
            <p className="text-white/40 mt-4">No menus are currently enabled. Please check back later.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="menu" className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="text-xs tracking-[0.3em] uppercase text-white/60 mb-6">Our Menu</div>
          <h2 className="font-display text-4xl md:text-5xl font-light mb-12">
            Culinary Excellence
          </h2>
          
          {/* Menu Type Selector - Only show enabled menus */}
          {enabledMenus.length > 1 && (
            <div className="flex justify-center space-x-8 mb-16">
              {enabledMenus.map(menuType => (
                <button
                  key={menuType}
                  onClick={() => setActiveMenu(menuType)}
                  className={`text-xs tracking-[0.3em] uppercase pb-2 border-b-2 transition-colors ${
                    activeMenu === menuType
                      ? 'border-white text-white'
                      : 'border-transparent text-white/60 hover:text-white'
                  }`}
                >
                  {menuType.charAt(0).toUpperCase() + menuType.slice(1)} Menu
                </button>
              ))}
            </div>
          )}
        </div>

        {filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-white/60">No {activeMenu} items available at this time.</p>
          </div>
        ) : (
          <div className="space-y-16">
            {categories.map(category => {
              const categoryItems = filteredItems.filter(item => item.category === category);
              const itemsWithImages = categoryItems.filter(item => item.imageUrl);
              const itemsWithoutImages = categoryItems.filter(item => !item.imageUrl);
              
              return (
                <div key={category}>
                  <h3 className="text-center text-2xl font-light text-white/80 mb-12">
                    {category}
                  </h3>
                  
                  {/* Grid layout for items WITH images - responsive */}
                  {itemsWithImages.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                      {itemsWithImages.map(item => (
                        <div key={item.id} className="group cursor-pointer">
                          <div className="relative aspect-square bg-zinc-900 mb-6 overflow-hidden rounded-sm">
                            <Image
                              src={item.imageUrl!}
                              alt={item.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-85 group-hover:opacity-100"
                            />
                          </div>
                          <div className="space-y-4">
                            <h4 className="font-light text-xl tracking-wide">{item.title}</h4>
                            <p className="text-white/60 text-sm leading-loose">{item.description}</p>
                            <div className="text-white/40 text-xs tracking-wider">${item.price}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Linear layout for items WITHOUT images - text-only format */}
                  {itemsWithoutImages.length > 0 && (
                    <div className="space-y-6">
                      {itemsWithoutImages.map(item => (
                        <div key={item.id} className="group cursor-pointer">
                          <div className="flex items-baseline justify-between mb-3">
                            <h4 className="font-light text-xl tracking-wide text-white flex-shrink-0 pr-4">{item.title}</h4>
                            <div className="flex-1 border-b border-dotted border-white/20 mb-1"></div>
                            <div className="text-white/80 text-lg font-light flex-shrink-0 pl-4">${item.price}</div>
                          </div>
                          <p className="text-white/60 text-sm leading-loose">{item.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}