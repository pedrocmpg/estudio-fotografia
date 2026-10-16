import { useEffect, useState, useSyncExternalStore, type RefObject } from 'react';
import { consulta } from '../lib/ambiente.ts';

/** Assina uma media query. Sem matchMedia (testes antigos, SSR) devolve `false`. */
export function useMediaQuery(media: string): boolean {
  return useSyncExternalStore(
    (aviso) => {
      if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return () => {};
      const lista = window.matchMedia(media);
      lista.addEventListener?.('change', aviso);
      return () => lista.removeEventListener?.('change', aviso);
    },
    () => consulta(media),
    () => false,
  );
}

export function useReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

interface OpcoesInView {
  /** Para de observar na primeira vez que entra. */
  uma?: boolean;
  /** Fração visível necessária (0–1). */
  limiar?: number;
  /** Margem em volta da viewport, como no IntersectionObserver. */
  margem?: string;
}

/** `true` enquanto o elemento está (ou, com `uma`, já esteve) na tela. */
export function useInView(ref: RefObject<Element | null>, opcoes: OpcoesInView = {}): boolean {
  const { uma = false, limiar = 0, margem = '0px' } = opcoes;
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      // Sem IntersectionObserver, melhor mostrar do que esconder para sempre.
      setVisivel(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada) return;
        if (entrada.isIntersecting) {
          setVisivel(true);
          if (uma) obs.disconnect();
        } else if (!uma) {
          setVisivel(false);
        }
      },
      { threshold: limiar, rootMargin: margem },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref, uma, limiar, margem]);

  return visivel;
}

/** Aba visível? Loops pausam quando não. */
export function useAbaVisivel(): boolean {
  return useSyncExternalStore(
    (aviso) => {
      document.addEventListener('visibilitychange', aviso);
      return () => document.removeEventListener('visibilitychange', aviso);
    },
    () => document.visibilityState !== 'hidden',
    () => true,
  );
}

/** Na tela E com a aba visível: condição para rodar loops (faixa, roda). */
export function useRodando(ref: RefObject<Element | null>, margem = '100px'): boolean {
  const naTela = useInView(ref, { margem });
  const aba = useAbaVisivel();
  return naTela && aba;
}
