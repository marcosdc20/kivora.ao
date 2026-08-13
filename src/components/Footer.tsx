import React from 'react';
import { KivoraLogo } from './KivoraLogo';
import { KIVORA_INFO } from '../data/kivoraData';
import { PageId } from './Header';
import { Phone, Mail, MapPin, ShieldCheck, Download } from 'lucide-react';

interface FooterProps {
  onNavigatePage?: (page: PageId) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigatePage }) => {
  const currentYear = new Date().getFullYear();

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, page: PageId) => {
    e.preventDefault();
    if (onNavigatePage) {
      onNavigatePage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Col 1: Brand & Official AGT Cert */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center">
              <KivoraLogo variant="light" size="md" useOfficialImage={true} />
            </div>

            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              {KIVORA_INFO.fullName}. Software certificado pela AGT para emissão local de documentos comerciais e conformidade com o Decreto Presidencial n.º 71/25.
            </p>

            <div className="flex items-center gap-2 p-3 bg-slate-900 rounded-xl border border-slate-800 text-slate-300 w-fit">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" strokeWidth={1.75} />
              <span className="text-[11px] font-semibold">{KIVORA_INFO.agtCertificate}</span>
            </div>
          </div>

          {/* Col 2: Software & Módulos */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-white uppercase tracking-wider text-[11px]">
              Software & Módulos
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#funcionalidades"
                  onClick={(e) => handleLinkClick(e, 'funcionalidades')}
                  className="hover:text-white transition-colors"
                >
                  Faturação Eletrónica AGT
                </a>
              </li>
              <li>
                <a
                  href="#pos"
                  onClick={(e) => handleLinkClick(e, 'funcionalidades')}
                  className="hover:text-white transition-colors"
                >
                  Ponto de Venda (POS) Local
                </a>
              </li>
              <li>
                <a
                  href="#solucoes"
                  onClick={(e) => handleLinkClick(e, 'solucoes')}
                  className="hover:text-white transition-colors"
                >
                  Modo Rede Local (LAN)
                </a>
              </li>
              <li>
                <a
                  href="#download"
                  onClick={(e) => handleLinkClick(e, 'download')}
                  className="text-blue-400 font-bold hover:text-blue-300 transition-colors flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" strokeWidth={1.75} />
                  <span>Baixar KIVORA Setup</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Empresa & Parceiros */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-white uppercase tracking-wider text-[11px]">
              Empresa & Parcerias
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#planos"
                  onClick={(e) => handleLinkClick(e, 'planos')}
                  className="hover:text-white transition-colors"
                >
                  Licenças e Preços
                </a>
              </li>
              <li>
                <a
                  href="#parceiros"
                  onClick={(e) => handleLinkClick(e, 'parceiros')}
                  className="hover:text-white transition-colors"
                >
                  Programa de Revendedores
                </a>
              </li>
              <li>
                <a
                  href="#recursos"
                  onClick={(e) => handleLinkClick(e, 'recursos')}
                  className="hover:text-white transition-colors"
                >
                  Base de Conhecimento
                </a>
              </li>
              <li>
                <a
                  href="#suporte"
                  onClick={(e) => handleLinkClick(e, 'suporte')}
                  className="hover:text-white transition-colors"
                >
                  Suporte Técnico
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Contacto em Angola */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-white uppercase tracking-wider text-[11px]">
              Atendimento em Angola
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-blue-400 shrink-0" strokeWidth={1.75} />
                <span className="text-white font-medium">{KIVORA_INFO.phoneDisplay}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" strokeWidth={1.75} />
                <span>{KIVORA_INFO.email}</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" strokeWidth={1.75} />
                <span>{KIVORA_INFO.address}</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-10 mt-10 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <p>
            © {currentYear} {KIVORA_INFO.company}. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-6">
            <a
              href="#privacidade"
              onClick={(e) => handleLinkClick(e, 'privacidade')}
              className="hover:text-slate-300 transition-colors"
            >
              Privacidade de Dados
            </a>
            <a
              href="#termos"
              onClick={(e) => handleLinkClick(e, 'termos')}
              className="hover:text-slate-300 transition-colors"
            >
              Termos de Licenciamento
            </a>
            <a
              href="#admin"
              onClick={(e) => handleLinkClick(e, 'admin')}
              className="hover:text-slate-600 transition-colors text-slate-800 text-[10px]"
              title="Acesso Admin"
            >
              Admin
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};
