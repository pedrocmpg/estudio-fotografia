# PROMPT — Elevar a Fase 1 do Estúdio Ivy (versão completa, para rodar sem supervisão)

Leia o `SPEC.md` inteiro e o código atual antes de mexer em qualquer coisa.

## Contexto

A Fase 1 está no ar, mas o Pedro testou no celular (390 px) e reprovou: o site está **curto, pequeno e simples demais**. A base funciona; faltam escala, ritmo, movimento ao rolar e acabamento. Ele também trouxe uma referência de portfólio de fotógrafo (um vídeo) e quer **o estilo geral dos efeitos de rolagem, não uma cópia**. Todo o código é **escrito do zero**; nada de copiar código, texto, nome ou fotos de outro site.

**Esta tarefa:** elevar a Fase 1 com os blocos A a H abaixo. **Não implemente** o resto da Fase 2 (folha de contato, como funciona, pacotes, depoimentos, formulário). Ao terminar, **pare e faça o relatório**.

Prioridade de decisão: **acessibilidade > desempenho no celular > efeito visual**.

## Regras para rodar sem ninguém olhando (o Pedro está em aula)

- **Não faça perguntas.** Quando houver dúvida, escolha a leitura mais razoável, siga em frente e anote a decisão em `DECISOES.md` (data, o que decidiu, por quê).
- Trabalhe **por blocos**, na ordem A → H. **Ao fim de cada bloco:** rode lint, typecheck e testes; só avance se estiver verde; faça um commit com mensagem clara (`feat: bloco C — sessões empilhadas`).
- Se um efeito estiver **pesado ou instável**, entregue o **fallback simples** descrito no bloco, registre em `DECISOES.md` e siga. Nunca deixe o site quebrado para "terminar o efeito".
- Se algo travar por mais de ~3 tentativas, **pule o item**, anote em `DECISOES.md` como pendente e continue com o próximo.
- **Nunca** use dados reais (CPF, CNPJ, nomes completos, dados de terceiros) em testes, exemplos ou fixtures. O nome "Ivy" e dados do estúdio ficam **somente** em `src/config/site.config.ts`. Testes usam `site.config.alt.ts` (dados fictícios).
- Ao terminar cada bloco, **registre no vault Obsidian** `C:\Users\User\Documents\Projetos\segundo-cerebro`, pasta **Estúdio Ivy**, nas notas Log de Mudanças e Decisões (pode escrever direto, sem perguntar).
- Ao final de tudo: `build`, deploy da prévia (mesmo fluxo atual), prints e relatório.

## Regras técnicas valem para tudo

- Animar só `transform`, `opacity` e `clip-path`. Nunca `width`, `height`, `top`, `left`.
- Efeitos de rolagem: preferir **CSS `animation-timeline: scroll()/view()`** quando houver suporte (com `@supports`), e **motion `useScroll`** como alternativa. Nunca escutar `scroll` com cálculo pesado no main thread; usar `IntersectionObserver`/`requestAnimationFrame`.
- **Reduced motion:** todo efeito novo tem estado final estático (texto todo visível, fotos no lugar, sem pin).
- Seções com `position: sticky`/pin: altura de rolagem definida em `svh`, sem travar a página, sem "armadilha" de rolagem; o teclado e leitores de tela continuam alcançando todo o conteúdo na ordem do DOM.
- Todo o conteúdo novo vem do config (`site.config.ts` + tipos em `types.ts`). Nada de texto do estúdio dentro de componente.
- Cada foto nova precisa de `alt`. Primeira dobra continua com as fotos da camada 1 pré-carregadas, e nada novo pode piorar o LCP.

---

## A. Bugs e acabamento (fazer primeiro)

1. **Selo "PRÉVIA · FOTOS ILUSTRATIVAS"** está fixo na tela e colide com o botão de voltar ao topo e com o rodapé, e aparece duplicado. Deixar **um só**: no rodapé, e no máximo um discreto no canto do hero. Nunca fixo sobre o conteúdo. Botão de voltar ao topo e botão flutuante do WhatsApp não podem se sobrepor a nada (respeitar `safe-area-inset-bottom`).
2. **Placeholder visível:** "FOTOGRAFIA EM [CIDADE]" aparece no hero. Na prévia, usar uma cidade de exemplo no config ou omitir a linha. **Nenhum `[ ]` na primeira dobra.**
3. **Botões:** estão em vinho apagado. Voltar à paleta da spec: primário em `--accent` (âmbar no escuro, terracota no claro) com `--on-accent`; raio pequeno (2–4 px); altura mínima 52 px no celular; texto maior.
4. **Botão secundário ("Ver trabalhos")** com borda 1 px em `--text` a ~45% de opacidade, legível sobre foto, com hover/foco claros.
5. **Vazios sem propósito** entre seções (ex.: ~300 px de preto depois de "Pedir essa sessão"). Criar token `--espaco-secao: clamp(5rem, 12vh, 9rem)` e remover o resto.
6. **Foto repetida:** a mesma foto abre "Sessões" e "Trabalhos". Nenhuma foto pode repetir em seções vizinhas; cada sessão tem 2 fotos próprias.
7. Rodapé alinhado e sem sobreposição em 360, 390, 768, 1024, 1440.

## B. Escala e presença

1. **Hero em tela cheia** (`100svh`). O nome "Ivy" bem maior (`clamp(5rem, 22vw, 14rem)` no celular; até 16rem no desktop). Foto de fundo com escurecimento mais leve e vinheta só nas bordas. Indicador sutil de rolagem (linha fina animada, 1 loop curto, some ao rolar).
2. **Fotos maiores em todo lugar:** no celular, nunca abaixo de ~85% da largura; no desktop, 60–100% do container.
3. **Títulos de seção maiores** (`clamp(3rem, 9vw, 6rem)` no celular) com rótulo mono numerado acima.
4. **Faixa de sessões** maior (display `clamp(2.5rem, 7vw, 5rem)`), um pouco mais lenta, com diafragma maior.
5. **CTA final em tela cheia (full-bleed)**, sem caixa com margens: foto cobrindo a seção; o texto **sobre a área calma da foto**; o casal/assunto precisa ficar visível; scrim só onde há texto. Cortina reversa da spec (painéis laterais fecham até emoldurar a foto, uma vez só).
6. **Meta de altura:** com tudo deste prompt, a rolagem total no celular deve ter **pelo menos ~10 telas** (por escala, ritmo e as novas seções, não por texto repetido).

## C. Sessões em rolagem (cards empilhados) + categorias em letras grandes

Substitui o carrossel/cards simples da seção Sessões.

- **Celular:** cada sessão ocupa uma tela (`min-height: 90svh`) com foto grande, **nome da sessão em letras gigantes na fonte display** (por cima da foto, cuidando de **não cobrir o rosto**: texto na parte baixa ou lateral, com scrim), frase curta e link. Efeito de **cards empilhados** com `position: sticky`: cada card cobre o anterior, que escurece e reduz levemente de escala (só transform/opacity).
- **Desktop:** composição editorial assimétrica com uma **foto larga ao fundo** e os nomes das categorias ("Retratos", "Eventos", "Marcas"…) em letras enormes por cima, atravessando a foto; faixas de miniaturas passando atrás em velocidades diferentes. Hover troca a foto de fundo com crossfade.
- Fallback: lista vertical simples de cards com o mesmo conteúdo.

## D. Colagem de fotos soltas com parallax (galeria) + roda 3D

- Nova peça na seção Trabalhos, **antes** da roda: uma "mesa" de 6–8 fotos de tamanhos e proporções diferentes, posicionadas de forma irregular, cada uma com **velocidade de parallax diferente** ao rolar (deslocamento vertical de 4–14%, só `transform`). Algumas entram com `clip-path` revelando.
- Ao tocar/clicar numa foto, abre o lightbox já existente (ou simples, se ainda não existir: tela cheia, fechar com Esc e botão, foco preso).
- **Roda 3D** continua, agora maior: desktop com fotos de ~28vw; celular com rolagem horizontal ligada à vertical (seção `sticky` de ~250–300svh onde rolar desloca as fotos para o lado, a central em destaque e as vizinhas menores, contador `03 / 10` em mono). Se pesar, fallback para `scroll-snap` com fotos a 85% da largura.
- Limite de peso: no celular, no máximo 8 fotos animadas ao mesmo tempo; resto estático. Nenhum jank perceptível em Android intermediário (se não der, reduzir a quantidade e relatar).

## E. Manifesto com palavras que trocam (efeito de rolagem)

Nova seção curta de tela escura (agora entra aqui, mesmo sendo da Fase 2 na spec; o resto da Fase 2 continua pendente).

- Palco `sticky` de ~300svh. Conforme se rola, uma **frase central muda palavra por palavra** (ex.: "Luz. / Presença. / Histórias que ficam."), cada palavra entrando e saindo por máscara (`translateY` + `opacity`), ligada ao **progresso da rolagem**, não a timers.
- Em seguida, uma **citação** aparece sozinha em tela escura (fade + leve subida), e depois 2–3 fotos entram em tamanhos diferentes (reuso do mecanismo de parallax de D).
- Texto de exemplo `[CONFIRMAR]` no config (ex.: "Luz / Presença / Histórias que ficam" e uma citação curta e original; **nenhuma citação de terceiros**). Em `modoDemo: false`, se o texto não estiver confirmado, a seção some.
- Reduced motion e fallback: frase completa estática e citação visível, sem pin.
- Acessibilidade: a frase completa existe no DOM como texto único (leitor de tela lê tudo de uma vez); as palavras animadas são decorativas (`aria-hidden`) ou o conjunto tem `aria-label`.

## F. Nome gigante no hero e no rodapé

- **Rodapé:** o nome "Ivy" gigante (≈ largura da tela, display ou sans pesada, a escolher por tema), cortado levemente pela borda inferior, com a faixa de links por cima. Fecha a página como o hero abriu.
- **Hero (adaptação, não cópia):** opção de config `hero.nomeGigante: boolean` (padrão `false` na prévia escura, `true` testável no modo apresentação). Quando `true`, o nome aparece enorme na **parte baixa** do hero, cortado pela borda inferior, **sem cobrir o rosto**; o `<h1>` continua sendo texto real. Se não ficar bom nas fotos de exemplo, deixar `false` e registrar.

## G. FAQ com tom humano

- Mantém `<details>/<summary>`. Frase de abertura com personalidade, configurável (ex.: "Imaginei que você ia perguntar. Então respondi antes."). Perguntas e respostas no config, tudo `[CONFIRMAR]` e em tom direto, sem prometer prazos ou preços inventados. `FAQPage` em JSON-LD só com respostas confirmadas.

## H. Movimento geral e fotos de exemplo

**Movimento**
- Títulos de seção entram por máscara, linha a linha (cascata de 60 ms), uma vez.
- Fotos entram com `clip-path: inset(8%) → inset(0)` + `scale(1.1 → 1)`, ~900 ms.
- Revisar a **intro em cortinas** em um celular real: profundidade, linha de luz, tempos; o nome aparece grande no fim e o "Pular" funciona. Se travar em Android intermediário, simplificar e relatar.
- Cursor "visor" e hovers só com `(pointer: fine)`.

**Fotos de exemplo**
- Subir o banco para **pelo menos 18–20 fotos** (licença livre, créditos e licença em `fotos.meta.json`): retrato, casal, família, gestante, casamento, evento, produto/marca, mais algumas em **preto e branco** para variar. Paleta coerente.
- `foco` de cada foto ajustado para não cortar rosto no celular.
- Pares da cortina "conversando" entre si.

---

## Critérios de aceite

- Nenhuma sobreposição de elementos fixos em 360, 390, 768, 1440.
- Nenhum `[ ]` na primeira dobra; nenhuma foto repetida em seções vizinhas.
- Blocos C, D, E, F e G funcionando (ou fallback justificado em `DECISOES.md`).
- Rolagem total no celular ≥ ~10 telas.
- Lighthouse celular: Desempenho ≥ 85, Acessibilidade ≥ 95, LCP < 2,5 s, CLS ≈ 0.
- Reduced motion: tudo funciona sem movimento.
- Teclado e leitor de tela funcionam; `vitest-axe` verde; todos os testes verdes (incluindo "nada hardcoded").
- `build` ok, prévia publicada, **prints em 390 e 1440 nos dois temas**.

## Relatório final (e parar)

Por bloco: o que mudou, o que ficou de fora e por quê (com referência a `DECISOES.md`); números do Lighthouse; lista de `[CONFIRMAR]` novos; qualquer decisão que o Pedro precise tomar. **Não comece a Fase 2.**
