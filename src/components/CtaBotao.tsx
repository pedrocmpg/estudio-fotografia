import { useSiteConfig } from '../apresentacao/previa.tsx';
import type { Cta } from '../config/types.ts';
import { atributoPedido, ehExterno, hrefDoCta } from '../lib/cta.ts';
import { Botao, type VarianteBotao } from './Botao.tsx';

interface Props {
  cta: Cta;
  variante?: VarianteBotao;
  sessaoId?: string;
  className?: string;
}

export function CtaBotao({ cta, variante, sessaoId, className }: Props) {
  const config = useSiteConfig();
  const href = hrefDoCta(config, cta, { sessaoId });
  const externo = ehExterno(href);
  return (
    <Botao
      variante={variante}
      className={className}
      href={href}
      {...(cta.acao === 'pedido' ? atributoPedido(config, { sessaoId }) : null)}
      {...(externo ? { target: '_blank', rel: 'noopener noreferrer' } : null)}
    >
      {cta.rotulo}
    </Botao>
  );
}
