import React, { useState } from 'react';

export const FuturisticWatermark: React.FC = () => {
  const [logoSrc, setLogoSrc] = useState('/images/logo-gorillaz.jpg');

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none select-none z-0 overflow-hidden flex items-center justify-center"
    >
      {/* 1. Glow Central Suave Vermelho Gorillaz */}
      <div className="absolute w-[600px] h-[600px] sm:w-[850px] sm:h-[850px] rounded-full bg-red-600/5 blur-[140px]" />

      {/* 2. Anéis Orbitais Futuristas */}
      <div className="absolute w-[450px] h-[450px] sm:w-[650px] sm:h-[650px] rounded-full border border-red-500/10 opacity-30 animate-pulse" />
      <div className="absolute w-[580px] h-[580px] sm:w-[820px] sm:h-[820px] rounded-full border border-dashed border-red-600/10 opacity-20" />
      <div className="absolute w-[720px] h-[720px] sm:w-[980px] sm:h-[980px] rounded-full border border-neutral-800/40 opacity-40" />

      {/* 3. Linhas Cruzadas Cibernéticas Sutis */}
      <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-red-600/10 to-transparent" />
      <div className="absolute h-full w-[1px] bg-gradient-to-b from-transparent via-red-600/10 to-transparent" />

      {/* 4. Nova Logo da Família Gorillaz em Marca D'Água Futurista */}
      <div className="relative flex flex-col items-center justify-center opacity-[0.06] sm:opacity-[0.07] transition-opacity">
        <img
          src={logoSrc}
          alt=""
          className="w-[300px] sm:w-[460px] md:w-[580px] max-w-[85vw] object-contain rounded-3xl filter drop-shadow-[0_0_50px_rgba(220,38,38,0.4)]"
          onError={() => {
            if (logoSrc !== '/images/logo-gorillaz.png') {
              setLogoSrc('/images/logo-gorillaz.png');
            }
          }}
        />
        <div className="mt-4 flex items-center gap-3">
          <span className="w-12 h-[1px] bg-red-600/40" />
          <span className="text-[11px] font-['Oswald',sans-serif] tracking-[0.4em] uppercase text-red-500/60 font-bold">
            FAMÍLIA GORILLAZ • BJJ COLLEGE
          </span>
          <span className="w-12 h-[1px] bg-red-600/40" />
        </div>
      </div>
    </div>
  );
};

export default FuturisticWatermark;
