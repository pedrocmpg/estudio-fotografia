/**
 * Estado da prévia (SPEC §11): o que o modo apresentação pode trocar ao vivo sem mexer no config.
 * Fica fora do chunk lazy do painel porque o hero precisa ler isso mesmo sem o painel aberto.
 */
import {
  createContext,
  useContext,
  useMemo,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { useConfigBase } from '../config/contexto.tsx';
import type { SiteConfig, TemaId } from '../config/types.ts';
import { TEMAS } from '../lib/constantes.ts';

export type ModoDestaque = SiteConfig['hero']['destaque']['modo'];

export interface EstadoPrevia {
  tema: TemaId;
  /** Quantidade de cortinas da abertura (1 a 3). */
  camadas: number;
  destaque: ModoDestaque;
  /** Cor de destaque escolhida no painel; null = a do tema/config. */
  acento: string | null;
  /** Sobe a cada "Rever abertura". */
  introRev: number;
}

export interface Previa {
  ler(): EstadoPrevia;
  assinar(aviso: () => void): () => void;
  definir(parcial: Partial<EstadoPrevia>): void;
  reverIntro(): void;
}

function temaInicial(config: SiteConfig): TemaId {
  // O script do <head> já resolveu ?tema= antes da primeira pintura; seguimos o que ele decidiu.
  const atual =
    typeof document !== 'undefined' ? document.documentElement.dataset.theme : undefined;
  if (atual && (TEMAS as readonly string[]).includes(atual)) return atual as TemaId;
  if (typeof window !== 'undefined') {
    const pedido = new URLSearchParams(window.location.search).get('tema');
    if (pedido && (TEMAS as readonly string[]).includes(pedido)) return pedido as TemaId;
  }
  return config.tema.ativo;
}

export function criarPrevia(config: SiteConfig): Previa {
  let estado: EstadoPrevia = {
    tema: temaInicial(config),
    camadas: config.hero.intro.camadas.length,
    destaque: config.hero.destaque.modo,
    acento: null,
    introRev: 0,
  };
  const avisos = new Set<() => void>();
  const emitir = () => avisos.forEach((a) => a());
  return {
    ler: () => estado,
    assinar(aviso) {
      avisos.add(aviso);
      return () => avisos.delete(aviso);
    },
    definir(parcial) {
      estado = { ...estado, ...parcial };
      emitir();
    },
    reverIntro() {
      estado = { ...estado, introRev: estado.introRev + 1 };
      emitir();
    },
  };
}

const PreviaContext = createContext<Previa | null>(null);

export function PreviaProvider({ children }: { children: ReactNode }) {
  const config = useConfigBase();
  const ref = useRef<Previa | null>(null);
  if (!ref.current) ref.current = criarPrevia(config);
  return <PreviaContext.Provider value={ref.current}>{children}</PreviaContext.Provider>;
}

export function usePreviaStore(): Previa {
  const p = useContext(PreviaContext);
  if (!p) throw new Error('PreviaProvider ausente');
  return p;
}

export function usePrevia(): EstadoPrevia {
  const p = usePreviaStore();
  return useSyncExternalStore(p.assinar, p.ler, p.ler);
}

/** Config com as escolhas do modo apresentação aplicadas por cima. Use este nos componentes. */
export function useSiteConfig(): SiteConfig {
  const base = useConfigBase();
  const previa = usePrevia();
  return useMemo(() => {
    const todas = [...base.hero.intro.camadas, ...(base.hero.intro.camadasOpcionais ?? [])];
    const qtd = Math.max(1, Math.min(previa.camadas, todas.length));
    return {
      ...base,
      hero: {
        ...base.hero,
        destaque: { ...base.hero.destaque, modo: previa.destaque },
        intro: { ...base.hero.intro, camadas: todas.slice(0, qtd) },
      },
    };
  }, [base, previa.camadas, previa.destaque]);
}
