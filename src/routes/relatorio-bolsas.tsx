import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Users,
  Wallet,
  CalendarClock,
  AlertTriangle,
  Search,
  CircleDollarSign,
  CalendarRange,
  ArrowRight,
  Briefcase,
  ChevronsUpDown,
  Check,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useActiveProfile } from "@/lib/profile";
import {
  BOLSAS,
  MEMBROS,
  PROJETOS,
  formatBRL,
  formatYearMonthLabel,
  formatYearMonthLong,
  getMembro,
  getProjeto,
  monthsBetween,
  nextMonth,
  parseYearMonth,
  type Bolsa,
} from "@/lib/equipe-bolsas-data";

export const Route = createFileRoute("/relatorio-bolsas")({
  head: () => ({
    meta: [
      { title: "Equipe Administrativa — Portal CEIA" },
      { name: "description", content: "Acompanhamento das bolsas recebidas pela equipe administrativa em cada projeto." },
    ],
  }),
  component: RelatorioBolsasPage,
});

// Data "atual" da plataforma (usada como marcador de hoje no Gantt).
const TODAY_YM = "2026-05";

function ymCompare(a: string, b: string): number {
  return a.localeCompare(b);
}

function ymToIndex(ym: string, originYm: string): number {
  const o = parseYearMonth(originYm);
  const t = parseYearMonth(ym);
  return (t.year - o.year) * 12 + (t.month - o.month);
}

function generateMonthRange(originYm: string, count: number): string[] {
  const out: string[] = [];
  let { year, month } = parseYearMonth(originYm);
  for (let i = 0; i < count; i++) {
    out.push(`${year}-${String(month).padStart(2, "0")}`);
    const n = nextMonth(year, month);
    year = n.year;
    month = n.month;
  }
  return out;
}

function RelatorioBolsasPage() {
  const profile = useActiveProfile();

  // Acesso restrito ao perfil "administrador" (Patrícia).
  if (profile.id !== "administrador") {
    return <Navigate to="/central-solicitacoes" />;
  }

  const [periodo, setPeriodo] = useState<"12" | "18" | "24">("18");
  const [projetoFiltro, setProjetoFiltro] = useState<string>("todos");
  const [busca, setBusca] = useState<string>("");
  const [aba, setAba] = useState<string>("timeline");

  // Janela do Gantt: começa 4 meses antes de hoje.
  const { originYm, months } = useMemo(() => {
    const totalMeses = Number(periodo);
    const back = 4;
    const t = parseYearMonth(TODAY_YM);
    // recua 4 meses
    let y = t.year;
    let m = t.month - back;
    while (m <= 0) {
      m += 12;
      y -= 1;
    }
    const originYm = `${y}-${String(m).padStart(2, "0")}`;
    const months = generateMonthRange(originYm, totalMeses);
    return { originYm, months };
  }, [periodo]);

  const totalCols = months.length;

  // Filtragem
  const bolsasFiltradas = useMemo(() => {
    return BOLSAS.filter((b) => {
      if (projetoFiltro !== "todos" && b.projetoId !== projetoFiltro) return false;
      if (busca.trim()) {
        const q = busca.trim().toLowerCase();
        const mem = getMembro(b.memberId);
        if (!mem) return false;
        if (
          !mem.nome.toLowerCase().includes(q) &&
          !mem.cargo.toLowerCase().includes(q) &&
          !b.projetoNome.toLowerCase().includes(q) &&
          !b.projetoSigla.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [projetoFiltro, busca]);

  const membrosVisiveis = useMemo(() => {
    const ids = new Set(bolsasFiltradas.map((b) => b.memberId));
    return MEMBROS.filter((m) => ids.has(m.id));
  }, [bolsasFiltradas]);

  // KPIs
  const kpis = useMemo(() => {
    const ativas = BOLSAS.filter((b) => ymCompare(b.inicio, TODAY_YM) <= 0 && ymCompare(b.fim, TODAY_YM) >= 0);
    const totalMensal = ativas.reduce((acc, b) => acc + b.valorMensal, 0);
    const membrosAtivos = new Set(ativas.map((b) => b.memberId)).size;
    const projetosAtivos = new Set(ativas.map((b) => b.projetoId)).size;

    // Encerramento próximos 3 meses.
    const t = parseYearMonth(TODAY_YM);
    const limiteY = t.year + (t.month + 2 > 12 ? 1 : 0);
    const limiteM = ((t.month + 2 - 1) % 12) + 1;
    const limiteYm = `${limiteY}-${String(limiteM).padStart(2, "0")}`;
    const encerrando = ativas.filter((b) => ymCompare(b.fim, limiteYm) <= 0);

    return {
      totalMensal,
      membrosAtivos,
      projetosAtivos,
      ativas: ativas.length,
      encerrando: encerrando.length,
    };
  }, []);

  return (
    <TooltipProvider delayDuration={150}>
      <div className="p-6 md:p-10 w-full">
        {/* CABEÇALHO */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight uppercase">Equipe Administrativa</h1>
          <p className="text-muted-foreground mt-2">
            Acompanhe quanto cada membro da sua equipe administrativa está recebendo, em quais projetos, e quando cada bolsa termina.
          </p>
        </div>

        {/* KPI cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          <KpiCard
            icon={<Wallet className="size-4" />}
            label="Custo mensal total"
            value={formatBRL(kpis.totalMensal)}
            hint={`${kpis.ativas} bolsa${kpis.ativas !== 1 ? "s" : ""} ativa${kpis.ativas !== 1 ? "s" : ""}`}
            tone="primary"
          />
          <KpiCard
            icon={<Users className="size-4" />}
            label="Membros recebendo"
            value={String(kpis.membrosAtivos)}
            hint={`de ${MEMBROS.length} na equipe`}
            tone="info"
          />
          <KpiCard
            icon={<AlertTriangle className="size-4" />}
            label="Encerrando em 90 dias"
            value={String(kpis.encerrando)}
            tone={kpis.encerrando > 0 ? "warning" : "muted"}
          />
        </div>

        {/* CONTEÚDO */}
        <div className="pt-4">
          <Tabs value={aba} onValueChange={setAba} className="space-y-5">
            <TabsList className="grid grid-cols-3 p-1 rounded-xl border bg-muted/40 gap-1 h-auto w-full">
              <TabsTrigger
                value="timeline"
                className={cn(
                  "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors w-full",
                  "text-muted-foreground hover:text-foreground hover:bg-card",
                  "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
                )}
              >
                <CalendarRange className="size-4" />
                <span>Linha do tempo</span>
              </TabsTrigger>
              <TabsTrigger
                value="membros"
                className={cn(
                  "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors w-full",
                  "text-muted-foreground hover:text-foreground hover:bg-card",
                  "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
                )}
              >
                <Users className="size-4" />
                <span>Por membro</span>
              </TabsTrigger>
              <TabsTrigger
                value="projetos"
                className={cn(
                  "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors w-full",
                  "text-muted-foreground hover:text-foreground hover:bg-card",
                  "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
                )}
              >
                <Briefcase className="size-4" />
                <span>Por projeto</span>
              </TabsTrigger>
            </TabsList>

            {/* Filtros */}
            <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
              <div className="relative flex-1">
                <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar por membro, cargo ou projeto..."
                  className="w-full rounded-lg border pl-10 pr-3 py-2 bg-white text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="flex items-center gap-2">
                <ProjetoCombobox value={projetoFiltro} onChange={setProjetoFiltro} />
              </div>
              <div className="flex items-center gap-2">
                <Select value={periodo} onValueChange={(v) => setPeriodo(v as typeof periodo)}>
                  <SelectTrigger className="rounded-lg border bg-white text-foreground px-3 py-2 w-[140px] h-auto shadow-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12">12 meses</SelectItem>
                    <SelectItem value="18">18 meses</SelectItem>
                    <SelectItem value="24">24 meses</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* === TIMELINE / GANTT === */}
            <TabsContent value="timeline" className="m-0">
              <GanttChart
                months={months}
                originYm={originYm}
                totalCols={totalCols}
                membrosVisiveis={membrosVisiveis}
                bolsasFiltradas={bolsasFiltradas}
              />
              <LegendaProjetos className="mt-5" />
            </TabsContent>

            {/* === POR MEMBRO === */}
            <TabsContent value="membros" className="m-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {membrosVisiveis.length === 0 && <EmptyState />}
                {membrosVisiveis.map((m) => {
                  const bolsasMem = bolsasFiltradas
                    .filter((b) => b.memberId === m.id)
                    .sort((a, b) => ymCompare(a.fim, b.fim));
                  const ativas = bolsasMem.filter((b) => ymCompare(b.inicio, TODAY_YM) <= 0 && ymCompare(b.fim, TODAY_YM) >= 0);
                  const totalMes = ativas.reduce((acc, b) => acc + b.valorMensal, 0);
                  return (
                    <div key={m.id} className="rounded-2xl border bg-card overflow-hidden">
                      <div className="p-5 border-b bg-primary/5">
                        <div className="flex items-start gap-3.5">
                          <div className="size-12 rounded-full bg-primary/15 text-primary flex items-center justify-center font-semibold text-base shrink-0">
                            {m.iniciais}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[10px] uppercase tracking-wider text-primary font-semibold">Membro</div>
                            <div className="font-semibold text-foreground truncate">{m.nome}</div>
                            <div className="text-[11px] text-muted-foreground truncate mt-0.5">{m.email}</div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Recebendo / mês</div>
                            <div className="text-lg font-bold text-foreground">{formatBRL(totalMes)}</div>
                            <div className="text-[11px] text-muted-foreground">{ativas.length} bolsa{ativas.length !== 1 ? "s" : ""} ativa{ativas.length !== 1 ? "s" : ""}</div>
                          </div>
                        </div>
                      </div>
                      <div className="divide-y">
                        {bolsasMem.map((b) => (
                          <BolsaRow key={b.id} b={b} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            {/* === POR PROJETO === */}
            <TabsContent value="projetos" className="m-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {PROJETOS.filter((p) => projetoFiltro === "todos" || p.id === projetoFiltro)
                  .map((p) => {
                    const bolsasProj = bolsasFiltradas.filter((b) => b.projetoId === p.id);
                    if (bolsasProj.length === 0) return null;
                    const ativas = bolsasProj.filter((b) => ymCompare(b.inicio, TODAY_YM) <= 0 && ymCompare(b.fim, TODAY_YM) >= 0);
                    const totalMes = ativas.reduce((acc, b) => acc + b.valorMensal, 0);
                    return (
                      <div key={p.id} className="rounded-2xl border bg-card overflow-hidden">
                        <div className="p-5 border-b bg-blue-50">
                          <div className="flex items-start gap-3">
                            <div className="size-12 rounded-xl flex items-center justify-center bg-blue-100 text-blue-800 shrink-0">
                              <Briefcase className="size-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[10px] uppercase tracking-wider text-blue-800 font-semibold">Projeto</div>
                              <div className="font-semibold text-foreground truncate">{p.nome}</div>
                              <div className="text-xs text-muted-foreground mt-0.5">{ativas.length} bolsa{ativas.length !== 1 ? "s" : ""} ativa{ativas.length !== 1 ? "s" : ""} • {new Set(bolsasProj.map((b) => b.memberId)).size} membro{new Set(bolsasProj.map((b) => b.memberId)).size !== 1 ? "s" : ""}</div>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Saída / mês</div>
                              <div className="text-lg font-bold text-foreground">{formatBRL(totalMes)}</div>
                            </div>
                          </div>
                        </div>
                        <div className="divide-y">
                          {bolsasProj.map((b) => (
                            <BolsaRow key={b.id} b={b} showMembro hideProjeto />
                          ))}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </TooltipProvider>
  );
}

// ----------------------------------------------------------------------
// Subcomponents
// ----------------------------------------------------------------------

function KpiCard({
  icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
  tone: "primary" | "warning" | "info" | "muted" | "purple" | "success";
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
          "size-10 rounded-lg border flex items-center justify-center shrink-0 bg-primary-soft text-primary border-primary/20"
        )}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-2xl font-bold leading-none text-foreground tabular-nums">{value}</div>
        <div className="text-xs text-muted-foreground mt-1 leading-tight">
          {label}
          {hint && <span className="opacity-70"> • {hint}</span>}
        </div>
      </div>
    </div>
  );
}

function GanttChart({
  months,
  originYm,
  totalCols,
  membrosVisiveis,
  bolsasFiltradas,
}: {
  months: string[];
  originYm: string;
  totalCols: number;
  membrosVisiveis: ReturnType<typeof getMembro> extends infer T ? Exclude<T, undefined>[] : never;
  bolsasFiltradas: Bolsa[];
}) {
  // largura por mês (px). Mantemos generoso para legibilidade.
  const COL_W = 64;
  const LEFT_W = 240;
  const ROW_H = 44;

  const todayIdx = ymToIndex(TODAY_YM, originYm);
  const todayInsideWindow = todayIdx >= 0 && todayIdx < totalCols;

  if (membrosVisiveis.length === 0) return <EmptyState />;

  // Agrupar anos para cabeçalho de ano
  const yearHeaders: { year: number; span: number }[] = [];
  months.forEach((ym) => {
    const { year } = parseYearMonth(ym);
    const last = yearHeaders[yearHeaders.length - 1];
    if (last && last.year === year) last.span += 1;
    else yearHeaders.push({ year, span: 1 });
  });

  return (
    <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <div style={{ minWidth: LEFT_W + totalCols * COL_W }}>
          {/* HEADER ANOS */}
          <div className="flex border-b bg-muted/40 sticky top-0 z-10">
            <div
              className="shrink-0 px-4 py-2 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold border-r flex items-center justify-center sticky left-0 z-[6]"
              style={{ width: LEFT_W, background: "color-mix(in oklch, var(--muted) 40%, var(--card))" }}
            >
              Membro / Bolsa
            </div>
            <div className="flex">
              {yearHeaders.map((yh, i) => (
                <div
                  key={i}
                  className="border-r text-center py-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider"
                  style={{ width: yh.span * COL_W }}
                >
                  {yh.year}
                </div>
              ))}
            </div>
          </div>

          {/* HEADER MESES */}
          <div className="flex border-b bg-muted/20">
            <div
              className="shrink-0 border-r sticky left-0 z-[6]"
              style={{ width: LEFT_W, background: "color-mix(in oklch, var(--muted) 20%, var(--card))" }}
            />
            <div className="flex">
              {months.map((ym, i) => {
                const { month } = parseYearMonth(ym);
                const isToday = ym === TODAY_YM;
                return (
                  <div
                    key={i}
                    className={cn(
                      "border-r text-center py-1.5 text-[10.5px] font-medium tabular-nums",
                      isToday ? "text-primary font-bold" : "text-muted-foreground"
                    )}
                    style={{ width: COL_W }}
                  >
                    {["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"][month - 1]}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ROWS */}
          <div className="relative">
            {/* Linha vertical de HOJE */}
            {todayInsideWindow && (
              <div
                className="absolute top-0 bottom-0 pointer-events-none z-[5]"
                style={{ left: LEFT_W + todayIdx * COL_W + COL_W / 2 - 1, width: 2 }}
              >
                <div className="w-[2px] h-full bg-primary/70" style={{ boxShadow: "0 0 0 1px var(--background)" }} />
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 size-2.5 rounded-full bg-primary border-2 border-background" />
              </div>
            )}

            {membrosVisiveis.map((m, mi) => {
              const bolsasMem = bolsasFiltradas
                .filter((b) => b.memberId === m.id)
                .sort((a, b) => ymCompare(a.inicio, b.inicio));
              const totalMes = bolsasMem
                .filter((b) => ymCompare(b.inicio, TODAY_YM) <= 0 && ymCompare(b.fim, TODAY_YM) >= 0)
                .reduce((acc, b) => acc + b.valorMensal, 0);
              return (
                <div key={m.id} className={cn("flex border-b last:border-b-0", mi % 2 === 1 && "bg-muted/15")}>
                  {/* Coluna fixa do membro */}
                  <div
                    className="shrink-0 border-r p-3 sticky left-0 z-[7] bg-inherit flex items-center justify-center"
                    style={{ width: LEFT_W, background: mi % 2 === 1 ? "color-mix(in oklch, var(--muted) 15%, var(--card))" : "var(--card)" }}
                  >
                    <div className="flex flex-col items-center gap-1 text-center w-full">
                      <div className="size-9 rounded-full bg-primary/15 text-primary flex items-center justify-center font-semibold text-xs shrink-0">
                        {m.iniciais}
                      </div>
                      <div className="min-w-0 w-full">
                        <div className="font-semibold text-sm text-foreground truncate">{m.nome}</div>
                        {totalMes > 0 && (
                          <div className="text-[11px] font-semibold text-primary mt-0.5 tabular-nums">
                            {formatBRL(totalMes)}/mês
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Faixa do Gantt */}
                  <div className="relative flex-1" style={{ minHeight: bolsasMem.length * ROW_H + 8 }}>
                    {/* Grid de fundo */}
                    <div className="absolute inset-0 flex pointer-events-none">
                      {months.map((ym, i) => {
                        const isToday = ym === TODAY_YM;
                        return (
                          <div
                            key={i}
                            className={cn(
                              "border-r",
                              isToday ? "bg-primary/[0.04]" : ""
                            )}
                            style={{ width: COL_W, borderColor: "color-mix(in oklch, var(--border) 70%, transparent)" }}
                          />
                        );
                      })}
                    </div>

                    {/* Barras */}
                    <div className="relative py-1">
                      {bolsasMem.map((b, i) => {
                        const startIdx = ymToIndex(b.inicio, originYm);
                        const endIdx = ymToIndex(b.fim, originYm);
                        // Clipping ao período visível
                        const visStart = Math.max(0, startIdx);
                        const visEnd = Math.min(totalCols - 1, endIdx);
                        if (visEnd < 0 || visStart > totalCols - 1) return null;
                        const left = visStart * COL_W + 4;
                        const width = (visEnd - visStart + 1) * COL_W - 8;
                        const projeto = getProjeto(b.projetoId);
                        const cor = projeto?.cor ?? "oklch(0.6 0.15 256)";
                        const clippedStart = visStart > startIdx;
                        const clippedEnd = visEnd < endIdx;

                        // "Encerrando em breve": fim em até 3 meses
                        const monthsToEnd = monthsBetween(TODAY_YM, b.fim);
                        const endingSoon = monthsToEnd > 0 && monthsToEnd <= 3 && ymCompare(b.fim, TODAY_YM) >= 0;
                        const finalizada = ymCompare(b.fim, TODAY_YM) < 0;
                        const naoIniciada = ymCompare(b.inicio, TODAY_YM) > 0;

                        return (
                          <Tooltip key={b.id}>
                            <TooltipTrigger asChild>
                              <div
                                className={cn(
                                  "absolute h-9 rounded-lg flex items-center px-2.5 cursor-pointer transition-all hover:brightness-110 hover:shadow-md group",
                                  finalizada && "opacity-55",
                                )}
                                style={{
                                  top: i * ROW_H + 4,
                                  left,
                                  width: Math.max(width, 24),
                                  background: `color-mix(in oklch, ${cor} 22%, white)`,
                                  color: `color-mix(in oklch, ${cor} 55%, black)`,
                                  borderTopLeftRadius: clippedStart ? 2 : 8,
                                  borderBottomLeftRadius: clippedStart ? 2 : 8,
                                  borderTopRightRadius: clippedEnd ? 2 : 8,
                                  borderBottomRightRadius: clippedEnd ? 2 : 8,
                                  borderLeft: `3px solid ${cor}`,
                                }}
                              >
                                <span className="text-[11px] font-semibold truncate flex-1">
                                  {projeto?.sigla} • {formatBRL(b.valorMensal)}
                                </span>
                                {endingSoon && (
                                  <span className="ml-1 inline-flex items-center justify-center size-4 rounded-full bg-white shrink-0" title="Encerra em breve">
                                    <AlertTriangle className="size-2.5 text-amber-600" />
                                  </span>
                                )}
                                {naoIniciada && (
                                  <span className="ml-1 inline-flex items-center justify-center text-[9px] font-bold bg-black/10 rounded px-1 py-px shrink-0">
                                    EM BREVE
                                  </span>
                                )}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs bg-popover text-popover-foreground border shadow-md">
                              <div className="space-y-1">
                                <div className="font-semibold text-sm text-foreground">{projeto?.nome}</div>
                                <div className="text-xs flex items-center gap-1.5 pt-1 text-muted-foreground">
                                  <CircleDollarSign className="size-3" />
                                  <span className="font-semibold text-foreground">{formatBRL(b.valorMensal)}/mês</span>
                                  <span className="text-muted-foreground">• total {formatBRL(b.valorMensal * monthsBetween(b.inicio, b.fim))}</span>
                                </div>
                                <div className="text-xs flex items-center gap-1.5 text-muted-foreground">
                                  <CalendarClock className="size-3" />
                                  <span className="text-foreground">{formatYearMonthLabel(b.inicio)}</span>
                                  <ArrowRight className="size-3 opacity-60" />
                                  <span className="text-foreground">{formatYearMonthLabel(b.fim)}</span>
                                  <span>({monthsBetween(b.inicio, b.fim)} m)</span>
                                </div>
                                {endingSoon && (
                                  <div className="text-xs flex items-center gap-1.5 text-amber-600 font-semibold pt-1">
                                    <AlertTriangle className="size-3" />
                                    Encerra em {monthsToEnd} {monthsToEnd === 1 ? "mês" : "meses"}
                                  </div>
                                )}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function BolsaRow({ b, showMembro = false, hideProjeto = false }: { b: Bolsa; showMembro?: boolean; hideProjeto?: boolean }) {
  const projeto = getProjeto(b.projetoId);
  const monthsToEnd = monthsBetween(TODAY_YM, b.fim);
  const finalizada = ymCompare(b.fim, TODAY_YM) < 0;
  const naoIniciada = ymCompare(b.inicio, TODAY_YM) > 0;
  const endingSoon = !finalizada && !naoIniciada && monthsToEnd <= 3;
  const ativa = !finalizada && !naoIniciada;
  const mem = getMembro(b.memberId);

  return (
    <div className="p-5 flex items-center gap-3.5 hover:bg-muted/30 transition-colors">
      {!hideProjeto && (
        <div className="size-12 rounded-xl flex items-center justify-center bg-blue-100 text-blue-800 shrink-0">
          <Briefcase className="size-5" />
        </div>
      )}
      {showMembro && mem && (
        <div className="size-12 rounded-full bg-primary/15 text-primary flex items-center justify-center font-semibold text-sm shrink-0">
          {mem.iniciais}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className={cn("text-[10px] uppercase tracking-wider font-semibold", showMembro ? "text-primary" : "text-blue-800")}>
          {showMembro ? "Membro" : "Projeto"}
        </div>
        <div className="flex items-center gap-2 flex-wrap mt-0.5">
          <span className="font-medium text-sm text-foreground truncate">
            {showMembro && mem ? mem.nome : projeto?.sigla}
          </span>
          {ativa && <Badge variant="secondary" className="text-[10px] py-0 px-1.5 h-4 bg-[color:var(--status-approved)]/15 text-[color:var(--status-approved-fg)] border-0">Ativa</Badge>}
          {endingSoon && <Badge variant="secondary" className="text-[10px] py-0 px-1.5 h-4 bg-[color:var(--status-pending)]/15 text-[color:var(--status-pending-fg)] border-0">Encerra em {monthsToEnd}m</Badge>}
          {finalizada && <Badge variant="secondary" className="text-[10px] py-0 px-1.5 h-4">Encerrada</Badge>}
          {naoIniciada && <Badge variant="secondary" className="text-[10px] py-0 px-1.5 h-4 bg-[color:var(--status-signature)]/15 text-[color:var(--status-signature-fg)] border-0">Em breve</Badge>}
        </div>
        {!hideProjeto && projeto && (
          <div className="text-xs text-muted-foreground mt-0.5 truncate">{projeto.nome}</div>
        )}
        <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1.5">
          <CalendarClock className="size-3" />
          <span>{formatYearMonthLabel(b.inicio)}</span>
          <ArrowRight className="size-3 opacity-60" />
          <span>{formatYearMonthLabel(b.fim)}</span>
          <span className="opacity-60">• {monthsBetween(b.inicio, b.fim)} meses</span>
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="font-bold text-foreground tabular-nums">{formatBRL(b.valorMensal)}</div>
        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">por mês</div>
      </div>
    </div>
  );
}

function LegendaProjetos({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3 text-xs", className)}>
      <span className="text-muted-foreground uppercase tracking-wider text-[11px] font-semibold">Projetos:</span>
      {PROJETOS.map((p) => (
        <span key={p.id} className="inline-flex items-center gap-1.5 rounded-full border bg-card px-2.5 py-1">
          <span className="size-2.5 rounded-sm" style={{ background: p.cor }} />
          <span className="font-medium text-foreground">{p.sigla}</span>
          <span className="text-muted-foreground hidden md:inline">— {p.nome.split("—")[1]?.trim() ?? p.nome}</span>
        </span>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed bg-card p-12 text-center">
      <div className="mx-auto size-12 rounded-full bg-muted flex items-center justify-center mb-3">
        <Search className="size-5 text-muted-foreground" />
      </div>
      <div className="font-semibold text-foreground">Nenhum resultado</div>
      <p className="text-sm text-muted-foreground mt-1">
        Ajuste os filtros para ver as bolsas da equipe.
      </p>
    </div>
  );
}

function ProjetoCombobox({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = value === "todos" ? null : PROJETOS.find((p) => p.id === value);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "flex w-[220px] items-center justify-between gap-2 rounded-lg border bg-white text-foreground px-3 py-2 text-sm",
            "focus:outline-none focus:ring-2 focus:ring-ring",
            "hover:bg-accent/30 transition-colors"
          )}
        >
          {selected ? (
            <span className="flex items-center gap-2 min-w-0">
              <span className="size-2.5 rounded-sm shrink-0" style={{ background: selected.cor }} />
              <span className="truncate">{selected.sigla}</span>
            </span>
          ) : (
            <span className="text-muted-foreground">Todos os projetos</span>
          )}
          <ChevronsUpDown className="size-4 opacity-50 shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[280px] p-0">
        <Command>
          <CommandInput placeholder="Buscar projeto..." />
          <CommandList>
            <CommandEmpty>Nenhum projeto encontrado.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="Todos os projetos"
                onSelect={() => {
                  onChange("todos");
                  setOpen(false);
                }}
              >
                <Check className={cn("mr-2 size-4", value === "todos" ? "opacity-100" : "opacity-0")} />
                <span className="size-2.5 rounded-sm bg-muted-foreground/40 mr-2 shrink-0" />
                Todos os projetos
              </CommandItem>
              {PROJETOS.map((p) => (
                <CommandItem
                  key={p.id}
                  value={`${p.sigla} ${p.nome}`}
                  onSelect={() => {
                    onChange(p.id);
                    setOpen(false);
                  }}
                >
                  <Check className={cn("mr-2 size-4", value === p.id ? "opacity-100" : "opacity-0")} />
                  <span className="size-2.5 rounded-sm mr-2 shrink-0" style={{ background: p.cor }} />
                  <span className="font-medium">{p.sigla}</span>
                  <span className="ml-2 text-xs text-muted-foreground truncate">{p.nome.split("—")[1]?.trim() ?? p.nome}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
