# Log de Mudanças — Estúdio Ivy

(Espelho para colar no cofre Obsidian, pasta **Estúdio Ivy**. Detalhes em DECISOES.md.)

## 2026-10-16 — Elevação da Fase 1 (blocos A a I)

- **Fotos:** banco de 40 fotos (27 de exemplo + 7 de produto do Wikimedia Commons + 6 em preto e branco geradas pelo pipeline).
- **A — acabamento:** selo único (hero + rodapé), botões em `--accent` (52 px), secundário legível, token `--espaco-secao`, validação automática de foto repetida em seções vizinhas.
- **B — escala:** hero 100svh com nome gigante, vinheta só nas bordas, indicador de rolagem; faixa maior e mais lenta; CTA final em tela cheia.
- **C — sessões:** cartões empilhados (sticky) no celular; nomes gigantes sobre foto larga no desktop.
- **D — trabalhos:** colagem com parallax, lightbox, roda 3D maior; no celular, pista que liga rolagem vertical à horizontal.
- **E — manifesto:** palavras que trocam pelo progresso da rolagem, citação, fotos soltas.
- **F — nome gigante:** rodapé com nome da marca na largura da tela; opção `hero.nomeGigante`.
- **G — FAQ:** tom humano, `FAQPage` só com respostas confirmadas.
- **H — movimento:** títulos por máscara, fotos revelando, hover só com mouse.
- **I — adendo:** tema padrão `luz-natural` (marrom `#8A5A3B`), seção Presentes com WhatsApp por item, dois Instagram e dois pontos no rodapé, JSON-LD estúdio + loja.
- **Medidas:** Lighthouse celular 93 / 100 / 100 / 69 (SEO baixo por causa do `noindex` da prévia); LCP 3,0 s (simulado) e CLS 0; 193 testes verdes; ~25 telas de rolagem no celular.

## 2026-10-16 — Ajuste do celular

- Manifesto compacto no celular (~100svh, sem pin, palavras empilhadas, citação + 2 fotos) e palco de 200svh com sobreposição de ~30% no desktop.
- Roda 3D do celular: 130svh (limite 150svh). Espaço entre seções menor no celular.
- Troca de layout só por largura/ponteiro (`MEDIA_CELULAR`); teste impede user-agent.
- `npm run prints:celular`: 20 prints por largura (360/390), todos com conteúdo. Lighthouse 94 / 100 / 100 / 69; LCP 2,9 s.

## 2026-10-16 — Fase 2 (blocos J a O)

- **Antes de construir:** celular conferido em 360 e 390 (um print por tela, todos com conteúdo). Pista da roda compactada para 118svh (foto 3:4, palco de 68svh). Teste do painel de apresentação estabilizado.
- **J — pedido:** formulário que monta a mensagem e abre o WhatsApp (estúdio para sessão, loja para presente); tipo pré-selecionado pelos botões "Pedir essa sessão"; obturador de 300 ms; erro de nome em texto.
- **K — como funciona e pacotes:** linha vertical que enche de luz com a rolagem; pacotes em dois grupos (sessões e presentes), abas no celular e colunas no desktop, `[VALOR]` na prévia e "Sob consulta" no site final.
- **L — depoimentos e antes/depois:** uma citação por vez, sem autoplay, com selo EXEMPLO na prévia; comparador por `input range` (desligado).
- **M — folha de contato:** negativo com numeração `01A ▸`, abas por categoria, lápis vermelho nas fotos marcadas; lightbox com View Transitions (fallback em fade).
- **N — FAQ e contato:** FAQ em dois blocos (sessões e loja); contato com um cartão por ponto (endereço, mapa sem iframe, horários, WhatsApp) e as duas redes.
- **O — menu e cursor:** menu do celular em tela cheia (foco preso, cascata de 40 ms); cursor visor só com mouse, animando só `transform` e `opacity`.
- **Medidas:** Lighthouse celular 94 / 100 / 100 / 69 (SEO por causa do `noindex`); LCP 3,0 s, CLS 0,001, TBT 60 ms; JS inicial 92 KB gzip; 25 telas de rolagem no celular; 277 testes verdes.
- **Prints:** `npm run prints:fase2` (360, 390, 768 e 1440, nos dois temas) em `docs/prints/fase2/`.
- **Pendente:** deploy da prévia (o `wrangler` não está autenticado: `npx wrangler login` e depois o deploy do README); tudo `[CONFIRMAR]` segue com o Vitor; LCP < 2,5 s e polimento ficam para a Fase 3.

## 2026-10-28 — Refino final antes do cliente

- Header no celular mostra o nome curto; WhatsApp de demonstração documentado (aguarda número); auditoria completa em 360/390/768/1440 nos dois temas; Lighthouse 96/100/100, LCP 2,8 s. Deploy pendente de login no wrangler. Detalhes em DECISOES.md ("Refino final").
