# Decisões — Fase 1 elevada e Fase 2

Registro das decisões tomadas sem perguntar (execução sem supervisão). Formato: data · o que decidiu · por quê.

## Geral

- **2026-10-16 · Cofre Obsidian.** Na Fase 1.5 o cofre não foi achado e as notas ficaram em `docs/obsidian/`. Na Fase 2 ele existe em `C:\Users\User\Documents\Projetos\segundo-cerebro\Projetos\Estúdio Ivy` e as duas notas (Log de Mudanças e Decisões) foram atualizadas lá; `docs/obsidian/` segue como espelho.
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

## Bloco F

- **Rodapé:** nome da marca gigante com a largura da tela, cortado pela borda de baixo (altura da caixa = 74% do corpo da fonte). Um hook mede o texto e escreve `--fs-gigante`, então funciona com qualquer nome (curto ou longo) e refaz a conta quando as fontes carregam ou a tela muda. Usa `negocio.nomeCurto` ("Ivy"); a assinatura "Foto e Presente" fica em `negocio.assinatura` (texto para leitor de tela). O nome gigante é `aria-hidden`: o nome real está no © do rodapé.
- A faixa de links vem **logo acima** do nome (não sobreposta às letras): links pequenos sobre letras de 300 px ficam ilegíveis e reprovariam no contraste. Registrado como desvio consciente da frase "com a faixa de links por cima".
- Rodapé novo (adendo I.5): navegar, pontos de atendimento (estúdio e loja, cada um com endereço, horários e "Abrir no mapa" sem iframe), as duas contas de Instagram com rótulo (`negocio.redes`), e-mail, selo único e "Voltar ao topo" no fluxo da página. Cada item só aparece se existir no config.
- **Hero `nomeGigante`:** padrão `false` (prévia). Quando `true`, o `<h1>` (texto real) vai para a parte baixa do hero, cortado pela borda, e os textos e botões sobem para o topo, longe do rosto. Dá para testar no painel de apresentação ("Nome do hero → Gigante"). Na foto de exemplo (mulher de costas, cabelo à direita) o nome na parte baixa não cobre o rosto, mas o hero perde o ar de "foto limpa"; fica `false` na prévia, como o prompt manda.

## Bloco G

- FAQ em `<details>/<summary>`, com frase de abertura em itálico vinda do config (`faq.abertura`), título com máscara e coluna fixa (sticky) no desktop. O texto de todas as respostas é `[CONFIRMAR]`, em tom direto e sem prazo nem preço (adendo I.7: perguntas da loja "Quanto tempo leva?", "Dá para levar a foto do celular?", "Vocês imprimem na hora?", "Quais formas de pagamento?" + as do estúdio).
- Cada item tem `confirmada`. Na prévia todos aparecem; com `modoDemo: false` só os confirmados (e a seção some se não sobrar nenhum). O `FAQPage` em JSON-LD só leva respostas confirmadas, e só é emitido em produção (`indexar` + `modoDemo: false`).
- JSON-LD agora vive em `src/lib/dadosEstruturados.ts` (testável): `ProfessionalService` (estúdio), `Store` (só se houver um local do tipo `loja`) e `FAQPage`, só com campos que existem; telefone provisório (`…000000000`) nunca vai.

## Adendo (bloco I)

- **Padrão da prévia:** `luz-natural` com `coresDestaque['luz-natural'] = '#8A5A3B'` (marrom da marca; ≥ 5:1 com texto branco e sobre o creme). `camara-escura` continua em `?tema=camara-escura` e no painel. A cor de destaque do plugin agora usa `html:root[data-theme=…]` (maior especificidade) porque o CSS do bundle chegava depois e vencia.
- **Nome de marca:** `negocio.nome = 'Ivy · Foto e Presente'` ([CONFIRMAR]), `nomeCurto = 'Ivy'` (hero e nome gigante do rodapé), `assinatura = 'Foto e Presente'`. Cidade de exemplo "Bento Gonçalves / RS" (perfil público).
- **Presentes:** seção `presentes` entre sessões e manifesto, com chips por categoria, faixa "Revelação na hora", prateleira de cards grandes (scroll-snap, 85vw no celular, 30vw no desktop) e botão "Pedir no WhatsApp" por item com a mensagem pronta do config. Sem `valor` → `[VALOR]` na prévia e "Consulte" em produção (nenhum preço inventado). A mesma faixa aparece no hero (linha discreta sob os botões) e o texto do CTA final liga foto → presente.
- **Fotos de produto:** 7 imagens do Wikimedia Commons (licença livre; autor e página no meta); nada do Instagram deles. O banco não tem canecas "mágicas", chaveiros, cubo de acrílico nem quebra-cabeça, então os itens de exemplo são: caneca branca, caneca personalizada, álbum, porta-retratos, quadro, almofada e polaroids. Selo "Fotos ilustrativas de produtos" na seção (só na prévia).
- **Sessões (I.4):** Newborn, Gestante e casal, Família, Aniversário e smash, Formatura, Ensaio pessoal, Temáticos, Eventos, cada uma com 2 fotos próprias.
- **Contato e localização (I.5):** `negocio.redes` (duas contas, rótulos "Estúdio" e "Loja") e `negocio.locais` (estúdio e loja) estão no rodapé, comentados no config real porque ainda não foram confirmados; JSON-LD `ProfessionalService` + `Store` + `FAQPage` só com campos existentes. A seção "contato" completa continua na Fase 2.

## Bloco H

- **Hover só com `(hover: hover) and (pointer: fine)`:** todos os `:hover` do CSS foram movidos para esse bloco e um teste varre `src/` para impedir regressão. O cursor "visor" não existe ainda (Fase 2).
- **Títulos por máscara:** a cascata de 60 ms é por **palavra** (a quebra de linha real depende da largura da tela e exigiria medir o DOM a cada resize); com títulos curtos o efeito lê como linha a linha. Uma vez só, com `IntersectionObserver`.
- **Fotos revelando (`Revelar`):** `clip-path: inset(8%) → inset(0)` + `scale(1,1 → 1)` em 900 ms, uma vez, nas fotos da colagem (alternadas), nos produtos e nas fotos do manifesto/colagem. Movimento reduzido: sem clip nem zoom.
- **Pares da cortina:** revisados lado a lado. 1ª cortina: mulher em contraluz olhando para a direita + loira olhando para cima à esquerda; versão celular: perfil virado para a direita + mulher olhando por cima do ombro. 2ª: dois casais sob o véu. Pares mantidos, as temperaturas de cor combinam (luz de pôr do sol).

## Revisão visual (prints) e desempenho

- **Cortina reversa do CTA:** painéis em 4% (celular) e 6% (desktop) de cada lado, em vez dos 12% da spec: com 12% no tema claro (painéis na cor do fundo) o CTA parecia uma foto emoldurada com margens, contra o pedido "tela cheia, sem caixa". O efeito (fecham uma vez, emolduram a foto) continua.
- **Cabeçalho:** o nome de marca ficou mais longo; em larguras de desktop corta com reticências antes de espremer o botão "Pedir sessão", que nunca quebra linha. No celular (`MEDIA_CELULAR`) o header mostra `negocio.nomeCurto` (o nome completo fica no `aria-label`); ver "Refino final".
- **LCP:** o Lighthouse simulado (mobile, 4G lento, CPU 4×) deu 3,0–3,1 s (antes da elevação: 3,4 s). O elemento é a primeira foto da cortina, e o atraso é o JS montar a abertura (HTML inicial só tem o `<h1>`); sem estrangulamento, a renderização leva ~440 ms. Fizemos: foto prioritária sem fade/espera do React, recursos do `motion` em chunk à parte (JS inicial de 103 → 86 KB gzip). **Pendente:** para ficar abaixo de 2,5 s é preciso pré-renderizar a primeira cortina no build (README, "Notas técnicas").
- **Intro em celular:** sem aparelho Android real; teste com CPU 4× mais lenta (Chrome emulando celular): começa em ~0,8 s, dura 4,5 s (spec: ~4,2 s), uma única tarefa longa (400 ms, a montagem inicial do JS), nenhuma durante a animação; "Pular" termina em 0,3 s. Não foi preciso simplificar.

## Ajuste do celular (16/10/2026)

- **Causa do "tela vazia":** o manifesto tinha pista `sticky` de 300svh e citação de 80svh em todas as larguras; no celular sobravam quadros só com fundo. Agora há três modos (`data-modo` na seção): `pin` (desktop), `compacto` (celular) e `estatico` (movimento reduzido).
- **Critério de troca:** `(max-width: 767px), (pointer: coarse)`, em constante `MEDIA_CELULAR` (JS) e repetida nos `@media` (CSS). Nada de user-agent; `tests/celular.test.tsx` varre `src/` para impedir. A roda 3D também passou de 640 px para esse mesmo critério (antes tinha um limite próprio).
- **Manifesto no celular:** ~100svh, sem pin e sem leitura de rolagem; palavras empilhadas revelam em sequência (120 ms, uma vez, `IntersectionObserver`); citação menor e só 2 fotos sobrepostas (`Colagem layout="par"`, uma inclinada, sem parallax).
- **Manifesto no desktop:** pista 300 → 200svh. Transição das palavras mais larga (`--t: 0.41`, patamar `--h: 0.15`): a seguinte começa quando a anterior está a 70% da saída (~30% de sobreposição). Nunca sobra um quadro vazio (visibilidade mínima ~0,3 no cruzamento).
- **Roda 3D no celular (conflito entre specs):** §10.6b pedia 250–300svh e §11 limita a 150svh; valeu §11. Palco de 80svh (preso a `top: 10svh`) + até 50svh de rolagem = 130svh. Palco menor também reduz o vazio acima e abaixo da foto quando a pista entra e sai. Cada foto passa em ~5svh de rolagem (mais rápido que antes); alternativa, se incomodar: `scroll-snap` horizontal sem pin.
- **Espaço entre seções:** `--espaco-secao` vira `clamp(3.5rem, 10vh, 5rem)` no celular (`tokens.css`).
- **Auditoria (360 e 390 px, ~19 telas):** `scripts/prints-celular.ts` (`npm run prints:celular`) rola a página, tira um print por tela e mede a fração de faixas com conteúdo (≥ 40%); nenhum print abaixo (mín. 50%). Prints em `docs/prints/ajuste-celular/` (JPEG 1x). Presentes (rolagem lateral nativa), sessões empilhadas, colagem e CTA final não precisaram de mudança além do novo espaçamento.
- **Bug achado nos prints:** a lista de fotos do manifesto compacto colapsava a largura 0 (margem automática numa coluna flex); corrigido com `width: 100%`.
- **Medidas:** Lighthouse celular 94 / 100 / 100 / 69 (SEO por causa do `noindex` da prévia); LCP 2,9 s (antes 3,0–3,1), CLS 0,001, TBT 50 ms. 199 de 200 testes verdes: `tests/apresentacao.test.tsx` ("mostra o painel") estoura o tempo na suíte inteira e passa isolado; falha igual sem estas mudanças (já existia).
- **Sem aparelho real:** validação em Chrome emulando celular (toque, DPR 2).

## Fase 2 (16/10/2026)

Execução sem supervisão do §18 (aceite em §18.2). Um commit por bloco (J a O), com lint, typecheck e testes verdes em cada um.

### Antes de construir: celular em 360 e 390

- **Conferido:** `npm run prints:celular` (20 prints por largura, um por tela) e leitura visual de todos. Nenhum print só de fundo. Dois pontos fracos: a pista da roda (foto de 4:5 num palco de 80svh deixava ~40% de vazio em volta da foto) e um teste instável.
- **Correção:** pista da roda com palco de 68svh (preso a `top: 16svh`) e foto 3:4 (até 58svh de altura): 118svh no total (antes 130svh; limite de §11: 150svh). Testes de `celular.test.tsx` atualizados.
- **Teste instável de antes:** `apresentacao.test.tsx` estourava o tempo do `findByRole` (1 s) no primeiro `import()` do painel com a suíte inteira rodando. `asyncUtilTimeout` global de 8 s em `tests/setup.ts` e `testTimeout` de 20 s. Suíte verde, sem falha conhecida.

### Config (tipos)

- **Pacotes em dois grupos** (`pacotes.grupos`: "Sessões" e "Presentes", como em §6), no lugar da lista única. `alvoPedido` é o id de uma sessão (grupo Sessões) ou de um presente (grupo Presentes); o validador confere. Valor `null`: `[VALOR]` na prévia e "Sob consulta" no site final (a loja continua com "Consulte").
- **`pedido.tipos` não existe**: as opções do select vêm de `sessoes` e `presentes` (nada é digitado duas vezes). Valores `sessao:<id>`, `presente:<id>` e `outro`.
- **`faq.itens[].grupo`** ("Sessões" ou "Loja") e **`contato`** (título e texto) entram no config. Dados do estúdio continuam só em `site.config.ts`; o alt tem tudo fictício (o teste de varredura confirma que "Ivy" só existe lá).
- **`[CONFIRMAR]` visível só na prévia:** `inclui` e `entrega` dos pacotes, texto dos passos e dados de contato que faltam somem com `modoDemo: false` (`visivel()` em `lib/preco.ts`).

### Bloco J — formulário (Pedido)

- Mensagem pelo `modeloMensagem`, omitindo linhas vazias. O tipo vai como "Sessão: Newborn" ou "Presente: Caneca branca" (`outro` vira "outro assunto"); a data do campo `type="date"` sai como `05/12/2026`.
- **Número de destino:** pedido de sessão usa o WhatsApp do local `estudio`, pedido de presente o do local `loja`; sem número próprio, o `negocio.whatsapp` (hoje todos iguais e provisórios).
- **Pré-seleção:** os links "Pedir essa sessão" e "Pedir este pacote" continuam com `href="#pedido"` (funciona sem JS e rola nativamente) e levam `data-pedido-alvo`; o formulário escuta o clique no documento e escolhe o tipo. Antes o href era `#pedido?sessao=…`, que o navegador não resolvia.
- **Validação só do nome**, em texto (`role="alert"`, `aria-invalid`), com o foco voltando ao campo; `noValidate` para a mensagem ser nossa. Obturador de 300 ms (aperta, clarão), sem animação com movimento reduzido. Check ✓ discreto em campo preenchido. A "label que sobe no foco" (§12) ficou de fora: labels visíveis acima do campo já cumprem §10.12 e evitam o truque do placeholder.
- Token novo `--erro` nos dois temas (entra na checagem de contraste do build). As seções `pedido` e `contato` escondem o botão flutuante do WhatsApp enquanto estão na tela.

### Bloco K — Como funciona e Pacotes

- **Linha de luz:** variável `--p` por rAF (mesmo hook das sessões); a linha cresce por `scaleY` e cada passo acende com um ponto cheio (opacidade e escala). Não usei opacidade no texto: texto a 35% reprovaria no contraste do axe e do Lighthouse. Movimento reduzido: linha cheia e pontos acesos.
- **Pacotes:** abas no celular (setas, Home e End), colunas lado a lado a partir de 900 px. O `h3` do grupo fica só para leitor de tela no celular (a aba já mostra o nome) para não pular de h2 para h4. O brilho do selo passa uma vez ao entrar; `selo` só aparece se vier no config (nenhum "Mais pedido" inventado).

### Bloco L — Depoimentos e Antes/depois

- **Depoimentos:** uma citação por vez, `aria-live="polite"`, sem autoplay, contador `01 / 03`. Na prévia há 3 exemplos genéricos com selo **EXEMPLO** (§5 permite; autor "Cliente de exemplo"); em produção só os `exemplo: false`, e a seção some sem eles. Título fixo "O que dizem" (palavra estrutural, não dado do estúdio).
- **Antes/depois:** `<input type="range">` por cima da foto (invisível, com anel de foco na caixa) e `clip-path` no "antes". Desligado no config real (`[]`); testado com um par de fotos de teste. O "antes" é decorativo (alt vazio) para o leitor de tela ouvir uma descrição só.

### Bloco M — Folha de contato e lightbox

- **Folha:** 8 fotos (as 12 da Fase 1.5 repetiam a colagem e a roda, que ficam logo acima na mesma seção). Abas "Todas", "Ensaios" e "Família"; o banco não tem fotos de evento sobrando. Numeração `01A ▸`, tira escura com furos, lápis vermelho (SVG, `stroke-dashoffset`, cor fixa por ser desenho) nas fotos `marcada`, com ✓. O validador passou a incluir a folha nas fotos da seção `trabalhos` (não repete colagem nem roda) e a conferir a categoria.
- **Dados técnicos** (`f/11 · 4 s · ISO 100`) só com `mostrarDadosTecnicos` e quando a foto tem exposição no manifest (hoje só 2 produtos têm; as fotos de banco vêm sem EXIF).
- **Lightbox:** abrir, fechar e trocar passam por `document.startViewTransition` (cruzamento suave), com fallback no fade em CSS que já existia e sem a API quando há movimento reduzido. **Não fiz o "voo" da miniatura até a tela cheia** (exigiria `view-transition-name` único dos dois lados e mexer no foco): fica como polimento da Fase 3.

### Bloco N — FAQ e Contato

- **FAQ** em dois blocos com `h3` (Sessões primeiro, Loja depois; sem `grupo` não há subtítulo). Em produção, grupo sem resposta confirmada some junto.
- **Contato:** um cartão por local (`negocio.locais`), com endereço, "Abrir no mapa" (link, sem iframe), horários (do local, ou os do negócio) e WhatsApp do local; abaixo, as redes com rótulo e o e-mail. No config real os dois locais existem só com rótulo (estúdio e loja no shopping); endereço, horários e redes aparecem como `[CONFIRMAR]` na prévia.
- **Rodapé:** local sem nenhum dado não ganha coluna vazia (antes mostrava só "ESTÚDIO" e "LOJA NO SHOPPING"). O rodapé continua repetindo endereços e redes quando existirem (decisão da Fase 1.5; é onde se espera achá-los).

### Bloco O — Menu do celular e cursor visor

- **Menu:** botão de 44×44 no header (só abaixo de 900 px); tela cheia em portal no `<body>` (o `backdrop-filter` do header prenderia um `position: fixed` dentro dele), links na fonte de título com cascata de 40 ms, foco preso, `Esc` fecha, rolagem travada, foco volta ao botão. Os links são os mesmos do desktop (Sessões, Presentes, Trabalhos, Pacotes, Dúvidas) mais o botão "Pedir sessão". "Como funciona" saiu da navegação (§10.1 lista cinco links).
- **Cursor visor:** só com `(hover: hover) and (pointer: fine)` e sem movimento reduzido; chunk à parte. O círculo de 28 px e o visor `[ ]` de 64 px são o mesmo elemento mudando de `scale` (a regra "só transform e opacity" do bloco H barrou transição de largura e altura). `mix-blend-mode: difference` para aparecer sobre foto clara e escura. Fotos clicáveis (colagem, roda, folha) levam `data-visor`.

### Medidas e aceite (§18.2)

- **Seções:** todas as de §9 funcionam nos dois temas (teste `fase2-aceite`, `vitest-axe` em cada seção nos dois temas, mais a página inteira). Antes/depois fica desligado por padrão (§9).
- **Prints:** `npm run prints:fase2`, 4 larguras (360, 390, 768, 1440) × 2 temas, um print por tela, em `docs/prints/fase2/<tema>/<largura>/`, mais `extras/` (menu aberto, aba Presentes dos pacotes, erro do formulário). Celular (360 e 390): nenhum print abaixo de 40% de conteúdo. Em 768 e 1440 a regra não vale (o manifesto em pin tem telas de uma palavra por desenho), mas o relatório mostra a medida. 768 px usa a composição de desktop (a troca é por largura < 768 ou ponteiro de toque).
- **Rolagem no celular:** 25,4 telas em 390 px (meta ≥ ~10).
- **Lighthouse (celular, simulado):** desempenho 94, acessibilidade 100, boas práticas 100, SEO 69 (por causa do `noindex` da prévia, esperado). LCP 3,0 s, CLS 0,001, TBT 60 ms. JS inicial 92 KB gzip (meta ≤ 150). Relatório em `docs/prints/lighthouse-fase2.html`.
- **Testes:** 277 verdes na época (eram 200); hoje 279 (ver "Refino final").
- **Pendente:** (1) ~~deploy da prévia não foi feito~~ — **já foi feito** depois, a partir de outra máquina (https://ivystudio-b3x.pages.dev; ver "Refino final" para o redeploy); (2) LCP abaixo de 2,5 s pede pré-renderizar a primeira cortina (Fase 3); (3) sem aparelho Android real; (4) "voo" da miniatura na lightbox e label que sobe no foco (polimento, Fase 3).

## Rodapé no celular (SPEC §10.17)

- Só em `(max-width: 767px) and (pointer: coarse)`; o desktop não muda. Nome gigante com 2% de folga por lado (padding do wrapper, medido pelo hook) e corte em 88% do corpo, para o "y" aparecer. O hook arredonda o corpo para baixo e remede após `document.fonts.ready` e a cada mudança de largura da caixa.
- Navegação e redes em 2 colunas; pontos de atendimento em linha cheia; © + selo (menor) numa linha de metadados que quebra em telas estreitas (o © "Ivy · Foto e Presente" + selo não cabem juntos em 360/390 px); "Voltar ao topo" à direita.
- Prints: `docs/prints/rodape-celular/` (`npx tsx scripts/prints-rodape.ts`), 360 e 390, dois temas, "Ivy" e nome longo; confere que o nome não passa da largura da tela.

## Rodapé sem o nome gigante

- A pedido do Pedro, o "Ivy" gigante do rodapé foi removido (desktop e celular). O componente `NomeGigante` foi apagado; `useAjusteLargura` continua no hero (opção `nomeGigante`). O texto do §10.17 e do bloco F sobre o nome gigante no rodapé está superado por esta decisão.

## Refino final antes do cliente (2026-10-28)

- **WhatsApp de demonstração.** O prompt pedia `[NÚMERO DE TESTE]`, mas isso é um espaço vazio do modelo (o Pedro ainda não passou o número), e `wa.me` só aceita dígitos; o validador (`/^\d{12,13}$/`) também barra texto. Inventar um número plausível poderia chamar uma pessoa real. Ficou `5500000000000` (DDD 00 não existe: não chega a ninguém; o validador e o JSON-LD já tratam como provisório), com o comentário `[NÚMERO DE TESTE]` no config. **Trocar pelo do estúdio na Fase 3**; para a demo, basta colar o número de teste em `negocio.whatsapp` (uma linha, `site.config.ts`), rebuildar e redeployar. Formulário, botão flutuante, cards de presente, "Pedir essa sessão" e contato resolvem todos para `negocio.whatsapp` (os `locais` ainda não têm número próprio); testes já cobrem as URLs `wa.me` e a mensagem.
- **Header no celular:** `MEDIA_CELULAR` mostra `negocio.nomeCurto`; `aria-label` leva o nome completo (contém o texto visível). Desktop não muda. Teste em `tests/header-celular.test.tsx`.
- **`RELATORIO-ESTADO.md` não existe** no repositório nem no histórico; a referência foi ignorada (as fontes foram SPEC, DECISOES e os relatórios em `docs/prints/`).
- **Cofre Obsidian:** `C:\Users\User\...` não existe nesta máquina (Linux); notas em `docs/obsidian/`.
- **Deploy:** o `wrangler` não está autenticado nesta máquina (ver relatório do refino).
