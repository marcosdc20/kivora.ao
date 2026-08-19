import React, { useState, useEffect } from 'react';
import { PageHero } from '../components/PageHero';
import { ArrowRight, CheckCircle2, Users, Award, ShieldCheck, FileText, CreditCard } from 'lucide-react';
import {
  subscribePartnerPolicy, DEFAULT_PARTNER_POLICY,
  PartnerLicensingPolicy
} from '../admin/services/partnerDebtService';
import {
  subscribeSystemSettings, getCachedSystemSettings,
  SystemCompanySettings
} from '../services/systemSettingsService';
import { YouTubePlayer } from '../components/YouTubePlayer';

import parceirosImg from '../assets/kivora/parceiros-kivora.png';

function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]');
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('sr-visible'); obs.unobserve(e.target); } }),
      { threshold: 0.1 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

const fmt = (n: number) => n.toLocaleString('pt-AO');

interface ParceirosPageProps {
  onNavigatePage?: (page: any) => void;
}

export const ParceirosPage: React.FC<ParceirosPageProps> = ({ onNavigatePage }) => {
  useScrollReveal();
  const [settings, setSettings] = useState<SystemCompanySettings>(getCachedSystemSettings());
  const [policy, setPolicy] = useState<PartnerLicensingPolicy>(DEFAULT_PARTNER_POLICY);

  useEffect(() => {
    const unsubSettings = subscribeSystemSettings(setSettings);
    const unsubPolicy = subscribePartnerPolicy(setPolicy);
    return () => {
      unsubSettings();
      unsubPolicy();
    };
  }, []);

  const handleGoCandidatura = () => {
    if (onNavigatePage) {
      onNavigatePage('candidatura-parceiro');
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 page-enter">

      <PageHero
        image={parceirosImg}
        tag="Programa de Parceiros & Canais"
        title={`Revenda o ${settings.fullName} e cresça connosco`}
        sub={`Torne-se distribuidor oficial da ${settings.company} e lucre com margens de atacado em cada licença na sua região.`}
      />

      {/* Benefícios & 2 Documentos Oficiais */}
      <section className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-16 py-20 space-y-16">
        <div data-reveal className="sr-init text-center max-w-2xl mx-auto">
          <span className="text-[10px] font-black uppercase text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
            Homologação & Certificação
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-950 mt-3">Por que ser parceiro oficial?</h2>
          <p className="text-slate-500 text-sm mt-2">Benefícios exclusivos, emissão instantânea e reconhecimento institucional.</p>
        </div>

        {/* Grade de 4 Benefícios Chave */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            { title: 'Preços de Atacado & Margem Livre', desc: 'Preços especiais de custo com liberdade total para definir o preço final ao cliente e maximizar a sua rentabilidade.' },
            { title: 'Portal do Parceiro & Licenciamento a Crédito', desc: 'Painel completo para ativação 24/7 com quota operacional pré-autorizada sem burocracia.' },
            { title: 'Suporte Técnico Prioritário Nível 2', desc: 'Linha direta com os engenheiros da Kivora para apoio em implementações fiscais e redes locais.' },
            { title: 'Formação & Kits de Marketing', desc: 'Acesso a manuais, apresentações comerciais e material promocional oficial para a sua equipa.' },
          ].map((b, i) => (
            <div key={i} data-reveal className="sr-init border border-slate-200 rounded-3xl p-6 sm:p-7 hover:border-blue-400/40 hover:shadow-md transition-all bg-white" style={{ transitionDelay: `${i * 80}ms` }}>
              <CheckCircle2 className="w-5 h-5 text-blue-600 mb-3" strokeWidth={2} />
              <h3 className="font-black text-slate-950 mb-1.5">{b.title}</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>

        {/* Destaque dos 2 Documentos Oficiais */}
        <div data-reveal className="sr-init p-8 bg-slate-50 rounded-3xl border border-slate-200 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-black">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                2 Documentos Oficiais Recebidos na Homologação
              </h3>
              <p className="text-xs text-slate-500">Documentação séria com selo de autenticidade para apresentar aos seus clientes empresariais:</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>1. Certificado de Parceria — {settings.company}</span>
              </div>
              <p className="text-slate-500 leading-relaxed text-[11px]">
                Atesta formalmente o credenciamento e homologação técnica da sua empresa como canal credenciado em território nacional.
              </p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                <span>2. Certificado de Revendedor — {settings.fullName}</span>
              </div>
              <p className="text-slate-500 leading-relaxed text-[11px]">
                Outorga de autorização da {settings.company} para distribuição, instalação e comercialização do software ({settings.agtCertificate}).
              </p>
            </div>
          </div>

          {/* Taxa de Homologação */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>Taxa única de homologação e credenciamento: <strong className="text-slate-950 font-mono font-black">{fmt(policy.partner_membership_fee_aoa ?? 25000)} Kz</strong></span>
            </div>
            <span className="text-[11px] text-slate-500">Liquidação após análise da candidatura</span>
          </div>
        </div>

        {/* Vídeo do Programa de Parceiros */}
        {settings.videoParceirosUrl && (
          <div data-reveal className="sr-init space-y-6 pt-6">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-purple-600 font-bold text-xs uppercase tracking-widest">
                Apresentação Comercial
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-950">
                {settings.videoParceirosTitle || 'Como Funciona o Programa de Canais & Distribuição'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                {settings.videoParceirosDesc || 'Entenda em detalhe o modelo de negócio, margens de revenda até 50% e suporte direto aos parceiros.'}
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <YouTubePlayer
                videoUrl={settings.videoParceirosUrl}
                title={settings.videoParceirosTitle}
                subtitle={settings.videoParceirosDesc}
                badge="Vídeo para Parceiros"
                accentColor="purple"
                aspectRatio="video"
              />
            </div>
          </div>
        )}
      </section>

      {/* Formulário / CTA */}
      <section className="bg-slate-950 py-20 px-6 sm:px-10 lg:px-16">
        <div data-reveal className="sr-init max-w-3xl mx-auto text-center text-white space-y-6">
          <Users className="w-10 h-10 text-blue-400 mx-auto" strokeWidth={1.5} />
          <h2 className="text-3xl font-black">Candidate-se ao Programa de Parceiros</h2>
          <p className="text-slate-400 text-sm leading-relaxed max-w-lg mx-auto">
            Aceda à página exclusiva de candidatura com todos os requisitos oficiais e formulário de credenciamento.
          </p>
          <button
            onClick={handleGoCandidatura}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm px-8 py-4 rounded-2xl shadow-lg shadow-blue-600/30 transition-all hover:-translate-y-0.5 cursor-pointer"
          >
            <span>Enviar Candidatura Oficial</span>
            <ArrowRight className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
      </section>

    </div>
  );
};
