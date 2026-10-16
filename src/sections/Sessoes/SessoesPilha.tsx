import { useRef, type CSSProperties } from 'react';
import { Foto } from '../../components/Foto.tsx';
import type { SiteConfig } from '../../config/types.ts';
import { ehExterno, hrefPedido } from '../../lib/cta.ts';
import { progressoEmCartoes, useVariavelDeRolagem } from '../../motion/useVariavelDeRolagem.ts';
import css from './SessoesPilha.module.css';

interface Props {
  config: SiteConfig;
  reduzido: boolean;
}

/**
 * Celular: cartões empilhados. Cada <li> é `sticky`; a variável --p (progresso em cartões) vem de
 * uma leitura por quadro e o CSS faz o resto: o cartão coberto escurece e encolhe um pouco.
 * Com movimento reduzido o pin sai e a lista fica vertical, com o mesmo conteúdo.
 */
export function SessoesPilha({ config, reduzido }: Props) {
  const lista = useRef<HTMLUListElement>(null);
  useVariavelDeRolagem(lista, progressoEmCartoes, { ativo: !reduzido });

  return (
    <ul ref={lista} className={css.pilha} role="list" data-estatico={reduzido || undefined}>
      {config.sessoes.itens.map((item, i) => {
        const href = hrefPedido(config, { sessaoId: item.id });
        return (
          <li
            key={item.id}
            className={css.card}
            data-v={i % 3}
            style={{ '--i': i } as CSSProperties}
          >
            <article className={css.cartao}>
              <div className={css.midia} data-titulo={item.posicaoTitulo ?? 'baixo'}>
                <Foto id={item.fotos[0]} sizes="100vw" eager={i === 0} />
                <span className={css.veu} aria-hidden="true" />
                <h3 className={css.nome}>{item.nome}</h3>
              </div>
              <div className={css.texto}>
                <p className={css.frase}>{item.frase}</p>
                <a
                  className={css.link}
                  href={href}
                  {...(ehExterno(href) ? { target: '_blank', rel: 'noopener noreferrer' } : null)}
                >
                  Pedir essa sessão
                  <span className="sr-only"> — {item.nome}</span>
                </a>
              </div>
              <span className={css.cobertura} aria-hidden="true" />
            </article>
          </li>
        );
      })}
    </ul>
  );
}
