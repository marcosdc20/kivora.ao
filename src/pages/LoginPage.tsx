import React, { useState } from 'react';
import {
  Shield,
  GraduationCap,
  BookOpen,
  Users,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Lock,
  Mail,
  CheckCircle2,
  LockKeyhole
} from 'lucide-react';
import { KivoraLogo } from '../components/KivoraLogo';
import { UserRole, UserSession, DEMO_ACCOUNTS } from '../types/auth';

// Imagens dos portais
import imgAdmin from '../assets/login/2147663610.jpg';
import imgTeacher from '../assets/login/2148892516.jpg';
import imgStudent from '../assets/login/2149272217.jpg';
import imgGuardian from '../assets/login/2151696448.jpg';

interface LoginPageProps {
  onLogin: (session: UserSession) => void;
  onBackToHome: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onBackToHome }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [email, setEmail] = useState<string>('admin@kivora.ao');
  const [password, setPassword] = useState<string>('••••••••');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [forgotModalOpen, setForgotModalOpen] = useState<boolean>(false);
  const [forgotEmail, setForgotEmail] = useState<string>('');
  const [forgotSuccess, setForgotSuccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const roleDetails: Record<
    UserRole,
    {
      title: string;
      roleName: string;
      fieldLabel: string;
      placeholder: string;
      image: string;
      quote: string;
      author: string;
      authorRole: string;
      accentColor: string;
      badgeText: string;
      icon: React.ReactNode;
    }
  > = {
    admin: {
      title: 'Portal da Direção & Administração',
      roleName: 'Direção',
      fieldLabel: 'E-mail Institucional ou Utilizador',
      placeholder: 'admin@kivora.ao',
      image: imgAdmin,
      quote: 'A excelência da nossa organização reflete-se na precisão dos dados, transparência financeira e na gestão rigorosa.',
      author: 'Dr. Adelino Costa',
      authorRole: 'Director Geral & Operações',
      accentColor: '#2563EB',
      badgeText: 'Módulo Administrativo',
      icon: <Shield className="w-4 h-4" />
    },
    teacher: {
      title: 'Portal do Gestor & Docente',
      roleName: 'Gestor / Docente',
      fieldLabel: 'E-mail ou Nº de Registo',
      placeholder: 'gestor@kivora.ao',
      image: imgTeacher,
      quote: 'Mais tempo para focar nas metas estratégicas, com relatórios em tempo real, métricas automáticas e acompanhamento digital.',
      author: 'Prof. Ricardo Sousa',
      authorRole: 'Coordenador de Projetos',
      accentColor: '#7C3AED',
      badgeText: 'Módulo de Gestão',
      icon: <GraduationCap className="w-4 h-4" />
    },
    student: {
      title: 'Portal do Utilizador',
      roleName: 'Utilizador',
      fieldLabel: 'Identificador ou E-mail',
      placeholder: 'utilizador@kivora.ao',
      image: imgStudent,
      quote: 'Acompanhar o meu histórico em tempo real e consultar métricas ajuda-me a alcançar os melhores resultados.',
      author: 'Ana Beatriz Ferreira',
      authorRole: 'Utilizador Nível Avançado',
      accentColor: '#2563EB',
      badgeText: 'Área do Utilizador',
      icon: <BookOpen className="w-4 h-4" />
    },
    guardian: {
      title: 'Portal do Encarregado / Acompanhante',
      roleName: 'Encarregado',
      fieldLabel: 'Contacto Telefónico ou E-mail',
      placeholder: 'encarregado@kivora.ao',
      image: imgGuardian,
      quote: 'Acompanho relatórios e estado de conta diariamente com total comodidade e segurança.',
      author: 'Dona Maria Ferreira',
      authorRole: 'Encarregada de Conta',
      accentColor: '#F59E0B',
      badgeText: 'Comunidade Escolar',
      icon: <Users className="w-4 h-4" />
    }
  };

  const current = roleDetails[selectedRole];

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    const demo = DEMO_ACCOUNTS.find((a) => a.role === role);
    if (demo) {
      setEmail(demo.email);
      setPassword('••••••••');
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const demo = DEMO_ACCOUNTS.find((a) => a.role === selectedRole);
      if (demo) {
        onLogin(demo.session);
      }
    }, 400);
  };

  const handleQuickLogin = (role: UserRole) => {
    setSelectedRole(role);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const demo = DEMO_ACCOUNTS.find((a) => a.role === role);
      if (demo) {
        onLogin(demo.session);
      }
    }, 250);
  };

  return (
    <div className="h-screen w-full flex flex-col lg:flex-row overflow-hidden bg-white selection:bg-brand-green selection:text-white">
      
      {/* PAINEL ESQUERDO */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-zinc-950 text-white flex-col justify-between p-10 xl:p-14 overflow-hidden select-none">
        
        {/* Full Bleed Background Image with Smooth Crossfade */}
        <div className="absolute inset-0 z-0">
          <img
            key={selectedRole}
            src={current.image}
            alt={current.title}
            className="w-full h-full object-cover object-center animate-zoom-slow"
          />
          {/* Subtle Multi-Layer Vignette Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/65 to-black/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/30 via-transparent to-zinc-950/50" />
        </div>

        {/* Top Branding Header with Large Official Logo */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <KivoraLogo size="xl" variant="white" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-xs font-semibold text-gray-200 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Sistema Online 2026</span>
          </div>
        </div>

        {/* Bottom Contextual Testimonial / Mission Statement */}
        <div className="relative z-10 max-w-xl space-y-5">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-xs font-bold uppercase tracking-wider">
            {current.icon}
            <span>{current.badgeText}</span>
          </div>

          <blockquote className="text-xl xl:text-2xl font-semibold leading-snug text-white/95 drop-shadow-md">
            "{current.quote}"
          </blockquote>

          <div className="flex items-center justify-between pt-4 border-t border-white/15">
            <div>
              <p className="font-extrabold text-sm text-white">{current.author}</p>
              <p className="text-xs text-gray-300 font-medium">{current.authorRole}</p>
            </div>

            {/* Pagination Indicators (4 Roles) */}
            <div className="flex items-center gap-1.5">
              {(['admin', 'teacher', 'student', 'guardian'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => handleRoleSelect(r)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    selectedRole === r ? 'w-8 bg-brand-green' : 'w-2 bg-white/30 hover:bg-white/60'
                  }`}
                  aria-label={`Mudar para perfil ${r}`}
                />
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* PAINEL DIREITO */}
      <div className="w-full lg:w-1/2 h-full flex flex-col justify-between p-6 sm:p-10 xl:p-14 overflow-y-auto bg-white">
        
        {/* Top Navbar */}
        <div className="flex items-center justify-between pb-2">
          <div className="lg:hidden flex items-center gap-2.5">
            <KivoraLogo size="sm" />
          </div>

          <button
            onClick={onBackToHome}
            className="ml-auto inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-brand-blue transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft className="w-4 h-4 text-brand-blue" />
            <span>Voltar ao Website</span>
          </button>
        </div>

        {/* Center Container */}
        <div className="max-w-md w-full mx-auto my-auto py-2 space-y-5">
          
          {/* LARGE OFFICIAL LOGO PROMINENTLY DISPLAYED ON TOP OF LOGIN AREA */}
          <div className="flex flex-col items-center sm:items-start space-y-3 pt-2">
            <KivoraLogo size="lg" />
            
            <div className="w-full">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Acesso ao Sistema
                </h1>
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
                  <LockKeyhole className="w-3.5 h-3.5" />
                  <span>Seguro</span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                Selecione o seu perfil para aceder ao ambiente correspondente.
              </p>
            </div>
          </div>

          {/* Segmented Profile Controller (4 Tabs) */}
          <div className="p-1 bg-slate-100 rounded-2xl grid grid-cols-4 gap-1 border border-slate-200/80">
            {(['admin', 'teacher', 'student', 'guardian'] as UserRole[]).map((role) => {
              const item = roleDetails[role];
              const isSelected = selectedRole === role;
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleRoleSelect(role)}
                  className={`py-2 px-1 rounded-xl text-xs font-extrabold transition-all flex flex-col items-center justify-center gap-1 relative ${
                    isSelected
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
                  }`}
                >
                  <span className={isSelected ? 'text-brand-green' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span className="text-[11px] leading-tight truncate max-w-full">
                    {item.roleName}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Form */}
          <form onSubmit={handleFormSubmit} className="space-y-3.5">
            
            {/* Input Identifier */}
            <div className="space-y-1">
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wide">
                {current.fieldLabel}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={current.placeholder}
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green outline-none transition-all placeholder:text-slate-400 bg-white"
                />
              </div>
            </div>

            {/* Input Password */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wide">
                  Palavra-passe
                </label>
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(true)}
                  className="text-xs font-bold text-brand-green hover:underline"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-2.5 sm:py-3 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green outline-none transition-all placeholder:text-slate-400 bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 transition-colors"
                  aria-label="Mostrar ou ocultar senha"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2 pt-0.5">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-brand-green focus:ring-brand-green accent-brand-green cursor-pointer border-slate-300"
              />
              <label htmlFor="rememberMe" className="text-xs text-slate-600 font-medium cursor-pointer select-none">
                Manter sessão iniciada neste computador
              </label>
            </div>

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-brand-green hover:bg-brand-green-dark text-white font-extrabold py-3.5 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 transform active:scale-[0.99] disabled:opacity-75"
            >
              {isLoading ? (
                <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Entrar no {current.title}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>

          {/* Quick Demo Switcher Strip */}
          <div className="pt-4 border-t border-slate-100">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block mb-2 text-center">
              Acesso Rápido de Teste (1-Clique):
            </span>

            <div className="grid grid-cols-4 gap-1.5">
              {DEMO_ACCOUNTS.map((acc) => {
                const isSelected = selectedRole === acc.role;
                return (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => handleQuickLogin(acc.role)}
                    className={`py-2 px-1 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-0.5 ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80'
                    }`}
                  >
                    <span className="text-[10px] font-black truncate max-w-full">
                      {acc.role === 'admin' && 'Direção'}
                      {acc.role === 'teacher' && 'Docente'}
                      {acc.role === 'student' && 'Aluno'}
                      {acc.role === 'guardian' && 'Família'}
                    </span>
                    <span className={`text-[8px] font-bold uppercase ${isSelected ? 'text-brand-gold' : 'text-slate-400'}`}>
                      Entrar
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Bottom Footer Details */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
          <span>Kivora Angola • Todos os direitos reservados</span>
          <span className="font-semibold text-slate-500">Suporte Técnico: suporte@kivora.ao</span>
        </div>

      </div>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative">
            <h3 className="text-xl font-extrabold text-slate-900 mb-1">
              Recuperar Acesso
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Introduza o seu e-mail institucional ou identificador para receber as instruções de redefinição de palavra-passe.
            </p>

            {!forgotSuccess ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setForgotSuccess(true);
                }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">E-mail ou Utilizador</label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="exemplo@kivora.ao"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-blue outline-none font-medium text-slate-900"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotModalOpen(false);
                      setForgotSuccess(false);
                    }}
                    className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 text-xs font-extrabold bg-brand-green hover:bg-brand-green-dark text-white rounded-xl shadow transition-colors"
                  >
                    Enviar Instruções
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-4 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <p className="text-sm font-extrabold text-slate-900">
                  Instruções enviadas com sucesso!
                </p>
                <p className="text-xs text-slate-500">
                  Verifique a sua caixa de entrada no e-mail informado para concluir a recuperação.
                </p>
                <button
                  onClick={() => {
                    setForgotModalOpen(false);
                    setForgotSuccess(false);
                  }}
                  className="mt-2 px-6 py-2.5 text-xs font-extrabold bg-slate-900 text-white rounded-xl"
                >
                  Concluir
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
