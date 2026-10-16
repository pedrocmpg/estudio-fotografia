import { useId, useState, type CSSProperties } from 'react';
import { useSiteConfig } from '../../apresentacao/previa.tsx';
import { Foto } from '../../components/Foto.tsx';
import { TituloSecao } from '../../components/TituloSecao.tsx';
import { obterFoto } from '../../data/fotos.ts';
import css from './AntesDepois.module.css';

function Comparador({
  antes,
  depois,
  legenda,
}: {
  antes: string;
  depois: string;
  legenda: string;
}) {
  const uid = useId();
  const [valor, setValor] = useState(50);
  const proporcao = obterFoto(depois)?.proporcao ?? 1.5;

  return (
    <figure className={css.figura}>
      <div
        className={css.caixa}
        style={{ '--v': `${valor}%`, aspectRatio: `${proporcao}` } as CSSProperties}
      >
        <span className={css.camada}>
          <Foto id={depois} sizes="(min-width: 900px) 60vw, 100vw" />
        </span>
        <span className={`${css.camada} ${css.antes}`} aria-hidden="true">
          <Foto id={antes} sizes="(min-width: 900px) 60vw, 100vw" alt="" />
        </span>
        <span className={css.linha} aria-hidden="true" />
        <span className={`${css.chip} ${css.chipAntes}`} aria-hidden="true">
          Antes
        </span>
        <span className={`${css.chip} ${css.chipDepois}`} aria-hidden="true">
          Depois
        </span>
        <input
          id={uid}
          className={css.range}
          type="range"
          min={0}
          max={100}
          step={1}
          value={valor}
          onChange={(e) => setValor(Number(e.target.value))}
          aria-label={`Comparar antes e depois: ${legenda}`}
          aria-valuetext={`${valor}% da foto mostra o antes`}
        />
      </div>
      <figcaption className={css.legenda}>{legenda}</figcaption>
    </figure>
  );
}

/**
 * Antes e depois (SPEC §10.8): comparador com `<input type="range">` (teclado e leitor de tela de graça).
 * `antesDepois: []` no config → a seção não renderiza.
 */
export function AntesDepois() {
  const { antesDepois } = useSiteConfig();
  if (antesDepois.length === 0) return null;
  return (
    <section id="antes-e-depois" className={css.secao} aria-labelledby="antes-depois-titulo">
      <div className="container">
        <TituloSecao id="antes-depois-titulo" texto="Antes e depois" secao="antesDepois" />
        <div className={css.lista}>
          {antesDepois.map((par) => (
            <Comparador key={`${par.antes}-${par.depois}`} {...par} />
          ))}
        </div>
      </div>
    </section>
  );
}
