import { useEffect, RefObject } from 'react';

/**
 * usePortalTrackpadScroll
 * 
 * Garante que gestos de rolagem com 2 dedos no touchpad/trackpad do portátil
 * ou roda do mouse funcionem de forma fluida e sem bloqueios em todos os painéis.
 * 
 * Se o cursor estiver sobre o Topbar, margens ou elementos fixos do layout,
 * o evento wheel é automaticamente direcionado ao container principal de scroll (<main>).
 */
export function usePortalTrackpadScroll(mainRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const mainEl = mainRef.current;
      if (!mainEl) return;

      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Se o cursor estiver dentro de um elemento interativo de texto ou formulário, não interferir
      const tagName = target.tagName.toUpperCase();
      if (tagName === 'TEXTAREA' || tagName === 'INPUT' || tagName === 'SELECT') {
        return;
      }

      // Se o utilizador estiver sobre outro container scrollável interno (ex: modal, dropdown, tabela com scroll horizontal)
      const nestedScrollable = target.closest(
        '.overflow-y-auto, .overflow-auto, [data-scrollable="true"]'
      ) as HTMLElement | null;

      if (nestedScrollable && nestedScrollable !== mainEl) {
        const canScrollUp = nestedScrollable.scrollTop > 0;
        const canScrollDown = nestedScrollable.scrollTop + nestedScrollable.clientHeight < nestedScrollable.scrollHeight - 1;

        if ((e.deltaY < 0 && canScrollUp) || (e.deltaY > 0 && canScrollDown)) {
          // O elemento aninhado ainda tem espaço para rolar, deixa o navegador rolar ele normalmente
          return;
        }
      }

      // Caso contrário, rolar suavemente o container principal do painel
      if (e.deltaY !== 0) {
        mainEl.scrollTop += e.deltaY;
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, [mainRef]);
}
