import { act, render, screen } from '@testing-library/react';
import { LazyMotion, MotionConfig, domAnimation } from 'motion/react';
import type { ReactNode } from 'react';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';
import { PreviaProvider } from '../src/apresentacao/previa.tsx';
import { ConfigProvider } from '../src/config/contexto.tsx';
import { siteConfigAlt } from '../src/config/site.config.alt.ts';
import type { TemaId } from '../src/config/types.ts';
import { IntroProvider } from '../src/motion/intro.tsx';
import { CtaFinal } from '../src/sections/CtaFinal/CtaFinal.tsx';
import { Faixa } from '../src/sections/Faixa/Faixa.tsx';
import { Header } from '../src/sections/Header/Header.tsx';
import { BotaoPularIntro } from '../src/sections/Hero/BotaoPularIntro.tsx';
import { Hero } from '../src/sections/Hero/Hero.tsx';
import { Rodape } from '../src/sections/Rodape/Rodape.tsx';
import { Sessoes } from '../src/sections/Sessoes/Sessoes.tsx';
import { Trabalhos } from '../src/sections/Trabalhos/Trabalhos.tsx';
import { WhatsappFlutuante } from '../src/sections/WhatsappFlutuante/WhatsappFlutuante.tsx';
import { definirMidia } from './helpers/midia.ts';
import { renderApp } from './helpers/render.tsx';

// jsdom não calcula layout nem cor: o contraste é coberto por tests/contraste.test.ts
// e pelo Lighthouse. "region" só faz sentido na página inteira, não em uma seção solta.
const REGRAS_SECAO = {
  rules: { 'color-contrast': { enabled: false }, region: { enabled: false } },
};
const REGRAS_PAGINA = { rules: { 'color-contrast': { enabled: false } } };

function Envelope({ children }: { children: ReactNode }) {
  return (
    <ConfigProvider config={siteConfigAlt}>
      <PreviaProvider>
        <LazyMotion features={domAnimation} strict>
          <MotionConfig reducedMotion="user">
            <IntroProvider>{children}</IntroProvider>
          </MotionConfig>
        </LazyMotion>
      </PreviaProvider>
    </ConfigProvider>
  );
}

const SECOES: [string, () => ReactNode][] = [
  ['Header', () => <Header />],
  [
    'Hero (com intro rodando)',
    () => (
      <>
        <BotaoPularIntro />
        <Hero />
      </>
    ),
  ],
  ['Faixa', () => <Faixa />],
  ['Sessões', () => <Sessoes />],
  ['Trabalhos (roda 3D)', () => <Trabalhos />],
  ['CTA final', () => <CtaFinal />],
  ['Rodapé', () => <Rodape />],
  ['WhatsApp flutuante', () => <WhatsappFlutuante />],
];

const TEMAS: TemaId[] = ['camara-escura', 'luz-natural'];

describe('acessibilidade (axe)', () => {
  for (const tema of TEMAS) {
    for (const [nome, secao] of SECOES) {
      it(`${nome} — tema ${tema}`, async () => {
        document.documentElement.dataset.theme = tema;
        const { container } = render(<Envelope>{secao()}</Envelope>);
        await act(async () => {
          await Promise.resolve();
        });
        expect(await axe(container, REGRAS_SECAO)).toHaveNoViolations();
      });
    }

    it(`página inteira, abertura rodando — tema ${tema}`, async () => {
      document.documentElement.dataset.theme = tema;
      const { container } = await renderApp();
      expect(await axe(container, REGRAS_PAGINA)).toHaveNoViolations();
    });

    it(`página inteira, estado final — tema ${tema}`, async () => {
      definirMidia({ reduzido: true });
      document.documentElement.dataset.theme = tema;
      const { container } = await renderApp();
      expect(await axe(container, REGRAS_PAGINA)).toHaveNoViolations();
    });
  }

  it('sanidade: o axe realmente reprova problemas conhecidos', async () => {
    const { container } = render(<img src="x.jpg" />);
    const resultado = await axe(container, REGRAS_SECAO);
    expect(resultado.violations.map((v) => v.id)).toContain('image-alt');
  });

  it('um único h1 e títulos em ordem', async () => {
    definirMidia({ reduzido: true });
    await renderApp();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    const niveis = screen.getAllByRole('heading').map((h) => Number(h.tagName[1]));
    for (let i = 1; i < niveis.length; i++) {
      expect(niveis[i]! - niveis[i - 1]!).toBeLessThanOrEqual(1);
    }
  });

  it('landmarks e link para pular ao conteúdo', async () => {
    definirMidia({ reduzido: true });
    await renderApp();
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Principal' })).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Pular para o conteúdo' })).toHaveAttribute(
      'href',
      '#conteudo',
    );
  });

  it('toda foto de conteúdo tem alt; as decorativas têm alt vazio', async () => {
    definirMidia({ reduzido: true });
    const { container } = await renderApp();
    const imgs = Array.from(container.querySelectorAll('img'));
    expect(imgs.length).toBeGreaterThan(0);
    for (const img of imgs) expect(img.hasAttribute('alt')).toBe(true);
    expect(imgs.some((i) => (i.getAttribute('alt') ?? '').length > 0)).toBe(true);
  });
});
