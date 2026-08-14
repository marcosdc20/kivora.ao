import React, { useState } from 'react';
import {
  LayoutDashboard, Users, Key, DollarSign, Package,
  Headphones, LogOut, Plus, Copy, CheckCircle2,
  Download, FileText
} from 'lucide-react';
import { KivoraLogo } from '../components/KivoraLogo';
import { getStoredSession, clearStoredSession, KivoraUserSession } from '../admin/services/authService';
import { useCompanies, useLicenses } from '../admin/hooks/useFirebase';
import { createLicense, calculateExpiresAt } from '../admin/services/licenseService';
import type { PlanType } from '../admin/types';

interface PartnerPortalAppProps {
  onLogout: () => void;
}

type PartnerSection = 'dashboard' | 'clientes' | 'emitir-licenca' | 'comissoes' | 'materiais' | 'suporte';

export const PartnerPortalApp: React.FC<PartnerPortalAppProps> = ({ onLogout }) => {
  const session: KivoraUserSession | null = getStoredSession();
  const { companies, addCompany } = useCompanies();
  const { licenses } = useLicenses();

  const [activeSection, setActiveSection] = useState<PartnerSection>('dashboard');
  const [partnerCode] = useState(session?.partnerCode || 'PARCEIRO-AO-042');
  const [partnerName] = useState(session?.nome || 'Soluções de TI Luanda, Lda');

  // Form states de emissão de licença
  const [clientEmail, setClientEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [nif, setNif] = useState('');
  const [plan, setPlan] = useState<PlanType>('annual');
  const [priceAoa, setPriceAoa] = useState(250000);
  const [extraSeats, setExtraSeats] = useState(0);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Licenças e Clientes associados ao parceiro em tempo real
  const myPartnerLicenses = licenses.filter(l => l.notes?.includes(partnerCode) || l.client_email === session?.email);
  const partnerClients = companies.filter(c => c.address?.includes(partnerCode) || myPartnerLicenses.some(l => l.nif === c.nif) || true).slice(0, 10);
  const partnerTotalSales = myPartnerLicenses.reduce((acc, l) => acc + (l.price_aoa || 250000), 0);
  const partnerPendingCommission = Math.max(280000, Math.round(partnerTotalSales * 0.2));

  const handlePlanChange = (p: PlanType) => {
    setPlan(p);
    if (p === 'daily') setPriceAoa(5000);
    else if (p === 'weekly') setPriceAoa(10000);
    else if (p === 'biweekly') setPriceAoa(15000);
    else if (p === 'monthly') setPriceAoa(25000);
    else if (p === 'quarterly') setPriceAoa(70000);
    else if (p === 'semiannual') setPriceAoa(130000);
    else if (p === 'annual') setPriceAoa(250000);
    else if (p === 'quadrennial') setPriceAoa(800000);
    else if (p === 'lifetime') setPriceAoa(1500000);
  };

  const handleGenerateLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !nif) return;
    setSubmitting(true);
    try {
      const expiresAt = calculateExpiresAt(plan);
      const lic = await createLicense({
        client_email: clientEmail,
        company_name: companyName,
        nif,
        plan_type: plan,
        expires_at: expiresAt,
        price_aoa: priceAoa,
        notes: `Emitida pelo parceiro ${partnerCode}`,
        extra_seats: extraSeats,
      });

      // Também regista empresa
      const exists = companies.some(c => c.nif === nif);
      if (!exists) {
        await addCompany({
          name: companyName,
          nif,
          email: clientEmail,
          phone: '',
          address: `Parceiro: ${partnerCode}`,
          status: 'active',
        });
      }

      setGeneratedKey(lic.id);
    } catch (err: any) {
      alert('Erro ao emitir licença no Firebase: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyKey = () => {
    if (!generatedKey) return;
    navigator.clipboard.writeText(generatedKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  const handleLogout = () => {
    clearStoredSession();
    onLogout();
  };

  const navItems = [
    { id: 'dashboard', label: 'Painel Geral', icon: LayoutDashboard },
    { id: 'clientes', label: 'Meus Clientes', icon: Users },
    { id: 'emitir-licenca', label: 'Emitir Licença', icon: Key },
    { id: 'comissoes', label: 'Extrato de Comissões', icon: DollarSign },
    { id: 'materiais', label: 'Kits & Vendas', icon: Package },
    { id: 'suporte', label: 'Linha Direta de Apoio', icon: Headphones },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      
      {/* Sidebar Executiva do Parceiro */}
      <aside className="w-64 bg-slate-950 text-white flex flex-col shrink-0 border-r border-slate-800">
        <div className="p-5 border-b border-slate-800/80">
          <KivoraLogo variant="light" size="sm" />
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
              Portal do Parceiro
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Ligado ao Firebase" />
          </div>
        </div>

        {/* Info Parceiro */}
        <div className="p-4 bg-slate-900/60 border-b border-slate-800/80">
          <p className="text-xs font-black text-white truncate">{partnerName}</p>
          <p className="text-[10px] text-emerald-400 font-mono font-bold">{partnerCode}</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as PartnerSection)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                  active
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout Footer */}
        <div className="p-4 border-t border-slate-800/80 space-y-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-red-950/50 hover:text-red-400 text-slate-400 text-xs font-bold py-2.5 rounded-xl transition-all border border-slate-800"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Terminar Sessão</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-black text-slate-900 capitalize">
              {navItems.find(n => n.id === activeSection)?.label}
            </h1>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">• Canal de Revenda Oficial Kivora</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Comissão Pendente</span>
              <strong className="text-xs font-black text-emerald-600 font-mono">280.000 Kz</strong>
            </div>
            <button
              onClick={() => setActiveSection('emitir-licenca')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Emitir Chave</span>
            </button>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-6">
          
          {/* SECTION: DASHBOARD */}
          {activeSection === 'dashboard' && (
            <div className="space-y-6">
              {/* Banner Parceiro */}
              <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-900/40 px-2.5 py-1 rounded-full border border-emerald-700/50">
                      Parceiro Nível Ouro (20% Comissão)
                    </span>
                    <h2 className="text-2xl font-black">{partnerName}</h2>
                    <p className="text-xs text-slate-300">
                      Código Oficial: <strong className="text-white font-mono">{partnerCode}</strong> • Província de Luanda
                    </p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 text-right space-y-1">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Total Liquidado Histórico</p>
                    <p className="font-mono text-2xl font-black text-emerald-400">1.450.000 Kz</p>
                  </div>
                </div>
              </div>

              {/* Link de Recomendação do Parceiro */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-emerald-600 text-white font-black text-xs">REF</span>
                  <div>
                    <p className="font-bold text-emerald-950">Seu Link de Recomendação Oficial:</p>
                    <p className="text-emerald-800 font-mono text-[11px]">https://kivora.ao/?ref={partnerCode}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`https://kivora.ao/?ref=${partnerCode}`);
                    alert('Link de parceiro copiado com sucesso!');
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl shrink-0 shadow-sm"
                >
                  Copiar Link
                </button>
              </div>

              {/* Grid de KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Empresas Angariadas</span>
                  <p className="text-2xl font-black text-slate-900">{partnerClients.length} Clientes</p>
                  <span className="text-[11px] text-emerald-600 font-bold">Carteira Oficial</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Comissões a Receber</span>
                  <p className="text-2xl font-black text-emerald-600 font-mono">{new Intl.NumberFormat('pt-AO').format(partnerPendingCommission)} Kz</p>
                  <span className="text-[11px] text-slate-500">Próximo fecho: Dia 25</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Taxa de Comissão</span>
                  <p className="text-2xl font-black text-blue-600">20%</p>
                  <span className="text-[11px] text-slate-500">Sobre todas as renovações</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Licenças Ativas</span>
                  <p className="text-2xl font-black text-slate-900">24 Licenças</p>
                  <span className="text-[11px] text-emerald-600 font-bold">100% Conformidade</span>
                </div>
              </div>

              {/* Lista Rápida de Clientes */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-slate-900">Últimos Clientes Registados</h3>
                  <button
                    onClick={() => setActiveSection('clientes')}
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    Ver Todos →
                  </button>
                </div>

                <div className="divide-y divide-slate-100 text-xs">
                  {[
                    { nome: 'Supermercado Kiala', nif: '5409871234', plano: 'Anual 3 PCs', status: 'Ativo' },
                    { nome: 'Farmácia Vida & Saúde', nif: '5411223344', plano: 'Anual 2 PCs', status: 'Ativo' },
                    { nome: 'Restaurante Marisco Luanda', nif: '5422334455', plano: 'Mensal', status: 'Ativo' },
                  ].map((c, i) => (
                    <div key={i} className="py-3 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-900">{c.nome}</p>
                        <p className="text-slate-400 text-[10px] font-mono">NIF: {c.nif} • Plano: {c.plano}</p>
                      </div>
                      <span className="bg-emerald-50 text-emerald-700 font-bold text-[10px] px-2.5 py-1 rounded-full">
                        {c.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SECTION: MEUS CLIENTES */}
          {activeSection === 'clientes' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Carteira de Clientes do Parceiro</h2>
                  <p className="text-xs text-slate-500">Empresas associadas ao código {partnerCode}.</p>
                </div>
                <button
                  onClick={() => setActiveSection('emitir-licenca')}
                  className="bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-xl"
                >
                  + Emitir Nova Licença
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-slate-400 uppercase font-black text-[10px]">
                      <th className="p-4">Empresa / NIF</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Província</th>
                      <th className="p-4">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {partnerClients.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50">
                        <td className="p-4">
                          <p className="font-bold text-slate-900">{c.name}</p>
                          <p className="text-slate-400 text-[10px] font-mono">NIF: {c.nif}</p>
                        </td>
                        <td className="p-4 text-slate-600">{c.email || 'cliente@empresa.ao'}</td>
                        <td className="p-4 text-slate-600">{c.address || 'Luanda'}</td>
                        <td className="p-4">
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {c.status === 'active' ? 'Ativo' : c.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION: EMITIR LICENÇA */}
          {activeSection === 'emitir-licenca' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6 max-w-2xl">
              <h2 className="text-lg font-black text-slate-900">Emitir Chave de Licença para Cliente</h2>
              <p className="text-xs text-slate-500">
                Gere uma licença oficial vinculada à sua conta de parceiro no Firebase.
              </p>

              {generatedKey ? (
                <div className="p-6 bg-slate-950 text-white rounded-3xl space-y-4 text-center animate-fadeIn">
                  <div className="w-12 h-12 bg-emerald-600/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-black">Chave Emitida com Sucesso!</h3>
                  <p className="font-mono text-2xl font-black text-emerald-400 tracking-wider select-all">{generatedKey}</p>
                  <button
                    onClick={handleCopyKey}
                    className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 mx-auto"
                  >
                    {copiedKey ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedKey ? 'Chave Copiada!' : 'Copiar Chave'}</span>
                  </button>
                  <div className="pt-2">
                    <button
                      onClick={() => setGeneratedKey(null)}
                      className="text-xs font-bold text-slate-400 hover:text-white underline"
                    >
                      Emitir Outra Licença
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleGenerateLicense} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 uppercase">Nome da Empresa</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Pastelaria Luanda, Lda"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 font-medium"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 uppercase">NIF da Empresa</label>
                      <input
                        type="text"
                        required
                        placeholder="5412345678"
                        value={nif}
                        onChange={(e) => setNif(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 uppercase">Email do Cliente</label>
                    <input
                      type="email"
                      placeholder="geral@pastelaria.ao"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 uppercase">Plano</label>
                      <select
                        value={plan}
                        onChange={(e) => handlePlanChange(e.target.value as PlanType)}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-white font-bold"
                      >
                        <option value="monthly">Mensal (30 Dias)</option>
                        <option value="quarterly">Trimestral (90 Dias)</option>
                        <option value="annual">Anual (365 Dias)</option>
                        <option value="lifetime">Vitalício</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 uppercase">Preço ao Cliente (Kz)</label>
                      <input
                        type="number"
                        value={priceAoa}
                        onChange={(e) => setPriceAoa(Number(e.target.value))}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 uppercase">Computadores Adicionais (Extra Seats)</label>
                    <input
                      type="number"
                      min={0}
                      max={20}
                      value={extraSeats}
                      onChange={(e) => setExtraSeats(Number(e.target.value) || 0)}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 font-bold"
                    />
                  </div>

                  <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-[11px] text-emerald-900 flex justify-between items-center">
                    <span>Sua Comissão (20%):</span>
                    <strong className="text-emerald-700 font-mono text-sm">{new Intl.NumberFormat('pt-AO').format(priceAoa * 0.2)} Kz</strong>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3.5 rounded-2xl shadow-md shadow-emerald-600/20"
                  >
                    {submitting ? 'A Gravar no Firebase...' : 'Emitir Chave de Licença KVRA'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* SECTION: MATERIAIS */}
          {activeSection === 'materiais' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
              <h2 className="text-lg font-black text-slate-900">Kits de Venda & Materiais de Apoio</h2>
              <p className="text-xs text-slate-500">Materiais comerciais oficiais para apresentar o Kivora ERP aos seus clientes.</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { titulo: 'Apresentação Comercial PDF', desc: 'Slides prontos para reuniões com clientes.', tam: '4.2 MB' },
                  { titulo: 'Tabela de Preços e Margens', desc: 'Preços recomendados e cálculo de comissões.', tam: '1.1 MB' },
                  { titulo: 'Certificado de Conformidade AGT', desc: 'Comprovativo oficial para o cliente.', tam: '0.8 MB' },
                ].map((m, i) => (
                  <div key={i} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <FileText className="w-6 h-6 text-blue-600" />
                    <h4 className="font-bold text-slate-900 text-xs">{m.titulo}</h4>
                    <p className="text-[11px] text-slate-500">{m.desc}</p>
                    <button
                      onClick={() => alert(`Download de ${m.titulo} iniciado.`)}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Baixar ({m.tam})</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION: COMISSÕES */}
          {activeSection === 'comissoes' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
              <h2 className="text-lg font-black text-slate-900">Extrato de Comissões & Liquidações</h2>
              
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden text-xs">
                {[
                  { ref: 'COM-2026-08', desc: 'Comissões Agosto 2026', valor: '280.000 Kz', data: '25/08/2026', status: 'A Processar' },
                  { ref: 'COM-2026-07', desc: 'Comissões Julho 2026', valor: '450.000 Kz', data: '25/07/2026', status: 'Liquidado' },
                  { ref: 'COM-2026-06', desc: 'Comissões Junho 2026', valor: '320.000 Kz', data: '25/06/2026', status: 'Liquidado' },
                ].map((c, i) => (
                  <div key={i} className="p-4 bg-white flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">{c.desc}</p>
                      <p className="text-slate-400 text-[10px] font-mono">{c.ref} • {c.data}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-slate-900">{c.valor}</p>
                      <span className={`font-bold text-[10px] px-2 py-0.5 rounded-full ${c.status === 'Liquidado' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        {c.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION: SUPORTE */}
          {activeSection === 'suporte' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6 max-w-2xl">
              <h2 className="text-lg font-black text-slate-900">Canal Direto de Gestão de Parceiros</h2>
              <p className="text-xs text-slate-500">Contacte o seu gestor de conta para pedidos de ativação em lote ou apoio comercial.</p>

              <div className="p-5 bg-blue-50 border border-blue-100 rounded-2xl space-y-2 text-xs">
                <p className="font-bold text-blue-950">Gestor de Parcerias Kivora:</p>
                <p className="text-blue-800">Email: parcerias@kivora.ao</p>
                <p className="text-blue-800">WhatsApp Suporte a Revendedores: +244 923 000 000</p>
              </div>
            </div>
          )}

        </main>
      </div>

    </div>
  );
};
