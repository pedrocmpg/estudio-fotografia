import { describe, expect, it } from 'vitest';
import { siteConfigAlt } from '../src/config/site.config.alt.ts';
import { montarMensagem, urlWhatsapp } from '../src/lib/pedido.ts';

const modelo = siteConfigAlt.pedido.modeloMensagem;

describe('mensagem do WhatsApp', () => {
  it('monta com todos os campos', () => {
    const texto = montarMensagem(modelo, {
      nomeCurto: 'Exemplo',
      nome: 'Maria',
      tipo: 'Sessão Alfa',
      data: '12/12/2026',
      local: 'Praça Central',
      mensagem: 'Queria fotos ao pôr do sol.',
    });
    expect(texto).toBe(
      [
        'Olá, Exemplo! Me chamo Maria.',
        'Tenho interesse em: Sessão Alfa.',
        'Data que eu pensei: 12/12/2026.',
        'Local: Praça Central.',
        'Queria fotos ao pôr do sol.',
      ].join('\n'),
    );
  });

  it('omite as linhas dos campos opcionais vazios', () => {
    const texto = montarMensagem(modelo, {
      nomeCurto: 'Exemplo',
      nome: 'Maria',
      tipo: 'Sessão Alfa',
    });
    expect(texto).toBe('Olá, Exemplo! Me chamo Maria.\nTenho interesse em: Sessão Alfa.');
  });

  it('mantém a saudação quando só o nome falta (pedido sem formulário)', () => {
    const texto = montarMensagem(modelo, { nomeCurto: 'Exemplo', tipo: 'Sessão Beta' });
    expect(texto).toBe('Olá, Exemplo!\nTenho interesse em: Sessão Beta.');
  });

  it('trata campos só com espaços como vazios', () => {
    const texto = montarMensagem(modelo, {
      nomeCurto: 'Exemplo',
      nome: 'Ana',
      local: '   ',
      mensagem: '\n',
    });
    expect(texto).toBe('Olá, Exemplo! Me chamo Ana.');
  });

  it('preserva acentos, & e quebras de linha na mensagem livre e codifica a URL', () => {
    const livre = 'Fotos de casal & família.\nSegunda linha: café, ação, coração!';
    const texto = montarMensagem(modelo, { nomeCurto: 'Exemplo', nome: 'José', mensagem: livre });
    expect(texto).toContain(livre);

    const url = urlWhatsapp('5500900000000', texto);
    expect(url.startsWith('https://wa.me/5500900000000?text=')).toBe(true);
    expect(url).toContain('%26'); // &
    expect(url).toContain('%0A'); // quebra de linha
    expect(url).toContain('Jos%C3%A9');
    expect(decodeURIComponent(url.split('?text=')[1]!)).toBe(texto);
  });

  it('sem texto, a URL é só o número', () => {
    expect(urlWhatsapp('5500900000000')).toBe('https://wa.me/5500900000000');
  });
});
