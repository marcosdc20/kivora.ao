import React, { useState } from 'react';
import {
  Award, ShieldCheck, Printer, X,
  CheckCircle2, Copy
} from 'lucide-react';
import { KivoraLogo } from './KivoraLogo';

export interface PartnerCertificateData {
  partnerName: string;
  partnerCode: string;
  nif?: string;
  tier?: 'bronze' | 'silver' | 'gold' | 'diamond';
  region?: string;
  email?: string;
  phone?: string;
  createdAt?: number;
}

interface PartnerOfficialCertificatesModalProps {
  partner: PartnerCertificateData;
  onClose: () => void;
}

export const PartnerOfficialCertificatesModal: React.FC<PartnerOfficialCertificatesModalProps> = ({
  partner,
  onClose,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);

  const partnerCode = partner.partnerCode || 'KVR-PR-2026-001';
  const partnerName = partner.partnerName || 'NOME DO PARCEIRO / EMPRESA REVENDEDORA';
  const partnerNif = partner.nif || '5417088920';
  const partnerRegion = partner.region || 'Luanda, Angola';

  const issueDateObj = partner.createdAt ? new Date(partner.createdAt) : new Date();
  
  // Format DD/MM/AAAA
  const formatDateDDMMAAAA = (d: Date) => {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const issueDateFormatted = formatDateDDMMAAAA(issueDateObj);

  // Validade de 1 ano
  const validUntilObj = new Date(issueDateObj);
  validUntilObj.setFullYear(validUntilObj.getFullYear() + 1);
  const validUntilFormatted = formatDateDDMMAAAA(validUntilObj);

  const validationUrl = `https://kivora.ao/#validar-licenca?p=${encodeURIComponent(partnerCode)}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 overflow-y-auto print:static print:p-0 print:m-0 print:bg-transparent print:backdrop-blur-none print:overflow-visible">
      <div className="modal-sheet bg-slate-900 rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-800 flex flex-col max-h-[96vh] overflow-hidden animate-fadeIn print:border-none print:shadow-none print:rounded-none print:bg-transparent print:max-h-none print:overflow-visible print:w-full print:max-w-none">
        
        {/* Modal Top Bar (Hidden on Print) */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-950 shrink-0 print:hidden text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-[#FF6500] shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Comprovativo de Parceiro Revendedor</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Certificação Oficial de Revenda emitida pela <strong>VISUAL SOFTWARE, LDA.</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => {
                navigator.clipboard.writeText(validationUrl);
                setCopiedLink(true);
                setTimeout(() => setCopiedLink(false), 2500);
              }}
              className="text-slate-300 hover:text-white font-semibold text-xs px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Link Copiado' : 'Copiar Link'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 bg-[#FF6500] hover:bg-[#EB5B00] active:bg-[#C94A00] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md transition-all cursor-pointer"
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

        {/* Certificate Preview Wrapper (A4 Viewport) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-950/70 flex justify-center print:p-0 print:m-0 print:bg-transparent print:overflow-visible">
          
          {/* =========================================================================
              DOCUMENTO OFICIAL ÚNICO: COMPROVATIVO DE PARCEIRO REVENDEDOR
              ========================================================================= */}
          <div className="printable-document certificate-document a4-document bg-white text-slate-900 w-full max-w-[760px] min-h-[1020px] p-8 sm:p-12 shadow-2xl flex flex-col justify-between relative print:shadow-none print:p-8 print:m-0 print:min-h-0 print:w-full print:max-w-none print:h-[285mm] font-sans border-2 border-slate-900 border-b-4 border-b-[#FF6500] rounded-sm">
            
            {/* Top Section */}
            <div className="space-y-6 flex-1 flex flex-col justify-between">
              
              {/* 1. CABEÇALHO COM LOGO E TÍTULOS OFICIAIS */}
              <div className="text-center space-y-3 pt-2">
                <div className="flex justify-center mb-3">
                  <KivoraLogo size="lg" useOfficialImage={true} />
                </div>

                <div className="space-y-1.5">
                  <p className="text-xs sm:text-[13px] font-bold text-[#FF6500] uppercase tracking-[0.2em]">
                    CERTIFICAÇÃO OFICIAL DE PARCEIRO
                  </p>

                  <h1 className="text-2xl sm:text-[28px] font-extrabold text-[#0B192C] tracking-tight uppercase leading-tight">
                    COMPROVATIVO DE PARCEIRO REVENDEDOR
                  </h1>

                  <p className="text-sm sm:text-base font-bold text-[#1D4ED8] uppercase tracking-wide">
                    CREDENCIADO KIVORA SOFT
                  </p>
                </div>

                {/* Linha Divisória Fina */}
                <div className="w-full h-px bg-[#FF6500]/60 mt-4" />
              </div>

              {/* 2. CORPO TEXTUAL OFICIAL */}
              <div className="space-y-5 px-2 sm:px-6 text-center">
                
                {/* Parágrafo 1: Entidade Certificadora */}
                <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed max-w-2xl mx-auto">
                  A VISUAL SOFTWARE – Comércio e Prestação de Serviços, Lda., pessoa colectiva com o NIF 5002863944, com sede em Viana, Km 14, Incutal, Luanda, República de Angola, na qualidade de empresa desenvolvedora e detentora dos direitos do software KIVORA SOFT, certifica que:
                </p>

                {/* Caixa de Destaque do Parceiro */}
                <div className="py-2.5 px-4 my-2">
                  <h2 className="text-base sm:text-xl font-extrabold text-[#0B192C] uppercase tracking-wide">
                    [ {partnerName} ]
                  </h2>
                  <p className="text-[11px] sm:text-xs text-slate-600 font-medium mt-1">
                    NIF: [ {partnerNif} ] &nbsp;&nbsp;·&nbsp;&nbsp; Sede: [ {partnerRegion} ]
                  </p>
                </div>

                {/* Parágrafo 2: Concessão e Autorização */}
                <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed max-w-2xl mx-auto">
                  é Parceiro Revendedor oficialmente credenciado pela Visual Software, encontrando-se devidamente autorizado a comercializar, promover e revender o software de gestão e facturação electrónica <strong className="text-[#1D4ED8] font-bold">KIVORA SOFT</strong>, nos termos e condições estabelecidos no respectivo Contrato de Parceria de Revenda celebrado entre as partes.
                </p>

                {/* Parágrafo 3: Idoneidade e Propriedade Intelectual */}
                <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed max-w-2xl mx-auto">
                  O presente documento comprova a idoneidade e a autorização comercial do Parceiro acima identificado perante clientes, entidades públicas e privadas, não conferindo, por si só, qualquer direito de propriedade intelectual sobre o software KIVORA SOFT.
                </p>
              </div>

              {/* 3. TABELA DE 3 COLUNAS COM METADADOS */}
              <div className="bg-slate-50 border-y border-slate-200 py-3.5 px-4 sm:px-8 grid grid-cols-3 gap-2 text-center my-4">
                <div>
                  <p className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Nº DE CREDENCIAL
                  </p>
                  <p className="text-xs sm:text-sm font-bold text-[#0B192C] font-mono-num mt-0.5">
                    [ {partnerCode} ]
                  </p>
                </div>

                <div className="border-x border-slate-200 px-2">
                  <p className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    DATA DE EMISSÃO
                  </p>
                  <p className="text-xs sm:text-sm font-bold text-[#0B192C] font-mono-num mt-0.5">
                    [ {issueDateFormatted} ]
                  </p>
                </div>

                <div>
                  <p className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    VALIDADE
                  </p>
                  <p className="text-xs sm:text-sm font-bold text-[#0B192C] font-mono-num mt-0.5">
                    [ {validUntilFormatted} ]
                  </p>
                </div>
              </div>

              {/* 4. ASSINATURA E RODAPÉ INSTITUCIONAL */}
              <div className="text-center pt-4 pb-2 space-y-2">
                <div className="w-64 sm:w-72 border-b-2 border-slate-900 mx-auto" />
                <div>
                  <p className="text-sm font-bold text-[#0B192C]">
                    Domingos Marcos Narciso Correia
                  </p>
                  <p className="text-xs text-slate-600 italic">
                    Gerente Único — Visual Software, Lda.
                  </p>
                </div>

                <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium pt-3">
                  geral@visualsoftware.ao &nbsp;·&nbsp; +244 974 855 494 &nbsp;·&nbsp; Luanda, Angola
                </p>
              </div>

            </div>

          </div>

        </div>

        {/* Modal Footer / Actions (Hidden on Print) */}
        <div className="p-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950 shrink-0 print:hidden text-xs">
          <div className="text-slate-400 text-[11px] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Documento oficial formatado em <strong>A4 Standard</strong> com homologação legal.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-[#FF6500] hover:bg-[#EB5B00] active:bg-[#C94A00] text-white font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Comprovativo (A4)</span>
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
