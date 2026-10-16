import { useRef } from 'react';
import { useSiteConfig } from '../../apresentacao/previa.tsx';
import { TituloSecao } from '../../components/TituloSecao.tsx';
import { useMediaQuery, useReducedMotion } from '../../motion/hooks.ts';
import { SessoesPalco } from './SessoesPalco.tsx';
import { SessoesPilha } from './SessoesPilha.tsx';
import css from './Sessoes.module.css';

/**
 * Sessões (SPEC §7.4, blocos C e I.4).
 *  - celular: cada sessão ocupa uma tela e os cartões se empilham (sticky), o de baixo cobre o de cima;
 *  - desktop: foto larga ao fundo com os nomes em letras enormes por cima e faixas de miniaturas atrás;
 *  - movimento reduzido: lista vertical simples com o mesmo conteúdo.
 */
export function Sessoes() {
  const config = useSiteConfig();
  const { sessoes } = config;
  const reduzido = useReducedMotion();
  const largo = useMediaQuery('(min-width: 900px)');
  const secao = useRef<HTMLElement>(null);

  return (
    <section ref={secao} id="sessoes" className={css.secao} aria-labelledby="sessoes-titulo">
      <div className={`container ${css.cabeca}`}>
        <TituloSecao id="sessoes-titulo" texto={sessoes.titulo} secao="sessoes" />
      </div>
      {largo ? (
        <SessoesPalco config={config} reduzido={reduzido} />
      ) : (
        <SessoesPilha config={config} reduzido={reduzido} />
      )}
    </section>
  );
}
