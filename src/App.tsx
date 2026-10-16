import { LazyMotion, MotionConfig, domAnimation } from 'motion/react';
import { lazy, Suspense } from 'react';
import { PreviaProvider, useSiteConfig } from './apresentacao/previa.tsx';
import { TemaEfeito } from './apresentacao/TemaEfeito.tsx';
import { PuloDeConteudo } from './components/PuloDeConteudo.tsx';
import { Selo } from './components/Selo.tsx';
import { ConfigProvider } from './config/contexto.tsx';
import { secoesAtivas } from './config/secoes.ts';
import { siteConfig } from './config/site.config.ts';
import type { SecaoId, SiteConfig } from './config/types.ts';
import { parametrosDaUrl } from './lib/ambiente.ts';
import { IntroProvider, useIntro } from './motion/intro.tsx';
import { CtaFinal } from './sections/CtaFinal/CtaFinal.tsx';
import { Faixa } from './sections/Faixa/Faixa.tsx';
import { Header } from './sections/Header/Header.tsx';
import { BotaoPularIntro } from './sections/Hero/BotaoPularIntro.tsx';
import { Hero } from './sections/Hero/Hero.tsx';
import { Rodape } from './sections/Rodape/Rodape.tsx';
import { Sessoes } from './sections/Sessoes/Sessoes.tsx';
import { Trabalhos } from './sections/Trabalhos/Trabalhos.tsx';
import { WhatsappFlutuante } from './sections/WhatsappFlutuante/WhatsappFlutuante.tsx';

// O painel do modo apresentação é um chunk à parte (SPEC §11).
const Painel = lazy(() => import('./apresentacao/Painel.tsx'));

function Secao({ id }: { id: SecaoId }) {
  switch (id) {
    case 'intro':
      return <Hero />;
    case 'faixa':
      return <Faixa />;
    case 'sessoes':
      return <Sessoes />;
    case 'trabalhos':
      return <Trabalhos />;
    case 'ctaFinal':
      return <CtaFinal />;
    default:
      return null; // seções da Fase 2 ainda não existem
  }
}

function Pagina() {
  const config = useSiteConfig();
  const { estado } = useIntro();
  const secoes = secoesAtivas(config);
  const apresentar = config.modoDemo && parametrosDaUrl().get('apresentar') === '1';
  // O selo fixo só aparece depois da abertura, para não competir com ela.
  const mostrarSelo = config.modoDemo && estado.fase !== 'rodando';

  return (
    <>
      <TemaEfeito />
      <BotaoPularIntro />
      <PuloDeConteudo />
      <Header />
      <main id="conteudo" tabIndex={-1}>
        {secoes.map((id) => (
          <Secao key={id} id={id} />
        ))}
      </main>
      <Rodape />
      <WhatsappFlutuante />
      {config.tema.granulado && <div className="grao" aria-hidden="true" />}
      {mostrarSelo && (
        <div role="note">
          <Selo flutuante />
        </div>
      )}
      {apresentar && (
        <Suspense fallback={null}>
          <Painel />
        </Suspense>
      )}
    </>
  );
}

export function App({ config = siteConfig }: { config?: SiteConfig }) {
  return (
    <ConfigProvider config={config}>
      <PreviaProvider>
        <LazyMotion features={domAnimation} strict>
          <MotionConfig reducedMotion="user">
            <IntroProvider>
              <Pagina />
            </IntroProvider>
          </MotionConfig>
        </LazyMotion>
      </PreviaProvider>
    </ConfigProvider>
  );
}
