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
