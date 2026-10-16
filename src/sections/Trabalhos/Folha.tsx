import { useId, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { Foto } from '../../components/Foto.tsx';
import { obterFoto } from '../../data/fotos.ts';
import { useInView, useReducedMotion } from '../../motion/hooks.ts';
import css from './Folha.module.css';

interface Props {
  categorias: string[];
  fotos: { id: string; categoria: string; marcada?: boolean }[];
  mostrarDadosTecnicos: boolean;
  /** Abre a lightbox com as fotos da aba atual. */
  aoAbrir: (ids: string[], indice: number) => void;
}

const TODAS = 'Todas';

function dadosTecnicos(id: string): string | undefined {
  const e = obterFoto(id)?.exposicao;
  if (!e) return undefined;
  const partes = [e.abertura, e.velocidade, e.iso ? `ISO ${e.iso}` : undefined].filter(Boolean);
  return partes.length ? partes.join(' · ') : undefined;
}

/**
 * Folha de contato (SPEC §10.6c): visual de negativo (tira escura com furos, numeração mono `14A ▸`),
 * abas por categoria e, ao entrar na tela, um lápis vermelho (SVG, `stroke-dashoffset`) que circula as
 * fotos marcadas. Com movimento reduzido os círculos já vêm desenhados. Clicar abre a lightbox.
 */
export default function Folha({ categorias, fotos, mostrarDadosTecnicos, aoAbrir }: Props) {
  const uid = useId();
  const reduzido = useReducedMotion();
  const raiz = useRef<HTMLDivElement>(null);
  const abas = useRef<(HTMLButtonElement | null)[]>([]);
  const entrou = useInView(raiz, { uma: true, limiar: 0.25 });
  const nomes = [TODAS, ...categorias];
  const [ativa, setAtiva] = useState(0);
  const filtradas = ativa === 0 ? fotos : fotos.filter((f) => f.categoria === nomes[ativa]);
  const ids = filtradas.map((f) => f.id);

  const irPara = (i: number) => {
    const proximo = (i + nomes.length) % nomes.length;
    setAtiva(proximo);
    abas.current[proximo]?.focus();
  };
  const aoTeclar = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') irPara(ativa + 1);
    else if (e.key === 'ArrowLeft') irPara(ativa - 1);
    else if (e.key === 'Home') irPara(0);
    else if (e.key === 'End') irPara(nomes.length - 1);
    else return;
    e.preventDefault();
  };

  return (
    <div ref={raiz} className={css.folha} data-entrou={entrou || reduzido || undefined}>
      <div className={`container ${css.cabeca}`}>
        <h3 className={css.titulo}>Folha de contato</h3>
        <div className={css.abas} role="tablist" aria-label="Categorias" onKeyDown={aoTeclar}>
          {nomes.map((nome, i) => (
            <button
              key={nome}
              ref={(el) => {
                abas.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`${uid}-aba-${i}`}
              aria-selected={ativa === i}
              aria-controls={`${uid}-painel`}
              tabIndex={ativa === i ? 0 : -1}
              className={css.aba}
              onClick={() => setAtiva(i)}
            >
              {nome}
            </button>
          ))}
        </div>
      </div>

      <div
        id={`${uid}-painel`}
        role="tabpanel"
        aria-labelledby={`${uid}-aba-${ativa}`}
        className={`container ${css.painel}`}
      >
        <ul className={css.tira} role="list">
          {filtradas.map((f, i) => {
            const tecnicos = mostrarDadosTecnicos ? dadosTecnicos(f.id) : undefined;
            return (
              <li key={f.id} className={css.quadro} style={{ '--i': i } as CSSProperties}>
                <p className={css.numero} aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}A ▸
                </p>
                <button
                  type="button"
                  className={css.foto}
                  data-visor
                  onClick={() => aoAbrir(ids, i)}
                  aria-label={`Ampliar: ${obterFoto(f.id)?.alt ?? ''}`}
                >
                  <Foto id={f.id} sizes="(min-width: 900px) 22vw, 46vw" alt="" />
                  {f.marcada && (
                    <svg
                      className={css.lapis}
                      viewBox="0 0 100 120"
                      preserveAspectRatio="none"
                      aria-hidden="true"
                    >
                      <path
                        pathLength={1}
                        d="M50 6 C18 4 4 36 6 64 C8 98 34 116 62 112 C92 108 98 70 94 42 C90 16 68 2 40 8"
                      />
                      <path pathLength={1} className={css.visto} d="M72 20 L78 28 L90 8" />
                    </svg>
                  )}
                </button>
                {tecnicos && <p className={css.dados}>{tecnicos}</p>}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
