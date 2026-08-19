import React, { useState, useEffect } from 'react';
import { PageHero } from '../components/PageHero';
import {
  CheckCircle2, Download, Monitor, HardDrive, Cpu,
  ShieldCheck, Copy, Key, ArrowRight, HelpCircle,
  ExternalLink, GitBranch, Check
} from 'lucide-react';
import { PageId } from '../components/Header';
import {
  SystemCompanySettings, DEFAULT_SETTINGS,
  subscribeSystemSettings, getCachedSystemSettings,
  getDirectDownloadUrl
} from '../services/systemSettingsService';

import laptopImg from '../assets/kivora/pc-laptop-kivora.png';

import { triggerKivoraConfetti } from '../utils/confetti';

interface DownloadPageProps {
  onOpenDemoModal: (subject?: string) => void;
  onNavigatePage: (page: PageId) => void;
}

export const DownloadPage: React.FC<DownloadPageProps> = ({ onOpenDemoModal, onNavigatePage }) => {
  const [settings, setSettings] = useState<SystemCompanySettings>(() => getCachedSystemSettings());
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedChecksum, setCopiedChecksum] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState(false);

  useEffect(() => {
    const unsub = subscribeSystemSettings((newSettings) => {
      setSettings(newSettings);
    });
    return () => unsub();
  }, []);

  const cleanVersion = (settings.releaseVersion || DEFAULT_SETTINGS.releaseVersion).replace(/^v+/i, '');
  const activeFileSize = settings.fileSize || DEFAULT_SETTINGS.fileSize || '78.4 MB';
  const activeDemoKey = settings.demoKey || DEFAULT_SETTINGS.demoKey || 'KVRA-DEMO-2026-TRIAL';
  const activeChecksum = settings.sha256Checksum || DEFAULT_SETTINGS.sha256Checksum || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
  const activeReleaseDate = settings.releaseDate || DEFAULT_SETTINGS.releaseDate || '19 de Agosto de 2026';
  const activeAgtCert = settings.agtCertificate || DEFAULT_SETTINGS.agtCertificate || 'Certificação AGT n.º 384/AGT/2024';

  const handleCopyKey = () => {
    navigator.clipboard.writeText(activeDemoKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  const handleCopyChecksum = () => {
    navigator.clipboard.writeText(activeChecksum);
    setCopiedChecksum(true);
    setTimeout(() => setCopiedChecksum(false), 2500);
  };

  const handleStartDownload = () => {
    setDownloading(true);
    try {
      triggerKivoraConfetti();
    } catch {
      // ignore
    }
    const targetUrl = getDirectDownloadUrl(settings.downloadUrl || DEFAULT_SETTINGS.downloadUrl);

    setTimeout(() => {
      setDownloading(false);
      setDownloadComplete(true);

      if (targetUrl && targetUrl !== '#' && targetUrl !== '/') {
        const link = document.createElement('a');
        link.href = targetUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        const fileName = targetUrl.split('/').pop()?.split('?')[0] || `KIVORA_${cleanVersion}_x64-setup.exe`;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert('O link de download direto ainda não foi configurado no painel administrativo.');
      }
    }, 400);
  };

  const requirements = [
    { 
      icon: <Monitor className="w-4 h-4 text-blue-600" />, 
      label: 'Sistema Operativo', 
      val: settings.minOs || DEFAULT_SETTINGS.minOs || 'Windows 10 / 11 (64-bit)' 
    },
    { 
      icon: <Cpu className="w-4 h-4 text-blue-600" />, 
      label: 'Processador (CPU)', 
      val: settings.minCpu || DEFAULT_SETTINGS.minCpu || 'Intel Core i3 / AMD Ryzen 3 ou superior' 
    },
    { 
      icon: <HardDrive className="w-4 h-4 text-blue-600" />, 
      label: 'Memória RAM', 
      val: settings.minRam || DEFAULT_SETTINGS.minRam || '4 GB RAM (Recomendado 8 GB)' 
    },
    { 
      icon: <HardDrive className="w-4 h-4 text-blue-600" />, 
      label: 'Armazenamento', 
      val: settings.minStorage || DEFAULT_SETTINGS.minStorage || '2 GB livres em SSD (+ base de dados)' 
    },
  ];

  // Parse das notas de versão
  const rawReleaseNotes = settings.releaseNotes || DEFAULT_SETTINGS.releaseNotes || '';
  const releaseNotesList = rawReleaseNotes
    .split('\n')
    .map(line => line.trim().replace(/^[•\-\*]\s*/, ''))
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 page-enter">
      
      {/* Hero com imagem corporativa */}
      <PageHero
        image={laptopImg}
        tag="Distribuição Oficial de Software"
        title="Instale o KIVORA Desktop no Seu Computador"
        sub="Software executivo para Windows 10 e 11. Base de dados 100% local, emissão de faturas certificadas pela AGT e funcionamento sem internet."
      />

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
        
        {/* Painel Principal de Download (Design Clean & Corporativo) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-10 space-y-8">
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200/80 text-blue-800 text-xs font-bold tracking-tight">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>{activeAgtCert}</span>
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                  Versão Estável
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                Kivora ERP Desktop <span className="text-blue-700 font-mono">v{cleanVersion}</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Lançamento oficial: <span className="font-semibold text-slate-800">{activeReleaseDate}</span> • Arquitetura 64-bit
              </p>
            </div>

            {/* Ações Rápidas de Repositório */}
            {settings.githubUrl && (
              <a
                href={settings.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
              >
                <GitBranch className="w-3.5 h-3.5 text-slate-600" />
                <span>Repositório GitHub</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            )}
          </div>

          {/* CTA de Download */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            
            <div className="lg:col-span-2 space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  onClick={handleStartDownload}
                  disabled={downloading}
                  className="shimmer-button inline-flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] disabled:opacity-50 text-white font-bold text-sm sm:text-base px-7 py-3.5 rounded-xl shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                >
                  <Download className="w-5 h-5" />
                  <span>{downloading ? 'A preparar download...' : 'Baixar Instalador (.exe)'}</span>
                </button>

                {settings.githubUrl && (
                  <a
                    href={getDirectDownloadUrl(settings.downloadUrl || DEFAULT_SETTINGS.downloadUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs px-4 py-3 rounded-xl border border-slate-200 transition-colors"
                  >
                    <span>Download Direto Alternativo</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500">
                <span>Tamanho: <strong className="text-slate-800">{activeFileSize}</strong></span>
                <span>•</span>
                <span>Plataforma: <strong className="text-slate-800">Windows 10 / 11 (x64)</strong></span>
                <span>•</span>
                <span>Instalação: <strong className="text-slate-800">Autónoma</strong></span>
              </div>

              {downloadComplete && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Download iniciado com sucesso. Execute o ficheiro descarregado para iniciar a instalação.</span>
                </div>
              )}
            </div>

            {/* Cartão de Chave de Demonstração */}
            <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-blue-600" />
                  Chave de Demonstração
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">15 Dias</span>
              </div>
              <div className="flex items-center gap-2">
                <code className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 flex-1 truncate select-all">
                  {activeDemoKey}
                </code>
                <button
                  onClick={handleCopyKey}
                  className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                  title="Copiar chave de demonstração"
                >
                  {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey ? 'Copiada' : 'Copiar'}</span>
                </button>
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                Utilize esta chave para testar todas as funcionalidades do sistema no seu computador.
              </p>
            </div>

          </div>

        </div>

        {/* Requisitos Mínimos & Notas de Lançamento */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Requisitos Técnicos */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4">
            <div>
              <h3 className="text-base font-black text-slate-950">Requisitos do Sistema</h3>
              <p className="text-xs text-slate-500 mt-0.5">Especificações para execução local sem lentidão.</p>
            </div>

            <div className="space-y-2.5">
              {requirements.map((req, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-lg shrink-0">
                    {req.icon}
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">{req.label}</span>
                    <span className="text-xs font-bold text-slate-900 block truncate">{req.val}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notas de Lançamento (Changelog) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div>
                <h3 className="text-base font-black text-slate-950">Novidades da Versão v{cleanVersion}</h3>
                <p className="text-xs text-slate-500 mt-0.5">Recursos e conformidades implementadas nesta compilação:</p>
              </div>

              <ul className="space-y-2 text-xs text-slate-700">
                {releaseNotesList.length > 0 ? (
                  releaseNotesList.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-400 text-xs italic">Nenhuma nota configurada para esta versão.</li>
                )}
              </ul>
            </div>

            {/* Checksum SHA-256 */}
            <div className="pt-3 border-t border-slate-100 space-y-1">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <span>Assinatura Digital SHA-256</span>
                <button
                  onClick={handleCopyChecksum}
                  className="text-blue-600 hover:underline flex items-center gap-1 font-semibold normal-case cursor-pointer"
                >
                  {copiedChecksum ? 'Copiado!' : 'Copiar Hash'}
                </button>
              </div>
              <p className="font-mono text-[10px] bg-slate-50 p-2 rounded-lg border border-slate-200 text-slate-600 break-all select-all">
                {activeChecksum}
              </p>
            </div>
          </div>

        </div>

        {/* 3 Passos Simples de Instalação */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-lg font-black text-slate-950">Instalação em 3 Passos</h3>
            <p className="text-xs text-slate-500 mt-0.5">Processo guiado pelo assistente de configuração em minutos.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                1
              </div>
              <h4 className="font-bold text-slate-900 text-xs">Execute o Instalador</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Abra o ficheiro <code>.exe</code> descarregado e siga os passos do assistente de instalação no Windows.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                2
              </div>
              <h4 className="font-bold text-slate-900 text-xs">Introduza a Chave</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Insira a sua chave de demonstração ou a licença adquirida para inicializar a base de dados local.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                3
              </div>
              <h4 className="font-bold text-slate-900 text-xs">Comece a Faturar</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Configure os dados da sua empresa e comece a registar vendas e emitir faturas certificadas.
              </p>
            </div>
          </div>
        </div>

        {/* Rodapé de Assistência */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs text-xs">
          <div className="flex items-center gap-3 text-slate-700">
            <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Precisa de apoio na instalação ou aquisição de licenças comerciais?</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigatePage('suporte')}
              className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>Suporte Técnico</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <span className="text-slate-300">•</span>
            <button
              onClick={() => onOpenDemoModal('Pedido de Licença Comercial')}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              Pedir Licença
            </button>
          </div>
        </div>

      </section>

    </div>
  );
};


