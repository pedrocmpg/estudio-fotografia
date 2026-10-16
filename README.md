# Landing page do estúdio (fotografia)

Site de uma página que leva o visitante a **pedir uma sessão pelo WhatsApp**. A especificação completa
está em [SPEC.md](SPEC.md). Este README é o manual de manutenção, em português simples.

> **Estado atual: Fase 1 elevada (prévia de venda).** Já existem: abertura em cortinas, faixa de sessões,
> sessões em cartões empilhados (celular) e nomes gigantes (desktop), **presentes da loja**, manifesto com
> palavras que trocam ao rolar, colagem de fotos com parallax, lightbox, roda 3D (no celular, uma pista que
> liga a rolagem vertical à horizontal), FAQ, CTA final em tela cheia, rodapé com nome gigante, botão do
> WhatsApp, os dois temas, modo apresentação, SEO e imagem de prévia do link. Faltam (Fase 2): folha de
> contato, como funciona, pacotes, depoimentos, formulário, contato completo, cursor visor e menu do
> celular. O que mudou e por quê está em [DECISOES.md](DECISOES.md).

## Rodar no seu computador

Precisa de Node 20 ou mais novo.

```bash
npm install
npm run dev          # abre o site para editar (http://localhost:5173)
npm test             # roda os testes
npm run build        # gera a pasta dist/ para publicar
npm run preview      # vê o resultado do build
```

## Onde mudar as coisas

**Tudo do estúdio fica em um arquivo só: [src/config/site.config.ts](src/config/site.config.ts).**
Nenhum outro arquivo guarda texto, telefone, nome ou preço do estúdio (um teste confere isso).

| Quero mudar…                      | Onde                                                                                       |
| --------------------------------- | ------------------------------------------------------------------------------------------ |
| Nome, cidade, WhatsApp, Instagram | `negocio`                                                                                  |
| Título e descrição do link        | `meta` (título até 60 letras, descrição até 155)                                           |
| Tema (escuro ou claro)            | `tema.ativo` (`camara-escura` ou `luz-natural`)                                            |
| Cor de destaque                   | `tema.coresDestaque` (o build avisa se o contraste ficar fraco)                            |
| Textos do topo da página          | `hero`                                                                                     |
| Fotos da abertura                 | `hero.intro.camadas` (um par esquerda/direita por cortina)                                 |
| Tipos de sessão                   | `sessoes.itens` (2 fotos cada) e `faixa.itens`                                             |
| Loja (presentes)                  | `presentes` (itens, categorias, `mensagemWhatsapp`; `valor: null` = `[VALOR]`/"Consulte")  |
| Manifesto (palavras e citação)    | `manifesto` (`confirmado: true` para aparecer no site final)                               |
| Colagem de fotos e roda           | `trabalhos.colagem` (6 a 8) e `trabalhos.roda.fotos` (8 a 10)                              |
| Perguntas e respostas             | `faq` (só respostas com `confirmada: true` vão ao site final e ao Google)                  |
| Instagram do estúdio e da loja    | `negocio.redes`; endereços em `negocio.locais`                                             |
| Nome gigante no topo              | `hero.nomeGigante` (teste no painel de apresentação)                                       |
| Fotos da roda                     | `trabalhos.roda.fotos` (de 8 a 10)                                                         |
| Preços                            | `pacotes.itens[].valor` (`null` mostra `[VALOR]` na prévia e "Sob consulta" no site final) |
| Ordem das seções                  | `secoes` (seção fora da lista não aparece)                                                 |

Para ver o que falta confirmar com o estúdio: `npm run confirmar`.

### Links úteis para mostrar a prévia

- `?tema=camara-escura` e `?tema=luz-natural`: escolhem o tema.
- `?intro=1`: roda a abertura de novo (ela só roda uma vez por visita).
- `?apresentar=1`: abre o painel do modo apresentação (só existe com `modoDemo: true`).

## Fotos

1. Coloque as fotos originais em `fotos-originais/`. Hoje a pasta está no repositório porque tem só as fotos
   de exemplo do Unsplash (assim o build funciona em qualquer máquina). **Quando entrarem fotos do estúdio,
   volte a ignorar a pasta** (`fotos-originais/` no `.gitignore`) e guarde-as fora do repositório.
2. Descreva cada uma em [src/data/fotos.meta.json](src/data/fotos.meta.json): `id`, `arquivo`, `alt` (texto
   que descreve a foto, **obrigatório**), `categoria`, `foco` (onde está o rosto, de 0 a 1) e, se vier de
   banco de imagens, `credito` e `licenca`.
3. Rode `npm run fotos`. Ele gera as versões leves (AVIF, WebP e JPEG em vários tamanhos), remove dados
   de GPS/câmera e só reprocessa o que mudou. Use `npm run fotos:forcar` para refazer tudo.
4. Use o `id` da foto no `site.config.ts`.

Sem `arquivo` (ou com o arquivo ausente), a foto vira um retângulo em degradê com o rótulo
`[FOTO — categoria]`, e o site continua funcionando. `tsx scripts/fotos.ts --estrito` falha se sobrar
alguma assim (use antes de publicar a versão final). Arquivos HEIC precisam ser convertidos para JPG antes.

**Preto e branco:** coloque `"tratamento": "pb"` no meta de uma foto (com outro `id`) e o pipeline gera a
versão em preto e branco do mesmo arquivo. **Nenhuma foto pode repetir em seções vizinhas** (o build avisa).

**Autorização de imagem:** fotos de clientes do estúdio só entram com autorização do estúdio, e a
autorização das pessoas fotografadas é responsabilidade dele. As fotos atuais são exemplos do Unsplash
(licença livre); o crédito de cada uma está em `fotos.meta.json`.

## Imagem de prévia do link (WhatsApp / Instagram)

`npm run og` gera `public/og.jpg` (1200×630) a partir da rota `/og`. Rode de novo sempre que mudar o tema
ou a foto principal (`hero.fundoFinal.foto`). **Antes de mandar o link para alguém, cole no WhatsApp e
confira a prévia.**

## Publicar

Use Cloudflare Pages ou Netlify (os planos grátis permitem uso comercial). **Não use Vercel Hobby** para
site de cliente. O domínio deve ficar registrado no nome do estúdio (Registro.br).

Cloudflare Pages, por linha de comando (o nome do projeto é `ivystudio`; no PowerShell não use `<` `>`):

```bash
npx wrangler login
npm run build
npx wrangler pages deploy dist --project-name ivystudio --branch production
```

Depois do primeiro deploy, copie o endereço final para `meta.urlCanonica` (ou defina a variável de
ambiente `SITE_URL` no build) e rode `npm run og` + `npm run build` de novo, para o link da imagem de
prévia ficar certo. O arquivo `public/_headers` já cuida do cache.

### Para tirar da fase de prévia (Fase 3)

1. `modoDemo: false` (some o selo, o modo apresentação e os `[VALOR]`).
2. `meta.indexar: true` (libera o Google e gera os dados estruturados).
3. Trocar as fotos de exemplo pelas do estúdio (`npm run fotos`, depois `--estrito`).
4. Preencher tudo o que `npm run confirmar` listar.

## Como o projeto é organizado

```
src/config/        types.ts (formato do config), site.config.ts (dados do estúdio),
                   site.config.alt.ts (dados fictícios usados nos testes)
src/sections/      uma pasta por seção
src/apresentacao/  modo apresentação (painel carregado só quando pedido)
src/motion/        abertura em cortinas, hooks e tokens de movimento
src/styles/        reset, tokens, temas (temas.css é a fonte das cores) e fontes
scripts/           fotos.ts (pipeline), og.ts (imagem de prévia), confirmar.ts
build/             plugin do Vite: validação, SEO, preload, script do <head>
tests/             testes (todos usam o config fictício)
```

Regras que valem para qualquer mudança: acessibilidade > desempenho no celular > efeito visual; animar só
`transform`, `opacity` e `clip-path`; toda animação tem alternativa para quem pediu menos movimento.

## Notas técnicas da Fase 1

- Pacote `lenis` (rolagem suave no desktop) ainda não foi instalado: não há seção longa o bastante para
  precisar dele nesta fase.
- As fontes de contingência (`src/styles/fontes-fallback.css`) usam métricas aproximadas; dá para refinar
  com a ferramenta capsize na Fase 3.
- O HTML inicial só tem o `<h1>`; o resto nasce no navegador. O LCP medido no Lighthouse simulado
  (celular, 4G lento, CPU 4× mais lenta) ficou em ~3,0 s; para chegar abaixo de 2,5 s o caminho é
  pré-renderizar a primeira cortina no build.
- Efeitos presos à rolagem (sessões empilhadas, manifesto, pista da roda) usam uma variável CSS `--p`
  escrita uma vez por quadro (`src/motion/useVariavelDeRolagem.ts`); o parallax da colagem é CSS puro com
  `animation-timeline: view()` (sem suporte, a foto fica no lugar).
