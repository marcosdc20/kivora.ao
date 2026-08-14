import React, { useState } from 'react';
import {
  ShieldAlert, Search, Download, CheckCircle2,
  Terminal
} from 'lucide-react';
import { AdminTopbar, StatCard } from './AdminComponents';

export interface AuditLogEntry {
  id: string;
  action: string;
  category: 'security' | 'license' | 'company' | 'system';
  target: string;
  actor_email: string;
  ip_address: string;
  timestamp: number;
  details: string;
}

const INITIAL_LOGS: AuditLogEntry[] = [
  {
    id: '1',
    action: 'Emissão de Licença Vitalícia',
    category: 'license',
    target: 'Supermercados Atlântico S.A. (NIF: 5409876543)',
    actor_email: 'admin@kivora.ao',
    ip_address: '102.214.12.89 (Luanda)',
    timestamp: Date.now() - 3600000 * 1,
    details: 'Chave gerada com 10 postos extras de PDV associados. Assinatura criptográfica RSA ativada.'
  },
  {
    id: '2',
    action: 'Tentativa de Login Bloqueada (MFA Inválido)',
    category: 'security',
    target: 'Sistema Central Kivora Admin',
    actor_email: 'desconhecido@proxy.net',
    ip_address: '185.220.101.44 (Tor Network)',
    timestamp: Date.now() - 3600000 * 3,
    details: 'Bloqueio automático de IP por 24 horas após 5 tentativas de autenticação sem token 2FA.'
  },
  {
    id: '3',
    action: 'Aprovisionamento de Novo Tenant',
    category: 'company',
    target: 'Farmácia Central de Benguela (NIF: 5123459876)',
    actor_email: 'marcos@kivora.ao',
    ip_address: '102.214.12.89 (Luanda)',
    timestamp: Date.now() - 3600000 * 18,
    details: 'Empresa registada com sucesso no Firestore. Coleções iniciais de faturação criadas.'
  },
  {
    id: '4',
    action: 'Exportação Completa de Backup JSON',
    category: 'system',
    target: 'Base de Dados Firestore (Licenses, Companies, Trials)',
    actor_email: 'admin@kivora.ao',
    ip_address: '102.214.12.89 (Luanda)',
    timestamp: Date.now() - 3600000 * 26,
    details: 'Cópia de segurança manual gerada e descarregada pelo administrador.'
  },
  {
    id: '5',
    action: 'Suspensão de Licença por Atraso',
    category: 'license',
    target: 'Hotel Baía & Turismo, Lda. (Chave KVRA-9988)',
    actor_email: 'billing@kivora.ao',
    ip_address: '102.214.15.22 (Benguela)',
    timestamp: Date.now() - 3600000 * 48,
    details: 'Licença suspensa automaticamente após 15 dias do vencimento da fatura FT-2026/0086.'
  },
  {
    id: '6',
    action: 'Publicação de Atualização OTA v1.1.0',
    category: 'system',
    target: 'Canal Stable / Produção',
    actor_email: 'dev@kivora.ao',
    ip_address: '102.214.12.89 (Luanda)',
    timestamp: Date.now() - 3600000 * 72,
    details: 'Instalador NSIS com encerramento de processo ativado. Push notificado para 48 terminais.'
  }
];

export const AdminAuditoria: React.FC = () => {
  const [logs] = useState<AuditLogEntry[]>(INITIAL_LOGS);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'security' | 'license' | 'company' | 'system'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = logs.filter(l => {
    const matchesCat = categoryFilter === 'all' || l.category === categoryFilter;
    const s = searchQuery.toLowerCase();
    const matchesSearch = l.action.toLowerCase().includes(s) ||
      l.target.toLowerCase().includes(s) ||
      l.actor_email.toLowerCase().includes(s) ||
      l.ip_address.toLowerCase().includes(s);
    return matchesCat && matchesSearch;
  });

  const handleExportLogs = () => {
    const jsonStr = JSON.stringify(logs, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kivora_audit_logs_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <AdminTopbar
        title="Trilha de Auditoria & Segurança"
        subtitle="Registo imutável de emissão de licenças, acessos, bloqueios de segurança e eventos"
        actions={
          <button
            onClick={handleExportLogs}
            className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Relatório JSON</span>
          </button>
        }
      />

      <div className="p-6 space-y-5">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Total Registos de Auditoria"
            value="1.842"
            icon={<Terminal className="w-4 h-4" />}
            iconBg="bg-blue-50 text-blue-600"
            sub="Últimos 30 dias"
          />
          <StatCard
            label="Bloqueios de Segurança (IP)"
            value="1 Bloqueio"
            icon={<ShieldAlert className="w-4 h-4" />}
            iconBg="bg-red-50 text-red-600"
            sub="Tentativa de ataque Tor"
            subColor="red"
          />
          <StatCard
            label="Assinatura Criptográfica"
            value="100% Válida"
            icon={<CheckCircle2 className="w-4 h-4" />}
            iconBg="bg-emerald-50 text-emerald-600"
            sub="Registo auditável AGT"
            subColor="green"
          />
        </div>

        {/* Filtros e Busca */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex gap-2">
            {[
              { id: 'all', label: 'Todos os Logs' },
              { id: 'license', label: 'Licenciamento' },
              { id: 'security', label: 'Segurança / 2FA' },
              { id: 'company', label: 'Empresas' },
              { id: 'system', label: 'Sistema / Backups' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setCategoryFilter(f.id as any)}
                className={`text-xs font-bold px-4 py-2 rounded-xl border transition-all ${
                  categoryFilter === f.id
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
              placeholder="Pesquisar por ação, IP, utilizador..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
            />
          </div>
        </div>

        {/* Tabela de Logs */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-slate-400 uppercase font-black text-[10px] tracking-wider">
                <th className="p-4">Evento / Ação</th>
                <th className="p-4">Alvo / Recurso</th>
                <th className="p-4">Operador</th>
                <th className="p-4">Endereço IP</th>
                <th className="p-4">Data & Hora</th>
                <th className="p-4">Categoria</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-slate-900">{l.action}</p>
                    <p className="text-slate-400 text-[10px] mt-0.5">{l.details}</p>
                  </td>
                  <td className="p-4 font-medium text-slate-700">{l.target}</td>
                  <td className="p-4 font-mono font-bold text-blue-600">{l.actor_email}</td>
                  <td className="p-4 font-mono text-slate-600 text-[11px]">{l.ip_address}</td>
                  <td className="p-4 text-slate-500 font-medium whitespace-nowrap">
                    {new Date(l.timestamp).toLocaleString('pt-AO')}
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      l.category === 'security' ? 'bg-red-50 text-red-700 border border-red-200' :
                      l.category === 'license' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      l.category === 'company' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                      'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {l.category}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
