import { lerArquivo } from './helpers/arquivos.ts';
import { describe, expect, it } from 'vitest';
import { easing, tempo } from '../src/motion/tokens.ts';

const css = lerArquivo('src/styles/tokens.css');
const lerVar = (nome: string) => css.match(new RegExp(`${nome}:\\s*([^;]+);`))?.[1]?.trim();

describe('tokens de movimento', () => {
  it('TS e CSS dizem a mesma coisa', () => {
    expect(lerVar('--t-rapido')).toBe(`${tempo.rapido}ms`);
    expect(lerVar('--t-base')).toBe(`${tempo.base}ms`);
    expect(lerVar('--t-lento')).toBe(`${tempo.lento}ms`);
    expect(lerVar('--t-etapa-cortina')).toBe(`${tempo.etapaCortina}ms`);
    expect(lerVar('--ease-saida')).toBe(easing.saida);
    expect(lerVar('--ease-entrada-saida')).toBe(easing.entradaSaida);
  });
});
