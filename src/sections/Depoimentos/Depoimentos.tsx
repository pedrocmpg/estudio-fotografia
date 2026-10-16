import { useState } from 'react';
import { useSiteConfig } from '../../apresentacao/previa.tsx';
import { Foto } from '../../components/Foto.tsx';
import { TituloSecao } from '../../components/TituloSecao.tsx';
import { depoimentosVisiveis } from '../../config/secoes.ts';
import css from './Depoimentos.module.css';

/**
 * Depoimentos (SPEC §10.11): uma citação por vez, grande, na fonte de título; troca só pelos botões
 * (sem autoplay) e a região é `aria-live="polite"`. Exemplos levam o selo EXEMPLO e só existem na
 * prévia (`depoimentosVisiveis`); em produção, sem depoimentos reais, a seção some.
 */
export function Depoimentos() {
  const config = useSiteConfig();
  const lista = depoimentosVisiveis(config);
  const [indice, setIndice] = useState(0);
  const n = lista.length;
  const atual = lista[Math.min(indice, n - 1)];
  if (!atual) return null;
  const i = Math.min(indice, n - 1);

  const ir = (passo: number) => setIndice((i + passo + n) % n);
  const contador = `${String(i + 1).padStart(2, '0')} / ${String(n).padStart(2, '0')}`;

  return (
    <section id="depoimentos" className={css.secao} aria-labelledby="depoimentos-titulo">
      <div className="container">
        <TituloSecao id="depoimentos-titulo" texto="O que dizem" secao="depoimentos" />

        <div className={css.palco}>
          <figure className={css.figura} aria-live="polite" aria-atomic="true">
            {atual.foto && (
              <span className={css.foto}>
                <Foto id={atual.foto} sizes="120px" />
              </span>
            )}
            <blockquote key={i} className={css.citacao}>
              <p>{atual.texto}</p>
            </blockquote>
            <figcaption className={css.autor}>
              {atual.exemplo && <span className={css.exemplo}>Exemplo</span>}
              <span className="rotulo">
                {atual.autor}
                {atual.sessao ? ` · ${atual.sessao}` : ''}
              </span>
            </figcaption>
          </figure>

          {n > 1 && (
            <div className={css.controles}>
              <button type="button" className={css.seta} onClick={() => ir(-1)}>
                <span aria-hidden="true">←</span>
                <span className="sr-only">Depoimento anterior</span>
              </button>
              <p className={css.contador}>
                <span className="sr-only">Depoimento </span>
                {contador}
              </p>
              <button type="button" className={css.seta} onClick={() => ir(1)}>
                <span aria-hidden="true">→</span>
                <span className="sr-only">Próximo depoimento</span>
              </button>
            </div>
          )}
        </div>

        {config.linkAvaliacoesGoogle && (
          <a
            className={css.google}
            href={config.linkAvaliacoesGoogle}
            target="_blank"
            rel="noopener noreferrer"
          >
            Ver avaliações no Google
          </a>
        )}
      </div>
    </section>
  );
}
