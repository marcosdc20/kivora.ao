import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Shield, Key, Mail, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { AdminTopbar, StatCard } from './AdminComponents';
import { AdminUser } from './types';
import { db } from '../lib/firebase';
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { notify } from '../services/notificationService';
import { hashKivoraPassword } from './services/authService';

const NIVEL_BADGES: Record<string, { label: string; color: string }> = {
  super_admin: { label: 'Super Admin', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  financeiro: { label: 'Financeiro', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  suporte: { label: 'Suporte Técnico', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  gestor_parceiros: { label: 'Gestor Parceiros', color: 'bg-amber-50 text-amber-700 border-amber-200' },
};

export const AdminUtilizadores: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalNovo, setModalNovo] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [funcao, setFuncao] = useState('');
  const [nivel, setNivel] = useState<AdminUser['nivel']>('super_admin');

  // Sincronização em Tempo Real com Firestore (/admins e /users)
  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, 'admins'), (snapshot) => {
        const fireAdmins: AdminUser[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          fireAdmins.push({
            id: docSnap.id,
            nome: d.nome || d.name || 'Administrador',
            email: d.email || docSnap.id,
            funcao: d.funcao || d.role_label || 'Direção Executiva',
            nivel: (d.nivel || 'super_admin') as AdminUser['nivel'],
            status: d.status || 'ativo',
            ultimoAcesso: d.ultimoAcesso || 'Recente',
          });
        });

        if (fireAdmins.length === 0) {
          // Garante a exibição da conta mestre do sistema
          fireAdmins.push({
            id: 'admin-master',
            nome: 'Administrador Kivora',
            email: 'admin@kivora.ao',
            funcao: 'Administrador de Sistemas & Licenças',
            nivel: 'super_admin',
            status: 'ativo',
            ultimoAcesso: 'Hoje',
          });
        }

        setUsers(fireAdmins);
        setLoading(false);
      }, (err) => {
        console.warn('Erro ao escutar admins:', err);
        setLoading(false);
      });

      return () => unsub();
    } catch (e) {
      console.warn(e);
      setLoading(false);
    }
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !email) return;

    const uId = `admin_${Date.now()}`;
    const tempPassword = 'kivora' + Math.floor(1000 + Math.random() * 9000);

    try {
      const passwordHash = await hashKivoraPassword(tempPassword);

      await setDoc(doc(db, 'admins', uId), {
        nome: nome.trim(),
        email: email.toLowerCase().trim(),
        funcao: funcao.trim() || 'Membro da Equipa Executiva',
        nivel,
        status: 'ativo',
        created_at: Date.now()
      }, { merge: true });

      await setDoc(doc(db, 'users', email.toLowerCase().trim()), {
        nome: nome.trim(),
        email: email.toLowerCase().trim(),
        role: 'admin',
        passwordHash,
        mustChangePassword: true,
        status: 'ativo',
        created_at: Date.now()
      }, { merge: true });

      setModalNovo(false);
      setNome('');
      setEmail('');
      setFuncao('');
      notify.success(`Administrador ${nome} registado com sucesso! Senha temporária gerada: ${tempPassword}`);
    } catch (err: any) {
      notify.error('Erro ao registar administrador no Firebase: ' + err.message);
    }
  };

  return (
    <div className="w-full min-w-0 flex flex-col font-sans pb-12">
      <AdminTopbar
        title="Gestão de Administradores & Permissões"
        subtitle="Controlo de utilizadores da equipa interna Kivora e perfis de acesso (RBAC)"
        actions={
          <button
            onClick={() => setModalNovo(true)}
            className="flex items-center gap-2 bg-[#1746A2] hover:bg-[#1E40AF] text-white font-semibold font-display text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-blue-900/20 cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-white" strokeWidth={2.5} />
            <span className="text-white font-bold">Novo Administrador</span>
          </button>
        }
      />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Total Administradores"
            value={users.length.toString()}
            icon={<Users className="w-4 h-4" strokeWidth={2} />}
            iconBg="bg-brand-50 text-brand-600"
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
        <div className="surface-card rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-200/80 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-950 text-sm font-display tracking-tight">Administradores do Painel Kivora</h3>
              <p className="text-slate-500 text-xs mt-0.5 font-sans">Membros da equipa com credenciais autorizadas</p>
            </div>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-xs min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/80 text-slate-500 font-semibold uppercase text-[11px] tracking-wider text-left font-display">
                <th className="px-5 py-3.5">Nome / E-mail</th>
                <th className="px-4 py-3.5">Cargo / Função</th>
                <th className="px-4 py-3.5">Nível de Acesso</th>
                <th className="px-4 py-3.5">Último Acesso</th>
                <th className="px-4 py-3.5 text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 font-sans">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-brand-600" />
                    <span>A carregar administradores do Firebase...</span>
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const badge = NIVEL_BADGES[u.nivel];
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-950 text-white font-bold text-xs flex items-center justify-center font-display">
                            {u.nome.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 font-display">{u.nome}</p>
                            <p className="text-slate-400 text-[11px] flex items-center gap-1 font-sans">
                              <Mail className="w-3 h-3 text-slate-400" /> {u.email}
                            </p>
                          </div>
                        </div>
                      </td>
                    <td className="px-4 py-3.5 text-slate-700 font-medium font-sans">{u.funcao}</td>
                    <td className="px-4 py-3.5">
                      <span className={`text-[10px] font-semibold uppercase tracking-wider font-display px-2.5 py-1 rounded-full border ${badge.color}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 font-mono-num">{u.ultimoAcesso}</td>
                    <td className="px-4 py-3.5 text-right">
                      {u.status === 'ativo' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold font-display bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 text-[10px] uppercase tracking-wider">
                          <CheckCircle className="w-3 h-3 text-emerald-600" /> Ativo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-500 font-semibold font-display bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200 text-[10px] uppercase tracking-wider">
                          <XCircle className="w-3 h-3 text-slate-400" /> Inativo
                        </span>
                      )}
                    </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          </div>
        </div>
      </div>

      {/* Modal Add Admin User */}
      {modalNovo && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-scaleUp">
            <h3 className="text-lg font-black text-slate-950 font-display tracking-tight">Novo Administrador Kivora</h3>

            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 uppercase font-display">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Carlos Alberto"
                  className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white font-medium transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 uppercase font-display">E-mail Corporativo</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="carlos@kivora.ao"
                  className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white font-medium transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 uppercase font-display">Cargo / Função</label>
                <input
                  type="text"
                  value={funcao}
                  onChange={(e) => setFuncao(e.target.value)}
                  placeholder="Ex: Especialista de Suporte AGT"
                  className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white font-medium transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 uppercase font-display">Nível de Permissão (RBAC)</label>
                <select
                  value={nivel}
                  onChange={(e) => setNivel(e.target.value as any)}
                  className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-brand-500 font-semibold font-display cursor-pointer"
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
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold font-display text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold font-display bg-[#1746A2] hover:bg-[#1E40AF] text-white shadow-md shadow-blue-900/20 transition-all cursor-pointer"
                >
                  <span className="text-white font-bold">Criar Credenciais</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
