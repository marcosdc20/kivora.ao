import React from 'react';
import { CURRENT_RELEASE, RELEASE_HISTORY, INSTALLATION_STEPS, LOCAL_DB_ARGUMENTS } from '../data/kivoraData';
import { Download, Monitor, HardDrive, Cpu, CheckCircle2, Database, WifiOff, Save, Key, FileCheck, Layers, HelpCircle } from 'lucide-react';

interface DownloadPageProps {
  onOpenDemoModal: (subject?: string) => void;
  onNavigatePage?: (page: any) => void;
}

export const DownloadPage: React.FC<DownloadPageProps> = ({ onOpenDemoModal }) => {
  const handleDownload = () => {
    alert(`O download do instalador KIVORA Setup (Versão ${CURRENT_RELEASE.version}) irá iniciar em instantes no seu navegador.`);
  };

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Download':
        return <Download className="w-5 h-5" strokeWidth={1.75} />;
      case 'HardDrive':
        return <HardDrive className="w-5 h-5" strokeWidth={1.75} />;
      case 'Settings':
        return <Layers className="w-5 h-5" strokeWidth={1.75} />;
      case 'Key':
        return <Key className="w-5 h-5" strokeWidth={1.75} />;
      case 'FileCheck':
        return <FileCheck className="w-5 h-5" strokeWidth={1.75} />;
      case 'Database':
        return <Database className="w-5 h-5 text-blue-600" strokeWidth={1.75} />;
      case 'Zap':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" strokeWidth={1.75} />;
      case 'WifiOff':
        return <WifiOff className="w-5 h-5 text-blue-600" strokeWidth={1.75} />;
      case 'Save':
        return <Save className="w-5 h-5 text-slate-700" strokeWidth={1.75} />;
      default:
        return <Download className="w-5 h-5" strokeWidth={1.75} />;
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 pt-28 pb-20 selection:bg-blue-600 selection:text-white page-transition-enter">
      
      {/* 1. Hero Download Section */}
      <section className="bg-slate-50 border-b border-slate-200/80 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Download Card & Title */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-50 border border-blue-200/70 rounded-full text-xs font-semibold text-blue-800">
                <Monitor className="w-4 h-4 text-blue-600 shrink-0" strokeWidth={1.75} />
                <span>KIVORA para Windows • Versão {CURRENT_RELEASE.version}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight leading-tight">
                Descarregue o KIVORA Setup para o Seu Computador
              </h1>

              <p className="text-slate-700 text-sm sm:text-base leading-relaxed max-w-xl mx-auto lg:mx-0">
                Instale o KIVORA no computador da sua empresa e tenha a sua gestão disponível localmente, com velocidade instantânea e sem depender de conetividade constante.
              </p>

              {/* Download Action Box */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 max-w-lg mx-auto lg:mx-0">
                <button
                  onClick={handleDownload}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-base hover:shadow-lg active:scale-98"
                >
                  <Download className="w-5 h-5" strokeWidth={1.75} />
                  <span>Baixar KIVORA Setup Agora</span>
                </button>

                {/* Metadata Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-semibold text-slate-600 pt-3 border-t border-slate-100">
                  <div>
                    <span className="block text-slate-400 font-normal text-[10px]">Versão:</span>
                    <strong className="text-slate-900">{CURRENT_RELEASE.version}</strong>
                  </div>
                  <div>
                    <span className="block text-slate-400 font-normal text-[10px]">Sistema:</span>
                    <strong className="text-slate-900">Win 10/11</strong>
                  </div>
                  <div>
                    <span className="block text-slate-400 font-normal text-[10px]">Arquitetura:</span>
                    <strong className="text-slate-900">{CURRENT_RELEASE.architecture}</strong>
                  </div>
                  <div>
                    <span className="block text-slate-400 font-normal text-[10px]">Tamanho:</span>
                    <strong className="text-slate-900">{CURRENT_RELEASE.fileSize}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Official Package Disk Art */}
            <div className="lg:col-span-5 flex items-center justify-center">
              <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xl max-w-sm">
                <img
                  src="/imagens/pacote-de-instalação-com-disco.png"
                  alt="Kivora Software Package Installer"
                  className="w-full h-auto object-contain"
                />
                <div className="text-center pt-3 space-y-1">
                  <strong className="block text-xs font-bold text-slate-900">Instalador Desktop Oficial</strong>
                  <span className="block text-[11px] text-slate-500">Base de dados SQLite / PostgreSQL Local</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Como Funciona (01-05 Steps) */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className="text-blue-700 font-bold text-xs uppercase tracking-wider bg-blue-50 px-3.5 py-1 rounded-full border border-blue-200/70">
            Passo a Passo
          </span>
          <h2 className="text-3xl font-extrabold text-slate-950 tracking-tight">
            Como Funciona a Instalação e Ativação
          </h2>
          <p className="text-slate-600 text-sm">
            Do download ao primeiro recibo emitido em menos de 5 minutos.
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
                    {renderIcon(step.icon)}
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

      {/* 3. Base de Dados Local (Commercial Highlights) */}
      <section className="bg-slate-50 border-y border-slate-200/80 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-blue-700 font-bold text-xs uppercase tracking-wider bg-blue-50 px-3.5 py-1 rounded-full border border-blue-200/70">
              Privacidade & Velocidade
            </span>
            <h2 className="text-3xl font-extrabold text-slate-950 tracking-tight">
              Os Seus Dados Permanecem no Seu Computador
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              O KIVORA foi concebido para funcionar localmente, permitindo realizar as principais operações comerciais mesmo quando não existe ligação à Internet.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {LOCAL_DB_ARGUMENTS.map((arg, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3"
              >
                <div className="p-3 bg-slate-100 rounded-xl w-fit">
                  {renderIcon(arg.icon)}
                </div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {arg.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {arg.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Requisitos do Sistema & Histórico de Versões */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* System Requirements */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <span className="text-blue-700 font-bold text-xs uppercase tracking-wider">Requisitos do Computador</span>
              <h3 className="text-2xl font-extrabold text-slate-950">Especificações Técnicas</h3>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
              <div className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <Monitor className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" strokeWidth={1.75} />
                <div>
                  <strong className="text-slate-950 block text-sm font-bold">Sistema Operativo:</strong>
                  <span className="text-slate-700">Windows 10, Windows 11 ou Windows Server 2019/2022 (64-bits)</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <Cpu className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" strokeWidth={1.75} />
                <div>
                  <strong className="text-slate-950 block text-sm font-bold">Processador & Memória RAM:</strong>
                  <span className="text-slate-700">Intel Core i3 / AMD Ryzen 3 ou superior com 4 GB de Memória RAM (8 GB recomendado para servidor de rede LAN)</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <HardDrive className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" strokeWidth={1.75} />
                <div>
                  <strong className="text-slate-950 block text-sm font-bold">Espaço em Disco:</strong>
                  <span className="text-slate-700">Pelo menos 500 MB de espaço livre para o programa e a base de dados local</span>
                </div>
              </div>
            </div>
          </div>

          {/* Release History */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <span className="text-blue-700 font-bold text-xs uppercase tracking-wider">Notas de Versão</span>
              <h3 className="text-2xl font-extrabold text-slate-950">Histórico de Atualizações</h3>
            </div>

            <div className="space-y-4">
              {RELEASE_HISTORY.map((rel, rIdx) => (
                <div key={rIdx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-950 text-sm">Versão {rel.version}</span>
                    <span className="text-xs text-slate-500 font-semibold">{rel.date}</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {rel.changelog.map((change, cIdx) => (
                      <li key={cIdx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                        <span>{change}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* 5. CTA Footer */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl font-extrabold tracking-tight">
            Precisa de Auxílio na Instalação do KIVORA?
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            A equipa técnica da Visual Software em Luanda presta suporte presencial e remoto para a instalação do Setup e configuração das suas impressoras térmicas.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleDownload}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm px-8 py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" strokeWidth={1.75} />
              <span>Baixar KIVORA Setup</span>
            </button>
            <button
              onClick={() => onOpenDemoModal('Auxílio de Instalação')}
              className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm px-7 py-3.5 rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2"
            >
              <HelpCircle className="w-4 h-4 text-slate-400" strokeWidth={1.75} />
              <span>Solicitar Apoio na Instalação</span>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
