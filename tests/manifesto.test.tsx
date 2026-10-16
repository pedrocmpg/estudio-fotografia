import { within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { secoesAtivas } from '../src/config/secoes.ts';
import { siteConfigAlt } from '../src/config/site.config.alt.ts';
import { lerArquivo } from './helpers/arquivos.ts';
import { definirMidia } from './helpers/midia.ts';
import { configCom, renderApp } from './helpers/render.tsx';

const palavras = siteConfigAlt.manifesto.palavras;

describe('bloco E — manifesto', () => {
  it('a frase completa existe uma vez, como texto único, para leitor de tela', async () => {
    definirMidia({});
    await renderApp();
    const secao = document.querySelector('#manifesto') as HTMLElement;
    const titulo = within(secao).getByRole('heading', { level: 2, name: palavras.join(' ') });
    expect(titulo).toHaveClass('sr-only');
  });

  it('as palavras animadas são decorativas (aria-hidden)', async () => {
    definirMidia({});
    await renderApp();
    const palco = document.querySelector('#manifesto [data-palco]') as HTMLElement;
    expect(palco).toHaveAttribute('aria-hidden', 'true');
    for (const p of palavras) expect(within(palco).getByText(p)).toBeInTheDocument();
  });

  it('a troca de palavras segue a rolagem (variável --p), sem timers', async () => {
    definirMidia({});
    await renderApp();
    const pista = document.querySelector('#manifesto [data-palco]')!.parentElement as HTMLElement;
    expect(pista.style.getPropertyValue('--p')).not.toBe('');
    const fonte = lerArquivo('src/sections/Manifesto/Manifesto.tsx');
    expect(fonte).not.toMatch(/setInterval|setTimeout/);
    const css = lerArquivo('src/sections/Manifesto/Manifesto.module.css');
    expect(css).toContain('300svh');
    expect(css).toMatch(/translate3d\(0, calc\(\(var\(--e\) - var\(--s\)\)/);
  });

  it('a citação aparece depois, sozinha, e as fotos entram em seguida', async () => {
    definirMidia({ reduzido: true });
    await renderApp();
    const secao = document.querySelector('#manifesto') as HTMLElement;
    expect(within(secao).getByText(siteConfigAlt.manifesto.citacao)).toBeInTheDocument();
    const fotos = within(secao).getByRole('list', { name: 'Fotos do manifesto' });
    expect(within(fotos).getAllByRole('img')).toHaveLength(siteConfigAlt.manifesto.fotos.length);
    for (const img of within(fotos).getAllByRole('img'))
      expect(img.getAttribute('alt')).toBeTruthy();
  });

  it('movimento reduzido: frase estática, sem pin', async () => {
    definirMidia({ reduzido: true });
    await renderApp();
    const pista = document.querySelector('#manifesto [data-palco]')!.parentElement as HTMLElement;
    expect(pista).toHaveAttribute('data-estatico');
  });

  it('com modoDemo desligado, texto não confirmado faz a seção sumir', async () => {
    definirMidia({ reduzido: true });
    const sem = configCom((c) => {
      c.modoDemo = false;
      c.manifesto.confirmado = false;
    });
    expect(secoesAtivas(sem)).not.toContain('manifesto');
    await renderApp(sem);
    expect(document.querySelector('#manifesto')).toBeNull();

    const com = configCom((c) => {
      c.modoDemo = false;
      c.manifesto.confirmado = true;
    });
    expect(secoesAtivas(com)).toContain('manifesto');
  });
});
