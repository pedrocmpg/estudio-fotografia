# Relatório de estado — Estúdio Ivy (28/10/2026)

Fontes: `docs/SPEC.md` (o SPEC está em `docs/`, não na raiz), `DECISOES.md`, `src/config/site.config.ts`, git log, prints e Lighthouse da Fase 2. Nada foi alterado no código. Rodei os testes e abri a prévia só para conferir.

## 1. Prévia publicada

- **Link:** https://ivystudio-b3x.pages.dev (respondeu 200 hoje)
- **Onde está:** Cloudflare Pages, projeto `ivystudio`, na conta Cloudflare do Pedro (é onde o `wrangler` fez o deploy; não consigo ver o nome da conta daqui).
- **Está atualizada?** Sim: o arquivo principal no ar (`index-DMgoDf23.js`) é o mesmo do `dist` local. O DECISOES.md ainda diz "deploy pendente"; isso está desatualizado.
- Sem domínio próprio. O site está com `noindex` (o Google não lista) e com selo "Prévia".

## 2. Seções de §9

| # | Seção | Existe? | 390 e 1440, dois temas? | Observação |
|---|---|---|---|---|
| 1 | Header | sim | sim | Nome de marca corta com "…" no celular ("Ivy · Foto e Pres…"). Menu em tela cheia no celular. |
| 2 | Intro (hero) | sim | sim | Cortinas, contador, "Pular". LCP é o ponto fraco (item 9). |
| 3 | Faixa | sim | sim | Textos a confirmar. |
| 4 | Sessões | sim | sim | 8 categorias, 2 fotos cada. |
| 5 | Manifesto | sim | sim | Texto de exemplo; **some** no site final se não for confirmado. |
| 6 | Trabalhos | sim | sim | Colagem, roda 3D, folha de contato, lightbox. |
| 7 | Presentes | sim | sim | 7 itens de exemplo, todos com `[VALOR]`. |
| 8 | Antes/depois | sim, **desligado** | testado com par de teste | Lista vazia de propósito (§9). |
| 9 | Como funciona | sim | sim | Último passo ("Entrega") tem `[CONFIRMAR]`. |
| 10 | Pacotes | sim | sim | 6 pacotes, todos sem conteúdo real. |
| 11 | Depoimentos | sim | sim | 3 exemplos com selo EXEMPLO; somem no site final. |
| 12 | Pedido | sim | sim | Gera a mensagem do WhatsApp. Número ainda é `5500000000000`. |
| 13 | FAQ | sim | sim | 8 respostas provisórias. |
| 14 | CTA final | sim | sim | Foto em tela cheia + cortina reversa. |
| 15 | Contato + rodapé | sim | sim | Sem endereços/redes confirmados; cartões aparecem só com `[CONFIRMAR]`. Nome gigante do rodapé foi retirado a pedido. |
| — | WhatsApp flutuante, cursor visor | sim | sim | Cursor só com mouse. |

"Funciona nos dois temas" = teste automático (`vitest-axe` em cada seção, nos dois temas) + prints em 360/390/768/1440. Não testei em celular de verdade.

## 3. O que falta (Fases 2 e 3 de §18) — horas minhas, estimadas

A Fase 2 está feita (277 testes verdes). Sobra:

| Item | Horas |
|---|---|
| Pré-renderizar a primeira cortina para o LCP cair abaixo de 2,5 s | 4–6 |
| Polimento da Fase 3: tempos, easing, auditoria de teclado/leitor de tela | 4–6 |
| "Voo" da miniatura no lightbox e label que sobe no foco (opcionais) | 3–4 |
| Teste em Android real e correção do que aparecer | 2–4 |
| Trocar fotos de exemplo pelas do estúdio (tratar, `foco`, `alt`, crédito) — **depende das fotos** | 4–8 |
| Colocar textos/preços/endereços reais no config — **depende do estúdio** | 2–4 |
| Logo (se houver) no header/favicon/OG; regerar imagem de prévia | 2–3 |
| `modoDemo: false`, `indexar: true`, domínio, deploy final, prévia no WhatsApp | 2–3 |
| Atualizar README/DECISOES e entregar | 1–2 |
| **Total** | **~24–40 h** (mais da metade espera o conteúdo do estúdio) |

## 4. [CONFIRMAR], [VALOR] e textos de exemplo no config

- **Marca:** `meta.titulo` e `descricao`; `urlCanonica` (trocar pelo endereço final); `negocio.nome`, `assinatura`, `nomeCurto`; `hero.nome`, `tagline`, `itens`, `subtitulo`; cor de destaque `#8A5A3B`; `manifesto` (palavras e citação — texto de exemplo, `confirmado: false`).
- **Estúdio:** cidade/UF (vistas no perfil público); `atendimento`; locais `estudio` e `loja` só com rótulo (sem endereço, mapa, horários, WhatsApp); `redes` (2 Instagram, comentadas); `email`; `horarios`; título de `sessoes`, 8 categorias e frases; `faixa`; `processo` (títulos, 4 passos, prazo da entrega).
- **Loja:** título de `presentes`, "Revelação na hora" (diferencial da loja física), categorias, 7 produtos com frases e mensagens de WhatsApp (produtos escolhidos pelo que havia de foto livre, não pelo que vendem).
- **Preços:** `valor: null` em 7 presentes e 6 pacotes (mostra `[VALOR]`, e "Consulte"/"Sob consulta" no final); `inclui` e `entrega` de todos os pacotes; `pacotes.nota`; nomes dos pacotes.
- **FAQ:** `titulo`, `abertura` e **8 respostas** (4 loja, 4 sessões), todas `confirmada: false`.
- **Fotos:** todas ilustrativas (item 7); 3 depoimentos de exemplo ("Cliente de exemplo"); `linkAvaliacoesGoogle` ausente.
- **Contato:** WhatsApp `5500000000000` (provisório, afeta formulário, flutuante, cards de presente e JSON-LD); `contato.titulo`/`texto`; texto do `ctaFinal`; título do `pedido`.

## 5. O que muda SÓ pelo config (= "ajuste" no contrato)

Todos os textos e preços; ordem e liga/desliga de cada seção; categorias de sessão e itens/categorias de presente; pacotes (nomes, inclui, valor, grupo); FAQ (perguntas, respostas, confirmada); depoimentos; pares de antes/depois; qual foto vai em cada lugar; 1, 2 ou 3 cortinas e tempos; tema (claro/escuro), cor de destaque, granulado; destaque do hero (cidade/frase/rotativo) e nome gigante no hero; endereços, mapas, horários, redes, e-mail, WhatsApp por local; título/descrição/domínio/`indexar`/`modoDemo`; analytics; troca das fotos (pelo pipeline + `fotos.meta.json`).

## 6. O que exigiria código novo (= "criação")

Seção nova ou layout novo de uma seção existente; página por produto ou catálogo; página por tipo de sessão (`/newborn`); envio da foto pelo cliente; galeria privada de entrega; agenda ou reserva com sinal PIX; vale-presente; blog; vídeo; novo efeito de movimento; mapa incorporado; segundo idioma; trocar a fonte ou a paleta além das duas existentes; "voo" do lightbox e label que sobe (polimento já descartado).

## 7. Fotos

- **40 no banco, todas ilustrativas**: 33 do Unsplash (licença livre) e 7 de produto do Wikimedia Commons (CC0/CC BY/domínio público). Algumas são versões P&B geradas de outra foto. Nada vem do Instagram deles. Crédito de cada uma em `src/data/fotos.meta.json`. O banco não tem smash, tema gaúcho nem fundo liso colorido.
- **Quando entrarem as do estúdio:** o pipeline (`npm run fotos`) lê `fotos-originais/` e gera sozinho AVIF/WebP/JPEG em 480/960/1600/2400 px, sem ampliar, sem metadados, com miniatura borrada. Mandem **JPEG ou PNG originais, lado maior ≥ 2400 px** (sem WhatsApp/compressão), com autorização de uso e das pessoas retratadas.
- **Quantas por seção:** 2 por categoria de sessão (≈ 16); cortinas: 2 pares no desktop **e** 2 pares verticais para o celular (assunto no centro); fundo final 1; colagem 7; roda 10; folha 8; manifesto 3; CTA 1; produtos 1 por item (7+). **≈ 40–45 fotos** para ficar igual à prévia, sem repetir em seções vizinhas (o teste barra repetição). Dá para entrar com menos, mas aí repete ou some seção.

## 8. Bugs, pendências e o teste que falha

- **`apresentacao.test.tsx`: não falha mais.** Rodei hoje: 29 arquivos, **277 testes, todos verdes**. O problema era tempo esgotado com a suíte inteira; foi resolvido na Fase 2 (limites de tempo maiores). O DECISOES.md traz as duas versões (a antiga "199 de 200" e a nova).
- **Pendências do DECISOES.md:** (1) texto de deploy desatualizado (já foi feito); (2) LCP acima da meta, falta pré-renderizar; (3) sem aparelho Android real; (4) polimentos opcionais do lightbox e dos campos.
- **Bugs conhecidos:** nome da marca corta com "…" no header do celular; em 768 px usa a composição de desktop; selos de preço `[VALOR]` aparecem na prévia (esperado); config real tem número de WhatsApp falso, então os botões de pedido hoje não chegam em ninguém.
- Sem aparelho real, o jank de rolagem só foi medido em emulação.

## 9. Lighthouse e rolagem (celular, simulado, `docs/prints/lighthouse-fase2.html`)

| Desempenho | Acessibilidade | Boas práticas | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|
| 94 | 100 | 100 | 69 (por causa do `noindex`, esperado) | **3,0 s** (meta < 2,5) | 0,001 | 60 ms |

- JS inicial 92 KB gzip (meta ≤ 150).
- **Rolagem:** 25,4 telas em 390 px (22 a 26 conforme a largura). Meta era ≥ ~10.
- Este Lighthouse é da Fase 2 (antes dos últimos commits de rodapé e cabeçalhos de segurança); não rodei de novo.

## 10. Primeira dobra da prévia

Conferi o print de 390 px (`docs/prints/fase2/luz-natural/390/01.jpg`) e o texto do hero no config. **Não há `[ ]` nem texto quebrado**: aparecem "Ivy", "Fotografia e presentes personalizados em Bento Gonçalves", subtítulo, dois botões, "Revelação na hora" e o selo "Prévia · fotos ilustrativas". Único detalhe: o nome no header corta ("Ivy · Foto e Pres…"). Não abri a prévia no ar em navegador, só confirmei que ela responde e é a mesma versão do `dist`.
