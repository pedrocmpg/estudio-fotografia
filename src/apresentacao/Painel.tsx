import { useState } from 'react';
import { useConfigBase } from '../config/contexto.tsx';
import type { TemaId } from '../config/types.ts';
import { usePrevia, usePreviaStore, type ModoDestaque } from './previa.tsx';
import css from './Painel.module.css';

const TEMAS: { id: TemaId; rotulo: string }[] = [
  { id: 'camara-escura', rotulo: 'Escuro' },
  { id: 'luz-natural', rotulo: 'Claro' },
];

const DESTAQUES: { id: ModoDestaque; rotulo: string }[] = [
  { id: 'cidade', rotulo: 'Cidade' },
  { id: 'tagline', rotulo: 'Frase' },
  { id: 'rotativo', rotulo: 'Girando' },
];

/**
 * Painel do modo apresentação (SPEC §11). Carregado com import() dinâmico, só em ?apresentar=1
 * e só com modoDemo ligado: o visitante comum nunca baixa isto.
 */
export default function Painel() {
  const config = useConfigBase();
  const store = usePreviaStore();
  const previa = usePrevia();
  const [minimizado, setMinimizado] = useState(false);

  const maximoCamadas =
    config.hero.intro.camadas.length + (config.hero.intro.camadasOpcionais?.length ?? 0);
  const presets = config.tema.presetsDestaque ?? [];

  const rever = (camadas?: number) => {
    if (camadas !== undefined) store.definir({ camadas });
    window.scrollTo({ top: 0 });
    store.reverIntro();
  };

  if (minimizado) {
    return (
      <button
        type="button"
        className={css.bolinha}
        onClick={() => setMinimizado(false)}
        aria-label="Abrir painel de apresentação"
      >
        <span aria-hidden="true">◐</span>
      </button>
    );
  }

  return (
    <aside className={css.painel} aria-label="Painel de apresentação">
      <header className={css.topo}>
        <h2 className={css.titulo}>Apresentação</h2>
        <button type="button" className={css.minimizar} onClick={() => setMinimizado(true)}>
          Minimizar
        </button>
      </header>

      <fieldset className={css.grupo}>
        <legend>Tema</legend>
        <div className={css.opcoes}>
          {TEMAS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={css.opcao}
              aria-pressed={previa.tema === t.id}
              onClick={() => store.definir({ tema: t.id })}
            >
              {t.rotulo}
            </button>
          ))}
        </div>
      </fieldset>

      {presets.length > 0 && (
        <fieldset className={css.grupo}>
          <legend>Cor de destaque</legend>
          <div className={css.opcoes}>
            <button
              type="button"
              className={css.opcao}
              aria-pressed={previa.acento === null}
              onClick={() => store.definir({ acento: null })}
            >
              Padrão
            </button>
            {presets.map((cor) => (
              <button
                key={cor}
                type="button"
                className={css.bolinhaCor}
                style={{ background: cor }}
                aria-label={`Cor ${cor}`}
                aria-pressed={previa.acento === cor}
                onClick={() => store.definir({ acento: cor })}
              />
            ))}
          </div>
        </fieldset>
      )}

      <fieldset className={css.grupo}>
        <legend>Abertura</legend>
        <div className={css.opcoes}>
          <button type="button" className={css.opcao} onClick={() => rever()}>
            Rever abertura
          </button>
          {Array.from({ length: maximoCamadas }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              className={css.opcao}
              aria-pressed={previa.camadas === n}
              aria-label={`${n} ${n === 1 ? 'cortina' : 'cortinas'}`}
              onClick={() => rever(n)}
            >
              {n}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className={css.grupo}>
        <legend>Nome do hero</legend>
        <div className={css.opcoes}>
          <button
            type="button"
            className={css.opcao}
            aria-pressed={!previa.nomeGigante}
            onClick={() => store.definir({ nomeGigante: false })}
          >
            Centralizado
          </button>
          <button
            type="button"
            className={css.opcao}
            aria-pressed={previa.nomeGigante}
            onClick={() => store.definir({ nomeGigante: true })}
          >
            Gigante
          </button>
        </div>
      </fieldset>

      <fieldset className={css.grupo}>
        <legend>Destaque do hero</legend>
        <div className={css.opcoes}>
          {DESTAQUES.map((d) => (
            <button
              key={d.id}
              type="button"
              className={css.opcao}
              aria-pressed={previa.destaque === d.id}
              onClick={() => store.definir({ destaque: d.id })}
            >
              {d.rotulo}
            </button>
          ))}
        </div>
      </fieldset>
    </aside>
  );
}
