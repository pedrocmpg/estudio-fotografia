import { CHAVE_INTRO_VISTA } from './constantes.ts';
import { consulta, lerSessao, parametrosDaUrl } from './ambiente.ts';

export interface EntradaDecisao {
  ativo: boolean;
  umaVezPorSessao: boolean;
  /** ?intro=1 */
  forcar: boolean;
  reduzirMovimento: boolean;
  jaVista: boolean;
}

/**
 * A intro roda quando está ligada, o visitante não pediu menos movimento e (ou ela ainda não foi
 * vista nesta sessão ou foi forçada com ?intro=1). Movimento reduzido vale mesmo com ?intro=1.
 * A mesma regra existe em build/script-inicial.ts (roda no <head> antes da primeira pintura).
 */
export function deveRodarIntro(e: EntradaDecisao): boolean {
  if (!e.ativo || e.reduzirMovimento) return false;
  if (e.forcar) return true;
  return !(e.umaVezPorSessao && e.jaVista);
}

export function lerEntradaDecisao(
  intro: { ativo: boolean; umaVezPorSessao: boolean },
  opcoes: { ignorarSessao?: boolean } = {},
): EntradaDecisao {
  return {
    ativo: intro.ativo,
    umaVezPorSessao: intro.umaVezPorSessao,
    forcar: opcoes.ignorarSessao ?? parametrosDaUrl().get('intro') === '1',
    reduzirMovimento: consulta('(prefers-reduced-motion: reduce)'),
    jaVista: lerSessao(CHAVE_INTRO_VISTA) === '1',
  };
}
