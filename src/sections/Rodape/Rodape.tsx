import { useSiteConfig } from '../../apresentacao/previa.tsx';
import { NomeGigante } from '../../components/NomeGigante.tsx';
import { Selo } from '../../components/Selo.tsx';
import { INFO_SECOES, secoesAtivas } from '../../config/secoes.ts';
import type { SiteConfig } from '../../config/types.ts';
import { ATRIBUTO_OCULTA_WHATSAPP } from '../WhatsappFlutuante/WhatsappFlutuante.tsx';
import css from './Rodape.module.css';

/** Contas de Instagram do rodapé: `redes` (com rótulo) ou, se faltar, a conta única `instagram`. */
export function redesDoNegocio(
  negocio: SiteConfig['negocio'],
): { rotulo: string; usuario: string }[] {
  if (negocio.redes?.length) return negocio.redes;
  return negocio.instagram ? [{ rotulo: 'Instagram', usuario: negocio.instagram }] : [];
}

/**
 * Rodapé (bloco F e adendo I.5): faixa de links, redes, pontos de atendimento (estúdio e loja) e,
 * fechando a página como o hero abriu, o nome da marca gigante, cortado pela borda de baixo.
 * Cada item só aparece se existir no config.
 */
export function Rodape() {
  const config = useSiteConfig();
  const { negocio, modoDemo } = config;
  const ano = new Date().getFullYear();
  const atributos = { [ATRIBUTO_OCULTA_WHATSAPP]: '' };
  const links = secoesAtivas(config)
    .map((id) => INFO_SECOES[id])
    .filter((info) => info?.navegacao);
  const redes = redesDoNegocio(negocio);
  // ponto sem nenhum dado (ainda não confirmado) não ganha coluna vazia: a seção Contato cobre
  const locais = (negocio.locais ?? []).filter(
    (l) => l.endereco || l.horarios?.length || l.mapsUrl,
  );

  return (
    <footer className={css.rodape} {...atributos}>
      <div className={`container ${css.interno}`}>
        <div className={css.colunas}>
          {links.length > 0 && (
            <nav aria-label="Rodapé" className={css.coluna}>
              <p className={`rotulo ${css.titulo}`}>Navegar</p>
              <ul>
                {links.map((info) => (
                  <li key={info!.ancora}>
                    <a className={css.link} href={`#${info!.ancora}`}>
                      {info!.rotulo}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          {locais.map((local) => (
            <div key={local.id} className={css.coluna}>
              <p className={`rotulo ${css.titulo}`}>{local.rotulo}</p>
              {local.endereco && <p className={css.texto}>{local.endereco}</p>}
              {local.horarios?.map((h) => (
                <p key={h.dias} className={css.texto}>
                  {h.dias}: {h.horas}
                </p>
              ))}
              {local.mapsUrl && (
                <a
                  className={css.link}
                  href={local.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Abrir no mapa <span className="sr-only">— {local.rotulo}</span>
                </a>
              )}
            </div>
          ))}

          {(redes.length > 0 || negocio.email) && (
            <div className={css.coluna}>
              <p className={`rotulo ${css.titulo}`}>Redes</p>
              <ul>
                {redes.map((rede) => (
                  <li key={rede.usuario}>
                    <a
                      className={css.link}
                      href={`https://instagram.com/${rede.usuario}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {rede.rotulo}: @{rede.usuario}
                    </a>
                  </li>
                ))}
                {negocio.email && (
                  <li>
                    <a className={css.link} href={`mailto:${negocio.email}`}>
                      {negocio.email}
                    </a>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        <div className={css.base}>
          <p className={css.copia}>
            © {ano} {negocio.nome}
          </p>
          {modoDemo && <Selo />}
          <a className={css.link} href="#topo">
            Voltar ao topo
          </a>
        </div>
      </div>

      <NomeGigante texto={negocio.nomeCurto} />
      {negocio.assinatura && <p className="sr-only">{negocio.assinatura}</p>}
    </footer>
  );
}
