'use client';

import { useState } from "react";
import Image from "next/image";

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className="min-h-screen bg-black text-white grain-overlay">
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
            <a href="#contact" onClick={toggleMenu} className="block text-white/70 hover:text-white transition-colors text-xs tracking-wider uppercase">Reserve</a>
          </div>
        </div>
      </nav>

      {/* Hero Section - Full viewport with restaurant image */}
      <section id="home" className="relative h-screen flex items-center justify-center">
        <div className="absolute inset-0">
          <Image
            src="/images/restaurant.jpg"
            alt="Paju Restaurant Interior"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80 z-10"></div>
        </div>
        
        <div className="relative z-20 text-center max-w-4xl mx-auto px-6">
          <div className="animate-fade-in-up">
            <h1 className="font-display text-6xl md:text-8xl font-light mb-12 tracking-tight">
              PAJU
            </h1>
            <div className="w-24 h-px bg-white/60 mx-auto mb-12"></div>
            <p className="text-white/80 text-lg md:text-xl font-light tracking-wide max-w-2xl mx-auto mb-16 leading-loose">
              Contemporary Korean cuisine<br />
              in the heart of Seattle
            </p>
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
          <div className="grid md:grid-cols-2 gap-16 items-center">
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
              <div className="aspect-[4/5] bg-zinc-900 rounded-sm overflow-hidden">
                <Image
                  src="/images/about_paju.jpg"
                  alt="About Paju Restaurant"
                  fill
                  className="object-cover opacity-80 hover:opacity-90 transition-opacity duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Highlights - Clean grid with food images */}
      <section id="menu" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <div className="text-xs tracking-[0.3em] uppercase text-white/60 mb-6">Signature Dishes</div>
            <h2 className="font-display text-4xl md:text-5xl font-light">
              Culinary Excellence
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-16">
            <div className="group cursor-pointer">
              <div className="aspect-square bg-zinc-900 mb-8 overflow-hidden rounded-sm">
                <Image
                  src="/images/fried_rice.jpg"
                  alt="Korean Rice Bowl"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-85 group-hover:opacity-100"
                />
              </div>
              <div className="space-y-4">
                <h3 className="font-light text-xl tracking-wide">Korean Rice Bowl</h3>
                <p className="text-white/60 text-sm leading-loose">Traditional bibimbap elevated with seasonal Pacific Northwest ingredients</p>
                <div className="text-white/40 text-xs tracking-wider">$32</div>
              </div>
            </div>

            <div className="group cursor-pointer">
              <div className="aspect-square bg-zinc-900 mb-8 overflow-hidden rounded-sm">
                <Image
                  src="/images/bulgogi.jpg"
                  alt="Grilled Fish"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-85 group-hover:opacity-100"
                />
              </div>
              <div className="space-y-4">
                <h3 className="font-light text-xl tracking-wide">Grilled Fish</h3>
                <p className="text-white/60 text-sm leading-loose">Fresh Pacific cod with fermented black bean and seasonal vegetables</p>
                <div className="text-white/40 text-xs tracking-wider">$38</div>
              </div>
            </div>

            <div className="group cursor-pointer">
              <div className="aspect-square bg-zinc-900 mb-8 overflow-hidden rounded-sm">
                <Image
                  src="/images/oyster.jpg"
                  alt="Braised Short Rib"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-85 group-hover:opacity-100"
                />
              </div>
              <div className="space-y-4">
                <h3 className="font-light text-xl tracking-wide">Braised Short Rib</h3>
                <p className="text-white/60 text-sm leading-loose">Slow-cooked wagyu short rib with traditional Korean accompaniments</p>
                <div className="text-white/40 text-xs tracking-wider">$45</div>
              </div>
            </div>

            <div className="group cursor-pointer">
              <div className="aspect-square bg-zinc-900 mb-8 overflow-hidden rounded-sm">
                <Image
                  src="/images/crispy_pancake.jpg"
                  alt="Spicy Noodle Soup"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-85 group-hover:opacity-100"
                />
              </div>
              <div className="space-y-4">
                <h3 className="font-light text-xl tracking-wide">Spicy Noodle Soup</h3>
                <p className="text-white/60 text-sm leading-loose">House-made noodles in rich pork broth with seasonal garnishes</p>
                <div className="text-white/40 text-xs tracking-wider">$28</div>
              </div>
            </div>

            <div className="group cursor-pointer">
              <div className="aspect-square bg-zinc-900 mb-8 overflow-hidden rounded-sm">
                <Image
                  src="/images/chicken.jpg"
                  alt="Korean Fried Chicken"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-85 group-hover:opacity-100"
                />
              </div>
              <div className="space-y-4">
                <h3 className="font-light text-xl tracking-wide">Korean Fried Chicken</h3>
                <p className="text-white/60 text-sm leading-loose">Crispy double-fried chicken with house gochujang glaze</p>
                <div className="text-white/40 text-xs tracking-wider">$26</div>
              </div>
            </div>

            <div className="group cursor-pointer">
              <div className="aspect-square bg-zinc-900 mb-8 overflow-hidden rounded-sm">
                <Image
                  src="/images/gallery/Salad.jpg"
                  alt="Seafood Pancake"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-85 group-hover:opacity-100"
                />
              </div>
              <div className="space-y-4">
                <h3 className="font-light text-xl tracking-wide">Seafood Pancake</h3>
                <p className="text-white/60 text-sm leading-loose">Traditional pajeon with fresh local seafood and scallions</p>
                <div className="text-white/40 text-xs tracking-wider">$22</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Chef Section - Personal and authentic */}
      <section id="chef" className="py-32 px-6 bg-zinc-950/30">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="relative order-2 md:order-1">
              <div className="aspect-[4/5] bg-zinc-900 rounded-sm overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900"></div>
              </div>
            </div>
            <div className="space-y-10 order-1 md:order-2">
              <div>
                <div className="text-xs tracking-[0.3em] uppercase text-white/60 mb-6">Executive Chef</div>
                <h2 className="font-display text-4xl md:text-5xl font-light mb-10">
                  Culinary Vision
                </h2>
              </div>
              <div className="space-y-8 text-white/70 leading-loose">
                <p>
                  &ldquo;Korean cuisine is about balance—the harmony between flavors, textures, and colors. At Paju, we honor these principles while celebrating the incredible ingredients of the Pacific Northwest.&rdquo;
                </p>
                <p>
                  Our chef brings years of experience from Seoul&rsquo;s finest restaurants, combining traditional techniques with innovative approaches to create an unforgettable dining experience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

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
              <p className="text-white/80 leading-relaxed">Seattle, Washington<br />Capitol Hill District</p>
            </div>
            <div className="space-y-4">
              <div className="text-xs tracking-[0.3em] uppercase text-white/60">Hours</div>
              <p className="text-white/80 leading-relaxed">Tuesday - Sunday<br />5:30 PM - 10:00 PM</p>
            </div>
            <div className="space-y-4">
              <div className="text-xs tracking-[0.3em] uppercase text-white/60">Contact</div>
              <p className="text-white/80 leading-relaxed">206.555.PAJU<br />info@pajuseattle.com</p>
            </div>
          </div>

          <a 
            href="tel:2065557258" 
            className="inline-block bg-white text-black px-12 py-4 text-xs tracking-[0.2em] uppercase transition-all duration-300 hover:bg-white/90 hover:scale-105"
          >
            Make Reservation
          </a>
        </div>
      </section>

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
          </div>
        </div>
      </footer>
    </div>
  );
}