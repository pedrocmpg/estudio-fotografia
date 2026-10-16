import type { Exposicao } from '../src/data/fotos.types.ts';

export function formatarExposicao(foto: {
  FNumber?: number;
  ExposureTime?: number;
  ISOSpeedRatings?: number | number[];
  PhotographicSensitivity?: number;
  FocalLength?: number;
}): Exposicao | undefined {
  const e: Exposicao = {};
  if (typeof foto.FNumber === 'number' && foto.FNumber > 0) {
    e.abertura = `f/${String(Number(foto.FNumber.toFixed(1)))}`;
  }
  if (typeof foto.ExposureTime === 'number' && foto.ExposureTime > 0) {
    const t = foto.ExposureTime;
    e.velocidade = t < 1 ? `1/${Math.round(1 / t)}` : `${Number(t.toFixed(1))} s`;
  }
  const iso = Array.isArray(foto.ISOSpeedRatings) ? foto.ISOSpeedRatings[0] : foto.ISOSpeedRatings;
  const isoFinal = iso ?? foto.PhotographicSensitivity;
  if (typeof isoFinal === 'number' && isoFinal > 0) e.iso = isoFinal;
  if (typeof foto.FocalLength === 'number' && foto.FocalLength > 0) {
    e.focal = `${Math.round(foto.FocalLength)} mm`;
  }
  return Object.keys(e).length ? e : undefined;
}
