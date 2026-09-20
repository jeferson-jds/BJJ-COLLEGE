import React from 'react';

export const SkeletonCard: React.FC<{ rows?: number }> = ({ rows = 3 }) => {
  return (
    <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-xs animate-pulse space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-neutral-200" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-neutral-200 rounded w-1/2" />
          <div className="h-3 bg-neutral-200 rounded w-1/4" />
        </div>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-3 bg-neutral-200 rounded w-full" />
      ))}
    </div>
  );
};

export const SkeletonList: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
};
