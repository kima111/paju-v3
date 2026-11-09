'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface ChefBio {
  id: string;
  name: string;
  role: string;
  title: string;
  quote: string;
  bio: string;
  imageUrl: string;
  displayOrder: number;
  isActive: boolean;
}

const FALLBACK = {
  id: 'fallback',
  name: 'Bill',
  role: 'Executive Chef',
  title: 'Culinary Vision',
  quote:
    '“Korean cuisine is about balance—the harmony between flavors, textures, and colors. At Paju, we honor these principles while celebrating the incredible ingredients of the Pacific Northwest.”',
  bio: 'Our chef brings years of experience from Seattle’s to New York’s finest restaurants, combining traditional techniques with innovative approaches to create an unforgettable dining experience.',
  imageUrl: '/images/Executive_Chef_Bill.png',
};

function splitBio(bio: string): string[] {
  return bio
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export default function ChefSection() {
  const [chefs, setChefs] = useState<ChefBio[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchChefs = async () => {
      try {
        const response = await fetch('/api/chef-bios?active=true');
        if (response.ok) {
          const data = await response.json();
          const list = Array.isArray(data) ? (data as ChefBio[]) : [];
          setChefs(list);
          if (list.length > 0) {
            setActiveId(list[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching chef bios:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChefs();
  }, []);

  const usingManaged = chefs.length > 0;
  const activeChef = usingManaged
    ? chefs.find((chef) => chef.id === activeId) || chefs[0]
    : null;

  const role = activeChef?.role?.trim() || FALLBACK.role;
  const title = activeChef?.title?.trim() || FALLBACK.title;
  const imageUrl = activeChef?.imageUrl?.trim() || FALLBACK.imageUrl;
  const imageAlt = activeChef?.name?.trim()
    ? `${activeChef.role || 'Chef'} ${activeChef.name}`.trim()
    : 'Executive Chef Bill';
  const quote = usingManaged
    ? activeChef?.quote?.trim() || ''
    : FALLBACK.quote;
  const paragraphs = usingManaged
    ? activeChef?.bio?.trim()
      ? splitBio(activeChef.bio)
      : []
    : [FALLBACK.bio];

  return (
    <section id="chef" className="py-32 px-6 bg-zinc-950/30">
      <div className="max-w-5xl mx-auto">
        {isLoading ? (
          <p className="text-center text-white/40 text-sm tracking-wider uppercase">Loading...</p>
        ) : (
          <>
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="relative order-2 md:order-1">
                <div className="aspect-[1] bg-zinc-900 rounded-sm overflow-hidden relative">
                  <Image
                    src={imageUrl}
                    alt={imageAlt}
                    fill
                    unoptimized={imageUrl.startsWith('http')}
                    className="object-cover opacity-85"
                  />
                </div>
              </div>
              <div className="space-y-10 order-1 md:order-2">
                <div>
                  <div className="text-xs tracking-[0.3em] uppercase text-white/60 mb-6">
                    {role}
                  </div>
                  <h2 className="font-display text-4xl md:text-5xl font-light mb-10">
                    {title}
                  </h2>
                </div>
                <div className="space-y-8 text-white/70 leading-loose">
                  {quote && <p>{quote}</p>}
                  {paragraphs.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </div>

            {chefs.length > 1 && (
              <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mt-20 pt-10 border-t border-white/10">
                {chefs.map((chef) => {
                  const isActive = (activeChef?.id || activeId) === chef.id;
                  return (
                    <button
                      key={chef.id}
                      type="button"
                      onClick={() => setActiveId(chef.id)}
                      className={`text-xs tracking-[0.3em] uppercase pb-2 border-b-2 transition-colors ${
                        isActive
                          ? 'border-white text-white'
                          : 'border-transparent text-white/60 hover:text-white'
                      }`}
                    >
                      {chef.name || chef.role || 'Chef'}
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
