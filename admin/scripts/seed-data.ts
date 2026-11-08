/**
 * Conteúdo inicial. Precisa de revisão jurídica (NPJ/Defensoria) antes de uso real.
 *
 * Correções em relação ao protótipo:
 * - A Lei Maria da Penha é a 11.340/2006 (o Figma cita 11.304 em um texto).
 * - O feminicídio é crime autônomo desde a Lei 14.994/2024 (art. 121-A do CP),
 *   não mais qualificadora do homicídio.
 * - A Lei 12.737/2012 trata de delitos informáticos, não de violência psicológica.
 */

export const violenceTypeSeed = [
  {
    slug: "fisica",
    name: "Física",
    description: "Qualquer conduta que ofenda a integridade ou a saúde do corpo da mulher.",
  },
  {
    slug: "psicologica",
    name: "Psicológica",
    description:
      "Conduta que cause dano emocional ou diminua a autoestima, ou que busque controlar ações, comportamentos e decisões por meio de ameaça, humilhação, isolamento, perseguição ou chantagem, entre outras formas.",
  },
  {
    slug: "patrimonial",
    name: "Patrimonial",
    description:
      "Conduta que configure retenção, subtração ou destruição de objetos, documentos, instrumentos de trabalho, bens, valores ou recursos econômicos da mulher.",
  },
  {
    slug: "sexual",
    name: "Sexual",
    description:
      "Conduta que force a mulher a presenciar, manter ou participar de relação sexual não desejada, ou que limite seus direitos sexuais e reprodutivos, por meio de intimidação, ameaça, coação ou uso da força.",
  },
  {
    slug: "moral",
    name: "Moral",
    description: "Conduta que configure calúnia, difamação ou injúria contra a mulher.",
  },
];

export const lawSeed = [
  {
    popularName: "Lei Maria da Penha",
    number: "Lei nº 11.340/2006",
    summary:
      "Cria mecanismos para coibir a violência doméstica e familiar contra a mulher, prevê medidas protetivas de urgência, como o afastamento do agressor, e amplia o acesso a serviços de assistência.",
    officialUrl: "https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2006/lei/l11340.htm",
    published: true,
    types: ["fisica", "psicologica", "patrimonial", "sexual", "moral"],
  },
  {
    popularName: "Lei do Feminicídio",
    number: "Lei nº 13.104/2015",
    summary:
      "Incluiu o feminicídio na legislação penal: a morte de uma mulher por violência doméstica e familiar ou por menosprezo ou discriminação à condição de mulher. Desde a Lei nº 14.994/2024, o feminicídio é crime autônomo no art. 121-A do Código Penal.",
    officialUrl: "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13104.htm",
    published: true,
    types: ["fisica"],
  },
  {
    popularName: "Violência psicológica",
    number: "Lei nº 14.188/2021",
    summary:
      "Criou o crime de violência psicológica contra a mulher e o programa Sinal Vermelho contra a Violência Doméstica.",
    officialUrl: "https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2021/lei/L14188.htm",
    published: true,
    types: ["psicologica"],
  },
  {
    popularName: "Lei Carolina Dieckmann",
    number: "Lei nº 12.737/2012",
    summary:
      "Tipifica delitos informáticos, como a invasão de dispositivo para obter ou divulgar dados e arquivos pessoais.",
    officialUrl: "https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2012/lei/l12737.htm",
    published: false,
    types: [],
  },
];

/**
 * Rede de apoio do DF, levantada em fontes públicas (TJDFT, Agência Brasília,
 * Senado, Agência Gov) que divergem entre si nos telefones. Por isso entra
 * oculta e sem `verified_at`: alguém precisa ligar, conferir e só então publicar.
 * Sem coordenadas, pois nenhuma fonte oficial consultada as informa.
 * Endereços de abrigos não são cadastrados: costumam ser sigilosos.
 */
export const supportServiceSeed = [
  {
    type: "deam",
    category: "emergencia",
    name: "DEAM I - Delegacia Especial de Atendimento à Mulher",
    address: "EQS 204/205, Asa Sul",
    neighborhood: "Asa Sul",
    city: "Brasília",
    state: "DF",
    phone: "(61) 3207-6172",
    hours: null,
    services: ["Registro de ocorrência", "Medidas protetivas"],
  },
  {
    type: "casa_mulher_brasileira",
    category: "juridica",
    name: "Casa da Mulher Brasileira",
    address: "CNM 1, Bloco I, Lote 3, Ceilândia",
    neighborhood: "Ceilândia",
    city: "Brasília",
    state: "DF",
    phone: "(61) 3371-2897",
    hours: "24 horas, todos os dias",
    services: ["Acolhimento", "Orientação jurídica", "Apoio psicossocial"],
  },
  {
    type: "crm",
    category: "psicossocial",
    name: "CEAM 102 Sul - Centro Especializado de Atendimento à Mulher",
    address: "Estação do Metrô 102 Sul, Asa Sul",
    neighborhood: "Asa Sul",
    city: "Brasília",
    state: "DF",
    phone: "(61) 3224-0943",
    hours: "Segunda a sexta, 8h às 18h",
    services: ["Atendimento psicossocial", "Orientação"],
  },
  {
    type: "defensoria",
    category: "juridica",
    name: "NUDEM - Núcleo de Defesa da Mulher (Defensoria Pública do DF)",
    address: "Setor de Múltiplas Atividades Sul, Trecho 3, Lotes 4/6, Bloco 4",
    neighborhood: null,
    city: "Brasília",
    state: "DF",
    phone: "129",
    hours: null,
    services: ["Orientação jurídica gratuita"],
  },
];
