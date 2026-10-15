import { useActiveProfile } from "@/lib/profile";

export type ProjectStatus = "em_execucao" | "encerrado" | "prospeccao";

export type Project = {
  id: string;
  name: string;
  client: string;
  coordinator: string;
  role: "Coordenador" | "Vice-Coordenador";
  status: ProjectStatus;
  funding: string;
  vigencia: string;
};

/** Vaga (slot) de bolsa prevista no PTR de um projeto. */
export type BolsaSlot = {
  id: string;
  projectId: string;
  /** Função/posto previsto no plano (ex.: "Pesquisador Sênior", "Colaborador DTI-A"). */
  funcao: string;
  /** Carga horária mensal prevista. */
  ch: number;
  /** Valor mensal da bolsa em reais. */
  valor: number;
  /** Vigência prevista da vaga. */
  vigencia: string;
  /** Fonte do recurso. */
  fonte: string;
  /** Se está ocupada, dados do colaborador. Caso contrário, vaga em aberto. */
  ocupante?: {
    nome: string;
    cpf: string;
    /** Mês/ano de início da bolsa atual. */
    inicio: string;
    /** Quantos meses de bolsa restam até o fim da vigência. */
    mesesRestantes: number;
  };
};

/** Estrutura hierárquica: rubrica e suas subrubricas. */
export type RubricaNode = {
  rubrica: string;
  subrubricas: string[];
};

export const RUBRICAS_TREE: RubricaNode[] = [
  {
    rubrica: "DIÁRIAS",
    subrubricas: [
      "Diárias Internacionais (**) - alimentação, locomoção e hospedagem",
      "Diárias Nacionais (*) - alimentação, locomoção e hospedagem",
    ],
  },
  {
    rubrica: "PASSAGENS E LOCOMOÇÃO",
    subrubricas: [
      "Passagens e despesas de locomoção Internacionais",
      "Passagens e despesas de locomoção Nacionais",
    ],
  },
  {
    rubrica: "SERVIÇOS DE TERCEIROS - PESSOA JURÍDICA",
    subrubricas: ["Taxas Bancárias"],
  },
  {
    rubrica: "MATERIAL DE CONSUMO",
    subrubricas: ["Material de Consumo"],
  },
  {
    rubrica: "DESPESAS DE SUPORTE OPERACIONAL",
    subrubricas: ["Suporte Operacional UE", "Colaboradores - Suporte Operacional", "D.A.O. FUNAPE"],
  },
  {
    rubrica: "RESSARCIMENTO IFES",
    subrubricas: ["Compensação financeira pela cessão de eventual inovação tecnológica"],
  },
];

/** Selecção que pode ser uma rubrica completa ou uma subrubrica específica. */
export type RubricaSelection = {
  rubrica: string;
  subrubrica?: string;
  /** Texto canônico para exibir/usar em formulários. */
  label: string;
};

export const PROJECTS: Project[] = [
  { id: "p1", name: "Sistema de Navegação Autônoma para VANTs", client: "AeroVision Tecnologia S.A.", coordinator: "Erika Morais", role: "Coordenador", status: "em_execucao", funding: "EMBRAPII", vigencia: "01/03/2024 — 28/02/2026" },
  { id: "p2", name: "IA para Detecção de Plágio Acadêmico", client: "EduTrust Soluções Educacionais", coordinator: "Renata Braga", role: "Coordenador", status: "em_execucao", funding: "SEBRAE", vigencia: "01/06/2024 — 31/05/2026" },
  { id: "p3", name: "Plataforma Wave Testing", client: "WaveCorp Engenharia", coordinator: "Juliana Costa", role: "Vice-Coordenador", status: "em_execucao", funding: "EMPRESA", vigencia: "15/01/2025 — 14/01/2027" },
  { id: "p4", name: "Portal CEIA — Gestão de Projetos", client: "CEIA / UFG", coordinator: "Anderson Lima", role: "Coordenador", status: "em_execucao", funding: "CEIA", vigencia: "01/02/2025 — 31/01/2026" },
  { id: "p5", name: "Análise de Imagens Médicas com Deep Learning", client: "MedVision Diagnósticos", coordinator: "Renata Braga", role: "Coordenador", status: "encerrado", funding: "EMBRAPII", vigencia: "01/01/2023 — 31/12/2024" },
];

/** Slots de bolsa por projeto (mock). Em produção viria do backend. */
export const BOLSA_SLOTS: BolsaSlot[] = [
  // p1 — VANTs
  { id: "p1-s1", projectId: "p1", funcao: "Pesquisador Sênior", ch: 20, valor: 4000, vigencia: "12 meses", fonte: "EMBRAPII",
    ocupante: { nome: "Erika Morais", cpf: "123.456.789-00", inicio: "03/2024", mesesRestantes: 5 } },
  { id: "p1-s2", projectId: "p1", funcao: "Colaborador DTI-A", ch: 40, valor: 3000, vigencia: "18 meses", fonte: "EMBRAPII",
    ocupante: { nome: "Pedro Augusto Lima", cpf: "987.654.321-00", inicio: "04/2024", mesesRestantes: 9 } },
  { id: "p1-s3", projectId: "p1", funcao: "Colaborador DTI-B", ch: 30, valor: 2200, vigencia: "12 meses", fonte: "EMBRAPII" },
  { id: "p1-s4", projectId: "p1", funcao: "Colaborador IC", ch: 20, valor: 700, vigencia: "12 meses", fonte: "EMBRAPII" },

  // p2 — Plágio
  { id: "p2-s1", projectId: "p2", funcao: "Pesquisador Sênior", ch: 20, valor: 4500, vigencia: "24 meses", fonte: "SEBRAE",
    ocupante: { nome: "Renata Braga", cpf: "111.222.333-44", inicio: "06/2024", mesesRestantes: 13 } },
  { id: "p2-s2", projectId: "p2", funcao: "Colaborador DTI-A", ch: 40, valor: 3000, vigencia: "12 meses", fonte: "SEBRAE",
    ocupante: { nome: "Luiz Miguel Costa", cpf: "333.333.333-33", inicio: "07/2024", mesesRestantes: 2 } },
  { id: "p2-s3", projectId: "p2", funcao: "Colaborador DTI-B", ch: 30, valor: 2200, vigencia: "12 meses", fonte: "SEBRAE" },

  // p3 — Wave Testing
  { id: "p3-s1", projectId: "p3", funcao: "Líder Técnico", ch: 20, valor: 5000, vigencia: "24 meses", fonte: "EMPRESA",
    ocupante: { nome: "Juliana Costa", cpf: "555.666.777-88", inicio: "01/2025", mesesRestantes: 20 } },
  { id: "p3-s2", projectId: "p3", funcao: "Colaborador DTI-A", ch: 40, valor: 3500, vigencia: "12 meses", fonte: "EMPRESA" },
  { id: "p3-s3", projectId: "p3", funcao: "Colaborador IC", ch: 20, valor: 700, vigencia: "12 meses", fonte: "EMPRESA",
    ocupante: { nome: "Ana Beatriz Souza", cpf: "999.888.777-66", inicio: "02/2025", mesesRestantes: 9 } },

  // p4 — Portal CEIA
  { id: "p4-s1", projectId: "p4", funcao: "Líder Técnico", ch: 20, valor: 4500, vigencia: "12 meses", fonte: "CEIA",
    ocupante: { nome: "Anderson Lima", cpf: "444.555.666-77", inicio: "02/2025", mesesRestantes: 9 } },
  { id: "p4-s2", projectId: "p4", funcao: "Colaborador DTI-A", ch: 40, valor: 3000, vigencia: "12 meses", fonte: "CEIA" },
  { id: "p4-s3", projectId: "p4", funcao: "Colaborador DTI-B", ch: 30, valor: 2200, vigencia: "12 meses", fonte: "CEIA" },
];

/**
 * Slots de bolsa adicionais com cargo "Equipe Administrativa". Visíveis apenas
 * para o perfil "admin" (Equipe Administrativa). Use {@link useBolsaSlots} ou
 * {@link getBolsaSlotsForProfile} para obter a lista final filtrada por perfil.
 */
export const EQUIPE_ADM_SLOTS: BolsaSlot[] = [
  { id: "p1-ea1", projectId: "p1", funcao: "Equipe Administrativa", ch: 20, valor: 2800, vigencia: "12 meses", fonte: "EMBRAPII",
    ocupante: { nome: "Mariana Alves", cpf: "222.111.000-99", inicio: "08/2025", mesesRestantes: 8 } },
  { id: "p2-ea1", projectId: "p2", funcao: "Equipe Administrativa", ch: 20, valor: 2200, vigencia: "11 meses", fonte: "SEBRAE",
    ocupante: { nome: "Rafael Tavares", cpf: "321.654.987-22", inicio: "11/2025", mesesRestantes: 6 } },
  { id: "p3-ea1", projectId: "p3", funcao: "Equipe Administrativa", ch: 30, valor: 3500, vigencia: "12 meses", fonte: "EMPRESA",
    ocupante: { nome: "Camila Rocha", cpf: "654.987.321-11", inicio: "06/2025", mesesRestantes: 4 } },
  { id: "p4-ea1", projectId: "p4", funcao: "Equipe Administrativa", ch: 20, valor: 2000, vigencia: "12 meses", fonte: "CEIA",
    ocupante: { nome: "Júlia Mendes", cpf: "789.456.123-33", inicio: "02/2026", mesesRestantes: 11 } },
  { id: "p1-ea2", projectId: "p1", funcao: "Equipe Administrativa", ch: 20, valor: 1700, vigencia: "12 meses", fonte: "EMBRAPII" },
  { id: "p4-ea2", projectId: "p4", funcao: "Equipe Administrativa", ch: 30, valor: 2600, vigencia: "12 meses", fonte: "CEIA",
    ocupante: { nome: "Thiago Nunes", cpf: "456.123.789-44", inicio: "10/2025", mesesRestantes: 5 } },
];

/** Retorna a lista de slots visíveis para um perfil (incluindo Equipe Administrativa quando aplicável). */
export function getBolsaSlotsForProfile(profileId: string): BolsaSlot[] {
  return profileId === "admin" ? [...BOLSA_SLOTS, ...EQUIPE_ADM_SLOTS] : BOLSA_SLOTS;
}

/** Hook React que retorna os slots visíveis para o perfil ativo. */
export function useBolsaSlots(): BolsaSlot[] {
  const profile = useActiveProfile();
  return getBolsaSlotsForProfile(profile.id);
}

export type RequestStatus = "pendente" | "em_analise" | "aprovado" | "aguardando_assinatura" | "concluido" | "recusado";

export type AdjustmentRequest = {
  id: string;
  projectId: string;
  projectName: string;
  createdAt: string;
  status: RequestStatus;
  topics: string[];
  /** Payload mock do formulário submetido (para visualização de detalhes) */
  payload?: Record<string, any>;
};

export const MOCK_REQUESTS: AdjustmentRequest[] = [
  {
    id: "REQ-2025-014",
    projectId: "p2",
    projectName: "IA para Detecção de Plágio Acadêmico",
    createdAt: "08/04/2025",
    status: "aguardando_assinatura",
    topics: ["Inclusão de Colaborador", "Suplementação de Rubrica"],
    payload: {
      inclusao: {
        active: true,
        inclusionLines: [
          { nome: "João Silva", cpf: "222.333.444-55", vinculo: "Contratado", ch: 20, parcelas: 12, valor: 1500, inicio: "05/2025" },
        ],
      },
      suplementacao: {
        active: true,
        lines: [
          { text: "Suplementar R$ 10.000 na rubrica de Material de Consumo - Fonte EMBRAPII" },
        ],
      },
    },
  },
  {
    id: "REQ-2025-009",
    projectId: "p2",
    projectName: "IA para Detecção de Plágio Acadêmico",
    createdAt: "10/03/2025",
    status: "concluido",
    topics: ["Prorrogação de Vigência"],
    payload: {
      prorrogacao: { active: true, lines: [{ text: "Acrescentar 6 parcelas para Renata Braga" }] },
    },
  },
  {
    id: "REQ-2025-024",
    projectId: "p1",
    projectName: "Sistema de Navegação Autônoma para VANTs",
    createdAt: "20/04/2025",
    status: "aguardando_assinatura",
    topics: ["Inclusão de Colaborador"],
    payload: {
      inclusao: {
        active: true,
        inclusionLines: [
          { nome: "Lucas Andrade", cpf: "333.444.555-66", vinculo: "Contratado", ch: 30, parcelas: 10, valor: 2200, inicio: "05/2025" },
        ],
      },
    },
  },
  {
    id: "REQ-2024-042",
    projectId: "p1",
    projectName: "Sistema de Navegação Autônoma para VANTs",
    createdAt: "19/04/2025",
    status: "concluido",
    topics: [
      "Inclusão de Colaborador",
      "Ajuste no Valor da Bolsa",
      "Prorrogação de Vigência",
      "Redução de Vigência (distrato)",
      "Ajuste de Carga Horária",
      "Suplementação de Rubrica",
      "Anulação em Outras Rubricas",
    ],
    payload: {
      inclusao: {
        active: true,
        inclusionLines: [
          { nome: "Camila Rocha", cpf: "111.222.333-44", vinculo: "Contratado", ch: 40, parcelas: 12, valor: 4500, inicio: "01/2025" },
          { nome: "Bruno Teixeira", cpf: "555.666.777-88", vinculo: "Bolsista DTI-A", ch: 20, parcelas: 6, valor: 2200, inicio: "01/2025" },
        ],
      },
      valor: {
        active: true,
        lines: [{ text: "Aumentar bolsa de Erika Morais de R$ 4.000 para R$ 4.800" }],
      },
      prorrogacao: {
        active: true,
        lines: [{ text: "Prorrogar vigência do projeto em 4 meses" }],
      },
      reducao: {
        active: true,
        lines: [{ text: "Distrato antecipado de Pedro Augusto Lima a partir de 02/2025" }],
      },
      carga: {
        active: true,
        lines: [{ text: "Ajustar carga horária de Marina Souza de 20h para 30h mensais" }],
      },
      suplementacao: {
        active: true,
        lines: [{ text: "Suplementar R$ 12.000 na rubrica de Material de Consumo - Fonte EMBRAPII" }],
      },
      anulacaoRubrica: {
        active: true,
        lines: [{ text: "Anular R$ 5.000 da rubrica de Diárias - Fonte EMBRAPII" }],
      },
    },
  },
  {
    id: "REQ-2025-021",
    projectId: "p1",
    projectName: "Sistema de Navegação Autônoma para VANTs",
    createdAt: "09/04/2025",
    status: "em_analise",
    topics: ["Ajuste de Valor de Bolsa"],
    payload: {
      valor: { active: true, lines: [{ text: "Aumentar bolsa de Erika Morais de R$ 4.000 para R$ 4.500" }] },
    },
  },
  {
    id: "REQ-2025-007",
    projectId: "p3",
    projectName: "Plataforma Wave Testing",
    createdAt: "02/03/2025",
    status: "recusado",
    topics: ["Inclusão de Colaborador Externo"],
    payload: {
      inclusao: { active: true, inclusionLines: [{ nome: "Maria Oliveira", cpf: "777.888.999-00", vinculo: "Colaborador Externo", ch: 20, parcelas: 6, valor: 1200, inicio: "03/2025" }] },
    },
  },
  {
    id: "REQ-2025-018",
    projectId: "p1",
    projectName: "Sistema de Navegação Autônoma para VANTs",
    createdAt: "25/03/2025",
    status: "aprovado",
    topics: ["Suplementação de Rubrica"],
    payload: {
      suplementacao: {
        active: true,
        lines: [{ text: "Suplementar R$ 8.000 na rubrica de Diárias - Fonte EMBRAPII" }],
      },
    },
  },
  {
    id: "REQ-2025-003",
    projectId: "p1",
    projectName: "Sistema de Navegação Autônoma para VANTs",
    createdAt: "12/02/2025",
    status: "concluido",
    topics: ["Prorrogação de Vigência"],
    payload: {
      prorrogacao: { active: true, lines: [{ text: "Prorrogar vigência do projeto em 3 meses" }] },
    },
  },
];

export const STATUS_LABEL: Record<RequestStatus, string> = {
  pendente: "Em análise (PROAD)",
  em_analise: "Em análise (EA)",
  aprovado: "Em análise (PROAD)",
  aguardando_assinatura: "Aguardando assinatura",
  concluido: "Aprovada",
  recusado: "Recusada",
};

/** Fonte orçamentária de um projeto com valor total disponível. */
export type FonteOrcamentaria = {
  projectId: string;
  fonte: string;
  /** Valor total da fonte em reais. */
  valorTotal: number;
};

export const FONTES_ORCAMENTARIAS: FonteOrcamentaria[] = [
  { projectId: "p1", fonte: "Embrapii", valorTotal: 480000 },
  { projectId: "p1", fonte: "Empresa", valorTotal: 120000 },
  { projectId: "p2", fonte: "Sebrae", valorTotal: 350000 },
  { projectId: "p2", fonte: "Empresa", valorTotal: 50000 },
  { projectId: "p3", fonte: "Empresa", valorTotal: 600000 },
  { projectId: "p4", fonte: "Embrapii", valorTotal: 200000 },
  { projectId: "p4", fonte: "Empresa Pequena", valorTotal: 80000 },
  { projectId: "p5", fonte: "Embrapii", valorTotal: 520000 },
  { projectId: "p5", fonte: "Empresa", valorTotal: 130000 },
];