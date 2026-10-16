/**
 * Lista tudo que ainda precisa ser confirmado com o estúdio:  npm run confirmar
 * Lê src/config/site.config.ts procurando marcações [CONFIRMAR], textos provisórios entre colchetes
 * ([CIDADE], [UF], [VALOR]) e os campos opcionais que ainda não foram preenchidos.
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { siteConfig } from '../src/config/site.config.ts';

const RAIZ = fileURLToPath(new URL('..', import.meta.url));
const ARQUIVO = path.join(RAIZ, 'src', 'config', 'site.config.ts');

const linhas = (await readFile(ARQUIVO, 'utf8')).split('\n');
const pendentes: { linha: number; texto: string }[] = [];
linhas.forEach((texto, i) => {
  if (/\[CONFIRMAR|\[CIDADE\]|\[UF\]|\[VALOR\]/.test(texto)) {
    pendentes.push({ linha: i + 1, texto: texto.trim() });
  }
});

const n = siteConfig.negocio;
const faltando: string[] = [];
if (!n.endereco) faltando.push('negocio.endereco');
if (!n.mapsUrl) faltando.push('negocio.mapsUrl');
if (!n.instagram) faltando.push('negocio.instagram');
if (!n.email) faltando.push('negocio.email');
if (!n.horarios?.length) faltando.push('negocio.horarios');
if (!siteConfig.depoimentos.length) faltando.push('depoimentos (seção some sem eles)');
if (!siteConfig.linkAvaliacoesGoogle) faltando.push('linkAvaliacoesGoogle');
if (siteConfig.pacotes.itens.some((p) => p.valor === null))
  faltando.push('pacotes[].valor (hoje "[VALOR]")');
if (siteConfig.modoDemo) faltando.push('modoDemo ainda true: prévia com selo e modo apresentação');
if (!siteConfig.meta.indexar) faltando.push('meta.indexar ainda false (noindex)');

console.log(`\n${pendentes.length} marcações em site.config.ts:\n`);
for (const p of pendentes) console.log(`  linha ${String(p.linha).padStart(3)}  ${p.texto}`);
console.log(`\nCampos ainda não preenchidos (${faltando.length}):\n`);
for (const f of faltando) console.log(`  - ${f}`);
console.log('');
