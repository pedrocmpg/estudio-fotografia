import 'vitest';
import type { AxeMatchers } from 'vitest-axe/matchers';

// vitest-axe só declara os matchers para o namespace global antigo (Vi); isto cobre o vitest 3+.
declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unused-vars
  interface Assertion<T = any> extends AxeMatchers {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}
