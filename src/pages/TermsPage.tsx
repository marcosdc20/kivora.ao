import React from 'react';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { SCHOOL_INFO } from '../data/school';

interface TermsPageProps {
  onBack: () => void;
}

export const TermsPage: React.FC<TermsPageProps> = ({ onBack }) => {
  return (
    <div className="pt-20 animate-fadeIn bg-white min-h-screen">
      
      {/* Top Header Breadcrumb */}
      <div className="bg-gray-100 border-b border-gray-200 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-extrabold text-brand-dark hover:text-brand-green transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-brand-green" />
            <span>Voltar ao Início</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 bg-brand-green-light text-brand-green text-xs font-extrabold uppercase px-3 py-1 rounded-md">
            <ShieldCheck className="w-4 h-4" />
            <span>TERMOS E CONDIÇÕES LEGAIS</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-brand-dark">
            Termos de Uso
          </h1>

          <p className="text-xs text-gray-400 font-bold uppercase">
            Última atualização: Agosto de 2026
          </p>

          <div className="prose max-w-none text-brand-body text-sm sm:text-base leading-relaxed space-y-6 pt-4 border-t border-gray-100">
            <p>
              Ao aceder e utilizar o sistema <strong>{SCHOOL_INFO.fullName}</strong>, o utilizador aceita cumprir os seguintes Termos de Uso e Condições Gerais.
            </p>

            <h3 className="text-xl font-extrabold text-brand-dark">1. Utilização da Plataforma</h3>
            <p>
              O sistema destina-se à gestão administrativa, financeira e pedagógica de instituições de ensino em Angola, sendo o acesso restrito a utilizadores autorizados pelas escolas contratantes.
            </p>

            <h3 className="text-xl font-extrabold text-brand-dark">2. Propriedade Intelectual</h3>
            <p>
              Todos os conteúdos, módulos, código-fonte, marcas e logótipos apresentados na plataforma são propriedade exclusiva da Kivora e estão protegidos pelas leis de propriedade intelectual.
            </p>

            <h3 className="text-xl font-extrabold text-brand-dark">3. Responsabilidade das Informações</h3>
            <p>
              A instituição de ensino é responsável pela exatidão e atualização dos dados introduzidos no sistema relativos a alunos, professores, turmas e pagamentos.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};
