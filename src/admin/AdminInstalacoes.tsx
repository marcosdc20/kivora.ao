import React, { useState } from 'react';
import { Monitor, Search, Unlink } from 'lucide-react';
import { AdminTopbar, StatusBadge } from './AdminComponents';
import { useLicenses } from './hooks/useFirebase';
import { releaseLicenseFromDevice } from './services/licenseService';

export const AdminInstalacoes: React.FC = () => {
  const { licenses, loading } = useLicenses();
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Mapear licenças ativadas para o modelo de instalações
  const installations = licenses
    .filter(l => l.hardware_id)
    .map(l => ({
      id: l.id,
      licencaId: l.id,
      empresaNome: l.company_name,
      nomePC: `PC-${l.nif.slice(-4)}`,
      so: 'Windows 11 / 10 Pro',
      versao: 'v2026.08.14',
      ultimaAtividade: l.activated_at ? new Date(l.activated_at).toLocaleDateString('pt-AO') : 'Online Cloud',
      dataAtivacao: new Date(l.created_at).toLocaleDateString('pt-AO'),
      status: l.status === 'active' ? 'ativo' : 'bloqueado',
      hardwareId: l.hardware_id || '',
    }));

  const filtered = installations.filter(i =>
    i.nomePC.toLowerCase().includes(search.toLowerCase()) ||
    i.empresaNome.toLowerCase().includes(search.toLowerCase()) ||
    i.licencaId.toLowerCase().includes(search.toLowerCase()) ||
    i.hardwareId.toLowerCase().includes(search.toLowerCase())
  );

  const handleUnlink = async (key: string) => {
    if (!confirm(`Desvincular o computador vinculado à licença ${key}? O cliente poderá ativar num novo PC.`)) return;
    setActionLoading(key);
    try {
      await releaseLicenseFromDevice(key);
      alert('Computador desvinculado com sucesso no Firebase!');
    } catch (e: any) {
      alert('Erro ao desvincular: ' + e.message);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <AdminTopbar
        title="Instalações & Equipamentos Ativos"
        subtitle={`${installations.length} computadores vinculados com Hardware ID no Firebase`}
      />

      <div className="p-6 space-y-5">
        {/* Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar por nome do PC, empresa, chave de licença ou Hardware ID..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <p className="text-2xl font-black text-emerald-600">{installations.filter(i => i.status === 'ativo').length}</p>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">Computadores Ativos Online</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <p className="text-2xl font-black text-slate-900">{licenses.length - installations.length}</p>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">Licenças Disponíveis p/ Ativação</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <p className="text-2xl font-black text-red-600">{installations.filter(i => i.status === 'bloqueado').length}</p>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">Equipamentos Bloqueados</p>
          </div>
        </div>

        {/* Instalações Grid */}
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-xs font-bold">A carregar instalações ativas do Firebase...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
            <Monitor className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-bold text-slate-700">Nenhum computador ativado encontrado</p>
            <p className="text-xs text-slate-400">Os computadores são registados automaticamente quando o cliente insere a chave KVRA no Kivora ERP.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((inst) => (
              <div
                key={inst.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-blue-400/40 hover:shadow-md transition-all space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-blue-50 text-blue-600">
                      <Monitor className="w-5 h-5" strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="font-black text-slate-950 text-sm">{inst.nomePC}</p>
                      <p className="text-xs text-slate-500">{inst.empresaNome}</p>
                    </div>
                  </div>
                  <StatusBadge status={inst.status} />
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Chave Licença</span>
                    <span className="font-mono font-bold text-blue-600">{inst.licencaId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Hardware Fingerprint</span>
                    <span className="font-mono text-slate-700 text-[10px] truncate max-w-[150px]" title={inst.hardwareId}>
                      {inst.hardwareId}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Sistema Operativo</span>
                    <span className="font-semibold text-slate-700">{inst.so}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Data de Ativação</span>
                    <span className="font-mono text-slate-600">{inst.dataAtivacao}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => handleUnlink(inst.licencaId)}
                    disabled={actionLoading === inst.licencaId}
                    className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 py-2 rounded-xl transition-colors border border-amber-200"
                  >
                    <Unlink className="w-3.5 h-3.5" />
                    <span>Desvincular Computador (Troca de PC)</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
