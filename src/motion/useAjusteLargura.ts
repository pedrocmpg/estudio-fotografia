import { useLayoutEffect, type RefObject } from 'react';

/**
 * Faz um texto (sem quebra de linha) ocupar exatamente a largura da caixa: mede o texto a 100 px e
 * escreve a proporção na variável CSS `--fs-gigante` da caixa. Reajusta quando a caixa muda de
 * tamanho e quando as fontes terminam de carregar. Serve para qualquer nome, curto ou longo.
 */
export function useAjusteLargura(
  texto: RefObject<HTMLElement | null>,
  caixa: RefObject<HTMLElement | null>,
  dependencia?: unknown,
  ativo = true,
): void {
  useLayoutEffect(() => {
    const t = texto.current;
    const c = caixa.current;
    if (!t || !c || !ativo) return;

    const ajustar = () => {
      const largura = c.clientWidth;
      if (largura <= 0) return;
      c.style.setProperty('--fs-gigante', '100px');
      const natural = t.scrollWidth;
      if (natural > 0)
        c.style.setProperty('--fs-gigante', `${Math.floor((10000 * largura) / natural) / 100}px`);
    };

    ajustar();
    let obs: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined') {
      obs = new ResizeObserver(ajustar);
      obs.observe(c);
    }
    void document.fonts?.ready?.then(ajustar);
    return () => obs?.disconnect();
  }, [texto, caixa, dependencia, ativo]);
}
