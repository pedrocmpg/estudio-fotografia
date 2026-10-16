import { useCallback, useEffect, useRef, type KeyboardEvent, type PointerEvent } from 'react';
import { obterFoto } from '../data/fotos.ts';
import { Foto } from './Foto.tsx';
import css from './Lightbox.module.css';

interface Props {
  fotos: string[];
  /** Índice aberto; null = fechado. */
  indice: number | null;
  rotulo: string;
  aoFechar: () => void;
  aoMudar: (indice: number) => void;
}

const LIMITE_ARRASTO_PX = 48;

/**
 * Foto em tela cheia (SPEC §7.6c, versão simples). Esc fecha, setas navegam, arrastar no celular,
 * contador em mono, foco preso enquanto aberta e devolvido ao item de origem ao fechar.
 */
export function Lightbox({ fotos, indice, rotulo, aoFechar, aoMudar }: Props) {
  const aberto = indice !== null;
  const caixa = useRef<HTMLDivElement>(null);
  const fechar = useRef<HTMLButtonElement>(null);
  const origem = useRef<HTMLElement | null>(null);
  const arrasto = useRef<{ x: number; id: number } | null>(null);
  const n = fotos.length;

  // Guarda quem abriu, trava a rolagem da página e leva o foco para dentro.
  useEffect(() => {
    if (!aberto) return;
    origem.current = document.activeElement as HTMLElement | null;
    const raiz = document.documentElement;
    const antes = raiz.style.overflow;
    raiz.style.overflow = 'hidden';
    fechar.current?.focus();
    return () => {
      raiz.style.overflow = antes;
      origem.current?.focus?.({ preventScroll: true });
    };
  }, [aberto]);

  const ir = useCallback(
    (passo: number) => {
      if (indice === null) return;
      aoMudar((indice + passo + n) % n);
    },
    [indice, n, aoMudar],
  );

  if (!aberto) return null;
  const id = fotos[indice]!;
  const foto = obterFoto(id);
  const proxima = fotos[(indice + 1) % n]!;

  const aoTeclar = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      aoFechar();
    } else if (e.key === 'ArrowRight') ir(1);
    else if (e.key === 'ArrowLeft') ir(-1);
    else if (e.key === 'Tab') {
      // Foco preso: cicla entre os botões da caixa.
      const alvos = Array.from(caixa.current?.querySelectorAll<HTMLElement>('button') ?? []);
      if (alvos.length === 0) return;
      const primeiro = alvos[0]!;
      const ultimo = alvos[alvos.length - 1]!;
      if (e.shiftKey && document.activeElement === primeiro) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primeiro.focus();
      }
    }
  };

  const aoApertar = (e: PointerEvent<HTMLDivElement>) => {
    arrasto.current = { x: e.clientX, id: e.pointerId };
  };
  const aoSoltar = (e: PointerEvent<HTMLDivElement>) => {
    const a = arrasto.current;
    arrasto.current = null;
    if (!a || a.id !== e.pointerId) return;
    const dx = e.clientX - a.x;
    if (Math.abs(dx) > LIMITE_ARRASTO_PX) ir(dx < 0 ? 1 : -1);
  };

  const contador = `${String(indice + 1).padStart(2, '0')} / ${String(n).padStart(2, '0')}`;

  return (
    <div
      ref={caixa}
      className={css.lightbox}
      role="dialog"
      aria-modal="true"
      aria-label={rotulo}
      onKeyDown={aoTeclar}
    >
      <button ref={fechar} type="button" className={css.fechar} onClick={aoFechar}>
        Fechar
      </button>

      <div
        className={css.palco}
        onPointerDown={aoApertar}
        onPointerUp={aoSoltar}
        onPointerCancel={() => (arrasto.current = null)}
      >
        <div
          key={id}
          className={css.foto}
          style={{ '--prop': foto?.proporcao ?? 1 } as React.CSSProperties}
        >
          <Foto id={id} sizes="100vw" eager />
        </div>
      </div>

      <p className={css.legenda}>{foto?.alt}</p>

      <div className={css.barra}>
        <button
          type="button"
          className={css.seta}
          onClick={() => ir(-1)}
          aria-label="Foto anterior"
        >
          ←
        </button>
        <p className={css.contador} aria-live="polite">
          <span className="sr-only">Foto </span>
          {contador}
        </p>
        <button type="button" className={css.seta} onClick={() => ir(1)} aria-label="Próxima foto">
          →
        </button>
      </div>

      {/* Pré-carrega a próxima foto */}
      <div className={css.precarga} aria-hidden="true">
        <Foto id={proxima} sizes="100vw" eager alt="" />
      </div>
    </div>
  );
}
