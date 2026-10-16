import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { definirMidia } from './helpers/midia.ts';
import { configCom, renderApp } from './helpers/render.tsx';

describe('FAQ em dois blocos', () => {
  it('separa Sessões e Loja com títulos, Sessões primeiro', async () => {
    definirMidia({ reduzido: true });
    await renderApp();
    const secao = document.querySelector('#duvidas') as HTMLElement;
    const titulos = within(secao).getAllByRole('heading', { level: 3 });
    expect(titulos.map((t) => t.textContent)).toEqual(['Sessões', 'Loja']);
    const detalhes = Array.from(secao.querySelectorAll('details'));
    expect(detalhes[0]).toHaveTextContent('Pergunta confirmada?');
    expect(detalhes[1]).toHaveTextContent('Pergunta de exemplo?');
  });

  it('sem grupo nas perguntas, não há subtítulos', async () => {
    definirMidia({ reduzido: true });
    await renderApp(
      configCom((c) =>
        c.faq.itens.forEach((i) => {
          delete i.grupo;
        }),
      ),
    );
    const secao = document.querySelector('#duvidas') as HTMLElement;
    expect(within(secao).queryAllByRole('heading', { level: 3 })).toHaveLength(0);
    expect(secao.querySelectorAll('details')).toHaveLength(2);
  });

  it('em produção, um grupo sem resposta confirmada some junto com o título', async () => {
    definirMidia({ reduzido: true });
    await renderApp(configCom((c) => (c.modoDemo = false)));
    const secao = document.querySelector('#duvidas') as HTMLElement;
    expect(
      within(secao)
        .getAllByRole('heading', { level: 3 })
        .map((t) => t.textContent),
    ).toEqual(['Sessões']);
  });
});

describe('contato', () => {
  it('mostra um cartão por ponto (estúdio e loja) com endereço, mapa sem iframe e WhatsApp', async () => {
    definirMidia({ reduzido: true });
    await renderApp();
    const secao = document.querySelector('#contato') as HTMLElement;
    const cartoes = within(secao).getAllByRole('article');
    expect(cartoes).toHaveLength(2);
    expect(within(cartoes[0]!).getByRole('heading', { level: 3 })).toHaveTextContent(
      'Estúdio fictício',
    );
    expect(within(cartoes[0]!).getByText('Rua Fictícia, 100')).toBeInTheDocument();
    expect(within(cartoes[1]!).getByText('Avenida Inventada, 200')).toBeInTheDocument();
    const mapa = within(cartoes[1]!).getByRole('link', { name: /Abrir no mapa/ });
    expect(mapa).toHaveAttribute('href', 'https://maps.exemplo.test/avenida-inventada');
    expect(mapa).toHaveAttribute('target', '_blank');
    expect(secao.querySelector('iframe')).toBeNull();
    expect(within(cartoes[0]!).getByRole('link', { name: /Chamar no WhatsApp/ })).toHaveAttribute(
      'href',
      'https://wa.me/5500900000000',
    );
  });

  it('cada ponto usa o seu WhatsApp quando tem um, e os horários do negócio quando não tem', async () => {
    definirMidia({ reduzido: true });
    await renderApp(
      configCom((c) => {
        c.negocio.locais![1]!.whatsapp = '5500922222222';
        c.negocio.locais![1]!.horarios = [{ dias: 'Dom', horas: 'Fechado' }];
      }),
    );
    const cartoes = within(document.querySelector('#contato') as HTMLElement).getAllByRole(
      'article',
    );
    expect(within(cartoes[1]!).getByRole('link', { name: /WhatsApp/ })).toHaveAttribute(
      'href',
      'https://wa.me/5500922222222',
    );
    expect(cartoes[0]).toHaveTextContent('Seg a sex');
    expect(cartoes[0]).toHaveTextContent('09h às 18h');
    expect(cartoes[1]).toHaveTextContent('Dom');
    expect(cartoes[1]).not.toHaveTextContent('Seg a sex');
  });

  it('lista as duas contas de Instagram com rótulo e o e-mail', async () => {
    definirMidia({ reduzido: true });
    await renderApp();
    const redes = within(document.querySelector('#contato') as HTMLElement).getByRole('list', {
      name: 'Redes e e-mail',
    });
    expect(within(redes).getByRole('link', { name: '@estudioexemplo' })).toHaveAttribute(
      'href',
      'https://instagram.com/estudioexemplo',
    );
    expect(within(redes).getByRole('link', { name: '@lojaexemplo' })).toBeInTheDocument();
    expect(within(redes).getByRole('link', { name: 'contato@exemplo.com' })).toHaveAttribute(
      'href',
      'mailto:contato@exemplo.com',
    );
    expect(within(redes).getByText('Loja de teste')).toBeInTheDocument();
  });

  it('dado que falta vira [CONFIRMAR] na prévia e some no site final', async () => {
    definirMidia({ reduzido: true });
    const faltando = (c: ReturnType<typeof configCom>) => {
      delete c.negocio.locais![0]!.endereco;
      delete c.negocio.horarios;
      delete c.negocio.redes;
      delete c.negocio.instagram;
      delete c.negocio.email;
    };
    const { unmount } = await renderApp(configCom(faltando));
    let secao = document.querySelector('#contato') as HTMLElement;
    expect(within(secao).getAllByText(/\[CONFIRMAR\] endereço/)).toHaveLength(1);
    expect(within(secao).getAllByText(/\[CONFIRMAR\] horários/)).toHaveLength(2);
    expect(within(secao).getByText(/contas de Instagram/)).toBeInTheDocument();
    unmount();

    await renderApp(
      configCom((c) => {
        faltando(c);
        c.modoDemo = false;
      }),
    );
    secao = document.querySelector('#contato') as HTMLElement;
    expect(within(secao).queryByText(/CONFIRMAR/)).toBeNull();
  });

  it('sem `locais`, usa o endereço único do negócio', async () => {
    definirMidia({ reduzido: true });
    await renderApp(configCom((c) => delete c.negocio.locais));
    const secao = document.querySelector('#contato') as HTMLElement;
    expect(within(secao).getAllByRole('article')).toHaveLength(1);
    expect(within(secao).getByText('Rua Fictícia, 100')).toBeInTheDocument();
  });

  it('esconde o botão flutuante do WhatsApp enquanto a seção está na tela', async () => {
    definirMidia({ reduzido: true });
    await renderApp();
    expect(document.querySelector('#contato')).toHaveAttribute('data-oculta-whatsapp');
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });
});
