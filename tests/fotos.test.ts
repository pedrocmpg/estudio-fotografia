import { describe, expect, it } from 'vitest';
import { formatarExposicao } from '../scripts/exposicao.ts';
import { todasAsFotos } from '../src/data/fotos.ts';
import { lerArquivo } from './helpers/arquivos.ts';
import type { FotoMeta } from '../src/data/fotos.types.ts';

describe('dados técnicos de exposição', () => {
  it('formata abertura, velocidade, ISO e focal', () => {
    expect(
      formatarExposicao({
        FNumber: 1.8,
        ExposureTime: 1 / 250,
        ISOSpeedRatings: 200,
        FocalLength: 35,
      }),
    ).toEqual({ abertura: 'f/1.8', velocidade: '1/250', iso: 200, focal: '35 mm' });
  });

  it('abertura inteira e velocidade longa', () => {
    expect(formatarExposicao({ FNumber: 2, ExposureTime: 2 })).toEqual({
      abertura: 'f/2',
      velocidade: '2 s',
    });
  });

  it('aceita ISO como lista e como PhotographicSensitivity', () => {
    expect(formatarExposicao({ ISOSpeedRatings: [400, 800] })?.iso).toBe(400);
    expect(formatarExposicao({ PhotographicSensitivity: 100 })?.iso).toBe(100);
  });

  it('sem dado nenhum, não inventa nada', () => {
    expect(formatarExposicao({})).toBeUndefined();
  });

  it('ignora GPS, data, câmera e serial (a função nem lê esses campos)', () => {
    const exposicao = formatarExposicao({
      FNumber: 2.8,
      // @ts-expect-error — campos que nunca devem passar
      GPSLatitude: [1, 2, 3],
      SerialNumber: 'ABC123',
      DateTimeOriginal: new Date(),
    });
    expect(JSON.stringify(exposicao)).not.toMatch(/GPS|Serial|ABC123|Date/);
  });
});

describe('manifest de fotos', () => {
  const manifesto = todasAsFotos();
  const meta = JSON.parse(lerArquivo('src/data/fotos.meta.json')) as FotoMeta[];

  it('toda foto do meta está no manifest, com alt', () => {
    expect(manifesto.map((f) => f.id).sort()).toEqual(meta.map((m) => m.id).sort());
    for (const f of manifesto) expect(f.alt.trim().length).toBeGreaterThan(0);
  });

  it('cada entrada traz dimensões reais, srcset nos 3 formatos e placeholder', () => {
    for (const f of manifesto) {
      expect(f.largura).toBeGreaterThan(0);
      expect(f.altura).toBeGreaterThan(0);
      expect(f.proporcao).toBeCloseTo(f.largura / f.altura, 2);
      expect(f.srcset.avif).toMatch(/\.avif \d+w/);
      expect(f.srcset.webp).toMatch(/\.webp \d+w/);
      expect(f.srcset.jpg).toMatch(/\.jpg \d+w/);
      expect(f.placeholder.startsWith('data:image/')).toBe(true);
      expect(f.cor).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it('nunca amplia além do original', () => {
    for (const f of manifesto) {
      const larguras = f.srcset.jpg
        .split(',')
        .map((p) => Number(p.trim().split(' ')[1]!.replace('w', '')));
      expect(Math.max(...larguras)).toBeLessThanOrEqual(f.largura);
    }
  });
});
