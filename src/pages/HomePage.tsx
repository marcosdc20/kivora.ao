import React, { useState, useEffect } from 'react';
import { Hero } from '../components/Hero';
import { KIVORA_MODULES, KIVORA_FAQS, LOCAL_DB_ARGUMENTS, INSTALLATION_STEPS, CURRENT_RELEASE } from '../data/kivoraData';
import { KivoraModule } from '../types/kivora';
import { ShieldCheck, ArrowRight, CheckCircle2, ChevronDown, ChevronUp, Download, Monitor, Network, HardDrive, FileCheck, ArrowUpRight, Layers } from 'lucide-react';

interface HomePageProps {
  onSelectModule: (module: KivoraModule) => void;
  onOpenDemoModal: (moduleTitle?: string) => void;
  onNavigatePage: (page: any) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onSelectModule,
  onOpenDemoModal,
  onNavigatePage,
}) => {
  const [openFaqId, setOpenFaqId] = useState<string | null>('faq-1');

  // Scroll reveal observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-active');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    const elements = document.querySelectorAll('.reveal-init');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const toggleFaq = (id: string) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  const getStepIcon = (iconName: string) => {
    switch (iconName) {
      case 'Download':
        return <Download className="w-5 h-5" strokeWidth={1.75} />;
      case 'HardDrive':
        return <HardDrive className="w-5 h-5" strokeWidth={1.75} />;
      case 'Settings':
        return <Layers className="w-5 h-5" strokeWidth={1.75} />;
      case 'Key':
        return <ShieldCheck className="w-5 h-5" strokeWidth={1.75} />;
      case 'FileCheck':
        return <FileCheck className="w-5 h-5" strokeWidth={1.75} />;
      default:
        return <Download className="w-5 h-5" strokeWidth={1.75} />;
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-600 selection:text-white page-transition-enter">
      
      {/* 1. HERO SECTION WITH CINEMA CAROUSEL */}
      <Hero
        onOpenDemoModal={() => onOpenDemoModal()}
        onNavigatePage={onNavigatePage}
      />

      {/* 2. BARRA DE CONFORMIDADE AGT & REGULAÇÃO FISCAL */}
      <section id="conformidade-agt" className="bg-slate-50 border-y border-slate-200/80 py-12 reveal-init">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-8 flex items-start gap-4">
              <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-sm text-blue-600 shrink-0">
                <ShieldCheck className="w-8 h-8" strokeWidth={1.75} />
              </div>
              <div className="space-y-1">
                <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200/60">
                  Software Certificado AGT nº XXX/AGT/2026
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight">
                  Totalmente Conforme o Decreto Presidencial n.º 71/25 e Especificação DS.120
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Garante a assinatura criptográfica RS256, numeração sequencial inviolável de séries, código QR oficial e geração do ficheiro mensal auditável SAF-T (AO).
                </p>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-end">
              <button
                onClick={() => onNavigatePage('download')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Download className="w-4 h-4" strokeWidth={1.75} />
                <span>Baixar KIVORA Setup</span>
              </button>

              <button
                onClick={() => onNavigatePage('recursos')}
                className="w-full bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold px-5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <span>Ver Guia SAF-T AGT</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" strokeWidth={1.75} />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* 3. FLUXO DE 5 PASSOS (01 - 05) */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 reveal-init">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-blue-700 font-bold text-xs uppercase tracking-wider bg-blue-50 px-3.5 py-1 rounded-full border border-blue-200/70">
            Fluxo de Instalação e Utilização
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
            Como Funciona o KIVORA na Sua Empresa
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Sem complexidades ou dependência de terceiros: instale o programa, configure os dados do seu negócio e comece a faturar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {INSTALLATION_STEPS.map((step) => (
            <div
              key={step.stepNumber}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:border-blue-500/50 hover:shadow-md transition-all group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-blue-600 font-mono">
                    {step.stepNumber}
                  </span>
                  <div className="p-2 bg-slate-100 text-slate-700 rounded-xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    {getStepIcon(step.icon)}
                  </div>
                </div>

                <h3 className="text-base font-extrabold text-slate-900">
                  {step.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. ARQUITETURA: BASE DE DADOS LOCAL & MODO REDE LAN */}
      <section className="bg-slate-50 border-y border-slate-200/80 py-20 reveal-init">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-blue-700 font-bold text-xs uppercase tracking-wider bg-blue-50 px-3.5 py-1 rounded-full border border-blue-200/70">
              Arquitetura Robusta & Segura
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              Os Seus Dados Ficam na Sua Empresa
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              O KIVORA foi desenvolvido para funcionar localmente, permitindo realizar as principais operações comerciais com alta velocidade e sem depender de conetividade externa.
            </p>
          </div>

          {/* Side by side comparison: PC Único vs Rede LAN with Package Images */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Box 1: Modo PC Único (Standalone) */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-6 hover:shadow-md transition-all">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider bg-slate-100 px-3 py-1 rounded-lg">
                    <Monitor className="w-4 h-4 text-blue-600" strokeWidth={1.75} />
                    <span>Modo PC Único (Standalone)</span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500">Pequenas Lojas</span>
                </div>

                <h3 className="text-2xl font-extrabold text-slate-950">
                  Instalação Direta no Computador de Venda
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Para estabelecimentos que necessitam de 1 posto de atendimento ou faturação. O KIVORA e a sua base de dados operam de forma autónoma no disco do computador.
                </p>

                {/* Package Disk Image Display */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-center">
                  <img
                    src="/imagens/pacote-de-instalação-com-disco.png"
                    alt="Kivora Instalação com Disco"
                    className="max-h-44 object-contain"
                  />
                </div>

                <ul className="space-y-2 text-xs text-slate-700 font-medium">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" strokeWidth={1.75} />
                    <span>Setup ultra-rápido em menos de 2 minutos</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" strokeWidth={1.75} />
                    <span>Sem necessidade de cabos de rede ou servidores dedicados</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" strokeWidth={1.75} />
                    <span>Cópias de segurança instantâneas para Pen Drive USB</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={() => onNavigatePage('download')}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <Download className="w-4 h-4" strokeWidth={1.75} />
                  <span>Baixar KIVORA para 1 Computador</span>
                </button>
              </div>
            </div>

            {/* Box 2: Modo Rede Local (LAN Multi-Postos) */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-6 hover:shadow-md transition-all">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-lg border border-blue-200/70">
                    <Network className="w-4 h-4 text-blue-600" strokeWidth={1.75} />
                    <span>Modo Rede Local / LAN Multi-Postos</span>
                  </div>
                  <span className="text-[11px] font-semibold text-blue-600 font-bold">Empresas & Supermercados</span>
                </div>

                <h3 className="text-2xl font-extrabold text-slate-950">
                  Vários Computadores Interligados à Mesma Base de Dados
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Interligue o PC Servidor aos postos de Caixa de atendimento, Gabinete de Gerência, Escritório de Administração e Armazém na rede interna.
                </p>

                {/* Server Package Image Display */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-center">
                  <img
                    src="/imagens/servidor.png"
                    alt="Kivora Servidor em Rede Local"
                    className="max-h-44 object-contain"
                  />
                </div>

                <ul className="space-y-2 text-xs text-slate-700 font-medium">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" strokeWidth={1.75} />
                    <span>Atualização de stock e vendas em tempo real em todos os caixas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" strokeWidth={1.75} />
                    <span>Permissões diferenciadas por operador, caixa e gerente</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" strokeWidth={1.75} />
                    <span>Operação contínua na rede local mesmo sem internet externa</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={() => onNavigatePage('solucoes')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <Network className="w-4 h-4" strokeWidth={1.75} />
                  <span>Ver Como Funciona a Rede Local</span>
                </button>
              </div>
            </div>

          </div>

          {/* 4 Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
            {LOCAL_DB_ARGUMENTS.map((arg, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3"
              >
                <h4 className="text-sm font-extrabold text-slate-900">
                  {arg.title}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {arg.description}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 5. MÓDULOS DE GESTÃO DO ERP KIVORA */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 reveal-init">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-4">
          <div className="space-y-2">
            <span className="text-blue-700 font-bold text-xs uppercase tracking-wider bg-blue-50 px-3.5 py-1 rounded-full border border-blue-200/70">
              Catálogo de Módulos
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              Funcionalidades Especialistas do KIVORA
            </h2>
          </div>
          <button
            onClick={() => onNavigatePage('funcionalidades')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 transition-colors"
          >
            <span>Ver especificações técnicas completas</span>
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {KIVORA_MODULES.map((moduleItem) => (
            <div
              key={moduleItem.id}
              className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-500/50 hover:shadow-md transition-all flex flex-col justify-between space-y-6 group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg">
                    {moduleItem.badge || 'Módulo Kivora'}
                  </span>
                </div>

                <h3 className="text-lg font-extrabold text-slate-950 group-hover:text-blue-600 transition-colors">
                  {moduleItem.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {moduleItem.shortDesc}
                </p>

                <ul className="space-y-2 pt-2 text-xs text-slate-700">
                  {moduleItem.features.slice(0, 3).map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" strokeWidth={1.75} />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => onSelectModule(moduleItem)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                >
                  <span>Ver módulo em detalhe</span>
                  <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.75} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. PERGUNTAS FREQUENTES (FAQ) */}
      <section className="bg-slate-50 border-t border-slate-200/80 py-20 reveal-init">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-2">
            <span className="text-blue-700 font-bold text-xs uppercase tracking-wider bg-blue-50 px-3.5 py-1 rounded-full border border-blue-200/70">
              Esclarecimentos
            </span>
            <h2 className="text-3xl font-extrabold text-slate-950 tracking-tight">
              Perguntas Frequentes sobre o Software KIVORA
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Tire as suas dúvidas sobre instalação local, rede, licenças e conformidade fiscal.
            </p>
          </div>

          <div className="space-y-3">
            {KIVORA_FAQS.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all"
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-950 hover:text-blue-600 transition-colors"
                  >
                    <span>{faq.question}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-blue-600 shrink-0" strokeWidth={1.75} />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" strokeWidth={1.75} />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs text-slate-700 leading-relaxed border-t border-slate-100">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 7. BANNER FINAL CTA COM IMAGEM DO PACOTE */}
      <section className="bg-slate-900 text-white py-16 reveal-init">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-8 space-y-4 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-semibold">
                <Download className="w-3.5 h-3.5" strokeWidth={1.75} />
                <span>KIVORA Setup v{CURRENT_RELEASE.version} para Windows</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Pronto para Instalar o KIVORA no Computador da Sua Empresa?
              </h2>

              <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Descarregue o instalador ou solicite auxílio da nossa equipa técnica em Luanda para a instalação e ativação da licença do seu estabelecimento.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                <button
                  onClick={() => onNavigatePage('download')}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm px-8 py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" strokeWidth={1.75} />
                  <span>Baixar KIVORA Setup</span>
                </button>
                <button
                  onClick={() => onOpenDemoModal('Solicitação Geral')}
                  className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm px-7 py-3.5 rounded-xl border border-slate-700 transition-all"
                >
                  <span>Pedir Demonstração Presencial</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-4 flex items-center justify-center">
              <img
                src="/imagens/pacote.png"
                alt="Kivora Software Package"
                className="max-h-56 object-contain drop-shadow-2xl"
              />
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};
