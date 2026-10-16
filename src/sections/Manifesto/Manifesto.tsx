import { useRef, type CSSProperties } from 'react';
import { useSiteConfig } from '../../apresentacao/previa.tsx';
import { Reveal } from '../../components/Reveal.tsx';
import { useReducedMotion } from '../../motion/hooks.ts';
import { progressoDaPista, useVariavelDeRolagem } from '../../motion/useVariavelDeRolagem.ts';
import { Colagem } from '../Trabalhos/Colagem.tsx';
import css from './Manifesto.module.css';

/**
 * Manifesto (bloco E): tela escura com palco `sticky` de ~300svh. Ao rolar, uma frase central muda
 * palavra por palavra (cada uma entra e sai por máscara, ligada ao PROGRESSO da rolagem, não a
 * timers). Depois, uma citação aparece sozinha e entram 2 a 3 fotos soltas com parallax.
 *
 * Acessibilidade: a frase completa existe uma vez, como texto, no <h2> só para leitor de tela; as
 * palavras animadas são decorativas (aria-hidden). Movimento reduzido: frase completa estática,
 * citação visível, sem pin.
 */
export function Manifesto() {
  const { manifesto } = useSiteConfig();
  const reduzido = useReducedMotion();
  const pista = useRef<HTMLDivElement>(null);
  const n = manifesto.palavras.length;
  useVariavelDeRolagem(pista, progressoDaPista, { ativo: !reduzido });

  return (
    <section id="manifesto" className={css.secao} aria-labelledby="manifesto-titulo">
      <h2 id="manifesto-titulo" className="sr-only">
        {manifesto.palavras.join(' ')}
      </h2>

      <div
        ref={pista}
        className={css.pista}
        data-estatico={reduzido || undefined}
        style={{ '--n': n } as CSSProperties}
      >
        <div className={css.palco} data-palco aria-hidden="true">
          {manifesto.palavras.map((palavra, i) => (
            <span
              key={palavra}
              className={css.palavra}
              style={{ '--i': i } as CSSProperties}
              data-primeira={i === 0 || undefined}
              data-ultima={i === n - 1 || undefined}
            >
              <span className={css.texto}>{palavra}</span>
            </span>
          ))}
        </div>
      </div>

      <div className={css.citacao}>
        <Reveal>
          <figure>
            <blockquote>
              <p>{manifesto.citacao}</p>
            </blockquote>
          </figure>
        </Reveal>
      </div>

      {manifesto.fotos.length > 0 && (
        <Colagem fotos={manifesto.fotos.slice(0, 3)} rotulo="Fotos do manifesto" layout="trio" />
      )}
    </section>
  );
}
