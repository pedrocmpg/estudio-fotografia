import { lazy } from 'react';
import { useSiteConfig } from '../../apresentacao/previa.tsx';
import { LazyPerto } from '../../components/LazyPerto.tsx';
import { Reveal } from '../../components/Reveal.tsx';
import { RotuloSecao } from '../../components/RotuloSecao.tsx';
import css from './Trabalhos.module.css';

// A roda é um chunk à parte: só baixa quando a seção chega perto da tela.
const Roda = lazy(() => import('./Roda.tsx'));

/**
 * Trabalhos (SPEC §7.6). Fase 1: só a roda 3D; folha de contato e lightbox entram na Fase 2.
 */
export function Trabalhos() {
  const { trabalhos } = useSiteConfig();
  return (
    <section id="trabalhos" className={css.secao} aria-labelledby="trabalhos-titulo">
      <div className="container">
        <Reveal>
          <RotuloSecao secao="trabalhos" />
          <h2 id="trabalhos-titulo" className={css.titulo}>
            {trabalhos.titulo}
          </h2>
        </Reveal>
      </div>
      <LazyPerto fallback={<div className={css.reserva} aria-hidden="true" />}>
        <Roda
          fotos={trabalhos.roda.fotos}
          segundosPorVolta={trabalhos.roda.segundosPorVolta}
          titulo={trabalhos.titulo}
        />
      </LazyPerto>
    </section>
  );
}
