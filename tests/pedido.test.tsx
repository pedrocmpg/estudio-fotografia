import { fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { siteConfigAlt } from '../src/config/site.config.alt.ts';
import { formatarData, gruposDeTipos, textoDoTipo } from '../src/lib/pedido.ts';
import { definirMidia } from './helpers/midia.ts';
import { configCom, renderApp } from './helpers/render.tsx';

function espiarWhatsapp() {
  return vi.spyOn(window, 'open').mockReturnValue(null);
}

function textoAberto(abrir: ReturnType<typeof espiarWhatsapp>): string {
  const url = String(abrir.mock.calls[0]![0]);
  return decodeURIComponent(url.split('?text=')[1] ?? '');
}

function formulario(): HTMLElement {
  return document.querySelector('#pedido form') as HTMLElement;
}

afterEach(() => vi.restoreAllMocks());

describe('opções do formulário', () => {
  it('nascem de sessões e presentes, em dois grupos', () => {
    const grupos = gruposDeTipos(siteConfigAlt);
    expect(grupos.map((g) => g.grupo)).toEqual(['Sessão', 'Presente']);
    expect(grupos[0]!.opcoes.map((o) => o.valor)).toEqual([
      'sessao:alfa',
      'sessao:beta',
      'sessao:gama',
    ]);
    expect(textoDoTipo(siteConfigAlt, 'presente:item-dois')).toBe('Presente: Produto Dois');
    expect(textoDoTipo(siteConfigAlt, '')).toBeUndefined();
  });

  it('formata a data em pt-BR', () => {
    expect(formatarData('2026-12-05')).toBe('05/12/2026');
    expect(formatarData('fim de semana')).toBe('fim de semana');
  });
});

describe('formulário → WhatsApp', () => {
  it('manda a mensagem completa (acento, & e quebra de linha) para o WhatsApp do estúdio', async () => {
    definirMidia({ reduzido: true });
    const abrir = espiarWhatsapp();
    await renderApp();
    const user = userEvent.setup();
    const form = formulario();
    await user.type(within(form).getByLabelText(/Seu nome/), 'Maria & José');
    await user.selectOptions(within(form).getByLabelText(/O que você quer/), 'sessao:beta');
    fireEvent.change(within(form).getByLabelText(/Data que pensou/), {
      target: { value: '2026-12-05' },
    });
    await user.type(within(form).getByLabelText(/Cidade ou local/), 'Praça Central');
    await user.type(within(form).getByLabelText(/Mensagem/), 'Linha 1{enter}Linha 2 — ação');
    await user.click(within(form).getByRole('button', { name: /Enviar pelo WhatsApp/ }));

    expect(abrir).toHaveBeenCalledTimes(1);
    const [url, alvo] = abrir.mock.calls[0]!;
    expect(String(url).startsWith('https://wa.me/5500900000000?text=')).toBe(true);
    expect(alvo).toBe('_blank');
    expect(textoAberto(abrir)).toBe(
      [
        'Olá, Exemplo! Me chamo Maria & José.',
        'Tenho interesse em: Sessão: Sessão Beta.',
        'Data que eu pensei: 05/12/2026.',
        'Local: Praça Central.',
        'Linha 1\nLinha 2 — ação',
      ].join('\n'),
    );
  });

  it('sem os campos opcionais, omite as linhas vazias', async () => {
    definirMidia({ reduzido: true });
    const abrir = espiarWhatsapp();
    await renderApp();
    const user = userEvent.setup();
    const form = formulario();
    await user.type(within(form).getByLabelText(/Seu nome/), 'Ana');
    await user.click(within(form).getByRole('button', { name: /Enviar pelo WhatsApp/ }));
    expect(textoAberto(abrir)).toBe('Olá, Exemplo! Me chamo Ana.');
  });

  it('pedido de presente vai para o número da loja quando ela tem um', async () => {
    definirMidia({ reduzido: true });
    const abrir = espiarWhatsapp();
    await renderApp(
      configCom((c) => {
        c.negocio.locais![1]!.whatsapp = '5500911111111';
      }),
    );
    const user = userEvent.setup();
    const form = formulario();
    await user.type(within(form).getByLabelText(/Seu nome/), 'Ana');
    await user.selectOptions(within(form).getByLabelText(/O que você quer/), 'presente:item-um');
    await user.click(within(form).getByRole('button', { name: /Enviar pelo WhatsApp/ }));
    expect(String(abrir.mock.calls[0]![0]).startsWith('https://wa.me/5500911111111?')).toBe(true);
    expect(textoAberto(abrir)).toContain('Tenho interesse em: Presente: Produto Um.');
  });

  it('sem nome não envia: mostra o erro em texto e leva o foco ao campo', async () => {
    definirMidia({ reduzido: true });
    const abrir = espiarWhatsapp();
    await renderApp();
    const user = userEvent.setup();
    const form = formulario();
    await user.click(within(form).getByRole('button', { name: /Enviar pelo WhatsApp/ }));
    expect(abrir).not.toHaveBeenCalled();
    const campo = within(form).getByLabelText(/Seu nome/);
    expect(within(form).getByRole('alert')).toHaveTextContent('Escreva seu nome');
    expect(campo).toHaveAttribute('aria-invalid', 'true');
    expect(campo).toHaveFocus();
  });

  it('tem o texto de privacidade e o botão faz o clique de obturador', async () => {
    definirMidia({ reduzido: true });
    espiarWhatsapp();
    await renderApp();
    expect(
      screen.getByText(
        'Seus dados vão direto para a conversa no WhatsApp. Não guardamos nada aqui.',
      ),
    ).toBeInTheDocument();
    const user = userEvent.setup();
    const form = formulario();
    await user.type(within(form).getByLabelText(/Seu nome/), 'Ana');
    const botao = within(form).getByRole('button', { name: /Enviar pelo WhatsApp/ });
    await user.click(botao);
    expect(botao).toHaveAttribute('data-obturador');
  });

  it('clicar em "Pedir essa sessão" pré-seleciona o tipo no formulário', async () => {
    definirMidia({ reduzido: true });
    await renderApp();
    const user = userEvent.setup();
    const card = document.querySelectorAll('#sessoes article')[2] as HTMLElement;
    await user.click(within(card).getByRole('link', { name: /Pedir essa sessão/ }));
    const select = screen.getByLabelText(/O que você quer/) as HTMLSelectElement;
    expect(select.value).toBe('sessao:gama');
  });

  it('o botão flutuante do WhatsApp se esconde enquanto o formulário está na tela', async () => {
    definirMidia({ reduzido: true });
    await renderApp();
    expect(document.querySelector('#pedido')).toHaveAttribute('data-oculta-whatsapp');
  });
});
