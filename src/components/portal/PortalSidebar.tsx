import React from 'react';
import { X } from 'lucide-react';
import { KivoraLogo } from '../KivoraLogo';

export type PortalBadgeTone = 'orange' | 'emerald' | 'amber' | 'red' | 'slate';

export interface PortalNavChild<T extends string> {
  id: T;
  label: string;
}

export interface PortalNavItem<T extends string> {
  id: T;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
  badgeTone?: PortalBadgeTone;
  /** Sub-itens só aparecem quando o item pai está activo, para manter o menu curto. */
  children?: PortalNavChild<T>[];
}

export interface PortalNavGroup<T extends string> {
  title?: string;
  items: PortalNavItem<T>[];
}

interface PortalSidebarProps<T extends string> {
  /** Etiqueta curta por baixo do logótipo (ex.: "Administração"). */
  portalLabel: string;
  groups: PortalNavGroup<T>[];
  activeId: T;
  onSelect: (id: T) => void;
  /** Fecha o drawer em mobile; quando definido mostra o botão de fecho. */
  onClose?: () => void;
  /** Bloco de identidade (utilizador / empresa) por baixo do logótipo. */
  identity?: React.ReactNode;
  /** Acções de rodapé (sessão, site público, etc.). */
  footer?: React.ReactNode;
}

const BADGE_TONES: Record<PortalBadgeTone, string> = {
  orange: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
  emerald: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  amber: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
  red: 'bg-red-500/20 text-red-400 border border-red-500/30',
  slate: 'bg-slate-800 text-slate-300 border border-slate-700',
};

/**
 * Sidebar única para Admin, Parceiro e Cliente:
 * Estilo executivo em azul-noite (#0A192F), eliminando fadiga visual (glare),
 * com alto contraste WCAG AAA, destaques em Laranja Kivora (#FF6500) e tipografia sóbria.
 */
export function PortalSidebar<T extends string>({
  portalLabel,
  groups,
  activeId,
  onSelect,
  onClose,
  identity,
  footer,
}: PortalSidebarProps<T>): React.ReactElement {
  return (
    <aside className="w-64 h-full flex flex-col bg-[#0A192F] border-r border-slate-800/90 text-slate-200 flex-shrink-0 select-none overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-5 h-16 border-b border-slate-800/90 flex-shrink-0">
        <div className="flex flex-col min-w-0">
          <KivoraLogo size="sm" variant="light" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 mt-0.5">
            {portalLabel}
          </span>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar menu"
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {identity && <div className="px-4 pt-4 flex-shrink-0">{identity}</div>}

      <nav className="flex-1 overflow-y-auto overscroll-contain px-3 py-4 space-y-5" aria-label={portalLabel}>
        {groups.map((group, gIdx) => (
          <div key={group.title ?? gIdx} className="space-y-0.5">
            {group.title && (
              <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                {group.title}
              </p>
            )}
            {group.items.map((item) => {
              const childActive = item.children?.some((c) => c.id === activeId) ?? false;
              const isActive = activeId === item.id || childActive;
              return (
                <div key={item.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(item.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#FF6500] text-white font-semibold shadow-sm shadow-orange-600/30'
                        : 'text-slate-300 hover:bg-white/[0.07] hover:text-white font-medium'
                    }`}
                  >
                    <span className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`}>{item.icon}</span>
                    <span className="truncate flex-1 text-left">{item.label}</span>
                    {item.badge !== undefined && item.badge !== '' && (
                      <span
                        className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-black/25 text-white'
                            : BADGE_TONES[item.badgeTone ?? 'orange']
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>

                  {item.children && isActive && (
                    <div className="ml-[22px] mt-1 mb-1.5 pl-3 border-l border-slate-700/80 space-y-0.5">
                      {item.children.map((child) => (
                        <button
                          type="button"
                          key={child.id}
                          onClick={() => onSelect(child.id)}
                          className={`w-full text-left text-xs px-2.5 py-1.5 rounded-md transition-colors cursor-pointer ${
                            activeId === child.id
                              ? 'text-white font-semibold bg-white/10'
                              : 'text-slate-400 hover:text-white hover:bg-white/[0.05] font-medium'
                          }`}
                        >
                          {child.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      {footer && <div className="px-3 py-3 border-t border-slate-800/90 flex-shrink-0 space-y-1">{footer}</div>}
    </aside>
  );
}

interface FooterButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  tone?: 'default' | 'danger';
}

/** Botão de rodapé padronizado (sair, ver site...) para manter o mesmo aspecto nos três painéis. */
export const PortalFooterButton: React.FC<FooterButtonProps> = ({ icon, label, onClick, tone = 'default' }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors cursor-pointer ${
      tone === 'danger'
        ? 'text-slate-400 hover:text-red-400 hover:bg-red-500/10'
        : 'text-slate-400 hover:text-white hover:bg-white/[0.07]'
    }`}
  >
    <span className="shrink-0">{icon}</span>
    <span className="truncate">{label}</span>
  </button>
);
