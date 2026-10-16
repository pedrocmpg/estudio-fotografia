import { flushSync } from 'react-dom';

type DocumentoComTransicao = Document & {
  startViewTransition?: (atualizar: () => void) => unknown;
};

/**
 * Faz uma mudança de tela com View Transitions API (cruzamento suave entre o antes e o depois).
 * Sem suporte, ou com movimento reduzido, aplica direto: a lightbox já tem um fade em CSS.
 */
export function comTransicao(atualizar: () => void, reduzido: boolean): void {
  const doc = document as DocumentoComTransicao;
  if (reduzido || typeof doc.startViewTransition !== 'function') {
    atualizar();
    return;
  }
  doc.startViewTransition(() => flushSync(atualizar));
}
