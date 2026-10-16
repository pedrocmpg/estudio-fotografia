import { secaoNoAr } from '../config/secoes.ts';
import type { Cta, SiteConfig } from '../config/types.ts';
import { ATRIBUTO_PEDIDO_ALVO, montarMensagem, urlWhatsapp } from './pedido.ts';

/**
 * Para onde um CTA leva. "pedido" rola até o formulário; se a seção `pedido` estiver fora da página,
 * cai direto no WhatsApp com a mensagem inicial montada do modelo do config.
 */
export function hrefDoCta(
  config: SiteConfig,
  cta: Cta,
  opcoes: { sessaoId?: string } = {},
): string {
  switch (cta.acao) {
    case 'whatsapp':
      return urlWhatsapp(config.negocio.whatsapp);
    case 'ancora':
      return `#${cta.alvo ?? 'topo'}`;
    case 'pedido':
      return hrefPedido(config, opcoes);
  }
}

export function hrefPedido(config: SiteConfig, opcoes: { sessaoId?: string } = {}): string {
  if (secaoNoAr(config, 'pedido')) {
    return '#pedido'; // o tipo escolhido vai por `data-pedido-alvo` (o formulário lê o clique)
  }
  const sessao = config.sessoes.itens.find((s) => s.id === opcoes.sessaoId);
  const texto = montarMensagem(config.pedido.modeloMensagem, {
    nomeCurto: config.negocio.nomeCurto,
    tipo: sessao?.nome,
  });
  return urlWhatsapp(config.negocio.whatsapp, texto);
}

export function ehExterno(href: string): boolean {
  return /^https?:\/\//.test(href);
}

/** Atributo que marca um link como "pedir esta sessão/presente": o formulário pré-seleciona o tipo. */
export function atributoPedido(
  config: SiteConfig,
  alvo: { sessaoId?: string; presenteId?: string },
): Record<string, string> {
  if (!secaoNoAr(config, 'pedido')) return {};
  if (alvo.sessaoId) return { [ATRIBUTO_PEDIDO_ALVO]: `sessao:${alvo.sessaoId}` };
  if (alvo.presenteId) return { [ATRIBUTO_PEDIDO_ALVO]: `presente:${alvo.presenteId}` };
  return {};
}
