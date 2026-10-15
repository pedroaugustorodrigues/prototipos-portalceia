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
  CalendarDays,
  CalendarCheck,
  ClipboardCheck,
  Lightbulb,
  Gauge,
  Heart,
  MessageSquare,
  CheckCircle2,
  Loader2,
  CircleDashed,
  ScanSearch,
  Mail,
  Building2,
  Hash,
  MapPin,
  User,
  Phone,
  Coins,
  Wallet,
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

export const Route = createFileRoute("/carta-sebrae")({
  head: () => ({
    meta: [
      { title: "Carta SEBRAE — Portal CEIA" },
      { name: "description", content: "Carta SEBRAE — formalização do projeto." },
    ],
  }),
  component: CartaSebraePage,
});

// ─── Helpers ───────────────────────────────────────────────────────────────────

let _seq = 0;
function uid() {
  return `cc-${Date.now()}-${++_seq}`;
}

// Rótulos ordinais para cards de empresas (1ª, 2ª, ...)
const ORDINAIS = ["1ª", "2ª", "3ª", "4ª", "5ª", "6ª"];

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
  { key: "carta-sebrae", label: "Carta SEBRAE", icon: <Mail className="size-4" /> },
  { key: "documentos", label: "Documentos", icon: <FileText className="size-4" /> },
  { key: "macroentregas", label: "Macroentregas", icon: <Target className="size-4" /> },
  { key: "plano-trabalho", label: "Plano de Trabalho", icon: <ClipboardList className="size-4" /> },
  { key: "contrato-final", label: "Formalização", icon: <FileSignature className="size-4" /> },
];

export function CartaSebraePage({ status = "contratacao" }: { status?: "contratacao" | "execucao" } = {}) {
  const project = PROJECTS[0];
  const fontes = FONTES_ORCAMENTARIAS.filter((f) => f.projectId === project.id);
  const totalOrcamento = fontes.reduce((s, f) => s + f.valorTotal, 0);

  const statusBadge =
    status === "execucao"
      ? { label: "EM EXECUÇÃO", bg: "bg-emerald-100", text: "text-emerald-600", dot: "bg-emerald-500" }
      : { label: "EM CONTRATAÇÃO", bg: "bg-sky-100", text: "text-sky-500", dot: "bg-sky-400" };

  const isExecucao = status === "execucao";
  const [activeTabKey, setActiveTabKey] = useState<string>(
    isExecucao ? "macroentregas" : "carta-sebrae"
  );
  const enabledKeys = isExecucao
    ? new Set(["macroentregas", "documentos", "encerramento"])
    : new Set(["contrato-final", "carta-sebrae"]);
  const tabs = isExecucao
    ? [
        ...PROJECT_TABS.filter((t) => t.key !== "contrato-final" && t.key !== "carta-sebrae"),
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
      ) : activeTabKey === "carta-sebrae" ? (
        <CartaSebraeTab />
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

// ─── Tab: Carta SEBRAE ─────────────────────────────────────────────────────────

const CARTA_SEBRAE_SUBTABS: { key: string; label: string; icon: React.ReactNode }[] = [
  { key: "carta-sebrae", label: "Carta SEBRAE", icon: <Mail className="size-4" /> },
  {
    key: "formulario-complementar",
    label: "Formulário complementar",
    icon: <ClipboardList className="size-4" />,
  },
];

function CartaSebraeTab() {
  const [activeSubTab, setActiveSubTab] = useState<string>("carta-sebrae");

  return (
    <div className="space-y-6">
      {/* Sub-tab toggle (mesmo design das subabas de Equipe/Financeiro da Proposta 1) */}
      <div className="flex w-full rounded-lg border bg-muted p-1 gap-1">
        {CARTA_SEBRAE_SUBTABS.map((t) => {
          const active = t.key === activeSubTab;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveSubTab(t.key)}
              className={cn(
                "flex-1 inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                active
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/40"
              )}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {activeSubTab === "carta-sebrae" ? (
        <CartaSebraeSubTab />
      ) : (
        <FormularioComplementarSubTab />
      )}
    </div>
  );
}

// ─── Subaba: Carta SEBRAE ──────────────────────────────────────────────────────

// Dados de cada empresa (pode haver mais de uma na Carta SEBRAE)
type CartaEmpresa = {
  razaoSocial: string;
  cnpjEmpresa: string;
  enderecoEmpresa: string;
  cidadeEmpresa: string;
  ufEmpresa: string;
  responsavelNome: string;
  responsavelCpf: string;
  emailEmpresa: string;
  telefoneEmpresa: string;
};

const CARTA_EMPRESA_VAZIA: CartaEmpresa = {
  razaoSocial: "",
  cnpjEmpresa: "",
  enderecoEmpresa: "",
  cidadeEmpresa: "",
  ufEmpresa: "",
  responsavelNome: "",
  responsavelCpf: "",
  emailEmpresa: "",
  telefoneEmpresa: "",
};

type CartaSebraeFormState = {
  // Seção 1 — Dados das empresas
  empresas: CartaEmpresa[];
  // Seção 1 — Dados do projeto
  tituloProjeto: string;
  codigoNegociacao: string;
  valorTotalProjeto: string;
  valorSebrae: string;
  valorEmbrapiiNa: string;
  valorUnidadeEmbrapii: string;
  valorEmpresa: string;
  // Seção 2 — Dados da Unidade EMBRAPII
  unidadeEmbrapii: string;
  cnpjUnidade: string;
  enderecoUnidade: string;
  cidadeUnidade: string;
  ufUnidade: string;
  coordenadorNome: string;
  coordenadorCpf: string;
  emailUnidade: string;
  telefoneUnidade: string;
};

const CARTA_SEBRAE_INITIAL: CartaSebraeFormState = {
  empresas: [{ ...CARTA_EMPRESA_VAZIA }],
  tituloProjeto: "",
  codigoNegociacao: "",
  valorTotalProjeto: "",
  valorSebrae: "",
  valorEmbrapiiNa: "",
  valorUnidadeEmbrapii: "",
  valorEmpresa: "",
  unidadeEmbrapii: "",
  cnpjUnidade: "",
  enderecoUnidade: "",
  cidadeUnidade: "",
  ufUnidade: "",
  coordenadorNome: "",
  coordenadorCpf: "",
  emailUnidade: "",
  telefoneUnidade: "",
};

function CartaSebraeSubTab() {
  const [form, setForm] = useState<CartaSebraeFormState>(CARTA_SEBRAE_INITIAL);
  const [editing, setEditing] = useState(false);

  const set = <K extends keyof CartaSebraeFormState>(key: K, value: CartaSebraeFormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const setEmpresa = (
    index: number,
    field: keyof CartaEmpresa,
    value: string
  ) =>
    setForm((prev) => ({
      ...prev,
      empresas: prev.empresas.map((e, i) =>
        i === index ? { ...e, [field]: value } : e
      ),
    }));

  const addEmpresa = () =>
    setForm((prev) => ({
      ...prev,
      empresas: [...prev.empresas, { ...CARTA_EMPRESA_VAZIA }],
    }));

  const removeEmpresa = (index: number) =>
    setForm((prev) => ({
      ...prev,
      empresas:
        prev.empresas.length > 1
          ? prev.empresas.filter((_, i) => i !== index)
          : prev.empresas,
    }));

  return (
    <div className="space-y-6">
      <section className="rounded-xl border bg-card overflow-hidden">
        {/* Cabeçalho (mesmo design das demais abas) */}
        <div className="px-5 py-4 border-b bg-muted/30 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Mail className="size-4 text-primary" />
              <h3 className="text-sm font-semibold">Carta SEBRAE</h3>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Preencha os dados da empresa, do projeto e da Unidade EMBRAPII para a Carta SEBRAE.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {editing ? (
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-white bg-sky-700 hover:bg-sky-800 transition-colors"
              >
                <Check className="size-4" />
                Salvar Carta SEBRAE
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-white bg-sky-700 hover:bg-sky-800 transition-colors"
                >
                  <Pencil className="size-4" />
                  Editar
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-white bg-sky-700 hover:bg-sky-800 transition-colors"
                >
                  <Download className="size-4" />
                  Exportar
                </button>
              </>
            )}
          </div>
        </div>

        <div className="p-5 space-y-6">
          <fieldset disabled={!editing} className="space-y-6 min-w-0">
          {/* Seção 1 — Dados da empresa e projeto */}
          <CartaFormGroup
            title="Dados da Empresa e Projeto"
            description="Informações cadastrais da empresa, do responsável e do projeto de PD&I."
          >
            <div className="space-y-6">
              {/* Dados das empresas (uma ou mais) */}
              <div className="space-y-4">
                {form.empresas.map((empresa, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "rounded-xl border bg-background p-4",
                      idx > 0 && "border-dashed"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="size-3.5 text-muted-foreground" />
                        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {ORDINAIS[idx] ?? `${idx + 1}ª`} Empresa
                        </span>
                      </div>
                      {editing && form.empresas.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeEmpresa(idx)}
                          title="Remover empresa"
                          className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-5">
                      <CartaField
                        icon={Building2}
                        label="Razão Social / Porte da Empresa"
                        value={empresa.razaoSocial}
                        onChange={(v) => setEmpresa(idx, "razaoSocial", v)}
                        placeholder="Digite..."
                        className="md:col-span-2"
                      />
                      <CartaField
                        icon={Hash}
                        label="CNPJ"
                        value={empresa.cnpjEmpresa}
                        onChange={(v) => setEmpresa(idx, "cnpjEmpresa", v)}
                        placeholder="00.000.000/0000-00"
                      />
                      <CartaField
                        icon={MapPin}
                        label="Endereço"
                        value={empresa.enderecoEmpresa}
                        onChange={(v) => setEmpresa(idx, "enderecoEmpresa", v)}
                        placeholder="Rua, número, complemento"
                      />
                      <CartaField
                        icon={MapPin}
                        label="Cidade"
                        value={empresa.cidadeEmpresa}
                        onChange={(v) => setEmpresa(idx, "cidadeEmpresa", v)}
                        placeholder="Digite..."
                      />
                      <CartaField
                        icon={MapPin}
                        label="UF"
                        value={empresa.ufEmpresa}
                        onChange={(v) => setEmpresa(idx, "ufEmpresa", v)}
                        placeholder="Digite..."
                      />
                      <CartaField
                        icon={User}
                        label="Nome completo do Responsável/Sócio"
                        value={empresa.responsavelNome}
                        onChange={(v) => setEmpresa(idx, "responsavelNome", v)}
                        placeholder="Nome completo"
                      />
                      <CartaField
                        icon={Hash}
                        label="CPF do Responsável/Sócio"
                        value={empresa.responsavelCpf}
                        onChange={(v) => setEmpresa(idx, "responsavelCpf", v)}
                        placeholder="000.000.000-00"
                      />
                      <CartaField
                        icon={Mail}
                        label="E-mail"
                        value={empresa.emailEmpresa}
                        onChange={(v) => setEmpresa(idx, "emailEmpresa", v)}
                        placeholder="Digite..."
                      />
                      <CartaField
                        icon={Phone}
                        label="Telefone"
                        value={empresa.telefoneEmpresa}
                        onChange={(v) => setEmpresa(idx, "telefoneEmpresa", v)}
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                  </div>
                ))}

                {editing && (
                  <button
                    type="button"
                    onClick={addEmpresa}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-dashed px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-muted/30 transition-colors"
                  >
                    <Plus className="size-4" />
                    Adicionar empresa
                  </button>
                )}
              </div>

              {/* Dados do projeto */}
              <div className="border-t pt-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-5">
                  <CartaField
                    icon={FileSignature}
                    label="Título do Projeto de PD&I"
                    value={form.tituloProjeto}
                    onChange={(v) => set("tituloProjeto", v)}
                    placeholder="Título do projeto"
                    className="md:col-span-2"
                  />
                  <CartaField
                    icon={Hash}
                    label="Código de Negociação EMBRAPII do Projeto de PD&I"
                    value={form.codigoNegociacao}
                    onChange={(v) => set("codigoNegociacao", v)}
                    placeholder="Digite..."
                    className="md:col-span-2"
                  />
                </div>
              </div>

              {/* Valores do projeto */}
              <div className="border-t pt-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-5">
                  <CartaField
                    icon={Coins}
                    label="Valor aportado pelo SEBRAE"
                    value={form.valorSebrae}
                    onChange={(v) => set("valorSebrae", v)}
                    placeholder="R$ 0,00"
                  />
                  <CartaField
                    icon={Coins}
                    label="Valor aportado pela EMBRAPII-NA"
                    value={form.valorEmbrapiiNa}
                    onChange={(v) => set("valorEmbrapiiNa", v)}
                    placeholder="R$ 0,00"
                  />
                  <CartaField
                    icon={Coins}
                    label="Valor aportado pela Unidade EMBRAPII"
                    value={form.valorUnidadeEmbrapii}
                    onChange={(v) => set("valorUnidadeEmbrapii", v)}
                    placeholder="R$ 0,00"
                  />
                  <CartaField
                    icon={Coins}
                    label="Valor aportado pela EMPRESA"
                    value={form.valorEmpresa}
                    onChange={(v) => set("valorEmpresa", v)}
                    placeholder="R$ 0,00"
                  />
                </div>
              </div>
            </div>
          </CartaFormGroup>

          {/* Seção 2 — Dados da Unidade EMBRAPII */}
          <CartaFormGroup
            title="Dados da Unidade EMBRAPII"
            description="Informações da Unidade EMBRAPII e do coordenador da Unidade EMBRAPII/responsável pelo projeto"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-5">
              <CartaField
                icon={Landmark}
                label="Unidade EMBRAPII"
                value={form.unidadeEmbrapii}
                onChange={(v) => set("unidadeEmbrapii", v)}
                placeholder="Digite..."
                className="md:col-span-2"
              />
              <CartaField
                icon={Hash}
                label="CNPJ"
                value={form.cnpjUnidade}
                onChange={(v) => set("cnpjUnidade", v)}
                placeholder="00.000.000/0000-00"
              />
              <CartaField
                icon={MapPin}
                label="Endereço"
                value={form.enderecoUnidade}
                onChange={(v) => set("enderecoUnidade", v)}
                placeholder="Rua, número, complemento"
              />
              <CartaField
                icon={MapPin}
                label="Cidade"
                value={form.cidadeUnidade}
                onChange={(v) => set("cidadeUnidade", v)}
                placeholder="Digite..."
              />
              <CartaField
                icon={MapPin}
                label="UF"
                value={form.ufUnidade}
                onChange={(v) => set("ufUnidade", v)}
                placeholder="Digite..."
              />
              <CartaField
                icon={User}
                label="Nome completo (coordenador da Unidade EMBRAPII / responsável pelo projeto)"
                value={form.coordenadorNome}
                onChange={(v) => set("coordenadorNome", v)}
                placeholder="Nome completo"
                className="md:col-span-2"
              />
              <CartaField
                icon={Hash}
                label="CPF (coordenador da Unidade EMBRAPII / responsável pelo projeto)"
                value={form.coordenadorCpf}
                onChange={(v) => set("coordenadorCpf", v)}
                placeholder="000.000.000-00"
              />
              <CartaField
                icon={Mail}
                label="E-mail"
                value={form.emailUnidade}
                onChange={(v) => set("emailUnidade", v)}
                placeholder="Digite..."
              />
              <CartaField
                icon={Phone}
                label="Telefone"
                value={form.telefoneUnidade}
                onChange={(v) => set("telefoneUnidade", v)}
                placeholder="(00) 00000-0000"
              />
            </div>
          </CartaFormGroup>
          </fieldset>
        </div>
      </section>
    </div>
  );
}

// ── Auxiliares de layout (mesmo design da aba Projeto de Pesquisa) ──────────────

function CartaFormGroup({
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

function CartaField({
  label,
  value,
  onChange,
  placeholder,
  required,
  className,
  icon: Icon,
  hint,
  multiline,
  rows,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  icon?: React.ComponentType<{ className?: string }>;
  hint?: string;
  multiline?: boolean;
  rows?: number;
  maxLength?: number;
}) {
  const baseInput =
    "w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring transition-colors placeholder:text-muted-foreground/60 disabled:bg-muted/40 disabled:text-muted-foreground disabled:cursor-not-allowed disabled:pointer-events-none";
  const baseTextarea =
    "w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring transition-colors placeholder:text-muted-foreground/60 disabled:bg-muted/40 disabled:text-muted-foreground disabled:cursor-not-allowed disabled:pointer-events-none resize-y";
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      <span className="flex items-center gap-2 text-xs font-medium text-foreground">
        {Icon && <Icon className="size-3.5 text-muted-foreground" />}
        <span>
          {label}
          {required && <span className="text-red-600 ml-0.5">*</span>}
        </span>
      </span>
      {hint && <span className="text-[11px] text-muted-foreground -mt-0.5">{hint}</span>}
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows ?? 4}
          maxLength={maxLength}
          className={baseTextarea}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className={baseInput}
        />
      )}
    </label>
  );
}

function CartaSelect({
  label,
  value,
  onChange,
  options,
  className,
  icon: Icon,
  hint,
  placeholder = "Selecione…",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  className?: string;
  icon?: React.ComponentType<{ className?: string }>;
  hint?: string;
  placeholder?: string;
}) {
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      <span className="flex items-center gap-2 text-xs font-medium text-foreground">
        {Icon && <Icon className="size-3.5 text-muted-foreground" />}
        <span>{label}</span>
      </span>
      {hint && <span className="text-[11px] text-muted-foreground -mt-0.5">{hint}</span>}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-10 pl-3 pr-9 rounded-lg border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring transition-colors appearance-none disabled:bg-muted/40 disabled:text-muted-foreground disabled:cursor-not-allowed disabled:pointer-events-none"
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
      </div>
    </label>
  );
}

// ─── Subaba: Formulário complementar ───────────────

type EmpresaParceira = {
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  ufCnpj: string;
  numFuncionarios: string;
  faixaRob: string;
  cnae: string;
};

const EMPRESA_VAZIA: EmpresaParceira = {
  razaoSocial: "",
  nomeFantasia: "",
  cnpj: "",
  ufCnpj: "",
  numFuncionarios: "",
  faixaRob: "",
  cnae: "",
};

const IMPACTO_EMPRESA_ITENS = [
  "Ampliar a gama de bens ou serviços ofertados",
  "Ampliar a participação da empresa no mercado",
  "Aumentar a capacidade de produção ou de prestação de serviços",
  "Aumentar a flexibilidade da produção ou da prestação de serviços",
  "Enquadrar em regulações e normas-padrão relativas ao mercado interno ou externo",
  "Melhorar a qualidade dos bens ou serviços",
  "Permitir abertura de novos mercados",
  "Permitir controlar aspectos ligados à saúde e/ou à segurança",
  "Permitir manter a participação da empresa no mercado",
  "Permitir reduzir o impacto sobre o meio ambiente",
  "Reduzir o consumo de água",
  "Reduzir o consumo de energia",
  "Reduzir o consumo de matérias-primas",
  "Reduzir os custos de produção ou dos serviços prestados",
  "Reduzir os custos do trabalho",
];

const IMPACTO_AMBIENTE_ITENS = [
  "Substituir (total ou parcial) matérias-primas por outras menos contaminantes ou perigosas",
  "Substituir (total ou parcial) energia proveniente de combustíveis fósseis por fontes de energia renováveis",
  "Reduzir ruídos ou a contaminação do solo, da água ou do ar",
  "Reciclagem de resíduos, águas residuais ou materiais para venda e/ou reutilização",
  "Redução da 'pegada' de CO (produção total de CO) de sua empresa",
];

const GRAU_IMPACTO_OPCOES = ["Não se aplica", "Baixo", "Médio", "Alto"];

const GRAU_IMPACTO_EMPRESA_OPCOES = ["Não relevante", "Baixo", "Médio", "Alto"];

const MODALIDADE_FINANCIAMENTO_OPCOES = [
  "Desenvolvimento tecnológico",
  "Encadeamento tecnológico",
  "Aglomeração tecnológica tipo 1",
  "Aglomeração tecnológica tipo 2",
  "Aglomeração tecnológica tipo 3",
  "Aglomeração tecnológica tipo 4",
  "Aglomeração tecnológica tipo 5",
];

const FONTE_RECURSO_SECUNDARIA_OPCOES = ["BNDES", "ROTA2030", "Não se aplica"];

const UF_OPCOES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
  "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC",
  "SP", "SE", "TO",
];

const NUM_FUNCIONARIOS_OPCOES = [
  "Até 19 empregados",
  "De 20 a 99 empregados",
  "De 100 a 499 empregados",
  "500 ou mais empregados",
];

const FAIXA_ROB_OPCOES = [
  "Até R$ 360 mil",
  "Maior que R$ 360 mil e menor ou igual a R$ 4,8 milhões",
  "Maior que R$ 4,8 milhões e menor ou igual a R$ 300 milhões",
  "Maior que R$ 300 milhões",
];

// CNAE (grupo 3 dígitos) — opções a definir
const CNAE_OPCOES: string[] = [];

// Tecnologias habilitadoras — opções a definir
const TECNOLOGIA_HABILITADORA_OPCOES: string[] = [];

// Escala TRL — opções a definir
const TRL_OPCOES: string[] = [];

// Significância da inovação — opções a definir
const SIGNIFICANCIA_INOVACAO_OPCOES: string[] = [];

type FormularioComplementarState = {
  // Informações gerais
  unidadeEmbrapii: string;
  codigoNegociacao: string;
  modalidadeFinanciamento: string;
  fonteRecursoSecundaria: string;
  // Empresas parceiras (6)
  empresas: EmpresaParceira[];
  // Valores aportados
  valorTotal: string;
  valorEmbrapii: string;
  pctEmbrapii: string;
  valorEmpresas: string;
  pctEmpresas: string;
  valorSebrae: string;
  pctSebrae: string;
  valorUnidadeEmbrapii: string;
  pctUnidadeEmbrapii: string;
  // Características do projeto
  nomeProjeto: string;
  objetivoProjeto: string;
  tipoImpactoProdutivo: string;
  areasAplicacao: string[];
  areasAplicacaoOutros: string[];
  tecnologiasHabilitadoras: string[];
  tecnologiasHabilitadorasOutros: string[];
  numMacroentregas: string;
  trlPrimeira: string;
  trlUltima: string;
  resultadosEsperados: string;
  expectativaTempoMercado: string;
  expectativaImpacto: string;
  significanciaInovacao: string;
  // Graus de impacto
  impactoEmpresa: Record<string, string>;
  impactoAmbiente: Record<string, string>;
};

const FORMULARIO_COMPLEMENTAR_INITIAL: FormularioComplementarState = {
  unidadeEmbrapii: "",
  codigoNegociacao: "",
  modalidadeFinanciamento: "",
  fonteRecursoSecundaria: "",
  empresas: Array.from({ length: 2 }, () => ({ ...EMPRESA_VAZIA })),
  valorTotal: "",
  valorEmbrapii: "",
  pctEmbrapii: "",
  valorEmpresas: "",
  pctEmpresas: "",
  valorSebrae: "",
  pctSebrae: "",
  valorUnidadeEmbrapii: "",
  pctUnidadeEmbrapii: "",
  nomeProjeto: "",
  objetivoProjeto: "",
  tipoImpactoProdutivo: "",
  areasAplicacao: [""],
  areasAplicacaoOutros: [""],
  tecnologiasHabilitadoras: [""],
  tecnologiasHabilitadorasOutros: [""],
  numMacroentregas: "",
  trlPrimeira: "",
  trlUltima: "",
  resultadosEsperados: "",
  expectativaTempoMercado: "",
  expectativaImpacto: "",
  significanciaInovacao: "",
  impactoEmpresa: Object.fromEntries(IMPACTO_EMPRESA_ITENS.map((i) => [i, ""])),
  impactoAmbiente: Object.fromEntries(IMPACTO_AMBIENTE_ITENS.map((i) => [i, ""])),
};


function FormularioComplementarSubTab() {
  const [form, setForm] = useState<FormularioComplementarState>(
    FORMULARIO_COMPLEMENTAR_INITIAL
  );
  const [editing, setEditing] = useState(false);

  const set = <K extends keyof FormularioComplementarState>(
    key: K,
    value: FormularioComplementarState[K]
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const setEmpresa = (
    index: number,
    field: keyof EmpresaParceira,
    value: string
  ) =>
    setForm((prev) => ({
      ...prev,
      empresas: prev.empresas.map((e, i) =>
        i === index ? { ...e, [field]: value } : e
      ),
    }));

  const setArrayItem = (
    key:
      | "areasAplicacao"
      | "areasAplicacaoOutros"
      | "tecnologiasHabilitadoras"
      | "tecnologiasHabilitadorasOutros",
    index: number,
    value: string
  ) =>
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].map((v, i) => (i === index ? value : v)),
    }));

  const setImpacto = (
    grupo: "impactoEmpresa" | "impactoAmbiente",
    item: string,
    value: string
  ) =>
    setForm((prev) => ({
      ...prev,
      [grupo]: { ...prev[grupo], [item]: value },
    }));

  return (
    <div className="space-y-6">
      <section className="rounded-xl border bg-card overflow-hidden">
        {/* Cabeçalho (mesmo design da Carta SEBRAE) */}
        <div className="px-5 py-4 border-b bg-muted/30 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ClipboardList className="size-4 text-primary" />
              <h3 className="text-sm font-semibold">Formulário complementar</h3>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Informações complementares da negociação: empresas parceiras, valores
              aportados, características e impactos do projeto.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {editing ? (
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-white bg-sky-700 hover:bg-sky-800 transition-colors"
              >
                <Check className="size-4" />
                Salvar Formulário
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-white bg-sky-700 hover:bg-sky-800 transition-colors"
                >
                  <Pencil className="size-4" />
                  Editar
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-white bg-sky-700 hover:bg-sky-800 transition-colors"
                >
                  <Download className="size-4" />
                  Exportar
                </button>
              </>
            )}
          </div>
        </div>

        <div className="p-5 space-y-6">
          <fieldset disabled={!editing} className="space-y-6 min-w-0">
            {/* Seção 1 — Informações gerais */}
            <CartaFormGroup
              title="Informações Gerais"
              description="Dados gerais da negociação e do financiamento do projeto."
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-5">
                <CartaField
                  icon={Landmark}
                  label="Unidade EMBRAPII"
                  value={form.unidadeEmbrapii}
                  onChange={(v) => set("unidadeEmbrapii", v)}
                  placeholder="Digite..."
                />
                <CartaField
                  icon={Hash}
                  label="Código de Negociação"
                  value={form.codigoNegociacao}
                  onChange={(v) => set("codigoNegociacao", v)}
                  placeholder="Digite..."
                />
                <CartaSelect
                  icon={Wallet}
                  label="Modalidade de Financiamento do Projeto"
                  value={form.modalidadeFinanciamento}
                  onChange={(v) => set("modalidadeFinanciamento", v)}
                  options={MODALIDADE_FINANCIAMENTO_OPCOES}
                />
                <CartaSelect
                  icon={Coins}
                  label="Fonte de Recurso Secundária"
                  value={form.fonteRecursoSecundaria}
                  onChange={(v) => set("fonteRecursoSecundaria", v)}
                  options={FONTE_RECURSO_SECUNDARIA_OPCOES}
                />
              </div>
            </CartaFormGroup>

            {/* Seção 2 — Empresas parceiras */}
            <CartaFormGroup
              title="Empresas Parceiras"
              description="Dados cadastrais das empresas parceiras do projeto."
            >
              <div className="space-y-6">
                {form.empresas.map((empresa, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "rounded-xl border bg-background p-4",
                      idx > 0 && "border-dashed"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Building2 className="size-3.5 text-muted-foreground" />
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {ORDINAIS[idx]} Empresa
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-5">
                      <CartaField
                        icon={Building2}
                        label="Razão Social"
                        value={empresa.razaoSocial}
                        onChange={(v) => setEmpresa(idx, "razaoSocial", v)}
                        placeholder="Razão social da empresa"
                        className="md:col-span-2"
                      />
                      <CartaField
                        icon={Building2}
                        label="Nome Fantasia"
                        value={empresa.nomeFantasia}
                        onChange={(v) => setEmpresa(idx, "nomeFantasia", v)}
                        placeholder="Nome fantasia"
                      />
                      <CartaField
                        icon={Hash}
                        label="CNPJ"
                        value={empresa.cnpj}
                        onChange={(v) => setEmpresa(idx, "cnpj", v)}
                        placeholder="00.000.000/0000-00"
                      />
                      <CartaSelect
                        icon={MapPin}
                        label="UF do CNPJ"
                        value={empresa.ufCnpj}
                        onChange={(v) => setEmpresa(idx, "ufCnpj", v)}
                        options={UF_OPCOES}
                      />
                      <CartaSelect
                        icon={Users}
                        label="Número de funcionários no último ano"
                        value={empresa.numFuncionarios}
                        onChange={(v) => setEmpresa(idx, "numFuncionarios", v)}
                        options={NUM_FUNCIONARIOS_OPCOES}
                      />
                      <CartaSelect
                        icon={Coins}
                        label="Faixa de ROB no último ano"
                        value={empresa.faixaRob}
                        onChange={(v) => setEmpresa(idx, "faixaRob", v)}
                        options={FAIXA_ROB_OPCOES}
                      />
                      <CartaSelect
                        icon={Hash}
                        label="CNAE (grupo 3 dígitos) da empresa"
                        value={empresa.cnae}
                        onChange={(v) => setEmpresa(idx, "cnae", v)}
                        options={CNAE_OPCOES}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CartaFormGroup>

            {/* Seção 3 — Valores aportados */}
            <CartaFormGroup
              title="Valores Aportados dos Projetos"
              description="Composição dos aportes financeiros do projeto."
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-5">
                <CartaField
                  icon={Wallet}
                  label="Valor total"
                  value={form.valorTotal}
                  onChange={(v) => set("valorTotal", v)}
                  placeholder="R$ 0,00"
                  className="md:col-span-2"
                />
                <CartaField
                  icon={Coins}
                  label="Valor aportado pela EMBRAPII"
                  value={form.valorEmbrapii}
                  onChange={(v) => set("valorEmbrapii", v)}
                  placeholder="R$ 0,00"
                />
                <CartaField
                  icon={Gauge}
                  label="% valor aportado EMBRAPII"
                  value={form.pctEmbrapii}
                  onChange={(v) => set("pctEmbrapii", v)}
                  placeholder="%"
                />
                <CartaField
                  icon={Coins}
                  label="Valor aportado pela(s) empresa(s)"
                  value={form.valorEmpresas}
                  onChange={(v) => set("valorEmpresas", v)}
                  placeholder="R$ 0,00"
                />
                <CartaField
                  icon={Gauge}
                  label="% valor aportado pela(s) empresa(s)"
                  value={form.pctEmpresas}
                  onChange={(v) => set("pctEmpresas", v)}
                  placeholder="%"
                />
                <CartaField
                  icon={Coins}
                  label="Valor aportado pelo SEBRAE"
                  value={form.valorSebrae}
                  onChange={(v) => set("valorSebrae", v)}
                  placeholder="R$ 0,00"
                />
                <CartaField
                  icon={Gauge}
                  label="% valor aportado pelo SEBRAE"
                  value={form.pctSebrae}
                  onChange={(v) => set("pctSebrae", v)}
                  placeholder="%"
                />
                <CartaField
                  icon={Coins}
                  label="Valor aportado pela Unidade EMBRAPII"
                  value={form.valorUnidadeEmbrapii}
                  onChange={(v) => set("valorUnidadeEmbrapii", v)}
                  placeholder="R$ 0,00"
                />
                <CartaField
                  icon={Gauge}
                  label="% valor aportado pela Unidade EMBRAPII"
                  value={form.pctUnidadeEmbrapii}
                  onChange={(v) => set("pctUnidadeEmbrapii", v)}
                  placeholder="%"
                />
              </div>
            </CartaFormGroup>

            {/* Seção 4 — Características do projeto */}
            <CartaFormGroup
              title="Características dos Projetos"
              description="Objetivos, áreas de aplicação, tecnologias e resultados esperados."
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-5">
                <CartaField
                  icon={FileSignature}
                  label="Nome do projeto"
                  value={form.nomeProjeto}
                  onChange={(v) => set("nomeProjeto", v)}
                  placeholder="Nome do projeto"
                  className="md:col-span-2"
                />
                <CartaField
                  icon={Target}
                  label="Objetivo do projeto"
                  value={form.objetivoProjeto}
                  onChange={(v) => set("objetivoProjeto", v)}
                  placeholder="Descreva o objetivo do projeto"
                  multiline
                  rows={3}
                  className="md:col-span-2"
                />
                <CartaField
                  icon={Lightbulb}
                  label="Tipo de impacto produtivo esperado com o projeto"
                  value={form.tipoImpactoProdutivo}
                  onChange={(v) => set("tipoImpactoProdutivo", v)}
                  placeholder="Digite..."
                  className="md:col-span-2"
                />
                <CartaField
                  icon={Target}
                  label="1ª Área de aplicação associada ao projeto P,D&I"
                  value={form.areasAplicacao[0]}
                  onChange={(v) => setArrayItem("areasAplicacao", 0, v)}
                  placeholder="Selecione ou descreva a área"
                />
                <CartaSelect
                  icon={Lightbulb}
                  label="1ª Tecnologia habilitadora associada ao projeto P,D&I"
                  value={form.tecnologiasHabilitadoras[0]}
                  onChange={(v) => setArrayItem("tecnologiasHabilitadoras", 0, v)}
                  options={TECNOLOGIA_HABILITADORA_OPCOES}
                />
                <CartaField
                  icon={Target}
                  label="Nº de macroentregas planejadas"
                  value={form.numMacroentregas}
                  onChange={(v) => set("numMacroentregas", v)}
                  placeholder="Digite..."
                  className="md:col-span-2"
                />
                <CartaSelect
                  icon={Gauge}
                  label="Escala TRL da 1ª macroentrega do projeto (no início da sua execução)"
                  value={form.trlPrimeira}
                  onChange={(v) => set("trlPrimeira", v)}
                  options={TRL_OPCOES}
                />
                <CartaSelect
                  icon={Gauge}
                  label="Escala TRL da última macroentrega (esperado na conclusão do projeto)"
                  value={form.trlUltima}
                  onChange={(v) => set("trlUltima", v)}
                  options={TRL_OPCOES}
                />
                <CartaField
                  icon={ClipboardList}
                  label="Resultados esperados com a conclusão do projeto (descritivo - máx. de 500 caracteres)"
                  value={form.resultadosEsperados}
                  onChange={(v) => set("resultadosEsperados", v)}
                  placeholder="Descritivo (máx. 500 caracteres)"
                  hint={`${form.resultadosEsperados.length}/500 caracteres`}
                  multiline
                  rows={4}
                  maxLength={500}
                  className="md:col-span-2"
                />
                <CartaField
                  icon={CalendarDays}
                  label="Expectativa de tempo esperado para que a tecnologia chegue ao mercado (em nº de meses após a conclusão do projeto)"
                  value={form.expectativaTempoMercado}
                  onChange={(v) => set("expectativaTempoMercado", v)}
                  placeholder="Digite..."
                />
                <CartaSelect
                  icon={Gauge}
                  label="Expectativa de impacto esperado da(s) tecnologia(s) que será(ão) desenvolvida(s)"
                  value={form.expectativaImpacto}
                  onChange={(v) => set("expectativaImpacto", v)}
                  options={["Alto/Disruptivo", "Médio", "Baixo"]}
                />
                <CartaSelect
                  icon={Lightbulb}
                  label="Qual é a expectativa de significância da(s) inovação(ões) que será(ão) gerada(s) no projeto?"
                  value={form.significanciaInovacao}
                  onChange={(v) => set("significanciaInovacao", v)}
                  options={SIGNIFICANCIA_INOVACAO_OPCOES}
                  className="md:col-span-2"
                />
              </div>
            </CartaFormGroup>

            {/* Seção 5 — Grau de impacto na empresa e no mercado */}
            <CartaFormGroup
              title="Grau de Impacto Esperado (Empresa e Mercado)"
              description="Informe o grau de impacto esperado do projeto em relação a cada ponto."
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-5">
                {IMPACTO_EMPRESA_ITENS.map((item) => (
                  <CartaSelect
                    key={item}
                    icon={Gauge}
                    label={item}
                    value={form.impactoEmpresa[item]}
                    onChange={(v) => setImpacto("impactoEmpresa", item, v)}
                    options={GRAU_IMPACTO_EMPRESA_OPCOES}
                  />
                ))}
              </div>
            </CartaFormGroup>

            {/* Seção 6 — Grau de impacto no meio ambiente */}
            <CartaFormGroup
              title="Grau de Impacto no Meio Ambiente"
              description="Informe o grau de impacto ambiental esperado do projeto em relação a cada ponto."
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-5">
                {IMPACTO_AMBIENTE_ITENS.map((item) => (
                  <CartaSelect
                    key={item}
                    icon={Heart}
                    label={item}
                    value={form.impactoAmbiente[item]}
                    onChange={(v) => setImpacto("impactoAmbiente", item, v)}
                    options={GRAU_IMPACTO_OPCOES}
                  />
                ))}
              </div>
            </CartaFormGroup>
          </fieldset>
        </div>
      </section>
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
