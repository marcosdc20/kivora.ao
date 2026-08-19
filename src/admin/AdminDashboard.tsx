import React, { useMemo, useState, useEffect } from 'react';
import {
  TrendingUp, Shield, CheckCircle2, AlertCircle,
  Ban, RotateCcw, Key, Users, Wallet, TrendingDown,
  UserCheck, ArrowRight, PhoneCall
} from 'lucide-react';
import { useLicenses } from './hooks/useFirebase';
import { FirebaseAuthModal } from './components/FirebaseAuthModal';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { getPlanLabel, formatLicenseDate } from './services/licenseService';
import { subscribeAllDebts, PartnerDebtEntry } from './services/partnerDebtService';
import { AdminTopbar } from './AdminComponents';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { AdminSection } from './types';

const fmt = (n: number) => n.toLocaleString('pt-AO');

interface AdminDashboardProps {
  onNavigate?: (section: AdminSection) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { licenses, loading, error, refresh } = useLicenses();
  const [modalAuth, setModalAuth] = useState(false);
  const [partnerDebts, setPartnerDebts] = useState<PartnerDebtEntry[]>([]);
  const [pendingCandidaturasCount, setPendingCandidaturasCount] = useState<number>(0);
  const [pendingDemoLeadsCount, setPendingDemoLeadsCount] = useState<number>(0);

  useEffect(() => {
    const unsub = subscribeAllDebts(setPartnerDebts);
    return () => unsub();
  }, []);

  // Escuta de candidaturas de parceiros pendentes
  useEffect(() => {
    try {
      const q = query(collection(db, 'partner_applications'), where('status', '==', 'pending'));
      const unsub = onSnapshot(q, (snap) => {
        setPendingCandidaturasCount(snap.size);
      }, (err) => {
        console.warn('Erro ao escutar candidaturas:', err);
      });
      return () => unsub();
    } catch {
      // ignore
    }
  }, []);

  // Escuta de leads de demonstração pendentes
  useEffect(() => {
    try {
      const q = query(collection(db, 'leads_demonstracao'), where('status', '==', 'pendente'));
      const unsub = onSnapshot(q, (snap) => {
        setPendingDemoLeadsCount(snap.size);
      }, (err) => {
        console.warn('Erro ao escutar leads_demonstracao:', err);
      });
      return () => unsub();
    } catch {
      // ignore
    }
  }, []);

  const totalPartnerDebtPending = partnerDebts.filter(d => !d.paid).reduce((acc, d) => acc + d.cost_aoa, 0);
  const totalPartnerDebtPaid = partnerDebts.filter(d => d.paid).reduce((acc, d) => acc + d.cost_aoa, 0);

  const activeLicenses = licenses.filter(l => l.status === 'active' && (!l.expires_at || l.expires_at >= Date.now()));
  const expiredLicenses = licenses.filter(l => l.status === 'expired' || (l.expires_at && l.expires_at < Date.now()));
  const revokedLicenses = licenses.filter(l => l.status === 'revoked');
  const revenueAoa = activeLicenses.reduce((acc, l) => acc + (l.price_aoa || 0), 0);

  const monthlyPlanCount = licenses.filter(l => l.plan_type === 'monthly').length;
  const annualPlanCount = licenses.filter(l => l.plan_type === 'annual').length;
  const lifetimePlanCount = licenses.filter(l => l.plan_type === 'lifetime').length;

  const recentLicenses = [...licenses].sort((a, b) => b.created_at - a.created_at).slice(0, 5);

  // Histórico de 6 meses gerado dinamicamente com base nas datas de criação das licenças
  const chartData = useMemo(() => {
    const data = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const targetMonth = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = targetMonth.toLocaleDateString('pt-AO', { month: 'short', year: '2-digit' });

      const createdInMonth = licenses.filter(l => {
        const d = new Date(l.created_at);
        return d.getMonth() === targetMonth.getMonth() && d.getFullYear() === targetMonth.getFullYear();
      }).length;

      const activeInMonth = activeLicenses.filter(l => {
        const d = new Date(l.created_at);
        return d <= targetMonth || (d.getMonth() === targetMonth.getMonth() && d.getFullYear() === targetMonth.getFullYear());
      }).length;

      data.push({
        name: monthLabel,
        Criadas: createdInMonth,
        Ativas: activeInMonth
      });
    }
    return data;
  }, [licenses, activeLicenses]);

  const pieData = [
    { name: 'Mensal', value: monthlyPlanCount },
    { name: 'Anual', value: annualPlanCount },
    { name: 'Vitalício', value: lifetimePlanCount }
  ].filter(d => d.value > 0);

  const COLORS = ['#3b82f6', '#8b5cf6', '#10b981'];

  if (loading && licenses.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-24 text-slate-500 bg-slate-50">
        <div className="w-8 h-8 rounded-full border-[2.5px] border-slate-200 border-t-amber-500 border-r-amber-500 animate-spin mb-3" />
        <p className="font-semibold text-xs text-slate-500">A carregar dados do painel...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 flex flex-col w-full min-w-0 font-sans">
      <AdminTopbar
        title="Painel de Gestão & Controlo"
        subtitle="Métricas em tempo real de licenças, clientes, parceiros e faturamento"
        actions={
          <button
            onClick={() => refresh()}
            disabled={loading}
            className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            <span>Atualizar Dados</span>
          </button>
        }
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 flex flex-col min-w-0">

      {error && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div>
            <p className="font-bold flex items-center gap-1.5 text-amber-900">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              Aviso de Sincronização com o Firestore:
            </p>
            <p className="text-[11px] text-amber-800 mt-1">{error}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setModalAuth(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-sm transition-all"
            >
              🔐 Iniciar Sessão Firebase
            </button>
            <button
              onClick={() => refresh()}
              className="bg-white hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold text-xs px-3 py-2 rounded-xl"
            >
              Recarregar
            </button>
          </div>
        </div>
      )}

      {/* Top Metrics Row — Valores Reais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-black text-slate-900">{fmt(revenueAoa)} Kz</div>
              <div className="text-[11px] font-bold text-slate-400">Faturação Ativa</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-black text-slate-900">{licenses.length}</div>
              <div className="text-[11px] font-bold text-slate-400">Total de Licenças</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-black text-emerald-600">{activeLicenses.length}</div>
              <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                Ativas Online
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-black text-amber-600">{expiredLicenses.length}</div>
              <div className="text-[11px] font-bold text-slate-400">Expiradas</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <Ban className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-black text-red-600">{revokedLicenses.length}</div>
              <div className="text-[11px] font-bold text-slate-400">Revogadas</div>
            </div>
          </div>
        </div>
      </div>

      {/* Plan Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-sm">
            M
          </div>
          <div>
            <div className="text-base font-black text-slate-900">{monthlyPlanCount} Licenças</div>
            <div className="text-[11px] font-bold text-slate-400">Plano Mensal (30 Dias)</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-black text-sm">
            A
          </div>
          <div>
            <div className="text-base font-black text-slate-900">{annualPlanCount} Licenças</div>
            <div className="text-[11px] font-bold text-slate-400">Plano Anual (365 Dias)</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-sm">
            ∞
          </div>
          <div>
            <div className="text-base font-black text-slate-900">{lifetimePlanCount} Licenças</div>
            <div className="text-[11px] font-bold text-slate-400">Plano Vitalício</div>
          </div>
        </div>
      </div>

      {/* Partner Network & Debt Metrics */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 p-5 rounded-3xl text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-blue-500/20 border border-blue-400/30 text-blue-400 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-blue-400">Rede de Parceiros & Revenda</div>
            <div className="text-sm text-slate-300 mt-0.5">
              <strong className="text-white font-bold">{partnerDebts.length}</strong> licenças emitidas por parceiros no portal
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 sm:gap-8 border-t sm:border-t-0 sm:border-l border-slate-800 pt-3 sm:pt-0 sm:pl-8 w-full sm:w-auto justify-between sm:justify-end">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Dívidas de Parceiros a Receber</span>
            <span className="text-base font-black font-mono text-amber-400 flex items-center gap-1">
              <TrendingDown className="w-4 h-4 text-amber-400" />
              {fmt(totalPartnerDebtPending)} Kz
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Recebido de Parceiros</span>
            <span className="text-base font-black font-mono text-emerald-400 flex items-center gap-1">
              <Wallet className="w-4 h-4 text-emerald-400" />
              {fmt(totalPartnerDebtPaid)} Kz
            </span>
          </div>
        </div>
      </div>

      {/* Action Center — Pendências de Candidaturas & Leads de Demonstração */}
      {(pendingCandidaturasCount > 0 || pendingDemoLeadsCount > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {pendingCandidaturasCount > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-amber-950">
                    {pendingCandidaturasCount} {pendingCandidaturasCount === 1 ? 'Candidatura de Parceiro' : 'Candidaturas de Parceiros'}
                  </h4>
                  <p className="text-[11px] text-amber-800">Aguardam homologação e atribuição de quotas</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate?.('parceiros-candidaturas')}
                className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shrink-0 cursor-pointer shadow-xs"
              >
                <span>Homologar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {pendingDemoLeadsCount > 0 && (
            <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-blue-950">
                    {pendingDemoLeadsCount} {pendingDemoLeadsCount === 1 ? 'Pedido de Demonstração' : 'Pedidos de Demonstração'}
                  </h4>
                  <p className="text-[11px] text-blue-800">Clientes aguardam agendamento pelo suporte comercial</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate?.('suporte')}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shrink-0 cursor-pointer shadow-xs"
              >
                <span>Ver Contactos</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-black text-slate-900">Licenças Criadas — Últimos 6 Meses</h3>
              <p className="text-xs text-slate-400">Criadas vs. Ativas por mês</p>
            </div>
          </div>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="Criadas" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Ativas" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <div className="mb-2">
            <h3 className="text-sm font-black text-slate-900">Distribuição por Plano</h3>
            <p className="text-xs text-slate-400">Proporção atual de clientes</p>
          </div>
          <div className="flex items-center justify-center" style={{ height: 260 }}>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-400 text-xs">Sem dados suficientes</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Licenses Table — Dados Reais do Firestore */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900">Últimas Licenças Emitidas</h3>
            <p className="text-xs text-slate-400">Registadas em tempo real na base de dados Firebase</p>
          </div>
        </div>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-xs text-left min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-slate-400 uppercase font-black text-[10px] tracking-wider">
                <th className="p-4">Chave KVRA</th>
                <th className="p-4">Empresa / Email</th>
                <th className="p-4">Plano</th>
                <th className="p-4">Estado</th>
                <th className="p-4">Data Emissão</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentLicenses.map((lic) => (
                <tr key={lic.id} className="hover:bg-slate-50">
                  <td className="p-4">
                    <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100">
                      {lic.id}
                    </span>
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-slate-900">{lic.company_name}</p>
                    <p className="text-slate-400 text-[10px]">{lic.client_email}</p>
                  </td>
                  <td className="p-4 font-semibold text-slate-700">{getPlanLabel(lic.plan_type)}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      lic.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      lic.status === 'expired' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {lic.status === 'active' ? 'Ativa' : lic.status === 'expired' ? 'Expirada' : 'Revogada'}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500 font-medium">{formatLicenseDate(lic.created_at)}</td>
                </tr>
              ))}
              {recentLicenses.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-500 font-medium">
                    <Key className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    Nenhuma licença registada no Firebase.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      </div>

      <FirebaseAuthModal
        isOpen={modalAuth}
        onClose={() => setModalAuth(false)}
        onSuccess={() => {
          refresh();
        }}
      />
    </div>
  );
};
