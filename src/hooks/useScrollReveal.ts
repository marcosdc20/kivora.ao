/**
 * useScrollReveal — Hook leve de scroll reveal via IntersectionObserver + CSS
 * 
 * Aplica as classes 'revealed' aos elementos com [data-reveal] quando entram no viewport.
 * Elementos acima da dobra revelam-se imediatamente; elementos abaixo animam ao rolar.
 * 
 * @param containerRef - ref do contentor de página (ou null para usar document)
 * @param deps - dependências adicionais para re-executar (ex: dados carregados)
 */
import { useEffect, RefObject } from 'react';

export function useScrollReveal(
  containerRef?: RefObject<HTMLElement | null>,
  deps: unknown[] = []
) {
  useEffect(() => {
    let observer: IntersectionObserver | null = null;

    const timer = setTimeout(() => {
      const root = containerRef?.current ?? document;
      const elements = (root as Element | Document).querySelectorAll('[data-reveal]');

      if (!elements.length) return;

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('revealed');
              observer?.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
      );

      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        // Se já está visível no topo, revela logo
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          el.classList.add('revealed');
        } else {
          observer?.observe(el);
        }
      });
    }, 50);

    return () => {
      clearTimeout(timer);
      if (observer) {
        observer.disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef, ...deps]);
}
