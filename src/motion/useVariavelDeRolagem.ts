import { useEffect, useRef, type RefObject } from 'react';

interface Opcoes {
  /** false = não escuta nada (movimento reduzido, layout sem pin). */
  ativo?: boolean;
  /** Nome da variável CSS que recebe o valor. */
  nome?: string;
  /** Chamado a cada atualização (ex.: para o contador "03 / 10"). */
  aoMudar?: (valor: number) => void;
}

/**
 * Liga o progresso da rolagem de um elemento a uma variável CSS (`--p`). Uma leitura de
 * getBoundingClientRect por quadro (rAF) e uma escrita: o resto é CSS (`calc`) em transform/opacity.
 * Só escuta enquanto o elemento está perto da tela (IntersectionObserver).
 */
export function useVariavelDeRolagem(
  ref: RefObject<HTMLElement | null>,
  calcular: (el: HTMLElement) => number,
  { ativo = true, nome = '--p', aoMudar }: Opcoes = {},
): void {
  const calcularRef = useRef(calcular);
  const aoMudarRef = useRef(aoMudar);
  useEffect(() => {
    calcularRef.current = calcular;
    aoMudarRef.current = aoMudar;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el || !ativo) return;
    let raf = 0;
    let ouvindo = false;

    const atualizar = () => {
      raf = 0;
      const valor = calcularRef.current(el);
      if (Number.isFinite(valor)) {
        el.style.setProperty(nome, valor.toFixed(4));
        aoMudarRef.current?.(valor);
      }
    };
    const agendar = () => {
      if (!raf) raf = requestAnimationFrame(atualizar);
    };
    const ouvir = () => {
      if (ouvindo) return;
      ouvindo = true;
      window.addEventListener('scroll', agendar, { passive: true });
      window.addEventListener('resize', agendar);
      atualizar();
    };
    const parar = () => {
      if (!ouvindo) return;
      ouvindo = false;
      window.removeEventListener('scroll', agendar);
      window.removeEventListener('resize', agendar);
    };

    atualizar();
    let obs: IntersectionObserver | undefined;
    if (typeof IntersectionObserver === 'undefined') {
      ouvir();
    } else {
      obs = new IntersectionObserver(([entrada]) => (entrada?.isIntersecting ? ouvir() : parar()), {
        rootMargin: '100% 0px',
      });
      obs.observe(el);
    }
    return () => {
      obs?.disconnect();
      parar();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ref, ativo, nome]);
}

const limitar = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));

/**
 * Progresso (0 a 1) de uma "pista" alta com um palco `sticky` dentro: 0 quando o topo da pista
 * chega ao topo da tela, 1 quando o fim da pista chega ao fim do palco.
 */
export function progressoDaPista(el: HTMLElement): number {
  const caixa = el.getBoundingClientRect();
  const palco = el.querySelector<HTMLElement>('[data-palco]');
  const altura = palco?.getBoundingClientRect().height ?? window.innerHeight;
  const total = caixa.height - altura;
  return total > 0 ? limitar(-caixa.top / total) : 0;
}

/** Progresso em "cartões": 0 no primeiro, 1 quando o segundo já cobriu o primeiro, etc. */
export function progressoEmCartoes(el: HTMLElement): number {
  const primeiro = el.firstElementChild as HTMLElement | null;
  const altura = primeiro?.getBoundingClientRect().height || window.innerHeight * 0.9;
  return Math.max(0, -el.getBoundingClientRect().top / altura);
}
