import type { TemaId } from '../src/config/types.ts';

export interface OpcoesScriptInicial {
  temaPadrao: TemaId;
  temas: readonly TemaId[];
  introAtiva: boolean;
  umaVezPorSessao: boolean;
  /** Cor do theme-color por tema; o script atualiza a meta conforme o tema final. */
  corNavegador: Record<TemaId, string>;
  chaveIntroVista: string;
}

/**
 * Script inline do <head> (SPEC §7.2, "sem flash"): roda antes da primeira pintura e decide
 * tema e intro. Deixa o resultado em data-theme e data-intro no <html>; o React lê de lá.
 *
 * A regra da intro é a mesma de src/lib/introDecisao.ts — mantenha as duas em sincronia
 * (tests/script-inicial.test.ts confere as duas contra os mesmos cenários).
 */
export function gerarScriptInicial(o: OpcoesScriptInicial): string {
  const opcoes = JSON.stringify(o);
  return `(function(){var o=${opcoes},d=document.documentElement;try{
var q=new URLSearchParams(location.search),t=q.get('tema');
if(o.temas.indexOf(t)<0)t=o.temaPadrao;
d.setAttribute('data-theme',t);
var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content',o.corNavegador[t]);
var red=false;try{red=!!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)}catch(e){}
var vista=false;try{vista=window.sessionStorage.getItem(o.chaveIntroVista)==='1'}catch(e){}
var forcar=q.get('intro')==='1';
var roda=o.introAtiva&&!red&&(forcar||!(o.umaVezPorSessao&&vista));
d.setAttribute('data-intro',roda?'on':'done');
}catch(e){d.setAttribute('data-theme',o.temaPadrao)}})();`;
}
