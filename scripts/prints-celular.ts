/**
 * Prints do site no celular (SPEC §11, "tela nunca vazia"): rola a página do topo ao rodapé, uma tela
 * por vez, em 360 e 390 px, e mede quanto de cada print tem conteúdo.
 * Uso:  npm run build && npm run prints:celular   (saída em docs/prints/ajuste-celular/)
 *
 * A medida: o print é dividido em 16 faixas horizontais; uma faixa "tem conteúdo" se mais de 2% dos
 * seus pixels destoam da cor dominante do print. O requisito é ≥ 40% das faixas com conteúdo.
 */
import { existsSync } from 'node:fs';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import sharp from 'sharp';
import { preview } from 'vite';

const RAIZ = fileURLToPath(new URL('..', import.meta.url));
const SAIDA = path.join(RAIZ, 'docs', 'prints', 'ajuste-celular');
const TELAS = [
  { largura: 360, altura: 780 },
  { largura: 390, altura: 844 },
];
const FAIXAS = 16;
const MINIMO = 0.4;

async function conteudo(png: Buffer): Promise<number> {
  const { data, info } = await sharp(png)
    .resize(60, 120, { fit: 'fill' })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const cor = (i: number): [number, number, number] => [data[i]!, data[i + 1]!, data[i + 2]!];
  // cor dominante: moda dos pixels quantizados em passos de 16
  const contagem = new Map<string, number>();
  for (let i = 0; i < data.length; i += 3) {
    const [r, g, b] = cor(i);
    const k = `${r >> 4},${g >> 4},${b >> 4}`;
    contagem.set(k, (contagem.get(k) ?? 0) + 1);
  }
  const [dominante] = [...contagem.entries()].sort((a, b) => b[1] - a[1])[0]!;
  const [dr, dg, db] = dominante.split(',').map((v) => Number(v) * 16 + 8) as [
    number,
    number,
    number,
  ];
  let comConteudo = 0;
  const alturaFaixa = h / FAIXAS;
  for (let f = 0; f < FAIXAS; f++) {
    let diferentes = 0;
    let total = 0;
    for (let y = Math.floor(f * alturaFaixa); y < Math.floor((f + 1) * alturaFaixa); y++) {
      for (let x = 0; x < w; x++) {
        const [r, g, b] = cor((y * w + x) * 3);
        total++;
        if (Math.abs(r - dr) + Math.abs(g - dg) + Math.abs(b - db) > 60) diferentes++;
      }
    }
    if (diferentes / total > 0.02) comConteudo++;
  }
  return comConteudo / FAIXAS;
}

const servidor = await preview({
  root: RAIZ,
  logLevel: 'error',
  preview: { port: 0, host: '127.0.0.1' },
});
const base = servidor.resolvedUrls?.local[0];
if (!base) throw new Error('não consegui subir o servidor de prévia (rode npm run build antes)');

/** O Chromium do Playwright, ou um Chrome/Edge instalado no sistema. */
function localizarNavegador(): string | undefined {
  try {
    const padrao = chromium.executablePath();
    if (existsSync(padrao)) return padrao;
  } catch {
    /* sem Chromium do Playwright */
  }
  return [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    '/usr/bin/google-chrome',
  ].find((c) => existsSync(c));
}

const navegador = await chromium.launch({ executablePath: localizarNavegador() });
await rm(SAIDA, { recursive: true, force: true });
const linhas: string[] = ['# Prints do celular — medição de "tela vazia"', ''];
let falhas = 0;

for (const tela of TELAS) {
  const pasta = path.join(SAIDA, String(tela.largura));
  await mkdir(pasta, { recursive: true });
  const contexto = await navegador.newContext({
    viewport: { width: tela.largura, height: tela.altura },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    reducedMotion: process.env.REDUZIDO ? 'reduce' : 'no-preference',
  });
  const pagina = await contexto.newPage();
  await pagina.addInitScript(() => sessionStorage.setItem('intro-vista', '1'));
  await pagina.goto(base, { waitUntil: 'networkidle' });
  await pagina.waitForTimeout(1200);

  linhas.push(
    `## ${tela.largura} × ${tela.altura}`,
    '',
    '| print | rolagem (px) | conteúdo |',
    '|---|---|---|',
  );
  const total = await pagina.evaluate(() => document.documentElement.scrollHeight);
  let n = 0;
  for (let y = 0; ; y += tela.altura) {
    await pagina.evaluate((alvo) => window.scrollTo(0, alvo), y);
    await pagina.waitForTimeout(1100);
    const nome = `${String(++n).padStart(2, '0')}.jpg`;
    const png = await pagina.screenshot({
      path: path.join(pasta, nome),
      type: 'jpeg',
      quality: 72,
      scale: 'css',
    });
    const c = await conteudo(png);
    const ruim = c < MINIMO;
    if (ruim) falhas++;
    linhas.push(`| ${nome} | ${y} | ${(c * 100).toFixed(0)}%${ruim ? ' ❌' : ''} |`);
    if (y + tela.altura >= total) break;
  }
  linhas.push('', `Altura total: ${total} px = ${(total / tela.altura).toFixed(1)} telas.`, '');
  await contexto.close();
}

linhas.push(
  falhas
    ? `**${falhas} print(s) abaixo de ${MINIMO * 100}%.**`
    : '**Nenhum print abaixo do mínimo.**',
);
await writeFile(path.join(SAIDA, 'relatorio.md'), linhas.join('\n') + '\n');
console.log(linhas.join('\n'));
await navegador.close();
servidor.httpServer.close();
process.exit(falhas ? 1 : 0);
