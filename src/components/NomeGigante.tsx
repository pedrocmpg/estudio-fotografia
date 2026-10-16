import { useRef } from 'react';
import { useAjusteLargura } from '../motion/useAjusteLargura.ts';
import css from './NomeGigante.module.css';

/**
 * O nome da marca com a largura da tela, cortado levemente pela borda de baixo: fecha a página
 * como o hero abriu. Decorativo (o nome real já está no texto do rodapé).
 */
export function NomeGigante({ texto }: { texto: string }) {
  const caixa = useRef<HTMLDivElement>(null);
  const span = useRef<HTMLSpanElement>(null);
  useAjusteLargura(span, caixa, texto);
  return (
    <div ref={caixa} className={css.caixa} aria-hidden="true">
      <span ref={span} className={css.nome}>
        {texto}
      </span>
    </div>
  );
}
