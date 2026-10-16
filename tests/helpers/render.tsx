import { act, render, type RenderResult } from '@testing-library/react';
import { App } from '../../src/App.tsx';
import { siteConfigAlt } from '../../src/config/site.config.alt.ts';
import type { SiteConfig } from '../../src/config/types.ts';

/** Renderiza o App inteiro com o config fictício e espera os chunks lazy assentarem. */
export async function renderApp(config: SiteConfig = siteConfigAlt): Promise<RenderResult> {
  const resultado = render(<App config={config} />);
  await act(async () => {
    await Promise.resolve();
  });
  return resultado;
}

/** Cópia do config fictício com ajustes pontuais. */
export function configCom(ajuste: (c: SiteConfig) => void): SiteConfig {
  const copia = structuredClone(siteConfigAlt);
  ajuste(copia);
  return copia;
}
