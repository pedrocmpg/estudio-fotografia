import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { siteConfig } from '../src/config/site.config.ts';
import { siteConfigAlt } from '../src/config/site.config.alt.ts';
import { fotosPorSecao } from '../src/config/validar.ts';
import { lerArquivo } from './helpers/arquivos.ts';
import { definirMidia } from './helpers/midia.ts';
import { renderApp } from './helpers/render.tsx';

describe('bloco A — acabamento', () => {
  it('nenhum placeholder entre colchetes na primeira dobra (config real)', async () => {
    definirMidia({ reduzido: true });
    await renderApp(siteConfig);
    const hero = document.querySelector('#topo') as HTMLElement;
    expect(hero.textContent).not.toMatch(/[[\]]/);
  });

  it('só um selo da prévia no hero e um no rodapé; nenhum fixo na tela', async () => {
    definirMidia({ reduzido: true });
    await renderApp();
    const selos = screen.getAllByText('Prévia · fotos ilustrativas');
    expect(selos).toHaveLength(2);
    expect(document.querySelector('#topo')!.contains(selos[0]!)).toBe(true);
    expect(document.querySelector('footer')!.contains(selos[1]!)).toBe(true);
    const css = lerArquivo('src/components/Selo.module.css');
    expect(css).not.toMatch(/position:\s*fixed/);
  });

  for (const [nome, config] of [
    ['real', siteConfig],
    ['fictício', siteConfigAlt],
  ] as const) {
    it(`nenhuma foto repete em seções vizinhas (${nome})`, () => {
      const blocos = fotosPorSecao(config);
      for (let i = 1; i < blocos.length; i++) {
        const comum = [...blocos[i]!.ids].filter((id) => blocos[i - 1]!.ids.has(id));
        expect(comum, `${blocos[i - 1]!.secao} × ${blocos[i]!.secao}`).toEqual([]);
      }
    });
  }

  it('existe o token de espaçamento entre seções', () => {
    expect(lerArquivo('src/styles/tokens.css')).toContain(
      '--espaco-secao: clamp(5rem, 12vh, 9rem)',
    );
  });
});
