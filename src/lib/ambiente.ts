/** Acesso seguro ao navegador: tudo aqui tolera ambiente sem matchMedia/sessionStorage/URL. */

export function consulta(media: string): boolean {
  try {
    return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia(media).matches
      : false;
  } catch {
    return false;
  }
}

export function parametrosDaUrl(): URLSearchParams {
  try {
    return new URLSearchParams(window.location.search);
  } catch {
    return new URLSearchParams();
  }
}

export function lerSessao(chave: string): string | null {
  try {
    return window.sessionStorage.getItem(chave);
  } catch {
    return null;
  }
}

export function gravarSessao(chave: string, valor: string): void {
  try {
    window.sessionStorage.setItem(chave, valor);
  } catch {
    /* modo privado ou armazenamento bloqueado: segue sem lembrar */
  }
}

export function suportaPreserve3d(): boolean {
  try {
    return (
      typeof CSS !== 'undefined' &&
      typeof CSS.supports === 'function' &&
      CSS.supports('transform-style', 'preserve-3d')
    );
  } catch {
    return false;
  }
}
