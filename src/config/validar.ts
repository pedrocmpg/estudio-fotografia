import type { SecaoId, SiteConfig } from './types.ts';
import { ancorasValidas } from './secoes.ts';
import { hexParaRgb } from '../lib/cor.ts';

export interface FotoNoManifesto {
  id: string;
  alt: string;
}

export interface ResultadoValidacao {
  erros: string[];
  avisos: string[];
}

const SECOES: SecaoId[] = [
  'intro',
  'faixa',
  'sessoes',
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

/** Todos os ids de foto que o config usa, com o caminho onde aparecem. */
export function coletarFotos(c: SiteConfig): { id: string; onde: string }[] {
  const lista: { id: string; onde: string }[] = [];
  const add = (id: string | undefined, onde: string) => {
    if (id) lista.push({ id, onde });
  };
  const camadas = [...c.hero.intro.camadas, ...(c.hero.intro.camadasOpcionais ?? [])];
  camadas.forEach((cam, i) => {
    add(cam.esquerda, `hero.intro.camadas[${i}].esquerda`);
    add(cam.direita, `hero.intro.camadas[${i}].direita`);
    add(cam.esquerdaMobile, `hero.intro.camadas[${i}].esquerdaMobile`);
    add(cam.direitaMobile, `hero.intro.camadas[${i}].direitaMobile`);
  });
  if (c.hero.fundoFinal.tipo === 'foto') add(c.hero.fundoFinal.foto, 'hero.fundoFinal.foto');
  c.sessoes.itens.forEach((s, i) =>
    s.fotos.forEach((f, j) => add(f, `sessoes.itens[${i}].fotos[${j}]`)),
  );
  c.trabalhos.roda.fotos.forEach((f, i) => add(f, `trabalhos.roda.fotos[${i}]`));
  c.trabalhos.folha.fotos.forEach((f, i) => add(f.id, `trabalhos.folha.fotos[${i}]`));
  c.antesDepois.forEach((p, i) => {
    add(p.antes, `antesDepois[${i}].antes`);
    add(p.depois, `antesDepois[${i}].depois`);
  });
  c.depoimentos.forEach((d, i) => add(d.foto, `depoimentos[${i}].foto`));
  add(c.ctaFinal.foto, 'ctaFinal.foto');
  return lista;
}

export function validarConfig(c: SiteConfig, manifesto: FotoNoManifesto[]): ResultadoValidacao {
  const erros: string[] = [];
  const avisos: string[] = [];
  const erro = (m: string) => erros.push(m);
  const aviso = (m: string) => avisos.push(m);

  // negócio
  if (!/^\d{12,13}$/.test(c.negocio.whatsapp)) {
    erro('negocio.whatsapp: use só dígitos com DDI e DDD (ex.: 5511999999999).');
  } else if (/0{9}$/.test(c.negocio.whatsapp)) {
    aviso('negocio.whatsapp: número ainda é provisório.');
  }
  if (!c.negocio.nome.trim()) erro('negocio.nome: obrigatório.');
  if (c.negocio.instagram?.startsWith('@')) erro('negocio.instagram: sem o @.');

  // meta
  if (c.meta.titulo.length > 60) erro(`meta.titulo: ${c.meta.titulo.length} caracteres (máx. 60).`);
  if (c.meta.descricao.length > 155) {
    erro(`meta.descricao: ${c.meta.descricao.length} caracteres (máx. 155).`);
  }
  try {
    new URL(c.meta.urlCanonica);
  } catch {
    erro('meta.urlCanonica: URL inválida.');
  }

  // tema
  for (const [tema, cor] of Object.entries(c.tema.coresDestaque ?? {})) {
    try {
      hexParaRgb(cor);
    } catch {
      erro(`tema.coresDestaque.${tema}: cor inválida ("${cor}").`);
    }
  }
  for (const cor of c.tema.presetsDestaque ?? []) {
    try {
      hexParaRgb(cor);
    } catch {
      erro(`tema.presetsDestaque: cor inválida ("${cor}").`);
    }
  }

  // seções
  const vistas = new Set<string>();
  for (const s of c.secoes) {
    if (!SECOES.includes(s)) erro(`secoes: "${s}" não existe.`);
    if (vistas.has(s)) erro(`secoes: "${s}" aparece duas vezes.`);
    vistas.add(s);
  }

  // fotos
  const porId = new Map(manifesto.map((f) => [f.id, f]));
  for (const { id, onde } of coletarFotos(c)) {
    const f = porId.get(id);
    if (!f) erro(`${onde}: foto "${id}" não existe no manifest (rode npm run fotos).`);
    else if (!f.alt.trim()) erro(`${onde}: foto "${id}" está sem texto alternativo (alt).`);
  }

  // hero / intro
  const intro = c.hero.intro;
  if (intro.camadas.length < 1 || intro.camadas.length > 3) {
    erro('hero.intro.camadas: use de 1 a 3 camadas.');
  }
  if (intro.etapasPorCamada < 1) erro('hero.intro.etapasPorCamada: mínimo 1.');
  for (const k of ['duracaoEtapaMs', 'pausaEtapaMs', 'pausaCamadaMs'] as const) {
    if (intro[k] < 0) erro(`hero.intro.${k}: não pode ser negativo.`);
  }
  const fundo = c.hero.fundoFinal;
  if (fundo.scrim < 0 || fundo.scrim > 1) erro('hero.fundoFinal.scrim: use um valor entre 0 e 1.');
  if (fundo.tipo === 'foto' && !fundo.foto)
    erro('hero.fundoFinal: tipo "foto" exige o campo foto.');
  if (!c.hero.nome.trim()) erro('hero.nome: obrigatório.');
  const d = c.hero.destaque;
  if (d.modo === 'rotativo' && !(d.itens && d.itens.length >= 2)) {
    erro('hero.destaque: modo "rotativo" precisa de ao menos 2 itens.');
  }
  if (d.modo === 'tagline' && !(d.tagline ?? d.texto)?.trim()) {
    erro('hero.destaque: modo "tagline" precisa de texto.');
  }

  // CTAs
  const ctas = [
    ['hero.ctas.primario', c.hero.ctas.primario],
    ['hero.ctas.secundario', c.hero.ctas.secundario],
    ['ctaFinal.cta', c.ctaFinal.cta],
  ] as const;
  const ancoras = ancorasValidas();
  for (const [onde, cta] of ctas) {
    if (!cta) continue;
    if (cta.acao === 'ancora') {
      if (!cta.alvo) erro(`${onde}: ação "ancora" exige alvo.`);
      else if (!ancoras.includes(cta.alvo)) erro(`${onde}: âncora "${cta.alvo}" não existe.`);
    }
  }

  // sessões / pacotes
  const idsSessao = new Set<string>();
  for (const s of c.sessoes.itens) {
    if (idsSessao.has(s.id)) erro(`sessoes: id "${s.id}" repetido.`);
    idsSessao.add(s.id);
  }
  const idsPacote = new Set<string>();
  for (const p of c.pacotes.itens) {
    if (idsPacote.has(p.id)) erro(`pacotes: id "${p.id}" repetido.`);
    idsPacote.add(p.id);
    if (p.sessaoId && !idsSessao.has(p.sessaoId)) {
      erro(`pacotes.${p.id}: sessaoId "${p.sessaoId}" não existe em sessoes.`);
    }
    if (p.valor !== null && p.valor < 0) erro(`pacotes.${p.id}: valor negativo.`);
  }
  if (c.pacotes.mostrar && (c.pacotes.itens.length < 2 || c.pacotes.itens.length > 4)) {
    aviso('pacotes: o ideal são 2 a 4 pacotes.');
  }

  // galeria
  const roda = c.trabalhos.roda.fotos.length;
  if (roda < 3) erro('trabalhos.roda.fotos: mínimo de 3 fotos para formar o anel.');
  else if (roda < 8 || roda > 10)
    aviso(`trabalhos.roda.fotos: ${roda} fotos (o ideal são 8 a 10).`);
  if (c.processo.passos.length !== 4) aviso('processo.passos: o ideal são 4 passos.');

  return { erros, avisos };
}
