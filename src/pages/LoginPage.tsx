import React, { useState } from 'react';
import { KivoraLogo } from '../components/KivoraLogo';
import { KIVORA_INFO } from '../data/kivoraData';
import { Lock, Building, ShieldCheck, ArrowRight, ArrowLeft, Key, Handshake } from 'lucide-react';

interface LoginPageProps {
  onBackToHome: () => void;
  onNavigatePage: (page: any) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onBackToHome, onNavigatePage }) => {
  const [portalType, setPortalType] = useState<'cliente' | 'parceiro'>('cliente');
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (portalType === 'cliente') {
      onNavigatePage('area-cliente');
    } else {
      onNavigatePage('area-parceiro');
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
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 space-y-6">
          
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <KivoraLogo variant="dark" size="lg" useOfficialImage={true} />
            </div>
            <h2 className="text-lg font-extrabold text-slate-900">
              {portalType === 'cliente' ? 'Área do Cliente Kivora' : 'Portal de Parceiros Revendedores'}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Aceda à sua conta online para gerir licenças, descarregar o Setup ou consultar comissões.
            </p>
          </div>

          {/* Notice Box: Site Login vs Software Login */}
          <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-100 text-[11px] text-blue-900 leading-relaxed space-y-1">
            <strong className="block text-blue-950 font-bold">Nota importante:</strong>
            <span>O login neste site é para gestão de licenças e downloads. O login no software KIVORA é realizado localmente no seu computador.</span>
          </div>

          {/* Portal Selector */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setPortalType('cliente')}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                portalType === 'cliente'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>Área do Cliente</span>
            </button>

            <button
              type="button"
              onClick={() => setPortalType('parceiro')}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                portalType === 'parceiro'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Handshake className="w-3.5 h-3.5" />
              <span>Portal Parceiro</span>
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                {portalType === 'cliente' ? 'NIF da Empresa ou Email' : 'Código de Parceiro ou Email'}
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder={portalType === 'cliente' ? 'Ex: 5412398765' : 'Ex: PARCEIRO-AO-042'}
                  value={formData.identifier}
                  onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-600 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Palavra-passe
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-600 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-sm transition-all text-xs flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-blue-200" />
              <span>Entrar na Minha Conta</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </form>

          <div className="pt-2 text-center text-[11px] text-slate-500 space-y-1">
            <p>Esqueceu a palavra-passe ou necessita de acesso?</p>
            <a href={`mailto:${KIVORA_INFO.supportEmail}`} className="text-blue-600 font-semibold hover:underline">
              Contactar Assistência Técnica Kivora
            </a>
          </div>

        </div>

      </div>
    </div>
  );
};
