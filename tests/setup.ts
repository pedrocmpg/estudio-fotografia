import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, expect, vi } from 'vitest';
import * as matchersAxe from 'vitest-axe/matchers';
import { definirMidia, restaurarMidia } from './helpers/midia.ts';

expect.extend(matchersAxe);

/** IntersectionObserver de mentira: avisa na hora que tudo está na tela. */
class IntersectionObserverFalso {
  constructor(private aviso: IntersectionObserverCallback) {}
  observe(alvo: Element) {
    queueMicrotask(() =>
      this.aviso(
        [{ isIntersecting: true, target: alvo, intersectionRatio: 1 } as IntersectionObserverEntry],
        this as unknown as IntersectionObserver,
      ),
    );
  }
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

class ResizeObserverFalso {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', IntersectionObserverFalso);
  vi.stubGlobal('ResizeObserver', ResizeObserverFalso);
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
  Element.prototype.scrollIntoView = vi.fn();
  definirMidia({});
  window.sessionStorage.clear();
  window.history.pushState({}, '', '/');
  document.documentElement.removeAttribute('data-intro');
  document.documentElement.removeAttribute('data-theme');
  document.documentElement.removeAttribute('style');
});

afterEach(() => {
  cleanup();
  restaurarMidia();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
