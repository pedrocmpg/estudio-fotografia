/**
 * Máquina da abertura em cortinas (SPEC §7.2).
 *
 * Ela só decide *quando* cada etapa acontece; o movimento em si é CSS (transform com transition),
 * guiado pela variável --p de cada camada. Assim a animação roda no compositor e, se o JS engasgar,
 * a transição em andamento termina sozinha.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { usePrevia, useSiteConfig } from '../apresentacao/previa.tsx';
import { gravarSessao } from '../lib/ambiente.ts';
import { CHAVE_INTRO_VISTA } from '../lib/constantes.ts';
import { deveRodarIntro, lerEntradaDecisao } from '../lib/introDecisao.ts';

export type FaseIntro = 'rodando' | 'saindo' | 'concluida';

export interface EstadoIntro {
  fase: FaseIntro;
  /** Como a intro terminou: sozinha, pulada, ou nem rodou. */
  modoFinal: 'natural' | 'pulado' | 'direto';
  /** Posição (0-based) da camada em cena, para o contador "01 / 02". */
  camadaAtual: number;
  totalCamadas: number;
  /** Etapas já cumpridas por camada (0 a etapasPorCamada). */
  progresso: number[];
  /** Sobe a cada etapa da camada; reinicia a linha de luz. */
  pulsos: number[];
  /** Camadas cujas fotos não carregaram a tempo: ficam de fora. */
  puladas: boolean[];
}

interface ContextoIntro {
  estado: EstadoIntro;
  pular: () => void;
}

const IntroContext = createContext<ContextoIntro | null>(null);

/** Quanto esperar as fotos da camada 1 antes de começar. */
const ESPERA_FOTOS_MS = 1500;
const ESPERA_INICIAL_MS = 400;
const SAIDA_PULADA_MS = 250;

function estadoRodando(n: number): EstadoIntro {
  return {
    fase: 'rodando',
    modoFinal: 'natural',
    camadaAtual: 0,
    totalCamadas: n,
    progresso: Array(n).fill(0),
    pulsos: Array(n).fill(0),
    puladas: Array(n).fill(false),
  };
}

function estadoDireto(n: number): EstadoIntro {
  return { ...estadoRodando(n), fase: 'concluida', modoFinal: 'direto' };
}

function decidirInicial(intro: { ativo: boolean; umaVezPorSessao: boolean }): boolean {
  // O script do <head> decide antes da primeira pintura e deixa o resultado em data-intro.
  const marcado =
    typeof document !== 'undefined' ? document.documentElement.dataset.intro : undefined;
  if (marcado === 'on') return intro.ativo;
  if (marcado === 'done') return false;
  return deveRodarIntro(lerEntradaDecisao(intro));
}

function camadaPronta(indice: number): boolean {
  const imgs = document.querySelectorAll<HTMLImageElement>(`[data-intro-camada="${indice}"] img`);
  return imgs.length > 0 && Array.from(imgs).every((i) => i.complete && i.naturalWidth > 0);
}

const EVENTOS_PULAR = ['pointerdown', 'keydown', 'wheel', 'touchmove', 'scroll'] as const;

export function IntroProvider({ children }: { children: ReactNode }) {
  const config = useSiteConfig();
  const previa = usePrevia();
  const intro = config.hero.intro;
  const n = intro.camadas.length;

  const [estado, setEstado] = useState<EstadoIntro>(() =>
    decidirInicial(intro) ? estadoRodando(n) : estadoDireto(n),
  );
  const [chave, setChave] = useState(0);

  // Os valores mais recentes ficam em refs: a sequência é longa e não pode reiniciar a cada render.
  const introRef = useRef(intro);
  introRef.current = intro;
  const faseRef = useRef(estado.fase);
  faseRef.current = estado.fase;
  const pularRef = useRef<(() => void) | null>(null);
  // Timers de "saindo" ficam à parte para não morrerem com o limpar() da sequência.
  const temporizadoresDeSaida = useRef(new Set<ReturnType<typeof setTimeout>>()).current;
  useEffect(() => () => temporizadoresDeSaida.forEach(clearTimeout), [temporizadoresDeSaida]);

  const pular = useCallback(() => pularRef.current?.(), []);

  // "Rever abertura" (modo apresentação): reinicia do zero, ignorando "uma vez por sessão".
  const revVista = useRef(previa.introRev);
  useEffect(() => {
    if (revVista.current === previa.introRev) return;
    revVista.current = previa.introRev;
    const atual = introRef.current;
    const rodar = deveRodarIntro(lerEntradaDecisao(atual, { ignorarSessao: true }));
    setEstado(rodar ? estadoRodando(atual.camadas.length) : estadoDireto(atual.camadas.length));
    if (rodar) setChave((c) => c + 1);
  }, [previa.introRev]);

  useEffect(() => {
    if (faseRef.current !== 'rodando') {
      document.documentElement.dataset.intro = 'done';
      return;
    }

    const cfg = introRef.current;
    const total = cfg.camadas.length;
    const temporizadores = new Set<ReturnType<typeof setTimeout>>();
    let cancelado = false;
    let encerrada = false;

    document.documentElement.dataset.intro = 'on';
    if (cfg.umaVezPorSessao) gravarSessao(CHAVE_INTRO_VISTA, '1');

    const dormir = (ms: number) =>
      new Promise<void>((resolver) => {
        if (cancelado) return resolver();
        const id = setTimeout(() => {
          temporizadores.delete(id);
          resolver();
        }, ms);
        temporizadores.add(id);
      });

    const desligarOuvintes = () => {
      for (const e of EVENTOS_PULAR) window.removeEventListener(e, aoInteragir, true);
    };

    const limpar = () => {
      cancelado = true;
      temporizadores.forEach(clearTimeout);
      temporizadores.clear();
      desligarOuvintes();
    };

    const finalizar = (modo: 'natural' | 'pulado') => {
      if (encerrada) return;
      encerrada = true;
      limpar();
      pularRef.current = null;
      document.documentElement.dataset.intro = 'done';
      if (modo === 'natural') {
        setEstado((s) => ({ ...s, fase: 'concluida', modoFinal: 'natural' }));
        return;
      }
      setEstado((s) => ({ ...s, fase: 'saindo', modoFinal: 'pulado' }));
      const id = setTimeout(
        () => setEstado((s) => (s.fase === 'saindo' ? { ...s, fase: 'concluida' } : s)),
        SAIDA_PULADA_MS,
      );
      // Este timer precisa sobreviver ao limpar() acima; é cancelado só se o componente sair.
      temporizadoresDeSaida.add(id);
    };

    function aoInteragir(e: Event) {
      if (e.type === 'keydown') {
        const tecla = (e as KeyboardEvent).key;
        // Tab só leva o foco ao botão "Pular"; não conta como dispensar a intro.
        if (tecla === 'Tab' || tecla === 'Shift') return;
      }
      if (e.type === 'scroll' && window.scrollY < 2) return;
      finalizar('pulado');
    }

    pularRef.current = () => finalizar('pulado');
    for (const e of EVENTOS_PULAR)
      window.addEventListener(e, aoInteragir, { capture: true, passive: true });

    (async () => {
      // 1) Dá um tempo para as fotos da camada 1 chegarem, para nunca abrir com painel "pelado".
      let esperado = 0;
      while (!cancelado && !camadaPronta(0) && esperado < ESPERA_FOTOS_MS) {
        await dormir(50);
        esperado += 50;
      }
      await dormir(ESPERA_INICIAL_MS);

      // 2) Camadas na ordem; se a de baixo ainda não carregou, ela é pulada.
      const ordem = Array.from({ length: total }, (_, i) => i);
      let posicao = 0;
      while (!cancelado && posicao < ordem.length) {
        const camada = ordem[posicao]!;
        const proxima = ordem[posicao + 1];
        if (proxima !== undefined && !camadaPronta(proxima)) {
          ordem.splice(posicao + 1, 1);
          setEstado((s) => ({
            ...s,
            puladas: s.puladas.map((p, i) => (i === proxima ? true : p)),
          }));
        }

        for (let etapa = 1; etapa <= cfg.etapasPorCamada && !cancelado; etapa++) {
          setEstado((s) => ({
            ...s,
            progresso: s.progresso.map((p, i) => (i === camada ? etapa : p)),
            pulsos: s.pulsos.map((p, i) => (i === camada ? p + 1 : p)),
          }));
          await dormir(cfg.duracaoEtapaMs);
          if (etapa < cfg.etapasPorCamada) await dormir(cfg.pausaEtapaMs);
        }
        if (cancelado) return;

        posicao++;
        if (posicao < ordem.length) {
          setEstado((s) => ({ ...s, camadaAtual: posicao }));
          await dormir(cfg.pausaCamadaMs);
        }
      }

      if (!cancelado) finalizar('natural');
    })();

    return () => {
      limpar();
      pularRef.current = null;
    };
    // Reinicia só quando "Rever abertura" muda a chave.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave]);

  return <IntroContext.Provider value={{ estado, pular }}>{children}</IntroContext.Provider>;
}

export function useIntro(): ContextoIntro {
  const ctx = useContext(IntroContext);
  if (!ctx) throw new Error('IntroProvider ausente');
  return ctx;
}
