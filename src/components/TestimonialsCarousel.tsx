import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, ShieldCheck, MapPin } from 'lucide-react';

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  company: string;
  city: string;
  avatar: string;
  rating: number;
  badge: string;
  quote: string;
}

export const OFFICIAL_TESTIMONIALS: TestimonialItem[] = [
  {
    id: 'kiala',
    name: 'Mateus Kiala',
    role: 'Diretor Geral de Operações',
    company: 'Supermercados & Logística Kiala',
    city: 'Luanda (Viana & Maianga)',
    avatar: '/imagens/2206.webp',
    rating: 5,
    badge: '100% Offline & Rápido',
    quote: 'A estabilidade offline do KIVORA mudou radicalmente as nossas 4 lojas. Em Luanda, as quebras de internet costumavam bloquear o atendimento. Agora, o caixa não para nem um segundo e as faturas saem imediatamente com o QR Code fiscal da AGT.',
  },
  {
    id: 'esperanca',
    name: 'Esperança Domingos',
    role: 'Gerente Geral e Farmacêutica',
    company: 'Farmácia & Clínica Esperança',
    city: 'Benguela',
    avatar: '/imagens/2148708903.webp',
    rating: 5,
    badge: 'Zero Divergências de IRT',
    quote: 'O módulo de stocks com controlo de validade e o cálculo automático de IRT poupam-nos semanas de trabalho manual no encerramento do mês. A assistência presencial da equipa técnica foi exemplar e o software é muito intuitivo.',
  },
  {
    id: 'antonio',
    name: 'Eng. António Manuel',
    role: 'Sócio-Gerente',
    company: 'Padaria & Pastelaria Delícia',
    city: 'Huambo',
    avatar: '/imagens/13608.webp',
    rating: 5,
    badge: 'Rede LAN Multi-Postos',
    quote: 'Instalámos o KIVORA em 3 caixas interligados em rede local com o escritório. Não dependemos de fibra óptica, a velocidade de impressão térmica em 80mm é instantânea e o fecho de caixa diário bate sempre certo ao cêntimo.',
  },
  {
    id: 'teresa',
    name: 'Dra. Teresa Cambuta',
    role: 'Sócia e Consultora Fiscal',
    company: 'Cambuta & Associados Auditores',
    city: 'Luanda (Talatona)',
    avatar: '/imagens/jovem-empresaria-com-tablet.png',
    rating: 5,
    badge: 'SAF-T AO 100% Homologado',
    quote: 'Para os nossos clientes, a conformidade com o Decreto Presidencial 71/25 é sagrada. O validador do ficheiro SAF-T AO do KIVORA elimina erros antes do envio ao portal da AGT. É de longe o ERP desktop mais fiável de Angola.',
  },
  {
    id: 'jose',
    name: 'José Bartolomeu',
    role: 'Administrador',
    company: 'Bartolomeu Materiais de Construção',
    city: 'Lobito (Benguela)',
    avatar: '/imagens/jovem-empresario-dado-boas-vindas.png',
    rating: 5,
    badge: 'Alta Rotação de Stock',
    quote: 'Gerimos mais de 4.000 artigos com preços por grosso e retalho. O leitor ótico 2D lê códigos em frações de segundo. O suporte técnico em Angola e as licenças em Kwanzas sem variação cambial dão-nos total segurança.',
  },
  {
    id: 'fatima',
    name: 'Maria de Fátima',
    role: 'Proprietária',
    company: 'Boutique Chic & Estilo',
    city: 'Luanda (Kilamba)',
    avatar: '/imagens/2149153824.webp',
    rating: 5,
    badge: 'Simples & Elegante',
    quote: 'Não sou técnica de informática e precisava de um software simples para emitir faturas certificadas e controlar o caixa. Aprendi a faturar no KIVORA em menos de 10 minutos. O suporte pelo WhatsApp responde sempre de imediato.',
  },
];

interface TestimonialsCarouselProps {
  testimonials?: TestimonialItem[];
  title?: string;
  subtitle?: string;
  badgeText?: string;
  className?: string;
}

export const TestimonialsCarousel: React.FC<TestimonialsCarouselProps> = ({
  testimonials = OFFICIAL_TESTIMONIALS,
  title = 'O Que Dizem os Nossos Clientes',
  subtitle = 'Empresas reais em Luanda, Benguela, Huambo e por toda Angola que transformaram a sua gestão diária com o KIVORA.',
  badgeText = 'Testemunhos Oficiais',
  className = '',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartXRef = useRef<number | null>(null);

  const total = testimonials.length;

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Auto-play timer (avança a cada 6 segundos caso o rato não esteja por cima)
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  // Suporte a Touch Swipe em dispositivos móveis
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
    touchStartXRef.current = null;
  };

  // Os 2 itens visíveis para desktop
  const firstItem = testimonials[currentIndex];
  const secondIndex = (currentIndex + 1) % total;
  const secondItem = testimonials[secondIndex];

  const variants: Variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 40 : -40,
      opacity: 0,
      scale: 0.98,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.38, ease: 'easeOut' },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -40 : 40,
      opacity: 0,
      scale: 0.98,
      transition: { duration: 0.28, ease: 'easeIn' },
    }),
  };

  return (
    <div
      className={`relative w-full ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Cabeçalho Editorial */}
      <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3 px-4">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#FF6500] block">
          {badgeText}
        </span>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight font-display">
          {title}
        </h2>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
          {subtitle}
        </p>
      </div>

      {/* Contentor do Carrossel */}
      <div className="relative max-w-5xl mx-auto px-4 sm:px-12">
        <div className="overflow-hidden min-h-[340px] sm:min-h-[300px]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch"
            >
              {/* Card 1 */}
              <TestimonialCard item={firstItem} />

              {/* Card 2 (Oculto em mobile pequeno para clareza, exibido a partir de MD) */}
              <div className="hidden md:block">
                <TestimonialCard item={secondItem} />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Botão Anterior */}
        <button
          onClick={prevSlide}
          aria-label="Testemunho anterior"
          className="absolute -left-2 sm:left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-[#FF6500] hover:border-slate-300 shadow-sm flex items-center justify-center transition-all cursor-pointer active:scale-95 z-10"
        >
          <ChevronLeft className="w-5 h-5" strokeWidth={2} />
        </button>

        {/* Botão Seguinte */}
        <button
          onClick={nextSlide}
          aria-label="Próximo testemunho"
          className="absolute -right-2 sm:right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-[#FF6500] hover:border-slate-300 shadow-sm flex items-center justify-center transition-all cursor-pointer active:scale-95 z-10"
        >
          <ChevronRight className="w-5 h-5" strokeWidth={2} />
        </button>
      </div>

      {/* Paginação por Traços Monospace */}
      <div className="flex items-center justify-center gap-2 mt-8">
        {testimonials.map((t, idx) => (
          <button
            key={t.id}
            onClick={() => {
              setDirection(idx > currentIndex ? 1 : -1);
              setCurrentIndex(idx);
            }}
            aria-label={`Ir para testemunho de ${t.name}`}
            className={`transition-all duration-200 cursor-pointer h-1.5 rounded-full ${
              idx === currentIndex
                ? 'w-6 bg-[#FF6500]'
                : 'w-2 bg-slate-300 hover:bg-slate-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

interface TestimonialCardProps {
  item: TestimonialItem;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ item }) => {
  return (
    <div className="bg-white rounded-2xl p-7 border border-slate-200/90 shadow-xs hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between h-full space-y-6">
      <div className="space-y-4">
        {/* Topo do Card: Estrelas + Badge */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 text-amber-500">
            {[...Array(item.rating)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-current" />
            ))}
          </div>
          <span className="text-[11px] font-mono font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200/70">
            {item.badge}
          </span>
        </div>

        {/* Citação */}
        <p className="text-xs sm:text-sm leading-relaxed text-slate-700 font-normal">
          "{item.quote}"
        </p>
      </div>

      {/* Autor & Localização */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full ring-1 ring-slate-200 shadow-xs shrink-0 overflow-hidden bg-slate-100">
            <img
              src={item.avatar}
              alt={item.name}
              className="w-full h-full object-cover rounded-full"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs sm:text-sm font-bold text-slate-950 font-display truncate">
                {item.name}
              </h4>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            </div>
            <p className="text-[11px] text-slate-500 truncate font-normal">
              {item.role} • <span className="font-semibold text-slate-700">{item.company}</span>
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400 shrink-0 font-mono">
          <MapPin className="w-3 h-3 text-slate-400" />
          <span>{item.city}</span>
        </div>
      </div>
    </div>
  );
};
