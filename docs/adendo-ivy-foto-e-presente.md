# ADENDO ao prompt de elevação — o que o Instagram do Ivy mostrou

> Colar no fim do `prompt-elevar-fase1-v2.md` como **bloco I**, e na seção "Contexto". Onde este adendo contradiz os blocos A–H, **vale o adendo**.
> Fonte: prints do Instagram público do negócio, trazidos pelo Pedro. Todos os fatos abaixo são **[CONFIRMAR] com o Vitor/estúdio** antes de ir ao ar. Nada daqui vai para teste, fixture ou exemplo fora de `src/config/site.config.ts` (o nome e os dados reais ficam só lá; testes usam `site.config.alt.ts` fictício).

## I.0 O que o negócio realmente é

Não é só um estúdio de fotografia. São **dois lados do mesmo negócio**:

1. **Ivy Fotografia** (estúdio): newborn, gestante, família, eventos, ensaios, formaturas, aniversários (smash/1 aninho), temas (ex.: gaúcho/Semana Farroupilha), dia dos pais. Fotos de estúdio com fundos coloridos e brancos, cor e preto e branco. Na bio: "a mais de 20 anos registrando momentos" `[CONFIRMAR]`.
2. **Ivy Foto e Presente** (loja física no shopping, em Bento Gonçalves): **revelação na hora**, fotos, **canecas** (mágica, branca, interior colorido, alça de coração, mini), **álbuns**, **porta-retratos**, cubo de acrílico, quebra-cabeça, chaveiro, garrafa squeeze, almofadas, camisetas, crachá/cordão, scrapbook, **polaroids**, plastificação. Tudo personalizado com foto do cliente.

O site precisa vender os **dois lados** e ligar um ao outro: "tire a foto → leve em um presente".

Dados públicos já vistos (confirmar): cidade Bento Gonçalves/RS; loja no Shopping Bento; WhatsApp público no perfil (entra só no config); duas contas de Instagram (uma do estúdio, uma da loja).

## I.1 Posicionamento e textos (substitui o hero "só fotografia")

- Nome de marca sugerido no config: **"Ivy · Foto e Presente"** `[CONFIRMAR grafia e se o estúdio e a loja usam o mesmo nome]`.
- Hero (opção padrão, configurável): **Ivy** + "Fotografia e presentes personalizados em Bento Gonçalves" + CTAs **"Pedir sessão"** (primário) e **"Ver presentes"** (secundário).
- Faixa de sessões (marquee) alterna fotografia e produtos: *Newborn · Gestante · Família · Formaturas · Canecas · Álbuns · Polaroids · Quadros…*
- Diferencial a destacar `[CONFIRMAR]`: **loja física no shopping com revelação na hora**. Manifesto de exemplo: "Foto boa merece sair da galeria do celular. A gente revela, emoldura e transforma em presente."

## I.2 Tema: mudar o padrão

O mundo visual deles (marca em marrom e creme, fotos quentes, família, bebê, presentes) é **acolhedor**, não "câmara escura".

- Padrão da prévia passa a ser **`luz-natural`** (creme + terracota/marrom). O `camara-escura` continua disponível para o Pedro/Vitor mostrarem as duas opções.
- Em `luz-natural`, ajustar a cor de destaque para dialogar com o marrom da marca (testar `#8A5A3B`/terracota) mantendo contraste ≥ 4.5:1.
- Botões de CTA seguem a regra do bloco A (cor de destaque, legível).

## I.3 Nova seção: Presentes (loja)

Seção própria, depois de Sessões (ou logo antes do CTA final), `SecaoId` novo: `presentes`.

- **Grade de produtos** (6–10 itens): foto/ilustração, nome, uma frase, botão **"Pedir no WhatsApp"** que abre a conversa com a mensagem pronta ("Oi! Quero uma caneca personalizada…").
- Categorias exibidas como abas/chips: Canecas · Álbuns e porta-retratos · Quadros · Para vestir (camisetas, almofadas) · Lembranças (chaveiros, cubo, quebra-cabeça, polaroids).
- Destaque horizontal estilo "prateleira": rolagem lateral com cards grandes, usando a mesma mecânica de rolagem do bloco D (nada novo pesado).
- Faixa **"Revelação na hora"** com ícone e uma linha curta; aparece também no hero/CTA.
- **Preços:** sem valores inventados. Campo `valor: null` → na prévia `[VALOR]`, em produção "Consulte" (igual aos pacotes).
- Imagens: **fotos de banco temporárias de produtos** (canecas, álbuns, polaroids) na prévia, com selo "fotos ilustrativas". **Não copiar nem reusar imagens do Instagram deles** no código ou no repositório; só entram fotos próprias do estúdio/loja quando eles autorizarem.

Tipos no config (`types.ts`):

```ts
presentes: {
  mostrar: boolean;
  titulo: string;
  destaqueRevelacao?: { titulo: string; texto: string };   // "Revelação na hora"
  categorias: string[];
  itens: {
    id: string;
    nome: string;
    categoria: string;
    frase: string;
    foto: FotoId;
    valor: number | null;
    mensagemWhatsapp: string;
  }[];
};
```

## I.4 Sessões: ajustar as categorias de exemplo (`[CONFIRMAR]`)

Newborn · Gestante e casal · Família · Aniversário/smash (1 aninho) · Formatura · Ensaio pessoal · **Temáticos** (ex.: gaúcho) · Eventos. Com foto própria cada.

## I.5 Contato e localização

- Dois pontos: **Estúdio** e **Loja no Shopping** (podem ser o mesmo endereço, confirmar). Cada um com endereço e botão "Abrir no mapa" (sem iframe), horários e WhatsApp.
- **Duas contas de Instagram** no rodapé (estúdio e loja), cada uma com seu rótulo. Campo novo `negocio.redes: { rotulo: string; usuario: string }[]`.
- JSON-LD: `LocalBusiness` (estúdio) + `Store` (loja) só com campos confirmados.

## I.6 Fotos de exemplo

- O banco de exemplo precisa **combinar com o negócio**: cenas de estúdio com fundo liso/colorido, família, newborn, gestante, criança, formatura, casal, e **fotos de produtos** (canecas, álbuns, polaroids). Evitar o clima "noite/cinematográfico" exagerado.
- Mais fotos em preto e branco e em fundo branco (é o estilo deles).
- Nenhuma foto de cliente real deles no repositório sem autorização escrita do estúdio (e do cliente retratado).

## I.7 Ajuste nos blocos anteriores

- **Bloco C (sessões empilhadas):** cada cartão com cor de fundo sutil do tema, para variar o ritmo; fotos de crianças e bebês nunca com texto por cima do rosto.
- **Bloco E (manifesto):** palavras sugeridas `[CONFIRMAR]`: "Momentos. / Memórias. / Presentes que contam a sua história."
- **Bloco G (FAQ):** incluir perguntas da loja ("Quanto tempo leva para ficar pronto?", "Dá para levar a foto do celular?", "Vocês imprimem na hora?", "Quais formas de pagamento?") com respostas `[CONFIRMAR]`.
- **Bloco F:** o nome gigante do rodapé usa o nome de marca definido em I.1.

## I.8 Critério de aceite extra

- A seção Presentes funciona nos dois temas, em 390 e 1440; cada item abre o WhatsApp com a mensagem certa; nada de preço inventado; nenhuma imagem copiada do Instagram deles no repositório.
