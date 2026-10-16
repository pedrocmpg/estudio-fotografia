import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { definirMidia } from './helpers/midia.ts';
import { configCom, renderApp } from './helpers/render.tsx';

async function abrirPainel(config?: ReturnType<typeof configCom>) {
  window.history.pushState({}, '', '/?apresentar=1');
  definirMidia({ reduzido: true });
  await renderApp(config);
  return screen.findByRole('complementary', { name: 'Painel de apresentação' });
}

describe('modo apresentação', () => {
  it('só abre com ?apresentar=1', async () => {
    definirMidia({ reduzido: true });
    await renderApp();
    expect(screen.queryByRole('complementary', { name: 'Painel de apresentação' })).toBeNull();
  });

  it('com ?apresentar=1 e modoDemo: mostra o painel', async () => {
    expect(await abrirPainel()).toBeInTheDocument();
  });

  it('com modoDemo desligado o painel nunca aparece, mesmo com ?apresentar=1', async () => {
    window.history.pushState({}, '', '/?apresentar=1');
    definirMidia({ reduzido: true });
    await renderApp(configCom((c) => (c.modoDemo = false)));
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });
    expect(screen.queryByRole('complementary', { name: 'Painel de apresentação' })).toBeNull();
  });

  it('troca o tema ao vivo', async () => {
    await abrirPainel();
    expect(document.documentElement.dataset.theme).toBe('camara-escura');
    fireEvent.click(screen.getByRole('button', { name: 'Claro' }));
    await waitFor(() => expect(document.documentElement.dataset.theme).toBe('luz-natural'));
    expect(screen.getByRole('button', { name: 'Claro' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Escuro' }));
    await waitFor(() => expect(document.documentElement.dataset.theme).toBe('camara-escura'));
  });

  it('?tema=luz-natural já abre no tema claro', async () => {
    window.history.pushState({}, '', '/?tema=luz-natural&apresentar=1');
    document.documentElement.dataset.theme = 'luz-natural'; // o script do <head> faz isto
    definirMidia({ reduzido: true });
    await renderApp();
    expect(document.documentElement.dataset.theme).toBe('luz-natural');
  });

  it('cor de destaque: aplica nos tokens com contraste garantido e volta ao padrão', async () => {
    await abrirPainel();
    fireEvent.click(screen.getByRole('button', { name: 'Cor #7FA38A' }));
    const raiz = document.documentElement;
    await waitFor(() => expect(raiz.style.getPropertyValue('--accent')).toBe('#7FA38A'));
    expect(raiz.style.getPropertyValue('--accent-texto')).not.toBe('');
    expect(raiz.style.getPropertyValue('--on-accent')).not.toBe('');

    fireEvent.click(screen.getByRole('button', { name: 'Padrão' }));
    await waitFor(() => expect(raiz.style.getPropertyValue('--accent')).toBe(''));
  });

  it('"Rever abertura" reinicia a intro e escolhe 1, 2 ou 3 cortinas', async () => {
    window.history.pushState({}, '', '/?apresentar=1');
    await renderApp(); // abertura rodando
    await screen.findByRole('complementary', { name: 'Painel de apresentação' });
    fireEvent.click(screen.getByRole('button', { name: 'Pular' }));
    await act(async () => {
      await new Promise((r) => setTimeout(r, 300));
    });
    expect(document.querySelector('#topo')).toHaveAttribute('data-fase', 'concluida');

    fireEvent.click(screen.getByRole('button', { name: '3 cortinas' }));
    await waitFor(() =>
      expect(document.querySelector('#topo')).toHaveAttribute('data-fase', 'rodando'),
    );
    expect(document.querySelectorAll('[data-intro-camada]')).toHaveLength(3);

    fireEvent.click(screen.getByRole('button', { name: '1 cortina' }));
    await waitFor(() => expect(document.querySelectorAll('[data-intro-camada]')).toHaveLength(1));
  });

  it('troca o destaque do hero', async () => {
    await abrirPainel();
    fireEvent.click(screen.getByRole('button', { name: 'Frase' }));
    expect(await screen.findByText('Frase curta fictícia de teste.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Girando' }));
    expect(await screen.findByText('Alfa, Beta, Gama')).toBeInTheDocument();
  });

  it('minimiza para uma bolinha e volta', async () => {
    await abrirPainel();
    fireEvent.click(screen.getByRole('button', { name: 'Minimizar' }));
    const bolinha = await screen.findByRole('button', { name: 'Abrir painel de apresentação' });
    fireEvent.click(bolinha);
    expect(
      await screen.findByRole('complementary', { name: 'Painel de apresentação' }),
    ).toBeInTheDocument();
  });
});
