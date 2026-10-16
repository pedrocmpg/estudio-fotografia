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

/** Valores do campo "O que você quer": `sessao:<id>`, `presente:<id>` ou `outro`. */
export const TIPO_OUTRO = 'outro';

export interface GrupoDeTipos {
  grupo: 'Sessão' | 'Presente';
  opcoes: { valor: string; rotulo: string }[];
}

interface ConfigDoPedido {
  sessoes: { itens: { id: string; nome: string }[] };
  presentes: { mostrar: boolean; itens: { id: string; nome: string }[] };
}

/** Opções do select agrupado, geradas de `sessoes` e `presentes` (nada é digitado duas vezes). */
export function gruposDeTipos(c: ConfigDoPedido): GrupoDeTipos[] {
  const grupos: GrupoDeTipos[] = [
    {
      grupo: 'Sessão',
      opcoes: c.sessoes.itens.map((s) => ({ valor: `sessao:${s.id}`, rotulo: s.nome })),
    },
  ];
  if (c.presentes.mostrar) {
    grupos.push({
      grupo: 'Presente',
      opcoes: c.presentes.itens.map((p) => ({ valor: `presente:${p.id}`, rotulo: p.nome })),
    });
  }
  return grupos.filter((g) => g.opcoes.length > 0);
}

/** Texto que vai na mensagem para um valor do select ("Sessão: Newborn"). */
export function textoDoTipo(c: ConfigDoPedido, valor: string): string | undefined {
  if (!valor) return undefined;
  if (valor === TIPO_OUTRO) return 'outro assunto';
  for (const g of gruposDeTipos(c)) {
    const achada = g.opcoes.find((o) => o.valor === valor);
    if (achada) return `${g.grupo}: ${achada.rotulo}`;
  }
  return undefined;
}

/** "2026-12-05" (campo de data) → "05/12/2026". Texto livre passa como veio. */
export function formatarData(valor: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor.trim());
  return m ? `${m[3]}/${m[2]}/${m[1]}` : valor.trim();
}

/** Número que recebe o pedido: o do estúdio para sessões, o da loja para presentes. */
export function numeroDoPedido(
  c: {
    negocio: {
      whatsapp: string;
      locais?: { tipo: 'estudio' | 'loja'; whatsapp?: string }[];
    };
  },
  valor: string,
): string {
  const tipo = valor.startsWith('presente:')
    ? 'loja'
    : valor.startsWith('sessao:')
      ? 'estudio'
      : null;
  const local = tipo ? c.negocio.locais?.find((l) => l.tipo === tipo) : undefined;
  return local?.whatsapp ?? c.negocio.whatsapp;
}

/** Marca um link "Pedir esta sessão" ou "Pedir este presente": o formulário lê o clique e pré-seleciona o tipo. */
export const ATRIBUTO_PEDIDO_ALVO = 'data-pedido-alvo';
