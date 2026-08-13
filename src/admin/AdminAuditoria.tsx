import React, { useState } from 'react';
import { AlertOctagon, CheckCircle2, Search, Filter, Terminal, Lock } from 'lucide-react';
import { AdminTopbar, StatCard } from './AdminComponents';
import { MOCK_AUDIT_LOGS } from './mockData';
import { AuditLog } from './types';

const LOG_LEVEL_BADGES: Record<string, { label: string; color: string }> = {
  info: { label: 'INFO', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  aviso: { label: 'AVISO', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  critico: { label: 'CRÍTICO', color: 'bg-red-50 text-red-700 border-red-200 font-black' },
};

export const AdminAuditoria: React.FC = () => {
  const [logs] = useState<AuditLog[]>(MOCK_AUDIT_LOGS);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('todos');

  const filteredLogs = logs.filter((l) => {
    const matchesSearch =
      l.utilizador.toLowerCase().includes(search.toLowerCase()) ||
      l.acao.toLowerCase().includes(search.toLowerCase()) ||
      l.recurso.toLowerCase().includes(search.toLowerCase()) ||
      l.ip.includes(search);

    const matchesLevel = levelFilter === 'todos' || l.nivel === levelFilter;

    return matchesSearch && matchesLevel;
  });

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <AdminTopbar
        title="Trilha de Auditoria & Segurança"
        subtitle="Registo de atividades, logs de acessos, alterações de permissões e segurança"
      />

      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Total Registos de Auditoria"
            value="1.842"
            icon={<Terminal className="w-4 h-4" strokeWidth={2} />}
            iconBg="bg-blue-50 text-blue-600"
            sub="Últimos 30 dias"
          />
          <StatCard
            label="Tentativas de Acesso Suspeitas"
            value="1"
            icon={<AlertOctagon className="w-4 h-4" strokeWidth={2} />}
            iconBg="bg-red-50 text-red-600"
            sub="Bloqueadas pela Firewall"
            subColor="red"
          />
          <StatCard
            label="Integridade do Log"
            value="100% Válido"
            icon={<CheckCircle2 className="w-4 h-4" strokeWidth={2} />}
            iconBg="bg-emerald-50 text-emerald-600"
            sub="Assinatura Criptográfica"
            subColor="green"
          />
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar por utilizador, ação, IP..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold px-3 py-2 rounded-xl focus:outline-none focus:border-blue-500"
            >
              <option value="todos">Todos os Níveis</option>
              <option value="info">INFO (Operação Normal)</option>
              <option value="aviso">AVISO (Alterações Sensíveis)</option>
              <option value="critico">CRÍTICO (Segurança / Falhas)</option>
            </select>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-600" />
                Registos Imutáveis do Sistema Kivora
              </h3>
              <p className="text-slate-500 text-xs mt-0.5">Histórico chronológico de auditoria com IP e Timestamp</p>
            </div>
          </div>

          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-slate-400 font-black uppercase text-[10px] tracking-wider text-left font-sans">
                <th className="px-5 py-3.5">Data & Hora</th>
                <th className="px-4 py-3.5">Utilizador</th>
                <th className="px-4 py-3.5">Ação Realizada</th>
                <th className="px-4 py-3.5">Recurso / Alvo</th>
                <th className="px-4 py-3.5">Endereço IP</th>
                <th className="px-4 py-3.5 text-right">Severidade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((l) => {
                const badge = LOG_LEVEL_BADGES[l.nivel];
                return (
                  <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5 text-slate-500 font-bold">{l.data}</td>
                    <td className="px-4 py-3.5 font-bold text-slate-900 font-sans">{l.utilizador}</td>
                    <td className="px-4 py-3.5 text-blue-700 font-bold font-sans">{l.acao}</td>
                    <td className="px-4 py-3.5 text-slate-600 font-sans">{l.recurso}</td>
                    <td className="px-4 py-3.5 text-slate-400">{l.ip}</td>
                    <td className="px-4 py-3.5 text-right font-sans">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.color}`}>
                        {badge.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
