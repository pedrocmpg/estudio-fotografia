# Decisões — elevação da Fase 1

Registro das decisões tomadas sem perguntar (execução sem supervisão). Formato: data · o que decidiu · por quê.

## Geral

- **2026-10-16 · Cofre Obsidian não encontrado.** O caminho `C:\Users\User\Documents\Projetos\segundo-cerebro` não existe nesta máquina (o usuário é `Pedro`; nenhuma pasta `segundo-cerebro` achada). As notas "Log de Mudanças" e "Decisões" foram escritas em `docs/obsidian/` (Markdown pronto para copiar para a pasta **Estúdio Ivy** do cofre). **Pendente:** copiar para o cofre.
- **2026-10-16 · Fotos de produto.** O Unsplash não tem acesso sem chave de API; os produtos (canecas, álbum, polaroids, porta-retratos, quadro, almofada) vêm do Wikimedia Commons, só com licença livre (CC0, CC BY, domínio público), com autor, licença e página em `fotos.meta.json`. Entram como "fotos ilustrativas". Nenhuma imagem do Instagram deles foi usada.
- **2026-10-16 · Preto e branco por pipeline.** Novo campo `tratamento: 'pb'` no `fotos.meta.json`: o pipeline gera a versão P&B de uma foto de origem com outro id. Assim o banco ganha variedade sem baixar mais arquivos. O banco não tem fotos de smash, tema gaúcho nem fundo liso colorido; as categorias usam fotos ilustrativas parecidas até o estúdio mandar as dele.
- **2026-10-16 · Foto repetida.** Regra automática em `validarConfig` (e em `tests/bloco-a.test.tsx`): seções vizinhas que mostram foto (hero, sessões, presentes, manifesto, trabalhos, CTA) não repetem o mesmo id; colagem e roda também não.
- **2026-10-16 · Config real × teste.** Todo texto novo está em `site.config.ts` (e dados fictícios equivalentes em `site.config.alt.ts`).

## Bloco A

- Selo "Prévia · fotos ilustrativas": removido o fixo; ficam um no canto inferior esquerdo do hero (só depois da abertura, para não brigar com o contador) e um no rodapé.
- Não existia botão de voltar ao topo no código; não foi criado um fixo (evita sobreposição). O rodapé terá um link "Voltar ao topo" no fluxo da página (bloco F).
- Cidade de exemplo: "Bento Gonçalves / RS", vinda do perfil público (adendo I.0), marcada `[CONFIRMAR]`.
- `body` passou de `overflow-x: hidden` para `clip`: não cria contêiner de rolagem e mantém `position: sticky` funcionando (blocos C, D, E).

## Bloco C

- **Progresso da rolagem por variável CSS.** Em vez de `animation-timeline: view()` (que não mede bem elementos `sticky`, porque o cartão preso fica parado na tela), uma leitura de `getBoundingClientRect` por quadro (rAF) escreve `--p` no elemento e o CSS faz o resto com `calc()` em `transform`/`opacity`. O hook (`useVariavelDeRolagem`) só escuta enquanto o elemento está perto da tela (IntersectionObserver). Vale como a alternativa prevista no prompt ("motion useScroll ou rAF/IO") e funciona em Safari/Firefox também.
- Cartão coberto: `scale(1 → 0,94)` e uma camada preta com `opacity` até 0,55 (só transform/opacity). Cartões alternam três fundos sutis do tema (adendo I.7).
- Nome da sessão sempre na parte baixa da foto, com véu; campo opcional `posicaoTitulo: 'topo'` fica disponível para quando o rosto estiver embaixo.
- Desktop: o fundo é `sticky` e a lista de nomes sobe por cima (margem negativa de 100svh); o nome no meio da tela vira o ativo (IntersectionObserver), o mouse/foco de teclado têm prioridade. Miniaturas em duas faixas (90 s e 140 s, sentidos opostos), pausadas fora da tela.
- Movimento reduzido: lista vertical simples (mobile) e sem faixas (desktop); a troca de foto vira instantânea.

## Bloco D

- **Colagem:** parallax em CSS puro (`animation-timeline: view()`, atrás de `@supports` e de `prefers-reduced-motion: no-preference`), só `transform`, meia-amplitude de 2% a 7% por foto (deslocamento total de 4% a 14%). Navegadores sem suporte (Firefox, Safari antigo) mostram a foto no lugar. Entradas com `clip-path` (`Revelar`) em fotos alternadas.
- **Fotos da colagem no celular** ocupam 70 a 92% da largura (a colagem tem, por definição, tamanhos diferentes); o resto do site mantém ≥ 85%.
- **Lightbox simples** (o prompt autoriza): tela cheia, Esc, setas, arrastar, contador, foco preso e devolvido, rolagem da página travada, pré-carrega a próxima. Carregada sob demanda (chunk). Sem View Transitions (fica para a Fase 2/3).
- **Pista no celular:** seção de `100svh + n × 18svh` (≈ 280svh com 10 fotos) com palco `sticky`; fotos a 85% da largura, vizinhas em `scale(0,84)` e `opacity` 0,5, contador `03 / 10`. O progresso vem da mesma variável `--p` do bloco C. Teclado: focar uma foto fora da tela leva a rolagem até ela. Só as fotos vizinhas ao centro mudam de escala, e só `transform`/`opacity` → bem abaixo do limite de 8 fotos animadas.
- Fallbacks mantidos: `snap` (rolagem horizontal com scroll-snap a 85%) se não houver `position: sticky`; grade com movimento reduzido ou sem preserve-3d.
- Roda 3D no desktop com fotos de `28vw` (máx. 440 px). Anotação: não foi possível medir jank em Android intermediário real (sem aparelho); a técnica evita layout/paint na rolagem.

## Bloco E

- Manifesto entra na ordem: sessões → presentes → manifesto → trabalhos. Palco `sticky` de 300svh; cada palavra é uma máscara (`overflow: clip`) com `translateY` + `opacity` calculados em CSS a partir de `--p` (progresso da rolagem), sem timers. A primeira palavra já está visível ao chegar e a última fica até a citação, para nunca haver tela escura vazia.
- A frase completa existe como texto único no `<h2 class="sr-only">`; o palco animado é `aria-hidden`.
- Citação: `Reveal` (fade + subida), em itálico; fotos em tamanhos bem diferentes reutilizam a mecânica de parallax da colagem (`layout="trio"`), sem interação (figuras com alt).
- Texto de exemplo `[CONFIRMAR]` em `manifesto.confirmado: false`: com `modoDemo: false` a seção some até alguém marcar `confirmado: true`. Palavras (adendo I.7): "Momentos. / Memórias. / Presentes que contam a sua história."; citação original: "Foto boa merece sair da galeria do celular."
