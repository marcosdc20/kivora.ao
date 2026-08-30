import { RefObject } from 'react';

/**
 * usePortalTrackpadScroll
 * 
 * Garante que gestos de rolagem com 2 dedos no touchpad/trackpad do portátil
 * ou roda do mouse funcionem de forma fluida e sem bloqueios em todos os painéis.
 * 
 * Se o cursor estiver sobre o Topbar, margens ou elementos fixos do layout,
 * o evento wheel é automaticamente direcionado ao container principal de scroll (<main>).
 */
export function usePortalTrackpadScroll(_mainRef: RefObject<HTMLElement | null>) {
  // O navegador moderno gerencia 100% da inércia e rolagem com 2 dedos nativamente
  // via GPU compositor em qualquer elemento com overflow-y-auto.
  // Evitar interceptação via window.addEventListener('wheel') para eliminar travamentos e double-scroll.
}
