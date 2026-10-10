/**
 * useScrollReveal — Hook de scroll reveal via IntersectionObserver + CSS
 * 
 * Aplica as classes 'revealed' e 'sr-visible' aos elementos com [data-reveal], .sr-init e .reveal-on-scroll.
 * Elementos acima da dobra revelam-se imediatamente; elementos abaixo animam suavemente ao rolar.
 * Suporta [data-stagger] para desfasamento progressivo de cartões.
 * 
 * @param containerRef - ref do contentor de página (ou null/undefined para usar document)
 * @param deps - dependências adicionais para re-executar (ex: dados carregados)
 */
import { useEffect, RefObject } from 'react';

export function useScrollReveal(
  containerRef?: RefObject<HTMLElement | null>,
  deps: unknown[] = []
) {
  useEffect(() => {
    const prefersReducedMotion = typeof window !== 'undefined' && 
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let observer: IntersectionObserver | null = null;

    const setup = () => {
      const root = containerRef?.current ?? document;
      const elements = (root as Element | Document).querySelectorAll<HTMLElement>(
        '[data-reveal], .sr-init, .reveal-on-scroll'
      );

      if (!elements.length) return;

      if (prefersReducedMotion) {
        elements.forEach((el) => {
          el.classList.add('revealed', 'sr-visible');
        });
        return;
      }

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const el = entry.target as HTMLElement;
              el.classList.add('revealed', 'sr-visible');
              observer?.unobserve(el);
            }
          });
        },
        { threshold: 0.05, rootMargin: '0px 0px -25px 0px' }
      );

      elements.forEach((el) => {
        if (el.classList.contains('revealed') || el.classList.contains('sr-visible')) {
          return;
        }

        // Se o elemento pai tem data-stagger, calcula delay progressivo
        const parentStagger = el.closest('[data-stagger]');
        if (parentStagger && !el.dataset.delay) {
          const siblings = Array.from(parentStagger.children);
          const childIndex = siblings.indexOf(el);
          if (childIndex >= 0) {
            const delayMs = (childIndex % 6) * 75;
            el.style.transitionDelay = `${delayMs}ms`;
          }
        }

        const rect = el.getBoundingClientRect();
        // Se já está visível no topo da viewport, revela logo sem piscar
        if (rect.top < window.innerHeight - 10 && rect.bottom > 0) {
          el.classList.add('revealed', 'sr-visible');
        } else {
          observer?.observe(el);
        }
      });
    };

    const timer = setTimeout(setup, 40);

    return () => {
      clearTimeout(timer);
      if (observer) {
        observer.disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef, ...deps]);
}

