import React from 'react';

export function Skeleton({ className = '' }) {
  return <div className={`shimmer rounded ${className}`} />;
}

export function SkeletonRows({ count = 5, cols = 4 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-3 p-2">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardLoader({ rows = 5 }) {
  return (
    <div className="md-card p-4">
      <Skeleton className="h-6 w-40 mb-4" />
      <SkeletonRows count={rows} />
    </div>
  );
}

export function ErrorCard({ message }) {
  return (
    <div className="md-card p-8 text-center border-red-900/40">
      <p className="text-4xl mb-3">⚠️</p>
      <p className="text-pitch-muted font-body text-sm">Failed to load data</p>
      <p className="text-loss text-xs mt-1 font-mono">{message}</p>
    </div>
  );
}

export function SectionHeader({ title, subtitle, accent = true }) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2">
        {accent && <div className="w-0.5 h-5 bg-neon rounded-full" />}
        <h2 className="text-text-bright font-display font-bold text-lg uppercase tracking-wide">
          {title}
        </h2>
      </div>
      {subtitle && (
        <p className="text-pitch-muted font-mono text-xs mt-0.5 ml-2.5">{subtitle}</p>
      )}
    </div>
  );
}
