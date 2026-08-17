import React from 'react';
import { X, Printer, ShieldCheck, FileText } from 'lucide-react';
import { KivoraLogo } from './KivoraLogo';
import { KIVORA_INFO } from '../data/kivoraData';
import { formatLicenseDate, getPlanLabel } from '../admin/services/licenseService';
import type { KivoraLicense } from '../admin/types';

interface InvoicePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  license: KivoraLicense | null;
  invoiceNumber?: string;
  paymentMethod?: string;
}

const fmt = (n: number) => n.toLocaleString('pt-AO');

export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({
  isOpen,
  onClose,
  license,
  invoiceNumber,
  paymentMethod = 'Transferência Bancária',
}) => {
  if (!isOpen || !license) return null;

  const invNum = invoiceNumber || `FAT-${new Date(license.created_at).getFullYear()}-${license.id.slice(-6).toUpperCase()}`;
  const price = license.price_aoa || (license.plan_type === 'monthly' ? 25000 : license.plan_type === 'lifetime' ? 1500000 : 250000);
  const taxAoa = 0; // Regime de Software Isento
  const totalAoa = price + taxAoa;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay fixed inset-0 z-[150] flex items-center justify-center p-2 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto print:static print:p-0 print:m-0 print:bg-transparent print:backdrop-blur-none print:overflow-visible">
      
      <div className="modal-sheet bg-slate-900 rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-800 flex flex-col max-h-[96vh] overflow-hidden animate-fadeIn print:border-none print:shadow-none print:rounded-none print:bg-transparent print:max-h-none print:overflow-visible print:w-full print:max-w-none">

        {/* Action Header (Oculto na Impressão) */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800 text-white print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-black text-white block">Fatura Pró-Forma / Recibo Oficial (A4)</span>
              <span className="text-xs text-slate-400">Documento comercial oficial para {license.company_name}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / PDF (A4)</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-950/70 flex justify-center print:p-0 print:m-0 print:bg-transparent print:overflow-visible">
          
          {/* =========================================================================
              DOCUMENTO A4: FATURA PRÓ-FORMA / RECIBO OFICIAL
              ========================================================================= */}
          <div className="printable-document invoice-document a4-document bg-white text-slate-900 w-full max-w-[800px] min-h-[1050px] p-10 sm:p-14 shadow-2xl flex flex-col justify-between relative print:shadow-none print:p-0 print:m-0 print:min-h-0 print:w-full print:max-w-none print:min-h-[265mm] font-sans">
            
            {/* Top Corporate Line — No fluxo do documento com margem inferior generosa */}
            <div className="w-full h-1.5 bg-slate-900 mb-6 print:mb-6 shrink-0" />

            <div className="space-y-6 sm:space-y-7 flex-1">
              {/* Header da Empresa Emissora & Identificação do Documento */}
              <div className="flex flex-col sm:flex-row items-start justify-between gap-6 border-b-2 border-slate-900 pb-5">
                <div>
                  <KivoraLogo size="md" useOfficialImage={true} />
                  <div className="mt-3 text-xs text-slate-600 space-y-0.5 font-medium">
                    <p className="font-black text-slate-950 text-sm">Kivora Tecnologias & Software, Lda.</p>
                    <p>NIF: <strong>5417088920</strong> • Conservatória de Luanda</p>
                    <p>{KIVORA_INFO.address || 'Luanda, República de Angola'}</p>
                    <p>Email: comercial@kivora.ao • Tel: +244 923 000 000</p>
                  </div>
                </div>

                <div className="text-left sm:text-right space-y-1.5">
                  <span className="inline-block text-[10px] font-black uppercase tracking-widest text-blue-900 bg-blue-50 px-3.5 py-1 rounded-full border border-blue-200">
                    Fatura Pró-Forma / Recibo
                  </span>
                  <h2 className="text-2xl font-black font-mono text-slate-950 tracking-tight">{invNum}</h2>
                  <p className="text-xs text-slate-600">
                    Data de Emissão: <strong className="text-slate-900">{new Date(license.created_at).toLocaleDateString('pt-AO')}</strong>
                  </p>
                  <p className="text-xs text-slate-600">
                    Validade da Licença: <strong className="text-slate-900">{formatLicenseDate(license.expires_at)}</strong>
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    Chave Serial: <strong className="text-blue-700">{license.id}</strong>
                  </p>
                </div>
              </div>

              {/* Dados do Cliente / Adquirente */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-lg border border-slate-300 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Exmo.(s) Senhor(es)</span>
                  <p className="text-sm font-black text-slate-950">{license.company_name}</p>
                  <p className="text-slate-600">NIF do Adquirente: <strong className="font-mono text-slate-900">{license.nif}</strong></p>
                  <p className="text-slate-600">Email: {license.client_email || 'Não Registado'}</p>
                </div>

                <div className="space-y-1 text-left sm:text-right">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Detalhes da Subscrição</span>
                  <p className="font-black text-slate-950">Kivora Desktop ERP — {getPlanLabel(license.plan_type)}</p>
                  <p className="text-slate-600">Modalidade: <strong>{license.plan_type === 'lifetime' ? 'Licença Vitalícia' : 'Subscrição Anual'}</strong></p>
                  <p className="text-slate-600">Forma de Pagamento: <strong className="text-slate-900">{paymentMethod}</strong></p>
                  <p className="text-slate-600">Estado: <span className="font-bold text-emerald-700">● Regularizado / Ativo</span></p>
                </div>
              </div>

              {/* Tabela de Itens e Serviços */}
              <div className="border border-slate-300 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 font-black uppercase text-[10px] tracking-wider">
                      <th className="p-3.5">Descrição do Serviço / Módulo</th>
                      <th className="p-3.5 text-center">Qtd</th>
                      <th className="p-3.5 text-right">Preço Unitário</th>
                      <th className="p-3.5 text-center">Taxa IVA</th>
                      <th className="p-3.5 text-right">Total Líquido (Kz)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-800">
                    <tr>
                      <td className="p-3.5 space-y-0.5">
                        <p className="font-bold text-slate-950">Licenciamento Kivora Desktop ERP ({getPlanLabel(license.plan_type)})</p>
                        <p className="text-[10px] text-slate-500">
                          Módulo de Faturação Certificada AGT (384/AGT/2024), Base de Dados Local SQLite e Sincronização Cloud.
                        </p>
                      </td>
                      <td className="p-3.5 text-center font-bold">1</td>
                      <td className="p-3.5 text-right font-mono">{fmt(price)} Kz</td>
                      <td className="p-3.5 text-center font-bold text-slate-600">0% (Isento)</td>
                      <td className="p-3.5 text-right font-mono font-bold text-slate-950">{fmt(price)} Kz</td>
                    </tr>
                    {license.extra_seats && license.extra_seats > 0 ? (
                      <tr>
                        <td className="p-3.5 space-y-0.5">
                          <p className="font-bold text-slate-950">Terminais Adicionais em Rede Local (Multi-Posto)</p>
                          <p className="text-[10px] text-slate-500">Postos de Caixa e Terminais de Atendimento Ligados em Rede</p>
                        </td>
                        <td className="p-3.5 text-center font-bold">{license.extra_seats}</td>
                        <td className="p-3.5 text-right font-mono">0 Kz</td>
                        <td className="p-3.5 text-center font-bold text-slate-600">0%</td>
                        <td className="p-3.5 text-right font-mono font-bold text-slate-950">0 Kz</td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>

              {/* Totais & Dados Bancários */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start pt-2">
                <div className="sm:col-span-7 bg-slate-50 p-4 rounded-lg border border-slate-300 text-xs space-y-2">
                  <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider block">
                    Coordenadas Bancárias Oficiais para Pagamento
                  </span>
                  <div className="space-y-1 font-mono text-[11px]">
                    <p><strong>BAI:</strong> AO06.0040.0000.1234.5678.9012.3</p>
                    <p><strong>BFA:</strong> AO06.0006.0000.9876.5432.1098.7</p>
                    <p className="text-slate-500 text-[10px] font-sans">Beneficiário: <strong>Kivora Tecnologias & Software Lda.</strong></p>
                  </div>
                </div>

                <div className="sm:col-span-5 space-y-2 text-xs border border-slate-300 p-4 rounded-lg bg-white">
                  <div className="flex justify-between text-slate-600">
                    <span>Incidência / Subtotal:</span>
                    <span className="font-mono font-bold text-slate-900">{fmt(price)} Kz</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Total IVA (0%):</span>
                    <span className="font-mono font-bold text-slate-900">0 Kz</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-slate-950 border-t-2 border-slate-900 pt-2">
                    <span>Total Líquido:</span>
                    <span className="font-mono text-blue-900">{fmt(totalAoa)} Kz</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Carimbo & Conformidade AGT */}
            <div className="pt-8 border-t-2 border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 avoid-break mt-6">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
                <span className="text-[11px] font-medium text-slate-600">
                  Processado por Software Certificado pela AGT n.º 384/AGT/2024 • Kivora Desktop ERP
                </span>
              </div>
              <div className="text-right font-mono text-[10px] text-slate-500 font-bold">
                Assinatura Digital: {license.id.slice(0, 8).toUpperCase()}-AGT-{new Date(license.created_at).getFullYear()}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
