import React, { useState } from 'react';

const logoGorillaz = '/images/logo-gorillaz.png';

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  className?: string;
  showFallback?: boolean;
}

const sizeMap = {
  xs: 'w-8 h-8',
  sm: 'w-10 h-10',
  md: 'w-20 h-20',
  lg: 'w-32 h-32',
  xl: 'w-48 h-48',
  hero: 'w-72 h-72 max-w-full',
};

const textSizeMap = {
  xs: 'text-[9px]',
  sm: 'text-xs',
  md: 'text-base',
  lg: 'text-xl',
  xl: 'text-3xl',
  hero: 'text-5xl',
};

export function Logo({ size = 'md', className = '', showFallback = true }: LogoProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError && showFallback) {
    return (
      <div
        className={`${sizeMap[size]} bg-gorillaz-black rounded-xl border border-gorillaz-red/50 flex flex-col items-center justify-center shadow-red-glow select-none shrink-0 ${className}`}
        title="Família Gorillaz BJJ"
      >
        <span className={`font-['Oswald',sans-serif] font-black text-gorillaz-red tracking-wider ${textSizeMap[size]}`}>
          BJJ
        </span>
        {size !== 'xs' && (
          <span className="text-[7px] uppercase tracking-widest text-neutral-400 -mt-1 font-bold">
            Gorillaz
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      src={logoGorillaz}
      alt="Família Gorillaz - Jiu-Jitsu"
      className={`${sizeMap[size]} object-contain ${className}`}
      onError={(e) => {
        if (showFallback) {
          setHasError(true);
        } else {
          e.currentTarget.style.display = 'none';
        }
      }}
    />
  );
}

export default Logo;
