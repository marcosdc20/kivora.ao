import React, { useEffect } from 'react';
import { PageHero } from '../components/PageHero';
import { CheckCircle2, Download, Monitor, HardDrive, Cpu, ArrowRight } from 'lucide-react';
import { PageId } from '../components/Header';

interface DownloadPageProps {
  onOpenDemoModal: (subject?: string) => void;
  onNavigatePage: (page: PageId) => void;
}

function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]');
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('sr-visible') && obs.unobserve(e.target)),
      { threshold: 0.1 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

export const DownloadPage: React.FC<DownloadPageProps> = ({ onOpenDemoModal, onNavigatePage }) => {
  useScrollReveal();

  const requirements = [
    { icon: <Monitor className="w-5 h-5" />, label: 'Sistema Operativo', val: 'Windows 10 / 11 (64-bit)' },
    { icon: <Cpu className="w-5 h-5" />, label: 'Processador', val: 'Intel Core i3 / AMD Ryzen 3 (ou superior)' },
    { icon: <HardDrive className="w-5 h-5" />, label: 'RAM', val: 'Mínimo 4 GB (recomendado 8 GB)' },
    { icon: <HardDrive className="w-5 h-5" />, label: 'Espaço em Disco', val: '2 GB livres (+ espaço para base de dados)' },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 page-enter">
      
      {/* Hero com imagem */}
      <div className="pt-16">
        <PageHero
          image="/imagens/pacote-de-instalação-com-disco.png"
          tag="Download Gratuito"
          title="KIVORA Desktop para Windows"
          sub="Instale o sistema de gestão e faturação da sua empresa. Base de dados 100% local, sem mensalidades escondidas."
        />
      </div>

      {/* Download Box Principal */}
      <section className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-16 py-20">
        <div
          data-reveal
          className="sr-init bg-slate-950 text-white rounded-3xl p-10 sm:p-14 flex flex-col md:flex-row items-center gap-10"
        >
          <div className="flex-1 space-y-4">
            <span className="text-blue-400 text-xs font-bold uppercase tracking-widest">Versão Atual</span>
            <h2 className="text-3xl font-black leading-tight">
              KIVORA ERP <br />
              <span className="text-blue-400">v2026.08</span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Inclui faturação eletrónica AGT DS.120, IRT 2026, POS de balcão, gestão de stock e módulo RH.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {['AGT DS.120', 'IRT 2026', 'SAF-T Angola', 'Offline-First'].map((tag) => (
                <span key={tag} className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/20">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <a
              href="#"
              className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-base px-8 py-4 rounded-2xl shadow-2xl shadow-blue-600/40 transition-all hover:-translate-y-0.5 hover:shadow-blue-500/50 w-full sm:w-auto justify-center"
            >
              <Download className="w-5 h-5" strokeWidth={2} />
              <span>Baixar Setup (.exe)</span>
            </a>
            <span className="text-slate-500 text-xs">≈ 48,5 MB — Windows 10/11 64-bit</span>
            <button
              onClick={() => onOpenDemoModal('Pedido de Licença')}
              className="text-slate-400 hover:text-white text-xs font-medium transition-colors flex items-center gap-1.5 group"
            >
              <span>Preciso de licença corporativa</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Requisitos do Sistema */}
      <section className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-16 pb-20">
        <div data-reveal className="sr-init mb-10">
          <h3 className="text-2xl font-black text-slate-950">Requisitos do Sistema</h3>
          <p className="text-slate-500 text-sm mt-1">Compatível com a maioria dos computadores com Windows 10 ou superior.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {requirements.map((req, i) => (
            <div
              key={i}
              data-reveal
              className="sr-init bg-slate-50 border border-slate-200 rounded-2xl p-5 flex items-center gap-4"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-blue-600 shadow-sm shrink-0">
                {req.icon}
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">{req.label}</span>
                <span className="text-sm font-semibold text-slate-900">{req.val}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Passos de instalação */}
      <section className="bg-slate-950 text-white py-20 px-6 sm:px-10 lg:px-16">
        <div className="max-w-5xl mx-auto">
          <div data-reveal className="sr-init text-center mb-12">
            <h3 className="text-3xl font-black">Instalação em 3 passos</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { n: '01', title: 'Execute o Setup.exe', desc: 'Dê dois cliques no ficheiro descarregado e siga o assistente de instalação.' },
              { n: '02', title: 'Configure a Empresa', desc: 'Introduza o NIF, nome da empresa e dados fiscais no primeiro arranque.' },
              { n: '03', title: 'Ative a Licença', desc: 'Insira a chave de ativação recebida por email após a compra.' },
            ].map((step, i) => (
              <div key={i} data-reveal className="sr-init space-y-3" style={{ transitionDelay: `${i * 120}ms` }}>
                <span className="text-5xl font-black text-slate-800">{step.n}</span>
                <h4 className="text-base font-bold text-white">{step.title}</h4>
                <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          <div data-reveal className="sr-init mt-12 flex flex-wrap gap-4">
            <button
              onClick={() => onNavigatePage('recursos')}
              className="inline-flex items-center gap-2 text-slate-300 hover:text-white text-sm font-semibold transition-colors group"
            >
              <span>Ver guia completo de instalação</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* O que está incluído */}
      <section className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-16 py-20">
        <div data-reveal className="sr-init mb-10">
          <h3 className="text-2xl font-black text-slate-950">O que está incluído</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            'Faturação Eletrónica com QR Code AGT DS.120',
            'POS de Balcão com impressão térmica',
            'Gestão de Stock e Armazém Multidepósito',
            'Módulo de Recursos Humanos e IRT 2026',
            'Contabilidade e exportação SAF-T Angola',
            'Relatórios e dashboards de gestão',
            'Rede Local multi-postos incluída',
            'Suporte técnico por 12 meses',
          ].map((feat, i) => (
            <div key={i} data-reveal className="sr-init flex items-center gap-3 py-3 border-b border-slate-100 last:border-0" style={{ transitionDelay: `${i * 50}ms` }}>
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" strokeWidth={2} />
              <span className="text-sm text-slate-700 font-medium">{feat}</span>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
