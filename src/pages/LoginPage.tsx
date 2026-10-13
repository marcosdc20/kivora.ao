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
  Building2,
  Handshake,
  KeyRound,
  Sparkles,
} from 'lucide-react';
import { loginUser, KivoraUserSession } from '../admin/services/authService';

interface LoginPageProps {
  onBackToHome: () => void;
  onNavigatePage: (page: any) => void;
  onLoginSuccess?: (session: KivoraUserSession) => void;
}

type LoginTab = 'cliente' | 'parceiro' | 'admin';

export const LoginPage: React.FC<LoginPageProps> = ({
  onBackToHome,
  onNavigatePage,
  onLoginSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<LoginTab>('cliente');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados do Modal / Modo de Primeiro Acesso do Cliente
  const [isFirstAccessMode, setIsFirstAccessMode] = useState(false);
  const [firstKey, setFirstKey] = useState('');
  const [firstNif, setFirstNif] = useState('');
  const [firstPassword, setFirstPassword] = useState('');
  const [firstConfirmPassword, setFirstConfirmPassword] = useState('');
  const [firstAccessLoading, setFirstAccessLoading] = useState(false);
  const [firstAccessError, setFirstAccessError] = useState<string | null>(null);

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
        setError(res.error || 'Credenciais inválidas. Verifique o seu identificador ou palavra-passe.');
      }
    } catch (err: any) {
      setError('Erro de ligação: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFirstAccessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFirstAccessError(null);

    const cleanK = firstKey.trim().toUpperCase();
    const cleanN = firstNif.trim().toUpperCase();
    const cleanP = firstPassword.trim();

    if (!cleanK) {
      setFirstAccessError('Por favor insira a sua Chave de Licença (formato: KVRA-XXXX-XXXX-XXXX).');
      return;
    }

    if (cleanP.length < 4) {
      setFirstAccessError('A nova palavra-passe deve conter pelo menos 4 caracteres.');
      return;
    }

    if (cleanP !== firstConfirmPassword.trim()) {
      setFirstAccessError('A confirmação da palavra-passe não coincide com a palavra-passe digitada.');
      return;
    }

    setFirstAccessLoading(true);

    try {
      // Tenta login com a chave de licença e a nova palavra-passe definida pelo cliente
      const res = await loginUser(cleanK, cleanP);
      if (res.success && res.session) {
        if (onLoginSuccess) {
          onLoginSuccess(res.session);
        }
        onNavigatePage('area-cliente');
      } else {
        // Se a chave não funcionou sozinha, tenta pelo NIF
        if (cleanN) {
          const resNif = await loginUser(cleanN, cleanP);
          if (resNif.success && resNif.session) {
            if (onLoginSuccess) onLoginSuccess(resNif.session);
            onNavigatePage('area-cliente');
            return;
          }
        }
        setFirstAccessError(res.error || 'Não foi possível validar a licença. Verifique a chave e tente novamente.');
      }
    } catch (err: any) {
      setFirstAccessError('Erro ao ativar licença: ' + err.message);
    } finally {
      setFirstAccessLoading(false);
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
            <span>Portal Seguro Certificado</span>
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
            <span>Ligação Encriptada 256-bit</span>
          </span>
        </div>

        {/* Formulário Principal: Área Generosa e Confortável */}
        <div className="w-full max-w-[480px] mx-auto my-auto py-8 sm:py-10 space-y-6">
          <div className="space-y-2">
            <div className="lg:hidden mb-4">
              <KivoraLogo variant="dark" size="md" useOfficialImage={true} />
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {isFirstAccessMode ? 'Ativar Licença' : 'Iniciar Sessão'}
            </h1>
            <p className="text-sm text-slate-500">
              {isFirstAccessMode
                ? 'Insira os dados da sua licença oficial para definir a sua senha de primeiro acesso.'
                : activeTab === 'cliente'
                ? 'Aceda à Área do Cliente para consultar licenças, postos e faturas.'
                : activeTab === 'parceiro'
                ? 'Portal exclusivo para parceiros distribuidores e agentes credenciados.'
                : 'Painel executivo de administração e fiscalização Kivora Soft.'}
            </p>
          </div>

          {/* Seletor Visual de Perfil (Tabs) */}
          {!isFirstAccessMode && (
            <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200/80 text-xs font-bold font-display">
              <button
                type="button"
                onClick={() => { setActiveTab('cliente'); setError(null); }}
                className={`flex-1 py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'cliente'
                    ? 'bg-white text-[#FF6500] shadow-sm font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Cliente / Empresa</span>
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('parceiro'); setError(null); }}
                className={`flex-1 py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'parceiro'
                    ? 'bg-white text-[#FF6500] shadow-sm font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Handshake className="w-3.5 h-3.5" />
                <span>Parceiro</span>
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('admin'); setError(null); }}
                className={`flex-1 py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-white text-[#FF6500] shadow-sm font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            </div>
          )}

          {/* MODO PRIMEIRO ACESSO DO CLIENTE */}
          {isFirstAccessMode ? (
            <form onSubmit={handleFirstAccessSubmit} className="space-y-4 animate-fadeIn">
              <div className="p-3 bg-orange-50 border border-orange-200/80 rounded-xl text-xs text-orange-800 leading-relaxed">
                <strong>Ativação Rápida:</strong> Se comprou a sua licença através de um parceiro oficial ou revendedor, insira a chave fornecida para criar a sua palavra-passe de acesso ao portal do cliente.
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Chave de Licença Oficial *
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="KVRA-XXXX-XXXX-XXXX"
                    value={firstKey}
                    onChange={(e) => setFirstKey(e.target.value.toUpperCase())}
                    className="w-full pl-11 pr-4 h-12 bg-slate-50 border border-slate-200 focus:border-[#FF6500] focus:ring-4 focus:ring-orange-500/10 rounded-xl text-sm font-mono text-slate-900 placeholder-slate-400 outline-none transition-all uppercase"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  NIF da Empresa (Opcional)
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="ex: 5412345678"
                    value={firstNif}
                    onChange={(e) => setFirstNif(e.target.value.toUpperCase())}
                    className="w-full pl-11 pr-4 h-12 bg-slate-50 border border-slate-200 focus:border-[#FF6500] focus:ring-4 focus:ring-orange-500/10 rounded-xl text-sm text-slate-900 placeholder-slate-400 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Nova Palavra-passe *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Mínimo 4 caracteres"
                    value={firstPassword}
                    onChange={(e) => setFirstPassword(e.target.value)}
                    className="w-full px-4 h-12 bg-slate-50 border border-slate-200 focus:border-[#FF6500] focus:ring-4 focus:ring-orange-500/10 rounded-xl text-sm text-slate-900 placeholder-slate-400 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Confirmar Senha *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Repita a senha"
                    value={firstConfirmPassword}
                    onChange={(e) => setFirstConfirmPassword(e.target.value)}
                    className="w-full px-4 h-12 bg-slate-50 border border-slate-200 focus:border-[#FF6500] focus:ring-4 focus:ring-orange-500/10 rounded-xl text-sm text-slate-900 placeholder-slate-400 outline-none transition-all"
                  />
                </div>
              </div>

              {firstAccessError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                  {firstAccessError}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setIsFirstAccessMode(false); setFirstAccessError(null); }}
                  className="px-4 h-12 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={firstAccessLoading}
                  className="flex-1 h-12 bg-[#FF6500] hover:bg-[#EB5B00] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md shadow-orange-500/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  {firstAccessLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>A validar licença...</span>
                    </>
                  ) : (
                    <>
                      <span>Ativar e Entrar no Painel</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* FORMULÁRIO PADRÃO DE LOGIN */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  {activeTab === 'cliente'
                    ? 'Chave de Licença, NIF ou Email'
                    : activeTab === 'parceiro'
                    ? 'Código de Parceiro ou Email'
                    : 'Email de Administrador'}
                </label>
                <div className="relative">
                  <UserCheck className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder={
                      activeTab === 'cliente'
                        ? 'KVRA-XXXX-XXXX-XXXX, NIF ou Email'
                        : activeTab === 'parceiro'
                        ? 'PART-XXXX ou email@parceiro.ao'
                        : 'kivora.angola@gmail.com'
                    }
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full pl-11 pr-4 h-12 sm:h-13 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#FF6500] focus:ring-4 focus:ring-orange-500/10 rounded-xl text-sm text-slate-900 placeholder-slate-400 outline-none transition-all font-medium shadow-2xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Palavra-passe
                  </label>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-11 h-12 sm:h-13 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#FF6500] focus:ring-4 focus:ring-orange-500/10 rounded-xl text-sm text-slate-900 placeholder-slate-400 outline-none transition-all font-medium shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer transition-colors"
                    aria-label={showPassword ? 'Ocultar palavra-passe' : 'Mostrar palavra-passe'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3.5 bg-red-50/90 border border-red-200 rounded-xl text-xs sm:text-sm text-red-700 font-medium animate-fadeIn flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-2 shrink-0" />
                  <span className="leading-snug">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 sm:h-13 bg-[#FF6500] hover:bg-[#EB5B00] active:scale-[0.99] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/35 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>A autenticar...</span>
                  </>
                ) : (
                  <>
                    <span>Entrar no Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Botão de Destaque: Primeiro Acesso com Chave de Licença */}
              {activeTab === 'cliente' && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsFirstAccessMode(true);
                      setFirstKey(identifier.startsWith('KVRA-') ? identifier : '');
                      setFirstAccessError(null);
                    }}
                    className="w-full p-3 rounded-xl border border-dashed border-orange-300 bg-orange-50/60 hover:bg-orange-50 text-[#FF6500] flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer group"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#FF6500] group-hover:rotate-12 transition-transform" />
                    <span>Primeiro acesso? Ativar com Chave de Licença</span>
                  </button>
                </div>
              )}
            </form>
          )}

          {/* Cartão de Ajuda de Acesso */}
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#FF6500] shrink-0" />
              <span>Dificuldade para aceder à sua conta?</span>
            </div>
            <a
              href={`mailto:${KIVORA_INFO.supportEmail}`}
              className="text-[#FF6500] hover:text-[#EB5B00] font-bold hover:underline shrink-0"
            >
              Suporte Kivora
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
