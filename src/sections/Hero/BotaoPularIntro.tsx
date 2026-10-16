import { useSiteConfig } from '../../apresentacao/previa.tsx';
import { useIntro } from '../../motion/intro.tsx';
import css from './BotaoPularIntro.module.css';

/** Primeiro item focável da página enquanto a abertura roda. */
export function BotaoPularIntro() {
  const config = useSiteConfig();
  const { estado, pular } = useIntro();
  if (estado.fase !== 'rodando' || !config.hero.intro.mostrarPular) return null;
  return (
    <button type="button" className={css.pular} onClick={pular}>
      Pular
    </button>
  );
}
