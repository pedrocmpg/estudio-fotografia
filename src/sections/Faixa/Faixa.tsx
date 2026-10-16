import { useRef, type CSSProperties } from 'react';
import { useSiteConfig } from '../../apresentacao/previa.tsx';
import { IconeDiafragma } from '../../components/icones.tsx';
import { useRodando } from '../../motion/hooks.ts';
import css from './Faixa.module.css';

/** Itens por grupo: o suficiente para o grupo ser mais largo que qualquer tela. */
const ITENS_MINIMOS = 12;

/**
 * Faixa de sessões (SPEC §7.3): marquee infinito em CSS, pausado no hover, fora da tela e com a
 * aba oculta. Só a primeira cópia da lista é lida por leitor de tela; o resto é aria-hidden.
 */
export function Faixa() {
  const { faixa } = useSiteConfig();
  const ref = useRef<HTMLElement>(null);
  const rodando = useRodando(ref);

  const repeticoes = Math.max(1, Math.ceil(ITENS_MINIMOS / Math.max(faixa.itens.length, 1)));
  const grupo = (escondido: boolean) =>
    Array.from({ length: repeticoes }, (_, r) =>
      faixa.itens.map((item) => (
        <li key={`${r}-${item}`} className={css.item} aria-hidden={escondido || r > 0 || undefined}>
          <span>{item}</span>
          <IconeDiafragma className={css.icone} />
        </li>
      )),
    );

  return (
    <section
      ref={ref}
      className={css.faixa}
      aria-label="Tipos de sessão"
      data-pausado={!rodando || undefined}
      style={{ '--duracao': `${faixa.segundosPorVolta}s` } as CSSProperties}
    >
      <div className={css.trilho}>
        <ul className={css.grupo}>{grupo(false)}</ul>
        <ul className={css.grupo} aria-hidden="true">
          {grupo(true)}
        </ul>
      </div>
    </section>
  );
}
