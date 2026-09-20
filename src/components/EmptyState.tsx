import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      id="empty-state-container"
      className={`flex flex-col items-center justify-center p-8 text-center bg-white rounded-xl border border-neutral-200/80 shadow-xs ${className}`}
    >
      <div className="w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center mb-3 text-neutral-500 border border-neutral-200">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-semibold text-neutral-900 mb-1">{title}</h3>
      <p className="text-sm text-neutral-500 max-w-sm mb-4 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button
          id="btn-empty-state-action"
          onClick={onAction}
          type="button"
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 active:scale-95 transition-all rounded-lg shadow-xs"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
