import manifesto from './fotos.manifest.json';
import type { FotoManifesto } from './fotos.types.ts';

const porId = new Map((manifesto as FotoManifesto[]).map((f) => [f.id, f]));

export function obterFoto(id: string): FotoManifesto | undefined {
  return porId.get(id);
}

export function todasAsFotos(): FotoManifesto[] {
  return manifesto as FotoManifesto[];
}
