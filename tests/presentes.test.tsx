import { fireEvent, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { siteConfig } from '../src/config/site.config.ts';
import { siteConfigAlt } from '../src/config/site.config.alt.ts';
import { formatarPreco } from '../src/lib/preco.ts';
import { definirMidia } from './helpers/midia.ts';
import { configCom, renderApp } from './helpers/render.tsx';

const itens = siteConfigAlt.presentes.itens;

describe('adendo I.3 — presentes', () => {
  it('um card por produto, com nome, frase e foto com alt', async () => {
    definirMidia({ reduzido: true });
    await renderApp();
    const secao = document.querySelector('#presentes') as HTMLElement;
    const cards = secao.querySelectorAll('article');
    expect(cards).toHaveLength(itens.length);
    itens.forEach((item, i) => {
      const card = within(cards[i] as HTMLElement);
      expect(card.getByRole('heading', { level: 3, name: item.nome })).toBeInTheDocument();
      expect(card.getByText(item.frase)).toBeInTheDocument();
      expect(card.getByRole('img').getAttribute('alt')).toBeTruthy();
    });
  });

  it('cada item abre o WhatsApp com a mensagem certa (acentos e & preservados)', async () => {
    definirMidia({ reduzido: true });
    await renderApp();
    for (const item of itens) {
      const link = screen.getByRole('link', {
        name: new RegExp(`Pedir no WhatsApp.*${item.nome}`),
      });
      const href = link.getAttribute('href')!;
      expect(href.startsWith(`https://wa.me/${siteConfigAlt.negocio.whatsapp}?text=`)).toBe(true);
      expect(decodeURIComponent(href.split('?text=')[1]!)).toBe(item.mensagemWhatsapp);
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
    }
  });

  it('o config real: toda mensagem do WhatsApp é preenchida e cada categoria tem itens', () => {
    for (const item of siteConfig.presentes.itens) {
      expect(item.mensagemWhatsapp.trim().length).toBeGreaterThan(10);
      expect(siteConfig.presentes.categorias).toContain(item.categoria);
    }
    for (const cat of siteConfig.presentes.categorias) {
      expect(siteConfig.presentes.itens.some((i) => i.categoria === cat)).toBe(true);
    }
    expect(siteConfig.presentes.itens.length).toBeGreaterThanOrEqual(6);
    expect(siteConfig.presentes.itens.length).toBeLessThanOrEqual(10);
  });

  it('chips de categoria filtram a prateleira', async () => {
    definirMidia({ reduzido: true });
    await renderApp();
    const secao = within(document.querySelector('#presentes') as HTMLElement);
    const todos = secao.getByRole('button', { name: 'Todos' });
    expect(todos).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(secao.getByRole('button', { name: 'Categoria Y' }));
    expect(secao.getAllByRole('heading', { level: 3 })).toHaveLength(
      itens.filter((i) => i.categoria === 'Categoria Y').length,
    );
    expect(secao.getByRole('button', { name: 'Categoria Y' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    fireEvent.click(todos);
    expect(secao.getAllByRole('heading', { level: 3 })).toHaveLength(itens.length);
  });

  it('mostra a faixa "Revelação na hora"', async () => {
    definirMidia({ reduzido: true });
    await renderApp();
    const secao = within(document.querySelector('#presentes') as HTMLElement);
    expect(secao.getByText(siteConfigAlt.presentes.destaqueRevelacao!.titulo)).toBeInTheDocument();
  });

  it('sem valor: [VALOR] na prévia e "Consulte" em produção; nunca preço inventado', async () => {
    expect(formatarPreco(null, true)).toBe('[VALOR]');
    expect(formatarPreco(null, false)).toBe('Consulte');
    expect(formatarPreco(80, false)).toBe('R$ 80');
    expect(formatarPreco(79.9, false)).toBe('R$ 79,90');
    for (const item of siteConfig.presentes.itens) expect(item.valor).toBeNull();

    definirMidia({ reduzido: true });
    const { unmount } = await renderApp();
    expect(
      within(document.querySelector('#presentes') as HTMLElement).getAllByText('[VALOR]').length,
    ).toBe(itens.filter((i) => i.valor === null).length);
    unmount();
    await renderApp(configCom((c) => (c.modoDemo = false)));
    expect(
      within(document.querySelector('#presentes') as HTMLElement).getAllByText('Consulte').length,
    ).toBe(itens.filter((i) => i.valor === null).length);
  });

  it('presentes.mostrar: false esconde a seção', async () => {
    definirMidia({ reduzido: true });
    await renderApp(configCom((c) => (c.presentes.mostrar = false)));
    expect(document.querySelector('#presentes')).toBeNull();
  });

  it('o hero leva "Revelação na hora" e o botão secundário vai para a seção', async () => {
    definirMidia({ reduzido: true });
    await renderApp();
    const hero = within(document.querySelector('#topo') as HTMLElement);
    expect(hero.getByText(siteConfigAlt.presentes.destaqueRevelacao!.titulo)).toBeInTheDocument();
    expect(siteConfig.hero.ctas.secundario).toMatchObject({ acao: 'ancora', alvo: 'presentes' });
  });
});
