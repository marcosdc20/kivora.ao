import React, { useState, useEffect } from 'react';
import { PageHero } from '../components/PageHero';
import {
  CheckCircle2, Download, Monitor, HardDrive, Cpu,
  ShieldCheck, Copy, Key, ArrowRight, HelpCircle,
  ExternalLink, GitBranch
} from 'lucide-react';
import { PageId } from '../components/Header';
import {
  SystemCompanySettings, DEFAULT_SETTINGS,
  subscribeSystemSettings, getCachedSystemSettings,
  getDirectDownloadUrl
} from '../services/systemSettingsService';

import laptopImg from '../assets/kivora/pc-laptop-kivora.png';

interface DownloadPageProps {
  onOpenDemoModal: (subject?: string) => void;
  onNavigatePage: (page: PageId) => void;
}

export const DownloadPage: React.FC<DownloadPageProps> = ({ onOpenDemoModal, onNavigatePage }) => {
  const [settings, setSettings] = useState<SystemCompanySettings>(() => getCachedSystemSettings());
  const [copiedKey, setCopiedKey] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState(false);

  useEffect(() => {
    const unsub = subscribeSystemSettings((newSettings) => {
      setSettings(newSettings);
    });
    return () => unsub();
  }, []);

  const demoKey = 'KVRA-DEMO-2026-TRIAL';
  const sha256Checksum = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

  const handleCopyKey = () => {
    navigator.clipboard.writeText(demoKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  const handleStartDownload = () => {
    setDownloading(true);
    const targetUrl = getDirectDownloadUrl(settings.downloadUrl || DEFAULT_SETTINGS.downloadUrl);

    setTimeout(() => {
      setDownloading(false);
      setDownloadComplete(true);

      if (targetUrl && targetUrl !== '#' && targetUrl !== '/') {
        // Criar disparo de download direto do executável
        const link = document.createElement('a');
        link.href = targetUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        const fileName = targetUrl.split('/').pop()?.split('?')[0] || `KIVORA_${settings.releaseVersion || '1.1.0'}_x64-setup.exe`;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert('O link de download direto ainda não foi configurado. Pode aceder ao repositório no GitHub ou contactar o suporte.');
      }
    }, 600);
  };

  const requirements = [
    { icon: <Monitor className="w-5 h-5" />, label: 'Sistema Operativo', val: 'Windows 10 / 11 (64-bit)' },
    { icon: <Cpu className="w-5 h-5" />, label: 'Processador Mínimo', val: 'Intel Core i3 / AMD Ryzen 3 (ou superior)' },
    { icon: <HardDrive className="w-5 h-5" />, label: 'Memória RAM', val: 'Mínimo 4 GB (recomendado 8 GB)' },
    { icon: <HardDrive className="w-5 h-5" />, label: 'Espaço em Disco', val: '2 GB livres em SSD (+ base de dados)' },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 page-enter">
      
      {/* Hero com imagem do Laptop KIVORA */}
      <PageHero
        image={laptopImg}
        tag="Centro Oficial de Downloads"
        title="Instale o KIVORA Desktop no Seu Computador"
        sub="Software executivo para Windows 10 e 11. Base de dados 100% local, emissão de faturas certificadas pela AGT e funcionamento sem internet."
      />

      {/* Download Box Principal */}
      <section className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-16 py-16 sm:py-20 space-y-12">
        
        <div className="bg-slate-950 text-white rounded-3xl p-8 sm:p-14 flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl border border-slate-800 relative overflow-hidden">
          
          {/* Badge Decorativo de Fundo */}
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex-1 space-y-5 relative z-10 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Certificação AGT n.º 384/AGT/2024</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black leading-tight">
              KIVORA ERP Desktop <br />
              <span className="text-blue-400">Versão v{settings.releaseVersion || '1.1.0'}</span>
            </h2>

            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-lg">
              Pacote completo com Instalador Autónomo, Motor de Base de Dados Local, Módulo de Faturação AGT DS.120, POS de Balcão e Tabelas IRT 2026. Lançamento: {settings.releaseDate || '17 de Agosto de 2026'}.
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
              {['AGT DS.120', 'IRT 2026', 'SAF-T Angola', 'Offline-First', 'Rede LAN'].map((tag) => (
                <span key={tag} className="text-[11px] font-semibold px-3 py-1 rounded-full bg-slate-900 text-slate-300 border border-slate-800">
                  {tag}
                </span>
              ))}
            </div>

            {settings.githubUrl && (
              <div className="pt-2 flex items-center justify-center md:justify-start">
                <a
                  href={settings.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-400 transition-colors"
                >
                  <GitBranch className="w-3.5 h-3.5" />
                  <span>Código & Releases Oficiais no GitHub</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-3 relative z-10 w-full md:w-auto">
            <button
              onClick={handleStartDownload}
              disabled={downloading}
              className="inline-flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black text-base px-8 py-4 rounded-2xl shadow-xl shadow-blue-600/40 transition-all hover:-translate-y-0.5 w-full sm:w-auto cursor-pointer"
            >
              <Download className="w-5 h-5" strokeWidth={2} />
              <span>{downloading ? 'A preparar download...' : 'Baixar Instalador (.exe)'}</span>
            </button>

            {settings.githubUrl && (
              <a
                href={getDirectDownloadUrl(settings.downloadUrl || DEFAULT_SETTINGS.downloadUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 py-1"
              >
                <span>Link direto alternativo</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}

            <div className="text-center text-xs text-slate-400 space-y-1">
              <p>≈ 48,5 MB • Windows 10/11 (64-bit)</p>
              {downloadComplete && (
                <span className="text-emerald-400 font-bold block animate-fadeIn">
                  ✓ Download iniciado! Execute o ficheiro descarregado.
                </span>
              )}
            </div>
          </div>

        </div>

        {/* Chave de Teste Demonstrativa Gratuita (15 Dias) */}
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-slate-900 font-black text-sm">
              <Key className="w-4 h-4 text-blue-600" />
              <span>Chave de Demonstração & Avaliação (15 Dias Grátis)</span>
            </div>
            <p className="text-xs text-slate-600">
              Copie a chave abaixo para ativar o software após a instalação e testar todas as funcionalidades.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-center">
            <div className="bg-white border border-slate-300 px-4 py-2.5 rounded-xl font-mono font-black text-xs sm:text-sm text-blue-900 tracking-wider">
              {demoKey}
            </div>
            <button
              onClick={handleCopyKey}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedKey ? 'Copiada!' : 'Copiar Chave'}</span>
            </button>
          </div>
        </div>

        {/* Verificação de Integridade & Requisitos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Requisitos do Sistema */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div>
              <h3 className="text-lg font-black text-slate-950">Requisitos Mínimos do Sistema</h3>
              <p className="text-xs text-slate-500 mt-0.5">Compatível com qualquer computador ou portátil moderno.</p>
            </div>

            <div className="space-y-3">
              {requirements.map((req, i) => (
                <div key={i} className="flex items-center gap-3.5 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-blue-600 shadow-2xs shrink-0">
                    {req.icon}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">{req.label}</span>
                    <span className="text-xs font-bold text-slate-900">{req.val}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notas de Lançamento & Integridade */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-black text-slate-950">Notas de Lançamento (v2026.08)</h3>
                <p className="text-xs text-slate-500 mt-0.5">Novidades e conformidades da última versão estável:</p>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Emissão de faturas com assinatura criptográfica RSA-2048 e QR Code homologado AGT.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Novos escalões de Retenção na Fonte e IRT 2026 integrados no processamento salarial.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Suporte a impressoras térmicas USB/Ethernet e abertura automática de gaveta RJ11.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Novo assistente de exportação e pré-validação do ficheiro SAF-T (AO).</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-100 text-[10px] text-slate-400 space-y-1">
              <span className="font-bold text-slate-600 uppercase tracking-wider block">Assinatura Digital SHA-256:</span>
              <p className="font-mono bg-slate-50 p-2 rounded-lg border border-slate-200 break-all select-all">
                {sha256Checksum}
              </p>
            </div>
          </div>

        </div>

        {/* Passos de Instalação */}
        <div className="bg-slate-950 text-white rounded-3xl p-8 sm:p-12 space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h3 className="text-2xl font-black">Como Instalar em 3 Minutos</h3>
            <p className="text-xs text-slate-400">Processo simples e totalmente guiado pelo assistente.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black">1</div>
              <h4 className="font-black text-white text-sm">Execute o Setup</h4>
              <p className="text-slate-400 leading-relaxed">
                Abra o instalador descarregado e siga as instruções no ecrã. O sistema instala todos os componentes automaticamente.
              </p>
            </div>

            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black">2</div>
              <h4 className="font-black text-white text-sm">Ative a Chave</h4>
              <p className="text-slate-400 leading-relaxed">
                Introduza a chave de teste ou a sua chave definitiva adquirida para desbloquear a base de dados local.
              </p>
            </div>

            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black">3</div>
              <h4 className="font-black text-white text-sm">Comece a Faturar</h4>
              <p className="text-slate-400 leading-relaxed">
                Configure os dados da sua empresa (NIF e morada) e emita faturas legais de imediato no balcão.
              </p>
            </div>
          </div>
        </div>

        {/* Banner de Ajuda & Licenciamento */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-slate-50 border border-slate-200 rounded-3xl text-xs">
          <div className="flex items-center gap-3 text-slate-700">
            <HelpCircle className="w-5 h-5 text-blue-600 shrink-0" />
            <span>Precisa de assistência técnica na instalação ou aquisição de licença definitiva?</span>
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
              className="bg-slate-950 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
            >
              Pedir Licença
            </button>
          </div>
        </div>

      </section>

    </div>
  );
};

