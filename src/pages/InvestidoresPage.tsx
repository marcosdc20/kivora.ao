import React, { useState, useEffect } from 'react';
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

import executivosImg from '../assets/kivora/executivos-kivora.jpg';

interface InvestidoresPageProps {
  onNavigatePage: (page: PageId) => void;
  onOpenDemoModal?: (subject?: string) => void;
}

export const InvestidoresPage: React.FC<InvestidoresPageProps> = ({
  onNavigatePage,
}) => {
  const [settings, setSettings] = useState<SystemCompanySettings>(getCachedSystemSettings());

  useEffect(() => {
    const unsub = subscribeSystemSettings(setSettings);
    return () => unsub();
  }, []);

  const inv = settings.investorInfo || {};

  return (
    <div className="min-h-screen bg-white text-slate-900 page-enter">
      
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
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 shadow-sm text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6" />
            </div>
            <p className="text-3xl font-black text-slate-900 mb-1">{inv.annualGrowth || '+128%'}</p>
            <p className="text-xs text-slate-600 font-semibold uppercase tracking-wider">Crescimento Anual em Postos</p>
          </div>

          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 shadow-sm text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <p className="text-3xl font-black text-slate-900 mb-1">{settings.agtCertificate ? 'Homologado' : 'Certificado'}</p>
            <p className="text-xs text-slate-600 font-semibold uppercase tracking-wider">{settings.agtCertificate}</p>
          </div>

          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 shadow-sm text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
              <Globe2 className="w-6 h-6" />
            </div>
            <p className="text-3xl font-black text-slate-900 mb-1">{settings.statProvincesCount || 18} Províncias</p>
            <p className="text-xs text-slate-600 font-semibold uppercase tracking-wider">Presença Territorial Nacional</p>
          </div>

          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 shadow-sm text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <Building2 className="w-6 h-6" />
            </div>
            <p className="text-3xl font-black text-slate-900 mb-1">100% Nacional</p>
            <p className="text-xs text-slate-600 font-semibold uppercase tracking-wider">Capital e IP 100% Angolana</p>
          </div>
        </section>

        {/* 2. Tese de Investimento & Diferenciais de Mercado */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">
              <Briefcase className="w-3.5 h-3.5" />
              Tese Estratégica
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 leading-tight">
              Software Crítico Adaptado à Realidade do Mercado Angolano
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
              Ao contrário das soluções em nuvem que falham constantemente devido a interrupções de fibra ótica ou cobranças em moeda estrangeira (USD/EUR), o <strong>KIVORA ERP</strong> foi projetado com arquitetura <em>Local-First / Offline-Resilient</em>.
            </p>
            <div className="space-y-3 pt-2">
              {[
                { title: 'Zero Dependência de Internet', desc: 'Os terminais de caixa faturam sem parar com assinatura criptográfica local.' },
                { title: 'Previsibilidade Financeira em Kwanzas (AOA)', desc: 'Imunidade total à desvalorização cambial para os nossos clientes e parceiros.' },
                { title: 'Barreira Regulatória AGT', desc: 'Software devidamente certificado com emissão de SAF-T AO e QR Code fiscal auditado.' },
                { title: 'Canal de Distribuição em Escala', desc: 'Rede credenciada de técnicos e integradores de TI em todas as 18 províncias.' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">{item.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-950 text-white rounded-3xl p-8 sm:p-10 border border-slate-800 shadow-2xl space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-5">
              <Award className="w-8 h-8 text-amber-400" />
              <div>
                <h3 className="text-lg font-bold text-white">Governança & Entidade Jurídica</h3>
                <p className="text-xs text-slate-400">Informações Institucionais Oficiais</p>
              </div>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="flex justify-between py-2 border-b border-slate-900">
                <span className="text-slate-400">Entidade Legal:</span>
                <span className="font-bold text-white text-right">{inv.legalEntity || 'VISUAL SOFTWARE LIMITADA'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-900">
                <span className="text-slate-400">NIF Corporativo:</span>
                <span className="font-bold text-white">{settings.nif || '5417089123'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-900">
                <span className="text-slate-400">Capital Social:</span>
                <span className="font-bold text-white text-right">{inv.shareCapital || '150.000.000 Kz'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-900">
                <span className="text-slate-400">Auditoria & Certificação:</span>
                <span className="font-bold text-emerald-400 text-right">{inv.auditedBy || settings.agtCertificate}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-400">Sede Operacional:</span>
                <span className="font-bold text-white text-right">{settings.address}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <a
                href={`mailto:${inv.contactEmail || settings.salesEmail || 'investidores@kivora.ao'}?subject=Contacto%20de%20Relações%20com%20Investidores%20-%20KIVORA`}
                className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-blue-600/30 text-xs sm:text-sm"
              >
                <Mail className="w-4 h-4" />
                <span>Contactar Conselho de Administração</span>
              </a>
            </div>
          </div>
        </section>

        {/* 3. Compromisso com Transparência e Expansão */}
        <section className="bg-gradient-to-br from-blue-50 via-white to-slate-50 p-8 sm:p-12 rounded-3xl border border-blue-100 text-center space-y-6">
          <div className="max-w-3xl mx-auto space-y-4">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
              Pronto para Expandir Connosco em Angola?
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Disponibilizamos memorandos de investimento, dados de penetração de mercado e reuniões executivas para fundos institucionais e parceiros estratégicos.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <button
                onClick={() => onNavigatePage('parceiros')}
                className="px-6 py-3 bg-[#1d4ed8] hover:bg-blue-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Conhecer Programa de Canais</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigatePage('casos-sucesso')}
                className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer"
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
