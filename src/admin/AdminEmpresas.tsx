import React, { useState } from 'react';
import { Search, Filter, Plus, Eye, Ban, RefreshCw, ChevronRight, Building2, Key, Monitor, CreditCard, Headphones, User } from 'lucide-react';
import { AdminTopbar, StatusBadge } from './AdminComponents';
import { MOCK_EMPRESAS } from './mockData';
import { Empresa } from './types';

// ============================
// EMPRESAS LIST
// ============================
interface EmpresasProps {
  onSelectEmpresa: (empresa: Empresa) => void;
}

export const AdminEmpresas: React.FC<EmpresasProps> = ({ onSelectEmpresa }) => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');

  const filtered = MOCK_EMPRESAS.filter((e) => {
    const matchSearch = e.nome.toLowerCase().includes(search.toLowerCase()) || e.nif.includes(search);
    const matchStatus = filterStatus === 'todos' || e.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const statusCounts = {
    todos: MOCK_EMPRESAS.length,
    ativa: MOCK_EMPRESAS.filter(e => e.status === 'ativa').length,
    pendente: MOCK_EMPRESAS.filter(e => e.status === 'pendente').length,
    suspensa: MOCK_EMPRESAS.filter(e => e.status === 'suspensa').length,
    expirada: MOCK_EMPRESAS.filter(e => e.status === 'expirada').length,
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <AdminTopbar
        title="Empresas"
        subtitle={`${MOCK_EMPRESAS.length} empresas registadas`}
        actions={
          <button className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition-all">
            <Plus className="w-3.5 h-3.5" strokeWidth={2} />
            <span>Nova Empresa</span>
          </button>
        }
      />

      <div className="p-6 space-y-5">
        {/* Filtros de Status */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(statusCounts).map(([key, count]) => (
            <button
              key={key}
              onClick={() => setFilterStatus(key)}
              className={`text-xs font-bold px-4 py-2 rounded-xl border transition-all ${
                filterStatus === key
                  ? 'bg-slate-950 text-white border-slate-950'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
              }`}
            >
              {key === 'todos' ? 'Todas' : key === 'ativa' ? 'Activas' : key === 'a_expirar' ? 'A Expirar' : key.charAt(0).toUpperCase() + key.slice(1)+'s'}
              <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full ${filterStatus === key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {count}
              </span>
            </button>
          ))}
        </div>

        {/* Barra de Pesquisa */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" strokeWidth={1.75} />
            <input
              type="text"
              placeholder="Pesquisar por nome ou NIF..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>
          <button className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-3.5 py-2.5 rounded-xl hover:border-slate-400 transition-colors">
            <Filter className="w-3.5 h-3.5" strokeWidth={1.75} />
            <span>Filtros</span>
          </button>
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-5 py-3.5 text-[11px] font-black uppercase tracking-wider text-slate-400">Empresa</th>
                <th className="text-left px-4 py-3.5 text-[11px] font-black uppercase tracking-wider text-slate-400 hidden md:table-cell">NIF</th>
                <th className="text-left px-4 py-3.5 text-[11px] font-black uppercase tracking-wider text-slate-400 hidden lg:table-cell">Plano</th>
                <th className="text-left px-4 py-3.5 text-[11px] font-black uppercase tracking-wider text-slate-400">Estado</th>
                <th className="text-left px-4 py-3.5 text-[11px] font-black uppercase tracking-wider text-slate-400 hidden xl:table-cell">Parceiro</th>
                <th className="text-left px-4 py-3.5 text-[11px] font-black uppercase tracking-wider text-slate-400 hidden xl:table-cell">Último Acesso</th>
                <th className="text-right px-5 py-3.5 text-[11px] font-black uppercase tracking-wider text-slate-400">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((empresa) => (
                <tr key={empresa.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-5 py-3.5">
                    <div>
                      <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{empresa.nome}</p>
                      <p className="text-slate-400 text-[10px]">{empresa.provincia}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 font-mono hidden md:table-cell">{empresa.nif}</td>
                  <td className="px-4 py-3.5 hidden lg:table-cell">
                    <span className="text-slate-700 font-semibold">{empresa.plano}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={empresa.status} type="empresa" />
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 hidden xl:table-cell">{empresa.parceiro || '—'}</td>
                  <td className="px-4 py-3.5 text-slate-500 hidden xl:table-cell">{empresa.ultimoAcesso}</td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => onSelectEmpresa(empresa)}
                      className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-bold text-[11px] transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" strokeWidth={2} />
                      <span>Ver</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="py-16 text-center text-slate-400 text-sm">
              Nenhuma empresa encontrada.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================
// EMPRESA DETAIL
// ============================
type EmpresaTab = 'resumo' | 'licencas' | 'instalacoes' | 'pagamentos' | 'parceiro' | 'actividade';

interface EmpresaDetailProps {
  empresa: Empresa | null;
  onBack: () => void;
}

export const AdminEmpresaDetalhe: React.FC<EmpresaDetailProps> = ({ empresa, onBack }) => {
  const [tab, setTab] = useState<EmpresaTab>('resumo');

  if (!empresa) return null;

  const tabs: { id: EmpresaTab; label: string; icon: React.ReactNode }[] = [
    { id: 'resumo', label: 'Resumo', icon: <Building2 className="w-3.5 h-3.5" strokeWidth={1.75} /> },
    { id: 'licencas', label: 'Licenças', icon: <Key className="w-3.5 h-3.5" strokeWidth={1.75} /> },
    { id: 'instalacoes', label: 'Instalações', icon: <Monitor className="w-3.5 h-3.5" strokeWidth={1.75} /> },
    { id: 'pagamentos', label: 'Pagamentos', icon: <CreditCard className="w-3.5 h-3.5" strokeWidth={1.75} /> },
    { id: 'parceiro', label: 'Parceiro', icon: <User className="w-3.5 h-3.5" strokeWidth={1.75} /> },
    { id: 'actividade', label: 'Actividade', icon: <Headphones className="w-3.5 h-3.5" strokeWidth={1.75} /> },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 pt-6 pb-0">
        <button onClick={onBack} className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 text-xs font-semibold mb-4 transition-colors">
          <ChevronRight className="w-3.5 h-3.5 rotate-180" strokeWidth={2} />
          <span>Voltar a Empresas</span>
        </button>

        <div className="flex items-start justify-between mb-5">
          <div>
            <h1 className="text-xl font-black text-slate-950">{empresa.nome}</h1>
            <p className="text-sm text-slate-500 mt-0.5">NIF: <span className="font-mono font-bold text-slate-700">{empresa.nif}</span></p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={empresa.status} type="empresa" />
            <button className="text-xs font-bold text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5">
              <Ban className="w-3 h-3" strokeWidth={2} />
              <span>Suspender</span>
            </button>
            <button className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5">
              <RefreshCw className="w-3 h-3" strokeWidth={2} />
              <span>Alterar Plano</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-slate-200 -mx-6 px-6">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-bold border-b-2 transition-all -mb-px ${
                tab === t.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {tab === 'resumo' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Info Cards */}
            {[
              { label: 'Plano', value: empresa.plano, icon: '📦' },
              { label: 'Estado', value: empresa.status.charAt(0).toUpperCase() + empresa.status.slice(1), icon: '🔴' },
              { label: 'Licença', value: empresa.licencaId.toUpperCase(), icon: '🔑' },
              { label: 'Computadores', value: `${empresa.computadores.atual} / ${empresa.computadores.maximo}`, icon: '💻' },
              { label: 'Último Acesso', value: empresa.ultimoAcesso, icon: '🕐' },
              { label: 'Parceiro', value: empresa.parceiro || 'Directo', icon: '🤝' },
              { label: 'Província', value: empresa.provincia, icon: '📍' },
              { label: 'Email', value: empresa.email, icon: '✉️' },
              { label: 'Telefone', value: empresa.telefone, icon: '📞' },
            ].map((item) => (
              <div key={item.label} className="bg-white border border-slate-200 rounded-2xl p-5">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">{item.label}</p>
                <p className="text-sm font-bold text-slate-900">{item.icon} {item.value}</p>
              </div>
            ))}
          </div>
        )}

        {tab === 'licencas' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center py-16 text-slate-400 text-sm">
            Licenças da empresa serão listadas aqui.
          </div>
        )}

        {tab === 'instalacoes' && (
          <div className="space-y-3">
            {[
              { pc: 'PC-ADMIN', so: 'Windows 11 Pro', atividade: 'Hoje 18:43', status: 'ativo' },
              { pc: 'PC-CAIXA', so: 'Windows 10 Pro', atividade: 'Hoje 17:21', status: 'ativo' },
            ].map((inst, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                    <Monitor className="w-5 h-5 text-slate-500" strokeWidth={1.75} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{inst.pc}</p>
                    <p className="text-xs text-slate-500">{inst.so} · Última actividade: {inst.atividade}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={inst.status} />
                  <button className="text-xs text-red-600 hover:text-red-800 font-bold px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 transition-colors">
                    Desactivar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {(tab === 'pagamentos' || tab === 'parceiro' || tab === 'actividade') && (
          <div className="bg-white rounded-2xl border border-slate-200 py-16 text-center text-slate-400 text-sm">
            Secção em desenvolvimento.
          </div>
        )}
      </div>
    </div>
  );
};
