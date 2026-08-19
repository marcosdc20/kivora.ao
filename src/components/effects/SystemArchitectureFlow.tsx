import React from 'react';
import { Monitor, Server, ShieldCheck, Wifi, WifiOff, HardDrive, Zap, CheckCircle2 } from 'lucide-react';

/**
 * SystemArchitectureFlow — Diagrama interativo de arquitetura híbrida Offline-First do KIVORA
 * Mostra a independência total de internet nos caixas e a sincronização fiscal AGT.
 */
export const SystemArchitectureFlow: React.FC = () => {
  return (
    <div className="bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl space-y-8 relative overflow-hidden">
      {/* Luz ambiente sutil de fundo */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Cabeçalho do Bloco */}
      <div className="text-center max-w-2xl mx-auto space-y-2 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
          <Zap className="w-3.5 h-3.5" />
          <span>Arquitetura Híbrida em Produção</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-white">
          Como Funciona o Modo <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">100% Offline-First</span>
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          Os caixas nunca param de faturar mesmo sem internet ou energia instável. Os dados fiscais são assinados localmente com chaves RSA e sincronizados automaticamente.
        </p>
      </div>

      {/* Grid Interativo do Fluxo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        
        {/* NÓ 1: Terminais POS / Caixas */}
        <div className="bg-slate-800/80 backdrop-blur-xs border border-slate-700/80 rounded-2xl p-5 sm:p-6 space-y-4 hover:border-blue-500/50 transition-all group">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Monitor className="w-6 h-6" />
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <WifiOff className="w-3 h-3" />
              <span>Sem Net = 100% OK</span>
            </span>
          </div>

          <div>
            <h4 className="font-bold text-sm text-white">1. Caixas & Postos Locais</h4>
            <p className="text-xs text-slate-400 mt-1">
              Até 20 terminais em rede LAN. Emissão em &lt; 0.2s, leitura de código de barras e gaveta térmica.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-700/50 flex items-center justify-between text-[11px] text-slate-400">
            <span>Base Local:</span>
            <span className="font-mono font-bold text-blue-300">SQLite Cifrado</span>
          </div>
        </div>

        {/* NÓ 2: Servidor Central Kivora / Motor Fiscal */}
        <div className="bg-slate-800/80 backdrop-blur-xs border border-blue-500/40 rounded-2xl p-5 sm:p-6 space-y-4 shadow-lg shadow-blue-500/5 hover:border-blue-400 transition-all group relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white font-black text-[9px] uppercase px-2.5 py-0.5 rounded-full shadow-xs tracking-wider">
            Motor Criptográfico
          </div>

          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
              <Server className="w-6 h-6" />
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">
              <HardDrive className="w-3 h-3" />
              <span>Assinatura RSA-SHA256</span>
            </span>
          </div>

          <div>
            <h4 className="font-bold text-sm text-white">2. Núcleo KIVORA ERP</h4>
            <p className="text-xs text-slate-400 mt-1">
              Gera a chave hash sequencial, calcula o IRT 2026 e grava cada venda sem duplicidade no fecho.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-700/50 flex items-center justify-between text-[11px] text-slate-400">
            <span>Validação Fiscal:</span>
            <span className="font-mono font-bold text-emerald-400">DS.120 Conforme</span>
          </div>
        </div>

        {/* NÓ 3: Sincronização e AGT */}
        <div className="bg-slate-800/80 backdrop-blur-xs border border-slate-700/80 rounded-2xl p-5 sm:p-6 space-y-4 hover:border-emerald-500/50 transition-all group">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Wifi className="w-3 h-3" />
              <span>Sincronização Auto</span>
            </span>
          </div>

          <div>
            <h4 className="font-bold text-sm text-white">3. AGT & Nuvem Segura</h4>
            <p className="text-xs text-slate-400 mt-1">
              Ao detectar sinal de internet, envia o SAF-T (AO) para o portal do contribuinte e backup na nuvem.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-700/50 flex items-center justify-between text-[11px] text-slate-400">
            <span>Certificado:</span>
            <span className="font-bold text-emerald-400">Homologação Oficial</span>
          </div>
        </div>

      </div>

      {/* Rodapé do Bloco com Garantias */}
      <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-center sm:justify-between gap-4 text-xs text-slate-400">
        <span className="flex items-center gap-1.5 text-slate-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Faturação ininterrupta 24/7 sem dependência de internet</span>
        </span>
        <span className="flex items-center gap-1.5 text-slate-300">
          <CheckCircle2 className="w-4 h-4 text-blue-400" />
          <span>QR Code fiscal e SAF-T gerados localmente</span>
        </span>
      </div>
    </div>
  );
};
