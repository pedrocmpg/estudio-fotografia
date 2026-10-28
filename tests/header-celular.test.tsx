import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { siteConfigAlt } from '../src/config/site.config.alt.ts';
import { definirMidia } from './helpers/midia.ts';
import { renderApp } from './helpers/render.tsx';

const marca = () => document.querySelector('header a[href="#topo"]') as HTMLElement;

describe('header — nome da marca', () => {
  it('no celular mostra o nome curto e mantém o nome completo para leitor de tela', async () => {
    definirMidia({ reduzido: true, estreito: true });
    await renderApp();
    expect(marca().textContent).toBe(siteConfigAlt.negocio.nomeCurto);
    expect(screen.getByRole('link', { name: siteConfigAlt.negocio.nome })).toBe(marca());
  });

  it('no desktop mostra o nome completo', async () => {
    definirMidia({ reduzido: true, largo: true, mouse: true });
    await renderApp();
    expect(marca().textContent).toBe(siteConfigAlt.negocio.nome);
    expect(marca()).not.toHaveAttribute('aria-label');
  });
});
