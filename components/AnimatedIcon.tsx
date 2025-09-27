'use client';

import { useEffect, useState } from 'react';

export default function AnimatedIcon() {
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    // Start the drawing animation after a brief delay
    const timer = setTimeout(() => {
      setIsDrawing(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-[120px] h-[120px] mx-auto">
      <svg 
        viewBox="0 0 496 485.13" 
        className="w-full h-full"
        style={{ filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.1))' }}
      >
        <defs>
          <style>
            {`
              .draw-path {
                fill: none;
                stroke: #ffffff;
                stroke-width: 2.5;
                stroke-linecap: round;
                stroke-linejoin: round;
                stroke-dasharray: 2000;
                stroke-dashoffset: ${isDrawing ? '0' : '2000'};
                transition: stroke-dashoffset 3s ease-in-out;
                opacity: 0.9;
              }
              .draw-path-1 { transition-delay: 0s; }
              .draw-path-2 { transition-delay: 0.3s; }
              .draw-path-3 { transition-delay: 0.6s; }
              .draw-path-4 { transition-delay: 0.9s; }
              .draw-path-5 { transition-delay: 1.2s; }
            `}
          </style>
        </defs>
        
        {/* Outer boundary */}
        <path 
          className="draw-path draw-path-1"
          d="M390.28,40.67c26.02,24.77,58.82,52.9,82.12,79.33,12.06,13.68,21.15,32,22.51,50.47,3.46,46.81-2.7,97.81,0,145.07-2.11,18.13-9.18,34.19-21,47.99-29.18,34.06-69.99,63.9-99.96,97.98-14.6,12.7-32.01,20.79-51.45,22.52-48.59-2.71-100.84,3.47-149,0-18.21-1.31-36.68-9.77-50.45-21.53-35.16-30-67.23-68.95-101.96-99.98-11.17-13.42-18.23-29.5-20-46.98,2.7-47.26-3.46-98.26,0-145.07,1.32-17.83,10.35-36.67,22-49.99C53.37,85.87,94.53,54.71,126.05,20.51c14.3-11.3,32.13-18.3,50.45-19.53,46.73-3.14,96.91,2.47,144.01,0,33.64,2.25,47.54,18.52,69.77,39.69Z"
        />
        
        {/* Top section */}
        <path 
          className="draw-path draw-path-2"
          d="M146.05,20.52v47l1.5,1.5h200.9l1.5-1.5V20.52"
        />
        
        {/* Inner rectangles */}
        <path 
          className="draw-path draw-path-3"
          d="M427.91,158.02v79H68.09v-79h39.48c14.84,0,38.48-21.38,38.48-36.5v-41l1.5-1.5h200.9l1.5,1.5v42c0,14.6,24.22,35.5,38.48,35.5h39.48Z"
        />
        
        <path 
          className="draw-path draw-path-4"
          d="M427.91,248.01v79h-39.48c-17.18,0-39.48,23.4-39.48,40.5v38.5h-201.9v-38.5c0-17.1-22.3-40.5-39.48-40.5h-39.48v-79h359.82Z"
        />
        
        {/* Bottom section */}
        <path 
          className="draw-path draw-path-5"
          d="M349.95,417h-203.9l.4,47.56c.84,1.8,4.29,2.72,6.08,3.45,10.02,4.12,22.19,5.5,32.96,6.02,37.9,1.84,85.06,1.66,123.03,0,7.38-.32,16.31-1.04,23.45-2.54,3.36-.71,15.68-4.22,17.4-6.48l.58-48.02Z"
        />
      </svg>
    </div>
  );
}