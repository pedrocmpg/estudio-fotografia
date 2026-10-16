import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { definirMidia } from './helpers/midia.ts';
import { configCom, renderApp } from './helpers/render.tsx';

describe('como funciona', () => {
  it('lista os passos em ordem, numerados', async () => {
    definirMidia({ reduzido: true });
    await renderApp();
    const secao = document.querySelector('#como-funciona') as HTMLElement;
    const passos = within(secao).getAllByRole('listitem');
    expect(passos).toHaveLength(4);
    expect(passos[0]).toHaveTextContent('01');
    expect(passos[0]).toHaveTextContent('Primeiro');
    expect(passos[3]).toHaveTextContent('Quarto');
    expect(within(secao).getByRole('heading', { level: 2 })).toHaveTextContent(
      'Passo a passo de teste',
    );
  });

  it('com movimento reduzido, a linha já vem cheia (sem leitura de rolagem)', async () => {
    definirMidia({ reduzido: true });
    await renderApp();
    expect(document.querySelector('#como-funciona ol')).toHaveAttribute('data-estatico');
  });

  it('esconde o texto [CONFIRMAR] no site final, mas mantém o passo', async () => {
    definirMidia({ reduzido: true });
    const config = configCom((c) => {
      c.modoDemo = false;
      c.processo.passos[3]!.texto = 'Prazo: [CONFIRMAR].';
    });
    await renderApp(config);
    const secao = document.querySelector('#como-funciona') as HTMLElement;
    expect(within(secao).getByText('Quarto')).toBeInTheDocument();
    expect(within(secao).queryByText(/CONFIRMAR/)).toBeNull();
  });
});

describe('pacotes', () => {
  it('mostra os dois grupos (sessões e presentes), com abas', async () => {
    definirMidia({ reduzido: true });
    await renderApp();
    const secao = document.querySelector('#pacotes') as HTMLElement;
    const abas = within(secao).getAllByRole('tab');
    expect(abas.map((a) => a.textContent)).toEqual(['Sessões', 'Presentes']);
    expect(abas[0]).toHaveAttribute('aria-selected', 'true');
    expect(within(secao).getAllByRole('tabpanel', { hidden: true })).toHaveLength(2);
    expect(within(secao).getByText('Pacote Um')).toBeInTheDocument();
    expect(within(secao).getByText('Pacote Três')).toBeInTheDocument();
  });

  it('as setas do teclado trocam de aba', async () => {
    definirMidia({ reduzido: true });
    await renderApp();
    const user = userEvent.setup();
    const secao = document.querySelector('#pacotes') as HTMLElement;
    const [sessoes, presentes] = within(secao).getAllByRole('tab');
    sessoes!.focus();
    await user.keyboard('{ArrowRight}');
    expect(presentes).toHaveAttribute('aria-selected', 'true');
    expect(presentes).toHaveFocus();
    await user.keyboard('{Home}');
    expect(sessoes).toHaveAttribute('aria-selected', 'true');
  });

  it('preço: null vira [VALOR] na prévia e "Sob consulta" no site final; valor em reais sem centavos', async () => {
    definirMidia({ reduzido: true });
    const { unmount } = await renderApp();
    let secao = document.querySelector('#pacotes') as HTMLElement;
    expect(within(secao).getAllByText('[VALOR]').length).toBeGreaterThan(0);
    expect(within(secao).getByText(/R\$\s?1\.250/)).toBeInTheDocument();
    expect(within(secao).getByText('a partir de')).toBeInTheDocument();
    unmount();

    await renderApp(configCom((c) => (c.modoDemo = false)));
    secao = document.querySelector('#pacotes') as HTMLElement;
    expect(within(secao).queryByText('[VALOR]')).toBeNull();
    expect(within(secao).getAllByText('Sob consulta').length).toBeGreaterThan(0);
  });

  it('[CONFIRMAR] aparece na prévia e some no site final', async () => {
    definirMidia({ reduzido: true });
    const { unmount } = await renderApp();
    expect(screen.getByText('[CONFIRMAR] item pendente')).toBeInTheDocument();
    unmount();
    await renderApp(configCom((c) => (c.modoDemo = false)));
    expect(screen.queryByText('[CONFIRMAR] item pendente')).toBeNull();
  });

  it('o botão de cada pacote leva ao formulário com o tipo certo', async () => {
    definirMidia({ reduzido: true });
    await renderApp();
    const user = userEvent.setup();
    const secao = document.querySelector('#pacotes') as HTMLElement;
    const botoes = within(secao).getAllByRole('link', { name: /Pedir este pacote/, hidden: true });
    expect(botoes[1]).toHaveAttribute('data-pedido-alvo', 'sessao:beta');
    expect(botoes[2]).toHaveAttribute('data-pedido-alvo', 'presente:item-dois');
    expect(botoes[3]).not.toHaveAttribute('data-pedido-alvo');
    await user.click(botoes[1]!);
    expect((screen.getByLabelText(/O que você quer/) as HTMLSelectElement).value).toBe(
      'sessao:beta',
    );
  });

  it('o selo e a nota aparecem; sem pacotes, a seção some', async () => {
    definirMidia({ reduzido: true });
    const { unmount } = await renderApp();
    expect(screen.getByText('Selo de teste')).toBeInTheDocument();
    expect(screen.getByText('Nota fictícia sobre valores.')).toBeInTheDocument();
    unmount();
    await renderApp(configCom((c) => (c.pacotes.mostrar = false)));
    expect(document.querySelector('#pacotes')).toBeNull();
  });
});
