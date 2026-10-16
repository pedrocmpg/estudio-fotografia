import { useSiteConfig } from '../../apresentacao/previa.tsx';
import { Botao } from '../../components/Botao.tsx';
import { Reveal } from '../../components/Reveal.tsx';
import { TituloSecao } from '../../components/TituloSecao.tsx';
import type { SiteConfig } from '../../config/types.ts';
import { urlWhatsapp } from '../../lib/pedido.ts';
import { ATRIBUTO_OCULTA_WHATSAPP } from '../WhatsappFlutuante/WhatsappFlutuante.tsx';
import { redesDoNegocio } from '../Rodape/Rodape.tsx';
import css from './Contato.module.css';

type Local = NonNullable<SiteConfig['negocio']['locais']>[number];

/** Pontos de atendimento: `locais`; sem eles, o endereço único de `negocio`. */
function pontos(negocio: SiteConfig['negocio']): Local[] {
  if (negocio.locais?.length) return negocio.locais;
  return [
    {
      id: 'unico',
      tipo: 'estudio',
      rotulo: negocio.nome,
      endereco: negocio.endereco,
      mapsUrl: negocio.mapsUrl,
    },
  ];
}

/**
 * Contato (SPEC §10.17): um cartão por ponto de atendimento (estúdio e loja) com endereço, "Abrir no
 * mapa" (link, sem iframe), horários e WhatsApp próprio, mais as duas contas de Instagram com rótulo.
 * Dado que falta aparece como `[CONFIRMAR]` na prévia e some no site final.
 */
export function Contato() {
  const { negocio, contato, modoDemo } = useSiteConfig();
  const lista = pontos(negocio);
  const redes = redesDoNegocio(negocio);
  const pendente = (texto: string) =>
    modoDemo ? <p className={css.pendente}>[CONFIRMAR] {texto}</p> : null;

  return (
    <section
      id="contato"
      className={css.secao}
      aria-labelledby="contato-titulo"
      {...{ [ATRIBUTO_OCULTA_WHATSAPP]: '' }}
    >
      <div className="container">
        <TituloSecao id="contato-titulo" texto={contato.titulo} secao="contato" />
        {contato.texto && (
          <Reveal>
            <p className={css.texto}>{contato.texto}</p>
          </Reveal>
        )}

        <ul className={css.pontos} role="list">
          {lista.map((local, i) => {
            const horarios = local.horarios ?? negocio.horarios;
            const numero = local.whatsapp ?? negocio.whatsapp;
            return (
              <li key={local.id} className={css.ponto}>
                <Reveal indice={i} className={css.revelar}>
                  <article className={css.cartao}>
                    <h3 className={css.nome}>{local.rotulo}</h3>
                    {local.endereco ? (
                      <address className={css.endereco}>{local.endereco}</address>
                    ) : (
                      pendente('endereço')
                    )}
                    {local.mapsUrl && (
                      <a
                        className={css.mapa}
                        href={local.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Abrir no mapa <span className="sr-only">— {local.rotulo}</span>
                      </a>
                    )}
                    {horarios?.length ? (
                      <dl className={css.horarios}>
                        {horarios.map((h) => (
                          <div key={h.dias}>
                            <dt>{h.dias}</dt>
                            <dd>{h.horas}</dd>
                          </div>
                        ))}
                      </dl>
                    ) : (
                      pendente('horários')
                    )}
                    <Botao
                      variante="secundario"
                      href={urlWhatsapp(numero)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={css.botao}
                    >
                      Chamar no WhatsApp
                      <span className="sr-only"> — {local.rotulo}</span>
                    </Botao>
                  </article>
                </Reveal>
              </li>
            );
          })}
        </ul>

        {(redes.length > 0 || negocio.email) && (
          <ul className={css.redes} role="list" aria-label="Redes e e-mail">
            {redes.map((rede) => (
              <li key={rede.usuario}>
                <span className="rotulo">{rede.rotulo}</span>
                <a
                  className={css.link}
                  href={`https://instagram.com/${rede.usuario}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  @{rede.usuario}
                </a>
              </li>
            ))}
            {negocio.email && (
              <li>
                <span className="rotulo">E-mail</span>
                <a className={css.link} href={`mailto:${negocio.email}`}>
                  {negocio.email}
                </a>
              </li>
            )}
          </ul>
        )}
        {redes.length === 0 && modoDemo && (
          <p className={css.pendente}>[CONFIRMAR] contas de Instagram do estúdio e da loja</p>
        )}
      </div>
    </section>
  );
}
