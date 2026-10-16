import { useCallback, useState, type CSSProperties } from 'react';
import { obterFoto } from '../data/fotos.ts';
import { MEDIA_MOBILE } from '../lib/constantes.ts';
import css from './Foto.module.css';

interface Props {
  id: string;
  /** Foto vertical para telas estreitas (arte dirigida). */
  idMobile?: string;
  sizes: string;
  /** Primeira dobra: carrega já, com prioridade alta. */
  prioridade?: boolean;
  /** Carrega já, sem prioridade alta (ex.: foto escondida atrás de outra que logo se abre). */
  eager?: boolean;
  /** Texto alternativo; use "" quando a foto for só decoração. Padrão: o alt do manifest. */
  alt?: string;
  /** `preencher` cobre o container; `natural` mantém a proporção da foto. */
  modo?: 'preencher' | 'natural';
  className?: string;
  onCarregada?: () => void;
}

type EstiloFoto = CSSProperties & { '--cor': string; '--ph': string };

export function Foto({
  id,
  idMobile,
  sizes,
  prioridade = false,
  eager = false,
  alt,
  modo = 'preencher',
  className,
  onCarregada,
}: Props) {
  const foto = obterFoto(id);
  const mobile = idMobile ? obterFoto(idMobile) : undefined;
  const [pronta, setPronta] = useState(false);

  const marcar = useCallback(() => {
    setPronta(true);
    onCarregada?.();
  }, [onCarregada]);

  // Imagem que já veio do cache chega "completa" antes do onLoad existir.
  const aoMontar = useCallback(
    (img: HTMLImageElement | null) => {
      if (img && img.complete && img.naturalWidth > 0) marcar();
    },
    [marcar],
  );

  if (!foto) {
    if (import.meta.env.DEV) console.warn(`Foto "${id}" não existe no manifest.`);
    return <span className={`${css.foto} ${className ?? ''}`} data-ausente />;
  }

  const estilo: EstiloFoto = {
    '--cor': foto.cor,
    '--ph': `url("${foto.placeholder}")`,
  };
  const foco = `${foto.foco.x * 100}% ${foto.foco.y * 100}%`;
  // Em minúsculas para o React 18 repassar sem reclamar; o navegador entende igual.
  const prioridadeAttr = prioridade ? { fetchpriority: 'high' } : {};

  return (
    <span
      className={`${css.foto} ${className ?? ''}`}
      data-modo={modo}
      data-pronta={pronta || undefined}
      style={{ ...estilo, ...(modo === 'natural' ? { aspectRatio: `${foto.proporcao}` } : null) }}
    >
      <picture>
        {mobile &&
          (['avif', 'webp'] as const).map((fmt) => (
            <source
              key={`m-${fmt}`}
              media={MEDIA_MOBILE}
              type={`image/${fmt}`}
              srcSet={mobile.srcset[fmt]}
              sizes={sizes}
            />
          ))}
        {mobile && (
          <source media={MEDIA_MOBILE} type="image/jpeg" srcSet={mobile.srcset.jpg} sizes={sizes} />
        )}
        <source type="image/avif" srcSet={foto.srcset.avif} sizes={sizes} />
        <source type="image/webp" srcSet={foto.srcset.webp} sizes={sizes} />
        <img
          ref={aoMontar}
          src={foto.src}
          srcSet={foto.srcset.jpg}
          sizes={sizes}
          width={foto.largura}
          height={foto.altura}
          alt={alt ?? foto.alt}
          loading={prioridade || eager ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={marcar}
          style={{ objectPosition: foco }}
          {...prioridadeAttr}
        />
      </picture>
    </span>
  );
}
