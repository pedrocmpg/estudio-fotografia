import { useEffect, useState, type RefObject } from 'react';

/**
 * Índice do filho do container (rolagem horizontal) mais perto do centro.
 * Usado nos carrosséis de celular para ampliar o card central.
 */
export function useIndiceCentral(ref: RefObject<HTMLElement | null>): number {
  const [indice, setIndice] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let pendente = false;

    const medir = () => {
      pendente = false;
      const caixa = el.getBoundingClientRect();
      const centro = caixa.left + caixa.width / 2;
      let melhor = 0;
      let menor = Infinity;
      Array.from(el.children).forEach((filho, i) => {
        const r = filho.getBoundingClientRect();
        const d = Math.abs(r.left + r.width / 2 - centro);
        if (d < menor) {
          menor = d;
          melhor = i;
        }
      });
      setIndice(melhor);
    };

    const aoRolar = () => {
      if (pendente) return;
      pendente = true;
      requestAnimationFrame(medir);
    };

    medir();
    el.addEventListener('scroll', aoRolar, { passive: true });
    window.addEventListener('resize', aoRolar);
    return () => {
      el.removeEventListener('scroll', aoRolar);
      window.removeEventListener('resize', aoRolar);
    };
  }, [ref]);

  return indice;
}
