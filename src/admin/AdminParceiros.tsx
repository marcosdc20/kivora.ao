import React, { useState } from 'react';
import {
  Handshake, Plus, Eye, Check, X, MessageCircle,
  TrendingUp, DollarSign, Users, CheckCircle2, Loader2
} from 'lucide-react';
import { AdminTopbar, StatusBadge, StatCard } from './AdminComponents';
import { MOCK_PARCEIROS } from './mockData';
import { Parceiro } from './types';
import { createOrApprovePartnerAccount } from './services/authService';

const fmt = (n: number) => n.toLocaleString('pt-AO');

// ============================
// PARCEIROS — Lista
// ============================
export const AdminParceiros: React.FC<{ onCandidaturas: () => void }> = ({ onCandidaturas }) => {
  const [filterStatus, setFilterStatus] = useState('todos');
  const [selected, setSelected] = useState<Parceiro | null>(null);

  const filtered = MOCK_PARCEIROS.filter(p =>
    filterStatus === 'todos' || p.status === filterStatus
  );

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <AdminTopbar
        title="Parceiros"
        subtitle="Programa de revendedores e consultores KIVORA"
        actions={
          <div className="flex gap-2">
            <button
              onClick={onCandidaturas}
              className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition-all"
            >
              <span>Candidaturas</span>
              <span className="bg-white/20 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">3</span>
            </button>
            <button className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition-all">
              <Plus className="w-3.5 h-3.5" strokeWidth={2} />
              <span>Novo Parceiro</span>
            </button>
          </div>
        }
      />

      <div className="p-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Parceiros Activos" value="84" sub="+7 este mês" subColor="green"
            icon={<Handshake className="w-4 h-4" strokeWidth={1.75} />} iconBg="bg-violet-50 text-violet-600" />
          <StatCard label="Pendentes" value="3" sub="Aguardam aprovação" subColor="amber"
            icon={<Users className="w-4 h-4" strokeWidth={1.75} />} iconBg="bg-amber-50 text-amber-600" />
          <StatCard label="Vendas este Mês" value="126" sub="Total de licenças" subColor="green"
            icon={<TrendingUp className="w-4 h-4" strokeWidth={1.75} />} iconBg="bg-emerald-50 text-emerald-600" />
          <StatCard label="Comissões Pendentes" value="2.450.000 Kz" sub="A pagar" subColor="amber"
            icon={<DollarSign className="w-4 h-4" strokeWidth={1.75} />} iconBg="bg-blue-50 text-blue-600" />
        </div>

        {/* Filtros */}
        <div className="flex gap-2">
          {[
            { key: 'todos', label: 'Todos' },
            { key: 'ativo', label: 'Activos' },
            { key: 'pendente', label: 'Pendentes' },
            { key: 'suspenso', label: 'Suspensos' },
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
                <th className="text-left px-5 py-3.5 text-[11px] font-black uppercase tracking-wider text-slate-400">Parceiro</th>
                <th className="text-left px-4 py-3.5 text-[11px] font-black uppercase tracking-wider text-slate-400 hidden md:table-cell">Tipo</th>
                <th className="text-left px-4 py-3.5 text-[11px] font-black uppercase tracking-wider text-slate-400">Estado</th>
                <th className="text-left px-4 py-3.5 text-[11px] font-black uppercase tracking-wider text-slate-400 hidden lg:table-cell">Clientes</th>
                <th className="text-left px-4 py-3.5 text-[11px] font-black uppercase tracking-wider text-slate-400 hidden xl:table-cell">Vendas/Mês</th>
                <th className="text-left px-4 py-3.5 text-[11px] font-black uppercase tracking-wider text-slate-400 hidden xl:table-cell">Comissão Pend.</th>
                <th className="text-right px-5 py-3.5 text-[11px] font-black uppercase tracking-wider text-slate-400">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-5 py-3.5">
                    <div>
                      <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{p.nome}</p>
                      <p className="text-slate-400 text-[10px]">{p.empresa || 'Individual'} · {p.provincia}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell">
                    <span className="capitalize text-slate-600 font-medium">{p.tipo}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={p.status} type="parceiro" />
                  </td>
                  <td className="px-4 py-3.5 font-bold text-slate-900 hidden lg:table-cell">{p.clientes}</td>
                  <td className="px-4 py-3.5 text-slate-600 hidden xl:table-cell">{fmt(p.vendasMes)} Kz</td>
                  <td className="px-4 py-3.5 hidden xl:table-cell">
                    <span className={`font-bold ${p.comissaoPendente > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                      {fmt(p.comissaoPendente)} Kz
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => setSelected(p)}
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-bold text-[11px] transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" strokeWidth={2} />
                      <span>Ver</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detalhe Parceiro */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl p-8 space-y-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-950">{selected.nome}</h2>
                <p className="text-sm text-slate-500">{selected.empresa || 'Individual'} · {selected.tipo}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-900 transition-colors">
                <X className="w-5 h-5" strokeWidth={1.75} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Estado', value: <StatusBadge status={selected.status} type="parceiro" /> },
                { label: 'Província', value: selected.provincia },
                { label: 'Email', value: selected.email },
                { label: 'Telefone', value: selected.telefone },
                { label: 'Data de Entrada', value: selected.dataEntrada },
                { label: 'Taxa de Comissão', value: `${selected.taxaComissao}%` },
              ].map((item) => (
                <div key={item.label} className="bg-slate-50 rounded-xl p-3">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">{item.label}</p>
                  <div className="text-sm font-bold text-slate-900">{item.value}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="bg-slate-950 rounded-2xl p-4 text-center">
                <p className="text-2xl font-black text-white">{selected.clientes}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Clientes</p>
              </div>
              <div className="bg-emerald-50 rounded-2xl p-4 text-center">
                <p className="text-xl font-black text-emerald-700">{fmt(selected.comissaoPaga)}</p>
                <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Pago (Kz)</p>
              </div>
              <div className="bg-amber-50 rounded-2xl p-4 text-center">
                <p className="text-xl font-black text-amber-700">{fmt(selected.comissaoPendente)}</p>
                <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">Pendente (Kz)</p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-3 rounded-2xl transition-all">
                Marcar Comissão Paga
              </button>
              <button className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm px-5 py-3 rounded-2xl transition-all">
                <MessageCircle className="w-4 h-4" strokeWidth={1.75} />
                Contactar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================
// CANDIDATURAS & APROVAÇÃO
// ============================
interface CandidaturaItem {
  id: string;
  nome: string;
  email: string;
  phone: string;
  provincia: string;
  tipo: string;
  clientes: number;
  empresa?: string;
  data: string;
}

const INITIAL_CANDIDATURAS: CandidaturaItem[] = [
  { id: 'c1', nome: 'Ana Rodrigues', email: 'ana.rodrigues@ardigital.ao', phone: '+244 923 111 222', provincia: 'Huambo', tipo: 'Revendedor', clientes: 5, empresa: 'AR Digital', data: '2026-08-10' },
  { id: 'c2', nome: 'Mário Santos', email: 'mario.santos@consultoria.ao', phone: '+244 934 333 444', provincia: 'Benguela', tipo: 'Consultor', clientes: 12, empresa: 'Santos Consult', data: '2026-08-09' },
  { id: 'c3', nome: 'Helena Furtado', email: 'helena@hfsistemas.ao', phone: '+244 945 555 666', provincia: 'Luanda', tipo: 'Integrador', clientes: 8, empresa: 'HF Sistemas', data: '2026-08-07' },
];

export const AdminCandidaturas: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [candidaturas, setCandidaturas] = useState<CandidaturaItem[]>(INITIAL_CANDIDATURAS);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [approvedResult, setApprovedResult] = useState<{ nome: string; email: string; code: string } | null>(null);

  const handleAprovar = async (c: CandidaturaItem) => {
    setApprovingId(c.id);
    const code = `PARCEIRO-AO-${Math.floor(100 + Math.random() * 900)}`;

    try {
      await createOrApprovePartnerAccount({
        email: c.email,
        nome: c.nome,
        partnerCode: code,
        phone: c.phone,
        region: c.provincia,
      });

      setCandidaturas(prev => prev.filter(item => item.id !== c.id));
      setApprovedResult({
        nome: c.nome,
        email: c.email,
        code,
      });
    } catch (err: any) {
      alert('Erro ao aprovar parceiro no Firebase: ' + err.message);
    } finally {
      setApprovingId(null);
    }
  };

  const handleRejeitar = (id: string) => {
    if (!confirm('Rejeitar esta candidatura de parceiro?')) return;
    setCandidaturas(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <AdminTopbar
        title="Candidaturas de Parceiros"
        subtitle={`${candidaturas.length} candidaturas pendentes de análise e aprovação`}
        actions={
          <button onClick={onBack} className="text-xs text-slate-500 hover:text-slate-900 font-semibold transition-colors">
            ← Voltar aos Parceiros
          </button>
        }
      />
      <div className="p-6 space-y-4 max-w-4xl">

        {/* Modal de Sucesso na Aprovação */}
        {approvedResult && (
          <div className="p-6 bg-slate-950 text-white rounded-3xl space-y-4 shadow-xl border border-slate-800 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black">Parceiro Aprovado no Firebase!</h3>
                <p className="text-xs text-slate-400">As credenciais de acesso foram geradas para o Portal do Parceiro.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white/5 p-4 rounded-2xl text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-sans font-bold">Nome</span>
                <strong className="text-white font-sans">{approvedResult.nome}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-sans font-bold">Email de Acesso</span>
                <strong className="text-blue-300">{approvedResult.email}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-sans font-bold">Código do Parceiro</span>
                <strong className="text-emerald-400 text-sm">{approvedResult.code}</strong>
              </div>
            </div>

            <button
              onClick={() => setApprovedResult(null)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl"
            >
              Fechar Notificação
            </button>
          </div>
        )}

        {candidaturas.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
            <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-bold text-slate-700">Todas as candidaturas foram processadas!</p>
            <p className="text-xs text-slate-400">Novos pedidos submetidos no site aparecerão aqui automaticamente.</p>
          </div>
        ) : (
          candidaturas.map((c) => (
            <div key={c.id} className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-blue-400/40 hover:shadow-md transition-all">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Candidatura Pendente
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Submetido em {c.data}</span>
                </div>
                <h3 className="font-black text-slate-950 text-base">{c.nome}</h3>
                <p className="text-xs text-slate-500 font-medium">
                  {c.empresa || 'Individual'} • {c.tipo} • {c.provincia} • {c.email} • {c.phone}
                </p>
                <p className="text-xs text-blue-600 font-bold">
                  Previsão de vendas: ~{c.clientes} clientes no 1º trimestre
                </p>
              </div>

              <div className="flex gap-2 shrink-0 w-full sm:w-auto">
                <button
                  onClick={() => handleAprovar(c)}
                  disabled={approvingId === c.id}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 transition-all disabled:bg-slate-300"
                >
                  {approvingId === c.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Aprovar & Criar Acesso</span>
                </button>
                <button
                  onClick={() => handleRejeitar(c.id)}
                  className="flex items-center justify-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3.5 py-2.5 rounded-xl transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Rejeitar</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
