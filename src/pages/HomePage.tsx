import React, { useState, useEffect, useMemo } from 'react';
import { HeroCarousel } from '../components/HeroCarousel';
import { TestimonialsCarousel } from '../components/TestimonialsCarousel';
import { CountUp } from '../components/CountUp';
import {
  ArrowRight, Download, Wifi,
  Check, ShieldCheck,
  Phone,
  FileCheck, ShoppingCart, Boxes, Users,
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
      <section id="solucoes-rapidas" className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 sm:-mt-14 mb-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5" data-stagger>
          
          {/* Card 1: Slate Escuro (#0B1528) */}
          <div data-reveal className="bg-[#0B1528] rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-800 text-white flex items-center justify-between gap-5 group hover:border-orange-500/40 transition-all">
            <div className="flex items-center gap-4">
              <span className="text-4xl sm:text-5xl font-black text-[#FF6500] font-display tracking-tight shrink-0">
                12+
              </span>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-orange-400 block font-display">
                  Tradição & Solidez
                </span>
                <h3 className="text-base sm:text-lg font-black text-white font-display leading-tight">
                  Anos em Angola
                </h3>
                <span className="text-xs text-slate-300 font-medium block mt-0.5">
                  +2.800 empresas ativas
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 text-orange-400 flex items-center justify-center shrink-0 shadow-sm group-hover:bg-[#FF6500] group-hover:text-white transition-all">
              <Award className="w-5 h-5" />
            </div>
          </div>

          {/* Card 2: Laranja Vibrante (#FF6500) */}
          <div
            data-reveal
            onClick={() => onOpenDemoModal('Diagnóstico Fiscal Gratuito')}
            className="bg-gradient-to-r from-[#FF6500] to-[#EB5B00] rounded-3xl p-6 sm:p-7 shadow-xl shadow-orange-500/25 text-white flex items-center justify-between gap-4 cursor-pointer hover:shadow-orange-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all group"
          >
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full inline-block mb-1 font-display">
                Apoio Gratuito
              </span>
              <h3 className="text-base sm:text-lg font-black text-white font-display leading-tight">
                Precisa de Apoio Fiscal?
              </h3>
              <span className="text-xs text-white/90 font-medium block mt-0.5">
                Diagnóstico & Demonstração VIP
              </span>
            </div>
            <div className="w-11 h-11 rounded-full bg-white text-[#FF6500] flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition-transform">
              <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
            </div>
          </div>

          {/* Card 3: Branco Executivo */}
          <div data-reveal className="bg-white rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-200/90 text-slate-900 flex items-center justify-between gap-4 group hover:border-orange-300 transition-all">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-display">
                Atendimento Imediato
              </span>
              <a
                href={settings.whatsappUrl || 'https://wa.me/244974855494'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg sm:text-xl font-black font-mono text-slate-950 hover:text-[#FF6500] block tracking-tight transition-colors"
              >
                {settings.phoneDisplay || '+244 974 855 494'}
              </a>
              <span className="text-xs text-slate-500 font-medium block mt-0.5">
                Linha Direta Luanda • Seg - Sáb
              </span>
            </div>
            <div className="w-11 h-11 rounded-full bg-[#0B1528] text-amber-400 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 group-hover:bg-[#FF6500] group-hover:text-white transition-all">
              <Phone className="w-5 h-5" />
            </div>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          3. LOGOTIPOS DE PARCEIROS & CLIENTES (MARQUEE INFINITO)
          ══════════════════════════════════════════════════════════════════ */}
      <section data-reveal className="py-7 bg-slate-50/70 border-y border-slate-200/60 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 font-display flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FF6500] shrink-0" />
            <span className="truncate">Empresas e Parceiros Integrados ao Ecossistema KIVORA</span>
          </span>
          <button
            onClick={() => onNavigatePage('parceiros')}
            className="text-xs font-semibold text-[#FF6500] hover:text-[#EB5B00] flex items-center gap-1 cursor-pointer transition-colors shrink-0 self-start sm:self-auto"
          >
            <span>Ver Rede de Parceiros</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="relative w-full overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none" />

          <div className="animate-marquee flex items-center gap-6 py-2">
            {[...effectivePartnerLogos, ...effectivePartnerLogos].map((partner, idx) => (
              <div
                key={`${partner.id}-${idx}`}
                className="flex items-center gap-3 px-4 py-2.5 bg-white rounded-2xl border border-slate-200/80 shadow-xs shrink-0 select-none hover:border-orange-300 transition-colors"
              >
                {partner.logoUrl ? (
                  <img
                    src={partner.logoUrl}
                    alt={partner.name}
                    className="h-7 w-auto object-contain rounded"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-orange-50 text-[#FF6500] flex items-center justify-center font-bold text-xs">
                    {partner.name.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <span className="text-xs font-bold text-slate-800">
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
      <section id="sobre-kivora" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Coluna Esquerda: Imagem com Badge Flutuante */}
          <div data-reveal data-reveal-dir="left" className="lg:col-span-6 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
              <img
                src={settings.aboutImageUrl || executivosImg}
                alt="Equipa e Consultores Kivora Soft"
                className="w-full h-[380px] sm:h-[460px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
            </div>

            {/* Badge Flutuante no Canto Inferior Direito (Padrão Imagem 4) */}
            <div className="absolute -bottom-6 right-2 sm:-bottom-8 sm:right-6 bg-[#0B1528] text-white p-4 sm:p-6 rounded-3xl border border-slate-800 shadow-2xl max-w-[240px] sm:max-w-[280px]">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FF6500] to-[#FFA726] text-white flex items-center justify-center font-black text-sm shadow-md">
                  100%
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Certificação AGT</span>
                  <span className="text-[10px] text-orange-400 font-mono">FE/387/AGT/2026</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Decreto Presidencial n.º 71/25 & Código do IVA plenamente integrados.
              </p>
            </div>
          </div>

          {/* Coluna Direita: Informações & 2 Cards com Ícones Circulares */}
          <div data-reveal data-reveal-dir="right" className="lg:col-span-6 space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-[#FF6500] font-display">
                <span className="w-4 h-0.5 bg-[#FF6500] rounded-full inline-block" />
                <span>Sobre a Kivora Soft</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight font-display leading-[1.12]">
                A Escolha de Confiança em Gestão Empresarial para Angola
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                Desenvolvemos soluções de faturação e contabilidade que funcionam perfeitamente na realidade angolana: sem quedas por falta de internet, com suporte presencial em Luanda e total segurança fiscal perante a AGT.
              </p>
            </div>

            {/* 2 Cards de Destaque com Ícones Circulares Laranja (Padrão Imagens 1 e 4) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2" data-stagger>
              <div data-reveal className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-2 hover:border-orange-300 transition-colors">
                <div className="w-11 h-11 rounded-full bg-orange-50 border border-orange-200/60 text-[#FF6500] flex items-center justify-center font-bold shadow-xs">
                  <Wifi className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-950 font-display">
                  Estratégia & Faturação Offline
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Base de dados local SQLite. A sua loja continua a faturar e atender clientes sem qualquer interrupção.
                </p>
              </div>

              <div data-reveal className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-2 hover:border-orange-300 transition-colors">
                <div className="w-11 h-11 rounded-full bg-orange-50 border border-orange-200/60 text-[#FF6500] flex items-center justify-center font-bold shadow-xs">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-950 font-display">
                  Conformidade & Metas AGT
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Assinatura digital RSA-SHA256 em cada documento fiscal e exportação mensal de ficheiro SAF-T (AO) 100% limpo.
                </p>
              </div>
            </div>

            {/* Checklist de 4 Pontos */}
            <div className="space-y-2.5 pt-2 text-xs text-slate-700">
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

            {/* Botões de Ação Redondos */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3.5 pt-3">
              <button
                onClick={() => onNavigatePage('sobre')}
                className="w-full sm:w-auto justify-center bg-[#0B1528] hover:bg-slate-800 text-white font-bold text-xs sm:text-sm px-7 py-3.5 rounded-full transition-all cursor-pointer shadow-sm hover:shadow-md active:scale-98 flex items-center gap-2"
              >
                <span>Conhecer a Nossa História</span>
                <ArrowRight className="w-4 h-4 text-orange-400" />
              </button>
              <button
                onClick={() => onOpenDemoModal('Demonstração Sobre Kivora')}
                className="w-full sm:w-auto text-center bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-xs sm:text-sm px-7 py-3.5 rounded-full transition-all cursor-pointer shadow-xs active:scale-98"
              >
                Solicitar Apresentação
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          5. O QUE FAZEMOS? (WHAT WE DO? — EXATAMENTE COMO NAS IMAGENS 1 E 4)
          6 Cards com Ícones Circulares Gradiente Âmbar/Laranja + Barra CTA
          ══════════════════════════════════════════════════════════════════ */}
      <section id="o-que-fazemos" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        {/* Marcador Superior Laranja & Título Padrão XTRA */}
        <div data-reveal className="text-center max-w-2xl mx-auto mb-16 sm:mb-20 space-y-3.5">
          <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-[#FF6500] font-display">
            <span className="w-4 h-0.5 bg-[#FF6500] rounded-full inline-block" />
            <span>O Que Fazemos?</span>
            <span className="w-4 h-0.5 bg-[#FF6500] rounded-full inline-block" />
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight font-display">
            Soluções Integradas de Faturação & Gestão
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            Fornecemos tecnologia de ponta desenvolvida especificamente para a realidade de Angola, unindo conformidade fiscal absoluta com facilidade de operação.
          </p>
        </div>

        {/* Grade 3x2 com os 6 Cartões com Ícones Circulares Gradiente Laranja */}
        <div data-stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Card 1: Faturação Eletrónica AGT */}
          <div
            data-reveal
            onClick={() => onNavigatePage('faturacao')}
            className="bg-white rounded-3xl p-8 border border-slate-150 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 text-center flex flex-col justify-between group cursor-pointer"
          >
            <div>
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-[#FF6500] text-white flex items-center justify-center mx-auto mb-5 shadow-lg shadow-orange-500/25 group-hover:scale-105 transition-transform">
                <FileCheck className="w-8 h-8" strokeWidth={2} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2 font-display group-hover:text-[#FF6500] transition-colors">
                Faturação Eletrónica AGT
              </h3>
              <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed font-normal mb-4">
                Emissão certificada de Faturas (FT), Faturas-Recibo (FR), Notas de Crédito (NC) e Débito (ND) com chave RS256, QR Code fiscal e ficheiro SAF-T AO.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 flex items-center justify-center text-xs font-bold text-[#FF6500] gap-1 group-hover:gap-2 transition-all">
              <span>Saber mais</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 2: Ponto de Venda & POS Rápido */}
          <div
            data-reveal
            onClick={() => onNavigatePage('pos')}
            className="bg-white rounded-3xl p-8 border border-slate-150 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 text-center flex flex-col justify-between group cursor-pointer"
          >
            <div>
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-[#FF6500] text-white flex items-center justify-center mx-auto mb-5 shadow-lg shadow-orange-500/25 group-hover:scale-105 transition-transform">
                <ShoppingCart className="w-8 h-8" strokeWidth={2} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2 font-display group-hover:text-[#FF6500] transition-colors">
                Ponto de Venda (POS Rápido)
              </h3>
              <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed font-normal mb-4">
                Atendimento de balcão veloz em menos de 3 segundos, impressão em talões de 80mm/58mm, fecho de caixa cego, sangrias e gavetas RJ11.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 flex items-center justify-center text-xs font-bold text-[#FF6500] gap-1 group-hover:gap-2 transition-all">
              <span>Saber mais</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 3: Gestão de Stock Multi-Armazém */}
          <div
            data-reveal
            onClick={() => onNavigatePage('stock')}
            className="bg-white rounded-3xl p-8 border border-slate-150 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 text-center flex flex-col justify-between group cursor-pointer"
          >
            <div>
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-[#FF6500] text-white flex items-center justify-center mx-auto mb-5 shadow-lg shadow-orange-500/25 group-hover:scale-105 transition-transform">
                <Boxes className="w-8 h-8" strokeWidth={2} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2 font-display group-hover:text-[#FF6500] transition-colors">
                Gestão de Stock & Armazéns
              </h3>
              <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed font-normal mb-4">
                Controlo em tempo real de entradas, saídas, quebras e inventário. Rastreio rigoroso de lotes com validade e transferências entre filiais.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 flex items-center justify-center text-xs font-bold text-[#FF6500] gap-1 group-hover:gap-2 transition-all">
              <span>Saber mais</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 4: Recursos Humanos & IRT 2026 */}
          <div
            data-reveal
            onClick={() => onNavigatePage('rh')}
            className="bg-white rounded-3xl p-8 border border-slate-150 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 text-center flex flex-col justify-between group cursor-pointer"
          >
            <div>
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-[#FF6500] text-white flex items-center justify-center mx-auto mb-5 shadow-lg shadow-orange-500/25 group-hover:scale-105 transition-transform">
                <Users className="w-8 h-8" strokeWidth={2} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2 font-display group-hover:text-[#FF6500] transition-colors">
                Recursos Humanos & IRT 2026
              </h3>
              <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed font-normal mb-4">
                Processamento automático de salários segundo a LGT, tabelas escalonadas de IRT 2026, desconto INSS de 3%/8% e emissão de recibos em PDF.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 flex items-center justify-center text-xs font-bold text-[#FF6500] gap-1 group-hover:gap-2 transition-all">
              <span>Saber mais</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 5: Contabilidade & SAF-T AO */}
          <div
            data-reveal
            onClick={() => onNavigatePage('contabilidade')}
            className="bg-white rounded-3xl p-8 border border-slate-150 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 text-center flex flex-col justify-between group cursor-pointer"
          >
            <div>
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-[#FF6500] text-white flex items-center justify-center mx-auto mb-5 shadow-lg shadow-orange-500/25 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-8 h-8" strokeWidth={2} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2 font-display group-hover:text-[#FF6500] transition-colors">
                Contabilidade & SAF-T AO
              </h3>
              <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed font-normal mb-4">
                Plano Geral de Contas (PGC), balanços, balancetes de verificação, mapa de impostos e exportação mensal do ficheiro SAF-T para validação AGT.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 flex items-center justify-center text-xs font-bold text-[#FF6500] gap-1 group-hover:gap-2 transition-all">
              <span>Saber mais</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 6: Hardware & Terminais de Balcão */}
          <div
            data-reveal
            onClick={() => onNavigatePage('hardware')}
            className="bg-white rounded-3xl p-8 border border-slate-150 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 text-center flex flex-col justify-between group cursor-pointer"
          >
            <div>
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-[#FF6500] text-white flex items-center justify-center mx-auto mb-5 shadow-lg shadow-orange-500/25 group-hover:scale-105 transition-transform">
                <HardDrive className="w-8 h-8" strokeWidth={2} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2 font-display group-hover:text-[#FF6500] transition-colors">
                Hardware & Terminais POS
              </h3>
              <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed font-normal mb-4">
                Terminais touch all-in-one industriais, impressoras térmicas ESC/POS, leitores 2D de código de barras e configuração de rede local em Luanda.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 flex items-center justify-center text-xs font-bold text-[#FF6500] gap-1 group-hover:gap-2 transition-all">
              <span>Saber mais</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

        </div>

        {/* ── BARRA DE CHAMADA LARANJA (CALLOUT BAR — EXATAMENTE COMO NA IMAGEM 1 E 4) ── */}
        <div data-reveal className="mt-12 bg-gradient-to-r from-[#FF6500] via-[#FF7A1A] to-[#FF8C38] rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-orange-500/25">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0 border border-white/25">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg sm:text-xl font-bold font-display text-white tracking-tight">
                Vamos falar sobre os seus planos e acelerar a sua faturação?
              </h4>
              <p className="text-xs sm:text-sm text-white/90 font-normal">
                Fale diretamente com os nossos consultores especializados em Luanda para um diagnóstico gratuito.
              </p>
            </div>
          </div>

          <a
            href={settings.whatsappUrl || 'https://wa.me/244974855494'}
            target="_blank"
            rel="noopener noreferrer"
            className="whitespace-nowrap bg-slate-950 hover:bg-slate-900 active:scale-95 text-white font-black text-xs sm:text-sm px-7 py-3.5 rounded-full flex items-center gap-2.5 shadow-lg transition-all font-mono tracking-wide shrink-0"
          >
            <span>Falar Agora: {settings.phoneDisplay || '+244 974 855 494'}</span>
            <ArrowRight className="w-4 h-4 text-orange-400" />
          </a>
        </div>

      </section>

      {/* ══════════════════════════════════════════════════════════════════
          BANNER DE IMPACTO FOTOGRÁFICO (PADRÃO IMAGEM 4)
          "Mais do que Faturação: É a Segurança e Continuidade do Seu Negócio"
          ══════════════════════════════════════════════════════════════════ */}
      <section data-reveal className="relative py-24 sm:py-28 px-4 sm:px-6 lg:px-8 text-white overflow-hidden bg-[#0B1528]">
        {/* Imagem de Fundo com Overlay Escuro Gradiente */}
        <div className="absolute inset-0 z-0">
          <img
            src={settings.stepsImageUrl || settings.heroImageUrl || supermercadoImg}
            alt="Operação Comercial KIVORA"
            className="w-full h-full object-cover opacity-20 filter saturate-50"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B1528] via-[#0B1528]/95 to-[#0B1528]/85" />
        </div>

        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-wider font-display">
            <span>Soberania e Estabilidade</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.12] font-display">
            Mais do que Faturação: É a Segurança e Continuidade do Seu Negócio em Angola
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-normal">
            Elimine as paragens de caixa causadas por quebras de internet. Mantenha os seus clientes satisfeitos, as filas a andar e o seu fecho de caixa 100% rigoroso.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
            <button
              onClick={() => onOpenDemoModal('Demonstração Impacto')}
              className="bg-[#FF6500] hover:bg-[#EB5B00] active:scale-95 text-white font-bold text-xs sm:text-sm px-8 py-4 rounded-full shadow-lg shadow-orange-500/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Falar com um Especialista Agora</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigatePage('faturacao')}
              className="bg-white/10 hover:bg-white/20 active:scale-95 text-white border border-white/25 font-bold text-xs sm:text-sm px-8 py-4 rounded-full transition-all cursor-pointer backdrop-blur-md"
            >
              Ver Módulo de Faturação
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          6. COMO TRABALHAMOS? (HOW WE WORK? — 4 PASSOS COMO NAS IMAGENS 1 E 4)
          ══════════════════════════════════════════════════════════════════ */}
      <section id="como-trabalhamos" className="py-24 sm:py-32 bg-slate-50/80 border-y border-slate-200/70 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          <div data-reveal className="text-center max-w-2xl mx-auto mb-16 sm:mb-20 space-y-3.5">
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-[#FF6500] font-display">
              <span className="w-4 h-0.5 bg-[#FF6500] rounded-full inline-block" />
              <span>Como Trabalhamos?</span>
              <span className="w-4 h-0.5 bg-[#FF6500] rounded-full inline-block" />
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight font-display">
              Em Apenas 4 Passos Simples Ative o KIVORA
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              Um processo estruturado e sem burocracias para colocar a sua loja, supermercado ou escritório a faturar no próprio dia.
            </p>
          </div>

          {/* 4 Colunas Numeradas (1, 2, 3, 4 em Laranja Padrão das Imagens) */}
          <div data-stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Passo 1 */}
            <div data-reveal className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs hover:shadow-lg transition-all space-y-3">
              <span className="text-4xl sm:text-5xl font-black text-[#FF6500] font-display block leading-none">
                1.
              </span>
              <h3 className="text-lg font-bold text-slate-950 font-display">
                Demonstração
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Apresentação prática e sem compromisso das ferramentas do KIVORA SOFT, alinhada com as necessidades específicas do seu negócio.
              </p>
            </div>

            {/* Passo 2 */}
            <div data-reveal className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs hover:shadow-lg transition-all space-y-3">
              <span className="text-4xl sm:text-5xl font-black text-[#FF6500] font-display block leading-none">
                2.
              </span>
              <h3 className="text-lg font-bold text-slate-950 font-display">
                Proposta & Plano
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Escolha do plano ideal (Mensal, Anual LAN ou Vitalício) com preços transparentes em Kwanzas, sem surpresas cambiais com o dólar.
              </p>
            </div>

            {/* Passo 3 */}
            <div data-reveal className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs hover:shadow-lg transition-all space-y-3">
              <span className="text-4xl sm:text-5xl font-black text-[#FF6500] font-display block leading-none">
                3.
              </span>
              <h3 className="text-lg font-bold text-slate-950 font-display">
                Instalação em Rede
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Instalação rápida em menos de 15 minutos nos seus computadores ou terminais POS, com base de dados local segura e rede LAN.
              </p>
            </div>

            {/* Passo 4 */}
            <div data-reveal className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs hover:shadow-lg transition-all space-y-3">
              <span className="text-4xl sm:text-5xl font-black text-[#FF6500] font-display block leading-none">
                4.
              </span>
              <h3 className="text-lg font-bold text-slate-950 font-display">
                Formação & Suporte
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Capacitação imediata dos operadores de caixa e suporte técnico contínuo presencial em Luanda e remoto nas 18 províncias.
              </p>
            </div>

          </div>

          {/* Botões de Ação Redondos (Padrão das Imagens) */}
          <div data-reveal className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onOpenDemoModal('Demonstração 4 Passos')}
              className="bg-[#FF6500] hover:bg-[#EB5B00] active:scale-95 text-white font-bold text-xs sm:text-sm px-8 py-4 rounded-full shadow-lg shadow-orange-500/25 transition-all cursor-pointer"
            >
              Solicitar Demonstração Gratuita
            </button>
            <button
              onClick={() => onNavigatePage('download')}
              className="bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 font-bold text-xs sm:text-sm px-8 py-4 rounded-full shadow-xs transition-all cursor-pointer"
            >
              Baixar Versão de Teste (15 Dias)
            </button>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          6. RESULTADOS & MÉTRICAS (WHAT WE DONE? — FUNDO ESCURO DAS IMAGENS 2 E 4)
          ══════════════════════════════════════════════════════════════════ */}
      <section className="py-24 sm:py-32 bg-[#0B1528] text-white relative overflow-hidden border-y border-slate-800">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div data-reveal className="text-center max-w-2xl mx-auto mb-16 sm:mb-20 space-y-3.5">
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-[#FF6500] font-display">
              <span className="w-4 h-0.5 bg-[#FF6500] rounded-full inline-block" />
              <span>Resultados Comprovados</span>
              <span className="w-4 h-0.5 bg-[#FF6500] rounded-full inline-block" />
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-display">
              A Escolha de Líderes em Angola
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              Números reais de quem confia na robustez do KIVORA SOFT para faturar com tranquilidade e sem interrupções.
            </p>
          </div>

          {/* 4 Grandes Métricas no Estilo das Imagens 2 e 4 */}
          <div data-stagger className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            
            <div data-reveal className="space-y-2 p-6 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-orange-500/50 transition-colors">
              <div className="text-4xl sm:text-5xl lg:text-6xl font-black text-white font-mono-num tracking-tight">
                <CountUp end={12} suffix="+" type="odometer" duration={1.5} />
              </div>
              <p className="text-xs sm:text-sm font-bold text-orange-400 font-display">
                Anos de Experiência
              </p>
              <p className="text-[11px] text-slate-400">
                Pioneirismo em software angolano
              </p>
            </div>

            <div data-reveal className="space-y-2 p-6 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-orange-500/50 transition-colors">
              <div className="text-4xl sm:text-5xl lg:text-6xl font-black text-white font-mono-num tracking-tight">
                <CountUp end={2800} suffix="+" type="odometer" duration={1.5} />
              </div>
              <p className="text-xs sm:text-sm font-bold text-orange-400 font-display">
                Empresas Ativas
              </p>
              <p className="text-[11px] text-slate-400">
                Faturando diariamente
              </p>
            </div>

            <div data-reveal className="space-y-2 p-6 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-orange-500/50 transition-colors">
              <div className="text-4xl sm:text-5xl lg:text-6xl font-black text-white font-mono-num tracking-tight">
                100%
              </div>
              <p className="text-xs sm:text-sm font-bold text-orange-400 font-display">
                Conformidade AGT
              </p>
              <p className="text-[11px] text-slate-400">
                Decreto Presidencial 71/25
              </p>
            </div>

            <div data-reveal className="space-y-2 p-6 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-orange-500/50 transition-colors">
              <div className="text-4xl sm:text-5xl lg:text-6xl font-black text-white font-mono-num tracking-tight">
                <CountUp end={18} type="odometer" duration={1.5} />
              </div>
              <p className="text-xs sm:text-sm font-bold text-orange-400 font-display">
                Províncias Cobertas
              </p>
              <p className="text-[11px] text-slate-400">
                Assistência técnica nacional
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          7. EQUIPA DE CONSULTORES & ESPECIALISTAS (ADVISORS — IMAGENS 2 E 4)
          Cartões Brancos com Foto Circular e Aro Laranja
          ══════════════════════════════════════════════════════════════════ */}
      <section id="equipa-consultores" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        <div data-reveal className="text-center max-w-2xl mx-auto mb-16 sm:mb-20 space-y-3.5">
          <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-[#FF6500] font-display">
            <span className="w-4 h-0.5 bg-[#FF6500] rounded-full inline-block" />
            <span>Consultores & Especialistas</span>
            <span className="w-4 h-0.5 bg-[#FF6500] rounded-full inline-block" />
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight font-display">
            A Nossa Equipa de Apoio Técnico
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            Especialistas dedicados prontos a intervir na sua loja, assegurar a conformidade fiscal e formar a sua equipa.
          </p>
        </div>

        {/* Grade de 4 Consultores com Fotos Circulares e Aro Laranja (Padrão das Imagens) */}
        <div data-stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Consultor 1 */}
          <div data-reveal className="bg-white rounded-3xl p-6 text-center border border-slate-150 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300">
            <div className="w-24 h-24 rounded-full border-2 border-[#FF6500] p-1 mx-auto mb-4 shadow-sm">
              <img
                src="/imagens/1085.webp"
                alt="Narciso da Costa"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <h3 className="font-bold text-slate-900 text-base font-display">
              Narciso da Costa
            </h3>
            <p className="text-xs text-[#FF6500] font-semibold mt-0.5">
              Consultor Principal de Sistemas
            </p>
            <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
              Arquiteto de software com mais de uma década de experiência em sistemas fiscais e bases de dados locais.
            </p>
          </div>

          {/* Consultor 2 */}
          <div data-reveal className="bg-white rounded-3xl p-6 text-center border border-slate-150 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300">
            <div className="w-24 h-24 rounded-full border-2 border-[#FF6500] p-1 mx-auto mb-4 shadow-sm">
              <img
                src="/imagens/2149153824.webp"
                alt="Sandra Miguel"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <h3 className="font-bold text-slate-900 text-base font-display">
              Sandra Miguel
            </h3>
            <p className="text-xs text-[#FF6500] font-semibold mt-0.5">
              Especialista Fiscal & SAF-T
            </p>
            <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
              Supervisão de conformidade tributária com as diretrizes do Decreto 71/25 e validação de relatórios AGT.
            </p>
          </div>

          {/* Consultor 3 */}
          <div data-reveal className="bg-white rounded-3xl p-6 text-center border border-slate-150 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300">
            <div className="w-24 h-24 rounded-full border-2 border-[#FF6500] p-1 mx-auto mb-4 shadow-sm">
              <img
                src="/imagens/1163.webp"
                alt="António Manuel"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <h3 className="font-bold text-slate-900 text-base font-display">
              António Manuel
            </h3>
            <p className="text-xs text-[#FF6500] font-semibold mt-0.5">
              Engenheiro de Redes & Hardware
            </p>
            <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
              Instalação presencial de servidores locais, sincronização multi-postos LAN e configuração de periféricos POS.
            </p>
          </div>

          {/* Consultor 4 */}
          <div data-reveal className="bg-white rounded-3xl p-6 text-center border border-slate-150 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300">
            <div className="w-24 h-24 rounded-full border-2 border-[#FF6500] p-1 mx-auto mb-4 shadow-sm">
              <img
                src="/imagens/2150690165.webp"
                alt="Helena Gaspar"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <h3 className="font-bold text-slate-900 text-base font-display">
              Helena Gaspar
            </h3>
            <p className="text-xs text-[#FF6500] font-semibold mt-0.5">
              Gestora de Suporte & Formação
            </p>
            <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
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
          9. TABELA DE PREÇOS & PLANOS (PRICING — EXATAMENTE COMO NA IMAGEM 1)
          3 Cartões: Mensal, Anual Destacado no Meio com Topo Escuro, Vitalício
          ══════════════════════════════════════════════════════════════════ */}
      <section id="precos-planos" className="py-24 sm:py-32 bg-white px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        <div data-reveal className="text-center max-w-2xl mx-auto mb-16 sm:mb-20 space-y-3.5">
          <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-[#FF6500] font-display">
            <span className="w-4 h-0.5 bg-[#FF6500] rounded-full inline-block" />
            <span>Tabela Oficial</span>
            <span className="w-4 h-0.5 bg-[#FF6500] rounded-full inline-block" />
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight font-display">
            Preços Claros Fixados em Kwanzas (AOA)
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            Sem custos escondidos, sem dependência do câmbio em dólares. Escolha o formato de licenciamento que melhor atende à sua empresa.
          </p>
        </div>

        <div data-stagger className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
          
          {/* Card 1: Mensal (Padrão Imagem 1) */}
          <div data-reveal className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group">
            {/* Top Header Laranja */}
            <div className="bg-gradient-to-r from-amber-500 to-[#FF6500] p-6 text-white text-center">
              <span className="text-[11px] font-bold uppercase tracking-wider block opacity-90">
                {settings.planMensalCategory || 'Arranque Flexível'}
              </span>
              <div className="mt-2 text-3xl font-extrabold font-mono-num">
                {settings.planMensalPrice || '25.000'} <span className="text-sm font-normal">Kz / mês</span>
              </div>
            </div>

            <div className="p-8 flex flex-col justify-between flex-grow">
              <div>
                <h3 className="text-lg font-bold text-slate-950 mb-3 text-center font-display">
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
                      <div className="w-5 h-5 rounded-full bg-orange-50 text-[#FF6500] flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                      </div>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => onOpenDemoModal(settings.planMensalName || 'Plano Mensal')}
                className="w-full py-3.5 rounded-full bg-[#FF6500] hover:bg-[#EB5B00] active:scale-95 text-white font-bold text-xs transition-all shadow-md shadow-orange-500/20 cursor-pointer"
              >
                Aderir ao Plano Mensal
              </button>
            </div>
          </div>

          {/* Card 2: Anual LAN (DESTACADO NO MEIO COM TOPO ESCURO — IMAGEM 1) */}
          <div data-reveal className="bg-white rounded-3xl border-2 border-[#FF6500] overflow-hidden shadow-2xl scale-103 sm:-translate-y-3 flex flex-col justify-between relative group z-10">
            {/* Top Header Escuro/Charcoal das Imagens */}
            <div className="bg-[#0B1528] p-7 text-white text-center relative">
              <span className="inline-block bg-[#FF6500] text-white text-[10px] font-black uppercase px-3 py-0.5 rounded-full mb-2 tracking-wider">
                {settings.planAnualBadge || 'Mais Escolhido em Angola'}
              </span>
              <div className="text-3xl sm:text-4xl font-black font-mono-num text-white">
                {settings.planAnualPrice || '250.000'} <span className="text-sm font-normal text-slate-300">Kz / ano</span>
              </div>
              <span className="text-[11px] text-emerald-400 font-bold block mt-1">
                Poupança de 50.000 Kz (2 Meses Grátis)
              </span>
            </div>

            <div className="p-8 flex flex-col justify-between flex-grow">
              <div>
                <h3 className="text-xl font-bold text-slate-950 mb-2 text-center font-display">
                  {settings.planAnualName || 'Plano Anual LAN'}
                </h3>
                <p className="text-xs text-slate-500 text-center mb-6 leading-relaxed">
                  Para supermercados, restaurantes, comércio geral e empresas com múltiplos caixas.
                </p>

                <ul className="space-y-3.5 text-xs text-slate-800 mb-8">
                  {parseFeatures(settings.planAnualFeatures, [
                    'Até 3 Postos em Rede LAN Incluídos',
                    'Módulos de Stock, POS e RH Integrados',
                    'Atualizações Fiscais AGT Garantidas',
                    'Suporte Prioritário por WhatsApp e Remoto'
                  ]).map((feat, i) => (
                    <li key={i} className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-[#0B1528] text-white flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 text-orange-400" strokeWidth={2.5} />
                      </div>
                      <span className={i === 0 ? 'font-bold text-slate-950' : ''}>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => onOpenDemoModal(settings.planAnualName || 'Plano Anual LAN')}
                className="w-full py-4 rounded-full bg-slate-950 hover:bg-[#FF6500] active:scale-95 text-white font-bold text-xs transition-all shadow-xl cursor-pointer"
              >
                Contratar Plano Anual
              </button>
            </div>
          </div>

          {/* Card 3: Licença Vitalícia (Padrão Imagem 1) */}
          <div data-reveal className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group">
            {/* Top Header Laranja */}
            <div className="bg-gradient-to-r from-amber-500 to-[#FF6500] p-6 text-white text-center">
              <span className="text-[11px] font-bold uppercase tracking-wider block opacity-90">
                {settings.planVitalicioCategory || 'Pagamento Único'}
              </span>
              <div className="mt-2 text-3xl font-extrabold font-mono-num">
                {settings.planVitalicioPrice || '650.000'} <span className="text-sm font-normal">Kz / único</span>
              </div>
            </div>

            <div className="p-8 flex flex-col justify-between flex-grow">
              <div>
                <h3 className="text-lg font-bold text-slate-950 mb-3 text-center font-display">
                  {settings.planVitalicioName || 'Licença Vitalícia'}
                </h3>
                <p className="text-xs text-slate-500 text-center mb-6 leading-relaxed">
                  Para empresas que preferem adquirir o software de forma definitiva sem anuidades.
                </p>

                <ul className="space-y-3 text-xs text-slate-700 mb-8">
                  {parseFeatures(settings.planVitalicioFeatures, [
                    'Uso Perpétuo Sem Mensalidades',
                    'Servidor Principal + 5 Terminais LAN',
                    'Formação Presencial da Equipa em Luanda',
                    'Certificado de Licenciamento Definitivo'
                  ]).map((feat, i) => (
                    <li key={i} className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-orange-50 text-[#FF6500] flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                      </div>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => onOpenDemoModal(settings.planVitalicioName || 'Licença Vitalícia')}
                className="w-full py-3.5 rounded-full bg-[#FF6500] hover:bg-[#EB5B00] active:scale-95 text-white font-bold text-xs transition-all shadow-md shadow-orange-500/20 cursor-pointer"
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
        <div data-reveal className="text-center max-w-2xl mx-auto mb-16 sm:mb-20 space-y-3.5">
          <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-[#FF6500] font-display">
            <span className="w-4 h-0.5 bg-[#FF6500] rounded-full inline-block" />
            <span>Equipamentos Oficiais</span>
            <span className="w-4 h-0.5 bg-[#FF6500] rounded-full inline-block" />
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight font-display">
            Periféricos POS Recomendados para o Balcão
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            Fornecemos e configuramos periféricos comerciais testados para suportar o ritmo diário e intenso de caixas de retalho e restauração.
          </p>
        </div>

        <div data-stagger className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          
          {/* Terminal POS Touch */}
          <div data-reveal className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between group hover:shadow-xl transition-all">
            <div>
              <div className="h-56 mb-6 flex items-center justify-center bg-slate-50 rounded-2xl p-4 border border-slate-100 select-none">
                <img
                  src={posImg}
                  alt="Terminal Touch POS Kivora"
                  className="max-h-full max-w-full object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-[#FF6500] uppercase tracking-wider font-display">
                  Ecrã Tátil 15.6" Capacitivo
                </span>
                <span className="text-xs font-bold text-slate-900 font-mono-num">
                  Desde 750.000 Kz
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-950 mb-2 group-hover:text-[#FF6500] transition-colors font-display">
                Terminal POS Touch All-in-One
              </h3>
              <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal mb-4">
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
          <div data-reveal className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between group hover:shadow-xl transition-all">
            <div>
              <div className="h-56 mb-6 flex items-center justify-center bg-slate-50 rounded-2xl p-4 border border-slate-100 select-none">
                <img
                  src={desktopImg}
                  alt="Computador Desktop Kivora"
                  className="max-h-full max-w-full object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-[#FF6500] uppercase tracking-wider font-display">
                  Backoffice & Servidor LAN
                </span>
                <span className="text-xs font-bold text-slate-900 font-mono-num">
                  Pronto a Operar
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-950 mb-2 group-hover:text-[#FF6500] transition-colors font-display">
                Desktop Core i5 / SSD 256GB
              </h3>
              <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal mb-4">
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
          <div data-reveal className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between group hover:shadow-xl transition-all">
            <div>
              <div className="h-56 mb-6 flex items-center justify-center bg-slate-50 rounded-2xl p-4 border border-slate-100 select-none">
                <img
                  src={laptopImg}
                  alt="Portátil Laptop Kivora"
                  className="max-h-full max-w-full object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-[#FF6500] uppercase tracking-wider font-display">
                  Vendas & Gerência Móvel
                </span>
                <span className="text-xs font-bold text-slate-900 font-mono-num">
                  Bateria Longa Duração
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-950 mb-2 group-hover:text-[#FF6500] transition-colors font-display">
                Laptop Comercial Executivo
              </h3>
              <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal mb-4">
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
          11. BANNER FINAL DE ALTA CONVERSÃO (PADRÃO XTRA DAS IMAGENS)
          ══════════════════════════════════════════════════════════════════ */}
      <section data-reveal className="py-24 sm:py-32 bg-gradient-to-br from-[#FF6500] via-[#EB5B00] to-[#D94F00] text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-7 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 border border-white/30 text-white text-xs font-bold uppercase tracking-wider font-display">
            <span>Comece a Faturar Hoje Mesmo</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.12] font-display">
            Modernize a faturação da sua empresa com segurança e conformidade AGT
          </h2>

          <p className="text-white/90 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-normal">
            Descarregue o instalador gratuito do KIVORA para Windows 10/11 e experimente todas as funcionalidades com a nossa licença de demonstração de 15 dias.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => onNavigatePage('download')}
              className="bg-slate-950 hover:bg-slate-900 active:scale-95 text-white font-bold text-sm px-8 py-4 rounded-full shadow-2xl flex items-center gap-2.5 cursor-pointer transition-all"
            >
              <Download className="w-5 h-5 text-orange-400" />
              <span>Baixar KIVORA SOFT Setup</span>
            </button>
            <button
              onClick={() => onOpenDemoModal('Demonstração VIP')}
              className="bg-white/20 hover:bg-white/30 active:scale-95 text-white font-bold text-sm px-8 py-4 rounded-full border border-white/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Solicitar Demonstração VIP</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs text-white/90">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-200" />
              <span>Certificado AGT FE/387/AGT/2026</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-amber-200" />
              <span>15 Dias de Avaliação Gratuita</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-amber-200" />
              <span>Sem Fidelização nem Cartão de Crédito</span>
            </span>
          </div>
        </div>
      </section>

    </div>
  );
};

