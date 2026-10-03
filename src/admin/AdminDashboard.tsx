import React, { useMemo, useState, useEffect } from 'react';
import {
  TrendingUp, Shield, AlertCircle,
  RotateCcw, Key, Users,
  UserCheck, ArrowRight, PhoneCall, Lock
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
    let unsubApps: (() => void) | null = null;

    try {
      unsubApps = onSnapshot(collection(db, 'partner_applications'), (snap) => {
        let count = 0;
        snap.forEach((d) => {
          const data = d.data();
          const st = String(data.status || '').toLowerCase().trim();
          if (['pending', 'pendente', 'em_analise'].includes(st)) {
            count++;
          }
        });
        setPendingCandidaturasCount(count);
      }, (err) => {
        console.warn('Erro ao escutar candidaturas:', err);
      });
    } catch {
      // ignore
    }

    return () => {
      if (unsubApps) unsubApps();
    };
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
    <div className="w-full min-w-0 flex flex-col font-sans p-4 sm:p-6 lg:p-8 space-y-6 pb-12">
      {/* Cabeçalho da Secção — Limpo, único e sem sobreposição */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Visão Geral</h1>
          <p className="text-xs text-slate-500 mt-0.5">Indicadores em tempo real de licenças, faturação e parceiros.</p>
        </div>
        <button
          onClick={() => refresh()}
          disabled={loading}
          className="self-start sm:self-auto bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-3.5 py-2 rounded-lg flex items-center gap-2 cursor-pointer transition-colors shadow-xs"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          <span>Atualizar Dados</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div>
            <p className="font-semibold text-amber-900">
              Aviso de Sincronização com o Firestore:
            </p>
            <p className="text-[11px] text-amber-800 mt-0.5">{error}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setModalAuth(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-3.5 py-2 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Autenticar Firebase</span>
            </button>
            <button
              onClick={() => refresh()}
              className="bg-white hover:bg-amber-100 border border-amber-300 text-amber-900 font-semibold text-xs px-3 py-2 rounded-lg transition-colors"
            >
              Recarregar
            </button>
          </div>
        </div>
      )}

      {/* 4 Cards de Métricas Principais — Simples, Limpos e Organizados */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Faturação Ativa */}
        <div className="p-5 rounded-xl border border-slate-200 bg-white flex flex-col justify-between space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Faturação Ativa</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 font-mono-num tracking-tight truncate">
              {fmt(revenueAoa)} Kz
            </div>
            <span className="text-xs text-slate-400 mt-1 block">Total em licenças ativas</span>
          </div>
        </div>

        {/* Licenças */}
        <div className="p-5 rounded-xl border border-slate-200 bg-white flex flex-col justify-between space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Licenças</span>
            <Shield className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 font-mono-num tracking-tight">
              {activeLicenses.length} <span className="text-sm font-normal text-slate-400">/ {licenses.length}</span>
            </div>
            <span className="text-xs text-slate-400 mt-1 block">
              {activeLicenses.length} ativas • {expiredLicenses.length + revokedLicenses.length} inativas
            </span>
          </div>
        </div>

        {/* Rede de Parceiros */}
        <div className="p-5 rounded-xl border border-slate-200 bg-white flex flex-col justify-between space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Rede de Parceiros</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 font-mono-num tracking-tight">
              {partnerDebts.length} <span className="text-sm font-normal text-slate-400">licenças</span>
            </div>
            <span className="text-xs text-slate-400 mt-1 block">
              {totalPartnerDebtPending > 0 ? (
                <span className="text-amber-600 font-medium">{fmt(totalPartnerDebtPending)} Kz a receber</span>
              ) : (
                <span className="text-emerald-600 font-medium">{fmt(totalPartnerDebtPaid)} Kz recebidos</span>
              )}
            </span>
          </div>
        </div>

        {/* Pendências de Ação */}
        <div className="p-5 rounded-xl border border-slate-200 bg-white flex flex-col justify-between space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Pendências de Ação</span>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 font-mono-num tracking-tight">
              {pendingCandidaturasCount + pendingDemoLeadsCount}
            </div>
            <span className="text-xs text-slate-400 mt-1 block">
              {pendingCandidaturasCount + pendingDemoLeadsCount === 0
                ? 'Nenhuma pendência'
                : `${pendingCandidaturasCount} parceiros • ${pendingDemoLeadsCount} demos`}
            </span>
          </div>
        </div>
      </div>

      {/* Ações Pendentes (apenas se houver itens aguardando aprovação) */}
      {(pendingCandidaturasCount > 0 || pendingDemoLeadsCount > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {pendingCandidaturasCount > 0 && (
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-amber-950 truncate">
                    {pendingCandidaturasCount} {pendingCandidaturasCount === 1 ? 'Candidatura de Parceiro' : 'Candidaturas de Parceiros'}
                  </h4>
                  <p className="text-[11px] text-amber-800/80 truncate">Aguardam aprovação e quotas</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate?.('parceiros-candidaturas')}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1 shrink-0 cursor-pointer transition-colors"
              >
                <span>Revisar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {pendingDemoLeadsCount > 0 && (
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/60 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-blue-950 truncate">
                    {pendingDemoLeadsCount} {pendingDemoLeadsCount === 1 ? 'Pedido de Demonstração' : 'Pedidos de Demonstração'}
                  </h4>
                  <p className="text-[11px] text-blue-800/80 truncate">Aguardam agendamento comercial</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate?.('suporte')}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1 shrink-0 cursor-pointer transition-colors"
              >
                <span>Ver Leads</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Linha de Gráficos — Minimalista e Sóbrio */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Licenças Criadas — Últimos 6 Meses</h3>
              <p className="text-xs text-slate-400">Criadas vs. Ativas por mês</p>
            </div>
          </div>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line type="monotone" dataKey="Criadas" stroke="#0F172A" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="Ativas" stroke="#2563EB" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="mb-2">
            <h3 className="text-sm font-semibold text-slate-900">Distribuição por Plano</h3>
            <p className="text-xs text-slate-400">Proporção atual de clientes</p>
          </div>
          <div className="flex items-center justify-center" style={{ height: 240 }}>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
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
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900 font-display">Últimas Licenças Emitidas</h3>
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
