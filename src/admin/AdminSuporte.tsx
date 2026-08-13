import React from 'react';
import { Headphones, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { AdminTopbar, StatusBadge, StatCard } from './AdminComponents';
import { MOCK_TICKETS } from './mockData';

const PRIORITY_COLORS: Record<string, string> = {
  baixa: 'bg-slate-100 text-slate-500',
  media: 'bg-blue-50 text-blue-600',
  alta: 'bg-orange-50 text-orange-600',
  urgente: 'bg-red-50 text-red-700 font-black',
};

export const AdminSuporte: React.FC = () => {
  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <AdminTopbar title="Suporte" subtitle="Gestão de tickets e base de conhecimento" />

      <div className="p-6 space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Abertos" value="12" icon={<Headphones className="w-4 h-4" strokeWidth={1.75} />} iconBg="bg-blue-50 text-blue-600" sub="Tickets activos" />
          <StatCard label="Urgentes" value="4" icon={<AlertTriangle className="w-4 h-4" strokeWidth={1.75} />} iconBg="bg-red-50 text-red-600" sub="Prioridade máxima" subColor="red" />
          <StatCard label="Em Atendimento" value="6" icon={<Clock className="w-4 h-4" strokeWidth={1.75} />} iconBg="bg-amber-50 text-amber-600" sub="A ser tratados" subColor="amber" />
          <StatCard label="Resolvidos" value="147" icon={<CheckCircle className="w-4 h-4" strokeWidth={1.75} />} iconBg="bg-emerald-50 text-emerald-600" sub="Este mês" subColor="green" />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-5 py-3.5 text-[11px] font-black uppercase tracking-wider text-slate-400">Título</th>
                <th className="text-left px-4 py-3.5 text-[11px] font-black uppercase tracking-wider text-slate-400 hidden md:table-cell">Empresa</th>
                <th className="text-left px-4 py-3.5 text-[11px] font-black uppercase tracking-wider text-slate-400 hidden lg:table-cell">Categoria</th>
                <th className="text-left px-4 py-3.5 text-[11px] font-black uppercase tracking-wider text-slate-400">Prioridade</th>
                <th className="text-left px-4 py-3.5 text-[11px] font-black uppercase tracking-wider text-slate-400">Estado</th>
                <th className="text-left px-4 py-3.5 text-[11px] font-black uppercase tracking-wider text-slate-400 hidden xl:table-cell">Agente</th>
                <th className="text-left px-4 py-3.5 text-[11px] font-black uppercase tracking-wider text-slate-400 hidden xl:table-cell">Última Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_TICKETS.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors group cursor-pointer">
                  <td className="px-5 py-3.5">
                    <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{t.titulo}</p>
                    <p className="text-slate-400 text-[10px]">#{t.id.toUpperCase()}</p>
                  </td>
                  <td className="px-4 py-3.5 text-slate-600 font-medium hidden md:table-cell">{t.empresaNome}</td>
                  <td className="px-4 py-3.5 text-slate-500 hidden lg:table-cell">{t.categoria}</td>
                  <td className="px-4 py-3.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${PRIORITY_COLORS[t.prioridade]}`}>
                      {t.prioridade}
                    </span>
                  </td>
                  <td className="px-4 py-3.5"><StatusBadge status={t.status} /></td>
                  <td className="px-4 py-3.5 text-slate-500 hidden xl:table-cell">{t.agente || '—'}</td>
                  <td className="px-4 py-3.5 text-slate-400 hidden xl:table-cell">{t.ultimaAtualizacao}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export { AdminRelatorios } from './AdminRelatorios';
export { AdminComunicacao } from './AdminComunicacao';
export { AdminUtilizadores } from './AdminUtilizadores';
export { AdminAuditoria } from './AdminAuditoria';
export { AdminPlanos } from './AdminPlanos';
export { AdminConfiguracoes } from './AdminConfiguracoes';
