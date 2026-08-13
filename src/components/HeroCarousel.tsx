import React, { useEffect, useRef, useState, useCallback } from 'react';

interface HeroSlide {
  id: number;
  image: string;
  badge?: string;
  title?: string;
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=1920&auto=format&fit=crop',
    badge: 'Kivora – Soluções Tecnológicas',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1920&auto=format&fit=crop',
    badge: 'Kivora – Gestão Inteligente',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1920&auto=format&fit=crop',
    badge: 'Kivora – Plataforma Integrada',
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?q=80&w=1920&auto=format&fit=crop',
    badge: 'Kivora – Relatórios & Analytics',
  },
];

interface HeroCarouselProps {
  onSlideChange?: (index: number) => void;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ onSlideChange }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goToSlide = useCallback(
    (idx: number) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIdx(idx);
        if (onSlideChange) onSlideChange(idx);
        setIsTransitioning(false);
      }, 300);
    },
    [isTransitioning, onSlideChange]
  );

  const nextSlide = useCallback(() => {
    goToSlide((currentIdx + 1) % HERO_SLIDES.length);
  }, [currentIdx, goToSlide]);

  useEffect(() => {
    intervalRef.current = setInterval(nextSlide, 6000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [nextSlide]);

  return (
    <>
      {/* Background Image with smooth cross-fade */}
      <div className="absolute inset-0 z-0">
        {HERO_SLIDES.map((slide, idx) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              idx === currentIdx ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.badge || 'Kivora'}
              className="w-full h-full object-cover animate-zoom-slow"
              loading={idx === 0 ? 'eager' : 'lazy'}
            />
          </div>
        ))}
        {/* Dark gradient overlay with Kivora colors */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-navy/90 via-black/70 to-brand-blue/30" />
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-36 sm:bottom-48 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        {HERO_SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              if (intervalRef.current) clearInterval(intervalRef.current);
              goToSlide(idx);
            }}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === currentIdx ? 'bg-brand-amber w-8' : 'bg-white/40 w-3 hover:bg-white/70'
            }`}
            aria-label={`Slide ${idx + 1}`}
          />
        ))}
      </div>
    </>
  );
};
