import { forwardRef, useEffect, useRef, useState, type CSSProperties } from 'react';
import { useSiteConfig } from '../../apresentacao/previa.tsx';
import { CtaBotao } from '../../components/CtaBotao.tsx';
import { Foto } from '../../components/Foto.tsx';
import { Selo } from '../../components/Selo.tsx';
import type { SiteConfig } from '../../config/types.ts';
import { useInView, useReducedMotion, useRodando } from '../../motion/hooks.ts';
import { useAjusteLargura } from '../../motion/useAjusteLargura.ts';
import { useIntro } from '../../motion/intro.tsx';
import css from './Hero.module.css';

type EstiloHero = CSSProperties & { '--dur-etapa': string; '--scrim': number };

function textoDestaque(config: SiteConfig): string | null {
  const { destaque } = config.hero;
  if (destaque.modo === 'cidade') {
    return (destaque.texto ?? 'Fotografia em {cidade}').replace('{cidade}', config.negocio.cidade);
  }
  if (destaque.modo === 'tagline') return destaque.tagline ?? destaque.texto ?? null;
  return null;
}

/** Nome do estúdio, letra a letra. Leitor de tela lê o sr-only (o h1 existe desde o início). */
const NomeEmLetras = forwardRef<HTMLSpanElement, { nome: string }>(function NomeEmLetras(
  { nome },
  ref,
) {
  const palavras = nome.split(' ');
  let indice = 0;
  return (
    <span ref={ref} className={css.letras} aria-hidden="true">
      {palavras.map((palavra, w) => (
        <span key={w} className={css.palavra}>
          {[...palavra].map((letra) => {
            const i = indice++;
            return (
              <span key={i} className={css.letra} style={{ '--i': i } as CSSProperties}>
                <span className={css.glifo}>{letra}</span>
              </span>
            );
          })}
          {w < palavras.length - 1 ? ' ' : ''}
        </span>
      ))}
    </span>
  );
});

/** Tipos de sessão trocando a cada 2 s com máscara (modo "rotativo"). */
function Rotativo({ itens, ativo }: { itens: string[]; ativo: boolean }) {
  const reduzido = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const visivel = useRodando(ref);
  const [atual, setAtual] = useState(0);
  const [anterior, setAnterior] = useState<number | null>(null);

  useEffect(() => {
    if (!ativo || reduzido || !visivel || itens.length < 2) return;
    const id = setInterval(() => {
      setAtual((a) => {
        setAnterior(a);
        return (a + 1) % itens.length;
      });
    }, 2000);
    return () => clearInterval(id);
  }, [ativo, reduzido, visivel, itens.length]);

  return (
    <span ref={ref} className={css.rotativo}>
      <span className="sr-only">{itens.join(', ')}</span>
      <span className={css.rotativoPalco} aria-hidden="true">
        {itens.map((item, i) => (
          <span
            key={item}
            className={css.rotativoItem}
            data-ativo={i === atual || undefined}
            data-saindo={i === anterior && i !== atual ? true : undefined}
          >
            {item}
          </span>
        ))}
      </span>
    </span>
  );
}

function Cortinas() {
  const config = useSiteConfig();
  const { estado } = useIntro();
  const intro = config.hero.intro;
  const n = intro.camadas.length;

  return (
    <div className={css.cortinas} aria-hidden="true">
      {intro.camadas.map((camada, i) => {
        const progresso = (estado.progresso[i] ?? 0) / intro.etapasPorCamada;
        const pulso = estado.pulsos[i] ?? 0;
        return (
          <div
            key={i}
            className={css.camada}
            data-intro-camada={i}
            data-pulada={estado.puladas[i] || undefined}
            data-aberta={progresso >= 1 || undefined}
            style={{ '--p': progresso, zIndex: n - i } as CSSProperties}
          >
            {(['esquerda', 'direita'] as const).map((lado) => (
              <div key={lado} className={css.painel} data-lado={lado}>
                <div className={css.fotoPainel}>
                  <Foto
                    id={camada[lado]}
                    idMobile={camada[lado === 'esquerda' ? 'esquerdaMobile' : 'direitaMobile']}
                    sizes="50vw"
                    alt=""
                    prioridade={i === 0}
                    eager
                  />
                </div>
                <span className={css.sombra} />
                {intro.linhaDeLuz && pulso > 0 && <span key={pulso} className={css.luz} />}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

export function Hero() {
  const config = useSiteConfig();
  const { estado } = useIntro();
  const { hero, negocio } = config;
  const secao = useRef<HTMLElement>(null);
  const titulo = useRef<HTMLHeadingElement>(null);
  const letras = useRef<HTMLSpanElement>(null);
  // Nome gigante: ocupa a largura do hero (mede o texto e ajusta o tamanho da fonte).
  useAjusteLargura(letras, titulo, hero.nome, hero.nomeGigante);
  // O indicador de rolagem só vale enquanto o hero ocupa quase toda a tela.
  const heroInteiro = useInView(secao, { limiar: 0.85 });
  const rodando = estado.fase === 'rodando';
  const emCena = estado.fase !== 'concluida';
  const destaque = textoDestaque(config);
  const puladas = estado.puladas.filter(Boolean).length;
  const posicao = String(estado.camadaAtual + 1).padStart(2, '0');
  const total = String(Math.max(1, estado.totalCamadas - puladas)).padStart(2, '0');

  const estilo: EstiloHero = {
    '--dur-etapa': `${hero.intro.duracaoEtapaMs}ms`,
    '--scrim': hero.fundoFinal.scrim,
  };

  return (
    <section
      ref={secao}
      id="topo"
      className={css.hero}
      data-fase={estado.fase}
      data-final={estado.modoFinal}
      data-fundo={hero.fundoFinal.tipo}
      data-gigante={hero.nomeGigante || undefined}
      style={estilo}
    >
      <div className={css.fundo}>
        {hero.fundoFinal.tipo === 'foto' && hero.fundoFinal.foto && (
          <Foto id={hero.fundoFinal.foto} sizes="100vw" alt="" eager />
        )}
        <div className={css.scrim} />
      </div>

      <div className={css.conteudo}>
        <h1 ref={titulo} className={css.nome}>
          <span className="sr-only">{negocio.nome}</span>
          <NomeEmLetras ref={letras} nome={hero.nome} />
        </h1>

        {hero.destaque.modo === 'rotativo' && hero.destaque.itens ? (
          <p className={`${css.destaque} ${css.revelavel}`}>
            <Rotativo itens={hero.destaque.itens} ativo={!rodando} />
          </p>
        ) : (
          destaque && <p className={`${css.destaque} ${css.revelavel}`}>{destaque}</p>
        )}

        {hero.subtitulo && <p className={`${css.subtitulo} ${css.revelavel}`}>{hero.subtitulo}</p>}

        <div
          className={`${css.ctas} ${css.revelavel}`}
          {...(rodando ? ({ inert: '' } as object) : null)}
        >
          <CtaBotao cta={hero.ctas.primario} />
          {hero.ctas.secundario && (
            <CtaBotao cta={hero.ctas.secundario} variante="secundario" className={css.ctaSec} />
          )}
        </div>
      </div>

      {emCena && <Cortinas />}

      {config.modoDemo && !rodando && <Selo className={css.selo} />}

      {!rodando && (
        <span className={css.rolar} data-visivel={heroInteiro || undefined} aria-hidden="true" />
      )}

      {rodando && hero.intro.mostrarContador && (
        <p className={css.contador} aria-hidden="true">
          {posicao} / {total}
        </p>
      )}
    </section>
  );
}
