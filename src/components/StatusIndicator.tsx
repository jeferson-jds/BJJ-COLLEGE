import React from 'react';
import { StatusPagamento } from '../types/database';

interface StatusIndicatorProps {
  status: StatusPagamento;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  showLabel = true,
  size = 'md',
  className = '',
}) => {
  const isPago = status === 'pago';
  const isAtrasado = status === 'atrasado';

  const dotColor = isPago
    ? 'bg-emerald-500 ring-emerald-400'
    : isAtrasado
    ? 'bg-red-600 ring-red-400'
    : 'bg-amber-500 ring-amber-400';

  const pulseColor = isPago
    ? 'bg-emerald-400'
    : isAtrasado
    ? 'bg-red-500'
    : 'bg-amber-400';

  const badgeStyles = isPago
    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
    : isAtrasado
    ? 'bg-red-50 text-red-800 border-red-200'
    : 'bg-amber-50 text-amber-800 border-amber-200';

  const labelText = isPago ? 'Em dia' : isAtrasado ? 'Atrasado' : 'Pendente';

  const dotSize = size === 'sm' ? 'w-2 h-2' : size === 'lg' ? 'w-3 h-3' : 'w-2.5 h-2.5';

  return (
    <span
      id={`status-indicator-${status}`}
      className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badgeStyles} ${className}`}
    >
      <span className="relative flex items-center justify-center">
        {/* Animação pulsante contínua */}
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${pulseColor}`}
        />
        <span className={`relative inline-flex rounded-full ${dotSize} ${dotColor}`} />
      </span>
      {showLabel && <span>{labelText}</span>}
    </span>
  );
};
