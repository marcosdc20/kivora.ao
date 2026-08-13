import React from 'react';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { SCHOOL_INFO } from '../data/school';

interface PrivacyPolicyPageProps {
  onBack: () => void;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onBack }) => {
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
            <span>PROTEÇÃO DE DADOS & PRIVACIDADE</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-brand-dark">
            Política de Privacidade
          </h1>

          <p className="text-xs text-gray-400 font-bold uppercase">
            Última atualização: Agosto de 2026
          </p>

          <div className="prose max-w-none text-brand-body text-sm sm:text-base leading-relaxed space-y-6 pt-4 border-t border-gray-100">
            <p>
              O <strong>{SCHOOL_INFO.fullName}</strong> está profundamente comprometido em respeitar a privacidade e proteger os dados pessoais de todos os utilizadores do nosso sistema, escolas parceiras, encarregados de educação e alunos em Angola.
            </p>

            <h3 className="text-xl font-extrabold text-brand-dark">1. Recolha de Informações Pessoais</h3>
            <p>
              Recolhemos apenas as informações estritamente necessárias para o funcionamento e gestão do sistema escolar enviado voluntariamente pelos utilizadores:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Dados cadastrais de alunos e encarregados de educação;</li>
              <li>Contacto telefónico e e-mail para envio de comunicados e notificações;</li>
              <li>Histórico de presenças, avaliações e notas escolares;</li>
              <li>Informações de propinas e pagamentos de mensalidades.</li>
            </ul>

            <h3 className="text-xl font-extrabold text-brand-dark">2. Finalidade do Tratamento dos Dados</h3>
            <p>
              Os dados recolhidos destinam-se exclusivamente a:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Permitir o funcionamento dos módulos de gestão escolar e relatórios pedagógicos;</li>
              <li>Facilitar a comunicação entre a instituição de ensino e os encarregados de educação;</li>
              <li>Garantir o controlo de acessos e segurança da informação dos alunos.</li>
            </ul>

            <h3 className="text-xl font-extrabold text-brand-dark">3. Não Partilha de Dados com Terceiros</h3>
            <p>
              A Kivora não vende, aluga nem cede quaisquer dados pessoais ou organizacionais a entidades terceiras para fins comerciais ou publicitários.
            </p>

            <h3 className="text-xl font-extrabold text-brand-dark">4. Contacto Oficial de Privacidade</h3>
            <p>
              Para quaisquer questões relacionadas com a proteção dos seus dados pessoais, pode entrar em contacto através do e-mail: <strong>{SCHOOL_INFO.email}</strong>.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};
