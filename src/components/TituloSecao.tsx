import { Fragment, useRef, type CSSProperties } from 'react';
import type { SecaoId } from '../config/types.ts';
import { useInView } from '../motion/hooks.ts';
import { RotuloSecao } from './RotuloSecao.tsx';
import css from './TituloSecao.module.css';

interface Props {
  id: string;
  texto: string;
  /** Mostra o rótulo mono numerado acima ("02 — TRABALHOS"). */
  secao?: SecaoId;
  className?: string;
}

/**
 * Título de seção: rótulo mono numerado e H2 grande. Cada palavra sobe por trás de uma máscara,
 * em cascata de 60 ms, uma vez só. O texto continua real (leitor de tela lê o título inteiro).
 */
export function TituloSecao({ id, texto, secao, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const entrou = useInView(ref, { uma: true, limiar: 0.25 });
  return (
    <div ref={ref} className={`${css.bloco} ${className ?? ''}`} data-entrou={entrou || undefined}>
      {secao && <RotuloSecao secao={secao} />}
      <h2 id={id} className={`titulo-secao ${css.titulo}`}>
        {texto.split(' ').map((palavra, i) => (
          <Fragment key={i}>
            <span className={css.mascara}>
              <span className={css.palavra} style={{ '--i': i } as CSSProperties}>
                {palavra}
              </span>
            </span>{' '}
          </Fragment>
        ))}
      </h2>
    </div>
  );
}
