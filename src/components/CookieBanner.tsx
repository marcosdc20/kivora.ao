import React, { useState, useEffect } from 'react';
import { ShieldCheck, X, ChevronRight } from 'lucide-react';

interface CookieBannerProps {
  onNavigatePrivacy?: () => void;
}

export const CookieBanner: React.FC<CookieBannerProps> = ({ onNavigatePrivacy }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Verifica se o consentimento já foi registado
    const consent = localStorage.getItem('kivora_cookie_consent');
    if (!consent) {
      // Delay suave de 1.5s após a página carregar para uma experiência limpa
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('kivora_cookie_consent', 'all');
    localStorage.setItem('kivora_cookie_consent_date', new Date().toISOString());
    setVisible(false);
  };

  const handleAcceptEssential = () => {
    localStorage.setItem('kivora_cookie_consent', 'essential');
    localStorage.setItem('kivora_cookie_consent_date', new Date().toISOString());
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <aside
      role="region"
      aria-label="Consentimento de cookies e privacidade"
      className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md z-50 animate-fadeIn"
    >
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-5 shadow-2xl text-white space-y-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-black text-white">Privacidade & Cookies</h4>
              <p className="text-[10px] text-slate-400 font-medium">KIVORA Technologies Angola</p>
            </div>
          </div>
          <button
            onClick={handleAcceptEssential}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            aria-label="Fechar e manter apenas essenciais"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed font-normal">
          Utilizamos cookies essenciais para garantir a segurança, autenticação e bom funcionamento do portal KIVORA, em conformidade com a legislação de proteção de dados.
        </p>

        {onNavigatePrivacy && (
          <div>
            <button
              onClick={() => {
                setVisible(false);
                onNavigatePrivacy();
              }}
              className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 font-bold transition-colors cursor-pointer"
            >
              <span>Consultar Política de Privacidade</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleAcceptAll}
            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2.5 px-3 rounded-xl transition-all shadow-md shadow-blue-600/25 cursor-pointer text-center"
          >
            Aceitar Todos
          </button>
          <button
            onClick={handleAcceptEssential}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs py-2.5 px-3 rounded-xl transition-all border border-slate-700 cursor-pointer text-center"
          >
            Apenas Essenciais
          </button>
        </div>
      </div>
    </aside>
  );
};
