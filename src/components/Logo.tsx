import React from 'react';
import { Sparkles, Leaf } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  subtitle?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', subtitle }) => {
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-1.5 select-none">
      <div className="flex items-center gap-2.5">
        {/* Modern Bio-Tech / Health Emblem */}
        <div className="relative flex items-center justify-center p-2.5 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg shadow-emerald-500/25 border border-emerald-400/30">
          <Leaf className={`${iconSizes[size]} text-emerald-100`} />
          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-300 ring-2 ring-white animate-pulse" />
        </div>

        {/* Clean Typography */}
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5">
            <span className={`font-extrabold tracking-tight text-slate-900 ${textSizes[size]}`}>
              Nutri
            </span>
            <span className="font-black px-2 py-0.5 rounded-lg bg-emerald-600 text-white text-xs uppercase tracking-wider shadow-sm shadow-emerald-600/30">
              HM
            </span>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-[0.22em] text-emerald-700/80 -mt-0.5 flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-emerald-500" />
            Nutrição Inteligente
          </span>
        </div>
      </div>
      {subtitle && (
        <p className="text-xs text-slate-500 font-medium tracking-wide mt-1">{subtitle}</p>
      )}
    </div>
  );
};


