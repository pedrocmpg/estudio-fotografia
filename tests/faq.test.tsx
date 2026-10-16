import { fireEvent, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { secoesAtivas } from '../src/config/secoes.ts';
import { siteConfigAlt } from '../src/config/site.config.alt.ts';
import { dadosEstruturados } from '../src/lib/dadosEstruturados.ts';
import { definirMidia } from './helpers/midia.ts';
import { configCom, renderApp } from './helpers/render.tsx';

describe('bloco G — FAQ com tom humano', () => {
  it('mostra a frase de abertura e as perguntas em details/summary', async () => {
    definirMidia({ reduzido: true });
    await renderApp();
    const secao = document.querySelector('#duvidas') as HTMLElement;
    expect(within(secao).getByText(siteConfigAlt.faq.abertura)).toBeInTheDocument();
    const detalhes = secao.querySelectorAll('details');
    expect(detalhes).toHaveLength(siteConfigAlt.faq.itens.length);
    for (const d of Array.from(detalhes)) expect(d.querySelector('summary')).not.toBeNull();
  });

  it('abre pela pergunta (teclado/clique) e mostra a resposta', async () => {
    definirMidia({ reduzido: true });
    await renderApp();
    const detalhe = document.querySelector('#duvidas details') as HTMLDetailsElement;
    expect(detalhe.open).toBe(false);
    detalhe.open = true; // o clique/Enter no summary faz exatamente isto no navegador
    fireEvent(detalhe, new Event('toggle'));
    expect(detalhe.open).toBe(true);
    expect(within(detalhe).getByText(siteConfigAlt.faq.itens[0]!.resposta)).toBeInTheDocument();
  });

  it('em produção só ficam as respostas confirmadas', async () => {
    definirMidia({ reduzido: true });
    await renderApp(configCom((c) => (c.modoDemo = false)));
    const secao = document.querySelector('#duvidas') as HTMLElement;
    expect(secao.querySelectorAll('details')).toHaveLength(1);
    expect(within(secao).getByText('Pergunta confirmada?')).toBeInTheDocument();
    expect(within(secao).queryByText('Pergunta de exemplo?')).toBeNull();
  });

  it('sem nenhuma resposta confirmada em produção, a seção some', async () => {
    const sem = configCom((c) => {
      c.modoDemo = false;
      c.faq.itens.forEach((i) => (i.confirmada = false));
    });
    expect(secoesAtivas(sem)).not.toContain('faq');
    definirMidia({ reduzido: true });
    await renderApp(sem);
    expect(screen.queryByRole('heading', { name: sem.faq.titulo })).toBeNull();
  });

  it('o JSON-LD FAQPage leva só as respostas confirmadas', () => {
    const dados = dadosEstruturados(
      configCom((c) => (c.modoDemo = false)),
      'https://exemplo.test',
    );
    const faq = dados.find((d) => (d as { '@type': string })['@type'] === 'FAQPage') as {
      mainEntity: { name: string }[];
    };
    expect(faq.mainEntity.map((q) => q.name)).toEqual(['Pergunta confirmada?']);
  });

  it('sem respostas confirmadas não há FAQPage no JSON-LD', () => {
    const dados = dadosEstruturados(
      configCom((c) => c.faq.itens.forEach((i) => (i.confirmada = false))),
      'https://exemplo.test',
    );
    expect(dados.some((d) => (d as { '@type': string })['@type'] === 'FAQPage')).toBe(false);
  });
});
