import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';
import { definirMidia } from './helpers/midia.ts';
import { renderApp } from './helpers/render.tsx';

async function abrirMenu() {
  definirMidia({ reduzido: true, estreito: true });
  await renderApp();
  const user = userEvent.setup();
  const botao = screen.getByRole('button', { name: 'Abrir menu' });
  await user.click(botao);
  return { user, botao, menu: await screen.findByRole('dialog', { name: 'Menu' }) };
}

describe('menu do celular', () => {
  it('abre em tela cheia com os links da navegação e o botão de pedir', async () => {
    const { menu, botao } = await abrirMenu();
    expect(botao).toHaveAttribute('aria-expanded', 'true');
    const nav = within(menu).getByRole('navigation', { name: 'Menu' });
    expect(
      within(nav)
        .getAllByRole('link')
        .map((l) => l.getAttribute('href')),
    ).toEqual(['#sessoes', '#presentes', '#trabalhos', '#pacotes', '#duvidas']);
    expect(within(menu).getByRole('link', { name: /Quero uma sessão|Pedir sessão/ })).toBeTruthy();
  });

  it('o foco vai para "Fechar", fica preso dentro e volta ao botão ao fechar', async () => {
    const { user, menu, botao } = await abrirMenu();
    const fechar = within(menu).getByRole('button', { name: 'Fechar' });
    expect(fechar).toHaveFocus();
    // Shift+Tab no primeiro item vai para o último
    await user.tab({ shift: true });
    const alvos = menu.querySelectorAll('a[href], button');
    expect(alvos[alvos.length - 1]).toHaveFocus();
    // Tab no último volta ao primeiro
    await user.tab();
    expect(fechar).toHaveFocus();
    await user.click(fechar);
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Menu' })).toBeNull());
    expect(botao).toHaveFocus();
  });

  it('Esc fecha o menu', async () => {
    const { menu } = await abrirMenu();
    fireEvent.keyDown(menu, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Menu' })).toBeNull());
  });

  it('tocar num link fecha o menu e libera a rolagem da página', async () => {
    const { user, menu } = await abrirMenu();
    expect(document.documentElement.style.overflow).toBe('hidden');
    await user.click(within(menu).getByRole('link', { name: 'Presentes' }));
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Menu' })).toBeNull());
    expect(document.documentElement.style.overflow).not.toBe('hidden');
  });

  it('os links entram em cascata de 40 ms (variável --i)', async () => {
    const { menu } = await abrirMenu();
    const itens = Array.from(menu.querySelectorAll('nav li')) as HTMLElement[];
    expect(itens.map((li) => li.style.getPropertyValue('--i'))).toEqual(['0', '1', '2', '3', '4']);
    const { lerArquivo } = await import('./helpers/arquivos.ts');
    expect(lerArquivo('src/sections/Header/MenuCelular.module.css')).toContain(
      'calc(var(--i) * 40ms',
    );
  });

  it('axe: menu aberto sem violações', async () => {
    const { menu } = await abrirMenu();
    expect(
      await axe(menu, {
        rules: { 'color-contrast': { enabled: false }, region: { enabled: false } },
      }),
    ).toHaveNoViolations();
  });

  it('o botão de menu tem alvo de 44 px e rótulo para leitor de tela', async () => {
    definirMidia({ reduzido: true, estreito: true });
    await renderApp();
    expect(screen.getByRole('button', { name: 'Abrir menu' })).toHaveAttribute(
      'aria-controls',
      'menu-celular',
    );
    const { lerArquivo } = await import('./helpers/arquivos.ts');
    const css = lerArquivo('src/sections/Header/Header.module.css');
    expect(css).toMatch(/\.menuBotao \{[^}]*width: var\(--alvo-toque\)/);
  });
});

describe('cursor visor', () => {
  it('não existe sem mouse (toque) nem com movimento reduzido', async () => {
    definirMidia({ reduzido: false, mouse: false });
    const { unmount } = await renderApp();
    await act(async () => {
      await new Promise((r) => setTimeout(r, 30));
    });
    expect(document.querySelector('[class*="cursor"]')).toBeNull();
    unmount();
    definirMidia({ reduzido: true, mouse: true });
    await renderApp();
    await act(async () => {
      await new Promise((r) => setTimeout(r, 30));
    });
    expect(document.querySelector('[class*="cursor"]')).toBeNull();
  });

  it('com mouse: segue o ponteiro e vira visor [ ] "VER" sobre foto clicável', async () => {
    definirMidia({ reduzido: false, mouse: true });
    await renderApp();
    const cursor = await waitFor(() => {
      const el = document.querySelector('.cursor') as HTMLElement | null;
      expect(el).not.toBeNull();
      return el!;
    });
    expect(cursor).toHaveAttribute('aria-hidden', 'true');

    const foto = document.querySelector('[data-visor]') as HTMLElement;
    expect(foto).not.toBeNull();
    fireEvent.pointerMove(foto, { clientX: 120, clientY: 80, pointerType: 'mouse' });
    expect(cursor).toHaveAttribute('data-visor');
    expect(cursor).toHaveAttribute('data-visivel');
    await waitFor(() => expect(cursor.style.transform).toContain('translate3d(120px, 80px'));

    fireEvent.pointerMove(document.body, { clientX: 10, clientY: 10, pointerType: 'mouse' });
    expect(cursor).not.toHaveAttribute('data-visor');
  });

  it('ignora toque e caneta', async () => {
    definirMidia({ reduzido: false, mouse: true });
    await renderApp();
    const cursor = await waitFor(() => {
      const el = document.querySelector('.cursor') as HTMLElement | null;
      expect(el).not.toBeNull();
      return el!;
    });
    fireEvent.pointerMove(document.body, { clientX: 50, clientY: 50, pointerType: 'touch' });
    expect(cursor).not.toHaveAttribute('data-visivel');
  });

  it('não esconde o cursor do sistema', async () => {
    const { lerArquivo } = await import('./helpers/arquivos.ts');
    const css =
      lerArquivo('src/components/CursorVisor.module.css') + lerArquivo('src/styles/global.css');
    expect(css).not.toMatch(/cursor:\s*none/);
  });
});
