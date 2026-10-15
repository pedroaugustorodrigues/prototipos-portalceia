// Dados (mock) das bolsas recebidas pelos membros da equipe administrativa
// gerida pela Patrícia. Em produção, viriam da API do CEIA.

export type TeamMember = {
  id: string;
  nome: string;
  iniciais: string;
  cargo: string;
  email: string;
};

export type Bolsa = {
  id: string;
  memberId: string;
  projetoId: string;
  projetoNome: string;
  projetoSigla: string;
  rubrica: string;
  valorMensal: number;
  /** YYYY-MM (mês inicial, inclusivo) */
  inicio: string;
  /** YYYY-MM (mês final, inclusivo) */
  fim: string;
};

export type Projeto = {
  id: string;
  nome: string;
  sigla: string;
  /** OKLCH usado para a barra no Gantt e badges. */
  cor: string;
};

export const PROJETOS: Projeto[] = [
  { id: "p-aurora", nome: "Aurora — IA Aplicada à Saúde", sigla: "AURORA", cor: "oklch(0.62 0.18 256)" },
  { id: "p-helix", nome: "Helix — Plataforma de Dados Públicos", sigla: "HELIX", cor: "oklch(0.66 0.16 165)" },
  { id: "p-kairos", nome: "Kairós — Visão Computacional", sigla: "KAIRÓS", cor: "oklch(0.70 0.17 55)" },
  { id: "p-nimbus", nome: "Nimbus — Climatologia Urbana", sigla: "NIMBUS", cor: "oklch(0.66 0.15 300)" },
  { id: "p-vertex", nome: "Vertex — Robótica Educacional", sigla: "VERTEX", cor: "oklch(0.65 0.18 20)" },
];

export const MEMBROS: TeamMember[] = [
  { id: "m-mariana", nome: "Mariana Alves", iniciais: "MA", cargo: "Analista Administrativa", email: "mariana.alves@ceia.ufg.br" },
  { id: "m-rafael", nome: "Rafael Tavares", iniciais: "RT", cargo: "Assistente Financeiro", email: "rafael.tavares@ceia.ufg.br" },
  { id: "m-camila", nome: "Camila Rocha", iniciais: "CR", cargo: "Coordenadora de Compras", email: "camila.rocha@ceia.ufg.br" },
  { id: "m-bruno", nome: "Bruno Lemos", iniciais: "BL", cargo: "Analista de Contratos", email: "bruno.lemos@ceia.ufg.br" },
  { id: "m-julia", nome: "Júlia Mendes", iniciais: "JM", cargo: "Assistente Administrativa", email: "julia.mendes@ceia.ufg.br" },
  { id: "m-thiago", nome: "Thiago Nunes", iniciais: "TN", cargo: "Analista de Prestação de Contas", email: "thiago.nunes@ceia.ufg.br" },
];

export const BOLSAS: Bolsa[] = [
  // Mariana
  { id: "b-1", memberId: "m-mariana", projetoId: "p-aurora", projetoNome: "Aurora — IA Aplicada à Saúde", projetoSigla: "AURORA", rubrica: "Bolsa de Apoio Administrativo", valorMensal: 2800, inicio: "2025-08", fim: "2026-07" },
  { id: "b-2", memberId: "m-mariana", projetoId: "p-helix", projetoNome: "Helix — Plataforma de Dados Públicos", projetoSigla: "HELIX", rubrica: "Bolsa de Gestão de Projetos", valorMensal: 2200, inicio: "2026-02", fim: "2026-12" },

  // Rafael
  { id: "b-3", memberId: "m-rafael", projetoId: "p-kairos", projetoNome: "Kairós — Visão Computacional", projetoSigla: "KAIRÓS", rubrica: "Bolsa Financeira", valorMensal: 3200, inicio: "2025-11", fim: "2026-10" },
  { id: "b-4", memberId: "m-rafael", projetoId: "p-vertex", projetoNome: "Vertex — Robótica Educacional", projetoSigla: "VERTEX", rubrica: "Bolsa de Prestação de Contas", valorMensal: 1800, inicio: "2026-03", fim: "2027-02" },

  // Camila
  { id: "b-5", memberId: "m-camila", projetoId: "p-aurora", projetoNome: "Aurora — IA Aplicada à Saúde", projetoSigla: "AURORA", rubrica: "Bolsa de Compras e Suprimentos", valorMensal: 3500, inicio: "2025-06", fim: "2026-05" },
  { id: "b-6", memberId: "m-camila", projetoId: "p-nimbus", projetoNome: "Nimbus — Climatologia Urbana", projetoSigla: "NIMBUS", rubrica: "Bolsa de Suporte a Contratos", valorMensal: 2400, inicio: "2026-01", fim: "2026-09" },
  { id: "b-7", memberId: "m-camila", projetoId: "p-helix", projetoNome: "Helix — Plataforma de Dados Públicos", projetoSigla: "HELIX", rubrica: "Bolsa de Apoio Operacional", valorMensal: 1500, inicio: "2026-06", fim: "2027-05" },

  // Bruno
  { id: "b-8", memberId: "m-bruno", projetoId: "p-helix", projetoNome: "Helix — Plataforma de Dados Públicos", projetoSigla: "HELIX", rubrica: "Bolsa de Gestão de Contratos", valorMensal: 3000, inicio: "2025-09", fim: "2026-08" },
  { id: "b-9", memberId: "m-bruno", projetoId: "p-vertex", projetoNome: "Vertex — Robótica Educacional", projetoSigla: "VERTEX", rubrica: "Bolsa Jurídica Administrativa", valorMensal: 1700, inicio: "2026-04", fim: "2026-11" },

  // Júlia
  { id: "b-10", memberId: "m-julia", projetoId: "p-aurora", projetoNome: "Aurora — IA Aplicada à Saúde", projetoSigla: "AURORA", rubrica: "Bolsa de Apoio Administrativo", valorMensal: 2000, inicio: "2026-02", fim: "2026-07" },
  { id: "b-11", memberId: "m-julia", projetoId: "p-nimbus", projetoNome: "Nimbus — Climatologia Urbana", projetoSigla: "NIMBUS", rubrica: "Bolsa de Documentação", valorMensal: 1900, inicio: "2026-05", fim: "2027-04" },

  // Thiago
  { id: "b-12", memberId: "m-thiago", projetoId: "p-kairos", projetoNome: "Kairós — Visão Computacional", projetoSigla: "KAIRÓS", rubrica: "Bolsa de Prestação de Contas", valorMensal: 2600, inicio: "2025-10", fim: "2026-06" },
  { id: "b-13", memberId: "m-thiago", projetoId: "p-nimbus", projetoNome: "Nimbus — Climatologia Urbana", projetoSigla: "NIMBUS", rubrica: "Bolsa de Apoio Financeiro", valorMensal: 2100, inicio: "2026-01", fim: "2026-12" },
  { id: "b-14", memberId: "m-thiago", projetoId: "p-vertex", projetoNome: "Vertex — Robótica Educacional", projetoSigla: "VERTEX", rubrica: "Bolsa de Suporte ao Projeto", valorMensal: 1600, inicio: "2026-07", fim: "2027-06" },
];

// ---------- helpers ----------

export function getProjeto(id: string): Projeto | undefined {
  return PROJETOS.find((p) => p.id === id);
}

export function getMembro(id: string): TeamMember | undefined {
  return MEMBROS.find((m) => m.id === id);
}

export function parseYearMonth(ym: string): { year: number; month: number } {
  const [y, m] = ym.split("-").map(Number);
  return { year: y, month: m };
}

/** Quantidade de meses entre dois "YYYY-MM" (inclusivo dos dois lados). */
export function monthsBetween(start: string, end: string): number {
  const s = parseYearMonth(start);
  const e = parseYearMonth(end);
  return (e.year - s.year) * 12 + (e.month - s.month) + 1;
}

/** Próximo mês como "YYYY-MM" a partir de (year, monthIndex 1-12). */
export function nextMonth(year: number, month: number): { year: number; month: number } {
  if (month === 12) return { year: year + 1, month: 1 };
  return { year, month: month + 1 };
}

export function formatYearMonthLabel(ym: string): string {
  const meses = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  const { year, month } = parseYearMonth(ym);
  return `${meses[month - 1]}/${String(year).slice(-2)}`;
}

export function formatYearMonthLong(ym: string): string {
  const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const { year, month } = parseYearMonth(ym);
  return `${meses[month - 1]} de ${year}`;
}

export function formatBRL(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}
