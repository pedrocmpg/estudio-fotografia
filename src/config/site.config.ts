import type { SiteConfig } from './types.ts';

/**
 * ÚNICO arquivo com os dados do estúdio (SPEC §0, princípio 5).
 * Tudo o que está marcado com [CONFIRMAR] ainda não foi confirmado com eles.
 * Rode `npm run confirmar` para listar o que falta preencher.
 */
export const siteConfig: SiteConfig = {
  modoDemo: true,

  meta: {
    titulo: 'Ivy · Foto e Presente — Bento Gonçalves', // [CONFIRMAR grafia]
    descricao:
      'Ensaios, famílias, newborn e presentes personalizados com a sua foto. Peça sua sessão pelo WhatsApp.', // [CONFIRMAR]
    urlCanonica: 'https://ivystudio-b3x.pages.dev', // [CONFIRMAR] trocar pelo endereço final do deploy
    indexar: false,
  },

  negocio: {
    nome: 'Ivy · Foto e Presente', // [CONFIRMAR grafia] e se estúdio e loja usam o mesmo nome
    nomeCurto: 'Ivy',
    assinatura: 'Foto e Presente', // [CONFIRMAR]
    cidade: 'Bento Gonçalves', // [CONFIRMAR] visto no perfil público do Instagram
    uf: 'RS', // [CONFIRMAR]
    whatsapp: '5500000000000', // [CONFIRMAR] só dígitos, com DDI e DDD (o número público do perfil entra aqui)
    atendimento: ['estudio', 'externo'], // [CONFIRMAR]
    // [CONFIRMAR] as duas contas de Instagram (estúdio e loja); só aparecem quando preenchidas:
    // redes: [{ rotulo: 'Estúdio', usuario: '...' }, { rotulo: 'Loja', usuario: '...' }],
    // [CONFIRMAR] estúdio e loja (podem ser o mesmo endereço): endereço, mapa, horários, WhatsApp:
    // locais: [{ id: 'estudio', tipo: 'estudio', rotulo: 'Estúdio' }, { id: 'loja', tipo: 'loja', rotulo: 'Loja no shopping' }],
    // email e horarios: [CONFIRMAR] — só aparecem quando preenchidos
  },

  tema: {
    ativo: 'luz-natural', // o mundo visual deles é acolhedor (adendo I.2); camara-escura segue disponível
    permitirTroca: false,
    // marrom da marca, contraste testado: ≥ 5:1 com texto branco e sobre o creme
    coresDestaque: { 'luz-natural': '#8A5A3B' }, // [CONFIRMAR] com o estúdio
    presetsDestaque: ['#E0A458', '#C8553D', '#7FA38A', '#D9C7A3', '#8FA9C9'],
    granulado: true,
  },

  secoes: [
    'intro',
    'faixa',
    'sessoes',
    'presentes',
    'manifesto',
    'trabalhos',
    'antesDepois',
    'processo',
    'pacotes',
    'depoimentos',
    'pedido',
    'faq',
    'ctaFinal',
    'contato',
  ],

  hero: {
    intro: {
      ativo: true,
      camadas: [
        {
          esquerda: 'cortina-1e',
          direita: 'cortina-1d',
          esquerdaMobile: 'cortina-1e-m',
          direitaMobile: 'cortina-1d-m',
        },
        {
          esquerda: 'cortina-2e',
          direita: 'cortina-2d',
          esquerdaMobile: 'cortina-2e-m',
          direitaMobile: 'cortina-2d-m',
        },
      ],
      camadasOpcionais: [{ esquerda: 'cortina-3e', direita: 'cortina-3d' }],
      etapasPorCamada: 3,
      duracaoEtapaMs: 450,
      pausaEtapaMs: 120,
      pausaCamadaMs: 300,
      umaVezPorSessao: true,
      mostrarPular: true,
      mostrarContador: true,
      linhaDeLuz: true,
    },
    fundoFinal: { tipo: 'foto', foto: 'fundo-final', scrim: 0.3 },
    nome: 'Ivy',
    nomeGigante: false, // true testável no modo apresentação
    destaque: {
      modo: 'cidade',
      texto: 'Fotografia e presentes personalizados em {cidade}',
      tagline: 'Fotografia com a sua cara.', // [CONFIRMAR] frase deles
      itens: ['Newborn', 'Família', 'Formaturas', 'Presentes'], // [CONFIRMAR categorias]
    },
    subtitulo: 'Da sessão ao presente, com a sua foto.', // [CONFIRMAR]
    ctas: {
      primario: { rotulo: 'Pedir sessão', acao: 'pedido' },
      secundario: { rotulo: 'Ver presentes', acao: 'ancora', alvo: 'presentes' },
    },
  },

  faixa: {
    // [CONFIRMAR] fotografia e produtos, alternados
    itens: [
      'Newborn',
      'Gestante',
      'Família',
      'Formaturas',
      'Canecas',
      'Álbuns',
      'Polaroids',
      'Quadros',
    ],
    segundosPorVolta: 56,
  },

  sessoes: {
    titulo: 'O que a Ivy fotografa', // [CONFIRMAR]
    // [CONFIRMAR] categorias. Fotos de exemplo: o banco não tem smash nem tema gaúcho.
    itens: [
      {
        id: 'newborn',
        nome: 'Newborn',
        frase: 'Os primeiros dias, com todo o cuidado.',
        fotos: ['familia-2', 'pb-familia-1'],
      },
      {
        id: 'gestante',
        nome: 'Gestante e casal',
        frase: 'A espera, registrada com calma.',
        fotos: ['gestante-2', 'gestante-1'],
      },
      {
        id: 'familia',
        nome: 'Família',
        frase: 'Todo mundo junto, do jeito que é.',
        fotos: ['familia-1', 'pb-gestante-1'],
      },
      {
        id: 'aniversario',
        nome: 'Aniversário e smash',
        frase: 'Um aninho que merece registro (e bagunça).',
        fotos: ['pb-familia-2', 'retrato-1'],
      },
      {
        id: 'formatura',
        nome: 'Formatura',
        frase: 'Uma conquista que vale ficar na parede.',
        fotos: ['formatura-1', 'formatura-2'],
      },
      {
        id: 'ensaio',
        nome: 'Ensaio pessoal',
        frase: 'Retratos com a sua cara, no seu ritmo.',
        fotos: ['ensaio-1', 'pb-retrato-2'],
      },
      {
        id: 'tematicos',
        nome: 'Temáticos',
        frase: 'Cenário e figurino para uma data especial.',
        fotos: ['ensaio-2', 'retrato-2'],
      },
      {
        id: 'eventos',
        nome: 'Eventos',
        frase: 'Do preparativo à última dança.',
        fotos: ['casamento-1', 'casamento-2'],
      },
    ],
  },

  presentes: {
    mostrar: true,
    titulo: 'Presentes com a sua foto', // [CONFIRMAR]
    destaqueRevelacao: {
      titulo: 'Revelação na hora', // [CONFIRMAR] diferencial da loja física no shopping
      texto: 'Traga a foto do celular e leve para casa na hora.',
    },
    categorias: ['Canecas', 'Álbuns e porta-retratos', 'Quadros', 'Para vestir', 'Lembranças'],
    // [CONFIRMAR] itens, textos e valores (null = "[VALOR]" na prévia, "Consulte" no site final)
    itens: [
      {
        id: 'caneca-branca',
        nome: 'Caneca branca',
        categoria: 'Canecas',
        frase: 'Clássica, com a sua foto ou frase estampada.',
        foto: 'prod-caneca-branca',
        valor: null,
        mensagemWhatsapp: 'Oi! Quero uma caneca personalizada. Pode me passar as opções?',
      },
      {
        id: 'caneca-personalizada',
        nome: 'Caneca personalizada',
        categoria: 'Canecas',
        frase: 'Com nomes, desenhos e a foto que você escolher.',
        foto: 'prod-caneca-personalizada',
        valor: null,
        mensagemWhatsapp: 'Oi! Quero uma caneca com nomes e foto. Como funciona?',
      },
      {
        id: 'album',
        nome: 'Álbum de fotos',
        categoria: 'Álbuns e porta-retratos',
        frase: 'As melhores fotos reunidas para folhear.',
        foto: 'prod-album',
        valor: null,
        mensagemWhatsapp: 'Oi! Quero montar um álbum de fotos. Pode me ajudar?',
      },
      {
        id: 'porta-retrato',
        nome: 'Porta-retratos',
        categoria: 'Álbuns e porta-retratos',
        frase: 'A moldura certa para a foto que merece ficar à vista.',
        foto: 'prod-porta-retrato',
        valor: null,
        mensagemWhatsapp: 'Oi! Quero um porta-retratos com a minha foto. Quais modelos vocês têm?',
      },
      {
        id: 'quadro',
        nome: 'Quadro',
        categoria: 'Quadros',
        frase: 'Sua foto impressa e emoldurada, pronta para a parede.',
        foto: 'prod-quadro',
        valor: null,
        mensagemWhatsapp: 'Oi! Quero transformar uma foto em quadro. Como funciona?',
      },
      {
        id: 'almofada',
        nome: 'Almofada',
        categoria: 'Para vestir',
        frase: 'Para abraçar a lembrança no sofá de casa.',
        foto: 'prod-almofada',
        valor: null,
        mensagemWhatsapp:
          'Oi! Quero uma almofada personalizada com foto. Pode me passar as opções?',
      },
      {
        id: 'polaroids',
        nome: 'Polaroids',
        categoria: 'Lembranças',
        frase: 'Pequenas, para guardar ou presentear.',
        foto: 'prod-polaroids',
        valor: null,
        mensagemWhatsapp: 'Oi! Quero revelar fotos em formato polaroid. Como funciona?',
      },
    ],
  },

  manifesto: {
    // [CONFIRMAR — escrever com o estúdio]. Texto de exemplo, original.
    confirmado: false,
    palavras: ['Momentos.', 'Memórias.', 'Presentes que contam a sua história.'],
    citacao: 'Foto boa merece sair da galeria do celular.',
    fotos: ['marca-1', 'marca-2', 'retrato-3'],
  },

  trabalhos: {
    titulo: 'Trabalhos',
    colagem: [
      'cortina-1d',
      'cortina-2e',
      'cortina-3e',
      'fundo-final',
      'pb-cortina-2d',
      'casamento-1',
      'formatura-1',
    ],
    roda: {
      fotos: [
        'cortina-1e',
        'cortina-2d',
        'cortina-3d',
        'pb-cortina-2e',
        'familia-1',
        'gestante-1',
        'ensaio-2',
        'retrato-1',
        'casamento-2',
        'formatura-2',
      ],
      segundosPorVolta: 70,
    },
    folha: {
      categorias: ['Ensaios', 'Família', 'Eventos'],
      fotos: [
        { id: 'ensaio-1', categoria: 'Ensaios', marcada: true },
        { id: 'ensaio-2', categoria: 'Ensaios' },
        { id: 'retrato-1', categoria: 'Ensaios' },
        { id: 'retrato-2', categoria: 'Ensaios', marcada: true },
        { id: 'gestante-1', categoria: 'Família' },
        { id: 'gestante-2', categoria: 'Família' },
        { id: 'familia-1', categoria: 'Família', marcada: true },
        { id: 'familia-2', categoria: 'Família' },
        { id: 'casamento-1', categoria: 'Eventos' },
        { id: 'casamento-2', categoria: 'Eventos', marcada: true },
        { id: 'formatura-1', categoria: 'Eventos' },
        { id: 'formatura-2', categoria: 'Eventos' },
      ],
    },
    mostrarDadosTecnicos: false,
  },

  antesDepois: [],

  processo: {
    titulo: 'Como funciona', // [CONFIRMAR]
    passos: [
      { titulo: 'Conversa', texto: 'Pelo WhatsApp, a gente entende o que você quer.' },
      { titulo: 'Planejamento', texto: 'Local, horário e roupa, combinados com calma.' },
      { titulo: 'Sessão', texto: 'Dia de fotografar, sem pressa e sem pose forçada.' },
      { titulo: 'Entrega', texto: 'Prazo e formato: [CONFIRMAR].' },
    ],
  },

  pacotes: {
    mostrar: true,
    titulo: 'Pacotes', // [CONFIRMAR]
    nota: 'Valores podem variar conforme data e local.', // [CONFIRMAR]
    // [CONFIRMAR] nomes, o que inclui, prazos e valores (null = "[VALOR]" na prévia)
    itens: [
      {
        id: 'essencial',
        nome: 'Essencial',
        paraQuem: 'Para um ensaio simples e direto.',
        inclui: ['[CONFIRMAR]'],
        entrega: '[CONFIRMAR]',
        valor: null,
        sessaoId: 'ensaio',
      },
      {
        id: 'completo',
        nome: 'Completo',
        paraQuem: 'Para quem quer mais tempo e mais fotos.',
        inclui: ['[CONFIRMAR]'],
        entrega: '[CONFIRMAR]',
        valor: null,
        sessaoId: 'ensaio',
      },
      {
        id: 'evento',
        nome: 'Evento',
        paraQuem: 'Para formaturas, aniversários e outras datas.',
        inclui: ['[CONFIRMAR]'],
        entrega: '[CONFIRMAR]',
        valor: null,
        sessaoId: 'eventos',
      },
    ],
  },

  depoimentos: [],

  pedido: {
    titulo: 'Pedir sessão',
    texto: 'Conte um pouco do que você pensou. A conversa continua no WhatsApp.',
    modeloMensagem:
      'Olá, {nomeCurto}! Me chamo {nome}.\nTenho interesse em: {tipo}.\nData que eu pensei: {data}.\nLocal: {local}.\n{mensagem}',
  },

  // [CONFIRMAR] todas as respostas (nada aqui é promessa de prazo ou preço)
  faq: {
    titulo: 'Dúvidas', // [CONFIRMAR]
    abertura: 'Imaginei que você ia perguntar. Então respondi antes.', // [CONFIRMAR]
    itens: [
      {
        pergunta: 'Quanto tempo leva para ficar pronto?',
        resposta: '[CONFIRMAR] Depende do produto. Fala com a gente e combinamos o prazo certinho.',
        confirmada: false,
      },
      {
        pergunta: 'Dá para levar a foto do celular?',
        resposta: '[CONFIRMAR] A ideia é essa: você traz a foto e a gente cuida do resto.',
        confirmada: false,
      },
      {
        pergunta: 'Vocês imprimem na hora?',
        resposta: '[CONFIRMAR] Na loja, a revelação é na hora. Confirmamos como funciona.',
        confirmada: false,
      },
      {
        pergunta: 'Quais formas de pagamento?',
        resposta: '[CONFIRMAR] A gente te conta na conversa.',
        confirmada: false,
      },
      {
        pergunta: 'Em quanto tempo recebo as fotos da sessão?',
        resposta: '[CONFIRMAR] O prazo varia conforme o tipo de sessão. Combinamos antes.',
        confirmada: false,
      },
      {
        pergunta: 'Vocês fazem sessão fora do estúdio?',
        resposta: '[CONFIRMAR] Conta para a gente o que você imaginou e vemos juntos.',
        confirmada: false,
      },
      {
        pergunta: 'Precisa pagar sinal para reservar?',
        resposta: '[CONFIRMAR] Explicamos como funciona a reserva na conversa.',
        confirmada: false,
      },
      {
        pergunta: 'E se chover no dia?',
        resposta: '[CONFIRMAR] A gente remarca com você. Fica tranquilo.',
        confirmada: false,
      },
    ],
  },

  ctaFinal: {
    titulo: 'Vamos marcar a sua sessão?', // [CONFIRMAR]
    foto: 'cta-final',
    texto: 'Tire a foto e leve em um presente. Revelação na hora na loja.', // [CONFIRMAR]
    cortinaReversa: true,
    posicaoTexto: 'topo', // o céu da foto é a área calma
    cta: { rotulo: 'Pedir sessão', acao: 'pedido' },
  },

  analytics: { provedor: 'nenhum' },
};
