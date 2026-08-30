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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">

          {/* Col 1: Brand & Official AGT Cert */}
          <div className="sm:col-span-2 lg:col-span-1 space-y-4">
            <div className="flex items-center">
              <KivoraLogo variant="light" size="md" useOfficialImage={true} />
            </div>

            <p className="text-slate-300 text-xs leading-relaxed">
              {settings.fullName}. Software executivo de faturação eletrónica certificado pela AGT em Angola ao abrigo do Decreto Presidencial n.º 71/25.
            </p>

            <div className="flex items-center gap-2 p-3 bg-slate-900 rounded-xl border border-slate-800 text-slate-200 w-fit">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" strokeWidth={2} />
              <span className="text-[11px] font-bold font-mono text-emerald-400">Certificação AGT: FE/440/AGT/2026</span>
            </div>
          </div>

          {/* Col 2: Produtos & Módulos */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-white uppercase tracking-wider text-[11px]">
              Produtos & Módulos
            </h4>
            <ul className="space-y-2 text-slate-400">
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
                  Ponto de Venda (POS) Caixa
                </a>
              </li>
              <li>
                <a
                  href="#stock"
                  onClick={(e) => handleLinkClick(e, 'stock')}
                  className="hover:text-white transition-colors"
                >
                  Gestão de Stocks & Armazém
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
                  href="#contabilidade"
                  onClick={(e) => handleLinkClick(e, 'contabilidade')}
                  className="hover:text-white transition-colors"
                >
                  Contabilidade & SAF-T AO
                </a>
              </li>
              <li>
                <a
                  href="#hardware"
                  onClick={(e) => handleLinkClick(e, 'hardware')}
                  className="hover:text-white transition-colors"
                >
                  Hardware & Impressoras 80mm
                </a>
              </li>
              <li>
                <a
                  href="#download"
                  onClick={(e) => handleLinkClick(e, 'download')}
                  className="text-blue-400 font-bold hover:text-blue-300 transition-colors flex items-center gap-1 mt-1"
                >
                  <Download className="w-3.5 h-3.5" strokeWidth={1.75} />
                  <span>Baixar Instalador Windows</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Setores & Soluções */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-white uppercase tracking-wider text-[11px]">
              Setores & Casos Reais
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <a
                  href="#retalho"
                  onClick={(e) => handleLinkClick(e, 'retalho')}
                  className="hover:text-white transition-colors"
                >
                  Retalho & Supermercados
                </a>
              </li>
              <li>
                <a
                  href="#restauracao"
                  onClick={(e) => handleLinkClick(e, 'restauracao')}
                  className="hover:text-white transition-colors"
                >
                  Restauração & Bares
                </a>
              </li>
              <li>
                <a
                  href="#farmacia"
                  onClick={(e) => handleLinkClick(e, 'farmacia')}
                  className="hover:text-white transition-colors"
                >
                  Farmácias & Saúde
                </a>
              </li>
              <li>
                <a
                  href="#servicos"
                  onClick={(e) => handleLinkClick(e, 'servicos')}
                  className="hover:text-white transition-colors"
                >
                  Prestação de Serviços
                </a>
              </li>
              <li>
                <a
                  href="#casos-sucesso"
                  onClick={(e) => handleLinkClick(e, 'casos-sucesso')}
                  className="hover:text-white text-emerald-400 font-medium transition-colors"
                >
                  Casos de Sucesso em Angola
                </a>
              </li>
              <li>
                <a
                  href="#seguranca"
                  onClick={(e) => handleLinkClick(e, 'seguranca')}
                  className="hover:text-white transition-colors"
                >
                  Centro de Cibersegurança
                </a>
              </li>
              <li>
                <a
                  href="#sobre"
                  onClick={(e) => handleLinkClick(e, 'sobre')}
                  className="hover:text-white transition-colors"
                >
                  Sobre a Visual Software
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Preços & Recursos Fiscais */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-white uppercase tracking-wider text-[11px]">
              Preços & Fisco AGT
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <a
                  href="#planos"
                  onClick={(e) => handleLinkClick(e, 'planos')}
                  className="hover:text-white font-semibold text-slate-200 transition-colors"
                >
                  Licenças e Preços em Kwanzas
                </a>
              </li>
              <li>
                <a
                  href="#simulador-roi"
                  onClick={(e) => handleLinkClick(e, 'simulador-roi')}
                  className="hover:text-white transition-colors"
                >
                  Simulador de Poupança (ROI)
                </a>
              </li>
              <li>
                <a
                  href="#comparativo"
                  onClick={(e) => handleLinkClick(e, 'comparativo')}
                  className="hover:text-white transition-colors"
                >
                  Comparativo vs Nuvem / Dólar
                </a>
              </li>
              <li>
                <a
                  href="#guia-agt"
                  onClick={(e) => handleLinkClick(e, 'guia-agt')}
                  className="hover:text-white text-emerald-400 font-medium transition-colors"
                >
                  Guia Oficial Decreto 71/25
                </a>
              </li>
              <li>
                <a
                  href="#calculadora-fiscal"
                  onClick={(e) => handleLinkClick(e, 'calculadora-fiscal')}
                  className="hover:text-white transition-colors"
                >
                  Calculadora Fiscal IRT & IVA
                </a>
              </li>
              <li>
                <a
                  href="#manuais"
                  onClick={(e) => handleLinkClick(e, 'manuais')}
                  className="hover:text-white transition-colors"
                >
                  Central de Manuais & Tutoriais
                </a>
              </li>
              <li>
                <a
                  href="#validar-licenca"
                  onClick={(e) => handleLinkClick(e, 'validar-licenca')}
                  className="hover:text-white text-emerald-400 font-semibold transition-colors flex items-center gap-1"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Validar Licença Oficial</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Col 5: Atendimento & Rede Nacional */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-white uppercase tracking-wider text-[11px]">
              Rede Nacional & Contactos
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <a
                  href="#diretorio-parceiros"
                  onClick={(e) => handleLinkClick(e, 'diretorio-parceiros')}
                  className="hover:text-white transition-colors"
                >
                  Diretório de Técnicos & Parceiros
                </a>
              </li>
              <li>
                <a
                  href="#provincias"
                  onClick={(e) => handleLinkClick(e, 'provincias')}
                  className="hover:text-white transition-colors"
                >
                  Presença nas 18 Províncias
                </a>
              </li>
              <li>
                <a
                  href="#parceiros"
                  onClick={(e) => handleLinkClick(e, 'parceiros')}
                  className="hover:text-white transition-colors"
                >
                  Programa de Parceiros & Revenda
                </a>
              </li>
              <li className="pt-2 border-t border-slate-900 flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-blue-400 shrink-0" strokeWidth={1.75} />
                <a href={settings.whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-white hover:text-blue-400 font-semibold transition-colors">
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
        <div className="pt-10 mt-10 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400 text-[11px]">
          <p>
            © {currentYear} {settings.company}. Todos os direitos reservados. Certificação AGT N.º FE/440/AGT/2026.
          </p>
          <div className="flex items-center gap-6">
            <a
              href="#privacidade"
              onClick={(e) => handleLinkClick(e, 'privacidade')}
              className="hover:text-white transition-colors"
            >
              Privacidade (Lei n.º 22/11)
            </a>
            <a
              href="#termos"
              onClick={(e) => handleLinkClick(e, 'termos')}
              className="hover:text-white transition-colors"
            >
              Termos de Licenciamento
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};
