import type { SecaoId, SiteConfig } from './types.ts';

/** Seções que já têm componente. As demais (Fase 2) são ignoradas mesmo se estiverem em `secoes`. */
export const SECOES_IMPLEMENTADAS: readonly SecaoId[] = [
  'intro',
  'faixa',
  'sessoes',
  'trabalhos',
  'ctaFinal',
];

interface InfoSecao {
  /** id do elemento no HTML (alvo de âncoras). */
  ancora: string;
  /** Rótulo mono do título editorial ("02 — TRABALHOS") e do menu. */
  rotulo: string;
  /** Aparece no menu do header. */
  navegacao: boolean;
}

/** Palavras estruturais da interface (não são conteúdo do estúdio). */
export const INFO_SECOES: Partial<Record<SecaoId, InfoSecao>> = {
  intro: { ancora: 'topo', rotulo: 'Início', navegacao: false },
  sessoes: { ancora: 'sessoes', rotulo: 'Sessões', navegacao: true },
  trabalhos: { ancora: 'trabalhos', rotulo: 'Trabalhos', navegacao: true },
  processo: { ancora: 'como-funciona', rotulo: 'Como funciona', navegacao: true },
  pacotes: { ancora: 'pacotes', rotulo: 'Pacotes', navegacao: true },
  depoimentos: { ancora: 'depoimentos', rotulo: 'Depoimentos', navegacao: false },
  pedido: { ancora: 'pedido', rotulo: 'Pedir sessão', navegacao: false },
  faq: { ancora: 'duvidas', rotulo: 'Dúvidas', navegacao: true },
  ctaFinal: { ancora: 'comece', rotulo: 'Comece', navegacao: false },
};

/** Seções com título editorial numerado (01 — SESSÕES, 02 — TRABALHOS…). */
const NUMERADAS: readonly SecaoId[] = [
  'sessoes',
  'trabalhos',
  'processo',
  'pacotes',
  'depoimentos',
  'pedido',
  'faq',
];

function temConteudo(config: SiteConfig, id: SecaoId): boolean {
  switch (id) {
    case 'faixa':
      return config.faixa.itens.length > 0;
    case 'sessoes':
      return config.sessoes.itens.length > 0;
    case 'trabalhos':
      return config.trabalhos.roda.fotos.length > 0;
    default:
      return true;
  }
}

/** Seções que realmente renderizam, na ordem do config. */
export function secoesAtivas(config: SiteConfig): SecaoId[] {
  const vistas = new Set<SecaoId>();
  return config.secoes.filter((id) => {
    if (vistas.has(id)) return false;
    vistas.add(id);
    return SECOES_IMPLEMENTADAS.includes(id) && temConteudo(config, id);
  });
}

/** "01", "02"… entre as seções numeradas que renderizam. */
export function numeroDaSecao(config: SiteConfig, id: SecaoId): string {
  const numeradas = secoesAtivas(config).filter((s) => NUMERADAS.includes(s));
  const i = numeradas.indexOf(id);
  return String(i + 1).padStart(2, '0');
}

export function secaoNoAr(config: SiteConfig, id: SecaoId): boolean {
  return secoesAtivas(config).includes(id);
}

/** Âncoras válidas para `Cta.alvo`. */
export function ancorasValidas(): string[] {
  return Object.values(INFO_SECOES).map((i) => i.ancora);
}
