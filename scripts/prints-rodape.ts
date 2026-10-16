/**
 * Prints só do rodapé no celular (SPEC §10.17), em 360 e 390 px, nos dois temas, com "Ivy" e com um
 * nome longo. Confere que o nome gigante não passa da largura da tela.
 * Uso:  npm run build && npx tsx scripts/prints-rodape.ts   (saída em docs/prints/rodape-celular/)
 */
import { existsSync } from 'node:fs';
import { mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { preview } from 'vite';

const RAIZ = fileURLToPath(new URL('..', import.meta.url));
const SAIDA = path.join(RAIZ, 'docs', 'prints', 'rodape-celular');
const servidor = await preview({
  root: RAIZ,
  logLevel: 'error',
  preview: { port: 0, host: '127.0.0.1' },
});
const base = servidor.resolvedUrls?.local[0];
if (!base) throw new Error('rode npm run build antes');

const executablePath = [
  chromium.executablePath(),
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].find((c) => existsSync(c));
const navegador = await chromium.launch({ executablePath });
await rm(SAIDA, { recursive: true, force: true });
await mkdir(SAIDA, { recursive: true });
let falhas = 0;

for (const largura of [360, 390]) {
  for (const tema of ['luz-natural', 'camara-escura']) {
    for (const nome of ['Ivy', 'Fotografia Ivy Bento Gonçalves']) {
      const contexto = await navegador.newContext({
        viewport: { width: largura, height: 844 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      });
      const pagina = await contexto.newPage();
      await pagina.addInitScript(() => sessionStorage.setItem('intro-vista', '1'));
      await pagina.goto(`${base}?tema=${tema}`, { waitUntil: 'networkidle' });
      await pagina.evaluate(async (n) => {
        const el = document.querySelector('footer [aria-hidden="true"] span');
        if (el) el.textContent = n;
        await document.fonts.ready;
      }, nome);
      // o hook reage à mudança de largura da caixa: mexer 1px na folga refaz a medição
      await pagina.evaluate(async () => {
        const caixa = document.querySelector('footer [aria-hidden="true"]') as HTMLElement;
        const pai = caixa.parentElement!;
        pai.style.paddingInline = '3%';
        await new Promise((r) => setTimeout(r, 200));
        pai.style.paddingInline = '';
      });
      await pagina.waitForTimeout(300);
      await pagina.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await pagina.waitForTimeout(1200);
      const medida = await pagina.evaluate(() => {
        const s = document
          .querySelector('footer [aria-hidden="true"] span')!
          .getBoundingClientRect();
        return { direita: s.right, esquerda: s.left, vw: document.documentElement.clientWidth };
      });
      const estoura = medida.direita > medida.vw || medida.esquerda < 0;
      if (estoura) falhas++;
      const arquivo = `${largura}-${tema}-${nome === 'Ivy' ? 'ivy' : 'longo'}.png`;
      await pagina.locator('footer').screenshot({ path: path.join(SAIDA, arquivo) });
      console.log(arquivo, JSON.stringify(medida), estoura ? 'ESTOURA' : 'ok');
      await contexto.close();
    }
  }
}
await navegador.close();
servidor.httpServer.close();
process.exit(falhas ? 1 : 0);
