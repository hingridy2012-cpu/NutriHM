import React from 'react';
import { Feather } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  subtitle?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', subtitle }) => {
  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-7 h-7',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-1.5 select-none">
      <div className="flex items-center gap-3">
        {/* Retro Emblem Badge */}
        <div className="relative flex items-center justify-center p-2.5 rounded-2xl bg-[#2a556f] text-[#f7f2ea] shadow-md border-2 border-[#d9cbb8] ring-2 ring-[#2a556f]/20">
          <Feather className={`${iconSizes[size]} text-[#f3e7d3]`} />
          <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#c07a4a] border-2 border-white" />
        </div>

        {/* Retro Typography */}
        <div className="flex flex-col text-left">
          <div className="flex items-baseline gap-1.5">
            <span className={`font-serif-retro font-black tracking-tight text-[#23201d] ${textSizes[size]}`}>
              Nutri
            </span>
            <span className="font-display-retro font-bold px-1.5 py-0.5 rounded-md bg-[#c07a4a] text-[#faf6f0] text-xs uppercase tracking-widest shadow-xs">
              HM
            </span>
          </div>
          <span className="text-[9.5px] uppercase font-bold tracking-[0.2em] text-[#6d6156] -mt-0.5">
            Clínica & Nutrição · Est. 2026
          </span>
        </div>
      </div>
      {subtitle && (
        <p className="text-xs text-[#7e7266] font-medium tracking-wide mt-1">{subtitle}</p>
      )}
    </div>
  );
};


