import React, { useState, useEffect, useRef } from 'react';
import { PageHero } from '../components/PageHero';
import {
  TrendingUp, ShieldCheck, Building2, Award,
  Mail, ArrowRight, CheckCircle2,
  Globe2, Briefcase
} from 'lucide-react';
import { PageId } from '../components/Header';
import {
  subscribeSystemSettings, getCachedSystemSettings,
  SystemCompanySettings
} from '../services/systemSettingsService';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { CountUp } from '../components/CountUp';
import { AnimatedText } from '../components/AnimatedText';

import executivosImg from '../assets/kivora/executivos-kivora.jpg';

interface InvestidoresPageProps {
  onNavigatePage: (page: PageId) => void;
  onOpenDemoModal?: (subject?: string) => void;
}

export const InvestidoresPage: React.FC<InvestidoresPageProps> = ({
  onNavigatePage,
}) => {
  const pageRef = useRef<HTMLDivElement>(null);
  const [settings, setSettings] = useState<SystemCompanySettings>(getCachedSystemSettings());

  useScrollReveal(pageRef, [settings]);

  useEffect(() => {
    const unsub = subscribeSystemSettings(setSettings);
    return () => unsub();
  }, []);

  const inv = settings.investorInfo || {};

  return (
    <div ref={pageRef} className="min-h-screen bg-white text-slate-900 page-enter">
      
      {/* Hero Showcase */}
      <PageHero
        image={executivosImg}
        tag="Relações com Investidores & Governança"
        title="Pioneirismo, Solidez e Crescimento Sustentável"
        sub="A Visual Software lidera a modernização da faturação eletrónica e automação comercial em Angola com tecnologia 100% própria e rentabilidade comprovada."
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-16 sm:py-24 space-y-20">

        {/* 1. Métricas Principais de Solidez */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div data-reveal data-delay="100" className="surface-card p-7 text-center hover:border-slate-300 hover:shadow-card hover:-translate-y-1 transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200/60 flex items-center justify-center mx-auto mb-3.5 shadow-xs">
              <TrendingUp className="w-7 h-7" />
            </div>
            <p className="font-display text-3xl sm:text-4xl font-black text-slate-950 mb-1 font-mono-num">
              <CountUp end={128} prefix="+" suffix="%" type="odometer" duration={2} />
            </p>
            <p className="text-xs text-slate-600 font-bold uppercase tracking-wider">Crescimento Anual em Postos</p>
          </div>

          <div data-reveal data-delay="200" className="surface-card p-7 text-center hover:border-slate-300 hover:shadow-card hover:-translate-y-1 transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center mx-auto mb-3.5 shadow-xs">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <p className="font-display text-2xl sm:text-3xl font-black text-slate-950 mb-1 font-mono-num">
              <CountUp end={387} prefix="FE/" suffix="/AGT" type="scramble" duration={2.2} />
            </p>
            <p className="text-xs text-slate-600 font-bold uppercase tracking-wider">{settings.agtCertificate || 'Certificado Oficial AGT'}</p>
          </div>

          <div data-reveal data-delay="300" className="surface-card p-7 text-center hover:border-slate-300 hover:shadow-card hover:-translate-y-1 transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200/60 flex items-center justify-center mx-auto mb-3.5 shadow-xs">
              <Globe2 className="w-7 h-7" />
            </div>
            <p className="font-display text-3xl sm:text-4xl font-black text-slate-950 mb-1 font-mono-num">
              <CountUp end={settings.statProvincesCount ? Number(settings.statProvincesCount) : 18} suffix=" Províncias" type="odometer" duration={1.6} />
            </p>
            <p className="text-xs text-slate-600 font-bold uppercase tracking-wider">Presença Territorial Nacional</p>
          </div>

          <div data-reveal data-delay="400" className="surface-card p-7 text-center hover:border-slate-300 hover:shadow-card hover:-translate-y-1 transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center mx-auto mb-3.5 shadow-xs">
              <Building2 className="w-7 h-7" />
            </div>
            <p className="font-display text-3xl sm:text-4xl font-black text-slate-950 mb-1 font-mono-num">
              <CountUp end={100} suffix="% Nacional" type="counter" duration={1.8} />
            </p>
            <p className="text-xs text-slate-600 font-bold uppercase tracking-wider">Capital e IP 100% Angolana</p>
          </div>
        </section>

        {/* 2. Tese de Investimento & Diferenciais de Mercado */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6" data-reveal data-reveal-dir="left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60 text-xs font-bold">
              <Briefcase className="w-3.5 h-3.5" />
              Tese Estratégica
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-black text-slate-950 leading-tight">
              <AnimatedText text="Software Crítico Adaptado à Realidade do Mercado Angolano" el="span" mode="letter-stagger" />
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base font-normal">
              Ao contrário das soluções em nuvem que falham constantemente devido a interrupções de fibra ótica ou cobranças em moeda estrangeira (USD/EUR), o <strong>KIVORA ERP</strong> foi projetado com arquitetura <em>Local-First / Offline-Resilient</em>.
            </p>
            <div className="space-y-3 pt-2">
              {[
                { title: 'Zero Dependência de Internet', desc: 'Os terminais de caixa faturam sem parar com assinatura criptográfica local.' },
                { title: 'Previsibilidade Financeira em Kwanzas (AOA)', desc: 'Imunidade total à desvalorização cambial para os nossos clientes e parceiros.' },
                { title: 'Barreira Regulatória AGT', desc: 'Software devidamente certificado com emissão de SAF-T AO e QR Code fiscal auditado.' },
                { title: 'Canal de Distribuição em Escala', desc: 'Rede credenciada de técnicos e integradores de TI em todas as 18 províncias.' },
              ].map((item, idx) => (
                <div key={idx} data-reveal data-delay={(idx + 1) * 100} className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">{item.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed font-normal">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#0B192C] text-white rounded-3xl p-8 sm:p-10 border border-slate-800 shadow-xl space-y-6" data-reveal data-reveal-dir="right">
            <div className="flex items-center gap-3 border-b border-white/10 pb-5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-400/20 flex items-center justify-center shrink-0">
                <Award className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-white">Governança & Entidade Jurídica</h3>
                <p className="text-xs text-slate-400">Informações Institucionais Oficiais</p>
              </div>
            </div>

            <div className="space-y-4 text-xs sm:text-sm font-normal">
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-slate-400">Entidade Legal:</span>
                <span className="font-bold text-white text-right">{inv.legalEntity || 'VISUAL SOFTWARE LIMITADA'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-slate-400">NIF Corporativo:</span>
                <span className="font-bold text-white font-mono-num">{settings.nif || '5417089123'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-slate-400">Capital Social:</span>
                <span className="font-bold text-white text-right font-mono-num">{inv.shareCapital || '150.000.000 Kz'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-slate-400">Auditoria & Certificação:</span>
                <span className="font-bold text-emerald-400 text-right font-mono-num">{inv.auditedBy || settings.agtCertificate}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-400">Sede Operacional:</span>
                <span className="font-bold text-white text-right">{settings.address}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <a
                href={`mailto:${inv.contactEmail || settings.salesEmail || 'investidores@kivora.ao'}?subject=Contacto%20de%20Relações%20com%20Investidores%20-%20KIVORA`}
                className="w-full btn-cta py-4 px-6 flex items-center justify-center gap-2 text-xs sm:text-sm"
              >
                <Mail className="w-4 h-4" />
                <span>Contactar Conselho de Administração</span>
              </a>
            </div>
          </div>
        </section>

        {/* 3. Compromisso com Transparência e Expansão */}
        <section data-reveal className="bg-[#0B192C] text-white p-8 sm:p-14 rounded-3xl border border-slate-800 shadow-xl text-center space-y-6">
          <div className="max-w-3xl mx-auto space-y-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-orange-400 bg-orange-500/10 px-3.5 py-1 rounded-full border border-orange-500/20 inline-block">
              Relações com Investidores
            </span>
            <h3 className="font-display text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Pronto para Expandir Connosco em Angola?
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto font-normal">
              Disponibilizamos memorandos de investimento, dados de penetração de mercado e reuniões executivas para fundos institucionais e parceiros estratégicos.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <button
                onClick={() => onNavigatePage('parceiros')}
                className="btn-cta text-xs sm:text-sm px-8 py-4 flex items-center gap-2"
              >
                <span>Conhecer Programa de Canais</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigatePage('casos-sucesso')}
                className="btn-secondary text-xs sm:text-sm px-7 py-4 flex items-center gap-2"
              >
                <span>Ver Clientes & Casos de Sucesso</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
};

