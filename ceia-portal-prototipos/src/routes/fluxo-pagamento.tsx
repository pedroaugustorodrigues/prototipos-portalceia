import { createFileRoute, Navigate } from "@tanstack/react-router";
import { Fragment, useMemo, useState } from "react";
import {
  ArrowRight,
  Building2,
  CalendarRange,
  Check,
  ChevronLeft,
  Clock,
  Inbox,
  Plus,
  Search,
  Users,
  Wallet,
} from "lucide-react";
import { useActiveProfile } from "@/lib/profile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BOLSAS,
  PROJETOS,
  formatBRL,
  formatYearMonthLabel,
  formatYearMonthLong,
  getMembro,
  getProjeto,
  parseYearMonth,
} from "@/lib/equipe-bolsas-data";
import {
  CCS,
  CC_POR_BOLSA,
  CPF_POR_MEMBRO,
  EXTRAS,
  getCc,
  type BolsaTag,
} from "@/lib/bolsistas-shared";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/fluxo-pagamento")({
  component: FluxoPagamentoPage,
});

// ----------------- Mock complementar -----------------

// ----------------- Helpers -----------------
function isMonthInRange(ym: string, inicio: string, fim: string): boolean {
  return ym >= inicio && ym <= fim;
}

// Estado de pagamento default: meses passados = pago, atual e futuros = pendente.
const HOJE_YM = "2026-05";

function defaultPago(ym: string): boolean {
  return ym < HOJE_YM;
}

// ----------------- Componente -----------------
function FluxoPagamentoPage() {
  const profile = useActiveProfile();

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [anoFiltro, setAnoFiltro] = useState<string>("todos");
  const [pagamentos] = useState<Record<string, boolean>>({});
  // Marcação S.O. / UE (rara) — definida manualmente; começa vazia.
  const [tags, setTags] = useState<Record<string, BolsaTag>>({});
  const [pickerQuery, setPickerQuery] = useState("");
  const [pickerFilter, setPickerFilter] = useState<
    "todos" | "com_pendencias" | "em_dia" | "sem_bolsas"
  >("todos");

  const meses = useMemo(() => {
    if (anoFiltro === "todos") {
      const bolsasEscopo = BOLSAS.filter(
        (b) => !selectedProjectId || b.projetoId === selectedProjectId,
      );
      const extrasEscopo = EXTRAS.filter(
        (e) => !selectedProjectId || e.projetoId === selectedProjectId,
      );
      const todos: Array<{ inicio: string; fim: string }> = [
        ...bolsasEscopo,
        ...extrasEscopo,
      ];
      if (todos.length === 0) return [];
      let inicio = todos[0].inicio;
      let fim = todos[0].fim;
      for (const b of todos) {
        if (b.inicio < inicio) inicio = b.inicio;
        if (b.fim > fim) fim = b.fim;
      }
      const [yiS, miS] = inicio.split("-");
      const [yfS, mfS] = fim.split("-");
      let y = Number(yiS);
      let m = Number(miS);
      const yf = Number(yfS);
      const mf = Number(mfS);
      const out: string[] = [];
      while (y < yf || (y === yf && m <= mf)) {
        out.push(`${y}-${String(m).padStart(2, "0")}`);
        m++;
        if (m > 12) {
          m = 1;
          y++;
        }
      }
      return out;
    }
    const ano = Number(anoFiltro);
    return Array.from({ length: 12 }, (_, i) => `${ano}-${String(i + 1).padStart(2, "0")}`);
  }, [anoFiltro, selectedProjectId]);

  // Cada linha = uma bolsa. Cada bolsa pertence a um CC do projeto.
  const linhas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const base = BOLSAS.filter((b) => !selectedProjectId || b.projetoId === selectedProjectId).map((b) => {
      const membro = getMembro(b.memberId);
      const projeto = getProjeto(b.projetoId);
      const cc = getCc(CC_POR_BOLSA[b.id]);
      return {
        bolsaId: b.id,
        memberId: b.memberId,
        nome: membro?.nome ?? "—",
        iniciais: membro?.iniciais ?? "—",
        cpf: CPF_POR_MEMBRO[b.memberId] ?? "—",
        projetoId: b.projetoId,
        projetoSigla: projeto?.sigla ?? "—",
        projetoNome: projeto?.nome ?? "—",
        projetoCor: projeto?.cor ?? "oklch(0.7 0.05 240)",
        ccId: cc?.id ?? "sem-cc",
        ccCodigo: cc?.codigo ?? "—",
        ccNome: cc?.nome ?? "—",
        rubrica: b.rubrica,
        valor: b.valorMensal,
        inicio: b.inicio,
        fim: b.fim,
      };
    });
    const extras = EXTRAS.filter((e) => !selectedProjectId || e.projetoId === selectedProjectId).map((e) => {
      const projeto = getProjeto(e.projetoId);
      const cc = getCc(e.ccId);
      return {
        bolsaId: e.bolsaId,
        memberId: e.memberId,
        nome: e.nome,
        iniciais: e.iniciais,
        cpf: e.cpf,
        projetoId: e.projetoId,
        projetoSigla: projeto?.sigla ?? "—",
        projetoNome: projeto?.nome ?? "—",
        projetoCor: projeto?.cor ?? "oklch(0.7 0.05 240)",
        ccId: cc?.id ?? "sem-cc",
        ccCodigo: cc?.codigo ?? "—",
        ccNome: cc?.nome ?? "—",
        rubrica: e.rubrica,
        valor: e.valor,
        inicio: e.inicio,
        fim: e.fim,
      };
    });
    return [...base, ...extras]
      .filter((l) => {
        if (!termo) return true;
        return (
          l.nome.toLowerCase().includes(termo) ||
          l.cpf.includes(termo) ||
          l.ccCodigo.toLowerCase().includes(termo) ||
          l.ccNome.toLowerCase().includes(termo)
        );
      })
      .sort((a, b) => a.ccCodigo.localeCompare(b.ccCodigo) || a.nome.localeCompare(b.nome));
  }, [busca, selectedProjectId]);

  // Agrupado por CC, na ordem definida em CCS.
  const grupos = useMemo(() => {
    const map = new Map<string, typeof linhas>();
    for (const l of linhas) {
      if (!map.has(l.ccId)) map.set(l.ccId, []);
      map.get(l.ccId)!.push(l);
    }
    return CCS
      .filter((c) => map.has(c.id))
      .map((c) => ({
        ccId: c.id,
        ccCodigo: c.codigo,
        ccNome: c.nome,
        rows: map.get(c.id)!,
      }));
  }, [linhas]);

  if (profile.id !== "admin") {
    return <Navigate to="/central-solicitacoes" />;
  }

  const cellKey = (bolsaId: string, ym: string) => `${bolsaId}::${ym}`;

  function isPago(bolsaId: string, ym: string): boolean {
    const k = cellKey(bolsaId, ym);
    if (k in pagamentos) return pagamentos[k];
    return defaultPago(ym);
  }

  // ----- Tela de seleção de projeto -----
  if (!selectedProjectId) {
    const anoBase = anoFiltro === "todos" ? new Date().getFullYear() : Number(anoFiltro);
    const mesesAno = Array.from(
      { length: 12 },
      (_, i) => `${anoBase}-${String(i + 1).padStart(2, "0")}`,
    );

    const resumoProjetos = PROJETOS.map((p) => {
      const bolsasDoProjeto = BOLSAS.filter((b) => b.projetoId === p.id);
      const bolsistas = new Set(bolsasDoProjeto.map((b) => b.memberId)).size;
      const totalMensal = bolsasDoProjeto.reduce((s, b) => s + b.valorMensal, 0);
      const ccs = CCS.filter((c) => c.projetoId === p.id);

      let totalAno = 0;
      let pagoAno = 0;
      const mesesComPendencia = new Set<string>();
      for (const b of bolsasDoProjeto) {
        for (const ym of mesesAno) {
          if (!isMonthInRange(ym, b.inicio, b.fim)) continue;
          totalAno += b.valorMensal;
          if (isPago(b.id, ym)) {
            pagoAno += b.valorMensal;
          } else {
            mesesComPendencia.add(ym);
          }
        }
      }
      const pendenteAno = totalAno - pagoAno;

      let vigenciaInicio: string | null = null;
      let vigenciaFim: string | null = null;
      for (const b of bolsasDoProjeto) {
        if (!vigenciaInicio || b.inicio < vigenciaInicio) vigenciaInicio = b.inicio;
        if (!vigenciaFim || b.fim > vigenciaFim) vigenciaFim = b.fim;
      }

      return {
        projeto: p,
        ccs,
        bolsasAtivas: bolsasDoProjeto.length,
        bolsistas,
        totalMensal,
        totalAno,
        pagoAno,
        pendenteAno,
        mesesPendentes: mesesComPendencia.size,
        vigenciaInicio,
        vigenciaFim,
      };
    });

    const q = pickerQuery.toLowerCase().trim();
    const filtered = resumoProjetos.filter((r) => {
      if (q) {
        const hay = `${r.projeto.nome} ${r.projeto.sigla} ${r.ccs
          .map((c) => `${c.codigo} ${c.nome}`)
          .join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (pickerFilter === "com_pendencias") return r.pendenteAno > 0;
      if (pickerFilter === "em_dia")
        return r.pendenteAno === 0 && r.bolsasAtivas > 0;
      if (pickerFilter === "sem_bolsas") return r.bolsasAtivas === 0;
      return true;
    });

    const filterChips: {
      key: typeof pickerFilter;
      label: string;
      count: number;
    }[] = [
      { key: "todos", label: "Todos os projetos", count: resumoProjetos.length },
      {
        key: "com_pendencias",
        label: "Com pendências",
        count: resumoProjetos.filter((r) => r.pendenteAno > 0).length,
      },
      {
        key: "em_dia",
        label: "Em dia",
        count: resumoProjetos.filter(
          (r) => r.pendenteAno === 0 && r.bolsasAtivas > 0,
        ).length,
      },
      {
        key: "sem_bolsas",
        label: "Sem bolsas",
        count: resumoProjetos.filter((r) => r.bolsasAtivas === 0).length,
      },
    ];

    return (
      <div className="p-6 md:p-10 w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight uppercase">Fluxo de Pagamento</h1>
          <p className="text-muted-foreground mt-2">
            Selecione um projeto para controlar o pagamento das bolsas por centro de custo.
          </p>
        </div>

        {/* Busca + filtros */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={pickerQuery}
              onChange={(e) => setPickerQuery(e.target.value)}
              placeholder="Buscar por projeto..."
              className="w-full h-11 pl-10 pr-4 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* Grade de projetos */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((r) => {
            const status =
              r.bolsasAtivas === 0
                ? { label: "Sem bolsas", tone: "muted" as const }
                : r.pendenteAno > 0
                  ? null
                  : { label: "Em dia", tone: "success" as const };
            const toneClass = status
              ? {
                  muted: "bg-muted text-muted-foreground",
                  warning:
                    "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
                  success:
                    "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
                }[status.tone]
              : "";

            return (
              <button
                key={r.projeto.id}
                onClick={() => setSelectedProjectId(r.projeto.id)}
                className={cn(
                  "relative text-left group rounded-2xl border bg-card transition-all p-5 flex flex-col overflow-hidden",
                  "hover:border-primary/50 hover:shadow-lg hover:-translate-y-0.5",
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  {status && (
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full",
                        toneClass,
                      )}
                    >
                      {status.label}
                    </span>
                  )}
                </div>

                <h3 className="font-semibold leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-4">
                  {r.projeto.nome}
                </h3>

                <div className="space-y-1.5 text-sm text-foreground/80">
                  <div className="flex items-center gap-2 truncate">
                    <CalendarRange className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate">
                      {r.vigenciaInicio && r.vigenciaFim ? (
                        <>
                          {formatYearMonthLabel(r.vigenciaInicio)} – {formatYearMonthLabel(r.vigenciaFim)}
                        </>
                      ) : (
                        <span className="text-muted-foreground">Sem vigência</span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 truncate">
                    <Building2 className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate">
                      {r.ccs.length > 0 ? (
                        r.ccs.map((c) => `${c.nome} (${c.codigo})`).join(" · ")
                      ) : (
                        <span className="text-muted-foreground">Sem CC</span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 truncate">
                    <Users className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate">{r.bolsistas} {r.bolsistas === 1 ? "bolsista" : "bolsistas"}</span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t flex items-center justify-between text-sm font-medium text-primary">
                  <span>Abrir fluxo de pagamento</span>
                  <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            );
          })}

          {filtered.length === 0 && (
            <div className="col-span-full rounded-2xl border-2 border-dashed border-border p-12 flex flex-col items-center gap-3 text-center">
              <div className="size-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <Inbox className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Nenhum projeto encontrado
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Ajuste os filtros ou tente outra busca.
                </p>
              </div>
              {(pickerQuery || pickerFilter !== "todos") && (
                <button
                  onClick={() => {
                    setPickerQuery("");
                    setPickerFilter("todos");
                  }}
                  className="mt-1 text-xs font-medium text-primary hover:underline"
                >
                  Limpar filtros
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  const projetoSelecionado = getProjeto(selectedProjectId);

  // Totais por mês (somando todas as bolsas visíveis do projeto selecionado).
  const totalGeralPorMes = meses.map((ym) => {
    let valor = 0;
    let pago = 0;
    for (const row of linhas) {
      if (isMonthInRange(ym, row.inicio, row.fim)) {
        valor += row.valor;
        if (isPago(row.bolsaId, ym)) pago += row.valor;
      }
    }
    return { ym, valor, pago };
  });

  // Totais por CC × mês (para subtotal por centro de custo).
  const totaisPorCc = grupos.map((g) => {
    const porMes = meses.map((ym) => {
      let valor = 0;
      let pago = 0;
      for (const row of g.rows) {
        if (isMonthInRange(ym, row.inicio, row.fim)) {
          valor += row.valor;
          if (isPago(row.bolsaId, ym)) pago += row.valor;
        }
      }
      return { ym, valor, pago };
    });
    return { ccId: g.ccId, porMes };
  });

  const totalAnoValor = totalGeralPorMes.reduce((s, m) => s + m.valor, 0);
  const totalAnoPago = totalGeralPorMes.reduce((s, m) => s + m.pago, 0);
  const totalAnoPendente = totalAnoValor - totalAnoPago;

  const colCount = 1 + meses.length;

  // Paleta visual por Centro de Custo (ajuda a separar os grupos no olhar).
  type CcPalette = { dot: string; band: string; soft: string; ink: string };
  const corPorCc: Record<string, CcPalette> = {
    EMBRAPII: { dot: "#2563eb", band: "#eff6ff", soft: "#dbeafe", ink: "#1d4ed8" },
    EMPRESA: { dot: "#c026d3", band: "#fdf4ff", soft: "#fae8ff", ink: "#a21caf" },
    SEBRAE: { dot: "#e85d3c", band: "#fff1ed", soft: "#fdd6c8", ink: "#b54021" },
    CEIA: { dot: "#059669", band: "#ecfdf5", soft: "#d1fae5", ink: "#047857" },
  };
  const corDoCc = (nome: string): CcPalette =>
    corPorCc[nome] ?? { dot: "#64748b", band: "#f8fafc", soft: "#e2e8f0", ink: "#475569" };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <header className="space-y-3">
        <button
          type="button"
          onClick={() => {
            setSelectedProjectId(null);
            setBusca("");
          }}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground/80 -mt-2"
        >
          <ChevronLeft className="size-3" /> Voltar para projetos
        </button>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-3xl font-bold tracking-tight">{projetoSelecionado?.nome}</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Acompanhe o fluxo de pagamento do projeto {projetoSelecionado?.nome} ao longo da sua vigência.
        </p>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <PaymentStatCard
          icon={<Wallet className="size-4" />}
          label="Total geral previsto"
          value={formatBRL(totalAnoValor)}
          tone="primary"
        />
        <PaymentStatCard
          icon={<Check className="size-4" />}
          label="Total com pagamento solicitado"
          value={formatBRL(totalAnoPago)}
          tone="success"
        />
        <PaymentStatCard
          icon={<Clock className="size-4" />}
          label="Total previsto a pagar"
          value={formatBRL(totalAnoPendente)}
          tone="warning"
        />
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center">
        <div className="relative flex-1">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por bolsista, CPF ou CC..."
            className="w-full h-11 pl-10 pr-4 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Tabela */}
      <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
        {/* Cabeçalho do card */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b bg-gradient-to-b from-muted/30 to-card">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold leading-tight text-foreground">
              Pagamentos mensais por bolsista
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Agrupados por centro de custo. Cada célula indica o valor mensal e o status do pagamento.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 text-emerald-800 px-2 py-1 font-medium dark:bg-emerald-950/40 dark:text-emerald-300">
              <span className="size-1.5 rounded-full bg-emerald-500" /> Pagamento solicitado
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 text-amber-800 px-2 py-1 font-medium dark:bg-amber-950/40 dark:text-amber-300">
              <span className="size-1.5 rounded-full bg-amber-500" /> Pendente
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-muted text-muted-foreground px-2 py-1 font-medium">
              <span className="size-1.5 rounded-full bg-muted-foreground/40" /> Fora de vigência
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-separate border-spacing-0">
            <thead>
              <tr className="text-muted-foreground" style={{ background: "#f8fafc" }}>
                <th
                  className="sticky left-0 z-20 text-left font-semibold px-5 py-3 w-[280px] min-w-[280px] border-b border-r"
                  style={{ background: "#f8fafc" }}
                >
                  <span className="text-[10px] uppercase tracking-[0.12em] font-bold">
                    Bolsista
                  </span>
                </th>
                {meses.map((ym, i) => {
                  const { year, month } = parseYearMonth(ym);
                  const mesAbrev = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"][month - 1];
                  const prev = i > 0 ? parseYearMonth(meses[i - 1]) : null;
                  const newYear = !prev || prev.year !== year;
                  return (
                    <th
                      key={ym}
                      className={cn(
                        "text-center font-semibold px-2 py-2 whitespace-nowrap border-b min-w-[88px]",
                        newYear && i > 0 && "border-l-2 border-l-slate-200",
                      )}
                    >
                      <div className="flex flex-col items-center leading-tight">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-foreground/80">
                          {mesAbrev}
                        </span>
                        <span className="text-[9px] text-muted-foreground/70 tabular-nums">
                          {year}
                        </span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {grupos.map((g) => {
                const totaisCc = totaisPorCc.find((t) => t.ccId === g.ccId)!;
                const ccCor = corDoCc(g.ccNome);
                const ccTotalValor = totaisCc.porMes.reduce((s, m) => s + m.valor, 0);
                const ccTotalPago = totaisCc.porMes.reduce((s, m) => s + m.pago, 0);
                const ccTotalPendente = ccTotalValor - ccTotalPago;
                return (
                  <Fragment key={g.ccId}>
                    {/* Banner do CC */}
                    <tr>
                      <td
                        colSpan={colCount}
                        className="p-0 border-b"
                        style={{
                          background: ccCor.band,
                          borderLeft: `3px solid ${ccCor.dot}`,
                        }}
                      >
                        <div className="flex items-center gap-x-4 py-2.5">
                          <div
                            className="sticky left-0 flex items-center gap-2 min-w-0 pl-5 pr-3 z-[1]"
                            style={{ background: ccCor.band }}
                          >
                            <span
                              className="size-2 rounded-full shrink-0"
                              style={{ background: ccCor.dot }}
                            />
                            <span
                              className="text-[11px] uppercase tracking-[0.12em] font-bold truncate"
                              style={{ color: ccCor.ink }}
                            >
                              {g.ccNome}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/60 text-muted-foreground border border-black/5 whitespace-nowrap">
                              CC {g.ccCodigo}
                            </span>
                            <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                              · {g.rows.length} {g.rows.length === 1 ? "bolsista" : "bolsistas"}
                            </span>
                          </div>
                          <div
                            className="sticky right-0 ml-auto flex items-center gap-3 text-[11px] pl-3 pr-5 z-[1] whitespace-nowrap"
                            style={{ background: ccCor.band }}
                          >
                            <span className="inline-flex items-center gap-1.5">
                              <span className="size-1.5 rounded-full bg-emerald-500" />
                              <span className="text-muted-foreground">Solicitado</span>
                              <span className="font-semibold tabular-nums text-foreground">
                                {formatBRL(ccTotalPago)}
                              </span>
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <span className="size-1.5 rounded-full bg-amber-500" />
                              <span className="text-muted-foreground">Pendente</span>
                              <span className="font-semibold tabular-nums text-foreground">
                                {formatBRL(ccTotalPendente)}
                              </span>
                            </span>
                          </div>
                        </div>
                      </td>
                    </tr>

                    {g.rows.map((row, ri) => {
                      const isLast = ri === g.rows.length - 1;
                      return (
                        <tr key={row.bolsaId} className="group/row hover:bg-slate-50/70">
                          <td
                            className={cn(
                              "sticky left-0 z-10 px-5 py-3 w-[280px] min-w-[280px] border-r bg-card group-hover/row:bg-slate-50/70 transition-colors",
                              !isLast && "border-b border-b-slate-100",
                            )}
                            style={{ borderLeft: `3px solid ${ccCor.dot}` }}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="size-9 rounded-full flex items-center justify-center font-semibold text-[11px] shrink-0"
                                style={{
                                  background: ccCor.soft,
                                  color: ccCor.ink,
                                }}
                              >
                                {row.iniciais}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span className="font-medium text-sm leading-tight text-foreground truncate">
                                    {row.nome}
                                  </span>
                                  <TagSelector
                                    value={tags[row.bolsaId]}
                                    onChange={(next) =>
                                      setTags((prev) => {
                                        const copy = { ...prev };
                                        if (next) copy[row.bolsaId] = next;
                                        else delete copy[row.bolsaId];
                                        return copy;
                                      })
                                    }
                                  />
                                </div>
                                <div className="text-[11px] text-muted-foreground tabular-nums mt-0.5">
                                  {row.cpf}
                                </div>
                              </div>
                            </div>
                          </td>
                          {meses.map((ym, i) => {
                            const { year } = parseYearMonth(ym);
                            const prev = i > 0 ? parseYearMonth(meses[i - 1]) : null;
                            const newYear = !prev || prev.year !== year;
                            const ativo = isMonthInRange(ym, row.inicio, row.fim);
                            const pago = ativo && isPago(row.bolsaId, ym);
                            return (
                              <td
                                key={ym}
                                className={cn(
                                  "px-1.5 py-2 text-center align-middle transition-colors",
                                  !isLast && "border-b border-b-slate-100",
                                  newYear && i > 0 && "border-l-2 border-l-slate-200",
                                )}
                                title={
                                  ativo
                                    ? `${formatYearMonthLong(ym)} · ${pago ? "Pagamento solicitado" : "Pendente"} · ${formatBRL(row.valor)}`
                                    : `${formatYearMonthLong(ym)} · Fora de vigência`
                                }
                              >
                                {!ativo ? (
                                  <span className="inline-flex size-1.5 rounded-full bg-muted-foreground/40" />
                                ) : (
                                  <span
                                    className={cn(
                                      "inline-flex items-center justify-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold tabular-nums whitespace-nowrap",
                                      pago
                                        ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                                        : "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
                                    )}
                                  >
                                    <span
                                      className={cn(
                                        "size-1.5 rounded-full shrink-0",
                                        pago ? "bg-emerald-500" : "bg-amber-500",
                                      )}
                                    />
                                    {formatBRL(row.valor)}
                                  </span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}

                    {/* Subtotal do CC */}
                    <tr>
                      <td
                        className="sticky left-0 z-10 px-5 py-2 border-b border-r"
                        style={{
                          background: ccCor.band,
                          borderLeft: `3px solid ${ccCor.dot}`,
                        }}
                      >
                        <div className="text-[10px] uppercase tracking-[0.12em] font-bold" style={{ color: ccCor.ink }}>
                          Subtotal
                        </div>
                      </td>
                      {totaisCc.porMes.map(({ ym, valor }, i) => {
                        const { year } = parseYearMonth(ym);
                        const prev = i > 0 ? parseYearMonth(totaisCc.porMes[i - 1].ym) : null;
                        const newYear = !prev || prev.year !== year;
                        return (
                          <td
                            key={ym}
                            className={cn(
                              "border-b px-2 py-2 text-center align-middle",
                              newYear && i > 0 && "border-l-2 border-l-slate-200",
                            )}
                            style={{ background: ccCor.band }}
                          >
                            {valor > 0 ? (
                              <span className="text-[11px] tabular-nums font-semibold text-foreground">
                                {formatBRL(valor)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground/40">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  </Fragment>
                );
              })}

              {grupos.length === 0 && (
                <tr>
                  <td
                    colSpan={colCount}
                    className="px-4 py-12 text-center text-sm text-muted-foreground"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Search className="size-5 text-muted-foreground/60" />
                      <span>Nenhum resultado para os filtros aplicados.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
            {grupos.length > 0 && (
              <tfoot>
                <tr style={{ background: "#f8fafc" }}>
                  <td
                    className="sticky left-0 z-10 px-5 py-3 border-r border-t"
                    style={{ background: "#f8fafc" }}
                  >
                    <div className="flex items-center gap-2">
                      <Wallet className="size-3.5 text-muted-foreground" />
                      <span className="text-[10px] uppercase tracking-[0.12em] font-bold text-foreground">
                        Total por mês
                      </span>
                    </div>
                  </td>
                  {totalGeralPorMes.map(({ ym, valor }, i) => {
                    const { year } = parseYearMonth(ym);
                    const prev = i > 0 ? parseYearMonth(totalGeralPorMes[i - 1].ym) : null;
                    const newYear = !prev || prev.year !== year;
                    return (
                      <td
                        key={ym}
                        className={cn(
                          "px-2 py-3 text-center align-middle border-t",
                          newYear && i > 0 && "border-l-2 border-l-slate-200",
                        )}
                        style={{ background: "#f8fafc" }}
                      >
                        {valor > 0 ? (
                          <span className="text-[11px] tabular-nums font-bold text-foreground">
                            {formatBRL(valor)}
                          </span>
                        ) : (
                          <span className="inline-flex size-1.5 rounded-full bg-muted-foreground/40" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}

// Marcação opcional S.O. / UE.
// Sem marcação: mostra um "+" discreto (sempre visível) para marcar.
// Com marcação: mostra um selo colorido clicável.
function TagSelector({
  value,
  onChange,
}: {
  value: BolsaTag | undefined;
  onChange: (next: BolsaTag | undefined) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {value ? (
          <button
            type="button"
            title="Alterar marcação"
            className={cn(
              "inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shrink-0 transition-opacity hover:opacity-85 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:opacity-85",
              value === "suporte_operacional" ? "bg-indigo-600" : "bg-teal-600",
            )}
          >
            {value === "suporte_operacional" ? "S.O." : "UE"}
          </button>
        ) : (
          <button
            type="button"
            title="Marcar como S.O. ou UE"
            aria-label="Marcar como S.O. ou UE"
            className="inline-flex size-4 items-center justify-center rounded-full border border-dashed border-muted-foreground/40 text-muted-foreground shrink-0 transition-colors hover:border-primary hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:border-primary data-[state=open]:text-primary"
          >
            <Plus className="size-2.5" />
          </button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-36">
        <DropdownMenuItem onSelect={() => onChange("suporte_operacional")} className="gap-2">
          <span className="size-2 rounded-full bg-indigo-600 shrink-0" />
          <span className="text-xs font-medium">S.O.</span>
          {value === "suporte_operacional" && (
            <Check className="size-3.5 ml-auto text-primary" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onChange("ue")} className="gap-2">
          <span className="size-2 rounded-full bg-teal-600 shrink-0" />
          <span className="text-xs font-medium">UE</span>
          {value === "ue" && <Check className="size-3.5 ml-auto text-primary" />}
        </DropdownMenuItem>
        {value && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => onChange(undefined)}
              className="text-xs text-muted-foreground"
            >
              Remover marcação
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function PaymentStatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "primary" | "warning" | "info" | "muted" | "success";
}) {
  const toneClasses: Record<typeof tone, string> = {
    primary: "bg-primary-soft text-primary border-primary/20",
    warning:
      "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900",
    info: "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-900",
    success:
      "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900",
    muted: "bg-muted text-muted-foreground border-border",
  };
  return (
    <div className="rounded-xl border bg-card p-4 flex items-center gap-3 hover:shadow-sm transition-shadow">
      <div
        className={cn(
          "size-10 rounded-lg border flex items-center justify-center shrink-0",
          toneClasses[tone],
        )}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-xl font-bold leading-none text-foreground tabular-nums">
          {value}
        </div>
        <div className="text-xs text-muted-foreground mt-1 leading-tight">{label}</div>
      </div>
    </div>
  );
}
