/**
 * useScrollReveal — Hook leve de scroll reveal via IntersectionObserver + CSS
 * 
 * Usa apenas CSS transitions sem framer-motion para ser ultra-leve.
 * Aplica as classes 'revealed' aos elementos com [data-reveal] quando entram no viewport.
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
    const root = containerRef?.current ?? document;
    const elements = (root as Element | Document).querySelectorAll('[data-reveal]');

    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef, ...deps]);
}
