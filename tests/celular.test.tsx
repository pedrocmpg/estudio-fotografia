import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { siteConfigAlt } from '../src/config/site.config.alt.ts';
import { lerArquivo } from './helpers/arquivos.ts';
import { definirMidia } from './helpers/midia.ts';
import { renderApp } from './helpers/render.tsx';

const palavras = siteConfigAlt.manifesto.palavras;

function arquivosDeSrc(dir: string, achados: string[] = []): string[] {
  for (const nome of readdirSync(dir)) {
    const caminho = path.join(dir, nome);
    if (statSync(caminho).isDirectory()) arquivosDeSrc(caminho, achados);
    else if (/\.(tsx?|css)$/.test(nome)) achados.push(caminho);
  }
  return achados;
}

describe('ajuste do celular', () => {
  it('manifesto no celular: sem pin, palavras empilhadas, citação e só 2 fotos', async () => {
    definirMidia({ estreito: true });
    await renderApp();
    const secao = document.querySelector('#manifesto') as HTMLElement;
    expect(secao).toHaveAttribute('data-modo', 'compacto');
    const palco = secao.querySelector('[data-palco]') as HTMLElement;
    for (const p of palavras) expect(within(palco).getByText(p)).toBeInTheDocument();
    // sem pin: o progresso da rolagem (--p) nem é calculado
    expect((palco.parentElement as HTMLElement).style.getPropertyValue('--p')).toBe('');
    expect(within(secao).getByText(siteConfigAlt.manifesto.citacao)).toBeInTheDocument();
    const fotos = within(secao).getByRole('list', { name: 'Fotos do manifesto' });
    expect(within(fotos).getAllByRole('img')).toHaveLength(2);
    // a frase completa continua como texto único para leitor de tela
    expect(within(secao).getByRole('heading', { level: 2, name: palavras.join(' ') })).toHaveClass(
      'sr-only',
    );
  });

  it('manifesto com ponteiro de toque também usa a versão compacta', async () => {
    definirMidia({ ponteiroGrosso: true });
    await renderApp();
    expect(document.querySelector('#manifesto')).toHaveAttribute('data-modo', 'compacto');
  });

  it('movimento reduzido no celular: estático', async () => {
    definirMidia({ estreito: true, reduzido: true });
    await renderApp();
    expect(document.querySelector('#manifesto')).toHaveAttribute('data-modo', 'estatico');
  });

  it('desktop mantém o palco com pin, de no máximo 200svh, com palavras sobrepostas', async () => {
    definirMidia({ largo: true });
    await renderApp();
    expect(document.querySelector('#manifesto')).toHaveAttribute('data-modo', 'pin');
    const css = lerArquivo('src/sections/Manifesto/Manifesto.module.css');
    const pista = /\.pista \{[^}]*height: (\d+)svh/.exec(css);
    expect(Number(pista?.[1])).toBeLessThanOrEqual(200);
    // 2h + 1,7t = 1 → a seguinte entra com a anterior a 70% da saída (~30% de sobreposição)
    const h = Number(/--h: ([\d.]+)/.exec(css)?.[1]);
    const t = Number(/--t: ([\d.]+)/.exec(css)?.[1]);
    expect(2 * h + 1.7 * t).toBeCloseTo(1, 1);
  });

  it('nenhuma pista com pin passa de 150svh no celular (roda)', () => {
    const roda = lerArquivo('src/sections/Trabalhos/Roda.module.css');
    expect(roda).toContain('height: calc(80svh + min(var(--n) * 18svh, 50svh));');
    expect(lerArquivo('src/sections/Trabalhos/Trabalhos.module.css')).toContain('height: 130svh');
  });

  it('espaço entre seções no celular: clamp(3.5rem, 10vh, 5rem)', () => {
    const css = lerArquivo('src/styles/tokens.css');
    expect(css).toMatch(
      /@media \(max-width: 767px\), \(pointer: coarse\) \{\s*:root \{\s*--espaco-secao: clamp\(3\.5rem, 10vh, 5rem\);/,
    );
  });

  it('a troca de layout é por largura e ponteiro, nunca por aparelho/user-agent', () => {
    for (const arquivo of arquivosDeSrc('src')) {
      expect(readFileSync(arquivo, 'utf8'), arquivo).not.toMatch(
        /userAgent|navigator\.platform|userAgentData/,
      );
    }
  });
});
