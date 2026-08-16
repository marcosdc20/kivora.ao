import React, { useState } from 'react';
import {
  Award, ShieldCheck, Printer, X,
  CheckCircle2, FileText, Copy
} from 'lucide-react';

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
  const [activeDoc, setActiveDoc] = useState<'parceria_visual' | 'revenda_kivora'>('parceria_visual');
  const [copiedLink, setCopiedLink] = useState(false);

  const partnerCode = partner.partnerCode || 'PRT-KIVORA';
  const partnerName = partner.partnerName || 'Parceiro Homologado';
  const partnerNif = partner.nif || 'Não Informado / Em Validação';
  const partnerTier = (partner.tier || 'bronze').toUpperCase();
  const partnerRegion = partner.region || 'Luanda, Angola';
  const issueDate = partner.createdAt ? new Date(partner.createdAt) : new Date();
  const issueDateFormatted = issueDate.toLocaleDateString('pt-AO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const vsRegNumber = `VS-PAR-${partnerCode.replace(/[^A-Z0-9]/g, '')}-${issueDate.getFullYear()}`;
  const kvraRegNumber = `KVRA-AUT-${partnerCode.replace(/[^A-Z0-9]/g, '')}-${issueDate.getFullYear()}`;
  const validationUrl = `https://kivora.ao/#validar-parceiro?p=${encodeURIComponent(partnerCode)}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 flex flex-col max-h-[95vh] overflow-hidden animate-fadeIn">
        
        {/* Modal Top Bar (Hidden on Print) */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/80 shrink-0 print:hidden">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-600" />
              <h3 className="font-black text-slate-900 text-base">Documentos & Certificados Oficiais do Parceiro</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Certificação institucional emitida pela <strong>VISUAL SOFTWARE</strong> e Autorização de Revenda <strong>KIVORA ERP</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / Salvar PDF (A4)</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher (Hidden on Print) */}
        <div className="px-5 pt-3 pb-2 border-b border-slate-100 flex gap-2 bg-white shrink-0 print:hidden">
          <button
            onClick={() => setActiveDoc('parceria_visual')}
            className={`text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeDoc === 'parceria_visual'
                ? 'bg-blue-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-blue-300" />
            <span>1. Certificado de Parceria (Visual Software)</span>
          </button>

          <button
            onClick={() => setActiveDoc('revenda_kivora')}
            className={`text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeDoc === 'revenda_kivora'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-4 h-4 text-amber-200" />
            <span>2. Autorização de Revenda (Kivora ERP)</span>
          </button>
        </div>

        {/* Certificate Container (A4 Printable Document) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100/60 flex justify-center">
          
          {/* =========================================================================
              DOCUMENTO 1: CERTIFICADO DE PARCERIA & HOMOLOGAÇÃO COM A VISUAL SOFTWARE
              ========================================================================= */}
          {activeDoc === 'parceria_visual' && (
            <div className="certificate-document bg-white border border-slate-300 rounded-2xl p-8 sm:p-12 max-w-[800px] w-full shadow-lg relative flex flex-col justify-between min-h-[980px] print:shadow-none print:border-0 print:p-0 print:m-0 print:min-h-0 text-slate-900 font-sans">
              
              {/* Moldura Interna Clássica e Séria */}
              <div className="border border-slate-200 p-8 sm:p-10 rounded-xl relative flex flex-col justify-between h-full space-y-6">
                
                {/* Cabeçalho Oficial: Visual Software */}
                <div className="flex items-start justify-between border-b border-slate-200 pb-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-slate-900 text-white flex items-center justify-center font-black text-xs rounded-md">
                        VS
                      </div>
                      <span className="font-black text-lg sm:text-xl tracking-tight text-slate-950">
                        VISUAL SOFTWARE
                      </span>
                    </div>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                      Divisão de Tecnologia, Sistemas e Gestão Comercial
                    </p>
                    <p className="text-[10px] text-slate-400">
                      NIF: 5417088920 • Luanda, República de Angola
                    </p>
                  </div>

                  <div className="text-right flex flex-col items-end">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent(validationUrl)}&margin=0`}
                      alt="QR de Validação Institucional"
                      className="w-16 h-16 border border-slate-200 p-1 rounded-lg bg-white"
                    />
                    <span className="text-[9px] font-mono text-slate-400 mt-1 font-bold">
                      N.º {vsRegNumber}
                    </span>
                  </div>
                </div>

                {/* Título do Certificado */}
                <div className="text-center space-y-2 my-2">
                  <span className="inline-block text-[10px] font-black uppercase text-blue-800 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full tracking-wider">
                    Programa Nacional de Canais & Distribuição Autorizada
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-950 uppercase tracking-tight">
                    Certificado de Parceria Comercial
                  </h1>
                  <p className="text-xs text-slate-500 font-medium">
                    Homologação Técnica e Credenciação de Canal Autorizado
                  </p>
                </div>

                {/* Declaração Formal */}
                <div className="text-center max-w-2xl mx-auto text-xs sm:text-sm text-slate-700 leading-relaxed space-y-3">
                  <p>
                    A <strong>VISUAL SOFTWARE</strong> certifica para os devidos efeitos que a entidade:
                  </p>
                  <p className="text-base sm:text-lg font-black text-slate-950 py-1 uppercase tracking-wide border-y border-slate-100">
                    {partnerName}
                  </p>
                  <p className="text-xs text-slate-600 leading-normal">
                    Inscrita sob o NIF n.º <strong>{partnerNif}</strong> e portadora do Código Oficial de Parceiro <strong>{partnerCode}</strong>, cumpre integralmente os requisitos de qualificação técnica, operacional e comercial, encontrando-se formalmente <strong>HOMOLOGADA E CREDENCIADA</strong> como parceiro oficial de distribuição de soluções tecnológicas.
                  </p>
                </div>

                {/* Tabela de Especificação da Parceria */}
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 font-bold text-slate-700 uppercase text-[10px] tracking-wider">
                    Dados de Registo & Credenciação
                  </div>
                  <div className="divide-y divide-slate-100">
                    <div className="grid grid-cols-3 p-3">
                      <span className="text-slate-500 font-medium">Categoria da Parceria:</span>
                      <span className="col-span-2 font-bold text-slate-900 uppercase">
                        {partnerTier} PARTNER
                      </span>
                    </div>
                    <div className="grid grid-cols-3 p-3">
                      <span className="text-slate-500 font-medium">Âmbito Territorial:</span>
                      <span className="col-span-2 font-bold text-slate-900">
                        {partnerRegion} • República de Angola
                      </span>
                    </div>
                    <div className="grid grid-cols-3 p-3">
                      <span className="text-slate-500 font-medium">Data de Homologação:</span>
                      <span className="col-span-2 font-bold text-slate-900">
                        {issueDateFormatted}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 p-3">
                      <span className="text-slate-500 font-medium">Estado do Credenciamento:</span>
                      <span className="col-span-2 font-bold text-emerald-700 flex items-center gap-1.5">
                        ● HOMOLOGADO E ACTIVO
                      </span>
                    </div>
                  </div>
                </div>

                {/* Rodapé e Assinaturas Institucionais */}
                <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6 text-[11px]">
                  <div className="text-center sm:text-left space-y-0.5">
                    <p className="font-bold text-slate-900">VISUAL SOFTWARE — ANGOLA</p>
                    <p className="text-slate-400 text-[10px]">Departamento de Parcerias & Operações Comerciais</p>
                    <p className="text-slate-400 text-[10px]">Validável em https://kivora.ao/#validar-parceiro</p>
                  </div>

                  <div className="text-center sm:text-right border-t sm:border-t-0 sm:border-l border-slate-200 pt-4 sm:pt-0 sm:pl-6 space-y-1">
                    <div className="w-44 h-9 border-b border-slate-400 mx-auto sm:ml-auto flex items-end justify-center pb-1">
                      <span className="font-serif italic text-slate-700 text-xs">Visual Software Direção</span>
                    </div>
                    <p className="font-bold text-slate-900 text-[10px] uppercase">Direção Comercial & Canais</p>
                    <p className="text-slate-400 text-[9px]">Chave Digital: {vsRegNumber}</p>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* =========================================================================
              DOCUMENTO 2: CERTIFICADO DE AUTORIZAÇÃO DE REVENDA DO SOFTWARE KIVORA ERP
              ========================================================================= */}
          {activeDoc === 'revenda_kivora' && (
            <div className="certificate-document bg-white border border-slate-300 rounded-2xl p-8 sm:p-12 max-w-[800px] w-full shadow-lg relative flex flex-col justify-between min-h-[980px] print:shadow-none print:border-0 print:p-0 print:m-0 print:min-h-0 text-slate-900 font-sans">
              
              {/* Moldura Interna Clássica e Séria */}
              <div className="border border-slate-200 p-8 sm:p-10 rounded-xl relative flex flex-col justify-between h-full space-y-6">
                
                {/* Cabeçalho Oficial: Kivora ERP + Visual Software */}
                <div className="flex items-start justify-between border-b border-slate-200 pb-6">
                  <div>
                    <img
                      src="/imagens/logo_sem_fundo.png"
                      alt="Kivora ERP"
                      className="h-10 w-auto object-contain"
                    />
                    <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mt-2">
                      Software de Faturação & Gestão Comercial
                    </p>
                    <p className="text-[10px] text-slate-500 font-semibold">
                      Certificação Fiscal AGT n.º 384/AGT/2024 • Dec. Presidencial n.º 71/25
                    </p>
                  </div>

                  <div className="text-right flex flex-col items-end">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent(validationUrl)}&margin=0`}
                      alt="QR de Autorização de Revenda"
                      className="w-16 h-16 border border-slate-200 p-1 rounded-lg bg-white"
                    />
                    <span className="text-[9px] font-mono text-slate-400 mt-1 font-bold">
                      AUT. {kvraRegNumber}
                    </span>
                  </div>
                </div>

                {/* Título da Autorização */}
                <div className="text-center space-y-2 my-2">
                  <span className="inline-block text-[10px] font-black uppercase text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full tracking-wider">
                    Outorga de Licença de Comercialização & Distribuição
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-950 uppercase tracking-tight">
                    Autorização de Revenda de Software
                  </h1>
                  <p className="text-xs text-slate-500 font-medium">
                    Concessão Formal para Distribuição do Kivora ERP em Angola
                  </p>
                </div>

                {/* Declaração Formal de Outorga */}
                <div className="text-center max-w-2xl mx-auto text-xs sm:text-sm text-slate-700 leading-relaxed space-y-3">
                  <p className="text-xs text-slate-600">
                    A <strong>VISUAL SOFTWARE</strong>, titular dos direitos de exploração e propriedade industrial da plataforma <strong>KIVORA ERP</strong>, confere pelo presente instrumento autorização expressa à entidade:
                  </p>
                  <p className="text-base sm:text-lg font-black text-slate-950 py-1 uppercase tracking-wide border-y border-slate-100">
                    {partnerName}
                  </p>
                  <p className="text-xs text-slate-600 leading-normal">
                    Portadora do NIF n.º <strong>{partnerNif}</strong> e Código de Revendedor <strong>{partnerCode}</strong>, com plenos poderes para <strong>comercialização, emissão de licenças, instalação de postos de trabalho e suporte técnico</strong> do software Kivora ERP perante clientes comerciais em todo o território nacional.
                  </p>
                </div>

                {/* Tabela de Especificação da Concessão */}
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 font-bold text-slate-700 uppercase text-[10px] tracking-wider">
                    Termos da Concessão de Revenda
                  </div>
                  <div className="divide-y divide-slate-100">
                    <div className="grid grid-cols-3 p-3">
                      <span className="text-slate-500 font-medium">Software Autorizado:</span>
                      <span className="col-span-2 font-bold text-slate-900">
                        Kivora ERP v2.4 (Edição Comercial & Multi-posto)
                      </span>
                    </div>
                    <div className="grid grid-cols-3 p-3">
                      <span className="text-slate-500 font-medium">Certificação AGT:</span>
                      <span className="col-span-2 font-bold text-slate-900">
                        Certificado Oficial n.º 384/AGT/2024
                      </span>
                    </div>
                    <div className="grid grid-cols-3 p-3">
                      <span className="text-slate-500 font-medium">Modalidade Autorizada:</span>
                      <span className="col-span-2 font-bold text-slate-900">
                        Canal Oficial de Distribuição, Ativação de Licenças e Suporte
                      </span>
                    </div>
                    <div className="grid grid-cols-3 p-3">
                      <span className="text-slate-500 font-medium">Estado da Autorização:</span>
                      <span className="col-span-2 font-bold text-emerald-700 flex items-center gap-1.5">
                        ● AUTORIZAÇÃO EM VIGOR E REGULARIZADA
                      </span>
                    </div>
                  </div>
                </div>

                {/* Rodapé e Assinaturas */}
                <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6 text-[11px]">
                  <div className="text-center sm:text-left space-y-0.5">
                    <p className="font-bold text-slate-900">KIVORA TECNOLOGIAS & VISUAL SOFTWARE</p>
                    <p className="text-slate-400 text-[10px]">Departamento de Licenciamento & Engenharia de Software</p>
                    <p className="text-slate-400 text-[10px]">Verificação pública em https://kivora.ao/#validar-parceiro</p>
                  </div>

                  <div className="text-center sm:text-right border-t sm:border-t-0 sm:border-l border-slate-200 pt-4 sm:pt-0 sm:pl-6 space-y-1">
                    <div className="w-44 h-9 border-b border-slate-400 mx-auto sm:ml-auto flex items-end justify-center pb-1">
                      <span className="font-serif italic text-slate-700 text-xs">Direção Técnica Kivora</span>
                    </div>
                    <p className="font-bold text-slate-900 text-[10px] uppercase">Direção Técnica e Engenharia</p>
                    <p className="text-slate-400 text-[9px]">Chave Digital: {kvraRegNumber}</p>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Modal Footer / Actions (Hidden on Print) */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white shrink-0 print:hidden text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(validationUrl);
                setCopiedLink(true);
                setTimeout(() => setCopiedLink(false), 2500);
              }}
              className="text-slate-600 hover:text-slate-900 font-bold px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
            >
              {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Link Copiado!' : 'Copiar Link de Verificação'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Certificado Ativo</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
