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
    <div className="modal-overlay fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 overflow-y-auto print:static print:p-0 print:m-0 print:bg-transparent print:backdrop-blur-none print:overflow-visible">
      <div className="modal-sheet bg-slate-900 rounded-2xl max-w-5xl w-full shadow-2xl border border-slate-800 flex flex-col max-h-[96vh] overflow-hidden animate-fadeIn print:border-none print:shadow-none print:rounded-none print:bg-transparent print:max-h-none print:overflow-visible print:w-full print:max-w-none">
        
        {/* Modal Top Bar (Hidden on Print) */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-950 shrink-0 print:hidden text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-white text-base">Documentos & Certificados Oficiais em A4</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Modelos institucionais emitidos pela <strong>VISUAL SOFTWARE</strong> e <strong>KIVORA ERP</strong>.
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
              className="text-slate-300 hover:text-white font-bold text-xs px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Link Copiado' : 'Copiar Link'}</span>
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

        {/* Tab Switcher (Hidden on Print) */}
        <div className="px-5 py-3 border-b border-slate-800 flex gap-2 bg-slate-900/90 shrink-0 print:hidden overflow-x-auto">
          <button
            onClick={() => setActiveDoc('parceria_visual')}
            className={`text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeDoc === 'parceria_visual'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-blue-200" />
            <span>1. Certificado de Parceria Comercial (Visual Software)</span>
          </button>

          <button
            onClick={() => setActiveDoc('revenda_kivora')}
            className={`text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeDoc === 'revenda_kivora'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <FileText className="w-4 h-4 text-amber-200" />
            <span>2. Autorização de Revenda de Software (Kivora ERP)</span>
          </button>
        </div>

        {/* Certificate Preview Wrapper (A4 Viewport) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-950/70 flex justify-center print:p-0 print:m-0 print:bg-transparent print:overflow-visible">
          
          {/* =========================================================================
              DOCUMENTO 1: CERTIFICADO DE PARCERIA COMERCIAL (VISUAL SOFTWARE)
              ========================================================================= */}
          {activeDoc === 'parceria_visual' && (
            <div className="printable-document certificate-document a4-document bg-white text-slate-900 w-full max-w-[800px] min-h-[1050px] p-10 sm:p-14 shadow-2xl flex flex-col justify-between relative print:shadow-none print:p-0 print:m-0 print:min-h-0 print:w-full print:max-w-none print:min-h-[265mm] font-sans">
              
              {/* Top Corporate Line — No fluxo do documento com margem inferior generosa */}
              <div className="w-full h-1.5 bg-slate-900 mb-6 print:mb-6 shrink-0" />

              <div className="space-y-6 sm:space-y-7 flex-1">
                {/* Header Oficial: Visual Software */}
                <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 bg-slate-950 text-white flex items-center justify-center font-black text-sm rounded-lg tracking-wider">
                        VS
                      </div>
                      <div>
                        <span className="font-black text-xl tracking-tight text-slate-950 block leading-tight">
                          VISUAL SOFTWARE
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                          Divisão de Tecnologia, Sistemas e Gestão Comercial
                        </span>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium pt-1">
                      NIF: 5417088920 • Luanda, República de Angola
                    </p>
                  </div>

                  <div className="text-right flex flex-col items-end">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(validationUrl)}&margin=0`}
                      alt="QR de Validação Institucional"
                      className="w-16 h-16 border border-slate-300 p-1 rounded bg-white shadow-2xs"
                    />
                    <span className="text-[9px] font-mono text-slate-600 mt-1 font-bold">
                      N.º {vsRegNumber}
                    </span>
                  </div>
                </div>

                {/* Título Oficial do Certificado */}
                <div className="text-center space-y-1.5 pt-1">
                  <span className="inline-block text-[10px] font-black uppercase text-blue-900 bg-blue-50 border border-blue-200 px-3.5 py-1 rounded-full tracking-wider">
                    Programa Nacional de Canais & Distribuição Autorizada
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-950 uppercase tracking-tight">
                    Certificado de Parceria Comercial
                  </h1>
                  <p className="text-xs text-slate-600 font-semibold uppercase tracking-wider">
                    Homologação Técnica e Credenciação Institucional de Canal
                  </p>
                </div>

                {/* Declaração Formal */}
                <div className="text-center max-w-2xl mx-auto text-xs sm:text-sm text-slate-700 leading-relaxed space-y-3 pt-1">
                  <p className="text-xs text-slate-600">
                    A <strong>VISUAL SOFTWARE</strong> atesta e certifica nos termos do seu regulamento corporativo de canais que a entidade:
                  </p>
                  <div className="bg-slate-50 border-y-2 border-slate-300 py-3.5 px-6">
                    <h2 className="text-lg sm:text-xl font-black text-slate-950 uppercase tracking-wide">
                      {partnerName}
                    </h2>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed text-justify">
                    Inscrita sob o NIF n.º <strong>{partnerNif}</strong> e portadora do Código Oficial de Parceiro <strong>{partnerCode}</strong>, concluiu com distinção o processo de validação técnica, operacional e comercial, encontrando-se formalmente <strong>HOMOLOGADA E CREDENCIADA</strong> como parceiro oficial autorizado para distribuição, implementação e suporte de soluções de software de gestão em todo o território nacional.
                  </p>
                </div>

                {/* Tabela Estruturada de Detalhes da Parceria */}
                <div className="border border-slate-300 rounded-lg overflow-hidden text-xs">
                  <div className="bg-slate-100 border-b border-slate-300 px-4 py-2 font-black text-slate-800 uppercase text-[10px] tracking-wider">
                    Especificação do Credenciamento Oficial
                  </div>
                  <table className="w-full text-left divide-y divide-slate-200">
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="py-3 px-4 font-semibold text-slate-600 w-1/3 bg-slate-50/60">Categoria da Parceria:</td>
                        <td className="py-3 px-4 font-black text-slate-950 uppercase">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-900 border border-blue-200 text-xs">
                            {partnerTier} PARTNER
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-semibold text-slate-600 bg-slate-50/60">Âmbito Territorial:</td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {partnerRegion} • República de Angola
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-semibold text-slate-600 bg-slate-50/60">Data de Homologação:</td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {issueDateFormatted}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-semibold text-slate-600 bg-slate-50/60">Validade do Credenciamento:</td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          Anual (Renovação Contínua)
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-semibold text-slate-600 bg-slate-50/60">Estado do Credenciamento:</td>
                        <td className="py-3 px-4 font-bold text-emerald-700">
                          ● HOMOLOGADO E ACTIVO NA REDE NACIONAL
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Competências Autorizadas */}
                <div className="bg-slate-50 p-4 border border-slate-200 rounded-lg text-xs text-slate-600 leading-relaxed text-justify space-y-1">
                  <p className="font-bold text-slate-900 text-[11px] uppercase tracking-wide">
                    Âmbito de Actuação Autorizado:
                  </p>
                  <p>
                    O titular deste certificado está plenamente capacitado para apresentação comercial, demonstração técnica, ativação e fornecimento de licenças de software, configuração de postos de trabalho e prestação de assistência de primeira linha a clientes finais.
                  </p>
                </div>
              </div>

              {/* Rodapé e Assinaturas Institucionais */}
              <div className="pt-8 border-t-2 border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-6 text-[11px] avoid-break mt-6">
                <div className="text-center sm:text-left space-y-0.5">
                  <p className="font-black text-slate-950 text-xs">VISUAL SOFTWARE — ANGOLA</p>
                  <p className="text-slate-500 text-[10px]">Departamento de Parcerias & Operações Comerciais</p>
                  <p className="text-slate-400 text-[9px]">Validação pública online: {validationUrl}</p>
                </div>

                <div className="text-center sm:text-right border-t sm:border-t-0 sm:border-l border-slate-200 pt-4 sm:pt-0 sm:pl-6 space-y-1">
                  <div className="w-48 border-b border-slate-600 pb-1 mb-1 mx-auto sm:ml-auto">
                    <p className="font-serif italic text-slate-800 text-xs font-bold">Visual Software Direção</p>
                  </div>
                  <p className="font-black text-slate-950 text-[10px] uppercase">Direção Comercial & Canais</p>
                  <p className="text-slate-400 text-[9px] font-mono">Chave de Autenticação: {vsRegNumber}</p>
                </div>
              </div>

            </div>
          )}

          {/* =========================================================================
              DOCUMENTO 2: AUTORIZAÇÃO DE REVENDA DE SOFTWARE (KIVORA ERP)
              ========================================================================= */}
          {activeDoc === 'revenda_kivora' && (
            <div className="printable-document certificate-document a4-document bg-white text-slate-900 w-full max-w-[800px] min-h-[1050px] p-10 sm:p-14 shadow-2xl flex flex-col justify-between relative print:shadow-none print:p-0 print:m-0 print:min-h-0 print:w-full print:max-w-none print:min-h-[265mm] font-sans">
              
              {/* Top Corporate Line — No fluxo do documento com margem inferior generosa */}
              <div className="w-full h-1.5 bg-slate-900 mb-6 print:mb-6 shrink-0" />

              <div className="space-y-6 sm:space-y-7 flex-1">
                {/* Cabeçalho Oficial: Kivora ERP + AGT */}
                <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5">
                  <div className="space-y-1">
                    <img
                      src="/imagens/logo_sem_fundo.png"
                      alt="Kivora ERP"
                      className="h-10 w-auto object-contain mb-1.5"
                    />
                    <span className="font-black text-lg tracking-tight text-slate-950 block leading-tight">
                      Software de Faturação & Gestão Comercial
                    </span>
                    <p className="text-[11px] text-slate-700 font-bold">
                      Certificação Fiscal AGT n.º 384/AGT/2024 • Decreto Presidencial n.º 71/25
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Propriedade Industrial e Direitos Reservados à Visual Software
                    </p>
                  </div>

                  <div className="text-right flex flex-col items-end">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(validationUrl)}&margin=0`}
                      alt="QR de Autorização de Revenda"
                      className="w-16 h-16 border border-slate-300 p-1 rounded bg-white shadow-2xs"
                    />
                    <span className="text-[9px] font-mono text-slate-600 mt-1 font-bold">
                      AUT. {kvraRegNumber}
                    </span>
                  </div>
                </div>

                {/* Título da Autorização */}
                <div className="text-center space-y-1.5 pt-1">
                  <span className="inline-block text-[10px] font-black uppercase text-amber-900 bg-amber-50 border border-amber-200 px-3.5 py-1 rounded-full tracking-wider">
                    Outorga de Licença de Comercialização & Distribuição
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-950 uppercase tracking-tight">
                    Autorização de Revenda de Software
                  </h1>
                  <p className="text-xs text-slate-600 font-semibold uppercase tracking-wider">
                    Concessão Formal para Distribuição do Kivora ERP em Angola
                  </p>
                </div>

                {/* Declaração Formal de Outorga */}
                <div className="text-center max-w-2xl mx-auto text-xs sm:text-sm text-slate-700 leading-relaxed space-y-3 pt-1">
                  <p className="text-xs text-slate-600">
                    A <strong>VISUAL SOFTWARE</strong>, entidade titular dos direitos de exploração e propriedade industrial da plataforma <strong>KIVORA ERP</strong>, confere pelo presente instrumento autorização expressa à entidade:
                  </p>
                  <div className="bg-slate-50 border-y-2 border-slate-300 py-3.5 px-6">
                    <h2 className="text-lg sm:text-xl font-black text-slate-950 uppercase tracking-wide">
                      {partnerName}
                    </h2>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed text-justify">
                    Pessoa coletiva portadora do NIF n.º <strong>{partnerNif}</strong> e Código de Revendedor <strong>{partnerCode}</strong>, com plenos poderes para <strong>comercialização, fornecimento de licenças de uso, instalação e configuração de postos em rede local e suporte operacional</strong> do software Kivora ERP perante clientes comerciais em toda a República de Angola.
                  </p>
                </div>

                {/* Tabela de Especificação da Concessão */}
                <div className="border border-slate-300 rounded-lg overflow-hidden text-xs">
                  <div className="bg-slate-100 border-b border-slate-300 px-4 py-2 font-black text-slate-800 uppercase text-[10px] tracking-wider">
                    Termos da Concessão de Revenda Autorizada
                  </div>
                  <table className="w-full text-left divide-y divide-slate-200">
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="py-3 px-4 font-semibold text-slate-600 w-1/3 bg-slate-50/60">Software Autorizado:</td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          Kivora ERP v2.4 (Edição Comercial & Multi-posto)
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-semibold text-slate-600 bg-slate-50/60">Certificação Fiscal AGT:</td>
                        <td className="py-3 px-4 font-black text-slate-950">
                          Certificado Oficial n.º 384/AGT/2024
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-semibold text-slate-600 bg-slate-50/60">Modalidade Autorizada:</td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          Canal Oficial de Distribuição, Ativação de Licenças e Suporte
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-semibold text-slate-600 bg-slate-50/60">Módulos Abrangidos:</td>
                        <td className="py-3 px-4 text-slate-800">
                          Faturação Certificada, Stocks, Tesouraria, SAF-T (AO), Relatórios
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-semibold text-slate-600 bg-slate-50/60">Estado da Autorização:</td>
                        <td className="py-3 px-4 font-bold text-emerald-700">
                          ● AUTORIZAÇÃO EM VIGOR E REGULARIZADA
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Conformidade Fiscal e Legal */}
                <div className="bg-slate-50 p-4 border border-slate-200 rounded-lg text-xs text-slate-600 leading-relaxed text-justify space-y-1">
                  <p className="font-bold text-slate-900 text-[11px] uppercase tracking-wide">
                    Garantia de Conformidade Legal & Tributária:
                  </p>
                  <p>
                    O software Kivora ERP cumpre com rigor os requisitos de assinatura digital com chave assimétrica RSA-2048, comunicação e exportação do ficheiro SAF-T (AO), em total alinhamento com as normas da AGT e o Decreto Presidencial n.º 71/25.
                  </p>
                </div>
              </div>

              {/* Rodapé e Assinaturas */}
              <div className="pt-8 border-t-2 border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-6 text-[11px] avoid-break mt-6">
                <div className="text-center sm:text-left space-y-0.5">
                  <p className="font-black text-slate-950 text-xs">KIVORA TECNOLOGIAS & VISUAL SOFTWARE</p>
                  <p className="text-slate-500 text-[10px]">Departamento de Licenciamento & Engenharia de Software</p>
                  <p className="text-slate-400 text-[9px]">Verificação pública em https://kivora.ao/#validar-parceiro</p>
                </div>

                <div className="text-center sm:text-right border-t sm:border-t-0 sm:border-l border-slate-200 pt-4 sm:pt-0 sm:pl-6 space-y-1">
                  <div className="w-48 border-b border-slate-600 pb-1 mb-1 mx-auto sm:ml-auto">
                    <p className="font-serif italic text-slate-800 text-xs font-bold">Direção Técnica Kivora</p>
                  </div>
                  <p className="font-black text-slate-950 text-[10px] uppercase">Direção Técnica e Engenharia</p>
                  <p className="text-slate-400 text-[9px] font-mono">Chave Digital: {kvraRegNumber}</p>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer / Actions (Hidden on Print) */}
        <div className="p-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950 shrink-0 print:hidden text-xs">
          <div className="text-slate-400 text-[11px]">
            Documento formatado em <strong>A4 standard</strong> para arquivamento oficial ou apresentação ao cliente.
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Certificado Ativo</span>
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
