/** matchMedia controlável: cada teste liga só as media queries que quer. */
export interface Midia {
  reduzido?: boolean;
  ponteiroGrosso?: boolean;
  estreito?: boolean;
  /** (min-width: 900px): composição de desktop. */
  largo?: boolean;
  /** (hover: hover) and (pointer: fine): mouse de verdade. */
  mouse?: boolean;
}

const original = typeof window !== 'undefined' ? window.matchMedia : undefined;

export function definirMidia(m: Midia): void {
  const ligadas = (consulta: string): boolean => {
    if (consulta.includes('prefers-reduced-motion: reduce')) return Boolean(m.reduzido);
    if (consulta.includes('hover: hover')) return Boolean(m.mouse);
    if (consulta.includes('max-width: 767px') && consulta.includes('pointer: coarse'))
      return Boolean(m.ponteiroGrosso || m.estreito);
    if (consulta.includes('pointer: coarse')) return Boolean(m.ponteiroGrosso);
    if (consulta.includes('max-width: 640px')) return Boolean(m.estreito);
    if (consulta.includes('min-width: 900px')) return Boolean(m.largo);
    return false;
  };
  window.matchMedia = ((consulta: string) => ({
    matches: ligadas(consulta),
    media: consulta,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

export function restaurarMidia(): void {
  if (original) window.matchMedia = original;
}
