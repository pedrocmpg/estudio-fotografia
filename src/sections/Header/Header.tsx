import { useEffect, useRef, useState } from 'react';
import { useSiteConfig } from '../../apresentacao/previa.tsx';
import { CtaBotao } from '../../components/CtaBotao.tsx';
import { INFO_SECOES, secoesAtivas } from '../../config/secoes.ts';
import { useIntro } from '../../motion/intro.tsx';
import css from './Header.module.css';

/**
 * Header (SPEC §7.1, versão desktop + celular sem menu; o menu em tela cheia entra na Fase 2).
 * Transparente sobre o hero, sólido depois dele; some ao rolar para baixo e volta ao rolar para cima.
 */
export function Header() {
  const config = useSiteConfig();
  const { estado } = useIntro();
  const ref = useRef<HTMLElement>(null);
  const [solido, setSolido] = useState(false);
  const [oculto, setOculto] = useState(false);

  useEffect(() => {
    let ultimo = window.scrollY;
    let pendente = false;

    const atualizar = () => {
      pendente = false;
      const y = window.scrollY;
      const hero = document.getElementById('topo');
      const limite = hero ? hero.offsetHeight - (ref.current?.offsetHeight ?? 72) : 0;
      setSolido(y > Math.max(limite, 8));

      const descendo = y > ultimo + 4;
      const subindo = y < ultimo - 4;
      // Foco dentro do header (teclado) não deixa ele fugir.
      const comFoco = ref.current?.contains(document.activeElement) ?? false;
      if (descendo && y > 200 && !comFoco) setOculto(true);
      else if (subindo || y <= 200) setOculto(false);
      if (descendo || subindo) ultimo = y;
    };

    const aoRolar = () => {
      if (pendente) return;
      pendente = true;
      requestAnimationFrame(atualizar);
    };

    atualizar();
    window.addEventListener('scroll', aoRolar, { passive: true });
    return () => window.removeEventListener('scroll', aoRolar);
  }, []);

  const links = secoesAtivas(config)
    .map((id) => INFO_SECOES[id])
    .filter((info) => info?.navegacao);

  // Escondido durante a intro; aparece em fade junto com o conteúdo final.
  const visivel = estado.fase !== 'rodando';

  return (
    <header
      ref={ref}
      className={css.header}
      data-solido={solido || undefined}
      data-oculto={oculto || undefined}
      data-visivel={visivel || undefined}
    >
      <div className={css.interno}>
        <a className={css.marca} href="#topo">
          {config.negocio.nome}
        </a>

        {links.length > 0 && (
          <nav className={css.nav} aria-label="Principal">
            <ul className={css.lista}>
              {links.map((info) => (
                <li key={info!.ancora}>
                  <a className={css.link} href={`#${info!.ancora}`}>
                    {info!.rotulo}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <CtaBotao cta={{ rotulo: 'Pedir sessão', acao: 'pedido' }} className={css.cta} />
      </div>
    </header>
  );
}
