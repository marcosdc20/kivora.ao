import React, { useState } from 'react';
import { Package, Check, Star, Plus } from 'lucide-react';
import { AdminTopbar, StatCard } from './AdminComponents';
import { MOCK_PLANOS } from './mockData';
import { PlanoProduto } from './types';

export const AdminPlanos: React.FC = () => {
  const [planos, setPlanos] = useState<PlanoProduto[]>(MOCK_PLANOS);
  const [modalNovo, setModalNovo] = useState(false);
  const [nome, setNome] = useState('');
  const [codigo, setCodigo] = useState('');
  const [precoMensal, setPrecoMensal] = useState<number>(20000);
  const [precoAnual, setPrecoAnual] = useState<number>(200000);
  const [maxComputadores, setMaxComputadores] = useState<number>(3);

  const handleCreatePlano = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !codigo) return;

    const newP: PlanoProduto = {
      id: `p-${Date.now()}`,
      nome,
      codigo,
      precoMensal,
      precoAnual,
      maxComputadores,
      modulos: ['Faturação Certificada AGT', 'Gestão de Clientes', 'POS'],
      popular: false,
      ativo: true,
    };

    setPlanos([...planos, newP]);
    setModalNovo(false);
    setNome('');
    setCodigo('');
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <AdminTopbar
        title="Catálogo de Produtos & Planos Kivora"
        subtitle="Configuração de pacotes, preços em Kwanzas (Kz) e módulos do ERP Kivora Desktop"
        actions={
          <button
            onClick={() => setModalNovo(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-blue-600/20"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            Novo Plano / Pacote
          </button>
        }
      />

      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Planos Ativos"
            value={planos.filter((p) => p.ativo).length.toString()}
            icon={<Package className="w-4 h-4" strokeWidth={2} />}
            iconBg="bg-blue-50 text-blue-600"
            sub="Disponíveis no site"
          />
          <StatCard
            label="Plano Mais Vendido"
            value="Professional"
            icon={<Star className="w-4 h-4" strokeWidth={2} />}
            iconBg="bg-amber-50 text-amber-600"
            sub="35.000 Kz / mês"
            subColor="amber"
          />
          <StatCard
            label="Certificação AGT"
            value="Incluído em 100%"
            icon={<Check className="w-4 h-4" strokeWidth={2} />}
            iconBg="bg-emerald-50 text-emerald-600"
            sub="Conformidade legal"
            subColor="green"
          />
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {planos.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-3xl border ${plan.popular ? 'border-blue-500 shadow-xl ring-2 ring-blue-500/20' : 'border-slate-200 shadow-sm'} p-6 relative flex flex-col justify-between space-y-6`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                  Mais Recomendado
                </span>
              )}

              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                    {plan.codigo}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-2">{plan.nome}</h3>
                  <p className="text-xs text-slate-500">Até {plan.maxComputadores} computadores por licença</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black font-mono text-slate-900">
                      {new Intl.NumberFormat('pt-AO').format(plan.precoMensal)}
                    </span>
                    <span className="text-xs font-bold text-slate-500">Kz / mês</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Ou {new Intl.NumberFormat('pt-AO').format(plan.precoAnual)} Kz / ano (anual)
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Recursos do Plano</span>
                  <ul className="space-y-2">
                    {plan.modulos.map((m, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Plano Ativo
                </span>
                <button className="text-xs font-bold text-blue-600 hover:text-blue-700">
                  Editar Preços
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Add Plan */}
      {modalNovo && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-fadeIn">
            <h3 className="text-lg font-black text-slate-900">Criar Novo Plano / Pacote</h3>

            <form onSubmit={handleCreatePlano} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Nome do Plano</label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Kivora Enterprise Plus"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Código do Plano</label>
                <input
                  type="text"
                  required
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  placeholder="Ex: ENT-PLUS-ANG"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Preço Mensal (Kz)</label>
                  <input
                    type="number"
                    required
                    value={precoMensal}
                    onChange={(e) => setPrecoMensal(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Preço Anual (Kz)</label>
                  <input
                    type="number"
                    required
                    value={precoAnual}
                    onChange={(e) => setPrecoAnual(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Limite de Computadores</label>
                <input
                  type="number"
                  required
                  value={maxComputadores}
                  onChange={(e) => setMaxComputadores(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-bold"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalNovo(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20"
                >
                  Salvar Plano
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
