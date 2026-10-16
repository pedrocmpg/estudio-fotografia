/** Tokens de movimento (SPEC §8). Espelham as variáveis --t-* e --ease-* de src/styles/tokens.css. */
export const tempo = {
  rapido: 150,
  base: 300,
  lento: 600,
  etapaCortina: 450,
} as const;

export const easing = {
  saida: 'cubic-bezier(0.22, 1, 0.36, 1)',
  entradaSaida: 'cubic-bezier(0.65, 0, 0.35, 1)',
} as const;

/** Mesmo easing em forma de array, para a biblioteca motion. */
export const easingArray = {
  saida: [0.22, 1, 0.36, 1],
  entradaSaida: [0.65, 0, 0.35, 1],
} as const;
