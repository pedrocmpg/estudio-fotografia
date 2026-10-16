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
