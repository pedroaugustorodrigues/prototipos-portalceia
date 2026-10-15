import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { PROJECTS, MOCK_REQUESTS, useBolsaSlots, STATUS_LABEL, type Project, type AdjustmentRequest, type RequestStatus } from "@/lib/ptr-data";
import { Search, Calendar, User2, ArrowRight, Plus, History, FileSignature, ChevronLeft, AlertCircle, CheckCircle2, ShieldCheck, Users, Sparkles, FolderKanban, Inbox, ListFilter, Check, Building2, Eye, FileCheck2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AcceptDeadlineDialog } from "@/components/ptr/AcceptDeadlineDialog";
import { RequestForm } from "@/components/ptr/RequestForm";
import { SignDocumentDialog } from "@/components/ptr/SignDocumentDialog";
import { SignedCartaDialog } from "@/components/ptr/SignedCartaDialog";
import RequestDetailsDialog from "@/components/ptr/RequestDetailsDialog";
import carta from "@/assets/carta.png";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/central-solicitacoes/ajuste-ptr")({
  head: () => ({
    meta: [
      { title: "Solicitações de Ajuste de PTR — Portal CEIA" },
      { name: "description", content: "Solicite ajustes no Plano de Trabalho dos seus projetos." },
    ],
  }),
  component: SolicitacoesPTRPage,
});

function SolicitacoesPTRPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<
    "todos" | "em_analise_ea" | "aguardando_assinatura" | "em_analise_proad" | "aprovadas"
  >("todos");
  const [acceptingProject, setAcceptingProject] = useState<Project | null>(null);
  const [openProject, setOpenProject] = useState<Project | null>(null);
  const bolsaSlots = useBolsaSlots();

  const baseProjects = useMemo(
    () => PROJECTS.filter((p) => p.status === "em_execucao"),
    []
  );

  /** Estatísticas por projeto. */
  const projectStats = useMemo(() => {
    const map = new Map<
      string,
      {
        total: number;
        emAnaliseEa: number;
        emAnaliseProad: number;
        aguardandoAssinatura: number;
        aprovadas: number;
        equipe: number;
      }
    >();
    baseProjects.forEach((p) => {
      const reqs = MOCK_REQUESTS.filter(
        (r) => r.projectId === p.id && r.status !== "recusado"
      );
      const emAnaliseEa = reqs.filter((r) => r.status === "em_analise").length;
      const emAnaliseProad = reqs.filter(
        (r) => r.status === "pendente" || r.status === "aprovado"
      ).length;
      const aguardandoAssinatura = reqs.filter(
        (r) => r.status === "aguardando_assinatura"
      ).length;
      const aprovadas = reqs.filter((r) => r.status === "concluido").length;
      const equipe = bolsaSlots.filter(
        (s) => s.projectId === p.id && s.ocupante
      ).length;
      map.set(p.id, {
        total: reqs.length,
        emAnaliseEa,
        emAnaliseProad,
        aguardandoAssinatura,
        aprovadas,
        equipe,
      });
    });
    return map;
  }, [baseProjects, bolsaSlots]);

  const totals = useMemo(() => {
    let emAnaliseEa = 0;
    let emAnaliseProad = 0;
    let aguardandoAssinatura = 0;
    let aprovadas = 0;
    projectStats.forEach((s) => {
      emAnaliseEa += s.emAnaliseEa;
      emAnaliseProad += s.emAnaliseProad;
      aguardandoAssinatura += s.aguardandoAssinatura;
      aprovadas += s.aprovadas;
    });
    return {
      projetos: baseProjects.length,
      emAnaliseEa,
      emAnaliseProad,
      aguardandoAssinatura,
      aprovadas,
      pendentes: emAnaliseEa + emAnaliseProad,
    };
  }, [baseProjects, projectStats]);

  const projects = useMemo(() => {
    const q = query.toLowerCase().trim();
    return baseProjects.filter((p) => {
      if (q) {
        const hay = `${p.name} ${p.coordinator} ${p.client}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      const stats = projectStats.get(p.id);
      if (filter === "em_analise_ea") return (stats?.emAnaliseEa ?? 0) > 0;
      if (filter === "em_analise_proad") return (stats?.emAnaliseProad ?? 0) > 0;
      if (filter === "aguardando_assinatura")
        return (stats?.aguardandoAssinatura ?? 0) > 0;
      if (filter === "aprovadas") return (stats?.aprovadas ?? 0) > 0;
      return true;
    });
  }, [baseProjects, query, filter, projectStats]);

  if (openProject) {
    return (
      <ProjectRequestView
        project={openProject}
        onBack={() => setOpenProject(null)}
      />
    );
  }

  const filterChips: { key: typeof filter; label: string; count: number }[] = [
    { key: "todos", label: "Todos os projetos", count: totals.projetos },
    { key: "em_analise_ea", label: "Em análise (EA)", count: totals.emAnaliseEa },
    {
      key: "aguardando_assinatura",
      label: "Aguardando assinatura",
      count: totals.aguardandoAssinatura,
    },
    {
      key: "em_analise_proad",
      label: "Em análise (PROAD)",
      count: totals.emAnaliseProad,
    },
    {
      key: "aprovadas",
      label: "Aprovadas",
      count: totals.aprovadas,
    },
  ];

  return (
    <div className="p-6 md:p-10 w-full">
      <Link to="/central-solicitacoes" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground/80 -mt-2 mb-6">
        <ChevronLeft className="size-3" /> Voltar para central de solicitações
      </Link>
      <div className="mb-8">
        <div className="text-xs uppercase tracking-wider text-primary font-semibold">Central de Solicitações</div>
        <h1 className="text-3xl font-bold tracking-tight mt-1">Solicitações de Ajuste de PTR</h1>
        <p className="text-muted-foreground mt-2">
          Selecione um dos seus projetos em execução para abrir uma nova solicitação ou acompanhar o histórico.
        </p>
      </div>

      {/* Painel de estatísticas */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard
          icon={<Clock className="size-4" />}
          label="Em análise (EA)"
          value={totals.emAnaliseEa}
          tone={totals.emAnaliseEa > 0 ? "warning" : "muted"}
        />
        <StatCard
          icon={<FileSignature className="size-4" />}
          label="Aguardando assinatura"
          value={totals.aguardandoAssinatura}
          tone={totals.aguardandoAssinatura > 0 ? "info" : "muted"}
        />
        <StatCard
          icon={<ShieldCheck className="size-4" />}
          label="Em análise (PROAD)"
          value={totals.emAnaliseProad}
          tone="purple"
        />
        <StatCard
          icon={<CheckCircle2 className="size-4" />}
          label="Aprovadas"
          value={totals.aprovadas}
          tone="success"
        />
      </div>

      {/* Busca + filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por projeto, coordenador ou cliente..."
            className="w-full h-11 pl-10 pr-4 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Popover>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  "inline-flex items-center gap-2 h-11 px-4 rounded-lg border text-sm font-medium transition-all shadow-sm",
                  "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
                )}
              >
                <ListFilter className="size-4" />
                <span>{filterChips.find((c) => c.key === filter)?.label ?? "Filtrar"}</span>
                <span className="rounded-full px-1.5 py-px text-[10px] font-bold tabular-nums bg-white/20 text-primary-foreground">
                  {filterChips.find((c) => c.key === filter)?.count ?? 0}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-64 p-1.5">
              <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Filtrar projetos com solicitações
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
                          : "text-foreground hover:bg-accent"
                      )}
                    >
                      <span
                        className={cn(
                          "size-4 flex items-center justify-center shrink-0",
                          active ? "text-primary" : "text-transparent"
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
                            : "bg-muted text-muted-foreground"
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
      </div>

      {/* Grade de projetos */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((p) => {
          const stats = projectStats.get(p.id) ?? {
            total: 0,
            emAnaliseEa: 0,
            emAnaliseProad: 0,
            aguardandoAssinatura: 0,
            equipe: 0,
          };
          const pendentes = stats.emAnaliseEa + stats.emAnaliseProad;
          const hasPending = pendentes + stats.aguardandoAssinatura > 0;
          return (
            <button
              key={p.id}
              onClick={() => setAcceptingProject(p)}
              className={cn(
                "relative text-left group rounded-2xl border bg-card transition-all p-5 flex flex-col overflow-hidden",
                "hover:border-primary/50 hover:shadow-lg hover:-translate-y-0.5"
              )}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                  Em execução
                </span>
              </div>

              <h3 className="font-semibold leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2 min-h-[2.5rem]">
                {p.name}
              </h3>

              <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 truncate">
                  <User2 className="size-3.5 shrink-0" />
                  <span className="truncate">{p.role}</span>
                </div>
                <div className="flex items-center gap-2 truncate">
                  <Building2 className="size-3.5 shrink-0" />
                  <span className="truncate">{p.client}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="size-3.5 shrink-0" />
                  <span>{p.vigencia}</span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t flex items-center justify-between text-sm font-medium text-primary">
                <span>Abrir solicitação</span>
                <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          );
        })}

        {projects.length === 0 && (
          <div className="col-span-full rounded-2xl border-2 border-dashed border-border p-12 flex flex-col items-center gap-3 text-center">
            <div className="size-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
              <Inbox className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Nenhum projeto encontrado</p>
              <p className="text-xs text-muted-foreground mt-1">
                Ajuste os filtros ou tente outra busca.
              </p>
            </div>
            {(query || filter !== "todos") && (
              <button
                onClick={() => {
                  setQuery("");
                  setFilter("todos");
                }}
                className="mt-1 text-xs font-medium text-primary hover:underline"
              >
                Limpar filtros
              </button>
            )}
          </div>
        )}
      </div>

      <AcceptDeadlineDialog
        project={acceptingProject}
        onClose={() => setAcceptingProject(null)}
        onAccept={(p: Project) => {
          setAcceptingProject(null);
          setOpenProject(p);
        }}
      />
    </div>
  );
}

function ProjectRequestView({ project, onBack }: { project: Project; onBack: () => void }) {
  const [tab, setTab] = useState<"nova" | "historico">("nova");
  const projectRequests = MOCK_REQUESTS.filter((r) => r.projectId === project.id && r.status !== "recusado");

  return (
      <div className="p-6 md:p-10 w-full">
      <button onClick={onBack} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground/80 -mt-2 mb-6">
        <ChevronLeft className="size-3" /> Voltar para projetos
      </button>

      <div className="mb-6">
        <div className="text-xs uppercase tracking-wider text-primary font-semibold">Ajuste de PTR</div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mt-1">{project.name}</h1>
        <div className="text-sm text-muted-foreground mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span>Coordenação: {project.coordinator}</span>
          <span className="size-1 rounded-full bg-muted-foreground/40" aria-hidden />
          <span>Vigência: {project.vigencia}</span>
        </div>
      </div>

      <div className="border-b mb-6 flex gap-1">
        <TabButton active={tab === "nova"} onClick={() => setTab("nova")} icon={<Plus className="size-4" />}>
          Nova Solicitação
        </TabButton>
        <TabButton active={tab === "historico"} onClick={() => setTab("historico")} icon={<History className="size-4" />}>
          Histórico {projectRequests.length > 0 && <span className="ml-1 text-xs bg-muted px-1.5 py-0.5 rounded">{projectRequests.length}</span>}
        </TabButton>
      </div>

      {tab === "nova" ? (
        <RequestForm project={project} onSubmitted={() => setTab("historico")} />
      ) : (
        <HistoryList requests={projectRequests} project={project} />
      )}
    </div>
  );
}

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

      {/* Animated underline that grows horizontally from center */}
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

function HistoryList({ requests, project }: { requests: AdjustmentRequest[]; project: Project }) {
  const [signing, setSigning] = useState<AdjustmentRequest | null>(null);
  const [signedIds, setSignedIds] = useState<string[]>([]);
  const [detailRequest, setDetailRequest] = useState<AdjustmentRequest | null>(null);
  const [viewSigned, setViewSigned] = useState<AdjustmentRequest | null>(null);
  if (requests.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
        Nenhuma solicitação anterior para este projeto.
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {requests.map((r, idx) => {
        const ordinal = requests.length - idx;
        const isSigned = signedIds.includes(r.id);
        const status: RequestStatus = isSigned ? "concluido" : r.status;
        return (
        <div
          key={r.id}
          className="rounded-xl border bg-card p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-muted-foreground">{r.id}</span>
              <StatusBadge status={status} />
            </div>
            <div className="text-sm font-medium">
              <span className="text-foreground">{ordinal}ª solicitação</span>
              <span className="text-muted-foreground mx-2">•</span>
              <span className="text-foreground">Solicitação enviada em {r.createdAt}</span>
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {r.topics.join(" • ")}
            </div>
            {status === "aguardando_assinatura" && (
              <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck className="size-3.5 text-[color:var(--status-signature-fg)]" />
                Carta pronta — assine para concluir o ajuste do PTR.
              </div>
            )}
            {isSigned && (
              <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-[color:var(--status-approved-fg)]">
                <CheckCircle2 className="size-3.5" />
                Carta assinada via ZapSign.
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {status === "aguardando_assinatura" && (
              <a
                href={`mailto:${project.coordinator.toLowerCase().replace(/\s+/g, ".")}@ceia.ufg.br?subject=${encodeURIComponent(`Assinatura de carta — ${r.id}`)}&body=${encodeURIComponent(`Olá,\n\nSegue para assinatura a carta referente à solicitação ${r.id} do projeto "${project.name}".\n\nAtenciosamente.`)}`}
                className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:bg-primary/90 shadow-sm"
              >
                <FileSignature className="size-4" /> Assinar carta
              </a>
            )}
            {(status === "pendente" || status === "aprovado" || status === "concluido") && (
              <button
                onClick={() => setViewSigned(r)}
                className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-accent"
              >
                <FileCheck2 className="size-4" /> Ver carta assinada
              </button>
            )}
            <button onClick={() => setDetailRequest(r)} className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-accent">
              <Eye className="size-4" /> Ver detalhes
            </button>
          </div>
        </div>
        );
      })}
      {signing && (
        <SignDocumentDialog
          request={signing}
          projectName={project.name}
          signerName={project.coordinator}
          onClose={() => setSigning(null)}
          onSigned={(id) => setSignedIds((prev) => [...prev, id])}
          customDocumentUrl={carta}
        />
      )}
      {detailRequest && (
        <RequestDetailsDialog request={detailRequest} open={true} onClose={() => setDetailRequest(null)} />
      )}
      {viewSigned && (
        <SignedCartaDialog
          request={viewSigned}
          signerName={project.coordinator}
          signedAt={viewSigned.createdAt}
          onClose={() => setViewSigned(null)}
        />
      )}
    </div>
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
    info: "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-900",
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

function MiniStat({
  icon,
  value,
  label,
  highlight,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border px-2 py-1.5 flex flex-col items-center justify-center gap-0.5 transition-colors",
        highlight
          ? "border-amber-300 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400"
          : "border-border bg-muted/30 text-muted-foreground"
      )}
    >
      <div className="flex items-center gap-1 text-[11px] font-bold">
        {icon}
        <span className="tabular-nums">{value}</span>
      </div>
      <div className="text-[9px] uppercase tracking-wider">{label}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: RequestStatus }) {
  const map: Record<RequestStatus, { className: string; icon?: React.ReactNode }> = {
    em_analise: {
      className:
        "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900",
      icon: <Clock />,
    },
    aguardando_assinatura: {
      className:
        "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-900",
      icon: (
        <span className="relative flex size-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-current opacity-75 animate-ping" />
          <span className="relative inline-flex size-2 rounded-full bg-current" />
        </span>
      ),
    },
    pendente: {
      className:
        "bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-900",
      icon: <Clock />,
    },
    aprovado: {
      className:
        "bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-900",
      icon: <Clock />,
    },
    concluido: {
      className:
        "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900",
      icon: <CheckCircle2 className="size-3" />,
    },
    recusado: {
      className:
        "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900",
      icon: <AlertCircle className="size-3" />,
    },
  };
  const s = map[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full",
        s.className
      )}
    >
      {s.icon}
      {STATUS_LABEL[status]}
    </span>
  );
}

function Clock(props: React.SVGProps<SVGSVGElement>) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
}