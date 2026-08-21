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
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 shadow-xs transition-all mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar à Página Principal</span>
        </button>

        <div className="card-premium p-8 md:p-12 rounded-3xl space-y-8">
          <div className="flex items-center gap-3.5 border-b border-slate-100 pb-6">
            <div className="p-3 bg-blue-50 text-blue-700 rounded-2xl border border-blue-100">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-950">Termos e Condições de Licenciamento</h1>
              <p className="text-xs text-slate-500 font-semibold">KIVORA ERP • Kivora Tecnologias, Lda. • Luanda, Angola</p>
            </div>
          </div>

          <div className="space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <h3 className="text-base font-extrabold text-slate-950">1. Licenciamento e Uso do Software</h3>
            <p>
              O KIVORA ERP é um software de gestão empresarial e faturação certificado pela Administração Geral Tributária (AGT) sob a certificação n.º 384/AGT/2024 e em conformidade com o Decreto Presidencial n.º 71/25. A utilização da plataforma é concedida mediante subscrição de planos ou aquisição de licença perpétua para execução local (Desktop Offline).
            </p>

            <h3 className="text-base font-extrabold text-slate-950">2. Responsabilidade sobre Dados Fiscais</h3>
            <p>
              O utilizador é responsável pela exatidão dos dados inseridos no sistema (NIFs, preços, alíquotas de impostos e artigos). O KIVORA garante a integridade da numeração sequencial das séries, o cálculo automático das retenções na fonte e a geração da assinatura digital com algoritmo RSA/SHA e QR Code em todos os documentos.
            </p>

            <h3 className="text-base font-extrabold text-slate-950">3. Modo de Contingência Offline</h3>
            <p>
              Em caso de indisponibilidade técnica da internet ou dos serviços externos, o KIVORA opera 100% offline em rede local (LAN), armazenando de forma segura e auditável todas as transações fiscais.
            </p>

            <h3 className="text-base font-extrabold text-slate-950">4. Suporte Técnico e Atualizações</h3>
            <p>
              Todas as licenças e subscrições incluem suporte técnico especializado através da equipa em Luanda ({KIVORA_INFO.phoneDisplay}) e atualizações fiscais homologadas sem custos adicionais sempre que a AGT publicar novas diretrizes normativas.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
