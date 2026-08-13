import React, { useState } from 'react';
import { ScrollReveal, ScrollRevealItem } from '../components/ScrollReveal';
import { STUDENTS_DATA } from '../data/school';
import { Student } from '../types/school';
import { Search, Filter, Users, Star, TrendingUp } from 'lucide-react';

const STATUS_COLORS: Record<Student['enrollmentStatus'], string> = {
  'Matriculado': 'bg-green-100 text-green-700',
  'Pendente': 'bg-yellow-100 text-yellow-700',
  'Trancado': 'bg-red-100 text-red-700',
  'Concluído': 'bg-blue-100 text-blue-700',
};

const SHIFT_COLORS: Record<Student['shift'], string> = {
  'Manhã': 'text-amber-600',
  'Tarde': 'text-blue-600',
  'Noite': 'text-purple-600',
};

interface AlunosPageProps {
  onSelectStudent?: (student: Student) => void;
}

export const AlunosPage: React.FC<AlunosPageProps> = ({ onSelectStudent }) => {
  const [search, setSearch] = useState('');
  const [filterGrade, setFilterGrade] = useState('');
  const [filterShift, setFilterShift] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const grades = Array.from(new Set(STUDENTS_DATA.map(s => s.grade)));
  const shifts = Array.from(new Set(STUDENTS_DATA.map(s => s.shift)));

  const filtered = STUDENTS_DATA.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
                        s.classRoom.toLowerCase().includes(search.toLowerCase());
    const matchGrade = !filterGrade || s.grade === filterGrade;
    const matchShift = !filterShift || s.shift === filterShift;
    const matchStatus = !filterStatus || s.enrollmentStatus === filterStatus;
    return matchSearch && matchGrade && matchShift && matchStatus;
  });

  return (
    <div className="pt-24 bg-white min-h-screen">

      {/* HEADER */}
      <section className="bg-brand-dark py-16 relative overflow-hidden">
        <div className="bg-blueprint-pattern absolute inset-0 opacity-20" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal variant="fade-up">
            <span className="inline-flex items-center gap-2 bg-brand-green/20 text-brand-green text-xs font-extrabold uppercase px-4 py-1.5 rounded-full mb-4 border border-brand-green/30">
              <Users className="w-3.5 h-3.5" />
              Gestão de Alunos
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
              Todos os Alunos <span className="text-brand-green">em um só lugar</span>
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl">
              Consulte, filtre e gerencie o perfil completo de cada aluno — notas, presenças e dados do encarregado.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* FILTROS */}
      <section className="bg-white border-b border-gray-100 py-6 sticky top-20 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3 items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Pesquisar aluno ou turma..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filterGrade}
                onChange={e => setFilterGrade(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green"
              >
                <option value="">Todas as Classes</option>
                {grades.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              <select
                value={filterShift}
                onChange={e => setFilterShift(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green"
              >
                <option value="">Todos os Turnos</option>
                {shifts.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green"
              >
                <option value="">Todos os Status</option>
                <option value="Matriculado">Matriculado</option>
                <option value="Pendente">Pendente</option>
                <option value="Trancado">Trancado</option>
                <option value="Concluído">Concluído</option>
              </select>
            </div>

            <span className="text-xs text-brand-body font-medium">
              {filtered.length} aluno{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </section>

      {/* CARDS DOS ALUNOS */}
      <section className="py-12 bg-brand-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-brand-body font-medium">Nenhum aluno encontrado com os filtros aplicados.</p>
            </div>
          ) : (
            <ScrollReveal variant="stagger">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map(student => (
                  <ScrollRevealItem key={student.id}>
                    <div
                      className="bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 group cursor-pointer border border-brand-border hover:border-brand-green/30 transform hover:-translate-y-1"
                      onClick={() => onSelectStudent && onSelectStudent(student)}
                    >
                      {/* Photo & Status */}
                      <div className="relative h-44 overflow-hidden">
                        <img
                          src={student.photo}
                          alt={student.name}
                          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/60 to-transparent" />
                        <span className={`absolute top-3 right-3 text-[10px] font-extrabold px-2.5 py-1 rounded-full ${STATUS_COLORS[student.enrollmentStatus]}`}>
                          {student.enrollmentStatus}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="p-5">
                        <h3 className="font-extrabold text-brand-dark text-base mb-1 group-hover:text-brand-green transition-colors">
                          {student.name}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-brand-body mb-3">
                          <span className="font-bold text-brand-dark">{student.grade}</span>
                          <span>•</span>
                          <span className="font-semibold">{student.classRoom}</span>
                          <span>•</span>
                          <span className={`font-bold ${SHIFT_COLORS[student.shift]}`}>{student.shift}</span>
                        </div>

                        {/* Mini stats */}
                        <div className="flex gap-4 text-xs">
                          {student.averageGrade !== undefined && (
                            <div className="flex items-center gap-1 text-brand-body">
                              <Star className="w-3.5 h-3.5 text-brand-gold fill-brand-gold" />
                              <span className="font-bold text-brand-dark">{student.averageGrade}</span>
                              <span>média</span>
                            </div>
                          )}
                          {student.attendancePercent !== undefined && (
                            <div className="flex items-center gap-1 text-brand-body">
                              <TrendingUp className="w-3.5 h-3.5 text-brand-green" />
                              <span className="font-bold text-brand-dark">{student.attendancePercent}%</span>
                              <span>presenças</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </ScrollRevealItem>
                ))}
              </div>
            </ScrollReveal>
          )}
        </div>
      </section>

    </div>
  );
};
