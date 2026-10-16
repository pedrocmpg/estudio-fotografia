import { fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';
import { depoimentosVisiveis, secoesAtivas } from '../src/config/secoes.ts';
import { siteConfigAlt } from '../src/config/site.config.alt.ts';
import { validarConfig } from '../src/config/validar.ts';
import { todasAsFotos } from '../src/data/fotos.ts';
import { definirMidia } from './helpers/midia.ts';
import { configCom, renderApp } from './helpers/render.tsx';

const DOIS = [
  { texto: 'Primeiro depoimento fictício.', autor: 'Pessoa Um', exemplo: true },
  {
    texto: 'Segundo depoimento fictício.',
    autor: 'Pessoa Dois',
    sessao: 'Sessão X',
    exemplo: true,
  },
];

describe('depoimentos', () => {
  it('mostra uma citação por vez, com o selo EXEMPLO na prévia', async () => {
    definirMidia({ reduzido: true });
    await renderApp(configCom((c) => (c.depoimentos = structuredClone(DOIS))));
    const secao = document.querySelector('#depoimentos') as HTMLElement;
    expect(within(secao).getByText('Primeiro depoimento fictício.')).toBeInTheDocument();
    expect(within(secao).queryByText('Segundo depoimento fictício.')).toBeNull();
    expect(within(secao).getByText('Exemplo')).toBeInTheDocument();
  });

  it('troca só pelos botões e anuncia a mudança (aria-live), sem autoplay', async () => {
    definirMidia({ reduzido: true });
    await renderApp(configCom((c) => (c.depoimentos = structuredClone(DOIS))));
    const user = userEvent.setup();
    const secao = document.querySelector('#depoimentos') as HTMLElement;
    expect(secao.querySelector('[aria-live="polite"]')).not.toBeNull();
    await user.click(within(secao).getByRole('button', { name: 'Próximo depoimento' }));
    expect(within(secao).getByText('Segundo depoimento fictício.')).toBeInTheDocument();
    expect(within(secao).getByText(/Pessoa Dois · Sessão X/)).toBeInTheDocument();
    expect(within(secao).getByText(/02 \/ 02/)).toBeInTheDocument();
    await user.click(within(secao).getByRole('button', { name: 'Próximo depoimento' }));
    expect(within(secao).getByText('Primeiro depoimento fictício.')).toBeInTheDocument();
  });

  it('com um só depoimento não há botões', async () => {
    definirMidia({ reduzido: true });
    await renderApp();
    const secao = document.querySelector('#depoimentos') as HTMLElement;
    expect(within(secao).queryByRole('button')).toBeNull();
  });

  it('exemplos somem com modoDemo desligado, e a seção some junto', async () => {
    const config = configCom((c) => (c.modoDemo = false));
    expect(depoimentosVisiveis(config)).toHaveLength(0);
    expect(secoesAtivas(config)).not.toContain('depoimentos');
    definirMidia({ reduzido: true });
    await renderApp(config);
    expect(document.querySelector('#depoimentos')).toBeNull();
  });

  it('depoimento real continua no site final, e o link do Google aparece quando existe', async () => {
    definirMidia({ reduzido: true });
    await renderApp(
      configCom((c) => {
        c.modoDemo = false;
        c.depoimentos = [{ texto: 'Texto real fictício.', autor: 'Pessoa Real', exemplo: false }];
        c.linkAvaliacoesGoogle = 'https://avaliacoes.exemplo.test';
      }),
    );
    const secao = document.querySelector('#depoimentos') as HTMLElement;
    expect(within(secao).getByText('Texto real fictício.')).toBeInTheDocument();
    expect(within(secao).queryByText('Exemplo')).toBeNull();
    expect(within(secao).getByRole('link', { name: /avaliações no Google/ })).toHaveAttribute(
      'href',
      'https://avaliacoes.exemplo.test',
    );
  });
});

describe('antes e depois', () => {
  const par = { antes: 'retrato-1', depois: 'pb-retrato-2', legenda: 'Legenda fictícia do par.' };

  it('desligado por padrão (lista vazia): não renderiza', async () => {
    definirMidia({ reduzido: true });
    await renderApp();
    expect(document.querySelector('#antes-e-depois')).toBeNull();
  });

  it('com um par: slider acessível por teclado que move o ponto de comparação', async () => {
    definirMidia({ reduzido: true });
    await renderApp(configCom((c) => (c.antesDepois = [par])));
    const secao = document.querySelector('#antes-e-depois') as HTMLElement;
    const slider = within(secao).getByRole('slider', { name: /Comparar antes e depois/ });
    expect(slider).toHaveValue('50');
    expect(within(secao).getByText(par.legenda)).toBeInTheDocument();
    fireEvent.change(slider, { target: { value: '80' } });
    expect(slider).toHaveValue('80');
    expect(slider).toHaveAttribute('aria-valuetext', '80% da foto mostra o antes');
    expect(slider.closest('div')?.style.getPropertyValue('--v')).toBe('80%');
  });

  it('a foto do "antes" é decorativa (alt vazio): só uma descrição fala no leitor de tela', async () => {
    definirMidia({ reduzido: true });
    await renderApp(configCom((c) => (c.antesDepois = [par])));
    const secao = document.querySelector('#antes-e-depois') as HTMLElement;
    const imgs = Array.from(secao.querySelectorAll('img'));
    expect(imgs.filter((i) => i.getAttribute('alt') === '')).toHaveLength(1);
  });

  it('validação: antes e depois não podem ser a mesma foto; ids precisam existir', () => {
    const manifesto = todasAsFotos().map((f) => ({ id: f.id, alt: f.alt }));
    const igual = validarConfig(
      configCom((c) => (c.antesDepois = [{ ...par, depois: par.antes }])),
      manifesto,
    );
    expect(igual.erros.join('\n')).toContain('mesma foto');
    const inexistente = validarConfig(
      configCom((c) => (c.antesDepois = [{ ...par, antes: 'nao-existe' }])),
      manifesto,
    );
    expect(inexistente.erros.join('\n')).toContain('nao-existe');
    expect(validarConfig(siteConfigAlt, manifesto).erros).toEqual([]);
  });

  it('axe: página inteira com o comparador ligado', async () => {
    definirMidia({ reduzido: true });
    const { container } = await renderApp(configCom((c) => (c.antesDepois = [par])));
    const resultado = await axe(container, { rules: { 'color-contrast': { enabled: false } } });
    expect(resultado).toHaveNoViolations();
  });

  it('a página continua com um único h1', async () => {
    definirMidia({ reduzido: true });
    await renderApp(configCom((c) => (c.antesDepois = [par])));
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });
});
