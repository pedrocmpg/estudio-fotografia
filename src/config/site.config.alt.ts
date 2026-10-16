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
    nome: 'Exemplo',
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

  manifesto: {
    texto: 'Texto de manifesto inventado só para os testes automatizados.',
    palavrasDestaque: ['inventado'],
  },

  trabalhos: {
    titulo: 'Galeria de teste',
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
    itens: [
      {
        id: 'p1',
        nome: 'Pacote Um',
        paraQuem: 'Quem for testar.',
        inclui: ['Item um', 'Item dois'],
        entrega: 'Em 10 dias',
        valor: null,
        sessaoId: 'alfa',
      },
      {
        id: 'p2',
        nome: 'Pacote Dois',
        paraQuem: 'Quem for testar mais.',
        inclui: ['Item um'],
        valor: 1250,
        prefixoValor: 'a partir de',
        selo: 'Selo de teste',
        sessaoId: 'beta',
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

  faq: [{ pergunta: 'Pergunta fictícia?', resposta: 'Resposta fictícia.' }],

  ctaFinal: {
    titulo: 'Título final fictício',
    foto: 'cta-final',
    cortinaReversa: true,
    cta: { rotulo: 'Botão final fictício', acao: 'pedido' },
  },

  analytics: { provedor: 'nenhum' },
};
