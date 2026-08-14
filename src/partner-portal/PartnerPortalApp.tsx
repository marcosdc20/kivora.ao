import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Users, Key, DollarSign, Package,
  Headphones, LogOut, Plus, Copy, CheckCircle2,
  Download, FileText, Send, MessageSquare,
  Building2, Search, AlertCircle
} from 'lucide-react';
import { KivoraLogo } from '../components/KivoraLogo';
import { getStoredSession, clearStoredSession, KivoraUserSession } from '../admin/services/authService';
import { useCompanies, useLicenses } from '../admin/hooks/useFirebase';
import { createLicense, calculateExpiresAt } from '../admin/services/licenseService';
import {
  SupportTicket, createSupportTicket, sendTicketMessage, updateTicketStatus, subscribePartnerTickets
} from '../admin/services/supportService';
import {
  subscribePartnerPricing, subscribePartnerDebts, recordPartnerDebt,
  DEFAULT_PARTNER_PRICING, PartnerPricingPlan, PartnerDebtEntry
} from '../admin/services/partnerDebtService';
import type { PlanType } from '../admin/types';

interface PartnerPortalAppProps {
  onLogout: () => void;
}

type PartnerSection = 'dashboard' | 'clientes' | 'emitir-licenca' | 'extrato' | 'materiais' | 'suporte';

const fmt = (n: number) => n.toLocaleString('pt-AO');

export const PartnerPortalApp: React.FC<PartnerPortalAppProps> = ({ onLogout }) => {
  const session: KivoraUserSession | null = getStoredSession();
  const { companies, addCompany } = useCompanies();
  const { licenses } = useLicenses();

  const [activeSection, setActiveSection] = useState<PartnerSection>('dashboard');
  const partnerCode = session?.partnerCode || session?.email || 'PARCEIRO-KIVORA';
  const partnerName = session?.nome || 'Parceiro Homologado Kivora';

  // Tabela de Preços e Dívidas em tempo real
  const [pricingPlans, setPricingPlans] = useState<PartnerPricingPlan[]>(DEFAULT_PARTNER_PRICING);
  const [partnerDebts, setPartnerDebts] = useState<PartnerDebtEntry[]>([]);

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

  // Busca na carteira de clientes
  const [clientSearch, setClientSearch] = useState('');

  // Estados de Suporte do Parceiro
  const [supportTab, setSupportTab] = useState<'clientes' | 'admin'>('clientes');
  const [clientTickets, setClientTickets] = useState<SupportTicket[]>([]);
  const [adminTickets, setAdminTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [chatReply, setChatReply] = useState('');
  const [showAdminTicketModal, setShowAdminTicketModal] = useState(false);
  const [adminTicketSubject, setAdminTicketSubject] = useState('');
  const [adminTicketCategory, setAdminTicketCategory] = useState<'faturacao' | 'tecnico' | 'licenciamento' | 'multiloja'>('licenciamento');
  const [adminTicketMessage, setAdminTicketMessage] = useState('');
  const [submittingAdminTicket, setSubmittingAdminTicket] = useState(false);

  // Subscrição em Tempo Real aos Preços de Atacado
  useEffect(() => {
    const unsub = subscribePartnerPricing((plans) => {
      setPricingPlans(plans);
    });
    return () => unsub();
  }, []);

  // Subscrição em Tempo Real às Dívidas deste Parceiro
  useEffect(() => {
    if (!partnerCode) return;
    const unsub = subscribePartnerDebts(partnerCode, (debts) => {
      setPartnerDebts(debts);
    });
    return () => unsub();
  }, [partnerCode]);

  // Subscrição em Tempo Real aos Chamados do Parceiro
  useEffect(() => {
    const unsub = subscribePartnerTickets(partnerCode, ({ clientTickets: cTks, adminTickets: aTks }) => {
      setClientTickets(cTks);
      setAdminTickets(aTks);
      if (selectedTicket) {
        const all = [...cTks, ...aTks];
        const updated = all.find(t => t.id === selectedTicket.id);
        if (updated) setSelectedTicket(updated);
      }
    });
    return () => unsub();
  }, [partnerCode]);

  // Licenças e Clientes associados ao parceiro em tempo real
  const myPartnerLicenses = licenses.filter(l =>
    (l.notes && l.notes.includes(partnerCode)) ||
    (l.client_email && l.client_email.toLowerCase() === session?.email?.toLowerCase()) ||
    (l.notes && l.notes.toLowerCase().includes('parceiro'))
  );

  const partnerClients = companies.filter(c =>
    (c.address && c.address.includes(partnerCode)) ||
    myPartnerLicenses.some(l => l.nif === c.nif)
  );

  const filteredClients = partnerClients.filter(c => {
    if (!clientSearch) return true;
    const s = clientSearch.toLowerCase();
    return c.name.toLowerCase().includes(s) || c.nif.toLowerCase().includes(s) || (c.email || '').toLowerCase().includes(s);
  });

  // Cálculos Financeiros do Modelo de Dívidas
  const currentPlanCost = pricingPlans.find(p => p.plan_type === plan)?.cost_aoa ?? 120000;
  const partnerMargin = Math.max(0, priceAoa - currentPlanCost);

  const totalPendingDebt = partnerDebts.filter(d => !d.paid).reduce((acc, d) => acc + d.cost_aoa, 0);
  const totalPaidToKivora = partnerDebts.filter(d => d.paid).reduce((acc, d) => acc + d.cost_aoa, 0);
  const totalPartnerProfit = partnerDebts.reduce((acc, d) => acc + Math.max(0, (d.client_price_aoa || 0) - d.cost_aoa), 0);

  const handlePlanChange = (p: PlanType) => {
    setPlan(p);
    const planCost = pricingPlans.find(item => item.plan_type === p)?.cost_aoa;
    if (p === 'daily') setPriceAoa(planCost ? Math.round(planCost * 1.5) : 5000);
    else if (p === 'weekly') setPriceAoa(planCost ? Math.round(planCost * 1.5) : 10000);
    else if (p === 'biweekly') setPriceAoa(planCost ? Math.round(planCost * 1.5) : 15000);
    else if (p === 'monthly') setPriceAoa(planCost ? Math.round(planCost * 1.6) : 25000);
    else if (p === 'quarterly') setPriceAoa(planCost ? Math.round(planCost * 1.6) : 70000);
    else if (p === 'semiannual') setPriceAoa(planCost ? Math.round(planCost * 1.6) : 130000);
    else if (p === 'annual') setPriceAoa(planCost ? Math.round(planCost * 1.8) : 250000);
    else if (p === 'quadrennial') setPriceAoa(planCost ? Math.round(planCost * 1.8) : 800000);
    else if (p === 'lifetime') setPriceAoa(planCost ? Math.round(planCost * 1.8) : 1500000);
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

      // Regista automaticamente a dívida no Firebase para este parceiro
      await recordPartnerDebt({
        partner_id: partnerCode,
        partner_name: partnerName,
        license_id: lic.id,
        company_name: companyName,
        plan_type: plan,
        cost_aoa: currentPlanCost,
        client_price_aoa: priceAoa,
        created_at: Date.now(),
        paid: false,
        paid_at: null,
      });

      // Regista também na coleção de empresas clientes se ainda não existir
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

  const handleCreateAdminTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminTicketSubject || !adminTicketMessage) return;
    setSubmittingAdminTicket(true);

    try {
      const newTk = await createSupportTicket({
        company_name: partnerName,
        contact_email: session?.email || 'parceiro@kivora.ao',
        contact_phone: '+244 923 000 000',
        subject: `[PARCEIRO] ${adminTicketSubject}`,
        category: adminTicketCategory,
        priority: 'high',
        initial_message: adminTicketMessage,
        partner_id: partnerCode,
        partner_name: partnerName,
        target_type: 'admin',
        created_by_role: 'partner',
        sender_name: partnerName
      });

      setShowAdminTicketModal(false);
      setAdminTicketSubject('');
      setAdminTicketMessage('');
      setSelectedTicket(newTk);
      alert(`Chamado para o Admin #${newTk.ticket_number} enviado com sucesso via Firebase!`);
    } catch (err: any) {
      alert('Erro ao enviar chamado para o Admin: ' + err.message);
    } finally {
      setSubmittingAdminTicket(false);
    }
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatReply.trim() || !selectedTicket) return;

    try {
      await sendTicketMessage(selectedTicket.id, {
        sender_name: partnerName,
        sender_role: 'partner',
        sender_email: session?.email || '',
        text: chatReply
      });
      setChatReply('');
    } catch (err: any) {
      alert('Erro ao enviar resposta: ' + err.message);
    }
  };

  const handleResolveTicket = async (ticketId: string) => {
    try {
      await updateTicketStatus(ticketId, 'resolved');
      alert('Chamado marcado como Resolvido no Firebase!');
    } catch (err: any) {
      alert('Erro ao atualizar status: ' + err.message);
    }
  };

  const handleLogout = () => {
    clearStoredSession();
    onLogout();
  };

  const navItems = [
    { id: 'dashboard', label: 'Painel Geral', icon: LayoutDashboard },
    { id: 'clientes', label: 'Meus Clientes', icon: Users },
    { id: 'emitir-licenca', label: 'Emitir Licença', icon: Key },
    { id: 'extrato', label: 'Extrato de Dívida', icon: DollarSign, badge: totalPendingDebt > 0 ? 1 : 0 },
    { id: 'materiais', label: 'Kits & Vendas', icon: Package },
    { id: 'suporte', label: 'Central de Suporte', icon: Headphones, badge: clientTickets.filter(t => t.status === 'open').length },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">

      {/* Sidebar Executiva do Parceiro */}
      <aside className="w-64 bg-slate-950 text-white flex flex-col shrink-0 border-r border-slate-800">
        <div className="p-5 border-b border-slate-800/80">
          <KivoraLogo variant="light" size="sm" />
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800/50">
              Portal do Parceiro
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Ligado ao Firebase" />
          </div>
        </div>

        {/* Info Parceiro */}
        <div className="p-4 bg-slate-900/60 border-b border-slate-800/80">
          <p className="text-xs font-black text-white truncate">{partnerName}</p>
          <p className="text-[10px] text-emerald-400 font-mono font-bold mt-0.5">{partnerCode}</p>
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
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                  active
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.id === 'extrato' && totalPendingDebt > 0 ? (
                  <span className="bg-amber-500 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded-full" title="Dívida pendente">
                    Pendente
                  </span>
                ) : item.badge && item.badge > 0 ? (
                  <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* Footer Sidebar */}
        <div className="p-3 border-t border-slate-800/80">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-slate-500" />
            <span>Terminar Sessão</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-black text-slate-900">
              {activeSection === 'dashboard' && 'Visão Geral do Parceiro'}
              {activeSection === 'clientes' && 'Carteira de Clientes'}
              {activeSection === 'emitir-licenca' && 'Emissão de Chaves de Licença'}
              {activeSection === 'extrato' && 'Extrato de Dívida à Kivora'}
              {activeSection === 'materiais' && 'Kits Comerciais & Vendas'}
              {activeSection === 'suporte' && 'Central de Suporte & Atendimento Multilateral'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveSection('emitir-licenca')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Emitir Licença</span>
            </button>
          </div>
        </header>

        {/* Content Scrollable */}
        <main className="flex-1 overflow-y-auto p-8 space-y-6">

          {/* SECTION: DASHBOARD */}
          {activeSection === 'dashboard' && (
            <div className="space-y-6">

              {/* Top Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Licenças Emitidas</span>
                  <p className="text-2xl font-black text-slate-900">{partnerDebts.length}</p>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-block">
                    Conectado ao Firebase
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Empresas Clientes</span>
                  <p className="text-2xl font-black text-slate-900">{partnerClients.length}</p>
                  <span className="text-[10px] text-slate-500 font-medium block">Carteira ativa</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Dívida Pendente à Kivora</span>
                  <p className={`text-xl font-black font-mono ${totalPendingDebt > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {fmt(totalPendingDebt)} Kz
                  </p>
                  <span className="text-[10px] text-slate-500 font-medium block">
                    {totalPendingDebt > 0 ? 'Saldo a regularizar' : 'Tudo regularizado'}
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Margem / Lucro Estimado</span>
                  <p className="text-xl font-black text-emerald-600 font-mono">
                    {fmt(totalPartnerProfit)} Kz
                  </p>
                  <span className="text-[10px] text-emerald-700 font-bold block">Lucro bruto obtido</span>
                </div>
              </div>

              {/* Dívida Alert se houver pendência */}
              {totalPendingDebt > 0 && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                    <div>
                      <h4 className="font-bold text-amber-900">Tem um saldo devedor de {fmt(totalPendingDebt)} Kz referente a licenças emitidas</h4>
                      <p className="text-amber-700 text-[11px]">Efetue a transferência para a conta Kivora e informe a administração para dar baixa no extrato.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveSection('extrato')}
                    className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-3.5 py-2 rounded-xl shrink-0 cursor-pointer shadow-sm"
                  >
                    Ver Extrato Completo
                  </button>
                </div>
              )}

              {/* Licenças Recentes */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-slate-900 text-sm">Últimas Licenças Emitidas pela sua Conta</h3>
                  <button
                    onClick={() => setActiveSection('emitir-licenca')}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                  >
                    + Nova Licença
                  </button>
                </div>

                {partnerDebts.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 space-y-2">
                    <Key className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="font-bold text-xs text-slate-700">Ainda não emitiu licenças</p>
                    <p className="text-[11px]">Clique no botão "Emitir Licença" para gerar a primeira chave para o seu cliente.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden text-xs">
                    {partnerDebts.slice(0, 5).map((debt) => (
                      <div key={debt.id} className="p-4 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-900">{debt.license_id}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              debt.paid ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {debt.paid ? '✓ Pago à Kivora' : 'Dívida Pendente'}
                            </span>
                          </div>
                          <p className="text-slate-600 font-medium mt-0.5">{debt.company_name} • Plano: {debt.plan_type}</p>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-black text-slate-900">{fmt(debt.cost_aoa)} Kz</span>
                          <span className="text-[10px] text-slate-400 block font-medium">Custo Kivora</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* SECTION: CLIENTES */}
          {activeSection === 'clientes' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Carteira de Clientes do Parceiro</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Empresas que utilizam licenças ativadas com o seu código de parceiro.</p>
                </div>
                <div className="relative max-w-xs w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Pesquisar por nome ou NIF..."
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
              </div>

              {filteredClients.length === 0 ? (
                <div className="p-12 text-center text-slate-400 space-y-2">
                  <Building2 className="w-10 h-10 mx-auto text-slate-300" />
                  <h4 className="font-bold text-slate-700 text-sm">
                    {clientSearch ? `Nenhum cliente com "${clientSearch}"` : 'Nenhum cliente registado ainda'}
                  </h4>
                  <p className="text-xs text-slate-400">Emita a sua primeira licença para adicionar empresas à sua carteira.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden text-xs">
                  {filteredClients.map((c) => (
                    <div key={c.id || c.nif} className="p-4 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{c.name}</h4>
                        <p className="text-slate-500 font-mono text-[11px]">NIF: {c.nif} • {c.email || 'Email não registado'}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200">
                          Cliente Ativo
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SECTION: EMITIR LICENÇA */}
          {activeSection === 'emitir-licenca' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6 max-w-2xl">
              <div>
                <h2 className="text-lg font-black text-slate-900">Emitir Chave de Licença para Cliente</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Gere uma licença oficial vinculada à sua conta de parceiro. Cada emissão gera uma dívida com o custo de atacado Kivora.
                </p>
              </div>

              {generatedKey ? (
                <div className="p-6 bg-slate-950 text-white rounded-3xl space-y-4 text-center animate-fadeIn">
                  <div className="w-12 h-12 bg-emerald-600/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-black">Chave Emitida com Sucesso!</h3>
                  <p className="font-mono text-2xl font-black text-emerald-400 tracking-wider select-all">{generatedKey}</p>
                  <button
                    onClick={handleCopyKey}
                    className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 mx-auto cursor-pointer"
                  >
                    {copiedKey ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedKey ? 'Chave Copiada!' : 'Copiar Chave'}</span>
                  </button>
                  <div className="pt-2">
                    <button
                      onClick={() => setGeneratedKey(null)}
                      className="text-xs font-bold text-slate-400 hover:text-white underline cursor-pointer"
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
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 font-medium focus:bg-white focus:outline-none focus:border-emerald-500"
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
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 font-mono font-bold focus:bg-white focus:outline-none focus:border-emerald-500"
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
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 font-medium focus:bg-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 uppercase">Plano Selecionado</label>
                      <select
                        value={plan}
                        onChange={(e) => handlePlanChange(e.target.value as PlanType)}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-white font-bold focus:outline-none focus:border-emerald-500"
                      >
                        {pricingPlans.map((p) => (
                          <option key={p.plan_type} value={p.plan_type}>
                            {p.label} (Custo Kivora: {fmt(p.cost_aoa)} Kz)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 uppercase">Preço que cobra ao Cliente (Kz)</label>
                      <input
                        type="number"
                        min={currentPlanCost}
                        value={priceAoa}
                        onChange={(e) => setPriceAoa(Number(e.target.value))}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 font-mono font-bold focus:bg-white focus:outline-none focus:border-emerald-500"
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
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 font-bold focus:bg-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Resumo Financeiro da Operação */}
                  <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2 text-xs">
                    <div className="flex justify-between items-center text-slate-300">
                      <span>Custo Kivora (sua dívida a pagar):</span>
                      <strong className="text-amber-400 font-mono text-sm">{fmt(currentPlanCost)} Kz</strong>
                    </div>
                    <div className="flex justify-between items-center text-slate-300">
                      <span>Preço de Venda ao Cliente:</span>
                      <strong className="text-white font-mono text-sm">{fmt(priceAoa)} Kz</strong>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                      <span className="font-bold text-emerald-400">Sua Margem / Lucro Bruto:</span>
                      <strong className="text-emerald-400 font-mono text-base font-black">+{fmt(partnerMargin)} Kz</strong>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3.5 rounded-2xl shadow-md shadow-emerald-600/20 cursor-pointer transition-all"
                  >
                    {submitting ? 'A Gravar no Firebase...' : 'Confirmar & Emitir Chave de Licença KVRA'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* SECTION: EXTRATO DE DÍVIDA */}
          {activeSection === 'extrato' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Extrato Financeiro & Dívidas à Kivora</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Histórico de licenças emitidas pela sua conta com os custos devidos à Kivora e o estado de pagamento.
                  </p>
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  <button
                    onClick={() => {
                      const headers = ['Licenca_ID', 'Empresa', 'Plano', 'Custo_Devido_Kivora_AOA', 'Cobrado_Cliente_AOA', 'Margem_AOA', 'Estado', 'Data'];
                      const rows = partnerDebts.map(d => [
                        d.license_id,
                        `"${(d.company_name || '').replace(/"/g, '""')}"`,
                        d.plan_type,
                        d.cost_aoa,
                        d.client_price_aoa,
                        Math.max(0, (d.client_price_aoa || 0) - d.cost_aoa),
                        d.paid ? 'Pago' : 'Pendente',
                        new Date(d.created_at).toISOString().split('T')[0]
                      ]);
                      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
                      const link = document.createElement('a');
                      link.setAttribute('href', encodeURI(csvContent));
                      link.setAttribute('download', `extrato_parceiro_${partnerCode}_${new Date().toISOString().split('T')[0]}.csv`);
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Exportar Extrato CSV</span>
                  </button>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Dívida Pendente</span>
                    <span className={`text-base font-black font-mono ${totalPendingDebt > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {fmt(totalPendingDebt)} Kz
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Já Pago</span>
                    <span className="text-base font-black text-emerald-600 font-mono">
                      {fmt(totalPaidToKivora)} Kz
                    </span>
                  </div>
                </div>
              </div>

              {/* Card de Coordenadas Bancárias para Regularização */}
              {totalPendingDebt > 0 && (
                <div className="p-5 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white rounded-3xl border border-slate-800 space-y-3 shadow-md">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-blue-400">Coordenadas Bancárias Oficiais KIVORA</h4>
                      <p className="text-[11px] text-slate-300">Efetue a transferência do valor pendente e envie o comprovativo ao suporte central.</p>
                    </div>
                    <span className="text-amber-400 font-mono font-bold text-xs bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/30">
                      Total a Liquidar: {fmt(totalPendingDebt)} Kz
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 font-sans block">Banco BAI (Kz)</span>
                        <strong className="text-white">AO06.0040.0000.1234.5678.9012.3</strong>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText('AO06.0040.0000.1234.5678.9012.3');
                          alert('IBAN BAI copiado para a área de transferência!');
                        }}
                        className="p-1.5 text-slate-400 hover:text-white bg-white/10 rounded-lg cursor-pointer"
                        title="Copiar IBAN"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 font-sans block">Banco BFA (Kz)</span>
                        <strong className="text-white">AO06.0006.0000.9876.5432.1098.7</strong>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText('AO06.0006.0000.9876.5432.1098.7');
                          alert('IBAN BFA copiado para a área de transferência!');
                        }}
                        className="p-1.5 text-slate-400 hover:text-white bg-white/10 rounded-lg cursor-pointer"
                        title="Copiar IBAN"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {partnerDebts.length === 0 ? (
                <div className="p-12 text-center text-slate-400 space-y-2">
                  <DollarSign className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="font-bold text-slate-700 text-sm">Nenhuma licença emitida</p>
                  <p className="text-xs text-slate-400">Emita a sua primeira licença para ver os registos financeiros aqui.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden text-xs">
                  {partnerDebts.map((debt) => (
                    <div key={debt.id} className="p-4 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900">{debt.company_name}</p>
                          <span className={`font-bold text-[10px] px-2 py-0.5 rounded-full border ${
                            debt.paid ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}>
                            {debt.paid ? '✓ Pago à Kivora' : 'Dívida Pendente'}
                          </span>
                        </div>
                        <p className="text-slate-400 text-[10px] font-mono mt-0.5">
                          {debt.license_id} • Plano: {debt.plan_type} • {new Date(debt.created_at).toLocaleDateString('pt-AO')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-slate-900 font-mono">{fmt(debt.cost_aoa)} Kz</p>
                        <p className="text-[10px] text-slate-400">custo devido à Kivora</p>
                        {debt.client_price_aoa > 0 && (
                          <p className="text-[10px] text-emerald-600 font-bold">
                            Cobrado ao cliente: {fmt(debt.client_price_aoa)} Kz (Margem: +{fmt(Math.max(0, debt.client_price_aoa - debt.cost_aoa))} Kz)
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
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
                  { titulo: 'Tabela de Preços e Margens', desc: 'Preços recomendados e cálculo de margens de revenda.', tam: '1.1 MB' },
                  { titulo: 'Certificado de Conformidade AGT', desc: 'Comprovativo oficial para o cliente.', tam: '0.8 MB' },
                ].map((m, i) => (
                  <div key={i} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <FileText className="w-6 h-6 text-blue-600" />
                    <h4 className="font-bold text-slate-900 text-xs">{m.titulo}</h4>
                    <p className="text-[11px] text-slate-500">{m.desc}</p>
                    <button
                      onClick={() => alert(`Download de ${m.titulo} iniciado.`)}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Baixar ({m.tam})</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION: SUPORTE MULTILATERAL */}
          {activeSection === 'suporte' && (
            <div className="space-y-6">

              {/* Header do Suporte */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Central de Suporte & Atendimento</h2>
                  <p className="text-xs text-slate-500">
                    Atenda os chamados dos seus clientes ou solicite apoio direto à administração central da Kivora.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAdminTicketModal(true)}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Falar com o Admin (Kivora Central)</span>
                  </button>
                </div>
              </div>

              {/* Sub-tabs */}
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold">
                <button
                  onClick={() => { setSupportTab('clientes'); setSelectedTicket(null); }}
                  className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                    supportTab === 'clientes'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Chamados dos Meus Clientes ({clientTickets.length})
                </button>

                <button
                  onClick={() => { setSupportTab('admin'); setSelectedTicket(null); }}
                  className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                    supportTab === 'admin'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Minhas Conversas com o Admin Kivora ({adminTickets.length})
                </button>
              </div>

              {/* Grid: Lista de Tickets + Chat */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* Lista de Chamados */}
                <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                    {supportTab === 'clientes' ? 'Tickets da Carteira de Clientes' : 'Chamados com a Direção Kivora'}
                  </h3>

                  {((supportTab === 'clientes' ? clientTickets : adminTickets).length === 0) ? (
                    <div className="p-8 text-center text-slate-400 space-y-2">
                      <Headphones className="w-8 h-8 mx-auto text-slate-300" />
                      <p className="font-bold text-xs text-slate-700">Nenhum chamado ativo nesta aba</p>
                      <p className="text-[11px] text-slate-400">
                        {supportTab === 'clientes'
                          ? 'Os seus clientes poderão abrir tickets através da Área do Cliente deles.'
                          : 'Clique em "Falar com o Admin" para abrir uma solicitação.'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                      {(supportTab === 'clientes' ? clientTickets : adminTickets).map((tk) => {
                        const isSel = selectedTicket?.id === tk.id;
                        return (
                          <div
                            key={tk.id}
                            onClick={() => setSelectedTicket(tk)}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                              isSel
                                ? 'bg-emerald-50 border-emerald-300 shadow-xs'
                                : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="font-mono text-[10px] font-black text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                                {tk.ticket_number}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                tk.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' :
                                tk.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                'bg-amber-100 text-amber-800'
                              }`}>
                                {tk.status === 'resolved' ? 'Resolvido' : tk.status === 'in_progress' ? 'Em Atendimento' : 'Aberto'}
                              </span>
                            </div>

                            <h4 className="font-bold text-slate-900 text-xs line-clamp-1">{tk.subject}</h4>
                            <p className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                              <span className="font-semibold text-slate-700 truncate max-w-[160px]">{tk.company_name}</span>
                              <span className="font-bold text-emerald-600">{tk.messages.length} msg(s)</span>
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Chat / Resposta ao Chamado */}
                <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[560px] overflow-hidden">
                  {selectedTicket ? (
                    <>
                      {/* Header do Chat */}
                      <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-black text-slate-900">{selectedTicket.ticket_number}</span>
                            <span className="text-slate-300">•</span>
                            <h4 className="font-bold text-slate-900 text-xs">{selectedTicket.subject}</h4>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            Empresa: <strong className="text-slate-800">{selectedTicket.company_name}</strong> ({selectedTicket.contact_email})
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {selectedTicket.status !== 'resolved' && (
                            <button
                              onClick={() => handleResolveTicket(selectedTicket.id)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg shadow-xs cursor-pointer"
                            >
                              Marcar Resolvido
                            </button>
                          )}
                          <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                            selectedTicket.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' :
                            selectedTicket.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {selectedTicket.status === 'resolved' ? 'Resolvido' : selectedTicket.status === 'in_progress' ? 'Em Atendimento' : 'Aberto'}
                          </span>
                        </div>
                      </div>

                      {/* Thread de Mensagens */}
                      <div className="flex-1 p-5 overflow-y-auto space-y-3 bg-slate-50/50">
                        {selectedTicket.messages.map((msg, i) => {
                          const isMe = msg.sender_role === 'partner';
                          return (
                            <div
                              key={msg.id || i}
                              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                            >
                              <span className="text-[10px] font-bold text-slate-400 mb-1 px-1">
                                {msg.sender_name} ({msg.sender_role === 'partner' ? 'Você (Parceiro)' : msg.sender_role === 'client' ? 'Cliente' : 'Admin Central'})
                              </span>
                              <div className={`p-3.5 rounded-2xl text-xs max-w-md ${
                                isMe
                                  ? 'bg-emerald-600 text-white rounded-br-xs shadow-xs'
                                  : 'bg-white text-slate-900 border border-slate-200 rounded-bl-xs shadow-xs'
                              }`}>
                                <p className="whitespace-pre-wrap">{msg.text}</p>
                                <span className={`text-[9px] font-medium mt-1.5 block text-right ${isMe ? 'text-emerald-100' : 'text-slate-400'}`}>
                                  {new Date(msg.timestamp).toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Input de Envio de Resposta */}
                      <form onSubmit={handleSendChatMessage} className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Escreva a sua resposta em tempo real..."
                          value={chatReply}
                          onChange={(e) => setChatReply(e.target.value)}
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white font-medium"
                        />
                        <button
                          type="submit"
                          disabled={!chatReply.trim()}
                          className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white p-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </form>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                      <MessageSquare className="w-10 h-10 text-slate-300 mb-2" />
                      <h4 className="font-bold text-slate-700 text-sm">Selecione um chamado ao lado</h4>
                      <p className="text-xs text-slate-400 mt-1 max-w-xs">
                        Veja o histórico de mensagens e responda diretamente pelo portal.
                      </p>
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

        </main>
      </div>

      {/* MODAL: ABRIR TICKET DIRETO PARA O ADMIN */}
      {showAdminTicketModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900">Solicitação à Direção Kivora</h3>
                <p className="text-xs text-slate-500">Destinado a: Equipa Executiva & Financeira Central</p>
              </div>
              <button
                onClick={() => setShowAdminTicketModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAdminTicket} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase text-[11px]">Assunto da Solicitação *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Regularização de Dívidas / Comprovativo de Pagamento"
                  value={adminTicketSubject}
                  onChange={(e) => setAdminTicketSubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase text-[11px]">Categoria</label>
                <select
                  value={adminTicketCategory}
                  onChange={(e) => setAdminTicketCategory(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500 font-bold"
                >
                  <option value="licenciamento">Licenciamento & Regularização de Dívidas</option>
                  <option value="tecnico">Suporte Técnico Nível 2 (Engenharia)</option>
                  <option value="faturacao">Conformidade Fiscal AGT & Faturação</option>
                  <option value="multiloja">Projetos Especiais / Redes Corporativas</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase text-[11px]">Mensagem Detalhada *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Escreva os detalhes do seu pedido (ex: anexei comprovativo de transferência bancária)..."
                  value={adminTicketMessage}
                  onChange={(e) => setAdminTicketMessage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500 font-medium resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdminTicketModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingAdminTicket}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  {submittingAdminTicket ? 'A Enviar ao Admin...' : 'Enviar Solicitação'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
