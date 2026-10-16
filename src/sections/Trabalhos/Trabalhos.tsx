import { lazy, Suspense, useState } from 'react';
import { useSiteConfig } from '../../apresentacao/previa.tsx';
import { LazyPerto } from '../../components/LazyPerto.tsx';
import { TituloSecao } from '../../components/TituloSecao.tsx';
import { comTransicao } from '../../lib/transicao.ts';
import { useReducedMotion } from '../../motion/hooks.ts';
import { Colagem } from './Colagem.tsx';
import css from './Trabalhos.module.css';

// A roda, a folha de contato e a lightbox são chunks à parte: só baixam quando a seção chega perto
// da tela / ao abrir.
const Roda = lazy(() => import('./Roda.tsx'));
const Folha = lazy(() => import('./Folha.tsx'));
const Lightbox = lazy(() =>
  import('../../components/Lightbox.tsx').then((m) => ({ default: m.Lightbox })),
);

type Aberta = { ids: string[]; indice: number } | null;

/**
 * Trabalhos (SPEC §10.6): colagem de fotos soltas com parallax, a roda 3D (no celular, a pista que
 * liga a rolagem vertical à horizontal) e a folha de contato com abas e lápis vermelho. Tocar numa
 * foto abre a lightbox, com View Transitions quando o navegador tem.
 */
export function Trabalhos() {
  const { trabalhos } = useSiteConfig();
  const reduzido = useReducedMotion();
  const [aberta, setAberta] = useState<Aberta>(null);

  const abrir = (ids: string[], indice: number) =>
    comTransicao(() => setAberta({ ids, indice }), reduzido);
  const fechar = () => comTransicao(() => setAberta(null), reduzido);
  const mudar = (indice: number) =>
    comTransicao(() => setAberta((a) => (a ? { ...a, indice } : a)), reduzido);

  return (
    <section id="trabalhos" className={css.secao} aria-labelledby="trabalhos-titulo">
      <div className={`container ${css.cabeca}`}>
        <TituloSecao id="trabalhos-titulo" texto={trabalhos.titulo} secao="trabalhos" />
      </div>

      <Colagem
        fotos={trabalhos.colagem}
        rotulo="Fotos soltas"
        aoAbrir={(indice) => abrir(trabalhos.colagem, indice)}
      />

      <LazyPerto fallback={<div className={css.reserva} aria-hidden="true" />}>
        <Roda
          fotos={trabalhos.roda.fotos}
          segundosPorVolta={trabalhos.roda.segundosPorVolta}
          titulo="Galeria giratória"
          aoAbrir={(indice) => abrir(trabalhos.roda.fotos, indice)}
        />
      </LazyPerto>

      {trabalhos.folha.fotos.length > 0 && (
        <LazyPerto fallback={<div className={css.reservaFolha} aria-hidden="true" />}>
          <Folha
            categorias={trabalhos.folha.categorias}
            fotos={trabalhos.folha.fotos}
            mostrarDadosTecnicos={trabalhos.mostrarDadosTecnicos}
            aoAbrir={abrir}
          />
        </LazyPerto>
      )}

      {aberta && (
        <Suspense fallback={null}>
          <Lightbox
            fotos={aberta.ids}
            indice={aberta.indice}
            rotulo={trabalhos.titulo}
            aoFechar={fechar}
            aoMudar={mudar}
          />
        </Suspense>
      )}
    </section>
  );
}
