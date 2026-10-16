import { faqVisivel } from '../config/secoes.ts';
import type { SiteConfig } from '../config/types.ts';

type Negocio = SiteConfig['negocio'];
type Local = NonNullable<Negocio['locais']>[number];

const TELEFONE_PROVISORIO = /0{9}$/;

function telefone(whatsapp: string | undefined): string | undefined {
  return whatsapp && !TELEFONE_PROVISORIO.test(whatsapp) ? `+${whatsapp}` : undefined;
}

function sameAs(n: Negocio): string[] {
  const usuarios = n.redes?.length
    ? n.redes.map((r) => r.usuario)
    : n.instagram
      ? [n.instagram]
      : [];
  return usuarios.map((u) => `https://instagram.com/${u}`);
}

/** Um ponto de atendimento (estúdio ou loja) só com campos que existem no config. */
function ponto(
  tipo: 'ProfessionalService' | 'Store',
  c: SiteConfig,
  base: string,
  local: Local | undefined,
): Record<string, unknown> {
  const n = c.negocio;
  const endereco = local?.endereco ?? n.endereco;
  const horarios = local?.horarios ?? n.horarios;
  const tel = telefone(local?.whatsapp ?? n.whatsapp);
  const dados: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': tipo,
    name: local?.rotulo && local.tipo === 'loja' ? `${n.nome} — ${local.rotulo}` : n.nome,
    url: base,
    image: `${base}/og.jpg`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: n.cidade,
      addressRegion: n.uf,
      ...(endereco ? { streetAddress: endereco } : null),
      addressCountry: 'BR',
    },
  };
  if (tel) dados.telephone = tel;
  const redes = sameAs(n);
  if (redes.length) dados.sameAs = redes;
  if (horarios?.length) dados.openingHours = horarios.map((h) => `${h.dias} ${h.horas}`);
  return dados;
}

/**
 * Dados estruturados (SPEC §13 e adendo I.5): LocalBusiness (estúdio, subtipo ProfessionalService),
 * Store (loja, só se houver um ponto do tipo "loja") e FAQPage (só com respostas confirmadas).
 */
export function dadosEstruturados(c: SiteConfig, base: string): object[] {
  const locais = c.negocio.locais ?? [];
  const saida: object[] = [
    ponto(
      'ProfessionalService',
      c,
      base,
      locais.find((l) => l.tipo === 'estudio'),
    ),
  ];
  const loja = locais.find((l) => l.tipo === 'loja');
  if (loja) saida.push(ponto('Store', c, base, loja));

  const confirmadas = c.faq.itens.filter((i) => i.confirmada);
  if (confirmadas.length > 0 && faqVisivel({ ...c, modoDemo: false }).length > 0) {
    saida.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: confirmadas.map((i) => ({
        '@type': 'Question',
        name: i.pergunta,
        acceptedAnswer: { '@type': 'Answer', text: i.resposta },
      })),
    });
  }
  return saida;
}
