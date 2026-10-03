import { RefObject, useEffect } from 'react';

/**
 * usePortalTrackpadScroll
 * 
 * Garante que a roda do mouse e gestos de rolagem no trackpad funcionem
 * de forma 100% imediata e sem falhas em qualquer ponto dos painéis.
 * Rola diretamente o container principal <main>, mesmo sobre cartões, tabelas,
 * gráficos ou áreas em branco, respeitando apenas sub-elementos com scroll interno.
 */
export function usePortalTrackpadScroll(mainRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const mainEl = mainRef.current;
      if (!mainEl) return;

      // Permite gestos de zoom (Ctrl + wheel) sem interceção
      if (e.ctrlKey) return;

      // Se o cursor estiver sobre um elemento filho com scroll próprio (ex: textarea, modal, tabela interna)
      let target = e.target as HTMLElement | null;
      while (target && target !== mainEl && target !== document.body) {
        const style = window.getComputedStyle(target);
        const hasScrollableY = (style.overflowY === 'auto' || style.overflowY === 'scroll') && target.scrollHeight > target.clientHeight;
        if (hasScrollableY) {
          const atTop = target.scrollTop <= 0 && e.deltaY < 0;
          const atBottom = target.scrollTop + target.clientHeight >= target.scrollHeight && e.deltaY > 0;
          if (!atTop && !atBottom) {
            return; // Permite ao elemento filho rolar internamente
          }
        }
        target = target.parentElement;
      }

      // Se o main não precisa de scroll vertical, não intervém
      if (mainEl.scrollHeight <= mainEl.clientHeight) return;

      // Rola diretamente o mainEl de forma suave e instantânea
      e.preventDefault();
      mainEl.scrollTop += e.deltaY;
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [mainRef]);
}
