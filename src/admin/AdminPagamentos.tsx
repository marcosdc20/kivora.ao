import React, { useState } from 'react';
import { Check, X, Eye, DollarSign, Clock, AlertTriangle } from 'lucide-react';
import { AdminTopbar, StatusBadge, StatCard } from './AdminComponents';
import { MOCK_PAGAMENTOS } from './mockData';
import { Pagamento } from './types';

const fmt = (n: number) => n.toLocaleString('pt-AO');

export const AdminPagamentos: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState('todos');
  const [selected, setSelected] = useState<Pagamento | null>(null);

  const filtered = MOCK_PAGAMENTOS.filter(p =>
    filterStatus === 'todos' || p.status === filterStatus
  );

  const totalConfirmado = MOCK_PAGAMENTOS.filter(p => p.status === 'confirmado').reduce((a, b) => a + b.valor, 0);
  const totalPendente = MOCK_PAGAMENTOS.filter(p => p.status === 'pendente').reduce((a, b) => a + b.valor, 0);

  const TYPE_LABELS: Record<string, string> = {
    licenca: 'Licença',
    renovacao: 'Renovação',
    upgrade: 'Upgrade',
    reembolso: 'Reembolso',
  };

  const METHOD_LABELS: Record<string, string> = {
    transferencia: 'Transferência',
    multicaixa: 'Multicaixa',
    dinheiro: 'Numerário',
    outro: 'Outro',
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <AdminTopbar
        title="Pagamentos"
        subtitle="Controlo de pagamentos de licenças e renovações"
      />

      <div className="p-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Confirmado" value={`${(totalConfirmado / 1000).toFixed(0)}K Kz`}
            icon={<DollarSign className="w-4 h-4" strokeWidth={1.75} />} iconBg="bg-emerald-50 text-emerald-600"
            sub="Este mês" subColor="green" />
          <StatCard label="Pendentes" value={`${(totalPendente / 1000).toFixed(0)}K Kz`}
            icon={<Clock className="w-4 h-4" strokeWidth={1.75} />} iconBg="bg-amber-50 text-amber-600"
            sub={`${MOCK_PAGAMENTOS.filter(p => p.status === 'pendente').length} pagamentos`} subColor="amber" />
          <StatCard label="Confirmados" value={MOCK_PAGAMENTOS.filter(p => p.status === 'confirmado').length.toString()}
            icon={<Check className="w-4 h-4" strokeWidth={1.75} />} iconBg="bg-blue-50 text-blue-600"
            sub="Pagamentos OK" subColor="green" />
          <StatCard label="Falhados" value={MOCK_PAGAMENTOS.filter(p => p.status === 'falhou').length.toString()}
            icon={<AlertTriangle className="w-4 h-4" strokeWidth={1.75} />} iconBg="bg-red-50 text-red-600"
            sub="A verificar" subColor="red" />
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'todos', label: 'Todos' },
            { key: 'pendente', label: 'Pendentes' },
            { key: 'confirmado', label: 'Confirmados' },
            { key: 'falhou', label: 'Falhados' },
            { key: 'reembolsado', label: 'Reembolsados' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilterStatus(f.key)}
              className={`text-xs font-bold px-4 py-2 rounded-xl border transition-all ${
                filterStatus === f.key
                  ? 'bg-slate-950 text-white border-slate-950'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-5 py-3.5 text-[11px] font-black uppercase tracking-wider text-slate-400">Empresa</th>
                <th className="text-left px-4 py-3.5 text-[11px] font-black uppercase tracking-wider text-slate-400 hidden md:table-cell">Tipo</th>
                <th className="text-left px-4 py-3.5 text-[11px] font-black uppercase tracking-wider text-slate-400">Valor</th>
                <th className="text-left px-4 py-3.5 text-[11px] font-black uppercase tracking-wider text-slate-400">Estado</th>
                <th className="text-left px-4 py-3.5 text-[11px] font-black uppercase tracking-wider text-slate-400 hidden lg:table-cell">Método</th>
                <th className="text-left px-4 py-3.5 text-[11px] font-black uppercase tracking-wider text-slate-400 hidden xl:table-cell">Referência</th>
                <th className="text-left px-4 py-3.5 text-[11px] font-black uppercase tracking-wider text-slate-400 hidden xl:table-cell">Data</th>
                <th className="text-right px-5 py-3.5 text-[11px] font-black uppercase tracking-wider text-slate-400">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((pg) => (
                <tr key={pg.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-5 py-3.5">
                    <p className="font-bold text-slate-900">{pg.empresaNome}</p>
                    {pg.parceiroNome && <p className="text-slate-400 text-[10px]">via {pg.parceiroNome}</p>}
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell text-slate-600 font-medium">{TYPE_LABELS[pg.tipo]}</td>
                  <td className="px-4 py-3.5 font-black text-slate-950">{fmt(pg.valor)} Kz</td>
                  <td className="px-4 py-3.5"><StatusBadge status={pg.status} type="pagamento" /></td>
                  <td className="px-4 py-3.5 hidden lg:table-cell text-slate-500">{METHOD_LABELS[pg.metodo]}</td>
                  <td className="px-4 py-3.5 hidden xl:table-cell font-mono text-slate-400 text-[10px]">{pg.referencia}</td>
                  <td className="px-4 py-3.5 hidden xl:table-cell text-slate-500">{pg.data}</td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {pg.status === 'pendente' && (
                        <>
                          <button
                            onClick={() => setSelected(pg)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Confirmar"
                          >
                            <Check className="w-3.5 h-3.5" strokeWidth={2} />
                          </button>
                          <button className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Rejeitar">
                            <X className="w-3.5 h-3.5" strokeWidth={2} />
                          </button>
                        </>
                      )}
                      <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Ver detalhes">
                        <Eye className="w-3.5 h-3.5" strokeWidth={2} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 space-y-5" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-black text-slate-950">Confirmar Pagamento</h2>
            <div className="bg-slate-50 rounded-2xl p-5 space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-slate-500">Empresa</span><span className="font-bold text-slate-900">{selected.empresaNome}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Valor</span><span className="font-black text-slate-950 text-sm">{fmt(selected.valor)} Kz</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Referência</span><span className="font-mono text-slate-600">{selected.referencia}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Método</span><span className="font-semibold text-slate-700">{selected.metodo}</span></div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setSelected(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-2xl transition-all text-sm">Cancelar</button>
              <button onClick={() => setSelected(null)} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-2xl transition-all text-sm flex items-center justify-center gap-2">
                <Check className="w-4 h-4" strokeWidth={2} />
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
