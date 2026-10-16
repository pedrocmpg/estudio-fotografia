import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { siteConfig } from '../src/config/site.config.ts';
import { siteConfigAlt } from '../src/config/site.config.alt.ts';
import { definirMidia } from './helpers/midia.ts';
import { renderApp } from './helpers/render.tsx';

function arquivos(dir: string): string[] {
  return readdirSync(dir).flatMap((nome) => {
    const cheio = path.join(dir, nome);
    return statSync(cheio).isDirectory() ? arquivos(cheio) : [cheio];
  });
}

describe('nada hardcoded', () => {
  it('com o config fictício aparece "Estúdio Exemplo" e nada do estúdio real', async () => {
    definirMidia({ reduzido: true }); // estado final: todo o conteúdo na tela
    await renderApp(siteConfigAlt);

    const html = document.documentElement.innerHTML;
    const texto = document.body.textContent ?? '';
    expect(texto).toContain('Estúdio Exemplo');

    const doEstudioReal = [
      siteConfig.negocio.nome,
      siteConfig.negocio.nomeCurto,
      siteConfig.negocio.cidade,
      siteConfig.negocio.whatsapp,
      siteConfig.hero.nome,
      siteConfig.hero.subtitulo,
      siteConfig.hero.destaque.tagline,
      siteConfig.sessoes.titulo,
      siteConfig.ctaFinal.titulo,
      siteConfig.manifesto.texto,
      siteConfig.meta.titulo,
    ].filter((s): s is string => Boolean(s));

    for (const trecho of doEstudioReal) {
      expect(html, `"${trecho}" vazou para o HTML`).not.toContain(trecho);
    }
    expect(html).not.toMatch(/ivy/i);
  });

  it('o nome do estúdio real só existe em src/config/site.config.ts', () => {
    const raiz = path.join(process.cwd(), 'src');
    const permitido = path.join(raiz, 'config', 'site.config.ts');
    const culpados = arquivos(raiz)
      .filter((f) => path.normalize(f) !== path.normalize(permitido))
      .filter((f) => !/\.(png|jpe?g|webp|avif|woff2?)$/i.test(f))
      .filter((f) => /ivy/i.test(readFileSync(f, 'utf8')))
      .map((f) => path.relative(process.cwd(), f));
    expect(culpados).toEqual([]);
  });

  it('o config fictício é obviamente fictício', () => {
    expect(siteConfigAlt.negocio.nome).toBe('Estúdio Exemplo');
    expect(siteConfigAlt.negocio.whatsapp).toBe('5500900000000');
    expect(siteConfigAlt.negocio.cidade).toBe('Cidade Exemplo');
    expect(siteConfigAlt.negocio.email).toBe('contato@exemplo.com');
    expect(siteConfigAlt.negocio.instagram).toBe('estudioexemplo');
  });
});
