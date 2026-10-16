import { useSiteConfig } from '../apresentacao/previa.tsx';
import { INFO_SECOES, numeroDaSecao } from '../config/secoes.ts';
import type { SecaoId } from '../config/types.ts';
import css from './RotuloSecao.module.css';

/** Rótulo mono acima do H2: "02 — TRABALHOS". */
export function RotuloSecao({ secao }: { secao: SecaoId }) {
  const config = useSiteConfig();
  const info = INFO_SECOES[secao];
  if (!info) return null;
  return (
    <p className={`rotulo ${css.rotulo}`}>
      {numeroDaSecao(config, secao)} — {info.rotulo}
    </p>
  );
}
