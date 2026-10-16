/** Monta a mensagem do WhatsApp a partir de `pedido.modeloMensagem` (SPEC §7.11). */

export interface DadosPedido {
  nomeCurto: string;
  nome?: string;
  tipo?: string;
  data?: string;
  local?: string;
  mensagem?: string;
}

const MARCADOR = /\{(\w+)\}/g;

/**
 * Substitui os {campos}. Frases com algum campo vazio são omitidas; linhas que ficam vazias somem.
 * O corte é por frase (. ! ?) para que "Olá, X! Me chamo {nome}." mantenha a saudação sem o nome.
 */
export function montarMensagem(modelo: string, dados: DadosPedido): string {
  const valor = (campo: string): string => {
    const v = (dados as unknown as Record<string, string | undefined>)[campo];
    return (v ?? '').trim();
  };

  const linhas = modelo.split('\n').map((linha) => {
    const frases = linha.match(/[^.!?]+[.!?]*\s*/g) ?? [linha];
    const mantidas = frases.filter((frase) => {
      const campos = [...frase.matchAll(MARCADOR)].map((m) => m[1] as string);
      return campos.every((c) => valor(c) !== '');
    });
    return mantidas
      .join('')
      .replace(MARCADOR, (_, c: string) => valor(c))
      .trim();
  });

  return linhas.filter((l) => l !== '').join('\n');
}

export function urlWhatsapp(numero: string, texto?: string): string {
  const base = `https://wa.me/${numero}`;
  return texto ? `${base}?text=${encodeURIComponent(texto)}` : base;
}
