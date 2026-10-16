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
