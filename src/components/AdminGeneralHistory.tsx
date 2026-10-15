import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Bell,
  Calendar,
  Check,
  DollarSign,
  FileEdit,
  Info,
  Inbox,
  ListFilter,
  Plane,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { MOCK_REQUESTS, PROJECTS } from "@/lib/ptr-data";
import {
  APPROVALS_MOCK,
  type ApprovalItem,
} from "@/routes/central-solicitacoes.passagens-diarias";
import {
  COMPRAS_APPROVALS_MOCK,
  type ComprasApprovalItem,
} from "@/routes/central-solicitacoes.compras-pagamentos";

/**
 * Histórico geral consolidado da Equipe Administrativa: agrega solicitações
 * de Ajuste de PTR, Passagens e Diárias e Compras e Pagamentos, com filtro
 * por tipo e marcação de "novas" desde a última visita.
 *
 * Mantém o mesmo design dos painéis "Histórico geral" antes existentes em
 * cada página de solicitação, agora unificados na Central de Solicitações.
 */

type Tipo = "ptr" | "passagens" | "compras";

type UnifiedItem = {
  id: string;
  tipo: Tipo;
  solicitante: string;
  email?: string;
  dataSolicitacao: string; // dd/mm/yyyy
  subtitle?: string;
  href: string;
};

const STORAGE_SEEN = "ceia.adminGeneral.seenIds";
const STORAGE_LAST = "ceia.adminGeneral.lastVisit";

const TIPO_META: Record<
  Tipo,
  {
    label: string;
    short: string;
    icon: React.ComponentType<{ className?: string }>;
    chip: string; // badge classes
    avatar: string; // avatar tile classes
  }
> = {
  ptr: {
    label: "Ajuste de PTR",
    short: "PTR",
    icon: FileEdit,
    chip: "bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-900",
    avatar: "bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300",
  },
  passagens: {
    label: "Passagens e Diárias",
    short: "Passagens",
    icon: Plane,
    chip: "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-900",
    avatar: "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300",
  },
  compras: {
    label: "Compras e Pagamentos",
    short: "Compras",
    icon: DollarSign,
    chip: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900",
    avatar: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
  },
};

function parseBR(d: string): number {
  const [dd, mm, yyyy] = d.split("/").map((x) => parseInt(x, 10));
  if (!dd || !mm || !yyyy) return 0;
  return new Date(yyyy, mm - 1, dd).getTime();
}

function todayBR(): string {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

function readLastVisit(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(STORAGE_LAST) || "";
}

function readSeenIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_SEEN);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function buildUnified(): UnifiedItem[] {
  const ptr: UnifiedItem[] = MOCK_REQUESTS.map((r) => {
    const project = PROJECTS.find((p) => p.id === r.projectId);
    const solicitante = project?.coordinator ?? "—";
    const email = project
      ? `${project.coordinator
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/\s+/g, ".")}@ceia.ufg.br`
      : undefined;
    return {
      id: r.id,
      tipo: "ptr" as const,
      solicitante,
      email,
      dataSolicitacao: r.createdAt,
      subtitle: project?.name ?? r.projectName,
      href: "/central-solicitacoes/ajuste-ptr",
    };
  });

  const pas: UnifiedItem[] = APPROVALS_MOCK.map((a: ApprovalItem) => ({
    id: a.id,
    tipo: "passagens" as const,
    solicitante: a.solicitante,
    email: a.email,
    dataSolicitacao: a.dataSolicitacao,
    subtitle: a.projetoSolicitado ?? a.projetoCustos,
    href: "/central-solicitacoes/passagens-diarias",
  }));

  const cmp: UnifiedItem[] = COMPRAS_APPROVALS_MOCK.map((c: ComprasApprovalItem) => ({
    id: c.id,
    tipo: "compras" as const,
    solicitante: c.solicitante,
    email: c.email,
    dataSolicitacao: c.dataSolicitacao,
    subtitle: c.projetoSolicitado,
    href: "/central-solicitacoes/compras-pagamentos",
  }));

  return [...ptr, ...pas, ...cmp].sort(
    (a, b) => parseBR(b.dataSolicitacao) - parseBR(a.dataSolicitacao)
  );
}

function TipoBadge({ tipo }: { tipo: Tipo }) {
  const meta = TIPO_META[tipo];
  const Icon = meta.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        meta.chip
      )}
    >
      <Icon className="size-3" />
      {meta.label}
    </span>
  );
}

export function AdminGeneralHistory({ hideHeader = false }: { hideHeader?: boolean } = {}) {
  const items = useMemo(() => buildUnified(), []);
  const [filter, setFilter] = useState<"todos" | Tipo>("todos");

  const filtered = useMemo(
    () => (filter === "todos" ? items : items.filter((i) => i.tipo === filter)),
    [items, filter]
  );

  // "Novas" = qualquer item ainda não visto no localStorage. Para a
  // demonstração, garantimos no mínimo as 3 mais recentes do total como novas.
  const seenAtMount = useMemo(() => {
    const stored = readSeenIds();
    items.slice(3).forEach((it) => stored.add(it.id));
    return stored;
  }, [items]);
  const lastVisit = useMemo(() => readLastVisit(), []);
  const novosCountTotal = useMemo(
    () => items.filter((it) => !seenAtMount.has(it.id)).length,
    [items, seenAtMount]
  );
  const novosCount = useMemo(
    () => filtered.filter((it) => !seenAtMount.has(it.id)).length,
    [filtered, seenAtMount]
  );

  // On unmount, persist as seen
  useEffect(() => {
    if (typeof window === "undefined") return;
    return () => {
      const allIds = items.map((i) => i.id);
      window.localStorage.setItem(STORAGE_SEEN, JSON.stringify(allIds));
      window.localStorage.setItem(STORAGE_LAST, todayBR());
    };
  }, [items]);

  const grouped = useMemo(() => {
    const map = new Map<string, UnifiedItem[]>();
    for (const it of filtered) {
      const arr = map.get(it.dataSolicitacao) ?? [];
      arr.push(it);
      map.set(it.dataSolicitacao, arr);
    }
    return Array.from(map.entries());
  }, [filtered]);

  const counts = useMemo(
    () => ({
      todos: items.length,
      ptr: items.filter((i) => i.tipo === "ptr").length,
      passagens: items.filter((i) => i.tipo === "passagens").length,
      compras: items.filter((i) => i.tipo === "compras").length,
    }),
    [items]
  );

  const filterChips: { key: "todos" | Tipo; label: string; count: number }[] = [
    { key: "todos", label: "Todas as solicitações", count: counts.todos },
    { key: "ptr", label: "Ajuste de PTR", count: counts.ptr },
    { key: "passagens", label: "Passagens e Diárias", count: counts.passagens },
    { key: "compras", label: "Compras e Pagamentos", count: counts.compras },
  ];

  const showAlert = novosCountTotal > 0;
  const today = todayBR();

  return (
    <section className={hideHeader ? "" : "mt-10"}>
      {/* Cabeçalho da seção */}
      {!hideHeader && (
        <div
          className={cn(
            "mb-5",
            hideHeader ? "" : "border-t pt-8"
          )}
        >
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-primary font-semibold">
              <Inbox className="size-3.5" />
              Equipe Administrativa
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight mt-1">
              Histórico geral de solicitações
            </h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
              Acompanhe em um só lugar todas as solicitações enviadas para o List —
              Ajuste de PTR, Passagens e Diárias e Compras e Pagamentos.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-5">
        {/* Alert banner */}
        {showAlert && (
          <div className="relative overflow-hidden rounded-xl border border-primary/30 bg-primary/[0.06]">
            <div className="p-4 sm:p-5 flex items-center gap-4">
              <div className="relative shrink-0">
                <div className="size-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
                  <Bell className="size-5" />
                </div>
                <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping [animation-duration:2.5s] scale-90" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-foreground">
                  {novosCountTotal === 1
                    ? "Há 1 nova solicitação"
                    : `Há ${novosCountTotal} novas solicitações`} desde sua última visita
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {lastVisit ? (
                    <>
                      Última vez que você acessou:{" "}
                      <span className="font-medium text-foreground tabular-nums">{lastVisit}</span>
                    </>
                  ) : (
                    "Você ainda não tinha acessado este histórico."
                  )}
                </div>
              </div>
              <div className="hidden sm:inline-flex items-center gap-1 rounded-full bg-primary text-primary-foreground px-3 py-1.5 text-xs font-bold shrink-0 tabular-nums">
                {novosCountTotal}
              </div>
            </div>
          </div>
        )}

        {/* Status + Filtro */}
        <div className="flex items-center justify-between gap-3 flex-wrap text-xs text-muted-foreground">
          {!showAlert && novosCount === 0 ? (
            <span className="inline-flex items-center gap-1.5 text-emerald-700 font-medium">
              <Check className="size-3.5" /> Você está em dia
            </span>
          ) : (
            <span />
          )}
          <Popover>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  "inline-flex items-center gap-2 h-10 px-4 rounded-lg border text-sm font-medium transition-all shadow-sm",
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
                Filtrar por tipo de solicitação
              </div>
              <div className="flex flex-col">
                {filterChips.map((chip) => {
                  const active = filter === chip.key;
                  return (
                    <button
                      key={chip.key}
                      onClick={() => setFilter(chip.key)}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-left transition-colors",
                        active ? "text-foreground" : "text-muted-foreground hover:bg-accent"
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

        {/* Feed agrupado por data */}
        {grouped.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 flex flex-col items-center gap-3 text-center">
            <div className="size-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
              <Inbox className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Nenhuma solicitação encontrada
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Ajuste o filtro para ver outras categorias.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {grouped.map(([date, dayItems]) => {
              const dayHasNew = dayItems.some((it) => !seenAtMount.has(it.id));
              const isToday = date === today;
              return (
                <section key={date}>
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={cn(
                        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold border",
                        dayHasNew
                          ? "bg-primary/10 text-primary border-primary/20"
                          : "bg-muted/40 text-muted-foreground border-transparent"
                      )}
                    >
                      <Calendar className="size-3.5" />
                      <span className="tabular-nums">{date}</span>
                      {isToday && (
                        <span className="text-[10px] uppercase tracking-wider opacity-80">
                          • Hoje
                        </span>
                      )}
                    </div>
                    <div className="flex-1 h-px bg-border" />
                    <div className="text-[11px] text-muted-foreground tabular-nums">
                      {dayItems.length} {dayItems.length === 1 ? "item" : "itens"}
                    </div>
                  </div>

                  <ul className="rounded-xl border bg-card overflow-hidden divide-y">
                    {dayItems.map((it) => {
                      const isNew = !seenAtMount.has(it.id);
                      const meta = TIPO_META[it.tipo];
                      const initials = it.solicitante
                        .split(" ")
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((n) => n[0]?.toUpperCase())
                        .join("");
                      return (
                        <li
                          key={`${it.tipo}-${it.id}`}
                          className={cn(
                            "relative transition-colors",
                            isNew ? "bg-primary/[0.04]" : ""
                          )}
                        >
                          <div
                            className={cn(
                              "flex items-center gap-4 px-4 sm:px-5 py-3.5"
                            )}
                          >
                            <div
                              className={cn(
                                "size-10 rounded-full flex items-center justify-center font-semibold text-xs shrink-0",
                                meta.avatar
                              )}
                            >
                              {initials}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-semibold text-foreground truncate">
                                  {it.solicitante}
                                </span>
                                {isNew && (
                                  <span className="size-1.5 rounded-full bg-primary shrink-0" aria-hidden />
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground truncate">
                                {it.subtitle ?? it.email ?? ""}
                              </div>
                              {it.tipo === "ptr" && (
                                <div className="text-[11px] text-muted-foreground/80 truncate font-mono mt-0.5">
                                  {it.id}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <TipoBadge tipo={it.tipo} />
                              {isNew && (
                                <span className="inline-flex items-center text-[10px] font-bold bg-primary text-primary-foreground px-2 py-1 rounded-md uppercase tracking-wider">
                                  Novo
                                </span>
                              )}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
