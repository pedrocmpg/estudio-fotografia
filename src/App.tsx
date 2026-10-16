import { LazyMotion, MotionConfig } from 'motion/react';
import { lazy, Suspense } from 'react';
import { PreviaProvider, useSiteConfig } from './apresentacao/previa.tsx';
import { TemaEfeito } from './apresentacao/TemaEfeito.tsx';
import { PuloDeConteudo } from './components/PuloDeConteudo.tsx';
import { ConfigProvider } from './config/contexto.tsx';
import { secoesAtivas } from './config/secoes.ts';
import { siteConfig } from './config/site.config.ts';
import type { SecaoId, SiteConfig } from './config/types.ts';
import { consulta, parametrosDaUrl } from './lib/ambiente.ts';
import { IntroProvider } from './motion/intro.tsx';
import { AntesDepois } from './sections/AntesDepois/AntesDepois.tsx';
import { Contato } from './sections/Contato/Contato.tsx';
import { CtaFinal } from './sections/CtaFinal/CtaFinal.tsx';
import { Depoimentos } from './sections/Depoimentos/Depoimentos.tsx';
import { Faixa } from './sections/Faixa/Faixa.tsx';
import { Faq } from './sections/Faq/Faq.tsx';
import { Header } from './sections/Header/Header.tsx';
import { Manifesto } from './sections/Manifesto/Manifesto.tsx';
import { BotaoPularIntro } from './sections/Hero/BotaoPularIntro.tsx';
import { Hero } from './sections/Hero/Hero.tsx';
import { Pacotes } from './sections/Pacotes/Pacotes.tsx';
import { Pedido } from './sections/Pedido/Pedido.tsx';
import { Presentes } from './sections/Presentes/Presentes.tsx';
import { Processo } from './sections/Processo/Processo.tsx';
import { Rodape } from './sections/Rodape/Rodape.tsx';
import { Sessoes } from './sections/Sessoes/Sessoes.tsx';
import { Trabalhos } from './sections/Trabalhos/Trabalhos.tsx';
import { WhatsappFlutuante } from './sections/WhatsappFlutuante/WhatsappFlutuante.tsx';

// Recursos de animação do motion: chunk à parte, fora do caminho do LCP.
const carregarRecursos = () => import('./motion/features.ts').then((m) => m.default);

// O cursor visor só existe com mouse e sem movimento reduzido: chunk à parte.
const CursorVisor = lazy(() => import('./components/CursorVisor.tsx'));

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
    case 'presentes':
      return <Presentes />;
    case 'manifesto':
      return <Manifesto />;
    case 'trabalhos':
      return <Trabalhos />;
    case 'antesDepois':
      return <AntesDepois />;
    case 'depoimentos':
      return <Depoimentos />;
    case 'processo':
      return <Processo />;
    case 'pacotes':
      return <Pacotes />;
    case 'pedido':
      return <Pedido />;
    case 'faq':
      return <Faq />;
    case 'ctaFinal':
      return <CtaFinal />;
    case 'contato':
      return <Contato />;
    default:
      return null;
  }
}

function Pagina() {
  const config = useSiteConfig();
  const secoes = secoesAtivas(config);
  const comMouse =
    consulta('(hover: hover) and (pointer: fine)') && !consulta('(prefers-reduced-motion: reduce)');
  const apresentar = config.modoDemo && parametrosDaUrl().get('apresentar') === '1';

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
      {comMouse && (
        <Suspense fallback={null}>
          <CursorVisor />
        </Suspense>
      )}
      {config.tema.granulado && <div className="grao" aria-hidden="true" />}
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
        <LazyMotion features={carregarRecursos} strict>
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
