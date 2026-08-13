import React from 'react';
import { Monitor, Network, CheckCircle2, ArrowRight, Server, Download } from 'lucide-react';

interface SolucoesPageProps {
  onOpenDemoModal: (subject?: string) => void;
  onNavigatePage: (page: any) => void;
}

export const SolucoesPage: React.FC<SolucoesPageProps> = ({ onOpenDemoModal, onNavigatePage }) => {
  return (
    <div className="min-h-screen bg-white text-slate-900 pt-28 pb-20 selection:bg-blue-600 selection:text-white page-transition-enter">
      
      {/* Header Banner */}
      <section className="bg-slate-50 border-b border-slate-200/80 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <span className="text-blue-700 font-bold text-xs uppercase tracking-wider bg-blue-50 px-3.5 py-1 rounded-full border border-blue-200/70">
            Arquitetura & Instalação Local
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-950 tracking-tight">
            Soluções de Gestão em Modo Standalone e Rede LAN
          </h1>
          <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Seja para um único computador de balcão ou para uma rede inteira de caixas e escritórios interligados, o KIVORA adapta-se perfeitamente à sua estrutura.
          </p>
        </div>
      </section>

      {/* 1. Modo PC Único vs Modo Rede Local (LAN) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        
        {/* Modo PC Único */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-4">
            <div className="inline-flex items-center gap-2 text-blue-700 font-bold text-xs uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-lg border border-blue-200/70">
              <Monitor className="w-4 h-4 text-blue-600" strokeWidth={1.75} />
              <span>Modo PC Único (Standalone)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950">
              Ideal para Lojas, Consultórios e Escritórios de 1 Posto
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              No Modo Standalone, o KIVORA é instalado no seu computador de trabalho. O software armazena a base de dados no próprio disco rígido do PC, funcionando com velocidade máxima e total independência de sinal de internet.
            </p>
            <ul className="space-y-2.5 text-xs text-slate-700 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" strokeWidth={1.75} />
                <span>Instalação simples e direta em menos de 2 minutos</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" strokeWidth={1.75} />
                <span>Sem necessidade de infraestrutura de rede ou servidores dedicados</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" strokeWidth={1.75} />
                <span>Copias de segurança locais rápidas para Pen Drive USB</span>
              </li>
            </ul>

            <div className="pt-2">
              <button
                onClick={() => onNavigatePage('download')}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors inline-flex items-center gap-2"
              >
                <Download className="w-3.5 h-3.5" strokeWidth={1.75} />
                <span>Baixar Instalador Standalone</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center space-y-4">
            <img
              src="/imagens/pacote-de-instalação-com-disco.png"
              alt="Instalador Kivora Local"
              className="max-h-56 mx-auto object-contain drop-shadow-md"
            />
            <div className="p-3 bg-white rounded-xl border border-slate-200 max-w-xs mx-auto shadow-sm">
              <strong className="block text-slate-900 text-xs font-bold">COMPUTADOR DA EMPRESA</strong>
              <span className="text-[11px] text-slate-500 block">KIVORA + Base de Dados Local</span>
            </div>
          </div>
        </div>

        {/* Modo Rede Local / LAN */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-6 order-2 lg:order-1 bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center space-y-4">
            <img
              src="/imagens/servidor.png"
              alt="Kivora Servidor LAN"
              className="max-h-52 mx-auto object-contain drop-shadow-md"
            />

            {/* Architecture Flow Diagram */}
            <div className="space-y-2 font-mono text-xs max-w-sm mx-auto">
              <div className="p-3 bg-slate-900 text-white rounded-xl border border-slate-800 shadow-md">
                <Server className="w-5 h-5 text-blue-400 mx-auto mb-1" strokeWidth={1.75} />
                <strong className="block text-white text-xs">PC PRINCIPAL (SERVIDOR LOCAL)</strong>
                <span className="text-[10px] text-slate-300 block">Base de Dados Central</span>
              </div>

              <div className="text-slate-400 font-bold text-[10px] uppercase tracking-widest py-0.5">
                │ REDE LOCAL / LAN │
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-sm">
                  <Monitor className="w-4 h-4 text-blue-600 mx-auto" strokeWidth={1.75} />
                  <span className="font-bold text-slate-900 block text-[10px]">PC Caixa</span>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-sm">
                  <Monitor className="w-4 h-4 text-blue-600 mx-auto" strokeWidth={1.75} />
                  <span className="font-bold text-slate-900 block text-[10px]">PC Gerência</span>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-sm">
                  <Monitor className="w-4 h-4 text-blue-600 mx-auto" strokeWidth={1.75} />
                  <span className="font-bold text-slate-900 block text-[10px]">PC Armazém</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 order-1 lg:order-2 space-y-4">
            <div className="inline-flex items-center gap-2 text-blue-700 font-bold text-xs uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-lg border border-blue-200/70">
              <Network className="w-4 h-4 text-blue-600" strokeWidth={1.75} />
              <span>Modo Rede Local / LAN Multi-Postos</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950">
              Ligue Múltiplos Computadores à Mesma Base de Dados
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Para empresas com frentes de caixa e gabinetes administrativos separados, o KIVORA permite trabalhar em rede local sem precisar enviar dados para servidores externos na nuvem.
            </p>
            <ul className="space-y-2.5 text-xs text-slate-700 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" strokeWidth={1.75} />
                <span>Atualização de stock e fechos de caixa em milissegundos</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" strokeWidth={1.75} />
                <span>Controlo de permissões rigoroso por utilizador e posto</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" strokeWidth={1.75} />
                <span>Independência total de quebras de conetividade externa</span>
              </li>
            </ul>

            <div className="pt-2">
              <button
                onClick={() => onOpenDemoModal('Configuração em Rede Local')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors shadow-sm inline-flex items-center gap-2"
              >
                <span>Falar com Técnico de Redes</span>
                <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} />
              </button>
            </div>
          </div>

        </div>

      </section>

      {/* CTA Section */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl font-extrabold tracking-tight">
            Precisa de Apoio na Instalação em Rede Local?
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            Os engenheiros de sistemas da Visual Software configuram o seu servidor, os pontos de venda e as impressoras térmicas presencialmente ou por acesso remoto.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onNavigatePage('download')}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm px-8 py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <span>Baixar KIVORA Setup</span>
              <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
            </button>
            <button
              onClick={() => onOpenDemoModal('Apoio Técnico de Rede')}
              className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm px-7 py-3.5 rounded-xl border border-slate-700 transition-all"
            >
              <span>Solicitar Orçamento de Instalação</span>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
