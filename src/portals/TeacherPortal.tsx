import React, { useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  CheckSquare,
  Calendar,
  LogOut,
  Clock,
  Save,
  CheckCircle2,
  ChevronRight,
  UserCheck,
  UserX,
  AlertCircle
} from 'lucide-react';
import { UserSession } from '../types/auth';
import { STUDENTS_DATA, CLASSROOMS_DATA } from '../data/school';

interface TeacherPortalProps {
  user: UserSession;
  onLogout: () => void;
}

type TeacherTab = 'turmas' | 'notas' | 'presencas' | 'horario';

export const TeacherPortal: React.FC<TeacherPortalProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<TeacherTab>('notas');
  const [selectedClass, setSelectedClass] = useState<string>('10ª Classe – Turma A');
  const [selectedSubject, setSelectedSubject] = useState<string>('Física');
  
  // Notas editáveis em estado local
  const [gradesState, setGradesState] = useState<Record<string, { tri1: number; tri2: number; tri3: number }>>({
    'aluno-001': { tri1: 17.5, tri2: 18.0, tri3: 17.0 },
    'aluno-003': { tri1: 18.5, tri2: 19.0, tri3: 19.0 },
    'aluno-005': { tri1: 16.0, tri2: 16.5, tri3: 17.0 },
    'aluno-002': { tri1: 15.0, tri2: 14.5, tri3: 16.0 },
    'aluno-004': { tri1: 13.0, tri2: 12.5, tri3: 13.5 },
    'aluno-006': { tri1: 14.0, tri2: 15.0, tri3: 15.0 },
  });

  const [attendanceState, setAttendanceState] = useState<Record<string, 'present' | 'absent' | 'justified'>>({
    'aluno-001': 'present',
    'aluno-003': 'present',
    'aluno-005': 'present',
    'aluno-002': 'present',
    'aluno-004': 'absent',
    'aluno-006': 'justified',
  });

  const [saveNotesSuccess, setSaveNotesSuccess] = useState(false);
  const [saveAttendanceSuccess, setSaveAttendanceSuccess] = useState(false);

  const handleGradeChange = (studentId: string, trimester: 'tri1' | 'tri2' | 'tri3', val: number) => {
    const clamped = Math.max(0, Math.min(20, val));
    setGradesState((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { tri1: 10, tri2: 10, tri3: 10 }),
        [trimester]: clamped,
      }
    }));
  };

  const handleAttendanceChange = (studentId: string, status: 'present' | 'absent' | 'justified') => {
    setAttendanceState((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const markAllPresent = () => {
    const updated: Record<string, 'present'> = {};
    STUDENTS_DATA.forEach((s) => {
      updated[s.id] = 'present';
    });
    setAttendanceState(updated);
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-brand-dark flex flex-col md:flex-row font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 bg-brand-dark text-white flex flex-col justify-between shrink-0 shadow-xl border-r border-gray-800">
        <div>
          {/* Logo / Brand */}
          <div className="p-6 border-b border-gray-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-md">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight leading-none text-white">
                Kivora Docente
              </h1>
              <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider mt-1 block">
                Portal do Gestor / Docente
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {[
              { id: 'notas', label: 'Lançamento de Notas', icon: <BookOpen className="w-4 h-4" /> },
              { id: 'presencas', label: 'Folha de Presenças', icon: <CheckSquare className="w-4 h-4" /> },
              { id: 'turmas', label: 'Minhas Turmas', icon: <GraduationCap className="w-4 h-4" /> },
              { id: 'horario', label: 'Horário Semanal', icon: <Calendar className="w-4 h-4" /> }
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TeacherTab)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-extrabold transition-all ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
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
        <div className="p-4 border-t border-gray-800 bg-black/20">
          <div className="flex items-center gap-3 mb-3">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-purple-500"
            />
            <div className="overflow-hidden">
              <p className="text-xs font-extrabold text-white truncate">{user.name}</p>
              <p className="text-[10px] text-gray-400 truncate">{user.title}</p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-red-500/20 text-gray-300 hover:text-red-400 text-xs font-bold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Terminar Sessão</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">
              {user.schoolName || 'Kivora Angola'}
            </span>
            <h2 className="text-lg font-extrabold text-brand-dark">
              {activeTab === 'notas' && 'Pauta de Avaliação Contínua e Notas'}
              {activeTab === 'presencas' && 'Registo Diário de Chamada e Presenças'}
              {activeTab === 'turmas' && 'Painel das Minhas Turmas Atribuídas'}
              {activeTab === 'horario' && 'Grelha de Horário e Salas de Aula'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-purple-50 px-3 py-1.5 rounded-full text-purple-700 text-xs font-extrabold">
              <span>Trimestre Actual: 1º Trimestre</span>
            </div>
            
            <button
              onClick={onLogout}
              className="md:hidden p-2 text-gray-600 hover:text-red-500 rounded-lg"
              title="Sair"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Body Container */}
        <div className="p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
          
          {/* ================= TAB: LANÇAMENTO DE NOTAS ================= */}
          {activeTab === 'notas' && (
            <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 space-y-6 animate-fadeIn">
              
              {/* Selectors Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-100">
                <div className="flex flex-wrap items-center gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Turma</label>
                    <select
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-brand-dark bg-gray-50 focus:ring-2 focus:ring-purple-500 outline-none"
                    >
                      <option value="10ª Classe – Turma A">10ª Classe – Turma A</option>
                      <option value="8ª Classe – Turma B">8ª Classe – Turma B</option>
                      <option value="12ª Classe – Turma A">12ª Classe – Turma A</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Disciplina</label>
                    <select
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-brand-dark bg-gray-50 focus:ring-2 focus:ring-purple-500 outline-none"
                    >
                      <option value="Física">Física</option>
                      <option value="Matemática">Matemática</option>
                      <option value="Química">Química</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSaveNotesSuccess(true);
                    setTimeout(() => setSaveNotesSuccess(false), 3000);
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold px-5 py-2.5 rounded-xl shadow transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Notas da Pauta</span>
                </button>
              </div>

              {saveNotesSuccess && (
                <div className="p-3 bg-green-50 text-green-800 rounded-xl text-xs font-bold text-center border border-green-200 flex items-center justify-center gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>Notas guardadas e calculadas com sucesso no sistema!</span>
                </div>
              )}

              {/* Grades Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-purple-50/60 text-purple-900 font-extrabold uppercase text-[10px] border-b border-purple-100">
                    <tr>
                      <th className="py-3 px-4">Estudante</th>
                      <th className="py-3 px-4 text-center">1º Trimestre (0-20)</th>
                      <th className="py-3 px-4 text-center">2º Trimestre (0-20)</th>
                      <th className="py-3 px-4 text-center">3º Trimestre (0-20)</th>
                      <th className="py-3 px-4 text-center">Média Final</th>
                      <th className="py-3 px-4 text-center">Situação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {STUDENTS_DATA.map((st) => {
                      const g = gradesState[st.id] || { tri1: 10, tri2: 10, tri3: 10 };
                      const avg = Number(((g.tri1 + g.tri2 + g.tri3) / 3).toFixed(1));
                      const isApproved = avg >= 10;

                      return (
                        <tr key={st.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="py-3 px-4 flex items-center gap-3">
                            <img src={st.photo} alt={st.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                            <div>
                              <span className="font-extrabold text-brand-dark block">{st.name}</span>
                              <span className="text-[10px] text-gray-400">Nº {st.id}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <input
                              type="number"
                              min="0"
                              max="20"
                              step="0.5"
                              value={g.tri1}
                              onChange={(e) => handleGradeChange(st.id, 'tri1', parseFloat(e.target.value) || 0)}
                              className="w-16 px-2 py-1 text-center font-mono font-bold border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                            />
                          </td>
                          <td className="py-3 px-4 text-center">
                            <input
                              type="number"
                              min="0"
                              max="20"
                              step="0.5"
                              value={g.tri2}
                              onChange={(e) => handleGradeChange(st.id, 'tri2', parseFloat(e.target.value) || 0)}
                              className="w-16 px-2 py-1 text-center font-mono font-bold border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                            />
                          </td>
                          <td className="py-3 px-4 text-center">
                            <input
                              type="number"
                              min="0"
                              max="20"
                              step="0.5"
                              value={g.tri3}
                              onChange={(e) => handleGradeChange(st.id, 'tri3', parseFloat(e.target.value) || 0)}
                              className="w-16 px-2 py-1 text-center font-mono font-bold border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                            />
                          </td>
                          <td className="py-3 px-4 text-center font-mono font-black text-sm">
                            <span className={isApproved ? 'text-green-600' : 'text-red-600'}>
                              {avg}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                              isApproved ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {isApproved ? 'Apto / Positivo' : 'Recurso / Negativo'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* ================= TAB: FOLHA DE CHAMADA ================= */}
          {activeTab === 'presencas' && (
            <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 space-y-6 animate-fadeIn">
              
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 font-bold">
                    <Clock className="w-4 h-4 text-purple-600" />
                    <span>Data: {new Date().toLocaleDateString('pt-AO')} (Aula de Hoje)</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={markAllPresent}
                    className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors"
                  >
                    Marcar Todos Presentes
                  </button>
                  <button
                    onClick={() => {
                      setSaveAttendanceSuccess(true);
                      setTimeout(() => setSaveAttendanceSuccess(false), 3000);
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold px-5 py-2 rounded-xl shadow transition-all flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>Submeter Chamada</span>
                  </button>
                </div>
              </div>

              {saveAttendanceSuccess && (
                <div className="p-3 bg-green-50 text-green-800 rounded-xl text-xs font-bold text-center border border-green-200">
                  Presenças do dia registadas com sucesso no histórico da turma!
                </div>
              )}

              <div className="space-y-2">
                {STUDENTS_DATA.map((st) => {
                  const status = attendanceState[st.id] || 'present';
                  return (
                    <div key={st.id} className="flex items-center justify-between p-3.5 rounded-xl bg-brand-bg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <img src={st.photo} alt={st.name} className="w-9 h-9 rounded-full object-cover" />
                        <div>
                          <p className="font-extrabold text-xs text-brand-dark">{st.name}</p>
                          <p className="text-[10px] text-gray-400">{st.grade} • {st.classRoom}</p>
                        </div>
                      </div>

                      {/* Status Selector Buttons */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleAttendanceChange(st.id, 'present')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1 transition-all ${
                            status === 'present'
                              ? 'bg-green-600 text-white shadow-sm'
                              : 'bg-white text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Presente</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleAttendanceChange(st.id, 'absent')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1 transition-all ${
                            status === 'absent'
                              ? 'bg-red-600 text-white shadow-sm'
                              : 'bg-white text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <UserX className="w-3.5 h-3.5" />
                          <span>Falta</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleAttendanceChange(st.id, 'justified')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1 transition-all ${
                            status === 'justified'
                              ? 'bg-amber-500 text-white shadow-sm'
                              : 'bg-white text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Justificada</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* ================= TAB: MINHAS TURMAS ================= */}
          {activeTab === 'turmas' && (
            <div className="grid sm:grid-cols-2 gap-6 animate-fadeIn">
              {CLASSROOMS_DATA.slice(0, 2).map((cls) => (
                <div key={cls.id} className="bg-white rounded-2xl p-6 shadow-card border border-gray-100 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <div>
                      <h4 className="font-extrabold text-base text-brand-dark">{cls.name}</h4>
                      <p className="text-xs text-purple-600 font-bold">Minha Disciplina: Física</p>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 bg-purple-50 text-purple-700 rounded-full">
                      {cls.shift}
                    </span>
                  </div>

                  <p className="text-xs text-brand-body">
                    Sala: <strong>{cls.room}</strong> • Total de Estudantes: <strong>{cls.studentCount} Alunos</strong>
                  </p>

                  <div className="p-3 bg-brand-bg rounded-xl text-xs space-y-1">
                    <p className="font-bold text-brand-dark">Próxima Aula:</p>
                    <p className="text-gray-500">Quarta-feira, 08h30 – 10h00 (Laboratório 2)</p>
                  </div>

                  <button
                    onClick={() => setActiveTab('notas')}
                    className="w-full py-2.5 text-xs font-extrabold text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors"
                  >
                    Abrir Pauta de Notas Desta Turma
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ================= TAB: HORÁRIO ================= */}
          {activeTab === 'horario' && (
            <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 space-y-4 animate-fadeIn">
              <h3 className="font-extrabold text-base text-brand-dark pb-3 border-b border-gray-100">
                Meu Horário Semanal de Aulas
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
                {[
                  { dia: 'Segunda-feira', aulas: ['07h30 – 10ª A (Física)', '09h30 – 8ª B (Matemática)'] },
                  { dia: 'Terça-feira', aulas: ['08h00 – 12ª A (Física Experimental)', '10h30 – 10ª A (Exercícios)'] },
                  { dia: 'Quarta-feira', aulas: ['07h30 – 10ª A (Física)', '11h00 – Reunião Pedagógica'] },
                  { dia: 'Quinta-feira', aulas: ['08h30 – 8ª B (Matemática)', '10h30 – 12ª A (Física)'] },
                  { dia: 'Sexta-feira', aulas: ['07h30 – 10ª A (Avaliação)', '09h30 – Plantão de Dúvidas'] },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-brand-bg border border-gray-100 space-y-2">
                    <p className="font-extrabold text-purple-700 uppercase tracking-wider text-[11px] pb-1 border-b border-gray-200">
                      {item.dia}
                    </p>
                    {item.aulas.map((a, i) => (
                      <p key={i} className="text-[11px] text-brand-dark font-medium bg-white p-2 rounded-lg shadow-sm border border-gray-100">
                        {a}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </main>

    </div>
  );
};
