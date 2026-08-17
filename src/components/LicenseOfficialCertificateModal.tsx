import React, { useState } from 'react';
import {
  ShieldCheck, Printer, X, CheckCircle2, Copy
} from 'lucide-react';
import { formatLicenseDate, getPlanLabel } from '../admin/services/licenseService';
import type { KivoraLicense } from '../admin/types';

interface LicenseOfficialCertificateModalProps {
  license: KivoraLicense | null;
  onClose: () => void;
  partnerCode?: string;
}

export const LicenseOfficialCertificateModal: React.FC<LicenseOfficialCertificateModalProps> = ({
  license,
  onClose,
  partnerCode,
}) => {
  const [copiedKey, setCopiedKey] = useState(false);

  if (!license) return null;

  const validationUrl = `https://kivora.ao/#validar-licenca?key=${encodeURIComponent(license.id)}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(validationUrl)}&margin=0`;
  const isLicenseActive = !license.expires_at || new Date(license.expires_at).getTime() > Date.now();
  const certRegNum = `KVRA-LIC-${license.id.slice(-6).toUpperCase()}-${new Date(license.created_at).getFullYear()}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 overflow-y-auto print:static print:p-0 print:m-0 print:bg-transparent print:backdrop-blur-none print:overflow-visible">
      <div className="modal-sheet bg-slate-900 rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-800 flex flex-col max-h-[96vh] overflow-hidden animate-fadeIn print:border-none print:shadow-none print:rounded-none print:bg-transparent print:max-h-none print:overflow-visible print:w-full print:max-w-none">
        
        {/* Modal Header (Hidden on Print) */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-950 shrink-0 print:hidden text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-white text-base">Certificado Oficial de Licenciamento (A4)</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Comprovativo de conformidade fiscal AGT emitido para <strong>{license.company_name}</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => {
                navigator.clipboard.writeText(license.id);
                setCopiedKey(true);
                setTimeout(() => setCopiedKey(false), 2500);
              }}
              className="text-slate-300 hover:text-white font-bold text-xs px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedKey ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey ? 'Chave Copiada' : 'Copiar Chave'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / PDF (A4)</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Preview Wrapper */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-950/70 flex justify-center print:p-0 print:m-0 print:bg-transparent print:overflow-visible">
          
          {/* =========================================================================
              DOCUMENTO A4: CERTIFICADO DE LICENCIAMENTO DE SOFTWARE (KIVORA ERP)
              ========================================================================= */}
          <div className="printable-document certificate-document a4-document bg-white text-slate-900 w-full max-w-[800px] min-h-[1050px] p-10 sm:p-14 shadow-2xl flex flex-col justify-between relative print:shadow-none print:p-0 print:m-0 print:w-full print:max-w-none print:min-h-[265mm] font-sans">
            
            {/* Top Corporate Line — No fluxo do documento com margem inferior generosa */}
            <div className="w-full h-1.5 bg-slate-900 mb-6 print:mb-6 shrink-0" />

            <div className="space-y-6 sm:space-y-7 flex-1">
              {/* Header Oficial: Kivora ERP */}
              <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5">
                <div className="space-y-1">
                  <img
                    src="/imagens/logo_sem_fundo.png"
                    alt="Kivora ERP"
                    className="h-10 w-auto object-contain mb-1.5"
                  />
                  <span className="font-black text-lg tracking-tight text-slate-950 block leading-tight">
                    Kivora Tecnologias, Lda.
                  </span>
                  <p className="text-[11px] text-slate-700 font-bold">
                    Software Certificado pela AGT n.º 384/AGT/2024 • Dec. Presidencial n.º 71/25
                  </p>
                  <p className="text-[10px] text-slate-500">
                    NIF: 5417088920 • Luanda, República de Angola
                  </p>
                </div>

                <div className="text-right flex flex-col items-end">
                  <img
                    src={qrCodeUrl}
                    alt="QR Code de Verificação de Licença"
                    className="w-16 h-16 border border-slate-300 p-1 rounded bg-white shadow-2xs"
                  />
                  <span className="text-[9px] font-mono text-slate-600 mt-1 font-bold">
                    REG. {certRegNum}
                  </span>
                </div>
              </div>

              {/* Título do Documento */}
              <div className="text-center space-y-1.5 pt-1">
                <span className="inline-block text-[10px] font-black uppercase text-blue-900 bg-blue-50 border border-blue-200 px-3.5 py-1 rounded-full tracking-wider">
                  Certificação Oficial de Licenciamento & Conformidade Fiscal AGT
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-950 uppercase tracking-tight">
                  Certificado de Licenciamento de Software
                </h1>
                <p className="text-xs text-slate-600 font-semibold uppercase tracking-wider">
                  Kivora ERP • Sistema de Gestão Comercial e Facturação Certificada
                </p>
              </div>

              {/* Declaração Formal */}
              <div className="text-center max-w-2xl mx-auto text-xs sm:text-sm text-slate-700 leading-relaxed space-y-3 pt-1">
                <p className="text-xs text-slate-600">
                  A <strong>Kivora Tecnologias, Lda.</strong> certifica para todos os efeitos legais e fiscais que a entidade:
                </p>
                <div className="bg-slate-50 border-y-2 border-slate-300 py-3.5 px-6">
                  <h2 className="text-lg sm:text-xl font-black text-slate-950 uppercase tracking-wide">
                    {license.company_name}
                  </h2>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed text-justify">
                  Inscrita sob o NIF n.º <strong>{license.nif}</strong>, é titular legítima da licença de uso do software <strong>Kivora ERP</strong>, devidamente registada no servidor central de licenciamento e autorizada para emissão de faturas e gestão de operações em conformidade com as normas tributárias em vigor na República de Angola.
                </p>
              </div>

              {/* Tabela Estruturada de Detalhes da Licença */}
              <div className="border border-slate-300 rounded-lg overflow-hidden text-xs">
                <div className="bg-slate-100 border-b border-slate-300 px-4 py-2 font-black text-slate-800 uppercase text-[10px] tracking-wider">
                  Especificação Técnica e Fiscal da Licença
                </div>
                <table className="w-full text-left divide-y divide-slate-200">
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="py-3 px-4 font-semibold text-slate-600 w-1/3 bg-slate-50/60">Entidade Licenciada:</td>
                      <td className="py-3 px-4 font-black text-slate-950">{license.company_name}</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-slate-600 bg-slate-50/60">NIF do Contribuinte:</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{license.nif}</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-slate-600 bg-slate-50/60">Chave de Licença (Serial Key):</td>
                      <td className="py-3 px-4 font-mono font-black text-blue-700">{license.id}</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-slate-600 bg-slate-50/60">Produto & Edição:</td>
                      <td className="py-3 px-4 text-slate-900 font-bold">Kivora ERP v2.4 (Edição Comercial & Multi-posto)</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-slate-600 bg-slate-50/60">Plano / Modalidade:</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{getPlanLabel(license.plan_type)}</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-slate-600 bg-slate-50/60">Postos de Trabalho Autorizados:</td>
                      <td className="py-3 px-4 text-slate-900 font-bold">
                        {1 + (license.extra_seats || 0)} Posto(s) Autorizado(s) em Rede Local
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-slate-600 bg-slate-50/60">Validade da Licença:</td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {license.expires_at ? formatLicenseDate(license.expires_at) : 'Licença Vitalícia (Sem Expiração)'}
                      </td>
                    </tr>
                    {partnerCode && (
                      <tr>
                        <td className="py-3 px-4 font-semibold text-slate-600 bg-slate-50/60">Canal / Parceiro Emissor:</td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">{partnerCode}</td>
                      </tr>
                    )}
                    <tr>
                      <td className="py-3 px-4 font-semibold text-slate-600 bg-slate-50/60">Estado da Licença:</td>
                      <td className="py-3 px-4 font-bold">
                        {isLicenseActive ? (
                          <span className="text-emerald-700">● VÁLIDA E ACTIVA NO SISTEMA CENTRAL</span>
                        ) : (
                          <span className="text-amber-700">● EXPIRADA</span>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Conformidade Legal e Fiscal AGT */}
              <div className="bg-slate-50 p-4 border border-slate-200 rounded-lg text-xs text-slate-600 leading-relaxed text-justify space-y-1">
                <p className="font-bold text-slate-900 text-[11px] uppercase tracking-wide">
                  Conformidade Legal & Fiscal AGT:
                </p>
                <p>
                  O software Kivora ERP cumpre integralmente os requisitos de assinatura digital de faturas por chave criptográfica RSA-2048 e exportação do ficheiro SAF-T (AO), nos termos do Regime Jurídico das Facturas e do Decreto Presidencial n.º 71/25 da República de Angola.
                </p>
              </div>
            </div>

            {/* Rodapé e Assinaturas */}
            <div className="pt-8 border-t-2 border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-6 text-[11px] avoid-break mt-6">
              <div className="text-center sm:text-left space-y-0.5">
                <p className="font-black text-slate-950 text-xs">KIVORA TECNOLOGIAS, LDA.</p>
                <p className="text-slate-500 text-[10px]">Departamento de Licenciamento & Sistemas</p>
                <p className="text-slate-400 text-[9px]">Verificação online pública em {validationUrl}</p>
              </div>

              <div className="text-center sm:text-right border-t sm:border-t-0 sm:border-l border-slate-200 pt-4 sm:pt-0 sm:pl-6 space-y-1">
                <div className="w-48 border-b border-slate-600 pb-1 mb-1 mx-auto sm:ml-auto">
                  <p className="font-serif italic text-slate-800 text-xs font-bold">Direção Técnica Kivora</p>
                </div>
                <p className="font-black text-slate-950 text-[10px] uppercase">Direção Técnica & Engenharia</p>
                <p className="text-slate-400 text-[9px] font-mono">Chave de Assinatura: {certRegNum}</p>
              </div>
            </div>

          </div>

        </div>

        {/* Modal Footer (Hidden on Print) */}
        <div className="p-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950 shrink-0 print:hidden text-xs">
          <div className="text-slate-400 text-[11px]">
            Documento A4 oficial com QR Code para verificação da autenticidade fiscal.
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Certificado</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl font-bold text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
