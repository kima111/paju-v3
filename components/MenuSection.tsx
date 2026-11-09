'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { menuTypeLabel, sortMenuTypes, type MenuItem, type MenuCategory, type MenuType } from '../lib/database';

const BEVERAGE_KEYWORDS = [
  'beverage',
  'drink',
  'wine',
  'beer',
  'cocktail',
  'non-alcoholic',
  'non alcoholic',
  'rice wine',
  'zero-proof',
  'zero proof',
  'makgeolli',
  'soju',
  'sake',
  'spirits',
  'liquor',
];

function isBeverageCategory(name: string): boolean {
  const normalized = name.toLowerCase().trim();
  return BEVERAGE_KEYWORDS.some(keyword => normalized.includes(keyword));
}

function CategoryItems({ items }: { items: MenuItem[] }) {
  const itemsWithImages = items.filter(item => item.imageUrl);
  const itemsWithoutImages = items.filter(item => !item.imageUrl);

  return (
    <>
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
    </>
  );
}

export default function MenuSection() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [enabledMenus, setEnabledMenus] = useState<MenuType[]>([]);
  const [activeMenu, setActiveMenu] = useState<MenuType>('dinner');
  const [loading, setLoading] = useState(true);
  const [allCategories, setAllCategories] = useState<MenuCategory[]>([]);
  const [activeBeverageCategory, setActiveBeverageCategory] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadMenu = async () => {
      setLoading(true);

      try {
        const [enabledRes, itemsRes, categoriesRes] = await Promise.all([
          fetch('/api/menu/enabled'),
          fetch('/api/menu/items'),
          fetch('/api/menu/categories'),
        ]);

        if (cancelled) return;

        let nextEnabled: MenuType[] = [];
        if (enabledRes.ok) {
          const menus = (await enabledRes.json()) as MenuType[];
          // Always use canonical service order — never rely on DB / API row order.
          nextEnabled = sortMenuTypes(menus);
          setEnabledMenus(nextEnabled);
          if (nextEnabled.length > 0) {
            setActiveMenu(nextEnabled.includes('dinner') ? 'dinner' : nextEnabled[0]);
          }
        }

        if (itemsRes.ok) {
          const items = await itemsRes.json();
          setMenuItems(items.filter((item: MenuItem) => item.isAvailable));
        }

        if (categoriesRes.ok) {
          const cats = await categoriesRes.json();
          setAllCategories(cats);
        }
      } catch (error) {
        console.error('Error loading menu:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadMenu();
    return () => {
      cancelled = true;
    };
  }, []);

  // Only show items from enabled menus
  const filteredItems = useMemo(
    () =>
      menuItems.filter(
        item => item.menuType === activeMenu && enabledMenus.includes(item.menuType)
      ),
    [menuItems, activeMenu, enabledMenus]
  );

  const categories = useMemo(() => {
    const fromCms = allCategories
      .filter(c => c.menuType === activeMenu)
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
      .map(c => c.name)
      .filter(name => filteredItems.some(item => item.category === name));

    if (fromCms.length > 0) return fromCms;

    // Fallback if categories API is empty/slow: derive names from loaded items
    const seen = new Set<string>();
    const derived: string[] = [];
    for (const item of filteredItems) {
      if (!seen.has(item.category)) {
        seen.add(item.category);
        derived.push(item.category);
      }
    }
    return derived;
  }, [allCategories, activeMenu, filteredItems]);

  const foodCategories = useMemo(
    () => categories.filter(name => !isBeverageCategory(name)),
    [categories]
  );
  const beverageCategories = useMemo(
    () => categories.filter(name => isBeverageCategory(name)),
    [categories]
  );

  // Keep beverage tab in sync with menu type / available categories
  useEffect(() => {
    if (beverageCategories.length === 0) {
      setActiveBeverageCategory(null);
      return;
    }
    setActiveBeverageCategory(prev =>
      prev && beverageCategories.includes(prev) ? prev : beverageCategories[0]
    );
  }, [beverageCategories]);

  const selectedBeverageCategory =
    activeBeverageCategory && beverageCategories.includes(activeBeverageCategory)
      ? activeBeverageCategory
      : beverageCategories[0] ?? null;

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
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-16">
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
                  {menuTypeLabel(menuType)} Menu
                </button>
              ))}
            </div>
          )}
        </div>

        {filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-white/60">No {menuTypeLabel(activeMenu).toLowerCase()} items available at this time.</p>
          </div>
        ) : (
          <div className="space-y-16">
            {foodCategories.map(category => {
              const categoryItems = filteredItems.filter(item => item.category === category);

              return (
                <div key={category}>
                  <h3 className="text-center text-2xl font-light text-white/80 mb-12">
                    {category}
                  </h3>
                  <CategoryItems items={categoryItems} />
                </div>
              );
            })}

            {beverageCategories.length > 0 && selectedBeverageCategory && (
              <div>
                {beverageCategories.length > 1 ? (
                  <>
                    <h3 className="text-center text-2xl font-light text-white/80 mb-12">
                      Beverage Menus
                    </h3>
                    <div className="-mx-6 mb-12 px-6 overflow-x-auto">
                      <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 min-w-min mx-auto w-max max-w-full">
                        {beverageCategories.map(category => (
                          <button
                            key={category}
                            type="button"
                            onClick={() => setActiveBeverageCategory(category)}
                            className={`shrink-0 text-xs tracking-[0.3em] uppercase pb-2 border-b-2 transition-colors whitespace-nowrap ${
                              selectedBeverageCategory === category
                                ? 'border-white text-white'
                                : 'border-transparent text-white/60 hover:text-white'
                            }`}
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                    </div>
                    <h3 className="text-center text-2xl font-light text-white/80 mb-12">
                      {selectedBeverageCategory}
                    </h3>
                  </>
                ) : (
                  <h3 className="text-center text-2xl font-light text-white/80 mb-12">
                    {selectedBeverageCategory}
                  </h3>
                )}

                <CategoryItems
                  items={filteredItems.filter(item => item.category === selectedBeverageCategory)}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
