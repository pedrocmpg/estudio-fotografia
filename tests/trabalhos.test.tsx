import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';
import { siteConfigAlt } from '../src/config/site.config.alt.ts';
import { definirMidia } from './helpers/midia.ts';
import { renderApp } from './helpers/render.tsx';

const colagem = siteConfigAlt.trabalhos.colagem;

async function abrirPrimeiraDaColagem() {
  definirMidia({ reduzido: true });
  await renderApp();
  const lista = screen.getByRole('list', { name: 'Fotos soltas' });
  const botoes = within(lista).getAllByRole('button');
  botoes[0]!.focus();
  await act(async () => {
    fireEvent.click(botoes[0]!);
  });
  return { botoes };
}

describe('bloco D — colagem', () => {
  it('mostra 6 a 8 fotos soltas, cada uma um botão com o alt como nome', async () => {
    definirMidia({ reduzido: true });
    await renderApp();
    const lista = screen.getByRole('list', { name: 'Fotos soltas' });
    const botoes = within(lista).getAllByRole('button');
    expect(botoes).toHaveLength(colagem.length);
    expect(colagem.length).toBeGreaterThanOrEqual(6);
    expect(colagem.length).toBeLessThanOrEqual(8);
    for (const b of botoes) expect(b.getAttribute('aria-label')).toBeTruthy();
  });

  it('o parallax é CSS com @supports e só para quem não pediu menos movimento', async () => {
    const { lerArquivo } = await import('./helpers/arquivos.ts');
    const css = lerArquivo('src/sections/Trabalhos/Colagem.module.css');
    expect(css).toContain('@supports (animation-timeline: view())');
    expect(css).toContain('prefers-reduced-motion: no-preference');
    // só transform no parallax
    const inicio = css.indexOf('@keyframes paralaxe');
    const bloco = css.slice(inicio, css.indexOf('@media (min-width', inicio));
    expect(bloco).toMatch(/transform:/);
    expect(bloco).not.toMatch(/\b(top|left|width|height):/);
  });
});

describe('bloco D — lightbox', () => {
  it('abre ao clicar, com o contador e o foco dentro', async () => {
    await abrirPrimeiraDaColagem();
    const caixa = await screen.findByRole('dialog');
    expect(caixa).toHaveAttribute('aria-modal', 'true');
    expect(within(caixa).getByText(/01 \/ 0\d/)).toBeInTheDocument();
    await waitFor(() => expect(caixa.contains(document.activeElement)).toBe(true));
  });

  it('Esc fecha e devolve o foco à foto de origem', async () => {
    const { botoes } = await abrirPrimeiraDaColagem();
    const caixa = await screen.findByRole('dialog');
    fireEvent.keyDown(caixa, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(document.activeElement).toBe(botoes[0]);
  });

  it('setas navegam e o botão Fechar também fecha', async () => {
    await abrirPrimeiraDaColagem();
    const caixa = await screen.findByRole('dialog');
    fireEvent.keyDown(caixa, { key: 'ArrowRight' });
    expect(within(caixa).getByText(/02 \/ 0\d/)).toBeInTheDocument();
    fireEvent.keyDown(caixa, { key: 'ArrowLeft' });
    fireEvent.keyDown(caixa, { key: 'ArrowLeft' });
    expect(
      within(caixa).getByText(new RegExp(`0${colagem.length} / 0${colagem.length}`)),
    ).toBeInTheDocument();
    fireEvent.click(within(caixa).getByRole('button', { name: 'Fechar' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('o foco fica preso: Tab no último botão volta ao primeiro', async () => {
    await abrirPrimeiraDaColagem();
    const caixa = await screen.findByRole('dialog');
    const botoes = within(caixa).getAllByRole('button');
    botoes[botoes.length - 1]!.focus();
    fireEvent.keyDown(botoes[botoes.length - 1]!, { key: 'Tab' });
    expect(document.activeElement).toBe(botoes[0]);
  });

  it('a página não rola enquanto a lightbox está aberta', async () => {
    await abrirPrimeiraDaColagem();
    await screen.findByRole('dialog');
    expect(document.documentElement.style.overflow).toBe('hidden');
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    await waitFor(() => expect(document.documentElement.style.overflow).not.toBe('hidden'));
  });

  it('a lightbox aberta não tem violações de acessibilidade (axe)', async () => {
    await abrirPrimeiraDaColagem();
    const caixa = await screen.findByRole('dialog');
    expect(
      await axe(caixa, {
        rules: { 'color-contrast': { enabled: false }, region: { enabled: false } },
      }),
    ).toHaveNoViolations();
  });
});
