export type TemaId = 'camara-escura' | 'luz-natural';

export type SecaoId =
  | 'intro'
  | 'faixa'
  | 'sessoes'
  | 'manifesto'
  | 'trabalhos'
  | 'antesDepois'
  | 'processo'
  | 'pacotes'
  | 'depoimentos'
  | 'pedido'
  | 'faq'
  | 'ctaFinal'
  | 'contato';

/** Referência a uma foto pelo id do manifest (src/data/fotos.manifest.json). */
export type FotoId = string;

export interface Cta {
  rotulo: string; // "Pedir minha sessão"
  acao: 'pedido' | 'whatsapp' | 'ancora'; // pedido = rola até o formulário
  alvo?: string; // id da âncora, quando acao = 'ancora'
}

/** Um par de painéis da abertura em cortinas. */
export interface CamadaIntro {
  esquerda: FotoId;
  direita: FotoId;
  esquerdaMobile?: FotoId; // fotos verticais para celular
  direitaMobile?: FotoId;
}

export interface SiteConfig {
  /** true = prévia: selo "fotos ilustrativas", [VALOR]/[CONFIRMAR] visíveis, modo apresentação disponível. */
  modoDemo: boolean;

  meta: {
    titulo: string; // ≤ 60 caracteres
    descricao: string; // ≤ 155 caracteres
    urlCanonica: string;
    indexar: boolean; // false = <meta name="robots" content="noindex">
    corNavegador?: string; // theme-color; padrão = --bg do tema ativo
  };

  negocio: {
    nome: string;
    nomeCurto: string;
    cidade: string;
    uf: string;
    endereco?: string;
    mapsUrl?: string; // link "Abrir no mapa" (sem embed pesado)
    whatsapp: string; // só dígitos com DDI, ex. 5500900000000
    instagram?: string; // sem @
    email?: string;
    horarios?: { dias: string; horas: string }[];
    atendimento: ('estudio' | 'externo' | 'domicilio')[];
    creditoSite?: { texto: string; url?: string };
  };

  tema: {
    ativo: TemaId;
    permitirTroca: boolean; // alternância no rodapé (em produção: false)
    coresDestaque?: Partial<Record<TemaId, string>>; // sobrescreve --accent
    presetsDestaque?: string[]; // usados no modo apresentação
    granulado: boolean; // grão de filme no tema escuro
  };

  /** Ordem e presença das seções. Seção fora da lista não renderiza. */
  secoes: SecaoId[];

  hero: {
    intro: {
      ativo: boolean;
      camadas: CamadaIntro[]; // 2 camadas = 4 fotos (padrão); aceita 1 a 3
      /** Camadas extras, usadas só no modo apresentação (ex.: a 3ª cortina). */
      camadasOpcionais?: CamadaIntro[];
      etapasPorCamada: number; // 3
      duracaoEtapaMs: number; // 450
      pausaEtapaMs: number; // 120
      pausaCamadaMs: number; // 300
      umaVezPorSessao: boolean; // true
      mostrarPular: boolean; // true
      mostrarContador: boolean; // "01 / 02" em mono
      linhaDeLuz: boolean; // fresta de luz na emenda
    };
    fundoFinal: { tipo: 'foto' | 'cor'; foto?: FotoId; scrim: number }; // scrim 0–1
    nome: string;
    destaque: {
      modo: 'cidade' | 'tagline' | 'rotativo';
      texto?: string; // cidade: "Fotografia em {cidade}"; tagline: frase (se não houver `tagline`)
      /** Frase curta usada no modo tagline (e na troca de modo do painel de apresentação). */
      tagline?: string;
      itens?: string[]; // rotativo: ["Ensaios", "Casamentos", "Newborn", "Marcas"]
    };
    subtitulo?: string;
    ctas: { primario: Cta; secundario?: Cta };
  };

  faixa: { itens: string[]; segundosPorVolta: number };

  sessoes: {
    titulo: string;
    itens: { id: string; nome: string; frase: string; fotos: [FotoId, FotoId?] }[];
  };

  manifesto: { texto: string; palavrasDestaque: string[] };

  trabalhos: {
    titulo: string;
    roda: { fotos: FotoId[]; segundosPorVolta: number }; // 8–10 fotos
    folha: {
      categorias: string[]; // abas de filtro
      fotos: { id: FotoId; categoria: string; marcada?: boolean }[];
    };
    mostrarDadosTecnicos: boolean; // "f/1.8 · 1/250 · ISO 200"
  };

  antesDepois: { antes: FotoId; depois: FotoId; legenda: string }[]; // vazio = seção some

  processo: { titulo: string; passos: { titulo: string; texto: string }[] }; // 4 passos

  pacotes: {
    mostrar: boolean;
    titulo: string;
    nota?: string;
    itens: {
      id: string;
      nome: string;
      paraQuem: string;
      inclui: string[];
      entrega?: string;
      valor: number | null; // null → "[VALOR]" na demo / "Sob consulta" em produção
      prefixoValor?: string; // "a partir de"
      selo?: string; // "Mais pedido" — só se for verdade
      sessaoId?: string; // pré-seleciona o tipo no formulário
    }[];
  };

  depoimentos: {
    texto: string;
    autor: string;
    sessao?: string;
    foto?: FotoId;
    exemplo: boolean;
  }[];
  linkAvaliacoesGoogle?: string;

  pedido: {
    titulo: string;
    texto?: string;
    modeloMensagem: string;
  };

  faq: { pergunta: string; resposta: string }[];

  ctaFinal: { titulo: string; texto?: string; foto: FotoId; cortinaReversa: boolean; cta: Cta };

  analytics: { provedor: 'nenhum' | 'cloudflare'; token?: string };
}
