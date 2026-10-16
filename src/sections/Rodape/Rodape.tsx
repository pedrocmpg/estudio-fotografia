import { useSiteConfig } from '../../apresentacao/previa.tsx';
import { Selo } from '../../components/Selo.tsx';
import { ATRIBUTO_OCULTA_WHATSAPP } from '../WhatsappFlutuante/WhatsappFlutuante.tsx';
import css from './Rodape.module.css';

/**
 * Rodapé mínimo da Fase 1: © ano + nome, Instagram (se existir) e o selo da prévia.
 * Contato completo, mapa, horários e alternância de tema chegam na Fase 2 (SPEC §7.14).
 */
export function Rodape() {
  const { negocio, modoDemo } = useSiteConfig();
  const ano = new Date().getFullYear();
  const atributos = { [ATRIBUTO_OCULTA_WHATSAPP]: '' };
  return (
    <footer className={css.rodape} {...atributos}>
      <div className={`container ${css.interno}`}>
        <p className={css.copia}>
          © {ano} {negocio.nome}
        </p>
        {negocio.instagram && (
          <a
            className={css.link}
            href={`https://instagram.com/${negocio.instagram}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Instagram @{negocio.instagram}
          </a>
        )}
        {modoDemo && <Selo />}
      </div>
    </footer>
  );
}
