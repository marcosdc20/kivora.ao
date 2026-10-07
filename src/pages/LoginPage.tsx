import React, { useState } from 'react';
import { KivoraLogo } from '../components/KivoraLogo';
import { KIVORA_INFO } from '../data/kivoraData';
import {
  Lock,
  ArrowRight,
  ArrowLeft,
  Loader2,
  UserCheck,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { loginUser, KivoraUserSession } from '../admin/services/authService';

interface LoginPageProps {
  onBackToHome: () => void;
  onNavigatePage: (page: any) => void;
  onLoginSuccess?: (session: KivoraUserSession) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onBackToHome,
  onNavigatePage,
  onLoginSuccess,
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      setError('Por favor preencha os dados de acesso.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await loginUser(identifier, password);
      if (res.success && res.session) {
        if (onLoginSuccess) {
          onLoginSuccess(res.session);
        }

        if (res.session.role === 'admin') {
          onNavigatePage('admin');
        } else if (res.session.role === 'parceiro') {
          onNavigatePage('area-parceiro');
        } else {
          onNavigatePage('area-cliente');
        }
      } else {
        setError(res.error || 'Credenciais inválidas. Verifique o seu email, NIF ou palavra-passe.');
      }
    } catch (err: any) {
      setError('Erro de ligação: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] w-full bg-white flex flex-col lg:grid lg:grid-cols-2 selection:bg-orange-500 selection:text-white">
      {/* ── LADO ESQUERDO: 50% EXATO - IMAGEM EDITORIAL E INSTITUCIONAL ── */}
      <div className="hidden lg:flex w-full relative overflow-hidden bg-[#0B1528] text-white flex-col justify-between p-12 xl:p-16 select-none border-r border-slate-900">
        <img
          src="/imagens/imagem para a tela de loguin.webp"
          alt="Kivora Gestão & Faturação"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-40 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1528] via-[#0B1528]/85 to-[#0B1528]/40" />

        {/* Topo: Marca Kivora */}
        <div className="relative z-10 flex items-center justify-between">
          <KivoraLogo variant="white" size="lg" useOfficialImage={true} />
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-slate-200 border border-white/10">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Portal Seguro</span>
          </span>
        </div>

        {/* Centro / Fundo do lado esquerdo: Mensagem e Certificação */}
        <div className="relative z-10 max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-mono font-bold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
            <span>FE/387/AGT/2026 • Decreto Presidencial 71/25</span>
          </div>

          <h2 className="text-3xl xl:text-4xl font-black text-white tracking-tight leading-tight font-display">
            Faturação e gestão empresarial simples, rápida e certificada.
          </h2>

          <p className="text-slate-300 text-sm xl:text-base leading-relaxed">
            Software executivo para Windows com base de dados local offline-first, sincronização na nuvem e conformidade integral com a Administração Geral Tributária (AGT).
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-slate-300">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>100% Offline-First</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Assinatura Digital RSA</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── LADO DIREITO: 50% EXATO - ÁREA DE LOGIN PROPORCIONAL E ELEGANTE ── */}
      <div className="flex-1 w-full flex flex-col justify-between p-6 sm:p-12 lg:p-16 bg-white overflow-y-auto">
        {/* Topo: Voltar ao site e Status */}
        <div className="flex items-center justify-between w-full max-w-[500px] mx-auto">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Voltar ao site</span>
          </button>

          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Ligação Encriptada</span>
          </span>
        </div>

        {/* Formulário Principal: Área Generosa e Confortável */}
        <div className="w-full max-w-[460px] mx-auto my-auto py-8 sm:py-12 space-y-8">
          <div className="space-y-2">
            <div className="lg:hidden mb-6">
              <KivoraLogo variant="dark" size="md" useOfficialImage={true} />
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Iniciar Sessão
            </h1>
            <p className="text-sm sm:text-base text-slate-500">
              Aceda à sua conta de administrador, parceiro credenciado ou cliente.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700">
                Email ou NIF
              </label>
              <div className="relative">
                <UserCheck className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="exemplo@empresa.ao ou NIF"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-12 pr-4 h-13 sm:h-14 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#FF6500] focus:ring-4 focus:ring-orange-500/10 rounded-xl text-sm sm:text-base text-slate-900 placeholder-slate-400 outline-none transition-all font-medium shadow-2xs"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700">
                  Palavra-passe
                </label>
              </div>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 h-13 sm:h-14 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#FF6500] focus:ring-4 focus:ring-orange-500/10 rounded-xl text-sm sm:text-base text-slate-900 placeholder-slate-400 outline-none transition-all font-medium shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer transition-colors"
                  aria-label={showPassword ? 'Ocultar palavra-passe' : 'Mostrar palavra-passe'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50/90 border border-red-200 rounded-xl text-sm text-red-700 font-medium animate-fadeIn flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-2 shrink-0" />
                <span className="leading-snug">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-13 sm:h-14 bg-[#FF6500] hover:bg-[#EB5B00] active:scale-[0.99] text-white font-bold text-sm sm:text-base rounded-xl flex items-center justify-center gap-2.5 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/35 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>A autenticar...</span>
                </>
              ) : (
                <>
                  <span>Entrar no Portal</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Cartão de Ajuda de Acesso */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between text-xs sm:text-sm text-slate-600">
            <div className="flex items-center gap-2.5">
              <HelpCircle className="w-4 h-4 text-[#FF6500] shrink-0" />
              <span>Precisa de ajuda com as suas credenciais?</span>
            </div>
            <a
              href={`mailto:${KIVORA_INFO.supportEmail}`}
              className="text-[#FF6500] hover:text-[#EB5B00] font-bold hover:underline shrink-0"
            >
              Suporte
            </a>
          </div>
        </div>

        {/* Rodapé institucional */}
        <div className="text-center text-xs text-slate-400 py-2">
          KIVORA SOFT • Certificação AGT N.º <strong className="text-slate-600 font-mono">FE/387/AGT/2026</strong>
        </div>
      </div>
    </div>
  );
};
