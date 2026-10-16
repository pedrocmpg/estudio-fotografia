import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { IconeSeta } from './icones.tsx';
import css from './Botao.module.css';

export type VarianteBotao = 'primario' | 'secundario';

interface Props extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variante?: VarianteBotao;
  seta?: boolean;
  children: ReactNode;
}

/** Botão-link. Todo CTA do site é um link (âncora ou WhatsApp), então não há <button> aqui. */
export function Botao({
  variante = 'primario',
  seta = true,
  className,
  children,
  ...resto
}: Props) {
  return (
    <a className={`${css.botao} ${css[variante]} ${className ?? ''}`} {...resto}>
      <span>{children}</span>
      {seta && <IconeSeta className={css.seta} />}
    </a>
  );
}
