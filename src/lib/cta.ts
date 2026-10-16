import { secaoNoAr } from '../config/secoes.ts';
import type { Cta, SiteConfig } from '../config/types.ts';
import { montarMensagem, urlWhatsapp } from './pedido.ts';

/**
 * Para onde um CTA leva. "pedido" rola até o formulário; enquanto o formulário não existe na
 * página (Fase 1), cai direto no WhatsApp com a mensagem inicial montada do modelo do config.
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
    return opcoes.sessaoId ? `#pedido?sessao=${encodeURIComponent(opcoes.sessaoId)}` : '#pedido';
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
