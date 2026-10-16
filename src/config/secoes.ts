import type { SecaoId, SiteConfig } from './types.ts';

/** Seções que têm componente. Uma seção sem componente é ignorada mesmo se estiver em `secoes`. */
export const SECOES_IMPLEMENTADAS: readonly SecaoId[] = [
  'intro',
  'faixa',
  'sessoes',
  'presentes',
  'manifesto',
  'trabalhos',
  'antesDepois',
  'processo',
  'pacotes',
  'depoimentos',
  'pedido',
  'faq',
  'ctaFinal',
  'contato',
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
  presentes: { ancora: 'presentes', rotulo: 'Presentes', navegacao: true },
  manifesto: { ancora: 'manifesto', rotulo: 'Manifesto', navegacao: false },
  trabalhos: { ancora: 'trabalhos', rotulo: 'Trabalhos', navegacao: true },
  antesDepois: { ancora: 'antes-e-depois', rotulo: 'Antes e depois', navegacao: false },
  processo: { ancora: 'como-funciona', rotulo: 'Como funciona', navegacao: false },
  pacotes: { ancora: 'pacotes', rotulo: 'Pacotes', navegacao: true },
  depoimentos: { ancora: 'depoimentos', rotulo: 'Depoimentos', navegacao: false },
  pedido: { ancora: 'pedido', rotulo: 'Pedir sessão', navegacao: false },
  faq: { ancora: 'duvidas', rotulo: 'Dúvidas', navegacao: true },
  ctaFinal: { ancora: 'comece', rotulo: 'Comece', navegacao: false },
  contato: { ancora: 'contato', rotulo: 'Contato', navegacao: false },
};

/** Seções com título editorial numerado (01 — SESSÕES, 02 — TRABALHOS…). */
const NUMERADAS: readonly SecaoId[] = [
  'sessoes',
  'presentes',
  'trabalhos',
  'processo',
  'pacotes',
  'depoimentos',
  'pedido',
  'faq',
  'contato',
];

/** Perguntas que aparecem: respostas de exemplo só na prévia. */
export function faqVisivel(config: SiteConfig) {
  return config.faq.itens.filter((i) => config.modoDemo || i.confirmada);
}

/** Depoimentos que aparecem: exemplos só na prévia. */
export function depoimentosVisiveis(config: SiteConfig) {
  return config.depoimentos.filter((d) => config.modoDemo || !d.exemplo);
}

function temConteudo(config: SiteConfig, id: SecaoId): boolean {
  switch (id) {
    case 'faixa':
      return config.faixa.itens.length > 0;
    case 'sessoes':
      return config.sessoes.itens.length > 0;
    case 'trabalhos':
      return config.trabalhos.roda.fotos.length > 0;
    case 'presentes':
      return config.presentes.mostrar && config.presentes.itens.length > 0;
    case 'manifesto':
      // Texto de exemplo só aparece na prévia; em produção a seção some até ser confirmado.
      return (
        config.manifesto.palavras.length > 0 && (config.modoDemo || config.manifesto.confirmado)
      );
    case 'faq':
      return faqVisivel(config).length > 0;
    case 'antesDepois':
      return config.antesDepois.length > 0;
    case 'processo':
      return config.processo.passos.length > 0;
    case 'pacotes':
      return config.pacotes.mostrar && config.pacotes.grupos.some((g) => g.itens.length > 0);
    case 'depoimentos':
      return depoimentosVisiveis(config).length > 0;
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
