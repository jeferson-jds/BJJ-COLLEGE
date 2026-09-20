import React from 'react';
import { FaixaBJJ } from '../types/database';
import { FAIXAS_BJJ } from '../lib/utils';

interface FaixaBadgeProps {
  faixa: FaixaBJJ;
  graus?: number;
  showTip?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showGrausText?: boolean;
}

export const FaixaBadge: React.FC<FaixaBadgeProps> = ({
  faixa,
  graus = 0,
  showTip = true,
  size = 'md',
  className = '',
  showGrausText = false,
}) => {
  const info = FAIXAS_BJJ[faixa] || FAIXAS_BJJ.branca;
  const numGraus = Math.min(4, Math.max(0, graus || 0));

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-2 font-semibold',
    lg: 'text-sm px-3.5 py-1.5 gap-2.5 font-bold',
  };

  const tipSizes = {
    sm: numGraus > 0 ? 'min-w-[14px] px-0.5 h-3.5' : 'w-2 h-3.5',
    md: numGraus > 0 ? 'min-w-[18px] px-0.5 h-4.5' : 'w-2.5 h-4.5',
    lg: numGraus > 0 ? 'min-w-[22px] px-1 h-5.5' : 'w-3 h-5.5',
  };

  const stripeWidth = {
    sm: 'w-[1.5px] h-2.5',
    md: 'w-[2px] h-3.5',
    lg: 'w-[2.5px] h-4',
  };

  return (
    <span
      id={`faixa-badge-${faixa}`}
      className={`inline-flex items-center rounded-md select-none transition-all shadow-xs ${info.bgClass} ${info.textClass} ${info.borderClass} ${sizeClasses[size]} ${className}`}
      title={`Faixa ${info.label} ${numGraus > 0 ? `(${numGraus}º Grau)` : ''} de Jiu Jitsu`}
    >
      <span className="tracking-wide uppercase">
        {info.label}
        {showGrausText && numGraus > 0 && ` (${numGraus}º grau)`}
      </span>

      {showTip && (
        <span
          className={`inline-flex items-center justify-center gap-[1.5px] rounded-xs shrink-0 border border-black/20 overflow-hidden ${tipSizes[size]}`}
          style={{ backgroundColor: info.tipColor }}
          title={numGraus > 0 ? `Ponteira com ${numGraus} grau(s)` : 'Ponteira da faixa'}
        >
          {numGraus > 0 &&
            Array.from({ length: numGraus }).map((_, i) => (
              <span
                key={i}
                className={`bg-white shrink-0 rounded-xs shadow-[0_0_1px_rgba(0,0,0,0.5)] ${stripeWidth[size]}`}
              />
            ))}
        </span>
      )}
    </span>
  );
};
