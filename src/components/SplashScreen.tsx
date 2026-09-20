import React from 'react';

export function SplashScreen() {
  return (
    <div className="fixed inset-0 bg-[#0a0a0a] flex flex-col items-center justify-center z-50">
      <img
        src="/images/logo-gorillaz.png"
        alt="Família Gorillaz"
        className="w-72 max-w-full animate-fade-in object-contain px-4"
      />
      <div className="mt-8 flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-neutral-400 text-sm font-sans">Carregando...</p>
      </div>
    </div>
  );
}

export default SplashScreen;
