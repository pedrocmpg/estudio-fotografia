import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { numeroDaSecao, secoesAtivas } from '../src/config/secoes.ts';
import { siteConfigAlt } from '../src/config/site.config.alt.ts';
import { hrefDoCta } from '../src/lib/cta.ts';
import { definirMidia } from './helpers/midia.ts';
import { configCom, renderApp } from './helpers/render.tsx';

/** IntersectionObserver em que o teste decide o que está na tela. */
function controlarTela(naTela: (el: Element) => boolean) {
  class IO {
    constructor(private aviso: IntersectionObserverCallback) {}
    observe(alvo: Element) {
      queueMicrotask(() =>
        this.aviso(
          [
            {
              isIntersecting: naTela(alvo),
              target: alvo,
              intersectionRatio: 1,
            } as IntersectionObserverEntry,
          ],
          this as unknown as IntersectionObserver,
        ),
      );
    }
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  vi.stubGlobal('IntersectionObserver', IO);
}

describe('registro de seções', () => {
  it('só renderiza as seções que já existem, na ordem do config', () => {
    expect(secoesAtivas(siteConfigAlt)).toEqual([
      'intro',
      'faixa',
      'sessoes',
      'presentes',
      'manifesto',
      'trabalhos',
      'faq',
      'ctaFinal',
    ]);
  });

  it('seção fora da lista não renderiza', async () => {
    definirMidia({ reduzido: true });
    await renderApp(configCom((c) => (c.secoes = c.secoes.filter((s) => s !== 'faixa'))));
    expect(screen.queryByRole('region', { name: 'Tipos de sessão' })).toBeNull();
    expect(document.querySelector('#sessoes')).not.toBeNull();
  });

  it('numera os títulos editoriais: 01 sessões, 02 presentes, 03 trabalhos', () => {
    expect(numeroDaSecao(siteConfigAlt, 'sessoes')).toBe('01');
    expect(numeroDaSecao(siteConfigAlt, 'presentes')).toBe('02');
    expect(numeroDaSecao(siteConfigAlt, 'trabalhos')).toBe('03');
  });
});

describe('CTAs', () => {
  it('pedido, sem formulário na página, abre o WhatsApp com a mensagem pronta', () => {
    const href = hrefDoCta(siteConfigAlt, siteConfigAlt.hero.ctas.primario);
    expect(href.startsWith('https://wa.me/5500900000000?text=')).toBe(true);
    expect(decodeURIComponent(href.split('?text=')[1]!)).toBe('Olá, Exemplo!');
  });

  it('pedido de uma sessão específica já leva o tipo na mensagem', () => {
    const href = hrefDoCta(siteConfigAlt, { rotulo: 'x', acao: 'pedido' }, { sessaoId: 'beta' });
    expect(decodeURIComponent(href.split('?text=')[1]!)).toBe(
      'Olá, Exemplo!\nTenho interesse em: Sessão Beta.',
    );
  });

  it('ancora e whatsapp', () => {
    expect(hrefDoCta(siteConfigAlt, { rotulo: 'x', acao: 'ancora', alvo: 'trabalhos' })).toBe(
      '#trabalhos',
    );
    expect(hrefDoCta(siteConfigAlt, { rotulo: 'x', acao: 'whatsapp' })).toBe(
      'https://wa.me/5500900000000',
    );
  });
});

describe('header', () => {
  it('o menu lista só as seções que existem na página', async () => {
    definirMidia({ reduzido: true });
    await renderApp();
    const nav = screen.getByRole('navigation', { name: 'Principal' });
    const links = within(nav).getAllByRole('link');
    expect(links.map((l) => l.getAttribute('href'))).toEqual([
      '#sessoes',
      '#presentes',
      '#trabalhos',
      '#duvidas',
    ]);
  });
});

describe('faixa de sessões', () => {
  it('a lista real é lida uma vez; as cópias do loop são aria-hidden', async () => {
    definirMidia({ reduzido: true });
    await renderApp();
    const faixa = screen.getByRole('region', { name: 'Tipos de sessão' });
    const lidos = Array.from(faixa.querySelectorAll('li')).filter(
      (li) => li.getAttribute('aria-hidden') !== 'true' && !li.closest('[aria-hidden="true"]'),
    );
    expect(lidos.map((li) => li.textContent)).toEqual(siteConfigAlt.faixa.itens);
  });
});

describe('sessões', () => {
  it('um card por sessão, com link que pré-seleciona o tipo', async () => {
    definirMidia({ reduzido: true });
    await renderApp();
    const cards = document.querySelectorAll('#sessoes article');
    expect(cards).toHaveLength(siteConfigAlt.sessoes.itens.length);
    const link = within(cards[1] as HTMLElement).getByRole('link', { name: /Pedir essa sessão/ });
    expect(decodeURIComponent(link.getAttribute('href')!.split('?text=')[1]!)).toContain(
      'Sessão Beta',
    );
  });
});

describe('hero: destaque central', () => {
  it('cidade (padrão)', async () => {
    definirMidia({ reduzido: true });
    await renderApp();
    expect(screen.getByText('Fotografia em Cidade Exemplo')).toBeInTheDocument();
  });

  it('tagline', async () => {
    definirMidia({ reduzido: true });
    await renderApp(configCom((c) => (c.hero.destaque.modo = 'tagline')));
    expect(screen.getByText('Frase curta fictícia de teste.')).toBeInTheDocument();
  });

  it('rotativo: a lista inteira fica legível e a animação some do leitor de tela', async () => {
    definirMidia({ reduzido: true });
    await renderApp(configCom((c) => (c.hero.destaque.modo = 'rotativo')));
    expect(screen.getByText('Alfa, Beta, Gama')).toHaveClass('sr-only');
  });
});

describe('selo da prévia', () => {
  it('aparece com modoDemo e some sem ele', async () => {
    definirMidia({ reduzido: true });
    const { unmount } = await renderApp();
    expect(screen.getAllByText('Prévia · fotos ilustrativas').length).toBeGreaterThan(0);
    unmount();

    await renderApp(configCom((c) => (c.modoDemo = false)));
    expect(screen.queryByText('Prévia · fotos ilustrativas')).toBeNull();
  });
});

describe('CTA final e cortina reversa', () => {
  it('fecha a moldura quando entra na tela', async () => {
    definirMidia({});
    await renderApp();
    const cta = document.querySelector('#comece') as HTMLElement;
    expect(cta.querySelectorAll('[aria-hidden="true"]').length).toBeGreaterThanOrEqual(2);
    await waitFor(() => expect(cta).toHaveAttribute('data-fechada'));
  });

  it('com movimento reduzido já nasce fechada', async () => {
    definirMidia({ reduzido: true });
    controlarTela(() => false);
    await renderApp();
    expect(document.querySelector('#comece')).toHaveAttribute('data-fechada');
  });

  it('sem cortinaReversa não há painéis', async () => {
    definirMidia({ reduzido: true });
    await renderApp(configCom((c) => (c.ctaFinal.cortinaReversa = false)));
    const cta = document.querySelector('#comece') as HTMLElement;
    expect(cta.querySelectorAll('[class*="cortina"]')).toHaveLength(0);
  });
});

describe('botão flutuante do WhatsApp', () => {
  it('não aparece com o hero na tela, aparece depois dele e some no rodapé', async () => {
    definirMidia({ reduzido: true });
    controlarTela((el) => el.id === 'topo');
    const { unmount } = await renderApp();
    expect(screen.queryByRole('link', { name: 'Conversar no WhatsApp' })).toBeNull();
    unmount();

    controlarTela(() => false);
    await renderApp();
    const botao = await screen.findByRole('link', { name: 'Conversar no WhatsApp' });
    expect(botao).toHaveAttribute('href', 'https://wa.me/5500900000000');
    expect(botao).toHaveAttribute('data-visivel');
  });

  it('some enquanto o rodapé (ou o formulário) está na tela', async () => {
    definirMidia({ reduzido: true });
    controlarTela((el) => el.tagName === 'FOOTER');
    await renderApp();
    await act(async () => {
      await Promise.resolve();
    });
    const botao = screen.queryByRole('link', { name: 'Conversar no WhatsApp' });
    expect(botao === null || !botao.hasAttribute('data-visivel')).toBe(true);
  });

  it('só dá um pulso: o elemento do pulso não é recriado ao esconder e mostrar', async () => {
    definirMidia({ reduzido: true });
    controlarTela(() => false);
    await renderApp();
    const botao = await screen.findByRole('link', { name: 'Conversar no WhatsApp' });
    fireEvent.focus(botao);
    expect(screen.getAllByRole('link', { name: 'Conversar no WhatsApp' })).toHaveLength(1);
  });
});
