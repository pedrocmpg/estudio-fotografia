import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';
import { Foto } from '../../components/Foto.tsx';
import { obterFoto } from '../../data/fotos.ts';
import { suportaPreserve3d } from '../../lib/ambiente.ts';
import { useMediaQuery, useReducedMotion, useRodando } from '../../motion/hooks.ts';
import { useIndiceCentral } from '../../motion/useCentro.ts';
import css from './Roda.module.css';

interface Props {
  fotos: string[];
  segundosPorVolta: number;
  titulo: string;
  /** Chamado ao ativar a foto da frente (Enter/clique). A lightbox entra na Fase 2. */
  aoAbrir?: (indice: number) => void;
}

type Modo = 'roda' | 'carrossel' | 'grade';

const GRAUS_POR_PIXEL = 0.3;
const LIMITE_ARRASTO_PX = 6;

/** Distância angular curta (-180, 180] de `de` até `para`. */
function menorCaminho(de: number, para: number): number {
  return ((((para - de) % 360) + 540) % 360) - 180;
}

function rotulo(id: string): string {
  return obterFoto(id)?.alt ?? '';
}

/**
 * Roda 3D da galeria (SPEC §7.6a). Três apresentações com o mesmo conteúdo:
 *  - roda: anel 3D que gira sozinho, arrasta com inércia e responde às setas;
 *  - carrossel: celular / ponteiro grosso, rolagem horizontal com scroll-snap;
 *  - grade: movimento reduzido ou sem suporte a preserve-3d.
 */
export default function Roda({ fotos, segundosPorVolta, titulo, aoAbrir }: Props) {
  const reduzido = useReducedMotion();
  const ponteiroGrosso = useMediaQuery('(pointer: coarse)');
  const estreito = useMediaQuery('(max-width: 640px)');
  const modo: Modo =
    reduzido || !suportaPreserve3d() ? 'grade' : ponteiroGrosso || estreito ? 'carrossel' : 'roda';

  if (modo === 'roda') {
    return (
      <RodaTresD
        fotos={fotos}
        segundosPorVolta={segundosPorVolta}
        titulo={titulo}
        aoAbrir={aoAbrir}
      />
    );
  }
  return <Lista fotos={fotos} titulo={titulo} modo={modo} aoAbrir={aoAbrir} />;
}

// ---------- grade e carrossel ----------

function Lista({
  fotos,
  titulo,
  modo,
  aoAbrir,
}: Pick<Props, 'fotos' | 'titulo' | 'aoAbrir'> & { modo: 'carrossel' | 'grade' }) {
  const ref = useRef<HTMLUListElement>(null);
  const central = useIndiceCentral(ref);
  return (
    <div className={css.lista} data-modo={modo}>
      <ul ref={ref} className={css.itens} role="list" aria-label={titulo}>
        {fotos.map((id, i) => (
          <li
            key={`${id}-${i}`}
            className={css.celula}
            data-central={modo === 'carrossel' && i === central ? true : undefined}
          >
            {aoAbrir ? (
              <button
                type="button"
                className={css.foto}
                aria-label={rotulo(id)}
                onClick={() => aoAbrir(i)}
              >
                <Foto id={id} sizes="(min-width: 900px) 25vw, 70vw" alt="" />
              </button>
            ) : (
              <figure className={css.foto}>
                <Foto id={id} sizes="(min-width: 900px) 25vw, 70vw" />
              </figure>
            )}
          </li>
        ))}
      </ul>
      {modo === 'carrossel' && <p className={css.dica}>Deslize para ver mais</p>}
    </div>
  );
}

// ---------- roda 3D ----------

interface Fisica {
  angulo: number;
  velocidade: number;
  arrastando: boolean;
  alvo: number | null;
  pausadoPorPonteiro: boolean;
  pausadoPorFoco: boolean;
  /** Para descartar o clique que termina um arrasto. */
  arrastou: boolean;
}

function RodaTresD({ fotos, segundosPorVolta, titulo, aoAbrir }: Props) {
  const n = fotos.length;
  const passo = 360 / n;
  const palco = useRef<HTMLDivElement>(null);
  const anel = useRef<HTMLDivElement>(null);
  const botoes = useRef<(HTMLButtonElement | null)[]>([]);
  const rodando = useRodando(palco);
  const [frente, setFrente] = useState(0);
  const frenteRef = useRef(0);

  const fisica = useRef<Fisica>({
    angulo: 0,
    velocidade: 360 / segundosPorVolta,
    arrastando: false,
    alvo: null,
    pausadoPorPonteiro: false,
    pausadoPorFoco: false,
    arrastou: false,
  });
  const arrasto = useRef<{
    x: number;
    xAnterior: number;
    t: number;
    id: number;
    ativo: boolean;
  } | null>(null);

  const aplicar = useCallback(
    (angulo: number) => {
      anel.current?.style.setProperty('--ang', `${angulo}deg`);
      const i = ((Math.round(-angulo / passo) % n) + n) % n;
      if (i !== frenteRef.current) {
        frenteRef.current = i;
        setFrente(i);
      }
    },
    [n, passo],
  );

  // Laço de animação: só roda com a roda na tela e a aba visível.
  useEffect(() => {
    if (!rodando) return;
    const automatica = 360 / segundosPorVolta;
    let raf = 0;
    let ultimo = performance.now();

    const quadro = (agora: number) => {
      const dt = Math.min((agora - ultimo) / 1000, 0.05);
      ultimo = agora;
      const f = fisica.current;
      if (!f.arrastando) {
        if (f.alvo !== null) {
          const d = f.alvo - f.angulo;
          f.angulo += d * (1 - Math.exp(-dt * 9));
          if (Math.abs(d) < 0.05) {
            f.angulo = f.alvo;
            f.alvo = null;
            f.velocidade = 0;
          }
        } else {
          const pausada = f.pausadoPorPonteiro || f.pausadoPorFoco;
          const meta = pausada ? 0 : automatica;
          // Inércia do arrasto decai suavemente até a velocidade de cruzeiro (ou zero, se pausada)
          f.velocidade += (meta - f.velocidade) * (1 - Math.exp(-dt * 2));
          f.angulo += f.velocidade * dt;
        }
        aplicar(f.angulo);
      }
      raf = requestAnimationFrame(quadro);
    };

    raf = requestAnimationFrame(quadro);
    return () => cancelAnimationFrame(raf);
  }, [rodando, segundosPorVolta, aplicar]);

  const girarPara = useCallback(
    (indice: number) => {
      const f = fisica.current;
      f.alvo = f.angulo + menorCaminho(f.angulo, -indice * passo);
      f.velocidade = 0;
      // Fora da tela o laço está parado: aplica direto.
      if (!rodando) {
        f.angulo = f.alvo;
        f.alvo = null;
        aplicar(f.angulo);
      }
    },
    [passo, rodando, aplicar],
  );

  const aoApertar = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    arrasto.current = {
      x: e.clientX,
      xAnterior: e.clientX,
      t: performance.now(),
      id: e.pointerId,
      ativo: false,
    };
    fisica.current.arrastou = false;
  };

  const aoMover = (e: PointerEvent<HTMLDivElement>) => {
    const a = arrasto.current;
    if (!a || a.id !== e.pointerId) return;
    const f = fisica.current;
    if (!a.ativo) {
      if (Math.abs(e.clientX - a.x) < LIMITE_ARRASTO_PX) return;
      a.ativo = true;
      f.arrastando = true;
      f.arrastou = true;
      f.alvo = null;
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    const agora = performance.now();
    const dx = e.clientX - a.xAnterior;
    const dt = Math.max((agora - a.t) / 1000, 0.001);
    f.angulo += dx * GRAUS_POR_PIXEL;
    f.velocidade = (dx * GRAUS_POR_PIXEL) / dt;
    a.xAnterior = e.clientX;
    a.t = agora;
    aplicar(f.angulo);
  };

  const aoSoltar = (e: PointerEvent<HTMLDivElement>) => {
    const a = arrasto.current;
    if (!a || a.id !== e.pointerId) return;
    arrasto.current = null;
    const f = fisica.current;
    if (a.ativo) {
      f.arrastando = false;
      // Se parou antes de soltar, não há inércia a herdar.
      if (performance.now() - a.t > 80) f.velocidade = 0;
      f.velocidade = Math.max(-600, Math.min(600, f.velocidade));
    }
  };

  const aoTeclar = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const proximo = (frenteRef.current + (e.key === 'ArrowRight' ? 1 : -1) + n) % n;
    girarPara(proximo);
    botoes.current[proximo]?.focus({ preventScroll: true });
  };

  const aoClicar = (indice: number) => {
    if (fisica.current.arrastou) {
      fisica.current.arrastou = false;
      return;
    }
    if (indice === frenteRef.current) aoAbrir?.(indice);
    else girarPara(indice);
  };

  const estilo = {
    '--n': n,
    '--k': 0.54 / Math.tan(Math.PI / n),
  } as CSSProperties;

  return (
    <div className={css.roda}>
      <div
        ref={palco}
        className={css.palco}
        style={estilo}
        role="group"
        aria-roledescription="carrossel"
        aria-label={titulo}
        onPointerDown={aoApertar}
        onPointerMove={aoMover}
        onPointerUp={aoSoltar}
        onPointerCancel={aoSoltar}
        onPointerEnter={(e) => {
          if (e.pointerType === 'mouse') fisica.current.pausadoPorPonteiro = true;
        }}
        onPointerLeave={() => {
          fisica.current.pausadoPorPonteiro = false;
        }}
        onFocus={(e) => {
          // Só o foco de teclado pausa; o clique do mouse não deve travar a roda.
          let teclado = true;
          try {
            teclado = (e.target as HTMLElement).matches(':focus-visible');
          } catch {
            /* seletor não suportado: pausa por garantia */
          }
          if (teclado) fisica.current.pausadoPorFoco = true;
        }}
        onBlur={() => {
          fisica.current.pausadoPorFoco = false;
        }}
        onKeyDown={aoTeclar}
      >
        <div ref={anel} className={css.anel}>
          {fotos.map((id, i) => (
            <button
              key={`${id}-${i}`}
              ref={(el) => {
                botoes.current[i] = el;
              }}
              type="button"
              className={css.item}
              style={{ '--a': `${i * passo}deg` } as CSSProperties}
              aria-label={rotulo(id)}
              aria-current={i === frente ? 'true' : undefined}
              tabIndex={i === frente ? 0 : -1}
              data-frente={i === frente || undefined}
              onClick={() => aoClicar(i)}
            >
              <Foto id={id} sizes="(min-width: 900px) 20vw, 60vw" alt="" />
            </button>
          ))}
        </div>
      </div>
      <p className={css.dica}>Arraste para girar</p>
    </div>
  );
}
