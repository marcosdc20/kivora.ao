import React, { useEffect, useRef } from 'react';
import { HeroCarousel } from '../components/HeroCarousel';
import { CheckCircle2, ArrowRight, Download, Shield, Wifi, Zap, Monitor, Laptop, Check, Sparkles, Award, Headphones } from 'lucide-react';
import { PageId } from '../components/Header';

import posImg from '../assets/kivora/pc-pos-kivora.png';
import desktopImg from '../assets/kivora/pc-descktop-kivora.png';
import laptopImg from '../assets/kivora/pc-laptop-kivora.png';
import empresariaTabletImg from '../assets/kivora/jovem-empresaria-com-tablet.png';
import empresarioBoasVindasImg from '../assets/kivora/jovem-empresario-dado-boas-vindas.png';
import parceirosImg from '../assets/kivora/parceiros-kivora.png';
import executivosImg from '../assets/kivora/executivos-kivora.jpg';
import supermercadoImg from '../assets/kivora/supermercado-kivora.jpg';

interface HomePageProps {
  onSelectModule: (module: any) => void;
  onOpenDemoModal: (subject?: string) => void;
  onNavigatePage: (page: PageId) => void;
}

// Função para configurar as animações de scroll (IntersectionObserver nativo)
function useScrollReveal() {
  useEffect(() => {
    const elements = document.querySelectorAll('[data-reveal]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('sr-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

// Card de feature da homepage
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
  delay?: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, desc, delay = 0 }) => (
  <div
    data-reveal
    className="sr-init bg-white border border-slate-200/80 rounded-3xl p-8 flex flex-col gap-4 hover:border-blue-500/40 hover:shadow-lg transition-all duration-300 group"
    style={{ transitionDelay: `${delay}ms` }}
  >
    <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
      {icon}
    </div>
    <div>
      <h3 className="text-base font-bold text-slate-950 mb-1.5">{title}</h3>
      <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
    </div>
  </div>
);

// Etapa do fluxo de instalação
interface StepProps {
  num: string;
  title: string;
  desc: string;
  delay?: number;
}

const Step: React.FC<StepProps> = ({ num, title, desc, delay = 0 }) => (
  <div
    data-reveal
    className="sr-init flex flex-col items-center text-center"
    style={{ transitionDelay: `${delay}ms` }}
  >
    <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-slate-950 text-white font-black text-xl mb-4">
      {num}
    </div>
    <h4 className="text-sm font-bold text-slate-900 mb-1">{title}</h4>
    <p className="text-xs text-slate-500 leading-relaxed max-w-[150px]">{desc}</p>
  </div>
);

export const HomePage: React.FC<HomePageProps> = ({
  onOpenDemoModal,
  onNavigatePage,
}) => {
  useScrollReveal();
  const sectionsRef = useRef<HTMLDivElement>(null);

  return (
    <div className="bg-white text-slate-900">
      
      {/* ========== HERO — 3 slides full screen ========== */}
      <HeroCarousel
        onNavigatePage={onNavigatePage}
        onOpenDemoModal={onOpenDemoModal}
      />

      {/* ========== BARRA DE CONFIANÇA ========== */}
      <div data-reveal className="sr-init bg-slate-950 text-white py-5">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="flex flex-wrap items-center justify-center md:justify-between gap-6 text-xs font-semibold text-slate-400 uppercase tracking-widest">
            <span className="text-white font-bold">Usado por empresas em Angola</span>
            <div className="flex flex-wrap items-center gap-8">
              <span className="flex items-center gap-2"><Shield className="w-3.5 h-3.5 text-blue-400" strokeWidth={2} /> Certificado AGT</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" strokeWidth={2} /> DS.120 Compliant</span>
              <span className="flex items-center gap-2"><Wifi className="w-3.5 h-3.5 text-blue-400" strokeWidth={2} /> Funciona Offline</span>
              <span className="flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-amber-400" strokeWidth={2} /> IRT 2026 Incluído</span>
            </div>
          </div>
        </div>
      </div>

      <div ref={sectionsRef}>

        {/* ========== COMO FUNCIONA — 5 Passos ========== */}
        <section className="py-24 px-6 sm:px-10 lg:px-16 max-w-7xl mx-auto">
          <div data-reveal className="sr-init text-center mb-16">
            <span className="text-blue-600 font-bold text-xs uppercase tracking-widest">Instalação Simples</span>
            <h2 className="mt-3 text-4xl sm:text-5xl font-black text-slate-950 tracking-tight">
              Em 5 passos, está a faturar.
            </h2>
          </div>

          <div className="flex flex-wrap items-start justify-center gap-y-12 gap-x-4 md:gap-x-10 relative">
            {/* Linha conectora (decorativa) */}
            <div className="absolute top-7 left-[10%] right-[10%] h-[1px] bg-slate-200 hidden lg:block" />

            <Step num="01" title="Escolha a Licença" desc="Selecione o plano ideal no nosso site" delay={0} />
            <Step num="02" title="Baixe o Instalador" desc="Descarregue o Setup.exe (~48 MB)" delay={100} />
            <Step num="03" title="Instale no PC" desc="Instalação rápida em menos de 2 min" delay={200} />
            <Step num="04" title="Configure a Empresa" desc="Introduza o seu NIF e dados fiscais" delay={300} />
            <Step num="05" title="Comece a Faturar" desc="Emita a primeira fatura eletrónica" delay={400} />
          </div>

          <div data-reveal className="sr-init mt-12 text-center">
            <button
              onClick={() => onNavigatePage('download')}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-8 py-4 rounded-2xl shadow-lg shadow-blue-600/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-600/30"
            >
              <Download className="w-4 h-4" strokeWidth={2} />
              <span>Baixar KIVORA Setup — Grátis</span>
            </button>
          </div>
        </section>

        {/* ========== FEATURES — 3 CARDS ========== */}
        <section className="py-20 px-6 sm:px-10 lg:px-16 max-w-7xl mx-auto">
          <div data-reveal className="sr-init mb-12">
            <span className="text-blue-600 font-bold text-xs uppercase tracking-widest">Principais Funcionalidades</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-black text-slate-950 tracking-tight max-w-lg leading-tight">
              Tudo o que a sua empresa precisa, num único sistema.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Shield className="w-5 h-5" strokeWidth={1.75} />}
              title="Faturação Eletrónica AGT"
              desc="Fatura com QR Code, assinatura digital RS256 e conformidade total com o DS.120. Comunicação automática com o portal da AGT."
              delay={0}
            />
            <FeatureCard
              icon={<Zap className="w-5 h-5" strokeWidth={1.75} />}
              title="POS de Balcão Rápido"
              desc="Interface de venda otimizada para velocidade, suporte a talão térmico, multi-caixa e fecho de turno sem falhas."
              delay={100}
            />
            <FeatureCard
              icon={<Wifi className="w-5 h-5" strokeWidth={1.75} />}
              title="Rede Local — Sem Internet"
              desc="Liga múltiplos postos de trabalho em rede LAN. A sua base de dados fica 100% dentro da empresa, sem depender de nuvem."
              delay={200}
            />
          </div>

          {/* ========== SEÇÃO MULTI-DISPOSITIVOS: POS, DESKTOP E LAPTOP ========== */}
          <div data-reveal className="sr-init mt-20 pt-16 border-t border-slate-100">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-blue-600 font-bold text-xs uppercase tracking-widest">Flexibilidade Total de Hardware</span>
              <h3 className="mt-2 text-3xl font-black text-slate-950 tracking-tight">
                Instale em Qualquer Computador da Sua Empresa
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                O KIVORA foi desenvolvido para correr de forma nativa e ultra-rápida no Windows em três formatos de postos de trabalho:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* 1. POS TOUCH */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-6 flex flex-col justify-between hover:border-blue-500/50 hover:shadow-xl transition-all duration-300 group">
                <div>
                  <div className="aspect-[4/3] bg-white rounded-2xl p-4 border border-slate-200/60 mb-5 flex items-center justify-center overflow-hidden">
                    <img
                      src={posImg}
                      alt="Terminal Touch POS KIVORA"
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 font-bold text-[11px] mb-2">
                    <Monitor className="w-3 h-3" />
                    Terminal Touch POS
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mb-1">Caixas Rápidos & Restauração</h4>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    Interface tátil de toque direto para supermercados, padarias e restaurantes. Emite talões e comanda mesas num piscar de olhos.
                  </p>
                </div>
                <div className="space-y-1.5 text-xs text-slate-700 pt-3 border-t border-slate-200/60">
                  <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Compatível com ecrã 15.6" Touch</div>
                  <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Impressão Térmica 80mm com QR Code</div>
                </div>
              </div>

              {/* 2. DESKTOP */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-6 flex flex-col justify-between hover:border-blue-500/50 hover:shadow-xl transition-all duration-300 group">
                <div>
                  <div className="aspect-[4/3] bg-white rounded-2xl p-4 border border-slate-200/60 mb-5 flex items-center justify-center overflow-hidden">
                    <img
                      src={desktopImg}
                      alt="Computador Desktop KIVORA"
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[11px] mb-2">
                    <Monitor className="w-3 h-3" />
                    Computador Desktop
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mb-1">Escritório & Rede Local LAN</h4>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    Ideal para estações de backoffice, contabilidade, gestão de armazém e servidor central multi-postos em rede interna.
                  </p>
                </div>
                <div className="space-y-1.5 text-xs text-slate-700 pt-3 border-t border-slate-200/60">
                  <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Multi-utilizadores com permissões</div>
                  <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Exportação SAF-T AO e Mapas Fiscais</div>
                </div>
              </div>

              {/* 3. LAPTOP */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-6 flex flex-col justify-between hover:border-blue-500/50 hover:shadow-xl transition-all duration-300 group">
                <div>
                  <div className="aspect-[4/3] bg-white rounded-2xl p-4 border border-slate-200/60 mb-5 flex items-center justify-center overflow-hidden">
                    <img
                      src={laptopImg}
                      alt="Portátil Laptop KIVORA"
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 font-bold text-[11px] mb-2">
                    <Laptop className="w-3 h-3" />
                    Portátil / Laptop
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mb-1">Gestores & Vendas em Mobilidade</h4>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    Perfeito para gerentes, consultores e equipas de vendas em viagem. Funciona 100% offline onde quer que vá.
                  </p>
                </div>
                <div className="space-y-1.5 text-xs text-slate-700 pt-3 border-t border-slate-200/60">
                  <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Windows 10 e 11 nativo</div>
                  <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Leve, rápido e sem mensalidades</div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ========== SHOWCASE — Imagem Grande + Texto ========== */}
        <section className="py-24 bg-slate-950">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            
            {/* Texto */}
            <div data-reveal className="sr-init space-y-6">
              <span className="text-blue-400 font-bold text-xs uppercase tracking-widest">Base de Dados Local</span>
              <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                Os seus dados ficam<br />sempre na sua empresa.
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed max-w-md">
                O KIVORA não envia os dados da sua empresa para servidores externos. A base de dados fica instalada no seu próprio computador ou servidor local, garantindo total privacidade e controlo.
              </p>
              <ul className="space-y-3 text-sm">
                {[
                  'Funciona mesmo sem internet',
                  'Cópia de segurança para Pen USB',
                  'Migração e restauro simples',
                  'Dados protegidos contra ransomware externo',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" strokeWidth={2} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => onNavigatePage('solucoes')}
                className="inline-flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm px-6 py-3 rounded-xl transition-all hover:-translate-y-0.5"
              >
                <span>Ver arquitetura de rede</span>
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>

            {/* Imagem */}
            <div data-reveal className="sr-init sr-right">
              <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                <img
                  src={supermercadoImg}
                  alt="Operação de Caixa Kivora no Retalho"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>

          </div>
        </section>

        {/* ========== REDE LAN — Showcase invertido ========== */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            
            {/* Imagem primeiro no mobile, segundo no desktop */}
            <div data-reveal className="sr-init sr-left order-2 lg:order-1">
              <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-xl">
                <img
                  src={executivosImg}
                  alt="Gestão de Empresas e Contabilidade Kivora"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>

            {/* Texto */}
            <div data-reveal className="sr-init order-1 lg:order-2 space-y-6">
              <span className="text-blue-600 font-bold text-xs uppercase tracking-widest">Rede Local — Multi-Postos</span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-950 leading-tight">
                Uma rede inteira de caixas,<br />a trabalhar em simultâneo.
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed max-w-md">
                Ligue o computador principal como servidor e conecte caixas, gerência e armazém na mesma rede local. Dados partilhados em milissegundos, sem depender de internet.
              </p>
              <button
                onClick={() => onNavigatePage('solucoes')}
                className="inline-flex items-center gap-2 bg-slate-950 hover:bg-slate-800 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all hover:-translate-y-0.5"
              >
                <span>Ver Soluções de Rede</span>
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>

          </div>
        </section>

        {/* ========== SEÇÃO 1 (ÁREA BRANCA): JOVEM EMPRESÁRIA COM TABLET ========== */}
        <section className="py-14 sm:py-20 lg:py-24 bg-white border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Texto */}
            <div data-reveal className="sr-init lg:col-span-6 space-y-4 sm:space-y-6">
              <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                Gestão Moderna & Mobilidade Empresarial
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-slate-950 leading-tight">
                O Seu Negócio Sob Controlo em Qualquer Lugar
              </h2>

              <p className="text-slate-600 text-xs sm:text-sm lg:text-base leading-relaxed">
                Acompanhe o desempenho das suas vendas, fechos de caixa e movimentações de stock com relatórios gerenciais claros e em tempo real. O <strong>KIVORA ERP</strong> foi desenhado para simplificar a vida dos gestores em Angola.
              </p>

              <div className="space-y-2.5 sm:space-y-3 pt-2">
                {[
                  'Acompanhe múltiplos postos de trabalho e filiais',
                  'Fecho de turno de caixas sem divergências',
                  'Relatórios financeiros e mapas fiscais instantâneos',
                  'Conformidade total com a AGT e Decreto Presidencial n.º 71/25',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 sm:pt-4 flex items-center gap-4">
                <button
                  onClick={() => onNavigatePage('solucoes')}
                  className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs sm:text-sm px-6 sm:px-7 py-3 sm:py-3.5 rounded-2xl shadow-lg shadow-blue-600/25 transition-all hover:-translate-y-0.5 cursor-pointer w-full sm:w-auto"
                >
                  <span>Conhecer Todas as Soluções</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Imagem Limpa em Fundo Branco (Sem sombras artificiais) */}
            <div data-reveal className="sr-init sr-right lg:col-span-6 flex items-center justify-center">
              <div className="w-full max-w-xs sm:max-w-md lg:max-w-lg">
                <img
                  src={empresariaTabletImg}
                  alt="Jovem Empresária com Tablet KIVORA ERP"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-auto max-h-[320px] sm:max-h-[440px] lg:max-h-[520px] object-contain"
                />
              </div>
            </div>

          </div>
        </section>

        {/* ========== SEÇÃO 2 (FUNDO AZUL ESCURO): JOVEM EMPRESÁRIO / CONSULTORIA & BOAS-VINDAS ========== */}
        <section className="py-14 sm:py-20 lg:py-24 bg-slate-950 text-white border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Imagem Limpa na Esquerda sobre o fundo azul escuro */}
            <div data-reveal className="sr-init sr-left lg:col-span-6 flex items-center justify-center order-2 lg:order-1">
              <div className="w-full max-w-xs sm:max-w-md lg:max-w-lg flex items-center justify-center">
                <img
                  src={empresarioBoasVindasImg}
                  alt="Consultor KIVORA ERP"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-auto max-h-[320px] sm:max-h-[440px] lg:max-h-[540px] object-contain select-none pointer-events-none"
                />
              </div>
            </div>

            {/* Texto na Direita */}
            <div data-reveal className="sr-init lg:col-span-6 space-y-6 order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                <Headphones className="w-3.5 h-3.5" />
                Consultoria e Suporte Local em Angola
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
                Estamos Prontos Para Ajudar a Sua Empresa a Crescer
              </h2>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Não fica sozinho na implementação do seu sistema de faturação. A nossa equipa técnica sediada em Luanda presta acompanhamento presencial, configuração de rede local e formação completa para a sua equipa.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <p className="font-bold text-white text-xs sm:text-sm mb-1">Apoio Presencial & Remoto</p>
                  <p className="text-[11px] text-slate-400">Técnicos especializados disponíveis 6 dias por semana via WhatsApp e chamadas.</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <p className="font-bold text-white text-xs sm:text-sm mb-1">Formação de Operadores</p>
                  <p className="text-[11px] text-slate-400">Treinamos os seus caixas e gerentes para faturar sem erros desde o primeiro dia.</p>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-4">
                <button
                  onClick={() => onOpenDemoModal('Consultoria Geral')}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm px-7 py-3.5 rounded-2xl shadow-lg shadow-blue-600/30 transition-all hover:-translate-y-0.5 cursor-pointer"
                >
                  <span>Agendar Demonstração VIP</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* ========== SEÇÃO 3 (ÁREA BRANCA): PROGRAMA DE PARCEIROS ========== */}
        <section className="py-14 sm:py-20 lg:py-24 bg-white border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Texto */}
            <div data-reveal className="sr-init lg:col-span-6 space-y-4 sm:space-y-6">
              <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                <Award className="w-3.5 h-3.5" />
                Canais de Distribuição & Revenda
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-slate-950 leading-tight">
                Seja Parceiro Certificado KIVORA na Sua Província
              </h2>

              <p className="text-slate-600 text-xs sm:text-sm lg:text-base leading-relaxed">
                Junte-se à maior rede de distribuição de software certificado em Angola. Compre licenças a preço de atacado, defina a sua margem de lucro e emita certificados oficiais aos seus clientes.
              </p>

              <div className="space-y-2.5 sm:space-y-3 pt-2">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Portal exclusivo com emissão instantânea de licenças 24/7</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Certificado oficial de revenda e kit comercial completo</span>
                </div>
              </div>

              <div className="pt-3 sm:pt-4 flex items-center gap-4">
                <button
                  onClick={() => onNavigatePage('parceiros')}
                  className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-black text-xs sm:text-sm px-6 sm:px-7 py-3 sm:py-3.5 rounded-2xl shadow-lg shadow-amber-500/20 transition-all hover:-translate-y-0.5 cursor-pointer w-full sm:w-auto"
                >
                  <span>Conhecer Programa de Parceiros</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Imagem Limpa em Fundo Branco */}
            <div data-reveal className="sr-init sr-right lg:col-span-6 flex items-center justify-center">
              <div className="w-full max-w-xs sm:max-w-md lg:max-w-lg">
                <img
                  src={parceirosImg}
                  alt="Parceiros KIVORA ERP em Angola"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-auto max-h-[320px] sm:max-h-[440px] lg:max-h-[500px] object-contain"
                />
              </div>
            </div>

          </div>
        </section>

        {/* ========== CTA FINAL ========== */}
        <section className="py-28 px-6 sm:px-10 lg:px-16 bg-blue-600">
          <div data-reveal className="sr-init max-w-3xl mx-auto text-center text-white space-y-6">
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
              Pronto para modernizar<br />a gestão da sua empresa?
            </h2>
            <p className="text-blue-100 text-sm sm:text-base leading-relaxed max-w-lg mx-auto">
              Baixe agora o KIVORA e comece a emitir faturas eletrónicas em conformidade com a AGT.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <button
                onClick={() => onNavigatePage('download')}
                className="inline-flex items-center gap-2 bg-white hover:bg-blue-50 text-blue-600 font-black text-sm px-8 py-4 rounded-2xl shadow-xl transition-all hover:-translate-y-0.5"
              >
                <Download className="w-4 h-4" strokeWidth={2} />
                <span>Baixar KIVORA Setup</span>
              </button>
              <button
                onClick={() => onOpenDemoModal()}
                className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm px-7 py-4 rounded-2xl transition-all hover:-translate-y-0.5"
              >
                <span>Falar com Consultor</span>
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};
