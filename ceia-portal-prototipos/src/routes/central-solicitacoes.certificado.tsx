import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PROJECTS } from "@/lib/ptr-data";
import { useActiveProfile } from "@/lib/profile";
import {
  ChevronLeft,
  Award,
  BriefcaseBusiness,
  Clock,
  CheckCircle2,
  FileSignature,
  CalendarClock,
  FolderKanban,
  CalendarRange,
  Clock3,
  History,
  Lock,
  Sparkles,
  Inbox,
  Eye,
  Download,
  Send,
  UserCircle2,
  Building2,
  Hourglass,
  AlertCircle,
  Info,
  Plus,
  ListFilter,
  Check,
  FileText,
  FileCheck2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import ufgLogo from "@/assets/UFG.png";

export const Route = createFileRoute("/central-solicitacoes/certificado")({
  head: () => ({
    meta: [
      { title: "Declarações de Participação — Portal CEIA" },
      { name: "description", content: "Assine em lote as declarações de participação dos bolsistas e voluntários dos seus projetos." },
    ],
  }),
  component: CertificadoPage,
});

// =====================================================================
// Tipos e mocks
// =====================================================================
type CertStatus = "aguardando_lote" | "pronto_lote" | "assinado";

type CertItem = {
  id: string;
  participantName: string;
  participantRole: "Bolsista" | "Voluntário";
  projectId: string;
  projectName: string;
  period: string;
  hours: number;
  requestedAt: string;
  status: CertStatus;
  signedAt?: string;
};

const TODAY = "10/05/2026";
const THIS_FRIDAY = "15/05/2026";
const LAST_FRIDAY = "08/05/2026";

const READY_BATCH_ENVELOPE_ID = "ENV-2026-W19";
const READY_BATCH_ZAPSIGN_URL = "https://app.zapsign.com.br/verificar/doc-mock";

const MOCK_CERT_ITEMS: CertItem[] = [
  { id: "DEC-2026-018", participantName: "Luca Andrade", participantRole: "Bolsista", projectId: "p2", projectName: "IA para Detecção de Plágio Acadêmico", period: "01/02/2026 — 30/04/2026", hours: 240, requestedAt: "04/05/2026", status: "pronto_lote" },
  { id: "DEC-2026-019", participantName: "Beatriz Rocha", participantRole: "Voluntário", projectId: "p2", projectName: "IA para Detecção de Plágio Acadêmico", period: "15/01/2026 — 30/04/2026", hours: 180, requestedAt: "05/05/2026", status: "pronto_lote" },
  { id: "DEC-2026-020", participantName: "Heitor Silva", participantRole: "Bolsista", projectId: "p2", projectName: "IA para Detecção de Plágio Acadêmico", period: "01/03/2026 — 30/04/2026", hours: 160, requestedAt: "06/05/2026", status: "pronto_lote" },
  { id: "DEC-2026-021", participantName: "Mariana Oliveira", participantRole: "Bolsista", projectId: "p5", projectName: "Análise de Imagens Médicas com Deep Learning", period: "01/06/2024 — 31/12/2024", hours: 1120, requestedAt: "07/05/2026", status: "pronto_lote" },
  { id: "DEC-2026-022", participantName: "Rafael Souza", participantRole: "Bolsista", projectId: "p2", projectName: "IA para Detecção de Plágio Acadêmico", period: "01/03/2026 — 30/04/2026", hours: 160, requestedAt: "09/05/2026", status: "aguardando_lote" },
  { id: "DEC-2026-023", participantName: "Camila Ferreira", participantRole: "Voluntário", projectId: "p2", projectName: "IA para Detecção de Plágio Acadêmico", period: "01/02/2026 — 30/04/2026", hours: 200, requestedAt: "10/05/2026", status: "aguardando_lote" },
  { id: "DEC-2026-011", participantName: "Pedro Henrique Lima", participantRole: "Bolsista", projectId: "p2", projectName: "IA para Detecção de Plágio Acadêmico", period: "01/06/2025 — 31/12/2025", hours: 720, requestedAt: "27/04/2026", status: "assinado", signedAt: LAST_FRIDAY },
  { id: "DEC-2026-012", participantName: "Sofia Mendes", participantRole: "Bolsista", projectId: "p2", projectName: "IA para Detecção de Plágio Acadêmico", period: "01/06/2025 — 31/12/2025", hours: 720, requestedAt: "28/04/2026", status: "assinado", signedAt: LAST_FRIDAY },
  { id: "DEC-2026-013", participantName: "André Cardoso", participantRole: "Voluntário", projectId: "p5", projectName: "Análise de Imagens Médicas com Deep Learning", period: "01/01/2024 — 31/12/2024", hours: 960, requestedAt: "27/04/2026", status: "assinado", signedAt: LAST_FRIDAY },
];

function parseBR(d: string): number {
  const [dd, mm, yyyy] = d.split("/").map((x) => parseInt(x, 10));
  if (!dd || !mm || !yyyy) return 0;
  return new Date(yyyy, mm - 1, dd).getTime();
}
function daysBetween(a: string, b: string): number {
  return Math.ceil((parseBR(b) - parseBR(a)) / (1000 * 60 * 60 * 24));
}
function initialsOf(name: string): string {
  return name.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0]?.toUpperCase() ?? "").join("");
}

// Utilitários para o template institucional (certidão parcial).
const MESES_PT = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];
const UNIDADES = ["", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove"];
const DEZ_A_DEZENOVE = ["dez", "onze", "doze", "treze", "catorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"];
const DEZENAS = ["", "", "vinte", "trinta"];

function numeroPorExtenso(n: number): string {
  if (n < 10) return UNIDADES[n] || "zero";
  if (n < 20) return DEZ_A_DEZENOVE[n - 10];
  const d = Math.floor(n / 10);
  const u = n % 10;
  if (u === 0) return DEZENAS[d];
  return `${DEZENAS[d]} e ${UNIDADES[u]}`;
}

function anoPorExtenso(ano: number): string {
  // Cobre 2000–2099 — suficiente para o contexto do sistema.
  const milhar = "dois mil";
  const resto = ano - 2000;
  if (resto === 0) return milhar;
  return `${milhar} e ${numeroPorExtenso(resto)}`;
}

function dataBRPorExtenso(dataBR: string): { dia: string; mes: string; ano: string } | null {
  const [dd, mm, yyyy] = dataBR.split("/").map((x) => parseInt(x, 10));
  if (!dd || !mm || !yyyy) return null;
  return {
    dia: numeroPorExtenso(dd),
    mes: MESES_PT[mm - 1] ?? "",
    ano: anoPorExtenso(yyyy),
  };
}

// =====================================================================
// Pesquisador — participações e mocks
// =====================================================================
type ResearcherRole = "Bolsista" | "Voluntário";
/** Estado de um pedido específico (não do projeto como um todo). */
type ResearcherRequestStatus = "em_assinatura" | "disponivel";

/**
 * Templates de certidão disponíveis:
 * - parcial: bolsista ainda ativo no projeto;
 * - total:   participação encerrada (projeto finalizado ou saída do bolsista).
 */
type CertTemplate = "parcial" | "total";

function templateOf(p: { finished: boolean }): CertTemplate {
  return p.finished ? "total" : "parcial";
}

/**
 * Pedido de certidão — cada projeto pode ter vários ao longo do tempo. Cada pedido
 * "congela" o total de horas acumuladas no momento da solicitação e tem o
 * próprio ciclo de vida (em_assinatura → disponivel).
 */
type CertRequest = {
  id: string;
  template: CertTemplate;
  status: ResearcherRequestStatus;
  /** Mês de referência (horas acumuladas até este mês). */
  refMonthYear: string;
  /** Horas certificadas neste pedido (parcial = incremento desde a última certidão; total = total geral). */
  hoursAtRequest: number;
  /** Data em que o pesquisador solicitou (formato BR). */
  requestedAt: string;
  /** Data em que a coordenação assinou (formato BR), quando disponível. */
  issuedAt?: string;
  /** Mês/ano inicial coberto por esta certidão (parcial: começo do projeto OU referência da última parcial). */
  fromMonthYear?: string;
};

type ResearcherParticipation = {
  /** Id estável da participação (projeto + período). */
  id: string;
  projectId: string;
  projectName: string;
  client: string;
  coordinator: string;
  /** Tratamento acadêmico do coordenador (ex.: "Prof. Dr.", "Profa. Dra."). */
  coordinatorTitle: string;
  role: ResearcherRole;
  period: string;
  hours: number;
  /** Carga horária mensal (em horas) prevista no plano de trabalho. */
  monthlyHours: number;
  /** Início da participação no formato curto pt-BR (ex.: "dez-25"). */
  startMonthYear: string;
  /** Previsão de término da participação no formato curto pt-BR (ex.: "set-26"). */
  expectedEndMonthYear: string;
  /** Indica se a participação já foi encerrada (pode solicitar a declaração final). */
  finished: boolean;
  /** Pedidos já feitos para este projeto (mock inicial). */
  initialRequests?: CertRequest[];
};

const LUCAS_PARTICIPATIONS: ResearcherParticipation[] = [
  {
    id: "part-lo-p2",
    projectId: "p2",
    projectName: "IA para Detecção de Plágio Acadêmico",
    client: "EduTrust Soluções Educacionais",
    coordinator: "Renata Braga",
    coordinatorTitle: "Profa. Dra.",
    role: "Bolsista",
    period: "01/03/2026 — em andamento",
    hours: 320,
    monthlyHours: 40,
    startMonthYear: "mar-26",
    expectedEndMonthYear: "fev-27",
    finished: false,
  },
  {
    id: "part-lo-p3",
    projectId: "p3",
    projectName: "Plataforma Wave Testing",
    client: "WaveCorp Engenharia",
    coordinator: "Juliana Costa",
    coordinatorTitle: "Profa. Dra.",
    role: "Voluntário",
    period: "15/02/2025 — em andamento",
    hours: 580,
    monthlyHours: 30,
    startMonthYear: "fev-25",
    expectedEndMonthYear: "jan-27",
    finished: false,
    initialRequests: [
      {
        id: "DEC-2025-088",
        template: "parcial",
        status: "disponivel",
        refMonthYear: "out-25",
        hoursAtRequest: 280,
        requestedAt: "03/11/2025",
        issuedAt: "10/11/2025",
      },
    ],
  },
  {
    id: "part-lo-p1",
    projectId: "p1",
    projectName: "Sistema de Navegação Autônoma para VANTs",
    client: "AeroVision Tecnologia S.A.",
    coordinator: "Erika Morais",
    coordinatorTitle: "Profa. Dra.",
    role: "Bolsista",
    period: "01/04/2024 — 28/02/2026",
    hours: 1840,
    monthlyHours: 40,
    startMonthYear: "abr-24",
    expectedEndMonthYear: "fev-26",
    finished: true,
    initialRequests: [
      {
        id: "DEC-2026-031",
        template: "total",
        status: "em_assinatura",
        refMonthYear: "fev-26",
        hoursAtRequest: 1840,
        requestedAt: "05/05/2026",
      },
    ],
  },
  {
    id: "part-lo-p5",
    projectId: "p5",
    projectName: "Análise de Imagens Médicas com Deep Learning",
    client: "MedVision Diagnósticos",
    coordinator: "Renata Braga",
    coordinatorTitle: "Profa. Dra.",
    role: "Bolsista",
    period: "01/02/2024 — 31/12/2024",
    hours: 1320,
    monthlyHours: 40,
    startMonthYear: "fev-24",
    expectedEndMonthYear: "dez-24",
    finished: true,
    initialRequests: [
      {
        id: "DEC-2025-007",
        template: "total",
        status: "disponivel",
        refMonthYear: "dez-24",
        hoursAtRequest: 1320,
        requestedAt: "05/01/2025",
        issuedAt: "10/01/2025",
      },
    ],
  },
];

// =====================================================================
// Helpers de pedido — agnósticos ao componente
// =====================================================================
const MESES_CURTOS_PT = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
function shortMonthYearOf(dateBR: string): string {
  const [, mm, yyyy] = dateBR.split("/").map((x) => parseInt(x, 10));
  if (!mm || !yyyy) return "";
  return `${MESES_CURTOS_PT[mm - 1] ?? ""}-${String(yyyy).slice(-2)}`;
}
function hasInFlight(reqs: CertRequest[]): boolean {
  return reqs.some((r) => r.status === "em_assinatura");
}
function hasDisponivelTotal(reqs: CertRequest[]): boolean {
  return reqs.some((r) => r.status === "disponivel" && r.template === "total");
}
function canRequestNew(p: ResearcherParticipation, reqs: CertRequest[]): boolean {
  if (hasInFlight(reqs)) return false;
  // total só pode ser pedida uma vez por participação encerrada;
  // parcial pode ser pedida sempre que não houver pedido em voo.
  if (templateOf(p) === "total" && hasDisponivelTotal(reqs)) return false;
  return true;
}

function CertificadoPage() {
  const profile = useActiveProfile();
  if (profile.id === "pesquisador") return <ResearcherCertificadoPage />;
  return <CoordCertificadoPage />;
}

function CoordCertificadoPage() {
  const profile = useActiveProfile();
  const [items] = useState<CertItem[]>(MOCK_CERT_ITEMS);
  const [tab, setTab] = useState<"assinaturas" | "historico">("assinaturas");
  const [previewItem, setPreviewItem] = useState<CertItem | null>(null);

  const myProjectIds = useMemo(
    () => PROJECTS.filter((p) => p.role === "Coordenador" && p.coordinator === profile.nome).map((p) => p.id),
    [profile.nome],
  );

  const mine = useMemo(() => items.filter((it) => myProjectIds.includes(it.projectId)), [items, myProjectIds]);
  const readyBatch = useMemo(() => mine.filter((it) => it.status === "pronto_lote"), [mine]);
  const nextBatch = useMemo(() => mine.filter((it) => it.status === "aguardando_lote"), [mine]);
  const signed = useMemo(() => mine.filter((it) => it.status === "assinado"), [mine]);
  const daysToFriday = daysBetween(TODAY, THIS_FRIDAY);

  return (
    <div className="p-6 md:p-10 w-full">
      <Link to="/central-solicitacoes" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground/80 -mt-2 mb-6">
        <ChevronLeft className="size-3" /> Voltar para central de solicitações
      </Link>

      <div className="mb-6">
        <div className="text-xs uppercase tracking-wider text-primary font-semibold">central de solicitações</div>
        <h1 className="text-3xl font-bold tracking-tight mt-1">Certificado de Participação em Projetos</h1>
      </div>

      <div className="grid sm:grid-cols-3 gap-3 mb-6">
        <StatCard
          icon={<FileSignature className="size-4" />}
          label="Lotes prontos para assinar"
          value={readyBatch.length > 0 ? 1 : 0}
          tone="info"
        />
        <StatCard
          icon={<Clock className="size-4" />}
          label={`${daysToFriday === 1 ? "dia" : "dias"} para liberar o próximo lote`}
          value={daysToFriday}
          tone="info"
        />
        <StatCard
          icon={<CheckCircle2 className="size-4" />}
          label="Certificados gerados"
          value={mine.length}
          tone="info"
        />
      </div>

      <div className="w-full max-w-full">
        <div className="border-b mb-6 flex gap-1">
          <TabButton active={tab === "assinaturas"} onClick={() => setTab("assinaturas")} icon={<FileSignature className="size-4" />}>
            Assinaturas
          </TabButton>
          <TabButton active={tab === "historico"} onClick={() => setTab("historico")} icon={<Inbox className="size-4" />}>
            Histórico
            {signed.length > 0 && (
              <span className="ml-1 text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded font-semibold">{signed.length}</span>
            )}
          </TabButton>
        </div>

        {tab === "assinaturas" ? (
          <>
            <div className="rounded-xl border bg-card p-4 flex items-start gap-3 mb-5">
              <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Award className="size-4" />
              </div>
              <div className="text-sm">
                <div className="font-semibold text-foreground">Declarações de Participação</div>
                <p className="mt-1 text-muted-foreground leading-relaxed">
                  Os pedidos da semana são agrupados em um único envelope no ZapSign, liberado para assinatura <strong>toda sexta-feira</strong>.
                </p>
              </div>
            </div>

            <section className="rounded-xl border border-emerald-200/70 bg-gradient-to-br from-emerald-50/80 via-white to-white mb-6 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-emerald-200/70 bg-gradient-to-r from-emerald-100/90 via-emerald-50/80 to-white flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-10 rounded-lg border bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center justify-center shrink-0 relative">
                    <FileSignature className="size-5" />
                    {readyBatch.length > 0 && (
                      <span className="absolute -top-1 -right-1 flex size-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
                        <span className="relative inline-flex rounded-full size-2.5 bg-current" />
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-base font-semibold text-foreground leading-tight">Lote Pronto</h2>
                      <span className="inline-flex items-center gap-1 rounded-full bg-white text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                        <CheckCircle2 className="size-3" /> Liberado
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Fechado em <span className="tabular-nums font-medium text-foreground">{LAST_FRIDAY}</span> · {readyBatch.length} {readyBatch.length === 1 ? "declaração" : "declarações"}
                    </p>
                  </div>
                </div>
                {readyBatch.length > 0 && (
                  <a
                    href={`mailto:${profile.email}?subject=${encodeURIComponent(`Assinatura do envelope ${READY_BATCH_ENVELOPE_ID} — ZapSign`)}&body=${encodeURIComponent(`Olá,\n\nO envelope ${READY_BATCH_ENVELOPE_ID} com ${readyBatch.length} declaração(ões) de participação está disponível para assinatura no ZapSign.\n\nAcesse: ${READY_BATCH_ZAPSIGN_URL}\n\nAtenciosamente.`)}`}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:bg-primary/90 shadow-sm"
                  >
                    <FileSignature className="size-4" /> Assinar lote
                  </a>
                )}
              </div>

              <div className="p-6 bg-white/70">
                {readyBatch.length === 0 ? (
                  <EmptyState icon={<Sparkles className="size-5" />} title="Nenhum lote pendente" message="Quando novos pedidos forem feitos, eles aparecerão aqui no fechamento da próxima sexta-feira." />
                ) : (
                  <ul className="divide-y rounded-xl border bg-white overflow-hidden shadow-[0_1px_0_rgba(0,0,0,0.02)]">
                    {readyBatch.map((it) => (
                      <CertRow key={it.id} item={it} action={
                        <button
                          onClick={() => setPreviewItem(it)}
                          title="Visualizar"
                          aria-label={`Visualizar declaração ${it.id}`}
                          className="inline-flex items-center justify-center size-10 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                        >
                          <Eye className="size-4" />
                        </button>
                      } />
                    ))}
                  </ul>
                )}
              </div>
            </section>

            <section className="rounded-xl border border-amber-200/70 bg-gradient-to-br from-amber-50/90 via-white to-white mb-6 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-amber-200/70 bg-gradient-to-r from-amber-100/90 via-amber-50/80 to-white flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-10 rounded-lg border bg-amber-50 text-amber-700 border-amber-200 flex items-center justify-center shrink-0">
                    <CalendarClock className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-base font-semibold text-foreground leading-tight">Próximo Lote</h2>
                      <span className="inline-flex items-center gap-1 rounded-full bg-white text-amber-800 border border-amber-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                        <Lock className="size-3" /> Bloqueado
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      <span className="font-medium text-foreground tabular-nums">
                        {daysToFriday} dia{daysToFriday === 1 ? "" : "s"} restante{daysToFriday === 1 ? "" : "s"}
                      </span>{" "}
                      · {nextBatch.length} {nextBatch.length === 1 ? "pedido recebido" : "pedidos recebidos"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white/70">
                {nextBatch.length === 0 ? (
                  <EmptyState icon={<Clock className="size-5" />} title="Nenhum pedido recebido ainda" message="Quando algum bolsista solicitar a declaração, o pedido entra automaticamente neste lote." />
                ) : (
                  <ul className="divide-y rounded-xl border bg-white overflow-hidden shadow-[0_1px_0_rgba(0,0,0,0.02)]">
                    {nextBatch.map((it) => (
                      <CertRow key={it.id} item={it} action={
                        <button
                          onClick={() => setPreviewItem(it)}
                          title="Visualizar"
                          aria-label={`Visualizar declaração ${it.id}`}
                          className="inline-flex items-center justify-center size-10 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                        >
                          <Eye className="size-4" />
                        </button>
                      } />
                    ))}
                  </ul>
                )}
              </div>
            </section>
          </>
        ) : (
          <>
            {signed.length === 0 ? (
              <section className="rounded-xl border bg-white p-6 mb-6 shadow-sm">
                <EmptyState icon={<History className="size-5" />} title="Nenhum certificado assinado ainda" message="Os certificados assinados por você aparecerão aqui." />
              </section>
            ) : (
              <section className="rounded-xl border border-sky-200/70 bg-gradient-to-br from-sky-50/80 via-white to-white mb-6 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-sky-200/70 bg-gradient-to-r from-sky-100/90 via-sky-50/80 to-white flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-10 rounded-lg border bg-sky-50 text-sky-700 border-sky-200 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-base font-semibold text-foreground leading-tight">Certificados Assinados</h2>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {signed.length} {signed.length === 1 ? "certificado assinado" : "certificados assinados"} por você
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-white/70">
                  <ul className="divide-y rounded-xl border bg-white overflow-hidden shadow-[0_1px_0_rgba(0,0,0,0.02)]">
                    {signed
                      .slice()
                      .sort((a, b) => parseBR(b.signedAt ?? b.requestedAt) - parseBR(a.signedAt ?? a.requestedAt))
                      .map((it) => (
                        <CertRow key={it.id} item={it} action={
                          <button
                            onClick={() => setPreviewItem(it)}
                            title="Visualizar"
                            aria-label={`Visualizar declaração ${it.id}`}
                            className="inline-flex items-center justify-center size-10 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                          >
                            <Eye className="size-4" />
                          </button>
                        } />
                      ))}
                  </ul>
                </div>
              </section>
            )}
          </>
        )}
      </div>

      <Dialog open={!!previewItem} onOpenChange={(o) => !o && setPreviewItem(null)}>
        <DialogContent className="max-w-3xl p-0 gap-0 max-h-[92vh] overflow-hidden sm:rounded-2xl [&>button.absolute]:hidden">
          {previewItem && (() => {
            const signed = previewItem.status === "assinado";
            const dateLabel = previewItem.signedAt ?? TODAY;
            return (
              <>
                <div className="flex items-center justify-between gap-4 px-6 py-4 border-b bg-muted/30">
                  <DialogHeader className="min-w-0 space-y-0 text-left">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn(
                        "size-9 rounded-lg text-white flex items-center justify-center shrink-0",
                        signed ? "bg-[color:var(--status-approved-fg)]" : "bg-sky-600"
                      )}>
                        {signed ? <CheckCircle2 className="size-5" /> : <FileSignature className="size-5" />}
                      </div>
                      <div className="min-w-0">
                        <DialogDescription className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                          {signed ? "Certificado assinado via ZapSign" : "Certificado para assinatura via ZapSign"}
                        </DialogDescription>
                        <DialogTitle className="text-base font-semibold truncate">
                          Certidão de Participação
                        </DialogTitle>
                      </div>
                    </div>
                  </DialogHeader>
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-accent"
                      aria-label="Baixar cópia"
                      title="Baixar cópia"
                    >
                      <Download className="size-5" />
                    </button>
                    <DialogClose asChild>
                      <button
                        className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-accent"
                        aria-label="Fechar"
                        title="Fechar"
                      >
                        <X className="size-5" />
                      </button>
                    </DialogClose>
                  </div>
                </div>

                <div className="overflow-auto p-6 max-h-[calc(92vh-74px)]">
                  <div className="relative max-w-3xl mx-auto rounded-lg border bg-white overflow-hidden shadow-sm">
                    <div className="p-8 font-serif text-[13px] text-foreground">
                      <div className="text-center mb-8">
                        <img
                          src={ufgLogo}
                          alt="Universidade Federal de Goiás"
                          className="h-20 w-auto mx-auto mb-3 object-contain"
                        />
                        <div className="text-sm font-bold uppercase tracking-wide">Universidade Federal de Goiás</div>
                        <div className="text-sm font-bold uppercase tracking-wide">Instituto de Informática</div>
                        <div className="text-base font-bold uppercase tracking-wider mt-6">Certidão</div>
                      </div>

                      <p className="leading-relaxed text-justify indent-12">
                        Certificamos que <strong>{previewItem.participantName}</strong> participou do projeto{" "}
                        <strong>&quot;{previewItem.projectName.toUpperCase()}&quot;</strong>, promovido pelo Centro de Excelência em
                        Inteligência Artificial — CEIA e coordenado pelo(a){" "}
                        <strong>{profile.nome}</strong>, na condição de{" "}
                        <strong>{previewItem.participantRole.toLowerCase()}</strong>
                        {previewItem.participantRole === "Bolsista" ? " remunerado" : ""}, no período de{" "}
                        <strong className="tabular-nums">{previewItem.period}</strong>, perfazendo um total de{" "}
                        <strong className="tabular-nums">{previewItem.hours} horas</strong>.
                      </p>

                      {(() => {
                        const ext = dataBRPorExtenso(dateLabel);
                        return (
                          <p className="leading-relaxed text-justify mt-10">
                            Equipe Administrativa do Centro de Excelência em Inteligência Artificial — CEIA, aos{" "}
                            <strong>{ext?.dia}</strong> dias de <strong>{ext?.ano}</strong> do mês de{" "}
                            <strong>{ext?.mes}</strong>.
                          </p>
                        );
                      })()}

                      <div className="mt-12 text-center">
                        <div className="mx-auto w-72 flex flex-col items-center">
                          {signed && <ZapSignSignature signerName={profile.nome} dateLabel={dateLabel} />}
                          <div className="w-full border-t pt-2">
                            {signed && <div className="text-sm font-semibold">{profile.nome}</div>}
                            <div className="text-[11px] text-muted-foreground">Coordenação do projeto</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                    {signed ? (
                      <>
                        <div className="inline-flex items-center gap-1.5">
                          <CheckCircle2 className="size-3.5 text-[color:var(--status-approved-fg)]" />
                          Assinatura digital com validade jurídica (Lei 14.063/2020).
                        </div>
                        <div>
                          Assinado por <span className="font-semibold text-foreground">{profile.nome}</span> em{" "}
                          <span className="font-semibold text-foreground">{dateLabel}</span> via ZapSign.
                        </div>
                      </>
                    ) : (
                      <div className="inline-flex items-center gap-1.5">
                        <FileSignature className="size-3.5 text-sky-600" />
                        Documento será incluído no envelope do ZapSign para assinatura da coordenação.
                      </div>
                    )}
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// =====================================================================
// Subcomponentes
// =====================================================================
function TabButton({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn("flex-1 relative flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium -mb-px")}
    >
      <div className={cn("flex items-center gap-2", active ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
        {icon}
        <span className="truncate">{children}</span>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-[2px] overflow-hidden">
        <span
          style={{
            display: "block",
            height: "100%",
            backgroundColor: "var(--primary)",
            transform: active ? "scaleX(1)" : "scaleX(0)",
            transformOrigin: "center",
            transition: "transform 360ms cubic-bezier(.2,.9,.2,1)",
          }}
        />
      </div>
    </button>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone,
  pulse,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: "primary" | "warning" | "info" | "muted" | "purple" | "success";
  pulse?: boolean;
}) {
  const toneClasses: Record<typeof tone, string> = {
    primary: "bg-primary-soft text-primary border-primary/20",
    warning:
      "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900",
    info: "bg-white text-sky-700 border-sky-700/30 dark:bg-background dark:text-sky-400 dark:border-sky-400/30",
    purple:
      "bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-900",
    success:
      "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900",
    muted: "bg-muted text-muted-foreground border-border",
  };
  return (
    <div className="rounded-xl border bg-card p-4 flex items-center gap-3 hover:shadow-sm transition-shadow">
      <div
        className={cn(
          "size-10 rounded-lg border flex items-center justify-center shrink-0 relative",
          toneClasses[tone]
        )}
      >
        {icon}
        {pulse && value > 0 && (
          <span className="absolute -top-1 -right-1 flex size-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
            <span className="relative inline-flex rounded-full size-2.5 bg-current" />
          </span>
        )}
      </div>
      <div className="min-w-0">
        <div className="text-2xl font-bold leading-none text-foreground">{value}</div>
        <div className="text-xs text-muted-foreground mt-1 leading-tight">{label}</div>
      </div>
    </div>
  );
}

function CertRow({ item, action }: { item: CertItem; action?: React.ReactNode }) {
  return (
    <li className="group relative px-4 sm:px-5 py-4 bg-white hover:bg-muted/30 transition-colors">
      <div className="flex items-center gap-4">
        <div className="size-10 rounded-full bg-gradient-to-br from-primary/15 to-primary/5 text-primary flex items-center justify-center font-semibold text-sm shrink-0 ring-1 ring-primary/10">
          {initialsOf(item.participantName)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-foreground truncate">{item.participantName}</span>
          </div>
          <div className="mt-2 flex flex-col sm:flex-row sm:flex-wrap gap-x-6 gap-y-1.5 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 tabular-nums">
              <Clock3 className="size-3.5 text-muted-foreground/70 shrink-0" />
              {item.hours}h
            </span>
            <span className="inline-flex items-center gap-1.5">
              <BriefcaseBusiness className="size-3.5 text-muted-foreground/70 shrink-0" />
              <span>{item.participantRole}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 min-w-0">
              <FolderKanban className="size-3.5 text-muted-foreground/70 shrink-0" />
              <span className="truncate">{item.projectName}</span>
            </span>
          </div>
        </div>
        {action && <div className="shrink-0 self-center">{action}</div>}
      </div>
    </li>
  );
}

function EmptyState({ icon, title, message }: { icon: React.ReactNode; title: string; message: string }) {
  return (
    <div className="rounded-lg border border-dashed bg-muted/10 px-6 py-10 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
      <div className="size-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center">{icon}</div>
      <div className="font-semibold text-foreground">{title}</div>
      <div className="text-xs max-w-md">{message}</div>
    </div>
  );
}

// =====================================================================
// Pesquisador — visão de solicitação
// =====================================================================
function ResearcherCertificadoPage() {
  const profile = useActiveProfile();
  const [requestsByProject, setRequestsByProject] = useState<Record<string, CertRequest[]>>(
    () => Object.fromEntries(LUCAS_PARTICIPATIONS.map((p) => [p.id, p.initialRequests ?? []])),
  );
  const [filter, setFilter] = useState<"todos" | "solicitar" | "andamento" | "concluidos">("todos");
  const [confirmTarget, setConfirmTarget] = useState<ResearcherParticipation | null>(null);
  const [previewTarget, setPreviewTarget] = useState<{
    participation: ResearcherParticipation;
    request: CertRequest;
  } | null>(null);
  const [justRequestedProjectId, setJustRequestedProjectId] = useState<string | null>(null);

  const participations = LUCAS_PARTICIPATIONS;

  const counts = useMemo(() => {
    const c = { solicitar: 0, andamento: 0, concluidos: 0 };
    participations.forEach((p) => {
      const reqs = requestsByProject[p.id] ?? [];
      if (canRequestNew(p, reqs)) c.solicitar += 1;
      if (hasInFlight(reqs)) c.andamento += 1;
      if (reqs.some((r) => r.status === "disponivel")) c.concluidos += 1;
    });
    return c;
  }, [participations, requestsByProject]);

  const visible = useMemo(() => {
    return participations.filter((p) => {
      const reqs = requestsByProject[p.id] ?? [];
      if (filter === "todos") return true;
      if (filter === "solicitar") return canRequestNew(p, reqs);
      if (filter === "andamento") return hasInFlight(reqs);
      if (filter === "concluidos") return reqs.some((r) => r.status === "disponivel");
      return true;
    });
  }, [filter, participations, requestsByProject]);

  // Confirma a solicitação criando um novo pedido com snapshot das horas atuais.
  function confirmRequest() {
    if (!confirmTarget) return;
    const p = confirmTarget;
    const template = templateOf(p);
    const year = TODAY.split("/")[2]?.slice(-3) ?? "000";
    const existing = requestsByProject[p.id]?.length ?? 0;
    const seq = String(existing + 1).padStart(3, "0");
    const prevReqs = requestsByProject[p.id] ?? [];
    // Para parciais, certificamos apenas o incremento de horas desde a última parcial assinada/em assinatura.
    const alreadyCertifiedParcial = prevReqs
      .filter((r) => r.template === "parcial")
      .reduce((sum, r) => sum + r.hoursAtRequest, 0);
    const lastParcialRef = [...prevReqs]
      .filter((r) => r.template === "parcial")
      .sort((a, b) => parseBR(b.requestedAt) - parseBR(a.requestedAt))[0]?.refMonthYear;
    const hoursForThisRequest =
      template === "parcial" ? Math.max(0, p.hours - alreadyCertifiedParcial) : p.hours;
    const fromMonthYear =
      template === "parcial" ? (lastParcialRef ?? p.startMonthYear) : undefined;
    const newReq: CertRequest = {
      id: `DEC-${year[0]}${year.slice(1)}-${seq}`,
      template,
      status: "em_assinatura",
      refMonthYear: shortMonthYearOf(TODAY),
      hoursAtRequest: hoursForThisRequest,
      requestedAt: TODAY,
      fromMonthYear,
    };
    setRequestsByProject((prev) => ({
      ...prev,
      [p.id]: [...(prev[p.id] ?? []), newReq],
    }));
    setJustRequestedProjectId(p.id);
    setConfirmTarget(null);
    window.setTimeout(() => setJustRequestedProjectId(null), 4000);
  }

  // Total de certidões já disponíveis e em assinatura — alimentam os KPIs do hero.
  const totalEmAssinatura = useMemo(
    () => Object.values(requestsByProject).flat().filter((r) => r.status === "em_assinatura").length,
    [requestsByProject],
  );
  const totalDisponiveis = useMemo(
    () => Object.values(requestsByProject).flat().filter((r) => r.status === "disponivel").length,
    [requestsByProject],
  );

  // Pedidos já existentes para o projeto sendo confirmado — guia a copy do diálogo.
  const confirmExistingCount = confirmTarget ? (requestsByProject[confirmTarget.id]?.length ?? 0) : 0;

  return (
    <div className="p-6 md:p-10 w-full">
      <Link to="/central-solicitacoes" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground/80 mb-6">
        <ChevronLeft className="size-3" /> Voltar para central de solicitações
      </Link>

      {/* Hero — título + breve contexto */}
      <header className="mb-6">
        <div className="text-xs uppercase tracking-wider text-primary font-semibold">central de solicitações</div>
        <h1 className="text-[30px] md:text-[36px] font-bold tracking-tight leading-[1.05] text-foreground mt-1">
          Certificados de Participação
        </h1>
        <p className="text-[15px] text-muted-foreground mt-3 leading-relaxed">
          Suas certidões oficiais de participação nos projetos do CEIA. Solicite uma certidão a qualquer momento e acompanhe o status em cada projeto.
        </p>
      </header>

      {/* KPIs — panorama rápido */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <StatTile
          label="Projetos"
          value={participations.length}
          icon={<FolderKanban className="size-4" />}
        />
        <StatTile
          label="Certidões em assinatura"
          value={totalEmAssinatura}
          icon={<FileSignature className="size-4" />}
          tone="sky"
        />
        <StatTile
          label="Certidões prontas"
          value={totalDisponiveis}
          icon={<CheckCircle2 className="size-4" />}
          tone="emerald"
        />
      </div>

      {justRequestedProjectId && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 w-[min(360px,calc(100vw-3rem))] rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-xl shadow-emerald-950/10 dark:bg-emerald-950 dark:border-emerald-900 flex items-start gap-3"
        >
          <div className="size-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
            <CheckCircle2 className="size-5" />
          </div>
          <div className="text-sm">
            <div className="font-semibold text-emerald-900 dark:text-emerald-200">Solicitação registrada</div>
            <p className="mt-0.5 text-emerald-800 dark:text-emerald-300 leading-relaxed">
              Sua solicitação foi enviada à coordenação para assinatura.
            </p>
          </div>
        </div>
      )}

      {/* Filtro — padrão do sistema (botão azul + popover) */}
      {(() => {
        const filterChips: { key: typeof filter; label: string; count: number }[] = [
          { key: "todos", label: "Todos", count: participations.length },
          { key: "andamento", label: "Com Certidão Em Assinatura", count: counts.andamento },
          { key: "concluidos", label: "Com Certidão Pronta", count: counts.concluidos },
        ];
        const current = filterChips.find((c) => c.key === filter) ?? filterChips[0];
        return (
          <div className="flex justify-end mb-5">
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className={cn(
                    "inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border text-[13px] font-semibold transition-all shadow-sm",
                    "border-primary bg-primary text-primary-foreground hover:bg-primary/90",
                  )}
                >
                  <ListFilter className="size-4" />
                  <span>{current.label}</span>
                  <span className="rounded-full px-1.5 py-px text-[10px] font-bold tabular-nums bg-white/20 text-primary-foreground">
                    {current.count}
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-64 p-1.5">
                <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Filtrar projetos
                </div>
                <div className="flex flex-col">
                  {filterChips.map((chip) => {
                    const active = filter === chip.key;
                    return (
                      <button
                        key={chip.key}
                        onClick={() => setFilter(chip.key)}
                        className={cn(
                          "flex items-center gap-2 px-2 py-2 rounded-md text-sm transition-colors text-left",
                          active
                            ? "bg-primary-soft text-primary font-medium"
                            : "text-foreground hover:bg-accent",
                        )}
                      >
                        <span
                          className={cn(
                            "size-4 flex items-center justify-center shrink-0",
                            active ? "text-primary" : "text-transparent",
                          )}
                        >
                          <Check className="size-4" />
                        </span>
                        <span className="flex-1 truncate">{chip.label}</span>
                        <span
                          className={cn(
                            "rounded-full px-1.5 py-px text-[10px] font-bold tabular-nums",
                            active
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          {chip.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        );
      })()}

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-muted/10 px-6 py-16 text-center text-sm text-muted-foreground flex flex-col items-center gap-3">
          <div className="size-12 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
            <Inbox className="size-5" />
          </div>
          <div className="font-semibold text-foreground">Nada por aqui</div>
          <div className="text-xs max-w-md">Ajuste o filtro para ver outros projetos ou aguarde novas participações.</div>
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map((p) => (
            <ProjectCertificateCard
              key={p.id}
              participation={p}
              requests={requestsByProject[p.id] ?? []}
              onRequest={() => setConfirmTarget(p)}
              onPreviewRequest={(request) => setPreviewTarget({ participation: p, request })}
            />
          ))}
        </div>
      )}

      {/* Diálogo de confirmação de solicitação */}
      <Dialog open={!!confirmTarget} onOpenChange={(o) => !o && setConfirmTarget(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="inline-flex items-center gap-2">
              {confirmTarget && templateOf(confirmTarget) === "parcial" ? (
                <FileText className="size-5 text-amber-600" />
              ) : (
                <FileCheck2 className="size-5 text-emerald-600" />
              )}
              Solicitar {confirmExistingCount > 0 && confirmTarget && templateOf(confirmTarget) === "parcial" ? "nova " : ""}certidão {confirmTarget ? (templateOf(confirmTarget) === "parcial" ? "parcial" : "total") : ""}
            </DialogTitle>
            <DialogDescription>
              {confirmTarget && templateOf(confirmTarget) === "parcial"
                ? confirmExistingCount > 0
                  ? "Como sua participação está em andamento, será emitida uma nova certidão parcial cobrindo apenas as horas acumuladas desde a última certidão parcial até a data do pedido."
                  : "Como sua participação está em andamento, será emitida a certidão parcial com as horas realizadas até a data do pedido."
                : "Como a participação está encerrada, será emitida a certidão total com o período completo e a carga horária final."}
              {" "}A coordenação será acionada para assinatura.
            </DialogDescription>
          </DialogHeader>

          {confirmTarget && (() => {
            const isParcial = templateOf(confirmTarget) === "parcial";
            const prevReqs = requestsByProject[confirmTarget.id] ?? [];
            const alreadyCertifiedParcial = prevReqs
              .filter((r) => r.template === "parcial")
              .reduce((sum, r) => sum + r.hoursAtRequest, 0);
            const lastParcialRef = [...prevReqs]
              .filter((r) => r.template === "parcial")
              .sort((a, b) => parseBR(b.requestedAt) - parseBR(a.requestedAt))[0]?.refMonthYear;
            const incremento = Math.max(0, confirmTarget.hours - alreadyCertifiedParcial);
            return (
            <div className="rounded-xl border bg-muted/20 p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <SummaryCard
                  icon={isParcial ? <FileText className="size-4" /> : <FileCheck2 className="size-4" />}
                  label="Tipo da certidão"
                  value={isParcial ? "Parcial — participação em andamento" : "Total — participação encerrada"}
                />
                <SummaryCard icon={<Award className="size-4" />} label="Função" value={confirmTarget.role} />
                <SummaryCard icon={<FolderKanban className="size-4" />} label="Projeto" value={confirmTarget.projectName} />
                <SummaryCard icon={<UserCircle2 className="size-4" />} label="Coordenação" value={`${confirmTarget.coordinatorTitle} ${confirmTarget.coordinator}`} />
              {isParcial ? (
                <>
                    <SummaryCard
                    icon={<CalendarRange className="size-4" />}
                    label={alreadyCertifiedParcial > 0 ? "Período coberto por esta certidão" : "Início no projeto"}
                    value={
                      alreadyCertifiedParcial > 0 && lastParcialRef
                        ? `${lastParcialRef} → ${shortMonthYearOf(TODAY)}`
                        : confirmTarget.startMonthYear
                    }
                  />
                    <SummaryCard icon={<CalendarClock className="size-4" />} label="Previsão de término" value={confirmTarget.expectedEndMonthYear} />
                    <SummaryCard icon={<Clock3 className="size-4" />} label="Carga horária mensal" value={`${confirmTarget.monthlyHours}h`} />
                    <SummaryCard
                    icon={<Hourglass className="size-4" />}
                    label={alreadyCertifiedParcial > 0 ? "Horas a certificar nesta certidão" : "Total realizado até hoje"}
                    value={`${incremento}h`}
                  />
                </>
              ) : (
                <>
                    <SummaryCard icon={<CalendarRange className="size-4" />} label="Período" value={confirmTarget.period} />
                    <SummaryCard icon={<Clock3 className="size-4" />} label="Carga horária total" value={`${confirmTarget.hours}h`} />
                </>
              )}
              </div>
            </div>
            );
          })()}

          <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-900 p-3 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
            <AlertCircle className="size-4 shrink-0 mt-px" />
            <span>
              Após confirmar, a solicitação <strong>não pode ser cancelada</strong>. Verifique se os dados estão corretos.
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button
              onClick={() => setConfirmTarget(null)}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold hover:bg-accent transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={confirmRequest}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
            >
              <Send className="size-4" /> Confirmar Solicitação
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo de pré-visualização do certificado pronto */}
      <Dialog open={!!previewTarget} onOpenChange={(o) => !o && setPreviewTarget(null)}>
        <DialogContent className="max-w-3xl p-0 gap-0 max-h-[92vh] overflow-hidden sm:rounded-2xl [&>button.absolute]:hidden">
          {previewTarget && (() => {
            const p = previewTarget.participation;
            const r = previewTarget.request;
            // View-model: a certidão sempre reflete o "snapshot" do pedido — horas e
            // mês de referência congelados no momento da solicitação/assinatura.
            const view = {
              hours: r.hoursAtRequest,
              certId: r.id,
              signedAt: r.issuedAt ?? TODAY,
              startMonthYear: p.startMonthYear,
              fromMonthYear: r.fromMonthYear ?? p.startMonthYear,
              isIncremental: !!r.fromMonthYear && r.fromMonthYear !== p.startMonthYear,
              expectedEndMonthYear: r.refMonthYear,
              template: r.template,
            };
            const dateLabel = view.signedAt;
            return (
            <>
              <div className="flex items-center justify-between gap-4 px-6 py-4 border-b bg-muted/30">
                <DialogHeader className="min-w-0 space-y-0 text-left">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-9 rounded-lg bg-[color:var(--status-approved-fg)] text-white flex items-center justify-center shrink-0">
                      <CheckCircle2 className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <DialogDescription className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                        Certificado assinado via ZapSign
                      </DialogDescription>
                      <DialogTitle className="text-base font-semibold truncate">
                        Certidão {view.template === "parcial" ? "Parcial" : "Total"}
                      </DialogTitle>
                    </div>
                  </div>
                </DialogHeader>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-accent"
                    aria-label="Baixar cópia"
                    title="Baixar cópia"
                  >
                    <Download className="size-5" />
                  </button>
                  <DialogClose asChild>
                    <button
                      className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-accent"
                      aria-label="Fechar"
                      title="Fechar"
                    >
                      <X className="size-5" />
                    </button>
                  </DialogClose>
                </div>
              </div>

              <div className="overflow-auto p-6 max-h-[calc(92vh-74px)]">
                <div className="relative max-w-3xl mx-auto rounded-lg border bg-white overflow-hidden shadow-sm">
                  <div className="p-8 font-serif text-[13px] text-foreground">
                    <div className="text-center mb-8">
                      <img
                        src={ufgLogo}
                        alt="Universidade Federal de Goiás"
                        className="h-20 w-auto mx-auto mb-3 object-contain"
                      />
                      <div className="text-sm font-bold uppercase tracking-wide">Universidade Federal de Goiás</div>
                      <div className="text-sm font-bold uppercase tracking-wide">Instituto de Informática</div>
                      <div className="text-base font-bold uppercase tracking-wider mt-6">Certidão</div>
                    </div>

                    {view.template === "parcial" ? (
                      <>
                        <p className="leading-relaxed text-justify indent-12">
                          Certificamos que <strong>{profile.nome}</strong>, CPF nº <strong className="tabular-nums">{profile.cpf}</strong>, atua
                          como <strong>{p.role.toLowerCase()}</strong>
                          {p.role === "Bolsista" ? " remunerado" : ""} do projeto{" "}
                          <strong>&quot;{p.projectName.toUpperCase()}&quot;</strong>, promovido pelo Centro de Excelência em
                          Inteligência Artificial — CEIA e coordenado pelo(a) {p.coordinatorTitle}{" "}
                          <strong>{p.coordinator}</strong> desde <strong>{view.startMonthYear}</strong>, com carga horária de{" "}
                          <strong className="tabular-nums">{p.monthlyHours}h mensais</strong>
                          {view.isIncremental ? (
                            <>
                              {" "}perfazendo, no período de <strong>{view.fromMonthYear}</strong> a{" "}
                              <strong>{view.expectedEndMonthYear}</strong>, um total de{" "}
                              <strong className="tabular-nums">{view.hours} horas</strong>.
                            </>
                          ) : (
                            <>
                              {" "}perfazendo, até o momento, um total de{" "}
                              <strong className="tabular-nums">{view.hours} horas</strong>.
                            </>
                          )}
                        </p>
                        <p className="leading-relaxed text-justify indent-12 mt-3">
                          Destaca-se que há previsão de que o(a) {p.role.toLowerCase()} esteja no projeto até{" "}
                          <strong>{p.expectedEndMonthYear}</strong>.
                        </p>
                      </>
                    ) : (
                      <p className="leading-relaxed text-justify indent-12">
                        Certificamos que <strong>{profile.nome}</strong>, CPF nº <strong className="tabular-nums">{profile.cpf}</strong>, atuou
                        como <strong>{p.role.toLowerCase()}</strong>
                        {p.role === "Bolsista" ? " remunerado" : ""} do projeto{" "}
                        <strong>&quot;{p.projectName.toUpperCase()}&quot;</strong>, promovido pelo Centro de Excelência em
                        Inteligência Artificial — CEIA e coordenado pelo(a) {p.coordinatorTitle}{" "}
                        <strong>{p.coordinator}</strong>, no período de <strong className="tabular-nums">{p.period}</strong>, perfazendo
                        um total de <strong className="tabular-nums">{view.hours} horas</strong>.
                      </p>
                    )}

                    {(() => {
                      const ext = dataBRPorExtenso(view.signedAt);
                      return (
                        <p className="leading-relaxed text-justify mt-10">
                          Equipe Administrativa do Centro de Excelência em Inteligência Artificial — CEIA, aos{" "}
                          <strong>{ext?.dia}</strong> dias de <strong>{ext?.ano}</strong> do mês de{" "}
                          <strong>{ext?.mes}</strong>.
                        </p>
                      );
                    })()}

                    <div className="mt-12 text-center">
                      <div className="mx-auto w-72 flex flex-col items-center">
                        <ZapSignSignature signerName={p.coordinator} dateLabel={dateLabel} />
                        <div className="w-full border-t pt-2">
                        <div className="text-sm font-semibold">{p.coordinator}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {p.coordinatorTitle} — Coordenação do projeto
                        </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                  <div className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5 text-[color:var(--status-approved-fg)]" />
                    Assinatura digital com validade jurídica (Lei 14.063/2020).
                  </div>
                  <div>
                    Assinado por <span className="font-semibold text-foreground">{p.coordinator}</span> em{" "}
                    <span className="font-semibold text-foreground">{dateLabel}</span> via ZapSign.
                  </div>
                </div>
              </div>
            </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// =====================================================================
// Componentes — visão do pesquisador
// =====================================================================

function StatTile({
  label,
  value,
  icon,
  tone = "neutral",
}: {
  label: string;
  value: number;
  icon?: React.ReactNode;
  tone?: "neutral" | "sky" | "emerald" | "amber";
}) {
  const tones = {
    neutral: "bg-card border-border text-foreground",
    sky: "bg-sky-50/60 border-sky-200/70 text-sky-900 dark:bg-sky-950/30 dark:border-sky-900/60 dark:text-sky-100",
    emerald:
      "bg-emerald-50/60 border-emerald-200/70 text-emerald-900 dark:bg-emerald-950/30 dark:border-emerald-900/60 dark:text-emerald-100",
    amber:
      "bg-amber-50/60 border-amber-200/70 text-amber-900 dark:bg-amber-950/30 dark:border-amber-900/60 dark:text-amber-100",
  } as const;
  return (
    <div className={cn("rounded-xl border p-4 transition-colors", tones[tone])}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] uppercase tracking-wider font-semibold opacity-75">{label}</span>
        {icon && <span className="opacity-70">{icon}</span>}
      </div>
      <div className="text-[26px] font-bold tabular-nums leading-none mt-2.5">{value}</div>
    </div>
  );
}

function ProjectStateBadge({ finished }: { finished: boolean }) {
  if (finished) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/40 dark:text-slate-300 dark:border-slate-800">
        <CheckCircle2 className="size-3" /> Encerrado
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900">
      <span className="size-1.5 rounded-full bg-emerald-500" /> Em execução
    </span>
  );
}

const STATUS_META: Record<
  ResearcherRequestStatus,
  { label: string; chipBg: string; chipBorder: string; chipText: string; icon: React.ReactNode }
> = {
  em_assinatura: {
    label: "Em assinatura pelo coordenador",
    chipBg: "bg-sky-50 dark:bg-sky-950/40",
    chipBorder: "border-sky-200 dark:border-sky-900",
    chipText: "text-sky-800 dark:text-sky-300",
    icon: <FileSignature className="size-3" />,
  },
  disponivel: {
    label: "Disponível",
    chipBg: "bg-emerald-50 dark:bg-emerald-950/40",
    chipBorder: "border-emerald-200 dark:border-emerald-900",
    chipText: "text-emerald-700 dark:text-emerald-300",
    icon: <CheckCircle2 className="size-3" />,
  },
};

function ProjectCertificateCard({
  participation,
  requests,
  onRequest,
  onPreviewRequest,
}: {
  participation: ResearcherParticipation;
  requests: CertRequest[];
  onRequest?: () => void;
  onPreviewRequest?: (request: CertRequest) => void;
}) {
  const template = templateOf(participation);
  const sorted = useMemo(
    () => [...requests].sort((a, b) => parseBR(b.requestedAt) - parseBR(a.requestedAt)),
    [requests],
  );
  const canRequest = canRequestNew(participation, requests);
  const requestLabel =
    requests.length > 0 && template === "parcial" ? "Solicitar Nova Certidão" : "Solicitar Certidão";
  const projectActive = !participation.finished;
  const horasSummary = projectActive
    ? `${participation.hours}h realizadas`
    : `${participation.hours}h totais`;

  return (
    <article className="rounded-2xl border bg-card overflow-hidden hover:border-foreground/20 transition-colors">
      <div className="p-5 md:p-6 flex flex-col gap-5">
        {/* Header: estado do projeto + nome + meta + a\u00e7\u00e3o prim\u00e1ria */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0 flex-1">
            <ProjectStateBadge finished={participation.finished} />
            <h3 className="text-[18px] md:text-[19px] font-bold leading-snug text-foreground mt-2.5">
              {participation.projectName}
            </h3>
            <div className="mt-3 flex flex-col sm:flex-row sm:flex-wrap gap-x-6 gap-y-1.5 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <BriefcaseBusiness className="size-3.5 text-muted-foreground/70 shrink-0" />
                <span>{participation.role}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 min-w-0">
                <UserCircle2 className="size-3.5 text-muted-foreground/70 shrink-0" />
                <span className="truncate">Coord. {participation.coordinator}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 tabular-nums">
                <Clock3 className="size-3.5 text-muted-foreground/70 shrink-0" />
                {horasSummary}
              </span>
            </div>
          </div>

          {canRequest && (
            <button
              onClick={onRequest}
              className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2.5 text-[13px] font-semibold transition-colors shadow-sm shrink-0"
            >
              <Plus className="size-4" /> {requestLabel}
            </button>
          )}
        </div>

        {/* Lista de pedidos */}
        {sorted.length > 0 ? (
          <div className="rounded-xl border bg-card overflow-hidden shadow-[0_1px_0_rgba(0,0,0,0.02)]">
            <div className="px-4 py-3.5 border-b bg-muted/20 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-9 rounded-full bg-primary/10 text-primary ring-1 ring-primary/15 flex items-center justify-center shrink-0">
                  <Award className="size-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-foreground leading-tight">
                    Suas Certidões
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    Documentos solicitados para este projeto
                  </div>
                </div>
              </div>
              <span className="shrink-0 rounded-full border bg-background px-2.5 py-1 text-[11px] font-semibold text-foreground shadow-sm">
                {sorted.length === 1 ? "1 certidão" : `${sorted.length} certidões`}
              </span>
            </div>
            <ul className="flex flex-col">
              {sorted.map((r) => (
                <RequestRow key={r.id} request={r} onPreview={onPreviewRequest} />
              ))}
            </ul>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed bg-muted/10 px-5 py-7">
            <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
              <div className="mb-3 flex size-14 items-center justify-center rounded-full bg-primary/5 text-primary ring-1 ring-primary/15">
                <FileSignature className="size-6" strokeWidth={1.75} />
              </div>
              <div className="text-sm font-semibold text-foreground">Nenhuma certidão solicitada</div>
              <p className="mt-1 whitespace-nowrap text-xs text-muted-foreground leading-relaxed">
                  Emita a primeira certidão deste projeto para acompanhar a assinatura via ZapSign e baixar o documento quando estiver disponível.
              </p>
            </div>
          </div>
        )}

        {/* Microcopy contextual \u2014 s\u00f3 quando faz sentido */}
      </div>
    </article>
  );
}

function RequestRow({
  request,
  onPreview,
}: {
  request: CertRequest;
  onPreview?: (request: CertRequest) => void;
}) {
  const meta = STATUS_META[request.status];
  const isParcial = request.template === "parcial";
  const accent = request.status === "disponivel"
    ? {
        bar: "bg-emerald-500",
        iconBg: "bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-700 dark:from-emerald-950/60 dark:to-emerald-900/40 dark:text-emerald-300",
      }
    : {
        bar: "bg-sky-500",
        iconBg: "bg-gradient-to-br from-sky-50 to-sky-100 text-sky-700 dark:from-sky-950/60 dark:to-sky-900/40 dark:text-sky-300",
      };
  return (
    <li className="relative group flex items-center justify-between gap-3 pl-5 pr-4 py-3.5 hover:bg-foreground/[0.02] transition-colors not-last:border-b border-border/60">
      <span className={cn("absolute left-0 top-2 bottom-2 w-1 rounded-r-full", accent.bar)} />
      <div className="min-w-0 flex-1 flex items-center gap-3.5">
        <div className={cn("size-11 rounded-xl flex items-center justify-center shrink-0", accent.iconBg)}>
          {isParcial ? <FileText className="size-5" /> : <FileCheck2 className="size-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[14px] font-semibold text-foreground leading-tight">
              Certidão {isParcial ? "Parcial" : "Total"}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border whitespace-nowrap",
                meta.chipBg,
                meta.chipBorder,
                meta.chipText,
              )}
            >
              {meta.icon} {meta.label}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground mt-1.5 tabular-nums flex-wrap">
            <span className="inline-flex items-center gap-1 font-medium text-foreground/70">
              <Clock3 className="size-3 opacity-60" /> {request.hoursAtRequest}h
            </span>
            <span className="opacity-40">•</span>
            <span className="inline-flex items-center gap-1">
              <CalendarClock className="size-3 opacity-60" /> solicitado em {request.requestedAt}
            </span>
          </div>
        </div>
      </div>
      {request.status === "disponivel" && (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onPreview?.(request)}
            className="inline-flex items-center justify-center size-10 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
            title="Visualizar"
            aria-label={`Visualizar certidão ${request.id}`}
          >
            <Eye className="size-4" />
          </button>
          <button
            className="inline-flex items-center justify-center size-10 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
            title="Baixar PDF"
            aria-label={`Baixar PDF da certidão ${request.id}`}
          >
            <Download className="size-4" />
          </button>
        </div>
      )}
    </li>
  );
}

function ZapSignSignature({ signerName, dateLabel }: { signerName: string; dateLabel: string }) {
  return (
    <div className="-mb-1 flex flex-col items-center font-sans not-italic">
      <svg
        viewBox="0 0 320 90"
        className="w-[210px] md:w-[250px] h-auto"
        aria-hidden="true"
      >
        <path
          d="M10 65 C 30 20, 55 20, 70 55 S 95 90, 110 50 C 120 25, 140 25, 150 55 C 158 78, 175 70, 185 45 C 195 20, 215 20, 225 50 S 255 80, 270 45 C 280 22, 300 28, 310 55"
          fill="none"
          stroke="#1e3a8a"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M70 70 q 80 -8 180 -2"
          fill="none"
          stroke="#1e3a8a"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
      <div className="-mt-3 mb-1 rounded bg-white/70 px-1.5 text-[10px] text-slate-700/80">
        {signerName} • Assinado em {dateLabel}
      </div>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={cn("rounded-lg border bg-background px-3.5 py-3 flex items-start gap-3", className)}>
      <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold leading-none">{label}</div>
        <div className="text-sm font-semibold text-foreground mt-1 leading-snug">{value}</div>
      </div>
    </div>
  );
}
