import React, { useState, useEffect } from 'react';
import { KivoraLogo } from '../components/KivoraLogo';
import { KIVORA_INFO } from '../data/kivoraData';
import { Lock, ShieldCheck, ArrowRight, ArrowLeft, Loader2, UserCheck, Sparkles } from 'lucide-react';
import { loginUser, getStoredSession, KivoraUserSession } from '../admin/services/authService';

interface LoginPageProps {
  onBackToHome: () => void;
  onNavigatePage: (page: any) => void;
  onLoginSuccess?: (session: KivoraUserSession) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onBackToHome, onNavigatePage, onLoginSuccess }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
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

        // Redirecionamento com base no papel do utilizador
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 relative selection:bg-amber-500 selection:text-white">
      
      <div className="w-full max-w-xl relative z-10 space-y-4">
        
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200 transition-all shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-amber-500" />
            <span>Voltar ao Site</span>
          </button>
        </div>

        {/* Card Form */}
        <div className="bg-white border border-slate-200/90 rounded-3xl shadow-xl shadow-slate-900/5 p-8 sm:p-10 space-y-6">
          
          {/* Header with official logo without duplicate "KIVORA" text */}
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-1">
              <KivoraLogo variant="dark" size="lg" useOfficialImage={true} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Iniciar Sessão
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Acesso seguro para Administradores, Parceiros e Empresas Clientes.
            </p>
          </div>

          {/* Smart routing badge */}
          <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200/70 text-[11px] text-amber-900 leading-relaxed flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Identificação Automática:</strong> O sistema reconhece o seu perfil e direciona-o para o respetivo painel.
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email, NIF da Empresa ou Código
              </label>
              <div className="relative">
                <UserCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="Ex: seuemail@empresa.ao ou NIF"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none font-medium transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Palavra-passe
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none font-medium transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium animate-fadeIn">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-amber-500/20 transition-all text-xs flex items-center justify-center gap-2 disabled:bg-slate-300 cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>A validar credenciais...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-amber-100" />
                  <span>Entrar no Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>

          {/* Support Footnote */}
          <div className="text-center text-[11px] text-slate-500 pt-3 border-t border-slate-100">
            <p>Precisa de suporte ou recuperação de acesso?</p>
            <a href={`mailto:${KIVORA_INFO.supportEmail}`} className="text-amber-600 font-bold hover:underline block mt-0.5">
              Contactar Suporte Técnico
            </a>
          </div>

        </div>

      </div>
    </div>
  );
};
