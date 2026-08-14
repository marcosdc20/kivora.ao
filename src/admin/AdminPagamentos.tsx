import React, { useState, useEffect } from 'react';
import {
  CreditCard, Download, Search, Plus, CheckCircle2,
  X, Check, Clock, Loader2, FileText,
  Users, TrendingDown, Wallet
} from 'lucide-react';
import { AdminTopbar, StatCard } from './AdminComponents';
import { db } from '../lib/firebase';
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore';
import {
  subscribeAllDebts, markDebtsPaid, PartnerDebtEntry
} from './services/partnerDebtService';

export interface SubscriptionInvoice {
  id: string;
  invoice_number: string;
  company_name: string;
  nif: string;
  plan_label: string;
  amount_aoa: number;
  status: 'paid' | 'pending' | 'overdue';
  issue_date: string;
  due_date: string;
  payment_method?: 'Multicaixa Express' | 'Transferência Bancária (IBAN)' | 'Numerário';
}

const fmt = (n: number) => n.toLocaleString('pt-AO');

export const AdminPagamentos: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'clientes' | 'parceiros'>('clientes');

  // Clientes / Faturas
  const [invoices, setInvoices] = useState<SubscriptionInvoice[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
  const [showModal, setShowModal] = useState(false);

  // Parceiros / Dívidas
  const [partnerDebts, setPartnerDebts] = useState<PartnerDebtEntry[]>([]);
  const [partnerSearch, setPartnerSearch] = useState('');
  const [partnerStatusFilter, setPartnerStatusFilter] = useState<'all' | 'pending' | 'paid'>('all');
  const [selectedDebtIds, setSelectedDebtIds] = useState<string[]>([]);
  const [markingDebts, setMarkingDebts] = useState(false);

  // Form de Fatura
  const [companyName, setCompanyName] = useState('');
  const [companyNif, setCompanyNif] = useState('');
  const [planLabel, setPlanLabel] = useState('Plano Anual - ERP Core');
  const [amount, setAmount] = useState<number>(250000);
  const [method, setMethod] = useState<'Multicaixa Express' | 'Transferência Bancária (IBAN)' | 'Numerário'>('Transferência Bancária (IBAN)');
  const [status, setStatus] = useState<'paid' | 'pending'>('paid');

  // Sincronização em Tempo Real com Firestore (/licenses)
  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, 'licenses'), (snapshot) => {
        const fireInvoices: SubscriptionInvoice[] = [];
        let count = 1;
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          const num = String(count++).padStart(4, '0');
          const isPaid = d.status === 'active';
          const isOverdue = d.status === 'expired';
          const planMap: Record<string, string> = {
            daily: 'Plano Diário',
            weekly: 'Plano Semanal',
            biweekly: 'Plano Quinzenal',
            monthly: 'Plano Mensal',
            quarterly: 'Plano Trimestral',
            semiannual: 'Plano Semestral',
            annual: 'Plano Anual',
            quadrennial: 'Plano Quadrienal',
            lifetime: 'Plano Vitalício'
          };
          const planStr = planMap[d.plan_type] || d.plan_type || 'Plano Anual';
          const price = Number(d.price_aoa) || (d.plan_type === 'monthly' ? 25000 : d.plan_type === 'lifetime' ? 1500000 : 250000);

          fireInvoices.push({
            id: docSnap.id,
            invoice_number: `FT-2026/${num}`,
            company_name: d.company_name || d.client_email || 'Empresa Cliente',
            nif: d.nif || '5400000000',
            plan_label: `${planStr} - Kivora ERP`,
            amount_aoa: price,
            status: isPaid ? 'paid' : isOverdue ? 'overdue' : 'pending',
            issue_date: d.created_at ? new Date(typeof d.created_at === 'number' ? d.created_at : Date.now()).toISOString().split('T')[0] : '2026-08-01',
            due_date: d.expires_at ? new Date(typeof d.expires_at === 'number' ? d.expires_at : Date.now() + 30 * 86400000).toISOString().split('T')[0] : '2026-08-30',
            payment_method: isPaid ? 'Transferência Bancária (IBAN)' : undefined
          });
        });

        setInvoices(fireInvoices);
        setLoadingInvoices(false);
      }, (err) => {
        console.warn('Erro ao escutar licenses:', err);
        setLoadingInvoices(false);
      });

      return () => unsub();
    } catch (e) {
      console.warn(e);
      setLoadingInvoices(false);
    }
  }, []);

  // Sincronização em Tempo Real com Dívidas dos Parceiros (/partner_debts)
  useEffect(() => {
    const unsub = subscribeAllDebts(setPartnerDebts);
    return () => unsub();
  }, []);

  const filteredInvoices = invoices.filter(inv => {
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    const s = searchQuery.toLowerCase();
    const matchesSearch = inv.company_name.toLowerCase().includes(s) ||
      inv.invoice_number.toLowerCase().includes(s) ||
      inv.nif.includes(s);
    return matchesStatus && matchesSearch;
  });

  const filteredPartnerDebts = partnerDebts.filter(d => {
    const matchesStatus = partnerStatusFilter === 'all' ||
      (partnerStatusFilter === 'pending' && !d.paid) ||
      (partnerStatusFilter === 'paid' && d.paid);
    const s = partnerSearch.toLowerCase();
    const matchesSearch = (d.partner_name || '').toLowerCase().includes(s) ||
      (d.partner_id || '').toLowerCase().includes(s) ||
      (d.company_name || '').toLowerCase().includes(s) ||
      d.license_id.toLowerCase().includes(s);
    return matchesStatus && matchesSearch;
  });

  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((acc, i) => acc + i.amount_aoa, 0);
  const totalPending = invoices.filter(i => i.status === 'pending').reduce((acc, i) => acc + i.amount_aoa, 0);

  const totalPartnerDebtPending = partnerDebts.filter(d => !d.paid).reduce((acc, d) => acc + d.cost_aoa, 0);
  const totalPartnerDebtPaid = partnerDebts.filter(d => d.paid).reduce((acc, d) => acc + d.cost_aoa, 0);

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !amount) return;

    const newInvId = `inv_${Date.now()}`;
    const newInv: SubscriptionInvoice = {
      id: newInvId,
      invoice_number: `FT-2026/${String(invoices.length + 1).padStart(4, '0')}`,
      company_name: companyName,
      nif: companyNif || '5400000000',
      plan_label: planLabel,
      amount_aoa: amount,
      status: status,
      issue_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      payment_method: status === 'paid' ? method : undefined
    };

    try {
      await setDoc(doc(db, 'licenses', newInvId), {
        company_name: companyName,
        nif: companyNif || '5400000000',
        plan_type: 'annual',
        price_aoa: amount,
        status: status === 'paid' ? 'active' : 'pending',
        created_at: Date.now(),
        expires_at: Date.now() + 365 * 86400000,
      }, { merge: true });

      setInvoices([newInv, ...invoices]);
      setShowModal(false);
      setCompanyName('');
      setCompanyNif('');
      alert(`Fatura ${newInv.invoice_number} registada com sucesso no Firebase!`);
    } catch (err: any) {
      alert('Erro ao registar fatura no Firebase: ' + err.message);
    }
  };

  const handleMarkAsPaid = async (id: string) => {
    try {
      await setDoc(doc(db, 'licenses', id), {
        status: 'active'
      }, { merge: true });

      setInvoices(invoices.map(inv =>
        inv.id === id ? { ...inv, status: 'paid', payment_method: 'Transferência Bancária (IBAN)' } : inv
      ));
    } catch (err: any) {
      alert('Erro ao atualizar estado da fatura: ' + err.message);
    }
  };

  const handleMarkPartnerDebtsPaid = async () => {
    if (selectedDebtIds.length === 0) return;
    setMarkingDebts(true);
    try {
      await markDebtsPaid(selectedDebtIds);
      const paidAmount = partnerDebts.filter(d => selectedDebtIds.includes(d.id)).reduce((acc, d) => acc + d.cost_aoa, 0);
      setSelectedDebtIds([]);
      alert(`Pagamento de ${fmt(paidAmount)} Kz liquidado com sucesso para ${selectedDebtIds.length} licença(s) de parceiro!`);
    } catch (err: any) {
      alert('Erro ao liquidar dívidas: ' + err.message);
    } finally {
      setMarkingDebts(false);
    }
  };

  const exportClientInvoicesCSV = () => {
    const headers = ['Numero_Fatura', 'Empresa', 'NIF', 'Plano', 'Valor_AOA', 'Estado', 'Vencimento'];
    const rows = filteredInvoices.map(i => [
      i.invoice_number,
      `"${i.company_name.replace(/"/g, '""')}"`,
      i.nif,
      `"${i.plan_label}"`,
      i.amount_aoa,
      i.status,
      i.due_date
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `faturas_kivora_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPartnerDebtsCSV = () => {
    const headers = ['Licenca_ID', 'Parceiro_Codigo', 'Parceiro_Nome', 'Empresa_Cliente', 'Plano', 'Custo_Kivora_AOA', 'Preco_Venda_AOA', 'Estado', 'Data_Emissao'];
    const rows = filteredPartnerDebts.map(d => [
      d.license_id,
      d.partner_id,
      `"${(d.partner_name || '').replace(/"/g, '""')}"`,
      `"${(d.company_name || '').replace(/"/g, '""')}"`,
      d.plan_type,
      d.cost_aoa,
      d.client_price_aoa,
      d.paid ? 'Pago' : 'Pendente',
      new Date(d.created_at).toISOString().split('T')[0]
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `dividas_parceiros_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <AdminTopbar
        title="Faturação, Cobranças & Pagamentos"
        subtitle="Gestão de cobranças diretas a clientes e controle de dívidas de atacado dos parceiros"
        actions={
          <div className="flex items-center gap-2">
            {activeTab === 'clientes' ? (
              <>
                <button
                  onClick={exportClientInvoicesCSV}
                  className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-xs transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Exportar CSV</span>
                </button>
                <button
                  onClick={() => setShowModal(true)}
                  className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-blue-600/20 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Emitir Fatura</span>
                </button>
              </>
            ) : (
              <button
                onClick={exportPartnerDebtsCSV}
                className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-xs transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Exportar Dívidas CSV</span>
              </button>
            )}
          </div>
        }
      />

      <div className="p-6 space-y-5">
        {/* KPI Cards — Visão Unificada */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Liquidado (Clientes)"
            value={`${fmt(totalPaid)} Kz`}
            sub={`${invoices.filter(i => i.status === 'paid').length} faturas pagas`}
            subColor="green"
            icon={<CreditCard className="w-4 h-4" />}
            iconBg="bg-emerald-50 text-emerald-600"
          />
          <StatCard
            label="Faturas Pendentes (Clientes)"
            value={`${fmt(totalPending)} Kz`}
            sub="Cobranças diretas abertas"
            subColor="amber"
            icon={<Clock className="w-4 h-4" />}
            iconBg="bg-amber-50 text-amber-600"
          />
          <StatCard
            label="Dívidas a Receber de Parceiros"
            value={`${fmt(totalPartnerDebtPending)} Kz`}
            sub={`${partnerDebts.filter(d => !d.paid).length} licenças a liquidar`}
            subColor="amber"
            icon={<TrendingDown className="w-4 h-4" />}
            iconBg="bg-rose-50 text-rose-600"
          />
          <StatCard
            label="Total Recebido de Parceiros"
            value={`${fmt(totalPartnerDebtPaid)} Kz`}
            sub={`${partnerDebts.filter(d => d.paid).length} licenças pagas`}
            subColor="green"
            icon={<Wallet className="w-4 h-4" />}
            iconBg="bg-purple-50 text-purple-600"
          />
        </div>

        {/* Abas Superiores */}
        <div className="flex gap-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => setActiveTab('clientes')}
            className={`text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'clientes'
                ? 'bg-slate-950 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-400'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Faturas Diretas a Clientes ({invoices.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('parceiros')}
            className={`text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'parceiros'
                ? 'bg-slate-950 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-400'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Dívidas & Cobranças a Parceiros ({partnerDebts.length})</span>
            {totalPartnerDebtPending > 0 && (
              <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {fmt(totalPartnerDebtPending)} Kz
              </span>
            )}
          </button>
        </div>

        {/* ─── ABA 1: FATURAS DE CLIENTES ───────────────────────────────────── */}
        {activeTab === 'clientes' && (
          <div className="space-y-4">
            {/* Filtros e Pesquisa */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="flex gap-2">
                {[
                  { id: 'all', label: 'Todas as Faturas' },
                  { id: 'paid', label: 'Pagas' },
                  { id: 'pending', label: 'Pendentes' },
                  { id: 'overdue', label: 'Vencidas' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setStatusFilter(f.id as any)}
                    className={`text-xs font-bold px-4 py-2 rounded-xl border transition-all ${
                      statusFilter === f.id
                        ? 'bg-slate-950 text-white border-slate-950 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Pesquisar por fatura, empresa, NIF..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>
            </div>

            {/* Tabela de Faturas */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-slate-400 uppercase font-black text-[10px] tracking-wider">
                    <th className="p-4">N.º Fatura</th>
                    <th className="p-4">Empresa / NIF</th>
                    <th className="p-4">Plano de Subscrição</th>
                    <th className="p-4">Valor (Kz)</th>
                    <th className="p-4">Método</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4">Vencimento</th>
                    <th className="p-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loadingInvoices ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400">
                        <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-600" />
                        <span>A sincronizar faturas com o Firebase...</span>
                      </td>
                    </tr>
                  ) : filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400">
                        <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p className="font-bold text-slate-700">Nenhuma fatura encontrada</p>
                        <p className="text-[11px] mt-1 text-slate-400">
                          As faturas são geradas automaticamente com base nas licenças ativadas no Firebase.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-mono font-bold text-blue-600">
                          {inv.invoice_number}
                        </td>
                        <td className="p-4">
                          <p className="font-bold text-slate-900">{inv.company_name}</p>
                          <p className="text-slate-400 text-[10px] font-mono">NIF: {inv.nif}</p>
                        </td>
                        <td className="p-4 text-slate-600 font-medium">{inv.plan_label}</td>
                        <td className="p-4 font-mono font-black text-slate-900">{fmt(inv.amount_aoa)} Kz</td>
                        <td className="p-4 text-slate-500 text-[11px] font-medium">
                          {inv.payment_method || '—'}
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            inv.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            inv.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            'bg-red-50 text-red-700 border border-red-200'
                          }`}>
                            {inv.status === 'paid' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                            {inv.status === 'paid' ? 'Liquidada' : inv.status === 'pending' ? 'Pendente' : 'Vencida'}
                          </span>
                        </td>
                        <td className="p-4 text-slate-500 font-medium">{inv.due_date}</td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {inv.status !== 'paid' && (
                              <button
                                onClick={() => handleMarkAsPaid(inv.id)}
                                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                                title="Confirmar Pagamento"
                              >
                                <Check className="w-3 h-3" />
                                <span>Marcar Paga</span>
                              </button>
                            )}
                            <button
                              onClick={() => alert(`A transferir cópia da fatura ${inv.invoice_number}...`)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Descarregar PDF"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── ABA 2: DÍVIDAS & LIQUIDAÇÕES DE PARCEIROS ────────────────────── */}
        {activeTab === 'parceiros' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="flex gap-2">
                {[
                  { id: 'all', label: 'Todas as Dívidas' },
                  { id: 'pending', label: 'Pendentes de Pagamento' },
                  { id: 'paid', label: 'Liquidadas / Pagas' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setPartnerStatusFilter(f.id as any)}
                    className={`text-xs font-bold px-4 py-2 rounded-xl border transition-all ${
                      partnerStatusFilter === f.id
                        ? 'bg-slate-950 text-white border-slate-950 shadow-sm'
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                {selectedDebtIds.length > 0 && (
                  <button
                    onClick={handleMarkPartnerDebtsPaid}
                    disabled={markingDebts}
                    className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition-all cursor-pointer"
                  >
                    {markingDebts ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    <span>Confirmar Pagamento ({selectedDebtIds.length})</span>
                  </button>
                )}

                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Pesquisar parceiro, chave, empresa..."
                    value={partnerSearch}
                    onChange={(e) => setPartnerSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Tabela de Dívidas de Parceiros */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-slate-400 uppercase font-black text-[10px] tracking-wider">
                    <th className="p-4 w-10">
                      <span className="sr-only">Seleção</span>
                    </th>
                    <th className="p-4">Chave Licença / Cliente</th>
                    <th className="p-4">Parceiro Responsável</th>
                    <th className="p-4">Plano</th>
                    <th className="p-4">Custo Devido à Kivora</th>
                    <th className="p-4">Preço ao Cliente</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4">Data Emissão</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPartnerDebts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400">
                        <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p className="font-bold text-slate-700">Nenhuma dívida de parceiro encontrada</p>
                        <p className="text-[11px] mt-1 text-slate-400">
                          Quando os parceiros emitem licenças no portal deles, as dívidas de atacado surgem aqui automaticamente.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredPartnerDebts.map((debt) => (
                      <tr key={debt.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4">
                          <input
                            type="checkbox"
                            disabled={debt.paid}
                            checked={selectedDebtIds.includes(debt.id)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedDebtIds(prev => [...prev, debt.id]);
                              else setSelectedDebtIds(prev => prev.filter(id => id !== debt.id));
                            }}
                            className="w-4 h-4 accent-emerald-600 cursor-pointer"
                          />
                        </td>
                        <td className="p-4">
                          <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                            {debt.license_id}
                          </span>
                          <p className="font-bold text-slate-900 mt-1">{debt.company_name}</p>
                        </td>
                        <td className="p-4">
                          <p className="font-bold text-slate-900">{debt.partner_name || 'Parceiro'}</p>
                          <span className="font-mono text-[10px] text-slate-500">{debt.partner_id}</span>
                        </td>
                        <td className="p-4 font-semibold text-slate-700">{debt.plan_type}</td>
                        <td className="p-4 font-mono font-black text-slate-900">
                          {fmt(debt.cost_aoa)} Kz
                        </td>
                        <td className="p-4 font-mono text-slate-600">
                          {debt.client_price_aoa > 0 ? `${fmt(debt.client_price_aoa)} Kz` : '—'}
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            debt.paid ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {debt.paid && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                            {debt.paid ? 'Liquidado' : 'Dívida Pendente'}
                          </span>
                        </td>
                        <td className="p-4 text-slate-500 font-medium">
                          {new Date(debt.created_at).toLocaleDateString('pt-AO')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal Emitir Nova Fatura de Cliente */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">Emitir Nova Fatura de Subscrição</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-900">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase">Nome da Empresa</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Armazéns Luanda Sul, Lda"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase">NIF</label>
                <input
                  type="text"
                  placeholder="5401234567"
                  value={companyNif}
                  onChange={(e) => setCompanyNif(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase">Plano de Subscrição</label>
                <select
                  value={planLabel}
                  onChange={(e) => setPlanLabel(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-white font-bold"
                >
                  <option value="Plano Mensal - ERP Core">Plano Mensal - ERP Core</option>
                  <option value="Plano Anual - ERP Core (Recomendado)">Plano Anual - ERP Core</option>
                  <option value="Plano Anual - Multiloja (5 Filiais)">Plano Anual - Multiloja (5 Filiais)</option>
                  <option value="Plano Vitalício - Enterprise ERP">Plano Vitalício - Enterprise ERP</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Valor (Kz)</label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 font-mono font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Estado Inicial</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-white font-bold"
                  >
                    <option value="paid">Paga (Confirmada)</option>
                    <option value="pending">Pendente (Cobrança)</option>
                  </select>
                </div>
              </div>

              {status === 'paid' && (
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Método de Pagamento</label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value as any)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-white font-bold"
                  >
                    <option value="Transferência Bancária (IBAN)">Transferência Bancária (IBAN)</option>
                    <option value="Multicaixa Express">Multicaixa Express</option>
                    <option value="Numerário">Numerário / Depósito Direto</option>
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20"
                >
                  Emitir Fatura
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
