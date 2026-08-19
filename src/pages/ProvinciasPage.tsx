import React, { useState, useEffect, useMemo, useRef } from 'react';
import { PageHero } from '../components/PageHero';
import {
  MapPin, Search,
  ArrowRight, Award, Building2, CheckCircle2
} from 'lucide-react';
import { PageId } from '../components/Header';
import {
  subscribeSystemSettings, getCachedSystemSettings,
  SystemCompanySettings, DEFAULT_PROVINCES
} from '../services/systemSettingsService';
import { useScrollReveal } from '../hooks/useScrollReveal';

import parceirosImg from '../assets/kivora/parceiros-kivora.png';

interface ProvinciasPageProps {
  onNavigatePage: (page: PageId) => void;
  onOpenDemoModal?: (subject?: string) => void;
}

export const ProvinciasPage: React.FC<ProvinciasPageProps> = ({
  onNavigatePage,
  onOpenDemoModal
}) => {
  const pageRef = useRef<HTMLDivElement>(null);
  const [settings, setSettings] = useState<SystemCompanySettings>(getCachedSystemSettings());
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'todos' | 'ativo' | 'expansao'>('todos');

  useScrollReveal(pageRef, [settings, search, filterStatus]);

  useEffect(() => {
    const unsub = subscribeSystemSettings(setSettings);
    return () => unsub();
  }, []);

  const provinces = settings.provincesCoverage && settings.provincesCoverage.length > 0
    ? settings.provincesCoverage
    : DEFAULT_PROVINCES;

  const filteredProvinces = useMemo(() => {
    return provinces.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.capital.toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        filterStatus === 'todos' ||
        (filterStatus === 'ativo' && p.status === 'Ativo') ||
        (filterStatus === 'expansao' && p.status === 'Em Expansão');
      return matchSearch && matchStatus;
    });
  }, [provinces, search, filterStatus]);

  const totalClients = useMemo(() => {
    return provinces.reduce((acc, curr) => acc + (curr.activeClients || 0), 0);
  }, [provinces]);

  const totalPartners = useMemo(() => {
    return provinces.reduce((acc, curr) => acc + (curr.certifiedPartners || 0), 0);
  }, [provinces]);

  return (
    <div ref={pageRef} className="min-h-screen bg-white text-slate-900 page-enter">
      
      {/* Hero Showcase */}
      <PageHero
        image={parceirosImg}
        tag="Cobertura Territorial em Angola"
        title="Presente em Todas as 18 Províncias de Angola"
        sub="Da capital aos municípios do interior, garantimos instalação presencial, assistência técnica rápida e conformidade fiscal AGT para empresas em todo o país."
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-16 sm:py-24 space-y-16">

        {/* 1. Resumo Executivo Nacional */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div data-reveal data-delay="100" className="bg-slate-50 p-6 rounded-3xl border border-slate-200 shadow-sm text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <Building2 className="w-6 h-6" />
            </div>
            <p className="text-3xl font-black text-slate-900 mb-1">{settings.statCompaniesCount || totalClients || 850}+</p>
            <p className="text-xs text-slate-600 font-semibold uppercase tracking-wider">Empresas & Postos Faturando</p>
          </div>

          <div data-reveal data-delay="200" className="bg-slate-50 p-6 rounded-3xl border border-slate-200 shadow-sm text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <Award className="w-6 h-6" />
            </div>
            <p className="text-3xl font-black text-slate-900 mb-1">{totalPartners || 45}+</p>
            <p className="text-xs text-slate-600 font-semibold uppercase tracking-wider">Técnicos & Distribuidores Certificados</p>
          </div>

          <div data-reveal data-delay="300" className="bg-slate-50 p-6 rounded-3xl border border-slate-200 shadow-sm text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
              <MapPin className="w-6 h-6" />
            </div>
            <p className="text-3xl font-black text-slate-900 mb-1">18 de 18</p>
            <p className="text-xs text-slate-600 font-semibold uppercase tracking-wider">Províncias com Suporte Presencial</p>
          </div>
        </section>

        {/* 2. Barra de Busca e Filtros */}
        <section data-reveal className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Pesquisar por província ou cidade..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            {[
              { id: 'todos', label: 'Todas as Províncias' },
              { id: 'ativo', label: 'Com Canais Ativos' },
              { id: 'expansao', label: 'Em Expansão' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  filterStatus === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        {/* 3. Grelha das 18 Províncias de Angola */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProvinces.map((prov, pIdx) => (
            <div
              key={prov.id}
              data-reveal
              data-delay={((pIdx % 3) + 1) * 100}
              className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">
                      Capital: {prov.capital}
                    </span>
                    <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors mt-0.5">
                      {prov.name}
                    </h3>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    prov.status === 'Ativo'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                      : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                  }`}>
                    {prov.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 mb-4 text-center">
                  <div>
                    <span className="text-lg font-black text-blue-600">{prov.activeClients}+</span>
                    <span className="text-[10px] text-slate-500 block">Clientes Ativos</span>
                  </div>
                  <div>
                    <span className="text-lg font-black text-slate-800">{prov.certifiedPartners}</span>
                    <span className="text-[10px] text-slate-500 block">Parceiros de TI</span>
                  </div>
                </div>

                <ul className="space-y-1.5 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Instalação Presencial em 24h a 48h</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Fornecimento de Impressoras e Caixas</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => onOpenDemoModal ? onOpenDemoModal(`Demonstração na Província de ${prov.name}`) : onNavigatePage('suporte')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Pedir Instalação em {prov.name}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </section>

        {/* 4. Chamada para Novos Parceiros Provinciais */}
        <section data-reveal className="bg-slate-950 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center lg:text-left max-w-xl">
            <span className="text-amber-400 font-bold text-xs uppercase tracking-widest">Oportunidade de Negócio</span>
            <h3 className="text-2xl sm:text-3xl font-black">
              É Técnico ou Empresa de TI na Sua Província?
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Torne-se o distribuidor oficial do KIVORA ERP na sua região. Lucros com margem livre em hardware e licenças, formação técnica direta da Visual Software e credenciamento oficial.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full lg:w-auto">
            <button
              onClick={() => onNavigatePage('candidatura-parceiro')}
              className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>Candidatura de Parceiro Provincial</span>
            </button>
            <button
              onClick={() => onNavigatePage('diretorio-parceiros')}
              className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Ver Diretório Nacional</span>
            </button>
          </div>
        </section>

      </main>
    </div>
  );
};
