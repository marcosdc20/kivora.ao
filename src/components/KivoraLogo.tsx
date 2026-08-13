import React from 'react';

interface KivoraLogoProps {
  className?: string;
  variant?: 'light' | 'dark' | 'white';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  useOfficialImage?: boolean;
}

export const KivoraLogo: React.FC<KivoraLogoProps> = ({
  className = '',
  variant = 'dark',
  size = 'md',
  showText = true,
  useOfficialImage = true,
}) => {
  const sizeMap = {
    sm: { height: 'h-7', text: 'text-lg', subText: 'text-[9px]' },
    md: { height: 'h-9 md:h-10', text: 'text-xl md:text-2xl', subText: 'text-[9px] md:text-[10px]' },
    lg: { height: 'h-12 md:h-14', text: 'text-2xl md:text-3xl', subText: 'text-[11px]' },
    xl: { height: 'h-16 md:h-20', text: 'text-3xl md:text-4xl', subText: 'text-xs' },
  };

  const currentSize = sizeMap[size];
  const textColor = variant === 'white' ? 'text-white' : 'text-[#0B192C]';
  const subTextColor = variant === 'white' ? 'text-blue-200' : 'text-slate-500';

  if (useOfficialImage) {
    const logoSrc = variant === 'white' ? '/imagens/logo_sem_fundo.png' : '/imagens/logo_kivora.png';
    return (
      <div className={`flex items-center gap-3 select-none ${className}`}>
        <img
          src={logoSrc}
          alt="Kivora Logo"
          className={`${currentSize.height} w-auto object-contain transition-transform duration-300 group-hover:scale-105`}
        />
        {showText && (
          <div className="flex flex-col">
            <span className={`font-extrabold ${textColor} ${currentSize.text} tracking-wider font-sans leading-none flex items-center`}>
              KIVOR<span className="text-[#F59E0B]">A</span>
            </span>
            <span className={`${subTextColor} ${currentSize.subText} font-semibold uppercase tracking-[0.2em] leading-none mt-1`}>
              Gestão & Faturação AGT
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Kivora Emblem 'K' Icon */}
      <svg
        width={size === 'sm' ? 32 : size === 'md' ? 40 : size === 'lg' ? 52 : 64}
        height={size === 'sm' ? 28 : size === 'md' ? 36 : size === 'lg' ? 46 : 56}
        viewBox="0 0 200 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform duration-300 group-hover:scale-105 flex-shrink-0"
      >
        <defs>
          <linearGradient id="kivoraBlueStem" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0B192C" />
            <stop offset="60%" stopColor="#1E40AF" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>
          <linearGradient id="kivoraTopArm" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#00B4D8" />
          </linearGradient>
          <linearGradient id="kivoraAmberLeg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
        </defs>

        <path
          d="M100 85 L155 30 C162 23 172 23 178 30 L185 37 C191 43 190 53 182 60 L125 105 Z"
          fill="url(#kivoraTopArm)"
        />
        <path
          d="M105 95 L160 155 C166 162 176 162 182 155 L187 148 C192 142 191 132 183 125 L128 75 Z"
          fill="url(#kivoraAmberLeg)"
        />
        <g>
          <path
            d="M 45 25 C 45 10, 65 10, 80 25 L 80 145 L 74 150 L 68 145 L 62 150 L 56 145 L 50 150 L 45 145 Z"
            fill="url(#kivoraBlueStem)"
          />
          <path
            d="M 52 35 L 73 35 L 73 135 L 52 135 Z"
            fill="#FFFFFF"
            rx="2"
          />
          <rect x="57" y="48" width="10" height="3" rx="1.5" fill="#0B192C" />
          <rect x="57" y="60" width="12" height="3" rx="1.5" fill="#0B192C" />
          <rect x="57" y="72" width="8" height="3" rx="1.5" fill="#0B192C" />
        </g>
      </svg>

      {showText && (
        <div className="flex flex-col">
          <div className={`font-extrabold ${textColor} ${currentSize.text} tracking-wider font-sans leading-none flex items-center`}>
            <span>KIVOR</span>
            <span className="relative inline-block ml-[1px]">
              A
              <span className="absolute bottom-[2px] left-[32%] border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-b-[6px] border-b-[#F59E0B]"></span>
            </span>
          </div>
          <span className={`${subTextColor} ${currentSize.subText} font-semibold uppercase tracking-[0.2em] leading-none mt-1`}>
            Gestão & Faturação AGT
          </span>
        </div>
      )}
    </div>
  );
};
