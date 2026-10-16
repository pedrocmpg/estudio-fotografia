import { useEffect, useRef, type CSSProperties, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { CtaBotao } from '../../components/CtaBotao.tsx';
import type { Cta } from '../../config/types.ts';
import css from './MenuCelular.module.css';

interface Props {
  nome: string;
  links: { ancora: string; rotulo: string }[];
  cta: Cta;
  aoFechar: () => void;
}

const FOCAVEIS = 'a[href], button:not([disabled])';

/**
 * Menu do celular (SPEC §10.1): tela cheia, links grandes na fonte de título entrando em cascata de
 * 40 ms, foco preso dentro, `Esc` fecha, a rolagem da página fica travada e o foco volta ao botão que
 * abriu. Vai para o `<body>` (portal) porque o header tem `backdrop-filter`, que prenderia um
 * `position: fixed` dentro dele.
 */
export function MenuCelular({ nome, links, cta, aoFechar }: Props) {
  const caixa = useRef<HTMLDivElement>(null);
  const fechar = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const origem = document.activeElement as HTMLElement | null;
    const raiz = document.documentElement;
    const antes = raiz.style.overflow;
    raiz.style.overflow = 'hidden';
    fechar.current?.focus();
    return () => {
      raiz.style.overflow = antes;
      origem?.focus?.({ preventScroll: true });
    };
  }, []);

  const aoTeclar = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      aoFechar();
      return;
    }
    if (e.key !== 'Tab') return;
    const alvos = Array.from(caixa.current?.querySelectorAll<HTMLElement>(FOCAVEIS) ?? []);
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
  };

  return createPortal(
    <div
      ref={caixa}
      id="menu-celular"
      className={css.menu}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      onKeyDown={aoTeclar}
    >
      <div className={css.topo}>
        <span className={css.marca}>{nome}</span>
        <button ref={fechar} type="button" className={css.fechar} onClick={aoFechar}>
          Fechar
        </button>
      </div>

      <nav aria-label="Menu">
        <ul className={css.lista}>
          {links.map((l, i) => (
            <li key={l.ancora} className={css.item} style={{ '--i': i } as CSSProperties}>
              <a className={css.link} href={`#${l.ancora}`} onClick={aoFechar}>
                {l.rotulo}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div
        className={css.rodape}
        style={{ '--i': links.length } as CSSProperties}
        onClick={aoFechar}
      >
        <CtaBotao cta={cta} />
      </div>
    </div>,
    document.body,
  );
}
