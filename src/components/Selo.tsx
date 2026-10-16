import css from './Selo.module.css';

/** Selo discreto de honestidade: ninguém deve achar que as fotos da prévia são do estúdio. */
export function Selo({ flutuante = false }: { flutuante?: boolean }) {
  return (
    <span className={`${css.selo} ${flutuante ? css.flutuante : ''}`}>
      Prévia · fotos ilustrativas
    </span>
  );
}
