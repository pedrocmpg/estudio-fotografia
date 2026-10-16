import { describe, expect, it } from 'vitest';
import { definirMidia } from './helpers/midia.ts';
import { lerArquivo } from './helpers/arquivos.ts';
import { renderApp } from './helpers/render.tsx';

describe('bloco B — escala e presença', () => {
  it('tokens de escala existem e o hero ocupa a tela toda (svh)', () => {
    const tokens = lerArquivo('src/styles/tokens.css');
    expect(tokens).toContain('--fs-titulo-secao: clamp(3rem, 9vw, 6rem)');
    expect(tokens).toContain('--fs-faixa: clamp(2.5rem, 7vw, 5rem)');
    expect(tokens).toMatch(/--fs-hero: clamp\(/);
    expect(lerArquivo('src/sections/Hero/Hero.module.css')).toContain('min-height: 100svh');
  });

  it('o CTA final é full-bleed: sem caixa, com a posição do texto vinda do config', async () => {
    definirMidia({ reduzido: true });
    await renderApp();
    const cta = document.querySelector('#comece') as HTMLElement;
    expect(cta.dataset.texto).toBe('topo');
    const css = lerArquivo('src/sections/CtaFinal/CtaFinal.module.css');
    expect(css).toContain('min-height: 100svh');
  });

  it('o indicador de rolagem é decorativo (aria-hidden)', async () => {
    definirMidia({ reduzido: true });
    await renderApp();
    const rolar = document.querySelector('#topo [class*="rolar"]');
    expect(rolar).not.toBeNull();
    expect(rolar).toHaveAttribute('aria-hidden', 'true');
  });
});
