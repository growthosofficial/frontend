'use client';

import { useState } from 'react';
import { Zap, ExternalLink } from 'lucide-react';

export default function BoltBadge({ 
  position = 'bottom-right', 
  variant = 'default',
  showTooltip = true 
}) {
  const [isHovered, setIsHovered] = useState(false);

  const positionClasses = {
    'bottom-right': 'fixed bottom-4 right-4 z-50',
    'bottom-left': 'fixed bottom-4 left-4 z-50',
    'top-right': 'fixed top-4 right-4 z-50',
    'top-left': 'fixed top-4 left-4 z-50',
    'inline': 'inline-flex'
  };

  const variantStyles = {
    default: {
      bg: 'bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500',
      text: 'text-white',
      shadow: 'shadow-lg hover:shadow-xl',
      border: 'border border-white/20'
    },
    minimal: {
      bg: 'bg-white/90 backdrop-blur-sm',
      text: 'text-gray-700',
      shadow: 'shadow-md hover:shadow-lg',
      border: 'border border-gray-200'
    },
    dark: {
      bg: 'bg-gray-900',
      text: 'text-white',
      shadow: 'shadow-lg hover:shadow-xl',
      border: 'border border-gray-700'
    }
  };

  const currentVariant = variantStyles[variant];

  return (
    <>
      <div 
        className={`${positionClasses[position]} group`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <a
          href="https://bolt.new"
          target="_blank"
          rel="noopener noreferrer"
          className={`
            flex items-center gap-2 px-3 py-2 rounded-full
            ${currentVariant.bg} ${currentVariant.text} ${currentVariant.shadow} ${currentVariant.border}
            transition-all duration-300 ease-in-out
            hover:scale-105 active:scale-95
            cursor-pointer select-none
          `}
        >
          {/* Bolt Icon */}
          <div className="relative">
            <Zap 
              size={16} 
              className={`
                transition-all duration-300
                ${variant === 'default' ? 'text-yellow-300' : 'text-current'}
                ${isHovered ? 'animate-pulse' : ''}
              `}
              fill="currentColor"
            />
            {variant === 'default' && (
              <div className="absolute inset-0 animate-ping">
                <Zap size={16} className="text-yellow-300/50" fill="currentColor" />
              </div>
            )}
          </div>

          {/* Text */}
          <span className="text-sm font-semibold tracking-wide">
            Built on Bolt
          </span>

          {/* External Link Icon */}
          <ExternalLink 
            size={12} 
            className={`
              transition-all duration-300 opacity-60
              ${isHovered ? 'opacity-100 translate-x-0.5' : ''}
            `}
          />

          {/* Animated Background Gradient */}
          {variant === 'default' && (
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-cyan-500/20 animate-pulse" />
          )}
        </a>

        {/* Tooltip */}
        {showTooltip && isHovered && (
          <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap">
            <div className="relative">
              This app was built with Bolt.new
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
            </div>
          </div>
        )}
      </div>

      {/* Floating particles effect for default variant */}
      {variant === 'default' && isHovered && (
        <div className="fixed inset-0 pointer-events-none z-40">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.2}s`,
                animationDuration: '2s'
              }}
            />
          ))}
        </div>
      )}
    </>
  );
}

// Preset configurations for easy use
export const BoltBadgePresets = {
  FloatingDefault: () => <BoltBadge position="bottom-right" variant="default" />,
  FloatingMinimal: () => <BoltBadge position="bottom-right" variant="minimal" />,
  FloatingDark: () => <BoltBadge position="bottom-right" variant="dark" />,
  InlineDefault: () => <BoltBadge position="inline" variant="default" showTooltip={false} />,
  InlineMinimal: () => <BoltBadge position="inline" variant="minimal" showTooltip={false} />,
};