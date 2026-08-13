import React, { useState } from 'react';
import { Plus, Search, Key, CheckSquare, Calendar, Building2, X, Copy, Eye } from 'lucide-react';
import { AdminTopbar, StatusBadge } from './AdminComponents';
import { MOCK_LICENCAS, MOCK_EMPRESAS, MOCK_PARCEIROS } from './mockData';

// ============================
// LICENÇAS — Lista
// ============================
interface LicencasProps {
  onCriarLicenca: () => void;
}

export const AdminLicencas: React.FC<LicencasProps> = ({ onCriarLicenca }) => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');

  const filtered = MOCK_LICENCAS.filter((l) => {
    const matchSearch = l.codigo.includes(search.toUpperCase()) || l.empresaNome.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'todos' || l.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const counts = {
    todos: MOCK_LICENCAS.length,
    ativa: MOCK_LICENCAS.filter(l => l.status === 'ativa').length,
    a_expirar: MOCK_LICENCAS.filter(l => l.status === 'a_expirar').length,
    expirada: MOCK_LICENCAS.filter(l => l.status === 'expirada').length,
    suspensa: MOCK_LICENCAS.filter(l => l.status === 'suspensa').length,
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <AdminTopbar
        title="Licenças"
        subtitle="Gestão e activação de licenças KIVORA"
        actions={
          <button
            onClick={onCriarLicenca}
            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={2} />
            <span>Criar Licença</span>
          </button>
        }
      />

      <div className="p-6 space-y-5">
        {/* Stats Inline */}
        <div className="grid grid-cols-5 gap-3">
          {Object.entries(counts).map(([key, count]) => (
            <button
              key={key}
              onClick={() => setFilterStatus(key)}
              className={`rounded-2xl p-4 border text-left transition-all ${
                filterStatus === key
                  ? 'bg-slate-950 border-slate-950 text-white'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <p className={`text-xl font-black ${filterStatus === key ? 'text-white' : 'text-slate-950'}`}>{count}</p>
              <p className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${filterStatus === key ? 'text-slate-400' : 'text-slate-400'}`}>
                {key === 'todos' ? 'Todas' : key === 'ativa' ? 'Activas' : key === 'a_expirar' ? 'A Expirar' : key === 'expirada' ? 'Expiradas' : 'Suspensas'}
              </p>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" strokeWidth={1.75} />
          <input
            type="text"
            placeholder="Pesquisar por código ou empresa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-5 py-3.5 text-[11px] font-black uppercase tracking-wider text-slate-400">Código</th>
                <th className="text-left px-4 py-3.5 text-[11px] font-black uppercase tracking-wider text-slate-400">Empresa</th>
                <th className="text-left px-4 py-3.5 text-[11px] font-black uppercase tracking-wider text-slate-400 hidden md:table-cell">Plano</th>
                <th className="text-left px-4 py-3.5 text-[11px] font-black uppercase tracking-wider text-slate-400">Estado</th>
                <th className="text-left px-4 py-3.5 text-[11px] font-black uppercase tracking-wider text-slate-400 hidden lg:table-cell">Expira</th>
                <th className="text-left px-4 py-3.5 text-[11px] font-black uppercase tracking-wider text-slate-400 hidden xl:table-cell">Instalações</th>
                <th className="text-right px-5 py-3.5 text-[11px] font-black uppercase tracking-wider text-slate-400">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((lic) => (
                <tr key={lic.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <Key className="w-3.5 h-3.5 text-slate-400 shrink-0" strokeWidth={1.75} />
                      <span className="font-mono font-bold text-slate-800 text-[11px]">{lic.codigo}</span>
                      <button
                        onClick={() => copyToClipboard(lic.codigo)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-blue-600"
                        title="Copiar"
                      >
                        <Copy className="w-3 h-3" strokeWidth={2} />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-slate-900">{lic.empresaNome}</td>
                  <td className="px-4 py-3.5 hidden md:table-cell">
                    <span className="text-slate-600">{lic.plano}</span>
                    <span className="text-slate-400 ml-1">({lic.periodicidade})</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={lic.status} type="licenca" />
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 hidden lg:table-cell">{lic.dataExpiracao}</td>
                  <td className="px-4 py-3.5 hidden xl:table-cell">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900">{lic.instalacoes.atual}</span>
                      <span className="text-slate-400">/ {lic.instalacoes.maximo}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-bold text-[11px]">
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
    </div>
  );
};

// ============================
// CRIAR LICENÇA — Formulário
// ============================
const MODULOS_DISPONIVEIS = ['Faturação', 'Stock', 'Financeiro', 'Clientes', 'Relatórios', 'RH', 'Contabilidade', 'SAF-T'];

interface CriarLicencaProps {
  onBack: () => void;
}

function gerarCodigoLicenca(plano: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const rand = (n: number) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const prefix = plano === 'Professional' ? 'PRO' : plano === 'Business' ? 'BUS' : 'STD';
  return `KVR-${prefix}-${rand(4)}-${rand(4)}-${rand(4)}`;
}

export const AdminCriarLicenca: React.FC<CriarLicencaProps> = ({ onBack }) => {
  const [form, setForm] = useState({
    empresaId: '',
    plano: 'Professional',
    periodicidade: 'anual',
    dataInicio: new Date().toISOString().split('T')[0],
    dataExpiracao: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    instalacoes: 3,
    parceiroId: '',
    observacao: '',
    modulos: ['Faturação', 'Stock', 'Financeiro', 'Clientes', 'Relatórios'],
  });
  const [codigoGerado, setCodigoGerado] = useState('');
  const [success, setSuccess] = useState(false);

  const toggleModulo = (mod: string) => {
    setForm(f => ({
      ...f,
      modulos: f.modulos.includes(mod)
        ? f.modulos.filter(m => m !== mod)
        : [...f.modulos, mod],
    }));
  };

  const handleCriar = () => {
    const codigo = gerarCodigoLicenca(form.plano);
    setCodigoGerado(codigo);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="flex-1 overflow-y-auto bg-slate-50">
        <AdminTopbar title="Licença Criada" />
        <div className="p-6 max-w-xl mx-auto pt-16 text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto">
            <CheckSquare className="w-8 h-8 text-emerald-600" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-950">Licença criada com sucesso!</h2>
            <p className="text-sm text-slate-500 mt-1">Envie o código abaixo para o cliente.</p>
          </div>
          <div className="bg-slate-950 text-white rounded-2xl p-6 space-y-3">
            <p className="text-slate-400 text-xs uppercase tracking-widest font-bold">Código da Licença</p>
            <p className="font-mono text-xl font-black text-blue-400 tracking-widest">{codigoGerado}</p>
            <button
              onClick={() => navigator.clipboard.writeText(codigoGerado)}
              className="text-slate-400 hover:text-white text-xs flex items-center gap-1.5 mx-auto transition-colors"
            >
              <Copy className="w-3.5 h-3.5" strokeWidth={2} />
              <span>Copiar código</span>
            </button>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 text-left space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-slate-500">Empresa:</span><span className="font-bold text-slate-900">{MOCK_EMPRESAS.find(e => e.id === form.empresaId)?.nome || 'N/D'}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Plano:</span><span className="font-bold text-slate-900">{form.plano}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Validade:</span><span className="font-bold text-slate-900">{form.dataInicio} → {form.dataExpiracao}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Instalações:</span><span className="font-bold text-slate-900">{form.instalacoes} PC(s)</span></div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setSuccess(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm py-3 rounded-xl transition-all">
              Criar Outra
            </button>
            <button onClick={onBack} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3 rounded-xl transition-all">
              Ver Todas as Licenças
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <AdminTopbar
        title="Criar Nova Licença"
        subtitle="Preencha os dados para gerar uma licença KIVORA"
        actions={
          <button onClick={onBack} className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1.5 font-semibold transition-colors">
            <X className="w-3.5 h-3.5" strokeWidth={2} />
            <span>Cancelar</span>
          </button>
        }
      />

      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-6">

          {/* Empresa */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-600" strokeWidth={2} />
              Empresa
            </label>
            <select
              value={form.empresaId}
              onChange={(e) => setForm(f => ({ ...f, empresaId: e.target.value }))}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 bg-white"
            >
              <option value="">— Selecionar empresa —</option>
              {MOCK_EMPRESAS.map(e => (
                <option key={e.id} value={e.id}>{e.nome} ({e.nif})</option>
              ))}
            </select>
          </div>

          {/* Plano + Periodicidade */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Plano</label>
              <select
                value={form.plano}
                onChange={(e) => setForm(f => ({ ...f, plano: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 bg-white"
              >
                <option>Standard</option>
                <option>Professional</option>
                <option>Business</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Periodicidade</label>
              <select
                value={form.periodicidade}
                onChange={(e) => setForm(f => ({ ...f, periodicidade: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 bg-white"
              >
                <option value="mensal">Mensal</option>
                <option value="anual">Anual</option>
                <option value="ilimitado">Ilimitado</option>
              </select>
            </div>
          </div>

          {/* Datas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" strokeWidth={2} />
                Data Inicial
              </label>
              <input
                type="date"
                value={form.dataInicio}
                onChange={(e) => setForm(f => ({ ...f, dataInicio: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" strokeWidth={2} />
                Data de Expiração
              </label>
              <input
                type="date"
                value={form.dataExpiracao}
                onChange={(e) => setForm(f => ({ ...f, dataExpiracao: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Nº Instalações */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Número Máximo de Instalações (PCs)</label>
            <input
              type="number"
              min={1}
              max={20}
              value={form.instalacoes}
              onChange={(e) => setForm(f => ({ ...f, instalacoes: parseInt(e.target.value) || 1 }))}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Módulos */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Módulos Incluídos</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {MODULOS_DISPONIVEIS.map((mod) => (
                <button
                  key={mod}
                  type="button"
                  onClick={() => toggleModulo(mod)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    form.modulos.includes(mod)
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'
                  }`}
                >
                  <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${form.modulos.includes(mod) ? 'bg-white border-white' : 'border-slate-400'}`}>
                    {form.modulos.includes(mod) && <span className="text-blue-600 text-[8px] font-black">✓</span>}
                  </div>
                  {mod}
                </button>
              ))}
            </div>
          </div>

          {/* Parceiro */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Parceiro (opcional)</label>
            <select
              value={form.parceiroId}
              onChange={(e) => setForm(f => ({ ...f, parceiroId: e.target.value }))}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 bg-white"
            >
              <option value="">— Directo (sem parceiro) —</option>
              {MOCK_PARCEIROS.filter(p => p.status === 'ativo').map(p => (
                <option key={p.id} value={p.id}>{p.nome}{p.empresa ? ` — ${p.empresa}` : ''}</option>
              ))}
            </select>
          </div>

          {/* Observação */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Observação (opcional)</label>
            <textarea
              rows={3}
              value={form.observacao}
              onChange={(e) => setForm(f => ({ ...f, observacao: e.target.value }))}
              placeholder="Notas internas sobre esta licença..."
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {/* Preview do código */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1.5">Preview do Código (gerado automaticamente)</p>
            <p className="font-mono text-base font-black text-slate-500">KVR-{form.plano === 'Professional' ? 'PRO' : form.plano === 'Business' ? 'BUS' : 'STD'}-XXXX-XXXX-XXXX</p>
          </div>

          {/* Submit */}
          <button
            onClick={handleCriar}
            disabled={!form.empresaId}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-black text-sm py-4 rounded-2xl shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5"
          >
            <Key className="w-4 h-4 inline mr-2" strokeWidth={2} />
            Gerar Licença KIVORA
          </button>

        </div>
      </div>
    </div>
  );
};
