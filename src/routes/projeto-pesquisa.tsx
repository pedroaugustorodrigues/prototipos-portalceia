import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  FileText,
  Wallet,
  Users,
  FolderOpen,
  BookOpen,
  Hash,
  Check,
  Plus,
  Sparkles,
  Loader2,
  Download,
  FileDown,
  FileSignature,
  Building2,
  UserCircle2,
  GraduationCap,
  Clock,
  Target,
  ArrowRight,
  Info,
  Cpu,
  CalendarRange,
  Layers,
  Landmark,
  AlertCircle,
  Megaphone,
  Gauge,
  ListOrdered,
  StickyNote,
  ChevronDown,
  ChevronLeft,
  PencilLine,
  Pencil,
  X,
  Upload,
  FileSearch,
} from "lucide-react";
import { PROJECTS } from "@/lib/ptr-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/projeto-pesquisa")({
  head: () => ({
    meta: [
      { title: "Projetos — Portal CEIA" },
      { name: "description", content: "Wizard de cadastro de projeto." },
    ],
  }),
  component: ProjetosWizardPage,
});

type Step = {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const STEPS: Step[] = [
  { key: "dados-gerais", label: "Dados Gerais", icon: FileText },
  { key: "historico-orcamentario", label: "Histórico orçamentário do projeto", icon: Wallet },
  { key: "equipe-despesas", label: "Equipe e Despesas", icon: Users },
  { key: "documentos", label: "Documentos", icon: FolderOpen },
  { key: "projeto-pesquisa", label: "Projeto de Pesquisa", icon: FileSignature },
  { key: "codigo-sigaa", label: "Código SIGAA", icon: Hash },
];

const DEFAULT_STEP = STEPS.findIndex((s) => s.key === "projeto-pesquisa");

function ProjetosWizardPage() {
  const project = PROJECTS[0];
  const [current, setCurrent] = useState(DEFAULT_STEP);

  const ActiveIcon = STEPS[current].icon;

  return (
    <div className="p-6 md:p-10 w-full">
      {/* Header do projeto */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{project.name}</h1>
          <div className="text-sm text-muted-foreground mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>Empresa: {project.client}</span>
            <span className="size-1 rounded-full bg-muted-foreground/60" />
            <span>Coordenador: {project.coordinator}</span>
            <span className="size-1 rounded-full bg-muted-foreground/60" />
            <span>Vigência: {project.vigencia}</span>
          </div>
        </div>
        <div className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-semibold text-yellow-500">
          <span className="size-1.5 rounded-full bg-yellow-400" />
          EM NEGOCIAÇÃO
        </div>
      </div>

      {/* Stepper */}
      <div className="mb-6">
        <ol className="flex items-start justify-between gap-2">
          {STEPS.map((step, idx) => {
            const isActive = idx === current;
            const isDone = idx < current;
            return (
              <li key={step.key} className="flex-1 flex flex-col items-center min-w-0 relative">
                {idx < STEPS.length - 1 && (
                  <span
                    aria-hidden
                    className={cn(
                      "absolute top-2.5 left-1/2 w-full h-[2px]",
                      isDone ? "bg-primary" : "bg-border"
                    )}
                  />
                )}
                <button
                  type="button"
                  onClick={() => setCurrent(idx)}
                  className={cn(
                    "relative z-10 size-5 rounded-full flex items-center justify-center border-2 cursor-pointer transition-colors",
                    isDone && "border-primary bg-primary text-primary-foreground",
                    isActive && "border-primary bg-primary",
                    !isActive && !isDone && "border-border bg-card hover:border-primary/60"
                  )}
                  title={step.label}
                >
                  {isDone && <Check className="size-3" strokeWidth={3} />}
                  {isActive && (
                    <span className="size-2 rounded-full bg-white" aria-hidden />
                  )}
                  {!isActive && !isDone && (
                    <span className="size-2 rounded-full bg-muted-foreground/40" aria-hidden />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setCurrent(idx)}
                  className={cn(
                    "mt-2 text-[11px] md:text-xs text-center leading-tight px-1 cursor-pointer hover:text-foreground transition-colors",
                    isActive ? "text-foreground font-medium" : "text-muted-foreground opacity-70"
                  )}
                >
                  {step.label}
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Conteúdo da etapa */}
      {STEPS[current].key === "codigo-sigaa" ? (
        <CodigoSigaaStep
          onBack={() => setCurrent((c) => Math.max(0, c - 1))}
          onConclude={() => alert("Cadastro do projeto concluído (ilustrativo).")}
        />
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="px-5 py-4 border-b bg-muted/30">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <ActiveIcon className="size-4 text-primary" />
                  <h2 className="text-sm font-semibold leading-tight">{STEPS[current].label}</h2>
                </div>
                {STEPS[current].key === "projeto-pesquisa" && (
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Complete o documento de Projeto de Pesquisa (padrão CEIA/UFG) manualmente, importando um arquivo existente ou com geração assistida por IA.
                  </p>
                )}
              </div>
            </div>
          </div>

          {STEPS[current].key === "projeto-pesquisa" ? (
            <ProjetoPesquisaStep />
          ) : (
            <div className="p-6 md:p-8 min-h-[280px] flex items-center justify-center">
              <p className="text-sm text-muted-foreground">
                Conteúdo de “{STEPS[current].label}” em construção.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Projeto de Pesquisa ──────────────────────────────────────────────────────

type SectionKey =
  | "resumo"
  | "introducao"
  | "objetivos"
  | "revisao"
  | "aspectos"
  | "metodologia"
  | "plano-atividades"
  | "cronograma-execucao"
  | "premissas"
  | "restricoes"
  | "riscos"
  | "resultados"
  | "escopo-nao"
  | "coordenacao-equipe"
  | "orcamento"
  | "cronograma-desembolso"
  | "referencias";

type Section = { key: SectionKey; title: string };

const SECTIONS: Section[] = [
  { key: "resumo", title: "Resumo" },
  { key: "introducao", title: "1. Introdução" },
  { key: "objetivos", title: "2. Objetivos do Projeto" },
  { key: "revisao", title: "3. Revisão da Literatura e dos Componentes Críticos" },
  { key: "aspectos", title: "4. Aspectos Inovadores" },
  { key: "metodologia", title: "5. Metodologia" },
  { key: "plano-atividades", title: "6. Plano de Atividades" },
  { key: "cronograma-execucao", title: "7. Cronograma de Execução das Atividades" },
  { key: "premissas", title: "8. Premissas" },
  { key: "restricoes", title: "9. Restrições" },
  { key: "riscos", title: "10. Riscos Identificados" },
  { key: "resultados", title: "11. Resultados Esperados no Projeto" },
  { key: "escopo-nao", title: "12. Escopo não incluído" },
  { key: "coordenacao-equipe", title: "13. Coordenação e Equipe" },
  { key: "orcamento", title: "14. Orçamento do Projeto" },
  { key: "cronograma-desembolso", title: "15. Cronograma de Desembolso Previsto" },
  { key: "referencias", title: "16. Referências" },
];

type Generated = Record<SectionKey, string>;

type Modo = "manual" | "documento" | "ia";

const MODOS: { key: Modo; icon: React.ComponentType<{ className?: string }>; title: string; desc: string }[] = [
  {
    key: "manual",
    icon: PencilLine,
    title: "Preencher manualmente",
    desc: "Escreva você mesmo cada seção do template, sem IA.",
  },
  {
    key: "documento",
    icon: Upload,
    title: "Importar documento existente",
    desc: "Envie um PDF, DOC ou DOCX e leia os dados automaticamente para o projeto.",
  },
  {
    key: "ia",
    icon: Sparkles,
    title: "Gerar com IA",
    desc: "Informe os dados de contexto e deixe a IA estruturar o documento completo.",
  },
];

function ProjetoPesquisaStep() {
  const project = PROJECTS[0];

  // Dados pré-preenchidos automaticamente (vêm do SRINFO / etapas anteriores)
  const dadosBaseFixos = {
    titulo: project.name,
    empresa: project.client,
    unidadeEmbrapii: "CEIA",
    coordenador: project.coordinator,
    lattesCoordenador: "http://lattes.cnpq.br/1234567890123456",
    dataInicio: "01/06/2026",
    dataEncerramento: "30/05/2028",
    duracaoMeses: 24,
    objetivo:
      "Desenvolver um framework de IA corporativa, com agentes autônomos e raciocinio multi-hop sobre bases heterogêneas, capaz de responder perguntas complexas e propor melhorias operacionais a partir de manuais, regulamentações e relatórios históricos da empresa, servindo como base para um ‘Cientista de IA Corporativo’ autônomo.",
    recursoEmpresa: "R$ 1.000.000,00",
    recursoEmbrapii: "R$ 1.000.000,00",
    totalFinanceiro: "R$ 2.000.000,00",
    contrapartidaEconomica: "R$ 400.000,00",
    totalProjeto: "R$ 2.400.000,00",
  };

  // Campos manuais (não existem no SRINFO — sempre preenchidos pelo usuário)
  const [siglaEmpresa, setSiglaEmpresa] = useState("");
  const [areaPesquisa, setAreaPesquisa] = useState("");
  const [entidades, setEntidades] = useState<string[]>([
    "UFG",
    "FUNAPE",
    "CEIA",
    "EMBRAPII",
  ]);
  const interveniente = "Universidade Federal de Goiás";
  const [objetivoGeral, setObjetivoGeral] = useState(dadosBaseFixos.objetivo);
  const [componentesTec, setComponentesTec] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [numMacroentregas, setNumMacroentregas] = useState<number>(4);
  const [numEtapas, setNumEtapas] = useState<number>(8);
  const [trl, setTrl] = useState<number>(6);

  // Forma de completude escolhida
  const [modo, setModo] = useState<Modo | null>(null);

  // Estado IA
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<Generated | null>(null);
  const [fonte, setFonte] = useState<"ia" | "documento" | "manual" | null>(null);

  // Importação de projeto existente
  const [importing, setImporting] = useState(false);
  const [importedFileName, setImportedFileName] = useState<string | null>(null);
  const [importedFileSize, setImportedFileSize] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  const GERACAO_MS = 10_000;

  function handleImportFile(file: File) {
    setImporting(true);
    setImportedFileName(file.name);
    setImportedFileSize(file.size);
    // Camada modular ilustrativa — sem integração real.
    setTimeout(() => {
      const siglaExtraida = siglaEmpresa || "AVT";
      const areaExtraida = areaPesquisa || "Inteligência Artificial";
      const componentesExtraidos =
        componentesTec || "Processamento de Linguagem Natural; Large Language Models; Agentes autônomos";
      setSiglaEmpresa(siglaExtraida);
      setAreaPesquisa(areaExtraida);
      setComponentesTec(componentesExtraidos);
      setGenerated(buildMockGenerated({
        ...dadosBaseFixos,
        objetivo: objetivoGeral,
        siglaEmpresa: siglaExtraida,
        areaPesquisa: areaExtraida,
        numMacroentregas,
        numEtapas,
        trl,
        orcamentoTotal: dadosBaseFixos.totalProjeto,
        componentesTec: componentesExtraidos,
      }));
      setFonte("documento");
      setImporting(false);
      toast.success("Projeto de pesquisa gerado com sucesso", {
        description: "Revise as seções estruturadas pela IA antes de exportar.",
      });
    }, GERACAO_MS);
  }

  function handleAutocompletar() {
    setSiglaEmpresa("AVT");
    setAreaPesquisa("Inteligência Artificial");
    setComponentesTec("Processamento de Linguagem Natural; Large Language Models; Agentes autônomos");
    setObservacoes((v) => v || "Projeto sem restrições contratuais adicionais.");
  }

  const camposObrigatorios = [
    { label: "Sigla da Empresa", value: siglaEmpresa },
    { label: "Área de Pesquisa", value: areaPesquisa },
    { label: "Entidades envolvidas", value: entidades.length ? "ok" : "" },
    { label: "Objetivo geral", value: objetivoGeral },
    { label: "Componentes tecnológicos", value: componentesTec },
  ];
  const faltantes = camposObrigatorios.filter((c) => !c.value.trim());
  const podeGerar = faltantes.length === 0 && !generating;

  function handleGerar() {
    setGenerating(true);
    // Camada modular ilustrativa — sem integração real.
    setTimeout(() => {
      setGenerated(buildMockGenerated({
        ...dadosBaseFixos,
        objetivo: objetivoGeral,
        siglaEmpresa,
        areaPesquisa,
        numMacroentregas,
        numEtapas,
        trl,
        orcamentoTotal: dadosBaseFixos.totalProjeto,
        componentesTec,
      }));
      setFonte("ia");
      setGenerating(false);
      toast.success("Projeto de pesquisa gerado com sucesso", {
        description: "Revise as seções estruturadas pela IA antes de exportar.",
      });
    }, GERACAO_MS);
  }

  function handlePreencherManual() {
    setGenerated(
      SECTIONS.reduce((acc, s) => {
        acc[s.key] = "";
        return acc;
      }, {} as Generated)
    );
    setFonte("manual");
    toast.success("Projeto de pesquisa criado para preenchimento manual", {
      description: "Escreva cada seção você mesmo e exporte quando terminar.",
    });
  }

  function handleVoltarManual() {
    setGenerated(null);
    setModo(null);
    setFonte(null);
  }

  function updateSection(key: SectionKey, value: string) {
    setGenerated((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  function handleExportPdf() {
    alert(
      "Exportação ilustrativa: o documento seria gerado utilizando o template oficial do Projeto de Pesquisa (CEIA/UFG)."
    );
  }
  function handleExportSigaa() {
    alert(
      "Exportação ilustrativa: campos preparados para preenchimento manual no SIGAA seriam disponibilizados em arquivo."
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      {!importing && !generating && !generated && renderForm()}
      {importing && renderImporting()}
      {generating && renderGenerating()}
      {generated && renderResult()}
    </div>
  );

  // ── Subviews (helpers retornam JSX para evitar remount a cada teclada) ───
  function renderImporting() {
    const extensao = (importedFileName?.split(".").pop() || "arquivo").toUpperCase();
    const tamanho =
      importedFileSize > 1024 * 1024
        ? `${(importedFileSize / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.max(1, Math.round(importedFileSize / 1024))} KB`;
    const itensBusca = [
      "Dados de identificação da empresa",
      "Objetivo geral e tecnologias",
      "Entidades envolvidas",
      "Plano de atividades e cronograma",
      "Orçamento do projeto",
      "Referências bibliográficas",
    ];

    return (
      <>
        <div className="rounded-xl border bg-card p-5 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <Loader2 className="size-6 animate-spin text-primary shrink-0" />
            <div className="min-w-0">
              <h4 className="text-sm font-semibold text-foreground">Estamos lendo o seu documento</h4>
              <p className="text-xs text-muted-foreground mt-0.5">Mantenha esta página aberta.</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 rounded-lg bg-muted/50 px-3 py-2 shrink-0 min-w-0">
            <FileText className="size-5 text-primary shrink-0" />
            <div className="min-w-0">
              <div
                className="text-xs font-semibold text-foreground truncate max-w-40"
                title={importedFileName ?? ""}
              >
                {importedFileName}
              </div>
              <div className="text-[11px] text-muted-foreground">
                {extensao} · {tamanho}
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
              Status da leitura
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
              <span className="size-1.5 rounded-full bg-muted-foreground/60 animate-pulse" />
              Processando
            </span>
          </div>
        </div>

        <div className="relative h-1.5 rounded-full bg-muted overflow-hidden">
          <div className="animate-progress-loop absolute top-0 h-full w-2/5 rounded-full bg-primary" />
        </div>

        <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
          <div className="flex flex-col items-center gap-3 shrink-0">
            <div className="relative w-72 h-96 rounded-lg border bg-card shadow-md overflow-hidden">
              <div className="p-6 space-y-2.5">
                <div className="h-3.5 w-2/3 rounded bg-muted" />
                <div className="h-2 w-2/5 rounded bg-muted/70 mb-1.5" />
                <div className="h-2 w-full rounded bg-muted mt-3" />
                <div className="h-2 w-full rounded bg-muted" />
                <div className="h-2 w-5/6 rounded bg-muted" />
                <div className="h-2 w-2/3 rounded bg-muted" />
                <div className="grid grid-cols-3 gap-px rounded border bg-border overflow-hidden mt-4">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="h-6 bg-muted/40" />
                  ))}
                </div>
                <div className="h-2 w-1/2 rounded bg-muted mt-4" />
                <div className="h-2 w-full rounded bg-muted" />
                <div className="h-2 w-full rounded bg-muted" />
                <div className="h-2 w-4/5 rounded bg-muted" />
              </div>
              <div className="animate-scan-line absolute inset-x-0 h-20 bg-gradient-to-b from-primary/0 via-primary/20 to-primary/0 border-y border-primary/50" />
            </div>
            <span
              className="text-xs font-medium text-muted-foreground truncate max-w-72"
              title={importedFileName ?? ""}
            >
              {importedFileName}
            </span>
          </div>

          <div className="flex-1 min-w-0 w-full">
            <h4 className="text-sm font-semibold text-foreground">O que estamos procurando no documento</h4>
            <p className="text-xs text-muted-foreground mt-1 mb-3">
              Identificamos e organizamos o conteúdo nos campos do formulário.
            </p>
            <ul className="space-y-2">
              {itensBusca.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2.5 rounded-lg border bg-card px-3.5 py-2.5 text-sm font-medium text-foreground"
                >
                  <FileSearch className="size-4 text-muted-foreground shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </>
    );
  }

  function renderGenerating() {
    const dadosEnviados = [
      { label: "Sigla da empresa", value: siglaEmpresa },
      { label: "Área de pesquisa", value: areaPesquisa },
      { label: "Entidades", value: entidades.join(" · ") },
      { label: "TRL", value: String(trl) },
      { label: "Macroentregas", value: String(numMacroentregas) },
      { label: "Etapas", value: String(numEtapas) },
    ];

    return (
      <>
        <div className="rounded-xl border bg-card p-5 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Loader2 className="size-6 animate-spin text-primary shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-foreground">Nossa IA está escrevendo o projeto</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Leva cerca de 7 a 10 minutos. Mantenha esta página aberta.
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
              Status da geração
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
              <span className="size-1.5 rounded-full bg-muted-foreground/60" />
              Pendente
            </span>
          </div>
        </div>

        <div className="relative h-1.5 rounded-full bg-muted overflow-hidden">
          <div className="animate-progress-loop absolute top-0 h-full w-2/5 rounded-full bg-primary" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] items-center gap-8">
          <div className="rounded-lg border p-4 w-full md:w-72 mx-auto md:mx-0">
            <div className="text-sm font-semibold mb-3">Dados enviados</div>
            <dl className="space-y-2 text-xs">
              {dadosEnviados.map((d) => (
                <div key={d.label} className="flex items-start justify-between gap-3">
                  <dt className="text-muted-foreground shrink-0">{d.label}</dt>
                  <dd className="font-semibold text-right">{d.value || "—"}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="flex items-center gap-3 w-full">
            <div className="flex-1 h-0.5 text-primary/40 animate-flow-line" />
            <div className="shrink-0 flex flex-col items-center gap-2">
              <div className="relative size-20 flex items-center justify-center">
                <div
                  className="absolute inset-0 rounded-full border-2 border-dashed border-primary/40 animate-spin"
                  style={{ animationDuration: "4s" }}
                >
                  <span className="absolute -top-0.75 left-1/2 -translate-x-1/2 size-2 rounded-full bg-primary" />
                </div>
                <div
                  className="absolute inset-3 rounded-full border border-primary/25 animate-spin"
                  style={{ animationDuration: "2.5s", animationDirection: "reverse" }}
                >
                  <span className="absolute -bottom-0.75 left-1/2 -translate-x-1/2 size-1.5 rounded-full bg-primary/70" />
                </div>
                <div className="relative size-12 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                  <Sparkles className="size-5 text-primary" />
                </div>
              </div>
              <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                IA elaborando o projeto
              </span>
            </div>
            <div className="flex-1 h-0.5 text-primary/40 animate-flow-line" />
          </div>

          <div className="flex flex-col items-center gap-2 shrink-0 mx-auto md:mx-0">
            <div className="relative w-52 h-64 mb-3">
              <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-lg border bg-card shadow-sm" />
              <div className="absolute inset-0 rounded-lg border bg-card shadow-md overflow-hidden flex flex-col">
                <div className="flex items-center gap-1.5 px-3.5 py-2 border-b bg-primary/5 shrink-0">
                  <FileSignature className="size-3.5 text-primary shrink-0" />
                  <span className="text-[10px] font-semibold text-primary uppercase tracking-wide">
                    {SECTIONS.length} seções
                  </span>
                </div>
                <div className="flex-1 p-3.5 space-y-2.5 overflow-hidden">
                  {SECTIONS.slice(0, 7).map((s, idx) => (
                    <div key={s.key} className="flex items-center gap-2">
                      <span className="shrink-0 size-4 rounded bg-primary/10 text-primary text-[8px] font-semibold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <div
                        className="h-2 rounded bg-muted"
                        style={{ width: `${55 + ((idx * 11) % 40)}%` }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center gap-1.5 px-3.5 py-2 border-t bg-muted/30 shrink-0">
                  <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] font-medium text-primary">Estruturando seções</span>
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs font-medium text-foreground">Editor do Projeto de Pesquisa</div>
              <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                {SECTIONS.length} seções sendo estruturadas
              </span>
            </div>
          </div>
        </div>
      </>
    );
  }

  function renderForm() {
    const generalChips = [
      { icon: BookOpen, label: "Título do projeto", value: dadosBaseFixos.titulo },
      { icon: Building2, label: "Empresa", value: dadosBaseFixos.empresa },
      { icon: Landmark, label: "Unidade EMBRAPII", value: dadosBaseFixos.unidadeEmbrapii },
      { icon: Landmark, label: "Interveniente", value: interveniente },
      { icon: UserCircle2, label: "Coordenador", value: dadosBaseFixos.coordenador },
      { icon: GraduationCap, label: "Lattes do coordenador", value: dadosBaseFixos.lattesCoordenador },
      { icon: Clock, label: "Vigência", value: `${dadosBaseFixos.dataInicio} a ${dadosBaseFixos.dataEncerramento}` },
      { icon: CalendarRange, label: "Duração do projeto", value: `${dadosBaseFixos.duracaoMeses} meses` },
    ];

    const briefingBlocks: { label: string; value: string; icon: React.ComponentType<{ className?: string }> }[] = [];

    const orcamentoRows = [
      { label: "Recurso Empresa", value: dadosBaseFixos.recursoEmpresa },
      { label: "Financiamento EMBRAPII", value: dadosBaseFixos.recursoEmbrapii },
      { label: "Contrapartida UE", value: dadosBaseFixos.contrapartidaEconomica },
      { label: "Total de Financiamento", value: dadosBaseFixos.totalFinanceiro },
      { label: "Total Geral do Projeto", value: dadosBaseFixos.totalProjeto },
    ];

    return (
      <>
        {/* Dados já cadastrados — colapsável */}
        <CollapsibleSection
          title="Dados já cadastrados"
          subtitle="Informações trazidas automaticamente das etapas anteriores."
          count={generalChips.length + briefingBlocks.length + orcamentoRows.length}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {generalChips.slice(0, 4).map((c) => {
              const Icon = c.icon;
              return (
                <div key={c.label} className="rounded-lg border bg-muted/20 px-3.5 py-2.5 flex items-start gap-2.5">
                  <Icon className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                      {c.label}
                    </div>
                    <div className="text-sm font-medium text-foreground truncate" title={c.value}>
                      {c.value}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {generalChips.length > 4 && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {generalChips.slice(4).map((c) => {
                const Icon = c.icon;
                return (
                  <div key={c.label} className="rounded-lg border bg-muted/20 px-3.5 py-2.5 flex items-start gap-2.5">
                    <Icon className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                        {c.label}
                      </div>
                      <div className="text-sm font-medium text-foreground truncate" title={c.value}>
                        {c.value}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {briefingBlocks.length > 0 && (
            <div className="mt-4 space-y-3">
              {briefingBlocks.map((b) => {
                const Icon = b.icon;
                return (
                  <div key={b.label} className="rounded-lg border bg-muted/20 p-3.5 flex items-start gap-3">
                    <Icon className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                        {b.label}
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">{b.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-4 rounded-lg border bg-muted/20 p-3.5">
            <div className="flex items-center gap-2 mb-3">
              <Wallet className="size-4 text-muted-foreground" />
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                Orçamento do projeto
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {orcamentoRows.map((r) => (
                <OrcamentoCard key={r.label} {...r} />
              ))}
            </div>
          </div>
        </CollapsibleSection>

        {/* Como completar — escolha da forma */}
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Como você quer completar o Projeto de Pesquisa?
          </h3>
          <p className="text-xs text-muted-foreground mt-1 mb-4">
            Escolha uma das formas abaixo. Em qualquer uma delas você poderá revisar as {SECTIONS.length} seções do template oficial CEIA/UFG antes de exportar.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {MODOS.map((m) => {
              const Icon = m.icon;
              const active = modo === m.key;
              return (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => (m.key === "manual" ? handlePreencherManual() : setModo(m.key))}
                  className={cn(
                    "text-left rounded-xl border p-4 transition-colors",
                    active
                      ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                      : "bg-card hover:border-primary/40 hover:bg-muted/30"
                  )}
                >
                  <div
                    className={cn(
                      "size-9 rounded-lg flex items-center justify-center mb-2.5",
                      active ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                    )}
                  >
                    <Icon className="size-4" />
                  </div>
                  <div className="text-sm font-semibold text-foreground">{m.title}</div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{m.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Importar projeto de pesquisa existente */}
        {modo === "documento" && (
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            const file = e.dataTransfer.files?.[0];
            if (file) handleImportFile(file);
          }}
          className={cn(
            "rounded-xl border-2 border-dashed p-5 flex items-center gap-4 transition-colors cursor-pointer",
            dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/40 bg-muted/10 hover:border-primary/50 hover:bg-primary/5"
          )}
        >
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImportFile(file);
              e.target.value = "";
            }}
          />
          <div className="size-10 rounded-full bg-muted flex items-center justify-center shrink-0">
            {importing ? (
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            ) : (
              <Upload className="size-4 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-foreground">
              Importar projeto de pesquisa existente
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              {importing
                ? "Lendo o documento e preenchendo o projeto…"
                : importedFileName
                ? `Dados importados de “${importedFileName}”. Revise os campos abaixo.`
                : "Arraste um arquivo aqui ou selecione no computador. Vamos ler o documento e preencher o projeto para você."}
            </p>
            {!importing && (
              <div className="flex gap-1.5 mt-2">
                {["PDF", "DOC", "DOCX"].map((ext) => (
                  <span
                    key={ext}
                    className="text-[10px] font-medium text-muted-foreground bg-muted rounded-full px-2 py-0.5"
                  >
                    {ext}
                  </span>
                ))}
              </div>
            )}
          </div>
          <span className="shrink-0 inline-flex items-center justify-center rounded-lg border px-4 py-2 text-sm font-medium bg-card">
            Selecionar arquivo
          </span>
        </label>

        )}

        {modo === "ia" && (
          <>
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={handleAutocompletar}
            className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted/50 transition-colors"
          >
            <Sparkles className="size-3.5" />
            Autocompletar campos
          </button>
        </div>

        {/* Campos a completar */}
        <section className="space-y-6">
          {/* Grupo 1 — Identificação */}
          <FormGroup
            title="Identificação"
            description="Como a empresa e a área serão referenciadas no documento."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-5">
              <Field
                icon={Hash}
                label="Sigla da Empresa"
                required
                filled={!!siglaEmpresa.trim()}
                placeholder="Ex.: AVT"
                value={siglaEmpresa}
                onChange={setSiglaEmpresa}
              />
              <Field
                icon={FileSignature}
                label="Área de Pesquisa"
                required
                filled={!!areaPesquisa.trim()}
                placeholder="Ex.: Inteligência Artificial"
                value={areaPesquisa}
                onChange={setAreaPesquisa}
              />
              <MultiSelectField
                icon={Building2}
                label="Entidades envolvidas"
                required
                options={["UFG", "FUNAPE", "CEIA", "EMBRAPII"]}
                value={entidades}
                onChange={setEntidades}
                allowCustom
                className="md:col-span-2"
              />
            </div>
          </FormGroup>

          {/* Grupo 2 — Objetivo geral */}
          <FormGroup
            title="Objetivo e tecnologias"
            description="Descreva o objetivo principal do projeto e as tecnologias envolvidas. Estas informações serão usadas pela IA na geração do documento."
          >
            <div className="space-y-5">
              <Field
                icon={Target}
                label="Objetivo geral"
                required
                filled={!!objetivoGeral.trim()}
                textarea
                rows={4}
                placeholder="Ex.: Desenvolver um framework de IA corporativa, com agentes autônomos…"
                value={objetivoGeral}
                onChange={setObjetivoGeral}
              />
              <Field
                icon={Cpu}
                label="Componentes tecnológicos a revisar"
                required
                filled={!!componentesTec.trim()}
                textarea
                rows={2}
                placeholder="Ex.: Processamento de Linguagem Natural; Large Language Models; Agentes autônomos…"
                value={componentesTec}
                onChange={setComponentesTec}
              />
            </div>
          </FormGroup>

          {/* Grupo 3 — Parâmetros técnicos */}
          <FormGroup
            title="Parâmetros técnicos"
            description="Definem o escopo tecnológico, o cronograma e a maturidade do projeto."
          >
            <div className="@container">
            <div className="grid grid-cols-1 @min-[600px]:grid-cols-3 @min-[720px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-x-5 gap-y-5">
              <NumberField
                icon={Layers}
                label="Nº de macroentregas"
                required
                value={numMacroentregas}
                onChange={setNumMacroentregas}
                min={3}
                max={5}
              />
              <NumberField
                icon={ListOrdered}
                label="Nº de etapas"
                required
                value={numEtapas}
                onChange={setNumEtapas}
                min={1}
                max={50}
              />
              <ScaleField
                icon={Gauge}
                label="TRL"
                required
                value={trl}
                onChange={setTrl}
                min={1}
                max={9}
              />
            </div>
            </div>
          </FormGroup>

          {/* Grupo 4 — Informações adicionais */}
          <FormGroup
            title="Informações adicionais"
            description="Use este espaço para qualquer informação relevante que não tenha campo específico acima."
          >
            <Field
              icon={StickyNote}
              label="Observações"
              filled={!!observacoes.trim()}
              textarea
              rows={3}
              placeholder="Ex.: requisitos especiais, restrições contratuais, contexto adicional para a IA considerar…"
              value={observacoes}
              onChange={setObservacoes}
            />
          </FormGroup>
        </section>

          <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-5 md:p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-3">
              <div className="size-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-sm">
                <Sparkles className="size-6" />
              </div>
              <h4 className="text-base font-semibold">Gerar com IA</h4>
            </div>
            <p className="text-sm text-muted-foreground flex-1">
              A IA combinará os dados do projeto com seus complementos e estruturará todas as {SECTIONS.length} seções do template oficial CEIA/UFG.
            </p>
            <button
              type="button"
              onClick={handleGerar}
              disabled={!podeGerar}
              className={cn(
                "mt-4 inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all w-full",
                podeGerar
                  ? "bg-primary text-primary-foreground hover:opacity-90 shadow-md hover:shadow-lg"
                  : "border border-primary/30 bg-primary/10 text-primary shadow-sm cursor-not-allowed opacity-70"
              )}
            >
              {generating ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Gerando documento…
                </>
              ) : (
                <>
                  Gerar com IA
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </div>
          </>
        )}

      </>
    );
  }

  function renderResult() {
    return (
      <>
        {/* Caixinha informativa */}
        <div className="rounded-xl border bg-card p-4 flex items-start gap-3">
          <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Info className="size-4" />
          </div>
          <div className="text-sm min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-foreground">Revise o conteúdo antes de exportar</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-medium px-2 py-0.5">
                  <Check className="size-3" /> {SECTIONS.length} seções
                </span>
              </div>
              {fonte === "manual" && (
                <button
                  type="button"
                  onClick={handleVoltarManual}
                  className="shrink-0 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  <ChevronLeft className="size-3.5" />
                  Voltar
                </button>
              )}
            </div>
            <p className="mt-1 text-muted-foreground leading-relaxed">
              {fonte === "manual"
                ? "Preencha livremente cada seção do template oficial do Projeto de Pesquisa CEIA/UFG."
                : fonte === "documento"
                ? "Os textos abaixo foram extraídos do documento importado e estruturados seguindo o template oficial do Projeto de Pesquisa CEIA/UFG. Edite livremente cada seção."
                : "Os textos abaixo foram estruturados pela IA seguindo o template oficial do Projeto de Pesquisa CEIA/UFG. Edite livremente cada seção."}{" "}
              Ao final, exporte em PDF ou para preenchimento no SIGAA.
            </p>
          </div>
        </div>

        <div className="rounded-xl border bg-card overflow-hidden">
          <ol className="divide-y">
            {SECTIONS.map((s, idx) => (
              <li key={s.key} className="px-5 py-5">
                <div className="flex items-start gap-3 mb-3">
                  <span className="shrink-0 mt-0.5 size-6 rounded-md bg-primary/10 text-primary text-[11px] font-semibold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold leading-tight">
                      {s.title.replace(/^\d+\.\s*/, "")}
                    </h4>
                  </div>
                </div>
                <textarea
                  value={generated![s.key]}
                  onChange={(e) => updateSection(s.key, e.target.value)}
                  rows={Math.min(
                    18,
                    Math.max(4, generated![s.key].split("\n").length + 1)
                  )}
                  className="w-full rounded-md border bg-background px-3.5 py-2.5 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/40 resize-y"
                />
              </li>
            ))}
          </ol>

          <footer className="px-5 py-4 border-t bg-muted/20 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              Pronto para exportação. As alterações são preservadas no documento final.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={handleExportSigaa}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 shadow-sm"
              >
                <FileDown className="size-4" />
                Campos para SIGAA
              </button>
              <button
                type="button"
                onClick={handleExportPdf}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 shadow-sm"
              >
                <Download className="size-4" />
                Exportar PDF
              </button>
            </div>
          </footer>
        </div>
      </>
    );
  }
}

// ─── Código SIGAA ────────────────────────────────────────────────────────────

function CodigoSigaaStep({
  onBack,
  onConclude,
}: {
  onBack: () => void;
  onConclude: () => void;
}) {
  const [codigoSigaa, setCodigoSigaa] = useState("");
  const [editingSigaa, setEditingSigaa] = useState(false);
  const [sigaaSnapshot, setSigaaSnapshot] = useState("");

  const [processoSei, setProcessoSei] = useState("");
  const [editingSei, setEditingSei] = useState(false);
  const [seiSnapshot, setSeiSnapshot] = useState("");

  const podeConcluir = codigoSigaa.trim().length > 0 && !editingSigaa && !editingSei;

  return (
    <div className="space-y-6">
      {/* ── Código SIGAA ──────────────────────────────────────────────── */}
      <section className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-sm ring-1 ring-black/[0.02] hover:shadow-md transition-shadow">
        <div className="px-5 py-4 border-b bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <Hash className="size-4 text-primary" />
              <h3 className="text-sm font-semibold">Código SIGAA</h3>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Insira o código do projeto, gerado pelo SIGAA. Segue o formato{" "}
              <code className="font-mono text-foreground">PI00000-AAAA</code>.
            </p>
          </div>
        </div>
        <div className="p-5">
          <div className="space-y-1.5">
            <label htmlFor="codigo-sigaa" className="block text-sm font-medium text-foreground">
              Código SIGAA<span className="text-red-600 ml-0.5">*</span>
            </label>
            <div className="flex items-center gap-2">
              <div className={cn("flex-1", !editingSigaa && "cursor-not-allowed")}>
                <input
                  id="codigo-sigaa"
                  value={codigoSigaa}
                  onChange={(e) => setCodigoSigaa(e.target.value)}
                  placeholder={editingSigaa ? "Ex.: PI00000-2024" : ""}
                  readOnly={!editingSigaa}
                  className={cn(
                    "w-full h-10 px-3 rounded-lg border text-sm font-mono focus:outline-none focus:ring-1 focus:ring-ring transition-colors",
                    editingSigaa
                      ? "bg-background"
                      : codigoSigaa
                        ? "bg-muted/40 text-foreground font-semibold pointer-events-none select-none"
                        : "bg-muted/40 text-muted-foreground pointer-events-none select-none"
                  )}
                />
              </div>
              <button
                onClick={() => {
                  if (editingSigaa) {
                    setEditingSigaa(false);
                  } else {
                    setSigaaSnapshot(codigoSigaa);
                    setEditingSigaa(true);
                    setTimeout(() => document.getElementById("codigo-sigaa")?.focus(), 0);
                  }
                }}
                className={cn(
                  "h-10 px-3 shrink-0 flex items-center justify-center gap-1.5 rounded-lg hover:-translate-y-0.5 active:scale-[0.97] transition-all text-sm font-medium shadow-sm border-0",
                  editingSigaa
                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
                title={editingSigaa ? "Confirmar" : "Editar código SIGAA"}
              >
                {editingSigaa ? (
                  <>
                    <Check className="size-4" /> Salvar
                  </>
                ) : (
                  <>
                    <Pencil className="size-4" /> Editar
                  </>
                )}
              </button>
              {editingSigaa && (
                <button
                  onClick={() => {
                    setCodigoSigaa(sigaaSnapshot);
                    setEditingSigaa(false);
                  }}
                  className="h-10 px-3 shrink-0 flex items-center justify-center gap-1.5 rounded-lg border hover:bg-accent hover:-translate-y-0.5 active:scale-[0.97] transition-all text-sm font-medium"
                >
                  <X className="size-4" /> Cancelar
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Processo SEI ──────────────────────────────────────────────── */}
      <section className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-sm ring-1 ring-black/[0.02] hover:shadow-md transition-shadow">
        <div className="px-5 py-4 border-b bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="size-4 text-primary" />
              <h3 className="text-sm font-semibold">Processo SEI</h3>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Insira o número do processo SEI vinculado ao projeto. Segue o formato{" "}
              <code className="font-mono text-foreground">00000.000000/AAAA-00</code>.
            </p>
          </div>
        </div>
        <div className="p-5">
          <div className="space-y-1.5">
            <label htmlFor="processo-sei" className="block text-sm font-medium text-foreground">
              Número do Processo SEI
            </label>
            <div className="flex items-center gap-2">
              <div className={cn("flex-1", !editingSei && "cursor-not-allowed")}>
                <input
                  id="processo-sei"
                  value={processoSei}
                  onChange={(e) => setProcessoSei(e.target.value)}
                  placeholder={editingSei ? "Ex.: 23070.012345/2024-56" : ""}
                  readOnly={!editingSei}
                  className={cn(
                    "w-full h-10 px-3 rounded-lg border text-sm font-mono focus:outline-none focus:ring-1 focus:ring-ring transition-colors",
                    editingSei
                      ? "bg-background"
                      : "bg-muted/40 text-muted-foreground pointer-events-none select-none"
                  )}
                />
              </div>
              <button
                onClick={() => {
                  if (editingSei) {
                    setEditingSei(false);
                  } else {
                    setSeiSnapshot(processoSei);
                    setEditingSei(true);
                    setTimeout(() => document.getElementById("processo-sei")?.focus(), 0);
                  }
                }}
                className={cn(
                  "h-10 px-3 shrink-0 flex items-center justify-center gap-1.5 rounded-lg hover:-translate-y-0.5 active:scale-[0.97] transition-all text-sm font-medium shadow-sm border-0",
                  editingSei
                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
                title={editingSei ? "Confirmar" : "Editar processo SEI"}
              >
                {editingSei ? (
                  <>
                    <Check className="size-4" /> Salvar
                  </>
                ) : (
                  <>
                    <Pencil className="size-4" /> Editar
                  </>
                )}
              </button>
              {editingSei && (
                <button
                  onClick={() => {
                    setProcessoSei(seiSnapshot);
                    setEditingSei(false);
                  }}
                  className="h-10 px-3 shrink-0 flex items-center justify-center gap-1.5 rounded-lg border hover:bg-accent hover:-translate-y-0.5 active:scale-[0.97] transition-all text-sm font-medium"
                >
                  <X className="size-4" /> Cancelar
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Ações ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center justify-center gap-2 rounded-lg border bg-card px-4 py-2 text-sm font-medium hover:bg-accent hover:-translate-y-0.5 active:scale-[0.97] transition-all shadow-sm"
        >
          <ChevronLeft className="size-4" /> Voltar
        </button>
        <button
          type="button"
          onClick={onConclude}
          disabled={!podeConcluir}
          className={cn(
            "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium shadow-sm transition-all",
            podeConcluir
              ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:-translate-y-0.5 active:scale-[0.97]"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          <Check className="size-4" /> Concluir
        </button>
      </div>
    </div>
  );
}

function OrcamentoCard({
  label,
  value,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
  total?: boolean;
}) {
  return (
    <div className="rounded-lg bg-card border border-border/60 px-3.5 py-3 flex flex-col gap-1.5 shadow-[0_1px_0_rgba(0,0,0,0.02)]">
      <span className="min-h-8 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold leading-4">
        {label}
      </span>
      <span className="tabular-nums text-sm font-semibold text-foreground leading-tight">
        {value}
      </span>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
  textarea,
  rows,
  className,
  icon: Icon,
  filled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  textarea?: boolean;
  rows?: number;
  className?: string;
  icon?: React.ComponentType<{ className?: string }>;
  filled?: boolean;
}) {
  const baseInput =
    "w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring transition-colors placeholder:text-muted-foreground/60";
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      <span className="flex items-center gap-2 text-xs font-medium text-foreground">
        {Icon && <Icon className="size-3.5 text-muted-foreground" />}
        <span>
          {label}
          {required && <span className="text-red-600 ml-0.5">*</span>}
        </span>
      </span>
      {textarea ? (
        <textarea
          rows={rows ?? 3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(baseInput, "h-auto py-2 resize-y")}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={baseInput}
        />
      )}
    </label>
  );
}

function MultiSelectField({
  label,
  options,
  value,
  onChange,
  required,
  className,
  icon: Icon,
  allowCustom,
}: {
  label: string;
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
  required?: boolean;
  className?: string;
  icon?: React.ComponentType<{ className?: string }>;
  allowCustom?: boolean;
}) {
  const [custom, setCustom] = useState("");
  function toggle(opt: string) {
    if (value.includes(opt)) onChange(value.filter((v) => v !== opt));
    else onChange([...value, opt]);
  }
  function addCustom() {
    const v = custom.trim();
    if (!v) return;
    if (!value.some((e) => e.toLowerCase() === v.toLowerCase())) {
      onChange([...value, v]);
    }
    setCustom("");
  }
  const customEntries = value.filter(
    (v) => !options.some((o) => o.toLowerCase() === v.toLowerCase()),
  );
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <span className="flex items-center gap-2 text-xs font-medium text-foreground">
        {Icon && <Icon className="size-3.5 text-muted-foreground" />}
        <span>
          {label}
          {required && <span className="text-red-600 ml-0.5">*</span>}
        </span>
      </span>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
        {[...options, ...customEntries].map((opt) => {
          const active = value.includes(opt);
          const isCustom = customEntries.includes(opt);
          return (
            <label
              key={opt}
              className={cn(
                "flex items-center gap-3 rounded-lg border bg-background px-4 py-3 cursor-pointer select-none transition-colors",
                "hover:bg-muted/40",
                active ? "border-primary/40" : "border-input",
              )}
            >
              <input
                type="checkbox"
                checked={active}
                onChange={() => {
                  if (isCustom) {
                    onChange(value.filter((v) => v !== opt));
                  } else {
                    toggle(opt);
                  }
                }}
                className="size-4 rounded border-input text-primary focus:ring-2 focus:ring-ring focus:ring-offset-1 cursor-pointer"
              />
              <span className="flex-1 text-sm font-medium text-foreground truncate">{opt}</span>
            </label>
          );
        })}
      </div>
      {allowCustom && (
        <div className="pt-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustom();
                }
              }}
              placeholder="Adicionar outra entidade…"
              className="flex-1 h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
            />
            <button
              type="button"
              onClick={addCustom}
              disabled={!custom.trim()}
              className="inline-flex items-center gap-1.5 h-10 px-3 rounded-lg border border-input bg-background text-sm font-medium text-foreground hover:bg-muted/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="size-4" />
              Adicionar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  className,
  icon: Icon,
  required,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  className?: string;
  icon?: React.ComponentType<{ className?: string }>;
  required?: boolean;
}) {
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      <span className="flex items-center gap-2 text-xs font-medium text-foreground">
        {Icon && <Icon className="size-3.5 text-muted-foreground" />}
        <span>
          {label}
          {required && <span className="text-red-600 ml-0.5">*</span>}
        </span>
      </span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => {
          const n = parseInt(e.target.value, 10);
          if (!Number.isNaN(n)) onChange(n);
        }}
        className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
      />
    </label>
  );
}

function ScaleField({
  label,
  value,
  onChange,
  min,
  max,
  className,
  icon: Icon,
  required,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  className?: string;
  icon?: React.ComponentType<{ className?: string }>;
  required?: boolean;
}) {
  const options = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <span className="flex items-center gap-2 text-xs font-medium text-foreground">
        {Icon && <Icon className="size-3.5 text-muted-foreground" />}
        <span>
          {label}
          {required && <span className="text-red-600 ml-0.5">*</span>}
        </span>
      </span>
      {/* Linha única quando cabe; senão grade 5 colunas (1–5 / 6–9) — depende do @container do pai */}
      <div className="grid grid-cols-5 gap-1.5 @min-[720px]:flex">
        {options.map((n) => {
          const active = n === value;
          return (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              className={cn(
                "h-10 w-full @min-[720px]:w-10 rounded-lg border text-sm font-semibold transition-colors shrink-0",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-background hover:border-primary/50 hover:bg-muted/50"
              )}
            >
              {n}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FormGroup({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

function CollapsibleSection({
  title,
  subtitle,
  count,
  children,
}: {
  title: string;
  subtitle?: string;
  count?: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full px-5 py-3.5 flex items-center gap-3 hover:bg-muted/30 transition-colors text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">{title}</span>
            {typeof count === "number" && (
              <span className="text-[10px] font-medium text-muted-foreground bg-muted rounded-full px-1.5 py-0.5">
                {count}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
        <ChevronDown
          className={cn(
            "size-4 text-muted-foreground shrink-0 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      {open && <div className="px-5 pb-5 pt-1">{children}</div>}
    </div>
  );
}

// ─── Mock IA: gera conteúdo no formato do template Projeto de Pesquisa ───────

function buildMockGenerated(input: {
  titulo: string;
  empresa: string;
  siglaEmpresa: string;
  areaPesquisa: string;
  unidadeEmbrapii: string;
  coordenador: string;
  dataInicio: string;
  dataEncerramento: string;
  duracaoMeses: number;
  numMacroentregas: number;
  numEtapas: number;
  trl: number;
  orcamentoTotal: string;
  objetivo: string;
  componentesTec: string;
}): Generated {
  const sigla = input.siglaEmpresa || "EMPRESA";
  const empresa = input.empresa;
  const area = input.areaPesquisa.trim() || "Inteligência Artificial";
  const compsTec = input.componentesTec.trim() || area;
  const dur = input.duracaoMeses;
  const nMacros = Math.max(3, Math.min(5, input.numMacroentregas || 4));
  const nEtapas = Math.max(nMacros, input.numEtapas || nMacros * 2);
  const trl = Math.max(1, Math.min(9, input.trl || 6));
  const obj = input.objetivo.trim();
  const objLower = obj ? obj.charAt(0).toLowerCase() + obj.slice(1) : "";

  // ── Conteúdo derivado automaticamente pela IA a partir de título + objetivo + componentes
  const objEspBlock = `• Levantar o estado da arte em ${compsTec} aplicado ao escopo do projeto.\n• Especificar e construir as bases de dados e artefatos técnicos necessários.\n• Desenvolver e validar os módulos centrais da solução.\n• Integrar os módulos em um protótipo funcional em ambiente relevante (TRL ${trl}).\n• Documentar resultados e transferir conhecimento à equipe técnica da ${sigla}.`;

  const resultBlock = `• Framework/protótipo funcional aderente ao objetivo do projeto, validado em ambiente relevante.\n• Resolução de problemas práticos relacionados aos desafios apresentados pela ${sigla}.\n• Geração de conhecimento técnico-científico em ${compsTec}.\n• Troca de experiência entre pesquisadores da UE CEIA/UFG e da ${sigla}.`;

  const escopoNaoBlock = `• Operação contínua, sustentação ou suporte de produção das soluções entregues.\n• Integração com sistemas legados não previstos no plano de trabalho.\n• Customizações específicas além do escopo acordado entre as partes.\n• Evolução para níveis de maturidade superiores ao TRL ${trl}.`;

  const aspectosBlock = `Os aspectos de inovação deste projeto de PD&I estão no desenvolvimento de algoritmos, técnicas e tecnologias de ${compsTec} aplicados especificamente ao contexto da ${sigla}, agregando diferencial competitivo ao negócio da empresa e abrindo caminho para aplicações comerciais inéditas no segmento.`;

  const tratamentoBlock = `Serão utilizados exclusivamente dados corporativos fornecidos pela ${sigla}, sem coleta de dados pessoais sensíveis ou de seres humanos. Por essa razão, não há necessidade de submissão a Comitê de Ética em Pesquisa (CEP/CONEP), conforme Resolução CNS nº 510/2016.`;

  // Distribuição linear das macroentregas no tempo
  const macroMonths = Array.from({ length: nMacros }, (_, i) =>
    Math.max(2, Math.round(((i + 1) * dur) / (nMacros + 1)))
  );

  const etapasPorMacro = (idx: number) => {
    const base = Math.floor(nEtapas / nMacros);
    const extra = nEtapas % nMacros;
    const count = base + (idx < extra ? 1 : 0);
    const start = idx * base + Math.min(idx, extra);
    return Array.from({ length: count }, (_, j) =>
      `Etapa ${start + j + 1} — Atividade ${String.fromCharCode(65 + j)} da Macroentrega ${idx + 1}`
    ).join("\n");
  };

  const planoBlock = Array.from({ length: nMacros }, (_, i) =>
    `Macroentrega ${i + 1} (mês ${macroMonths[i]})\n${etapasPorMacro(i)}\n• 2 a 4 atividades agregadas, com entregáveis técnicos e relatório.`
  ).join("\n\n");

  // Orçamento — desembolso mensal linear ilustrativo
  const totalEmp = 1_000_000;
  const totalEmb = 1_000_000;
  const mensalEmp = (totalEmp / dur).toFixed(2).replace(".", ",");
  const mensalEmb = (totalEmb / dur).toFixed(2).replace(".", ",");
  const porMacroEmp = (totalEmp / nMacros).toFixed(2).replace(".", ",");
  const porMacroEmb = (totalEmb / nMacros).toFixed(2).replace(".", ",");

  const custoMacroBlock = Array.from({ length: nMacros }, (_, i) =>
    `• Macroentrega ${i + 1} — Empresa: R$ ${porMacroEmp} / EMBRAPII: R$ ${porMacroEmb}`
  ).join("\n");

  const desembolsoBlock = Array.from({ length: dur }, (_, i) =>
    `Mês ${i + 1}: Empresa R$ ${mensalEmp} | EMBRAPII R$ ${mensalEmb}`
  ).join("\n");

  return {
    resumo: `Área de Pesquisa: ${area}. Período: ${dur} meses (${input.dataInicio} a ${input.dataEncerramento}).\n\n${input.objetivo}\n\nEste projeto, desenvolvido em parceria com a ${empresa} (${sigla}), tem como objetivo ${objLower}. A pesquisa será conduzida pela ${input.unidadeEmbrapii}, com aplicação direta de técnicas de ${compsTec}, organizada em ${nMacros} macroentregas associadas aos desembolsos da empresa.`,
    introducao: `${input.objetivo}\n\nNeste contexto, a ${input.unidadeEmbrapii} espera, com este projeto, contribuir com a ${sigla} permitindo o desenvolvimento de soluções inovadoras que trarão maior competitividade no mercado, além de agregar valor e melhorar o processo produtivo da ${sigla}.\n\nEste projeto está no contexto do Centro de Excelência em Inteligência Artificial em parceria com a Fapeg.`,
    objetivos: `Esta pesquisa tem como objetivo geral ${objLower}.\n\nEm particular, tem-se os seguintes objetivos específicos:\n${objEspBlock}`,
    revisao: `Esta seção apresenta uma revisão sucinta do estado da arte dos componentes tecnológicos centrais ao projeto: ${compsTec}. Serão revisadas técnicas clássicas e abordagens recentes baseadas em aprendizado profundo, com foco nos componentes críticos: qualidade dos dados, generalização dos modelos, escalabilidade e explicabilidade. A revisão privilegia artigos científicos recentes e fundamentará as escolhas metodológicas e a definição da arquitetura da solução.`,
    aspectos: aspectosBlock,
    metodologia: `A estratégia envolve a participação de alunos de graduação, mestrado, doutorado, pós-doutorado e professores da Universidade Federal de Goiás remunerados por meio de bolsas de estudos de pesquisa. Em particular para este projeto, também será admitida a participação de alunos de outras instituições de ensino superior.\n\nO trabalho será conduzido em ciclos iterativos: levantamento e curadoria de dados, prototipação de modelos, validação experimental e refinamento, com alinhamentos periódicos junto à equipe técnica da ${sigla}.\n\nTratamento de dados: ${tratamentoBlock}`,
    "plano-atividades": `Este projeto será executado em ${dur} meses, organizado em ${nMacros} macroentregas associadas aos desembolsos da ${sigla}. Cada macroentrega agrega entre 2 e 4 atividades.\n\n${planoBlock}`,
    "cronograma-execucao": `O cronograma de execução deste projeto prevê o prazo de ${dur} meses, com as macroentregas distribuídas linearmente ao longo do período:\n\n${Array.from(
      { length: nMacros },
      (_, i) => `• Macroentrega ${i + 1} — entrega prevista no mês ${macroMonths[i]}`
    ).join("\n")}\n\nO detalhamento mês a mês das etapas é apresentado na tabela de cronograma do template.`,
    premissas: `As seguintes premissas foram consideradas verdadeiras para o sucesso do projeto:\n• A ${sigla} deverá validar as entregas em até 10 (dez) dias úteis.\n• Mudanças no escopo deverão ser acordadas entre ambas as partes.\n• Haverá participação efetiva da equipe técnica da ${sigla}.\n• A ${sigla} se compromete a fornecer os dados necessários à execução.\n• A UE CEIA/UFG e a ${sigla} fornecerão pessoal adequado conforme acordo.\n• A UE CEIA/UFG terá plena autonomia na definição e gestão de sua equipe.\n• A UE CEIA/UFG detém conhecimento prévio em ${area} (${compsTec}) aplicado ao escopo.\n• Comunicações: e-mail, telefone e reuniões periódicas a serem definidas no início do projeto.`,
    restricoes: `As seguintes restrições são consideradas verdadeiras para o sucesso do projeto:\n• Os aportes financeiros recebidos como doação pela ${sigla} para a consecução dos objetivos estabelecidos não serão considerados recursos financeiros aportados pela empresa no projeto, ainda que utilizados na execução do mesmo, constituindo-se em mera liberalidade por parte da ${sigla}.\n• Os resultados e/ou entregas previstos neste projeto pertencem ao nível de maturidade ${trl} (escala TRL).`,
    riscos: `Os riscos inicialmente identificados para este projeto são:\n• Atraso no aporte da empresa.\n• Possíveis dificuldades na obtenção dos dados juntamente com a empresa.\n• Obtenção de resultados abaixo do esperado devido à qualidade dos dados ou heterogeneidade dos cenários.\n• Resultados abaixo do esperado por riscos naturais associados à atividade de pesquisa.\n\nA UE CEIA/UFG juntamente com a ${sigla} se compromete na identificação e gerenciamento de riscos durante todo o projeto, com estratégias adequadas de mitigação e ações de resposta.`,
    resultados: `Espera-se que o projeto entregue:\n${resultBlock}\n\nO projeto também contribuirá para pesquisas de mestrado e doutorado e para iniciação científica/tecnológica, oferecendo aos alunos contato profissional com o campo de atuação.`,
    "escopo-nao": `Considerando o nível de maturidade TRL ${trl}, o escopo deste projeto não inclui:\n${escopoNaoBlock}`,
    "coordenacao-equipe": `Para a coordenação do projeto a UE CEIA/UFG designa ${input.coordenador}, responsável pelo bom andamento do projeto no que se refere à orientação da equipe, definição das diretrizes técnicas e de pesquisa durante todo o projeto, bem como pelo cumprimento das metas acordadas entre as partes.\n\nA equipe inicial do projeto será composta por pesquisadores sêniores, alunos de graduação, mestrado e doutorado e colaboradores de desenvolvimento, conforme detalhamento no plano de trabalho.`,
    orcamento: `O valor total do orçamento do projeto é de ${input.orcamentoTotal} e é composto da seguinte forma:\n\nORÇAMENTO TOTAL\n• Recursos Empresa: R$ 1.000.000,00 (≈42%)\n• Recursos EMBRAPII: R$ 1.000.000,00 (≈42%)\n• Total Financeiro: R$ 2.000.000,00 (≈84%)\n• Contrapartida econômica UE CEIA/UFG*: R$ 400.000,00 (≈16%)\n• TOTAL PROJETO: ${input.orcamentoTotal} (100%)\n\n* A contrapartida pode incluir infraestrutura, recursos humanos, conhecimento e documentação acadêmicos, diárias/passagens, serviços de terceiros e despesas de suporte operacional.\n\nCUSTO POR MACROENTREGA (distribuição linear)\n${custoMacroBlock}`,
    "cronograma-desembolso": `O aporte (desembolso) dos recursos financeiros para a execução deste projeto será feito de forma linear ao longo dos ${dur} meses:\n\nDesembolso mensal por fonte de recurso:\n• Empresa: R$ ${mensalEmp}/mês\n• EMBRAPII: R$ ${mensalEmb}/mês\n\nDetalhamento mês a mês:\n${desembolsoBlock}`,
    referencias: `As citações de fontes bibliográficas seguem o sistema numérico da NBR 10520 e a construção das fontes obedece ao formato sugerido pela NBR 6023. Referências utilizadas exclusivamente nas seções de Introdução, Contexto e Revisão dos Componentes Tecnológicos, privilegiando artigos científicos.\n\n[1] Referências bibliográficas pertinentes ao estado da arte de ${compsTec} serão consolidadas após a etapa de revisão da literatura.\n[2] Documentação técnica e materiais de apoio fornecidos pela ${sigla}.\n[3] Padrões e recomendações aplicáveis ao domínio do projeto.`,
  };
}
