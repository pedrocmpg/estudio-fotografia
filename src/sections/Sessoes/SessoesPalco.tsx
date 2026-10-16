import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Foto } from '../../components/Foto.tsx';
import type { SiteConfig } from '../../config/types.ts';
import { ehExterno, hrefPedido } from '../../lib/cta.ts';
import { useRodando } from '../../motion/hooks.ts';
import css from './SessoesPalco.module.css';

interface Props {
  config: SiteConfig;
  reduzido: boolean;
}

/**
 * Desktop: uma foto larga ao fundo (sticky) e os nomes das categorias em letras enormes por cima,
 * atravessando a foto. Faixas de miniaturas passam atrás em velocidades diferentes. Passar o mouse,
 * focar com o teclado ou rolar até um nome troca a foto de fundo com crossfade.
 */
export function SessoesPalco({ config, reduzido }: Props) {
  const itens = config.sessoes.itens;
  const palco = useRef<HTMLDivElement>(null);
  const nomes = useRef<HTMLUListElement>(null);
  const rodando = useRodando(palco);
  const [ativo, setAtivo] = useState(0);
  const sobAtencao = useRef(false);

  // Ao rolar, o nome que passa pelo meio da tela vira o ativo (a menos que o mouse/teclado mande).
  useEffect(() => {
    const lista = nomes.current;
    if (!lista || typeof IntersectionObserver === 'undefined') return;
    const obs = new IntersectionObserver(
      (entradas) => {
        if (sobAtencao.current) return;
        for (const e of entradas) {
          if (e.isIntersecting) setAtivo(Number((e.target as HTMLElement).dataset.i));
        }
      },
      { rootMargin: '-45% 0px -45% 0px' },
    );
    Array.from(lista.children).forEach((li) => obs.observe(li));
    return () => obs.disconnect();
  }, [itens.length]);

  const escolher = (i: number) => {
    sobAtencao.current = true;
    setAtivo(i);
  };
  const soltar = () => {
    sobAtencao.current = false;
  };

  const linhaA = itens.map((it) => it.fotos[0]);
  const linhaB = itens.map((it) => it.fotos[1] ?? it.fotos[0]).reverse();

  return (
    <div
      ref={palco}
      className={css.palco}
      data-pausado={!rodando || reduzido || undefined}
      onMouseLeave={soltar}
      onBlur={soltar}
    >
      <div className={css.fundo} aria-hidden="true">
        {itens.map((item, i) => (
          <div key={item.id} className={css.camada} data-ativo={i === ativo || undefined}>
            <Foto id={item.fotos[0]} sizes="100vw" alt="" eager={i === 0} />
          </div>
        ))}
        <span className={css.veu} />
        {!reduzido && (
          <div className={css.faixas}>
            {[linhaA, linhaB].map((fotos, k) => (
              <div key={k} className={css.faixa} data-k={k}>
                <div className={css.trilho}>
                  {[0, 1].map((rep) =>
                    fotos.map((id, j) => (
                      <span key={`${rep}-${j}`} className={css.mini}>
                        <Foto id={id} sizes="18vw" alt="" />
                      </span>
                    )),
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ul ref={nomes} className={css.nomes} role="list">
        {itens.map((item, i) => {
          const href = hrefPedido(config, { sessaoId: item.id });
          return (
            <li
              key={item.id}
              className={css.item}
              data-i={i}
              data-ativo={i === ativo || undefined}
              style={{ '--o': i % 4 } as CSSProperties}
              onMouseEnter={() => escolher(i)}
              onFocus={() => escolher(i)}
            >
              <article>
                <a
                  className={css.nome}
                  href={href}
                  {...(ehExterno(href) ? { target: '_blank', rel: 'noopener noreferrer' } : null)}
                >
                  <h3>{item.nome}</h3>
                  <span className="sr-only">Pedir essa sessão — {item.nome}</span>
                </a>
                <p className={css.frase}>{item.frase}</p>
              </article>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
