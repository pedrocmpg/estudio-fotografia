import type { SiteConfig } from './types.ts';

/**
 * Dados obviamente fictícios. TODOS os testes usam este arquivo (SPEC §3).
 * Reaproveita só os ids das fotos de exemplo; nenhum texto vem do config real.
 */
export const siteConfigAlt: SiteConfig = {
  modoDemo: true,

  meta: {
    titulo: 'Estúdio Exemplo · Fotografia teste',
    descricao: 'Texto de descrição fictício usado apenas nos testes automatizados.',
    urlCanonica: 'https://exemplo.test',
    indexar: false,
  },

  negocio: {
    nome: 'Estúdio Exemplo',
    nomeCurto: 'Exemplo',
    cidade: 'Cidade Exemplo',
    uf: 'EX',
    endereco: 'Rua Fictícia, 100',
    mapsUrl: 'https://maps.exemplo.test/rua-ficticia',
    whatsapp: '5500900000000',
    instagram: 'estudioexemplo',
    redes: [
      { rotulo: 'Estúdio de teste', usuario: 'estudioexemplo' },
      { rotulo: 'Loja de teste', usuario: 'lojaexemplo' },
    ],
    assinatura: 'Loja de Mentira',
    locais: [
      {
        id: 'estudio',
        tipo: 'estudio',
        rotulo: 'Estúdio fictício',
        endereco: 'Rua Fictícia, 100',
        mapsUrl: 'https://maps.exemplo.test/rua-ficticia',
      },
      {
        id: 'loja',
        tipo: 'loja',
        rotulo: 'Loja fictícia',
        endereco: 'Avenida Inventada, 200',
        mapsUrl: 'https://maps.exemplo.test/avenida-inventada',
      },
    ],
    email: 'contato@exemplo.com',
    horarios: [{ dias: 'Seg a sex', horas: '09h às 18h' }],
    atendimento: ['estudio', 'externo', 'domicilio'],
  },

  tema: {
    ativo: 'camara-escura',
    permitirTroca: false,
    presetsDestaque: ['#E0A458', '#7FA38A'],
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
    nome: 'Exemplo',
    nomeGigante: false,
    destaque: {
      modo: 'cidade',
      texto: 'Fotografia em {cidade}',
      tagline: 'Frase curta fictícia de teste.',
      itens: ['Alfa', 'Beta', 'Gama'],
    },
    subtitulo: 'Subtítulo fictício do estúdio de teste.',
    ctas: {
      primario: { rotulo: 'Quero uma sessão de teste', acao: 'pedido' },
      secundario: { rotulo: 'Ver a galeria fictícia', acao: 'ancora', alvo: 'trabalhos' },
    },
  },

  faixa: {
    itens: ['Alfa', 'Beta', 'Gama', 'Delta'],
    segundosPorVolta: 40,
  },

  sessoes: {
    titulo: 'O que o Exemplo faz de mentira',
    itens: [
      {
        id: 'alfa',
        nome: 'Sessão Alfa',
        frase: 'Frase fictícia alfa.',
        fotos: ['ensaio-1', 'ensaio-2'],
      },
      {
        id: 'beta',
        nome: 'Sessão Beta',
        frase: 'Frase fictícia beta.',
        fotos: ['gestante-1', 'gestante-2'],
      },
      { id: 'gama', nome: 'Sessão Gama', frase: 'Frase fictícia gama.', fotos: ['familia-1'] },
    ],
  },

  presentes: {
    mostrar: true,
    titulo: 'Presentes de teste',
    destaqueRevelacao: { titulo: 'Revelação fictícia', texto: 'Texto fictício da revelação.' },
    categorias: ['Categoria X', 'Categoria Y'],
    itens: [
      {
        id: 'item-um',
        nome: 'Produto Um',
        categoria: 'Categoria X',
        frase: 'Frase fictícia do produto um.',
        foto: 'prod-caneca-branca',
        valor: null,
        mensagemWhatsapp: 'Mensagem fictícia do produto um & mais.',
      },
      {
        id: 'item-dois',
        nome: 'Produto Dois',
        categoria: 'Categoria Y',
        frase: 'Frase fictícia do produto dois.',
        foto: 'prod-album',
        valor: 80,
        mensagemWhatsapp: 'Mensagem fictícia do produto dois.',
      },
      {
        id: 'item-tres',
        nome: 'Produto Três',
        categoria: 'Categoria X',
        frase: 'Frase fictícia do produto três.',
        foto: 'prod-quadro',
        valor: null,
        mensagemWhatsapp: 'Mensagem fictícia do produto três.',
      },
    ],
  },

  manifesto: {
    confirmado: false,
    palavras: ['Alfa.', 'Beta.', 'Gama com frase maior.'],
    citacao: 'Citação inventada só para os testes automatizados.',
    fotos: ['marca-1', 'marca-2', 'retrato-3'],
  },

  trabalhos: {
    titulo: 'Galeria de teste',
    colagem: [
      'cortina-1d',
      'cortina-2e',
      'cortina-3e',
      'fundo-final',
      'pb-cortina-2d',
      'casamento-1',
    ],
    roda: {
      fotos: [
        'cortina-1e',
        'cortina-2d',
        'cortina-3d',
        'pb-cortina-2e',
        'familia-2',
        'formatura-1',
        'retrato-1',
        'retrato-2',
      ],
      segundosPorVolta: 60,
    },
    folha: {
      categorias: ['Cat A', 'Cat B'],
      fotos: [
        { id: 'ensaio-1', categoria: 'Cat A', marcada: true },
        { id: 'gestante-1', categoria: 'Cat B' },
      ],
    },
    mostrarDadosTecnicos: false,
  },

  antesDepois: [],

  processo: {
    titulo: 'Passo a passo de teste',
    passos: [
      { titulo: 'Primeiro', texto: 'Texto do primeiro passo.' },
      { titulo: 'Segundo', texto: 'Texto do segundo passo.' },
      { titulo: 'Terceiro', texto: 'Texto do terceiro passo.' },
      { titulo: 'Quarto', texto: 'Texto do quarto passo.' },
    ],
  },

  pacotes: {
    mostrar: true,
    titulo: 'Pacotes de teste',
    nota: 'Nota fictícia sobre valores.',
    grupos: [
      {
        rotulo: 'Sessões',
        itens: [
          {
            id: 'p1',
            nome: 'Pacote Um',
            paraQuem: 'Quem for testar.',
            inclui: ['Item um', 'Item dois'],
            entrega: 'Em 10 dias',
            valor: null,
            alvoPedido: 'alfa',
          },
          {
            id: 'p2',
            nome: 'Pacote Dois',
            paraQuem: 'Quem for testar mais.',
            inclui: ['Item um', '[CONFIRMAR] item pendente'],
            valor: 1250,
            prefixoValor: 'a partir de',
            selo: 'Selo de teste',
            alvoPedido: 'beta',
          },
        ],
      },
      {
        rotulo: 'Presentes',
        itens: [
          {
            id: 'p3',
            nome: 'Pacote Três',
            paraQuem: 'Quem quiser presentear.',
            inclui: ['Item três'],
            valor: 80,
            alvoPedido: 'item-dois',
          },
          {
            id: 'p4',
            nome: 'Pacote Quatro',
            paraQuem: 'Quem quiser presentear mais.',
            inclui: ['Item quatro'],
            valor: null,
          },
        ],
      },
    ],
  },

  depoimentos: [
    {
      texto: 'Depoimento fictício de teste.',
      autor: 'Pessoa Teste',
      sessao: 'Sessão Alfa',
      exemplo: true,
    },
  ],

  pedido: {
    titulo: 'Pedido de teste',
    texto: 'Texto fictício do formulário.',
    modeloMensagem:
      'Olá, {nomeCurto}! Me chamo {nome}.\nTenho interesse em: {tipo}.\nData que eu pensei: {data}.\nLocal: {local}.\n{mensagem}',
  },

  faq: {
    titulo: 'Dúvidas de teste',
    abertura: 'Abertura fictícia do FAQ de teste.',
    itens: [
      {
        grupo: 'Sessões',
        pergunta: 'Pergunta confirmada?',
        resposta: 'Resposta fictícia confirmada.',
        confirmada: true,
      },
      {
        grupo: 'Loja',
        pergunta: 'Pergunta de exemplo?',
        resposta: 'Resposta fictícia de exemplo.',
        confirmada: false,
      },
    ],
  },

  contato: {
    titulo: 'Contato de teste',
    texto: 'Texto fictício do contato.',
  },

  ctaFinal: {
    titulo: 'Título final fictício',
    foto: 'cta-final',
    cortinaReversa: true,
    cta: { rotulo: 'Botão final fictício', acao: 'pedido' },
  },

  analytics: { provedor: 'nenhum' },
};
