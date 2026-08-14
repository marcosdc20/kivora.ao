import React, { useState } from 'react';
import {
  Search, Plus, Eye, Building2,
  Mail, Phone, MapPin, Loader2, Trash2, RotateCcw
} from 'lucide-react';
import { AdminTopbar, StatusBadge } from './AdminComponents';
import { useCompanies, useLicenses } from './hooks/useFirebase';
import { FirebaseAuthModal } from './components/FirebaseAuthModal';
import { Empresa } from './types';

// ============================
// EMPRESAS LIST — Sincronizado Firebase
// ============================
interface EmpresasProps {
  onSelectEmpresa: (empresa: Empresa) => void;
}

export const AdminEmpresas: React.FC<EmpresasProps> = ({ onSelectEmpresa }) => {
  const { companies, loading, error, addCompany, deleteCompany, refresh } = useCompanies();
  const { licenses } = useLicenses();

  const [modalAuth, setModalAuth] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [modalNova, setModalNova] = useState(false);

  // Form states
  const [nome, setNome] = useState('');
  const [nif, setNif] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Mapear companies do Firebase para o modelo de visualização
  const mappedEmpresas: Empresa[] = companies.map((c) => {
    const empresaLicenses = licenses.filter(
      (l) => l.nif === c.nif || l.company_name.toLowerCase() === c.name.toLowerCase()
    );
    const hasActiveLic = empresaLicenses.some((l) => l.status === 'active' && (!l.expires_at || l.expires_at >= Date.now()));
    const activeLic = empresaLicenses[0];

    const currentStatus = c.status === 'blocked' ? 'suspensa' : (hasActiveLic ? 'ativa' : (c.status === 'suspended' ? 'suspensa' : 'pendente'));

    return {
      id: c.id,
      nome: c.name,
      nif: c.nif,
      email: c.email || 'N/A',
      telefone: c.phone || 'N/A',
      provincia: c.address || 'Luanda',
      plano: activeLic ? activeLic.plan_type.toUpperCase() : 'Standard',
      status: currentStatus,
      licencaId: activeLic ? activeLic.id : 'Sem Licença',
      ultimoAcesso: 'Hoje via Cloud',
      dataRegisto: new Date(c.createdAt || Date.now()).toISOString().split('T')[0],
      computadores: {
        atual: activeLic?.hardware_id ? 1 : 0,
        maximo: 1 + (activeLic?.extra_seats || 0),
      },
    };
  });

  const filtered = mappedEmpresas.filter((e) => {
    const s = search.toLowerCase();
    const matchSearch = e.nome.toLowerCase().includes(s) || e.nif.includes(s) || e.email.toLowerCase().includes(s);
    const matchStatus = filterStatus === 'todos' || e.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const statusCounts = {
    todos: mappedEmpresas.length,
    ativa: mappedEmpresas.filter(e => e.status === 'ativa').length,
    pendente: mappedEmpresas.filter(e => e.status === 'pendente').length,
    suspensa: mappedEmpresas.filter(e => e.status === 'suspensa').length,
  };

  const handleAddCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !nif) return;
    setSubmitting(true);
    try {
      await addCompany({
        name: nome,
        nif,
        email,
        phone,
        address: address || 'Luanda',
        status: 'active',
      });
      setModalNova(false);
      setNome('');
      setNif('');
      setEmail('');
      setPhone('');
      setAddress('');
    } catch (err: any) {
      alert('Erro ao criar empresa no Firebase: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCompany = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja apagar a empresa "${name}" do Firebase?`)) return;
    try {
      await deleteCompany(id);
    } catch (err: any) {
      alert('Erro ao apagar empresa: ' + err.message);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <AdminTopbar
        title="Gestão de Empresas & Clientes"
        subtitle={`${mappedEmpresas.length} empresas registadas no Firebase Firestore`}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => refresh()}
              disabled={loading}
              className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-sm transition-all"
              title="Recarregar empresas do Firebase"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
              <span>Sincronizar</span>
            </button>
            <button
              onClick={() => setModalNova(true)}
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-blue-600/20 transition-all"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              <span>Registar Empresa</span>
            </button>
          </div>
        }
      />

      <div className="p-6 space-y-5">
        {error && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
            <div>
              <p className="font-bold flex items-center gap-1.5 text-amber-900">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                Aviso de Sincronização com o Firestore:
              </p>
              <p className="text-[11px] text-amber-800 mt-1">{error}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setModalAuth(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-sm transition-all"
              >
                🔐 Iniciar Sessão Firebase
              </button>
              <button
                onClick={() => refresh()}
                className="bg-white hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold text-xs px-3 py-2 rounded-xl"
              >
                Recarregar
              </button>
            </div>
          </div>
        )}
        {/* Filtros de Status */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(statusCounts).map(([key, count]) => (
            <button
              key={key}
              onClick={() => setFilterStatus(key)}
              className={`text-xs font-bold px-4 py-2 rounded-xl border transition-all ${
                filterStatus === key
                  ? 'bg-slate-950 text-white border-slate-950 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
              }`}
            >
              {key === 'todos' ? 'Todas as Empresas' : key === 'ativa' ? 'Ativas' : key === 'pendente' ? 'Pendentes' : 'Suspensas'}
              <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full ${filterStatus === key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" strokeWidth={1.75} />
          <input
            type="text"
            placeholder="Pesquisar por nome da empresa, NIF ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-medium shadow-sm"
          />
        </div>

        {/* Tabela de Empresas */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
              <p className="text-xs font-bold">A carregar empresas do Firebase Firestore...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Building2 className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-sm font-bold text-slate-600">Nenhuma empresa encontrada</p>
              <p className="text-xs text-slate-400">Clique em "Registar Empresa" ou emita uma nova licença.</p>
            </div>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-slate-400 font-black uppercase text-[10px] tracking-wider text-left">
                  <th className="px-5 py-3.5">Empresa / NIF</th>
                  <th className="px-4 py-3.5">Contactos</th>
                  <th className="px-4 py-3.5 hidden md:table-cell">Plano Ativo</th>
                  <th className="px-4 py-3.5">Estado</th>
                  <th className="px-4 py-3.5 hidden lg:table-cell">Chave da Licença</th>
                  <th className="px-4 py-3.5 hidden xl:table-cell">Terminais (PCs)</th>
                  <th className="text-right px-5 py-3.5">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-900 text-xs">{emp.nome}</p>
                      <p className="text-slate-400 text-[10px] font-mono">NIF: {emp.nif} • {emp.provincia}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-slate-700 font-medium">{emp.email}</p>
                      <p className="text-slate-400 text-[10px]">{emp.telefone}</p>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-[11px]">
                        {emp.plano}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={emp.status} />
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 hidden lg:table-cell font-mono text-[11px]">
                      {emp.licencaId}
                    </td>
                    <td className="px-4 py-3.5 hidden xl:table-cell">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900">{emp.computadores.atual}</span>
                        <span className="text-slate-400">/ {emp.computadores.maximo} PC(s)</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onSelectEmpresa(emp)}
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-bold text-xs bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Detalhes</span>
                        </button>
                        <button
                          onClick={() => handleDeleteCompany(emp.id, emp.nome)}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remover Empresa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal Registar Empresa */}
      {modalNova && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-fadeIn">
            <h3 className="text-lg font-black text-slate-900">Registar Nova Empresa no Firebase</h3>

            <form onSubmit={handleAddCompanySubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Nome da Empresa</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Farmácia Popular, Lda."
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">NIF</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 5000123456"
                  value={nif}
                  onChange={(e) => setNif(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Email</label>
                  <input
                    type="email"
                    placeholder="contacto@empresa.ao"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Telefone</label>
                  <input
                    type="text"
                    placeholder="+244 923..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Província / Sede</label>
                <input
                  type="text"
                  placeholder="Ex: Luanda, Talatona"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalNova(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 flex items-center gap-1.5"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Registar Empresa</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Autenticacao Firebase Admin */}
      <FirebaseAuthModal
        isOpen={modalAuth}
        onClose={() => setModalAuth(false)}
        onSuccess={() => {
          refresh();
        }}
      />
    </div>
  );
};

// ============================
// EMPRESA DETALHE
// ============================
interface EmpresaDetalheProps {
  empresa: Empresa | null;
  onBack: () => void;
}

export const AdminEmpresaDetalhe: React.FC<EmpresaDetalheProps> = ({ empresa, onBack }) => {
  if (!empresa) {
    return (
      <div className="flex-1 p-8 text-center text-slate-400">
        <p>Nenhuma empresa selecionada.</p>
        <button onClick={onBack} className="mt-4 text-xs font-bold text-blue-600 underline">Voltar à lista</button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <AdminTopbar
        title={empresa.nome}
        subtitle={`NIF: ${empresa.nif} • ${empresa.provincia}`}
        actions={
          <button
            onClick={onBack}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-2 rounded-xl"
          >
            ← Voltar às Empresas
          </button>
        }
      />

      <div className="p-6 space-y-6">
        {/* Header Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-black text-xl border border-blue-100">
              {empresa.nome.charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">{empresa.nome}</h2>
              <p className="text-xs text-slate-500 flex items-center gap-3 mt-1">
                <span>NIF: <strong className="font-mono text-slate-700">{empresa.nif}</strong></span>
                <span>•</span>
                <span>Plano: <strong className="text-blue-600">{empresa.plano}</strong></span>
              </p>
            </div>
          </div>
          <StatusBadge status={empresa.status} />
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-blue-600" /> Email Institucional
            </span>
            <p className="text-xs font-bold text-slate-900">{empresa.email}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-600" /> Contacto Telefónico
            </span>
            <p className="text-xs font-bold text-slate-900 font-mono">{empresa.telefone}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-600" /> Localização / Sede
            </span>
            <p className="text-xs font-bold text-slate-900">{empresa.provincia}</p>
          </div>
        </div>

        {/* License Box */}
        <div className="bg-slate-950 text-white rounded-3xl p-6 shadow-xl space-y-3">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Chave de Licença Vinculada</p>
          <p className="font-mono text-xl font-black text-blue-400 tracking-wider">{empresa.licencaId}</p>
          <p className="text-xs text-slate-400">
            Computadores Ativados: <strong className="text-white">{empresa.computadores.atual} de {empresa.computadores.maximo}</strong>
          </p>
        </div>
      </div>
    </div>
  );
};
