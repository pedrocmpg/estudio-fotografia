/**
 * Pipeline de fotos (SPEC §6).
 *
 *   npm run fotos            processa só o que mudou
 *   npm run fotos:forcar     reprocessa tudo
 *   tsx scripts/fotos.ts --estrito   falha se alguma foto ainda for placeholder
 *
 * Entrada:  fotos-originais/ + src/data/fotos.meta.json
 * Saída:    public/fotos/ + src/data/fotos.manifest.json
 */
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import exifReader from 'exif-reader';
import sharp, { type Metadata, type Sharp } from 'sharp';
import type { Exposicao, FotoManifesto, FotoMeta } from '../src/data/fotos.types.ts';
import { formatarExposicao } from './exposicao.ts';

const RAIZ = fileURLToPath(new URL('..', import.meta.url));
const DIR_ORIGINAIS = path.join(RAIZ, 'fotos-originais');
const DIR_SAIDA = path.join(RAIZ, 'public', 'fotos');
const ARQ_META = path.join(RAIZ, 'src', 'data', 'fotos.meta.json');
const ARQ_MANIFESTO = path.join(RAIZ, 'src', 'data', 'fotos.manifest.json');

const LARGURAS = [480, 960, 1600, 2400];
const FORMATOS = ['avif', 'webp', 'jpg'] as const;
type Formato = (typeof FORMATOS)[number];
/** Muda quando a receita de encode muda, para invalidar o cache. */
const VERSAO_RECEITA = 'v1-avif50-webp72-jpg78';
const EXTENSOES = ['.jpg', '.jpeg', '.png', '.heic'];

const args = new Set(process.argv.slice(2));
const FORCAR = args.has('--forcar');
const ESTRITO = args.has('--estrito');

const avisos: string[] = [];
const erros: string[] = [];

function sha1(...partes: (string | Buffer)[]): string {
  const h = createHash('sha1');
  for (const p of partes) h.update(p);
  return h.digest('hex').slice(0, 16);
}

// ---------- exposição (só abertura, velocidade, ISO e focal) ----------

function extrairExposicao(exif: Buffer | undefined): Exposicao | undefined {
  if (!exif) return undefined;
  try {
    const dados = exifReader(exif);
    // Só o bloco de exposição; Image/GPS/serial nunca são lidos.
    return formatarExposicao((dados.Photo ?? {}) as Parameters<typeof formatarExposicao>[0]);
  } catch {
    return undefined;
  }
}

// ---------- placeholders ----------

const DIMENSOES = {
  horizontal: { w: 1600, h: 1067 },
  vertical: { w: 1200, h: 1500 },
  quadrada: { w: 1200, h: 1200 },
} as const;

/** Degradês quentes e sóbrios: a prévia fica coerente sem nenhuma foto. */
const PALETAS: [string, string, string][] = [
  ['#3b2a1e', '#a8683a', '#e8c9a0'],
  ['#2b2320', '#7a4b3a', '#d9a77f'],
  ['#1f2a2b', '#4f6b66', '#c9b79c'],
  ['#2e2118', '#b5532d', '#f0d2b0'],
  ['#262019', '#8a7552', '#e6d8bd'],
  ['#2a1f24', '#7d4a52', '#e0b9a8'],
];

function escaparXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function svgPlaceholder(meta: FotoMeta): { svg: string; w: number; h: number } {
  const { w, h } = DIMENSOES[meta.orientacao ?? 'horizontal'];
  const n = parseInt(sha1(meta.id).slice(0, 6), 16);
  const [a, b, c] = PALETAS[n % PALETAS.length]!;
  const angulo = (n >> 3) % 360;
  const rad = (angulo * Math.PI) / 180;
  const x1 = 50 - Math.cos(rad) * 50;
  const y1 = 50 - Math.sin(rad) * 50;
  const x2 = 50 + Math.cos(rad) * 50;
  const y2 = 50 + Math.sin(rad) * 50;
  const luzX = 20 + (n % 60);
  const luzY = 20 + ((n >> 5) % 40);
  const rotulo = escaparXml(`[FOTO — ${meta.categoria}]`);
  // Em fotos horizontais (fundos de hero e CTA) o texto da página cobre o centro: rótulo embaixo.
  const horizontal = (meta.orientacao ?? 'horizontal') === 'horizontal';
  const tam = Math.round(Math.min(w, h) * (horizontal ? 0.03 : 0.045));
  const rotuloY = horizontal ? Math.round(h * 0.82) : h / 2;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="g" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">
      <stop offset="0" stop-color="${a}"/><stop offset=".55" stop-color="${b}"/><stop offset="1" stop-color="${c}"/>
    </linearGradient>
    <radialGradient id="l" cx="${luzX}%" cy="${luzY}%" r="55%">
      <stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="v" x1="0" y1="0" x2="0" y2="1">
      <stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".35"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <rect width="${w}" height="${h}" fill="url(#l)"/>
  <rect width="${w}" height="${h}" fill="url(#v)"/>
  <text x="${w / 2}" y="${rotuloY}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="${tam}" letter-spacing="${tam * 0.12}" fill="#ffffff" fill-opacity=".72">${rotulo}</text>
</svg>`;
  return { svg, w, h };
}

// ---------- processamento ----------

interface Saida {
  largura: number;
  altura: number;
  larguras: number[];
  exposicao?: Exposicao;
  placeholder: string;
  cor: string;
}

function nomeArquivo(id: string, largura: number, formato: Formato): string {
  return `${id}-${largura}.${formato}`;
}

function encode(base: Sharp, formato: Formato): Sharp {
  switch (formato) {
    case 'avif':
      return base.avif({ quality: 50, effort: 4 });
    case 'webp':
      return base.webp({ quality: 72 });
    case 'jpg':
      return base.jpeg({ quality: 78, progressive: true, mozjpeg: true });
  }
}

async function gerarSaidas(
  id: string,
  entrada: Buffer,
  exposicao: Exposicao | undefined,
): Promise<Saida> {
  // rotate() aplica a orientação do EXIF; como não usamos withMetadata(), tudo é removido
  // da saída (EXIF, GPS, serial) e a imagem sai em sRGB.
  const orientada = sharp(entrada, { failOn: 'none' }).rotate();
  const { data: bufOrientado, info } = await orientada.toBuffer({ resolveWithObject: true });
  const larguraOriginal = info.width;
  const larguras = LARGURAS.filter((l) => l <= larguraOriginal);
  if (larguras.length === 0) larguras.push(larguraOriginal);

  for (const l of larguras) {
    for (const f of FORMATOS) {
      const base = sharp(bufOrientado).resize({ width: l, withoutEnlargement: true });
      await encode(base.toColourspace('srgb'), f).toFile(
        path.join(DIR_SAIDA, nomeArquivo(id, l, f)),
      );
    }
  }

  const miniatura = await sharp(bufOrientado)
    .resize({ width: 16 })
    .toColourspace('srgb')
    .webp({ quality: 40 })
    .toBuffer();
  const { dominant } = await sharp(bufOrientado).stats();
  const hex =
    '#' + [dominant.r, dominant.g, dominant.b].map((v) => v.toString(16).padStart(2, '0')).join('');

  return {
    largura: info.width,
    altura: info.height,
    larguras,
    exposicao,
    placeholder: `data:image/webp;base64,${miniatura.toString('base64')}`,
    cor: hex,
  };
}

function montarSrcset(id: string, larguras: number[], formato: Formato): string {
  return larguras.map((l) => `/fotos/${nomeArquivo(id, l, formato)} ${l}w`).join(', ');
}

function montarEntrada(meta: FotoMeta, s: Saida, hash: string, gerado: boolean): FotoManifesto {
  const meio = s.larguras.find((l) => l >= 960) ?? s.larguras[s.larguras.length - 1]!;
  const entrada: FotoManifesto = {
    id: meta.id,
    largura: s.largura,
    altura: s.altura,
    proporcao: Number((s.largura / s.altura).toFixed(4)),
    src: `/fotos/${nomeArquivo(meta.id, meio, 'jpg')}`,
    srcset: {
      avif: montarSrcset(meta.id, s.larguras, 'avif'),
      webp: montarSrcset(meta.id, s.larguras, 'webp'),
      jpg: montarSrcset(meta.id, s.larguras, 'jpg'),
    },
    placeholder: s.placeholder,
    cor: s.cor,
    foco: meta.foco,
    alt: meta.alt,
    placeholderGerado: gerado,
    hash,
  };
  if (s.exposicao) entrada.exposicao = s.exposicao;
  return entrada;
}

/** Arquivos que o manifesto anterior diz existir — usados para validar o cache. */
function arquivosDe(entrada: FotoManifesto): string[] {
  const urls = [entrada.srcset.avif, entrada.srcset.webp, entrada.srcset.jpg]
    .join(', ')
    .split(',')
    .map((p) => p.trim().split(' ')[0]!);
  return urls.map((u) => path.join(RAIZ, 'public', u));
}

async function processar(
  meta: FotoMeta,
  anterior: FotoManifesto | undefined,
): Promise<{ entrada: FotoManifesto; reaproveitada: boolean }> {
  const caminho = meta.arquivo ? path.join(DIR_ORIGINAIS, meta.arquivo) : undefined;
  const temArquivo = caminho !== undefined && existsSync(caminho);

  if (meta.arquivo && !temArquivo) {
    const msg = `${meta.id}: arquivo "${meta.arquivo}" não está em fotos-originais/ — usando placeholder.`;
    (ESTRITO ? erros : avisos).push(msg);
  }

  let hash: string;
  let origem: Buffer;
  let gerado: boolean;
  let exposicao: Exposicao | undefined;

  if (temArquivo) {
    origem = await readFile(caminho);
    hash = sha1(origem, VERSAO_RECEITA);
    gerado = false;
  } else {
    const { svg } = svgPlaceholder(meta);
    origem = Buffer.from(svg);
    hash = sha1(svg, VERSAO_RECEITA);
    gerado = true;
    if (ESTRITO && !meta.arquivo)
      erros.push(`${meta.id}: sem arquivo e o modo estrito está ligado.`);
  }

  if (
    !FORCAR &&
    anterior &&
    anterior.hash === hash &&
    anterior.placeholderGerado === gerado &&
    arquivosDe(anterior).every((f) => existsSync(f))
  ) {
    // O cache cobre o que é caro (encode). alt e foco vêm sempre do meta.
    const reaproveitada: FotoManifesto = { ...anterior, alt: meta.alt, foco: meta.foco };
    return { entrada: reaproveitada, reaproveitada: true };
  }

  if (temArquivo) {
    let meta0: Metadata;
    try {
      meta0 = await sharp(origem, { failOn: 'none' }).metadata();
    } catch (e) {
      const heic = /\.heic$/i.test(meta.arquivo ?? '');
      throw new Error(
        `${meta.id}: não consegui ler "${meta.arquivo}". ${
          heic ? 'HEIC não é suportado — converta para JPG antes. ' : ''
        }(${(e as Error).message})`,
        { cause: e },
      );
    }
    exposicao = extrairExposicao(meta0.exif);
  }

  const saida = await gerarSaidas(meta.id, origem, exposicao);
  return { entrada: montarEntrada(meta, saida, hash, gerado), reaproveitada: false };
}

async function limitar<T, R>(itens: T[], limite: number, fn: (i: T) => Promise<R>): Promise<R[]> {
  const resultado: R[] = new Array(itens.length);
  let proximo = 0;
  async function trabalhador() {
    while (proximo < itens.length) {
      const i = proximo++;
      resultado[i] = await fn(itens[i]!);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limite, itens.length) }, trabalhador));
  return resultado;
}

async function main() {
  const inicio = Date.now();
  const metas = JSON.parse(await readFile(ARQ_META, 'utf8')) as FotoMeta[];

  // Validações de entrada
  const ids = new Set<string>();
  for (const m of metas) {
    if (!m.id) erros.push('Há uma foto sem id no meta.');
    if (ids.has(m.id)) erros.push(`${m.id}: id duplicado no meta.`);
    ids.add(m.id);
    if (!m.alt || !m.alt.trim()) erros.push(`${m.id}: texto alternativo (alt) é obrigatório.`);
    if (!/^[a-z0-9][a-z0-9-]*$/.test(m.id)) {
      erros.push(`${m.id}: use só minúsculas, números e hífen no id.`);
    }
  }
  if (erros.length) return falhar();

  await mkdir(DIR_SAIDA, { recursive: true });
  await mkdir(DIR_ORIGINAIS, { recursive: true });

  // Fotos soltas que nenhum meta cita
  const citados = new Set(metas.map((m) => m.arquivo).filter(Boolean));
  const soltos = (await readdir(DIR_ORIGINAIS)).filter(
    (f) => EXTENSOES.includes(path.extname(f).toLowerCase()) && !citados.has(f),
  );
  for (const s of soltos)
    avisos.push(`fotos-originais/${s} não está em fotos.meta.json (ignorada).`);

  let anteriores: FotoManifesto[] = [];
  try {
    anteriores = JSON.parse(await readFile(ARQ_MANIFESTO, 'utf8')) as FotoManifesto[];
  } catch {
    /* primeira execução */
  }
  const porId = new Map(anteriores.map((a) => [a.id, a]));

  const resultados = await limitar(metas, 3, async (m) => {
    try {
      return await processar(m, porId.get(m.id));
    } catch (e) {
      erros.push((e as Error).message);
      return undefined;
    }
  });
  if (erros.length) return falhar();

  const manifesto = resultados.map((r) => r!.entrada);
  await writeFile(ARQ_MANIFESTO, JSON.stringify(manifesto, null, 2) + '\n');

  // Remove arquivos órfãos de public/fotos
  const esperados = new Set(manifesto.flatMap(arquivosDe).map((f) => path.normalize(f)));
  let removidos = 0;
  for (const f of await readdir(DIR_SAIDA)) {
    const cheio = path.normalize(path.join(DIR_SAIDA, f));
    if (!esperados.has(cheio)) {
      await rm(cheio);
      removidos++;
    }
  }

  const novas = resultados.filter((r) => !r!.reaproveitada).length;
  const placeholders = manifesto.filter((m) => m.placeholderGerado).length;
  console.log(
    `fotos: ${manifesto.length} no manifesto · ${novas} processadas · ${
      manifesto.length - novas
    } em cache · ${placeholders} placeholders${removidos ? ` · ${removidos} órfãos removidos` : ''} (${(
      (Date.now() - inicio) /
      1000
    ).toFixed(1)}s)`,
  );
  for (const a of avisos) console.warn(`  aviso: ${a}`);
}

function falhar(): never {
  for (const e of erros) console.error(`  erro: ${e}`);
  console.error('fotos: falhou.');
  process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
