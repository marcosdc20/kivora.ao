import React, { useState } from 'react';
import { Users, UserPlus, Shield, Key, Mail, CheckCircle, XCircle } from 'lucide-react';
import { AdminTopbar, StatCard } from './AdminComponents';
import { MOCK_ADMIN_USERS } from './mockData';
import { AdminUser } from './types';

const NIVEL_BADGES: Record<string, { label: string; color: string }> = {
  super_admin: { label: 'Super Admin', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  financeiro: { label: 'Financeiro', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  suporte: { label: 'Suporte Técnico', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  gestor_parceiros: { label: 'Gestor Parceiros', color: 'bg-amber-50 text-amber-700 border-amber-200' },
};

export const AdminUtilizadores: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>(MOCK_ADMIN_USERS);
  const [modalNovo, setModalNovo] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [funcao, setFuncao] = useState('');
  const [nivel, setNivel] = useState<AdminUser['nivel']>('suporte');

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !email) return;

    const newU: AdminUser = {
      id: `u-${Date.now()}`,
      nome,
      email,
      funcao: funcao || 'Membro da Equipa',
      nivel,
      status: 'ativo',
      ultimoAcesso: 'Nunca',
    };

    setUsers([...users, newU]);
    setModalNovo(false);
    setNome('');
    setEmail('');
    setFuncao('');
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <AdminTopbar
        title="Gestão de Administradores & Permissões"
        subtitle="Controlo de utilizadores da equipa interna Kivora e perfis de acesso (RBAC)"
        actions={
          <button
            onClick={() => setModalNovo(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-blue-600/20"
          >
            <UserPlus className="w-4 h-4" strokeWidth={2.5} />
            Novo Administrador
          </button>
        }
      />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Total Administradores"
            value={users.length.toString()}
            icon={<Users className="w-4 h-4" strokeWidth={2} />}
            iconBg="bg-blue-50 text-blue-600"
            sub="Equipa ativa"
          />
          <StatCard
            label="Super Admins"
            value={users.filter((u) => u.nivel === 'super_admin').length.toString()}
            icon={<Shield className="w-4 h-4" strokeWidth={2} />}
            iconBg="bg-purple-50 text-purple-600"
            sub="Acesso total ao sistema"
          />
          <StatCard
            label="Sessões Ativas Hoje"
            value="4"
            icon={<Key className="w-4 h-4" strokeWidth={2} />}
            iconBg="bg-emerald-50 text-emerald-600"
            sub="Logins validados"
            subColor="green"
          />
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Administradores do Painel Kivora</h3>
              <p className="text-slate-500 text-xs mt-0.5">Membros da equipa com credenciais autorizadas</p>
            </div>
          </div>

          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-slate-400 font-black uppercase text-[10px] tracking-wider text-left">
                <th className="px-5 py-3.5">Nome / E-mail</th>
                <th className="px-4 py-3.5">Cargo / Função</th>
                <th className="px-4 py-3.5">Nível de Acesso</th>
                <th className="px-4 py-3.5">Último Acesso</th>
                <th className="px-4 py-3.5 text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => {
                const badge = NIVEL_BADGES[u.nivel];
                return (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-black text-xs flex items-center justify-center">
                          {u.nome.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{u.nome}</p>
                          <p className="text-slate-400 text-[11px] flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" /> {u.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-700 font-semibold">{u.funcao}</td>
                    <td className="px-4 py-3.5">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${badge.color}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 font-mono">{u.ultimoAcesso}</td>
                    <td className="px-4 py-3.5 text-right">
                      {u.status === 'ativo' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[10px]">
                          <CheckCircle className="w-3 h-3" /> Ativo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 text-[10px]">
                          <XCircle className="w-3 h-3" /> Inativo
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Admin User */}
      {modalNovo && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-fadeIn">
            <h3 className="text-lg font-black text-slate-900">Novo Administrador Kivora</h3>

            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Carlos Alberto"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">E-mail Corporativo</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="carlos@kivora.ao"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Cargo / Função</label>
                <input
                  type="text"
                  value={funcao}
                  onChange={(e) => setFuncao(e.target.value)}
                  placeholder="Ex: Especialista de Suporte AGT"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Nível de Permissão (RBAC)</label>
                <select
                  value={nivel}
                  onChange={(e) => setNivel(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-bold"
                >
                  <option value="super_admin">Super Admin (Acesso Total)</option>
                  <option value="financeiro">Financeiro & Pagamentos</option>
                  <option value="suporte">Suporte Técnico & Licenças</option>
                  <option value="gestor_parceiros">Gestor de Parceiros</option>
                </select>
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
                  Criar Credenciais
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
