import React from 'react';
import { ArrowLeft, FileText } from 'lucide-react';
import { KIVORA_INFO } from '../data/kivoraData';

interface TermsPageProps {
  onBack: () => void;
}

export const TermsPage: React.FC<TermsPageProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pt-28 pb-20 selection:bg-blue-600 selection:text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar à Página Principal</span>
        </button>

        <div className="bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-sm space-y-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900">Termos e Condições de Licenciamento</h1>
              <p className="text-xs text-slate-500">Kivora ERP • Visual Software Angola</p>
            </div>
          </div>

          <div className="space-y-6 text-xs md:text-sm text-slate-700 leading-relaxed">
            <h3 className="text-base font-extrabold text-slate-900">1. Licenciamento e Uso do Software</h3>
            <p>
              O Kivora ERP é um software de gestão empresarial e faturação certificado pela AGT sob o número de validação XXX/AGT/2026. A utilização da plataforma é concedida mediante subscrição (Cloud) ou aquisição de licença de uso (Desktop Local).
            </p>

            <h3 className="text-base font-extrabold text-slate-900">2. Responsabilidade sobre Dados Fiscais</h3>
            <p>
              O utilizador é responsável pela exatidão dos dados inseridos no sistema (NIFs, preços, alíquotas de impostos e artigos). O Kivora garante a integridade da numeração sequencial das séries, o cálculo automático das retenções e a geração da assinatura digital RS256.
            </p>

            <h3 className="text-base font-extrabold text-slate-900">3. Modo de Contingência</h3>
            <p>
              Em caso de indisponibilidade técnica da internet ou dos serviços da AGT, o Kivora disponibiliza o mecanismo legal de contingência por até 45 dias corridos, efetuando o reenvio automático assim que o sinal for restabelecido.
            </p>

            <h3 className="text-base font-extrabold text-slate-900">4. Suporte Técnico e Atualizações</h3>
            <p>
              Todas as subscrições ativas incluem suporte técnico através da equipa em Luanda ({KIVORA_INFO.phoneDisplay}) e atualizações fiscais automáticas sem custos adicionais em caso de alteração da legislação pela AGT.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
