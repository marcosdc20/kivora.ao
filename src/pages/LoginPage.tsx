import React, { useState } from 'react';
import { KivoraLogo } from '../components/KivoraLogo';
import { KIVORA_INFO } from '../data/kivoraData';
import { Lock, ShieldCheck, ArrowRight, ArrowLeft, Loader2, UserCheck, Sparkles } from 'lucide-react';
import { loginUser, KivoraUserSession } from '../admin/services/authService';

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

        // Redirecionamento inteligente com base na função do utilizador
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
      setError('Erro de ligação ao Firebase: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative selection:bg-blue-600 selection:text-white">
      
      <div className="w-full max-w-md relative z-10 space-y-6">
        
        {/* Back link */}
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200 transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Site Principal</span>
        </button>

        {/* Card Form */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-8 space-y-6">
          
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <KivoraLogo variant="dark" size="lg" useOfficialImage={true} />
            </div>
            <h2 className="text-xl font-black text-slate-900">
              Iniciar Sessão no Ecossistema Kivora
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Acesso unificado para Administradores, Parceiros Revendedores e Empresas Clientes.
            </p>
          </div>

          {/* Smart routing badge */}
          <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 text-[11px] text-blue-900 leading-relaxed flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              <strong>Identificação Automática:</strong> O sistema reconhece o seu perfil e direciona-o instantaneamente para o seu portal correspondente.
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Email, NIF da Empresa ou Código
              </label>
              <div className="relative">
                <UserCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="Ex: seuemail@empresa.ao ou NIF"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-600 outline-none font-medium transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Palavra-passe
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-600 outline-none font-medium transition-all"
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
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-blue-600/20 transition-all text-xs flex items-center justify-center gap-2 disabled:bg-slate-300"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>A validar credenciais no Firebase...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-blue-200" />
                  <span>Entrar no Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>

          <div className="text-center text-[11px] text-slate-500 pt-1 border-t border-slate-100">
            <p>Precisa de suporte ou recuperação de acesso?</p>
            <a href={`mailto:${KIVORA_INFO.supportEmail}`} className="text-blue-600 font-semibold hover:underline block mt-0.5">
              Contactar Equipa Kivora
            </a>
          </div>

        </div>

      </div>
    </div>
  );
};
