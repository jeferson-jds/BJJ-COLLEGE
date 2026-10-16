import React from 'react';

export const FuturisticWatermark: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none select-none z-0 overflow-hidden flex items-center justify-center"
    >
      {/* 1. Glow Central Suave Vermelho Gorillaz */}
      <div className="absolute w-[600px] h-[600px] sm:w-[800px] sm:h-[800px] rounded-full bg-red-600/5 blur-[120px]" />

      {/* 2. Anéis Orbitais Futuristas */}
      <div className="absolute w-[450px] h-[450px] sm:w-[650px] sm:h-[650px] rounded-full border border-red-500/10 opacity-30 animate-pulse" />
      <div className="absolute w-[580px] h-[580px] sm:w-[820px] sm:h-[820px] rounded-full border border-dashed border-red-600/10 opacity-20" />
      <div className="absolute w-[720px] h-[720px] sm:w-[980px] sm:h-[980px] rounded-full border border-neutral-800/40 opacity-40" />

      {/* 3. Linhas Cruzadas Cibernéticas Sutis */}
      <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-red-600/10 to-transparent" />
      <div className="absolute h-full w-[1px] bg-gradient-to-b from-transparent via-red-600/10 to-transparent" />

      {/* 4. Logo da Família Gorillaz em Marca D'Água Futurista */}
      <div className="relative flex flex-col items-center justify-center opacity-[0.05] sm:opacity-[0.06] transition-opacity">
        <img
          src="/images/logo-gorillaz.png"
          alt=""
          className="w-[320px] sm:w-[480px] md:w-[620px] max-w-[85vw] object-contain filter drop-shadow-[0_0_50px_rgba(220,38,38,0.4)]"
          onError={(e) => {
            // Se falhar o carregamento do png, oculta sem gerar erro
            (e.currentTarget as HTMLImageElement).style.display = 'none';
          }}
        />
        <div className="mt-4 flex items-center gap-3">
          <span className="w-12 h-[1px] bg-red-600/40" />
          <span className="text-[11px] font-['Oswald',sans-serif] tracking-[0.4em] uppercase text-red-500/50 font-bold">
            FAMÍLIA GORILLAZ • BJJ
          </span>
          <span className="w-12 h-[1px] bg-red-600/40" />
        </div>
      </div>
    </div>
  );
};

export default FuturisticWatermark;
