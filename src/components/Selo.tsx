import css from './Selo.module.css';

/** Selo discreto de honestidade: ninguém deve achar que as fotos da prévia são do estúdio. */
export function Selo({ className }: { className?: string }) {
  return <span className={`${css.selo} ${className ?? ''}`}>Prévia · fotos ilustrativas</span>;
}
