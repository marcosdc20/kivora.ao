import React, { useState } from 'react';
import { Monitor, Download, Copy, LogOut } from 'lucide-react';
import { CURRENT_RELEASE } from '../data/kivoraData';

interface AreaClientePageProps {
  onNavigatePage: (page: any) => void;
}

export const AreaClientePage: React.FC<AreaClientePageProps> = ({ onNavigatePage }) => {
  const [copiedKey, setCopiedKey] = useState(false);

  const clientLicense = {
    company: 'VISUAL COMÉRCIO, LDA',
    nif: '5412398765',
    licenseType: 'Professional (Anual em Rede)',
    status: 'ATIVA',
    licenseKey: 'KV2026-987A-432B-8910-KIVORA',
    validUntil: '13/08/2027',
    computersAllowed: 3,
    computersActive: 2,
    activeDevices: [
      { name: 'PC-CAIXA-01', ip: '192.168.1.102', activatedAt: '15/01/2026' },
      { name: 'PC-GERENCIA-MAIN', ip: '192.168.1.100 (Servidor Local)', activatedAt: '15/01/2026' },
    ],
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(clientLicense.licenseKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pt-28 pb-20 selection:bg-blue-600 selection:text-white">
      
      {/* Header Banner */}
      <section className="bg-white border-b border-slate-200 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Área do Cliente • Minha Conta</span>
            <h1 className="text-2xl font-extrabold text-slate-900">{clientLicense.company}</h1>
            <p className="text-xs text-slate-500">NIF: {clientLicense.nif} • Licença de Software KIVORA</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigatePage('download')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar Setup</span>
            </button>
            <button
              onClick={() => onNavigatePage('login')}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-400" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Account Portal Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        
        {/* License Summary Card */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Estado da Licença</span>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <strong className="text-emerald-600 text-base font-extrabold">{clientLicense.status}</strong>
            </div>
            <span className="text-[11px] text-slate-500 block">Tipo: {clientLicense.licenseType}</span>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Chave de Ativação (License Key)</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
                {clientLicense.licenseKey}
              </span>
              <button
                onClick={handleCopyKey}
                className="p-1.5 text-slate-500 hover:text-blue-600 rounded bg-slate-50 hover:bg-blue-50 transition-colors"
                title="Copiar Chave"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            {copiedKey && <span className="text-[10px] text-emerald-600 font-bold block">Chave copiada!</span>}
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Validade da Licença</span>
            <strong className="text-slate-900 text-base font-extrabold block">{clientLicense.validUntil}</strong>
            <span className="text-[11px] text-slate-500 block">Renovação anual</span>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Computadores Ativados</span>
            <strong className="text-slate-900 text-base font-extrabold block">
              {clientLicense.computersActive} / {clientLicense.computersAllowed} Postos
            </strong>
            <span className="text-[11px] text-slate-500 block">1 Posto disponível</span>
          </div>
        </div>

        {/* Devices List & Setup Downloads */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Devices Grid */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Monitor className="w-4 h-4 text-blue-600" />
                <span>Computadores Ativos com esta Licença</span>
              </h3>
              <span className="text-xs text-slate-500 font-medium">Modo Rede Local (LAN)</span>
            </div>

            <div className="space-y-2">
              {clientLicense.activeDevices.map((device, idx) => (
                <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <strong className="text-slate-900 block font-bold">{device.name}</strong>
                    <span className="text-[11px] text-slate-500 font-mono">{device.ip}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">Ativado em: {device.activatedAt}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Setup Downloads */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Download className="w-4 h-4 text-blue-600" />
              <span>Instaladores Disponíveis</span>
            </h3>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <strong className="text-slate-900">KIVORA Setup v{CURRENT_RELEASE.version}</strong>
                <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">Windows 64-bit</span>
              </div>
              <p className="text-slate-500 text-[11px]">Tamanho: {CURRENT_RELEASE.fileSize} • Data: {CURRENT_RELEASE.date}</p>
              <button
                onClick={() => onNavigatePage('download')}
                className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1 mt-2"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descarregar Ficheiro Setup</span>
              </button>
            </div>
          </div>

        </div>

      </section>

    </div>
  );
};
