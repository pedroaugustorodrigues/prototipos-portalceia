import { createFileRoute } from "@tanstack/react-router";
import { useState, useCallback, useRef } from "react";
import {
  Search,
  Trash2,
  Upload,
  X,
  FileText,
  FileSignature,
  Landmark,
  BookOpen,
  Download,
  ChevronDown,
  Pencil,
  Check,
  LayoutDashboard,
  BarChart3,
  Users,
  Target,
  ClipboardList,
  Flag,
  Plus,
  Eye,
  Activity,
  CalendarDays,
  CalendarClock,
  CalendarCheck,
  CalendarX,
  ClipboardCheck,
  Lightbulb,
  Gauge,
  Heart,
  MessageSquare,
  User2,
  CheckCircle2,
  Loader2,
  CircleDashed,
  ScanSearch,
} from "lucide-react";
import {
  PROJECTS,
  FONTES_ORCAMENTARIAS,
  type Project,
  type FonteOrcamentaria,
} from "@/lib/ptr-data";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/projetos/")({
  head: () => ({
    meta: [
      { title: "Projetos — Portal CEIA" },
      { name: "description", content: "Gerencie seus projetos de pesquisa e inovação." },
    ],
  }),
  component: ProjetosPage,
});

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

let _seq = 0;
function uid() {
  return `cc-${Date.now()}-${++_seq}`;
}

// Mock de centros de custo disponíveis para importação
const MOCK_CC_NUMBERS = [
  "32.087.001", "32.087.002", "32.087.003", "32.087.004", "32.087.005",
  "32.088.001", "32.088.002", "32.089.001", "32.089.002", "32.090.001",
];

type CcRow = {
  id: string;
  numeroCc: string;
  fonte: string;
  valorAlocado: string;
  percentual: string;
  banco: string;
  agencia: string;
  contaCorrente: string;
};

/** Valores padrão por fonte para auto-preenchimento quando o projeto não traz a fonte cadastrada. */
const FONTE_DEFAULTS: Record<string, number> = {
  embrapii: 480000,
  sebrae: 350000,
  empresa: 120000,
  "empresa pequena": 80000,
};

/** Tenta cruzar a fonte selecionada com os dados do projeto para auto-preencher. */
function autoFillFromFonte(
  fonte: string,
  fontesList: FonteOrcamentaria[],
  totalOrcamento: number
): { valorAlocado: string; percentual: string } {
  if (!fonte) return { valorAlocado: "", percentual: "" };
  const key = fonte.toLowerCase();
  const match = fontesList.find((f) => f.fonte.toLowerCase() === key);
  const valorTotal = match?.valorTotal ?? FONTE_DEFAULTS[key];
  if (valorTotal == null) return { valorAlocado: "", percentual: "" };
  const baseTotal = totalOrcamento > 0 ? totalOrcamento : valorTotal;
  const pct = ((valorTotal / baseTotal) * 100).toFixed(2);
  return {
    valorAlocado: valorTotal.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }),
    percentual: pct,
  };
}

// ─── Page: Formalização ───────────────────────────────────────────────────────

const PROJECT_TABS: { key: string; label: string; icon: React.ReactNode }[] = [
  { key: "sumario", label: "Sumário", icon: <LayoutDashboard className="size-4" /> },
  { key: "financeiro", label: "Financeiro", icon: <BarChart3 className="size-4" /> },
  { key: "equipe", label: "Equipe", icon: <Users className="size-4" /> },
  { key: "documentos", label: "Documentos", icon: <FileText className="size-4" /> },
  { key: "macroentregas", label: "Macroentregas", icon: <Target className="size-4" /> },
  { key: "plano-trabalho", label: "Plano de Trabalho", icon: <ClipboardList className="size-4" /> },
  { key: "contrato-final", label: "Formalização", icon: <FileSignature className="size-4" /> },
];

export function ProjetosPage({ status = "contratacao" }: { status?: "contratacao" | "execucao" } = {}) {
  const project = PROJECTS[0];
  const fontes = FONTES_ORCAMENTARIAS.filter((f) => f.projectId === project.id);
  const totalOrcamento = fontes.reduce((s, f) => s + f.valorTotal, 0);

  const statusBadge =
    status === "execucao"
      ? { label: "EM EXECUÇÃO", bg: "bg-emerald-100", text: "text-emerald-600", dot: "bg-emerald-500" }
      : { label: "EM CONTRATAÇÃO", bg: "bg-sky-100", text: "text-sky-500", dot: "bg-sky-400" };

  const isExecucao = status === "execucao";
  const [activeTabKey, setActiveTabKey] = useState<string>(
    isExecucao ? "macroentregas" : "contrato-final"
  );
  const enabledKeys = isExecucao
    ? new Set(["macroentregas", "documentos", "encerramento"])
    : new Set(["contrato-final"]);
  const tabs = isExecucao
    ? [
        ...PROJECT_TABS.filter((t) => t.key !== "contrato-final"),
        { key: "encerramento", label: "Encerramento", icon: <Flag className="size-4" /> },
      ]
    : PROJECT_TABS;
  const disabledHint = isExecucao
    ? "Disponível em breve"
    : "Disponível após a formalização";

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
        <div className={cn("shrink-0 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold", statusBadge.bg, statusBadge.text)}>
          <span className={cn("size-1.5 rounded-full", statusBadge.dot)} />
          {statusBadge.label}
        </div>
      </div>

      {/* Tab bar */}
      <div
        className="border-b mb-6 flex overflow-x-auto w-full"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" } as React.CSSProperties}
      >
        {tabs.map((t) => {
          const isActive = t.key === activeTabKey;
          const isEnabled = enabledKeys.has(t.key);
          return (
            <button
              key={t.key}
              type="button"
              disabled={!isEnabled}
              aria-disabled={!isEnabled}
              onClick={isEnabled ? () => setActiveTabKey(t.key) : undefined}
              title={isEnabled ? undefined : disabledHint}
              className={cn(
                "relative flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium -mb-px whitespace-nowrap flex-1 min-w-0",
                !isEnabled && "cursor-not-allowed opacity-60"
              )}
            >
              <div
                className={cn(
                  "flex items-center gap-2",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                {t.icon}
                <span>{t.label}</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-[2px] overflow-hidden">
                <span
                  style={{
                    display: "block",
                    height: "100%",
                    backgroundColor: "var(--primary)",
                    transform: isActive ? "scaleX(1)" : "scaleX(0)",
                    transformOrigin: "center",
                    transition: "transform 360ms cubic-bezier(.2,.9,.2,1)",
                  }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {isExecucao ? (
        activeTabKey === "documentos" ? (
          <DocumentosTab />
        ) : activeTabKey === "encerramento" ? (
          <EncerramentoTab />
        ) : (
          <MacroentregasTab />
        )
      ) : (
      <ContratoFinalTab
        project={project}
        fontes={fontes}
        totalOrcamento={totalOrcamento}
      />
      )}
    </div>
  );
}

// ─── Tab: Contrato Final ───────────────────────────────────────────────────────

function ContratoFinalTab({
  project: _project,
  fontes,
  totalOrcamento,
}: {
  project: Project;
  fontes: FonteOrcamentaria[];
  totalOrcamento: number;
}) {
  // Upload
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // PEIA
  const [codigoPeia, setCodigoPeia] = useState("");
  const [editingPeia, setEditingPeia] = useState(false);
  const [peiaSnapshot, setPeiaSnapshot] = useState("");

  // Centros de custo
  const [rows, setRows] = useState<CcRow[]>([]);
  const [editingCcs, setEditingCcs] = useState(false);
  const [rowsSnapshot, setRowsSnapshot] = useState<CcRow[]>([]);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [ccSearch, setCcSearch] = useState("");
  const [selectedCcs, setSelectedCcs] = useState<Set<string>>(new Set());

  // ── Upload handlers ──────────────────────────────────────────────────────────
  function handleFileSelect(files: FileList | null) {
    setUploadError(null);
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!["application/pdf", "image/jpeg", "image/png"].includes(file.type) && !file.name.endsWith(".pdf")) {
      setUploadError("Formato não suportado. Use PDF, JPG ou PNG.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("Arquivo muito grande. O limite é 10 MB.");
      return;
    }
    setUploadedFile(file);
  }
  function handleDragOver(e: React.DragEvent) { e.preventDefault(); setDragging(true); }
  function handleDragLeave(e: React.DragEvent) { e.preventDefault(); setDragging(false); }
  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    handleFileSelect(e.dataTransfer.files);
  }

  // ── CC modal handlers ────────────────────────────────────────────────────────
  const alreadyAddedCcs = new Set(rows.map((r) => r.numeroCc));
  const filteredCcs = MOCK_CC_NUMBERS.filter(
    (cc) => cc.toLowerCase().includes(ccSearch.toLowerCase())
  );

  const toggleCcSelection = (cc: string) => {
    if (alreadyAddedCcs.has(cc)) return;
    setSelectedCcs((prev) => {
      const next = new Set(prev);
      next.has(cc) ? next.delete(cc) : next.add(cc);
      return next;
    });
  };

  const confirmImport = () => {
    const newRows: CcRow[] = [];
    selectedCcs.forEach((numeroCc) => {
      newRows.push({ id: uid(), numeroCc, fonte: "", valorAlocado: "", percentual: "", banco: "Banco do Brasil", agencia: "86-8", contaCorrente: "" });
    });
    setRows((prev) => [...prev, ...newRows]);
    setSelectedCcs(new Set());
    setCcSearch("");
    setImportModalOpen(false);
  };

  const removeRow = useCallback((id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const updateRow = useCallback(
    (id: string, field: keyof Omit<CcRow, "id" | "numeroCc">, value: string) => {
      setRows((prev) =>
        prev.map((row) => {
          if (row.id !== id) return row;
          if (field === "fonte") {
            const fill = autoFillFromFonte(value, fontes, totalOrcamento);
            return { ...row, fonte: value, valorAlocado: fill.valorAlocado, percentual: fill.percentual };
          }
          return { ...row, [field]: value };
        })
      );
    },
    [fontes, totalOrcamento]
  );

  const hasContent = uploadedFile || codigoPeia || rows.length > 0;

  return (
    <div className="space-y-6">

      {/* ── 1. Upload do Contrato ───────────────────────────────────────── */}
      <section className="rounded-xl border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b bg-muted/30">
          <div>
            <div className="flex items-center gap-2">
              <FileSignature className="size-4 text-primary" />
              <h3 className="text-sm font-semibold">Upload do Contrato Final</h3>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Faça o upload do contrato final devidamente assinado pela empresa.
            </p>
          </div>
        </div>
        <div className="p-5">
          {!uploadedFile ? (
            <div
              key="dropzone"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "animate-in fade-in-0 slide-in-from-bottom-2 duration-200",
                "relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 py-12 px-8 select-none",
                dragging
                  ? "border-primary bg-primary-soft scale-[1.005]"
                  : "border-border hover:border-primary/50 hover:bg-muted/30"
              )}
            >
              <div className={cn(
                "size-12 rounded-full flex items-center justify-center transition-colors",
                dragging ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>
                <Upload className="size-5" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground">
                  {dragging ? "Solte o arquivo aqui" : "Arraste e solte ou clique para selecionar"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">PDF, JPG ou PNG · Máximo 10 MB</p>
              </div>
              <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => handleFileSelect(e.target.files)} />
            </div>
          ) : (
            <div
              key="uploaded"
              className="animate-in fade-in-0 slide-in-from-bottom-2 duration-200 flex items-center gap-3 rounded-xl border bg-primary-soft border-primary/20 px-4 py-3.5"
            >
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <FileText className="size-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{uploadedFile.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB · Upload concluído
                </p>
              </div>
              <button
                onClick={() => { setUploadedFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                title="Remover arquivo"
                className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
              >
                <X className="size-4" />
              </button>
            </div>
          )}
          {uploadError && (
            <p className="mt-2 text-xs text-destructive flex items-center gap-1.5">
              <X className="size-3 shrink-0" />{uploadError}
            </p>
          )}
        </div>
      </section>

      {/* ── 2. Código PEIA ──────────────────────────────────────────────── */}
      <section className="rounded-xl border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b bg-muted/30">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="size-4 text-primary" />
              <h3 className="text-sm font-semibold">Código PEIA</h3>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Informe o código PEIA vinculado a este projeto.
            </p>
          </div>
        </div>
        <div className="p-5">
          <div className="space-y-1.5">
            <label htmlFor="codigo-peia" className="block text-sm font-medium text-foreground">
              Código PEIA
            </label>
            <div className="flex items-center gap-2">
              <div className={cn("flex-1", !editingPeia && "cursor-not-allowed")}>
                <input
                  id="codigo-peia"
                  value={codigoPeia}
                  onChange={(e) => setCodigoPeia(e.target.value)}
                  placeholder={editingPeia ? "Digite o código PEIA" : ""}
                  readOnly={!editingPeia}
                  className={cn(
                    "w-full h-10 px-3 rounded-lg border text-sm focus:outline-none focus:ring-1 focus:ring-ring transition-colors",
                    editingPeia ? "bg-background" : "bg-muted/40 text-muted-foreground pointer-events-none select-none"
                  )}
                />
              </div>
              <button
                onClick={() => {
                  if (editingPeia) {
                    setEditingPeia(false);
                  } else {
                    setPeiaSnapshot(codigoPeia);
                    setEditingPeia(true);
                    setTimeout(() => document.getElementById("codigo-peia")?.focus(), 0);
                  }
                }}
                className={cn(
                  "h-10 px-3 shrink-0 flex items-center justify-center gap-1.5 rounded-lg hover:-translate-y-0.5 active:scale-[0.97] transition-all text-sm font-medium shadow-sm border-0",
                  editingPeia
                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
                title={editingPeia ? "Confirmar" : "Editar código PEIA"}
              >
                {editingPeia ? <><Check className="size-4" /> Salvar</> : <><Pencil className="size-4" /> Editar</>}
              </button>
              {editingPeia && (
                <button
                  onClick={() => { setCodigoPeia(peiaSnapshot); setEditingPeia(false); }}
                  className="h-10 px-3 shrink-0 flex items-center justify-center gap-1.5 rounded-lg border hover:bg-accent hover:-translate-y-0.5 active:scale-[0.97] transition-all text-sm font-medium"
                >
                  <X className="size-4" /> Cancelar
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Centros de Custo ─────────────────────────────────────────── */}
      <section className="rounded-xl border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b bg-muted/30 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Landmark className="size-4 text-primary" />
              <h3 className="text-sm font-semibold">Centros de Custo</h3>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Importe os centros de custo e preencha as informações de fonte e dados bancários para
              cada um.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {editingCcs && (
              <button
                onClick={() => setImportModalOpen(true)}
                className="inline-flex items-center gap-1.5 h-10 px-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 hover:-translate-y-0.5 active:scale-[0.97] transition-all shadow-sm text-sm font-medium whitespace-nowrap"
              >
                <Download className="size-4" />
                Importar CCs
              </button>
            )}
            <button
              onClick={() => {
                if (editingCcs) {
                  setEditingCcs(false);
                } else {
                  setRowsSnapshot(rows.map((r) => ({ ...r })));
                  setEditingCcs(true);
                }
              }}
              className={cn(
                "inline-flex items-center gap-1.5 h-10 px-3 rounded-lg hover:-translate-y-0.5 active:scale-[0.97] transition-all shadow-sm text-sm font-medium whitespace-nowrap",
                editingCcs
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "bg-primary text-primary-foreground hover:bg-primary/90",
                editingCcs && rows.length === 0 && "hidden"
              )}
            >
              {editingCcs ? <><Check className="size-4" /> Salvar</> : <><Pencil className="size-4" /> Editar</>}
            </button>
            {editingCcs && (
              <button
                onClick={() => { setRows(rowsSnapshot); setEditingCcs(false); }}
                className="inline-flex items-center gap-1.5 h-10 px-3 rounded-lg border hover:bg-accent hover:-translate-y-0.5 active:scale-[0.97] transition-all text-sm font-medium whitespace-nowrap"
              >
                <X className="size-4" /> Cancelar
              </button>
            )}
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border py-12 px-8 select-none m-5">
            <div className="size-12 rounded-full flex items-center justify-center bg-muted text-muted-foreground">
              <Landmark className="size-5" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">Nenhum centro de custo importado</p>
              <p className="text-xs text-muted-foreground mt-1">
                Clique em <span className="font-semibold text-foreground">Editar</span> e depois em{" "}
                <span className="font-semibold text-foreground">Importar CCs</span> para começar.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            {rows.map((row) => (
              <div key={row.id} className={cn(
                "rounded-xl border bg-background overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5",
                !editingCcs && "cursor-not-allowed"
              )}>
                {/* Card header */}
                <div className="px-5 py-3 border-b bg-muted/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Landmark className="size-3.5 text-muted-foreground" />
                    <span className="text-sm font-semibold">N° CC: {row.numeroCc}</span>
                  </div>
                  {editingCcs && (
                    <button
                      onClick={() => removeRow(row.id)}
                      title="Remover centro de custo"
                      className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </div>

                {/* Fields grid */}
                <div className="p-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">

                  {/* Fonte de Recurso */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Fonte de Recurso
                    </label>
                    <div className="relative">
                      <select
                        value={row.fonte}
                        onChange={(e) => updateRow(row.id, "fonte", e.target.value)}
                        disabled={!editingCcs}
                        className={cn(
                          "w-full h-10 pl-3 pr-10 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-ring appearance-none transition-colors",
                          editingCcs ? "bg-background" : "bg-muted/40 text-muted-foreground cursor-not-allowed"
                        )}
                      >
                        <option value="">{editingCcs ? "Selecionar fonte de recurso" : ""}</option>
                        <option value="Embrapii">Embrapii</option>
                        <option value="Sebrae">Sebrae</option>
                        <option value="Empresa">Empresa</option>
                        <option value="Empresa Pequena">Empresa Pequena</option>
                      </select>
                      <ChevronDown className={cn(
                        "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground",
                        !editingCcs && "hidden"
                      )} />
                    </div>
                  </div>

                  {/* Valor Alocado */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Valor Alocado (R$)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none select-none">
                        R$
                      </span>
                      <input
                        value={row.valorAlocado}
                        onChange={(e) => updateRow(row.id, "valorAlocado", e.target.value)}
                        placeholder={editingCcs ? "Digite..." : ""}
                        readOnly={!editingCcs}
                        className={cn(
                          "w-full h-10 pl-9 pr-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors",
                          !editingCcs ? "bg-muted/40 text-muted-foreground cursor-not-allowed pointer-events-none" : "bg-background text-foreground"
                        )}
                      />
                    </div>
                  </div>

                  {/* Percentual */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Percentual (%)
                    </label>
                    <div className="relative">
                      <input
                        value={row.percentual}
                        onChange={(e) => updateRow(row.id, "percentual", e.target.value)}
                        placeholder={editingCcs ? "Digite..." : ""}
                        readOnly={!editingCcs}
                        className={cn(
                          "w-full h-10 pl-3 pr-9 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors",
                          !editingCcs ? "bg-muted/40 text-muted-foreground cursor-not-allowed pointer-events-none" : "bg-background text-foreground"
                        )}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none select-none">
                        %
                      </span>
                    </div>
                  </div>

                  {/* Banco */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Banco
                    </label>
                    <input
                      value={row.banco}
                      onChange={(e) => updateRow(row.id, "banco", e.target.value)}
                      placeholder={editingCcs ? "Digite..." : ""}
                      readOnly={!editingCcs}
                      className={cn(
                        "w-full h-10 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors placeholder:text-muted-foreground/50",
                        !editingCcs ? "bg-muted/40 text-muted-foreground cursor-not-allowed pointer-events-none" : "bg-background"
                      )}
                    />
                  </div>

                  {/* Agência */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Agência
                    </label>
                    <input
                      value={row.agencia}
                      onChange={(e) => updateRow(row.id, "agencia", e.target.value)}
                      placeholder={editingCcs ? "Digite..." : ""}
                      readOnly={!editingCcs}
                      className={cn(
                        "w-full h-10 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors placeholder:text-muted-foreground/50",
                        !editingCcs ? "bg-muted/40 text-muted-foreground cursor-not-allowed pointer-events-none" : "bg-background"
                      )}
                    />
                  </div>

                  {/* Conta Corrente Específica */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Conta Corrente Específica
                    </label>
                    <input
                      value={row.contaCorrente}
                      onChange={(e) => updateRow(row.id, "contaCorrente", e.target.value)}
                      placeholder={editingCcs ? "Digite..." : ""}
                      readOnly={!editingCcs}
                      className={cn(
                        "w-full h-10 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors placeholder:text-muted-foreground/50",
                        !editingCcs ? "bg-muted/40 text-muted-foreground cursor-not-allowed pointer-events-none" : "bg-background"
                      )}
                    />
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Rodapé de ações */}
      {hasContent && (
        <div className="flex justify-end gap-3 pt-2">
          <button className="text-sm px-5 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium">
            Finalizar e Iniciar Execução <span className="ml-1.5 px-1.5 py-0.5 rounded bg-white/20 text-white/90 text-xs font-bold tracking-wide">0/2</span>
          </button>
        </div>
      )}

      {/* ── Modal de importação de CC ───────────────────────────────────── */}
      <Dialog open={importModalOpen} onOpenChange={(open) => {
        setImportModalOpen(open);
        if (!open) { setCcSearch(""); setSelectedCcs(new Set()); }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="size-4" />
              Importar Centros de Custo
            </DialogTitle>
            <DialogDescription>
              Pesquise e selecione um ou mais centros de custo para adicionar ao projeto.
            </DialogDescription>
          </DialogHeader>

          {/* Busca */}
          <div className="relative">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={ccSearch}
              onChange={(e) => setCcSearch(e.target.value)}
              placeholder="Pesquisar N° do CC (ex: 32.087.001)"
              className="w-full h-10 pl-9 pr-4 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              autoFocus
            />
          </div>

          {/* Lista */}
          <div className="max-h-64 overflow-y-auto rounded-lg border bg-muted/20 divide-y">
            {filteredCcs.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                Nenhum centro de custo encontrado.
              </div>
            ) : (
              filteredCcs.map((cc) => {
                const isAdded = alreadyAddedCcs.has(cc);
                const isChecked = selectedCcs.has(cc);
                return (
                  <label
                    key={cc}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 transition-colors select-none",
                      isAdded
                        ? "opacity-40 cursor-not-allowed bg-muted/30"
                        : "cursor-pointer hover:bg-accent"
                    )}
                  >
                    <input
                      type="checkbox"
                      disabled={isAdded}
                      checked={isChecked || isAdded}
                      onChange={() => toggleCcSelection(cc)}
                      className="rounded accent-primary shrink-0"
                    />
                    <span className="text-sm font-mono font-medium flex-1">{cc}</span>
                    {isAdded && (
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                        Já adicionado
                      </span>
                    )}
                  </label>
                );
              })
            )}
          </div>

          {/* Rodapé do modal */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-muted-foreground">
              {selectedCcs.size > 0 ? (
                <>{selectedCcs.size} selecionado{selectedCcs.size > 1 ? "s" : ""}</>
              ) : (
                "Nenhum selecionado"
              )}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => { setImportModalOpen(false); setCcSearch(""); setSelectedCcs(new Set()); }}
                className="text-sm px-4 py-2 rounded-lg border hover:bg-accent transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmImport}
                disabled={selectedCcs.size === 0}
                className={cn(
                  "text-sm px-4 py-2 rounded-lg font-medium transition-colors",
                  selectedCcs.size > 0
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                )}
              >
                Confirmar ({selectedCcs.size})
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// --- Tab: Macroentregas (placeholder PMO) -------------------------------------
function MacroentregasTab() {
  const [editMode, setEditMode] = useState(false);
  const macroentregas: {
    indicador: number;
    nome: string;
    status: "Concluída" | "Em andamento" | "Não iniciada";
    descricao: string;
    indicadorFisico: string;
    inicioPlanejado: string;
    finalPlanejado: string;
    inicioReal: string;
    finalReal: string;
    dataAssinatura: string;
  }[] = [
    {
      indicador: 1,
      nome: "Análise de requisitos",
      status: "Concluída",
      descricao:
        "Levantamento e validação dos requisitos técnicos e funcionais junto à empresa parceira.",
      indicadorFisico: "Documento de requisitos aprovado",
      inicioPlanejado: "01/03/2026",
      finalPlanejado: "15/04/2026",
      inicioReal: "01/03/2026",
      finalReal: "12/04/2026",
      dataAssinatura: "15/04/2026",
    },
    {
      indicador: 2,
      nome: "Prototipação e Desenvolvimento",
      status: "Em andamento",
      descricao:
        "Desenvolvimento de protótipos funcionais para validação das hipóteses técnicas.",
      indicadorFisico: "Protótipo v1 entregue",
      inicioPlanejado: "16/04/2026",
      finalPlanejado: "30/06/2026",
      inicioReal: "18/04/2026",
      finalReal: "—",
      dataAssinatura: "—",
    },
    {
      indicador: 3,
      nome: "Validação técnica",
      status: "Não iniciada",
      descricao:
        "Execução dos testes de validação técnica em ambiente controlado com a empresa.",
      indicadorFisico: "Relatório de validação assinado",
      inicioPlanejado: "01/07/2026",
      finalPlanejado: "30/09/2026",
      inicioReal: "—",
      finalReal: "—",
      dataAssinatura: "—",
    },
  ];

  const statusVisual = (status: string) => {
    if (status === "Concluída") {
      return {
        pill: "bg-emerald-100 text-emerald-700",
        dot: "bg-emerald-600",
        stripe: "bg-emerald-500",
        accentText: "text-emerald-700",
        accentBg: "bg-emerald-50",
        accentBorder: "border-emerald-200",
        icon: <CheckCircle2 className="size-3" />,
      };
    }
    if (status === "Em andamento") {
      return {
        pill: "bg-sky-100 text-sky-700",
        dot: "bg-sky-600",
        stripe: "bg-sky-500",
        accentText: "text-sky-700",
        accentBg: "bg-sky-50",
        accentBorder: "border-sky-200",
        icon: <Loader2 className="size-3 animate-spin" />,
      };
    }
    return {
      pill: "bg-amber-100 text-amber-700",
      dot: "bg-amber-600",
      stripe: "bg-amber-400",
      accentText: "text-amber-700",
      accentBg: "bg-amber-50",
      accentBorder: "border-amber-200",
      icon: <CircleDashed className="size-3" />,
    };
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b bg-muted/30 flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Target className="size-4 text-primary" />
              <h3 className="text-sm font-semibold">Macroentregas do projeto</h3>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Acompanhe e gerencie as macroentregas planejadas.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setEditMode((v) => !v)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm font-medium",
                editMode
                  ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90"
                  : "hover:bg-accent",
              )}
            >
              {editMode ? <Check className="size-4" /> : <Pencil className="size-4" />}
              {editMode ? "Concluir edição" : "Editar"}
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="size-4" />
              Adicionar macroentrega
            </button>
          </div>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {macroentregas.map((m) => {
              const sv = statusVisual(m.status);
              return (
                <div
                  key={m.indicador}
                  className={cn(
                    "group relative rounded-xl border bg-card overflow-hidden flex flex-col transition-shadow hover:shadow-md",
                    editMode && "ring-2 ring-primary/30",
                  )}
                >
                  {editMode && (
                    <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
                      <button
                        type="button"
                        aria-label="Editar macroentrega"
                        title="Editar macroentrega"
                        className="inline-flex items-center justify-center size-7 rounded-md border bg-card shadow-sm hover:bg-accent"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        aria-label="Remover macroentrega"
                        title="Remover macroentrega"
                        className="inline-flex items-center justify-center size-7 rounded-md border bg-card shadow-sm text-destructive hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  )}

                  <div className="p-4 flex flex-col gap-4 flex-1">
                    {/* Header */}
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "size-10 rounded-lg flex items-center justify-center shrink-0 border border-blue-900 bg-blue-900",
                      )}>
                        <span className="text-base font-bold leading-none text-white">
                          {m.indicador}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                          Macroentrega
                        </p>
                        <h4 className="text-sm font-semibold text-foreground leading-snug">
                          {m.nome}
                        </h4>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                          sv.pill,
                        )}
                      >
                        {sv.icon}
                        {m.status}
                      </span>
                    </div>

                    {/* Descrição */}
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                      {m.descricao}
                    </p>

                    {/* Indicador físico */}
                    <div className="rounded-lg border bg-muted/30 p-3 flex items-start gap-2.5">
                      <div className="size-7 rounded-md bg-card border flex items-center justify-center shrink-0 text-muted-foreground">
                        <Target className="size-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground leading-tight">
                          Indicador físico
                        </p>
                        <p className="text-xs font-semibold text-foreground mt-0.5 leading-snug">
                          {m.indicadorFisico}
                        </p>
                      </div>
                    </div>

                    {/* Timeline planejado x realizado */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg border bg-muted/30 p-2.5">
                        <p className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                          <CalendarDays className="size-3" />
                          Planejado
                        </p>
                        <div className="mt-2 space-y-1 text-[11px] tabular-nums">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[9px] uppercase tracking-wide text-muted-foreground">Início</span>
                            <span className="font-semibold text-foreground">{m.inicioPlanejado}</span>
                          </div>
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[9px] uppercase tracking-wide text-muted-foreground">Fim</span>
                            <span className="font-semibold text-foreground">{m.finalPlanejado}</span>
                          </div>
                        </div>
                      </div>
                      <div className={cn(
                        "rounded-lg border p-2.5",
                        m.inicioReal !== "—" ? "bg-card" : "bg-muted/30 border-dashed",
                      )}>
                        <p className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                          <CalendarCheck className="size-3" />
                          Realizado
                        </p>
                        {m.inicioReal !== "—" ? (
                          <div className="mt-2 space-y-1 text-[11px] tabular-nums">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[9px] uppercase tracking-wide text-muted-foreground">Início</span>
                              <span className="font-semibold text-foreground">{m.inicioReal}</span>
                            </div>
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[9px] uppercase tracking-wide text-muted-foreground">Fim</span>
                              <span className={cn(
                                "font-semibold",
                                m.finalReal !== "—" ? "text-foreground" : "text-muted-foreground",
                              )}>
                                {m.finalReal !== "—" ? m.finalReal : "—"}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <p className="mt-2 text-[11px] text-muted-foreground italic">
                            aguardando início
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Footer */}
                    {m.status === "Concluída" ? (
                      <div className="mt-auto flex items-center gap-2.5 rounded-lg border border-emerald-500/30 bg-emerald-50 p-2.5 shadow-sm">
                        <div className="flex-1 min-w-0">
                          <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-900 leading-tight">
                            <FileSignature className="size-3.5 text-emerald-600 shrink-0" />
                            Termo de Aceite Assinado
                          </p>
                          <p className="text-[11px] text-emerald-700/80 leading-tight mt-1 tabular-nums">
                            Data de assinatura: {m.dataAssinatura}
                          </p>
                        </div>
                        <button
                          type="button"
                          aria-label="Baixar documento assinado"
                          title="Baixar documento assinado"
                          className="inline-flex items-center justify-center size-8 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 shrink-0"
                        >
                          <Download className="size-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="mt-auto flex items-center gap-2.5 rounded-lg border border-dashed bg-muted/30 p-2.5 min-h-[3.5rem]">
                        <div className="flex-1 min-w-0">
                          <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground italic leading-tight">
                            <FileSignature className="size-3.5 shrink-0" />
                            Sem documento
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

// --- Tab: Documentos (placeholder PMO) ----------------------------------------
function DocumentosTab() {
  const documentos: { nome: string; arquivo: string; autor: string }[] = [
    { nome: "Certidão de Ata", arquivo: "certidao-ata.pdf", autor: "Ana Souza" },
    { nome: "Ficha da Empresa", arquivo: "ficha-empresa.pdf", autor: "Bruno Lima" },
    { nome: "Plano de Trabalho", arquivo: "plano-trabalho.pdf", autor: "Carla Mendes" },
    { nome: "Proposta Técnica Comercial (PTC)", arquivo: "ptc.pdf", autor: "Diego Alves" },
    { nome: "Relatório SIGAA", arquivo: "relatorio-sigaa.pdf", autor: "Eduarda Rocha" },
    { nome: "Termo de Aceite de Proposta Técnica", arquivo: "termo-aceite-proposta-tecnica.pdf", autor: "Fernanda Castro" },
  ];

  const macroentregas = [
    { nome: "Macroentrega 1 — Análise de requisitos", status: "Concluída" },
    { nome: "Macroentrega 2 — Prototipação", status: "Em andamento" },
    { nome: "Macroentrega 3 — Validação técnica", status: "Não iniciada" },
    { nome: "Macroentrega 4 — Entrega final", status: "Não iniciada" },
  ];
  const macroentregasSelecionaveis = macroentregas.filter((m) => m.status === "Em andamento");

  const [open, setOpen] = useState(false);
  const [tipo, setTipo] = useState<string>("termo-aceite-macroentrega");
  const [macroentrega, setMacroentrega] = useState<string>("");
  const [arquivo, setArquivo] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const resetModal = () => {
    setTipo("termo-aceite-macroentrega");
    setMacroentrega("");
    setArquivo(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b bg-muted/30 flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="size-4 text-primary" />
              <h3 className="text-sm font-semibold">Documentos</h3>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Documentos vinculados ao projeto.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="size-4" />
            Adicionar documento
          </button>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {documentos.map((doc) => (
              <div
                key={doc.nome}
                className="rounded-lg border bg-background p-4 flex flex-col gap-3"
              >
                <div>
                  <h4 className="text-sm font-semibold text-foreground">{doc.nome}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Autor: {doc.autor}
                  </p>
                </div>
                <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2">
                  <FileText className="size-4 text-primary shrink-0" />
                  <span className="text-xs text-muted-foreground truncate flex-1">
                    {doc.arquivo}
                  </span>
                  <button
                    type="button"
                    aria-label="Remover anexo"
                    className="p-1 -mr-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-1.5 rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent"
                >
                  <Eye className="size-4" />
                  Visualizar
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) resetModal();
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Adicionar documento</DialogTitle>
            <DialogDescription>
              Selecione o tipo de documento e anexe o arquivo correspondente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Tipo de documento */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Tipo de documento <span className="text-destructive">*</span></label>
              <div className="relative">
                <select
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                  className="w-full h-10 pl-3 pr-9 rounded-md border border-input bg-background text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="termo-aceite-macroentrega">
                    Termo de aceite de macroentrega
                  </option>
                </select>
                <ChevronDown className="size-4 text-muted-foreground pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Macroentrega */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Macroentrega <span className="text-destructive">*</span></label>
              <div className="relative">
                <select
                  value={macroentrega}
                  onChange={(e) => setMacroentrega(e.target.value)}
                  className="w-full h-10 pl-3 pr-9 rounded-md border border-input bg-background text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="" disabled>
                    Selecione a macroentrega
                  </option>
                  {macroentregasSelecionaveis.map((m) => (
                    <option key={m.nome} value={m.nome}>
                      {m.nome}
                    </option>
                  ))}
                </select>
                <ChevronDown className="size-4 text-muted-foreground pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Baixar template */}
            <div className="rounded-lg border bg-primary-soft/40 border-primary/15 p-3 flex items-center gap-3">
              <div className="size-9 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <FileText className="size-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground leading-tight">
                  Template do documento
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Baixe o modelo padrão para preencher antes de anexar.
                </p>
              </div>
              <button
                type="button"
                aria-label="Baixar template"
                className="inline-flex items-center justify-center rounded-md bg-primary p-2 text-primary-foreground hover:bg-primary/90 shrink-0"
              >
                <Download className="size-4" />
              </button>
            </div>

            {/* Anexar arquivo */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Anexar arquivo <span className="text-destructive">*</span></label>
              {arquivo ? (
                <div className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3">
                  <div className="size-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 dark:bg-emerald-950/40 dark:text-emerald-300">
                    <FileText className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {arquivo.name}
                    </p>
                    <p className="text-xs text-muted-foreground tabular-nums">
                      {(arquivo.size / 1024 / 1024).toFixed(2)} MB · Pronto para envio
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setArquivo(null);
                      if (fileRef.current) fileRef.current.value = "";
                    }}
                    aria-label="Remover arquivo"
                    className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileRef.current?.click()}
                  className="group relative flex flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-input bg-muted/20 px-4 py-4 cursor-pointer hover:border-primary/60 hover:bg-primary-soft/30 transition-colors text-center"
                >
                  <div className="size-9 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Upload className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Clique para selecionar ou arraste o arquivo
                    </p>
                  </div>
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => setArquivo(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={!macroentrega || !arquivo}
              onClick={() => setOpen(false)}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Adicionar
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// --- Tab: Encerramento (questionário PMO) -------------------------------------
type EncFormState = {
  familiaridade: string;
  resultadoNaoPrevisto: string;
  resultadoNaoPrevistoDesc: string;
  abrangenciaInovacao: string;
  caracterizacaoTecnologia: string;
  perspectivaInovacao: string;
  otimizacao: string;
  otimizacaoDesc: string;
  satisfacao: string;
  qualidadeInteracao: string;
  sugestaoInstitucional: string;
};

function EncerramentoTab() {
  const [form, setForm] = useState<EncFormState>({
    familiaridade: "",
    resultadoNaoPrevisto: "",
    resultadoNaoPrevistoDesc: "",
    abrangenciaInovacao: "",
    caracterizacaoTecnologia: "",
    perspectivaInovacao: "",
    otimizacao: "",
    otimizacaoDesc: "",
    satisfacao: "",
    qualidadeInteracao: "",
    sugestaoInstitucional: "",
  });
  const [avaliacaoEditando, setAvaliacaoEditando] = useState(false);
  const [avaliacaoSalva, setAvaliacaoSalva] = useState(false);

  const set = <K extends keyof EncFormState>(key: K, value: EncFormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const totalPerguntas = 11;
  const respondidas = Object.values(form).filter((v) => v.trim().length > 0).length;
  const avaliacaoRespondida = respondidas >= totalPerguntas;
  const avaliacaoCompleta = avaliacaoSalva && avaliacaoRespondida;

  // Upload do Termo de Encerramento
  const [termoFile, setTermoFile] = useState<File | null>(null);
  const [termoError, setTermoError] = useState<string | null>(null);
  const [termoDragging, setTermoDragging] = useState(false);
  const termoInputRef = useRef<HTMLInputElement>(null);

  const handleTermoSelect = (files: FileList | null) => {
    setTermoError(null);
    const file = files?.[0];
    if (!file) return;
    const ok = ["application/pdf", "image/jpeg", "image/png"].includes(file.type);
    if (!ok) {
      setTermoError("Formato inválido. Envie PDF, JPG ou PNG.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setTermoError("Arquivo excede 10 MB.");
      return;
    }
    setTermoFile(file);
  };

  const termoOk = !!termoFile;
  const podeEncerrar = termoOk && avaliacaoCompleta;

  function salvarAvaliacao() {
    if (!avaliacaoRespondida) return;
    setAvaliacaoSalva(true);
    setAvaliacaoEditando(false);
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
      }}
      className="space-y-8 w-full"
    >
      {/* ETAPA 1 — Upload do Termo de Encerramento */}
      <section id="termo-encerramento" className="relative rounded-xl border bg-card overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b bg-muted/30 flex items-center gap-3">
          <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <FileSignature className="size-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold leading-tight">Termo de Encerramento</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Anexe o termo de encerramento</p>
          </div>
        </div>
        <div className="p-5">
          {!termoFile ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setTermoDragging(true);
              }}
              onDragLeave={() => setTermoDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setTermoDragging(false);
                handleTermoSelect(e.dataTransfer.files);
              }}
              onClick={() => termoInputRef.current?.click()}
              className={cn(
                "animate-in fade-in-0 slide-in-from-bottom-2 duration-200",
                "relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 py-12 px-8 select-none",
                termoDragging
                  ? "border-primary bg-primary-soft scale-[1.005]"
                  : "border-border hover:border-primary/50 hover:bg-muted/30"
              )}
            >
              <div
                className={cn(
                  "size-12 rounded-full flex items-center justify-center transition-colors",
                  termoDragging ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}
              >
                <Upload className="size-5" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground">
                  {termoDragging ? "Solte o arquivo aqui" : "Arraste e solte ou clique para selecionar"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">PDF, JPG ou PNG · Máximo 10 MB</p>
              </div>
              <input
                ref={termoInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => handleTermoSelect(e.target.files)}
              />
            </div>
          ) : (
            <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-200 flex items-center gap-3 rounded-xl border bg-primary-soft border-primary/20 px-4 py-3.5">
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <FileText className="size-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{termoFile.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {(termoFile.size / 1024 / 1024).toFixed(2)} MB · Upload concluído
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setTermoFile(null);
                  if (termoInputRef.current) termoInputRef.current.value = "";
                }}
                title="Remover arquivo"
                className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
              >
                <X className="size-4" />
              </button>
            </div>
          )}
          {termoError && (
            <p className="mt-2 text-xs text-destructive flex items-center gap-1.5">
              <X className="size-3 shrink-0" />
              {termoError}
            </p>
          )}
        </div>
      </section>

      {/* AVALIAÇÃO FINAL — card único com blocos separados por divisor */}
      <section id="avaliacao-final" className="rounded-xl border bg-card overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b bg-muted/30 flex items-center gap-3">
          <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <ClipboardCheck className="size-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-foreground leading-tight">Avaliação Final</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Responda ao questionário de encerramento do projeto</p>
          </div>
          <span className="text-xs font-semibold text-muted-foreground tabular-nums shrink-0">{respondidas}/{totalPerguntas}</span>
        </div>

        {!avaliacaoEditando && !avaliacaoSalva ? (
          <div className="p-6">
            <div className="rounded-xl border border-dashed bg-muted/20 px-6 py-10 text-center">
              <ClipboardCheck className="mx-auto size-6 text-muted-foreground" />
              <p className="mt-3 text-sm font-semibold text-foreground">Questionário ainda não preenchido</p>
              <p className="mt-1 text-xs text-muted-foreground">Clique em preencher para responder a Avaliação Final.</p>
              <button
                type="button"
                onClick={() => setAvaliacaoEditando(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Pencil className="size-4" />
                Preencher questionário
              </button>
            </div>
          </div>
        ) : (
        <div className={cn("p-6 space-y-10", !avaliacaoEditando && "opacity-90")}>
          <EncFlatBlock title="Avaliação técnica e julgamento profissional" subtitle="Bloco 1" icon={<ScanSearch className="size-4" />}>
            <EncRadioQuestion
              number={1}
              label="Quão familiar a equipe executora estava com os problemas técnicos do projeto?"
              required
              value={form.familiaridade}
              onChange={(v) => set("familiaridade", v)}
              disabled={!avaliacaoEditando}
              options={[
                "Domínio pleno e com muita experiência prévia.",
                "Experiência prévia relevante.",
                "Pouca experiência prévia.",
                "Sem experiência prévia",
              ]}
            />
            <EncRadioQuestion
              number={2}
              label="O projeto gerou algum resultado técnico relevante não previsto nos objetivos contratados?"
              required
              value={form.resultadoNaoPrevisto}
              onChange={(v) => set("resultadoNaoPrevisto", v)}
              disabled={!avaliacaoEditando}
              options={["Não", "Sim"]}
            />
            <EncTextareaQuestion
              number={3}
              label="Descreva o resultado técnico relevante não previsto."
              required
              value={form.resultadoNaoPrevistoDesc}
              onChange={(v) => set("resultadoNaoPrevistoDesc", v)}
              disabled={!avaliacaoEditando}
            />
          </EncFlatBlock>

          <EncFlatBlock title="Inovação e impacto" subtitle="Bloco 2" icon={<Lightbulb className="size-4" />}>
            <EncRadioQuestion
              number={4}
              label="Indique a abrangência ou alcance da inovação resultado do projeto concluído:"
              required
              value={form.abrangenciaInovacao}
              onChange={(v) => set("abrangenciaInovacao", v)}
              disabled={!avaliacaoEditando}
              options={[
                "Novo para vários mercados mundiais",
                "Novo para um determinado mercado no mundo",
                "Novo para um determinado mercado nacional",
                "Novo para a empresa",
                "Não é novidade",
                "Não sei avaliar o real alcance",
              ]}
            />
            <EncRadioQuestion
              number={5}
              label="Com relação a principal tecnologia envolvida no projeto, informe a opção que melhor a caracteriza:"
              required
              value={form.caracterizacaoTecnologia}
              onChange={(v) => set("caracterizacaoTecnologia", v)}
              disabled={!avaliacaoEditando}
              options={[
                "Foi criada uma nova tecnologia.",
                "A tecnologia foi modificada/derivada.",
                "A tecnologia foi adaptada para utilização em um novo ambiente.",
                "Foi estabelecido um novo nível de desempenho para a tecnologia.",
                "Foi estabelecido um novo nível de confiabilidade para a tecnologia.",
                "A tecnologia foi escalonada.",
                "A tecnologia foi utilizada.",
              ]}
            />
            <EncRadioQuestion
              number={6}
              label="Indique a perspectiva de geração de inovação a partir dos resultados técnicos do projeto:"
              required
              value={form.perspectivaInovacao}
              onChange={(v) => set("perspectivaInovacao", v)}
              disabled={!avaliacaoEditando}
              options={[
                "Gerou ou irá gerar inovação que permite avanço da fronteira tecnológica.",
                "Gerou ou irá gerar inovação compatível com o limite da fronteira tecnológica.",
                "Gerou ou irá gerar inovação que permite aproximação da fronteira tecnológica.",
                "Gerou ou irá gerar inovação, porém aquém da fronteira tecnológica.",
                "Sem perspectiva de gerar inovação",
              ]}
            />
          </EncFlatBlock>

          <EncFlatBlock title="Otimização e maturidade técnica" subtitle="Bloco 3" icon={<Gauge className="size-4" />}>
            <EncRadioQuestion
              number={7}
              label="Foram realizadas tarefas com o intuito de otimização dos resultados?"
              required
              value={form.otimizacao}
              onChange={(v) => set("otimizacao", v)}
              disabled={!avaliacaoEditando}
              options={["Não", "Sim, de forma não sistêmica.", "Sim"]}
            />
            <EncTextareaQuestion
              number={8}
              label="Descreva as tarefas realizadas com intuito de otimização"
              required
              value={form.otimizacaoDesc}
              onChange={(v) => set("otimizacaoDesc", v)}
              disabled={!avaliacaoEditando}
            />
          </EncFlatBlock>

          <EncFlatBlock title="Avaliação relacional e satisfação" subtitle="Bloco 4" icon={<Heart className="size-4" />}>
            <EncRadioQuestion
              number={9}
              label="Informe seu nível de satisfação com os resultados/entregas do projeto."
              required
              value={form.satisfacao}
              onChange={(v) => set("satisfacao", v)}
              disabled={!avaliacaoEditando}
              stacked
              options={[
                "Muito acima do esperado.",
                "Acima do esperado.",
                "Conforme esperado.",
                "Abaixo do esperado.",
                "Muito abaixo do esperado.",
              ]}
            />
            <EncRadioQuestion
              number={10}
              label="Como foi a qualidade da interação com a empresa?"
              required
              value={form.qualidadeInteracao}
              onChange={(v) => set("qualidadeInteracao", v)}
              disabled={!avaliacaoEditando}
              options={["Excelente", "Muito boa", "Boa", "Ruim", "Péssima"]}
            />
          </EncFlatBlock>

          <EncFlatBlock title="Sugestão institucional (qualitativo)" subtitle="Bloco 5" icon={<MessageSquare className="size-4" />}>
            <EncTextareaQuestion
              number={11}
              label="Na sua visão, como o modelo EMBRAPII poderia potencializar ainda mais a intensidade tecnológica na indústria?"
              helper="Ex.: Novos modelos de financiamento / novas rubricas / etc"
              value={form.sugestaoInstitucional}
              onChange={(v) => set("sugestaoInstitucional", v)}
              disabled={!avaliacaoEditando}
            />
          </EncFlatBlock>
          {avaliacaoEditando && (
            <div className="flex justify-end border-t pt-5">
              <button
                type="button"
                onClick={salvarAvaliacao}
                disabled={!avaliacaoRespondida}
                className={cn(
                  "inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold shadow-sm transition-colors",
                  avaliacaoRespondida
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-muted text-muted-foreground cursor-not-allowed",
                )}
              >
                <Check className="size-4" />
                Salvar questionário
              </button>
            </div>
          )}
        </div>
        )}
      </section>

      <div className="sticky bottom-4 mt-4 mb-4 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border bg-card/95 backdrop-blur px-5 py-4 shadow-lg">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className={cn("inline-flex items-center justify-center size-5 rounded-full", termoOk ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground")}>
              {termoOk ? <CheckCircle2 className="size-3.5" /> : <CircleDashed className="size-3.5" />}
            </span>
            <span className={cn("font-medium", termoOk ? "text-foreground" : "text-muted-foreground")}>Termo</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={cn("inline-flex items-center justify-center size-5 rounded-full", avaliacaoCompleta ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground")}>
              {avaliacaoCompleta ? <CheckCircle2 className="size-3.5" /> : <CircleDashed className="size-3.5" />}
            </span>
            <span className={cn("font-medium tabular-nums", avaliacaoCompleta ? "text-foreground" : "text-muted-foreground")}>
              Avaliação {respondidas}/{totalPerguntas}
            </span>
          </div>
          <span className="hidden md:inline text-muted-foreground/70">·</span>
          <p className="hidden md:block text-muted-foreground">
            Após o encerramento o projeto não poderá ser editado.
          </p>
        </div>
        <button
          type="submit"
          disabled={!podeEncerrar}
          className={cn(
            "inline-flex items-center justify-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold shadow-sm transition-colors",
            podeEncerrar
              ? "bg-emerald-600 text-white hover:bg-emerald-700"
              : "bg-muted text-muted-foreground cursor-not-allowed",
          )}
        >
          <Flag className="size-4" />
          Encerrar projeto
        </button>
      </div>
    </form>
  );
}

function EncFlatBlock({
  children,
}: {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="space-y-6">{children}</div>
    </section>
  );
}

function EncQuestionLabel({
  number,
  label,
  required,
  helper,
}: {
  number: number;
  label: string;
  required?: boolean;
  helper?: string;
}) {
  return (
    <div>
      <div className="flex items-start gap-2.5">
        <span className="shrink-0 inline-flex items-center justify-center size-6 rounded-full bg-primary/10 text-primary text-[11px] font-bold tabular-nums">
          {number}
        </span>
        <label className="text-sm font-medium leading-relaxed pt-0.5">
          {label}
          {required && <span className="ml-1 text-destructive">*</span>}
        </label>
      </div>
      {helper && (
        <p className="ml-[2.125rem] mt-1 text-xs text-muted-foreground">{helper}</p>
      )}
    </div>
  );
}

function EncTextQuestion({
  number,
  label,
  required,
  value,
  onChange,
  placeholder,
  disabled,
}: {
  number: number;
  label: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2" data-enc-question>
      <EncQuestionLabel number={number} label={label} required={required} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "ml-[2.125rem] block w-[calc(100%-2.125rem)] rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring",
          disabled && "cursor-not-allowed bg-muted/40 text-muted-foreground",
        )}
      />
    </div>
  );
}

function EncTextareaQuestion({
  number,
  label,
  required,
  helper,
  value,
  onChange,
  disabled,
}: {
  number: number;
  label: string;
  required?: boolean;
  helper?: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2" data-enc-question>
      <EncQuestionLabel number={number} label={label} required={required} helper={helper} />
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        disabled={disabled}
        className={cn(
          "ml-[2.125rem] block w-[calc(100%-2.125rem)] resize-y rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring",
          disabled && "cursor-not-allowed bg-muted/40 text-muted-foreground",
        )}
      />
    </div>
  );
}

function EncRadioQuestion({
  number,
  label,
  required,
  value,
  onChange,
  options,
  stacked,
  disabled,
}: {
  number: number;
  label: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  stacked?: boolean;
  disabled?: boolean;
}) {
  const groupName = `enc-q-${number}`;
  const maxLen = options.reduce((m, o) => Math.max(m, o.length), 0);
  const inline = !stacked && maxLen <= 30 && options.length <= 6;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const handleSelect = (opt: string) => {
    if (disabled) return;
    onChange(opt);
    requestAnimationFrame(() => {
      const all = Array.from(document.querySelectorAll<HTMLElement>("[data-enc-question]"));
      const idx = wrapperRef.current ? all.indexOf(wrapperRef.current) : -1;
      const next = idx >= 0 ? all[idx + 1] : null;
      if (next) {
        const y = next.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    });
  };
  return (
    <div ref={wrapperRef} className="space-y-2" data-enc-question>
      <EncQuestionLabel number={number} label={label} required={required} />
      <div
        className={cn(
          "ml-[2.125rem]",
          inline
            ? "grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-1.5"
            : "grid gap-1.5",
        )}
      >
        {options.map((opt) => {
          const id = `${groupName}-${opt}`;
          const isChecked = value === opt;
          return (
            <label
              key={opt}
              htmlFor={id}
              className={cn(
                "group flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-all",
                inline && "py-2",
                disabled ? "cursor-not-allowed opacity-75" : "cursor-pointer",
                isChecked
                  ? "border-primary bg-primary/5 shadow-sm"
                  : disabled
                    ? "border-input bg-muted/30"
                    : "border-input hover:border-primary/40 hover:bg-accent/50"
              )}
            >
              <span
                className={cn(
                  "relative inline-flex items-center justify-center size-4 rounded-full border-2 shrink-0 transition-colors",
                  isChecked ? "border-primary bg-primary" : "border-muted-foreground/40 bg-background group-hover:border-primary/60"
                )}
              >
                {isChecked && <span className="size-1.5 rounded-full bg-white" />}
              </span>
              <input
                id={id}
                type="radio"
                name={groupName}
                checked={isChecked}
                disabled={disabled}
                onChange={() => handleSelect(opt)}
                className="sr-only"
              />
              <span className={cn("leading-relaxed flex-1", isChecked && "font-medium text-foreground")}>{opt}</span>
              {isChecked && <Check className="size-4 text-primary shrink-0" />}
            </label>
          );
        })}
      </div>
    </div>
  );
}
