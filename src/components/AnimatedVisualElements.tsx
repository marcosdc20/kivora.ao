import React from 'react';
import { getModuleImage } from '../data/mediaAssets';

interface CircularSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  color?: 'amber' | 'blue' | 'emerald' | 'slate';
  text?: string;
}

/**
 * Spinner circular moderno e minimalista (sem estética artificial de IA)
 */
export const CircularSpinner: React.FC<CircularSpinnerProps> = ({
  size = 'md',
  color = 'amber',
  text,
}) => {
  const sizeClasses = {
    xs: 'w-3.5 h-3.5 border-2',
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-[2.5px]',
    lg: 'w-12 h-12 border-3',
  }[size];

  const colorClasses = {
    amber: 'border-slate-200 border-t-amber-500 border-r-amber-500',
    blue: 'border-slate-200 border-t-blue-600 border-r-blue-600',
    emerald: 'border-slate-200 border-t-emerald-500 border-r-emerald-500',
    slate: 'border-slate-200 border-t-slate-700 border-r-slate-700',
  }[color];

  return (
    <div className="inline-flex flex-col items-center justify-center gap-2.5">
      <div
        className={`${sizeClasses} ${colorClasses} rounded-full animate-spin`}
        role="status"
        aria-label="A carregar"
      />
      {text && (
        <span className="text-xs font-semibold text-slate-500 font-sans tracking-wide">
          {text}
        </span>
      )}
    </div>
  );
};

/**
 * Indicador de Sincronização em Tempo Real (Ponto Vivo)
 */
export const LiveSyncDot: React.FC<{ label?: string }> = ({ label = 'Sincronizado' }) => (
  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
    </span>
    <span>{label}</span>
  </span>
);

/**
 * Card de Mídia Corporativa para Módulos e Setores
 */
interface ModuleMediaCardProps {
  moduleId: string;
  title: string;
  subtitle: string;
  badge?: string;
}

export const ModuleMediaCard: React.FC<ModuleMediaCardProps> = ({
  moduleId,
  title,
  subtitle,
  badge,
}) => {
  const imageUrl = getModuleImage(moduleId);

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all">
      <div className="relative h-44 overflow-hidden bg-slate-100">
        <img
          src={imageUrl}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
        {badge && (
          <span className="absolute top-3 left-3 bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm">
            {badge}
          </span>
        )}
      </div>
      <div className="p-4 space-y-1">
        <h4 className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
          {title}
        </h4>
        <p className="text-xs text-slate-500 line-clamp-2">
          {subtitle}
        </p>
      </div>
    </div>
  );
};
