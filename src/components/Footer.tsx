import React, { useState, useEffect } from 'react';
import { KivoraLogo } from './KivoraLogo';
import { PageId } from './Header';
import {
  Phone, Mail, MapPin, ShieldCheck, Download,
  ChevronRight, MessageCircle
} from 'lucide-react';
import { FaFacebookF, FaLinkedinIn, FaInstagram, FaWhatsapp } from 'react-icons/fa';
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
    <footer className="bg-[#0B1528] text-slate-300 border-t border-slate-800 text-xs print:hidden font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">

          {/* Col 1: Brand & Social Links (Padrão XTRA das Imagens) */}
          <div className="space-y-5">
            <div className="flex items-center">
              <KivoraLogo variant="light" size="md" useOfficialImage={true} />
            </div>

            <p className="text-slate-400 text-xs leading-relaxed font-normal">
              {settings.fullName || 'Visual Software & Kivora Soft'}. Desenvolvemos software executivo de faturação eletrónica certificado pela AGT em Angola (Decreto Presidencial n.º 71/25), com base de dados local offline e rede LAN.
            </p>

            <div className="inline-flex items-center gap-2 p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 text-slate-200 shadow-xs">
              <ShieldCheck className="w-4 h-4 text-[#FF6500] shrink-0" strokeWidth={2.2} />
              <span className="text-[11px] font-bold font-mono-num text-orange-400">Homologação AGT: FE/387/AGT/2026</span>
            </div>

            {/* Redes Sociais com Botões Circulares Laranja (Padrão das Imagens) */}
            <div className="pt-2 flex items-center gap-2.5">
              <a
                href={settings.facebookUrl || 'https://facebook.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-[#FF6500] hover:bg-[#EB5B00] text-white flex items-center justify-center transition-all shadow-sm shadow-orange-500/20 hover:scale-105"
                aria-label="Facebook"
              >
                <FaFacebookF className="w-3.5 h-3.5" />
              </a>
              <a
                href={settings.whatsappUrl || 'https://wa.me/244974855494'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-[#FF6500] hover:bg-[#EB5B00] text-white flex items-center justify-center transition-all shadow-sm shadow-orange-500/20 hover:scale-105"
                aria-label="WhatsApp"
              >
                <FaWhatsapp className="w-3.5 h-3.5" />
              </a>
              <a
                href={settings.linkedinUrl || 'https://linkedin.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-[#FF6500] hover:bg-[#EB5B00] text-white flex items-center justify-center transition-all shadow-sm shadow-orange-500/20 hover:scale-105"
                aria-label="LinkedIn"
              >
                <FaLinkedinIn className="w-3.5 h-3.5" />
              </a>
              <a
                href={settings.instagramUrl || 'https://instagram.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-[#FF6500] hover:bg-[#EB5B00] text-white flex items-center justify-center transition-all shadow-sm shadow-orange-500/20 hover:scale-105"
                aria-label="Instagram"
              >
                <FaInstagram className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Col 2: Useful Links (Links Úteis com Marcadores em Seta Laranja - Padrão XTRA) */}
          <div className="space-y-4">
            <h4 className="font-bold font-display text-white text-sm tracking-tight border-b border-slate-800 pb-2.5 flex items-center gap-2">
              <span className="w-1.5 h-3.5 bg-[#FF6500] rounded-full inline-block" />
              <span>Links Úteis</span>
            </h4>
            <ul className="space-y-2.5 text-slate-300">
              {[
                { name: 'Sobre a Empresa', page: 'sobre' },
                { name: 'Tabela de Preços & Planos', page: 'planos' },
                { name: 'Validador de Licença Oficial', page: 'validar-licenca' },
                { name: 'Guia Fiscal Decreto 71/25', page: 'guia-agt' },
                { name: 'Calculadora Fiscal IRT & IVA', page: 'calculadora-fiscal' },
                { name: 'Simulador de Poupança (ROI)', page: 'simulador-roi' },
                { name: 'Casos de Sucesso em Angola', page: 'casos-sucesso' },
                { name: 'Programa de Parceiros', page: 'parceiros' },
              ].map((item, idx) => (
                <li key={idx}>
                  <a
                    href={`#${item.page}`}
                    onClick={(e) => handleLinkClick(e, item.page as PageId)}
                    className="hover:text-orange-400 transition-colors flex items-center gap-2 group"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-[#FF6500] group-hover:translate-x-1 transition-transform shrink-0" />
                    <span>{item.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Soluções & Módulos Integrados */}
          <div className="space-y-4">
            <h4 className="font-bold font-display text-white text-sm tracking-tight border-b border-slate-800 pb-2.5 flex items-center gap-2">
              <span className="w-1.5 h-3.5 bg-[#FF6500] rounded-full inline-block" />
              <span>Módulos KIVORA</span>
            </h4>
            <ul className="space-y-2.5 text-slate-300">
              {[
                { name: 'Faturação Eletrónica AGT DS.120', page: 'faturacao' },
                { name: 'Ponto de Venda (POS) Caixa', page: 'pos' },
                { name: 'Gestão de Stocks & Multi-Armazém', page: 'stock' },
                { name: 'Recursos Humanos & IRT 2026', page: 'rh' },
                { name: 'Contabilidade & SAF-T AO', page: 'contabilidade' },
                { name: 'Hardware & Impressoras 80mm', page: 'hardware' },
                { name: 'Loja Oficial de Equipamentos', page: 'loja' },
                { name: 'Central de Suporte & Manuais', page: 'suporte' },
              ].map((item, idx) => (
                <li key={idx}>
                  <a
                    href={`#${item.page}`}
                    onClick={(e) => handleLinkClick(e, item.page as PageId)}
                    className="hover:text-orange-400 transition-colors flex items-center gap-2 group"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-[#FF6500] group-hover:translate-x-1 transition-transform shrink-0" />
                    <span>{item.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Escritório & Contactos Oficiais (Ícones Circulares Laranja - Padrão XTRA) */}
          <div className="space-y-4">
            <h4 className="font-bold font-display text-white text-sm tracking-tight border-b border-slate-800 pb-2.5 flex items-center gap-2">
              <span className="w-1.5 h-3.5 bg-[#FF6500] rounded-full inline-block" />
              <span>Escritório & Suporte</span>
            </h4>
            
            <ul className="space-y-3.5 text-slate-300">
              {/* Morada */}
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#FF6500] text-white flex items-center justify-center shrink-0 shadow-sm shadow-orange-500/20 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Sede Principal:</span>
                  <span className="text-white text-xs leading-snug">{settings.address || 'Edifício Kivora, Luanda, Angola'}</span>
                </div>
              </li>

              {/* Telefone */}
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#FF6500] text-white flex items-center justify-center shrink-0 shadow-sm shadow-orange-500/20">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Linha Telefónica:</span>
                  <a
                    href={`tel:${settings.phoneRaw || '+244974855494'}`}
                    className="text-white hover:text-orange-400 font-bold font-mono-num transition-colors text-xs"
                  >
                    {settings.phoneDisplay || '+244 974 855 494'}
                  </a>
                </div>
              </li>

              {/* Email */}
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#FF6500] text-white flex items-center justify-center shrink-0 shadow-sm shadow-orange-500/20">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Email Comercial:</span>
                  <a
                    href={`mailto:${settings.email || 'comercial@kivora.ao'}`}
                    className="text-white hover:text-orange-400 transition-colors text-xs font-medium"
                  >
                    {settings.email || 'comercial@kivora.ao'}
                  </a>
                </div>
              </li>

              {/* WhatsApp */}
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-sm">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Atendimento WhatsApp:</span>
                  <a
                    href={settings.whatsappUrl || 'https://wa.me/244974855494'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-emerald-400 font-bold transition-colors text-xs"
                  >
                    Assistência Imediata
                  </a>
                </div>
              </li>
            </ul>

            <div className="pt-2">
              <a
                href="#download"
                onClick={(e) => handleLinkClick(e, 'download')}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#FF6500] hover:bg-[#EB5B00] active:scale-95 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md shadow-orange-500/20 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Baixar Instalador KIVORA</span>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Legal */}
        <div className="pt-8 mt-12 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400 text-[11px] text-center sm:text-left">
          <p>
            © {currentYear} {settings.company || 'KIVORA SOFT'}. Todos os direitos reservados. Software Homologado AGT N.º <span className="font-mono-num text-orange-400 font-bold">FE/387/AGT/2026</span>.
          </p>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-4 sm:gap-6">
            <a
              href="#privacidade"
              onClick={(e) => handleLinkClick(e, 'privacidade')}
              className="hover:text-orange-400 transition-colors"
            >
              Privacidade (Lei n.º 22/11)
            </a>
            <a
              href="#termos"
              onClick={(e) => handleLinkClick(e, 'termos')}
              className="hover:text-orange-400 transition-colors"
            >
              Termos de Licenciamento
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};

