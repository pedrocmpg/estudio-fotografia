import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { useSiteConfig } from '../../apresentacao/previa.tsx';
import botao from '../../components/Botao.module.css';
import { IconeSeta } from '../../components/icones.tsx';
import { Reveal } from '../../components/Reveal.tsx';
import { TituloSecao } from '../../components/TituloSecao.tsx';
import {
  ATRIBUTO_PEDIDO_ALVO,
  formatarData,
  gruposDeTipos,
  montarMensagem,
  numeroDoPedido,
  textoDoTipo,
  TIPO_OUTRO,
  urlWhatsapp,
} from '../../lib/pedido.ts';
import { ATRIBUTO_OCULTA_WHATSAPP } from '../WhatsappFlutuante/WhatsappFlutuante.tsx';
import css from './Pedido.module.css';

const DURACAO_OBTURADOR_MS = 300;

/**
 * Pedido (SPEC §10.12): formulário que monta a mensagem e abre o WhatsApp em outra aba. Não guarda
 * nada. O "tipo" vem de `sessoes` + `presentes` e pode ser pré-selecionado por qualquer link com
 * `data-pedido-alvo` (cartões de sessão, pacotes). O botão faz um "clique de obturador" no envio.
 */
export function Pedido() {
  const config = useSiteConfig();
  const { pedido, negocio } = config;
  const uid = useId();
  const grupos = gruposDeTipos(config);
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState('');
  const [data, setData] = useState('');
  const [local, setLocal] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [obturador, setObturador] = useState(false);
  const campoNome = useRef<HTMLInputElement>(null);

  // Qualquer link "Pedir …" da página escolhe o tipo antes de rolar até aqui.
  useEffect(() => {
    const aoClicar = (e: MouseEvent) => {
      const alvo = (e.target as Element | null)?.closest?.(`[${ATRIBUTO_PEDIDO_ALVO}]`);
      const valor = alvo?.getAttribute(ATRIBUTO_PEDIDO_ALVO);
      if (valor) setTipo(valor);
    };
    document.addEventListener('click', aoClicar);
    return () => document.removeEventListener('click', aoClicar);
  }, []);

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      setErro('Escreva seu nome para a conversa começar.');
      campoNome.current?.focus();
      return;
    }
    setErro('');
    const texto = montarMensagem(pedido.modeloMensagem, {
      nomeCurto: negocio.nomeCurto,
      nome,
      tipo: textoDoTipo(config, tipo),
      data: data ? formatarData(data) : undefined,
      local,
      mensagem,
    });
    setObturador(true);
    window.setTimeout(() => setObturador(false), DURACAO_OBTURADOR_MS);
    window.open(urlWhatsapp(numeroDoPedido(config, tipo), texto), '_blank', 'noopener,noreferrer');
  };

  const id = (campo: string) => `${uid}-${campo}`;

  return (
    <section
      id="pedido"
      className={css.secao}
      aria-labelledby="pedido-titulo"
      {...{ [ATRIBUTO_OCULTA_WHATSAPP]: '' }}
    >
      <div className={`container ${css.grade}`}>
        <div className={css.cabeca}>
          <TituloSecao id="pedido-titulo" texto={pedido.titulo} secao="pedido" />
          {pedido.texto && (
            <Reveal>
              <p className={css.texto}>{pedido.texto}</p>
            </Reveal>
          )}
        </div>

        <form className={css.form} onSubmit={enviar} noValidate>
          <div className={css.campo} data-ok={nome.trim() ? '' : undefined}>
            <label htmlFor={id('nome')}>
              Seu nome <span className={css.obrigatorio}>(obrigatório)</span>
            </label>
            <input
              ref={campoNome}
              id={id('nome')}
              name="nome"
              type="text"
              autoComplete="name"
              required
              aria-required="true"
              aria-invalid={erro ? true : undefined}
              aria-describedby={erro ? id('erro') : undefined}
              value={nome}
              onChange={(e) => {
                setNome(e.target.value);
                if (erro) setErro('');
              }}
            />
            {erro && (
              <p id={id('erro')} className={css.erro} role="alert">
                {erro}
              </p>
            )}
          </div>

          <div className={css.campo} data-ok={tipo ? '' : undefined}>
            <label htmlFor={id('tipo')}>O que você quer</label>
            <select
              id={id('tipo')}
              name="tipo"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
            >
              <option value="">Escolha uma opção</option>
              {grupos.map((g) => (
                <optgroup key={g.grupo} label={g.grupo}>
                  {g.opcoes.map((o) => (
                    <option key={o.valor} value={o.valor}>
                      {o.rotulo}
                    </option>
                  ))}
                </optgroup>
              ))}
              <option value={TIPO_OUTRO}>Outro</option>
            </select>
          </div>

          <div className={css.duas}>
            <div className={css.campo} data-ok={data ? '' : undefined}>
              <label htmlFor={id('data')}>
                Data que pensou <span className={css.opcional}>(opcional)</span>
              </label>
              <input
                id={id('data')}
                name="data"
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
              />
            </div>
            <div className={css.campo} data-ok={local.trim() ? '' : undefined}>
              <label htmlFor={id('local')}>
                Cidade ou local <span className={css.opcional}>(opcional)</span>
              </label>
              <input
                id={id('local')}
                name="local"
                type="text"
                autoComplete="address-level2"
                value={local}
                onChange={(e) => setLocal(e.target.value)}
              />
            </div>
          </div>

          <div className={css.campo} data-ok={mensagem.trim() ? '' : undefined}>
            <label htmlFor={id('mensagem')}>
              Mensagem <span className={css.opcional}>(opcional)</span>
            </label>
            <textarea
              id={id('mensagem')}
              name="mensagem"
              rows={4}
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className={`${botao.botao} ${botao.primario} ${css.enviar}`}
            data-obturador={obturador || undefined}
          >
            <span>Enviar pelo WhatsApp</span>
            <IconeSeta className={botao.seta} />
          </button>
          <p className={css.privacidade}>
            Seus dados vão direto para a conversa no WhatsApp. Não guardamos nada aqui.
          </p>
        </form>
      </div>
    </section>
  );
}
