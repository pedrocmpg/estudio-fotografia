import type { TemaId } from '../config/types.ts';

export const TEMAS: readonly TemaId[] = ['camara-escura', 'luz-natural'];

/** Abaixo disso as cortinas usam as fotos `*Mobile` (verticais). */
export const MEDIA_MOBILE = '(max-width: 640px)';

/**
 * Celular = tela estreita OU ponteiro de toque (SPEC §11). Nunca detecção de aparelho/user-agent.
 * O CSS repete esta consulta literalmente nos `@media`.
 */
export const MEDIA_CELULAR = '(max-width: 767px), (pointer: coarse)';

export const CHAVE_INTRO_VISTA = 'intro-vista';
