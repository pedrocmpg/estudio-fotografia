import { Foto } from '../components/Foto.tsx';
import { siteConfig } from '../config/site.config.ts';
import css from './PaginaOg.module.css';

/** Rota /og: só existe para o scripts/og.ts tirar o print. Tema e fotos vêm do config. */
export default function PaginaOg() {
  const { hero, negocio } = siteConfig;
  const destaque =
    hero.destaque.modo === 'tagline'
      ? (hero.destaque.tagline ?? hero.destaque.texto ?? '')
      : (hero.destaque.texto ?? 'Fotografia em {cidade}').replace('{cidade}', negocio.cidade);
  return (
    <main className={css.cartao} data-og-pronto>
      {hero.fundoFinal.foto && (
        <div className={css.foto}>
          <Foto id={hero.fundoFinal.foto} sizes="1200px" alt="" prioridade />
        </div>
      )}
      <div className={css.scrim} />
      <h1 className={css.nome}>{hero.nome}</h1>
      <span className={css.linha} />
      <p className={css.destaque}>{destaque}</p>
    </main>
  );
}
