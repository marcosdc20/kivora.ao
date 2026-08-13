import React, { useState } from 'react';
import {
  BookOpen,
  Calendar,
  Award,
  CheckCircle2,
  LogOut,
  Download,
  Clock,
  ChevronRight,
  TrendingUp,
  FileCheck
} from 'lucide-react';
import { UserSession } from '../types/auth';

interface StudentPortalProps {
  user: UserSession;
  onLogout: () => void;
}

type StudentTab = 'boletim' | 'presencas' | 'horario' | 'avisos';

export const StudentPortal: React.FC<StudentPortalProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<StudentTab>('boletim');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const subjectsGrades = [
    { subject: 'Matemática', tri1: 18.0, tri2: 17.5, tri3: 18.0, teacher: 'Prof. Adelino Costa' },
    { subject: 'Física', tri1: 17.5, tri2: 18.0, tri3: 17.0, teacher: 'Prof. Ricardo Sousa' },
    { subject: 'Química', tri1: 17.0, tri2: 16.5, tri3: 17.5, teacher: 'Prof. Ricardo Sousa' },
    { subject: 'Língua Portuguesa', tri1: 18.5, tri2: 19.0, tri3: 18.5, teacher: 'Profª. Cátia Mendes' },
    { subject: 'História', tri1: 16.0, tri2: 17.0, tri3: 16.5, teacher: 'Prof. Manuel Dias' },
    { subject: 'Geografia', tri1: 17.0, tri2: 17.5, tri3: 18.0, teacher: 'Profª. Isabel Garcia' },
    { subject: 'Língua Inglesa', tri1: 19.0, tri2: 19.5, tri3: 19.0, teacher: 'Prof. John Miller' },
  ];

  const averageTotal = (
    subjectsGrades.reduce((sum, s) => sum + (s.tri1 + s.tri2 + s.tri3) / 3, 0) / subjectsGrades.length
  ).toFixed(1);

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-brand-dark flex flex-col md:flex-row font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 bg-brand-dark text-white flex flex-col justify-between shrink-0 shadow-xl border-r border-gray-800">
        <div>
          {/* Logo / Brand */}
          <div className="p-6 border-b border-gray-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight leading-none text-white">
                Kivora Aluno
              </h1>
              <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider mt-1 block">
                Portal do Estudante
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {[
              { id: 'boletim', label: 'Meu Boletim de Notas', icon: <Award className="w-4 h-4" /> },
              { id: 'presencas', label: 'Minhas Presenças', icon: <TrendingUp className="w-4 h-4" /> },
              { id: 'horario', label: 'Horário de Aulas', icon: <Calendar className="w-4 h-4" /> },
              { id: 'avisos', label: 'Avisos & Tarefas', icon: <FileCheck className="w-4 h-4" /> }
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as StudentTab)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-extrabold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md'
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
              className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
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
              {user.grade} • {user.classRoom}
            </span>
            <h2 className="text-lg font-extrabold text-brand-dark">
              {activeTab === 'boletim' && 'Boletim Oficial de Avaliações'}
              {activeTab === 'presencas' && 'Histórico de Frequência e Assiduidade'}
              {activeTab === 'horario' && 'Horário e Cronograma de Aulas'}
              {activeTab === 'avisos' && 'Mural de Avisos e Tarefas de Casa'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full text-blue-700 text-xs font-extrabold">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Matrícula Regularizada</span>
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

        {/* Content Body */}
        <div className="p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
          
          {/* ================= TAB 1: MEU BOLETIM ================= */}
          {activeTab === 'boletim' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Honor Card Banner */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
                <div className="space-y-2 z-10 text-center sm:text-left">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-blue-100 text-xs font-extrabold uppercase backdrop-blur">
                    <Award className="w-4 h-4 text-brand-gold fill-brand-gold" />
                    Quadro de Honra & Mérito Escolar
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold">
                    Parabéns pelo seu desempenho, {user.name.split(' ')[0]}!
                  </h3>
                  <p className="text-xs sm:text-sm text-blue-100 max-w-md">
                    Você está entre os melhores alunos da {user.grade}. Continue com a dedicação nos estudos.
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur rounded-2xl p-5 border border-white/20 text-center shrink-0 z-10">
                  <span className="text-[11px] uppercase font-bold text-blue-200 block">Média Geral Ponderada</span>
                  <span className="text-4xl font-black font-mono text-white block mt-1">{averageTotal}</span>
                  <span className="text-[10px] text-green-300 font-bold block mt-0.5">Escala de 0 a 20 valores</span>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-extrabold text-brand-dark">Pauta de Notas por Disciplina</h4>
                <button
                  onClick={() => {
                    setDownloadSuccess(true);
                    setTimeout(() => setDownloadSuccess(false), 3500);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-brand-dark hover:bg-black text-white text-xs font-extrabold rounded-xl shadow transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar Boletim em PDF</span>
                </button>
              </div>

              {downloadSuccess && (
                <div className="p-3 bg-blue-50 text-blue-800 rounded-xl text-xs font-bold text-center border border-blue-200 animate-fadeIn">
                  O boletim escolar oficial foi gerado com sucesso para impressão/download!
                </div>
              )}

              {/* Grades Table */}
              <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-brand-bg text-gray-500 font-extrabold uppercase text-[10px] border-b border-gray-100">
                      <tr>
                        <th className="py-3 px-4">Disciplina</th>
                        <th className="py-3 px-4">Professor(a)</th>
                        <th className="py-3 px-4 text-center">1º Trimestre</th>
                        <th className="py-3 px-4 text-center">2º Trimestre</th>
                        <th className="py-3 px-4 text-center">3º Trimestre</th>
                        <th className="py-3 px-4 text-center">Média Final</th>
                        <th className="py-3 px-4 text-center">Situação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium">
                      {subjectsGrades.map((s, idx) => {
                        const finalAvg = Number(((s.tri1 + s.tri2 + s.tri3) / 3).toFixed(1));
                        return (
                          <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                            <td className="py-3.5 px-4 font-extrabold text-brand-dark">{s.subject}</td>
                            <td className="py-3.5 px-4 text-gray-500">{s.teacher}</td>
                            <td className="py-3.5 px-4 text-center font-mono font-bold">{s.tri1}</td>
                            <td className="py-3.5 px-4 text-center font-mono font-bold">{s.tri2}</td>
                            <td className="py-3.5 px-4 text-center font-mono font-bold">{s.tri3}</td>
                            <td className="py-3.5 px-4 text-center font-mono font-black text-sm text-brand-green">
                              {finalAvg}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-green-100 text-green-700">
                                Aprovada
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ================= TAB 2: PRESENÇAS ================= */}
          {activeTab === 'presencas' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100">
                  <span className="text-xs text-gray-400 font-bold uppercase block mb-1">Taxa de Assiduidade</span>
                  <span className="text-3xl font-black text-brand-green font-mono">98%</span>
                  <span className="text-[11px] text-gray-500 block mt-1">Presença exemplar</span>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100">
                  <span className="text-xs text-gray-400 font-bold uppercase block mb-1">Faltas Justificadas</span>
                  <span className="text-3xl font-black text-blue-600 font-mono">2</span>
                  <span className="text-[11px] text-gray-500 block mt-1">Com atestado médico</span>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100">
                  <span className="text-xs text-gray-400 font-bold uppercase block mb-1">Faltas Não Justificadas</span>
                  <span className="text-3xl font-black text-green-600 font-mono">0</span>
                  <span className="text-[11px] text-gray-500 block mt-1">Sem ocorrências</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 space-y-3">
                <h4 className="text-sm font-extrabold text-brand-dark pb-2 border-b border-gray-100">
                  Histórico de Ocorrências e Justificativas
                </h4>
                <div className="p-3.5 rounded-xl bg-brand-bg flex items-center justify-between text-xs">
                  <div>
                    <p className="font-extrabold text-brand-dark">Falta Justificada – Aula de Educação Física</p>
                    <p className="text-[11px] text-gray-400">12 de Outubro de 2024 • Atestado Médico entregue pela Encarregada</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                    Aprovada
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 3: HORÁRIO ESCOLAR ================= */}
          {activeTab === 'horario' && (
            <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 space-y-4 animate-fadeIn">
              <h3 className="font-extrabold text-base text-brand-dark pb-3 border-b border-gray-100">
                Horário de Aulas – 10ª Classe (Turno da Manhã: 07h30 – 13h00)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
                {[
                  { dia: 'Segunda', aulas: ['07h30 – Matemática', '09h15 – Física', '11h00 – Português'] },
                  { dia: 'Terça', aulas: ['07h30 – Química', '09h15 – História', '11h00 – Ed. Física'] },
                  { dia: 'Quarta', aulas: ['07h30 – Física', '09h15 – Geografia', '11h00 – Matemática'] },
                  { dia: 'Quinta', aulas: ['07h30 – Português', '09h15 – Inglês', '11h00 – Química'] },
                  { dia: 'Sexta', aulas: ['07h30 – Matemática', '09h15 – Biologia', '11h00 – Filosofia'] },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-brand-bg border border-gray-100 space-y-2">
                    <p className="font-extrabold text-blue-700 uppercase tracking-wider text-[11px] pb-1 border-b border-gray-200">
                      {item.dia}
                    </p>
                    {item.aulas.map((a, i) => (
                      <p key={i} className="text-[11px] text-brand-dark font-semibold bg-white p-2 rounded-lg shadow-sm border border-gray-100">
                        {a}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 4: AVISOS & TAREFAS ================= */}
          {activeTab === 'avisos' && (
            <div className="space-y-4 animate-fadeIn">
              {[
                { title: 'Trabalho de Física: Movimento Uniformemente Variado', due: 'Entrega: Próxima Segunda-feira', desc: 'Resolução dos exercícios da página 45 a 48 em grupo de 3 alunos.', status: 'Pendente' },
                { title: 'Leitura Obrigatória: Mensagem de Agostinho Neto', due: 'Entrega: 24 de Novembro', desc: 'Ficha de leitura e análise literária para a disciplina de Língua Portuguesa.', status: 'Em andamento' },
                { title: 'Inscrições para as Olimpíadas de Matemática', due: 'Prazo: 30 de Novembro', desc: 'Alunos com média superior a 16 valores estão convidados a participar na secretaria.', status: 'Opcional' }
              ].map((task, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-5 shadow-card border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-md">
                      {task.status}
                    </span>
                    <h4 className="font-extrabold text-sm text-brand-dark">{task.title}</h4>
                    <p className="text-xs text-brand-body">{task.desc}</p>
                    <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-1 font-medium">
                      <Clock className="w-3 h-3 text-brand-gold" />
                      <span>{task.due}</span>
                    </p>
                  </div>

                  <button className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-extrabold transition-colors shrink-0">
                    Ver Detalhes
                  </button>
                </div>
              ))}
            </div>
          )}

        </div>

      </main>

    </div>
  );
};
