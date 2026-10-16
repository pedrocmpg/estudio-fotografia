# SPEC — Landing page do Estúdio Ivy (fotografia)

> Versão 1 · 15/10/2026 · Dev: Pedro · Comercial: Vitor
> Status: **prévia de venda**. O estúdio ainda não fechou. Tudo que não foi confirmado com eles está marcado como `[CONFIRMAR]`.

**Como usar esta spec no Claude Code:** leia o documento inteiro antes de escrever código. Implemente **só a Fase 1** (§15), pare e faça um relatório do que foi feito, do que ficou de fora e dos `[CONFIRMAR]` encontrados. Não invente dados do estúdio. Em caso de dúvida, siga a ordem de prioridade: **acessibilidade > desempenho no celular > efeito visual**.

---

## 0. Objetivo e princípios

**Objetivo do site:** fazer o visitante **pedir uma sessão pelo WhatsApp**. Todo o resto (efeitos, galeria, textos) existe para chegar nisso. A métrica principal é o clique em "Pedir sessão" / envio do formulário.

**Objetivo da prévia:** quando o Vitor mandar o link pelo WhatsApp e o estúdio abrir no celular, a primeira reação tem que ser "uau, isso é nosso?". A prévia precisa ser bonita em 3 segundos e rápida em 4G.

**Princípios (valem para toda decisão):**

1. **A foto é a estrela.** A interface recua; tipografia e movimento só emolduram. Nada de cor forte competindo com as fotos.
2. **Um efeito marcante por seção.** Não empilhar três animações na mesma tela. Cada seção tem uma "assinatura" (ver §7).
3. **Rápido no celular de verdade.** Android intermediário, 4G médio. Se um efeito não roda liso nisso, ele tem fallback mais simples.
4. **Nada inventado.** Sem depoimentos falsos, números ("+500 ensaios"), prêmios, anos de mercado ou promessas. Dado não confirmado = `[CONFIRMAR]` no config.
5. **Tudo configurável em um arquivo.** Textos, fotos, cores, ordem das seções, preços e telefone vivem em `src/config/site.config.ts`. Nenhum componente tem conteúdo do estúdio escrito dentro.
6. **Respeita quem usa.** `prefers-reduced-motion`, teclado, leitor de tela e contraste são requisitos, não extras.

---

## 1. Escopo

**Dentro:**

- Landing page única (one-page), responsiva, em português.
- **Dois temas completos** (escuro e claro) para o estúdio escolher; em produção fica um só.
- Abertura em **cortinas** (hero) com fotos de exemplo trocáveis.
- Galeria com efeitos de assinatura (roda 3D + folha de contato + lightbox).
- Seção de pacotes com **espaço para preços** (valores ainda não definidos).
- Formulário "Pedir sessão" que **abre o WhatsApp com a mensagem pronta** (sem backend).
- SEO básico, prévia bonita do link no WhatsApp/Instagram, dados estruturados.
- Modo apresentação para a reunião de venda (§11).
- Deploy da prévia + README de manutenção.

**Fora (agora):**

- Sistema de agendamento, área do cliente, galeria privada de entrega, pagamentos/sinal, backend, banco de dados, CMS, blog, multi-idioma. Ficam em §17 como upsell futuro.

### 1.1 Roteiro de como a prévia vai ser mostrada (pensar o site para isso)

1. Vitor manda **um link** no WhatsApp → a prévia do link (OG image) já tem que estar bonita.
2. O estúdio abre no celular → a abertura de cortinas roda uma vez, revela o nome deles.
3. Rola e vê as próprias categorias de sessão, galeria girando, pacotes com `[VALOR]`.
4. Vitor pergunta: "vocês preferem o escuro ou o claro?" e manda o **segundo link** (`?tema=luz-natural`). Escolher entre dois é mais fácil que aprovar um.
5. Na prévia aparece um selo discreto "Prévia · fotos ilustrativas" para ninguém achar que são fotos deles (honestidade).

---

## 2. Stack e estrutura

- **Vite + React 18 + TypeScript** (`strict: true`).
- **CSS com variáveis + CSS Modules** (sem framework de UI). Tokens de tema em `src/styles/temas.css`.
- **motion** (Framer Motion) com `LazyMotion` + `domAnimation` para orquestrar a intro e reveals; o resto em CSS.
- **lenis** para scroll suave **só no desktop** (desligado em touch e em reduced motion).
- **sharp** para o pipeline de fotos; **Playwright** (Chromium já instalado) para gerar a OG image.
- **@fontsource** (auto-hospedadas, subset latin) — nada de Google Fonts em runtime.
- **Vitest + Testing Library + vitest-axe** para testes.
- Node 20+, npm.

```
estudio-ivy/
├── fotos-originais/            # NÃO versionado (.gitignore) — fotos cruas
├── public/
│   ├── fotos/                  # saída do pipeline (versionada)
│   ├── og.jpg                  # gerada por scripts/og.ts
│   ├── favicon.svg, apple-touch-icon.png
│   └── robots.txt
├── scripts/
│   ├── fotos.ts                # pipeline de imagens (§6)
│   └── og.ts                   # gera og.jpg a partir da rota /og
├── src/
│   ├── config/
│   │   ├── types.ts            # tipos do config (§4)
│   │   ├── site.config.ts      # ÚNICO arquivo com dados do estúdio
│   │   └── site.config.alt.ts  # dados fictícios para testes
│   ├── data/
│   │   ├── fotos.meta.json     # entrada: alt, categoria, foco, licença…
│   │   └── fotos.manifest.json # saída do pipeline
│   ├── styles/                 # reset, tokens, temas, tipografia
│   ├── motion/                 # tokens de movimento, hooks (useReducedMotion, useInView, useScrollProgress)
│   ├── components/             # Foto, Botao, Lightbox, Selo, IconeWhatsApp…
│   ├── sections/               # uma pasta por seção (§7)
│   ├── apresentacao/           # painel do modo apresentação (lazy, §11)
│   ├── App.tsx
│   └── main.tsx
├── tests/
├── SPEC.md                     # este documento
└── README.md
```

---

## 3. Privacidade e dados

- O nome **Ivy** e qualquer dado real do estúdio aparecem **somente** em `src/config/site.config.ts`. Um teste garante isso (§16).
- `site.config.alt.ts` usa dados obviamente fictícios: nome `Estúdio Exemplo`, WhatsApp `5500900000000`, cidade `Cidade Exemplo`, e-mail `contato@exemplo.com`, Instagram `@estudioexemplo`. **Todos os testes usam esse arquivo.**
- `fotos-originais/` fica no `.gitignore`. Só entram no repositório as fotos **processadas** (sem EXIF, sem GPS, sem número de série da câmera).
- **Fotos de clientes do estúdio:** só entram com autorização do estúdio, e a autorização de uso de imagem das pessoas retratadas é responsabilidade do estúdio — registrar isso no README. Até lá, usar fotos de banco com licença livre (Unsplash/Pexels), com crédito e licença anotados em `fotos.meta.json`.
- **Depoimentos:** só reais e autorizados. Na prévia podem aparecer exemplos, **sempre com selo "EXEMPLO"**; com `modoDemo: false`, exemplos são removidos e, se a lista ficar vazia, a seção some.
- O formulário **não guarda nada**: só monta o texto e abre o WhatsApp. Texto abaixo do botão: "Seus dados vão direto para a conversa no WhatsApp. Não guardamos nada aqui."
- Enquanto for prévia: `noindex` (§13).

---

## 4. Schema do config (`src/config/types.ts`)

```ts
export type TemaId = 'camara-escura' | 'luz-natural';

export type SecaoId =
  | 'intro' | 'faixa' | 'sessoes' | 'manifesto' | 'trabalhos'
  | 'antesDepois' | 'processo' | 'pacotes' | 'depoimentos'
  | 'pedido' | 'faq' | 'ctaFinal' | 'contato';

/** Referência a uma foto pelo id do manifest (src/data/fotos.manifest.json). */
export type FotoId = string;

export interface Cta {
  rotulo: string;                          // "Pedir minha sessão"
  acao: 'pedido' | 'whatsapp' | 'ancora';  // pedido = rola até o formulário
  alvo?: string;                           // id da âncora, quando acao = 'ancora'
}

export interface SiteConfig {
  /** true = prévia: selo "fotos ilustrativas", [VALOR]/[CONFIRMAR] visíveis, modo apresentação disponível. */
  modoDemo: boolean;

  meta: {
    titulo: string;           // ≤ 60 caracteres
    descricao: string;        // ≤ 155 caracteres
    urlCanonica: string;
    indexar: boolean;         // false = <meta name="robots" content="noindex">
    corNavegador?: string;    // theme-color; padrão = --bg do tema ativo
  };

  negocio: {
    nome: string;             // "Estúdio Ivy" [CONFIRMAR grafia]
    nomeCurto: string;        // "Ivy"
    cidade: string;
    uf: string;
    endereco?: string;
    mapsUrl?: string;         // link "Abrir no mapa" (sem embed pesado)
    whatsapp: string;         // só dígitos com DDI, ex. 5500900000000
    instagram?: string;       // sem @
    email?: string;
    horarios?: { dias: string; horas: string }[];
    atendimento: ('estudio' | 'externo' | 'domicilio')[];
    creditoSite?: { texto: string; url?: string };
  };

  tema: {
    ativo: TemaId;
    permitirTroca: boolean;                          // alternância no rodapé (em produção: false)
    coresDestaque?: Partial<Record<TemaId, string>>; // sobrescreve --accent (o estúdio vai escolher cores)
    presetsDestaque?: string[];                      // usados no modo apresentação
    granulado: boolean;                              // grão de filme no tema escuro
  };

  /** Ordem e presença das seções. Seção fora da lista não renderiza. */
  secoes: SecaoId[];

  hero: {
    intro: {
      ativo: boolean;
      camadas: {                       // 2 camadas = 4 fotos (padrão); aceita 1 a 3
        esquerda: FotoId; direita: FotoId;
        esquerdaMobile?: FotoId; direitaMobile?: FotoId; // fotos verticais para celular
      }[];
      etapasPorCamada: number;         // 3
      duracaoEtapaMs: number;          // 450
      pausaEtapaMs: number;            // 120
      pausaCamadaMs: number;           // 300
      umaVezPorSessao: boolean;        // true
      mostrarPular: boolean;           // true
      mostrarContador: boolean;        // "01 / 02" em mono
      linhaDeLuz: boolean;             // fresta de luz na emenda (§7.2)
    };
    fundoFinal: { tipo: 'foto' | 'cor'; foto?: FotoId; scrim: number }; // scrim 0–1
    nome: string;
    destaque: {
      modo: 'cidade' | 'tagline' | 'rotativo';
      texto?: string;                  // cidade: "Fotografia em {cidade}"; tagline: frase
      itens?: string[];                // rotativo: ["Ensaios", "Casamentos", "Newborn", "Marcas"]
    };
    subtitulo?: string;
    ctas: { primario: Cta; secundario?: Cta };
  };

  faixa: { itens: string[]; segundosPorVolta: number };

  sessoes: {
    titulo: string;
    itens: { id: string; nome: string; frase: string; fotos: [FotoId, FotoId?] }[];
  };

  manifesto: { texto: string; palavrasDestaque: string[] };

  trabalhos: {
    titulo: string;
    roda: { fotos: FotoId[]; segundosPorVolta: number };          // 8–10 fotos
    folha: {
      categorias: string[];                                       // abas de filtro
      fotos: { id: FotoId; categoria: string; marcada?: boolean }[];
    };
    mostrarDadosTecnicos: boolean;                                // "f/1.8 · 1/250 · ISO 200"
  };

  antesDepois: { antes: FotoId; depois: FotoId; legenda: string }[]; // vazio = seção some

  processo: { titulo: string; passos: { titulo: string; texto: string }[] }; // 4 passos

  pacotes: {
    mostrar: boolean;
    titulo: string;
    nota?: string;                     // "Valores podem variar conforme data e local." [CONFIRMAR]
    itens: {
      id: string;
      nome: string;
      paraQuem: string;
      inclui: string[];
      entrega?: string;                // "até 15 dias" [CONFIRMAR]
      valor: number | null;            // null → "[VALOR]" na demo / "Sob consulta" em produção
      prefixoValor?: string;           // "a partir de"
      selo?: string;                   // "Mais pedido" — só se for verdade
      sessaoId?: string;               // pré-seleciona o tipo no formulário
    }[];
  };

  depoimentos: { texto: string; autor: string; sessao?: string; foto?: FotoId; exemplo: boolean }[];
  linkAvaliacoesGoogle?: string;

  pedido: {
    titulo: string;
    texto?: string;
    modeloMensagem: string;            // ver §7.11
  };

  faq: { pergunta: string; resposta: string }[];

  ctaFinal: { titulo: string; texto?: string; foto: FotoId; cortinaReversa: boolean; cta: Cta };

  analytics: { provedor: 'nenhum' | 'cloudflare'; token?: string };
}
```

**Valores padrão iniciais do `site.config.ts` (prévia):** `modoDemo: true`, `meta.indexar: false`, `tema.ativo: 'camara-escura'`, `tema.permitirTroca: false`, 2 camadas na intro, `destaque.modo: 'cidade'`, `fundoFinal.tipo: 'foto'` com `scrim: 0.45`, `pacotes.mostrar: true` com 3 pacotes de `valor: null`, `antesDepois: []`, `analytics.provedor: 'nenhum'`.

---

## 5. Temas

Aplicados por `data-theme` no `<html>`. Cada tema define tokens; componentes **só** usam tokens.

| Token | Câmara escura (`camara-escura`) | Luz natural (`luz-natural`) |
|---|---|---|
| `--bg` | `#0E0C0A` | `#F6F1E9` |
| `--surface` | `#171411` | `#FBF8F3` |
| `--text` | `#F2EBDD` | `#26201B` |
| `--text-2` | `#A79D8D` | `#6B6157` |
| `--accent` | âmbar `#E0A458` | terracota `#B5532D` |
| `--accent-texto` (texto pequeno em `--bg`) | `#E0A458` | `#9E4524` |
| `--on-accent` (texto sobre botão) | `#0E0C0A` | `#FFFFFF` |
| `--linha` | `rgba(242,235,221,.12)` | `rgba(38,32,27,.12)` |
| `--escuro` (faixas escuras no tema claro) | — | `#2A211B` |
| Fonte display | Bodoni Moda | Cormorant Garamond |
| Fonte texto | Schibsted Grotesk | Albert Sans |
| Fonte mono (legendas, números, metadados) | IBM Plex Mono | IBM Plex Mono |
| Textura | grão de filme (SVG estático, opacidade 0.05) | nenhuma |
| Personalidade | laboratório revelando filme, luz âmbar de câmara escura | estúdio com janela grande, luz de fim de tarde |

**Contraste (obrigatório ≥ 4.5:1 para texto normal):**

- `--text-2` sobre `--bg`: ~7.3:1 (escuro) e ~5.4:1 (claro). OK.
- Terracota `#B5532D` sobre `#F6F1E9` dá **~4.4:1** → reprovado para texto pequeno. Por isso existe `--accent-texto: #9E4524` (~5.6:1) para links e textos pequenos; `#B5532D` fica para botões (texto branco, ~5:1), ícones e títulos grandes.
- Se o estúdio trouxer cores próprias (`coresDestaque`), o build roda uma checagem de contraste e **avisa no terminal** se alguma combinação ficar abaixo de 4.5:1.

**Escala tipográfica (fluida, `clamp`):**

- Display (nome no hero): `clamp(3.5rem, 12vw, 10rem)`, peso 400–500, `letter-spacing: -0.02em`.
- H2: `clamp(2.25rem, 5vw, 4rem)`.
- Texto: `clamp(1rem, 1.1vw, 1.125rem)`, `line-height: 1.6`, máx. 65 caracteres por linha.
- Mono: `0.75rem`, `letter-spacing: 0.08em`, maiúsculas para rótulos.
- Títulos de seção no estilo editorial: rótulo mono numerado acima do H2 — `02 — TRABALHOS`.

**Fontes:** em produção carrega só as fontes do tema ativo. Pré-carregar (`preload`) apenas a fonte display. `font-display: swap` e fallback com métricas ajustadas (`size-adjust`) para não causar salto de layout.

---

## 6. Pipeline de fotos (`scripts/fotos.ts`)

**Entrada:** `fotos-originais/*.{jpg,jpeg,png,heic}` + `src/data/fotos.meta.json`:

```json
{
  "id": "ensaio-01",
  "arquivo": "IMG_1234.jpg",
  "alt": "Mulher rindo em campo de trigo ao pôr do sol",
  "categoria": "Ensaios",
  "foco": { "x": 0.5, "y": 0.35 },
  "credito": "Foto de exemplo — Unsplash",
  "licenca": "Unsplash License",
  "ilustrativa": true
}
```

**Saída por foto:**

- Larguras 480 / 960 / 1600 / 2400 (nunca aumentar além do original), em **AVIF** (q≈50), **WebP** (q≈72) e **JPEG** (q≈78, progressivo).
- Converter para sRGB, **remover todo metadado** (EXIF, GPS, serial).
- Antes de remover, extrair **só** dados técnicos de exposição (abertura, velocidade, ISO, distância focal) para `mostrarDadosTecnicos`. Nunca GPS, data, câmera ou serial.
- Placeholder: miniatura 16 px em base64 + cor dominante.
- Grava `src/data/fotos.manifest.json`: `{ id, largura, altura, proporcao, srcset: { avif, webp, jpg }, placeholder, cor, foco, alt, exposicao? }`.
- Idempotente: cache por hash do arquivo; só reprocessa o que mudou.
- **Modo placeholder:** se não houver fotos, gera retângulos em degradê com o rótulo `[FOTO — {categoria}]`, para o site buildar e ser apresentável sem nenhuma foto.
- Falha no build se uma foto usada no config não existir no manifest ou estiver **sem `alt`**.

**Componente `<Foto id sizes prioridade?>`:** `<picture>` com AVIF/WebP/JPEG, `width`/`height` reais (CLS zero), `object-position` a partir do `foco`, placeholder borrado com fade quando carrega, `loading="lazy"` e `decoding="async"` exceto quando `prioridade` (aí `fetchpriority="high"` e `loading="eager"`).

**Curadoria (orientação para escolher as fotos de exemplo e, depois, as do estúdio):**

- Total de 20 a 30 fotos. Variedade de categorias, mas **paleta coerente** (mesmo tipo de luz/tratamento).
- **Pares da cortina precisam conversar:** mesma temperatura de cor, assuntos que "se olham" (ex.: dois retratos virados um para o outro). Para o celular, cada metade da tela é uma tira vertical estreita → usar fotos verticais com o assunto centralizado (`esquerdaMobile`/`direitaMobile`).
- A foto do `fundoFinal` precisa aguentar texto por cima (área calma no centro).

---

## 7. Seções (ordem padrão)

### 7.1 Header

- Desktop: nome/logo à esquerda; links Sessões · Trabalhos · Como funciona · Pacotes · Dúvidas; botão "Pedir sessão" à direita.
- Transparente sobre o hero; depois do hero ganha fundo `--bg` com 85% de opacidade + `backdrop-filter: blur(12px)` e uma linha `--linha`.
- Some ao rolar para baixo, volta ao rolar para cima.
- Celular: nome + "Pedir sessão" + botão de menu (44×44). Menu em tela cheia com links grandes na fonte display, entrando em cascata (40 ms entre itens). Foco preso no menu aberto, `Esc` fecha.
- Escondido durante a intro (aparece com fade junto com o conteúdo final).

### 7.2 Intro em cortinas (assinatura da página)

**Ideia:** a página abre fechada por fotos. Cada "cortina" é um par de fotos, uma em cada metade da tela, que se abrem para os lados **em 3 etapas**, como um obturador. Depois da primeira cortina vem a segunda. Por trás de tudo, o nome do estúdio.

**Estrutura (de cima para baixo no eixo Z):**

1. Camada 1 (painel esquerdo + painel direito, cada um com 50% da largura).
2. Camada 2 (outro par).
3. Fundo final (foto principal com escurecimento `scrim`, ou cor) + conteúdo central: nome (h1), destaque, subtítulo, CTAs.

**Linha do tempo (padrão, 2 camadas):**

| Tempo | Acontece |
|---|---|
| 0–400 ms | Camada 1 fechada, parada. Contador `01 / 02` aparece. |
| 400 ms | Etapa 1: painéis vão de 0% para ∓33% (450 ms). A fresta revela a camada 2. |
| +120 ms pausa | — |
| Etapa 2 | ∓33% → ∓66% |
| +120 ms pausa | — |
| Etapa 3 | ∓66% → ∓100%. Camada 1 sai. Contador vira `02 / 02`. |
| +300 ms pausa | — |
| Camada 2 | Mesmas 3 etapas, revelando o fundo final. |
| fim | Nome sobe letra a letra por máscara (`clip-path`, 30 ms entre letras), destaque e CTAs em fade. Header aparece. |

Total ≈ 4,2 s. Movimento só com `transform: translate3d()`; easing `cubic-bezier(0.22, 1, 0.36, 1)`.

**Detalhes que fazem ficar bonito (não opcionais):**

- **Profundidade:** a foto dentro de cada painel anda **15% mais devagar** que o painel (contra-translação) e sai de `scale(1.08)` para `scale(1)`. Parece tecido/obturador, não dois divs deslizando.
- **Linha de luz** (`linhaDeLuz: true`): a cada etapa, a fresta entre os painéis acende por um instante com um brilho fino na cor `--accent` (gradiente vertical, 2 px, opacidade 0 → 0,8 → 0). É a "luz entrando pela cortina".
- Uma sombra interna leve na borda de cada painel para dar volume.

**Destaque central (escolha do estúdio, configurável):**

- `cidade` (padrão): **Ivy** + "Fotografia em {cidade}" + botão "Pedir minha sessão".
- `tagline`: **Ivy** + uma frase curta deles. `[CONFIRMAR]`
- `rotativo`: **Ivy** + tipos de sessão trocando a cada 2 s com máscara ("Ensaios", "Casamentos", "Newborn", "Marcas"). `[CONFIRMAR categorias]`

**Comportamento obrigatório:**

- O `<h1>` com o nome **existe no HTML desde o primeiro frame** (atrás das cortinas) — bom para SEO e leitor de tela.
- **Pular:** botão "Pular" (canto inferior direito, primeiro item focável) e também qualquer clique, toque, tecla, roda do mouse ou rolagem → vai direto ao estado final com fade de 250 ms. **Não travar a rolagem.**
- **Uma vez por sessão:** grava `intro-vista` em `sessionStorage` (sempre dentro de `try/catch`; se falhar, mostra a intro normalmente). `?intro=1` força rodar de novo.
- **Sem flash:** um script inline no `<head>` decide antes da primeira pintura se a intro vai rodar (JS ligado + sem reduced motion + não vista) e coloca `data-intro="on"` no `<html>`. O CSS só fecha as cortinas sob `[data-intro="on"]`. Sem JS ou com reduced motion → estado final direto.
- **Carregamento:** fotos da camada 1 vão no HTML do build com `<link rel="preload" fetchpriority="high">`. Camada 2 com prioridade normal. Se a camada 2 não tiver carregado quando chegar a vez dela, ela é **pulada** (vai direto ao fundo final). Nunca mostrar painel vazio.
- `will-change: transform` só durante a animação; removido no fim.
- Celular: mesmas cortinas, usando as fotos `*Mobile` verticais.

### 7.3 Faixa de sessões (marquee)

- Faixa horizontal infinita logo abaixo do hero com os tipos de sessão na fonte display, separados por um pequeno ícone de diafragma (SVG).
- ~40 s por volta; pausa no hover; parada fora da tela (IntersectionObserver).
- Conteúdo duplicado para o loop com `aria-hidden="true"`; a lista real fica legível uma vez.
- Reduced motion: lista estática quebrando linha.

### 7.4 Sessões — "O que a Ivy fotografa"

- Um card por tipo de sessão: foto, nome, frase curta, link "Pedir essa sessão" (rola até o formulário com o tipo **pré-selecionado**).
- Hover (desktop): a foto 1 dá lugar à foto 2 com crossfade + zoom leve de 1,04.
- Desktop: grade editorial assimétrica (cards de alturas diferentes, alinhados pela base). Celular: carrossel horizontal com `scroll-snap`, card central um pouco maior.
- Categorias iniciais `[CONFIRMAR]` (o estúdio "faz de tudo"): Ensaios pessoais · Gestante e casal · Família, newborn e infantil · Casamentos e eventos · 15 anos e formaturas · Marcas, produtos e corporativo.

### 7.5 Manifesto

- Um parágrafo grande na fonte display, centralizado, ocupando a tela.
- **As palavras acendem conforme a rolagem** (opacidade 0,2 → 1 ligada ao progresso do scroll); as `palavrasDestaque` ficam em itálico na cor `--accent`.
- Texto de exemplo `[CONFIRMAR — escrever com o estúdio]`: "A gente não pede pra você posar. A gente espera o momento em que você esquece que tem uma câmera ali."
- Reduced motion: texto todo aceso.

### 7.6 Trabalhos (galeria) — três peças

**a) Roda 3D**

- 8 a 10 fotos num anel 3D (`perspective: 1400px`; cada foto em `rotateY(i·360/n) translateZ(r)`).
- Gira sozinha (~60 s por volta). Arrastar gira com inércia (pointer events). Pausa no hover, no foco e fora da tela.
- Teclado: setas giram uma posição; `Enter` abre a foto da frente no lightbox. Cada foto é um `<button>` com o `alt` como rótulo.
- Celular / ponteiro grosso: vira carrossel horizontal com `scroll-snap` e escala no item central.
- Sem suporte a `preserve-3d` ou com reduced motion: grade simples.

**b) Folha de contato**

- Visual de folha de contato de filme: fundo `--surface`, fotos pequenas em grade, numeração de quadro em mono (`14A ▸`, `15 ▸`), bordas como negativo.
- Abas de filtro por categoria (Todos, Ensaios, Eventos…), com transição de layout suave.
- Ao entrar na tela, um **lápis vermelho** (SVG desenhado com `stroke-dashoffset`) circula as fotos `marcada: true`, como um fotógrafo escolhendo as melhores. Só círculos e um "✓" — nunca riscar fotos.
- Com `mostrarDadosTecnicos`: abaixo de cada quadro, em mono, `f/1.8 · 1/250 · ISO 200` (só se o dado existir).

**c) Lightbox**

- Tela cheia, fundo `--bg` 96%. `Esc` fecha, `←`/`→` navegam, arrastar no celular, contador `07 / 24`, legenda (alt ou legenda).
- Foco preso enquanto aberto, devolve o foco ao item de origem ao fechar.
- **View Transitions API** para a foto "voar" da miniatura para a tela cheia; sem suporte → fade.
- Carrega a resolução maior só ao abrir; pré-carrega a próxima.

### 7.7 Antes e depois (desligado por padrão)

- Slider de comparação (arrastar a divisória) para mostrar edição/tratamento, se o estúdio quiser.
- Acessível: a divisória é um `input type="range"` estilizado.
- `antesDepois: []` → seção não renderiza.

### 7.8 Como funciona — "linha de luz"

- 4 passos `[CONFIRMAR]`: **1. Conversa** (pelo WhatsApp, entender o que você quer) · **2. Planejamento** (local, horário, roupa) · **3. Sessão** · **4. Entrega** (prazo e formato `[CONFIRMAR]`).
- Uma linha vertical fina percorre os passos e **vai sendo preenchida de luz** (`--accent`) conforme a rolagem; cada passo "acende" (o ponto ganha um brilho) quando a luz chega nele.
- Mesmo layout no celular. Reduced motion: linha cheia, passos acesos.

### 7.9 Pacotes (espaço para preços)

- 2 a 4 cards: nome, para quem é, lista do que inclui, prazo de entrega, valor e botão "Quero esse" (pré-seleciona tipo no formulário).
- `valor: null` → mostra `[VALOR]` na demo e **"Sob consulta"** em produção. `prefixoValor` opcional ("a partir de").
- Formato de preço: `R$ 1.250` (Intl pt-BR, sem centavos quando inteiro).
- `selo` ("Mais pedido") só se for verdade; o card com selo tem borda `--accent`.
- `nota` pequena embaixo. `pacotes.mostrar: false` → seção some.
- Exemplos de estrutura para a demo (todos `[CONFIRMAR]`): Essencial · Completo · Evento.

### 7.10 Depoimentos

- Uma citação por vez, grande, na fonte display; autor + tipo de sessão em mono; foto da sessão ao lado, se autorizada.
- Troca manual (setas/arrastar) — **sem autoplay**. `aria-live="polite"`.
- Exemplos só na demo e com selo **EXEMPLO**. Em produção, sem depoimentos reais → seção some.
- Link "Ver avaliações no Google" se existir `linkAvaliacoesGoogle`.

### 7.11 Pedido de sessão (formulário → WhatsApp)

- Campos: **Nome** (obrigatório) · **Tipo de sessão** (select com as sessões do config + "Outro") · **Data que você pensou** (opcional, `type="date"`, ou "ainda não sei") · **Cidade/local** (opcional) · **Mensagem** (opcional).
- Labels visíveis, erros em texto (não só cor), `autocomplete` correto.
- Botão "Continuar no WhatsApp" monta o texto a partir de `pedido.modeloMensagem`, omitindo linhas de campos vazios:

```
Olá, {nomeCurto}! Me chamo {nome}.
Tenho interesse em: {tipo}.
Data que eu pensei: {data}.
Local: {local}.
{mensagem}
```

- Abre `https://wa.me/{whatsapp}?text={encodeURIComponent(texto)}` em nova aba (no celular abre o app).
- Microinteração: ao enviar, o botão faz um "clique de obturador" (o ícone de diafragma fecha e abre, 300 ms).
- Nada é salvo. Texto de privacidade abaixo do botão (§3).

### 7.12 Dúvidas (FAQ)

- `<details>/<summary>` estilizados (acessível sem JS), ícone `+` que gira para `×`.
- Perguntas sugeridas `[CONFIRMAR respostas]`: Em quanto tempo recebo as fotos? · Quantas fotos vêm editadas? · Vocês fazem sessão externa / fora da cidade? · Precisa pagar sinal para reservar? · Como escolho roupa e local? · E se chover no dia?
- Gera `FAQPage` em JSON-LD só com respostas confirmadas.

### 7.13 CTA final

- Foto em tela cheia com scrim, título grande ("Vamos marcar a sua sessão?" `[CONFIRMAR]`) e botão.
- **Cortina reversa** (`cortinaReversa: true`): ao entrar na tela, dois painéis de `--bg` vêm dos lados e emolduram a foto (fecham até 12% de cada lado) — fecha o ciclo com a abertura. Uma vez só.

### 7.14 Contato e rodapé

- Endereço, botão "Abrir no mapa" (`mapsUrl`, **sem iframe do Google Maps**), horários, WhatsApp, Instagram, e-mail — cada item só aparece se existir no config.
- Rodapé: © ano + nome, links de redes, `creditoSite` opcional, selo "Prévia · fotos ilustrativas" quando `modoDemo`.
- Alternância de tema no rodapé só se `tema.permitirTroca`.

### 7.15 Botão flutuante do WhatsApp

- Aparece depois do hero; **some** quando o formulário ou o rodapé estão na tela (não duplicar CTA).
- 56×56 no canto inferior direito, respeitando `env(safe-area-inset-bottom)`. Rótulo acessível "Conversar no WhatsApp".
- Um único "pulso" de atenção na primeira aparição; nunca em loop.

### 7.16 Cursor visor (só desktop)

- Apenas com `(pointer: fine)` e sem reduced motion.
- Um círculo pequeno segue o mouse com atraso suave; sobre fotos clicáveis vira um quadro de visor `[ ]` com o texto `VER` em mono.
- **Não esconde o cursor do sistema** em textos, formulários e botões. Desliga quando a aba perde o foco.

---

## 8. Regras de movimento

**Tokens (`src/motion/tokens.ts`):**

| Token | Valor |
|---|---|
| `rapido` | 150 ms |
| `base` | 300 ms |
| `lento` | 600 ms |
| `etapaCortina` | 450 ms |
| `easeSaida` | `cubic-bezier(0.22, 1, 0.36, 1)` |
| `easeEntradaSaida` | `cubic-bezier(0.65, 0, 0.35, 1)` |

**Regras:**

- Animar só `transform`, `opacity` e `clip-path`. Nunca `width`, `height`, `top`, `left`, `box-shadow` em loop.
- Reveal padrão ao entrar na tela: `opacity 0 → 1` + `translateY(16px → 0)`, `base`, uma vez só. Cascata de no máximo 6 itens, 60 ms entre eles.
- Loops (faixa, roda) **pausam fora da tela** e quando a aba está oculta.
- Um efeito principal por tela (princípio 2).
- Nenhum efeito bloqueia leitura ou clique por mais de 300 ms (exceto a intro, que pode ser pulada).

**Reduced motion — mapa de fallback:**

| Efeito | Com reduced motion |
|---|---|
| Intro cortinas | Estado final direto |
| Faixa | Lista estática |
| Manifesto | Texto todo aceso |
| Roda 3D | Grade |
| Lápis vermelho | Círculos já desenhados |
| Linha de luz | Linha cheia |
| Lightbox | Sem "voo", só aparece |
| Lenis / cursor visor | Desligados |
| Reveals | Sem deslocamento, só aparecem |

---

## 9. Microinterações

- Botões: hover escurece/clareia 6% + seta desliza 4 px; `:active` `scale(0.98)`.
- Links de texto: sublinhado que cresce da esquerda (`background-size`).
- Fotos: hover com zoom 1,03 dentro da moldura (overflow hidden), 600 ms.
- Selo de pacote: brilho que passa uma vez ao entrar na tela.
- Formulário: label sobe quando o campo ganha foco; check verde discreto em campo válido.
- Obturador no envio (§7.11).
- Contador de quadros em mono (`07 / 24`) troca com máscara vertical.

---

## 10. Responsivo e acessibilidade

**Larguras de teste:** 360, 390, 768, 1024, 1440, 1920. Layout pensado **primeiro para 390**.

**Acessibilidade (WCAG 2.1 AA):**

- Link "Pular para o conteúdo" no topo.
- Landmarks (`header`, `nav`, `main`, `footer`), um `h1`, títulos em ordem.
- Alvos de toque ≥ 44×44.
- Foco visível próprio em tudo (anel 2 px `--accent` com offset).
- Todos os efeitos acessíveis por teclado (roda, folha, lightbox, abas, slider).
- `alt` obrigatório em toda foto (o build falha sem).
- Nada que pisque mais de 3 vezes por segundo.
- `lang="pt-BR"`. Sem som, sem vídeo com autoplay.
- Zoom de 200% sem quebrar layout; nada de `user-scalable=no`.

---

## 11. Modo apresentação (para a reunião de venda)

- Ativado por `?apresentar=1` **e somente se `modoDemo: true`**. Carregado com `import()` dinâmico (não pesa para o visitante comum).
- Painel flutuante discreto no canto inferior esquerdo:
  - **Tema:** Escuro · Claro (troca ao vivo, com transição de cor de 400 ms).
  - **Cor de destaque:** bolinhas com `presetsDestaque` (para quando o estúdio trouxer as cores que pesquisou).
  - **Abertura:** botão "Rever abertura" e escolha de 1, 2 ou 3 camadas.
  - **Destaque do hero:** cidade · tagline · rotativo.
- Atalhos diretos por URL (para o Vitor mandar no WhatsApp): `?tema=camara-escura`, `?tema=luz-natural`, `?intro=1`.
- O painel pode ser minimizado para virar uma bolinha.

---

## 12. Desempenho — metas e orçamento

| Métrica (celular, 4G) | Meta |
|---|---|
| Lighthouse Desempenho | ≥ 90 |
| Lighthouse Acessibilidade / Boas práticas / SEO | ≥ 95 |
| LCP | < 2,5 s |
| CLS | < 0,05 (alvo 0) |
| INP | < 200 ms |
| JS inicial | ≤ 150 KB gzip |
| Peso da primeira dobra (HTML + CSS + fontes + fotos da camada 1) | ≤ 600 KB |

**Como chegar lá:**

- `LazyMotion` com `domAnimation`; roda 3D, folha de contato, lightbox e modo apresentação em chunks separados, carregados quando chegam perto da tela.
- Fotos com `sizes` corretos (painel da cortina = `50vw`).
- CSS crítico do hero inline no build.
- Fontes: subset latin, só o tema ativo, só os pesos usados.
- Zero bibliotecas de carrossel/slider prontas; tudo em componentes próprios leves.

---

## 13. SEO e prévia do link

- Injetados no build (`transformIndexHtml`) a partir do config: `<title>`, `description`, `canonical`, Open Graph e Twitter Card, `theme-color`.
- **OG image** 1200×630, < 300 KB, gerada por `scripts/og.ts` (Playwright abre a rota `/og` com nome + foto principal + destaque no tema ativo e tira o print). Regerar sempre que tema ou foto principal mudarem.
- `robots.txt` **liberando** os robôs (o WhatsApp precisa ler a página para montar a prévia). O bloqueio de indexação é feito por `<meta name="robots" content="noindex">` quando `meta.indexar: false`.
- `sitemap.xml` só quando `indexar: true`.
- JSON-LD `LocalBusiness` (subtipo `ProfessionalService`) apenas com campos confirmados: nome, cidade, telefone, Instagram (`sameAs`), horários, endereço.
- Favicon SVG com monograma "I" na fonte display + `apple-touch-icon` 180×180.
- **Teste manual obrigatório:** colar o link no WhatsApp e conferir a prévia antes de mandar para o estúdio.

---

## 14. Analytics (opcional)

- Padrão `nenhum`.
- Se o estúdio quiser saber quantas pessoas visitam: **Cloudflare Web Analytics** (sem cookies → sem banner de consentimento). Carregado só se `provedor: 'cloudflare'` e `token` preenchido.

---

## 15. Fases e critérios de aceite

### Fase 1 — Prévia de venda (**parar e relatar ao final**)

1. Fundação: projeto Vite/React/TS, ESLint, Prettier, `types.ts`, `site.config.ts`, `site.config.alt.ts`, teste "nada hardcoded".
2. Tokens, os dois temas e as fontes.
3. Pipeline de fotos funcionando **em modo placeholder** e com fotos de exemplo (licença livre, créditos no meta).
4. Header, **intro em cortinas completa** (§7.2 inteiro, incluindo pular, uma vez por sessão, sem flash, reduced motion), faixa de sessões, sessões, **roda 3D**, CTA final e botão flutuante.
5. Modo apresentação (§11).
6. SEO + OG image + `noindex`.
7. Deploy da prévia.

**Aceite da Fase 1:**

- Abre no celular (390 px) e a intro roda liso; "Pular" funciona; recarregar na mesma sessão não repete a intro; `?intro=1` repete.
- `?tema=luz-natural` e `?tema=camara-escura` funcionam.
- Lighthouse celular: Desempenho ≥ 85 (≥ 90 na Fase 3), Acessibilidade ≥ 95.
- Prévia do link no WhatsApp mostra imagem, título e descrição.
- Nenhum dado do estúdio fora de `site.config.ts`; todos os testes verdes.
- Relatório: o que foi feito, prints em 390 e 1440 nos dois temas, lista de `[CONFIRMAR]`.

### Fase 2 — Página completa

Manifesto, folha de contato + lightbox, antes/depois (desligado), como funciona, pacotes, depoimentos, formulário → WhatsApp, FAQ, contato/rodapé, cursor visor, header com menu mobile.

**Aceite:** todas as seções de §7 funcionando nos dois temas, teclado completo, formulário gerando a mensagem certa.

### Fase 3 — Polimento e entrega

Ajuste fino de easing e tempos, auditoria de acessibilidade (axe + teste manual com teclado e leitor de tela), metas de §12 batidas, testes completos, README, troca de fotos de exemplo pelas do estúdio (quando autorizadas), `modoDemo: false`, `indexar: true`, deploy final.

---

## 16. Testes

- **Nada hardcoded:** renderiza a página com `site.config.alt.ts` e garante que "Estúdio Exemplo" aparece e que nenhum texto do config real aparece. Varredura em `src/` garantindo que "Ivy" (sem diferenciar maiúsculas) só existe em `site.config.ts`.
- **Config:** valida com o tipo + regras (WhatsApp só dígitos com DDI, `alt` presente, ids de foto existentes no manifest, seções referenciadas existentes).
- **Mensagem do WhatsApp:** monta corretamente com todos os campos, sem campos opcionais, e com caracteres especiais (acentos, `&`, quebras de linha).
- **Intro:** com reduced motion renderiza estado final; com `sessionStorage` indisponível não quebra; `?intro=1` força; h1 presente desde o início.
- **Pacotes:** `valor: null` → `[VALOR]` com `modoDemo: true` e "Sob consulta" com `false`.
- **Depoimentos:** exemplos somem com `modoDemo: false`; lista vazia remove a seção.
- **Acessibilidade:** `vitest-axe` em cada seção nos dois temas.
- **Contraste:** checagem automática dos pares de tokens (incluindo `coresDestaque`).
- **Build:** falha se foto sem `alt` ou id inexistente.

---

## 17. Ideias em espera (futuro / upsell — NÃO implementar agora)

- **Galeria privada de entrega:** o cliente do estúdio recebe um link, vê as fotos e marca as favoritas (a "folha de contato" de verdade). Bom candidato a mensalidade.
- **Reserva com sinal via PIX** e agenda de horários disponíveis.
- **Mesa de luz:** galeria interativa onde o visitante arrasta as fotos sobre uma mesa iluminada.
- **Vídeo curto de bastidores** no hero ou numa seção própria (com cuidado de peso).
- **Página própria por tipo de sessão** (ex.: "/newborn") para aparecer melhor no Google.
- **Vale-presente de sessão** (datas comemorativas).
- **Plano de presença local:** Perfil da Empresa no Google, pedir avaliações reais, Search Console, dados iguais em todo lugar (nome, endereço, telefone).

---

## 18. Entrega

- **README** em português simples: como trocar fotos, textos, preços, cores e tema; como rodar o pipeline de fotos; como publicar.
- **Hospedagem do cliente:** Cloudflare Pages ou Netlify (plano grátis permite uso comercial). **Não usar Vercel Hobby** para site de cliente (o plano grátis é só para uso não comercial).
- **Domínio registrado no nome do estúdio** (Registro.br), não no nosso.
- Prints em 390 e 1440 nos dois temas; relatório do Lighthouse.
- Lista final de `[CONFIRMAR]` resolvidos e pendentes.
- Nota no vault "segundo cérebro", pasta **Estúdio Ivy** (Visão Geral, Arquitetura, Decisões, Log de Mudanças).

---

## 19. Em aberto

**Para o Pedro decidir (hero):**

1. O que aparece depois da segunda cortina: foto principal com escurecimento (padrão) ou fundo liso?
2. Destaque do meio: cidade (padrão), tagline ou tipos de sessão girando?
3. Quantas cortinas: 2 (4 fotos, padrão) ou 3 (6 fotos)?

**Para coletar com o estúdio (via Vitor) — `[CONFIRMAR]`:**

- Grafia exata do nome e se existe logo.
- Cores que eles gostam (ou se preferem um dos dois temas como está).
- Tipos de sessão que realmente fazem.
- Cidade, endereço (atendem em estúdio, externo, a domicílio?), horários.
- WhatsApp, Instagram, e-mail.
- Pacotes: nomes, o que inclui, prazos de entrega e valores (ou "sob consulta").
- Fotos autorizadas para o site (20–30) e se as pessoas fotografadas autorizaram.
- Depoimentos reais que podem ser usados, e link das avaliações no Google.
- Respostas do FAQ.
- Uma frase que represente o jeito deles de fotografar (manifesto/tagline).
