import { act, fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { siteConfigAlt } from '../src/config/site.config.alt.ts';
import { definirMidia } from './helpers/midia.ts';
import { configCom, renderApp } from './helpers/render.tsx';

const hero = () => document.querySelector('#topo') as HTMLElement;
const fase = () => hero().getAttribute('data-fase');

/** Faz o jsdom achar que as fotos de certas camadas já carregaram. */
function fotosProntas(camadasProntas: number[] | 'todas') {
  const pronta = (img: HTMLImageElement) => {
    if (camadasProntas === 'todas') return true;
    const camada = img.closest('[data-intro-camada]')?.getAttribute('data-intro-camada');
    return camada !== null && camada !== undefined && camadasProntas.includes(Number(camada));
  };
  vi.spyOn(HTMLImageElement.prototype, 'complete', 'get').mockImplementation(function (
    this: HTMLImageElement,
  ) {
    return pronta(this);
  });
  vi.spyOn(HTMLImageElement.prototype, 'naturalWidth', 'get').mockImplementation(function (
    this: HTMLImageElement,
  ) {
    return pronta(this) ? 960 : 0;
  });
}

async function avancar(ms: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

describe('abertura em cortinas', () => {
  it('o h1 com o nome existe desde o primeiro frame, atrás das cortinas', async () => {
    await renderApp();
    expect(fase()).toBe('rodando');
    expect(document.querySelector('[data-intro-camada]')).not.toBeNull();
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toHaveTextContent(siteConfigAlt.negocio.nome);
  });

  it('com movimento reduzido vai direto ao estado final, sem cortinas', async () => {
    definirMidia({ reduzido: true });
    await renderApp();
    expect(fase()).toBe('concluida');
    expect(hero().getAttribute('data-final')).toBe('direto');
    expect(document.querySelector('[data-intro-camada]')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Pular' })).toBeNull();
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(document.documentElement.dataset.intro).toBe('done');
  });

  it('movimento reduzido vale até com ?intro=1', async () => {
    definirMidia({ reduzido: true });
    window.history.pushState({}, '', '/?intro=1');
    await renderApp();
    expect(fase()).toBe('concluida');
  });

  it('não repete na mesma sessão, e ?intro=1 força de novo', async () => {
    window.sessionStorage.setItem('intro-vista', '1');
    const { unmount } = await renderApp();
    expect(fase()).toBe('concluida');
    unmount();

    // Nova carga de página: o script do <head> decide de novo (aqui simulamos limpando o resultado).
    document.documentElement.removeAttribute('data-intro');
    window.history.pushState({}, '', '/?intro=1');
    await renderApp();
    expect(fase()).toBe('rodando');
  });

  it('grava intro-vista ao começar', async () => {
    await renderApp();
    expect(window.sessionStorage.getItem('intro-vista')).toBe('1');
  });

  it('se sessionStorage não estiver disponível, não quebra e mostra a intro normalmente', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });
    await renderApp();
    expect(fase()).toBe('rodando');
  });

  it('config com intro desligada vai direto ao final', async () => {
    await renderApp(configCom((c) => (c.hero.intro.ativo = false)));
    expect(fase()).toBe('concluida');
    expect(document.querySelector('[data-intro-camada]')).toBeNull();
  });

  it('"Pular" é o primeiro item focável e leva ao final com saída de 250 ms', async () => {
    vi.useFakeTimers();
    await renderApp();
    const pular = screen.getByRole('button', { name: 'Pular' });
    const primeiroFocavel = document.querySelector('button, a[href], [tabindex="0"]');
    expect(primeiroFocavel).toBe(pular);

    fireEvent.click(pular);
    expect(fase()).toBe('saindo');
    expect(screen.queryByRole('button', { name: 'Pular' })).toBeNull();
    await avancar(260);
    expect(fase()).toBe('concluida');
    expect(hero().getAttribute('data-final')).toBe('pulado');
    expect(document.documentElement.dataset.intro).toBe('done');
  });

  it('clique, toque, tecla, roda do mouse e rolagem também pulam; Tab não', async () => {
    const casos: [string, () => void][] = [
      ['pointerdown', () => fireEvent.pointerDown(document.body)],
      ['touchmove', () => fireEvent.touchMove(document.body)],
      ['keydown', () => fireEvent.keyDown(document.body, { key: 'a' })],
      ['wheel', () => fireEvent.wheel(document.body)],
      [
        'scroll',
        () => {
          Object.defineProperty(window, 'scrollY', { value: 40, configurable: true });
          fireEvent.scroll(window);
        },
      ],
    ];
    for (const [nome, disparar] of casos) {
      vi.useFakeTimers();
      const { unmount } = await renderApp();
      expect(fase(), nome).toBe('rodando');
      act(disparar);
      expect(fase(), nome).toBe('saindo');
      await avancar(260);
      unmount();
      document.documentElement.removeAttribute('data-intro');
      window.sessionStorage.clear();
      Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
      vi.useRealTimers();
    }

    vi.useFakeTimers();
    await renderApp();
    act(() => {
      fireEvent.keyDown(document.body, { key: 'Tab' });
    });
    expect(fase()).toBe('rodando');
  });

  it('não trava a rolagem da página', async () => {
    await renderApp();
    expect(document.body.style.overflow).toBe('');
    expect(document.documentElement.style.overflow).toBe('');
  });

  it('roda a linha do tempo inteira: 3 etapas por camada, contador e fim sozinho', async () => {
    vi.useFakeTimers();
    fotosProntas('todas');
    await renderApp();
    expect(screen.getByText('01 / 02')).toBeInTheDocument();

    const camada0 = () => document.querySelector('[data-intro-camada="0"]') as HTMLElement;
    const camada1 = () => document.querySelector('[data-intro-camada="1"]') as HTMLElement;
    const p = (el: HTMLElement) => Number(el.style.getPropertyValue('--p'));

    await avancar(410); // 400 ms de espera inicial → etapa 1
    expect(p(camada0())).toBeCloseTo(1 / 3, 2);
    await avancar(560); // 450 + 120 → etapa 2
    expect(p(camada0())).toBeCloseTo(2 / 3, 2);
    await avancar(570); // → etapa 3 (t = 1540 ms)
    expect(p(camada0())).toBe(1);
    expect(screen.getByText('01 / 02')).toBeInTheDocument();
    await avancar(460); // a etapa 3 termina: o contador vira 02 / 02
    expect(screen.getByText('02 / 02')).toBeInTheDocument();
    expect(p(camada1())).toBe(0);

    await avancar(1900); // pausa de 300 ms + 3 etapas da camada 2 (fim em t = 3880 ms)
    expect(fase()).toBe('concluida');
    expect(hero().getAttribute('data-final')).toBe('natural');
  });

  it('a camada 2 é pulada se as fotos dela não chegaram a tempo (nunca painel vazio)', async () => {
    vi.useFakeTimers();
    fotosProntas([0]);
    await renderApp();
    await avancar(500);
    const camada1 = document.querySelector('[data-intro-camada="1"]') as HTMLElement;
    expect(camada1.getAttribute('data-pulada')).toBe('true');
    await avancar(2200);
    expect(fase()).toBe('concluida');
  });

  it('CTAs ficam inertes enquanto a intro roda e voltam depois', async () => {
    vi.useFakeTimers();
    await renderApp();
    const ctas = () => hero().querySelector('a[href]')!.parentElement!;
    expect(ctas()).toHaveAttribute('inert');
    fireEvent.click(screen.getByRole('button', { name: 'Pular' }));
    await avancar(260);
    expect(ctas()).not.toHaveAttribute('inert');
  });

  it('o header só aparece depois da intro', async () => {
    vi.useFakeTimers();
    await renderApp();
    const header = document.querySelector('header')!;
    expect(header).not.toHaveAttribute('data-visivel');
    fireEvent.click(screen.getByRole('button', { name: 'Pular' }));
    await avancar(260);
    expect(header).toHaveAttribute('data-visivel');
  });
});
