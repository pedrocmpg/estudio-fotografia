import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import { comTransicao } from '../src/lib/transicao.ts';
import { definirMidia } from './helpers/midia.ts';
import { configCom, renderApp } from './helpers/render.tsx';

async function abrirFolha(ajuste?: Parameters<typeof configCom>[0]) {
  definirMidia({ reduzido: true });
  await renderApp(ajuste ? configCom(ajuste) : undefined);
  const abas = await screen.findByRole('tablist', { name: 'Categorias' });
  const painel = within(document.querySelector('#trabalhos') as HTMLElement).getByRole('tabpanel');
  return { abas, painel };
}

describe('folha de contato', () => {
  it('tem abas "Todas" + uma por categoria, e numera os quadros como negativo (01A ▸)', async () => {
    const { abas, painel } = await abrirFolha();
    expect(
      within(abas)
        .getAllByRole('tab')
        .map((t) => t.textContent),
    ).toEqual(['Todas', 'Cat A', 'Cat B']);
    expect(within(painel).getAllByRole('listitem')).toHaveLength(2);
    expect(painel).toHaveTextContent('01A ▸');
    expect(painel).toHaveTextContent('02A ▸');
  });

  it('as abas filtram por categoria e as setas do teclado trocam de aba', async () => {
    const { abas, painel } = await abrirFolha();
    const user = userEvent.setup();
    const [todas, a, b] = within(abas).getAllByRole('tab');
    await user.click(a!);
    expect(a).toHaveAttribute('aria-selected', 'true');
    expect(within(painel).getAllByRole('listitem')).toHaveLength(1);
    a!.focus();
    await user.keyboard('{ArrowRight}');
    expect(b).toHaveAttribute('aria-selected', 'true');
    expect(b).toHaveFocus();
    await user.keyboard('{Home}');
    expect(todas).toHaveAttribute('aria-selected', 'true');
    expect(within(painel).getAllByRole('listitem')).toHaveLength(2);
  });

  it('o lápis vermelho circula só as fotos marcadas e é decorativo (aria-hidden)', async () => {
    const { painel } = await abrirFolha();
    const circulos = painel.querySelectorAll('svg');
    expect(circulos).toHaveLength(1);
    expect(circulos[0]).toHaveAttribute('aria-hidden', 'true');
    // com movimento reduzido a folha já está "entrada": círculos desenhados
    expect(painel.closest('[data-entrou]')).not.toBeNull();
  });

  it('abrir uma foto leva à lightbox só com as fotos da aba atual', async () => {
    const { abas, painel } = await abrirFolha();
    const user = userEvent.setup();
    await user.click(within(abas).getByRole('tab', { name: 'Cat B' }));
    const botao = within(painel).getByRole('button', { name: /Ampliar/ });
    await act(async () => {
      fireEvent.click(botao);
    });
    const caixa = await screen.findByRole('dialog');
    expect(caixa).toHaveTextContent('01 / 01');
  });

  it('dados técnicos só aparecem com mostrarDadosTecnicos e foto com exposição', async () => {
    const { painel } = await abrirFolha((c) => {
      c.trabalhos.mostrarDadosTecnicos = true;
      c.trabalhos.folha.fotos = [
        { id: 'prod-porta-retrato', categoria: 'Cat A' },
        { id: 'ensaio-1', categoria: 'Cat A' },
      ];
    });
    expect(painel).toHaveTextContent('f/11 · 4 s · ISO 100');
    expect(within(painel).getAllByRole('listitem')).toHaveLength(2);
  });

  it('sem fotos na folha, ela não aparece', async () => {
    definirMidia({ reduzido: true });
    await renderApp(configCom((c) => (c.trabalhos.folha.fotos = [])));
    expect(screen.queryByRole('tablist', { name: 'Categorias' })).toBeNull();
  });

  it('axe: a folha aberta não tem violações', async () => {
    const { painel } = await abrirFolha();
    const folha = painel.closest('div[class]')!.parentElement as HTMLElement;
    expect(
      await axe(folha, {
        rules: { 'color-contrast': { enabled: false }, region: { enabled: false } },
      }),
    ).toHaveNoViolations();
  });
});

describe('transição da lightbox (View Transitions com fallback)', () => {
  it('sem suporte, aplica a mudança direto', () => {
    const atualizar = vi.fn();
    comTransicao(atualizar, false);
    expect(atualizar).toHaveBeenCalledTimes(1);
  });

  it('com suporte, passa pela API; com movimento reduzido, não', async () => {
    const doc = document as unknown as { startViewTransition?: (cb: () => void) => unknown };
    const espiao = vi.fn((cb: () => void) => cb());
    doc.startViewTransition = espiao;
    try {
      const atualizar = vi.fn();
      comTransicao(atualizar, true);
      expect(espiao).not.toHaveBeenCalled();
      expect(atualizar).toHaveBeenCalledTimes(1);
      comTransicao(atualizar, false);
      await waitFor(() => expect(espiao).toHaveBeenCalledTimes(1));
      expect(atualizar).toHaveBeenCalledTimes(2);
    } finally {
      delete doc.startViewTransition;
    }
  });
});
