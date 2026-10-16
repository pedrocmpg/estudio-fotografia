import type { TemaId } from '../src/config/types.ts';
import { contraste } from '../src/lib/cor.ts';

export type Tokens = Record<string, string>;

const TEMAS: TemaId[] = ['camara-escura', 'luz-natural'];

/** Lê os tokens de cada tema direto de src/styles/temas.css (única fonte da verdade). */
export function lerTokensDosTemas(css: string): Record<TemaId, Tokens> {
  const resultado = {} as Record<TemaId, Tokens>;
  for (const id of TEMAS) {
    const bloco = css.match(new RegExp(`html\\[data-theme='${id}'\\]\\s*\\{([^}]*)\\}`));
    if (!bloco) throw new Error(`temas.css: bloco do tema "${id}" não encontrado.`);
    const tokens: Tokens = {};
    for (const m of bloco[1]!.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
      tokens[m[1]!] = m[2]!.trim();
    }
    resultado[id] = tokens;
  }
  return resultado;
}

/** Pares texto/fundo que precisam de 4,5:1 (WCAG AA, texto normal). */
export const PARES_CONTRASTE: readonly (readonly [texto: string, fundo: string])[] = [
  ['--text', '--bg'],
  ['--text', '--surface'],
  ['--text-2', '--bg'],
  ['--text-2', '--surface'],
  ['--accent-texto', '--bg'],
  ['--accent-texto', '--surface'],
  ['--on-accent', '--accent'],
];

export interface ResultadoContraste {
  par: string;
  razao: number;
  ok: boolean;
}

export function checarContraste(tokens: Tokens, minimo = 4.5): ResultadoContraste[] {
  return PARES_CONTRASTE.map(([texto, fundo]) => {
    const razao = contraste(tokens[texto]!, tokens[fundo]!);
    return { par: `${texto} sobre ${fundo}`, razao, ok: razao >= minimo };
  });
}
