import { useEffect, useRef } from 'react';
import css from './CursorVisor.module.css';

/** Elementos com este atributo (fotos que abrem a lightbox) transformam o cursor em `[ ] VER`. */
export const ATRIBUTO_VISOR = 'data-visor';

/**
 * Cursor visor (SPEC §10.16): um círculo que segue o mouse e, sobre foto clicável, vira um visor
 * `[ ]` com "VER". Só existe com mouse (`hover: hover` e `pointer: fine`) e sem movimento reduzido
 * (quem monta decide). Não esconde o cursor do sistema; é decorativo (`aria-hidden`).
 * Segue por `transform` num `requestAnimationFrame`, sem ler layout.
 */
export default function CursorVisor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let x = 0;
    let y = 0;
    let raf = 0;

    const desenhar = () => {
      raf = 0;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };
    const aoMover = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      x = e.clientX;
      y = e.clientY;
      const alvo = (e.target as Element | null)?.closest?.(`[${ATRIBUTO_VISOR}]`);
      el.toggleAttribute('data-visor', Boolean(alvo));
      el.toggleAttribute('data-visivel', true);
      if (!raf) raf = requestAnimationFrame(desenhar);
    };
    const aoSair = () => el.removeAttribute('data-visivel');

    document.addEventListener('pointermove', aoMover, { passive: true });
    document.documentElement.addEventListener('pointerleave', aoSair);
    return () => {
      document.removeEventListener('pointermove', aoMover);
      document.documentElement.removeEventListener('pointerleave', aoSair);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} className={css.cursor} aria-hidden="true">
      <span className={css.forma}>
        <span className={css.rotulo}>Ver</span>
      </span>
    </div>
  );
}
