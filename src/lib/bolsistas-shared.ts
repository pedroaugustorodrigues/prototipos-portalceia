/**
 * Dados compartilhados (mock) entre Fluxo de Pagamento e Cadastro de Bolsistas.
 * Em produção, viriam da API.
 */

export type CcInfo = {
  id: string;
  codigo: string;
  nome: string;
  projetoId: string;
};

export const CCS: CcInfo[] = [
  // Aurora — EMBRAPII + EMPRESA + SEBRAE
  { id: "cc-aurora-embrapii", codigo: "88.324", nome: "EMBRAPII", projetoId: "p-aurora" },
  { id: "cc-aurora-empresa", codigo: "88.326", nome: "EMPRESA", projetoId: "p-aurora" },
  { id: "cc-aurora-sebrae", codigo: "883257", nome: "SEBRAE", projetoId: "p-aurora" },
  // Helix — EMBRAPII + SEBRAE
  { id: "cc-helix-embrapii", codigo: "88.324", nome: "EMBRAPII", projetoId: "p-helix" },
  { id: "cc-helix-sebrae", codigo: "883257", nome: "SEBRAE", projetoId: "p-helix" },
  // Kairós — EMBRAPII
  { id: "cc-kairos-embrapii", codigo: "88.324", nome: "EMBRAPII", projetoId: "p-kairos" },
  // Nimbus — EMPRESA + SEBRAE
  { id: "cc-nimbus-empresa", codigo: "88.326", nome: "EMPRESA", projetoId: "p-nimbus" },
  { id: "cc-nimbus-sebrae", codigo: "883257", nome: "SEBRAE", projetoId: "p-nimbus" },
  // Vertex — EMBRAPII + EMPRESA + SEBRAE
  { id: "cc-vertex-embrapii", codigo: "88.324", nome: "EMBRAPII", projetoId: "p-vertex" },
  { id: "cc-vertex-empresa", codigo: "88.326", nome: "EMPRESA", projetoId: "p-vertex" },
  { id: "cc-vertex-sebrae", codigo: "883257", nome: "SEBRAE", projetoId: "p-vertex" },
];

export function getCc(id: string | undefined): CcInfo | undefined {
  return CCS.find((c) => c.id === id);
}

// Código PEIA por projeto (mock — em produção viria do cadastro do projeto).
export const PEIA_POR_PROJETO: Record<string, string> = {
  "p-aurora": "PEIA-2024.0118",
  "p-helix": "PEIA-2024.0237",
  "p-kairos": "PEIA-2025.0042",
  "p-nimbus": "PEIA-2025.0156",
  "p-vertex": "PEIA-2024.0389",
};

// Cada bolsa (BOLSAS de equipe-bolsas-data) é alocada em um CC específico.
export const CC_POR_BOLSA: Record<string, string> = {
  "b-1": "cc-aurora-embrapii",
  "b-2": "cc-helix-embrapii",
  "b-3": "cc-kairos-embrapii",
  "b-4": "cc-vertex-embrapii",
  "b-5": "cc-aurora-empresa",
  "b-6": "cc-nimbus-empresa",
  "b-7": "cc-helix-sebrae",
  "b-8": "cc-helix-embrapii",
  "b-9": "cc-vertex-sebrae",
  "b-10": "cc-aurora-embrapii",
  "b-11": "cc-nimbus-sebrae",
  "b-12": "cc-kairos-embrapii",
  "b-13": "cc-nimbus-empresa",
  "b-14": "cc-vertex-empresa",
};

export const CPF_POR_MEMBRO: Record<string, string> = {
  "m-mariana": "123.456.789-00",
  "m-rafael": "234.567.890-11",
  "m-camila": "345.678.901-22",
  "m-bruno": "456.789.012-33",
  "m-julia": "567.890.123-44",
  "m-thiago": "678.901.234-55",
};

// Tag opcional por bolsa.
export type BolsaTag = "suporte_operacional" | "ue";
export const TAG_POR_BOLSA: Record<string, BolsaTag> = {
  "b-1": "suporte_operacional",
  "b-2": "ue",
  "b-5": "suporte_operacional",
  "b-7": "ue",
  "b-9": "suporte_operacional",
  "b-11": "ue",
  "b-13": "suporte_operacional",
  // extras
  "bx-aur-emb-2": "ue",
  "bx-aur-emp-1": "suporte_operacional",
  "bx-aur-emp-3": "ue",
  "bx-hel-emb-1": "suporte_operacional",
  "bx-hel-seb-2": "ue",
  "bx-kai-emb-2": "suporte_operacional",
  "bx-nim-emp-1": "ue",
  "bx-nim-seb-2": "suporte_operacional",
  "bx-ver-emb-1": "ue",
  "bx-ver-seb-3": "suporte_operacional",
};

// Bolsistas extras (mock) para enriquecer cada CC com mais linhas.
export type ExtraLinha = {
  bolsaId: string;
  memberId: string;
  nome: string;
  iniciais: string;
  cpf: string;
  projetoId: string;
  ccId: string;
  rubrica: string;
  valor: number;
  inicio: string;
  fim: string;
};
export const EXTRAS: ExtraLinha[] = [
  // Aurora — EMBRAPII
  { bolsaId: "bx-aur-emb-1", memberId: "x-aur-emb-1", nome: "Larissa Costa", iniciais: "LC", cpf: "111.222.333-44", projetoId: "p-aurora", ccId: "cc-aurora-embrapii", rubrica: "Bolsa de Apoio Técnico", valor: 2400, inicio: "2025-09", fim: "2026-08" },
  { bolsaId: "bx-aur-emb-2", memberId: "x-aur-emb-2", nome: "Pedro Henrique Silva", iniciais: "PS", cpf: "222.333.444-55", projetoId: "p-aurora", ccId: "cc-aurora-embrapii", rubrica: "Bolsa de Pesquisa", valor: 3100, inicio: "2025-10", fim: "2026-09" },
  { bolsaId: "bx-aur-emb-3", memberId: "x-aur-emb-3", nome: "Beatriz Andrade", iniciais: "BA", cpf: "333.444.555-66", projetoId: "p-aurora", ccId: "cc-aurora-embrapii", rubrica: "Bolsa de Desenvolvimento", valor: 2700, inicio: "2025-11", fim: "2026-10" },
  // Aurora — EMPRESA
  { bolsaId: "bx-aur-emp-1", memberId: "x-aur-emp-1", nome: "Diego Martins", iniciais: "DM", cpf: "444.555.666-77", projetoId: "p-aurora", ccId: "cc-aurora-empresa", rubrica: "Bolsa de Suporte", valor: 2200, inicio: "2025-08", fim: "2026-07" },
  { bolsaId: "bx-aur-emp-2", memberId: "x-aur-emp-2", nome: "Renata Oliveira", iniciais: "RO", cpf: "555.666.777-88", projetoId: "p-aurora", ccId: "cc-aurora-empresa", rubrica: "Bolsa de Gestão", valor: 2900, inicio: "2026-01", fim: "2026-12" },
  { bolsaId: "bx-aur-emp-3", memberId: "x-aur-emp-3", nome: "Felipe Cardoso", iniciais: "FC", cpf: "666.777.888-99", projetoId: "p-aurora", ccId: "cc-aurora-empresa", rubrica: "Bolsa de Análise", valor: 2500, inicio: "2025-12", fim: "2026-11" },
  // Aurora — SEBRAE
  { bolsaId: "bx-aur-seb-1", memberId: "x-aur-seb-1", nome: "Yasmin Moreira", iniciais: "YM", cpf: "111.000.222-10", projetoId: "p-aurora", ccId: "cc-aurora-sebrae", rubrica: "Bolsa de Suporte", valor: 2100, inicio: "2025-10", fim: "2026-09" },
  { bolsaId: "bx-aur-seb-2", memberId: "x-aur-seb-2", nome: "Leandro Prado", iniciais: "LP", cpf: "222.000.333-21", projetoId: "p-aurora", ccId: "cc-aurora-sebrae", rubrica: "Bolsa de Documentação", valor: 2400, inicio: "2025-11", fim: "2026-10" },
  { bolsaId: "bx-aur-seb-3", memberId: "x-aur-seb-3", nome: "Marina Teixeira", iniciais: "MT", cpf: "333.000.444-32", projetoId: "p-aurora", ccId: "cc-aurora-sebrae", rubrica: "Bolsa de Apoio Financeiro", valor: 2600, inicio: "2026-01", fim: "2026-12" },

  // Helix — EMBRAPII
  { bolsaId: "bx-hel-emb-1", memberId: "x-hel-emb-1", nome: "Amanda Souza", iniciais: "AS", cpf: "777.888.999-00", projetoId: "p-helix", ccId: "cc-helix-embrapii", rubrica: "Bolsa de Apoio Técnico", valor: 2300, inicio: "2025-10", fim: "2026-09" },
  { bolsaId: "bx-hel-emb-2", memberId: "x-hel-emb-2", nome: "Caio Ferreira", iniciais: "CF", cpf: "888.999.000-11", projetoId: "p-helix", ccId: "cc-helix-embrapii", rubrica: "Bolsa de Pesquisa", valor: 3000, inicio: "2026-01", fim: "2026-12" },
  { bolsaId: "bx-hel-emb-3", memberId: "x-hel-emb-3", nome: "Inês Ramos", iniciais: "IR", cpf: "999.000.111-22", projetoId: "p-helix", ccId: "cc-helix-embrapii", rubrica: "Bolsa de Desenvolvimento", valor: 2800, inicio: "2025-09", fim: "2026-08" },
  // Helix — SEBRAE
  { bolsaId: "bx-hel-seb-1", memberId: "x-hel-seb-1", nome: "Marcos Vinicius Pinto", iniciais: "MP", cpf: "000.111.222-33", projetoId: "p-helix", ccId: "cc-helix-sebrae", rubrica: "Bolsa de Suporte", valor: 2000, inicio: "2026-02", fim: "2027-01" },
  { bolsaId: "bx-hel-seb-2", memberId: "x-hel-seb-2", nome: "Tatiane Lima", iniciais: "TL", cpf: "123.456.000-11", projetoId: "p-helix", ccId: "cc-helix-sebrae", rubrica: "Bolsa de Gestão", valor: 2600, inicio: "2026-03", fim: "2027-02" },
  { bolsaId: "bx-hel-seb-3", memberId: "x-hel-seb-3", nome: "Otavio Borges", iniciais: "OB", cpf: "234.567.000-22", projetoId: "p-helix", ccId: "cc-helix-sebrae", rubrica: "Bolsa de Análise", valor: 2400, inicio: "2026-04", fim: "2027-03" },

  // Kairós — EMBRAPII
  { bolsaId: "bx-kai-emb-1", memberId: "x-kai-emb-1", nome: "Sofia Albuquerque", iniciais: "SA", cpf: "345.678.000-33", projetoId: "p-kairos", ccId: "cc-kairos-embrapii", rubrica: "Bolsa de Pesquisa", valor: 3300, inicio: "2025-11", fim: "2026-10" },
  { bolsaId: "bx-kai-emb-2", memberId: "x-kai-emb-2", nome: "Vinicius Araújo", iniciais: "VA", cpf: "456.789.000-44", projetoId: "p-kairos", ccId: "cc-kairos-embrapii", rubrica: "Bolsa de Desenvolvimento", valor: 2800, inicio: "2025-12", fim: "2026-11" },
  { bolsaId: "bx-kai-emb-3", memberId: "x-kai-emb-3", nome: "Helena Cunha", iniciais: "HC", cpf: "567.890.000-55", projetoId: "p-kairos", ccId: "cc-kairos-embrapii", rubrica: "Bolsa de Apoio Técnico", valor: 2500, inicio: "2026-02", fim: "2027-01" },

  // Nimbus — EMPRESA
  { bolsaId: "bx-nim-emp-1", memberId: "x-nim-emp-1", nome: "Gustavo Pereira", iniciais: "GP", cpf: "678.901.000-66", projetoId: "p-nimbus", ccId: "cc-nimbus-empresa", rubrica: "Bolsa de Gestão", valor: 2700, inicio: "2026-01", fim: "2026-12" },
  { bolsaId: "bx-nim-emp-2", memberId: "x-nim-emp-2", nome: "Carla Bianchi", iniciais: "CB", cpf: "789.012.000-77", projetoId: "p-nimbus", ccId: "cc-nimbus-empresa", rubrica: "Bolsa de Análise", valor: 2300, inicio: "2026-03", fim: "2027-02" },
  // Nimbus — SEBRAE
  { bolsaId: "bx-nim-seb-1", memberId: "x-nim-seb-1", nome: "Eduardo Nogueira", iniciais: "EN", cpf: "890.123.000-88", projetoId: "p-nimbus", ccId: "cc-nimbus-sebrae", rubrica: "Bolsa de Suporte", valor: 2100, inicio: "2026-02", fim: "2027-01" },
  { bolsaId: "bx-nim-seb-2", memberId: "x-nim-seb-2", nome: "Patrícia Vieira", iniciais: "PV", cpf: "901.234.000-99", projetoId: "p-nimbus", ccId: "cc-nimbus-sebrae", rubrica: "Bolsa de Documentação", valor: 2400, inicio: "2026-04", fim: "2027-03" },
  { bolsaId: "bx-nim-seb-3", memberId: "x-nim-seb-3", nome: "Rodrigo Castro", iniciais: "RC", cpf: "012.345.000-10", projetoId: "p-nimbus", ccId: "cc-nimbus-sebrae", rubrica: "Bolsa de Apoio Financeiro", valor: 2200, inicio: "2026-05", fim: "2027-04" },

  // Vertex — EMBRAPII
  { bolsaId: "bx-ver-emb-1", memberId: "x-ver-emb-1", nome: "Luísa Bernardes", iniciais: "LB", cpf: "123.450.000-21", projetoId: "p-vertex", ccId: "cc-vertex-embrapii", rubrica: "Bolsa de Pesquisa", valor: 3100, inicio: "2026-04", fim: "2027-03" },
  { bolsaId: "bx-ver-emb-2", memberId: "x-ver-emb-2", nome: "Henrique Salles", iniciais: "HS", cpf: "234.560.000-32", projetoId: "p-vertex", ccId: "cc-vertex-embrapii", rubrica: "Bolsa de Desenvolvimento", valor: 2900, inicio: "2026-05", fim: "2027-04" },
  // Vertex — EMPRESA
  { bolsaId: "bx-ver-emp-1", memberId: "x-ver-emp-1", nome: "Aline Carvalho", iniciais: "AC", cpf: "345.670.000-43", projetoId: "p-vertex", ccId: "cc-vertex-empresa", rubrica: "Bolsa de Gestão", valor: 2700, inicio: "2026-06", fim: "2027-05" },
  { bolsaId: "bx-ver-emp-2", memberId: "x-ver-emp-2", nome: "Murilo Tavares", iniciais: "MT", cpf: "456.780.000-54", projetoId: "p-vertex", ccId: "cc-vertex-empresa", rubrica: "Bolsa de Análise", valor: 2300, inicio: "2026-03", fim: "2027-02" },
  // Vertex — SEBRAE
  { bolsaId: "bx-ver-seb-1", memberId: "x-ver-seb-1", nome: "Daniela Frota", iniciais: "DF", cpf: "567.800.000-65", projetoId: "p-vertex", ccId: "cc-vertex-sebrae", rubrica: "Bolsa de Suporte", valor: 2000, inicio: "2026-04", fim: "2027-03" },
  { bolsaId: "bx-ver-seb-2", memberId: "x-ver-seb-2", nome: "Igor Pacheco", iniciais: "IP", cpf: "678.900.000-76", projetoId: "p-vertex", ccId: "cc-vertex-sebrae", rubrica: "Bolsa de Apoio Técnico", valor: 2400, inicio: "2026-05", fim: "2027-04" },
  { bolsaId: "bx-ver-seb-3", memberId: "x-ver-seb-3", nome: "Joana Reis", iniciais: "JR", cpf: "789.000.000-87", projetoId: "p-vertex", ccId: "cc-vertex-sebrae", rubrica: "Bolsa de Documentação", valor: 2600, inicio: "2026-06", fim: "2027-05" },
];
