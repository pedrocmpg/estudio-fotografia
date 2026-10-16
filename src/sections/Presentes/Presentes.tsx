import { useRef, useState } from 'react';
import { useSiteConfig } from '../../apresentacao/previa.tsx';
import { Botao } from '../../components/Botao.tsx';
import { Foto } from '../../components/Foto.tsx';
import { IconeRevelacao } from '../../components/icones.tsx';
import { Revelar } from '../../components/Revelar.tsx';
import { TituloSecao } from '../../components/TituloSecao.tsx';
import { formatarPreco } from '../../lib/preco.ts';
import { urlWhatsapp } from '../../lib/pedido.ts';
import { useIndiceCentral } from '../../motion/useCentro.ts';
import css from './Presentes.module.css';

const TODOS = 'Todos';

/**
 * Presentes (adendo I.3): a loja. Categorias em chips e uma "prateleira" de cards grandes com
 * rolagem lateral (scroll-snap, a mesma mecânica do carrossel dos trabalhos, nada pesado). Cada
 * item abre o WhatsApp com a mensagem pronta; sem valor definido mostra [VALOR] ou "Consulte".
 */
export function Presentes() {
  const config = useSiteConfig();
  const { presentes, negocio, modoDemo } = config;
  const [categoria, setCategoria] = useState<string>(TODOS);
  const prateleira = useRef<HTMLUListElement>(null);
  const central = useIndiceCentral(prateleira);

  const itens =
    categoria === TODOS
      ? presentes.itens
      : presentes.itens.filter((i) => i.categoria === categoria);

  const escolher = (nova: string) => {
    setCategoria(nova);
    prateleira.current?.scrollTo?.({ left: 0 });
  };

  const rolar = (sentido: 1 | -1) => {
    const el = prateleira.current;
    const card = el?.firstElementChild as HTMLElement | null;
    if (!el || !card) return;
    el.scrollBy?.({ left: sentido * (card.offsetWidth + 16), behavior: 'smooth' });
  };

  return (
    <section id="presentes" className={css.secao} aria-labelledby="presentes-titulo">
      <div className={`container ${css.cabeca}`}>
        <TituloSecao id="presentes-titulo" texto={presentes.titulo} secao="presentes" />

        {presentes.destaqueRevelacao && (
          <div className={css.revelacao}>
            <IconeRevelacao className={css.iconeRevelacao} />
            <div>
              <p className={css.revelacaoTitulo}>{presentes.destaqueRevelacao.titulo}</p>
              <p className={css.revelacaoTexto}>{presentes.destaqueRevelacao.texto}</p>
            </div>
          </div>
        )}

        <div className={css.chips} role="group" aria-label="Categorias de produtos">
          {[TODOS, ...presentes.categorias].map((nome) => (
            <button
              key={nome}
              type="button"
              className={css.chip}
              aria-pressed={categoria === nome}
              onClick={() => escolher(nome)}
            >
              {nome}
            </button>
          ))}
        </div>
        <p className="sr-only" aria-live="polite">
          {itens.length} {itens.length === 1 ? 'produto' : 'produtos'}
        </p>
      </div>

      <ul ref={prateleira} className={css.prateleira} role="list" aria-label="Produtos">
        {itens.map((item, i) => (
          <li key={item.id} className={css.card} data-central={i === central || undefined}>
            <article className={css.artigo}>
              <Revelar>
                <div className={css.foto}>
                  <Foto id={item.foto} sizes="(min-width: 900px) 32vw, 84vw" />
                </div>
              </Revelar>
              <p className={`rotulo ${css.categoria}`}>{item.categoria}</p>
              <h3 className={css.nome}>{item.nome}</h3>
              <p className={css.frase}>{item.frase}</p>
              <p className={css.preco}>{formatarPreco(item.valor, modoDemo)}</p>
              <Botao
                className={css.pedir}
                href={urlWhatsapp(negocio.whatsapp, item.mensagemWhatsapp)}
                target="_blank"
                rel="noopener noreferrer"
              >
                Pedir no WhatsApp <span className="sr-only">— {item.nome}</span>
              </Botao>
            </article>
          </li>
        ))}
      </ul>

      <div className={`container ${css.rodape}`}>
        {modoDemo && <p className={css.nota}>Fotos ilustrativas de produtos</p>}
        <div className={css.setas}>
          <button
            type="button"
            className={css.seta}
            onClick={() => rolar(-1)}
            aria-label="Produtos anteriores"
          >
            ←
          </button>
          <button
            type="button"
            className={css.seta}
            onClick={() => rolar(1)}
            aria-label="Próximos produtos"
          >
            →
          </button>
        </div>
      </div>
    </section>
  );
}
