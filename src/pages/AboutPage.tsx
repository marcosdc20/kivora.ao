import React, { useState, useEffect } from 'react';
import { PageHero } from '../components/PageHero';
import { ShieldCheck, Award, Users, CheckCircle, MapPin, Phone, Mail, ArrowRight } from 'lucide-react';
import {
  subscribeSystemSettings, getCachedSystemSettings,
  SystemCompanySettings
} from '../services/systemSettingsService';

import executivosImg from '../assets/kivora/executivos-kivora.jpg';

interface AboutPageProps {
  onOpenDemoModal: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onOpenDemoModal }) => {
  const [settings, setSettings] = useState<SystemCompanySettings>(getCachedSystemSettings());

  useEffect(() => {
    const unsub = subscribeSystemSettings(setSettings);
    return () => unsub();
  }, []);
  return (
    <div className="min-h-screen bg-white text-slate-900 page-enter">
      
      {/* Header Banner Showcase */}
      <PageHero
        image={executivosImg}
        tag="Sobre a Kivora Tecnologias"
        title="Tecnologia de Gestão e Faturação para Angola"
        sub="Desenvolvemos o KIVORA ERP para capacitar empresários e gestores angolanos com software robusto, alinhado com as normas da AGT e com suporte presencial em Luanda."
      />

      {/* Main Content Showcase */}
      <section className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-16 sm:py-24 space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 space-y-6">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 leading-tight">
              A Nossa Missão: Simplificar e Garantir a Conformidade Fiscal das Empresas
            </h2>
            
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Fundada em Luanda, a <strong>Kivora Tecnologias</strong> nasceu com a missão de transformar a forma como as empresas em Angola gerem os seus processos comerciais, financeiros e contabilísticos.
            </p>

            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              O <strong>Kivora ERP</strong> representa a evolução tecnológica necessária para responder aos desafios da Faturação Eletrónica (Decreto Presidencial n.º 71/25), garantindo interoperabilidade com as diretrizes da AGT, segurança criptográfica e operação local ininterrupta.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="text-xs font-bold text-slate-800">Software Validado e Certificado em Conformidade com a AGT</span>
              </div>
              <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                <CheckCircle className="w-5 h-5 text-blue-600 shrink-0" />
                <span className="text-xs font-bold text-slate-800">Equipa Técnica de Desenvolvimento e Suporte Sediada em Luanda</span>
              </div>
              <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                <Award className="w-5 h-5 text-amber-500 shrink-0" />
                <span className="text-xs font-bold text-slate-800">Arquitetura Resiliente: Base de Dados Local, Rede LAN e Operação Offline</span>
              </div>
            </div>

          </div>

          <div className="lg:col-span-6 flex items-center justify-center">
            <div className="w-full max-w-lg">
              <img
                src={executivosImg}
                alt="Gestão Moderna Kivora ERP"
                className="w-full h-[360px] sm:h-[420px] rounded-3xl border border-slate-200 shadow-2xl object-cover"
              />
            </div>
          </div>

        </div>

        {/* Pillars / Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100/60 text-blue-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-black text-slate-950">Rigor Fiscal & Segurança</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Cada linha de código do Kivora é auditada para garantir o cumprimento estrito do Código do IVA, PGC-AO, IRT 2026 e proteção dos dados da sua empresa.
            </p>
          </div>

          <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100/60 text-amber-600 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-black text-slate-950">Inovação Orientada ao Cliente</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Atualizações contínuas para incorporar novas regras legais da AGT e funcionalidades sugeridas pelas empresas angolanas.
            </p>
          </div>

          <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100/60 text-emerald-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-black text-slate-950">Suporte & Formação Local</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Oferecemos acompanhamento personalizado, formação presencial para a sua equipa e canal direto de WhatsApp em Luanda.
            </p>
          </div>
        </div>

        {/* Contactos & Sede */}
        <div className="bg-slate-950 rounded-3xl p-8 sm:p-12 text-white grid grid-cols-1 md:grid-cols-3 gap-8 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Sede em Luanda</h4>
              <p className="text-xs text-slate-400 mt-1">{settings.address}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Linha Telefónica</h4>
              <p className="text-xs text-slate-400 mt-1">{settings.phoneDisplay}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Email Corporativo</h4>
              <p className="text-xs text-slate-400 mt-1">{settings.email}</p>
            </div>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="bg-[#1d4ed8] rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-black">
              Quer conhecer o KIVORA de perto?
            </h3>
            <p className="text-blue-100 text-xs sm:text-sm max-w-xl">
              Agende uma sessão de demonstração presencial no seu escritório em Luanda ou via reunião online.
            </p>
          </div>
          <button
            onClick={onOpenDemoModal}
            className="bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm px-8 py-4 rounded-2xl shadow-lg transition-all flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <ArrowRight className="w-4 h-4 text-blue-600" />
            <span>Agendar Apresentação</span>
          </button>
        </div>

      </section>

    </div>
  );
};
