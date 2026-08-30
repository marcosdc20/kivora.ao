import React, { useState, useEffect, useRef } from 'react';
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
import { useScrollReveal } from '../hooks/useScrollReveal';

interface DownloadPageProps {
  onOpenDemoModal: (subject?: string) => void;
  onNavigatePage: (page: PageId) => void;
}

export const DownloadPage: React.FC<DownloadPageProps> = ({ onOpenDemoModal, onNavigatePage }) => {
  const pageRef = useRef<HTMLDivElement>(null);
  const [settings, setSettings] = useState<SystemCompanySettings>(() => getCachedSystemSettings());
  useScrollReveal(pageRef, [settings]);
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
  const activeAgtCert = settings.agtCertificate || DEFAULT_SETTINGS.agtCertificate || 'Certificação AGT N.º FE/440/AGT/2026';

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
    <div ref={pageRef} className="min-h-screen bg-slate-50 text-slate-900 page-enter">
      
      {/* Hero com imagem corporativa */}
      <PageHero
        image={laptopImg}
        tag="Distribuição Oficial de Software"
        title="Instale o KIVORA Desktop no Seu Computador"
        sub="Software executivo para Windows 10 e 11. Base de dados 100% local, emissão de faturas certificadas pela AGT e funcionamento sem internet."
      />

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
        
        {/* Painel Principal de Download (Design Clean & Corporativo) */}
        <div data-reveal className="bg-mesh-dark rounded-3xl p-6 sm:p-10 space-y-8 text-white relative overflow-hidden">
          <div className="orb orb-blue w-80 h-80 -top-20 -left-20" />
          <div className="orb orb-purple w-48 h-48 -bottom-10 -right-10" />
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-white/15 relative z-10">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 border border-white/20 text-white text-xs font-bold tracking-tight">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{activeAgtCert}</span>
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold font-mono-num">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
                  Versão Estável
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                KIVORA ERP Desktop <span className="text-blue-300 font-mono-num">v{cleanVersion}</span>
              </h2>
              <p className="text-sm text-slate-300">
                Lançamento oficial: <span className="font-bold text-white">{activeReleaseDate}</span> • Arquitetura 64-bit Windows
              </p>
            </div>

            {/* Ações Rápidas de Repositório */}
            {settings.githubUrl && (
              <a
                href={settings.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all"
              >
                <GitBranch className="w-3.5 h-3.5" />
                <span>Repositório Oficial</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            )}
          </div>

          {/* CTA de Download */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center relative z-10">
            
            <div className="lg:col-span-2 space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  onClick={handleStartDownload}
                  disabled={downloading}
                  className="bg-[#FF6500] hover:bg-[#EB5B00] disabled:opacity-50 text-white font-bold text-sm sm:text-base px-8 py-4 rounded-2xl cursor-pointer inline-flex items-center justify-center gap-3 shimmer-button shadow-xl shadow-orange-600/40 transition-all hover:-translate-y-1"
                >
                  <Download className="w-5 h-5" strokeWidth={2.25} />
                  <span>{downloading ? 'A preparar download...' : 'Baixar Instalador Oficial (.exe)'}</span>
                </button>

                {settings.githubUrl && (
                  <a
                    href={getDirectDownloadUrl(settings.downloadUrl || DEFAULT_SETTINGS.downloadUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 text-xs px-5 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all"
                  >
                    <span>Download Direto</span>
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-300">
                <span>Tamanho: <strong className="text-white font-mono-num">{activeFileSize}</strong></span>
                <span>•</span>
                <span>Plataforma: <strong className="text-white">Windows 10 / 11 (x64)</strong></span>
                <span>•</span>
                <span>Instalação: <strong className="text-white">Autónoma & Guiada</strong></span>
              </div>

              {downloadComplete && (
                <div className="p-3.5 bg-emerald-500/20 border border-emerald-400/30 rounded-2xl text-emerald-300 text-xs font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Download iniciado com sucesso. Execute o instalador descarregado para configurar o sistema.</span>
                </div>
              )}
            </div>

            {/* Cartão de Chave de Demonstração */}
            <div className="bg-white/8 border border-white/15 rounded-2xl p-5 space-y-3 relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-blue-400" />
                  Chave de Avaliação
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 font-mono-num">15 Dias VIP</span>
              </div>
              <div className="flex items-center gap-2">
                <code className="bg-slate-900/60 border border-white/15 rounded-xl px-3 py-2 text-xs font-mono-num font-bold text-white flex-1 truncate select-all">
                  {activeDemoKey}
                </code>
                <button
                  onClick={handleCopyKey}
                  className="px-3.5 py-2 bg-blue-500/30 hover:bg-blue-500/50 text-blue-200 border border-blue-400/30 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
                  title="Copiar chave de demonstração"
                >
                  {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey ? 'Copiada' : 'Copiar'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Utilize esta chave para testar todos os módulos do KIVORA sem limites durante o período de demonstração.
              </p>
            </div>

          </div>

        </div>

        {/* Requisitos Mínimos & Notas de Lançamento */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Requisitos Técnicos */}
          <div data-reveal data-reveal-dir="left" className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4">
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
          <div data-reveal data-reveal-dir="right" className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4 flex flex-col justify-between">
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
        <div data-reveal className="bg-mesh border border-slate-200/80 rounded-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-32 h-32 orb orb-blue opacity-20" />
          <div className="relative z-10">
            <h3 className="text-lg font-black text-slate-950">Instalação em 3 Passos</h3>
            <p className="text-xs text-slate-500 mt-0.5">Processo guiado pelo assistente de configuração em minutos.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
            {[
              { step: '1', title: 'Execute o Instalador', desc: 'Abra o ficheiro .exe descarregado e siga os passos do assistente de instalação no Windows.', color: 'bg-blue-600 shadow-blue-600/30' },
              { step: '2', title: 'Introduza a Chave', desc: 'Insira a sua chave de demonstração ou a licença adquirida para inicializar a base de dados local.', color: 'bg-emerald-600 shadow-emerald-600/30' },
              { step: '3', title: 'Comece a Faturar', desc: 'Configure os dados da sua empresa e comece a registar vendas e emitir faturas certificadas.', color: 'bg-orange-500 shadow-orange-500/30' },
            ].map((s, idx) => (
              <div key={idx} data-reveal data-delay={`${(idx + 1) * 100}`} className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-3 hover:shadow-md hover:-translate-y-1 transition-all group">
                <div className={`w-8 h-8 rounded-xl ${s.color} text-white font-black text-sm flex items-center justify-center shadow-lg`}>
                  {s.step}
                </div>
                <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">{s.title}</h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Rodapé de Assistência */}
        <div data-reveal className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs text-xs">
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


