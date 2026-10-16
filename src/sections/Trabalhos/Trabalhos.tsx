import { lazy, Suspense, useState } from 'react';
import { useSiteConfig } from '../../apresentacao/previa.tsx';
import { LazyPerto } from '../../components/LazyPerto.tsx';
import { TituloSecao } from '../../components/TituloSecao.tsx';
import { Colagem } from './Colagem.tsx';
import css from './Trabalhos.module.css';

// A roda e a lightbox são chunks à parte: só baixam quando a seção chega perto da tela / ao abrir.
const Roda = lazy(() => import('./Roda.tsx'));
const Lightbox = lazy(() =>
  import('../../components/Lightbox.tsx').then((m) => ({ default: m.Lightbox })),
);

type Aberta = { lista: 'colagem' | 'roda'; indice: number } | null;

/**
 * Trabalhos (SPEC §7.6, bloco D): colagem de fotos soltas com parallax, depois a roda 3D (no celular,
 * a pista que liga a rolagem vertical à horizontal). Tocar numa foto abre a lightbox. A folha de
 * contato entra na Fase 2.
 */
export function Trabalhos() {
  const { trabalhos } = useSiteConfig();
  const [aberta, setAberta] = useState<Aberta>(null);
  const fotos = aberta?.lista === 'roda' ? trabalhos.roda.fotos : trabalhos.colagem;

  return (
    <section id="trabalhos" className={css.secao} aria-labelledby="trabalhos-titulo">
      <div className={`container ${css.cabeca}`}>
        <TituloSecao id="trabalhos-titulo" texto={trabalhos.titulo} secao="trabalhos" />
      </div>

      <Colagem
        fotos={trabalhos.colagem}
        rotulo="Fotos soltas"
        aoAbrir={(indice) => setAberta({ lista: 'colagem', indice })}
      />

      <LazyPerto fallback={<div className={css.reserva} aria-hidden="true" />}>
        <Roda
          fotos={trabalhos.roda.fotos}
          segundosPorVolta={trabalhos.roda.segundosPorVolta}
          titulo="Galeria giratória"
          aoAbrir={(indice) => setAberta({ lista: 'roda', indice })}
        />
      </LazyPerto>

      {aberta && (
        <Suspense fallback={null}>
          <Lightbox
            fotos={fotos}
            indice={aberta.indice}
            rotulo={trabalhos.titulo}
            aoFechar={() => setAberta(null)}
            aoMudar={(indice) => setAberta({ ...aberta, indice })}
          />
        </Suspense>
      )}
    </section>
  );
}
