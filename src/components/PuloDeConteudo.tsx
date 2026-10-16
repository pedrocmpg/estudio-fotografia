import css from './PuloDeConteudo.module.css';

export function PuloDeConteudo() {
  return (
    <a className={css.pulo} href="#conteudo">
      Pular para o conteúdo
    </a>
  );
}
