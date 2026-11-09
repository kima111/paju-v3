'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface Accolade {
  id: string;
  title: string;
  description: string;
  link?: string;
  images: string[];
  displayOrder: number;
  isActive: boolean;
}

export default function AccoladesSection() {
  const [accolades, setAccolades] = useState<Accolade[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAccolades = async () => {
      try {
        const response = await fetch('/api/accolades?active=true');
        if (response.ok) {
          const data = await response.json();
          setAccolades(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Error fetching accolades:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccolades();
  }, []);

  return (
    <section id="accolades" className="py-32 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <div className="space-y-10">
          <div className="text-xs tracking-[0.3em] uppercase text-white/60">Recognition</div>
          <h2 className="font-display text-4xl md:text-5xl font-light">Accolades</h2>
          <div className="w-24 h-px bg-white/20 mx-auto"></div>

          {isLoading ? (
            <p className="text-white/40 text-sm tracking-wider uppercase">Loading...</p>
          ) : accolades.length === 0 ? (
            <p className="text-white/70 max-w-2xl mx-auto leading-loose">
              Honors and press recognition for Paju will appear here.
            </p>
          ) : (
            <div className="space-y-16 pt-4">
              {accolades.map((accolade) => {
                const content = (
                  <div className="space-y-6">
                    {accolade.images?.[0] && (
                      <div className="relative mx-auto w-full max-w-md aspect-[4/3] overflow-hidden">
                        <Image
                          src={accolade.images[0]}
                          alt={accolade.title}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                    )}
                    <h3 className="font-display text-2xl md:text-3xl font-light text-white">
                      {accolade.title}
                    </h3>
                    {accolade.description && (
                      <p className="text-white/70 max-w-2xl mx-auto leading-loose">
                        {accolade.description}
                      </p>
                    )}
                    {accolade.images && accolade.images.length > 1 && (
                      <div className="flex flex-wrap justify-center gap-4 pt-2">
                        {accolade.images.slice(1).map((url, index) => (
                          <div
                            key={`${accolade.id}-img-${index}`}
                            className="relative w-24 h-24 overflow-hidden"
                          >
                            <Image
                              src={url}
                              alt={`${accolade.title} ${index + 2}`}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    {accolade.link && (
                      <div className="text-xs tracking-[0.2em] uppercase text-white/50 group-hover:text-white/80 transition-colors">
                        Read more →
                      </div>
                    )}
                  </div>
                );

                return accolade.link ? (
                  <a
                    key={accolade.id}
                    href={accolade.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group"
                  >
                    {content}
                  </a>
                ) : (
                  <div key={accolade.id}>{content}</div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
