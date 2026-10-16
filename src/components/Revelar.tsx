import { useRef, type ReactNode } from 'react';
import { useInView } from '../motion/hooks.ts';
import css from './Revelar.module.css';

interface Props {
  children: ReactNode;
  className?: string;
}

/**
 * Foto que entra com clip-path inset(8%) → inset(0) e scale 1,1 → 1 (~900 ms), uma vez só.
 * O filho direto é quem faz o zoom; use um único elemento (ex.: <Foto/>).
 */
export function Revelar({ children, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const entrou = useInView(ref, { uma: true, limiar: 0.12 });
  return (
    <div
      ref={ref}
      className={`${css.revelar} ${className ?? ''}`}
      data-entrou={entrou || undefined}
    >
      {children}
    </div>
  );
}
