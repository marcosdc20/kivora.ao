import React, { useRef, useState, useCallback } from 'react';

interface CardSpotlightProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
}

/**
 * CardSpotlight — Efeito sutil de iluminação de borda e superfície no hover (estilo Linear/Vercel)
 * Mantém performance a 60fps usando gradientes CSS nativos calculados por coordenadas.
 */
export const CardSpotlight: React.FC<CardSpotlightProps> = ({
  children,
  className = '',
  spotlightColor = 'rgba(59, 130, 246, 0.12)',
  ...props
}) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  const handleMouseEnter = useCallback(() => {
    setOpacity(1);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setOpacity(0);
  }, []);

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative rounded-3xl border border-slate-200/90 bg-white overflow-hidden transition-all duration-300 ${className}`}
      {...props}
    >
      {/* Halo de luz suave que segue o cursor */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300 ease-out z-0"
        style={{
          opacity,
          background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 70%)`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
};
