import React, { useState, useEffect } from 'react';
import { KivoraLogo } from './KivoraLogo';
import { PageId } from './Header';
import { Phone, Mail, MapPin, ShieldCheck, Download } from 'lucide-react';
import { subscribeSystemSettings, getCachedSystemSettings, SystemCompanySettings } from '../services/systemSettingsService';

interface FooterProps {
  onNavigatePage?: (page: PageId) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigatePage }) => {
  const currentYear = new Date().getFullYear();
  const [settings, setSettings] = useState<SystemCompanySettings>(getCachedSystemSettings());

  useEffect(() => {
    const unsub = subscribeSystemSettings(setSettings);
    return () => unsub();
  }, []);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, page: PageId) => {
    e.preventDefault();
    if (onNavigatePage) {
      onNavigatePage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 text-xs print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Col 1: Brand & Official AGT Cert */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center">
              <KivoraLogo variant="light" size="md" useOfficialImage={true} />
            </div>

            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              {settings.fullName}. Software certificado para emissão local de documentos fiscais e conformidade integral com o Decreto Presidencial n.º 71/25 da República de Angola.
            </p>

            <div className="flex items-center gap-2 p-3 bg-slate-900 rounded-xl border border-slate-800 text-slate-300 w-fit">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" strokeWidth={1.75} />
              <span className="text-[11px] font-semibold">{settings.agtCertificate}</span>
            </div>
          </div>

          {/* Col 2: Software & Ferramentas */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-white uppercase tracking-wider text-[11px]">
              Software & Ferramentas
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#faturacao"
                  onClick={(e) => handleLinkClick(e, 'faturacao')}
                  className="hover:text-white transition-colors"
                >
                  Faturação Eletrónica AGT
                </a>
              </li>
              <li>
                <a
                  href="#pos"
                  onClick={(e) => handleLinkClick(e, 'pos')}
                  className="hover:text-white transition-colors"
                >
                  Ponto de Venda (POS) Local
                </a>
              </li>
              <li>
                <a
                  href="#stock"
                  onClick={(e) => handleLinkClick(e, 'stock')}
                  className="hover:text-white transition-colors"
                >
                  Stock & Armazéns
                </a>
              </li>
              <li>
                <a
                  href="#rh"
                  onClick={(e) => handleLinkClick(e, 'rh')}
                  className="hover:text-white transition-colors"
                >
                  Recursos Humanos & IRT 2026
                </a>
              </li>
              <li>
                <a
                  href="#loja"
                  onClick={(e) => handleLinkClick(e, 'loja')}
                  className="hover:text-white text-amber-400 font-bold transition-colors"
                >
                  Loja Oficial de Equipamentos & Kits
                </a>
              </li>
              <li>
                <a
                  href="#calculadora-fiscal"
                  onClick={(e) => handleLinkClick(e, 'calculadora-fiscal')}
                  className="hover:text-white text-emerald-400 font-semibold transition-colors"
                >
                  Calculadora Fiscal IRT & IVA
                </a>
              </li>
              <li>
                <a
                  href="#comparativo"
                  onClick={(e) => handleLinkClick(e, 'comparativo')}
                  className="hover:text-white text-blue-400 font-semibold transition-colors"
                >
                  Comparativo vs Nuvem / Dólar
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

          {/* Col 3: Empresa, Parceiros & Segurança */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-white uppercase tracking-wider text-[11px]">
              Soluções & Confiança
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#guia-agt"
                  onClick={(e) => handleLinkClick(e, 'guia-agt')}
                  className="hover:text-white text-emerald-400 font-bold transition-colors"
                >
                  Guia Oficial AGT & Decreto 71/25
                </a>
              </li>
              <li>
                <a
                  href="#manuais"
                  onClick={(e) => handleLinkClick(e, 'manuais')}
                  className="hover:text-white text-blue-400 font-bold transition-colors"
                >
                  Central de Manuais & Tutoriais
                </a>
              </li>
              <li>
                <a
                  href="#simulador-roi"
                  onClick={(e) => handleLinkClick(e, 'simulador-roi')}
                  className="hover:text-white text-amber-400 font-bold transition-colors"
                >
                  Simulador de Poupança (ROI)
                </a>
              </li>
              <li>
                <a
                  href="#casos-sucesso"
                  onClick={(e) => handleLinkClick(e, 'casos-sucesso')}
                  className="hover:text-white text-emerald-300 font-medium transition-colors"
                >
                  Casos de Sucesso em Angola
                </a>
              </li>
              <li>
                <a
                  href="#seguranca"
                  onClick={(e) => handleLinkClick(e, 'seguranca')}
                  className="hover:text-white text-indigo-300 font-medium transition-colors"
                >
                  Centro de Cibersegurança
                </a>
              </li>
              <li>
                <a
                  href="#hardware"
                  onClick={(e) => handleLinkClick(e, 'hardware')}
                  className="hover:text-white text-amber-400 font-semibold transition-colors"
                >
                  Hardware & Impressoras
                </a>
              </li>
              <li>
                <a
                  href="#planos"
                  onClick={(e) => handleLinkClick(e, 'planos')}
                  className="hover:text-white transition-colors"
                >
                  Licenças e Preços (Simulador)
                </a>
              </li>
              <li>
                <a
                  href="#diretorio-parceiros"
                  onClick={(e) => handleLinkClick(e, 'diretorio-parceiros')}
                  className="hover:text-white text-blue-300 font-medium transition-colors"
                >
                  Diretório Nacional de Parceiros
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
                  href="#validar-licenca"
                  onClick={(e) => handleLinkClick(e, 'validar-licenca')}
                  className="hover:text-white text-emerald-400 font-bold transition-colors flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Validar Licença AGT</span>
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
                <a href={settings.whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-white hover:text-blue-400 font-medium transition-colors">
                  {settings.phoneDisplay}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" strokeWidth={1.75} />
                <a href={`mailto:${settings.email}`} className="hover:text-white transition-colors">
                  {settings.email}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" strokeWidth={1.75} />
                <span>{settings.address}</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-10 mt-10 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <p>
            © {currentYear} {settings.company}. Todos os direitos reservados.
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
          </div>
        </div>

      </div>
    </footer>
  );
};
