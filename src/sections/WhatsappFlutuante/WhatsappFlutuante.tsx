import { useEffect, useState } from 'react';
import { useSiteConfig } from '../../apresentacao/previa.tsx';
import { IconeWhatsApp } from '../../components/icones.tsx';
import { useIntro } from '../../motion/intro.tsx';
import { urlWhatsapp } from '../../lib/pedido.ts';
import css from './WhatsappFlutuante.module.css';

/** Elementos com este atributo escondem o botão enquanto estão na tela (formulário, rodapé). */
export const ATRIBUTO_OCULTA_WHATSAPP = 'data-oculta-whatsapp';

/**
 * Observa um conjunto de elementos e diz se algum está na tela.
 * Devolve null até a primeira leitura do IntersectionObserver, para o botão não piscar no primeiro quadro.
 */
function useAlgumNaTela(seletor: string, dependencia: unknown): boolean | null {
  const [visivel, setVisivel] = useState<boolean | null>(null);
  useEffect(() => {
    const alvos = Array.from(document.querySelectorAll(seletor));
    if (alvos.length === 0 || typeof IntersectionObserver === 'undefined') {
      setVisivel(false);
      return;
    }
    const naTela = new Set<Element>();
    const obs = new IntersectionObserver((entradas) => {
      for (const e of entradas) {
        if (e.isIntersecting) naTela.add(e.target);
        else naTela.delete(e.target);
      }
      setVisivel(naTela.size > 0);
    });
    alvos.forEach((a) => obs.observe(a));
    return () => obs.disconnect();
  }, [seletor, dependencia]);
  return visivel;
}

/**
 * Botão flutuante do WhatsApp (SPEC §7.15): aparece depois do hero, some quando o formulário ou o
 * rodapé estão na tela (não duplicar CTA) e dá um único "pulso" na primeira aparição.
 */
export function WhatsappFlutuante() {
  const config = useSiteConfig();
  const { estado } = useIntro();
  const heroNaTela = useAlgumNaTela('#topo', estado.fase);
  const concorrente = useAlgumNaTela(`[${ATRIBUTO_OCULTA_WHATSAPP}]`, estado.fase);
  const [jaApareceu, setJaApareceu] = useState(false);

  const mostrar = estado.fase !== 'rodando' && heroNaTela === false && concorrente === false;
  useEffect(() => {
    if (mostrar) setJaApareceu(true);
  }, [mostrar]);

  // Só entra no DOM na primeira aparição: assim o pulso (animação de 1 volta) roda uma vez só.
  if (!jaApareceu && !mostrar) return null;

  return (
    <a
      className={css.botao}
      href={urlWhatsapp(config.negocio.whatsapp)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Conversar no WhatsApp"
      data-visivel={mostrar || undefined}
    >
      <IconeWhatsApp />
    </a>
  );
}
