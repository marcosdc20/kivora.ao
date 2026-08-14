import React, { useState } from 'react';
import {
  Plus, Search, Key, CheckSquare,
  X, Copy, Ban, RotateCcw, Unlink, Trash2, Clock, CheckCircle2,
  Loader2, Building2
} from 'lucide-react';
import { AdminTopbar, StatusBadge } from './AdminComponents';
import { useLicenses, useCompanies } from './hooks/useFirebase';
import {
  createLicense, revokeLicense, reactivateLicense,
  releaseLicenseFromDevice, deleteLicense, extendLicenseExpiry,
  getPlanLabel, formatLicenseDate, calculateExpiresAt
} from './services/licenseService';
import { createClientAccount } from './services/authService';
import type { KivoraLicense, PlanType } from './types';

// ============================
// LICENÇAS — Lista em Tempo Real (Firebase)
// ============================
interface LicencasProps {
  onCriarLicenca: () => void;
}

export const AdminLicencas: React.FC<LicencasProps> = ({ onCriarLicenca }) => {
  const { licenses, loading } = useLicenses();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [extendModalKey, setExtendModalKey] = useState<string | null>(null);
  const [extendDays, setExtendDays] = useState<number>(30);

  const filtered = licenses.filter((l) => {
    const s = search.toLowerCase();
    const matchSearch =
      l.id.toLowerCase().includes(s) ||
      l.company_name.toLowerCase().includes(s) ||
      l.client_email.toLowerCase().includes(s) ||
      l.nif.includes(s);

    const isExpired = l.expires_at && l.expires_at < Date.now();
    const currentStatus = isExpired ? 'expired' : l.status;

    const matchStatus =
      filterStatus === 'todos' ||
      currentStatus === filterStatus ||
      (filterStatus === 'a_expirar' && l.expires_at && l.expires_at > Date.now() && l.expires_at - Date.now() < 30 * 86400000);

    return matchSearch && matchStatus;
  });

  const counts = {
    todos: licenses.length,
    active: licenses.filter(l => l.status === 'active' && (!l.expires_at || l.expires_at >= Date.now())).length,
    expired: licenses.filter(l => l.status === 'expired' || (l.expires_at && l.expires_at < Date.now())).length,
    revoked: licenses.filter(l => l.status === 'revoked').length,
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleRevoke = async (key: string) => {
    if (!confirm(`Tem certeza que deseja revogar a licença ${key}?`)) return;
    setActionLoading(key);
    try {
      await revokeLicense(key);
    } catch (e: any) {
      alert('Erro ao revogar licença: ' + e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReactivate = async (key: string) => {
    setActionLoading(key);
    try {
      await reactivateLicense(key);
    } catch (e: any) {
      alert('Erro ao reativar licença: ' + e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReleaseDevice = async (key: string) => {
    if (!confirm(`Desvincular o computador atual desta licença (${key})? O cliente poderá ativar num PC novo.`)) return;
    setActionLoading(key);
    try {
      await releaseLicenseFromDevice(key);
      alert('Dispositivo desvinculado com sucesso!');
    } catch (e: any) {
      alert('Erro ao desvincular dispositivo: ' + e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (key: string) => {
    if (!confirm(`APAGAR PERMANENTEMENTE a licença ${key} do Firebase?`)) return;
    setActionLoading(key);
    try {
      await deleteLicense(key);
    } catch (e: any) {
      alert('Erro ao apagar licença: ' + e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleExtendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!extendModalKey) return;
    setActionLoading(extendModalKey);
    try {
      await extendLicenseExpiry(extendModalKey, extendDays);
      setExtendModalKey(null);
    } catch (e: any) {
      alert('Erro ao estender validade: ' + e.message);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <AdminTopbar
        title="Gestão de Licenças (Firebase Cloud)"
        subtitle="Emissão e controlo em tempo real de licenças do software Kivora ERP"
        actions={
          <button
            onClick={onCriarLicenca}
            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-blue-600/20 transition-all"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            <span>Emitir Nova Licença</span>
          </button>
        }
      />

      <div className="p-6 space-y-5">
        {/* Stats Inline */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { id: 'todos', label: 'Todas as Licenças', count: counts.todos, color: 'text-slate-900' },
            { id: 'active', label: 'Ativas no Cloud', count: counts.active, color: 'text-emerald-600' },
            { id: 'expired', label: 'Expiradas', count: counts.expired, color: 'text-amber-600' },
            { id: 'revoked', label: 'Revogadas / Bloqueadas', count: counts.revoked, color: 'text-red-600' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilterStatus(item.id)}
              className={`rounded-2xl p-4 border text-left transition-all ${
                filterStatus === item.id
                  ? 'bg-slate-950 border-slate-950 text-white shadow-md'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <p className={`text-2xl font-black ${filterStatus === item.id ? 'text-white' : item.color}`}>{item.count}</p>
              <p className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${filterStatus === item.id ? 'text-slate-400' : 'text-slate-400'}`}>
                {item.label}
              </p>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" strokeWidth={1.75} />
            <input
              type="text"
              placeholder="Pesquisar chave KVRA, empresa, NIF ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-medium shadow-sm"
            />
          </div>

          <div className="text-xs text-slate-500 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Sincronizado com Firebase (faturasimples)</span>
          </div>
        </div>

        {/* Tabela de Licenças */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
              <p className="text-xs font-bold">A carregar licenças do Firebase Firestore...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Key className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-sm font-bold text-slate-600">Nenhuma licença encontrada</p>
              <p className="text-xs text-slate-400">Clique em "Emitir Nova Licença" para gerar uma chave real.</p>
            </div>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-slate-400 font-black uppercase text-[10px] tracking-wider text-left">
                  <th className="px-5 py-3.5">Chave da Licença</th>
                  <th className="px-4 py-3.5">Empresa / NIF</th>
                  <th className="px-4 py-3.5 hidden md:table-cell">Plano</th>
                  <th className="px-4 py-3.5">Estado</th>
                  <th className="px-4 py-3.5 hidden lg:table-cell">Validade</th>
                  <th className="px-4 py-3.5 hidden xl:table-cell">Dispositivo Vinculado</th>
                  <th className="text-right px-5 py-3.5">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((lic) => {
                  const isExpired = lic.expires_at && lic.expires_at < Date.now();
                  const effectiveStatus = isExpired ? 'expirada' : (lic.status === 'active' ? 'ativa' : 'suspensa');

                  return (
                    <tr key={lic.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <Key className="w-3.5 h-3.5 text-blue-600 shrink-0" strokeWidth={2} />
                          <span className="font-mono font-bold text-slate-900 text-xs tracking-wider select-all">{lic.id}</span>
                          <button
                            onClick={() => copyToClipboard(lic.id)}
                            className="p-1 text-slate-400 hover:text-blue-600 transition-colors rounded"
                            title="Copiar Chave"
                          >
                            {copiedKey === lic.id ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-bold text-slate-900">{lic.company_name}</p>
                        <p className="text-slate-400 text-[10px] font-mono">NIF: {lic.nif} • {lic.client_email}</p>
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        <span className="font-bold text-slate-800">{getPlanLabel(lic.plan_type)}</span>
                        {lic.extra_seats ? (
                          <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-bold ml-1">
                            +{lic.extra_seats} PC(s)
                          </span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={effectiveStatus} />
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 hidden lg:table-cell font-medium">
                        {formatLicenseDate(lic.expires_at)}
                      </td>
                      <td className="px-4 py-3.5 hidden xl:table-cell font-mono text-[11px] text-slate-500">
                        {lic.hardware_id ? (
                          <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                            {lic.hardware_id.substring(0, 14)}...
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Disponível p/ Ativação</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {lic.hardware_id && (
                            <button
                              onClick={() => handleReleaseDevice(lic.id)}
                              disabled={actionLoading === lic.id}
                              className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Desvincular Hardware ID (Troca de PC)"
                            >
                              <Unlink className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => setExtendModalKey(lic.id)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Estender Validade"
                          >
                            <Clock className="w-3.5 h-3.5" />
                          </button>
                          {lic.status === 'active' ? (
                            <button
                              onClick={() => handleRevoke(lic.id)}
                              disabled={actionLoading === lic.id}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Revogar Licença"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleReactivate(lic.id)}
                              disabled={actionLoading === lic.id}
                              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Reativar Licença"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(lic.id)}
                            disabled={actionLoading === lic.id}
                            className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            title="Apagar Definitivamente"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal Estender Validade */}
      {extendModalKey && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-fadeIn">
            <h3 className="text-base font-black text-slate-900">Estender Validade da Licença</h3>
            <p className="text-xs text-slate-500 font-mono">{extendModalKey}</p>

            <form onSubmit={handleExtendSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Dias a Adicionar</label>
                <select
                  value={extendDays}
                  onChange={(e) => setExtendDays(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-blue-500"
                >
                  <option value={7}>+ 7 Dias (1 Semana)</option>
                  <option value={15}>+ 15 Dias</option>
                  <option value={30}>+ 30 Dias (1 Mês)</option>
                  <option value={90}>+ 90 Dias (1 Trimestre)</option>
                  <option value={180}>+ 180 Dias (Semestral)</option>
                  <option value={365}>+ 365 Dias (1 Ano)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setExtendModalKey(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading !== null}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 flex items-center gap-1.5"
                >
                  {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Confirmar Extensão</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================
// CRIAR LICENÇA NO FIREBASE
// ============================
interface CriarLicencaProps {
  onBack: () => void;
}

export const AdminCriarLicenca: React.FC<CriarLicencaProps> = ({ onBack }) => {
  const { companies, addCompany } = useCompanies();
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyNif, setCompanyNif] = useState('');
  const [plan, setPlan] = useState<PlanType>('monthly');
  const [priceAoa, setPriceAoa] = useState<number>(25000);
  const [extraSeats, setExtraSeats] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdLicense, setCreatedLicense] = useState<KivoraLicense | null>(null);

  const handlePlanChange = (p: PlanType) => {
    setPlan(p);
    if (p === 'daily') setPriceAoa(5000);
    else if (p === 'weekly') setPriceAoa(10000);
    else if (p === 'biweekly') setPriceAoa(15000);
    else if (p === 'monthly') setPriceAoa(25000);
    else if (p === 'quarterly') setPriceAoa(70000);
    else if (p === 'semiannual') setPriceAoa(130000);
    else if (p === 'annual') setPriceAoa(250000);
    else if (p === 'quadrennial') setPriceAoa(800000);
    else if (p === 'lifetime') setPriceAoa(1500000);
  };

  const handleSelectCompany = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = companies.find(c => c.id === e.target.value);
    if (selected) {
      setCompanyName(selected.name);
      setCompanyNif(selected.nif);
      setEmail(selected.email);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !companyNif) {
      alert('Por favor informe o Nome da Empresa e o NIF.');
      return;
    }

    setLoading(true);
    try {
      const expiresAt = calculateExpiresAt(plan);
      const lic = await createLicense({
        client_email: email,
        company_name: companyName,
        nif: companyNif,
        plan_type: plan,
        expires_at: expiresAt,
        price_aoa: priceAoa,
        notes,
        extra_seats: extraSeats,
      });

      // Também adiciona à lista de empresas caso não exista
      const exists = companies.some(c => c.nif === companyNif);
      if (!exists) {
        await addCompany({
          name: companyName,
          nif: companyNif,
          email,
          phone: '',
          status: 'active',
        });
      }

      // Cria conta de acesso do cliente no Firebase
      await createClientAccount({
        email: email || `${companyNif}@kivora.ao`,
        name: companyName,
        nif: companyNif,
        licenseKey: lic.id,
      });

      setCreatedLicense(lic);
    } catch (err: any) {
      console.error('Erro ao gerar licença no Firebase:', err);
      alert('Erro ao gravar no Firebase: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (createdLicense) {
    return (
      <div className="flex-1 overflow-y-auto bg-slate-50">
        <AdminTopbar title="Licença Emitida no Firebase" />
        <div className="p-6 max-w-xl mx-auto pt-10 text-center space-y-6 animate-fadeIn">
          <div className="w-16 h-16 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
            <CheckSquare className="w-8 h-8 text-emerald-600" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-950">Chave de Licença Gravada no Firebase!</h2>
            <p className="text-xs text-slate-500 mt-1">O cliente já pode inserir esta chave no Kivora ERP para ativar online.</p>
          </div>
          <div className="bg-slate-950 text-white rounded-3xl p-6 space-y-3 shadow-xl">
            <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">Chave de Licença Oficial</p>
            <p className="font-mono text-2xl font-black text-blue-400 tracking-widest select-all">{createdLicense.id}</p>
            <button
              onClick={() => navigator.clipboard.writeText(createdLicense.id)}
              className="text-slate-400 hover:text-white text-xs font-bold flex items-center gap-1.5 mx-auto transition-colors bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl"
            >
              <Copy className="w-3.5 h-3.5" strokeWidth={2} />
              <span>Copiar Chave</span>
            </button>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 text-left space-y-2.5 text-xs shadow-sm">
            <div className="flex justify-between"><span className="text-slate-500">Empresa:</span><span className="font-bold text-slate-900">{createdLicense.company_name}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">NIF:</span><span className="font-bold text-slate-900 font-mono">{createdLicense.nif}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Plano:</span><span className="font-bold text-blue-600">{getPlanLabel(createdLicense.plan_type)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Validade:</span><span className="font-bold text-slate-900">{formatLicenseDate(createdLicense.expires_at)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Valor Cobrado:</span><span className="font-mono font-bold text-slate-900">{new Intl.NumberFormat('pt-AO').format(createdLicense.price_aoa || 0)} Kz</span></div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setCreatedLicense(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-3.5 rounded-2xl transition-all">
              Emitir Outra
            </button>
            <button onClick={onBack} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3.5 rounded-2xl shadow-lg shadow-blue-600/20 transition-all">
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
        title="Emitir Nova Licença Kivora"
        subtitle="Geração de chave oficial KVRA e sincronização direta no Firebase Firestore"
        actions={
          <button onClick={onBack} className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1.5 font-semibold transition-colors">
            <X className="w-3.5 h-3.5" strokeWidth={2} />
            <span>Cancelar</span>
          </button>
        }
      />

      <div className="p-6 max-w-2xl mx-auto">
        <form onSubmit={handleGenerate} className="bg-white rounded-3xl border border-slate-200 p-8 space-y-6 shadow-sm">

          {/* Selecionar Empresa Existente ou Nova */}
          {companies.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-600" strokeWidth={2} />
                Carregar Empresa Existente
              </label>
              <select
                onChange={handleSelectCompany}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 bg-slate-50 font-bold"
              >
                <option value="">— Selecionar da lista de clientes —</option>
                {companies.map(c => (
                  <option key={c.id} value={c.id}>{c.name} (NIF: {c.nif})</option>
                ))}
              </select>
            </div>
          )}

          {/* Dados da Empresa */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Nome da Empresa</label>
              <input
                type="text"
                required
                placeholder="Ex: Comercial Luanda, Lda."
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider">NIF da Empresa</label>
              <input
                type="text"
                required
                placeholder="Ex: 5417089123"
                value={companyNif}
                onChange={(e) => setCompanyNif(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-mono font-bold"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Email do Cliente</label>
            <input
              type="email"
              placeholder="cliente@empresa.ao"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
            />
          </div>

          {/* Plano + Preço */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Plano de Licenciamento</label>
              <select
                value={plan}
                onChange={(e) => handlePlanChange(e.target.value as PlanType)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 bg-white font-bold"
              >
                <option value="daily">Diária (1 Dia)</option>
                <option value="weekly">Semanal (7 Dias)</option>
                <option value="biweekly">Quinzenal (15 Dias)</option>
                <option value="monthly">Mensal (30 Dias)</option>
                <option value="quarterly">Trimestral (90 Dias)</option>
                <option value="semiannual">Semestral (180 Dias)</option>
                <option value="annual">Anual (365 Dias)</option>
                <option value="quadrennial">Quadrienal (4 Anos)</option>
                <option value="lifetime">Vitalício (Sem Expiração)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Preço em Kwanzas (Kz)</label>
              <input
                type="number"
                value={priceAoa}
                onChange={(e) => setPriceAoa(Number(e.target.value))}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-mono font-bold"
              />
            </div>
          </div>

          {/* Vagas Extra de PCs */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
              Terminais / Computadores Adicionais (Extra Seats)
            </label>
            <input
              type="number"
              min={0}
              max={50}
              value={extraSeats}
              onChange={(e) => setExtraSeats(Number(e.target.value) || 0)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-bold"
            />
            <p className="text-[11px] text-slate-400">Total de PCs autorizados: {1 + extraSeats} computador(es)</p>
          </div>

          {/* Notas */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Notas Internas</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Pagamento efetuado via Multicaixa Express ref #9821..."
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-none font-medium"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black text-xs py-4 rounded-2xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 disabled:bg-slate-300"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" strokeWidth={2} />}
            <span>{loading ? 'A Gravar no Firebase...' : 'Gerar Licença Oficial KIVORA'}</span>
          </button>

        </form>
      </div>
    </div>
  );
};
