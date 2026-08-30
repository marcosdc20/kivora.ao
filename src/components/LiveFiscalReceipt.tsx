import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, CheckCircle2, QrCode, Zap } from 'lucide-react';

export type SectorType = 'supermercado' | 'restaurante' | 'farmacia' | 'servicos';

interface ReceiptData {
  sectorName: string;
  badge: string;
  docNumber: string;
  clientName: string;
  clientNif: string;
  items: Array<{ name: string; qty: number; price: number; taxRate: string }>;
  subtotal: number;
  taxTotal: number;
  retentionTotal?: number;
  total: number;
  hash: string;
  executionMs: number;
}

const SECTOR_RECEIPTS: Record<SectorType, ReceiptData> = {
  supermercado: {
    sectorName: 'Supermercado & Retalho',
    badge: 'POS Caixa Rápido',
    docNumber: 'FT KV26/004812',
    clientName: 'Consumidor Final',
    clientNif: '999999999',
    items: [
      { name: 'Arroz Agulha 5kg (Nacional)', qty: 2, price: 4200, taxRate: 'IVA 14%' },
      { name: 'Óleo Alimentar 1L', qty: 3, price: 1850, taxRate: 'IVA 14%' },
      { name: 'Leite UHT Gordo 1L (Pack)', qty: 1, price: 8500, taxRate: 'IVA 14%' },
    ],
    subtotal: 22450,
    taxTotal: 3143,
    total: 25593,
    hash: '4kL9-89vB-440A-2026-AGT',
    executionMs: 64,
  },
  restaurante: {
    sectorName: 'Restauração & Bar',
    badge: 'Controlo de Mesas & POS',
    docNumber: 'FR KV26/001943',
    clientName: 'Mesa 04 — Salão Principal',
    clientNif: '5417029831',
    items: [
      { name: 'Menu Executivo Peixe Grelhado', qty: 2, price: 9500, taxRate: 'IVA 14%' },
      { name: 'Sumo Natural Maracujá 33cl', qty: 2, price: 1800, taxRate: 'IVA 14%' },
      { name: 'Café Expresso Blend Angola', qty: 2, price: 800, taxRate: 'IVA 14%' },
    ],
    subtotal: 24200,
    taxTotal: 3388,
    total: 27588,
    hash: '7bX2-11pM-440A-2026-AGT',
    executionMs: 78,
  },
  farmacia: {
    sectorName: 'Farmácia & Saúde',
    badge: 'Lotes & Validades',
    docNumber: 'FT KV26/003104',
    clientName: 'Clinica Médica Luanda Sul',
    clientNif: '5001948201',
    items: [
      { name: 'Paracetamol 500mg (Cx 20 Comp)', qty: 5, price: 1200, taxRate: 'Isento Art. 12.º' },
      { name: 'Amoxicilina 1g (Cx 16 Comp)', qty: 3, price: 4800, taxRate: 'Isento Art. 12.º' },
      { name: 'Soro Fisiológico 500ml', qty: 4, price: 1500, taxRate: 'Isento Art. 12.º' },
    ],
    subtotal: 26400,
    taxTotal: 0,
    total: 26400,
    hash: '9wQ4-66tN-440A-2026-AGT',
    executionMs: 52,
  },
  servicos: {
    sectorName: 'Consultoria & Serviços',
    badge: 'Retenção IRT & Faturação',
    docNumber: 'FT KV26/000877',
    clientName: 'Sociedade Mineira de Catoca',
    clientNif: '5403019842',
    items: [
      { name: 'Assistência Técnica de Redes LAN', qty: 1, price: 150000, taxRate: 'IVA 14%' },
      { name: 'Configuração de Servidor Kivora', qty: 1, price: 85000, taxRate: 'IVA 14%' },
    ],
    subtotal: 235000,
    taxTotal: 32900,
    retentionTotal: 15275, // Retenção na fonte 6.5%
    total: 252625,
    hash: '2mZ8-90yK-440A-2026-AGT',
    executionMs: 91,
  },
};

export const LiveFiscalReceipt: React.FC = () => {
  const [activeSector, setActiveSector] = useState<SectorType>('supermercado');
  const [currentTime, setCurrentTime] = useState<string>('');

  const receipt = SECTOR_RECEIPTS[activeSector];

  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('pt-AO', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }) +
          ' ' +
          now.toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateDate();
    const timer = setInterval(updateDate, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSelectSector = (sec: SectorType) => {
    setActiveSector(sec);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      maximumFractionDigits: 2,
    })
      .format(val)
      .replace('AOA', 'Kz');
  };

  return (
    <div className="w-full max-w-lg mx-auto select-none">
      
      {/* Seletor de Setor no Topo da Fatura */}
      <div className="bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-800 flex items-center justify-between gap-1 mb-3.5 shadow-xl">
        {(
          [
            { id: 'supermercado', label: 'Supermercado' },
            { id: 'restaurante', label: 'Restauração' },
            { id: 'farmacia', label: 'Farmácia' },
            { id: 'servicos', label: 'Serviços' },
          ] as const
        ).map((tab) => {
          const isActive = activeSector === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleSelectSector(tab.id)}
              className={`flex-1 text-center py-2 px-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Cartão do Recibo / Fatura Electrónica Certificada AGT */}
      <div className="relative bg-white rounded-3xl border border-slate-200/90 shadow-2xl shadow-slate-950/15 overflow-hidden transition-all duration-300">
        
        {/* Recorte Estilizado do 'K' da Marca Kivora no Topo */}
        <div className="h-2 bg-gradient-to-r from-[#1746A2] via-[#2563EB] to-[#FF6500] w-full" />

        <div className="p-6 sm:p-7 space-y-5">
          
          {/* Cabeçalho do Talão Fiscal */}
          <div className="flex items-start justify-between border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base text-slate-950 tracking-tight font-display">
                  KIVORA ENTERPRISE
                </span>
                <span className="text-[10px] font-black uppercase bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                  {receipt.badge}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                VISUAL SOFTWARE, LDA. · NIF: 5002863944
              </p>
              <p className="text-[10px] text-slate-400 font-mono-num">
                Luanda, Angola · Certificado N.º FE/440/AGT/2026
              </p>
            </div>

            {/* Selo Verde de Validação AGT */}
            <div className="flex flex-col items-end">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Certificado AGT</span>
              </span>
              <span className="text-[10px] font-mono-num text-slate-400 mt-1">
                Dec. Pres. 71/25
              </span>
            </div>
          </div>

          {/* Dados da Fatura / Cliente */}
          <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-100 grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Documento Fiscal
              </span>
              <span className="font-black font-mono-num text-slate-900 text-xs">
                {receipt.docNumber}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Data / Hora Emissão
              </span>
              <span className="font-semibold font-mono-num text-slate-700 text-[11px]">
                {currentTime || '29/08/2026 22:00'}
              </span>
            </div>
            <div className="col-span-2 pt-1 border-t border-slate-200/60 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Cliente</span>
                <span className="font-semibold text-slate-800 text-[11px] truncate block max-w-[200px]">
                  {receipt.clientName}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">NIF</span>
                <span className="font-mono-num font-semibold text-slate-700 text-[11px]">
                  {receipt.clientNif}
                </span>
              </div>
            </div>
          </div>

          {/* Lista de Artigos / Itens Faturados */}
          <div className="space-y-2 border-b border-slate-100 pb-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Artigo / Descrição</span>
              <span>Qtd × Preço</span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeSector}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
                className="space-y-2"
              >
                {receipt.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1">
                    <div>
                      <p className="font-bold text-slate-900 leading-tight">{item.name}</p>
                      <span className="text-[10px] text-blue-600 font-mono-num font-semibold">
                        {item.taxRate}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono-num font-bold text-slate-900 block">
                        {formatCurrency(item.price * item.qty)}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono-num">
                        {item.qty} un × {formatCurrency(item.price)}
                      </span>
                    </div>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Totais & Impostos */}
          <div className="space-y-1.5 text-xs pt-1">
            <div className="flex items-center justify-between text-slate-500">
              <span>Incidência / Subtotal:</span>
              <span className="font-mono-num font-semibold">{formatCurrency(receipt.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-slate-500">
              <span>Total IVA Liquidado:</span>
              <span className="font-mono-num font-semibold">{formatCurrency(receipt.taxTotal)}</span>
            </div>
            {receipt.retentionTotal ? (
              <div className="flex items-center justify-between text-amber-700">
                <span>Retenção na Fonte IRT (6.5%):</span>
                <span className="font-mono-num font-semibold">-{formatCurrency(receipt.retentionTotal)}</span>
              </div>
            ) : null}

            {/* Total Final a Pagar */}
            <div className="flex items-center justify-between pt-2 border-t-2 border-dashed border-slate-200 mt-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900 block">
                  Total da Fatura (AOA)
                </span>
                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Faturação em Kwanzas
                </span>
              </div>
              <div className="text-right">
                <span className="text-xl sm:text-2xl font-black font-mono-num text-slate-950 tracking-tight">
                  {formatCurrency(receipt.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Assinatura Criptográfica & QR Code AGT */}
          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 flex items-center justify-between gap-3 text-xs">
            <div className="space-y-1 overflow-hidden">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block">
                Hash Digital RSA-SHA256
              </span>
              <code className="font-mono-num text-[10px] text-slate-600 block truncate bg-white px-2 py-0.5 rounded border border-slate-200">
                {receipt.hash}
              </code>
              <p className="text-[9px] text-slate-500 font-medium">
                Registo sequencial inalterável emitido pelo KIVORA Desktop.
              </p>
            </div>

            {/* Mini QR Code Visual */}
            <div className="w-12 h-12 rounded-xl bg-white border border-slate-300 p-1 flex items-center justify-center shrink-0 shadow-xs">
              <QrCode className="w-full h-full text-slate-900" />
            </div>
          </div>

          {/* Rodapé do Talão com Indicador de Desempenho Local */}
          <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100">
            <span className="flex items-center gap-1.5 font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
              <Zap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Base Local Offline · {receipt.executionMs}ms</span>
            </span>
            <span className="text-slate-400 font-mono-num text-[10px]">
              KIVORA v2.6 Core LAN
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};
