import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BrushCleaning,
  CalendarRange,
  CheckCircle2,
  ChevronLeft,
  CircleDashed,
  ClipboardList,
  FileBadge,
  Filter,
  Inbox,
  Layers,
  Pencil,
  Search,
  ShieldCheck,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { useActiveProfile } from "@/lib/profile";
import {
  BOLSAS,
  PROJETOS,
  formatBRL,
  formatYearMonthLabel,
  getMembro,
  getProjeto,
  monthsBetween,
} from "@/lib/equipe-bolsas-data";
import {
  CCS,
  CC_POR_BOLSA,
  CPF_POR_MEMBRO,
  EXTRAS,
  PEIA_POR_PROJETO,
  getCc,
} from "@/lib/bolsistas-shared";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/cadastro-bolsistas")({
  head: () => ({
    meta: [
      { title: "Controle de Cadastramento de Bolsistas — Portal CEIA" },
      {
        name: "description",
        content:
          "Controle de cadastro de bolsistas da Equipe Administrativa.",
      },
    ],
  }),
  component: CadastroBolsistasPage,
});

// --- Helpers determinísticos para preencher dados mock por bolsaId ---
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}
function pick<T>(seed: string, opts: readonly T[]): T {
  return opts[hash(seed) % opts.length];
}

const STATUS_OPCOES = ["Concluído", "Distrato", "A cadastrar", "Processando"] as const;
const CARGA_OPCOES = ["20h", "30h", "40h"] as const;
const INSTITUICAO_OPCOES = [
  "UFG",
  "UnB",
  "USP",
  "UFRJ",
  "UFMG",
  "PUC-GO",
  "IFG",
] as const;
const TIPO_VINCULO_OPCOES = [
  "Discente",
  "Docente",
  "TAE",
  "Externo",
] as const;
const OK_PENDENTE = ["OK", "Pendente"] as const;
const SIM_NAO = ["Sim", "Não"] as const;
const SOCS_OPCOES = ["OK", "Cad"] as const;
const DISP_SISTEMA_OPCOES = ["OK", "Pendente", "1°", "2°", "3°"] as const;

function emailFromNome(nome: string): string {
  const slug = nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z\s]/g, "")
    .trim()
    .replace(/\s+/g, ".");
  return `${slug}@ceia.ufg.br`;
}

type LinhaBolsista = {
  bolsaId: string;
  memberId: string;
  nome: string;
  cpf: string;
  ccId: string;
  ccNome: string;
  ccCodigo: string;
  inicio: string;
  fim: string;
  valor: number;
  // auto
  status: string;
  parcelas: number;
  cargaHoraria: string;
  instituicao: string;
  tipoVinculo: string;
  email: string;
  socs: string;
  cronograma: string;
  cadastroFunape: string;
  cronogramaFunape: string;
  disponivelSistema: string;
  cadastroContatos: string;
  // editáveis (default vem do mock)
  cadastroSrinfo: string;
  bolsistaSo: string;
};

function CadastroBolsistasPage() {
  const profile = useActiveProfile();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [pickerQuery, setPickerQuery] = useState("");
  const [busca, setBusca] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("todos");
  const [filterFonte, setFilterFonte] = useState<string>("todos");

  // Overrides editáveis das colunas de Situação cadastral
  const [overridesSocs, setOverridesSocs] = useState<Record<string, string>>({});
  const [overridesCronograma, setOverridesCronograma] = useState<Record<string, string>>({});
  const [overridesFunape, setOverridesFunape] = useState<Record<string, string>>({});
  const [overridesCronFunape, setOverridesCronFunape] = useState<Record<string, string>>({});
  const [overridesDisp, setOverridesDisp] = useState<Record<string, string>>({});
  const [overridesSrinfo, setOverridesSrinfo] = useState<Record<string, string>>({});
  const [overridesSo, setOverridesSo] = useState<Record<string, string>>({});

  const resumoProjetos = useMemo(() => {
    return PROJETOS.map((p) => {
      const bolsasDoProjeto = BOLSAS.filter((b) => b.projetoId === p.id);
      const extrasDoProjeto = EXTRAS.filter((e) => e.projetoId === p.id);
      const totalLinhas = bolsasDoProjeto.length + extrasDoProjeto.length;
      const bolsistasIds = new Set<string>([
        ...bolsasDoProjeto.map((b) => b.memberId),
        ...extrasDoProjeto.map((e) => e.memberId),
      ]);

      let vigenciaInicio: string | null = null;
      let vigenciaFim: string | null = null;
      for (const b of bolsasDoProjeto) {
        if (!vigenciaInicio || b.inicio < vigenciaInicio) vigenciaInicio = b.inicio;
        if (!vigenciaFim || b.fim > vigenciaFim) vigenciaFim = b.fim;
      }
      for (const e of extrasDoProjeto) {
        if (!vigenciaInicio || e.inicio < vigenciaInicio) vigenciaInicio = e.inicio;
        if (!vigenciaFim || e.fim > vigenciaFim) vigenciaFim = e.fim;
      }

      return {
        projeto: p,
        totalLinhas,
        bolsistas: bolsistasIds.size,
        vigenciaInicio,
        vigenciaFim,
      };
    });
  }, []);

  const filteredProjetos = useMemo(() => {
    const q = pickerQuery.toLowerCase().trim();
    if (!q) return resumoProjetos;
    return resumoProjetos.filter((r) => {
      const hay = `${r.projeto.nome} ${r.projeto.sigla}`.toLowerCase();
      return hay.includes(q);
    });
  }, [resumoProjetos, pickerQuery]);

  // Linhas do projeto selecionado
  const linhas = useMemo<LinhaBolsista[]>(() => {
    if (!selectedProjectId) return [];
    const rows: LinhaBolsista[] = [];

    // Bolsas base
    for (const b of BOLSAS.filter((x) => x.projetoId === selectedProjectId)) {
      const m = getMembro(b.memberId);
      if (!m) continue;
      const ccId = CC_POR_BOLSA[b.id];
      const cc = getCc(ccId);
      rows.push(buildLinha({
        bolsaId: b.id,
        memberId: b.memberId,
        nome: m.nome,
        cpf: CPF_POR_MEMBRO[b.memberId] ?? "—",
        ccId: ccId ?? "",
        ccNome: cc?.nome ?? "—",
        ccCodigo: cc?.codigo ?? "—",
        inicio: b.inicio,
        fim: b.fim,
        valor: b.valorMensal,
      }));
    }
    // Extras
    for (const e of EXTRAS.filter((x) => x.projetoId === selectedProjectId)) {
      const cc = getCc(e.ccId);
      rows.push(buildLinha({
        bolsaId: e.bolsaId,
        memberId: e.memberId,
        nome: e.nome,
        cpf: e.cpf,
        ccId: e.ccId,
        ccNome: cc?.nome ?? "—",
        ccCodigo: cc?.codigo ?? "—",
        inicio: e.inicio,
        fim: e.fim,
        valor: e.valor,
      }));
    }

    return rows.sort((a, b) =>
      a.ccCodigo.localeCompare(b.ccCodigo) || a.nome.localeCompare(b.nome),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProjectId, overridesSocs, overridesCronograma, overridesFunape, overridesCronFunape, overridesDisp, overridesSrinfo, overridesSo]);

  function buildLinha(base: {
    bolsaId: string;
    memberId: string;
    nome: string;
    cpf: string;
    ccId: string;
    ccNome: string;
    ccCodigo: string;
    inicio: string;
    fim: string;
    valor: number;
  }): LinhaBolsista {
    const seed = base.bolsaId;
    const parcelas = Math.max(1, monthsBetween(base.inicio, base.fim));
    return {
      ...base,
      status: pick(seed + "status", STATUS_OPCOES),
      parcelas,
      cargaHoraria: pick(seed + "carga", CARGA_OPCOES),
      instituicao: pick(seed + "inst", INSTITUICAO_OPCOES),
      tipoVinculo: pick(seed + "tipo", TIPO_VINCULO_OPCOES),
      email: emailFromNome(base.nome),
      socs: overridesSocs[base.bolsaId] ?? pick(seed + "socs", SOCS_OPCOES),
      cronograma: overridesCronograma[base.bolsaId] ?? pick(seed + "cron", OK_PENDENTE),
      cadastroFunape: overridesFunape[base.bolsaId] ?? pick(seed + "funape", OK_PENDENTE),
      cronogramaFunape: overridesCronFunape[base.bolsaId] ?? pick(seed + "cronfunape", OK_PENDENTE),
      disponivelSistema: overridesDisp[base.bolsaId] ?? pick(seed + "sist", DISP_SISTEMA_OPCOES),
      cadastroContatos: pick(seed + "contatos", SIM_NAO),
      cadastroSrinfo: overridesSrinfo[base.bolsaId] ?? "",
      bolsistaSo: overridesSo[base.bolsaId] ?? "",
    };
  }

  // Linhas filtradas
  const linhasFiltradas = useMemo(() => {
    const q = busca.toLowerCase().trim();
    return linhas.filter((l) => {
      if (q) {
        const hay = `${l.nome} ${l.cpf} ${l.ccNome} ${l.ccCodigo} ${l.email}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (filterStatus !== "todos" && l.status !== filterStatus) return false;
      if (filterFonte !== "todos" && l.ccNome !== filterFonte) return false;
      return true;
    });
  }, [linhas, busca, filterStatus, filterFonte]);

  // Fontes disponíveis (CC nomes distintos do projeto)
  const fontesDisponiveis = useMemo(() => {
    const set = new Set(linhas.map((l) => l.ccNome));
    return Array.from(set).sort();
  }, [linhas]);

  // KPIs do projeto
  const kpis = useMemo(() => {
    const total = linhas.length;
    const completos = linhas.filter((l) => !isPendente(l)).length;
    const pendentes = total - completos;
    const so = linhas.filter((l) => l.bolsistaSo === "Sim").length;
    return { total, completos, pendentes, so };
  }, [linhas]);

  if (profile.id !== "admin") {
    return <Navigate to="/central-solicitacoes" />;
  }

  // ----- Tela de seleção de projeto -----
  if (!selectedProjectId) {
    return (
      <div className="p-6 md:p-10 w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight uppercase">
            Controle de Cadastramento de Bolsistas
          </h1>
          <p className="text-muted-foreground mt-2">
            Selecione um projeto para gerenciar o cadastramento de bolsistas.
          </p>
        </div>

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

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjetos.map((r) => {
            const peia = PEIA_POR_PROJETO[r.projeto.id];
            return (
              <button
                key={r.projeto.id}
                onClick={() => setSelectedProjectId(r.projeto.id)}
                className={cn(
                  "relative text-left group rounded-2xl border bg-card transition-all p-5 flex flex-col overflow-hidden",
                  "hover:border-primary/50 hover:shadow-lg hover:-translate-y-0.5",
                )}
              >
                <h3 className="font-semibold leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-4">
                  {r.projeto.nome}
                </h3>

                <div className="space-y-1.5 text-sm text-foreground/80">
                  {peia && (
                    <div className="flex items-center gap-2 truncate">
                      <FileBadge className="size-3.5 shrink-0 text-muted-foreground" />
                      <span className="font-mono text-[12px] truncate">{peia}</span>
                    </div>
                  )}
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
                    <Users className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate">
                      {r.bolsistas} {r.bolsistas === 1 ? "bolsista" : "bolsistas"}
                    </span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t flex items-center justify-between text-sm font-medium text-primary">
                  <span>Gerenciar cadastro de bolsistas</span>
                  <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            );
          })}

          {filteredProjetos.length === 0 && (
            <div className="col-span-full rounded-2xl border-2 border-dashed border-border p-12 flex flex-col items-center gap-3 text-center">
              <div className="size-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <Inbox className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Nenhum projeto encontrado
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Ajuste a busca e tente novamente.
                </p>
              </div>
              {pickerQuery && (
                <button
                  onClick={() => setPickerQuery("")}
                  className="mt-1 text-xs font-medium text-primary hover:underline"
                >
                  Limpar busca
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ----- Tela de detalhe do projeto -----
  const projetoSelecionado = getProjeto(selectedProjectId);
  const resumoSelecionado = resumoProjetos.find(
    (r) => r.projeto.id === selectedProjectId,
  );
  const peiaSelecionado = selectedProjectId
    ? PEIA_POR_PROJETO[selectedProjectId]
    : undefined;

  function setOverride(
    map: Record<string, string>,
    setMap: (m: Record<string, string>) => void,
    id: string,
    value: string,
  ) {
    setMap({ ...map, [id]: value });
  }

  return (
    <div className="p-6 md:p-10 w-full space-y-6">
      <header className="space-y-2">
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
        <h1 className="text-3xl font-bold tracking-tight">
          {projetoSelecionado?.nome}
        </h1>
        {(peiaSelecionado || resumoSelecionado?.vigenciaInicio) && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {peiaSelecionado && (
              <div className="flex items-center gap-1.5">
                <FileBadge className="size-3.5 shrink-0" />
                <span className="font-mono">{peiaSelecionado}</span>
              </div>
            )}
            {resumoSelecionado?.vigenciaInicio && resumoSelecionado?.vigenciaFim && (
              <div className="flex items-center gap-1.5">
                <CalendarRange className="size-3.5 shrink-0" />
                <span>
                  {formatYearMonthLabel(resumoSelecionado.vigenciaInicio)} – {formatYearMonthLabel(resumoSelecionado.vigenciaFim)}
                </span>
              </div>
            )}
          </div>
        )}
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <KpiCard
          icon={<Users className="size-4" />}
          label="Bolsistas no projeto"
          value={kpis.total}
          tone="primary"
        />
        <KpiCard
          icon={<ShieldCheck className="size-4" />}
          label="Cadastro completo"
          value={kpis.completos}
          tone="success"
        />
        <KpiCard
          icon={<AlertTriangle className="size-4" />}
          label="Com pendências"
          value={kpis.pendentes}
          tone="warning"
        />
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
        <div className="relative flex-1">
          <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por bolsista, CPF, e-mail ou CC..."
            className="w-full rounded-lg border pl-10 pr-3 py-2 bg-white text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="flex items-center gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="rounded-lg border bg-white text-foreground px-3 py-2 w-[170px] h-auto shadow-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Status: todos</SelectItem>
              <SelectItem value="Concluído">Status: Concluído</SelectItem>
              <SelectItem value="Distrato">Status: Distrato</SelectItem>
              <SelectItem value="A cadastrar">Status: A cadastrar</SelectItem>
              <SelectItem value="Processando">Status: Processando</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Select value={filterFonte} onValueChange={setFilterFonte}>
            <SelectTrigger className="rounded-lg border bg-white text-foreground px-3 py-2 w-[170px] h-auto shadow-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Fonte: todas</SelectItem>
              {fontesDisponiveis.map((f) => (
                <SelectItem key={f} value={f}>Fonte: {f}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {(busca || filterStatus !== "todos" || filterFonte !== "todos") && (
          <button
            type="button"
            onClick={() => {
              setBusca("");
              setFilterStatus("todos");
              setFilterFonte("todos");
            }}
            title="Limpar filtros"
            aria-label="Limpar filtros"
            className="inline-flex items-center justify-center size-10 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60"
          >
            <BrushCleaning className="size-4" />
          </button>
        )}
      </div>

      {/* Tabela */}
      <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b bg-gradient-to-r from-card to-muted/30">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-semibold leading-tight">
                Bolsistas cadastrados
              </h2>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              As colunas do grupo{" "}
              <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded text-[9px] font-bold bg-primary/10 text-primary align-middle"><Pencil className="size-2.5" />EDIT</span>{" "}
              são editáveis diretamente no campo — algumas já vêm pré-preenchidas e outras devem ser informadas manualmente.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              {/* Linha de grupos */}
              <tr className="text-[9px] uppercase tracking-[0.12em] font-bold border-b">
                <th
                  className="sticky left-0 z-30 text-left px-3 py-2 text-muted-foreground"
                  style={{
                    background: "#f1f5f9",
                    minWidth: 240,
                    boxShadow: "inset -2px 0 0 0 #cbd5e1",
                  }}
                >
                  Bolsista
                </th>
                <GroupTh colSpan={1} tone="slate">Status</GroupTh>
                <GroupTh colSpan={4} tone="blue">Vínculo financeiro</GroupTh>
                <GroupTh colSpan={3} tone="violet">Vigência & carga</GroupTh>
                <GroupTh colSpan={3} tone="teal">Vínculo institucional</GroupTh>
                <GroupTh colSpan={7} tone="amber" editable>Situação cadastral</GroupTh>
              </tr>
              {/* Linha de colunas */}
              <tr className="text-[10px] uppercase tracking-wider text-muted-foreground border-b" style={{ background: "#f8fafc" }}>
                <Th sticky stickyWidth={240}>
                  <span className="flex items-center gap-1.5"><Users className="size-3" /> Nome / CPF</span>
                </Th>
                <Th>Status</Th>
                <Th groupStart>Fonte</Th>
                <Th>CC</Th>
                <Th>Valor</Th>
                <Th>Parcelas</Th>
                <Th groupStart>Início</Th>
                <Th>Fim</Th>
                <Th>Carga</Th>
                <Th groupStart>Instituição</Th>
                <Th>Tipo vínculo</Th>
                <Th>E-mail</Th>
                <Th groupStart>Docs pessoais</Th>
                <Th>Cronograma</Th>
                <Th>Cad. FUNAPE</Th>
                <Th>Cron. → FUNAPE</Th>
                <Th>Disp. sistema</Th>
                <Th>SRINFO</Th>
                <Th>Bolsista S.O.</Th>
              </tr>
            </thead>
            <tbody>
              {linhasFiltradas.map((l, idx) => {
                const temPendencia = isPendente(l);
                return (
                  <tr
                    key={l.bolsaId}
                    className={cn(
                      "transition-colors group/row",
                      idx % 2 === 0 ? "bg-white" : "bg-slate-50",
                      "hover:!bg-blue-50",
                    )}
                  >
                    <Td sticky stickyWidth={240} className="!py-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="size-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 bg-blue-50 text-blue-700"
                          aria-hidden
                        >
                          {iniciais(l.nome)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-foreground text-[13px] leading-tight truncate flex items-center gap-1.5">
                            {l.nome}
                            {temPendencia && (
                              <AlertTriangle className="size-3 text-amber-600 shrink-0" />
                            )}
                          </div>
                          <div className="font-mono text-[11px] text-muted-foreground leading-tight truncate">{l.cpf}</div>
                        </div>
                      </div>
                    </Td>
                    <Td groupStart={false}><StatusPill value={l.status} /></Td>
                    <Td groupStart><FontePill nome={l.ccNome} /></Td>
                    <Td className="whitespace-nowrap text-foreground">{l.ccCodigo}</Td>
                    <Td className="whitespace-nowrap text-foreground tabular-nums">{formatBRL(l.valor)}</Td>
                    <Td className="whitespace-nowrap text-foreground tabular-nums">{l.parcelas}</Td>
                    <Td groupStart className="whitespace-nowrap text-foreground">{formatYearMonthLabel(l.inicio)}</Td>
                    <Td className="whitespace-nowrap text-foreground">{formatYearMonthLabel(l.fim)}</Td>
                    <Td className="whitespace-nowrap text-foreground">{l.cargaHoraria}</Td>
                    <Td groupStart className="whitespace-nowrap text-foreground">{l.instituicao}</Td>
                    <Td className="whitespace-nowrap text-foreground">{l.tipoVinculo}</Td>
                    <Td className="whitespace-nowrap text-foreground max-w-[200px] truncate" title={l.email}>{l.email}</Td>
                    <Td groupStart>
                      <EditableField
                        value={l.socs}
                        onChange={(v) => setOverride(overridesSocs, setOverridesSocs, l.bolsaId, v)}
                      />
                    </Td>
                    <Td>
                      <EditableField
                        value={l.cronograma}
                        onChange={(v) => setOverride(overridesCronograma, setOverridesCronograma, l.bolsaId, v)}
                      />
                    </Td>
                    <Td>
                      <EditableField
                        value={l.cadastroFunape}
                        onChange={(v) => setOverride(overridesFunape, setOverridesFunape, l.bolsaId, v)}
                      />
                    </Td>
                    <Td>
                      <EditableField
                        value={l.cronogramaFunape}
                        onChange={(v) => setOverride(overridesCronFunape, setOverridesCronFunape, l.bolsaId, v)}
                      />
                    </Td>
                    <Td>
                      <EditableField
                        value={l.disponivelSistema}
                        onChange={(v) => setOverride(overridesDisp, setOverridesDisp, l.bolsaId, v)}
                      />
                    </Td>
                    <Td>
                      <EditableField
                        value={l.cadastroSrinfo}
                        onChange={(v) => setOverride(overridesSrinfo, setOverridesSrinfo, l.bolsaId, v)}
                      />
                    </Td>
                    <Td>
                      <EditableField
                        value={l.bolsistaSo}
                        onChange={(v) => setOverride(overridesSo, setOverridesSo, l.bolsaId, v)}
                      />
                    </Td>
                  </tr>
                );
              })}

              {linhasFiltradas.length === 0 && (
                <tr>
                  <td colSpan={19} className="px-4 py-16 text-center text-sm text-muted-foreground">
                    <div className="flex flex-col items-center gap-3">
                      <div className="size-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                        <Search className="size-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Nenhum bolsista encontrado</p>
                        <p className="text-xs mt-0.5">Ajuste os filtros e tente novamente.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 border-t bg-muted/20 text-[11px] text-muted-foreground">
          <span>
            Exibindo <span className="font-semibold text-foreground">{linhasFiltradas.length}</span> de <span className="font-semibold text-foreground">{linhas.length}</span> bolsistas
          </span>
          <span className="flex items-center gap-1">
            <CircleDashed className="size-3" />
            Campos do grupo Situação cadastral são editáveis — alguns já vêm pré-preenchidos e outros são informados manualmente
          </span>
        </div>
      </div>
    </div>
  );
}

// ---------- Helpers ----------

function isPendente(l: LinhaBolsista): boolean {
  return (
    (l.socs !== "OK" && l.socs !== "Cad") ||
    l.cronograma !== "OK" ||
    l.cadastroFunape !== "OK" ||
    l.cronogramaFunape !== "OK" ||
    l.disponivelSistema !== "OK"
  );
}

function iniciais(nome: string): string {
  const parts = nome.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ---------- Subcomponentes ----------

function Th({
  children,
  sticky,
  editable,
  stickyWidth,
  groupStart,
}: {
  children: React.ReactNode;
  sticky?: boolean;
  editable?: boolean;
  stickyWidth?: number;
  groupStart?: boolean;
}) {
  return (
    <th
      className={cn(
        "text-left font-semibold px-3 py-2.5 whitespace-nowrap",
        sticky && "sticky left-0 z-20",
        groupStart && "border-l-2 border-l-slate-200",
        editable && "text-primary",
      )}
      style={
        sticky
          ? {
              background: "#f8fafc",
              minWidth: stickyWidth,
              boxShadow: "inset -2px 0 0 0 #cbd5e1",
            }
          : undefined
      }
    >
      <div className="flex items-center gap-1.5">
        {children}
        {editable && (
          <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded text-[8px] font-bold bg-primary/10 text-primary">
            <Pencil className="size-2.5" />
            EDIT
          </span>
        )}
      </div>
    </th>
  );
}

function Td({
  children,
  sticky,
  className,
  stickyWidth,
  groupStart,
}: {
  children: React.ReactNode;
  sticky?: boolean;
  className?: string;
  stickyWidth?: number;
  groupStart?: boolean;
}) {
  return (
    <td
      className={cn(
        "px-3 py-2 border-b align-middle",
        sticky && "sticky left-0 z-10 bg-inherit group-hover/row:bg-primary/5",
        groupStart && "border-l-2 border-l-slate-200",
        className,
      )}
      style={
        sticky
          ? {
              minWidth: stickyWidth,
              background: "inherit",
              boxShadow: "inset -2px 0 0 0 #cbd5e1",
            }
          : undefined
      }
    >
      {children}
    </td>
  );
}

function GroupTh({
  children,
  colSpan,
  tone,
  editable,
}: {
  children: React.ReactNode;
  colSpan: number;
  tone: "slate" | "blue" | "violet" | "teal" | "amber" | "primary";
  editable?: boolean;
}) {
  const toneStyles: Record<typeof tone, string> = {
    slate: "bg-slate-100 text-muted-foreground border-slate-200",
    blue: "bg-slate-100 text-muted-foreground border-slate-200",
    violet: "bg-slate-100 text-muted-foreground border-slate-200",
    teal: "bg-slate-100 text-muted-foreground border-slate-200",
    amber: "bg-slate-100 text-muted-foreground border-slate-200",
    primary: "bg-slate-100 text-muted-foreground border-slate-200",
  };
  return (
    <th colSpan={colSpan} className={cn("text-left px-3 py-1.5 border-l border-r font-bold", toneStyles[tone])}>
      <div className="flex items-center gap-1.5">
        {children}
        {editable && (
          <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded text-[8px] font-bold bg-primary/10 text-primary">
            <Pencil className="size-2.5" />
            EDIT
          </span>
        )}
      </div>
    </th>
  );
}

function KpiCard({
  icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  hint?: string;
  tone: "primary" | "success" | "warning" | "info";
}) {
  const tones: Record<typeof tone, string> = {
    primary: "bg-primary/10 text-primary",
    success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
    warning: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
    info: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300",
  };
  return (
    <div className="rounded-2xl border bg-card p-4 flex items-center gap-3 hover:shadow-sm transition-shadow">
      <div className={cn("size-10 rounded-xl flex items-center justify-center shrink-0", tones[tone])}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium truncate">{label}</div>
        <div className="text-2xl font-bold leading-tight tabular-nums">{value}</div>
        {hint && <div className="text-[11px] text-muted-foreground mt-0.5 truncate">{hint}</div>}
      </div>
    </div>
  );
}

function SelectChip({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  const active = value !== "todos";
  return (
    <label
      className={cn(
        "inline-flex items-center gap-1.5 h-9 pl-2.5 pr-1 rounded-lg border text-xs font-medium transition-colors cursor-pointer",
        active
          ? "bg-primary/10 border-primary/30 text-primary"
          : "bg-background border-border text-muted-foreground hover:bg-muted/60",
      )}
    >
      <span className="text-[10px] uppercase tracking-wider opacity-70">{label}:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent outline-none cursor-pointer font-semibold pr-1 text-foreground"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}

function LegendDot(_props: { tone: "success" | "warning"; label: string }) {
  return null;
}
void LegendDot;



function FontePill({ nome }: { nome: string }) {
  const palette: Record<string, { bg: string; text: string; border: string }> = {
    EMBRAPII: { bg: "bg-blue-50", text: "text-blue-800", border: "border-blue-200" },
    EMPRESA: { bg: "bg-fuchsia-50", text: "text-fuchsia-800", border: "border-fuchsia-200" },
    SEBRAE: { bg: "bg-orange-50", text: "text-orange-800", border: "border-orange-200" },
  };
  const c = palette[nome] ?? { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200" };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border whitespace-nowrap", c.bg, c.text, c.border)}>
      {nome}
    </span>
  );
}

function StatusPill({ value }: { value: string }) {
  const variant =
    value === "Concluído"
      ? {
          cls: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900",
          icon: <CheckCircle2 className="size-3" />,
        }
      : value === "Distrato"
        ? {
            cls: "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900",
            icon: <XCircle className="size-3" />,
          }
        : value === "Processando"
          ? {
              cls: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900",
              icon: <CircleDashed className="size-3 animate-spin" />,
            }
          : {
              cls: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900",
              icon: <CircleDashed className="size-3" />,
            };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border whitespace-nowrap",
        variant.cls,
      )}
    >
      {variant.icon}
      {value}
    </span>
  );
}

function AutoPill({ value }: { value: string }) {
  if (value === "Cad") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider border whitespace-nowrap bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900">
        <CheckCircle2 className="size-2.5" />
        Cad
      </span>
    );
  }
  if (/^\d+°$/.test(value)) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider border whitespace-nowrap bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-900">
        {value}
      </span>
    );
  }
  const ok = value === "OK" || value === "Sim";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider border whitespace-nowrap",
        ok
          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900"
          : "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900",
      )}
    >
      {ok ? <CheckCircle2 className="size-2.5" /> : <AlertTriangle className="size-2.5" />}
      {value}
    </span>
  );
}

function EditableField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "w-full min-w-[72px] max-w-[120px] rounded-md border border-input bg-background px-2 py-1 text-[11px] text-foreground shadow-sm transition-colors",
        "hover:border-ring/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
      )}
    />
  );
}

// Para evitar warning de import não usado quando CCS for futuro
void CCS;
void AutoPill;
