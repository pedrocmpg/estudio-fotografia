import { useId, useRef, useState, type KeyboardEvent } from 'react';
import { useSiteConfig } from '../../apresentacao/previa.tsx';
import { Botao } from '../../components/Botao.tsx';
import { Reveal } from '../../components/Reveal.tsx';
import { TituloSecao } from '../../components/TituloSecao.tsx';
import { atributoPedido, hrefPedido } from '../../lib/cta.ts';
import { formatarPreco, visivel } from '../../lib/preco.ts';
import { useInView } from '../../motion/hooks.ts';
import css from './Pacotes.module.css';

/**
 * Pacotes (SPEC §10.10): dois grupos, Sessões e Presentes. No celular são abas (setas, Home e End
 * trocam); no desktop os dois grupos ficam lado a lado. Cada cartão leva ao formulário já com o tipo
 * escolhido. Sem valor: `[VALOR]` na prévia e "Sob consulta" no site final. `[CONFIRMAR]` some em produção.
 */
export function Pacotes() {
  const config = useSiteConfig();
  const { pacotes, modoDemo } = config;
  const uid = useId();
  const [ativa, setAtiva] = useState(0);
  const abas = useRef<(HTMLButtonElement | null)[]>([]);
  const raiz = useRef<HTMLDivElement>(null);
  const entrou = useInView(raiz, { uma: true, limiar: 0.2 });
  const grupos = pacotes.grupos.filter((g) => g.itens.length > 0);

  const irPara = (i: number) => {
    const n = grupos.length;
    const proximo = (i + n) % n;
    setAtiva(proximo);
    abas.current[proximo]?.focus();
  };

  const aoTeclar = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') irPara(ativa + 1);
    else if (e.key === 'ArrowLeft') irPara(ativa - 1);
    else if (e.key === 'Home') irPara(0);
    else if (e.key === 'End') irPara(grupos.length - 1);
    else return;
    e.preventDefault();
  };

  return (
    <section id="pacotes" className={css.secao} aria-labelledby="pacotes-titulo">
      <div className="container">
        <TituloSecao id="pacotes-titulo" texto={pacotes.titulo} secao="pacotes" />

        <div ref={raiz} className={css.corpo} data-entrou={entrou || undefined}>
          {grupos.length > 1 && (
            <div
              className={css.abas}
              role="tablist"
              aria-label="Tipo de pacote"
              onKeyDown={aoTeclar}
            >
              {grupos.map((g, i) => (
                <button
                  key={g.rotulo}
                  ref={(el) => {
                    abas.current[i] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`${uid}-aba-${i}`}
                  aria-selected={ativa === i}
                  aria-controls={`${uid}-painel-${i}`}
                  tabIndex={ativa === i ? 0 : -1}
                  className={css.aba}
                  onClick={() => setAtiva(i)}
                >
                  {g.rotulo}
                </button>
              ))}
            </div>
          )}

          <div className={css.grupos}>
            {grupos.map((g, gi) => (
              <div
                key={g.rotulo}
                id={`${uid}-painel-${gi}`}
                role={grupos.length > 1 ? 'tabpanel' : 'group'}
                aria-labelledby={grupos.length > 1 ? `${uid}-aba-${gi}` : undefined}
                aria-label={grupos.length > 1 ? undefined : g.rotulo}
                className={css.grupo}
                data-ativo={ativa === gi || undefined}
              >
                <h3 className={css.grupoTitulo}>{g.rotulo}</h3>
                <ul className={css.lista}>
                  {g.itens.map((item, i) => {
                    const alvo =
                      g.rotulo === 'Sessões'
                        ? { sessaoId: item.alvoPedido }
                        : { presenteId: item.alvoPedido };
                    const inclui = item.inclui.filter((t) => visivel(t, modoDemo));
                    return (
                      <li key={item.id} className={css.card}>
                        <Reveal indice={i} className={css.artigo}>
                          <article className={css.interno}>
                            {item.selo && <p className={css.selo}>{item.selo}</p>}
                            <h4 className={css.nome}>{item.nome}</h4>
                            <p className={css.paraQuem}>{item.paraQuem}</p>
                            {inclui.length > 0 && (
                              <ul className={css.inclui}>
                                {inclui.map((t) => (
                                  <li key={t}>{t}</li>
                                ))}
                              </ul>
                            )}
                            {visivel(item.entrega, modoDemo) && (
                              <p className={css.entrega}>
                                <span className="rotulo">Entrega</span> {item.entrega}
                              </p>
                            )}
                            <p className={css.valor}>
                              {item.prefixoValor && item.valor !== null && (
                                <span className={css.prefixo}>{item.prefixoValor} </span>
                              )}
                              {formatarPreco(item.valor, modoDemo, 'Sob consulta')}
                            </p>
                            <Botao
                              variante="secundario"
                              href={hrefPedido(config, {})}
                              {...atributoPedido(config, alvo)}
                            >
                              Pedir este pacote
                              <span className="sr-only"> — {item.nome}</span>
                            </Botao>
                          </article>
                        </Reveal>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {pacotes.nota && <p className={css.nota}>{pacotes.nota}</p>}
      </div>
    </section>
  );
}
