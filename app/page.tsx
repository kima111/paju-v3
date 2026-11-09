'use client';

import { useEffect, useState } from "react";
import MenuSection from "../components/MenuSection";
import RestaurantHoursDisplay from "../components/RestaurantHoursDisplay";
import AnnouncementBanner from "../components/AnnouncementBanner";
import AnnouncementSpacer from "../components/AnnouncementSpacer";
import AccoladesSection from "../components/AccoladesSection";
import ChefSection from "../components/ChefSection";
import Image from "next/image";

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isParkingMapOpen, setIsParkingMapOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  useEffect(() => {
    if (!isParkingMapOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsParkingMapOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isParkingMapOpen]);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Minimalist Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <div className="text-white font-light tracking-[0.2em] text-sm">
              PAJU
            </div>
            
            <div className="hidden md:flex items-center space-x-16 text-xs tracking-wider uppercase">
              <a href="#home" className="text-white/70 hover:text-white transition-all duration-300">Experience</a>
              <a href="#menu" className="text-white/70 hover:text-white transition-all duration-300">Menu</a>
              <a href="#chef" className="text-white/70 hover:text-white transition-all duration-300">Chef</a>
              <a href="#accolades" className="text-white/70 hover:text-white transition-all duration-300">Accolades</a>
              <a href="#contact" className="text-white/70 hover:text-white transition-all duration-300">Reserve</a>
            </div>

            {/* Mobile menu button */}
            <button 
              onClick={toggleMenu}
              className="md:hidden w-6 h-6 flex flex-col justify-center items-center space-y-1"
            >
              <span className={`w-4 h-px bg-white transition-all ${isMenuOpen ? 'rotate-45 translate-y-1' : ''}`}></span>
              <span className={`w-4 h-px bg-white transition-all ${isMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`w-4 h-px bg-white transition-all ${isMenuOpen ? '-rotate-45 -translate-y-1' : ''}`}></span>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden absolute top-16 left-0 right-0 bg-black/95 backdrop-blur-md transition-all duration-300 ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
          <div className="p-6 space-y-6">
            <a href="#home" onClick={toggleMenu} className="block text-white/70 hover:text-white transition-colors text-xs tracking-wider uppercase">Experience</a>
            <a href="#menu" onClick={toggleMenu} className="block text-white/70 hover:text-white transition-colors text-xs tracking-wider uppercase">Menu</a>
            <a href="#chef" onClick={toggleMenu} className="block text-white/70 hover:text-white transition-colors text-xs tracking-wider uppercase">Chef</a>
            <a href="#accolades" onClick={toggleMenu} className="block text-white/70 hover:text-white transition-colors text-xs tracking-wider uppercase">Accolades</a>
            <a href="#contact" onClick={toggleMenu} className="block text-white/70 hover:text-white transition-colors text-xs tracking-wider uppercase">Reserve</a>
          </div>
        </div>
      </nav>

      {/* Announcement Banner */}
      <AnnouncementBanner />

      {/* Spacer for fixed banner */}
      <AnnouncementSpacer />

      {/* Hero Section - Clean minimal design with icon */}
      <section id="home" className="relative h-screen flex items-center justify-center bg-black">
        <div className="relative text-center max-w-4xl mx-auto px-6">
          {/* Icon with zoom and fade animation */}
          <div className="mb-12">
            <Image
              src="/icon.svg"
              alt="Paju Symbol"
              width={120}
              height={120}
              className="mx-auto opacity-90 animate-draw-in"
            />
          </div>
          
          <div className="animate-fade-in-up">
            <h1 className="font-display text-6xl md:text-8xl font-light mb-12 tracking-tight">
              PAJU
            </h1>
            <div className="w-24 h-px bg-white/60 mx-auto mb-12"></div>
            <p className="text-white/80 text-lg md:text-xl font-light tracking-wide max-w-2xl mx-auto mb-16 leading-loose">
              Contemporary Korean cuisine<br />
              in the heart of Seattle
            </p>
            <a href="https://www.opentable.com/r/paju-reservations-seattle-2?restref=1391578&lang=en-US&ot_source=Restaurant%20website" className="inline-block bg-white text-black px-12 py-4 text-xs tracking-[0.2em] uppercase transition-all duration-300 hover:bg-white/90 hover:scale-105"target="_blank" rel="noopener noreferrer">Make Reservation</a>
<br /><br />
            <a 
              href="#menu" 
              className="inline-block border border-white/30 hover:border-white/60 px-8 py-3 text-xs tracking-[0.2em] uppercase transition-all duration-300 hover:bg-white/5"
            >
              Explore Menu
            </a>
          </div>
        </div>
      </section>

      {/* About Section - Minimal and elegant */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-8">
              <div>
                <div className="text-xs tracking-[0.3em] uppercase text-white/60 mb-6">Our Philosophy</div>
                <h2 className="font-display text-4xl md:text-5xl font-light mb-10">
                  Where tradition<br />meets innovation
                </h2>
              </div>
              <div className="space-y-8 text-white/70 leading-loose">
                <p>
                  Named after the historic city of Paju in South Korea, our restaurant celebrates the rich culinary heritage of Korea while embracing the fresh, locally-sourced ingredients of the Pacific Northwest.
                </p>
                <p>
                  Each dish tells a story of tradition reimagined, where time-honored techniques meet contemporary presentation in our modern Seattle setting.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[1] bg-zinc-900 rounded-sm overflow-hidden">
                <Image
                  src="/images/bibi.png"
                  alt="About Paju Restaurant"
                  fill
                  className="object-cover opacity-80 hover:opacity-90 transition-opacity duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Menu Section */}
      <MenuSection />

      {/* Chef Section - managed via CMS with fallback */}
      <ChefSection />

      {/* Accolades */}
      <AccoladesSection />

      {/* Contact/Reserve - Minimal and focused */}
      <section id="contact" className="py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="space-y-10 mb-20">
            <div className="text-xs tracking-[0.3em] uppercase text-white/60">Experience</div>
            <h2 className="font-display text-4xl md:text-5xl font-light">
              Reserve Your Table
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto leading-loose">
              Join us for an evening of exceptional Korean cuisine in our intimate Seattle setting. 
              Reservations recommended for the full Paju experience.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-16 mb-20 text-center">
            <div className="space-y-4">
              <div className="text-xs tracking-[0.3em] uppercase text-white/60">Location</div>
              <a
                href="https://www.google.com/maps/search/?api=1&query=513+Westlake+Avenue+North%2C+Seattle%2C+WA+98109"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-white/80 leading-relaxed hover:text-white hover:underline underline-offset-4 transition-colors duration-300"
              >
                Seattle, Washington<br />
                513 Westlake Avenue North<br />
                Seattle, WA 98109
              </a>
              <div className="pt-4 space-y-3">
                <div className="text-xs tracking-[0.3em] uppercase text-white/60">Parking</div>
                <p className="text-white/70 text-sm leading-relaxed">
                  Enjoy complimentary parking while you dine with us for dinner and happy hour
                </p>
                <p className="text-white/60 text-sm leading-relaxed">
                  Entrance via 9th Alley N.
                </p>
                <button
                  type="button"
                  onClick={() => setIsParkingMapOpen(true)}
                  aria-label="Enlarge parking map"
                  className="relative mx-auto mt-2 block w-full max-w-[180px] aspect-[3/4] bg-zinc-900 rounded-sm overflow-hidden cursor-zoom-in focus:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
                >
                  <Image
                    src="/images/parking-map.jpg"
                    alt="Parking map showing entrance via 9th Alley N"
                    fill
                    className="object-cover"
                    sizes="180px"
                  />
                </button>
              </div>
            </div>
            <RestaurantHoursDisplay />
            <div className="space-y-4">
              <div className="text-xs tracking-[0.3em] uppercase text-white/60">Contact</div>
              <p className="text-white/80 leading-relaxed">
          <a href="tel:2068298215">(206) 829-8215</a><br /><a href="mailto:info@pajuseattle.com">info@pajuseattle.com</a></p>
            </div>
          </div>
            <a href="https://www.opentable.com/r/paju-reservations-seattle-2?restref=1391578&lang=en-US&ot_source=Restaurant%20website" className="inline-block bg-white text-black px-12 py-4 text-xs tracking-[0.2em] uppercase transition-all duration-300 hover:bg-white/90 hover:scale-105"target="_blank" rel="noopener noreferrer">Make Reservation</a>

        </div>
      </section>

      {isParkingMapOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Parking map"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 p-4 pt-20 sm:p-8 sm:pt-20"
          onClick={() => setIsParkingMapOpen(false)}
        >
          <button
            type="button"
            onClick={() => setIsParkingMapOpen(false)}
            aria-label="Close parking map"
            className="absolute top-4 right-4 z-[110] flex h-12 w-12 items-center justify-center rounded-full bg-white text-black shadow-lg transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
          <div className="relative z-[105] flex w-full max-w-lg flex-col items-center gap-4">
            <button
              type="button"
              onClick={() => setIsParkingMapOpen(false)}
              aria-label="Close parking map"
              className="relative w-full max-h-[75vh] aspect-[3/4] cursor-zoom-out focus:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
            >
              <Image
                src="/images/parking-map.jpg"
                alt="Parking map showing entrance via 9th Alley N"
                fill
                className="object-contain"
                sizes="(max-width: 640px) 100vw, 512px"
                priority
              />
            </button>
            <button
              type="button"
              onClick={() => setIsParkingMapOpen(false)}
              className="relative z-[110] px-6 py-3 text-sm tracking-[0.25em] uppercase text-white transition-colors hover:text-white/80 focus:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Footer - Ultra minimal */}
      <footer className="py-24 px-6 border-t border-white/10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex flex-col items-center space-y-8">
            <div className="text-white/40 text-xs tracking-[0.2em] uppercase">
              PAJU
            </div>
            <div className="w-16 h-px bg-white/20"></div>
            <p className="text-white/30 text-xs leading-relaxed">
              © 2024 Paju Restaurant. Contemporary Korean Cuisine.
            </p>
            <a
              href="https://www.instagram.com/paju_seattle"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-white/30 hover:text-white/50 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4"
                aria-hidden="true"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </a>
            <a 
              href="/cms" 
              className="text-white/20 text-xs hover:text-white/40 transition-colors"
            >
              Staff Login
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}