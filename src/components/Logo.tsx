import React, { useState } from 'react';

// Nova logo oficial da Família Gorillaz BJJ
const LOGO_PRIMARY = '/images/logo-gorillaz.jpg';
const LOGO_FALLBACK = '/images/logo-gorillaz.png';

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
  hero: 'w-64 h-64 sm:w-80 sm:h-80 max-w-full',
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
  const [currentSrc, setCurrentSrc] = useState(LOGO_PRIMARY);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (currentSrc === LOGO_PRIMARY) {
      // Tenta o fallback em png
      setCurrentSrc(LOGO_FALLBACK);
    } else {
      setHasError(true);
    }
  };

  if (hasError && showFallback) {
    return (
      <div
        className={`${sizeMap[size]} bg-[#0a0a0a] rounded-2xl border-2 border-red-600/60 flex flex-col items-center justify-center shadow-red-glow select-none shrink-0 ${className}`}
        title="Família Gorillaz BJJ"
      >
        <span className={`font-['Oswald',sans-serif] font-black text-red-500 tracking-wider ${textSizeMap[size]}`}>
          BJJ
        </span>
        {size !== 'xs' && (
          <span className="text-[8px] uppercase tracking-widest text-neutral-300 -mt-0.5 font-bold">
            GORILLAZ
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <img
        src={currentSrc}
        alt="Família Gorillaz - Jiu-Jitsu"
        className={`${sizeMap[size]} object-contain rounded-2xl drop-shadow-[0_4px_16px_rgba(220,38,38,0.35)] transition-transform duration-300`}
        onError={handleError}
      />
    </div>
  );
}

export default Logo;
