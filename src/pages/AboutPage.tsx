import React from 'react';
import { ShieldCheck, Award, Users, CheckCircle, Sparkles } from 'lucide-react';
import { KIVORA_INFO } from '../data/kivoraData';

interface AboutPageProps {
  onOpenDemoModal: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onOpenDemoModal }) => {
  return (
    <div className="min-h-screen bg-white text-slate-900 pt-28 pb-20 selection:bg-blue-600 selection:text-white">
      
      {/* Header Banner - Clean Light Neutral */}
      <section className="bg-slate-50 border-b border-slate-200/80 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <span className="text-blue-600 font-bold text-xs uppercase tracking-wider bg-blue-50 px-3.5 py-1 rounded-full border border-blue-100">
            Sobre a Visual Software & Kivora
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Tecnologia de Gestão de Alto Desempenho para Angola
          </h1>
          <p className="text-slate-600 text-sm max-w-2xl mx-auto leading-relaxed">
            Desenvolvemos o Kivora ERP para capacitar empresários e gestores angolanos com software robusto, alinhado com a legislação tributária da AGT e com suporte técnico local.
          </p>
        </div>
      </section>

      {/* Main Content Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 space-y-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              A Nossa Missão: Simplificar e Garantir a Conformidade Fiscal das Empresas
            </h2>
            
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Fundada em Luanda, a <strong>Visual Software</strong> nasceu com a missão de transformar a forma como as empresas em Angola gerem os seus processos comerciais, financeiros e contabilísticos.
            </p>

            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              O <strong>Kivora ERP</strong> representa a evolução tecnológica necessária para responder aos desafios da Faturação Eletrónica (Decreto Presidencial n.º 71/25), garantindo interoperabilidade com os webservices da AGT, segurança criptográfica e operação ininterrupta.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="text-xs font-bold text-slate-800">Programa Validado e Certificado pela AGT nº XXX/AGT/2026</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <CheckCircle className="w-5 h-5 text-blue-600 shrink-0" />
                <span className="text-xs font-bold text-slate-800">Equipa Técnica de Desenvolvimento e Suporte Sediada em Luanda</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <Award className="w-5 h-5 text-amber-500 shrink-0" />
                <span className="text-xs font-bold text-slate-800">Arquitetura Resiliente: Nuvem, Desktop Local e Operação Offline</span>
              </div>
            </div>

          </div>

          <div className="lg:col-span-6">
            <div className="relative rounded-2xl overflow-hidden shadow-md border border-slate-200 bg-slate-100 p-2">
              <img
                src={KIVORA_INFO.appOverviewImage}
                alt="Kivora Software Platform"
                className="w-full h-auto rounded-xl object-cover"
              />
            </div>
          </div>

        </div>

        {/* Pillars / Values Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">Rigor Fiscal & Segurança</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Cada linha de código do Kivora é auditada para garantir o cumprimento estrito do Código do IVA, PGC-AO, IRT 2026 e transmissão segura de dados.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">Inovação Orientada ao Cliente</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Atualizações contínuas e automáticas para incorporar novas regras legais e funcionalidades solicitadas pelos nossos clientes em Angola.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">Suporte & Formação Local</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Não é apenas um software: oferecemos acompanhamento personalizado, formação presencial para a sua equipa e canal direto de WhatsApp.
            </p>
          </div>
        </div>

        {/* CTA Banner - Clean Neutral */}
        <div className="mt-16 bg-slate-900 rounded-3xl p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-md">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl font-extrabold">
              Quer conhecer o Kivora de perto?
            </h3>
            <p className="text-slate-300 text-xs max-w-xl">
              Agende uma sessão de apresentação presencial no seu escritório em Luanda ou via reunião online.
            </p>
          </div>
          <button
            onClick={onOpenDemoModal}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-7 py-3.5 rounded-xl shadow-sm transition-all flex items-center gap-2 shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>Agendar Apresentação</span>
          </button>
        </div>

      </section>

    </div>
  );
};
