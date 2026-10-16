import { m } from 'motion/react';
import type { ReactNode } from 'react';
import { easingArray, tempo } from '../motion/tokens.ts';

interface Props {
  children: ReactNode;
  /** Posição na cascata (0 a 5): 60 ms entre itens, no máximo 6. */
  indice?: number;
  className?: string;
}

/**
 * Reveal padrão (SPEC §8): opacity 0→1 + translateY 16→0, 300 ms, uma vez só.
 * O MotionConfig do App (reducedMotion="user") tira o deslocamento de quem pediu menos movimento.
 */
export function Reveal({ children, indice = 0, className }: Props) {
  const atraso = Math.min(Math.max(indice, 0), 5) * 0.06;
  return (
    <m.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: tempo.base / 1000, delay: atraso, ease: easingArray.saida }}
    >
      {children}
    </m.div>
  );
}
