import { lerArquivo } from './helpers/arquivos.ts';
import { describe, expect, it } from 'vitest';
import { checarContraste, lerTokensDosTemas } from '../build/tokens.ts';
import { contraste, corSobre, garantirContraste } from '../src/lib/cor.ts';

const css = lerArquivo('src/styles/temas.css');
const temas = lerTokensDosTemas(css);

describe('contraste dos temas (≥ 4,5:1)', () => {
  for (const [id, tokens] of Object.entries(temas)) {
    it(`pares de tokens do tema ${id}`, () => {
      for (const r of checarContraste(tokens)) {
        expect(r.ok, `${id}: ${r.par} = ${r.razao.toFixed(2)}`).toBe(true);
      }
    });
  }

  it('terracota puro reprova como texto pequeno; o accent-texto resolve', () => {
    const claro = temas['luz-natural'];
    expect(contraste(claro['--accent']!, claro['--bg']!)).toBeLessThan(4.5);
    expect(contraste(claro['--accent-texto']!, claro['--bg']!)).toBeGreaterThanOrEqual(4.5);
  });
});

describe('cores de destaque do estúdio', () => {
  it('garantirContraste devolve uma cor que passa nos dois fundos', () => {
    for (const cor of ['#E0A458', '#B5532D', '#7FA38A', '#8FA9C9', '#C8553D']) {
      for (const fundo of [temas['camara-escura']['--bg']!, temas['luz-natural']['--bg']!]) {
        expect(contraste(garantirContraste(cor, fundo), fundo)).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it('não mexe em cor que já passa', () => {
    expect(garantirContraste('#E0A458', '#0E0C0A')).toBe('#E0A458');
  });

  it('corSobre escolhe o texto mais legível sobre o botão', () => {
    expect(corSobre('#E0A458')).toBe('#0E0C0A');
    expect(corSobre('#26201B')).toBe('#FFFFFF');
  });
});
