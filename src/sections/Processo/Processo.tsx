import { useRef, type CSSProperties } from 'react';
import { useSiteConfig } from '../../apresentacao/previa.tsx';
import { TituloSecao } from '../../components/TituloSecao.tsx';
import { visivel } from '../../lib/preco.ts';
import { useReducedMotion } from '../../motion/hooks.ts';
import { useVariavelDeRolagem } from '../../motion/useVariavelDeRolagem.ts';
import css from './Processo.module.css';

/** 0 quando o topo da lista chega a 70% da tela, 1 quando o fim da lista chega a 50%. */
function progressoDaLinha(el: HTMLElement): number {
  const { top, height } = el.getBoundingClientRect();
  const inicio = window.innerHeight * 0.7;
  const fim = window.innerHeight * 0.5;
  const total = height + (inicio - fim);
  return total > 0 ? Math.min(1, Math.max(0, (inicio - top) / total)) : 1;
}

/**
 * Como funciona (SPEC §10.9): quatro passos numa linha vertical que enche de luz com a rolagem;
 * cada passo acende quando a luz chega. A luz é a variável `--p` (uma leitura por quadro).
 * Movimento reduzido: linha cheia e todos os passos acesos.
 */
export function Processo() {
  const { processo, modoDemo } = useSiteConfig();
  const reduzido = useReducedMotion();
  const lista = useRef<HTMLOListElement>(null);
  useVariavelDeRolagem(lista, progressoDaLinha, { ativo: !reduzido });
  const passos = processo.passos;

  return (
    <section id="como-funciona" className={css.secao} aria-labelledby="processo-titulo">
      <div className={`container ${css.grade}`}>
        <div className={css.cabeca}>
          <TituloSecao id="processo-titulo" texto={processo.titulo} secao="processo" />
        </div>

        <ol
          ref={lista}
          className={css.lista}
          data-estatico={reduzido || undefined}
          style={{ '--n': passos.length } as CSSProperties}
        >
          {passos.map((passo, i) => (
            <li key={passo.titulo} className={css.passo} style={{ '--i': i } as CSSProperties}>
              <span className={css.marca} aria-hidden="true">
                <span className={css.luz} />
              </span>
              <p className={`rotulo ${css.numero}`}>{String(i + 1).padStart(2, '0')}</p>
              <h3 className={css.titulo}>{passo.titulo}</h3>
              {visivel(passo.texto, modoDemo) && <p className={css.texto}>{passo.texto}</p>}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
