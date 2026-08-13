import React from 'react';
import { X, User, Phone, BookOpen, GraduationCap, CheckCircle2, MessageSquare, Star, TrendingUp } from 'lucide-react';
import { Student } from '../types/school';
import { SCHOOL_INFO } from '../data/school';

interface AlunoModalProps {
  student: Student | null;
  onClose: () => void;
  onOpenContactForm?: (studentName: string) => void;
}

export const AlunoModal: React.FC<AlunoModalProps> = ({
  student,
  onClose,
  onOpenContactForm
}) => {
  if (!student) return null;

  const whatsappMessage = encodeURIComponent(
    `Olá! Contacto sobre o aluno(a) ${student.name} (${student.grade} - ${student.classRoom}).`
  );
  const whatsappUrl = `https://wa.me/${SCHOOL_INFO.phoneRaw}?text=${whatsappMessage}`;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/75 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative border border-gray-100 flex flex-col">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/90 shadow-md hover:bg-white text-gray-700 hover:text-brand-green flex items-center justify-center transition-colors"
          aria-label="Fechar"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Modal Content */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Header section with photo */}
          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start pb-6 border-b border-gray-100">
            <div className="w-32 h-32 rounded-2xl overflow-hidden shrink-0 shadow-md bg-gray-100">
              <img
                src={student.photo}
                alt={student.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-2 text-center sm:text-left flex-1">
              <span className="inline-block text-[10px] font-extrabold uppercase bg-brand-green text-white px-2.5 py-1 rounded-full">
                {student.enrollmentStatus}
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-brand-dark">
                {student.name}
              </h3>
              <p className="text-sm font-semibold text-brand-body">
                {student.grade} • {student.classRoom} • Turno da {student.shift}
              </p>
              <p className="text-xs text-brand-body">
                Ano de Matrícula: <strong>{student.enrollmentYear}</strong> • Idade: <strong>{student.age} anos</strong>
              </p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-brand-bg/80 text-center">
            <div className="flex flex-col items-center">
              <Star className="w-5 h-5 text-brand-gold fill-brand-gold mb-1" />
              <span className="text-xs text-gray-500">Média Geral</span>
              <span className="text-sm font-extrabold text-brand-dark">{student.averageGrade ?? 'N/A'} / 20</span>
            </div>
            <div className="flex flex-col items-center">
              <TrendingUp className="w-5 h-5 text-brand-green mb-1" />
              <span className="text-xs text-gray-500">Presença</span>
              <span className="text-sm font-extrabold text-brand-dark">{student.attendancePercent ?? 100}%</span>
            </div>
            <div className="flex flex-col items-center">
              <BookOpen className="w-5 h-5 text-brand-green mb-1" />
              <span className="text-xs text-gray-500">Turma</span>
              <span className="text-sm font-extrabold text-brand-dark">{student.classRoom}</span>
            </div>
            <div className="flex flex-col items-center">
              <GraduationCap className="w-5 h-5 text-brand-green mb-1" />
              <span className="text-xs text-gray-500">Situação</span>
              <span className="text-sm font-extrabold text-brand-dark">{student.enrollmentStatus}</span>
            </div>
          </div>

          {/* Encarregado de Educação */}
          <div className="bg-brand-green-light/40 rounded-xl p-4 border border-brand-green/20">
            <h4 className="text-xs font-extrabold text-brand-dark uppercase tracking-wider mb-2">
              Encarregado(a) de Educação
            </h4>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 text-sm">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-brand-green" />
                <span className="font-bold text-brand-dark">{student.guardian}</span>
              </div>
              <div className="flex items-center gap-2 text-brand-body font-mono text-xs">
                <Phone className="w-3.5 h-3.5 text-brand-green" />
                <span>{student.guardianPhone}</span>
              </div>
            </div>
          </div>

          {/* Disciplinas */}
          {student.subjects && student.subjects.length > 0 && (
            <div>
              <h4 className="text-base font-extrabold text-brand-dark mb-3">Disciplinas Inscritas</h4>
              <div className="flex flex-wrap gap-2">
                {student.subjects.map((sub, idx) => (
                  <span key={idx} className="flex items-center gap-1.5 text-xs font-bold bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-green" />
                    <span>{sub}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-[#25D366] hover:bg-[#20ba59] text-white font-semibold py-3.5 px-6 rounded-lg shadow flex items-center justify-center gap-2 transition-colors"
            >
              <MessageSquare className="w-5 h-5" />
              <span>Contactar Encarregado</span>
            </a>

            <button
              onClick={() => {
                onClose();
                if (onOpenContactForm) onOpenContactForm(student.name);
              }}
              className="flex-1 bg-brand-green hover:bg-brand-green-dark text-white font-semibold py-3.5 px-6 rounded-lg shadow flex items-center justify-center gap-2 transition-colors"
            >
              <Phone className="w-5 h-5" />
              <span>Solicitar Ficha de Aluno</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
