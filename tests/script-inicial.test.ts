import { describe, expect, it, vi } from 'vitest';
import { gerarScriptInicial } from '../build/script-inicial.ts';
import { deveRodarIntro } from '../src/lib/introDecisao.ts';
import { definirMidia } from './helpers/midia.ts';

const cores = { 'camara-escura': '#0e0c0a', 'luz-natural': '#f6f1e9' } as const;

function executar(opcoes: Partial<Parameters<typeof gerarScriptInicial>[0]> = {}) {
  const meta = document.createElement('meta');
  meta.name = 'theme-color';
  meta.content = '#000000';
  document.head.appendChild(meta);
  const script = gerarScriptInicial({
    temaPadrao: 'camara-escura',
    temas: ['camara-escura', 'luz-natural'],
    introAtiva: true,
    umaVezPorSessao: true,
    corNavegador: cores,
    chaveIntroVista: 'intro-vista',
    ...opcoes,
  });
  new Function(script)();
  const resultado = {
    tema: document.documentElement.getAttribute('data-theme'),
    intro: document.documentElement.getAttribute('data-intro'),
    corNavegador: meta.getAttribute('content'),
  };
  meta.remove();
  return resultado;
}

describe('script inline do <head>', () => {
  it('padrão: tema do config e intro ligada', () => {
    expect(executar()).toEqual({ tema: 'camara-escura', intro: 'on', corNavegador: '#0e0c0a' });
  });

  it('?tema= escolhe o tema e acerta o theme-color', () => {
    window.history.pushState({}, '', '/?tema=luz-natural');
    expect(executar()).toEqual({ tema: 'luz-natural', intro: 'on', corNavegador: '#f6f1e9' });
  });

  it('tema inválido na URL cai no padrão', () => {
    window.history.pushState({}, '', '/?tema=neon');
    expect(executar().tema).toBe('camara-escura');
  });

  it('movimento reduzido: sem intro', () => {
    definirMidia({ reduzido: true });
    expect(executar().intro).toBe('done');
  });

  it('já vista nesta sessão: sem intro; ?intro=1 força', () => {
    window.sessionStorage.setItem('intro-vista', '1');
    expect(executar().intro).toBe('done');
    window.history.pushState({}, '', '/?intro=1');
    expect(executar().intro).toBe('on');
  });

  it('sessionStorage bloqueado não quebra: a intro roda', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });
    expect(executar().intro).toBe('on');
  });

  it('intro desligada no config: sem intro', () => {
    expect(executar({ introAtiva: false }).intro).toBe('done');
  });
});

describe('a regra do script e a do React são a mesma', () => {
  const cenarios = [
    { reduzido: false, vista: false, forcar: false },
    { reduzido: false, vista: true, forcar: false },
    { reduzido: false, vista: true, forcar: true },
    { reduzido: true, vista: false, forcar: false },
    { reduzido: true, vista: true, forcar: true },
  ];
  for (const c of cenarios) {
    it(`reduzido=${c.reduzido} vista=${c.vista} forcar=${c.forcar}`, () => {
      definirMidia({ reduzido: c.reduzido });
      if (c.vista) window.sessionStorage.setItem('intro-vista', '1');
      window.history.pushState({}, '', c.forcar ? '/?intro=1' : '/');
      const doScript = executar().intro === 'on';
      const doReact = deveRodarIntro({
        ativo: true,
        umaVezPorSessao: true,
        forcar: c.forcar,
        reduzirMovimento: c.reduzido,
        jaVista: c.vista,
      });
      expect(doScript).toBe(doReact);
    });
  }
});
