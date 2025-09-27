'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function MobileNav({ onReservationClick }: { onReservationClick?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const navItems = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Menu', href: '#menu' },
    { name: 'Gallery', href: '#gallery' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden">
        <button
          onClick={toggleMenu}
          className="text-[#2d1810] hover:text-[#8b4513] focus:outline-none focus:text-[#8b4513]"
          aria-label="Toggle menu"
        >
          <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
            {isOpen ? (
              <path
                fillRule="evenodd"
                d="M18.278 16.864a1 1 0 0 1-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 0 1-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 0 1 1.414-1.414l4.829 4.828 4.828-4.828a1 1 0 1 1 1.414 1.414l-4.828 4.829 4.828 4.828z"
              />
            ) : (
              <path
                fillRule="evenodd"
                d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-black opacity-50"
            onClick={toggleMenu}
          ></div>
          
          <div className="fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-60">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <Image
                src="/images/paju_black.jpg"
                alt="Paju Logo"
                width={100}
                height={33}
                className="h-8 w-auto object-contain"
              />
              <button
                onClick={toggleMenu}
                className="text-[#2d1810] hover:text-[#8b4513]"
              >
                <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    d="M18.278 16.864a1 1 0 0 1-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 0 1-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 0 1 1.414-1.414l4.829 4.828 4.828-4.828a1 1 0 1 1 1.414 1.414l-4.828 4.829 4.828 4.828z"
                  />
                </svg>
              </button>
            </div>
            
            <nav className="flex flex-col space-y-4 p-4">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={toggleMenu}
                  className="text-[#2d1810] hover:text-[#8b4513] font-medium text-lg transition-colors"
                >
                  {item.name}
                </a>
              ))}
              <button 
                onClick={() => {
                  onReservationClick?.();
                  toggleMenu();
                }}
                className="bg-[#8b4513] text-white px-6 py-2 rounded-full hover:bg-[#2d1810] transition-colors font-medium mt-4"
              >
                Reservations
              </button>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}