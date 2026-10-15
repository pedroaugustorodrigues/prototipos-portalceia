import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  FileText,
  CheckCircle2,
  Circle,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Search,
  LayoutGrid,
  List,
  Building2,
  Pencil,
  Check,
  X,
  Wallet,
  ArrowDownCircle,
  Clock,
  MessageSquare,
  Tag,
  BadgeInfo,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useActiveProfile } from "@/lib/profile";
import { formatBRL } from "@/lib/equipe-bolsas-data";
import {
  NOTAS,
  PROJETOS,
  formatDate,
  toInputDate,
  fromInputDate,
  registrarPagamentoNota,
  type NotaFiscal,
  type Projeto,
  type EmpresaContrato,
  type TipoNota,
} from "@/lib/notas-fiscais-data";

export const Route = createFileRoute("/notas-fiscais")({
  head: () => ({ meta: [{ title: "Notas Fiscais — Portal CEIA" }] }),
  component: NotasFiscaisPage,
});

type Escopo = "geral" | string;

/* ------------------------------ utilidades de mês ------------------------- */
function competenciaLonga(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  const nomes = [
    "janeiro",
    "fevereiro",
    "março",
    "abril",
    "maio",
    "junho",
    "julho",
    "agosto",
    "setembro",
    "outubro",
    "novembro",
    "dezembro",
  ];
  return `${nomes[m - 1]} de ${y}`;
}

/** Nota concluída = paga (PAGA ou PAGA COM ATRASO). */
function notaPaga(n: NotaFiscal): boolean {
  return n.situacao === "PAGA" || n.situacao === "PAGA COM ATRASO";
}

/**
 * Etapas exibidas do ciclo (4): Solicitação, Assin. coordenador, Assin. FUNAPE
 * e Emissão da NF. A emissão só é marcada como concluída quando a nota está
 * paga — assim, "todas verdes" = tudo concluído e nº da NF gerado.
 */
function etapasNota(n: NotaFiscal) {
  return n.timeline
    .filter((e) => e.etapa !== "nota_enviada" && e.etapa !== "pagamento_recebido")
    .map((e) =>
      e.etapa === "nota_emitida" && !notaPaga(n)
        ? { ...e, situacao: "pendente" as const, data: null, hora: null }
        : e,
    );
}

/**
 * Metadados visuais da Situação NF — exclusivamente os valores da fórmula:
 * PAGA · PAGA COM ATRASO · VENCIDA +60/+30 · VENCIDA · VENCE HOJE · EM DIA.
 * Quando a nota ainda não foi emitida (sem solicitação ou sem vencimento),
 * a fórmula retorna vazio; aqui mostramos "A emitir" como estado neutro.
 */
type StatusMeta = {
  label: string;
  badge: string;
  dot: string;
  atencao: boolean;
};
function statusMeta(n: NotaFiscal): StatusMeta {
  switch (n.situacao) {
    case "PAGA":
      return {
        label: "Paga",
        badge: "bg-emerald-50 text-emerald-700 ring-emerald-200",
        dot: "bg-emerald-500",
        atencao: false,
      };
    case "PAGA COM ATRASO":
      return {
        label: "Paga com atraso",
        badge: "bg-teal-50 text-teal-700 ring-teal-200",
        dot: "bg-teal-500",
        atencao: false,
      };
    case "EM DIA":
      return {
        label: "Em dia",
        badge: "bg-sky-50 text-sky-700 ring-sky-200",
        dot: "bg-sky-500",
        atencao: false,
      };
    case "VENCE HOJE":
      return {
        label: "Vence hoje",
        badge: "bg-amber-50 text-amber-800 ring-amber-300",
        dot: "bg-amber-500",
        atencao: true,
      };
    case "VENCIDA":
      return {
        label: "Vencida",
        badge: "bg-orange-50 text-orange-700 ring-orange-200",
        dot: "bg-orange-500",
        atencao: true,
      };
    case "VENCIDA +30":
      return {
        label: "Vencida +30",
        badge: "bg-red-50 text-red-700 ring-red-200",
        dot: "bg-red-500",
        atencao: true,
      };
    case "VENCIDA +60":
      return {
        label: "Vencida +60",
        badge: "bg-red-100 text-red-800 ring-red-300",
        dot: "bg-red-600",
        atencao: true,
      };
    default:
      return {
        label: "A emitir",
        badge: "bg-slate-50 text-slate-600 ring-slate-200",
        dot: "bg-slate-400",
        atencao: false,
      };
  }
}

/** Metadados visuais do tipo da nota: NORMAL x PI. */
function tipoNotaMeta(tipo: TipoNota) {
  return tipo === "PI"
    ? {
        label: "PI",
        full: "Nota de PI",
        badge: "bg-violet-50 text-violet-700 ring-violet-200",
        dot: "bg-violet-500",
      }
    : {
        label: "Normal",
        full: "Nota normal",
        badge: "bg-slate-50 text-slate-600 ring-slate-200",
        dot: "bg-slate-400",
      };
}

/** Etiqueta do tipo da nota (Normal/PI), para diferenciar com clareza. */
function TipoBadge({ tipo }: { tipo: TipoNota }) {
  const meta = tipoNotaMeta(tipo);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold ring-1 ring-inset uppercase tracking-wide shrink-0",
        meta.badge,
      )}
    >
      <Tag className="size-2.5" />
      {meta.label}
    </span>
  );
}

/* ------------------------------- página ---------------------------------- */
function NotasFiscaisPage() {
  const profile = useActiveProfile();
  const [escopo, setEscopo] = useState<Escopo>("geral");
  const [selecionadaId, setSelecionadaId] = useState<string | null>(null);
  // Notas em estado local — permite lançar pagamento e comentário manualmente.
  const [notas, setNotas] = useState<NotaFiscal[]>(() => NOTAS.map((n) => ({ ...n })));
  // Projetos já acessados nesta sessão (remove a etiqueta NOVO).
  const [visitados, setVisitados] = useState<Set<string>>(() => new Set());

  const atencaoGeral = useMemo(() => notas.filter((n) => statusMeta(n).atencao), [notas]);

  if (profile.id !== "admin") {
    return <Navigate to="/central-solicitacoes" />;
  }

  const projeto =
    escopo === "geral" ? null : (PROJETOS.find((p) => p.projetoId === escopo) ?? null);
  const selecionada = selecionadaId ? (notas.find((n) => n.id === selecionadaId) ?? null) : null;

  function abrirProjeto(id: string) {
    setEscopo(id);
    setVisitados((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }

  function registrarPagamento(id: string, data: Date | null, valor: number | null) {
    setNotas((prev) => prev.map((n) => (n.id === id ? registrarPagamentoNota(n, data, valor) : n)));
  }

  function salvarComentario(id: string, texto: string) {
    setNotas((prev) => prev.map((n) => (n.id === id ? { ...n, comentario: texto } : n)));
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1200px] mx-auto">
      {/* Cabeçalho — apenas na visão geral */}
      {escopo === "geral" && (
        <header className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight uppercase">Notas Fiscais</h1>
          <p className="text-sm text-muted-foreground">
            Painel de acompanhamento das notas fiscais dos projetos. Aqui você vê, num só lugar, a
            situação de cada nota.
          </p>
        </header>
      )}

      {/* Faixa de atenção — informativa, visível quando há pendências no geral */}
      {escopo === "geral" && atencaoGeral.length > 0 && (
        <div className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 flex items-center gap-3">
          <span className="size-9 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-red-800">
              {atencaoGeral.length} {atencaoGeral.length === 1 ? "nota precisa" : "notas precisam"}{" "}
              da sua atenção
            </div>
            <div className="text-xs text-red-700/80">Notas vencidas ou que vencem hoje.</div>
          </div>
        </div>
      )}

      {escopo === "geral" ? (
        <VisaoGeral notas={notas} visitados={visitados} onAbrirProjeto={abrirProjeto} />
      ) : (
        projeto && (
          <VisaoProjeto
            projeto={projeto}
            notas={notas}
            onVoltar={() => setEscopo("geral")}
            onSelect={(n) => setSelecionadaId(n.id)}
          />
        )
      )}

      <DetalheModal
        nota={selecionada}
        onClose={() => setSelecionadaId(null)}
        onRegistrarPagamento={registrarPagamento}
        onSalvarComentario={salvarComentario}
      />
    </div>
  );
}

/* =========================================================================
 * VISÃO GERAL — painel com um cartão por projeto
 * ========================================================================= */
function VisaoGeral({
  notas,
  visitados,
  onAbrirProjeto,
}: {
  notas: NotaFiscal[];
  visitados: Set<string>;
  onAbrirProjeto: (id: string) => void;
}) {
  const [busca, setBusca] = useState("");

  const projetosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return PROJETOS;
    return PROJETOS.filter((p) =>
      [p.nomeInterno, p.nomeProjeto, p.coordenador, ...p.empresas.map((e) => e.empresa)]
        .join(" ")
        .toLowerCase()
        .includes(termo),
    );
  }, [busca]);

  return (
    <div className="space-y-6">
      {/* Campo de pesquisa */}
      <div className="relative">
        <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por projeto, coordenador ou empresa..."
          className="w-full h-11 pl-10 pr-4 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Cartões por projeto */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">
          Projetos ({projetosFiltrados.length})
        </h2>
        {projetosFiltrados.length === 0 ? (
          <div className="rounded-xl border bg-card p-10 text-center">
            <div className="mx-auto size-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <Search className="size-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">Nenhum projeto encontrado</p>
            <p className="text-xs text-muted-foreground mt-1">Tente outro termo de busca.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projetosFiltrados.map((p) => (
              <ProjetoCard
                key={p.projetoId}
                projeto={p}
                notas={notas}
                novo={p.novo && !visitados.has(p.projetoId)}
                onClick={() => onAbrirProjeto(p.projetoId)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/** Cartão-resumo de um projeto (mini painel). */
function ProjetoCard({
  projeto,
  notas,
  novo,
  onClick,
}: {
  projeto: Projeto;
  notas: NotaFiscal[];
  novo: boolean;
  onClick: () => void;
}) {
  const resumo = useMemo(() => {
    const doProjeto = notas.filter((n) => n.projetoId === projeto.projetoId);
    const pagas = doProjeto.filter(
      (n) => n.situacao === "PAGA" || n.situacao === "PAGA COM ATRASO",
    ).length;
    const atencao = doProjeto.filter((n) => statusMeta(n).atencao).length;
    return {
      total: doProjeto.length,
      pagas,
      atencao,
      pct: doProjeto.length ? Math.round((pagas / doProjeto.length) * 100) : 0,
    };
  }, [notas, projeto.projetoId]);

  const nEmpresas = projeto.empresas.length;
  const subtitulo =
    nEmpresas > 1
      ? `${projeto.coordenador} · ${nEmpresas} empresas`
      : `${projeto.coordenador} · ${projeto.empresas[0]?.empresa ?? ""}`;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group text-left rounded-xl border bg-card p-4 hover:shadow-md hover:border-primary/40 transition-all flex flex-col gap-3 relative",
        novo && "border-primary/50 ring-1 ring-primary/20",
      )}
    >
      {/* Etiqueta NOVO — contrato assinado e nunca acessado */}
      {novo && (
        <span className="absolute -top-2 -left-2 inline-flex items-center rounded-full bg-primary text-primary-foreground px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide shadow-sm">
          Novo
        </span>
      )}

      {/* Cabeçalho */}
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <div className="font-semibold leading-tight truncate">{projeto.nomeInterno}</div>
          <div className="text-xs text-muted-foreground truncate">{subtitulo}</div>
        </div>
        {/* Status de atenção — canto superior direito, só quando há notas nessa condição */}
        {resumo.atencao > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 text-red-700 ring-1 ring-inset ring-red-200 px-2 py-0.5 text-[11px] font-medium shrink-0">
            <AlertTriangle className="size-3" />
            {resumo.atencao}
          </span>
        )}
        <ChevronRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-0.5" />
      </div>

      {/* Progresso de pagamento */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            {resumo.pagas} de {resumo.total} notas pagas
          </span>
          <span className="font-medium">{resumo.pct}%</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${resumo.pct}%` }} />
        </div>
      </div>
    </button>
  );
}

/* =========================================================================
 * VISÃO DE PROJETO — uma seção por empresa, cada uma com suas notas
 * ========================================================================= */
type FiltroId = "todas" | "atencao" | "aemitir" | "emdia" | "pagas";

const FILTROS: { id: FiltroId; label: string }[] = [
  { id: "todas", label: "Todas" },
  { id: "atencao", label: "Atenção" },
  { id: "aemitir", label: "A emitir" },
  { id: "emdia", label: "Em dia" },
  { id: "pagas", label: "Pagas" },
];

function passaFiltro(n: NotaFiscal, f: FiltroId): boolean {
  switch (f) {
    case "todas":
      return true;
    case "atencao":
      return statusMeta(n).atencao;
    case "aemitir":
      return n.situacao === "";
    case "emdia":
      return n.situacao === "EM DIA";
    case "pagas":
      return n.situacao === "PAGA" || n.situacao === "PAGA COM ATRASO";
  }
}

type TipoFiltro = "todas" | "NORMAL" | "PI";

function VisaoProjeto({
  projeto,
  notas,
  onVoltar,
  onSelect,
}: {
  projeto: Projeto;
  notas: NotaFiscal[];
  onVoltar: () => void;
  onSelect: (n: NotaFiscal) => void;
}) {
  const notasProjeto = useMemo(
    () => notas.filter((n) => n.projetoId === projeto.projetoId),
    [notas, projeto.projetoId],
  );

  const multiEmpresa = projeto.empresas.length > 1;

  // Resumo agregado do projeto inteiro (independente do nº de empresas).
  const resumo = useMemo(() => {
    const previsto = notasProjeto.reduce((s, n) => s + n.vlrPtr, 0);
    const recebido = notasProjeto.reduce((s, n) => s + (n.valorPago ?? 0), 0);
    const pagas = notasProjeto.filter(
      (n) => n.situacao === "PAGA" || n.situacao === "PAGA COM ATRASO",
    ).length;
    return {
      previsto,
      recebido,
      aReceber: previsto - recebido,
      pagas,
      total: notasProjeto.length,
    };
  }, [notasProjeto]);

  return (
    <div className="space-y-5">
      {/* Voltar */}
      <button
        type="button"
        onClick={onVoltar}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="size-4" />
        Todos os projetos
      </button>

      {/* Cabeçalho do projeto — informações padronizadas */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b">
          <h2 className="text-lg font-bold leading-tight">{projeto.nomeProjeto}</h2>
        </div>
        <dl className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 [&>*]:border-border">
          <InfoItem label="Coordenador" value={projeto.coordenador} />
          <InfoItem label="PEIA" value={projeto.peia} />
          <InfoItem label="Centro de custos" value={projeto.centroCusto.split(" — ")[0]} />
          <InfoItem label="Conta corrente" value={projeto.contaCorrente} />
        </dl>
      </div>

      {/* Cards informativos — gerais do projeto (previsto / pago / a pagar) */}
      <div className="grid gap-3 sm:grid-cols-3 mb-3">
        <CardInfo
          icon={Wallet}
          tone="bg-muted text-muted-foreground border-transparent"
          valor={formatBRL(resumo.previsto)}
          label={`Previsto · ${resumo.total} notas`}
        />
        <CardInfo
          icon={ArrowDownCircle}
          tone="bg-muted text-muted-foreground border-transparent"
          valor={formatBRL(resumo.recebido)}
          label={`Pago · ${resumo.pagas} de ${resumo.total} notas`}
        />
        <CardInfo
          icon={Clock}
          tone="bg-muted text-muted-foreground border-transparent"
          valor={formatBRL(resumo.aReceber)}
          label={`A pagar · ${resumo.total - resumo.pagas} em aberto`}
        />
      </div>

      {/* Aviso quando há mais de uma empresa no mesmo projeto */}
      {multiEmpresa && (
        <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 flex items-start gap-2">
          <BadgeInfo className="size-4 text-sky-600 mt-0.5 shrink-0" />
          <div className="text-xs text-sky-800">
            Este projeto tem <strong>{projeto.empresas.length} empresas tomadoras</strong>. As notas
            e os dados de cada empresa (CNPJ e e-mail) estão separados por empresa abaixo.
          </div>
        </div>
      )}

      {/* Uma seção por empresa */}
      {projeto.empresas.map((emp) => (
        <EmpresaSection
          key={emp.empresaId}
          empresa={emp}
          notas={notasProjeto.filter((n) => n.empresaId === emp.empresaId)}
          multiEmpresa={multiEmpresa}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

/* ----------------------- seção de uma empresa ---------------------------- */
function EmpresaSection({
  empresa,
  notas,
  multiEmpresa,
  onSelect,
}: {
  empresa: EmpresaContrato;
  notas: NotaFiscal[];
  multiEmpresa: boolean;
  onSelect: (n: NotaFiscal) => void;
}) {
  const [filtro, setFiltro] = useState<FiltroId>("todas");
  const [tipoFiltro, setTipoFiltro] = useState<TipoFiltro>("todas");
  const [modoView, setModoView] = useState<"cards" | "lista">("lista");

  const temPI = useMemo(() => notas.some((n) => n.tipoNota === "PI"), [notas]);

  const filtrosAtivos = (filtro !== "todas" ? 1 : 0) + (tipoFiltro !== "todas" ? 1 : 0);

  const contagem = useMemo(() => {
    const c: Record<FiltroId, number> = {
      todas: 0,
      atencao: 0,
      aemitir: 0,
      emdia: 0,
      pagas: 0,
    };
    const base = notas.filter((n) => tipoFiltro === "todas" || n.tipoNota === tipoFiltro);
    c.todas = base.length;
    for (const n of base) {
      for (const f of FILTROS) {
        if (f.id !== "todas" && passaFiltro(n, f.id)) c[f.id] += 1;
      }
    }
    return c;
  }, [notas, tipoFiltro]);

  const lista = useMemo(
    () =>
      notas
        .filter((n) => tipoFiltro === "todas" || n.tipoNota === tipoFiltro)
        .filter((n) => passaFiltro(n, filtro))
        // Ordena por parcela e, dentro da parcela, nota normal antes da PI.
        .sort(
          (a, b) =>
            a.parcela - b.parcela || (a.tipoNota === "PI" ? 1 : 0) - (b.tipoNota === "PI" ? 1 : 0),
        ),
    [notas, filtro, tipoFiltro],
  );

  const tipoOptions: { id: TipoFiltro; label: string }[] = [
    { id: "todas", label: "Todas" },
    { id: "NORMAL", label: "Normais" },
    { id: "PI", label: "PI" },
  ];

  return (
    <section className="rounded-xl border bg-card overflow-hidden">
      {/* Cabeçalho da empresa */}
      <div className="px-5 py-4 border-b">
        <div className="flex items-center gap-2.5">
          <span className="size-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
            <Building2 className="size-4.5 text-muted-foreground" />
          </span>
          <div className="min-w-0">
            {multiEmpresa && (
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Empresa tomadora
              </div>
            )}
            <h3 className="text-base font-bold leading-tight truncate">{empresa.empresa}</h3>
          </div>
        </div>
      </div>

      {/* Dados da empresa — e-mail (editável) e CNPJ, em quadros padronizados */}
      <dl className="grid grid-cols-2 border-b divide-x [&>*]:border-border">
        <CampoEmailEditavel key={empresa.empresaId} inicial={empresa.email} />
        <InfoItem label="CNPJ do tomador" value={empresa.cnpjTomador} />
      </dl>

      <div className="p-5 pt-4 space-y-4 bg-muted/20">
        {/* Barra de ações: filtro (popover) + alternador de visualização, à direita */}
        <div className="flex items-center justify-end gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                size="sm"
                className="gap-1.5 h-9 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Filter className="size-4" />
                Filtros
                {filtrosAtivos > 0 && (
                  <span className="inline-flex items-center justify-center size-4 rounded-full bg-white text-primary text-[10px] font-bold">
                    {filtrosAtivos}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-64 p-0 overflow-hidden">
              <div className="px-4 py-3 border-b flex items-center justify-between">
                <span className="text-sm font-semibold">Filtros</span>
                {filtrosAtivos > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setFiltro("todas");
                      setTipoFiltro("todas");
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Limpar
                  </button>
                )}
              </div>

              <div className="p-3 space-y-4">
                {/* Andamento (situação) */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Andamento
                  </label>
                  <Select value={filtro} onValueChange={(v) => setFiltro(v as FiltroId)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FILTROS.map((f) => (
                        <SelectItem key={f.id} value={f.id}>
                          {f.label} ({contagem[f.id]})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tipo (Normal/PI) — só quando a empresa emite nota de PI */}
                {temPI && (
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Tipo de nota
                    </label>
                    <Select
                      value={tipoFiltro}
                      onValueChange={(v) => setTipoFiltro(v as TipoFiltro)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {tipoOptions.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* Alternador Cartões / Lista */}
          <div className="inline-flex rounded-lg border p-0.5">
            <button
              type="button"
              onClick={() => setModoView("lista")}
              title="Ver em lista"
              aria-label="Ver em lista"
              className={cn(
                "inline-flex items-center justify-center rounded-md p-1.5 transition-colors",
                modoView === "lista"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <List className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setModoView("cards")}
              title="Ver em cartões"
              aria-label="Ver em cartões"
              className={cn(
                "inline-flex items-center justify-center rounded-md p-1.5 transition-colors",
                modoView === "cards"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <LayoutGrid className="size-4" />
            </button>
          </div>
        </div>

        {/* Notas: vazio, cartões ou lista */}
        {lista.length === 0 ? (
          <div className="rounded-xl border bg-card p-12 text-center">
            <div className="mx-auto size-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <FileText className="size-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">Nenhuma nota neste filtro</p>
            <p className="text-xs text-muted-foreground mt-1">Selecione outra situação acima.</p>
          </div>
        ) : modoView === "cards" ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {lista.map((n) => (
              <NotaCard key={n.id} nota={n} onClick={() => onSelect(n)} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border bg-card overflow-hidden">
            {/* Cabeçalho das colunas */}
            <div className="flex items-center gap-4 px-4 py-2.5 border-b bg-muted/40 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              <div className="flex-1 min-w-0">Parcela / Competência</div>
              {temPI && <div className="flex-1 min-w-0">Tipo</div>}
              <div className="flex-1 min-w-0">Valor</div>
              <div className="flex-1 min-w-0">Situação</div>
              <div className="flex-1 min-w-0 hidden lg:block">Nº NF</div>
              <div className="w-4 shrink-0" />
            </div>
            <div className="divide-y">
              {lista.map((n) => (
                <NotaRow key={n.id} nota={n} showTipo={temPI} onClick={() => onSelect(n)} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* --------------------- card informativo (KPI) ---------------------------- */
function CardInfo({
  icon: Icon,
  tone,
  valor,
  label,
}: {
  icon: typeof Wallet;
  tone: string;
  valor: string;
  label: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-4 flex items-center gap-3 hover:shadow-sm transition-shadow">
      <div
        className={cn("size-10 rounded-lg border flex items-center justify-center shrink-0", tone)}
      >
        <Icon className="size-5" />
      </div>
      <div className="min-w-0">
        <div className="text-xl font-bold leading-none tabular-nums">{valor}</div>
        <div className="text-xs text-muted-foreground mt-1 leading-tight">{label}</div>
      </div>
    </div>
  );
}

/* ------------------- campo padronizado (label + valor) ------------------- */
function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-5 py-3 min-w-0">
      <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="text-sm font-semibold mt-0.5 truncate" title={value}>
        {value}
      </dd>
    </div>
  );
}

/* ---------------------- campo de e-mail editável -------------------------- */
function CampoEmailEditavel({ inicial }: { inicial: string }) {
  const [email, setEmail] = useState(inicial);
  const [editando, setEditando] = useState(false);
  const [rascunho, setRascunho] = useState(inicial);

  function salvar() {
    setEmail(rascunho.trim() || email);
    setEditando(false);
  }
  function cancelar() {
    setRascunho(email);
    setEditando(false);
  }

  return (
    <div className="px-5 py-3 min-w-0">
      <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        E-mail
      </dt>
      {editando ? (
        <div className="flex items-center gap-1 mt-0.5">
          <input
            type="email"
            value={rascunho}
            onChange={(e) => setRascunho(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") salvar();
              if (e.key === "Escape") cancelar();
            }}
            autoFocus
            className="min-w-0 flex-1 text-sm font-semibold bg-transparent border-b border-primary outline-none py-0.5"
          />
          <button
            type="button"
            onClick={salvar}
            title="Salvar"
            className="text-emerald-600 hover:text-emerald-700 shrink-0"
          >
            <Check className="size-4" />
          </button>
          <button
            type="button"
            onClick={cancelar}
            title="Cancelar"
            className="text-muted-foreground hover:text-foreground shrink-0"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <dd className="group text-sm font-semibold mt-0.5 flex items-center gap-1.5">
          <span className="truncate">{email}</span>
          <button
            type="button"
            onClick={() => {
              setRascunho(email);
              setEditando(true);
            }}
            title="Editar e-mail"
            className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <Pencil className="size-3" />
          </button>
        </dd>
      )}
    </div>
  );
}

/* ------------------------- cartão de uma nota ----------------------------- */
function NotaCard({ nota, onClick }: { nota: NotaFiscal; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group text-left rounded-xl border bg-card p-4 hover:shadow-md hover:border-primary/40 transition-all flex flex-col gap-3 relative overflow-hidden"
    >
      {/* Cabeçalho: parcela + status */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <span>
              Parcela {nota.parcela}/{nota.totalParcelas}
            </span>
            <TipoBadge tipo={nota.tipoNota} />
          </div>
          <div className="font-semibold capitalize leading-tight">
            {competenciaLonga(nota.mesEnvio)}
          </div>
        </div>
        <StatusPill nota={nota} />
      </div>

      {/* Valor */}
      <div>
        <div className="text-xl font-bold tracking-tight">{formatBRL(nota.vlrPtr)}</div>
        {nota.vencimento && (
          <div className="text-xs text-muted-foreground">
            {nota.dataPagamento
              ? `Pago em ${formatDate(nota.dataPagamento)}`
              : `Vence em ${formatDate(nota.vencimento)}`}
          </div>
        )}
      </div>

      {/* Rodapé: número da NF quando paga */}
      {notaPaga(nota) && nota.numeroNF && (
        <div className="text-xs flex items-center justify-between gap-2 pt-2 border-t">
          <span className="inline-flex items-center gap-1 text-emerald-600">
            <CheckCircle2 className="size-3.5" /> Concluída
          </span>
          <span className="font-medium text-foreground shrink-0">NF {nota.numeroNF}</span>
        </div>
      )}
    </button>
  );
}

/* ------------------------- linha de uma nota (lista) ---------------------- */
function NotaRow({
  nota,
  showTipo,
  onClick,
}: {
  nota: NotaFiscal;
  showTipo?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left px-4 py-3 flex items-center gap-4 hover:bg-muted/40 transition-colors"
    >
      {/* Parcela + competência */}
      <div className="flex-1 min-w-0">
        <div className="text-xs text-muted-foreground">
          Parcela {nota.parcela}/{nota.totalParcelas}
        </div>
        <div className="text-sm font-medium capitalize truncate">
          {competenciaLonga(nota.mesEnvio)}
        </div>
      </div>

      {/* Tipo (Normal/PI) */}
      {showTipo && (
        <div className="flex-1 min-w-0">
          <TipoBadge tipo={nota.tipoNota} />
        </div>
      )}

      {/* Valor */}
      <div className="flex-1 min-w-0 text-sm font-semibold">{formatBRL(nota.vlrPtr)}</div>

      {/* Situação */}
      <div className="flex-1 min-w-0">
        <StatusPill nota={nota} />
      </div>

      {/* Nº NF */}
      <div className="flex-1 min-w-0 text-xs text-muted-foreground hidden lg:block">
        {notaPaga(nota) && nota.numeroNF ? `NF ${nota.numeroNF}` : "—"}
      </div>

      <ChevronRight className="size-4 text-muted-foreground shrink-0" />
    </button>
  );
}

/** Etiqueta única de status (Situação NF da fórmula). */
function StatusPill({ nota }: { nota: NotaFiscal }) {
  const meta = statusMeta(nota);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ring-inset whitespace-nowrap shrink-0",
        meta.badge,
      )}
    >
      <span className={cn("size-1.5 rounded-full", meta.dot)} />
      {meta.label}
    </span>
  );
}

/* -------------------------------- Modal --------------------------------- */
function DetalheModal({
  nota,
  onClose,
  onRegistrarPagamento,
  onSalvarComentario,
}: {
  nota: NotaFiscal | null;
  onClose: () => void;
  onRegistrarPagamento: (id: string, data: Date | null, valor: number | null) => void;
  onSalvarComentario: (id: string, texto: string) => void;
}) {
  return (
    <Dialog
      open={!!nota}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-w-2xl p-0 gap-0 max-h-[85vh] overflow-hidden flex flex-col">
        {nota && (
          <DetalheConteudo
            nota={nota}
            onRegistrarPagamento={onRegistrarPagamento}
            onSalvarComentario={onSalvarComentario}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function DetalheConteudo({
  nota,
  onRegistrarPagamento,
  onSalvarComentario,
}: {
  nota: NotaFiscal;
  onRegistrarPagamento: (id: string, data: Date | null, valor: number | null) => void;
  onSalvarComentario: (id: string, texto: string) => void;
}) {
  // Rascunhos editáveis (pagamento manual + comentário).
  const [dataPgto, setDataPgto] = useState<string>(toInputDate(nota.dataPagamento));
  const [valorPgto, setValorPgto] = useState<string>(
    nota.valorPago != null ? String(nota.valorPago) : "",
  );
  const [comentario, setComentario] = useState<string>(nota.comentario);

  // Reinicializa os rascunhos quando a nota muda (ou é atualizada).
  useEffect(() => {
    setDataPgto(toInputDate(nota.dataPagamento));
    setValorPgto(nota.valorPago != null ? String(nota.valorPago) : "");
    setComentario(nota.comentario);
  }, [nota.id, nota.dataPagamento, nota.valorPago, nota.comentario]);

  // Lança o pagamento (data/valor) — a situação vira "Paga" automaticamente.
  function commitPagamento(novaData: string, novoValor: string) {
    const d = fromInputDate(novaData);
    const v = novoValor === "" ? null : Number(novoValor);
    onRegistrarPagamento(nota.id, d, v);
  }

  // Salva o comentário automaticamente (debounce) ao parar de digitar.
  useEffect(() => {
    if (comentario.trim() === nota.comentario.trim()) return;
    const t = setTimeout(() => onSalvarComentario(nota.id, comentario.trim()), 500);
    return () => clearTimeout(t);
  }, [comentario, nota.id, nota.comentario, onSalvarComentario]);

  return (
    <>
      <DialogHeader className="text-left border-b px-6 py-5 pr-12">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <span>
                Nota fiscal · Parcela {nota.parcela}/{nota.totalParcelas}
              </span>
              <TipoBadge tipo={nota.tipoNota} />
            </div>
            <DialogTitle className="text-lg mt-1 leading-tight">{nota.nomeProjeto}</DialogTitle>
            <DialogDescription className="capitalize mt-0.5">
              {competenciaLonga(nota.mesEnvio)} · {nota.empresa}
            </DialogDescription>
          </div>
          <StatusPill nota={nota} />
        </div>
      </DialogHeader>

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 bg-muted/20">
        {/* Financeiro — Valor NF/Vencimento automáticos; pagamento editável */}
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Financeiro
          </h3>
          <div className="rounded-xl border bg-card divide-y sm:divide-y-0 sm:grid sm:grid-cols-4 sm:divide-x">
            <StatCell
              label="Valor NF"
              value={nota.valorNF != null ? formatBRL(nota.valorNF) : "—"}
            />
            <StatCell label="Vencimento NF" value={formatDate(nota.vencimento)} />
            {/* Data de pagamento (editável) */}
            <div className="p-4">
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Data de pagamento
              </div>
              <input
                type="date"
                value={dataPgto}
                onChange={(e) => {
                  const v = e.target.value;
                  setDataPgto(v);
                  commitPagamento(v, valorPgto);
                }}
                className="mt-1 w-full h-9 px-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            {/* Valor pago (editável) */}
            <div className="p-4">
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Valor pago (R$)
              </div>
              <input
                type="number"
                min={0}
                step="0.01"
                value={valorPgto}
                onChange={(e) => {
                  const v = e.target.value;
                  setValorPgto(v);
                  commitPagamento(dataPgto, v);
                }}
                placeholder={nota.valorNF != null ? String(nota.valorNF) : "0,00"}
                className="mt-1 w-full h-9 px-2 rounded-lg border bg-background text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">
            Ao preencher a data e o valor, a situação muda automaticamente para{" "}
            <strong>Paga</strong>. As demais situações continuam automáticas.
          </p>
        </section>

        {/* Andamento do processo */}
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Andamento do processo
          </h3>
          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-start">
              {etapasNota(nota).map((etapa, i) => {
                const done = etapa.situacao === "concluida";
                return (
                  <div
                    key={etapa.etapa}
                    className="flex-1 flex flex-col items-center text-center relative px-1"
                  >
                    {/* Conector com a etapa anterior */}
                    {i > 0 && (
                      <span
                        className={cn(
                          "absolute top-2 right-1/2 left-[-50%] h-0.5",
                          done ? "bg-emerald-500" : "bg-muted",
                        )}
                      />
                    )}
                    {/* Ícone da etapa */}
                    <span className="relative z-10 bg-card rounded-full">
                      {done ? (
                        <CheckCircle2 className="size-4 text-emerald-600" />
                      ) : (
                        <Circle className="size-4 text-muted-foreground/40" />
                      )}
                    </span>
                    <div
                      className={cn(
                        "text-[11px] mt-2 leading-tight",
                        etapa.situacao === "pendente" ? "text-muted-foreground" : "font-medium",
                      )}
                    >
                      {etapa.label}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
                      {etapa.data ? formatDate(etapa.data) : "Aguardando"}
                    </div>
                    {etapa.etapa === "solicitacao_criada" && nota.numeroSolicitacao && (
                      <div className="text-[10px] font-medium mt-0.5">{nota.numeroSolicitacao}</div>
                    )}
                    {etapa.etapa === "nota_emitida" && notaPaga(nota) && nota.numeroNF && (
                      <div className="text-[10px] font-medium mt-0.5">NF {nota.numeroNF}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Comentário da parcela (opcional) — última coisa */}
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Comentário (opcional)
          </h3>
          <div className="rounded-xl border bg-card p-4 space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MessageSquare className="size-3.5" />
              Observação interna para esta parcela, caso queira registrar algo.
            </div>
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              rows={3}
              placeholder="Escreva um comentário..."
              className="w-full rounded-lg border bg-background text-sm p-3 resize-y focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </section>
      </div>
    </>
  );
}

/** Célula de indicador do bloco Financeiro (faixa com divisórias). */
function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-base font-bold mt-1 tabular-nums">{value}</div>
    </div>
  );
}
