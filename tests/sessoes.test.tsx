import { fireEvent, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { siteConfigAlt } from '../src/config/site.config.alt.ts';
import { definirMidia } from './helpers/midia.ts';
import { renderApp } from './helpers/render.tsx';

const itens = siteConfigAlt.sessoes.itens;

describe('bloco C — sessões (celular: cartões empilhados)', () => {
  it('um cartão por sessão, com o nome em h3 e a frase', async () => {
    definirMidia({ estreito: true });
    await renderApp();
    const cards = document.querySelectorAll('#sessoes article');
    expect(cards).toHaveLength(itens.length);
    itens.forEach((item, i) => {
      const card = cards[i] as HTMLElement;
      expect(within(card).getByRole('heading', { level: 3, name: item.nome })).toBeInTheDocument();
      expect(within(card).getByText(item.frase)).toBeInTheDocument();
    });
  });

  it('cada cartão tem uma foto própria, sem repetir entre cartões', async () => {
    definirMidia({ estreito: true });
    await renderApp();
    const cards = Array.from(document.querySelectorAll('#sessoes article'));
    const srcs = cards.map((c) => c.querySelector('img')!.getAttribute('src'));
    expect(new Set(srcs).size).toBe(cards.length);
  });

  it('com movimento reduzido vira lista simples, sem pin', async () => {
    definirMidia({ reduzido: true });
    await renderApp();
    const lista = document.querySelector('#sessoes ul') as HTMLElement;
    expect(lista).toHaveAttribute('data-estatico');
  });

  it('com movimento normal a pilha escuta a rolagem e escreve --p', async () => {
    definirMidia({});
    await renderApp();
    const lista = document.querySelector('#sessoes ul') as HTMLElement;
    expect(lista).not.toHaveAttribute('data-estatico');
    expect(lista.style.getPropertyValue('--p')).not.toBe('');
  });

  it('o link marca o tipo da sessão para o formulário', async () => {
    definirMidia({ estreito: true });
    await renderApp();
    const cards = document.querySelectorAll('#sessoes article');
    const link = within(cards[1] as HTMLElement).getByRole('link', { name: /Pedir essa sessão/ });
    expect(link).toHaveAttribute('data-pedido-alvo', 'sessao:beta');
  });
});

describe('bloco C — sessões (desktop: nomes gigantes sobre a foto)', () => {
  it('os nomes são links em h3 e as fotos de fundo são decorativas', async () => {
    definirMidia({ largo: true });
    await renderApp();
    const secao = document.querySelector('#sessoes') as HTMLElement;
    for (const item of itens) {
      const link = within(secao).getByRole('link', { name: new RegExp(item.nome) });
      expect(within(link).getByRole('heading', { level: 3, name: item.nome })).toBeInTheDocument();
    }
    const fundo = secao.querySelector('[aria-hidden="true"]')!;
    for (const img of Array.from(fundo.querySelectorAll('img'))) expect(img.alt).toBe('');
  });

  it('passar o mouse (ou focar) em um nome troca a foto de fundo', async () => {
    definirMidia({ largo: true });
    await renderApp();
    const lis = Array.from(document.querySelectorAll('#sessoes ul > li'));
    const ativo = () => lis.findIndex((li) => li.hasAttribute('data-ativo'));
    fireEvent.mouseEnter(lis[0]!);
    expect(ativo()).toBe(0);
    fireEvent.mouseEnter(lis[2]!);
    expect(ativo()).toBe(2);
    fireEvent.focus(within(lis[1] as HTMLElement).getByRole('link'));
    expect(ativo()).toBe(1);
    expect(screen.getAllByRole('heading', { level: 3 }).length).toBeGreaterThanOrEqual(
      itens.length,
    );
  });

  it('com movimento reduzido não há faixas de miniaturas', async () => {
    definirMidia({ largo: true, reduzido: true });
    await renderApp();
    expect(document.querySelectorAll('#sessoes [class*="faixa"]')).toHaveLength(0);
  });
});
