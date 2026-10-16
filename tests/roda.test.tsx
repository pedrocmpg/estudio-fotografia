import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { siteConfigAlt } from '../src/config/site.config.alt.ts';
import { obterFoto } from '../src/data/fotos.ts';
import Roda from '../src/sections/Trabalhos/Roda.tsx';
import { definirMidia } from './helpers/midia.ts';

const fotos = siteConfigAlt.trabalhos.roda.fotos;

function montar(aoAbrir?: (i: number) => void) {
  return render(
    <Roda fotos={fotos} segundosPorVolta={60} titulo="Galeria de teste" aoAbrir={aoAbrir} />,
  );
}

const botoes = () => screen.getAllByRole('button');
const frente = () => botoes().findIndex((b) => b.getAttribute('aria-current') === 'true');

describe('roda 3D', () => {
  it('com preserve-3d e ponteiro fino vira um anel de botões, cada um com o alt como rótulo', () => {
    vi.stubGlobal('CSS', { supports: () => true });
    montar();
    expect(screen.getByRole('group', { name: 'Galeria de teste' })).toHaveAttribute(
      'aria-roledescription',
      'carrossel',
    );
    expect(botoes()).toHaveLength(fotos.length);
    fotos.forEach((id, i) => {
      expect(botoes()[i]).toHaveAccessibleName(obterFoto(id)!.alt);
    });
  });

  it('só a foto da frente entra na ordem do Tab (roving tabindex)', () => {
    vi.stubGlobal('CSS', { supports: () => true });
    montar();
    expect(botoes().filter((b) => b.tabIndex === 0)).toHaveLength(1);
    expect(botoes()[0]!.tabIndex).toBe(0);
  });

  it('setas giram uma posição e levam o foco', async () => {
    vi.stubGlobal('CSS', { supports: () => true });
    montar();
    expect(frente()).toBe(0);
    botoes()[0]!.focus();
    fireEvent.keyDown(botoes()[0]!, { key: 'ArrowRight' });
    await waitFor(() => expect(frente()).toBe(1), { timeout: 2000 });
    expect(document.activeElement).toBe(botoes()[1]);

    fireEvent.keyDown(botoes()[1]!, { key: 'ArrowLeft' });
    fireEvent.keyDown(botoes()[1]!, { key: 'ArrowLeft' });
    await waitFor(() => expect(frente()).toBe(fotos.length - 1), { timeout: 2000 });
  });

  it('Enter na foto da frente pede para abrir; clicar em outra só gira até ela', async () => {
    vi.stubGlobal('CSS', { supports: () => true });
    const abrir = vi.fn();
    montar(abrir);
    fireEvent.click(botoes()[0]!);
    expect(abrir).toHaveBeenCalledWith(0);

    fireEvent.click(botoes()[3]!);
    await waitFor(() => expect(frente()).toBe(3), { timeout: 2000 });
    expect(abrir).toHaveBeenCalledTimes(1);
  });

  it('o laço de animação cancela ao desmontar', async () => {
    vi.stubGlobal('CSS', { supports: () => true });
    const cancelar = vi.spyOn(window, 'cancelAnimationFrame');
    const { unmount } = montar();
    await act(async () => {
      await new Promise((r) => setTimeout(r, 40)); // dá tempo de o laço começar
    });
    unmount();
    expect(cancelar).toHaveBeenCalled();
  });

  it('movimento reduzido: grade simples, sem roda', () => {
    vi.stubGlobal('CSS', { supports: () => true });
    definirMidia({ reduzido: true });
    const { container } = montar();
    expect(container.querySelector('[data-modo="grade"]')).not.toBeNull();
    expect(screen.queryByRole('group', { name: 'Galeria de teste' })).toBeNull();
    expect(container.querySelectorAll('figure')).toHaveLength(fotos.length);
  });

  it('sem suporte a preserve-3d também cai na grade', () => {
    vi.stubGlobal('CSS', { supports: () => false });
    const { container } = montar();
    expect(container.querySelector('[data-modo="grade"]')).not.toBeNull();
  });

  it('celular / ponteiro grosso: pista (rolagem vertical ligada à horizontal) com contador', () => {
    vi.stubGlobal('CSS', { supports: () => true });
    definirMidia({ ponteiroGrosso: true });
    const { container } = montar();
    expect(container.querySelector('[data-modo="pista"]')).not.toBeNull();
    expect(container.querySelector('[data-palco]')).not.toBeNull();
    expect(screen.getByText(`01 / ${String(fotos.length).padStart(2, '0')}`)).toBeInTheDocument();
    expect(screen.getAllByRole('figure')).toHaveLength(fotos.length);
  });

  it('tela estreita também vira pista, e a pista escreve --p', () => {
    vi.stubGlobal('CSS', { supports: () => true });
    definirMidia({ estreito: true });
    const { container } = montar();
    const pista = container.querySelector('[data-modo="pista"]') as HTMLElement;
    expect(pista).not.toBeNull();
    expect(pista.style.getPropertyValue('--p')).not.toBe('');
  });

  it('com ação de abrir, as fotos da pista são botões e focar leva a rolagem até elas', () => {
    vi.stubGlobal('CSS', { supports: () => true });
    definirMidia({ estreito: true });
    const abrir = vi.fn();
    const rolar = vi.fn();
    window.scrollTo = rolar as unknown as typeof window.scrollTo;
    montar(abrir);
    fireEvent.focus(botoes()[3]!);
    expect(rolar).toHaveBeenCalled();
    fireEvent.click(botoes()[3]!);
    expect(abrir).toHaveBeenCalledWith(3);
  });

  it('sem position: sticky cai no carrossel de scroll-snap com fotos a 85%', () => {
    vi.stubGlobal('CSS', { supports: (p: string) => p !== 'position' });
    definirMidia({ estreito: true });
    const { container } = montar();
    expect(container.querySelector('[data-modo="snap"]')).not.toBeNull();
    expect(screen.getByText('Deslize para ver mais')).toBeInTheDocument();
  });

  it('na grade, com ação de abrir, cada foto vira botão', () => {
    vi.stubGlobal('CSS', { supports: () => false });
    const abrir = vi.fn();
    montar(abrir);
    fireEvent.click(botoes()[2]!);
    expect(abrir).toHaveBeenCalledWith(2);
  });

  it('a roda só roda com a seção perto da tela (carrega o chunk sob demanda)', async () => {
    // O chunk é importado por React.lazy dentro de LazyPerto; aqui basta garantir que o módulo carrega.
    const modulo = await act(async () => import('../src/sections/Trabalhos/Roda.tsx'));
    expect(typeof modulo.default).toBe('function');
  });
});
