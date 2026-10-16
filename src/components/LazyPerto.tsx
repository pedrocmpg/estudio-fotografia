import { Suspense, useRef, type ReactNode } from 'react';
import { useInView } from '../motion/hooks.ts';

interface Props {
  /** Ocupa o lugar do componente (mesma altura, para o layout não pular). */
  fallback: ReactNode;
  children: ReactNode;
  margem?: string;
}

/** Só monta os filhos (e, portanto, baixa o chunk lazy) quando chegam perto da tela. */
export function LazyPerto({ fallback, children, margem = '600px 0px' }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const perto = useInView(ref, { uma: true, margem });
  return (
    <div ref={ref}>{perto ? <Suspense fallback={fallback}>{children}</Suspense> : fallback}</div>
  );
}
