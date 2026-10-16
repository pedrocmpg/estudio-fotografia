import { useSiteConfig } from '../../apresentacao/previa.tsx';
import { Reveal } from '../../components/Reveal.tsx';
import { TituloSecao } from '../../components/TituloSecao.tsx';
import { faqVisivel } from '../../config/secoes.ts';
import css from './Faq.module.css';

/**
 * Dúvidas (SPEC §7.12, bloco G): `<details>/<summary>` (acessível sem JS), com uma frase de abertura
 * de tom humano vinda do config. Respostas de exemplo só aparecem na prévia; o JSON-LD FAQPage
 * (build) leva só as confirmadas.
 */
export function Faq() {
  const config = useSiteConfig();
  const { faq } = config;
  const itens = faqVisivel(config);

  return (
    <section id="duvidas" className={css.secao} aria-labelledby="faq-titulo">
      <div className={`container ${css.grade}`}>
        <div className={css.cabeca}>
          <TituloSecao id="faq-titulo" texto={faq.titulo} secao="faq" />
          <Reveal>
            <p className={css.abertura}>{faq.abertura}</p>
          </Reveal>
        </div>

        <div className={css.lista}>
          {itens.map((item) => (
            <details key={item.pergunta} className={css.item}>
              <summary className={css.pergunta}>
                <span>{item.pergunta}</span>
                <span className={css.icone} aria-hidden="true" />
              </summary>
              <div className={css.resposta}>
                <p>{item.resposta}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
