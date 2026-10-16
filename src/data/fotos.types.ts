/** Entrada do pipeline (src/data/fotos.meta.json). */
export interface FotoMeta {
  id: string;
  /** Nome do arquivo em fotos-originais/. Sem ele, a foto vira um placeholder. */
  arquivo?: string;
  alt: string;
  categoria: string;
  /** Ponto de interesse (0–1) usado no object-position. */
  foco: { x: number; y: number };
  credito?: string;
  licenca?: string;
  ilustrativa?: boolean;
  /** Só para placeholders: formato do retângulo gerado. */
  orientacao?: 'horizontal' | 'vertical' | 'quadrada';
}

export interface Exposicao {
  abertura?: string; // "f/1.8"
  velocidade?: string; // "1/250"
  iso?: number;
  focal?: string; // "35 mm"
}

/** Saída do pipeline (src/data/fotos.manifest.json). */
export interface FotoManifesto {
  id: string;
  largura: number;
  altura: number;
  proporcao: number;
  /** URL do JPEG intermediário (fallback de <img>). */
  src: string;
  srcset: { avif: string; webp: string; jpg: string };
  /** Miniatura de 16 px em data URI. */
  placeholder: string;
  /** Cor dominante em hex. */
  cor: string;
  foco: { x: number; y: number };
  alt: string;
  exposicao?: Exposicao;
  /** true quando a imagem é um retângulo gerado, não uma foto. */
  placeholderGerado: boolean;
  /** Hash do arquivo de origem (cache do pipeline). */
  hash: string;
}

export type FotoManifest = FotoManifesto[];
