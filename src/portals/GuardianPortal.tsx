import React, { useState } from 'react';
import {
  Users,
  BookOpen,
  DollarSign,
  MessageSquare,
  LogOut,
  CheckCircle2,
  Award,
  ChevronRight,
  CreditCard,
  Send,
  Phone
} from 'lucide-react';
import { UserSession } from '../types/auth';
import { SCHOOL_INFO } from '../data/school';

interface GuardianPortalProps {
  user: UserSession;
  onLogout: () => void;
}

type GuardianTab = 'desempenho' | 'propinas' | 'comunicados' | 'contacto';

export const GuardianPortal: React.FC<GuardianPortalProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<GuardianTab>('desempenho');
  const [selectedChild, setSelectedChild] = useState<string>('ana');
  const [comprovativoSuccess, setComprovativoSuccess] = useState<boolean>(false);
  const [msgProf, setMsgProf] = useState<string>('');
  const [msgSent, setMsgSent] = useState<boolean>(false);

  const childrenData: Record<
    string,
    {
      name: string;
      grade: string;
      classRoom: string;
      photo: string;
      avg: number;
      attendance: number;
      director: string;
      directorPhone: string;
      grades: { subject: string; grade: number; status: string }[];
      propinas: { mes: string; valor: string; status: 'Pago' | 'Pendente'; ref?: string }[];
    }
  > = {
    ana: {
      name: 'Ana Beatriz Ferreira',
      grade: '10ª Classe',
      classRoom: 'Turma A (Turno da Manhã)',
      photo: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=400&auto=format&fit=crop',
      avg: 17.5,
      attendance: 98,
      director: 'Prof. Adelino Costa',
      directorPhone: '+244 923 111 222',
      grades: [
        { subject: 'Matemática', grade: 18.0, status: 'Excelente' },
        { subject: 'Física', grade: 17.5, status: 'Excelente' },
        { subject: 'Química', grade: 17.0, status: 'Muito Bom' },
        { subject: 'Língua Portuguesa', grade: 18.5, status: 'Excelente' },
        { subject: 'História', grade: 16.5, status: 'Bom' },
      ],
      propinas: [
        { mes: 'Setembro 2024', valor: '32.000 Kz', status: 'Pago' },
        { mes: 'Outubro 2024', valor: '32.000 Kz', status: 'Pago' },
        { mes: 'Novembro 2024', valor: '32.000 Kz', status: 'Pendente', ref: '923 456 781' },
        { mes: 'Dezembro 2024', valor: '32.000 Kz', status: 'Pendente', ref: '923 456 782' },
      ]
    },
    carlos: {
      name: 'Carlos Eduardo Martins',
      grade: '8ª Classe',
      classRoom: 'Turma B (Turno da Tarde)',
      photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&auto=format&fit=crop',
      avg: 15.2,
      attendance: 88,
      director: 'Profª. Cátia Mendes',
      directorPhone: '+244 923 333 444',
      grades: [
        { subject: 'Matemática', grade: 15.0, status: 'Bom' },
        { subject: 'Ciências da Natureza', grade: 16.0, status: 'Bom' },
        { subject: 'Língua Portuguesa', grade: 14.5, status: 'Suficiente' },
        { subject: 'História', grade: 15.5, status: 'Bom' },
      ],
      propinas: [
        { mes: 'Setembro 2024', valor: '25.000 Kz', status: 'Pago' },
        { mes: 'Outubro 2024', valor: '25.000 Kz', status: 'Pago' },
        { mes: 'Novembro 2024', valor: '25.000 Kz', status: 'Pendente', ref: '923 456 791' },
      ]
    }
  };

  const currentChild = childrenData[selectedChild] || childrenData.ana;

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-brand-dark flex flex-col md:flex-row font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 bg-brand-dark text-white flex flex-col justify-between shrink-0 shadow-xl border-r border-gray-800">
        <div>
          {/* Logo / Brand */}
          <div className="p-6 border-b border-gray-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-md">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight leading-none text-white">
                Kivora Família
              </h1>
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider mt-1 block">
                Portal do Encarregado
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {[
              { id: 'desempenho', label: 'Desempenho Escolar', icon: <Award className="w-4 h-4" /> },
              { id: 'propinas', label: 'Propinas & Pagamentos', icon: <DollarSign className="w-4 h-4" /> },
              { id: 'comunicados', label: 'Avisos da Escola', icon: <BookOpen className="w-4 h-4" /> },
              { id: 'contacto', label: 'Falar com os Professores', icon: <MessageSquare className="w-4 h-4" /> }
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as GuardianTab)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-extrabold transition-all ${
                    isActive
                      ? 'bg-amber-500 text-white shadow-md'
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
              className="w-10 h-10 rounded-full object-cover border-2 border-amber-500"
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
        
        {/* Topbar with Child Selector */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-20 shadow-sm">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">
              Acompanhamento Pedagógico Familiar
            </span>
            <h2 className="text-lg font-extrabold text-brand-dark">
              {activeTab === 'desempenho' && 'Boletim & Notas do Educando'}
              {activeTab === 'propinas' && 'Regularização de Propinas & Recibos'}
              {activeTab === 'comunicados' && 'Mural de Avisos da Direção Escolar'}
              {activeTab === 'contacto' && 'Canal de Comunicação com a Escola'}
            </h2>
          </div>

          {/* Child Selector Pill Buttons */}
          <div className="flex items-center gap-2 bg-brand-bg p-1 rounded-2xl border border-gray-200">
            <span className="text-[10px] uppercase font-bold text-gray-400 pl-2">Educando:</span>
            <button
              onClick={() => setSelectedChild('ana')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                selectedChild === 'ana'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-brand-dark'
              }`}
            >
              Ana Beatriz (10ª A)
            </button>
            <button
              onClick={() => setSelectedChild('carlos')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                selectedChild === 'carlos'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-brand-dark'
              }`}
            >
              Carlos Eduardo (8ª B)
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
          
          {/* Educando Profile Card */}
          <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <img
                src={currentChild.photo}
                alt={currentChild.name}
                className="w-16 h-16 rounded-2xl object-cover shadow-sm border border-gray-100"
              />
              <div>
                <h3 className="text-lg font-extrabold text-brand-dark">{currentChild.name}</h3>
                <p className="text-xs text-gray-500 font-medium">{currentChild.grade} • {currentChild.classRoom}</p>
                <p className="text-[11px] text-amber-600 font-bold mt-0.5">
                  Diretor(a) de Turma: {currentChild.director}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-center">
              <div className="px-4 py-2 bg-amber-50 rounded-xl border border-amber-100">
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Média Escolar</span>
                <span className="text-2xl font-black font-mono text-amber-600">{currentChild.avg}</span>
              </div>
              <div className="px-4 py-2 bg-green-50 rounded-xl border border-green-100">
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Assiduidade</span>
                <span className="text-2xl font-black font-mono text-green-600">{currentChild.attendance}%</span>
              </div>
            </div>
          </div>

          {/* ================= TAB 1: DESEMPENHO ================= */}
          {activeTab === 'desempenho' && (
            <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 space-y-4 animate-fadeIn">
              <h4 className="font-extrabold text-sm text-brand-dark pb-2 border-b border-gray-100">
                Notas do 1º Trimestre – {currentChild.name}
              </h4>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {currentChild.grades.map((g, i) => (
                  <div key={i} className="p-4 rounded-xl bg-brand-bg border border-gray-100 flex items-center justify-between">
                    <div>
                      <p className="font-extrabold text-xs text-brand-dark">{g.subject}</p>
                      <span className="text-[10px] font-bold text-green-600">{g.status}</span>
                    </div>
                    <span className="text-xl font-black font-mono text-brand-dark">
                      {g.grade} <span className="text-[10px] text-gray-400 font-normal">/ 20</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 2: PROPINAS ================= */}
          {activeTab === 'propinas' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Payment Info Card */}
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-6 text-white shadow-lg grid sm:grid-cols-3 gap-6">
                <div>
                  <span className="text-xs uppercase font-bold text-amber-100 block">Referência Multicaixa Express</span>
                  <span className="text-2xl font-black font-mono mt-1 block">923 456 789</span>
                  <span className="text-[10px] text-amber-100 block">Entidade Kivora: 00982</span>
                </div>
                <div>
                  <span className="text-xs uppercase font-bold text-amber-100 block">Propina Mensal</span>
                  <span className="text-2xl font-black font-mono mt-1 block">{currentChild.propinas[0].valor}</span>
                  <span className="text-[10px] text-amber-100 block">Vencimento: Dia 10 de cada mês</span>
                </div>
                <div className="flex items-center">
                  <button
                    onClick={() => {
                      setComprovativoSuccess(true);
                      setTimeout(() => setComprovativoSuccess(false), 3500);
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-white text-amber-700 hover:bg-amber-50 text-xs font-extrabold shadow transition-all flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Enviar Comprovativo</span>
                  </button>
                </div>
              </div>

              {comprovativoSuccess && (
                <div className="p-3 bg-green-50 text-green-800 rounded-xl text-xs font-bold text-center border border-green-200 animate-fadeIn flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>Comprovativo submetido com sucesso! A secretaria validará em até 2 horas.</span>
                </div>
              )}

              {/* Propinas List */}
              <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 space-y-3">
                <h4 className="font-extrabold text-sm text-brand-dark pb-2 border-b border-gray-100">
                  Histórico de Mensalidades – Ano Letivo 2024/2025
                </h4>

                <div className="divide-y divide-gray-100">
                  {currentChild.propinas.map((p, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-extrabold text-brand-dark">{p.mes}</p>
                        {p.ref && <p className="text-[10px] text-gray-400">Ref: {p.ref}</p>}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-brand-dark">{p.valor}</span>
                        <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                          p.status === 'Pago' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {p.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ================= TAB 3: COMUNICADOS ================= */}
          {activeTab === 'comunicados' && (
            <div className="space-y-4 animate-fadeIn">
              {[
                { title: 'Reunião Geral de Encarregados de Educação', date: 'Marcada para 30 de Novembro, 10h00', desc: 'Apresentação dos resultados do 1º Trimestre e plano de atividades do 2º Trimestre no anfiteatro da escola.', type: 'Convocatória' },
                { title: 'Início das Férias do 1º Trimestre', date: 'De 15 a 31 de Dezembro', desc: 'Informamos que o período de interrupção letiva decorrerá nas datas estipuladas pelo Ministério da Educação.', type: 'Aviso Geral' },
              ].map((aviso, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-5 shadow-card border border-gray-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 bg-amber-50 text-amber-700 rounded-md">
                      {aviso.type}
                    </span>
                    <span className="text-[11px] text-gray-400 font-medium">{aviso.date}</span>
                  </div>
                  <h4 className="font-extrabold text-sm text-brand-dark">{aviso.title}</h4>
                  <p className="text-xs text-brand-body leading-relaxed">{aviso.desc}</p>
                </div>
              ))}
            </div>
          )}

          {/* ================= TAB 4: CONTACTO COM PROFESSORES ================= */}
          {activeTab === 'contacto' && (
            <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 space-y-6 animate-fadeIn max-w-2xl">
              <div>
                <h4 className="font-extrabold text-base text-brand-dark">
                  Enviar Mensagem ao Diretor(a) de Turma
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  Diretor responsável por {currentChild.name}: <strong>{currentChild.director}</strong> ({currentChild.directorPhone})
                </p>
              </div>

              {!msgSent ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setMsgSent(true);
                    setTimeout(() => {
                      setMsgSent(false);
                      setMsgProf('');
                    }, 4000);
                  }}
                  className="space-y-4 text-xs"
                >
                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">
                      Assunto da Mensagem *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="ex: Justificativa de falta / Pedido de esclarecimento"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">
                      Mensagem *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={msgProf}
                      onChange={(e) => setMsgProf(e.target.value)}
                      placeholder="Escreva a sua mensagem para o professor..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 outline-none text-xs resize-none"
                    />
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-xl shadow transition-all flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>Enviar Mensagem</span>
                    </button>

                    <a
                      href={`https://wa.me/${SCHOOL_INFO.phoneRaw}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3 bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold rounded-xl shadow transition-all flex items-center gap-2"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Falar via WhatsApp</span>
                    </a>
                  </div>
                </form>
              ) : (
                <div className="p-6 bg-green-50 text-green-800 rounded-2xl text-center space-y-2 border border-green-200">
                  <p className="font-extrabold text-sm">Mensagem enviada com sucesso ao Diretor de Turma!</p>
                  <p className="text-xs text-green-600">Receberá resposta no seu e-mail e notificações do portal.</p>
                </div>
              )}
            </div>
          )}

        </div>

      </main>

    </div>
  );
};
