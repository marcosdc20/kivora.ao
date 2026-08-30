import React, { useState } from 'react';
import {
  Plus, CheckCircle2, ArrowRight,
  X, Check, Users, Layers
} from 'lucide-react';
import { AdminTopbar, StatCard } from './AdminComponents';

export interface ProductModule {
  id: string;
  code: string;
  name: string;
  category: string;
  version: string;
  price_monthly_aoa: number;
  active_tenants: number;
  status: 'available' | 'beta' | 'deprecated';
  features: string[];
}

const OFFICIAL_MODULES: ProductModule[] = [
  {
    id: '1',
    code: 'MOD-ERP-CORE',
    name: 'Kivora ERP Core Multiloja',
    category: 'ERP Core',
    version: '1.1.0-PROD',
    price_monthly_aoa: 25000,
    active_tenants: 48,
    status: 'available',
    features: [
      'Gestão de Estoque Multiloja Sincronizada',
      'Banco de Dados Offline-first SQLite com sincronização Cloud',
      'Painel de Controlo de Caixas & Turnos',
      'Relatórios Financeiros e DRE Básica'
    ]
  },
  {
    id: '2',
    code: 'MOD-AGT-FISCAL',
    name: 'Módulo AGT Faturação & SAFT-AO',
    category: 'ERP Core',
    version: '1.1.0-PROD',
    price_monthly_aoa: 15000,
    active_tenants: 45,
    status: 'available',
    features: [
      'Certificação AGT / Conformidade Fiscal Angolana',
      'Exportação instantânea do arquivo XML SAFT-AO (DP 71/25)',
      'Assinatura criptográfica RSA na emissão de faturas',
      'Gestão de notas de crédito e débito'
    ]
  },
  {
    id: '3',
    code: 'MOD-POS-RETAIL',
    name: 'PDV Retalho & Supermercado Rápido',
    category: 'POS & Retalho',
    version: '1.1.0-PROD',
    price_monthly_aoa: 18000,
    active_tenants: 32,
    status: 'available',
    features: [
      'Interface Touchscreen ultrarrápida (menos de 2s por venda)',
      'Leitura de Código de Barras e Pesagem em balança',
      'Integração direta com terminais TPA / Multicaixa Express',
      'Controlo de vasilhames e promoções de desconto'
    ]
  },
  {
    id: '4',
    code: 'MOD-HEALTH-PHARMA',
    name: 'Gestão Hospitalar, Clínica & Farmácia',
    category: 'Saúde',
    version: '1.1.0-BETA',
    price_monthly_aoa: 35000,
    active_tenants: 12,
    status: 'beta',
    features: [
      'Controlo rigoroso de Lotes, Validades e Medicamentos Psicotrópicos',
      'Prontuário Eletrónico e Triagem de Enfermagem',
      'Agendamento de Consultas e Exames Médicos',
      'Alerta automático de medicamentos próximos à caducidade'
    ]
  },
  {
    id: '5',
    code: 'MOD-REST-KDS',
    name: 'Restauração, Mesas & Cozinha (KDS)',
    category: 'Restauração',
    version: '1.1.0-PROD',
    price_monthly_aoa: 22000,
    active_tenants: 18,
    status: 'available',
    features: [
      'Mapa Visual de Mesas e Divisão de Contas',
      'Envio imediato de pedidos para impressoras de Bar e Cozinha',
      'Ecrã de Cozinha (KDS) em tempo real',
      'Controlo de Fichas Técnicas e Desperdício de Ingredientes'
    ]
  },
  {
    id: '6',
    code: 'MOD-EDU-SCHOOL',
    name: 'Gestão Escolar & Académica',
    category: 'Educação',
    version: '1.0.5-PROD',
    price_monthly_aoa: 28000,
    active_tenants: 8,
    status: 'available',
    features: [
      'Matrículas, Turmas, Pautas e Emissão de Boletins',
      'Controlo de Propinas com bloqueio de devedores na pauta',
      'Portal do Aluno e Encarregado de Educação',
      'Histórico Disciplinar e Emissão de Certificados'
    ]
  }
];

const fmt = (n: number) => n.toLocaleString('pt-AO');

export const AdminPlanos: React.FC = () => {
  const [modules, setModules] = useState<ProductModule[]>(OFFICIAL_MODULES);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState('ERP Core');
  const [price, setPrice] = useState<number>(20000);
  const [featureText, setFeatureText] = useState('');

  const handleCreateModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;

    const newMod: ProductModule = {
      id: Date.now().toString(),
      code: code.toUpperCase().trim(),
      name,
      category,
      version: '1.0.0-PROD',
      price_monthly_aoa: price,
      active_tenants: 0,
      status: 'available',
      features: featureText.split('\n').filter(f => f.trim().length > 0)
    };

    setModules([...modules, newMod]);
    setShowModal(false);
    setName('');
    setCode('');
    setFeatureText('');
    alert(`Módulo ${newMod.name} adicionado ao catálogo oficial com sucesso!`);
  };

  const totalTenants = modules.reduce((acc, m) => acc + m.active_tenants, 0);

  return (
    <div className="w-full min-w-0 flex flex-col font-sans pb-12">
      <AdminTopbar
        title="Catálogo Oficial de Módulos & Produtos Kivora ERP"
        subtitle="Configuração de pacotes, módulos setoriais e preços oficiais em Kwanzas (Kz)"
        actions={
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-blue-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Novo Módulo</span>
          </button>
        }
      />

      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Módulos no Catálogo"
            value={modules.length}
            sub="Soluções setoriais ativas"
            subColor="green"
            icon={<Layers className="w-4 h-4" />}
            iconBg="bg-blue-50 text-blue-600"
          />
          <StatCard
            label="Empresas Ativas c/ Módulos"
            value={totalTenants}
            sub="Instalações ativas em Angola"
            subColor="green"
            icon={<Users className="w-4 h-4" />}
            iconBg="bg-emerald-50 text-emerald-600"
          />
          <StatCard
            label="Certificação Fiscal AGT"
            value="100% Homologado"
            sub="SAFT-AO e RSA DP 71/25"
            subColor="green"
            icon={<CheckCircle2 className="w-4 h-4" />}
            iconBg="bg-purple-50 text-purple-600"
          />
        </div>

        {/* Grid dos 6 Módulos Oficiais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((mod) => (
            <div
              key={mod.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-5"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                    {mod.code}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    mod.status === 'available' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {mod.status === 'available' ? 'Disponível' : 'Beta'}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-black text-slate-900">{mod.name}</h3>
                  <p className="text-[11px] font-bold text-slate-400 uppercase mt-0.5">
                    {mod.category} • Versão {mod.version}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-baseline justify-between">
                  <span className="text-xs text-slate-500 font-medium">Preço Mensal:</span>
                  <div>
                    <span className="text-lg font-black text-slate-900 font-mono">{fmt(mod.price_monthly_aoa)}</span>
                    <span className="text-xs text-slate-500 font-bold ml-1">Kz/mês</span>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-2 pt-1">
                  <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Recursos Incluídos:</p>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {mod.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">
                  {mod.active_tenants} empresa(s) utilizam
                </span>
                <button
                  onClick={() => alert(`Configurações avançadas do módulo ${mod.name} abertas.`)}
                  className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1"
                >
                  <span>Configurar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Adicionar Módulo */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">Novo Módulo para o Kivora ERP</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-900">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateModule} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase">Nome do Módulo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Gestão de Frotas & Logística"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Código Único</label>
                  <input
                    type="text"
                    required
                    placeholder="MOD-FLEET-LOG"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 font-mono font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Preço Mensal (Kz)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase">Categoria</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-white font-bold"
                >
                  <option value="ERP Core">ERP Core</option>
                  <option value="POS & Retalho">POS & Retalho</option>
                  <option value="Saúde">Saúde / Farmácia</option>
                  <option value="Restauração">Restauração / Bares</option>
                  <option value="Educação">Educação / Escolas</option>
                  <option value="Logística">Logística / Frotas</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase">Funcionalidades (1 por linha)</label>
                <textarea
                  rows={3}
                  placeholder="Rastreamento GPS em tempo real&#10;Controlo de manutenção de veículos&#10;Gestão de motoristas"
                  value={featureText}
                  onChange={(e) => setFeatureText(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20"
                >
                  Criar Módulo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
