import { useEffect } from 'react';

/**
 * useGlobalScrollReveal — Motor Global de Animações ao Rolar (Scroll Reveal)
 * 
 * Funcionalidades:
 * 1. Monitoriza elementos com [data-reveal], .sr-init ou .reveal-on-scroll.
 * 2. Elementos já visíveis acima da dobra revelam-se instantaneamente para evitar FOUC.
 * 3. Elementos abaixo da dobra animam suavemente (fade + slide up) ao rolar para baixo.
 * 4. Aplica desfasamento progressivo (stagger) aos cartões dentro de contentores com [data-stagger].
 * 5. Re-executa automaticamente quando a página ou conteúdo dinâmico é alterado.
 * 6. Utiliza MutationObserver suave para detectar componentes carregados via lazy/tabs.
 * 7. Desconecta o observador após a revelação para manter o consumo de CPU e RAM em zero.
 */
export function useGlobalScrollReveal(deps: unknown = null) {
  useEffect(() => {
    // Respeita a preferência de acessibilidade do utilizador
    const prefersReducedMotion = typeof window !== 'undefined' && 
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let observer: IntersectionObserver | null = null;
    let mutationObserver: MutationObserver | null = null;

    const setupObserver = () => {
      const elements = document.querySelectorAll<HTMLElement>(
        '[data-reveal], .sr-init, .reveal-on-scroll'
      );

      if (!elements.length) return;

      if (prefersReducedMotion) {
        elements.forEach((el) => {
          el.classList.add('revealed', 'sr-visible');
        });
        return;
      }

      if (!observer) {
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
          {
            threshold: 0.05,
            rootMargin: '0px 0px -25px 0px',
          }
        );
      }

      elements.forEach((el) => {
        // Se já foi revelado, salta
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
        // Se o elemento já se encontra na janela visível inicial, revela logo
        if (rect.top < window.innerHeight - 10 && rect.bottom > 0) {
          el.classList.add('revealed', 'sr-visible');
        } else {
          observer?.observe(el);
        }
      });
    };

    // Execução inicial com micro-delay para permitir flush de montagem do React
    const timer = setTimeout(setupObserver, 50);

    // Observa mutações de nós (para páginas carregadas dinamicamente via React.lazy)
    try {
      mutationObserver = new MutationObserver(() => {
        setupObserver();
      });
      mutationObserver.observe(document.body, { childList: true, subtree: true });
    } catch {
      // Ignora se MutationObserver não estiver disponível
    }

    return () => {
      clearTimeout(timer);
      if (observer) {
        observer.disconnect();
      }
      if (mutationObserver) {
        mutationObserver.disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, Array.isArray(deps) ? deps : [deps]);
}

