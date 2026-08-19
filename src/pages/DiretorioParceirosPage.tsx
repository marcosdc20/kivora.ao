import React, { useState, useMemo, useEffect } from 'react';
import { PageHero } from '../components/PageHero';
import {
  MapPin, Phone, MessageCircle, ShieldCheck, Award,
  Search, Users, ArrowRight, Building2
} from 'lucide-react';
import { PageId } from '../components/Header';
import { db } from '../lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

import parceirosImg from '../assets/kivora/parceiros-kivora.png';

interface DiretorioParceirosPageProps {
  onNavigatePage: (page: PageId) => void;
  onOpenDemoModal?: (subject?: string) => void;
}

export interface PartnerDirectoryEntry {
  id: string;
  name: string;
  code: string;
  provincia: string;
  cidade: string;
  tier: 'Diamond' | 'Gold' | 'Silver' | 'Bronze';
  responsible: string;
  phone: string;
  whatsapp: string;
  email: string;
  specialties: string[];
  certifiedSince: string;
  address: string;
}

const PROVINCIAS_ANGOLA = [
  'Todas as Províncias',
  'Luanda',
  'Benguela',
  'Huambo',
  'Huíla',
  'Cabinda',
  'Cuanza Sul',
  'Namibe',
  'Malanje',
  'Uíge',
  'Zaire',
];

export const DiretorioParceirosPage: React.FC<DiretorioParceirosPageProps> = ({ onNavigatePage }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvincia, setSelectedProvincia] = useState('Todas as Províncias');
  const [selectedTier, setSelectedTier] = useState<string>('todos');
  const [partners, setPartners] = useState<PartnerDirectoryEntry[]>([]);

  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, 'partners'), (snap) => {
        const list: PartnerDirectoryEntry[] = snap.docs.map((docSnap) => {
          const d = docSnap.data();
          const tierStr = (d.tier || 'bronze').toString().toLowerCase();
          const tierCap = tierStr === 'diamond' ? 'Diamond' : tierStr === 'gold' ? 'Gold' : tierStr === 'silver' ? 'Silver' : 'Bronze';
          const pCode = (d.code || docSnap.id).toUpperCase().trim();
          const phone = d.phone || d.telefone || '+244 923 000 000';
          const cleanPhone = phone.replace(/\D/g, '');

          return {
            id: docSnap.id,
            name: (d.empresa || d.company_name || d.name || d.nome || 'Parceiro Homologado').trim(),
            code: pCode,
            provincia: d.region || d.provincia || 'Luanda',
            cidade: d.city || d.cidade || d.region || 'Luanda',
            tier: tierCap as any,
            responsible: d.responsible || d.nome_responsavel || d.nome || 'Direção Comercial',
            phone: phone,
            whatsapp: d.whatsapp || `https://wa.me/${cleanPhone}`,
            email: d.email || 'parceiro@kivora.ao',
            specialties: Array.isArray(d.specialties) ? d.specialties : ['Instalação de Redes LAN', 'Faturação Certificada AGT', 'Suporte Técnico Local'],
            certifiedSince: d.certifiedSince || (d.createdAt ? new Date(d.createdAt).getFullYear().toString() : '2025'),
            address: d.address || d.endereco || `${d.provincia || 'Luanda'}, Angola`,
          };
        }).filter(p => p.name.length > 0);

        setPartners(list);
      }, (err) => {
        console.warn('Erro ao carregar parceiros do Firestore:', err);
      });
      return () => unsub();
    } catch (e) {
      console.warn('Erro onSnapshot partners:', e);
    }
  }, []);

  const filteredPartners = useMemo(() => {
    return partners.filter((p) => {
      const matchProv = selectedProvincia === 'Todas as Províncias' || p.provincia === selectedProvincia;
      const matchTier = selectedTier === 'todos' || p.tier.toLowerCase() === selectedTier.toLowerCase();
      const matchQuery =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.cidade.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.provincia.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.specialties.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchProv && matchTier && matchQuery;
    });
  }, [partners, searchQuery, selectedProvincia, selectedTier]);

  return (
    <div className="min-h-screen bg-white text-slate-900 page-enter">
      
      {/* Hero Showcase */}
      <PageHero
        image={parceirosImg}
        tag="Rede Nacional de Distribuidores"
        title="Encontre um Parceiro Autorizado em Angola"
        sub="Técnicos e empresas credenciadas pela Visual Software para instalação presencial, configuração de redes locais, fornecimento de impressoras e formação da sua equipa."
      />

      {/* Main Container */}
      <section className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-16 sm:py-24 space-y-12">
        
        {/* Filtros & Pesquisa */}
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Pesquise por nome, província, cidade ou especialidade (ex: Farmácia, POS, Rede)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Select Província */}
            <div className="w-full md:w-auto flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
              <select
                value={selectedProvincia}
                onChange={(e) => setSelectedProvincia(e.target.value)}
                className="w-full md:w-56 bg-white border border-slate-200 text-xs sm:text-sm font-bold rounded-2xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-blue-500"
              >
                {PROVINCIAS_ANGOLA.map((prov) => (
                  <option key={prov} value={prov}>{prov}</option>
                ))}
              </select>
            </div>

            {/* Select Categoria */}
            <div className="w-full md:w-auto flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500 shrink-0" />
              <select
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value)}
                className="w-full md:w-48 bg-white border border-slate-200 text-xs sm:text-sm font-bold rounded-2xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-blue-500"
              >
                <option value="todos">Todos os Níveis</option>
                <option value="diamond">Diamond Partner</option>
                <option value="gold">Gold Partner</option>
                <option value="silver">Silver Partner</option>
                <option value="bronze">Bronze Partner</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200">
            <span>A mostrar <strong>{filteredPartners.length}</strong> parceiro(s) homologado(s)</span>
            <button
              onClick={() => onNavigatePage('candidatura-parceiro')}
              className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>Quer ser parceiro na sua região? Candidate-se</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Grelha de Parceiros */}
        {filteredPartners.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-base font-black text-slate-900">Nenhum parceiro encontrado nesta região</h3>
              <p className="text-xs text-slate-500">
                Seja o primeiro distribuidor homologado da sua província e comece a fornecer o KIVORA ERP.
              </p>
            </div>
            <button
              onClick={() => onNavigatePage('candidatura-parceiro')}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Candidatar a Parceiro</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredPartners.map((partner) => (
              <div
                key={partner.id}
                className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-xl hover:border-blue-400 transition-all flex flex-col justify-between space-y-6"
              >
              <div className="space-y-4">
                {/* Header do Card */}
                <div className="flex items-start justify-between gap-2">
                  <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md border ${
                    partner.tier === 'Diamond'
                      ? 'bg-purple-50 text-purple-900 border-purple-200'
                      : partner.tier === 'Gold'
                      ? 'bg-amber-50 text-amber-900 border-amber-200'
                      : partner.tier === 'Silver'
                      ? 'bg-slate-100 text-slate-900 border-slate-300'
                      : 'bg-orange-50 text-orange-900 border-orange-200'
                  }`}>
                    {partner.tier} Partner
                  </span>

                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Homologado</span>
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-black text-slate-950 leading-snug">{partner.name}</h3>
                  <p className="text-[11px] font-mono text-slate-500 font-bold mt-0.5">{partner.code}</p>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600">
                  <p className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span><strong>{partner.provincia}</strong> • {partner.cidade}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{partner.address}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Responsável: {partner.responsible}</span>
                  </p>
                </div>

                {/* Especialidades */}
                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Serviços Autorizados:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {partner.specialties.map((s, sIdx) => (
                      <span
                        key={sIdx}
                        className="text-[10px] font-semibold bg-slate-50 border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Ações de Contacto */}
              <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
                <a
                  href={partner.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
                <a
                  href={`tel:${partner.phone.replace(/[^0-9+]/g, '')}`}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Ligar</span>
                </a>
              </div>
            </div>
          ))}
        </div>
        )}

        {/* Banner CTA para Candidatura */}
        <div className="bg-slate-950 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-black uppercase tracking-widest text-amber-400">
              Expansão Nacional de Canais
            </span>
            <h3 className="text-2xl sm:text-3xl font-black">
              É técnico de TI ou tem uma empresa de informática?
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm max-w-xl leading-relaxed">
              Junte-se à rede nacional da Visual Software, receba os 2 certificados oficiais de homologação e passe a faturar com margens de atacado na sua província.
            </p>
          </div>

          <button
            onClick={() => onNavigatePage('candidatura-parceiro')}
            className="bg-blue-600 hover:bg-blue-500 text-white font-black text-xs sm:text-sm px-8 py-4 rounded-2xl transition-all shadow-xl shadow-blue-600/30 shrink-0 cursor-pointer flex items-center gap-2"
          >
            <span>Submeter Candidatura</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </section>

    </div>
  );
};
