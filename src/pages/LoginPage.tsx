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
    <div className="min-h-screen min-h-[100dvh] w-full bg-white flex flex-col lg:grid lg:grid-cols-12 selection:bg-orange-500 selection:text-white">
      {/* ── LADO ESQUERDO: IMAGEM LIMPA E EDITORIAL ── */}
      <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 relative overflow-hidden bg-[#0B1528] text-white flex-col justify-between p-12 xl:p-16 select-none">
        <img
          src="/imagens/imagem para a tela de loguin.webp"
          alt="Kivora Gestão & Faturação"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-40 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1528] via-[#0B1528]/80 to-[#0B1528]/40" />

        {/* Topo: Apenas a Marca */}
        <div className="relative z-10">
          <KivoraLogo variant="white" size="lg" useOfficialImage={true} />
        </div>

        {/* Fundo do lado esquerdo: Apenas mensagem sóbria e elegante */}
        <div className="relative z-10 max-w-lg space-y-3">
          <h2 className="text-3xl font-extrabold text-white tracking-tight leading-snug font-display">
            Faturação e gestão empresarial simples, rápida e certificada.
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Software certificado pela AGT sob o n.º FE/387/AGT/2026.
          </p>
        </div>
      </div>

      {/* ── LADO DIREITO: ÁREA DE LOGIN MINIMALISTA E RESPONSIVA ── */}
      <div className="flex-1 lg:col-span-6 xl:col-span-5 flex flex-col justify-between p-6 sm:p-10 lg:p-14 bg-white">
        {/* Topo: Voltar ao site */}
        <div className="flex items-center justify-between w-full">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao site</span>
          </button>
        </div>

        {/* Formulário no centro */}
        <div className="w-full max-w-sm mx-auto my-auto py-8 space-y-6">
          <div className="space-y-1.5">
            <div className="lg:hidden mb-4">
              <KivoraLogo variant="dark" size="sm" useOfficialImage={true} />
            </div>
            <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight">
              Iniciar Sessão
            </h1>
            <p className="text-xs text-slate-500">
              Aceda à sua conta de administrador, parceiro ou cliente.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Email ou NIF
              </label>
              <div className="relative">
                <UserCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="exemplo@empresa.ao"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-[#FF6500] focus:ring-1 focus:ring-[#FF6500] outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Palavra-passe
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-[#FF6500] focus:ring-1 focus:ring-[#FF6500] outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer transition-colors"
                  aria-label={showPassword ? 'Ocultar' : 'Mostrar'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#FF6500] hover:bg-[#EB5B00] text-white font-semibold text-xs sm:text-sm rounded-lg flex items-center justify-center gap-2 transition-colors active:scale-[0.99] cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>A entrar...</span>
                </>
              ) : (
                <>
                  <span>Entrar</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 pt-2">
            Precisa de ajuda com o acesso?{' '}
            <a
              href={`mailto:${KIVORA_INFO.supportEmail}`}
              className="text-[#FF6500] hover:underline font-semibold"
            >
              Falar com o suporte
            </a>
          </p>
        </div>

        {/* Rodapé discreto */}
        <div className="text-center text-[11px] text-slate-400">
          KIVORA SOFT • FE/387/AGT/2026
        </div>
      </div>
    </div>
  );
};
