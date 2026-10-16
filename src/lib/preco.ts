/**
 * Preço de um item. Sem valor definido: "[VALOR]" na prévia e "Consulte" no site final
 * (nunca um preço inventado). Com valor: formato brasileiro, sem centavos quando inteiro.
 */
export function formatarPreco(
  valor: number | null,
  modoDemo: boolean,
  semValor = 'Consulte',
): string {
  if (valor === null) return modoDemo ? '[VALOR]' : semValor;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: Number.isInteger(valor) ? 0 : 2,
    maximumFractionDigits: 2,
  })
    .format(valor)
    .replace(/\s/g, ' ');
}

/** Texto com `[CONFIRMAR]`: aparece na prévia, some no site final. */
export function pendente(texto: string): boolean {
  return texto.includes('[CONFIRMAR]');
}

export function visivel(texto: string | undefined, modoDemo: boolean): texto is string {
  return Boolean(texto) && (modoDemo || !pendente(texto!));
}
