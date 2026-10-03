import React, { useState, useEffect } from 'react';
import { PageHero } from '../components/PageHero';
import { ArrowRight, Users, Award, ShieldCheck, CreditCard, Download } from 'lucide-react';
import {
  subscribePartnerPolicy, DEFAULT_PARTNER_POLICY,
  PartnerLicensingPolicy
} from '../admin/services/partnerDebtService';
import {
  subscribeSystemSettings, getCachedSystemSettings,
  SystemCompanySettings
} from '../services/systemSettingsService';
import { YouTubePlayer } from '../components/YouTubePlayer';
import { PartnerProgramConditionsModal } from '../components/PartnerProgramConditionsModal';
import { PageId } from '../components/Header';

import executivosImg from '../assets/kivora/executivos-kivora.jpg';

import { useScrollReveal } from '../hooks/useScrollReveal';

const fmt = (n: number) => n.toLocaleString('pt-AO');

interface ParceirosPageProps {
  onNavigatePage?: (page: PageId) => void;
}

export const ParceirosPage: React.FC<ParceirosPageProps> = ({ onNavigatePage }) => {
  useScrollReveal();
  const [settings, setSettings] = useState<SystemCompanySettings>(getCachedSystemSettings());
  const [policy, setPolicy] = useState<PartnerLicensingPolicy>(DEFAULT_PARTNER_POLICY);
  const [showConditionsModal, setShowConditionsModal] = useState(false);

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

  const handleDownloadPdf = () => {
    const link = document.createElement('a');
    link.href = '/documentos/Regulamento_Programa_Parceiros_KIVORA.pdf';
    link.download = 'Regulamento_Programa_Parceiros_KIVORA.pdf';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 page-enter font-sans">

      <PageHero
        image={executivosImg}
        tag="Programa de Parceiros & Canais"
        title={`Revenda o ${settings.fullName} e cresça connosco`}
        sub={`Torne-se distribuidor oficial da ${settings.company} e lucre com margens de atacado em cada licença na sua região.`}
      />

      {/* Benefícios & 2 Documentos Oficiais */}
      <section className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-16 py-20 space-y-16">
        <div data-reveal className="sr-init text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#FF6500] bg-orange-50 border border-orange-200/60 px-3.5 py-1.5 rounded-full">
            Credenciamento & Parceria Oficial
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-slate-950">Por que ser parceiro oficial?</h2>
          <p className="text-slate-500 text-sm font-normal">Benefícios exclusivos, emissão instantânea e reconhecimento institucional em todo o território nacional.</p>
        </div>

        {/* Grade de 4 Benefícios Chave */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              title: 'Preços de Atacado & Margem de 30% a 50%',
              desc: 'Preços especiais de revenda com margens atrativas e liberdade total para definir o preço dos seus serviços de instalação e formação ao cliente.',
              iconColor: 'bg-orange-50 text-[#FF6500] border-orange-200/60',
              icon: CreditCard
            },
            {
              title: 'Portal do Parceiro & Licenciamento Autónomo',
              desc: 'Painel completo para ativação de licenças 24/7 com emissão imediata e controlo de clientes da sua carteira.',
              iconColor: 'bg-emerald-50 text-emerald-600 border-emerald-200/60',
              icon: ShieldCheck
            },
            {
              title: 'Suporte Técnico Prioritário Nível 2',
              desc: 'Linha direta com os engenheiros de desenvolvimento da Kivora para apoio em implementações fiscais complexas e redes locais LAN.',
              iconColor: 'bg-[#0B1528] text-amber-400 border-slate-800',
              icon: Users
            },
            {
              title: 'Kit Oficial: Licença NFR & Formação',
              desc: 'Acesso a licença NFR para demonstrações comerciais em clientes, apresentações comerciais e material promocional oficial.',
              iconColor: 'bg-orange-50 text-[#FF6500] border-orange-200/60',
              icon: Award
            },
          ].map((b, i) => {
            const IconComp = b.icon;
            return (
              <div
                key={i}
                data-reveal
                className="bg-white rounded-3xl p-7 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col justify-between group hover:border-orange-300 hover:shadow-md transition-all duration-300"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="space-y-4">
                  <div className={`w-12 h-12 rounded-2xl ${b.iconColor} border flex items-center justify-center transition-all duration-300 shadow-xs`}>
                    <IconComp className="w-6 h-6" strokeWidth={2} />
                  </div>
                  <h3 className="text-base font-extrabold font-display text-slate-950 group-hover:text-[#FF6500] transition-colors">
                    {b.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">{b.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Destaque dos 2 Documentos Oficiais */}
        <div data-reveal className="sr-init bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#FF6500] border border-orange-100 flex items-center justify-center font-bold shadow-xs">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-display text-slate-950">
                Documento Oficial Recebido no Credenciamento
              </h3>
              <p className="text-xs text-slate-600 font-normal">Documentação jurídica séria com selo de autenticidade para apresentar aos seus clientes empresariais:</p>
            </div>
          </div>

          <div className="p-6 bg-slate-50/70 rounded-2xl border border-slate-200/90 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-slate-950 font-bold font-display text-sm">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Comprovativo de Parceiro Revendedor Credenciado KIVORA SOFT</span>
              </div>
              <span className="text-[10px] font-bold uppercase text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full self-start">
                Certificação Oficial
              </span>
            </div>
            <p className="text-slate-600 leading-relaxed text-xs font-normal">
              Emitido pela <strong>Visual Software, Lda.</strong> (NIF <span className="font-mono-num font-semibold">5002863944</span>), outorgando plenos poderes para comercialização, promoção e revenda autorizada do software de faturação eletrónica certificado pela AGT ao abrigo do Decreto Presidencial n.º 71/25.
            </p>
          </div>

          {/* Taxa de Credenciamento e Botões Oficiais */}
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>Taxa única de adesão e credenciamento: <strong className="text-slate-950 font-mono-num font-bold">{fmt(policy.partner_membership_fee_aoa ?? 25000)} Kz</strong></span>
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleDownloadPdf}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-[#0B1528] hover:bg-slate-800 text-white font-semibold text-xs px-5 py-2.5 rounded-full transition-all cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-[#FF6500]" />
                <span>Baixar Regulamento (PDF)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Vídeo do Programa de Parceiros */}
        {settings.videoParceirosUrl && (
          <div data-reveal className="sr-init space-y-6 pt-6">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-[#FF6500] font-bold text-xs uppercase tracking-wider bg-orange-50 px-3 py-1 rounded-full border border-orange-200/60">
                Apresentação Comercial
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-950">
                {settings.videoParceirosTitle || 'Como Funciona o Programa de Canais & Distribuição'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 font-normal">
                {settings.videoParceirosDesc || 'Entenda em detalhe o modelo de negócio, margens de revenda até 50% e suporte direto aos parceiros.'}
              </p>
            </div>

            <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200/80 shadow-sm p-4">
              <YouTubePlayer
                videoUrl={settings.videoParceirosUrl}
                title={settings.videoParceirosTitle}
                subtitle={settings.videoParceirosDesc}
                badge="Vídeo para Parceiros"
                accentColor="blue"
                aspectRatio="video"
              />
            </div>
          </div>
        )}
      </section>

      {/* Formulário / CTA */}
      <section className="bg-[#0B1528] py-20 px-6 sm:px-10 lg:px-16 border-t border-slate-800 text-white">
        <div data-reveal className="sr-init max-w-3xl mx-auto text-center text-white space-y-6">
          <div className="w-14 h-14 rounded-full bg-white/10 border border-white/15 flex items-center justify-center mx-auto shadow-inner">
            <Users className="w-7 h-7 text-amber-400" strokeWidth={1.5} />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white tracking-tight leading-tight">Candidate-se ao Programa de Parceiros</h2>
          <p className="text-slate-300 text-sm leading-relaxed max-w-lg mx-auto font-normal">
            Aceda à página exclusiva de candidatura com todos os requisitos oficiais e formulário de credenciamento.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleGoCandidatura}
              className="btn-cta text-sm font-bold px-8 py-4 rounded-full shadow-xl shadow-orange-600/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Enviar Candidatura Oficial</span>
              <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </button>
            <button
              onClick={handleDownloadPdf}
              className="px-7 py-4 rounded-full font-semibold text-sm text-white bg-white/10 hover:bg-white/15 border border-white/20 transition-all cursor-pointer flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Baixar Condições em PDF</span>
            </button>
          </div>
        </div>
      </section>

      {/* Modal Oficial de Condições em PDF */}
      {showConditionsModal && (
        <PartnerProgramConditionsModal onClose={() => setShowConditionsModal(false)} />
      )}

    </div>
  );
};
