import { useRef } from 'react';
import { useSiteConfig } from '../../apresentacao/previa.tsx';
import { CtaBotao } from '../../components/CtaBotao.tsx';
import { Foto } from '../../components/Foto.tsx';
import { useInView, useReducedMotion } from '../../motion/hooks.ts';
import css from './CtaFinal.module.css';

/**
 * CTA final (SPEC §7.13): foto em tela cheia (full-bleed), scrim só sob o texto e, com `cortinaReversa`, dois painéis que
 * vêm dos lados e emolduram a foto (12% de cada lado). Fecha o ciclo com a abertura; roda uma vez.
 */
export function CtaFinal() {
  const { ctaFinal } = useSiteConfig();
  const ref = useRef<HTMLElement>(null);
  const reduzido = useReducedMotion();
  const entrou = useInView(ref, { uma: true, limiar: 0.35 });
  // Com movimento reduzido a moldura já aparece fechada, sem animar.
  const fechada = entrou || reduzido;

  return (
    <section
      ref={ref}
      id="comece"
      className={css.cta}
      data-fechada={fechada || undefined}
      data-texto={ctaFinal.posicaoTexto ?? 'topo'}
      aria-labelledby="cta-final-titulo"
    >
      <div className={css.foto}>
        <Foto id={ctaFinal.foto} sizes="100vw" alt="" />
        <div className={css.scrim} />
      </div>

      {ctaFinal.cortinaReversa && (
        <>
          <div className={`${css.cortina} ${css.esquerda}`} aria-hidden="true" />
          <div className={`${css.cortina} ${css.direita}`} aria-hidden="true" />
        </>
      )}

      <div className={css.conteudo}>
        <h2 id="cta-final-titulo" className={css.titulo}>
          {ctaFinal.titulo}
        </h2>
        {ctaFinal.texto && <p className={css.texto}>{ctaFinal.texto}</p>}
        <CtaBotao cta={ctaFinal.cta} />
      </div>
    </section>
  );
}
