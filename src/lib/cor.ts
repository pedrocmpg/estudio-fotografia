/** Utilitários de cor e contraste (WCAG 2.1). Usados no build, nos testes e no modo apresentação. */

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

export function hexParaRgb(hex: string): Rgb {
  let h = hex.trim().replace(/^#/, '');
  if (h.length === 3) h = [...h].map((c) => c + c).join('');
  if (!/^[0-9a-f]{6}$/i.test(h)) throw new Error(`Cor inválida: "${hex}"`);
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

export function rgbParaHex({ r, g, b }: Rgb): string {
  const p = (v: number) =>
    Math.round(Math.min(255, Math.max(0, v)))
      .toString(16)
      .padStart(2, '0');
  return `#${p(r)}${p(g)}${p(b)}`.toUpperCase();
}

function canal(v: number): number {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

export function luminancia(hex: string): number {
  const { r, g, b } = hexParaRgb(hex);
  return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
}

export function contraste(a: string, b: string): number {
  const la = luminancia(a);
  const lb = luminancia(b);
  const [claro, escuro] = la >= lb ? [la, lb] : [lb, la];
  return (claro + 0.05) / (escuro + 0.05);
}

/** Mistura `cor` com `alvo` (0 = cor, 1 = alvo). */
export function misturar(cor: string, alvo: string, t: number): string {
  const a = hexParaRgb(cor);
  const b = hexParaRgb(alvo);
  return rgbParaHex({
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
  });
}

/** Preto ou branco, o que contrastar mais com `fundo` (texto sobre botão). */
export function corSobre(fundo: string): string {
  return contraste('#FFFFFF', fundo) >= contraste('#0E0C0A', fundo) ? '#FFFFFF' : '#0E0C0A';
}

/**
 * Escurece (fundo claro) ou clareia (fundo escuro) `cor` até chegar ao contraste mínimo com `fundo`.
 * Devolve a própria cor se ela já passa.
 */
export function garantirContraste(cor: string, fundo: string, minimo = 4.5): string {
  if (contraste(cor, fundo) >= minimo) return rgbParaHex(hexParaRgb(cor));
  const alvo = luminancia(fundo) > 0.4 ? '#000000' : '#FFFFFF';
  for (let t = 0.04; t <= 1; t += 0.04) {
    const candidata = misturar(cor, alvo, t);
    if (contraste(candidata, fundo) >= minimo) return candidata;
  }
  return alvo;
}
