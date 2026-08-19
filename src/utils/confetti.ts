import confetti from 'canvas-confetti';

/**
 * Disparo de confetes elegante e institucional com as cores da identidade Kivora ERP
 * (Azul Royal, Ciano Tecnológico, Dourado Ouro e Esmeralda)
 */
export function triggerKivoraConfetti() {
  const count = 70;
  const defaults = {
    origin: { y: 0.7 },
    colors: ['#2563eb', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ffffff'],
    disableForReducedMotion: true,
    zIndex: 99999,
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });
  fire(0.2, {
    spread: 60,
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
}
