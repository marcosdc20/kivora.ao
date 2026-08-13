import React, { useEffect, useRef } from 'react';
import { HeroCarousel } from '../components/HeroCarousel';
import { CheckCircle2, ArrowRight, Download, Shield, Wifi, Zap } from 'lucide-react';
import { PageId } from '../components/Header';

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
                  src="/imagens/pacote-de-instalação-com-disco.png"
                  alt="KIVORA Instalação Local"
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
                  src="/imagens/servidor.png"
                  alt="Rede Local KIVORA"
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
