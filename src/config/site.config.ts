import type { SiteConfig } from './types.ts';

/**
 * ÚNICO arquivo com os dados do estúdio (SPEC §0, princípio 5).
 * Tudo o que está marcado com [CONFIRMAR] ainda não foi confirmado com eles.
 * Rode `npm run confirmar` para listar o que falta preencher.
 */
export const siteConfig: SiteConfig = {
  modoDemo: true,

  meta: {
    titulo: 'Estúdio Ivy · Fotografia', // [CONFIRMAR grafia]
    descricao: 'Ensaios, famílias, casamentos e marcas. Escolha sua sessão e peça pelo WhatsApp.', // [CONFIRMAR]
    urlCanonica: 'https://ivystudio-b3x.pages.dev', // [CONFIRMAR] trocar pelo endereço final do deploy
    indexar: false,
  },

  negocio: {
    nome: 'Estúdio Ivy', // [CONFIRMAR grafia] e se existe logo
    nomeCurto: 'Ivy',
    cidade: '[CIDADE]', // [CONFIRMAR]
    uf: '[UF]', // [CONFIRMAR]
    whatsapp: '5500000000000', // [CONFIRMAR] só dígitos, com DDI e DDD
    atendimento: ['estudio', 'externo'], // [CONFIRMAR]
    // endereco, mapsUrl, instagram, email, horarios: [CONFIRMAR] — só aparecem quando preenchidos
  },

  tema: {
    ativo: 'camara-escura',
    permitirTroca: false,
    presetsDestaque: ['#E0A458', '#C8553D', '#7FA38A', '#D9C7A3', '#8FA9C9'],
    granulado: true,
  },

  secoes: [
    'intro',
    'faixa',
    'sessoes',
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
    fundoFinal: { tipo: 'foto', foto: 'fundo-final', scrim: 0.45 },
    nome: 'Ivy',
    destaque: {
      modo: 'cidade',
      texto: 'Fotografia em {cidade}',
      tagline: 'Fotografia com a sua cara.', // [CONFIRMAR] frase deles
      itens: ['Ensaios', 'Casamentos', 'Newborn', 'Marcas'], // [CONFIRMAR categorias]
    },
    subtitulo: 'Retratos, famílias, casamentos e marcas.', // [CONFIRMAR]
    ctas: {
      primario: { rotulo: 'Pedir minha sessão', acao: 'pedido' },
      secundario: { rotulo: 'Ver trabalhos', acao: 'ancora', alvo: 'trabalhos' },
    },
  },

  faixa: {
    // [CONFIRMAR] tipos de sessão que realmente fazem
    itens: [
      'Ensaios',
      'Gestantes',
      'Família',
      'Newborn',
      'Casamentos',
      '15 anos',
      'Formaturas',
      'Marcas',
    ],
    segundosPorVolta: 40,
  },

  sessoes: {
    titulo: 'O que a Ivy fotografa', // [CONFIRMAR]
    // [CONFIRMAR] categorias — o estúdio "faz de tudo"; confirmar o que entra
    itens: [
      {
        id: 'ensaios',
        nome: 'Ensaios pessoais',
        frase: 'Retratos com a sua cara, no seu ritmo.',
        fotos: ['ensaio-1', 'ensaio-2'],
      },
      {
        id: 'gestante',
        nome: 'Gestante e casal',
        frase: 'A espera, registrada com calma.',
        fotos: ['gestante-1', 'gestante-2'],
      },
      {
        id: 'familia',
        nome: 'Família, newborn e infantil',
        frase: 'Os primeiros dias e os dias de todo dia.',
        fotos: ['familia-1', 'familia-2'],
      },
      {
        id: 'casamentos',
        nome: 'Casamentos e eventos',
        frase: 'Do preparativo à última dança.',
        fotos: ['casamento-1', 'casamento-2'],
      },
      {
        id: 'quinze-formatura',
        nome: '15 anos e formaturas',
        frase: 'Uma data que merece ser lembrada.',
        fotos: ['formatura-1', 'formatura-2'],
      },
      {
        id: 'marcas',
        nome: 'Marcas, produtos e corporativo',
        frase: 'Imagem profissional para o seu negócio.',
        fotos: ['marca-1', 'marca-2'],
      },
    ],
  },

  manifesto: {
    // [CONFIRMAR — escrever com o estúdio]
    texto:
      'A gente não pede pra você posar. A gente espera o momento em que você esquece que tem uma câmera ali.',
    palavrasDestaque: ['esquece', 'câmera'],
  },

  trabalhos: {
    titulo: 'Trabalhos',
    roda: {
      fotos: [
        'ensaio-1',
        'gestante-1',
        'familia-1',
        'casamento-1',
        'formatura-1',
        'marca-1',
        'retrato-1',
        'retrato-2',
        'retrato-3',
      ],
      segundosPorVolta: 60,
    },
    folha: {
      categorias: ['Ensaios', 'Família', 'Eventos', 'Marcas'],
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
        { id: 'marca-1', categoria: 'Marcas' },
        { id: 'marca-2', categoria: 'Marcas' },
        { id: 'retrato-3', categoria: 'Marcas' },
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
        sessaoId: 'ensaios',
      },
      {
        id: 'completo',
        nome: 'Completo',
        paraQuem: 'Para quem quer mais tempo e mais fotos.',
        inclui: ['[CONFIRMAR]'],
        entrega: '[CONFIRMAR]',
        valor: null,
        sessaoId: 'ensaios',
      },
      {
        id: 'evento',
        nome: 'Evento',
        paraQuem: 'Para casamentos, 15 anos e formaturas.',
        inclui: ['[CONFIRMAR]'],
        entrega: '[CONFIRMAR]',
        valor: null,
        sessaoId: 'casamentos',
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

  // [CONFIRMAR] todas as respostas
  faq: [
    { pergunta: 'Em quanto tempo recebo as fotos?', resposta: '[CONFIRMAR]' },
    { pergunta: 'Quantas fotos vêm editadas?', resposta: '[CONFIRMAR]' },
    { pergunta: 'Vocês fazem sessão externa / fora da cidade?', resposta: '[CONFIRMAR]' },
    { pergunta: 'Precisa pagar sinal para reservar?', resposta: '[CONFIRMAR]' },
    { pergunta: 'Como escolho roupa e local?', resposta: '[CONFIRMAR]' },
    { pergunta: 'E se chover no dia?', resposta: '[CONFIRMAR]' },
  ],

  ctaFinal: {
    titulo: 'Vamos marcar a sua sessão?', // [CONFIRMAR]
    foto: 'cta-final',
    cortinaReversa: true,
    cta: { rotulo: 'Pedir minha sessão', acao: 'pedido' },
  },

  analytics: { provedor: 'nenhum' },
};
