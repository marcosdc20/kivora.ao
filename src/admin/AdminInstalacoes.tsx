import React, { useState } from 'react';
import { Monitor, Ban, Eye, ShieldOff, Search } from 'lucide-react';
import { AdminTopbar, StatusBadge } from './AdminComponents';
import { MOCK_INSTALACOES } from './mockData';

export const AdminInstalacoes: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = MOCK_INSTALACOES.filter(i =>
    i.nomePC.toLowerCase().includes(search.toLowerCase()) ||
    i.empresaNome.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <AdminTopbar
        title="Instalações & Equipamentos Ativos"
        subtitle={`${MOCK_INSTALACOES.length} computadores ativados no ecossistema Kivora`}
      />

      <div className="p-6 space-y-5">
        {/* Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar por nome do PC ou empresa..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Computadores Activos', value: MOCK_INSTALACOES.filter(i => i.status === 'ativo').length, color: 'text-emerald-600' },
            { label: 'Inactivos', value: MOCK_INSTALACOES.filter(i => i.status === 'inativo').length, color: 'text-slate-400' },
            { label: 'Bloqueados', value: MOCK_INSTALACOES.filter(i => i.status === 'bloqueado').length, color: 'text-red-600' },
          ].map(s => (
            <div key={s.label} className="bg-white border border-slate-200 rounded-2xl p-5">
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Instalações Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((inst) => (
            <div
              key={inst.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-blue-400/40 hover:shadow-md transition-all cursor-pointer"
              onClick={() => setSelected(inst.id === selected ? null : inst.id)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                    inst.status === 'ativo' ? 'bg-emerald-50' : inst.status === 'bloqueado' ? 'bg-red-50' : 'bg-slate-100'
                  }`}>
                    <Monitor className={`w-5 h-5 ${
                      inst.status === 'ativo' ? 'text-emerald-600' : inst.status === 'bloqueado' ? 'text-red-600' : 'text-slate-400'
                    }`} strokeWidth={1.75} />
                  </div>
                  <div>
                    <p className="font-black text-slate-950 text-sm">{inst.nomePC}</p>
                    <p className="text-xs text-slate-500">{inst.so}</p>
                  </div>
                </div>
                <StatusBadge status={inst.status} />
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Empresa</span>
                  <span className="font-bold text-slate-800 truncate max-w-[130px]">{inst.empresaNome}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Versão</span>
                  <span className="font-mono font-bold text-slate-800">{inst.versao}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Última actividade</span>
                  <span className="font-semibold text-slate-700">{inst.ultimaAtividade}</span>
                </div>
                {inst.ip && (
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">IP</span>
                    <span className="font-mono text-slate-600">{inst.ip}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                <button className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 py-1.5 rounded-lg transition-colors">
                  <Eye className="w-3 h-3" strokeWidth={2} />
                  Detalhes
                </button>
                <button className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-bold text-red-600 bg-red-50 hover:bg-red-100 py-1.5 rounded-lg transition-colors">
                  <Ban className="w-3 h-3" strokeWidth={2} />
                  Desactivar
                </button>
                <button className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 px-2.5 py-1.5 rounded-lg transition-colors">
                  <ShieldOff className="w-3 h-3" strokeWidth={2} />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
