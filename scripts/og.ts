/**
 * Gera public/og.jpg (1200×630, < 300 KB) fotografando a rota /og (SPEC §13).
 * Regere sempre que o tema ou a foto principal mudarem:  npm run og
 */
import { existsSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import sharp from 'sharp';
import { createServer } from 'vite';

const RAIZ = fileURLToPath(new URL('..', import.meta.url));
const SAIDA = path.join(RAIZ, 'public', 'og.jpg');
const LIMITE_BYTES = 300 * 1024;

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
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ].find((c) => existsSync(c));
}

const servidor = await createServer({
  root: RAIZ,
  logLevel: 'error',
  server: { port: 0, host: '127.0.0.1' },
});
await servidor.listen();
const base = servidor.resolvedUrls?.local[0];
if (!base) throw new Error('Não consegui subir o servidor local.');

const navegador = await chromium.launch({ executablePath: localizarNavegador() });
try {
  const pagina = await navegador.newPage({ viewport: { width: 1200, height: 630 } });
  const tema = process.argv.find((a) => a.startsWith('--tema='))?.split('=')[1];
  await pagina.goto(`${base}og${tema ? `?tema=${tema}` : ''}`, { waitUntil: 'networkidle' });
  await pagina.waitForSelector('[data-og-pronto]');
  await pagina.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      Array.from(document.images).map((img) =>
        img.complete ? null : new Promise((ok) => img.addEventListener('load', ok, { once: true })),
      ),
    );
  });
  const png = await pagina.screenshot({ type: 'png' });

  let qualidade = 84;
  let jpg = await sharp(png).jpeg({ quality: qualidade, progressive: false }).toBuffer();
  while (jpg.length > LIMITE_BYTES && qualidade > 40) {
    qualidade -= 6;
    jpg = await sharp(png).jpeg({ quality: qualidade, progressive: false }).toBuffer();
  }
  await writeFile(SAIDA, jpg);
  console.log(
    `og: public/og.jpg gerada (${(jpg.length / 1024).toFixed(0)} KB, qualidade ${qualidade})`,
  );
  if (jpg.length > LIMITE_BYTES) console.warn('  aviso: passou de 300 KB.');
} finally {
  await navegador.close();
  await servidor.close();
}
