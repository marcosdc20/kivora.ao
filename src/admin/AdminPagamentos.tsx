import React, { useState } from 'react';
import {
  CreditCard, Download, Search, Plus, CheckCircle2,
  AlertCircle, X, Check, Clock
} from 'lucide-react';
import { AdminTopbar, StatCard } from './AdminComponents';

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

const INITIAL_INVOICES: SubscriptionInvoice[] = [
  {
    id: '1',
    invoice_number: 'FT-2026/0089',
    company_name: 'Kivora Retail & Comércio, Lda.',
    nif: '5012345678',
    plan_label: 'Plano Anual - Multiloja (5 Filiais)',
    amount_aoa: 450000,
    status: 'paid',
    issue_date: '2026-07-01',
    due_date: '2026-07-15',
    payment_method: 'Transferência Bancária (IBAN)'
  },
  {
    id: '2',
    invoice_number: 'FT-2026/0088',
    company_name: 'Supermercados Atlântico S.A.',
    nif: '5409876543',
    plan_label: 'Plano Vitalício - Enterprise ERP',
    amount_aoa: 1200000,
    status: 'paid',
    issue_date: '2026-06-28',
    due_date: '2026-07-05',
    payment_method: 'Multicaixa Express'
  },
  {
    id: '3',
    invoice_number: 'FT-2026/0087',
    company_name: 'Farmácia Central de Benguela',
    nif: '5123459876',
    plan_label: 'Plano Semestral - Saúde & Farmácia',
    amount_aoa: 180000,
    status: 'pending',
    issue_date: '2026-07-10',
    due_date: '2026-07-25'
  },
  {
    id: '4',
    invoice_number: 'FT-2026/0086',
    company_name: 'Hotel Baía & Turismo, Lda.',
    nif: '5098761234',
    plan_label: 'Plano Anual - Restauração & Hotelaria',
    amount_aoa: 320000,
    status: 'overdue',
    issue_date: '2026-06-15',
    due_date: '2026-06-30'
  },
  {
    id: '5',
    invoice_number: 'FT-2026/0085',
    company_name: 'Auto Mecânica Luanda S.A.',
    nif: '5312345678',
    plan_label: 'Plano Trimestral - Oficinas & Frotas',
    amount_aoa: 120000,
    status: 'paid',
    issue_date: '2026-06-10',
    due_date: '2026-06-20',
    payment_method: 'Transferência Bancária (IBAN)'
  }
];

const fmt = (n: number) => n.toLocaleString('pt-AO');

export const AdminPagamentos: React.FC = () => {
  const [invoices, setInvoices] = useState<SubscriptionInvoice[]>(INITIAL_INVOICES);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
  const [showModal, setShowModal] = useState(false);

  // Form
  const [companyName, setCompanyName] = useState('');
  const [companyNif, setCompanyNif] = useState('');
  const [planLabel, setPlanLabel] = useState('Plano Anual - ERP Core');
  const [amount, setAmount] = useState<number>(350000);
  const [method, setMethod] = useState<'Multicaixa Express' | 'Transferência Bancária (IBAN)' | 'Numerário'>('Transferência Bancária (IBAN)');
  const [status, setStatus] = useState<'paid' | 'pending'>('paid');

  const filteredInvoices = invoices.filter(inv => {
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    const s = searchQuery.toLowerCase();
    const matchesSearch = inv.company_name.toLowerCase().includes(s) ||
      inv.invoice_number.toLowerCase().includes(s) ||
      inv.nif.includes(s);
    return matchesStatus && matchesSearch;
  });

  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((acc, i) => acc + i.amount_aoa, 0);
  const totalPending = invoices.filter(i => i.status === 'pending').reduce((acc, i) => acc + i.amount_aoa, 0);
  const totalOverdue = invoices.filter(i => i.status === 'overdue').reduce((acc, i) => acc + i.amount_aoa, 0);

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !amount) return;

    const newInv: SubscriptionInvoice = {
      id: Date.now().toString(),
      invoice_number: `FT-2026/00${invoices.length + 90}`,
      company_name: companyName,
      nif: companyNif || '5400000000',
      plan_label: planLabel,
      amount_aoa: amount,
      status: status,
      issue_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      payment_method: status === 'paid' ? method : undefined
    };

    setInvoices([newInv, ...invoices]);
    setShowModal(false);
    setCompanyName('');
    setCompanyNif('');
    alert(`Fatura ${newInv.invoice_number} emitida com sucesso para ${newInv.company_name}!`);
  };

  const handleMarkAsPaid = (id: string) => {
    setInvoices(invoices.map(inv =>
      inv.id === id ? { ...inv, status: 'paid', payment_method: 'Transferência Bancária (IBAN)' } : inv
    ));
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <AdminTopbar
        title="Faturação & Subscrições"
        subtitle="Gestão de cobranças, faturas e pagamentos de clientes Kivora"
        actions={
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-blue-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Emitir Nova Fatura</span>
          </button>
        }
      />

      <div className="p-6 space-y-5">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Total Liquidado"
            value={`${fmt(totalPaid)} Kz`}
            sub={`${invoices.filter(i => i.status === 'paid').length} faturas pagas`}
            subColor="green"
            icon={<CreditCard className="w-4 h-4" />}
            iconBg="bg-emerald-50 text-emerald-600"
          />
          <StatCard
            label="Faturas Pendentes"
            value={`${fmt(totalPending)} Kz`}
            sub="Aguardam liquidação"
            subColor="amber"
            icon={<Clock className="w-4 h-4" />}
            iconBg="bg-amber-50 text-amber-600"
          />
          <StatCard
            label="Faturas Vencidas"
            value={`${fmt(totalOverdue)} Kz`}
            sub="Cobrança prioritária"
            subColor="red"
            icon={<AlertCircle className="w-4 h-4" />}
            iconBg="bg-red-50 text-red-600"
          />
        </div>

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
              {filteredInvoices.map((inv) => (
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
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors"
                          title="Confirmar Pagamento"
                        >
                          <Check className="w-3 h-3" />
                          <span>Marcar Paga</span>
                        </button>
                      )}
                      <button
                        onClick={() => alert(`A transferir cópia da fatura ${inv.invoice_number}...`)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Descarregar PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Emitir Nova Fatura */}
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
