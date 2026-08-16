import React from 'react';
import { X, Printer, ShieldCheck } from 'lucide-react';
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

  const invNum = invoiceNumber || `FAT-${new Date(license.created_at).getFullYear()}-${license.id.slice(-4)}`;
  const price = license.price_aoa || (license.plan_type === 'monthly' ? 25000 : license.plan_type === 'lifetime' ? 1500000 : 250000);
  const taxAoa = 0; // Software isento ou IVA 14%
  const totalAoa = price + taxAoa;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white">
      
      {/* Container A4 */}
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 print:my-0 print:border-none print:shadow-none">

        {/* Action Header (Oculto na Impressão) */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider">Fatura Pró-Forma / Recibo Oficial</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Guardar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Documento A4 Formatado */}
        <div className="p-8 sm:p-12 space-y-8 text-slate-900 font-sans" id="invoice-printable-area">
          
          {/* Header da Empresa Emissora */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-slate-200 pb-8">
            <div>
              <KivoraLogo size="md" useOfficialImage={true} />
              <div className="mt-3 text-xs text-slate-500 space-y-0.5">
                <p className="font-bold text-slate-900">Kivora Soluções Tecnológicas & Software Lda.</p>
                <p>NIF: 5417892019 • Conservatória de Luanda</p>
                <p>{KIVORA_INFO.address}</p>
                <p>Email: {KIVORA_INFO.email} • Tel: {KIVORA_INFO.phone}</p>
              </div>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                Fatura / Recibo
              </span>
              <h2 className="text-xl font-black font-mono text-slate-900">{invNum}</h2>
              <p className="text-xs text-slate-500">
                Data de Emissão: <strong className="text-slate-800">{new Date(license.created_at).toLocaleDateString('pt-AO')}</strong>
              </p>
              <p className="text-xs text-slate-500">
                Validade da Licença: <strong className="text-slate-800">{formatLicenseDate(license.expires_at)}</strong>
              </p>
            </div>
          </div>

          {/* Dados do Cliente */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-200 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Exmo.(s) Senhor(es)</span>
              <p className="text-sm font-black text-slate-950">{license.company_name}</p>
              <p className="text-slate-600">NIF: <strong className="font-mono text-slate-900">{license.nif}</strong></p>
              <p className="text-slate-600">Email: {license.client_email}</p>
            </div>

            <div className="space-y-1 text-left sm:text-right">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Detalhes da Subscrição</span>
              <p className="font-bold text-slate-900">Kivora Desktop ERP — {getPlanLabel(license.plan_type)}</p>
              <p className="text-slate-600">Chave de Ativação: <strong className="font-mono text-blue-600">{license.id}</strong></p>
              <p className="text-slate-600">Forma de Pagamento: <strong className="text-slate-800">{paymentMethod}</strong></p>
              <p className="text-slate-600">Estado: <span className="font-bold text-emerald-600">Ativo / Regularizado</span></p>
            </div>
          </div>

          {/* Tabela de Itens */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/80 text-slate-700 font-black uppercase text-[10px] border-b border-slate-200">
                  <th className="p-3.5">Descrição do Serviço / Módulo</th>
                  <th className="p-3.5 text-center">Qtd</th>
                  <th className="p-3.5 text-right">Preço Unitário</th>
                  <th className="p-3.5 text-right">Total (Kz)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                <tr>
                  <td className="p-3.5 space-y-0.5">
                    <p className="font-bold text-slate-900">Licença Kivora Desktop ERP ({getPlanLabel(license.plan_type)})</p>
                    <p className="text-[10px] text-slate-500">
                      Inclui Módulo de Faturação Certificada AGT, Base de Dados Local e Sincronização Cloud.
                    </p>
                  </td>
                  <td className="p-3.5 text-center font-bold">1</td>
                  <td className="p-3.5 text-right font-mono">{fmt(price)} Kz</td>
                  <td className="p-3.5 text-right font-mono font-bold">{fmt(price)} Kz</td>
                </tr>
                {license.extra_seats && license.extra_seats > 0 ? (
                  <tr>
                    <td className="p-3.5 space-y-0.5">
                      <p className="font-bold text-slate-900">Terminais Adicionais em Rede Local</p>
                      <p className="text-[10px] text-slate-500">Postos de Caixa / Terminais de Venda Adicionais</p>
                    </td>
                    <td className="p-3.5 text-center font-bold">{license.extra_seats}</td>
                    <td className="p-3.5 text-right font-mono">0 Kz</td>
                    <td className="p-3.5 text-right font-mono font-bold">0 Kz</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          {/* Totais & Dados Bancários */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start pt-2">
            <div className="sm:col-span-7 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Coordenadas Bancárias Oficiais</span>
              <div className="space-y-1 font-mono text-[11px]">
                <p><strong>BAI:</strong> AO06 0040 0000 1234 5678 1012 3</p>
                <p><strong>BFA:</strong> AO06 0006 0000 9876 5432 1014 5</p>
                <p className="text-slate-500 text-[10px]">Beneficiário: Kivora Soluções Lda</p>
              </div>
            </div>

            <div className="sm:col-span-5 space-y-2 text-xs border border-slate-200 p-4 rounded-2xl bg-white">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono font-bold text-slate-900">{fmt(price)} Kz</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>IVA (0% Isento):</span>
                <span className="font-mono font-bold text-slate-900">0 Kz</span>
              </div>
              <div className="flex justify-between text-sm font-black text-slate-950 border-t border-slate-200 pt-2">
                <span>Total a Pagar:</span>
                <span className="font-mono text-blue-600">{fmt(totalAoa)} Kz</span>
              </div>
            </div>
          </div>

          {/* Carimbo & Conformidade AGT */}
          <div className="border-t border-slate-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Processado por Programa Certificado pela AGT • Kivora Desktop ERP v1.1.0</span>
            </div>
            <div className="text-right font-mono text-[10px]">
              Assinatura Digital: {license.id.slice(0, 8)}-AGT-{new Date(license.created_at).getFullYear()}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
