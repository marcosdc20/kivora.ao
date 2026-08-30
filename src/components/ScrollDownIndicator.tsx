import React from 'react';
import { ChevronDown } from 'lucide-react';

interface ScrollDownIndicatorProps {
  targetId?: string;
  label?: string;
  className?: string;
  variant?: 'light' | 'dark' | 'glass';
  onClick?: () => void;
}

export const ScrollDownIndicator: React.FC<ScrollDownIndicatorProps> = ({
  targetId = 'modulos',
  label = 'Rolar para Explorar',
  className = '',
  variant = 'glass',
  onClick,
}) => {
  const handleScrollDown = () => {
    if (onClick) {
      onClick();
      return;
    }
    const target = document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollBy({ top: window.innerHeight * 0.75, behavior: 'smooth' });
    }
  };

  const styleVariants = {
    glass: 'text-white/80 hover:text-white bg-white/10 hover:bg-white/20 border-white/20 hover:border-white/40 backdrop-blur-md shadow-lg shadow-black/10',
    light: 'text-slate-600 hover:text-blue-600 bg-white/90 hover:bg-white border-slate-200 hover:border-blue-300 shadow-md shadow-slate-900/5',
    dark: 'text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-900 border-slate-700 hover:border-slate-500 shadow-xl',
  };

  return (
    <button
      onClick={handleScrollDown}
      aria-label={label}
      className={`group cursor-pointer inline-flex flex-col items-center gap-2 transition-all duration-300 select-none ${className}`}
    >
      {/* Capsule Mouse Animation */}
      <div
        className={`w-7 h-11 rounded-full border-2 flex items-start justify-center p-1.5 transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-0.5 ${styleVariants[variant]}`}
      >
        <div className="w-1.5 h-2.5 rounded-full bg-current animate-scroll-wheel shadow-xs" />
      </div>

      {/* Label and Bouncing Chevron */}
      <div className="flex items-center gap-1 text-[11px] font-bold tracking-wider uppercase opacity-80 group-hover:opacity-100 transition-opacity">
        <span>{label}</span>
        <ChevronDown className="w-3.5 h-3.5 animate-bounce-subtle group-hover:translate-y-0.5 transition-transform" />
      </div>
    </button>
  );
};
