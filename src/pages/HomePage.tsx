import React, { useState, useEffect } from 'react';
import { HeroCarousel } from '../components/HeroCarousel';
import { CountUp } from '../components/CountUp';
import {
  CheckCircle2, ArrowRight, Download, Wifi,
  Zap, Check, ShieldCheck,
  Headphones, MapPin,
  FileCheck, ShoppingCart, Boxes, Users,
  HardDrive, Building2
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
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider">
            <span>Ecossistema Modular Integrado</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-extrabold text-slate-950 tracking-tight leading-tight">
            Tudo o que a sua empresa precisa num único sistema
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            Elimine planilhas manuais e softwares desconectados. O KIVORA unifica faturação fiscal, caixas de atendimento rápido, controlo de stocks e processamento de salários.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          
          {/* 1. Faturação AGT */}
          <div
            data-reveal
            className="sr-init surface-card p-7 flex flex-col justify-between group cursor-pointer"
            onClick={() => onNavigatePage('faturacao')}
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1746A2] flex items-center justify-center group-hover:bg-[#1746A2] group-hover:text-white transition-all shadow-xs mb-5">
                <FileCheck className="w-6 h-6" strokeWidth={1.75} />
              </div>
              <h3 className="text-lg font-bold text-slate-950 mb-2 group-hover:text-[#1746A2] transition-colors">
                Faturação Eletrónica
              </h3>
              <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal">
                Assinatura digital RSA-SHA256, QR Code impresso no talão, numeração sequencial e exportação mensal de SAF-T (AO) sem erros.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#1746A2] group-hover:text-blue-700">
              <span>Explorar Faturação</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 2. Ponto de Venda POS */}
          <div
            data-reveal
            className="sr-init surface-card p-7 flex flex-col justify-between group cursor-pointer"
            style={{ transitionDelay: '100ms' }}
            onClick={() => onNavigatePage('pos')}
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-xs mb-5">
                <ShoppingCart className="w-6 h-6" strokeWidth={1.75} />
              </div>
              <h3 className="text-lg font-bold text-slate-950 mb-2 group-hover:text-emerald-700 transition-colors">
                Ponto de Venda (POS)
              </h3>
              <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal">
                Atendimento ultrarrápido compatível com ecrãs touch, leitura de códigos de barras, talões térmicos, fecho Z e controlo de turnos.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700 group-hover:text-emerald-800">
              <span>Explorar POS</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 3. Stock & Armazéns */}
          <div
            data-reveal
            className="sr-init surface-card p-7 flex flex-col justify-between group cursor-pointer"
            style={{ transitionDelay: '200ms' }}
            onClick={() => onNavigatePage('stock')}
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-all shadow-xs mb-5">
                <Boxes className="w-6 h-6" strokeWidth={1.75} />
              </div>
              <h3 className="text-lg font-bold text-slate-950 mb-2 group-hover:text-amber-700 transition-colors">
                Stock & Armazéns
              </h3>
              <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal">
                Rastreabilidade de entradas e saídas, gestão de lotes e datas de validade, transferências entre lojas e alertas de rutura.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-700 group-hover:text-amber-800">
              <span>Explorar Stocks</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 4. Recursos Humanos & IRT */}
          <div
            data-reveal
            className="sr-init surface-card p-7 flex flex-col justify-between group cursor-pointer"
            style={{ transitionDelay: '300ms' }}
            onClick={() => onNavigatePage('rh')}
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all shadow-xs mb-5">
                <Users className="w-6 h-6" strokeWidth={1.75} />
              </div>
              <h3 className="text-lg font-bold text-slate-950 mb-2 group-hover:text-purple-700 transition-colors">
                Recursos Humanos & IRT
              </h3>
              <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal">
                Processamento salarial mensal em conformidade com a Lei Geral do Trabalho, retenção de INSS (3%/8%) e tabelas de IRT.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-700 group-hover:text-purple-800">
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
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5 text-[#1746A2]" />
              <span>Mobilidade & Controlo de Gestão</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-slate-950 tracking-tight leading-tight">
              A Escolha Natural para Gestores e Empresas em Angola
            </h2>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-normal">
              Desenvolvido para responder às exigências reais do mercado nacional, o <strong>KIVORA ERP</strong> combina robustez fiscal certificada com simplicidade operacional, permitindo-lhe acompanhar o desempenho das suas lojas com total segurança.
            </p>

            <div className="space-y-3.5 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">✓</div>
                <div>
                  <strong className="text-slate-950 text-sm block">Faturação Certificada e Segura</strong>
                  <span className="text-xs text-slate-600">Conformidade rigorosa com o Decreto 71/25 e validação imediata da AGT.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">✓</div>
                <div>
                  <strong className="text-slate-950 text-sm block">Controlo de Caixas e Stocks em Tempo Real</strong>
                  <span className="text-xs text-slate-600">Gestão multi-armazém com alertas automáticos de rutura e validade de lotes.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">✓</div>
                <div>
                  <strong className="text-slate-950 text-sm block">Independência Total da Internet</strong>
                  <span className="text-xs text-slate-600">Operação contínua em rede local com base de dados no seu próprio computador.</span>
                </div>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <button
                onClick={() => onNavigatePage('funcionalidades')}
                className="inline-flex items-center justify-center gap-2 bg-[#1746A2] hover:bg-blue-800 text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-sm transition-all hover:-translate-y-0.5 cursor-pointer"
              >
                <span>Conhecer Todos os Módulos</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onOpenDemoModal('Demonstração Executiva')}
                className="inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl transition-all cursor-pointer"
              >
                <span>Pedir Demonstração</span>
              </button>
            </div>
          </div>

          {/* Imagem da Jovem Empresária com Tablet — Enquadrada de Forma Limpa e Profissional */}
          <div data-reveal className="sr-init lg:col-span-6 flex items-center justify-center">
            <div className="relative w-full max-w-md lg:max-w-lg bg-slate-50 border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs flex items-center justify-center">
              <img
                src={tabletImg}
                alt="Jovem Empresária com Tablet KIVORA ERP"
                loading="lazy"
                decoding="async"
                width="500"
                height="540"
                className="w-full h-auto max-h-[380px] sm:max-h-[460px] object-contain select-none pointer-events-none drop-shadow-sm transition-transform duration-300 hover:scale-102"
              />
            </div>
          </div>

        </div>
      </section>

      {/* ========== STATS STRIP ========== */}
      <section className="py-12 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { component: <CountUp end={2800} suffix="+" type="odometer" duration={1.5} />, label: 'Empresas Ativas', color: 'text-[#1746A2]', bg: 'bg-blue-50', icon: <Users className="w-6 h-6" /> },
              { component: <CountUp end={18} suffix=" Províncias" type="odometer" duration={1.5} />, label: 'Cobertura Nacional', color: 'text-emerald-700', bg: 'bg-emerald-50', icon: <MapPin className="w-6 h-6" /> },
              { component: <CountUp end={99.9} decimals={1} suffix="%" type="counter" duration={1.5} />, label: 'Uptime Offline LAN', color: 'text-amber-700', bg: 'bg-amber-50', icon: <ShieldCheck className="w-6 h-6" /> },
              { component: <CountUp end={440} prefix="FE/" suffix="/AGT" type="counter" duration={1.5} />, label: 'Certificação Oficial', color: 'text-purple-700', bg: 'bg-purple-50', icon: <FileCheck className="w-6 h-6" /> },
            ].map((stat, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center shrink-0 transition-transform`}>
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
      <section className="py-24 bg-[#0B192C] text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div data-reveal className="sr-init lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-blue-200 text-xs font-bold uppercase tracking-wider">
                <HardDrive className="w-3.5 h-3.5" />
                <span>Soberania de Dados & Continuidade Operacional</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-extrabold text-white tracking-tight leading-tight">
                Faturação garantida mesmo quando a internet falha
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
                Em Angola, a instabilidade da internet não pode travar as vendas do seu negócio. O <strong className="text-white">KIVORA Desktop ERP</strong> armazena a base de dados no seu computador ou servidor local (LAN), com operação contínua e sem interrupções.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                {[
                  { icon: <CheckCircle2 className="w-4 h-4" />, title: '100% Offline-First', desc: 'Emita faturas, feche caixas e gira stocks sem depender de ligação externa.' },
                  { icon: <Wifi className="w-4 h-4" />, title: 'Rede Local Multi-Postos', desc: 'Conecte 10 ou mais terminais de caixa ao servidor na rede do balcão.' },
                  { icon: <Zap className="w-4 h-4" />, title: 'Sem Riscos Cambiais', desc: 'Preços fixados em Kwanzas (AOA), sem mensalidades em moeda estrangeira.' },
                  { icon: <ShieldCheck className="w-4 h-4" />, title: 'Segurança & Cópia USB', desc: 'Backups automáticos encriptados para Pen Drive ou disco externo.' },
                ].map((f, i) => (
                  <div key={i} className="bg-white/[0.04] hover:bg-white/[0.07] p-4 rounded-xl border border-white/[0.08] hover:border-white/[0.16] space-y-2 transition-all">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-white/[0.08] flex items-center justify-center shrink-0 text-blue-300">
                        {f.icon}
                      </div>
                      <span className="text-white font-semibold text-xs sm:text-[13px] tracking-tight">{f.title}</span>
                    </div>
                    <p className="text-xs text-slate-300/85 leading-relaxed font-normal">{f.desc}</p>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => onNavigatePage('download')}
                  className="bg-[#FF6500] hover:bg-[#E05900] active:bg-[#C94A00] text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar Versão de Avaliação</span>
                </button>
                <button
                  onClick={() => onOpenDemoModal('Arquitetura Offline LAN')}
                  className="text-slate-300 hover:text-white font-semibold text-xs sm:text-sm px-4 py-3 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Pedir Demonstração</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div data-reveal className="sr-init lg:col-span-6">
              <div className="rounded-2xl overflow-hidden border border-white/15 shadow-xl relative group">
                <img
                  src={supermercadoImg}
                  alt="Supermercado e Caixas a operar com Kivora ERP"
                  loading="lazy"
                  decoding="async"
                  width="640"
                  height="440"
                  className="w-full h-[360px] sm:h-[420px] object-cover"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========== HARDWARE & EQUIPAMENTOS POS ========== */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
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
          <div className="surface-card p-7 flex flex-col justify-between group">
            <div>
              {/* Imagem do POS em Fundo Neutro e Limpo */}
              <div className="h-52 sm:h-60 mb-5 flex items-center justify-center bg-slate-50/70 rounded-2xl p-4 border border-slate-100 select-none">
                <img
                  src={posImg}
                  alt="Terminal Touch POS Kivora"
                  loading="lazy"
                  decoding="async"
                  width="360"
                  height="260"
                  className="max-h-full max-w-full object-contain drop-shadow-xs transition-transform duration-300 group-hover:scale-103"
                />
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-[#1746A2] uppercase tracking-wider">
                  Ecrã Tátil 15.6"
                </span>
                <span className="text-xs font-bold text-slate-900 font-mono-num">
                  Desde 750.000 Kz
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-950 mb-2 group-hover:text-[#1746A2] transition-colors">
                Terminal POS Touch All-in-One
              </h3>
              <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal mb-4">
                Ecrã industrial de 15.6 polegadas com resposta rápida ao toque, processador de alta velocidade e chassis reforçado para operações intensivas.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-800">
              <span className="text-slate-500 font-medium">12 Meses de Garantia</span>
              <button
                onClick={() => onNavigatePage('loja')}
                className="text-[#1746A2] hover:text-blue-800 flex items-center gap-1.5 group-hover:translate-x-0.5 transition-all cursor-pointer font-bold"
              >
                <span>Ver na Loja</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 2. Computador Desktop LAN */}
          <div className="surface-card p-7 flex flex-col justify-between group">
            <div>
              {/* Imagem do Computador Desktop em Fundo Neutro e Limpo */}
              <div className="h-52 sm:h-60 mb-5 flex items-center justify-center bg-slate-50/70 rounded-2xl p-4 border border-slate-100 select-none">
                <img
                  src={desktopImg}
                  alt="Computador Desktop Kivora"
                  loading="lazy"
                  decoding="async"
                  width="360"
                  height="260"
                  className="max-h-full max-w-full object-contain drop-shadow-xs transition-transform duration-300 group-hover:scale-103"
                />
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-[#1746A2] uppercase tracking-wider">
                  Backoffice & Servidor
                </span>
                <span className="text-xs font-bold text-slate-900 font-mono-num">
                  Pronto a Operar
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-950 mb-2 group-hover:text-[#1746A2] transition-colors">
                Desktop Core i5 / SSD 256GB
              </h3>
              <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal mb-4">
                Configurado para operar como estação principal de retaguarda, servidor central de base de dados e emissão de relatórios fiscais SAF-T.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-800">
              <span className="text-slate-500 font-medium">Windows 11 Pro</span>
              <button
                onClick={() => onNavigatePage('loja')}
                className="text-[#1746A2] hover:text-blue-800 flex items-center gap-1.5 group-hover:translate-x-0.5 transition-all cursor-pointer font-bold"
              >
                <span>Ver na Loja</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 3. Portátil para Vendas */}
          <div className="surface-card p-7 flex flex-col justify-between group">
            <div>
              {/* Imagem do Laptop em Fundo Neutro e Limpo */}
              <div className="h-52 sm:h-60 mb-5 flex items-center justify-center bg-slate-50/70 rounded-2xl p-4 border border-slate-100 select-none">
                <img
                  src={laptopImg}
                  alt="Portátil Laptop Kivora"
                  loading="lazy"
                  decoding="async"
                  width="360"
                  height="260"
                  className="max-h-full max-w-full object-contain drop-shadow-xs transition-transform duration-300 group-hover:scale-103"
                />
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-[#1746A2] uppercase tracking-wider">
                  Vendas & Gerência
                </span>
                <span className="text-xs font-bold text-slate-900 font-mono-num">
                  Bateria Durável
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-950 mb-2 group-hover:text-[#1746A2] transition-colors">
                Laptop Comercial Executivo
              </h3>
              <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal mb-4">
                Excelente mobilidade para gestores e consultores comerciais. Permite faturar, registar encomendas e consultar stocks em movimento.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-800">
              <span className="text-slate-500 font-medium">Alta Autonomia</span>
              <button
                onClick={() => onNavigatePage('loja')}
                className="text-[#1746A2] hover:text-blue-800 flex items-center gap-1.5 group-hover:translate-x-0.5 transition-all cursor-pointer font-bold"
              >
                <span>Ver na Loja</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ========== TABELA DE PREÇOS & PLANOS EM KWANZAS (CONFIGURÁVEL NO ADMIN) ========== */}
      <section className="py-24 bg-[#F8FAFC] border-y border-slate-200/80 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-reveal className="sr-init text-center max-w-2xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-200/70 border border-slate-300 text-slate-700 text-xs font-bold uppercase tracking-wider">
              <span>{settings.pricingTag || 'Licenciamento Transparente'}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-extrabold text-slate-950 tracking-tight leading-tight">
              {settings.pricingTitle || 'Preços Claros Fixados em Kwanzas'}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              {settings.pricingSubtitle || 'Sem taxas escondidas nem variações cambiais. Escolha a modalidade que melhor se adapta à dimensão da sua operação comercial.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7 max-w-5xl mx-auto items-stretch">
            
            {/* 1. Mensal */}
            <div className="surface-card p-8 flex flex-col justify-between group bg-white">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {settings.planMensalCategory || 'Arranque Flexível'}
                </span>
                <h3 className="text-xl font-bold text-slate-950 mt-1 group-hover:text-[#1746A2] transition-colors">
                  {settings.planMensalName || 'Plano Mensal'}
                </h3>
                <div className="mt-4 mb-6">
                  <span className="text-3xl sm:text-4xl font-extrabold text-slate-950 font-mono-num tracking-tight">
                    {settings.planMensalPrice || '25.000'}&nbsp;Kz
                  </span>
                  <span className="text-xs text-slate-500 ml-1.5">
                    {settings.planMensalPeriod || '/ mês'}
                  </span>
                </div>
                {settings.planMensalDesc && (
                  <p className="text-xs text-slate-600 mb-6 leading-relaxed">
                    {settings.planMensalDesc}
                  </p>
                )}
                <ul className="space-y-3 text-xs sm:text-[13px] text-slate-700 mb-8">
                  {parseFeatures(settings.planMensalFeatures, [
                    '1 Posto de Trabalho Ativo',
                    'Faturação Certificada AGT com QR Code',
                    'Exportação SAF-T (AO) Mensal',
                    'Suporte Técnico em Horário Comercial'
                  ]).map((feat, i) => (
                    <li key={i} className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 text-slate-700" strokeWidth={2.5} />
                      </div>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => onOpenDemoModal(settings.planMensalName || 'Plano Mensal')}
                className="w-full py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs transition-all cursor-pointer"
              >
                {settings.planMensalCta || 'Aderir ao Plano Mensal'}
              </button>
            </div>

            {/* 2. Anual Comercial LAN (Destaque Executivo) */}
            <div className="surface-card p-8 flex flex-col justify-between relative ring-2 ring-slate-900 shadow-md bg-white">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {settings.planAnualCategory || 'Multi-Postos & Rede LAN'}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-white">
                    {settings.planAnualBadge || 'Mais Escolhido em Angola'}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-950 mt-1">
                  {settings.planAnualName || 'Plano Anual LAN'}
                </h3>
                <div className="mt-4 mb-3">
                  <span className="text-3xl sm:text-4xl font-extrabold text-slate-950 font-mono-num tracking-tight">
                    {settings.planAnualPrice || '250.000'}&nbsp;Kz
                  </span>
                  <span className="text-xs text-slate-500 ml-1.5">
                    {settings.planAnualPeriod || '/ ano'}
                  </span>
                </div>
                {settings.planAnualSavings && (
                  <div className="mb-4">
                    <span className="inline-flex items-center text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/60">
                      {settings.planAnualSavings}
                    </span>
                  </div>
                )}
                {settings.planAnualDesc && (
                  <p className="text-xs text-slate-600 mb-6 leading-relaxed">
                    {settings.planAnualDesc}
                  </p>
                )}
                <ul className="space-y-3 text-xs sm:text-[13px] text-slate-700 mb-8">
                  {parseFeatures(settings.planAnualFeatures, [
                    'Até 3 Postos em Rede LAN Incluídos',
                    'Módulos de Stock, POS e RH Integrados',
                    'Atualizações Fiscais AGT Garantidas',
                    'Suporte Prioritário por WhatsApp e Remoto'
                  ]).map((feat, i) => (
                    <li key={i} className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-md bg-blue-50 flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 text-[#1746A2]" strokeWidth={2.5} />
                      </div>
                      <span className={i === 0 ? 'font-bold text-slate-950' : ''}>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => onOpenDemoModal(settings.planAnualName || 'Plano Anual LAN')}
                className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-[#1746A2] text-white font-bold text-xs transition-all shadow-sm cursor-pointer"
              >
                {settings.planAnualCta || 'Contratar Plano Anual'}
              </button>
            </div>

            {/* 3. Licença Vitalícia */}
            <div className="surface-card p-8 flex flex-col justify-between group bg-white">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {settings.planVitalicioCategory || 'Pagamento Único'}
                </span>
                <h3 className="text-xl font-bold text-slate-950 mt-1 group-hover:text-[#1746A2] transition-colors">
                  {settings.planVitalicioName || 'Licença Vitalícia'}
                </h3>
                <div className="mt-4 mb-6">
                  <span className="text-3xl sm:text-4xl font-extrabold text-slate-950 font-mono-num tracking-tight">
                    {settings.planVitalicioPrice || '650.000'}&nbsp;Kz
                  </span>
                  <span className="text-xs text-slate-500 ml-1.5">
                    {settings.planVitalicioPeriod || 'taxa única'}
                  </span>
                </div>
                {settings.planVitalicioDesc && (
                  <p className="text-xs text-slate-600 mb-6 leading-relaxed">
                    {settings.planVitalicioDesc}
                  </p>
                )}
                <ul className="space-y-3 text-xs sm:text-[13px] text-slate-700 mb-8">
                  {parseFeatures(settings.planVitalicioFeatures, [
                    'Uso Perpétuo Sem Mensalidades',
                    'Servidor Principal + 5 Terminais LAN',
                    'Formação Presencial da Equipa em Luanda',
                    'Certificado de Licenciamento Definitivo'
                  ]).map((feat, i) => (
                    <li key={i} className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 text-slate-700" strokeWidth={2.5} />
                      </div>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => onOpenDemoModal(settings.planVitalicioName || 'Licença Vitalícia')}
                className="w-full py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs transition-all cursor-pointer"
              >
                {settings.planVitalicioCta || 'Solicitar Proposta Vitalícia'}
              </button>
            </div>

          </div>

          <div className="mt-12 text-center">
            <button
              onClick={() => onNavigatePage('planos')}
              className="text-xs sm:text-sm font-bold text-[#1746A2] hover:text-blue-800 inline-flex items-center gap-1.5 cursor-pointer bg-white hover:bg-slate-50 px-5 py-2.5 rounded-xl border border-slate-200 transition-all shadow-2xs"
            >
              <span>Ver comparativo detalhado e tabela completa</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ========== APOIO AO CLIENTE & CONSULTORIA EM ANGOLA ========== */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div data-reveal className="sr-init lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider">
              <Headphones className="w-3.5 h-3.5" />
              <span>Apoio Técnico em Luanda</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-extrabold text-slate-950 tracking-tight leading-tight">
              Acompanhamento dedicado à sua empresa
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              Não fica sozinho na transição digital do seu negócio. A nossa equipa de técnicos em Luanda realiza a instalação, configura os terminais em rede local e dá formação prática aos operadores de caixa.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {[
                { icon: <Headphones className="w-5 h-5" />, title: 'Atendimento 6 Dias / Semana', desc: 'Suporte telefónico e WhatsApp das 08h00 às 19h00.', color: 'bg-blue-50 text-[#1746A2]', hover: 'hover:border-blue-200' },
                { icon: <MapPin className="w-5 h-5" />, title: 'Deslocação Presencial', desc: 'Técnicos certificados para instalação e configuração LAN.', color: 'bg-emerald-50 text-emerald-700', hover: 'hover:border-emerald-200' },
                { icon: <ShieldCheck className="w-5 h-5" />, title: 'Garantia de Conformidade', desc: 'Atualizações fiscais AGT incluídas enquanto a licença estiver ativa.', color: 'bg-purple-50 text-purple-700', hover: 'hover:border-purple-200' },
                { icon: <Zap className="w-5 h-5" />, title: 'Resposta em 4 Horas', desc: 'Chamados urgentes tratados em até 4 horas úteis.', color: 'bg-amber-50 text-amber-700', hover: 'hover:border-amber-200' },
              ].map((f, i) => (
                <div key={i} className={`flex items-start gap-3 p-4 rounded-xl border border-slate-200/80 ${f.hover} hover:shadow-xs transition-all group/sup bg-white`}>
                  <div className={`w-10 h-10 rounded-xl ${f.color} flex items-center justify-center shrink-0`}>
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
                className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1EBE5B] text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl transition-all shadow-xs hover:-translate-y-0.5"
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
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative group">
              <img
                src={executivosImg}
                alt="Consultores e Gestores de TI Kivora Angola"
                className="w-full h-[380px] sm:h-[440px] object-cover"
              />
            </div>
          </div>

        </div>
      </section>

      {/* ========== CTA FINAL DE ALTA CONVERSÃO ========== */}
      <section className="py-24 bg-[#0B192C] text-white relative overflow-hidden">
        <div data-reveal className="sr-init max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-7 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-orange-300 text-xs font-bold uppercase tracking-wider">
            <span>Comece a Faturar Hoje Mesmo</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Modernize a faturação da sua empresa com segurança e conformidade AGT
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-normal">
            Descarregue o instalador gratuito do KIVORA (~48.5 MB) para Windows 10/11 e experimente todas as funcionalidades com a nossa chave de demonstração.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => onNavigatePage('download')}
              className="bg-[#FF6500] hover:bg-[#E05900] active:bg-[#C94A00] text-white font-bold text-sm px-9 py-4 rounded-xl transition-all shadow-sm flex items-center gap-2.5 cursor-pointer hover:-translate-y-0.5"
            >
              <Download className="w-5 h-5" />
              <span>Baixar KIVORA Setup (~48.5 MB)</span>
            </button>
            <button
              onClick={() => onOpenDemoModal()}
              className="bg-white/10 hover:bg-white/20 text-white font-bold text-sm px-8 py-4 rounded-xl border border-white/20 hover:border-white/30 transition-all flex items-center gap-2 cursor-pointer hover:-translate-y-0.5"
            >
              <span>Solicitar Demonstração VIP</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Social proof strip */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs text-slate-300">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Certificado AGT FE/440/AGT/2026</span>
            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> 15 Dias de Avaliação Gratuita</span>
            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> Sem Cartão de Crédito</span>
          </div>
        </div>
      </section>

    </div>
  );
};
