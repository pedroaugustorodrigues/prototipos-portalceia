/**
 * Notas Fiscais — modelo de dados (mock/derivado).
 *
 * IMPORTANTE: o Portal NÃO emite notas fiscais. A emissão é feita pela
 * FUNAPE/Conecta. Aqui apenas acompanhamos o ciclo de solicitação → emissão →
 * pagamento. Todas as parcelas são geradas automaticamente a partir do
 * contrato assinado; não há cadastro manual.
 *
 * Neste primeiro passo definimos apenas os TIPOS e o cálculo da "Situação NF".
 * A geração das parcelas a partir dos projetos existentes virá no próximo passo.
 */

/** Data "de hoje" da plataforma (mesma âncora usada no Fluxo de Pagamento). */
export const TODAY = new Date("2026-05-15T00:00:00");

/** Etapas do ciclo de vida de uma nota fiscal. */
export type EtapaCiclo =
  | "solicitacao_criada"
  | "aprovacao_coordenador"
  | "aprovacao_funape"
  | "nota_emitida"
  | "nota_enviada"
  | "pagamento_recebido";

export const ETAPAS_CICLO: { id: EtapaCiclo; label: string }[] = [
  { id: "solicitacao_criada", label: "Solicitação criada" },
  { id: "aprovacao_coordenador", label: "Aprovação do coordenador" },
  { id: "aprovacao_funape", label: "Aprovação da FUNAPE" },
  { id: "nota_emitida", label: "Nota emitida" },
  { id: "nota_enviada", label: "Nota enviada" },
  { id: "pagamento_recebido", label: "Pagamento recebido" },
];

/**
 * Situação da NF, derivada automaticamente das datas (tradução da fórmula
 * de planilha usada hoje pela equipe).
 */
export type SituacaoNF =
  | "" // sem dados suficientes
  | "PAGA"
  | "PAGA COM ATRASO"
  | "VENCIDA +60"
  | "VENCIDA +30"
  | "VENCIDA"
  | "VENCE HOJE"
  | "EM DIA";

/** Metadados visuais para cada situação (cor do badge). */
export const SITUACAO_NF_META: Record<
  Exclude<SituacaoNF, "">,
  { label: string; className: string }
> = {
  PAGA: { label: "Paga", className: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  "PAGA COM ATRASO": {
    label: "Paga com atraso",
    className: "bg-teal-50 text-teal-700 ring-teal-200",
  },
  "EM DIA": { label: "Em dia", className: "bg-sky-50 text-sky-700 ring-sky-200" },
  "VENCE HOJE": { label: "Vence hoje", className: "bg-amber-50 text-amber-700 ring-amber-200" },
  VENCIDA: { label: "Vencida", className: "bg-orange-50 text-orange-700 ring-orange-200" },
  "VENCIDA +30": { label: "Vencida +30", className: "bg-red-50 text-red-700 ring-red-200" },
  "VENCIDA +60": { label: "Vencida +60", className: "bg-red-100 text-red-800 ring-red-300" },
};

function diffInDays(a: Date, b: Date): number {
  const MS = 1000 * 60 * 60 * 24;
  return Math.floor((a.getTime() - b.getTime()) / MS);
}

export function formatDate(d: Date | null | undefined): string {
  if (!d) return "—";
  return d.toLocaleDateString("pt-BR");
}

export function formatDateTime(d: Date | null | undefined, hora?: string | null): string {
  if (!d) return "—";
  return `${d.toLocaleDateString("pt-BR")}${hora ? ` às ${hora}` : ""}`;
}

/** Converte uma Date em string "YYYY-MM-DD" para usar em <input type="date">. */
export function toInputDate(d: Date | null | undefined): string {
  if (!d) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Converte string "YYYY-MM-DD" de <input type="date"> em Date local. */
export function fromInputDate(v: string): Date | null {
  if (!v) return null;
  const [y, m, d] = v.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

/**
 * Calcula a Situação da NF a partir das datas do processo.
 *
 * Tradução literal (1:1) da fórmula de planilha usada hoje pela equipe:
 *
 *   =SE(N="";"";                                    N = data da solicitação
 *     SE(R="";"";                                   R = vencimento
 *       SE(S<>"";                                   S = data de pagamento
 *         SE(S>R;"PAGA COM ATRASO";"PAGA");
 *         SE(HOJE()-R>60;"VENCIDA +60";
 *           SE(HOJE()-R>30;"VENCIDA +30";
 *             SE(R<HOJE();"VENCIDA";
 *               SE(R=HOJE();"VENCE HOJE";"EM DIA")))))))
 */
export function computeSituacaoNF(params: {
  dataSolicitacao?: Date | null;
  vencimento?: Date | null;
  dataPagamento?: Date | null;
  hoje?: Date;
}): SituacaoNF {
  const N = params.dataSolicitacao; // data da solicitação
  const R = params.vencimento; // vencimento
  const S = params.dataPagamento; // data de pagamento
  const HOJE = params.hoje ?? TODAY;

  // SE(N="";"")  — sem solicitação, sem situação.
  if (!N) return "";
  // SE(R="";"")  — sem vencimento, sem situação.
  if (!R) return "";

  // SE(S<>"";  SE(S>R;"PAGA COM ATRASO";"PAGA")
  if (S) {
    return S.getTime() > R.getTime() ? "PAGA COM ATRASO" : "PAGA";
  }

  // SE(HOJE()-R>60;"VENCIDA +60"
  if (diffInDays(HOJE, R) > 60) return "VENCIDA +60";
  // SE(HOJE()-R>30;"VENCIDA +30"
  if (diffInDays(HOJE, R) > 30) return "VENCIDA +30";
  // SE(R<HOJE();"VENCIDA"
  if (R.getTime() < HOJE.getTime()) return "VENCIDA";
  // SE(R=HOJE();"VENCE HOJE";"EM DIA")
  if (diffInDays(R, HOJE) === 0) return "VENCE HOJE";
  return "EM DIA";
}

// ---------------------------------------------------------------------------
// Dados de exemplo (mock). Em produção, contratos e parcelas viriam da API.
// ---------------------------------------------------------------------------

export type Fonte = "EMBRAPII" | "EMPRESA" | "SEBRAE";

/** Tipo da nota emitida: NORMAL (serviço) ou PI (Propriedade Intelectual). */
export type TipoNota = "NORMAL" | "PI";

/**
 * Empresa tomadora dentro de um projeto. Cada empresa tem seus próprios dados
 * de emissão (CNPJ, e-mail, fonte) e cronograma de parcelas.
 */
export type EmpresaContrato = {
  empresaId: string;
  empresa: string;
  cnpjTomador: string;
  email: string;
  fonte: Fonte;
  /** Competência da 1ª parcela (YYYY-MM). */
  inicio: string;
  /** Quantidade de parcelas previstas no contrato. */
  parcelas: number;
  /** Valor da nota NORMAL de cada parcela. */
  valorParcela: number;
  /**
   * Valor da nota de PI emitida junto com cada parcela normal.
   * `null` = esta empresa não emite nota de PI.
   */
  valorParcelaPI: number | null;
};

/** Projeto = contrato assinado. Pode ter uma ou mais empresas tomadoras. */
export type Projeto = {
  projetoId: string;
  nomeInterno: string;
  nomeProjeto: string;
  situacaoProjeto: string;
  coordenador: string;
  peia: string;
  /** Centro de custos do projeto (não da empresa). */
  centroCusto: string;
  /** Conta corrente do projeto (vinculada ao centro de custo). */
  contaCorrente: string;
  /** Contrato recém-assinado e a equipe ainda não acessou as notas. */
  novo: boolean;
  empresas: EmpresaContrato[];
};

export const PROJETOS: Projeto[] = [
  {
    projetoId: "p-aurora",
    nomeInterno: "AURORA-SAÚDE",
    nomeProjeto: "Aurora — IA Aplicada à Saúde",
    situacaoProjeto: "Em execução",
    coordenador: "Erika Morais",
    peia: "PEIA-2024.0118",
    centroCusto: "88.324 — EMBRAPII",
    contaCorrente: "1234-5",
    novo: false,
    empresas: [
      {
        empresaId: "aurora-aerovision",
        empresa: "AeroVision Tecnologia S.A.",
        cnpjTomador: "12.345.678/0001-90",
        email: "financeiro@aerovision.com.br",
        fonte: "EMBRAPII",
        inicio: "2026-01",
        parcelas: 12,
        valorParcela: 40000,
        // Emite nota de PI junto com a nota normal.
        valorParcelaPI: 8000,
      },
    ],
  },
  {
    projetoId: "p-helix",
    nomeInterno: "HELIX-DADOS",
    nomeProjeto: "Helix — Plataforma de Dados Públicos",
    situacaoProjeto: "Em execução",
    coordenador: "Marcelo Tinoco",
    peia: "PEIA-2024.0237",
    centroCusto: "88.324 — EMBRAPII",
    contaCorrente: "2345-6",
    novo: false,
    // Projeto com DUAS empresas tomadoras (dados diferentes para cada uma).
    empresas: [
      {
        empresaId: "helix-datagov",
        empresa: "DataGov Soluções Ltda.",
        cnpjTomador: "23.456.789/0001-01",
        email: "contas@datagov.com.br",
        fonte: "EMBRAPII",
        inicio: "2025-11",
        parcelas: 10,
        valorParcela: 32000,
        valorParcelaPI: null,
      },
      {
        empresaId: "helix-civitas",
        empresa: "Civitas Analytics Ltda.",
        cnpjTomador: "67.890.123/0001-45",
        email: "financeiro@civitas.com.br",
        fonte: "EMPRESA",
        inicio: "2026-02",
        parcelas: 8,
        valorParcela: 18000,
        // A segunda empresa também emite nota de PI.
        valorParcelaPI: 4500,
      },
    ],
  },
  {
    projetoId: "p-kairos",
    nomeInterno: "KAIROS-VISÃO",
    nomeProjeto: "Kairós — Visão Computacional",
    situacaoProjeto: "Em execução",
    coordenador: "Beatriz Lemos",
    peia: "PEIA-2025.0042",
    centroCusto: "88.324 — EMBRAPII",
    contaCorrente: "3456-7",
    novo: false,
    empresas: [
      {
        empresaId: "kairos-visioncore",
        empresa: "VisionCore S.A.",
        cnpjTomador: "34.567.890/0001-12",
        email: "financeiro@visioncore.com.br",
        fonte: "EMBRAPII",
        inicio: "2026-03",
        parcelas: 8,
        valorParcela: 28000,
        valorParcelaPI: null,
      },
    ],
  },
  {
    projetoId: "p-nimbus",
    nomeInterno: "NIMBUS-CLIMA",
    nomeProjeto: "Nimbus — Climatologia Urbana",
    situacaoProjeto: "Contrato recém-assinado",
    coordenador: "André Fontes",
    peia: "PEIA-2025.0156",
    centroCusto: "88.326 — EMPRESA",
    contaCorrente: "4567-8",
    // Contrato assinado e nunca acessado → aparece como NOVO.
    novo: true,
    empresas: [
      {
        empresaId: "nimbus-climatech",
        empresa: "ClimaTech Ltda.",
        cnpjTomador: "45.678.901/0001-23",
        email: "financeiro@climatech.com.br",
        fonte: "EMPRESA",
        inicio: "2026-05",
        parcelas: 6,
        valorParcela: 25000,
        valorParcelaPI: 5000,
      },
    ],
  },
  {
    projetoId: "p-vertex",
    nomeInterno: "VERTEX-ROBÓTICA",
    nomeProjeto: "Vertex — Robótica Educacional",
    situacaoProjeto: "Em execução",
    coordenador: "Cláudia Rocha",
    peia: "PEIA-2024.0389",
    centroCusto: "883257 — SEBRAE",
    contaCorrente: "5678-9",
    novo: false,
    empresas: [
      {
        empresaId: "vertex-edurobo",
        empresa: "EduRobô S.A.",
        cnpjTomador: "56.789.012/0001-34",
        email: "financeiro@edurobo.com.br",
        fonte: "SEBRAE",
        inicio: "2025-08",
        parcelas: 12,
        valorParcela: 35000,
        valorParcelaPI: null,
      },
    ],
  },
];

/** Etapa da timeline com data/hora e situação. */
export type EtapaTimeline = {
  etapa: EtapaCiclo;
  label: string;
  data: Date | null;
  hora: string | null;
  situacao: "concluida" | "pendente" | "falha";
};

/** Estágio macro da nota (para KPIs e agrupamentos). */
export type EstagioNota =
  | "prevista" // ainda não chegou o mês de solicitação
  | "a_solicitar" // próxima solicitação automática / reprocessamento
  | "processando" // solicitada, em aprovação/emissão
  | "emitida" // nota emitida/enviada, aguardando pagamento
  | "paga"; // pagamento recebido

/** Uma parcela gera uma ou duas notas (NORMAL e/ou PI) ao longo do ciclo. */
export type NotaFiscal = {
  id: string;
  projetoId: string;
  empresaId: string;
  situacaoProjeto: string;
  centroCusto: string;
  contaCorrente: string;
  peia: string;
  nomeInterno: string;
  nomeProjeto: string;
  coordenador: string;
  empresa: string;
  cnpjTomador: string;
  email: string;
  fonte: Fonte;
  tipoNota: TipoNota;
  parcela: number;
  totalParcelas: number;
  /** Competência / mês para envio (YYYY-MM). */
  mesEnvio: string;
  vlrPtr: number;
  dataSolicitacao: Date | null;
  numeroSolicitacao: string | null;
  dataAssinaturaCoordenador: Date | null;
  dataAssinaturaFunape: Date | null;
  dataEmissao: Date | null;
  numeroNF: string | null;
  valorNF: number | null;
  vencimento: Date | null;
  dataPagamento: Date | null;
  valorPago: number | null;
  /** Comentário livre da equipe para a parcela (opcional). */
  comentario: string;
  /** Descrição como aparece no Conecta (diferencia PI de normal). */
  descricaoConecta: string;
  observacao: string;
  descricaoEmissao: string;
  falhaIntegracao: boolean;
  estagio: EstagioNota;
  situacao: SituacaoNF;
  timeline: EtapaTimeline[];
};

// Helpers internos de data/competência.
function parseYM(ym: string): { year: number; month: number } {
  const [y, m] = ym.split("-").map(Number);
  return { year: y, month: m };
}
function monthIndex(ym: string): number {
  const { year, month } = parseYM(ym);
  return year * 12 + (month - 1);
}
function addMonths(ym: string, n: number): string {
  const total = monthIndex(ym) + n;
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, "0")}`;
}
function dateFrom(ym: string, day: number): Date {
  const { year, month } = parseYM(ym);
  return new Date(year, month - 1, day);
}
function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

const HORAS = ["09:12", "10:45", "14:20", "16:03", "11:38", "15:50"];

function buildTimeline(n: {
  dataSolicitacao: Date | null;
  dataAssinaturaCoordenador: Date | null;
  dataAssinaturaFunape: Date | null;
  dataEmissao: Date | null;
  dataEnvio: Date | null;
  dataPagamento: Date | null;
  falhaIntegracao: boolean;
}): EtapaTimeline[] {
  const datas = [
    n.dataSolicitacao,
    n.dataAssinaturaCoordenador,
    n.dataAssinaturaFunape,
    n.dataEmissao,
    n.dataEnvio,
    n.dataPagamento,
  ];
  return ETAPAS_CICLO.map((e, i) => {
    const data = datas[i];
    let situacao: EtapaTimeline["situacao"] = data ? "concluida" : "pendente";
    // Falha na integração trava a próxima etapa após a solicitação.
    if (n.falhaIntegracao && i === 1 && !data) situacao = "falha";
    return {
      etapa: e.id,
      label: e.label,
      data: data ?? null,
      hora: data ? HORAS[i] : null,
      situacao,
    };
  });
}

function generateNotas(): NotaFiscal[] {
  const currentIdx = monthIndex("2026-05"); // âncora "hoje" (TODAY)
  const out: NotaFiscal[] = [];

  PROJETOS.forEach((proj, pi) => {
    proj.empresas.forEach((c, ei) => {
      // Tipos de nota emitidos por esta empresa (sempre NORMAL; PI se houver).
      const tipos: TipoNota[] = c.valorParcelaPI != null ? ["NORMAL", "PI"] : ["NORMAL"];

      for (let p = 1; p <= c.parcelas; p++) {
        const mesEnvio = addMonths(c.inicio, p - 1);
        const diff = monthIndex(mesEnvio) - currentIdx;

        tipos.forEach((tipo) => {
          const valorBase = tipo === "PI" ? (c.valorParcelaPI as number) : c.valorParcela;

          let dataSolicitacao: Date | null = null;
          let dataAssinaturaCoordenador: Date | null = null;
          let dataAssinaturaFunape: Date | null = null;
          let dataEmissao: Date | null = null;
          let dataEnvio: Date | null = null;
          let numeroNF: string | null = null;
          let valorNF: number | null = null;
          let vencimento: Date | null = null;
          let dataPagamento: Date | null = null;
          let valorPago: number | null = null;
          let observacao = "";
          const falhaIntegracao = false;
          let estagio: EstagioNota = "prevista";

          const sufixo = tipo === "PI" ? "P" : "";
          const nf = `${mesEnvio.slice(0, 4)}${String(pi + 1)}${String(ei + 1)}${String(p).padStart(3, "0")}${sufixo}`;
          const sol = `SOL-${mesEnvio.slice(0, 4)}-${String(pi + 1)}${String(ei + 1)}${String(p).padStart(3, "0")}`;

          if (diff >= 2) {
            // Parcela futura ainda não elegível.
            estagio = "prevista";
            observacao = "Prevista no cronograma do contrato.";
          } else if (diff === 1) {
            // Próxima solicitação automática.
            estagio = "a_solicitar";
            observacao = "Solicitação automática agendada para a competência.";
          } else if (diff === 0) {
            // Competência atual — solicitada e em processamento.
            dataSolicitacao = dateFrom(mesEnvio, 2);
            dataAssinaturaCoordenador = dateFrom(mesEnvio, 4);
            if (proj.projetoId === "p-kairos") {
              // Em processamento: solicitada e assinada pelo coordenador,
              // aguardando aprovação da FUNAPE (ainda sem emissão).
              estagio = "processando";
              observacao = "Aguardando aprovação da FUNAPE.";
            } else {
              dataAssinaturaFunape = dateFrom(mesEnvio, 6);
              dataEmissao = dateFrom(mesEnvio, 8);
              dataEnvio = dateFrom(mesEnvio, 9);
              numeroNF = nf;
              valorNF = valorBase;
              vencimento = dateFrom(mesEnvio, 25);
              estagio = "emitida";
              observacao = "Nota emitida. Aguardando lançamento do pagamento.";
            }
          } else {
            // Competências passadas — processadas.
            dataSolicitacao = dateFrom(mesEnvio, 2);
            dataAssinaturaCoordenador = dateFrom(mesEnvio, 4);
            dataAssinaturaFunape = dateFrom(mesEnvio, 6);
            dataEmissao = dateFrom(mesEnvio, 8);
            dataEnvio = dateFrom(mesEnvio, 9);
            numeroNF = nf;
            valorNF = valorBase;
            vencimento = dateFrom(mesEnvio, 20);

            if (p % 5 === 0) {
              // Não paga — vencida (aguardando lançamento manual).
              dataPagamento = null;
              valorPago = null;
              estagio = "emitida";
              observacao = "Cobrança enviada ao tomador. Aguardando lançamento do pagamento.";
            } else if (p % 4 === 0) {
              // Paga com atraso.
              dataPagamento = addDays(vencimento, 5);
              valorPago = valorBase;
              estagio = "paga";
              observacao = "Pagamento recebido com atraso.";
            } else {
              // Paga em dia.
              dataPagamento = dateFrom(mesEnvio, 18);
              valorPago = valorBase;
              estagio = "paga";
              observacao = "Pagamento recebido.";
            }
          }

          const situacao = computeSituacaoNF({ dataSolicitacao, vencimento, dataPagamento });

          const descricaoConecta =
            tipo === "PI"
              ? `NOTA DE PI — Parcela ${p}/${c.parcelas} — ${proj.nomeProjeto}. Repasse de Propriedade Intelectual (${proj.peia}).`
              : `Parcela ${p}/${c.parcelas} — ${proj.nomeProjeto} — competência ${mesEnvio}. Prestação de serviços de PD&I (${proj.peia}).`;

          out.push({
            id: `nf-${c.empresaId}-${p}-${tipo.toLowerCase()}`,
            projetoId: proj.projetoId,
            empresaId: c.empresaId,
            situacaoProjeto: proj.situacaoProjeto,
            centroCusto: proj.centroCusto,
            contaCorrente: proj.contaCorrente,
            peia: proj.peia,
            nomeInterno: proj.nomeInterno,
            nomeProjeto: proj.nomeProjeto,
            coordenador: proj.coordenador,
            empresa: c.empresa,
            cnpjTomador: c.cnpjTomador,
            email: c.email,
            fonte: c.fonte,
            tipoNota: tipo,
            parcela: p,
            totalParcelas: c.parcelas,
            mesEnvio,
            vlrPtr: valorBase,
            dataSolicitacao,
            numeroSolicitacao: dataSolicitacao ? sol : null,
            dataAssinaturaCoordenador,
            dataAssinaturaFunape,
            dataEmissao,
            numeroNF,
            valorNF,
            vencimento,
            dataPagamento,
            valorPago,
            comentario: "",
            descricaoConecta,
            observacao,
            descricaoEmissao: descricaoConecta,
            falhaIntegracao,
            estagio,
            situacao,
            timeline: buildTimeline({
              dataSolicitacao,
              dataAssinaturaCoordenador,
              dataAssinaturaFunape,
              dataEmissao,
              dataEnvio,
              dataPagamento,
              falhaIntegracao,
            }),
          });
        });
      }
    });
  });

  return out;
}

/** Todas as notas/parcelas geradas a partir dos contratos (mock). */
export const NOTAS: NotaFiscal[] = generateNotas();

/**
 * Aplica o lançamento manual de pagamento em uma nota, recalculando a situação
 * (PAGA / PAGA COM ATRASO) e o estágio automaticamente. Retorna uma nova nota.
 */
export function registrarPagamentoNota(
  nota: NotaFiscal,
  dataPagamento: Date | null,
  valorPago: number | null,
): NotaFiscal {
  const situacao = computeSituacaoNF({
    dataSolicitacao: nota.dataSolicitacao,
    vencimento: nota.vencimento,
    dataPagamento,
  });
  const estagio: EstagioNota = dataPagamento ? "paga" : nota.dataEmissao ? "emitida" : nota.estagio;
  return {
    ...nota,
    dataPagamento,
    valorPago,
    situacao,
    estagio,
    observacao: dataPagamento ? "Pagamento lançado manualmente." : nota.observacao,
    timeline: buildTimeline({
      dataSolicitacao: nota.dataSolicitacao,
      dataAssinaturaCoordenador: nota.dataAssinaturaCoordenador,
      dataAssinaturaFunape: nota.dataAssinaturaFunape,
      dataEmissao: nota.dataEmissao,
      dataEnvio: nota.dataEmissao, // envio acompanha a emissão no mock
      dataPagamento,
      falhaIntegracao: nota.falhaIntegracao,
    }),
  };
}

/** Resumo (KPIs) a partir de uma lista de notas. */
export function resumoNotas(notas: NotaFiscal[]) {
  return {
    previstas: notas.length,
    aSolicitar: notas.filter((n) => n.estagio === "a_solicitar").length,
    processando: notas.filter((n) => n.estagio === "processando").length,
    emitidas: notas.filter((n) => n.estagio === "emitida").length,
    pagas: notas.filter((n) => n.estagio === "paga").length,
    vencidas: notas.filter((n) => n.situacao.startsWith("VENCIDA")).length,
  };
}

// ---------------------------------------------------------------------------
// Status da nota: fonte única de verdade = a fórmula da planilha
// (computeSituacaoNF → campo `situacao`). As etiquetas visuais ficam em
// `statusMeta` na tela de Notas Fiscais, cobrindo exatamente os valores da
// fórmula: PAGA · PAGA COM ATRASO · VENCIDA +60/+30 · VENCIDA · VENCE HOJE ·
// EM DIA (e "" / A emitir, quando a fórmula retorna vazio).
// ---------------------------------------------------------------------------

/** Quantas etapas do ciclo já foram concluídas (0–6). */
export function etapasConcluidas(n: NotaFiscal): number {
  return n.timeline.filter((e) => e.situacao === "concluida").length;
}
