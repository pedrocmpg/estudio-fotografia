# SPEC — Site do Ivy · Fotografia e Presentes

> **Versão 2** · 16/10/2026 · Dev: Pedro · Comercial: Vitor
> Status do projeto: **prévia de venda** (o cliente ainda não fechou). Tudo que não foi confirmado com o estúdio está marcado como `[CONFIRMAR]`.

---

## 0. Como usar este documento

**Esta é a fonte da verdade.** Ela substitui a v1 (`spec-estudio-ivy.md`), o `docs/prompt-elevar-fase1-v2.md` e o `docs/adendo-ivy-foto-e-presente.md`, que viram histórico (mover para `docs/historico/`). Os prompts de cada fase passam a apontar para as seções deste arquivo.

**Ordem de leitura para o Claude Code:**
1. Este `SPEC.md` inteiro.
2. `DECISOES.md` (decisões já tomadas nas rodadas anteriores; elas valem, a não ser que esta spec diga o contrário).
3. `referencias/` (só inspiração de estilo; nada é copiado).
4. O código atual.

**Regra de ouro:** implementar **só a fase pedida** no prompt (§18), parar e relatar. Em dúvida, prioridade: **acessibilidade > desempenho no celular > efeito visual**.

**Regras para rodar sem supervisão** (sempre que o prompt disser "sem supervisão"):
- Sem perguntas: escolher a leitura mais razoável, seguir e registrar em `DECISOES.md` (data, decisão, motivo).
- Trabalhar em blocos. Ao fim de cada bloco: lint, typecheck e testes; só avançar com tudo verde; commit com mensagem clara.
- Efeito pesado ou instável → entregar o fallback simples descrito na seção, registrar e seguir. Nunca deixar o site quebrado.
- Travou em ~3 tentativas → pular, anotar como pendente, seguir.
- Registrar cada bloco no vault Obsidian `C:\Users\User\Documents\Projetos\segundo-cerebro`, pasta **Estúdio Ivy** (Log de Mudanças e Decisões), sem pedir permissão.

**O que mudou da v1 para a v2:**
- O negócio é **fotografia + loja de presentes personalizados** (§1), não só estúdio.
- Tema padrão passa a ser **`luz-natural`** (§7).
- Novas seções: **Presentes**, **Manifesto com palavras que trocam**, **Colagem com parallax**, **Sessões empilhadas**, **Rodapé com nome gigante**, **FAQ com tom humano** (§10).
- Regras de **efeitos de rolagem** (§11) e meta de **~10 telas** de rolagem no celular.
- Contato com **dois pontos** (estúdio e loja) e **duas contas de Instagram** (§10.17).
- Fases reorganizadas (§18).

---

## 1. O negócio

Fonte: perfis públicos de Instagram trazidos pelo Pedro. **Tudo `[CONFIRMAR]` com o Vitor/estúdio antes de ir ao ar.**

| | Estúdio | Loja |
|---|---|---|
| Nome visto | Ivy Fotografia | Ivy Foto e Presente |
| O que faz | Newborn, gestante, família, eventos, ensaios, formaturas, aniversário/1 aninho, temáticos (ex.: gaúcho), dia dos pais/mães | Revelação na hora, fotos, canecas, álbuns, porta-retratos, polaroids, quadros, cubo de acrílico, quebra-cabeça, chaveiro, garrafa, almofada, camiseta, crachá/cordão, scrapbook, plastificação |
| Diferencial visto | "A mais de 20 anos registrando momentos" | Loja física no shopping, em Bento Gonçalves/RS; "fotos em segundos" |
| Estilo visual | Estúdio, fundos lisos/coloridos e brancos, cor e P&B, luz quente, bebês e famílias | Marca em marrom e creme, produtos em cenários claros |

**Tese do site:** "Tire a foto com a gente e leve a memória pra casa num presente." O site vende os dois lados e liga um ao outro.

**Confirmar:** nome de marca a usar no site (§10.1), se estúdio e loja ficam no mesmo endereço, quais produtos são carro-chefe, se a idade de "20 anos" pode ser citada.

---

## 2. Objetivo e princípios

**Objetivo do site:** fazer o visitante **chamar no WhatsApp** para pedir uma sessão ou um presente. Métrica principal: cliques nos botões de pedido e envios do formulário.

**Objetivo da prévia:** quando o Vitor mandar o link, o estúdio tem que reconhecer o próprio negócio e pensar "isso é nosso". Bonito em 3 segundos, rápido em 4G.

**Princípios:**
1. **A foto é a estrela.** A interface recua; tipografia e movimento emolduram.
2. **Um efeito marcante por seção.** Nunca três animações na mesma tela.
3. **Rápido no celular de verdade** (Android intermediário, 4G médio). Efeito que não roda liso tem fallback.
4. **Nada inventado.** Sem depoimentos falsos, números, prêmios ou promessas. Dado não confirmado = `[CONFIRMAR]` no config.
5. **Tudo configurável num arquivo** (`src/config/site.config.ts`).
6. **Respeita quem usa:** reduced motion, teclado, leitor de tela e contraste são requisitos.
7. **Nunca cobrir rosto com texto**, principalmente de bebês e crianças.

---

## 3. Escopo

**Dentro:** landing page única, responsiva, em português; dois temas (escolha do estúdio); abertura em cortinas; sessões; manifesto; galeria; **presentes**; pacotes com espaço para preço; formulário que abre o WhatsApp; FAQ; contato com dois pontos; SEO; prévia do link; modo apresentação; deploy; README.

**Fora (agora):** carrinho/loja online com pagamento, upload de foto pelo cliente, agendamento, área do cliente, galeria privada, backend, CMS, blog, multi-idioma. Ficam em §20 como próximos passos.

### 3.1 Roteiro da prévia (o site é pensado para isso)
1. O Vitor manda **um link** no WhatsApp; a prévia do link (OG image) já tem que estar bonita.
2. O estúdio abre no celular: a abertura de cortinas roda uma vez e revela o nome deles.
3. Rola e vê as próprias sessões, os próprios produtos, a galeria, os pacotes com `[VALOR]`.
4. O Vitor pergunta "claro ou escuro?" e manda o segundo link (`?tema=camara-escura`).
5. Selo discreto "Prévia · fotos ilustrativas" (honestidade: as fotos ainda não são deles).

---

## 4. Stack e estrutura

- **Vite + React 18 + TypeScript** (`strict`).
- **CSS com variáveis + CSS Modules**; tokens em `src/styles/temas.css`.
- **motion** (Framer Motion) com `LazyMotion` + `domAnimation`; **CSS scroll-driven animations** (`animation-timeline`) quando suportado.
- **lenis** só no desktop (desligado em touch e reduced motion).
- **sharp** (pipeline de fotos), **Playwright** (OG image), **Vitest + Testing Library + vitest-axe**.
- **@fontsource** auto-hospedadas (subset latin). Nada de Google Fonts em runtime.

```
estudio-ivy/
├── SPEC.md                     # este documento
├── DECISOES.md                 # decisões das rodadas (append-only)
├── README.md
├── docs/
│   ├── historico/              # spec v1, prompts e adendo antigos
│   └── prompts/                # prompts de cada fase
├── referencias/                # NÃO versionado (.gitignore) — inspiração
├── fotos-originais/            # NÃO versionado (.gitignore)
├── public/ (fotos/, og.jpg, favicon.svg, apple-touch-icon.png, robots.txt)
├── scripts/ (fotos.ts, og.ts)
├── src/
│   ├── config/ (types.ts, site.config.ts, site.config.alt.ts)
│   ├── data/ (fotos.meta.json, fotos.manifest.json)
│   ├── styles/  motion/  components/  sections/  apresentacao/
│   ├── App.tsx  main.tsx
└── tests/
```

---

## 5. Privacidade e dados

- Nome, telefone, endereço e qualquer dado real do Ivy ficam **somente** em `src/config/site.config.ts`. Um teste garante isso (§19).
- `site.config.alt.ts` usa dados obviamente fictícios: `Estúdio Exemplo`, WhatsApp `5500900000000`, `Cidade Exemplo`, `contato@exemplo.com`, `@estudioexemplo`, `@lojaexemplo`. **Todos os testes usam esse arquivo.** Nunca usar dados reais (nomes, CPF, CNPJ, telefones) em teste, fixture, seed ou exemplo.
- `fotos-originais/` e `referencias/` no `.gitignore`. Só entram no repositório fotos **processadas** (sem EXIF, GPS ou serial).
- **Fotos do estúdio e de clientes:** só com autorização do estúdio; a autorização das pessoas retratadas é responsabilidade do estúdio (registrar no README). **Nunca baixar nem reusar imagens do Instagram deles** no código. Até a autorização: fotos de banco com licença livre, crédito em `fotos.meta.json`.
- **Depoimentos:** só reais e autorizados. Na prévia, exemplos com selo **EXEMPLO**; em produção, sem reais → seção some.
- **Formulário não guarda nada:** monta o texto e abre o WhatsApp. Texto sob o botão: "Seus dados vão direto para a conversa no WhatsApp. Não guardamos nada aqui."
- Prévia com `noindex` (§16).

---

## 6. Config (`src/config/types.ts`)

```ts
export type TemaId = 'luz-natural' | 'camara-escura';

export type SecaoId =
  | 'intro' | 'faixa' | 'sessoes' | 'manifesto' | 'trabalhos' | 'presentes'
  | 'antesDepois' | 'processo' | 'pacotes' | 'depoimentos'
  | 'pedido' | 'faq' | 'ctaFinal' | 'contato';

export type FotoId = string;

export interface Cta {
  rotulo: string;
  acao: 'pedido' | 'whatsapp' | 'ancora';
  alvo?: string;                // âncora ou tipo pré-selecionado no formulário
}

export interface Ponto {        // estúdio, loja…
  rotulo: string;               // "Estúdio" | "Loja no shopping"
  endereco?: string;
  mapsUrl?: string;
  horarios?: { dias: string; horas: string }[];
  whatsapp?: string;            // só dígitos com DDI; se ausente, usa negocio.whatsapp
}

export interface SiteConfig {
  modoDemo: boolean;            // selo "fotos ilustrativas", [VALOR]/[CONFIRMAR] visíveis, modo apresentação

  meta: {
    titulo: string;             // ≤ 60
    descricao: string;          // ≤ 155
    urlCanonica: string;
    indexar: boolean;           // false = noindex
    corNavegador?: string;
  };

  negocio: {
    nome: string;               // nome de marca [CONFIRMAR]
    nomeCurto: string;          // "Ivy"
    cidade: string; uf: string;
    whatsapp: string;           // padrão; só dígitos com DDI
    email?: string;
    pontos: Ponto[];            // 1 ou 2 (estúdio, loja)
    redes: { rotulo: string; usuario: string; url: string }[]; // ex.: Estúdio / Loja
    anosDeMercado?: number;     // só se confirmado
    creditoSite?: { texto: string; url?: string };
  };

  tema: {
    ativo: TemaId;              // padrão 'luz-natural'
    permitirTroca: boolean;
    coresDestaque?: Partial<Record<TemaId, string>>;
    presetsDestaque?: string[];
    granulado: boolean;         // só tem efeito no camara-escura
  };

  secoes: SecaoId[];            // ordem e presença

  hero: {
    intro: {
      ativo: boolean;
      camadas: { esquerda: FotoId; direita: FotoId; esquerdaMobile?: FotoId; direitaMobile?: FotoId }[];
      etapasPorCamada: number;  // 3
      duracaoEtapaMs: number;   // 450
      pausaEtapaMs: number;     // 120
      pausaCamadaMs: number;    // 300
      umaVezPorSessao: boolean;
      mostrarPular: boolean;
      mostrarContador: boolean;
      linhaDeLuz: boolean;
    };
    fundoFinal: { tipo: 'foto' | 'cor'; foto?: FotoId; scrim: number };
    nome: string;
    nomeGigante: boolean;       // nome enorme na parte baixa do hero (§10.2)
    destaque: { modo: 'cidade' | 'tagline' | 'rotativo'; texto?: string; itens?: string[] };
    subtitulo?: string;
    selos?: string[];           // ex.: "Revelação na hora" [CONFIRMAR]
    ctas: { primario: Cta; secundario?: Cta };
  };

  faixa: { itens: string[]; segundosPorVolta: number };

  sessoes: {
    titulo: string;
    itens: { id: string; nome: string; frase: string; fotos: [FotoId, FotoId?] }[];
  };

  manifesto: {
    palavras: string[];         // trocam conforme a rolagem
    fraseCompleta: string;      // lida pelo leitor de tela
    citacao?: string;           // original; nunca de terceiros
    fotos?: FotoId[];           // 2–3 fotos que entram depois
  };

  trabalhos: {
    titulo: string;
    colagem: FotoId[];          // 6–8 fotos soltas com parallax
    roda: { fotos: FotoId[]; segundosPorVolta: number };
    folha: { categorias: string[]; fotos: { id: FotoId; categoria: string; marcada?: boolean }[] };
    mostrarDadosTecnicos: boolean;
  };

  presentes: {
    mostrar: boolean;
    titulo: string;
    destaqueRevelacao?: { titulo: string; texto: string };
    categorias: string[];
    itens: {
      id: string; nome: string; categoria: string; frase: string; foto: FotoId;
      valor: number | null; mensagemWhatsapp: string;
    }[];
  };

  antesDepois: { antes: FotoId; depois: FotoId; legenda: string }[];   // vazio = some

  processo: { titulo: string; passos: { titulo: string; texto: string }[] };

  pacotes: {
    mostrar: boolean;
    titulo: string;
    nota?: string;
    grupos: {
      rotulo: string;           // "Sessões" | "Presentes"
      itens: {
        id: string; nome: string; paraQuem: string; inclui: string[];
        entrega?: string; valor: number | null; prefixoValor?: string;
        selo?: string; alvoPedido?: string;
      }[];
    }[];
  };

  depoimentos: { texto: string; autor: string; sessao?: string; foto?: FotoId; exemplo: boolean }[];
  linkAvaliacoesGoogle?: string;

  pedido: {
    titulo: string;
    texto?: string;
    tipos: { grupo: 'Sessão' | 'Presente'; opcoes: string[] }[];   // vem de sessoes + presentes
    modeloMensagem: string;
  };

  faq: { abertura?: string; itens: { pergunta: string; resposta: string; grupo?: 'Sessões' | 'Loja' }[] };

  ctaFinal: { titulo: string; texto?: string; foto: FotoId; cortinaReversa: boolean; cta: Cta };

  analytics: { provedor: 'nenhum' | 'cloudflare'; token?: string };
}
```

**Padrões da prévia:** `modoDemo: true`, `indexar: false`, `tema.ativo: 'luz-natural'`, `permitirTroca: false`, 2 camadas na intro, `destaque.modo: 'cidade'`, `nomeGigante: false`, `fundoFinal.tipo: 'foto'` com `scrim: 0.35`, `antesDepois: []`, `analytics: 'nenhum'`, preços `null`.

---

## 7. Temas

Tokens por `data-theme` no `<html>`. Componentes **só** usam tokens.

| Token | Luz natural (`luz-natural`) — **padrão** | Câmara escura (`camara-escura`) |
|---|---|---|
| `--bg` | `#F6F1E9` | `#0E0C0A` |
| `--surface` | `#FBF8F3` | `#171411` |
| `--text` | `#26201B` | `#F2EBDD` |
| `--text-2` | `#6B6157` | `#A79D8D` |
| `--accent` | terracota/marrom `#8A5A3B` `[testar com a marca]` | âmbar `#E0A458` |
| `--accent-texto` | `#7A4A2E` (texto pequeno) | `#E0A458` |
| `--on-accent` | `#FFFFFF` | `#0E0C0A` |
| `--linha` | `rgba(38,32,27,.12)` | `rgba(242,235,221,.12)` |
| `--escuro` (faixas escuras) | `#2A211B` | — |
| Display | Cormorant Garamond | Bodoni Moda |
| Texto | Albert Sans | Schibsted Grotesk |
| Mono | IBM Plex Mono | IBM Plex Mono |
| Textura | nenhuma | grão de filme (SVG estático, opacidade 0.05) |
| Personalidade | estúdio com luz de janela, acolhedor, família | laboratório de revelação, mais editorial |

- **Contraste obrigatório ≥ 4.5:1** para texto normal. O build checa todos os pares de tokens (inclusive `coresDestaque`) e avisa no terminal.
- Se `--accent` não passar em texto pequeno, usar `--accent-texto`; o accent puro fica para botões, ícones e títulos grandes.
- **Escala tipográfica:** nome do hero `clamp(5rem, 22vw, 14rem)` no celular (até 16rem no desktop); H2 `clamp(3rem, 9vw, 6rem)`; texto `clamp(1rem, 1.1vw, 1.125rem)` com `line-height 1.6` e ≤ 65 caracteres por linha; mono `0.75rem`, maiúsculas, `letter-spacing 0.08em`. Rótulo mono numerado acima de cada H2 (`02 — TRABALHOS`).
- Ritmo: `--espaco-secao: clamp(5rem, 12vh, 9rem)` (no celular, `clamp(3.5rem, 10vh, 5rem)`). Nenhum vazio fora desse token.
- Fontes: só as do tema ativo; `preload` só da display; `font-display: swap` com fallback de métricas ajustadas.
- **Botões:** primário em `--accent` com `--on-accent`, raio 2–4 px, altura mínima 52 px no celular. Secundário com borda 1 px em `--text` a ~45%, legível sobre foto.

---

## 8. Fotos

### 8.1 Pipeline (`scripts/fotos.ts`)
- Entrada: `fotos-originais/*` + `src/data/fotos.meta.json` (`id`, `arquivo`, `alt`, `categoria`, `foco {x,y}`, `credito`, `licenca`, `ilustrativa`).
- Saída: 480/960/1600/2400 px (sem ampliar), AVIF (q≈50), WebP (q≈72), JPEG progressivo (q≈78); sRGB; **todo metadado removido**; extrai só abertura/velocidade/ISO/focal para `mostrarDadosTecnicos`; placeholder 16 px base64 + cor dominante; `fotos.manifest.json`.
- Idempotente (cache por hash). **Modo placeholder** se não houver fotos. Build falha se foto usada no config não existir ou estiver **sem `alt`**.
- `<Foto id sizes prioridade?>`: `<picture>` com `width/height` reais (CLS zero), `object-position` pelo `foco`, fade do placeholder, `lazy` exceto `prioridade` (`fetchpriority="high"`).

### 8.2 Curadoria do banco de exemplo (prévia)
- **18–20 fotos de pessoas** combinando com o negócio: estúdio com fundo liso/colorido e branco, newborn, gestante, família, criança, aniversário, formatura, casal, temático. Parte em **preto e branco**. Luz quente. Evitar clima noturno/cinematográfico exagerado.
- **8–10 fotos de produtos:** canecas, álbuns, polaroids, porta-retratos, quadros, almofada, camiseta.
- Nenhuma foto repete em seções vizinhas; cada sessão tem 2 fotos próprias.
- Pares da cortina "conversam" (mesma luz, assuntos que se olham). Para o celular, versões verticais com o assunto no centro.
- `foco` ajustado para não cortar rosto no celular.

---

## 9. Mapa da página

| # | Seção (`SecaoId`) | Assinatura | Fase |
|---|---|---|---|
| 1 | Header | some ao descer, volta ao subir | 1 |
| 2 | `intro` (hero) | cortinas em 3 etapas + linha de luz | 1 / elevação |
| 3 | `faixa` | marquee de sessões e produtos | 1 / elevação |
| 4 | `sessoes` | cards empilhados (celular) / categorias gigantes sobre foto (desktop) | elevação |
| 5 | `manifesto` | palavras trocando com a rolagem + citação | elevação |
| 6 | `trabalhos` | colagem com parallax + roda 3D (+ folha de contato) | elevação (+ Fase 2) |
| 7 | `presentes` | prateleira de produtos + "revelação na hora" | elevação |
| 8 | `antesDepois` | slider (desligado) | 2 |
| 9 | `processo` | linha de luz | 2 |
| 10 | `pacotes` | sessões e presentes, espaço para preço | 2 |
| 11 | `depoimentos` | citação grande, sem autoplay | 2 |
| 12 | `pedido` | formulário → WhatsApp + obturador | 2 |
| 13 | `faq` | tom humano, sessões e loja | elevação (+ Fase 2) |
| 14 | `ctaFinal` | full-bleed + cortina reversa | 1 / elevação |
| 15 | `contato` + rodapé | dois pontos, duas redes, nome gigante | elevação (+ Fase 2) |
| — | Botão flutuante WhatsApp, cursor visor | — | 1 / 2 |

**Meta:** rolagem total no celular **≥ ~10 telas** com a página completa.

---

## 10. Seções

### 10.1 Header
- Desktop: nome/logo à esquerda; links Sessões · Presentes · Trabalhos · Pacotes · Dúvidas; botão "Pedir" à direita.
- Transparente sobre o hero; depois, `--bg` 85% + `backdrop-filter: blur(12px)` + linha `--linha`. Some ao descer, volta ao subir. Oculto durante a intro.
- Celular: nome + "Pedir" + menu (44×44) em tela cheia com links grandes na display, cascata de 40 ms, foco preso, `Esc` fecha.

### 10.2 Intro em cortinas (hero)
**Ideia:** a página abre fechada por fotos. Cada cortina é um par de fotos (uma por metade da tela) que se abre para os lados em **3 etapas**, como obturador. Depois vem a segunda cortina. Atrás de tudo, o nome.

**Camadas (topo → fundo):** camada 1 → camada 2 → fundo final (foto com scrim ou cor) + conteúdo (nome, destaque, subtítulo, selos, CTAs).

**Linha do tempo (2 camadas):** 0–400 ms parado com contador `01 / 02` → etapa 0 → ∓33% (450 ms) → pausa 120 → ∓66% → pausa 120 → ∓100%, contador `02 / 02` → pausa 300 → camada 2 igual → nome sobe por máscara (30 ms/letra), destaque, selos e CTAs em fade; header aparece. Total ≈ 4,2 s. Só `translate3d`, easing `cubic-bezier(0.22, 1, 0.36, 1)`.

**Acabamento obrigatório:** foto dentro do painel anda 15% mais devagar que o painel e sai de `scale(1.08)` para `1`; **linha de luz** na emenda a cada etapa (gradiente 2 px em `--accent`, opacidade 0 → 0,8 → 0); sombra interna leve na borda dos painéis.

**Conteúdo final (padrão `[CONFIRMAR]`):** nome **Ivy** grande; "Fotografia e presentes personalizados em {cidade}"; selo "Revelação na hora"; CTAs **"Pedir sessão"** (primário) e **"Ver presentes"** (secundário). Hero em `100svh`, scrim leve, vinheta só nas bordas, indicador sutil de rolagem.

**`nomeGigante`** (opcional, desligado por padrão): nome enorme na parte baixa, cortado pela borda inferior, **sem cobrir rosto**; o `<h1>` continua texto real.

**Comportamento:**
- `<h1>` no DOM desde o primeiro frame.
- **Pular:** botão "Pular" (primeiro focável) e qualquer clique, toque, tecla, roda ou rolagem → estado final com fade de 250 ms. Não trava a rolagem.
- **Uma vez por sessão:** `sessionStorage` `intro-vista` (em `try/catch`); `?intro=1` força.
- **Sem flash:** script inline no `<head>` coloca `data-intro="on"` no `<html>` só se JS + sem reduced motion + não vista; CSS só fecha as cortinas sob esse atributo.
- Camada 1 com `preload` + `fetchpriority="high"`. Se a camada 2 não carregou a tempo, é pulada. Nunca painel vazio.
- `will-change` só durante a animação.

### 10.3 Faixa (marquee)
- Logo abaixo do hero. Alterna sessões e produtos: *Newborn · Gestante · Família · Formaturas · Canecas · Álbuns · Polaroids · Quadros…* `[CONFIRMAR]`.
- Display `clamp(2.5rem, 7vw, 5rem)`, ícone de diafragma entre os itens, ~45 s por volta, pausa no hover e fora da tela. Cópia do loop com `aria-hidden`. Reduced motion: lista estática.

### 10.4 Sessões
- **Celular:** cada sessão ocupa uma tela (`min-height: 90svh`): foto grande, **nome em letras gigantes** (na parte baixa ou lateral, com scrim, nunca sobre o rosto), frase e "Pedir essa sessão" (pré-seleciona no formulário). **Cards empilhados** com `sticky`: o anterior escurece e reduz levemente. Fundo sutil diferente por cartão.
- **Desktop:** foto larga ao fundo com os **nomes das categorias em letras enormes** atravessando; faixas de miniaturas em velocidades diferentes; hover troca a foto de fundo com crossfade.
- Categorias `[CONFIRMAR]`: Newborn · Gestante e casal · Família · Aniversário / 1 aninho · Formatura · Ensaio pessoal · Temáticos · Eventos.
- Fallback: lista vertical de cards.

### 10.5 Manifesto
- Palco `sticky` de ~300svh: frase central troca **palavra por palavra ligada ao progresso da rolagem** (máscara `translateY` + `opacity`), não a timers.
- Depois, uma **citação** sozinha (fade + leve subida) e 2–3 fotos entrando em tamanhos diferentes (mecanismo de §10.6a).
- Exemplo `[CONFIRMAR]`: "Momentos. / Memórias. / Presentes que contam a sua história." Citação original; **nunca de terceiros**. Com `modoDemo: false` e texto não confirmado, a seção some.
- A11y: `fraseCompleta` no DOM como texto único; palavras animadas `aria-hidden`. Reduced motion: frase completa estática, sem pin.
- **Celular (< 768 px ou `pointer: coarse`) — versão compacta, sem pin:** uma única seção de ~100svh. As três palavras aparecem **empilhadas**, uma por linha, revelando em sequência quando a seção entra na tela (máscara, 120 ms entre linhas, uma vez). Logo abaixo, na mesma área, a citação em tamanho menor e 2 fotos pequenas sobrepostas (uma inclinada levemente). Nada de telas vazias entre uma palavra e outra.
- **Desktop:** mantém o palco `sticky`, mas no máximo **200svh**, e a palavra seguinte entra **antes** de a anterior sair por completo (sobreposição de ~30%), para nunca existir um frame vazio.

### 10.6 Trabalhos
**a) Colagem com parallax:** 6–8 fotos de tamanhos e proporções diferentes em posições irregulares; cada uma com velocidade própria ao rolar (4–14%, só `transform`); algumas revelam com `clip-path`. Clique abre o lightbox. No celular, no máximo 8 animadas ao mesmo tempo.

**b) Roda 3D (protagonista):** anel de 8–10 fotos (`perspective: 1400px`, `rotateY(i·360/n) translateZ(r)`); desktop com fotos de ~28vw e título gigante atrás; gira sozinha (~60 s/volta), arrasta com inércia, pausa no hover/foco/fora da tela; setas giram, `Enter` abre. Celular: rolagem horizontal ligada à vertical (seção `sticky` de no máximo 150svh — na prática 130svh —, central em destaque, contador `03 / 10`). Fallback: `scroll-snap` com fotos a 85% da largura; sem `preserve-3d`/reduced motion: grade.

**c) Folha de contato (Fase 2):** visual de negativo, numeração mono (`14A ▸`), abas por categoria; ao entrar, um **lápis vermelho** (SVG, `stroke-dashoffset`) circula as fotos `marcada` (só círculos e "✓"). Com `mostrarDadosTecnicos`, `f/1.8 · 1/250 · ISO 200` sob o quadro.

**d) Lightbox:** tela cheia, `Esc`/setas/arrastar, contador, legenda, foco preso e devolvido; View Transitions API (fallback fade); carrega a maior resolução só ao abrir e pré-carrega a próxima.

### 10.7 Presentes (loja)
- Abertura com faixa **"Revelação na hora"** `[CONFIRMAR]` e uma linha curta sobre a loja no shopping.
- **Prateleira** com rolagem lateral de cards grandes (mesma mecânica de §10.6b, nada novo pesado) + chips de categoria: Canecas · Álbuns e porta-retratos · Quadros e polaroids · Para vestir e decorar · Lembranças.
- Card: foto, nome, frase, preço (`null` → `[VALOR]` na demo / "Consulte" em produção) e **"Pedir no WhatsApp"** com `mensagemWhatsapp` pronta ("Oi! Quero uma caneca personalizada…").
- Ponte com o estúdio: uma linha tipo "Fez a sessão com a gente? Leve as fotos pra casa num presente." `[CONFIRMAR]`.
- Imagens de banco na prévia (selo "ilustrativas"); nunca do Instagram deles.

### 10.8 Antes e depois (desligado)
Slider de comparação com `input type="range"` acessível. `antesDepois: []` → não renderiza.

### 10.9 Como funciona
4 passos `[CONFIRMAR]`: Conversa (WhatsApp) · Planejamento (data, roupa, tema) · Sessão · Entrega (prazo, formato, e a opção de levar em presente). Linha vertical que **enche de luz** com a rolagem; cada passo acende quando a luz chega. Reduced motion: linha cheia.

### 10.10 Pacotes
- Dois grupos: **Sessões** e **Presentes** (abas no celular, colunas no desktop). 2–4 cards por grupo: nome, para quem, o que inclui, prazo, valor (`null` → `[VALOR]` / "Sob consulta"), botão que pré-seleciona o formulário.
- `selo` ("Mais pedido") só se for verdade. `nota` pequena embaixo. `Intl` pt-BR sem centavos quando inteiro.

### 10.11 Depoimentos
Uma citação por vez, grande, na display; autor + tipo em mono; foto só se autorizada. Troca manual, **sem autoplay**, `aria-live="polite"`. Exemplos com selo EXEMPLO só na demo; sem reais em produção → some. Link para avaliações no Google, se houver.

### 10.12 Pedido (formulário → WhatsApp)
- Campos: **Nome** (obrigatório) · **O que você quer** (select agrupado: Sessão / Presente, gerado do config, + "Outro") · **Data que pensou** (opcional) · **Cidade/local** (opcional) · **Mensagem** (opcional).
- Monta o texto de `modeloMensagem`, omitindo linhas vazias:
  ```
  Olá, {nomeCurto}! Me chamo {nome}.
  Tenho interesse em: {tipo}.
  Data que eu pensei: {data}.
  Local: {local}.
  {mensagem}
  ```
- Abre `https://wa.me/{whatsapp}?text=…` em nova aba. Botão faz "clique de obturador" (300 ms). Texto de privacidade abaixo. Labels visíveis, erros em texto, `autocomplete`.

### 10.13 Dúvidas (FAQ)
- Abertura com personalidade `[CONFIRMAR]`: "Imaginei que você ia perguntar. Então respondi antes."
- `<details>/<summary>`, ícone `+` que vira `×`. Dois grupos: **Sessões** (prazo de entrega, quantas fotos, sessão externa, sinal, roupa) e **Loja** (quanto tempo fica pronto, dá pra levar a foto do celular, imprime na hora, formas de pagamento). Respostas `[CONFIRMAR]`, sem prazos/preços inventados. `FAQPage` em JSON-LD só com respostas confirmadas.

### 10.14 CTA final
Foto **full-bleed** sem caixa; texto sobre a área calma da foto, assunto visível; scrim só sob o texto. **Cortina reversa:** painéis `--bg` vêm dos lados e emolduram a foto (até 12% de cada lado), uma vez.

### 10.15 Botão flutuante do WhatsApp
Aparece depois do hero; some quando o formulário ou o rodapé estão na tela. 56×56, `safe-area-inset-bottom`, rótulo acessível. Um pulso só na primeira aparição. Não pode colidir com "voltar ao topo" nem com nada fixo.

### 10.16 Cursor visor
Só `(pointer: fine)` e sem reduced motion. Círculo que segue o mouse; sobre fotos clicáveis vira `[ ]` com `VER`. Não esconde o cursor do sistema.

### 10.17 Contato e rodapé
- **Dois pontos** (`negocio.pontos`): Estúdio e Loja no shopping `[CONFIRMAR se é o mesmo lugar]`, cada um com endereço, "Abrir no mapa" (**sem iframe**), horários e WhatsApp.
- **Duas redes** (`negocio.redes`) com rótulo: Instagram do estúdio e da loja.
- Rodapé: **nome gigante** cobrindo a largura, cortado levemente pela borda inferior, links por cima; © ano; `creditoSite`; **um único** selo "Prévia · fotos ilustrativas" quando `modoDemo` (nunca fixo sobre o conteúdo).

---

## 11. Movimento e rolagem

| Token | Valor |
|---|---|
| `rapido` / `base` / `lento` | 150 / 300 / 600 ms |
| `etapaCortina` | 450 ms |
| `easeSaida` | `cubic-bezier(0.22, 1, 0.36, 1)` |
| `easeEntradaSaida` | `cubic-bezier(0.65, 0, 0.35, 1)` |

**Regras:**
- Animar só `transform`, `opacity`, `clip-path`.
- **Rolagem:** preferir `animation-timeline: scroll()/view()` com `@supports`; alternativa `motion useScroll`. Nada de cálculo pesado em evento `scroll`; usar `IntersectionObserver`/`requestAnimationFrame`.
- **Seções `sticky`:** altura em `svh`, sem prender a rolagem, ordem do DOM preservada para teclado e leitor de tela.
- **Celular é outra composição, não o desktop encolhido.** A troca é por **largura de tela e tipo de ponteiro** (`max-width: 767px`, `pointer: coarse`), nunca por detecção de aparelho/user-agent. No celular:
  - Nenhuma seção com pin passa de **150svh** (exceto as sessões empilhadas, que têm um cartão por tela com conteúdo).
  - **Regra da tela nunca vazia:** em qualquer ponto da rolagem, pelo menos ~40% da tela visível tem conteúdo (texto, foto ou elemento visual). Fundo liso ocupando a tela inteira é bug.
  - Textos grandes de efeito (manifesto, citação) vêm empilhados e compactos, não um por tela.
  - Espaço entre seções no celular: `clamp(3.5rem, 10vh, 5rem)` (menor que no desktop).
  - Teste obrigatório: rolar a página inteira em 390 px gravando a tela e conferir que nenhum quadro fica só com fundo.
- Reveal padrão: títulos por máscara linha a linha (60 ms de cascata); fotos de `clip-path: inset(8%)` + `scale(1.1)` para `inset(0)` + `1` em ~900 ms. Uma vez só.
- Loops pausam fora da tela e com a aba oculta.
- Um efeito principal por tela; nada bloqueia leitura/clique por mais de 300 ms (exceto a intro, pulável).
- No celular, no máximo ~8 elementos animados ao mesmo tempo.

**Reduced motion:**

| Efeito | Com reduced motion |
|---|---|
| Cortinas | estado final direto |
| Faixa | lista estática |
| Sessões empilhadas | lista de cards |
| Manifesto | frase completa, sem pin |
| Colagem / parallax | fotos paradas no lugar |
| Roda 3D | grade |
| Prateleira de presentes | rolagem lateral normal |
| Lápis vermelho | círculos já desenhados |
| Linha de luz | linha cheia |
| Lightbox | sem "voo" |
| Lenis / cursor | desligados |
| Reveals | só aparecem |

---

## 12. Microinterações
Botões (hover ±6%, seta desliza 4 px, `:active scale(0.98)`); sublinhado que cresce; zoom 1,03 em fotos no hover; brilho único no selo de pacote; label que sobe no foco; check discreto em campo válido; obturador no envio; contadores mono com máscara vertical.

---

## 13. Responsivo e acessibilidade
- Larguras de teste: 360, 390, 768, 1024, 1440, 1920. Projeto pensado **primeiro em 390**.
- WCAG 2.1 AA: skip link; landmarks; um `h1`; títulos em ordem; alvos ≥ 44×44 (botões ≥ 52 px de altura no celular); foco visível próprio (anel 2 px `--accent`); todos os efeitos operáveis por teclado; `alt` obrigatório; nada piscando > 3×/s; `lang="pt-BR"`; zoom 200% sem quebrar; sem som/autoplay de vídeo.
- Nenhum elemento fixo sobreposto a outro em nenhuma largura.

---

## 14. Modo apresentação
- `?apresentar=1`, **só com `modoDemo: true`**, carregado por `import()` dinâmico.
- Painel flutuante (minimizável) com: tema Claro · Escuro; cor de destaque (presets); "Rever abertura" e 1/2/3 camadas; destaque do hero (cidade/tagline/rotativo); `nomeGigante` liga/desliga.
- Atalhos: `?tema=luz-natural`, `?tema=camara-escura`, `?intro=1`.

---

## 15. Desempenho

| Métrica (celular, 4G) | Meta |
|---|---|
| Lighthouse Desempenho | ≥ 90 (≥ 85 nas fases intermediárias) |
| Acessibilidade / Boas práticas / SEO | ≥ 95 |
| LCP | < 2,5 s |
| CLS | < 0,05 (alvo 0) |
| INP | < 200 ms |
| JS inicial | ≤ 150 KB gzip |
| Primeira dobra | ≤ 600 KB |

Como: `LazyMotion`; roda, colagem, folha, lightbox, prateleira e modo apresentação em chunks carregados perto da tela; `sizes` corretos (painel da cortina = `50vw`); CSS crítico do hero inline; fontes subset; nenhuma biblioteca de carrossel pronta.

---

## 16. SEO e prévia do link
- Injetados no build a partir do config: `title`, `description`, `canonical`, Open Graph, Twitter Card, `theme-color`.
- **OG image** 1200×630, < 300 KB, gerada por `scripts/og.ts` (rota `/og`). Regerar ao mudar tema ou foto principal.
- `robots.txt` liberado (o WhatsApp precisa ler a página); bloqueio por `<meta name="robots" content="noindex">` com `indexar: false`. `sitemap.xml` só com `indexar: true`.
- JSON-LD: `ProfessionalService` (estúdio) + `Store` (loja), só com campos confirmados.
- Favicon SVG com monograma + `apple-touch-icon` 180×180.
- **Teste manual:** colar o link no WhatsApp e conferir a prévia antes de mandar.

---

## 17. Analytics
Padrão `nenhum`. Opcional: Cloudflare Web Analytics (sem cookies, sem banner), só com `token`.

---

## 18. Fases

| Fase | Conteúdo | Status | Modelo sugerido |
|---|---|---|---|
| **1** | Fundação, temas, pipeline, header, cortinas, faixa, sessões, roda, CTA final, flutuante, modo apresentação, SEO, deploy | ✅ feita (reprovada visualmente pelo Pedro: curta e simples) | — |
| **1.5 Elevação** | Bugs e acabamento; escala; sessões empilhadas; colagem + roda; manifesto; nome gigante; FAQ com tom humano; **presentes**; tema `luz-natural`; dois pontos/duas redes; banco de fotos novo | ⏳ executada sem supervisão em 16/10 — **conferir** relatório, `DECISOES.md`, git log e o site no celular | Sonnet |
| **2** | O que faltar da 1.5 + folha de contato e lightbox; antes/depois (off); como funciona; pacotes (sessões + presentes); depoimentos; formulário → WhatsApp; FAQ completo (sessões + loja); contato completo; cursor visor; menu mobile | pendente | Sonnet |
| **3** | Polimento (easing, tempos), auditoria a11y (axe + teclado + leitor de tela), metas de §15, testes completos, README, **troca das fotos de exemplo pelas autorizadas**, textos confirmados, `modoDemo: false`, `indexar: true`, domínio do cliente, deploy final | pendente — **depende do conteúdo real do estúdio** | Opus |

### 18.1 Antes da Fase 2
1. Ler o relatório da 1.5 e `DECISOES.md`; testar no celular em 390 nos dois temas.
2. Listar o que ficou de fora ou com fallback; isso entra no começo da Fase 2 (ou num refazer pontual de um bloco com Opus).
3. Mover os documentos antigos para `docs/historico/`.

### 18.2 Aceite da Fase 2
- Todas as seções de §9 funcionando nos dois temas, em 360/390/768/1440.
- Formulário gera a mensagem certa para sessão e presente; cada card de presente abre o WhatsApp certo.
- Teclado completo; `vitest-axe` verde; nenhum `[ ]` na primeira dobra; nenhuma foto repetida em seções vizinhas.
- Rolagem ≥ ~10 telas no celular; Lighthouse ≥ 85 desempenho e ≥ 95 acessibilidade.
- Build, deploy da prévia, prints e relatório. Parar.

### 18.3 Aceite da Fase 3
- Metas de §15 completas; conteúdo real e autorizado; nenhum `[CONFIRMAR]` visível; `modoDemo: false`; `indexar: true`; JSON-LD com dados confirmados; prévia do link conferida no WhatsApp; README entregue.

---

## 19. Testes
- **Nada hardcoded:** renderiza com `site.config.alt.ts`, verifica "Estúdio Exemplo" e ausência de qualquer texto do config real; varredura em `src/` garantindo que "Ivy" (sem diferenciar maiúsculas) só existe em `site.config.ts`.
- **Config:** tipos + regras (WhatsApp só dígitos com DDI, `alt` presente, ids de foto existentes, seções existentes, nenhuma foto repetida em seções vizinhas).
- **WhatsApp:** formulário com todos os campos, sem opcionais, com acentos/`&`/quebras; mensagem de cada presente.
- **Intro:** reduced motion → estado final; `sessionStorage` indisponível não quebra; `?intro=1` força; `h1` presente desde o início.
- **Preços:** `null` → `[VALOR]` com `modoDemo` e "Consulte"/"Sob consulta" sem.
- **Depoimentos e manifesto:** exemplos/não confirmados somem com `modoDemo: false`.
- **A11y:** `vitest-axe` em cada seção nos dois temas. **Contraste:** checagem automática dos tokens.
- **Build:** falha com foto sem `alt` ou id inexistente.

---

## 20. Próximos passos (upsell — NÃO implementar agora)
- **Catálogo/loja de presentes** com página por produto e, depois, pedido com **envio da foto pelo cliente**.
- **Galeria privada de entrega**: o cliente vê as fotos da sessão, marca as favoritas e já escolhe em qual presente quer.
- **Reserva com sinal via PIX** e agenda de horários.
- **Vale-presente de sessão** e campanhas de datas (Dia das Mães, Dia dos Pais, Natal).
- **Páginas por tipo de sessão** (ex.: `/newborn`) para o Google.
- **Plano de presença local:** Perfil da Empresa no Google, avaliações reais, Search Console, dados iguais em todo lugar.
- Vídeo curto de bastidores; "mesa de luz" interativa.

---

## 21. Entrega
- **README** em português simples: trocar fotos, textos, preços, cores e tema; rodar o pipeline; publicar.
- **Hospedagem do cliente:** Cloudflare Pages ou Netlify (permitem uso comercial no plano grátis). Não usar Vercel Hobby para site de cliente.
- **Domínio no nome do estúdio** (Registro.br).
- Prints em 390 e 1440 nos dois temas; relatório Lighthouse; lista de `[CONFIRMAR]` resolvidos e pendentes; vault atualizado (pasta **Estúdio Ivy**).

---

## 22. Em aberto

**Decisões do Pedro (hero e visual):**
1. Depois da segunda cortina: foto principal com scrim (padrão) ou fundo liso?
2. Destaque do meio: cidade (padrão), tagline ou tipos girando?
3. 2 cortinas (padrão) ou 3?
4. Tema principal: `luz-natural` (padrão v2) ou `camara-escura`?
5. `nomeGigante` no hero: sim ou não?

**Para o Vitor levantar com o estúdio — `[CONFIRMAR]`:**
- Nome de marca no site (Ivy / Ivy Fotografia / Ivy Foto e Presente) e se há logo em boa resolução.
- Estúdio e loja: mesmo endereço? Endereços, horários (inclusive do shopping), WhatsApp de cada um.
- Sessões que realmente fazem; produtos carro-chefe; se "revelação na hora" e "20 anos" podem aparecer.
- Pacotes e valores (ou "sob consulta"); prazos de entrega das fotos e dos presentes; formas de pagamento.
- Fotos autorizadas para o site (pessoas e produtos) e autorização dos clientes retratados.
- Depoimentos reais autorizados e link das avaliações no Google.
- Respostas do FAQ e uma frase que represente o jeito deles (manifesto/tagline).
- Cores preferidas (ou se a paleta marrom/creme da marca já serve).
