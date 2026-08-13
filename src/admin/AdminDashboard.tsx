import React from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { Building2, Key, Handshake, DollarSign, AlertTriangle, HeadphonesIcon, TrendingUp } from 'lucide-react';
import { StatCard } from './AdminComponents';
import { MOCK_ATIVIDADE, CHART_RECEITA, CHART_EMPRESAS, CHART_LICENCAS, CHART_PLANOS } from './mockData';

const fmt = (n: number) => n.toLocaleString('pt-AO');

const ATIVIDADE_ICONS: Record<string, React.ReactNode> = {
  empresa: <Building2 className="w-4 h-4 text-blue-400" strokeWidth={1.75} />,
  licenca: <Key className="w-4 h-4 text-emerald-400" strokeWidth={1.75} />,
  parceiro: <Handshake className="w-4 h-4 text-violet-400" strokeWidth={1.75} />,
  pagamento: <DollarSign className="w-4 h-4 text-amber-400" strokeWidth={1.75} />,
  alerta: <AlertTriangle className="w-4 h-4 text-red-400" strokeWidth={1.75} />,
  ticket: <HeadphonesIcon className="w-4 h-4 text-orange-400" strokeWidth={1.75} />,
};

const CustomTooltipReceita = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 shadow-xl">
        <p className="text-slate-400 text-xs mb-1">{label}</p>
        <p className="text-white font-black text-sm">{fmt(payload[0].value)} Kz</p>
      </div>
    );
  }
  return null;
};

export const AdminDashboard: React.FC = () => {
  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-6">

      {/* Stats Row 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          label="Empresas"
          value="1.284"
          sub="+12 este mês"
          subColor="green"
          icon={<Building2 className="w-4 h-4" strokeWidth={1.75} />}
          iconBg="bg-blue-50 text-blue-600"
        />
        <StatCard
          label="Licenças Activas"
          value="934"
          sub="1.067 total"
          subColor="default"
          icon={<Key className="w-4 h-4" strokeWidth={1.75} />}
          iconBg="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          label="Parceiros"
          value="84"
          sub="+7 este mês"
          subColor="green"
          icon={<Handshake className="w-4 h-4" strokeWidth={1.75} />}
          iconBg="bg-violet-50 text-violet-600"
        />
        <StatCard
          label="Receita"
          value="24,58M Kz"
          sub="+18,4% vs Jul"
          subColor="green"
          icon={<TrendingUp className="w-4 h-4" strokeWidth={1.75} />}
          iconBg="bg-amber-50 text-amber-600"
        />
        <StatCard
          label="Expiram em 30d"
          value="37"
          sub="Requer atenção"
          subColor="amber"
          icon={<AlertTriangle className="w-4 h-4" strokeWidth={1.75} />}
          iconBg="bg-orange-50 text-orange-600"
        />
        <StatCard
          label="Tickets Abertos"
          value="12"
          sub="4 urgentes"
          subColor="red"
          icon={<HeadphonesIcon className="w-4 h-4" strokeWidth={1.75} />}
          iconBg="bg-red-50 text-red-600"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Receita Mensal */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-black text-slate-950">Receita Mensal</h3>
              <p className="text-xs text-slate-400">Últimos 6 meses (Kz)</p>
            </div>
            <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-full">
              <TrendingUp className="w-3 h-3" strokeWidth={2} /> +18,4%
            </span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={CHART_RECEITA} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="gradReceita" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
              <Tooltip content={<CustomTooltipReceita />} />
              <Area type="monotone" dataKey="valor" stroke="#2563eb" strokeWidth={2.5} fill="url(#gradReceita)" dot={{ fill: '#2563eb', r: 3, strokeWidth: 0 }} activeDot={{ r: 5, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Planos */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-sm font-black text-slate-950 mb-1">Licenças por Plano</h3>
          <p className="text-xs text-slate-400 mb-4">Distribuição actual</p>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie data={CHART_PLANOS} dataKey="value" cx="50%" cy="50%" outerRadius={60} innerRadius={35} paddingAngle={3}>
                {CHART_PLANOS.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v: any) => [`${v}`, 'Licenças']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {CHART_PLANOS.map((p) => (
              <div key={p.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
                  <span className="text-slate-600 font-medium">{p.name}</span>
                </div>
                <span className="font-bold text-slate-900">{p.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Novas Empresas */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-sm font-black text-slate-950 mb-1">Novas Empresas</h3>
          <p className="text-xs text-slate-400 mb-5">Registos por mês</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={CHART_EMPRESAS} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="valor" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Licenças Novas vs Expiradas */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-sm font-black text-slate-950 mb-1">Licenças — Novas vs Expiradas</h3>
          <p className="text-xs text-slate-400 mb-5">Por mês</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={CHART_LICENCAS} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="novas" fill="#10b981" name="Novas" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expiradas" fill="#f87171" name="Expiradas" radius={[4, 4, 0, 0]} />
              <Legend iconType="circle" iconSize={8} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Actividade Recente */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-sm font-black text-slate-950 mb-4">Actividade Recente</h3>
        <div className="divide-y divide-slate-100">
          {MOCK_ATIVIDADE.map((item) => (
            <div key={item.id} className="flex items-start gap-3 py-3">
              <div className="w-8 h-8 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 border border-slate-100">
                {ATIVIDADE_ICONS[item.tipo]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-900">{item.descricao}</p>
                <p className="text-xs text-slate-500 truncate">{item.detalhe}</p>
              </div>
              <span className="text-[10px] text-slate-400 shrink-0">{item.tempo}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
