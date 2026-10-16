import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { siteConfig } from '../src/config/site.config.ts';
import { siteConfigAlt } from '../src/config/site.config.alt.ts';
import { lerArquivo } from './helpers/arquivos.ts';
import { definirMidia } from './helpers/midia.ts';
import { renderApp } from './helpers/render.tsx';
import manifesto from '../src/data/fotos.manifest.json';
import meta from '../src/data/fotos.meta.json';

function cssDe(dir: string): string[] {
  return readdirSync(dir).flatMap((nome) => {
    const cheio = path.join(dir, nome);
    if (statSync(cheio).isDirectory()) return cssDe(cheio);
    return cheio.endsWith('.css') ? [cheio] : [];
  });
}

/** Linhas com :hover que NÃO estão dentro de @media (hover: hover) and (pointer: fine). */
function hoversSoltos(css: string): string[] {
  const soltos: string[] = [];
  const pilha: boolean[] = []; // true = bloco "hover fino"
  for (const linha of css.split('\n')) {
    const abre = (linha.match(/\{/g) ?? []).length;
    const fecha = (linha.match(/\}/g) ?? []).length;
    const hoverFino = /@media[^{]*\(hover: hover\)[^{]*\(pointer: fine\)/.test(linha);
    if (/:hover/.test(linha) && !pilha.includes(true)) soltos.push(linha.trim());
    for (let i = 0; i < abre; i++) pilha.push(hoverFino && i === 0);
    for (let i = 0; i < fecha; i++) pilha.pop();
  }
  return soltos;
}

describe('bloco H — movimento geral', () => {
  it('todo :hover está dentro de @media (hover: hover) and (pointer: fine)', () => {
    const culpados = cssDe(path.join(process.cwd(), 'src')).flatMap((f) =>
      hoversSoltos(readFileSync(f, 'utf8')).map((l) => `${path.relative(process.cwd(), f)}: ${l}`),
    );
    expect(culpados).toEqual([]);
  });

  it('títulos entram por máscara, uma palavra de cada vez, com 60 ms de cascata', () => {
    const css = lerArquivo('src/components/TituloSecao.module.css');
    expect(css).toContain('calc(var(--i) * 60ms)');
    expect(css).toContain('overflow: clip');
    expect(css).toMatch(/translate3d\(0, 112%, 0\)/);
  });

  it('fotos entram com clip-path inset(8%) → inset(0) e scale(1,1 → 1) em ~900 ms', () => {
    const css = lerArquivo('src/components/Revelar.module.css');
    expect(css).toContain('clip-path: inset(8%)');
    expect(css).toContain('clip-path: inset(0)');
    expect(css).toContain('scale(1.1)');
    expect(css).toContain('900ms');
    const reduzido = css.slice(css.indexOf('prefers-reduced-motion'));
    expect(reduzido).toContain('clip-path: none');
  });

  it('o título de seção continua um h2 com o texto inteiro', async () => {
    definirMidia({ reduzido: true });
    await renderApp();
    const titulo = document.querySelector('#presentes-titulo') as HTMLElement;
    expect(titulo.tagName).toBe('H2');
    expect(titulo.textContent?.replace(/\s+/g, ' ').trim()).toBe(siteConfigAlt.presentes.titulo);
  });

  it('só transform, opacity e clip-path animam (nenhuma transição em width/height/top/left)', () => {
    const proibidas = cssDe(path.join(process.cwd(), 'src')).flatMap((f) => {
      const css = readFileSync(f, 'utf8');
      return (
        css.match(/transition:[^;]*\b(width|height|top|left|right|bottom|margin)\b[^;]*;/gs) ?? []
      ).map((t) => `${path.relative(process.cwd(), f)}: ${t.replace(/\s+/g, ' ')}`);
    });
    expect(proibidas).toEqual([]);
  });
});

describe('bloco H — banco de fotos', () => {
  const fotos = meta as {
    id: string;
    alt: string;
    foco: { x: number; y: number };
    credito?: string;
    licenca?: string;
    tratamento?: string;
  }[];

  it('tem pelo menos 18 a 20 fotos, com crédito e licença, e várias em preto e branco', () => {
    expect(fotos.length).toBeGreaterThanOrEqual(20);
    for (const f of fotos) {
      expect(f.credito, f.id).toBeTruthy();
      expect(f.licenca, f.id).toBeTruthy();
      expect(f.alt.trim().length, f.id).toBeGreaterThan(10);
    }
    expect(fotos.filter((f) => f.tratamento === 'pb').length).toBeGreaterThanOrEqual(5);
    expect(fotos.filter((f) => f.id.startsWith('prod-')).length).toBeGreaterThanOrEqual(6);
  });

  it('o foco de cada foto está dentro da imagem e rostos não ficam na borda', () => {
    for (const f of fotos) {
      expect(f.foco.x, f.id).toBeGreaterThan(0.2);
      expect(f.foco.x, f.id).toBeLessThan(0.8);
      expect(f.foco.y, f.id).toBeGreaterThan(0.2);
      expect(f.foco.y, f.id).toBeLessThan(0.8);
    }
  });

  it('o manifesto cobre todas as fotos do meta, sem placeholder gerado', () => {
    const m = manifesto as { id: string; placeholderGerado: boolean }[];
    expect(new Set(m.map((x) => x.id))).toEqual(new Set(fotos.map((f) => f.id)));
    expect(m.some((x) => x.placeholderGerado)).toBe(false);
  });

  it('as fotos usadas no config real existem no banco', () => {
    const ids = new Set(fotos.map((f) => f.id));
    for (const id of [
      ...siteConfig.trabalhos.colagem,
      ...siteConfig.trabalhos.roda.fotos,
      ...siteConfig.manifesto.fotos,
    ]) {
      expect(ids.has(id), id).toBe(true);
    }
  });
});
