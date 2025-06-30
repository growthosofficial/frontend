'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function BoltBadge({ 
  position = 'bottom-right', 
  variant = 'auto',
  size = 60,
  className = ''
}) {
  const [isHovered, setIsHovered] = useState(false);

  const positionClasses = {
    'bottom-right': 'fixed bottom-4 right-4 z-50',
    'bottom-left': 'fixed bottom-4 left-4 z-50',
    'top-right': 'fixed top-4 right-4 z-50',
    'top-left': 'fixed top-4 left-4 z-50',
    'inline': 'inline-flex'
  };

  // Auto-detect which badge to use based on background
  // For this app with light backgrounds, we'll use the black circle
  const badgeImage = variant === 'white' ? '/white_circle_360x360.png' : '/black_circle_360x360.png';
  const altText = "Powered by Bolt.new - Made in Bolt";

  return (
    <div 
      className={`${positionClasses[position]} group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <a
        href="https://bolt.new"
        target="_blank"
        rel="noopener noreferrer"
        className={`
          block transition-all duration-300 ease-in-out
          hover:scale-110 active:scale-95
          cursor-pointer select-none
          ${isHovered ? 'drop-shadow-lg' : 'drop-shadow-md'}
        `}
        title="This project was built with Bolt.new"
        aria-label="Powered by Bolt.new - Click to visit Bolt.new"
      >
        <Image
          src={badgeImage}
          alt={altText}
          width={size}
          height={size}
          className="w-full h-full object-contain"
          priority={position.includes('top')} // Prioritize loading for top positions
        />
        
        {/* Subtle glow effect on hover */}
        <div 
          className={`
            absolute inset-0 rounded-full transition-opacity duration-300
            ${variant === 'white' 
              ? 'bg-white/20 shadow-white/50' 
              : 'bg-black/10 shadow-black/30'
            }
            ${isHovered ? 'opacity-100 shadow-lg' : 'opacity-0'}
          `}
        />
      </a>

      {/* Tooltip for additional context */}
      {isHovered && (
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap pointer-events-none">
          <div className="relative">
            Built with Bolt.new
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
          </div>
        </div>
      )}
    </div>
  );
}

// Preset configurations for easy use
export const BoltBadgePresets = {
  // Main floating badge for public pages
  FloatingMain: () => <BoltBadge position="bottom-right" variant="black" size={60} />,
  
  // Top right for header areas
  TopRight: () => <BoltBadge position="top-right" variant="black" size={50} />,
  
  // Smaller inline version
  InlineSmall: () => <BoltBadge position="inline" variant="black" size={40} />,
  
  // White version for dark backgrounds
  FloatingWhite: () => <BoltBadge position="bottom-right" variant="white" size={60} />,
};