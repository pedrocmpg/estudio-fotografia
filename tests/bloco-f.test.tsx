import { fireEvent, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { siteConfigAlt } from '../src/config/site.config.alt.ts';
import { definirMidia } from './helpers/midia.ts';
import { configCom, renderApp } from './helpers/render.tsx';

describe('bloco F — rodapé com nome gigante', () => {
  it('o rodapé não tem mais o nome gigante', async () => {
    definirMidia({ reduzido: true });
    await renderApp();
    const rodape = screen.getByRole('contentinfo');
    const gigante = Array.from(rodape.querySelectorAll('[aria-hidden="true"]')).find(
      (el) => el.textContent === siteConfigAlt.negocio.nomeCurto,
    );
    expect(gigante).toBeUndefined();
  });

  it('mostra as duas contas de Instagram com rótulo e os dois pontos com "Abrir no mapa"', async () => {
    definirMidia({ reduzido: true });
    await renderApp();
    const rodape = within(screen.getByRole('contentinfo'));
    for (const rede of siteConfigAlt.negocio.redes!) {
      const link = rodape.getByRole('link', { name: `${rede.rotulo}: @${rede.usuario}` });
      expect(link).toHaveAttribute('href', `https://instagram.com/${rede.usuario}`);
    }
    for (const local of siteConfigAlt.negocio.locais!) {
      expect(rodape.getByText(local.rotulo)).toBeInTheDocument();
      expect(
        rodape.getByRole('link', { name: new RegExp(`Abrir no mapa — ${local.rotulo}`) }),
      ).toHaveAttribute('href', local.mapsUrl);
    }
  });

  it('cada item só aparece se existir no config', async () => {
    definirMidia({ reduzido: true });
    await renderApp(
      configCom((c) => {
        delete c.negocio.redes;
        delete c.negocio.instagram;
        delete c.negocio.locais;
        delete c.negocio.email;
      }),
    );
    const rodape = within(screen.getByRole('contentinfo'));
    expect(rodape.queryByText('Redes')).toBeNull();
    expect(rodape.queryByText(/Abrir no mapa/)).toBeNull();
  });

  it('tem "Voltar ao topo" no fluxo da página (nunca fixo)', async () => {
    definirMidia({ reduzido: true });
    await renderApp();
    const link = screen.getByRole('link', { name: 'Voltar ao topo' });
    expect(link).toHaveAttribute('href', '#topo');
  });
});

describe('bloco F — nome gigante no hero', () => {
  it('desligado por padrão; ligado, o h1 continua sendo texto real', async () => {
    definirMidia({ reduzido: true });
    const { unmount } = await renderApp();
    expect(document.querySelector('#topo')).not.toHaveAttribute('data-gigante');
    unmount();

    await renderApp(configCom((c) => (c.hero.nomeGigante = true)));
    expect(document.querySelector('#topo')).toHaveAttribute('data-gigante');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(siteConfigAlt.negocio.nome);
  });

  it('o painel de apresentação alterna o nome gigante', async () => {
    definirMidia({ reduzido: true });
    window.history.pushState({}, '', '/?apresentar=1');
    await renderApp();
    const botao = await screen.findByRole('button', { name: 'Gigante' });
    fireEvent.click(botao);
    expect(document.querySelector('#topo')).toHaveAttribute('data-gigante');
    fireEvent.click(screen.getByRole('button', { name: 'Centralizado' }));
    expect(document.querySelector('#topo')).not.toHaveAttribute('data-gigante');
  });
});
