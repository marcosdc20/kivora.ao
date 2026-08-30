import React, { useState, useEffect } from 'react';
import { HeroCarousel } from '../components/HeroCarousel';
import { CountUp } from '../components/CountUp';
import { AnimatedText } from '../components/AnimatedText';
import {
  CheckCircle2, ArrowRight, Download, Wifi,
  Zap, Check, ShieldCheck,
  Headphones, MapPin,
  FileCheck, ShoppingCart, Boxes, Users,
  HardDrive, Sparkles, Monitor, Cpu, Laptop
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
import tabletImg from '../assets/kivora/jovem-empresaria-com-tablet.png';
import executivosImg from '../assets/kivora/executivos-kivora.jpg';
import supermercadoImg from '../assets/kivora/supermercado-kivora.jpg';

interface HomePageProps {
  onSelectModule?: (module: any) => void;
  onOpenDemoModal: (subject?: string) => void;
  onNavigatePage: (page: PageId) => void;
}

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

  return (
    <div className="bg-white text-slate-800 font-sans">
      
      {/* ========== HERO SECTION (CARROSSEL COM IMAGENS E COMPUTADORES PASSANDO JUNTOS) ========== */}
      <HeroCarousel
        onNavigatePage={onNavigatePage}
        onOpenDemoModal={onOpenDemoModal}
      />

      {/* ========== BARRA DE CONFIANÇA EMPRESARIAL ========== */}
      <div className="bg-[#1746A2] text-white py-4 border-b border-blue-700/60 shadow-inner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-blue-100">
            <span className="flex items-center gap-2 text-white font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>Certificação Oficial AGT • N.º FE/440/AGT/2026</span>
            </span>
            <div className="flex flex-wrap items-center gap-6 sm:gap-8 text-blue-100">
              <span className="flex items-center gap-2">
                <Wifi className="w-3.5 h-3.5 text-blue-200" />
                Base Local 100% Offline
              </span>
              <span className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                Tabelas IRT 2026 & SAF-T (AO)
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-300" />
                Assistência Técnica em Luanda
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========== CARROSSEL DE CLIENTES E PARCEIROS (SE EXISTIREM NO FIREBASE) ========== */}
      {partnerLogos.length > 0 && (
        <section className="py-10 bg-slate-50 border-b border-slate-200/80 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Empresas e Parceiros Integrados ao Ecossistema KIVORA
            </span>
            <button
              onClick={() => onNavigatePage('parceiros')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              <span>Rede de Parceiros</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="relative w-full overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none" />

            <div className="animate-marquee flex items-center gap-8 py-2">
              {[...partnerLogos, ...partnerLogos].map((partner, idx) => (
                <div
                  key={`${partner.id}-${idx}`}
                  className="flex items-center gap-2.5 px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-xs shrink-0 select-none"
                >
                  {partner.logoUrl ? (
                    <img
                      src={partner.logoUrl}
                      alt={partner.name}
                      className="h-7 w-auto object-contain rounded"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs">
                      {partner.name.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <span className="text-xs font-semibold text-slate-800">
                    {partner.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ========== OS 4 MÓDULOS PRINCIPAIS DE GESTÃO ========== */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div data-reveal className="sr-init text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
            <span>Ecossistema Modular Integrado</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-extrabold text-slate-950 tracking-tight leading-tight">
            <AnimatedText text="Tudo o que a sua empresa precisa num único sistema" el="span" mode="letter-stagger" />
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            Elimine planilhas manuais e softwares desconectados. O KIVORA unifica faturação fiscal, caixas de atendimento rápido, controlo de stocks e processamento de salários.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          
          {/* 1. Faturação AGT */}
          <div
            data-reveal
            className="sr-init bg-gradient-to-br from-blue-50/50 via-white to-white border border-slate-200/90 rounded-3xl p-7 flex flex-col justify-between hover:border-blue-500 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer relative overflow-hidden"
            onClick={() => onNavigatePage('faturacao')}
          >
            {/* Marca de água e gradiente colorido decorativo de fundo */}
            <div className="absolute top-0 right-0 w-28 h-28 bg-blue-500/10 rounded-bl-full pointer-events-none transition-all group-hover:scale-125" />
            <FileCheck className="icon-watermark wm-blue w-32 h-32" strokeWidth={1.25} />

            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-xs mb-5">
                <FileCheck className="w-6 h-6" strokeWidth={1.75} />
              </div>
              <h3 className="text-lg font-extrabold text-slate-950 mb-2 group-hover:text-blue-600 transition-colors">
                Faturação Eletrónica
              </h3>
              <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed mb-6 font-normal">
                Assinatura digital RSA-SHA256, QR Code impresso no talão, numeração sequencial e exportação mensal de SAF-T (AO) sem erros.
              </p>
            </div>
            <div className="relative z-10 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600 group-hover:text-blue-700">
              <span>Explorar Faturação</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 2. Ponto de Venda POS */}
          <div
            data-reveal
            className="sr-init bg-gradient-to-br from-emerald-50/50 via-white to-white border border-slate-200/90 rounded-3xl p-7 flex flex-col justify-between hover:border-emerald-500 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer relative overflow-hidden"
            style={{ transitionDelay: '100ms' }}
            onClick={() => onNavigatePage('pos')}
          >
            {/* Marca de água e gradiente colorido decorativo de fundo */}
            <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/10 rounded-bl-full pointer-events-none transition-all group-hover:scale-125" />
            <ShoppingCart className="icon-watermark wm-emerald w-32 h-32" strokeWidth={1.25} />

            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-xs mb-5">
                <ShoppingCart className="w-6 h-6" strokeWidth={1.75} />
              </div>
              <h3 className="text-lg font-extrabold text-slate-950 mb-2 group-hover:text-emerald-600 transition-colors">
                Ponto de Venda (POS)
              </h3>
              <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed mb-6 font-normal">
                Atendimento ultrarrápido compatível com ecrãs touch, leitura de códigos de barras, talões térmicos, fecho Z e controlo de turnos.
              </p>
            </div>
            <div className="relative z-10 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-600 group-hover:text-emerald-700">
              <span>Explorar POS</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 3. Stock & Armazéns */}
          <div
            data-reveal
            className="sr-init bg-gradient-to-br from-amber-50/50 via-white to-white border border-slate-200/90 rounded-3xl p-7 flex flex-col justify-between hover:border-amber-500 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer relative overflow-hidden"
            style={{ transitionDelay: '200ms' }}
            onClick={() => onNavigatePage('stock')}
          >
            {/* Marca de água e gradiente colorido decorativo de fundo */}
            <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/10 rounded-bl-full pointer-events-none transition-all group-hover:scale-125" />
            <Boxes className="icon-watermark wm-amber w-32 h-32" strokeWidth={1.25} />

            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-all shadow-xs mb-5">
                <Boxes className="w-6 h-6" strokeWidth={1.75} />
              </div>
              <h3 className="text-lg font-extrabold text-slate-950 mb-2 group-hover:text-amber-600 transition-colors">
                Stock & Armazéns
              </h3>
              <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed mb-6 font-normal">
                Rastreabilidade de entradas e saídas, gestão de lotes e datas de validade, transferências entre lojas e alertas de rutura.
              </p>
            </div>
            <div className="relative z-10 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-600 group-hover:text-amber-700">
              <span>Explorar Stocks</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 4. Recursos Humanos & IRT */}
          <div
            data-reveal
            className="sr-init bg-gradient-to-br from-purple-50/50 via-white to-white border border-slate-200/90 rounded-3xl p-7 flex flex-col justify-between hover:border-purple-500 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer relative overflow-hidden"
            style={{ transitionDelay: '300ms' }}
            onClick={() => onNavigatePage('rh')}
          >
            {/* Marca de água e gradiente colorido decorativo de fundo */}
            <div className="absolute top-0 right-0 w-28 h-28 bg-purple-500/10 rounded-bl-full pointer-events-none transition-all group-hover:scale-125" />
            <Users className="icon-watermark wm-purple w-32 h-32" strokeWidth={1.25} />

            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all shadow-xs mb-5">
                <Users className="w-6 h-6" strokeWidth={1.75} />
              </div>
              <h3 className="text-lg font-extrabold text-slate-950 mb-2 group-hover:text-purple-600 transition-colors">
                Recursos Humanos & IRT
              </h3>
              <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed mb-6 font-normal">
                Processamento salarial mensal em conformidade com a Lei Geral do Trabalho, retenção de INSS (3%/8%) e tabelas de IRT.
              </p>
            </div>
            <div className="relative z-10 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-600 group-hover:text-purple-700">
              <span>Explorar RH</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>
      </section>

      {/* ========== DESTAQUE EDITORIAL: JOVEM EMPRESÁRIA COM TABLET ========== */}
      <section className="py-16 sm:py-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Texto na Esquerda */}
          <div data-reveal className="sr-init lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Mobilidade & Controlo de Gestão
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-slate-950 tracking-tight leading-tight">
              A Escolha Inteligente para Gestores e Empresas em Angola
            </h2>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Desenvolvido para responder às exigências reais do mercado nacional, o <strong>KIVORA ERP</strong> combina robustez fiscal certificada com simplicidade operacional, permitindo-lhe acompanhar o desempenho das suas lojas em tempo real.
            </p>

            <div className="space-y-3.5 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">✓</div>
                <div>
                  <strong className="text-slate-900 text-sm block">Faturação Certificada e Segura</strong>
                  <span className="text-xs text-slate-500">Conformidade rigorosa com o Decreto 71/25 e validação imediata da AGT.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">✓</div>
                <div>
                  <strong className="text-slate-900 text-sm block">Controlo de Caixas e Stocks em Tempo Real</strong>
                  <span className="text-xs text-slate-500">Gestão multi-armazém com alertas automáticos de rutura e validade de lotes.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">✓</div>
                <div>
                  <strong className="text-slate-900 text-sm block">Independência Total da Internet</strong>
                  <span className="text-xs text-slate-500">Operação contínua em rede local com base de dados no seu próprio computador.</span>
                </div>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <button
                onClick={() => onNavigatePage('funcionalidades')}
                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-2xl shadow-md shadow-blue-600/20 transition-all hover:-translate-y-0.5 cursor-pointer"
              >
                <span>Conhecer Todos os Módulos</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onOpenDemoModal('Demonstração Executiva')}
                className="inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm px-6 py-3.5 rounded-2xl transition-all cursor-pointer"
              >
                <span>Pedir Demonstração</span>
              </button>
            </div>
          </div>

          {/* Imagem da Jovem Empresária com Tablet — Livre, Flutuante e Sem Cortes por Baixo */}
          <div data-reveal className="sr-init lg:col-span-6 flex items-end justify-center relative">
            <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-lg flex items-end justify-center">
              {/* Brilho suave no fundo para profundidade */}
              <div className="absolute inset-0 bg-blue-500/5 rounded-full blur-3xl pointer-events-none scale-90" />
              <img
                src={tabletImg}
                alt="Jovem Empresária com Tablet KIVORA ERP"
                loading="lazy"
                decoding="async"
                width="500"
                height="540"
                style={{
                  maskImage: 'linear-gradient(to bottom, black 82%, transparent 100%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, black 82%, transparent 100%)',
                }}
                className="relative z-10 w-full h-auto max-h-[380px] sm:max-h-[480px] lg:max-h-[540px] object-contain object-bottom select-none pointer-events-none drop-shadow-[0_25px_45px_rgba(0,0,0,0.22)] transition-transform duration-500 hover:scale-105"
              />
            </div>
          </div>

        </div>
      </section>

      {/* ========== STATS STRIP ========== */}
      <section className="py-10 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { component: <CountUp end={2800} suffix="+" type="odometer" duration={2} />, label: 'Empresas Ativas', color: 'text-blue-600', bg: 'bg-blue-50', icon: <Users className="w-6 h-6" /> },
              { component: <CountUp end={18} suffix=" Províncias" type="odometer" duration={1.5} />, label: 'Cobertura Nacional', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: <MapPin className="w-6 h-6" /> },
              { component: <CountUp end={99.9} decimals={1} suffix="%" type="counter" duration={1.8} />, label: 'Uptime Offline LAN', color: 'text-amber-600', bg: 'bg-amber-50', icon: <ShieldCheck className="w-6 h-6" /> },
              { component: <CountUp end={440} prefix="FE/" suffix="/AGT" type="scramble" duration={2.2} />, label: 'Certificação Oficial', color: 'text-purple-600', bg: 'bg-purple-50', icon: <FileCheck className="w-6 h-6" /> },
            ].map((stat, idx) => (
              <div key={idx} className="flex items-center gap-4 group" style={{ animationDelay: `${idx * 100}ms` }}>
                <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform icon-spin-hover`}>
                  {stat.icon}
                </div>
                <div>
                  <div className={`text-2xl font-black font-mono-num tracking-tight ${stat.color}`}>{stat.component}</div>
                  <div className="text-xs text-slate-500 font-medium leading-tight">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== PORQUÊ O KIVORA EM ANGOLA (OFFLINE + REDE LOCAL) ========== */}
      <section className="py-20 bg-mesh-dark text-white relative overflow-hidden">
        {/* Orbs decorativos */}
        <div className="orb orb-blue w-96 h-96 -top-24 -left-24" />
        <div className="orb orb-purple w-64 h-64 bottom-0 right-0" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div data-reveal className="sr-init lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/15 border border-blue-400/25 text-blue-300 text-xs font-bold">
                <HardDrive className="w-3.5 h-3.5" />
                Soberania de Dados & Continuidade Operacional
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Faturação garantida mesmo quando a internet falha
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Em Angola, a instabilidade da internet e das redes não pode travar as vendas do seu negócio. O <strong className="text-white">KIVORA Desktop ERP</strong> armazena a base de dados no seu computador ou servidor local (LAN).
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {[
                  { icon: <CheckCircle2 className="w-4 h-4" />, title: '100% Offline-First', desc: 'Emita faturas, feche caixas e gira stocks sem depender de ligação externa.' },
                  { icon: <Wifi className="w-4 h-4" />, title: 'Rede Local Multi-Postos', desc: 'Conecte 10 ou mais terminais de caixa ao servidor na rede do balcão.' },
                  { icon: <Zap className="w-4 h-4" />, title: 'Sem Riscos Cambiais', desc: 'Preços fixados em Kwanzas (AOA), sem mensalidades em moeda estrangeira.' },
                  { icon: <ShieldCheck className="w-4 h-4" />, title: 'Segurança & Cópia USB', desc: 'Backups automáticos encriptados para Pen Drive ou disco externo.' },
                ].map((f, i) => (
                  <div key={i} className="bg-white/5 hover:bg-white/10 p-4 rounded-2xl border border-white/10 hover:border-blue-400/30 space-y-1.5 transition-all group/feat cursor-default shine-hover">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                      <span className="group-hover/feat:scale-110 transition-transform">{f.icon}</span>
                      <span>{f.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{f.desc}</p>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => onNavigatePage('download')}
                  className="bg-[#FF6500] hover:bg-[#EB5B00] text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-orange-600/30 flex items-center gap-2 cursor-pointer shimmer-button"
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar Versão de Avaliação</span>
                </button>
                <button
                  onClick={() => onOpenDemoModal('Arquitetura Offline LAN')}
                  className="text-slate-300 hover:text-white font-semibold text-xs sm:text-sm px-4 py-3 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Pedir Demonstração</span>
                  <ArrowRight className="w-3.5 h-3.5 arrow-bounce" />
                </button>
              </div>
            </div>

            <div data-reveal className="sr-init lg:col-span-6">
              <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl ring-1 ring-white/5 relative group">
                <img
                  src={supermercadoImg}
                  alt="Supermercado e Caixas a operar com Kivora ERP"
                  loading="lazy"
                  decoding="async"
                  width="640"
                  height="440"
                  className="w-full h-[360px] sm:h-[440px] object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent pointer-events-none" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========== HARDWARE & EQUIPAMENTOS POS ========== */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto cv-auto">
        <div data-reveal className="sr-init text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider">
            <span>Equipamentos POS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-extrabold text-slate-950 tracking-tight leading-tight">
            Equipamentos de Alto Rendimento para o Balcão
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            Fornecemos e configuramos periféricos comerciais testados e prontos para suportar o ritmo diário de caixas de retalho, supermercados e restauração.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-7 items-stretch">
          
          {/* 1. Terminal POS Touch */}
          <div className="bg-gradient-to-br from-blue-50/40 via-white to-white border border-slate-200/90 rounded-3xl p-7 flex flex-col justify-between hover:border-blue-500 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
            <Monitor className="icon-watermark wm-blue w-32 h-32" strokeWidth={1.25} />
            
            <div className="relative z-10">
              {/* Imagem do Computador/POS Livre Sem Moldura nem Tabela */}
              <div className="h-52 sm:h-60 mb-5 flex items-center justify-center relative select-none">
                <div className="absolute inset-0 bg-blue-500/5 rounded-full blur-2xl pointer-events-none scale-75" />
                <img
                  src={posImg}
                  alt="Terminal Touch POS Kivora"
                  loading="lazy"
                  decoding="async"
                  width="360"
                  height="260"
                  className="relative z-10 max-h-full max-w-full object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.18)] group-hover:scale-108 transition-transform duration-500"
                />
              </div>

              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                  Ecrã Tátil 15.6"
                </span>
                <span className="text-xs font-bold text-slate-900 font-mono">
                  Desde 750.000 Kz
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-slate-950 mb-2 group-hover:text-blue-600 transition-colors">Terminal POS Touch All-in-One</h3>
              <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed mb-4">
                Ecrã industrial de 15.6 polegadas com resposta rápida ao toque, processador de alta velocidade e chassis reforçado para operações intensivas.
              </p>
            </div>

            <div className="relative z-10 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-800">
              <span className="text-slate-500 font-medium">12 Meses de Garantia</span>
              <button
                onClick={() => onNavigatePage('loja')}
                className="text-blue-600 hover:text-blue-700 flex items-center gap-1.5 group-hover:translate-x-1 transition-all cursor-pointer font-bold"
              >
                <span>Ver na Loja</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 2. Computador Desktop LAN */}
          <div className="bg-gradient-to-br from-indigo-50/40 via-white to-white border border-slate-200/90 rounded-3xl p-7 flex flex-col justify-between hover:border-indigo-500 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
            <Cpu className="icon-watermark wm-indigo w-32 h-32" strokeWidth={1.25} />

            <div className="relative z-10">
              {/* Imagem do Computador Desktop Livre Sem Moldura nem Tabela */}
              <div className="h-52 sm:h-60 mb-5 flex items-center justify-center relative select-none">
                <div className="absolute inset-0 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none scale-75" />
                <img
                  src={desktopImg}
                  alt="Computador Desktop Kivora"
                  loading="lazy"
                  decoding="async"
                  width="360"
                  height="260"
                  className="relative z-10 max-h-full max-w-full object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.18)] group-hover:scale-108 transition-transform duration-500"
                />
              </div>

              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                  Backoffice & Servidor
                </span>
                <span className="text-xs font-bold text-slate-900 font-mono">
                  Pronto a Operar
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-slate-950 mb-2 group-hover:text-indigo-600 transition-colors">Desktop Core i5 / SSD 256GB</h3>
              <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed mb-4">
                Configurado para operar como estação principal de retaguarda, servidor central de base de dados e emissão de relatórios fiscais SAF-T.
              </p>
            </div>

            <div className="relative z-10 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-800">
              <span className="text-slate-500 font-medium">Windows 11 Pro</span>
              <button
                onClick={() => onNavigatePage('loja')}
                className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 group-hover:translate-x-1 transition-all cursor-pointer font-bold"
              >
                <span>Ver na Loja</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 3. Portátil para Vendas */}
          <div className="bg-gradient-to-br from-sky-50/40 via-white to-white border border-slate-200/90 rounded-3xl p-7 flex flex-col justify-between hover:border-sky-500 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
            <Laptop className="icon-watermark wm-sky w-32 h-32" strokeWidth={1.25} />

            <div className="relative z-10">
              {/* Imagem do Laptop Livre Sem Moldura nem Tabela */}
              <div className="h-52 sm:h-60 mb-5 flex items-center justify-center relative select-none">
                <div className="absolute inset-0 bg-sky-500/5 rounded-full blur-2xl pointer-events-none scale-75" />
                <img
                  src={laptopImg}
                  alt="Portátil Laptop Kivora"
                  loading="lazy"
                  decoding="async"
                  width="360"
                  height="260"
                  className="relative z-10 max-h-full max-w-full object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.18)] group-hover:scale-108 transition-transform duration-500"
                />
              </div>

              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-sky-600 uppercase tracking-wider">
                  Vendas & Gerência
                </span>
                <span className="text-xs font-bold text-slate-900 font-mono">
                  Bateria Durável
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-slate-950 mb-2 group-hover:text-sky-600 transition-colors">Laptop Comercial Executivo</h3>
              <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed mb-4">
                Excelente mobilidade para gestores e consultores comerciais. Permite faturar, registar encomendas e consultar stocks em movimento.
              </p>
            </div>

            <div className="relative z-10 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-800">
              <span className="text-slate-500 font-medium">Alta Autonomia</span>
              <button
                onClick={() => onNavigatePage('loja')}
                className="text-sky-600 hover:text-sky-700 flex items-center gap-1.5 group-hover:translate-x-1 transition-all cursor-pointer font-bold"
              >
                <span>Ver na Loja</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ========== TABELA DE PREÇOS & PLANOS EM KWANZAS ========== */}
      <section className="py-24 bg-mesh border-y border-slate-200/80 relative overflow-hidden cv-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-reveal className="sr-init text-center max-w-2xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider">
              <span>Licenciamento Transparente</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-extrabold text-slate-950 tracking-tight leading-tight">
              Preços Claros Fixados em Kwanzas
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              Sem taxas escondidas nem variações cambiais. Escolha a modalidade que melhor se adapta à dimensão da sua operação comercial.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7 max-w-5xl mx-auto items-stretch">
            
            {/* 1. Mensal */}
            <div className="bg-white border border-slate-200 rounded-3xl p-8 flex flex-col justify-between shadow-sm hover:-translate-y-1 hover:shadow-lg hover:border-slate-300 transition-all duration-300 group card-glow-blue relative overflow-hidden">
              {/* Watermark icon */}
              <FileCheck className="absolute -bottom-4 -right-4 w-28 h-28 text-slate-100 group-hover:text-blue-50 transition-colors" strokeWidth={1} />
              <div className="relative z-10">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Arranque Flexível</span>
                <h3 className="text-xl font-extrabold text-slate-950 mt-1 group-hover:text-blue-600 transition-colors">Plano Mensal</h3>
                <div className="mt-4 mb-6">
                  <span className="text-3xl sm:text-4xl font-extrabold text-slate-950 font-mono-num tracking-tight">25.000&nbsp;Kz</span>
                  <span className="text-xs text-slate-500 ml-1.5">/ mês</span>
                </div>
                <ul className="space-y-3 text-xs sm:text-[13px] text-slate-600 mb-8">
                  {['1 Posto de Trabalho Ativo', 'Faturação Certificada AGT com QR Code', 'Exportação SAF-T (AO) Mensal', 'Suporte Técnico em Horário Comercial'].map((feat, i) => (
                    <li key={i} className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 text-emerald-600" strokeWidth={3} />
                      </div>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => onOpenDemoModal('Plano Mensal')}
                className="w-full py-3.5 rounded-xl bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-900 font-bold text-xs transition-all cursor-pointer"
              >
                Aderir ao Plano Mensal
              </button>
            </div>

            {/* 2. Anual Comercial LAN (Destaque) */}
            <div className="bg-gradient-to-b from-[#1746A2] to-[#1E40AF] border-2 border-blue-400 rounded-3xl p-8 flex flex-col justify-between shadow-2xl shadow-blue-900/30 relative scale-102 z-10">
              {/* Orbs e marcas de água com wrapper de overflow-hidden */}
              <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
                <div className="absolute -top-12 -right-12 w-40 h-40 bg-blue-400/20 rounded-full blur-2xl" />
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-indigo-400/20 rounded-full blur-2xl" />
                <ShieldCheck className="icon-watermark wm-blue w-32 h-32 text-white/10" strokeWidth={1.25} />
              </div>

              {/* Badge Não Cortado */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#FF6500] text-white text-[10px] font-black uppercase px-4 py-1.5 rounded-full tracking-wider shadow-xl shadow-orange-600/40 whitespace-nowrap z-20">
                ⭐ Mais Popular em Angola
              </div>

              <div className="relative z-10 pt-2">
                <span className="text-xs font-bold text-blue-200 uppercase tracking-wider">Multi-Postos & Rede LAN</span>
                <h3 className="text-xl font-extrabold text-white mt-1">Plano Anual LAN</h3>
                <div className="mt-4 mb-6">
                  <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono-num tracking-tight">250.000&nbsp;Kz</span>
                  <span className="text-xs text-blue-200 ml-1.5">/ ano</span>
                  <p className="text-xs text-emerald-300 font-bold mt-1.5">💰 Poupança de 50.000 Kz vs Mensal</p>
                </div>
                <ul className="space-y-3 text-xs sm:text-[13px] text-blue-100 mb-8">
                  {['Até 3 Postos em Rede LAN Incluídos', 'Módulos de Stock, POS e RH Integrados', 'Atualizações Fiscais AGT Garantidas', 'Suporte Prioritário por WhatsApp e Remoto'].map((feat, i) => (
                    <li key={i} className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                      </div>
                      <span className={i === 0 ? 'font-bold text-white' : ''}>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => onOpenDemoModal('Plano Anual LAN')}
                className="w-full py-3.5 rounded-xl bg-white hover:bg-blue-50 text-blue-700 font-bold text-xs transition-all shadow-md cursor-pointer relative z-10 shimmer-button"
              >
                Contratar Plano Anual
              </button>
            </div>

            {/* 3. Licença Vitalícia */}
            <div className="bg-white border border-slate-200 rounded-3xl p-8 flex flex-col justify-between shadow-sm hover:-translate-y-1 hover:shadow-lg hover:border-amber-300 transition-all duration-300 group card-glow-amber relative overflow-hidden">
              <Sparkles className="absolute -bottom-4 -right-4 w-28 h-28 text-amber-100 group-hover:text-amber-200/60 transition-colors" strokeWidth={1} />
              <div className="relative z-10">
                <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Pagamento Único</span>
                <h3 className="text-xl font-extrabold text-slate-950 mt-1 group-hover:text-amber-600 transition-colors">Licença Vitalícia</h3>
                <div className="mt-4 mb-6">
                  <span className="text-3xl sm:text-4xl font-extrabold text-slate-950 font-mono-num tracking-tight">650.000&nbsp;Kz</span>
                  <span className="text-xs text-slate-500 ml-1.5">taxa única</span>
                </div>
                <ul className="space-y-3 text-xs sm:text-[13px] text-slate-600 mb-8">
                  {['Uso Perpétuo Sem Mensalidades', 'Servidor Principal + 5 Terminais LAN', 'Formação Presencial da Equipa em Luanda', 'Certificado de Licenciamento Definitivo'].map((feat, i) => (
                    <li key={i} className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 text-amber-600" strokeWidth={3} />
                      </div>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => onOpenDemoModal('Licença Vitalícia')}
                className="w-full py-3.5 rounded-xl bg-amber-50 hover:bg-amber-600 hover:text-white text-amber-700 font-bold text-xs transition-all cursor-pointer border border-amber-200 hover:border-amber-600 relative z-10"
              >
                Solicitar Proposta Vitalícia
              </button>
            </div>

          </div>

          <div className="mt-12 text-center">
            <button
              onClick={() => onNavigatePage('planos')}
              className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1.5 cursor-pointer bg-blue-50 hover:bg-blue-100 px-5 py-2.5 rounded-xl border border-blue-200/60 transition-all"
            >
              <span>Ver comparativo detalhado e tabela completa</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ========== APOIO AO CLIENTE & CONSULTORIA EM ANGOLA ========== */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto cv-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div data-reveal className="sr-init lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
              <Headphones className="w-3.5 h-3.5" />
              Apoio Técnico em Luanda
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight leading-tight">
              Acompanhamento dedicado à sua empresa
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Não fica sozinho na transição digital do seu negócio. A nossa equipa de técnicos em Luanda realiza a instalação, configura os terminais em rede local e dá formação prática aos operadores de caixa.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {[
                { icon: <Headphones className="w-5 h-5" />, title: 'Atendimento 6 Dias / Semana', desc: 'Suporte telefónico e WhatsApp das 08h00 às 19h00.', color: 'bg-blue-50 text-blue-600', hover: 'hover:border-blue-200' },
                { icon: <MapPin className="w-5 h-5" />, title: 'Deslocação Presencial', desc: 'Técnicos certificados para instalação e configuração LAN.', color: 'bg-emerald-50 text-emerald-600', hover: 'hover:border-emerald-200' },
                { icon: <ShieldCheck className="w-5 h-5" />, title: 'Garantia de Conformidade', desc: 'Atualizações fiscais AGT incluídas enquanto a licença estiver ativa.', color: 'bg-purple-50 text-purple-600', hover: 'hover:border-purple-200' },
                { icon: <Zap className="w-5 h-5" />, title: 'Resposta em 4 Horas', desc: 'Chamados urgentes tratados em até 4 horas úteis.', color: 'bg-amber-50 text-amber-600', hover: 'hover:border-amber-200' },
              ].map((f, i) => (
                <div key={i} className={`flex items-start gap-3 p-4 rounded-2xl border border-slate-100 ${f.hover} hover:shadow-sm transition-all group/sup bg-white`}>
                  <div className={`w-10 h-10 rounded-xl ${f.color} flex items-center justify-center shrink-0 group-hover/sup:scale-110 transition-transform`}>
                    {f.icon}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{f.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href={settings.whatsappUrl || 'https://wa.me/244923456789'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1EBE5B] text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl transition-all shadow-md shadow-green-600/20 hover:-translate-y-0.5"
              >
                <span>Falar com Técnico no WhatsApp</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <button
                onClick={() => onNavigatePage('suporte')}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs sm:text-sm px-5 py-3 rounded-xl transition-colors cursor-pointer hover:-translate-y-0.5"
              >
                Central de Suporte
              </button>
            </div>
          </div>

          <div data-reveal className="sr-init lg:col-span-6">
            <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-2xl group relative">
              <img
                src={executivosImg}
                alt="Consultores e Gestores de TI Kivora Angola"
                className="w-full h-[380px] sm:h-[440px] object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 to-transparent pointer-events-none" />
            </div>
          </div>

        </div>
      </section>

      {/* ========== CTA FINAL DE ALTA CONVERSÃO ========== */}
      <section className="py-24 bg-mesh-dark text-white relative overflow-hidden">
        {/* Floating orbs */}
        <div className="orb orb-blue w-80 h-80 -top-20 left-1/4 opacity-20" />
        <div className="orb orb-orange w-48 h-48 bottom-0 right-1/4 opacity-15" />
        <div className="orb orb-purple w-64 h-64 top-1/2 -right-16 opacity-20" />
        
        <div data-reveal className="sr-init max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-7 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/20 border border-orange-400/30 text-orange-300 text-xs font-bold animate-pulse-dot">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
            Comece a Faturar Hoje Mesmo
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Modernize a faturação da sua empresa com segurança e conformidade AGT
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Descarregue o instalador gratuito do KIVORA (~48.5 MB) para Windows 10/11 e experimente todas as funcionalidades com a nossa chave de demonstração.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => onNavigatePage('download')}
              className="bg-[#FF6500] hover:bg-[#EB5B00] active:bg-[#C94A00] text-white font-bold text-sm px-9 py-4 rounded-2xl transition-all shadow-xl shadow-orange-600/40 flex items-center gap-2.5 cursor-pointer hover:-translate-y-1 shimmer-button"
            >
              <Download className="w-5 h-5" />
              <span>Baixar KIVORA Setup (~48.5 MB)</span>
            </button>
            <button
              onClick={() => onOpenDemoModal()}
              className="bg-white/10 hover:bg-white/20 text-white font-bold text-sm px-8 py-4 rounded-2xl border border-white/20 hover:border-white/40 transition-all flex items-center gap-2 cursor-pointer hover:-translate-y-1"
            >
              <span>Solicitar Demonstração VIP</span>
              <ArrowRight className="w-4 h-4 arrow-bounce" />
            </button>
          </div>

          {/* Social proof strip */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Certificado AGT FE/440/AGT/2026</span>
            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> 15 Dias de Avaliação Gratuita</span>
            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> Sem Cartão de Crédito</span>
          </div>
        </div>
      </section>

    </div>
  );
};
