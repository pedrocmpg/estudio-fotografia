import { useEffect, useRef } from 'react';
import { corSobre, garantirContraste } from '../lib/cor.ts';
import { usePrevia } from './previa.tsx';

const FUNDOS = { 'camara-escura': '#0E0C0A', 'luz-natural': '#F6F1E9' } as const;

/**
 * Aplica no <html> o que a prévia escolheu: data-theme e a cor de destaque. O estado inicial
 * já veio do script do <head>, então na primeira pintura nada muda (sem flash).
 */
export function TemaEfeito() {
  const { tema, acento } = usePrevia();
  const primeira = useRef(true);

  useEffect(() => {
    const raiz = document.documentElement;
    const mudou = raiz.dataset.theme !== tema;
    if (mudou && !primeira.current) {
      raiz.classList.add('troca-tema');
      window.setTimeout(() => raiz.classList.remove('troca-tema'), 450);
    }
    raiz.dataset.theme = tema;
    primeira.current = false;
  }, [tema]);

  useEffect(() => {
    const raiz = document.documentElement;
    const props = ['--accent', '--accent-texto', '--on-accent'];
    if (!acento) {
      props.forEach((p) => raiz.style.removeProperty(p));
      return;
    }
    raiz.style.setProperty('--accent', acento);
    raiz.style.setProperty('--accent-texto', garantirContraste(acento, FUNDOS[tema]));
    raiz.style.setProperty('--on-accent', corSobre(acento));
  }, [acento, tema]);

  return null;
}
