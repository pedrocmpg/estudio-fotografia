import type { CSSProperties } from 'react';
import { Foto } from '../../components/Foto.tsx';
import { Revelar } from '../../components/Revelar.tsx';
import { obterFoto } from '../../data/fotos.ts';
import css from './Colagem.module.css';

interface Props {
  fotos: string[];
  rotulo: string;
  /** Sem isto as fotos não são interativas (ex.: fotos do manifesto). */
  aoAbrir?: (indice: number) => void;
  layout?: 'mesa' | 'trio' | 'par';
}

/** Meia-amplitude do parallax por foto (total = 2×): de 4% a 14% de deslocamento vertical. */
const VELOCIDADES = [3, 6, 2, 7, 4, 5, 2.5, 6.5];

/**
 * Colagem de fotos soltas (bloco D): de 6 a 8 fotos de tamanhos e proporções diferentes, posicionadas
 * de forma irregular, cada uma com uma velocidade de parallax. O parallax é CSS puro
 * (`animation-timeline: view()`, só com suporte); sem ele a foto fica no lugar. Algumas entram com
 * clip-path. Tocar numa foto abre a lightbox.
 */
export function Colagem({ fotos, rotulo, aoAbrir, layout = 'mesa' }: Props) {
  return (
    <ul className={css.mesa} data-layout={layout} role="list" aria-label={rotulo}>
      {fotos.map((id, i) => {
        const foto = obterFoto(id);
        const sizes = '(min-width: 900px) 40vw, 90vw';
        const botao = aoAbrir ? (
          <button
            type="button"
            className={css.botao}
            aria-label={foto?.alt}
            onClick={() => aoAbrir(i)}
          >
            <Foto id={id} modo="natural" sizes={sizes} alt="" />
          </button>
        ) : (
          <figure className={css.botao}>
            <Foto id={id} modo="natural" sizes={sizes} />
          </figure>
        );
        return (
          <li
            key={`${id}-${i}`}
            className={css.item}
            data-i={i % 8}
            style={{ '--vel': `${VELOCIDADES[i % VELOCIDADES.length]}%` } as CSSProperties}
          >
            <div className={css.par}>{i % 2 === 0 ? <Revelar>{botao}</Revelar> : botao}</div>
          </li>
        );
      })}
    </ul>
  );
}
