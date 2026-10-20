import React, { useState, useEffect, useMemo } from 'react';
import { HeroCarousel } from '../components/HeroCarousel';
import { TestimonialsCarousel } from '../components/TestimonialsCarousel';
import { CountUp } from '../components/CountUp';
import {
  ArrowRight, Download, Wifi,
  Check, ShieldCheck,
  Phone,
  Boxes, Users,
  HardDrive, ChevronRight,
  Award, CheckCircle2
} from 'lucide-react';
import { PageId } from '../components/Header';
import {
  subscribeSystemSettings, getCachedSystemSettings,
  SystemCompanySettings, subscribeAllRegisteredBrands,
  PartnerBrandLogo
} from '../services/systemSettingsService';

import posImg from '../assets/kivora/pc-pos-kivora.png';
import desktopImg from '../assets/kivora/pc-descktop-kivora.png';
import laptopImg from '../assets/kivora/pc-laptop-kivora.png';
import executivosImg from '../assets/kivora/executivos-kivora.jpg';
import supermercadoImg from '../assets/kivora/supermercado-kivora.jpg';

interface HomePageProps {
  onSelectModule?: (module: any) => void;
  onOpenDemoModal: (subject?: string) => void;
  onNavigatePage: (page: PageId) => void;
}

const DEFAULT_PARTNER_BRANDS: PartnerBrandLogo[] = [
  { id: 'pb-1', name: 'VISUAL SOFTWARE - COMÉRCIO E SERVIÇOS, LDA', logoUrl: '', type: 'parceiro', active: true },
  { id: 'pb-2', name: 'GRUPO ATLÂNTICO DISTRIBUIÇÃO & LOGÍSTICA', logoUrl: '', type: 'cliente', active: true },
  { id: 'pb-3', name: 'LUANDA RETAIL & REDE DE SUPERMERCADOS', logoUrl: '', type: 'cliente', active: true },
  { id: 'pb-4', name: 'FARMÁCIAS VIDA & SAÚDE ANGOLA', logoUrl: '', type: 'cliente', active: true },
  { id: 'pb-5', name: 'ANGOCOMÉRCIO MULTI-ARQUIPÉLAGO', logoUrl: '', type: 'parceiro', active: true },
  { id: 'pb-6', name: 'RESTAURAÇÃO & HOTELARIA MIRAMAR', logoUrl: '', type: 'cliente', active: true },
  { id: 'pb-7', name: 'KWANZA LOGÍSTICA & DISTRIBUIÇÃO', logoUrl: '', type: 'parceiro', active: true },
  { id: 'pb-8', name: 'GABINETE FISCAL & AUDITORIA DE LUANDA', logoUrl: '', type: 'parceiro', active: true },
];

const parseFeatures = (text?: string, fallback: string[] = []): string[] => {
  if (!text) return fallback;
  const items = text.split('\n').map((s) => s.trim()).filter(Boolean);
  return items.length > 0 ? items : fallback;
};

export const HomePage: React.FC<HomePageProps> = ({
  onSelectModule: _onSelectModule,
  onOpenDemoModal,
  onNavigatePage,
}) => {
  const [settings, setSettings] = useState<SystemCompanySettings>(getCachedSystemSettings());
  const [partnerLogos, setPartnerLogos] = useState<PartnerBrandLogo[]>([]);

  useEffect(() => {
    const unsubSettings = subscribeSystemSettings(setSettings);
    const unsubBrands = subscribeAllRegisteredBrands(setPartnerLogos);
    return () => {
      unsubSettings();
      unsubBrands();
    };
  }, []);

  const effectivePartnerLogos = useMemo(() => {
    if (partnerLogos && partnerLogos.length >= 4) {
      return partnerLogos;
    }
    const existingNames = new Set((partnerLogos || []).map((p) => p.name.toLowerCase().trim()));
    const additional = DEFAULT_PARTNER_BRANDS.filter((b) => !existingNames.has(b.name.toLowerCase().trim()));
    return [...(partnerLogos || []), ...additional];
  }, [partnerLogos]);

  return (
    <div className="bg-white text-slate-900 font-sans selection:bg-[#FF6500] selection:text-white">
      
      {/* ══════════════════════════════════════════════════════════════════
          1. HERO CAROUSEL COM FRAMER MOTION & SLIDE SEGMENTS
          ══════════════════════════════════════════════════════════════════ */}
      <HeroCarousel
        onNavigatePage={onNavigatePage}
        onOpenDemoModal={onOpenDemoModal}
      />

      {/* ══════════════════════════════════════════════════════════════════
          2. FAIXA DE DESTAQUE TRIPLA (3-PART OVERLAPPING STRIP — EXECUTIVO & ESPAÇOSO)
          Card 1 (Slate Escuro), Card 2 (Laranja Vibrante), Card 3 (Branco Executivo)
          ══════════════════════════════════════════════════════════════════ */}
      {/* ══════════════════════════════════════════════════════════════════
          2. FAIXA DE DESTAQUE EXECUTIVA (COHESIVE COMMAND STRIP — ALTO REFINO & TACTILIDADE)
          Substituição das 3 caixas destoantes por um strip executivo unificado
          ══════════════════════════════════════════════════════════════════ */}
      <section id="solucoes-rapidas" className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 sm:-mt-12 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5" data-stagger>
          
          {/* Card 1: Tradição & Solidez em Angola */}
          <div
            data-reveal
            className="bg-[#0A1322] rounded-2xl p-6 shadow-xl border border-slate-800 text-white flex items-center justify-between gap-4 group hover:border-slate-700 transition-all duration-200"
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl sm:text-5xl font-black text-[#FF6500] font-mono-num tracking-tight shrink-0">
                12+
              </span>
              <div>
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                  Experiência Comprovada
                </span>
                <h3 className="text-base sm:text-lg font-extrabold text-white font-display leading-tight">
                  Anos no Mercado Angolano
                </h3>
                <span className="text-xs text-slate-300 font-medium block mt-0.5">
                  +2.800 empresas e postos ativos
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 text-orange-400 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
          </div>

          {/* Card 2: Apoio e Diagnóstico Fiscal */}
          <div
            data-reveal
            onClick={() => onOpenDemoModal('Diagnóstico Fiscal Gratuito')}
            className="bg-[#0A1322] rounded-2xl p-6 shadow-xl border border-slate-800 text-white flex items-center justify-between gap-4 cursor-pointer hover:border-orange-500/50 hover:bg-[#0D1829] transition-all duration-200 group"
          >
            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-orange-400 block">
                Transição Decreto 71/25
              </span>
              <h3 className="text-base sm:text-lg font-extrabold text-white font-display leading-tight group-hover:text-orange-400 transition-colors">
                Precisa de Diagnóstico Fiscal?
              </h3>
              <span className="text-xs text-slate-300 font-medium block mt-0.5">
                Demonstração VIP & apoio presencial em Luanda
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#FF6500] text-white flex items-center justify-center shrink-0 group-hover:bg-[#EB5B00] transition-colors shadow-sm">
              <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
            </div>
          </div>

          {/* Card 3: Linha Direta Luanda */}
          <div
            data-reveal
            className="bg-[#0A1322] rounded-2xl p-6 shadow-xl border border-slate-800 text-white flex items-center justify-between gap-4 group hover:border-slate-700 transition-all duration-200"
          >
            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                Atendimento Imediato
              </span>
              <a
                href={settings.whatsappUrl || 'https://wa.me/244974855494'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg sm:text-xl font-bold font-mono-num text-white hover:text-orange-400 block tracking-tight transition-colors"
              >
                {settings.phoneDisplay || '+244 974 855 494'}
              </a>
              <span className="text-xs text-slate-300 font-medium block mt-0.5">
                Linha Direta Luanda • Seg a Sáb 08h-18h
              </span>
            </div>
            <a
              href={settings.whatsappUrl || 'https://wa.me/244974855494'}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Contactar Linha Direta via WhatsApp"
              className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 text-emerald-400 hover:bg-emerald-500 hover:text-white flex items-center justify-center shrink-0 transition-all"
            >
              <Phone className="w-5 h-5" />
            </a>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          3. LOGOTIPOS DE PARCEIROS & CLIENTES (MARQUEE SÓBRIO & AUTORITÁRIO)
          ══════════════════════════════════════════════════════════════════ */}
      <section data-reveal className="py-6 bg-slate-50/80 border-y border-slate-200/70 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
            <span className="truncate">Empresas e Parceiros Integrados ao Ecossistema KIVORA</span>
          </span>
          <button
            onClick={() => onNavigatePage('parceiros')}
            className="text-xs font-bold text-[#FF6500] hover:text-[#EB5B00] flex items-center gap-1 cursor-pointer transition-colors shrink-0 self-start sm:self-auto"
          >
            <span>Ver Rede de Parceiros</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="relative w-full overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none" />

          <div className="animate-marquee flex items-center gap-5 py-2">
            {[...effectivePartnerLogos, ...effectivePartnerLogos].map((partner, idx) => (
              <div
                key={`${partner.id}-${idx}`}
                className="flex items-center gap-3 px-4 py-2.5 bg-white rounded-xl border border-slate-200/70 shadow-xs shrink-0 select-none hover:border-slate-300 transition-colors"
              >
                {partner.logoUrl ? (
                  <img
                    src={partner.logoUrl}
                    alt={partner.name}
                    className="h-6 w-auto object-contain rounded"
                  />
                ) : (
                  <div className="w-6 h-6 rounded bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs font-mono">
                    {partner.name.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <span className="text-xs font-semibold text-slate-700">
                  {partner.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          4. SOBRE A KIVORA SOFT (ABOUT SECTION — EXATAMENTE COMO NA IMAGEM 4)
          Layout Dividido: Imagem com Badge Flutuante + 2 Cards Circulares + Checklist
          ══════════════════════════════════════════════════════════════════ */}
      {/* ══════════════════════════════════════════════════════════════════
          4. SOBRE A KIVORA SOFT (ABOUT SECTION — EDITORIAL & AUTORITÁRIO)
          Layout Dividido: Imagem com Selo Institucional + 2 Pilares Executivos + Checklist
          ══════════════════════════════════════════════════════════════════ */}
      <section id="sobre-kivora" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Coluna Esquerda: Imagem com Placa Oficial de Certificação */}
          <div data-reveal data-reveal-dir="left" className="lg:col-span-6 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
              <img
                src={settings.aboutImageUrl || executivosImg}
                alt="Equipa e Consultores Kivora Soft"
                className="w-full h-[380px] sm:h-[460px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
            </div>

            {/* Placa Oficial de Certificação AGT no Canto Inferior Direito (Anti-Slop: Design sóbrio & institucional) */}
            <div className="absolute -bottom-6 right-2 sm:-bottom-8 sm:right-6 bg-[#0A1322] text-white p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-2xl max-w-[260px] sm:max-w-[300px]">
              <div className="flex items-center gap-3 mb-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 block">Certificação Oficial</span>
                  <span className="text-xs font-bold text-white font-mono-num">FE/387/AGT/2026</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                Decreto Presidencial n.º 71/25 & Código do IVA plenamente em vigor e auditados.
              </p>
            </div>
          </div>

          {/* Coluna Direita: Informações & 2 Pilares Estruturados */}
          <div data-reveal data-reveal-dir="right" className="lg:col-span-6 space-y-6">
            <div className="space-y-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#FF6500] block">
                01 // Sobre a Kivora Soft
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight font-display leading-[1.12]">
                A Escolha de Confiança em Gestão Empresarial para Angola
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                Desenvolvemos soluções de faturação e contabilidade que funcionam perfeitamente na realidade angolana: sem quedas por falta de internet, com suporte presencial em Luanda e total segurança fiscal perante a AGT.
              </p>
            </div>

            {/* 2 Pilares Executivos (Anti-Slop: Sem caixas redondas com gradientes artificiais) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1" data-stagger>
              <div data-reveal className="bg-slate-50/90 rounded-2xl p-5 border border-slate-200/80 space-y-2 hover:border-slate-300 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold shadow-xs">
                  <Wifi className="w-4 h-4 text-orange-400" />
                </div>
                <h4 className="text-sm font-bold text-slate-950 font-display">
                  Autonomia Total Offline
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Base de dados local SQLite. A sua loja fatura e atende clientes sem depender de fibra ótica ou rede móvel.
                </p>
              </div>

              <div data-reveal className="bg-slate-50/90 rounded-2xl p-5 border border-slate-200/80 space-y-2 hover:border-slate-300 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold shadow-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <h4 className="text-sm font-bold text-slate-950 font-display">
                  Conformidade AGT DP 71/25
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Assinatura digital RSA-SHA256 em cada documento fiscal e exportação mensal de ficheiro SAF-T AO sem falhas.
                </p>
              </div>
            </div>

            {/* Checklist de 4 Pontos */}
            <div className="space-y-2.5 pt-1 text-xs text-slate-700">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#FF6500] shrink-0" />
                <span>Instalação presencial rápida de postos de trabalho e servidores LAN em Luanda.</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#FF6500] shrink-0" />
                <span>Módulo de Recursos Humanos com escalões IRT 2026 e desconto INSS de 3%/8%.</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#FF6500] shrink-0" />
                <span>Preços transparentes fixados em Kwanzas (AOA), sem dependência cambial de moeda estrangeira.</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#FF6500] shrink-0" />
                <span>Formação prática incluída para a sua equipa de operadores de caixa e gerentes.</span>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3.5 pt-2">
              <button
                onClick={() => onNavigatePage('sobre')}
                className="w-full sm:w-auto justify-center bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm px-7 py-3.5 rounded-xl transition-all cursor-pointer shadow-sm hover:shadow-md active:scale-98 flex items-center gap-2"
              >
                <span>Conhecer a Nossa História</span>
                <ArrowRight className="w-4 h-4 text-orange-400" />
              </button>
              <button
                onClick={() => onOpenDemoModal('Demonstração Sobre Kivora')}
                className="w-full sm:w-auto text-center bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-xs sm:text-sm px-7 py-3.5 rounded-xl transition-all cursor-pointer shadow-xs active:scale-98"
              >
                Solicitar Apresentação
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          5. MÓDULOS E SOLUÇÕES CENTRAIS (ANTI-SLOP: GRID ASSIMÉTRICO E SUBSTANTIVO)
          Substituição dos 6 cartões repetitivos por uma matriz editorial de alta densidade
          ══════════════════════════════════════════════════════════════════ */}
      <section id="o-que-fazemos" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        {/* Cabeçalho Editorial com Hierarquia Real */}
        <div data-reveal className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16">
          <div className="max-w-2xl">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#FF6500] block mb-2">
              02 // Soluções Centrais
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight font-display">
              Tecnologia Feita para o Ritmo Comercial de Angola
            </h2>
          </div>
          <p className="text-sm sm:text-base text-slate-600 max-w-md font-normal leading-relaxed">
            Arquitetura modular de alta performance: da frente de caixa ao fecho contabilístico, com conformidade fiscal estrita perante a AGT e operação 100% offline.
          </p>
        </div>

        {/* Grade Assimétrica de Módulos */}
        <div data-stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          
          {/* Card Principal de Destaque (Ocupa 2 Colunas em Telas Grandes): Faturação Eletrónica & POS */}
          <div
            data-reveal
            onClick={() => onNavigatePage('faturacao')}
            className="md:col-span-2 bg-[#0A1322] rounded-3xl p-8 sm:p-10 border border-slate-800 shadow-xl text-white flex flex-col justify-between group cursor-pointer hover:border-slate-700 transition-all duration-300 relative overflow-hidden"
          >
            <div className="relative z-10 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/[0.08] border border-white/10 text-orange-400 text-xs font-mono font-semibold">
                  <span>Módulo Principal • Certificação Oficial</span>
                </div>
                <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                  FE/387/AGT/2026
                </span>
              </div>

              <div className="space-y-3">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight group-hover:text-orange-400 transition-colors">
                  Faturação Eletrónica AGT & Ponto de Venda POS
                </h3>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl font-normal">
                  Emissão em menos de 3 segundos de Faturas (FT), Faturas-Recibo (FR), Guias de Transporte e Notas de Crédito com assinatura criptográfica RSA-SHA256, QR Code fiscal da AGT e fecho cego de caixa Z. Operação contínua e segura mesmo em caso de falha de internet.
                </p>
              </div>

              {/* Pílulas de Funcionalidades Reais */}
              <div className="flex flex-wrap gap-2.5 pt-2 text-xs text-slate-300">
                <span className="px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/10">
                  Assinatura Digital RSA-SHA256
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/10">
                  Talões Térmicos 80mm e 58mm
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/10">
                  Gestão de Sangrias & Gavetas RJ11
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/10">
                  Ficheiro SAF-T (AO) sem divergências
                </span>
              </div>
            </div>

            <div className="relative z-10 pt-8 mt-6 border-t border-slate-800/90 flex items-center justify-between text-xs font-bold text-orange-400">
              <span className="text-slate-400 font-normal">Conformidade obrigatória com o Decreto Presidencial 71/25</span>
              <div className="flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                <span>Explorar Faturação & POS</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Card 2: Hardware Comercial POS */}
          <div
            data-reveal
            onClick={() => onNavigatePage('hardware')}
            className="bg-white rounded-3xl p-7 border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-slate-300 transition-all duration-200 flex flex-col justify-between group cursor-pointer"
          >
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200/70 text-slate-900 flex items-center justify-center font-bold">
                <HardDrive className="w-5 h-5 text-[#FF6500]" />
              </div>
              <h3 className="text-lg font-bold text-slate-950 font-display group-hover:text-[#FF6500] transition-colors">
                Hardware & Terminais POS
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Terminais touch all-in-one industriais, impressoras térmicas ESC/POS de 80mm, leitores 2D de código de barras e configuração presencial de rede LAN em Luanda.
              </p>
            </div>
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#FF6500]">
              <span className="text-slate-400 font-medium">Garantia Local 12 Meses</span>
              <div className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Ver Loja</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Card 3: Gestão de Stock Multi-Armazém */}
          <div
            data-reveal
            onClick={() => onNavigatePage('stock')}
            className="bg-white rounded-3xl p-7 border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-slate-300 transition-all duration-200 flex flex-col justify-between group cursor-pointer"
          >
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200/70 text-slate-900 flex items-center justify-center font-bold">
                <Boxes className="w-5 h-5 text-[#FF6500]" />
              </div>
              <h3 className="text-lg font-bold text-slate-950 font-display group-hover:text-[#FF6500] transition-colors">
                Stock & Armazéns
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Controlo em tempo real de entradas, saídas, quebras e inventário. Rastreio rigoroso de lotes e datas de validade para farmácias e supermercados, com transferências entre filiais.
              </p>
            </div>
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#FF6500]">
              <span className="text-slate-400 font-medium">Multi-Depósito</span>
              <div className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Saber mais</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Card 4: Recursos Humanos & IRT 2026 */}
          <div
            data-reveal
            onClick={() => onNavigatePage('rh')}
            className="bg-white rounded-3xl p-7 border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-slate-300 transition-all duration-200 flex flex-col justify-between group cursor-pointer"
          >
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200/70 text-slate-900 flex items-center justify-center font-bold">
                <Users className="w-5 h-5 text-[#FF6500]" />
              </div>
              <h3 className="text-lg font-bold text-slate-950 font-display group-hover:text-[#FF6500] transition-colors">
                Recursos Humanos & IRT 2026
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Processamento automático de salários segundo a LGT, aplicação das novas tabelas escalonadas de IRT 2026, retenções INSS de 3%/8% e emissão de recibos de vencimento em PDF.
              </p>
            </div>
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#FF6500]">
              <span className="text-slate-400 font-medium">Mapas INSS & IRT</span>
              <div className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Saber mais</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Card 5: Contabilidade & SAF-T AO */}
          <div
            data-reveal
            onClick={() => onNavigatePage('contabilidade')}
            className="bg-white rounded-3xl p-7 border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-slate-300 transition-all duration-200 flex flex-col justify-between group cursor-pointer"
          >
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200/70 text-slate-900 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-950 font-display group-hover:text-[#FF6500] transition-colors">
                Contabilidade & SAF-T AO
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Plano Geral de Contas (PGC-AO), diários de reconciliação, balancetes de verificação, mapa de impostos e exportação mensal do ficheiro SAF-T para validação AGT.
              </p>
            </div>
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#FF6500]">
              <span className="text-slate-400 font-medium">PGC-AO Oficial</span>
              <div className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Saber mais</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

        </div>

        {/* ── BARRA DE CHAMADA EXECUTIVA (Anti-Slop: Substituição de gradientes neon por um strip executivo) ── */}
        <div data-reveal className="mt-12 bg-[#0A1322] rounded-2xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-white/[0.08] border border-white/10 flex items-center justify-center text-orange-400 shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-bold font-display text-white tracking-tight">
                Deseja apoio para escolher o formato de licenciamento da sua empresa?
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 font-normal mt-0.5">
                Fale diretamente com os nossos consultores especializados em Luanda para um diagnóstico gratuito.
              </p>
            </div>
          </div>

          <a
            href={settings.whatsappUrl || 'https://wa.me/244974855494'}
            target="_blank"
            rel="noopener noreferrer"
            className="whitespace-nowrap bg-[#FF6500] hover:bg-[#EB5B00] active:scale-95 text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl flex items-center gap-2 shadow-md transition-all font-mono-num tracking-wide shrink-0"
          >
            <span>Falar Agora: {settings.phoneDisplay || '+244 974 855 494'}</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

      </section>

      {/* ══════════════════════════════════════════════════════════════════
          BANNER DE IMPACTO FOTOGRÁFICO: CONTINUIDADE OPERACIONAL
          "Mais do que Faturação: É a Segurança e Continuidade do Seu Negócio"
          ══════════════════════════════════════════════════════════════════ */}
      <section data-reveal className="relative py-24 sm:py-28 px-4 sm:px-6 lg:px-8 text-white overflow-hidden bg-[#0A1322] border-y border-slate-800">
        {/* Imagem de Fundo com Overlay Escuro Gradiente */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img
            src={settings.stepsImageUrl || settings.heroImageUrl || supermercadoImg}
            alt="Operação Comercial KIVORA"
            className="w-full h-full object-cover opacity-15 filter saturate-50"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A1322] via-[#0A1322]/95 to-[#0A1322]/85" />
        </div>

        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-orange-400 block">
            03 // Continuidade Operacional
          </span>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.12] font-display">
            Mais do que Faturação: É a Segurança e Continuidade do Seu Negócio em Angola
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-normal">
            Elimine as paragens de caixa causadas por quebras de internet. Mantenha os seus clientes satisfeitos, as filas a andar e o seu fecho de caixa 100% rigoroso com a base SQLite local e auditoria AGT.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
            <button
              onClick={() => onOpenDemoModal('Demonstração Impacto')}
              className="bg-[#FF6500] hover:bg-[#EB5B00] active:scale-98 text-white font-bold text-xs sm:text-sm px-8 py-3.5 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer font-sans"
            >
              <span>Falar com um Especialista Agora</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigatePage('faturacao')}
              className="bg-white/10 hover:bg-white/20 active:scale-98 text-white border border-white/20 font-bold text-xs sm:text-sm px-8 py-3.5 rounded-xl transition-all cursor-pointer backdrop-blur-md"
            >
              Ver Módulo de Faturação
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          6. COMO TRABALHAMOS? (PIPELINE DE IMPLEMENTAÇÃO EM 4 ETAPAS)
          Substituição dos números gigantes isolados por um roadmap cronológico corporativo
          ══════════════════════════════════════════════════════════════════ */}
      <section id="como-trabalhamos" className="py-24 sm:py-32 bg-slate-50/80 border-b border-slate-200/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          <div data-reveal className="text-center max-w-2xl mx-auto mb-16 sm:mb-20 space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#FF6500] block">
              04 // Roteiro de Implementação
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight font-display">
              Do Primeiro Contacto ao Primeiro Talão Emitido no Próprio Dia
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              Um processo estruturado e sem burocracias para colocar a sua loja, supermercado ou escritório a faturar com certificação fiscal completa.
            </p>
          </div>

          {/* 4 Etapas Cronológicas Conectadas */}
          <div data-stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Etapa 1 */}
            <div data-reveal className="bg-white rounded-2xl p-7 border border-slate-200/90 shadow-xs hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-white bg-slate-950 px-2.5 py-1 rounded-md">
                    ETAPA 01
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 font-medium">Dia 1 • 30 Min</span>
                </div>
                <h3 className="text-base font-bold text-slate-950 font-display">
                  Diagnóstico & Apresentação
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Análise do volume de vendas, número de postos de caixa e periféricos necessários. Apresentação prática das funcionalidades sem qualquer compromisso.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 text-[11px] text-slate-500 font-mono">
                ✓ Demonstração Guiada
              </div>
            </div>

            {/* Etapa 2 */}
            <div data-reveal className="bg-white rounded-2xl p-7 border border-slate-200/90 shadow-xs hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-white bg-slate-950 px-2.5 py-1 rounded-md">
                    ETAPA 02
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 font-medium">Imediato</span>
                </div>
                <h3 className="text-base font-bold text-slate-950 font-display">
                  Proposta em Kwanzas
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Definição do modelo de licenciamento ideal (Mensal, Anual LAN ou Vitalício) com orçamento fixado em Kwanzas, sem indexação ao dólar.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 text-[11px] text-slate-500 font-mono">
                ✓ Preço Final em AOA
              </div>
            </div>

            {/* Etapa 3 */}
            <div data-reveal className="bg-white rounded-2xl p-7 border border-slate-200/90 shadow-xs hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-white bg-slate-950 px-2.5 py-1 rounded-md">
                    ETAPA 03
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 font-medium">Em 15 Minutos</span>
                </div>
                <h3 className="text-base font-bold text-slate-950 font-display">
                  Instalação Presencial ou Remota
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Instalação técnica rápida nos seus computadores e terminais POS, configuração da base de dados local SQLite e calibração de impressoras de 80mm.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 text-[11px] text-slate-500 font-mono">
                ✓ Postos Operacionais
              </div>
            </div>

            {/* Etapa 4 */}
            <div data-reveal className="bg-white rounded-2xl p-7 border border-slate-200/90 shadow-xs hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-white bg-slate-950 px-2.5 py-1 rounded-md">
                    ETAPA 04
                  </span>
                  <span className="text-[11px] font-mono text-emerald-600 font-bold">Contínuo</span>
                </div>
                <h3 className="text-base font-bold text-slate-950 font-display">
                  Formação & Suporte Técnico
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Capacitação prática dos operadores de caixa e gerentes. Apoio técnico permanente em Luanda e suporte remoto em tempo real em todas as províncias.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 text-[11px] text-slate-500 font-mono">
                ✓ Suporte Ativo 24/7
              </div>
            </div>

          </div>

          {/* Botões de Ação */}
          <div data-reveal className="mt-12 flex flex-wrap items-center justify-center gap-3.5">
            <button
              onClick={() => onOpenDemoModal('Demonstração 4 Passos')}
              className="bg-[#FF6500] hover:bg-[#EB5B00] active:scale-98 text-white font-bold text-xs sm:text-sm px-7 py-3.5 rounded-xl shadow-sm transition-all cursor-pointer"
            >
              Solicitar Demonstração Gratuita
            </button>
            <button
              onClick={() => onNavigatePage('download')}
              className="bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 font-bold text-xs sm:text-sm px-7 py-3.5 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              Baixar Versão de Teste (15 Dias)
            </button>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          7. RESULTADOS & MÉTRICAS DE MERCADO (FUNDO ESCURO EXECUTIVO)
          ══════════════════════════════════════════════════════════════════ */}
      <section className="py-24 sm:py-32 bg-[#0A1322] text-white relative overflow-hidden border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div data-reveal className="text-center max-w-2xl mx-auto mb-16 sm:mb-20 space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-orange-400 block">
              05 // Resultados & Presença no Mercado
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-display">
              A Escolha de Líderes Empresariais em Angola
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              Números auditados de empresas que confiam diariamente na soberania e robustez do KIVORA SOFT para operar sem paragens.
            </p>
          </div>

          {/* 4 Métricas de Autoridade */}
          <div data-stagger className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            
            <div data-reveal className="space-y-2 p-6 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-slate-700 transition-colors">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white font-mono-num tracking-tight">
                <CountUp end={12} suffix="+" type="odometer" duration={1.5} />
              </div>
              <p className="text-xs sm:text-sm font-bold text-orange-400 font-display">
                Anos no Mercado
              </p>
              <p className="text-[11px] text-slate-400">
                Soluções desenhadas para Angola
              </p>
            </div>

            <div data-reveal className="space-y-2 p-6 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-slate-700 transition-colors">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white font-mono-num tracking-tight">
                <CountUp end={2800} suffix="+" type="odometer" duration={1.5} />
              </div>
              <p className="text-xs sm:text-sm font-bold text-orange-400 font-display">
                Empresas Ativas
              </p>
              <p className="text-[11px] text-slate-400">
                Operando e faturando diariamente
              </p>
            </div>

            <div data-reveal className="space-y-2 p-6 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-slate-700 transition-colors">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-emerald-400 font-mono-num tracking-tight">
                100%
              </div>
              <p className="text-xs sm:text-sm font-bold text-emerald-400 font-display">
                Conformidade AGT
              </p>
              <p className="text-[11px] text-slate-400">
                Decreto Presidencial 71/25
              </p>
            </div>

            <div data-reveal className="space-y-2 p-6 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-slate-700 transition-colors">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white font-mono-num tracking-tight">
                <CountUp end={18} type="odometer" duration={1.5} />
              </div>
              <p className="text-xs sm:text-sm font-bold text-orange-400 font-display">
                Províncias Cobertas
              </p>
              <p className="text-[11px] text-slate-400">
                Assistência presencial e remota
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          8. EQUIPA DE CONSULTORES & ESPECIALISTAS (PRESENÇA REAL EM LUANDA)
          ══════════════════════════════════════════════════════════════════ */}
      <section id="equipa-consultores" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        <div data-reveal className="text-center max-w-2xl mx-auto mb-16 sm:mb-20 space-y-3">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#FF6500] block">
            06 // Consultoria & Suporte Presencial
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight font-display">
            A Nossa Equipa de Apoio Técnico e Fiscal
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            Especialistas dedicados prontos a intervir na sua loja, assegurar a conformidade fiscal com o Decreto 71/25 e formar a sua equipa.
          </p>
        </div>

        {/* Grade de 4 Consultores com Molduras Executivas */}
        <div data-stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Consultor 1 */}
          <div data-reveal className="bg-white rounded-2xl p-6 text-center border border-slate-200/90 shadow-xs hover:border-slate-300 hover:shadow-md transition-all">
            <div className="w-20 h-20 rounded-full mx-auto mb-4 p-0.5 ring-2 ring-slate-200 shadow-xs overflow-hidden bg-slate-100">
              <img
                src="/imagens/1085.webp"
                alt="Narciso da Costa"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <h3 className="font-bold text-slate-950 text-base font-display">
              Narciso da Costa
            </h3>
            <span className="inline-block px-2.5 py-0.5 rounded-md bg-orange-50 text-[#FF6500] font-mono font-semibold text-[11px] mt-1">
              Consultor de Sistemas
            </span>
            <p className="text-xs text-slate-500 mt-2.5 leading-relaxed font-normal">
              Arquiteto de software com mais de uma década de experiência em sistemas fiscais e bases de dados locais.
            </p>
          </div>

          {/* Consultor 2 */}
          <div data-reveal className="bg-white rounded-2xl p-6 text-center border border-slate-200/90 shadow-xs hover:border-slate-300 hover:shadow-md transition-all">
            <div className="w-20 h-20 rounded-full mx-auto mb-4 p-0.5 ring-2 ring-slate-200 shadow-xs overflow-hidden bg-slate-100">
              <img
                src="/imagens/2149153824.webp"
                alt="Sandra Miguel"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <h3 className="font-bold text-slate-950 text-base font-display">
              Sandra Miguel
            </h3>
            <span className="inline-block px-2.5 py-0.5 rounded-md bg-orange-50 text-[#FF6500] font-mono font-semibold text-[11px] mt-1">
              Especialista Fiscal & SAF-T
            </span>
            <p className="text-xs text-slate-500 mt-2.5 leading-relaxed font-normal">
              Supervisão de conformidade tributária com as diretrizes do Decreto 71/25 e validação de relatórios AGT.
            </p>
          </div>

          {/* Consultor 3 */}
          <div data-reveal className="bg-white rounded-2xl p-6 text-center border border-slate-200/90 shadow-xs hover:border-slate-300 hover:shadow-md transition-all">
            <div className="w-20 h-20 rounded-full mx-auto mb-4 p-0.5 ring-2 ring-slate-200 shadow-xs overflow-hidden bg-slate-100">
              <img
                src="/imagens/1163.webp"
                alt="António Manuel"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <h3 className="font-bold text-slate-950 text-base font-display">
              António Manuel
            </h3>
            <span className="inline-block px-2.5 py-0.5 rounded-md bg-orange-50 text-[#FF6500] font-mono font-semibold text-[11px] mt-1">
              Redes & Hardware POS
            </span>
            <p className="text-xs text-slate-500 mt-2.5 leading-relaxed font-normal">
              Instalação presencial de servidores locais, sincronização multi-postos LAN e configuração de periféricos POS.
            </p>
          </div>

          {/* Consultor 4 */}
          <div data-reveal className="bg-white rounded-2xl p-6 text-center border border-slate-200/90 shadow-xs hover:border-slate-300 hover:shadow-md transition-all">
            <div className="w-20 h-20 rounded-full mx-auto mb-4 p-0.5 ring-2 ring-slate-200 shadow-xs overflow-hidden bg-slate-100">
              <img
                src="/imagens/2150690165.webp"
                alt="Helena Gaspar"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <h3 className="font-bold text-slate-950 text-base font-display">
              Helena Gaspar
            </h3>
            <span className="inline-block px-2.5 py-0.5 rounded-md bg-orange-50 text-[#FF6500] font-mono font-semibold text-[11px] mt-1">
              Suporte & Formação de Caixa
            </span>
            <p className="text-xs text-slate-500 mt-2.5 leading-relaxed font-normal">
              Apoio diário aos operadores de caixa, esclarecimento de dúvidas operacionais e assistência remota dedicada.
            </p>
          </div>

        </div>

      </section>

      {/* ══════════════════════════════════════════════════════════════════
          8. CARROSSEL DE TESTEMUNHOS DE GESTORES (AUTOPLAY & SWIPE)
          ══════════════════════════════════════════════════════════════════ */}
      <section id="testemunhos" data-reveal className="py-24 sm:py-32 bg-slate-50/70 border-y border-slate-200/70 px-4 sm:px-6 lg:px-8">
        <TestimonialsCarousel />
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          9. TABELA DE PREÇOS & PLANOS (TRANSPARÊNCIA TOTAL EM KWANZAS)
          ══════════════════════════════════════════════════════════════════ */}
      <section id="precos-planos" className="py-24 sm:py-32 bg-white px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        <div data-reveal className="text-center max-w-2xl mx-auto mb-16 sm:mb-20 space-y-3">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#FF6500] block">
            07 // Investimento & Licenciamento
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight font-display">
            Preços Claros e Fixados em Kwanzas (AOA)
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            Sem custos escondidos, sem indexação cambial a moedas estrangeiras. Escolha o formato de licenciamento que melhor atende à escala da sua empresa.
          </p>
        </div>

        <div data-stagger className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
          
          {/* Card 1: Mensal */}
          <div data-reveal className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between group">
            {/* Top Header Sóbril */}
            <div className="bg-slate-50 border-b border-slate-200/80 p-6 text-center">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider block text-slate-500">
                {settings.planMensalCategory || 'Arranque Flexível'}
              </span>
              <div className="mt-2 text-3xl font-extrabold font-mono-num text-slate-950">
                {settings.planMensalPrice || '25.000'} <span className="text-sm font-normal text-slate-500">Kz / mês</span>
              </div>
            </div>

            <div className="p-7 flex flex-col justify-between flex-grow">
              <div>
                <h3 className="text-base font-bold text-slate-950 mb-2 text-center font-display">
                  {settings.planMensalName || 'Plano Mensal'}
                </h3>
                <p className="text-xs text-slate-500 text-center mb-6 leading-relaxed">
                  Ideal para pequenas lojas, prestadores de serviços e empresas em fase de arranque.
                </p>

                <ul className="space-y-3 text-xs text-slate-700 mb-8">
                  {parseFeatures(settings.planMensalFeatures, [
                    '1 Posto de Trabalho Ativo',
                    'Faturação Certificada AGT com QR Code',
                    'Exportação SAF-T (AO) Mensal',
                    'Suporte Técnico em Horário Comercial'
                  ]).map((feat, i) => (
                    <li key={i} className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-md bg-orange-50 text-[#FF6500] flex items-center justify-center shrink-0 border border-orange-100">
                        <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                      </div>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => onOpenDemoModal(settings.planMensalName || 'Plano Mensal')}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-98 text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
              >
                Aderir ao Plano Mensal
              </button>
            </div>
          </div>

          {/* Card 2: Anual LAN (Destaque Institucional em Marinho Executivo) */}
          <div data-reveal className="bg-white rounded-2xl border-2 border-slate-950 overflow-hidden shadow-xl lg:-translate-y-2 flex flex-col justify-between relative group z-10">
            {/* Top Header Escuro */}
            <div className="bg-[#0A1322] p-7 text-white text-center relative">
              <div className="inline-flex items-center gap-1.5 bg-[#FF6500] text-white text-[10px] font-mono font-bold uppercase px-3 py-1 rounded-md mb-2 tracking-wide">
                <span>{settings.planAnualBadge || 'Mais Escolhido em Angola'}</span>
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold font-mono-num text-white">
                {settings.planAnualPrice || '250.000'} <span className="text-sm font-normal text-slate-300">Kz / ano</span>
              </div>
              <span className="text-[11px] text-emerald-400 font-mono font-bold block mt-1">
                Poupança de 50.000 Kz (2 Meses Grátis)
              </span>
            </div>

            <div className="p-7 flex flex-col justify-between flex-grow">
              <div>
                <h3 className="text-base font-bold text-slate-950 mb-2 text-center font-display">
                  {settings.planAnualName || 'Plano Anual LAN'}
                </h3>
                <p className="text-xs text-slate-500 text-center mb-6 leading-relaxed">
                  Para supermercados, restaurantes, comércio geral e empresas com múltiplos caixas em rede local.
                </p>

                <ul className="space-y-3.5 text-xs text-slate-800 mb-8">
                  {parseFeatures(settings.planAnualFeatures, [
                    'Até 3 Postos em Rede LAN Incluídos',
                    'Módulos de Stock, POS e RH Integrados',
                    'Atualizações Fiscais AGT Garantidas',
                    'Suporte Prioritário por WhatsApp e Remoto'
                  ]).map((feat, i) => (
                    <li key={i} className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-md bg-[#0A1322] text-white flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 text-orange-400" strokeWidth={2.5} />
                      </div>
                      <span className={i === 0 ? 'font-bold text-slate-950' : ''}>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => onOpenDemoModal(settings.planAnualName || 'Plano Anual LAN')}
                className="w-full py-3.5 rounded-xl bg-[#FF6500] hover:bg-[#EB5B00] active:scale-98 text-white font-bold text-xs transition-all shadow-md cursor-pointer font-sans"
              >
                Contratar Plano Anual
              </button>
            </div>
          </div>

          {/* Card 3: Licença Vitalícia */}
          <div data-reveal className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between group">
            {/* Top Header Sóbrio */}
            <div className="bg-slate-50 border-b border-slate-200/80 p-6 text-center">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider block text-slate-500">
                {settings.planVitalicioCategory || 'Pagamento Único'}
              </span>
              <div className="mt-2 text-3xl font-extrabold font-mono-num text-slate-950">
                {settings.planVitalicioPrice || '650.000'} <span className="text-sm font-normal text-slate-500">Kz / definitivo</span>
              </div>
            </div>

            <div className="p-7 flex flex-col justify-between flex-grow">
              <div>
                <h3 className="text-base font-bold text-slate-950 mb-2 text-center font-display">
                  {settings.planVitalicioName || 'Licença Vitalícia'}
                </h3>
                <p className="text-xs text-slate-500 text-center mb-6 leading-relaxed">
                  Para empresas que preferem adquirir o software de forma definitiva sem anuidades ou mensalidades.
                </p>

                <ul className="space-y-3 text-xs text-slate-700 mb-8">
                  {parseFeatures(settings.planVitalicioFeatures, [
                    'Uso Perpétuo Sem Mensalidades',
                    'Servidor Principal + 5 Terminais LAN',
                    'Formação Presencial da Equipa em Luanda',
                    'Certificado de Licenciamento Definitivo'
                  ]).map((feat, i) => (
                    <li key={i} className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-md bg-orange-50 text-[#FF6500] flex items-center justify-center shrink-0 border border-orange-100">
                        <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                      </div>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => onOpenDemoModal(settings.planVitalicioName || 'Licença Vitalícia')}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-98 text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
              >
                Solicitar Proposta Vitalícia
              </button>
            </div>
          </div>

        </div>

      </section>

      {/* ══════════════════════════════════════════════════════════════════
          10. HARDWARE & EQUIPAMENTOS POS COMPATÍVEIS
          ══════════════════════════════════════════════════════════════════ */}
      <section className="py-24 sm:py-32 bg-slate-50/70 border-t border-slate-200/80 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div data-reveal className="text-center max-w-2xl mx-auto mb-16 sm:mb-20 space-y-3">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#FF6500] block">
            08 // Hardware Comercial & POS
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight font-display">
            Periféricos POS Recomendados para o Balcão
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            Fornecemos e configuramos periféricos comerciais testados para suportar o ritmo diário e intenso de caixas de retalho, armazéns e restauração.
          </p>
        </div>

        <div data-stagger className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          
          {/* Terminal POS Touch */}
          <div data-reveal className="bg-white rounded-2xl p-7 border border-slate-200/90 shadow-xs flex flex-col justify-between group hover:border-slate-300 hover:shadow-md transition-all">
            <div>
              <div className="h-52 mb-6 flex items-center justify-center bg-slate-50/90 rounded-xl p-4 border border-slate-100 select-none">
                <img
                  src={posImg}
                  alt="Terminal Touch POS Kivora"
                  className="max-h-full max-w-full object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-103"
                />
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono font-bold text-[#FF6500] uppercase tracking-wider">
                  Ecrã Tátil 15.6" Capacitivo
                </span>
                <span className="text-xs font-bold text-slate-900 font-mono-num">
                  Desde 750.000 Kz
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-950 mb-2 group-hover:text-[#FF6500] transition-colors font-display">
                Terminal POS Touch All-in-One
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal mb-4">
                Ecrã industrial de alta sensibilidade ao toque, processador rápido e chassis reforçado para balcões de alta rotatividade.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-800">
              <span className="text-slate-500 font-medium">12 Meses de Garantia</span>
              <button
                onClick={() => onNavigatePage('loja')}
                className="text-[#FF6500] hover:text-[#EB5B00] flex items-center gap-1.5 group-hover:translate-x-0.5 transition-all cursor-pointer font-bold"
              >
                <span>Ver na Loja</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Computador Desktop LAN */}
          <div data-reveal className="bg-white rounded-2xl p-7 border border-slate-200/90 shadow-xs flex flex-col justify-between group hover:border-slate-300 hover:shadow-md transition-all">
            <div>
              <div className="h-52 mb-6 flex items-center justify-center bg-slate-50/90 rounded-xl p-4 border border-slate-100 select-none">
                <img
                  src={desktopImg}
                  alt="Computador Desktop Kivora"
                  className="max-h-full max-w-full object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-103"
                />
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono font-bold text-[#FF6500] uppercase tracking-wider">
                  Backoffice & Servidor LAN
                </span>
                <span className="text-xs font-bold text-slate-900 font-mono-num">
                  Pronto a Operar
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-950 mb-2 group-hover:text-[#FF6500] transition-colors font-display">
                Desktop Core i5 / SSD 256GB
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal mb-4">
                Configurado para operar como posto de retaguarda, servidor central de base de dados para múltiplos caixas e emissão de ficheiros SAF-T.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-800">
              <span className="text-slate-500 font-medium">Windows 11 Pro</span>
              <button
                onClick={() => onNavigatePage('loja')}
                className="text-[#FF6500] hover:text-[#EB5B00] flex items-center gap-1.5 group-hover:translate-x-0.5 transition-all cursor-pointer font-bold"
              >
                <span>Ver na Loja</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Portátil Laptop */}
          <div data-reveal className="bg-white rounded-2xl p-7 border border-slate-200/90 shadow-xs flex flex-col justify-between group hover:border-slate-300 hover:shadow-md transition-all">
            <div>
              <div className="h-52 mb-6 flex items-center justify-center bg-slate-50/90 rounded-xl p-4 border border-slate-100 select-none">
                <img
                  src={laptopImg}
                  alt="Portátil Laptop Kivora"
                  className="max-h-full max-w-full object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-103"
                />
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono font-bold text-[#FF6500] uppercase tracking-wider">
                  Vendas & Gerência Móvel
                </span>
                <span className="text-xs font-bold text-slate-900 font-mono-num">
                  Bateria Longa Duração
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-950 mb-2 group-hover:text-[#FF6500] transition-colors font-display">
                Laptop Comercial Executivo
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal mb-4">
                Excelente mobilidade para gestores e equipas comerciais externas. Permite faturar, registar notas de encomenda e consultar inventário em qualquer local.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-800">
              <span className="text-slate-500 font-medium">Elevada Autonomia</span>
              <button
                onClick={() => onNavigatePage('loja')}
                className="text-[#FF6500] hover:text-[#EB5B00] flex items-center gap-1.5 group-hover:translate-x-0.5 transition-all cursor-pointer font-bold"
              >
                <span>Ver na Loja</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          11. BANNER FINAL EXECUTIVO (SOFISTICADO, INSTITUCIONAL & DE ALTA CONVERSÃO)
          ══════════════════════════════════════════════════════════════════ */}
      <section data-reveal className="py-24 sm:py-32 bg-[#0A1322] text-white relative overflow-hidden border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-7 relative z-10">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-orange-400 block">
            09 // Ativação Imediata
          </span>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.12] font-display">
            Modernize a faturação da sua empresa com soberania offline e certificação AGT
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-normal">
            Descarregue o instalador do KIVORA SOFT para computadores Windows 10/11 e experimente todas as funcionalidades com a nossa licença de avaliação de 15 dias sem compromisso.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
            <button
              onClick={() => onNavigatePage('download')}
              className="bg-[#FF6500] hover:bg-[#EB5B00] active:scale-98 text-white font-bold text-xs sm:text-sm px-8 py-3.5 rounded-xl shadow-lg flex items-center gap-2.5 cursor-pointer transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Baixar KIVORA SOFT Setup</span>
            </button>
            <button
              onClick={() => onOpenDemoModal('Demonstração VIP')}
              className="bg-white/10 hover:bg-white/20 active:scale-98 text-white font-bold text-xs sm:text-sm px-8 py-3.5 rounded-xl border border-white/20 transition-all flex items-center gap-2 cursor-pointer backdrop-blur-md"
            >
              <span>Solicitar Demonstração VIP</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Certificado AGT FE/387/AGT/2026</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-orange-400" />
              <span>15 Dias de Avaliação Gratuita</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-orange-400" />
              <span>Sem Fidelização nem Cartão de Crédito</span>
            </span>
          </div>
        </div>
      </section>

    </div>
  );
};

