import React, { useState } from 'react';
import {
  Users,
  BookOpen,
  DollarSign,
  MessageSquare,
  LogOut,
  TrendingUp,
  Search,
  Send,
  ChevronRight
} from 'lucide-react';
import { UserSession } from '../types/auth';
import { STUDENTS_DATA, CLASSROOMS_DATA } from '../data/school';
import { KivoraLogo } from '../components/KivoraLogo';
import { DashboardExecutive } from '../components/dashboard/DashboardExecutive';

interface AdminPortalProps {
  user: UserSession;
  onLogout: () => void;
}

type AdminTab = 'dashboard' | 'alunos' | 'turmas' | 'financas' | 'comunicados';

export const AdminPortal: React.FC<AdminPortalProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [comunicadoTitulo, setComunicadoTitulo] = useState('');
  const [comunicadoTexto, setComunicadoTexto] = useState('');
  const [comunicadoDestino, setComunicadoDestino] = useState('todos');
  const [comunicadoEnviado, setComunicadoEnviado] = useState(false);

  const filteredStudents = STUDENTS_DATA.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.grade.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.classRoom.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-brand-dark flex flex-col md:flex-row font-sans selection:bg-brand-green selection:text-white">
      
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 bg-slate-950 text-white flex flex-col justify-between shrink-0 shadow-xl border-r border-slate-800">
        <div>
          {/* Logo / School Brand with Official Logo */}
          <div className="p-6 border-b border-slate-800 flex items-center gap-3.5">
            <KivoraLogo size="sm" variant="white" />
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {[
              { id: 'dashboard', label: 'Dashboard & KPIs', icon: <TrendingUp className="w-4 h-4" /> },
              { id: 'alunos', label: 'Alunos & Matrículas', icon: <Users className="w-4 h-4" /> },
              { id: 'turmas', label: 'Turmas & Salas', icon: <BookOpen className="w-4 h-4" /> },
              { id: 'financas', label: 'Gestão Financeira', icon: <DollarSign className="w-4 h-4" /> },
              { id: 'comunicados', label: 'Mural de Comunicados', icon: <MessageSquare className="w-4 h-4" /> }
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as AdminTab)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-extrabold transition-all ${
                    isActive
                      ? 'bg-brand-green text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {tab.icon}
                    <span>{tab.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-white" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-800 bg-black/30">
          <div className="flex items-center gap-3 mb-3">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-brand-green"
            />
            <div className="overflow-hidden">
              <p className="text-xs font-extrabold text-white truncate">{user.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{user.title}</p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-red-500/20 text-slate-300 hover:text-red-400 text-xs font-bold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Terminar Sessão</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Topbar */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
              {user.schoolName || 'Kivora Angola'}
            </span>
            <h2 className="text-lg font-extrabold text-slate-900">
              {activeTab === 'dashboard' && 'Painel Executivo & Indicadores Estratégicos'}
              {activeTab === 'alunos' && 'Gestão de Alunos e Matrículas'}
              {activeTab === 'turmas' && 'Organização de Turmas e Salas'}
              {activeTab === 'financas' && 'Controlo de Faturação & Propinas'}
              {activeTab === 'comunicados' && 'Emissão de Comunicados Oficiais'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full text-emerald-700 text-xs font-extrabold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Ano Letivo 2024/2025 Activo</span>
            </div>
            
            <button
              onClick={onLogout}
              className="md:hidden p-2 text-slate-600 hover:text-red-500 rounded-lg"
              title="Sair"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Tab Content */}
        <div className="p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
          
          {/* ================= TAB 1: DASHBOARD EXECUTIVO COMPLETO ================= */}
          {activeTab === 'dashboard' && (
            <DashboardExecutive />
          )}

          {/* ================= TAB 2: ALUNOS & MATRÍCULAS ================= */}
          {activeTab === 'alunos' && (
            <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-6 space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Pesquisar por nome, classe ou turma..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-green outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-bold">
                    {filteredStudents.length} alunos cadastrados
                  </span>
                </div>
              </div>

              {/* Tabela de Alunos */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10px] font-extrabold uppercase text-slate-400">
                      <th className="py-3 px-4">Estudante</th>
                      <th className="py-3 px-4">Nº Matrícula</th>
                      <th className="py-3 px-4">Classe & Turma</th>
                      <th className="py-3 px-4">Encarregado</th>
                      <th className="py-3 px-4">Média Atual</th>
                      <th className="py-3 px-4">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredStudents.map((st) => (
                      <tr key={st.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 flex items-center gap-3">
                          <img src={st.photo} alt={st.name} className="w-8 h-8 rounded-full object-cover" />
                          <span className="font-extrabold text-slate-900">{st.name}</span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-500">#{st.id}092</td>
                        <td className="py-3 px-4 text-slate-700">{st.grade} • {st.classRoom}</td>
                        <td className="py-3 px-4 text-slate-500">{st.guardian}</td>
                        <td className="py-3 px-4">
                          <span className={`font-mono font-extrabold ${st.averageGrade && st.averageGrade >= 14 ? 'text-emerald-600' : 'text-slate-700'}`}>
                            {st.averageGrade ? `${st.averageGrade} v.` : 'Sem notas'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                            st.enrollmentStatus === 'Matriculado' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {st.enrollmentStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= TAB 3: TURMAS & SALAS ================= */}
          {activeTab === 'turmas' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {CLASSROOMS_DATA.map((c) => {
                  const percent = Math.round((c.studentCount / c.maxCapacity) * 100);
                  return (
                    <div key={c.id} className="bg-white rounded-2xl p-6 shadow-card border border-slate-100 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase">{c.shift}</span>
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                          percent >= 90 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {percent}% Ocupação
                        </span>
                      </div>
                      <div>
                        <h4 className="font-extrabold text-base text-slate-900">{c.name}</h4>
                        <p className="text-xs text-slate-500">{c.grade} • Sala {c.room}</p>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold text-slate-700">
                          <span>Vagas preenchidas</span>
                          <span className="font-mono">{c.studentCount} / {c.maxCapacity}</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${percent >= 90 ? 'bg-rose-500' : 'bg-brand-green'}`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= TAB 4: GESTÃO FINANCEIRA ================= */}
          {activeTab === 'financas' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl shadow-card border border-slate-100">
                  <span className="text-xs text-slate-400 font-bold uppercase">Total Arrecadado</span>
                  <p className="text-2xl font-black text-emerald-600 font-mono mt-1">48.500.000 Kz</p>
                  <p className="text-[10px] text-slate-400 mt-1">89.5% de cumprimento da meta</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-card border border-slate-100">
                  <span className="text-xs text-slate-400 font-bold uppercase">Propinas Pendentes</span>
                  <p className="text-2xl font-black text-rose-500 font-mono mt-1">5.700.000 Kz</p>
                  <p className="text-[10px] text-slate-400 mt-1">10.5% taxa de inadimplência</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-card border border-slate-100">
                  <span className="text-xs text-slate-400 font-bold uppercase">Previsão Anual</span>
                  <p className="text-2xl font-black text-slate-900 font-mono mt-1">580.000.000 Kz</p>
                  <p className="text-[10px] text-slate-400 mt-1">Ano Lectivo 2024/2025</p>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 5: COMUNICADOS ================= */}
          {activeTab === 'comunicados' && (
            <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-6 space-y-6 animate-fadeIn max-w-2xl">
              <h3 className="font-extrabold text-base text-slate-900">
                Emitir Novo Comunicado Oficial
              </h3>
              {comunicadoEnviado ? (
                <div className="p-4 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200">
                  Comunicado enviado com sucesso para todos os destinatários selecionados!
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setComunicadoEnviado(true);
                  }}
                  className="space-y-4 text-xs"
                >
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 uppercase">Título do Comunicado</label>
                    <input
                      type="text"
                      required
                      value={comunicadoTitulo}
                      onChange={(e) => setComunicadoTitulo(e.target.value)}
                      placeholder="Ex: Calendário das Provas Trimestrais"
                      className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-green outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 uppercase">Destinatários</label>
                    <select
                      value={comunicadoDestino}
                      onChange={(e) => setComunicadoDestino(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-brand-green outline-none"
                    >
                      <option value="todos">Toda a Comunidade Escolar (Professores, Alunos e Encarregados)</option>
                      <option value="professores">Apenas Professores</option>
                      <option value="encarregados">Apenas Encarregados de Educação</option>
                      <option value="alunos">Apenas Alunos</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 uppercase">Mensagem / Conteúdo</label>
                    <textarea
                      rows={4}
                      required
                      value={comunicadoTexto}
                      onChange={(e) => setComunicadoTexto(e.target.value)}
                      placeholder="Escreva a circular informativa..."
                      className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-green outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-brand-green hover:bg-brand-green-dark text-white font-extrabold rounded-xl shadow flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Publicar Circular</span>
                  </button>
                </form>
              )}
            </div>
          )}

        </div>

      </main>

    </div>
  );
};
