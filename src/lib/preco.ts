/**
 * Preço de um item. Sem valor definido: "[VALOR]" na prévia e "Consulte" no site final
 * (nunca um preço inventado). Com valor: formato brasileiro, sem centavos quando inteiro.
 */
export function formatarPreco(valor: number | null, modoDemo: boolean): string {
  if (valor === null) return modoDemo ? '[VALOR]' : 'Consulte';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: Number.isInteger(valor) ? 0 : 2,
    maximumFractionDigits: 2,
  })
    .format(valor)
    .replace(/\s/g, ' ');
}
