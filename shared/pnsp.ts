// PNSP Shared Constants and Types

export const PROFILE_TYPES = {
  artista_solo: "Artista Solo",
  grupo_banda: "Grupo / Banda / Dupla",
  comunidade_roda: "Comunidade / Roda / Projeto",
  produtor: "Produtor / Produtora",
  estudio: "Estúdio",
  professor: "Professor / Oficineiro",
  loja: "Loja de Instrumentos",
  luthier: "Luthier / Artesão",
  contratante: "Contratante",
  parceiro: "Parceiro / Patrocinador",
  venue: "Venue / Casa de Show",
} as const;

export const OFFERING_CATEGORIES = {
  show: "Show / Apresentação",
  aula: "Aula / Curso",
  producao: "Produção Musical",
  instrumento_novo: "Instrumento Novo",
  instrumento_usado: "Instrumento Usado",
  artesanato: "Artesanato",
  acessorio: "Acessório",
  audiovisual: "Audiovisual",
  luthieria: "Luthieria",
  estudio: "Aluguel de Estúdio",
  servico: "Serviço",
  outro: "Outro",
} as const;

export const OPPORTUNITY_CATEGORIES = {
  vaga_grupo: "Vaga em Grupo",
  show: "Show / Evento",
  evento: "Evento Cultural",
  projeto: "Projeto Musical",
  aula: "Busca por Aula",
  producao: "Produção",
  estudio: "Busca por Estúdio",
  servico: "Serviço",
  outro: "Outro",
} as const;

export const ACADEMY_CATEGORIES = {
  historia: "História do Samba",
  tecnica: "Técnica Musical",
  instrumentos: "Instrumentos",
  composicao: "Composição",
  producao: "Produção",
  carreira: "Carreira",
  negocios: "Negócios",
  cultura: "Cultura",
} as const;

export const BRAZIL_STATES = [
  { value: "AC", label: "Acre" },
  { value: "AL", label: "Alagoas" },
  { value: "AP", label: "Amapá" },
  { value: "AM", label: "Amazonas" },
  { value: "BA", label: "Bahia" },
  { value: "CE", label: "Ceará" },
  { value: "DF", label: "Distrito Federal" },
  { value: "ES", label: "Espírito Santo" },
  { value: "GO", label: "Goiás" },
  { value: "MA", label: "Maranhão" },
  { value: "MT", label: "Mato Grosso" },
  { value: "MS", label: "Mato Grosso do Sul" },
  { value: "MG", label: "Minas Gerais" },
  { value: "PA", label: "Pará" },
  { value: "PB", label: "Paraíba" },
  { value: "PR", label: "Paraná" },
  { value: "PE", label: "Pernambuco" },
  { value: "PI", label: "Piauí" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "RN", label: "Rio Grande do Norte" },
  { value: "RS", label: "Rio Grande do Sul" },
  { value: "RO", label: "Rondônia" },
  { value: "RR", label: "Roraima" },
  { value: "SC", label: "Santa Catarina" },
  { value: "SP", label: "São Paulo" },
  { value: "SE", label: "Sergipe" },
  { value: "TO", label: "Tocantins" },
] as const;

export const INSTRUMENTS = [
  "Cavaquinho", "Pandeiro", "Violão 7 cordas", "Violão 6 cordas",
  "Surdo", "Tamborim", "Repique", "Cuíca", "Reco-reco", "Chocalho",
  "Banjo", "Tantã", "Baixo elétrico", "Guitarra", "Teclado", "Piano",
  "Flauta", "Clarinete", "Trompete", "Trombone", "Saxofone", "Bateria",
  "Voz", "Percussão", "Agogô", "Ganzá", "Atabaque",
] as const;

export const GENRES = [
  "Samba", "Pagode", "Samba-enredo", "Samba de roda", "Samba de breque",
  "Samba-canção", "Samba-rock", "Partido alto", "Samba-reggae",
  "Pagode baiano", "Pagode romântico", "Choro", "MPB",
] as const;

// SVG vetorial — nítido em qualquer tamanho, sem pixelização
export const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663116082617/bC6Pj8ksngxNy5fe35WqgW/pnsp-logo_0062fa99.svg";
export const LOGO_URL_WHITE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663116082617/bC6Pj8ksngxNy5fe35WqgW/pnsp-logo-white_eeca339e.svg";
export const LOGO_URL_GOLD = "https://d2xsxph8kpxj0f.cloudfront.net/310519663116082617/bC6Pj8ksngxNy5fe35WqgW/pnsp-logo-gold_93bb7e34.svg";
