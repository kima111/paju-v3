'use client';

import { useEffect, useState } from 'react';

interface AnimatedPajuSymbolProps {
  size?: number;
  strokeWidth?: number;
  color?: string;
  duration?: number;
  autoPlay?: boolean;
}

export default function AnimatedPajuSymbol({ 
  size = 100, 
  strokeWidth = 2, 
  color = 'white',
  duration = 2000,
  autoPlay = true 
}: AnimatedPajuSymbolProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (autoPlay) {
      setIsAnimating(true);
    }
  }, [autoPlay]);

  const animate = () => {
    setIsAnimating(false);
    setTimeout(() => setIsAnimating(true), 100);
  };

  const pathLength = 1000;
  const animationDelay = duration / 11; // 11 elements to animate

  return (
    <div className="inline-block cursor-pointer" onClick={animate}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <style>
          {`
            .paju-line {
              stroke-dasharray: ${pathLength};
              stroke-dashoffset: ${isAnimating ? 0 : pathLength};
              transition: stroke-dashoffset 600ms ease-in-out;
            }
          `}
        </style>
        
        {/* Outer octagonal/rounded hexagonal shape */}
        <path 
          className="paju-line"
          style={{ 
            transitionDelay: isAnimating ? '0ms' : '0ms'
          }}
          d="M30 5 L70 5 L95 30 L95 70 L70 95 L30 95 L5 70 L5 30 Z" 
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none" 
          strokeLinejoin="round"
        />
        
        {/* Inner square */}
        <rect 
          className="paju-line"
          style={{ 
            transitionDelay: isAnimating ? `${animationDelay}ms` : '0ms'
          }}
          x="20" y="20" width="60" height="60" 
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* Top horizontal line */}
        <line 
          className="paju-line"
          style={{ 
            transitionDelay: isAnimating ? `${animationDelay * 2}ms` : '0ms'
          }}
          x1="20" y1="35" x2="80" y2="35" 
          stroke={color} 
          strokeWidth={strokeWidth}
        />
        
        {/* Middle horizontal line */}
        <line 
          className="paju-line"
          style={{ 
            transitionDelay: isAnimating ? `${animationDelay * 3}ms` : '0ms'
          }}
          x1="20" y1="50" x2="80" y2="50" 
          stroke={color} 
          strokeWidth={strokeWidth}
        />
        
        {/* Bottom horizontal line */}
        <line 
          className="paju-line"
          style={{ 
            transitionDelay: isAnimating ? `${animationDelay * 4}ms` : '0ms'
          }}
          x1="20" y1="65" x2="80" y2="65" 
          stroke={color} 
          strokeWidth={strokeWidth}
        />
        
        {/* Left vertical line */}
        <line 
          className="paju-line"
          style={{ 
            transitionDelay: isAnimating ? `${animationDelay * 5}ms` : '0ms'
          }}
          x1="35" y1="20" x2="35" y2="80" 
          stroke={color} 
          strokeWidth={strokeWidth}
        />
        
        {/* Right vertical line */}
        <line 
          className="paju-line"
          style={{ 
            transitionDelay: isAnimating ? `${animationDelay * 6}ms` : '0ms'
          }}
          x1="65" y1="20" x2="65" y2="80" 
          stroke={color} 
          strokeWidth={strokeWidth}
        />
        
        {/* Top-left curved triangle on slant */}
        <path 
          className="paju-line"
          style={{ 
            transitionDelay: isAnimating ? `${animationDelay * 7}ms` : '0ms'
          }}
          d="M30 5 Q20 15 20 20 Q20 15 35 20" 
          stroke={color} 
          strokeWidth={strokeWidth} 
          fill="none"
        />
        
        {/* Top-right curved triangle on slant */}
        <path 
          className="paju-line"
          style={{ 
            transitionDelay: isAnimating ? `${animationDelay * 8}ms` : '0ms'
          }}
          d="M70 5 Q80 15 80 20 Q80 15 65 20" 
          stroke={color} 
          strokeWidth={strokeWidth} 
          fill="none"
        />
        
        {/* Bottom-right curved triangle on slant */}
        <path 
          className="paju-line"
          style={{ 
            transitionDelay: isAnimating ? `${animationDelay * 9}ms` : '0ms'
          }}
          d="M70 95 Q80 85 80 80 Q80 85 65 80" 
          stroke={color} 
          strokeWidth={strokeWidth} 
          fill="none"
        />
        
        {/* Bottom-left curved triangle on slant */}
        <path 
          className="paju-line"
          style={{ 
            transitionDelay: isAnimating ? `${animationDelay * 10}ms` : '0ms'
          }}
          d="M30 95 Q20 85 20 80 Q20 85 35 80" 
          stroke={color} 
          strokeWidth={strokeWidth} 
          fill="none"
        />
      </svg>
    </div>
  );
}