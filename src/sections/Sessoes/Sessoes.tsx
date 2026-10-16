import { useRef } from 'react';
import { useSiteConfig } from '../../apresentacao/previa.tsx';
import { Foto } from '../../components/Foto.tsx';
import { Reveal } from '../../components/Reveal.tsx';
import { RotuloSecao } from '../../components/RotuloSecao.tsx';
import { ehExterno, hrefPedido } from '../../lib/cta.ts';
import { useIndiceCentral } from '../../motion/useCentro.ts';
import css from './Sessoes.module.css';

/**
 * Sessões (SPEC §7.4): um card por tipo de sessão. Desktop: grade editorial assimétrica, cards de
 * alturas diferentes alinhados pela base. Celular: carrossel com scroll-snap e card central maior.
 */
export function Sessoes() {
  const config = useSiteConfig();
  const { sessoes } = config;
  const trilho = useRef<HTMLUListElement>(null);
  const central = useIndiceCentral(trilho);

  return (
    <section id="sessoes" className={css.secao} aria-labelledby="sessoes-titulo">
      <div className="container">
        <Reveal>
          <RotuloSecao secao="sessoes" />
          <h2 id="sessoes-titulo" className={css.titulo}>
            {sessoes.titulo}
          </h2>
        </Reveal>
      </div>

      <ul ref={trilho} className={css.trilho} role="list">
        {sessoes.itens.map((item, i) => {
          const href = hrefPedido(config, { sessaoId: item.id });
          const [primeira, segunda] = item.fotos;
          return (
            <li
              key={item.id}
              className={css.card}
              data-i={i % 6}
              data-central={i === central || undefined}
            >
              <article>
                <div className={css.midia}>
                  <div className={css.foto}>
                    <Foto id={primeira} sizes="(min-width: 900px) 30vw, 78vw" />
                  </div>
                  {segunda && (
                    <div className={`${css.foto} ${css.fotoHover}`}>
                      <Foto id={segunda} sizes="(min-width: 900px) 30vw, 78vw" alt="" />
                    </div>
                  )}
                </div>
                <h3 className={css.nome}>{item.nome}</h3>
                <p className={css.frase}>{item.frase}</p>
                <a
                  className={css.link}
                  href={href}
                  {...(ehExterno(href) ? { target: '_blank', rel: 'noopener noreferrer' } : null)}
                >
                  Pedir essa sessão
                  <span className="sr-only"> — {item.nome}</span>
                </a>
              </article>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
