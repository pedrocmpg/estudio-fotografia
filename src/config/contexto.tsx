import { createContext, useContext, type ReactNode } from 'react';
import { siteConfig } from './site.config.ts';
import type { SiteConfig } from './types.ts';

const ConfigContext = createContext<SiteConfig>(siteConfig);

export function ConfigProvider({ config, children }: { config: SiteConfig; children: ReactNode }) {
  return <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>;
}

/** Config base, sem as trocas do modo apresentação. */
export function useConfigBase(): SiteConfig {
  return useContext(ConfigContext);
}
