import React, { useState } from 'react';
import {
  Plus, Search, Key, CheckSquare,
  X, Copy, Ban, RotateCcw, Unlink, Trash2, Clock, CheckCircle2,
  Loader2, Building2, Monitor, Users
} from 'lucide-react';
import { AdminTopbar, StatusBadge } from './AdminComponents';
import { useLicenses, useCompanies } from './hooks/useFirebase';
import { FirebaseAuthModal } from './components/FirebaseAuthModal';
import {
  createLicense, revokeLicense, reactivateLicense,
  releaseLicenseFromDevice, deleteLicense, extendLicenseExpiry, updateLicenseSeats,
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
  const { licenses, loading, error, refresh } = useLicenses();
  const [modalAuth, setModalAuth] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [extendModalKey, setExtendModalKey] = useState<string | null>(null);
  const [extendDays, setExtendDays] = useState<number>(30);

  // Estado para Gestão de Terminais / Postos Extras
  const [seatsModalLic, setSeatsModalLic] = useState<KivoraLicense | null>(null);
  const [newExtraSeats, setNewExtraSeats] = useState<number>(0);

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

  const handleOpenSeatsModal = (lic: KivoraLicense) => {
    setSeatsModalLic(lic);
    setNewExtraSeats(lic.extra_seats || 0);
  };

  const handleUpdateSeatsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seatsModalLic) return;
    setActionLoading(seatsModalLic.id);
    try {
      await updateLicenseSeats(seatsModalLic.id, newExtraSeats);
      setSeatsModalLic(null);
      alert(`Terminais atualizados com sucesso! A licença agora possui ${1 + newExtraSeats} postos de trabalho.`);
    } catch (err: any) {
      alert('Erro ao atualizar postos/terminais no Firebase: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <AdminTopbar
        title="Gestão de Licenças (Firebase Cloud)"
        subtitle="Emissão, aumento de terminais e controlo em tempo real de licenças do software Kivora ERP"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => refresh()}
              disabled={loading}
              className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-sm transition-all cursor-pointer"
              title="Recarregar dados do Firebase"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
              <span>Sincronizar</span>
            </button>
            <button
              onClick={onCriarLicenca}
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-blue-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              <span>Emitir Nova Licença</span>
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
              className={`rounded-2xl p-4 border text-left transition-all cursor-pointer ${
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
                  <th className="px-4 py-3.5 hidden md:table-cell">Plano & Terminais</th>
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
                  const totalSeats = 1 + (lic.extra_seats || 0);

                  return (
                    <tr key={lic.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <Key className="w-3.5 h-3.5 text-blue-600 shrink-0" strokeWidth={2} />
                          <span className="font-mono font-bold text-slate-900 text-xs tracking-wider select-all">{lic.id}</span>
                          <button
                            onClick={() => copyToClipboard(lic.id)}
                            className="p-1 text-slate-400 hover:text-blue-600 transition-colors rounded cursor-pointer"
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
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-slate-800">{getPlanLabel(lic.plan_type)}</span>
                          <button
                            onClick={() => handleOpenSeatsModal(lic)}
                            className="text-[10px] text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-full font-bold border border-blue-200 flex items-center gap-1 transition-all cursor-pointer"
                            title="Clique para Aumentar ou Alterar Terminais"
                          >
                            <Monitor className="w-3 h-3 text-blue-600" />
                            <span>{totalSeats} Posto(s)</span>
                          </button>
                        </div>
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
                          {/* AUMENTAR TERMINAIS / POSTOS */}
                          <button
                            onClick={() => handleOpenSeatsModal(lic)}
                            className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Aumentar / Configurar Terminais (Postos Extras)"
                          >
                            <Monitor className="w-3.5 h-3.5" />
                          </button>

                          {lic.hardware_id && (
                            <button
                              onClick={() => handleReleaseDevice(lic.id)}
                              disabled={actionLoading === lic.id}
                              className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                              title="Desvincular Hardware ID (Troca de PC)"
                            >
                              <Unlink className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => setExtendModalKey(lic.id)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Estender Validade"
                          >
                            <Clock className="w-3.5 h-3.5" />
                          </button>
                          {lic.status === 'active' ? (
                            <button
                              onClick={() => handleRevoke(lic.id)}
                              disabled={actionLoading === lic.id}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Revogar Licença"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleReactivate(lic.id)}
                              disabled={actionLoading === lic.id}
                              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                              title="Reativar Licença"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(lic.id)}
                            disabled={actionLoading === lic.id}
                            className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
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

      {/* MODAL: AUMENTAR / CONFIGURAR TERMINAIS E POSTOS DE TRABALHO */}
      {seatsModalLic && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <Monitor className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Aumentar Terminais / Postos</h3>
                  <p className="text-xs text-slate-500 font-mono">{seatsModalLic.company_name}</p>
                </div>
              </div>
              <button
                onClick={() => setSeatsModalLic(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateSeatsSubmit} className="space-y-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Chave da Licença:</span>
                  <span className="font-mono font-bold text-slate-900">{seatsModalLic.id}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Posto Base (Servidor/Caixa 1):</span>
                  <span className="font-bold text-emerald-600">1 Posto Incluído</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Postos Extras Atuais:</span>
                  <span className="font-bold text-slate-900">{seatsModalLic.extra_seats || 0} Adicional(is)</span>
                </div>
              </div>

              {/* Seletor de Novos Postos Extras */}
              <div className="space-y-2">
                <label className="font-bold text-slate-800 uppercase text-[11px] block">
                  Definir Novo Total de Postos Extras (Rede Local) *
                </label>
                
                {/* Botões Rápidos */}
                <div className="grid grid-cols-4 gap-2">
                  {[0, 1, 2, 3, 5, 8, 10, 15].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setNewExtraSeats(st)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        newExtraSeats === st
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      +{st} Posto{st === 1 ? '' : 's'}
                    </button>
                  ))}
                </div>

                {/* Input Numérico Manual */}
                <div className="pt-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={newExtraSeats}
                      onChange={(e) => setNewExtraSeats(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-blue-500 focus:bg-white"
                      placeholder="Outro número de postos..."
                    />
                    <span className="text-slate-500 font-bold whitespace-nowrap">Postos Extras</span>
                  </div>
                </div>
              </div>

              {/* Resumo do Total de Terminais */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-blue-900 tracking-wider block">
                    Capacidade Total Autorizada
                  </span>
                  <span className="text-base font-black text-blue-700">
                    {1 + newExtraSeats} Computador(es) em Rede Local
                  </span>
                </div>
                <Users className="w-6 h-6 text-blue-600" />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setSeatsModalLic(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading !== null}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 flex items-center gap-1.5 cursor-pointer"
                >
                  {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckSquare className="w-3.5 h-3.5" />}
                  <span>Salvar Terminais no Firebase</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading !== null}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 flex items-center gap-1.5 cursor-pointer"
                >
                  {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Confirmar Extensão</span>
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
