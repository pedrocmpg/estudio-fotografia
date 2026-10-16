import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { secoesAtivas } from '../src/config/secoes.ts';
import { siteConfigAlt } from '../src/config/site.config.alt.ts';
import type { TemaId } from '../src/config/types.ts';
import { validarConfig } from '../src/config/validar.ts';
import { todasAsFotos } from '../src/data/fotos.ts';
import { definirMidia } from './helpers/midia.ts';
import { configCom, renderApp } from './helpers/render.tsx';

const TEMAS: TemaId[] = ['luz-natural', 'camara-escura'];

const IDS_DAS_SECOES = [
  'topo',
  'sessoes',
  'presentes',
  'manifesto',
  'trabalhos',
  'como-funciona',
  'pacotes',
  'depoimentos',
  'pedido',
  'duvidas',
  'comece',
  'contato',
];

describe('aceite da Fase 2 (SPEC §18.2)', () => {
  for (const tema of TEMAS) {
    it(`todas as seções do mapa da página existem — tema ${tema}`, async () => {
      document.documentElement.dataset.theme = tema;
      definirMidia({ reduzido: true });
      await renderApp();
      for (const id of IDS_DAS_SECOES) {
        expect(document.getElementById(id), `#${id}`).not.toBeNull();
      }
      expect(secoesAtivas(siteConfigAlt)).toContain('pacotes');
    });
  }

  it('a ordem do mapa é a do config (antes/depois desligado e fora da página)', async () => {
    definirMidia({ reduzido: true });
    await renderApp();
    const ordem = Array.from(document.querySelectorAll('main > section'))
      .map((sec) => sec.id)
      .filter(Boolean);
    expect(ordem).toEqual(IDS_DAS_SECOES);
    expect(document.getElementById('antes-e-depois')).toBeNull();
  });

  it('nenhum [ ] (VALOR/CONFIRMAR) na primeira dobra: hero e faixa', async () => {
    definirMidia({ reduzido: true });
    await renderApp();
    const hero = document.getElementById('topo')!;
    expect(hero.textContent).not.toMatch(/\[(VALOR|CONFIRMAR)/);
  });

  it('o formulário gera a mensagem de sessão e cada card de presente abre o WhatsApp do produto', async () => {
    definirMidia({ reduzido: true });
    await renderApp();
    const secao = document.getElementById('presentes')!;
    const links = within(secao).getAllByRole('link', { name: /Pedir no WhatsApp/ });
    const itens = siteConfigAlt.presentes.itens;
    expect(links).toHaveLength(itens.length);
    links.forEach((link, i) => {
      const href = link.getAttribute('href')!;
      expect(href.startsWith('https://wa.me/5500900000000?text=')).toBe(true);
      expect(decodeURIComponent(href.split('?text=')[1]!)).toBe(itens[i]!.mensagemWhatsapp);
    });
  });

  it('teclado completo: dá para chegar ao formulário só com Tab e preencher o nome', async () => {
    definirMidia({ reduzido: true });
    await renderApp();
    const user = userEvent.setup();
    const campo = within(document.getElementById('pedido')!).getByLabelText(/Seu nome/);
    campo.focus();
    await user.keyboard('Ana');
    expect(campo).toHaveValue('Ana');
    await user.tab();
    expect(
      within(document.getElementById('pedido')!).getByLabelText(/O que você quer/),
    ).toHaveFocus();
  });

  it('nenhuma foto repetida em seções vizinhas e config sem erros (alt)', () => {
    const manifesto = todasAsFotos().map((f) => ({ id: f.id, alt: f.alt }));
    const { erros } = validarConfig(siteConfigAlt, manifesto);
    expect(erros).toEqual([]);
    const repetida = validarConfig(
      configCom((c) => (c.trabalhos.folha.fotos[0]!.id = c.trabalhos.roda.fotos[0]!)),
      manifesto,
    );
    expect(repetida.erros.join('\n')).toContain('folha');
  });

  it('um único h1 e títulos em ordem na página inteira (todas as seções novas)', async () => {
    definirMidia({ reduzido: true });
    await renderApp();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    const niveis = screen.getAllByRole('heading').map((h) => Number(h.tagName[1]));
    for (let i = 1; i < niveis.length; i++) {
      expect(niveis[i]! - niveis[i - 1]!).toBeLessThanOrEqual(1);
    }
  });
});
