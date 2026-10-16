/**
 * Plugin do Vite: tudo que o build injeta a partir do config (SPEC §13, §7.2, §5, §14).
 *  - valida o config contra o manifest de fotos (falha o build se foto sem alt / id inexistente)
 *  - checa contraste dos temas e das cores de destaque (avisa no terminal)
 *  - injeta título, descrição, canonical, Open Graph, Twitter Card, theme-color, noindex, JSON-LD
 *  - injeta o script inline que decide tema e intro antes da primeira pintura
 *  - pré-carrega as fotos da camada 1 da abertura e a fonte display do tema ativo
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import type { HtmlTagDescriptor, Plugin, ResolvedConfig } from 'vite';
import { siteConfig } from '../src/config/site.config.ts';
import type { SiteConfig, TemaId } from '../src/config/types.ts';
import { validarConfig } from '../src/config/validar.ts';
import type { FotoManifesto } from '../src/data/fotos.types.ts';
import { contraste, corSobre, garantirContraste } from '../src/lib/cor.ts';
import { CHAVE_INTRO_VISTA, MEDIA_MOBILE, TEMAS } from '../src/lib/constantes.ts';
import { gerarScriptInicial } from './script-inicial.ts';
import { checarContraste, lerTokensDosTemas, type Tokens } from './tokens.ts';

/** Arquivo (fontsource) da fonte display de cada tema, para o preload. */
const FONTE_DISPLAY: Record<TemaId, RegExp> = {
  'camara-escura': /bodoni-moda-latin-400-normal.*\.woff2$/,
  'luz-natural': /cormorant-garamond-latin-500-normal.*\.woff2$/,
};

function escapar(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

interface Contexto {
  config: SiteConfig;
  manifesto: FotoManifesto[];
  tokens: Record<TemaId, Tokens>;
  baseUrl: string;
}

function jsonLd(c: SiteConfig, base: string): object {
  const n = c.negocio;
  const dados: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: n.nome,
    url: base,
    image: `${base}/og.jpg`,
    telephone: `+${n.whatsapp}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: n.cidade,
      addressRegion: n.uf,
      ...(n.endereco ? { streetAddress: n.endereco } : null),
      addressCountry: 'BR',
    },
  };
  if (n.instagram) dados.sameAs = [`https://instagram.com/${n.instagram}`];
  if (n.horarios?.length) dados.openingHours = n.horarios.map((h) => `${h.dias} ${h.horas}`);
  return dados;
}

function tagsDoHead(ctx: Contexto, bundle?: Record<string, unknown>): HtmlTagDescriptor[] {
  const { config: c, manifesto, tokens, baseUrl } = ctx;
  const ativo = c.tema.ativo;
  const bg = (t: TemaId) => c.meta.corNavegador ?? tokens[t]['--bg']!;
  const tags: HtmlTagDescriptor[] = [];
  const meta = (attrs: Record<string, string>) =>
    tags.push({ tag: 'meta', attrs, injectTo: 'head' });

  // 0) O charset precisa estar nos primeiros 1024 bytes, então vem antes do script inline.
  tags.push({ tag: 'meta', attrs: { charset: 'UTF-8' }, injectTo: 'head-prepend' });

  // 1) Primeiro de tudo: decide tema e intro antes da primeira pintura. O theme-color vem antes
  //    do script porque o script o atualiza conforme o tema escolhido pela URL.
  tags.push({
    tag: 'meta',
    attrs: { name: 'theme-color', content: bg(ativo) },
    injectTo: 'head-prepend',
  });
  tags.push({
    tag: 'script',
    children: gerarScriptInicial({
      temaPadrao: ativo,
      temas: TEMAS,
      introAtiva: c.hero.intro.ativo,
      umaVezPorSessao: c.hero.intro.umaVezPorSessao,
      corNavegador: { 'camara-escura': bg('camara-escura'), 'luz-natural': bg('luz-natural') },
      chaveIntroVista: CHAVE_INTRO_VISTA,
    }),
    injectTo: 'head-prepend',
  });

  // 2) Fundo da página já na cor do tema, para não piscar antes do CSS chegar.
  tags.push({
    tag: 'style',
    children:
      `html{background:${tokens[ativo]['--bg']}}` +
      TEMAS.map((t) => `html[data-theme='${t}']{background:${tokens[t]['--bg']}}`).join(''),
    injectTo: 'head',
  });

  // 3) Cores de destaque do estúdio (coresDestaque) por cima dos tokens do tema.
  const destaques = Object.entries(c.tema.coresDestaque ?? {}) as [TemaId, string][];
  if (destaques.length) {
    const regras = destaques.map(([tema, cor]) => {
      const texto = garantirContraste(cor, tokens[tema]['--bg']!);
      return `html:root[data-theme='${tema}']{--accent:${cor};--accent-texto:${texto};--on-accent:${corSobre(cor)}}`;
    });
    tags.push({ tag: 'style', children: regras.join(''), injectTo: 'head' });
  }

  // 4) SEO e prévia do link
  meta({ name: 'description', content: c.meta.descricao });
  if (!c.meta.indexar) meta({ name: 'robots', content: 'noindex' });
  tags.push({ tag: 'link', attrs: { rel: 'canonical', href: `${baseUrl}/` }, injectTo: 'head' });

  const imagem = `${baseUrl}/og.jpg`;
  meta({ property: 'og:type', content: 'website' });
  meta({ property: 'og:locale', content: 'pt_BR' });
  meta({ property: 'og:site_name', content: c.negocio.nome });
  meta({ property: 'og:title', content: c.meta.titulo });
  meta({ property: 'og:description', content: c.meta.descricao });
  meta({ property: 'og:url', content: `${baseUrl}/` });
  meta({ property: 'og:image', content: imagem });
  meta({ property: 'og:image:width', content: '1200' });
  meta({ property: 'og:image:height', content: '630' });
  meta({ property: 'og:image:alt', content: `${c.negocio.nome}` });
  meta({ name: 'twitter:card', content: 'summary_large_image' });
  meta({ name: 'twitter:title', content: c.meta.titulo });
  meta({ name: 'twitter:description', content: c.meta.descricao });
  meta({ name: 'twitter:image', content: imagem });

  // Dados estruturados só em produção: na prévia os dados ainda não estão confirmados.
  if (c.meta.indexar && !c.modoDemo) {
    tags.push({
      tag: 'script',
      attrs: { type: 'application/ld+json' },
      children: JSON.stringify(jsonLd(c, baseUrl)),
      injectTo: 'head',
    });
  }

  // 5) Favicons
  tags.push({
    tag: 'link',
    attrs: { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
    injectTo: 'head',
  });
  tags.push({
    tag: 'link',
    attrs: { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
    injectTo: 'head',
  });

  // 6) Preload: fotos da camada 1 da abertura (só AVIF; quem não lê AVIF ignora pelo type)
  if (c.hero.intro.ativo) {
    const porId = new Map(manifesto.map((f) => [f.id, f]));
    const camada = c.hero.intro.camadas[0];
    const preload = (id: string | undefined, media?: string) => {
      const f = id ? porId.get(id) : undefined;
      if (!f) return;
      tags.push({
        tag: 'link',
        attrs: {
          rel: 'preload',
          as: 'image',
          type: 'image/avif',
          imagesrcset: f.srcset.avif,
          imagesizes: '50vw',
          fetchpriority: 'high',
          ...(media ? { media } : null),
        },
        injectTo: 'head',
      });
    };
    if (camada) {
      const temMobile = Boolean(camada.esquerdaMobile || camada.direitaMobile);
      const desktop = temMobile ? `(min-width: 641px)` : undefined;
      preload(camada.esquerda, desktop);
      preload(camada.direita, desktop);
      if (temMobile) {
        preload(camada.esquerdaMobile ?? camada.esquerda, MEDIA_MOBILE);
        preload(camada.direitaMobile ?? camada.direita, MEDIA_MOBILE);
      }
    }
  }

  // 7) Preload da fonte display do tema ativo (só no build, quando o nome com hash existe)
  if (bundle) {
    const nome = Object.keys(bundle).find((k) => FONTE_DISPLAY[ativo].test(k));
    if (nome) {
      tags.push({
        tag: 'link',
        attrs: {
          rel: 'preload',
          as: 'font',
          type: 'font/woff2',
          href: `/${nome}`,
          crossorigin: '',
        },
        injectTo: 'head',
      });
    }
  }

  // 8) Analytics sem cookies (opcional)
  if (c.analytics.provedor === 'cloudflare' && c.analytics.token) {
    tags.push({
      tag: 'script',
      attrs: {
        defer: '',
        src: 'https://static.cloudflareinsights.com/beacon.min.js',
        'data-cf-beacon': JSON.stringify({ token: c.analytics.token }),
      },
      injectTo: 'body',
    });
  }

  return tags;
}

/**
 * Embute o CSS de entrada no HTML: tira um pedido que bloquearia a primeira pintura. O CSS é
 * pequeno (~6 KB gzip); os CSS dos chunks lazy (roda, painel) continuam separados.
 */
function embutirCssPrincipal(html: string, bundle: Record<string, unknown> | undefined): string {
  if (!bundle) return html;
  const link = html.match(/<link rel="stylesheet"[^>]*href="\/(assets\/[^"]+\.css)"[^>]*>/);
  if (!link) return html;
  const arquivo = bundle[link[1]!] as { source?: string | Uint8Array } | undefined;
  if (arquivo?.source === undefined) return html;
  const css =
    typeof arquivo.source === 'string'
      ? arquivo.source
      : Buffer.from(arquivo.source).toString('utf8');
  return html.replace(link[0], () => `<style>${css}</style>`);
}

export function pluginSite(opcoes: { config?: SiteConfig } = {}): Plugin {
  const config = opcoes.config ?? siteConfig;
  let resolvida: ResolvedConfig;

  const carregar = (): Contexto => {
    const raiz = resolvida.root;
    const arqManifesto = path.join(raiz, 'src', 'data', 'fotos.manifest.json');
    if (!existsSync(arqManifesto)) {
      throw new Error('src/data/fotos.manifest.json não existe. Rode: npm run fotos');
    }
    const manifesto = JSON.parse(readFileSync(arqManifesto, 'utf8')) as FotoManifesto[];
    const tokens = lerTokensDosTemas(
      readFileSync(path.join(raiz, 'src', 'styles', 'temas.css'), 'utf8'),
    );
    const base = (process.env.SITE_URL ?? config.meta.urlCanonica).replace(/\/+$/, '');
    return { config, manifesto, tokens, baseUrl: base };
  };

  return {
    name: 'site-estudio',

    configResolved(c) {
      resolvida = c;
    },

    buildStart() {
      const ctx = carregar();
      const falhar = resolvida.command === 'build';
      const { erros, avisos } = validarConfig(config, ctx.manifesto);
      const problemas: string[] = [...erros];

      // Contraste dos temas e das cores de destaque
      for (const tema of TEMAS) {
        const tokens = { ...ctx.tokens[tema] };
        const cor = config.tema.coresDestaque?.[tema];
        if (cor) {
          tokens['--accent'] = cor;
          tokens['--on-accent'] = corSobre(cor);
          tokens['--accent-texto'] = garantirContraste(cor, tokens['--bg']!);
        }
        for (const r of checarContraste(tokens)) {
          if (!r.ok)
            avisos.push(
              `contraste (${tema}): ${r.par} = ${r.razao.toFixed(2)}:1, abaixo de 4,5:1.`,
            );
        }
      }

      // Texto claro sobre a foto do hero: avisa se o scrim for fraco para a cor dominante da foto.
      const fundo = config.hero.fundoFinal;
      const foto = ctx.manifesto.find((f) => f.id === fundo.foto);
      if (fundo.tipo === 'foto' && foto) {
        const escurecida = (v: number) => Math.round(v * (1 - fundo.scrim));
        const h = foto.cor.replace('#', '');
        const rgb = [0, 2, 4].map((i) => escurecida(parseInt(h.slice(i, i + 2), 16)));
        const cor = '#' + rgb.map((v) => v.toString(16).padStart(2, '0')).join('');
        const razao = contraste('#F6F1E9', cor);
        if (razao < 4.5) {
          avisos.push(
            `hero.fundoFinal: texto claro sobre a foto "${foto.id}" com scrim ${fundo.scrim} dá ~${razao.toFixed(1)}:1 (cor dominante). Suba o scrim ou troque a foto.`,
          );
        }
      }

      for (const a of avisos) this.warn(a);
      if (problemas.length) {
        const msg = `Config inválido:\n  - ${problemas.join('\n  - ')}`;
        if (falhar) this.error(msg);
        else this.warn(msg);
      }
    },

    transformIndexHtml: {
      // 'post': só aqui o bundle já tem os nomes com hash das fontes (para o preload).
      order: 'post',
      handler(html, ctx) {
        const dados = carregar();
        const tags = tagsDoHead(dados, ctx.bundle as Record<string, unknown> | undefined);
        let saida = html
          .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapar(config.meta.titulo)}</title>`)
          .replace('<!--shell-->', `<h1 class="sr-only">${escapar(config.negocio.nome)}</h1>`);
        saida = embutirCssPrincipal(saida, ctx.bundle as Record<string, unknown> | undefined);
        return { html: saida, tags };
      },
    },
  };
}
