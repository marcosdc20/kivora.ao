import React, { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, ArrowUp, Facebook, Instagram, MessageSquare } from 'lucide-react';
import { KivoraLogo } from './KivoraLogo';
import { SCHOOL_INFO } from '../data/school';

interface FooterProps {
  onNavigatePage?: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigatePage }) => {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace('#', '');

    if (onNavigatePage) {
      if (targetId === 'sobre-nos' || targetId === 'sobre') onNavigatePage('sobre');
      else if (targetId === 'equipe' || targetId === 'equipa') onNavigatePage('equipe');
      else if (targetId === 'alunos') onNavigatePage('alunos');
      else if (targetId === 'modulos') onNavigatePage('modulos');
      else if (targetId === 'turmas') onNavigatePage('turmas');
      else if (targetId === 'noticias') onNavigatePage('noticias');
      else if (targetId === 'financeiro') onNavigatePage('financeiro');
      else if (targetId === 'suporte') onNavigatePage('suporte');
      else onNavigatePage('home');
      return;
    }

    const element = document.getElementById(targetId);
    if (element) {
      const headerOffset = 90;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-brand-navy text-white pt-16 pb-8 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 pb-12 border-b border-slate-800">

          {/* Column 1: Brand Info (col-span-4) */}
          <div className="lg:col-span-4 space-y-4">
            <a href="#inicio" onClick={(e) => handleLinkClick(e, '#inicio')} className="inline-block">
              <KivoraLogo size="lg" variant="white" />
            </a>

            <p className="text-sm text-slate-300 leading-relaxed max-w-sm">
              A Kivora é o ecossistema líder em soluções tecnológicas e plataformas de gestão integrada em Angola. Inovação, segurança e eficiência para a sua organização.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href={SCHOOL_INFO.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-blue-500/20 text-blue-400 hover:bg-brand-blue hover:text-white flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>

              <a
                href={SCHOOL_INFO.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-amber-500/20 text-brand-amber hover:bg-brand-amber hover:text-white flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>

              <a
                href={SCHOOL_INFO.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-blue-500/20 text-blue-400 hover:bg-brand-blue hover:text-white flex items-center justify-center transition-colors"
                aria-label="WhatsApp"
              >
                <MessageSquare className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Navegação (col-span-2) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">
              Navegação
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
              <li><a href="#inicio" onClick={(e) => handleLinkClick(e, '#inicio')} className="hover:text-brand-amber transition-colors">Início</a></li>
              <li><a href="#sobre" onClick={(e) => handleLinkClick(e, '#sobre-nos')} className="hover:text-brand-amber transition-colors">Sobre a Kivora</a></li>
              <li><a href="#equipe" onClick={(e) => handleLinkClick(e, '#equipe')} className="hover:text-brand-amber transition-colors">Nossa Equipa</a></li>
              <li><a href="#alunos" onClick={(e) => handleLinkClick(e, '#alunos')} className="hover:text-brand-amber transition-colors">Gestão de Alunos</a></li>
              <li><a href="#modulos" onClick={(e) => handleLinkClick(e, '#modulos')} className="hover:text-brand-amber transition-colors">Módulos</a></li>
              <li><a href="#turmas" onClick={(e) => handleLinkClick(e, '#turmas')} className="hover:text-brand-amber transition-colors">Turmas</a></li>
              <li><a href="#noticias" onClick={(e) => handleLinkClick(e, '#noticias')} className="hover:text-brand-amber transition-colors">Notícias</a></li>
              <li><a href="#suporte" onClick={(e) => handleLinkClick(e, '#suporte')} className="hover:text-brand-amber transition-colors">Suporte</a></li>
            </ul>
          </div>

          {/* Column 3: Módulos (col-span-3) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">
              Soluções & Módulos
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
              <li><a href="#modulos" onClick={(e) => handleLinkClick(e, '#modulos')} className="hover:text-brand-amber transition-colors">Gestão de Alunos & Matrículas</a></li>
              <li><a href="#modulos" onClick={(e) => handleLinkClick(e, '#modulos')} className="hover:text-brand-amber transition-colors">Gestão de Turmas & Horários</a></li>
              <li><a href="#modulos" onClick={(e) => handleLinkClick(e, '#modulos')} className="hover:text-brand-amber transition-colors">Controlo de Presenças Digital</a></li>
              <li><a href="#modulos" onClick={(e) => handleLinkClick(e, '#modulos')} className="hover:text-brand-amber transition-colors">Avaliações & Boletins em PDF</a></li>
              <li><a href="#financeiro" onClick={(e) => handleLinkClick(e, '#financeiro')} className="hover:text-brand-amber transition-colors">Gestão Financeira & Recibos</a></li>
              <li><a href="#modulos" onClick={(e) => handleLinkClick(e, '#modulos')} className="hover:text-brand-amber transition-colors">Relatórios & Analytics</a></li>
            </ul>
          </div>

          {/* Column 4: Contactos (col-span-3) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">
              Contacte-nos
            </h4>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-amber shrink-0 mt-0.5" />
                <span>{SCHOOL_INFO.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand-amber shrink-0" />
                <a href={`tel:${SCHOOL_INFO.phoneRaw}`} className="hover:text-brand-amber transition-colors font-mono">
                  {SCHOOL_INFO.phoneDisplay}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-amber shrink-0" />
                <a href={`mailto:${SCHOOL_INFO.email}`} className="hover:text-brand-amber transition-colors break-all">
                  {SCHOOL_INFO.email}
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Rights & Legal Pages Row */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            © {new Date().getFullYear()} Kivora – Soluções Tecnológicas. Todos os direitos reservados.
          </div>

          <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
            <button
              onClick={() => onNavigatePage && onNavigatePage('privacidade')}
              className="hover:text-brand-amber transition-colors underline"
            >
              Política de Privacidade
            </button>
            <span>•</span>
            <button
              onClick={() => onNavigatePage && onNavigatePage('termos')}
              className="hover:text-brand-amber transition-colors underline"
            >
              Termos de Uso
            </button>
          </div>
        </div>

      </div>

      {/* Floating Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-brand-blue hover:bg-brand-blue-dark text-white shadow-xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95 border border-blue-400/30"
          aria-label="Voltar ao topo"
        >
          <ArrowUp className="w-6 h-6 text-brand-amber" />
        </button>
      )}
    </footer>
  );
};
