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
      {/* Cabeçalho */}
      <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3.5 px-4">
        <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-[#FF6500] font-display">
          <span className="w-4 h-0.5 bg-[#FF6500] rounded-full inline-block" />
          <span>{badgeText}</span>
          <span className="w-4 h-0.5 bg-[#FF6500] rounded-full inline-block" />
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight font-display">
          {title}
        </h2>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
          {subtitle}
        </p>
      </div>

      {/* Contentor do Carrossel */}
      <div className="relative max-w-5xl mx-auto px-4 sm:px-12">
        <div className="overflow-hidden min-h-[360px] sm:min-h-[330px]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch"
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
          className="absolute -left-2 sm:left-0 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white border border-slate-200 text-slate-700 hover:text-[#FF6500] hover:border-orange-300 shadow-md flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 z-10"
        >
          <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
        </button>

        {/* Botão Seguinte */}
        <button
          onClick={nextSlide}
          aria-label="Próximo testemunho"
          className="absolute -right-2 sm:right-0 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white border border-slate-200 text-slate-700 hover:text-[#FF6500] hover:border-orange-300 shadow-md flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 z-10"
        >
          <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
        </button>
      </div>

      {/* Paginação por Pontos */}
      <div className="flex items-center justify-center gap-2.5 mt-10">
        {testimonials.map((t, idx) => (
          <button
            key={t.id}
            onClick={() => {
              setDirection(idx > currentIndex ? 1 : -1);
              setCurrentIndex(idx);
            }}
            aria-label={`Ir para testemunho de ${t.name}`}
            className={`transition-all duration-300 rounded-full cursor-pointer ${
              idx === currentIndex
                ? 'w-8 h-2.5 bg-[#FF6500]'
                : 'w-2.5 h-2.5 bg-slate-300 hover:bg-slate-400'
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
    <div className="space-y-4 flex flex-col justify-between h-full">
      {/* Balão de Fala Estilo Executivo com Gradiente Vibrante Laranja */}
      <div className="bg-gradient-to-br from-[#FF7A1A] to-[#FF6500] text-white p-7 sm:p-8 rounded-3xl shadow-xl shadow-orange-500/20 relative flex flex-col justify-between flex-1">
        <div>
          {/* Header do Balão: Estrelas + Badge de Destaque */}
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-1 text-amber-200">
              {[...Array(item.rating)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 text-white px-2.5 py-0.5 rounded-full backdrop-blur-xs font-display">
              {item.badge}
            </span>
          </div>

          {/* Citação */}
          <p className="text-xs sm:text-[13px] leading-relaxed font-normal text-white/95">
            "{item.quote}"
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between text-[11px] text-white/80 pt-3 border-t border-white/20 font-medium">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-200" />
            <span>Cliente Verificado</span>
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>{item.city}</span>
          </span>
        </div>

        {/* Triângulo apontador do balão de fala */}
        <div className="absolute -bottom-2.5 left-10 w-5 h-5 bg-[#FF6500] rotate-45 pointer-events-none" />
      </div>

      {/* Informações do Autor Abaixo do Balão */}
      <div className="flex items-center gap-3.5 pl-6 pt-1">
        <div className="w-12 h-12 rounded-full border-2 border-[#FF6500] p-0.5 shrink-0 shadow-sm bg-white overflow-hidden">
          <img
            src={item.avatar}
            alt={item.name}
            className="w-full h-full object-cover rounded-full"
            loading="lazy"
            onError={(e) => {
              // Fallback gracioso se a imagem não carregar
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>
        <div className="min-w-0">
          <h4 className="text-xs sm:text-sm font-bold text-slate-950 font-display truncate">
            {item.name}
          </h4>
          <p className="text-[11px] text-slate-500 truncate font-medium">
            {item.role} • <strong className="text-slate-700">{item.company}</strong>
          </p>
        </div>
      </div>
    </div>
  );
};
