# PROMPT — Ajuste do celular (Ivy)

Leia o `SPEC.md` (versão 2, atualizada hoje) e o `DECISOES.md` antes de mexer.

**Problema:** no computador o site está bom. No celular (390 px), o manifesto virou várias telas inteiras de fundo marrom liso: uma tela só com "Momentos.", depois uma tela **totalmente vazia**, e a citação "Foto boa merece sair da galeria do celular." sozinha no meio de muito espaço. O usuário rola, rola e não vê nada. Isso é bug, não estilo.

**Tarefa (só isto, não comece a Fase 2):**

1. **Manifesto no celular** — implementar a versão compacta de §10.5: sem pin, ~100svh, as três palavras empilhadas revelando em sequência, citação menor logo abaixo e 2 fotos pequenas sobrepostas na mesma área. No desktop, reduzir o palco para no máximo 200svh e sobrepor a entrada/saída das palavras (~30%) para não haver frame vazio.
2. **Auditoria de "tela vazia" em todo o site no celular** — aplicar as regras novas de §11 ("Celular é outra composição"): nenhuma seção com pin acima de 150svh no celular (exceto sessões empilhadas com conteúdo em cada cartão), pelo menos ~40% da tela com conteúdo em qualquer ponto da rolagem, espaçamento entre seções `clamp(3.5rem, 10vh, 5rem)` no celular. Conferir em especial: manifesto, roda 3D com rolagem horizontal, prateleira de presentes, colagem com parallax, CTA final.
3. A troca de layout é por **largura de tela e tipo de ponteiro** (`max-width: 767px`, `pointer: coarse`), **não** por detecção de aparelho/user-agent.
4. Nada muda no desktop além do item 1.

**Verificação:**
- Rodar o site em 360 e 390 px (Playwright, viewport de celular) e tirar uma sequência de prints a cada ~1 tela de rolagem, do topo ao rodapé. Anexar no relatório. Nenhum print pode ser só fundo.
- Lighthouse celular, testes e `vitest-axe` verdes. Reduced motion continua funcionando.
- Registrar em `DECISOES.md` e no vault (pasta Estúdio Ivy). Commit, build, deploy da prévia e relatório curto. Parar.
