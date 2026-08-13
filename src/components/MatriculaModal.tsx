import React, { useState } from 'react';
import { X, GraduationCap, Send, MessageSquare, CheckCircle2 } from 'lucide-react';
import { SCHOOL_INFO } from '../data/school';

interface MatriculaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MatriculaModal: React.FC<MatriculaModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const [grade, setGrade] = useState<string>('7ª Classe');
  const [shift, setShift] = useState<string>('Manhã');
  const [studentName, setStudentName] = useState<string>('');
  const [guardianName, setGuardianName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [sentSuccess, setSentSuccess] = useState<boolean>(false);

  // Propinas por classe (simulação em Kwanzas)
  const PRICING: Record<string, number> = {
    '7ª Classe': 25000,
    '8ª Classe': 25000,
    '9ª Classe': 28000,
    '10ª Classe': 32000,
    '11ª Classe': 35000,
    '12ª Classe': 40000,
  };

  const currentPrice = PRICING[grade] || 30000;
  const registrationFee = Math.round(currentPrice * 0.5); // 50% da propina

  const formatKZ = (val: number) => {
    return new Intl.NumberFormat('pt-AO').format(val) + ' Kz';
  };

  const whatsappMessage = encodeURIComponent(
    `Olá! Gostaria de pré-matricular / solicitar demonstração na Kivora:\n` +
    `• Nome do Aluno: ${studentName || 'Não informado'}\n` +
    `• Encarregado: ${guardianName || 'Não informado'}\n` +
    `• Classe: ${grade}\n` +
    `• Turno: ${shift}\n` +
    `• Propina Estimada: ${formatKZ(currentPrice)}/mês\n` +
    `• Contacto: ${phone || 'Não informado'}`
  );
  const whatsappUrl = `https://wa.me/${SCHOOL_INFO.phoneRaw}?text=${whatsappMessage}`;

  return (
    <div className="fixed inset-0 z-[110] overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl relative border border-gray-100 flex flex-col my-8">
        
        {/* Modal Header */}
        <div className="bg-brand-dark text-white p-6 sm:p-8 relative bg-blueprint-pattern">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            aria-label="Fechar"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-2 text-brand-green text-xs font-extrabold uppercase tracking-wider mb-2">
            <GraduationCap className="w-4 h-4" />
            <span>SIMULADOR DE MATRÍCULA & PROPINAS</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Simule a Matrícula e Propinas
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            Selecione a classe e o turno para ver o valor estimado de propinas e taxa de matrícula.
          </p>
        </div>

        {/* Modal Body Grid */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Controls Column (7 cols) */}
          <div className="md:col-span-7 space-y-5">
            
            {/* Classe Selector */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                Selecione a Classe
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-green outline-none text-sm font-semibold text-brand-dark bg-gray-50 cursor-pointer"
              >
                {Object.keys(PRICING).map((g) => (
                  <option key={g} value={g}>
                    {g} — Propina: {formatKZ(PRICING[g])}/mês
                  </option>
                ))}
              </select>
            </div>

            {/* Turno Selector */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                Turno Pretendido
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Manhã', 'Tarde', 'Noite'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setShift(t)}
                    className={`py-2.5 rounded-xl text-xs font-extrabold transition-all border ${
                      shift === t
                        ? 'bg-brand-green text-white border-brand-green shadow-md scale-105'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* User Quick Info */}
            <div className="space-y-3 pt-2 border-t border-gray-100">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                  Nome do Aluno
                </label>
                <input
                  type="text"
                  placeholder="Nome completo do aluno"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-green outline-none text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                  Nome do Encarregado *
                </label>
                <input
                  type="text"
                  placeholder="Nome do encarregado de educação"
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-green outline-none text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                  Telefone / WhatsApp *
                </label>
                <input
                  type="tel"
                  placeholder="+244 9XX XXX XXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-green outline-none text-xs"
                />
              </div>
            </div>

          </div>

          {/* Simulation Output Card (5 cols) */}
          <div className="md:col-span-5 bg-brand-bg rounded-2xl p-6 border border-gray-200 flex flex-col justify-between space-y-6">
            
            <div className="space-y-4">
              <div className="text-xs font-extrabold uppercase text-gray-400 tracking-wider">
                RESUMO DOS VALORES
              </div>

              <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-2">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Classe Selecionada:</span>
                  <strong className="text-brand-dark">{grade}</strong>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Turno:</span>
                  <strong className="text-brand-dark">{shift}</strong>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Taxa de Matrícula (Única):</span>
                  <strong className="text-brand-green font-mono">{formatKZ(registrationFee)}</strong>
                </div>
                <div className="flex justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                  <span>Propina Mensal:</span>
                  <strong className="text-brand-dark font-mono">{formatKZ(currentPrice)}</strong>
                </div>
              </div>

              {/* Big Monthly Result */}
              <div className="bg-brand-green text-white p-5 rounded-xl shadow-lg text-center">
                <span className="text-[11px] font-extrabold uppercase text-green-100 block">
                  Propina Mensal Estimada
                </span>
                <div className="text-2xl sm:text-3xl font-extrabold font-mono mt-1">
                  {formatKZ(currentPrice)}
                </div>
                <span className="text-[10px] text-green-100 block mt-1">
                  / mês (10 mensalidades por ano letivo)
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold py-3.5 px-4 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all text-xs sm:text-sm"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Enviar Pré-Matrícula no WhatsApp</span>
              </a>

              <button
                onClick={() => {
                  setSentSuccess(true);
                  setTimeout(() => setSentSuccess(false), 4000);
                }}
                className="w-full bg-brand-dark hover:bg-black text-white font-extrabold py-3 px-4 rounded-xl shadow-sm flex items-center justify-center gap-2 text-xs transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Solicitar Vaga na Escola</span>
              </button>

              {sentSuccess && (
                <div className="p-3 bg-green-100 text-green-800 text-xs font-bold rounded-xl text-center flex items-center justify-center gap-1.5 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>Pedido enviado com sucesso!</span>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
