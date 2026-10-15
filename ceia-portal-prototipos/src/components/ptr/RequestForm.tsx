import { useMemo, useState } from "react";
import {
  UserPlus,
  CalendarPlus,
  Wallet,
  CalendarMinus,
  Clock,
  PlusCircle,
  MinusCircle,
  Receipt,
  Send,
  CheckCircle2,
  Info,
  Users,
  CalendarRange,
  Coins,
  Plus,
  Trash2,
  FileEdit,
  ChevronRight,
} from "lucide-react";
import type { Project, BolsaSlot, RubricaSelection } from "@/lib/ptr-data";
import { cn } from "@/lib/utils";
import HighlightedTextarea from "@/components/ui/highlighted-textarea";
import { ParticipantPicker } from "./ParticipantPicker";
import { RubricaPicker } from "./RubricaPicker";
import { InclusionSection, type InclusionLine } from "./InclusionSection";

// Tipo re-exportado para evitar warning de import não usado
export type { InclusionLine };

type SectionKey =
  | "inclusao"
  | "valor"
  | "prorrogacao"
  | "reducao"
  | "carga"
  | "suplementacao"
  | "anulacaoRubrica";

type SectionDef = {
  key: SectionKey;
  title: string;
  icon: React.ReactNode;
  description: string;
  helper: string;
  group: "bolsistas" | "vigencia" | "rubricas";
};

const SECTIONS: SectionDef[] = [
  {
    key: "inclusao",
    title: "Inclusão de Colaborador",
    icon: <UserPlus className="size-5" />,
    description: "Adicionar novos colaboradores ao projeto.",
    helper: "Selecione um slot existente para alocar o colaborador ou proponha um novo slot com linha em branco.",
    group: "bolsistas",
  },
  {
    key: "valor",
    title: "Ajuste no Valor da Bolsa",
    icon: <Wallet className="size-5" />,
    description: "Alterar o valor de bolsas vigentes.",
    helper: "Selecione o colaborador — valor antigo e fonte serão preenchidos. Informe o valor novo e fonte nova.",
    group: "bolsistas",
  },
  {
    key: "prorrogacao",
    title: "Prorrogação de Vigência",
    icon: <CalendarPlus className="size-5" />,
    description: "Estender o tempo de bolsa de um colaborador.",
    helper: "Selecione o colaborador — informe quantas parcelas acrescentar.",
    group: "vigencia",
  },
  {
    key: "reducao",
    title: "Redução de Vigência (distrato)",
    icon: <CalendarMinus className="size-5" />,
    description: "Reduzir parcelas sem destinação específica.",
    helper: "Selecione o colaborador e informe quantas parcelas reduzir.",
    group: "vigencia",
  },
  {
    key: "carga",
    title: "Ajuste de Carga Horária",
    icon: <Clock className="size-5" />,
    description: "Alterar a CH sem mudar o valor da bolsa.",
    helper: "Selecione o colaborador — informe a nova CH e a data de início.",
    group: "vigencia",
  },
  {
    key: "suplementacao",
    title: "Suplementação de Rubrica",
    icon: <PlusCircle className="size-5" />,
    description: "Acrescentar valor a uma rubrica existente.",
    helper: "Escolha a rubrica ou subrubrica. Informe o valor a suplementar e a fonte.",
    group: "rubricas",
  },
  {
    key: "anulacaoRubrica",
    title: "Anulação em Outras Rubricas",
    icon: <Receipt className="size-5" />,
    description: "Reduzir valor de uma rubrica para realocar.",
    helper: "Escolha a rubrica/subrubrica e informe o valor a reduzir.",
    group: "rubricas",
  },
];

const GROUPS: { key: SectionDef["group"]; title: string; description: string; icon: React.ReactNode }[] = [
  { key: "bolsistas", title: "Colaboradores", description: "Inclusão e ajuste de valor.", icon: <Users className="size-4" /> },
  { key: "vigencia", title: "Vigência & Carga Horária", description: "Prorrogar, reduzir parcelas/distrato ou alterar CH.", icon: <CalendarRange className="size-4" /> },
  { key: "rubricas", title: "Rubricas", description: "Suplementar ou anular valores em rubricas.", icon: <Coins className="size-4" /> },
];

// =============================================================
// Modelo: cada seção tem uma lista de "linhas". Cada linha tem
// um TEMPLATE de texto editável (textarea) pré-preenchido a partir
// dos dados do slot/colaborador/rubrica selecionados. O coordenador
// só ajusta o texto da linha — UMA linha por colaborador/rubrica.
// =============================================================

/** Tipo único: cada item é um texto livre, com origem para ícone/destaque. */
type Line = {
  id: string;
  /** Texto-template editável (uma frase por item). */
  text: string;
  /** Origem para destacar o card. */
  source: "slot" | "rubrica" | "blank";
  /** Slot relacionado (se origem = slot/talent/novo-slot). */
  slotInfo?: string;
  /** Quando origem = rubrica, indica se a seleção foi uma subrubrica específica. */
  isSubrubrica?: boolean;
};

type SectionState = {
  active: boolean;
  lines: Line[];
  /** Linhas específicas de Inclusão de Colaborador (estrutura mais rica). */
  inclusionLines?: InclusionLine[];
};

const uid = () => Math.random().toString(36).slice(2, 9);

/** Templates em branco para "linha avulsa". */
const BLANK_TEMPLATE: Record<SectionKey, string> = {
  inclusao:
    "[Nome do colaborador], CPF [000.000.000-00], [Vínculo]. CH [00]h/mês, [00] parcelas de R$ [0,00], início em [dd/mm/aaaa]. Fonte [FONTE]. E-mail [email].",
  valor:
    "[Nome]. Aumentar de R$ [valor antigo] para R$ [valor novo]. Fonte [FONTE].",
  prorrogacao:
    "[Nome]. Acrescentar [00] parcelas. Fonte [FONTE].",
  reducao:
    "[Nome]. Reduzir [00] parcelas de R$ [valor]. Fonte [FONTE].",
  carga:
    "[Nome]. Nova CH de [00]h mensais, a partir de [dd/mm/aaaa].",
  suplementacao:
    "[Rubrica/Subrubrica]. Acrescentar R$ [0,00] na fonte [FONTE].",
  anulacaoRubrica:
    "[Rubrica/Subrubrica]. Reduzir R$ [0,00] na fonte [FONTE].",
};

/** Formata valor BRL. */
function brl(v: number): string {
  return v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Templates pré-preenchidos a partir do slot. */
function templateValor(slot: BolsaSlot): string {
  return `${slot.ocupante!.nome}. Aumentar de R$ ${brl(slot.valor)} para R$ [novo valor]. Fonte ${slot.fonte}.`;
}
function templateProrrogacao(slot: BolsaSlot): string {
  return `${slot.ocupante!.nome}. Acrescentar [nº] parcelas. Fonte ${slot.fonte}.`;
}
function templateReducao(slot: BolsaSlot): string {
  return `${slot.ocupante!.nome}. Reduzir [nº] parcelas de R$ ${brl(slot.valor)}. Fonte ${slot.fonte}.`;
}
function templateCarga(slot: BolsaSlot): string {
  return `${slot.ocupante!.nome}. Nova CH de [00]h mensais, a partir de [dd/mm/aaaa]. (CH atual: ${slot.ch}h)`;
}
function templateRubrica(sel: RubricaSelection, kind: "supl" | "anul"): string {
  const action = kind === "supl" ? "Acrescentar" : "Reduzir";
  return `${sel.label}. ${action} R$ [0,00] na fonte [FONTE].`;
}

function blankLine(key: SectionKey): Line {
  return { id: uid(), text: BLANK_TEMPLATE[key], source: "blank" };
}

const initialState = (): Record<SectionKey, SectionState> =>
  Object.fromEntries(SECTIONS.map((s) => [s.key, { active: false, lines: [] as Line[] }])) as unknown as Record<SectionKey, SectionState>;

export function RequestForm({ project, onSubmitted }: { project: Project; onSubmitted: () => void }) {
  const [state, setState] = useState<Record<SectionKey, SectionState>>(initialState);
  const [sent, setSent] = useState(false);

  const activeCount = useMemo(() => Object.values(state).filter((s) => s.active).length, [state]);
  const totalLines = useMemo(
    () => Object.values(state).reduce((sum, s) => sum + (s.active ? s.lines.length + (s.inclusionLines?.length ?? 0) : 0), 0),
    [state]
  );
  const canSubmit = activeCount > 0 && totalLines > 0;

  function update(key: SectionKey, patch: Partial<SectionState>) {
    setState((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));
  }

  if (sent) {
    return (
      <div className="rounded-2xl border bg-card p-10 text-center">
        <div className="size-14 rounded-full bg-[color:color-mix(in_oklab,var(--status-approved)_25%,transparent)] flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="size-7 text-[color:var(--status-approved-fg)]" />
        </div>
        <h3 className="text-xl font-semibold">Solicitação enviada com sucesso!</h3>
        <p className="text-muted-foreground mt-2 max-w-md mx-auto">
          A equipe administrativa receberá sua solicitação por ordem de chegada. Você pode acompanhar o status na aba Histórico.
        </p>
        <button
          onClick={onSubmitted}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:bg-primary/90"
        >
          Ver no Histórico
        </button>
      </div>
    );
  }

  return (
    <div className="pb-28">
      <div className="rounded-xl border bg-card p-4 mb-6 flex items-start gap-3">
        <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Info className="size-4" />
        </div>
        <div className="text-sm">
          <div className="font-semibold text-foreground">Ative apenas os tópicos que deseja ajustar</div>
          <p className="mt-1 text-muted-foreground leading-relaxed">
            Em cada seção você pode adicionar quantos itens precisar — cada um vira uma linha independente com seus próprios campos.
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {GROUPS.map((g) => {
          const items = SECTIONS.filter((s) => s.group === g.key);
          const groupActive = items.filter((s) => state[s.key].active).length;
          return (
            <section key={g.key}>
              <div className="flex items-center gap-3 mb-3 px-1">
                <div className="size-8 rounded-lg bg-primary-soft text-primary flex items-center justify-center">
                  {g.icon}
                </div>
                <div className="flex-1">
                  <h2 className="font-semibold text-base">{g.title}</h2>
                  <p className="text-xs text-muted-foreground">{g.description}</p>
                </div>
                {groupActive > 0 && (
                  <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                    {groupActive} ativo{groupActive > 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <div className="grid gap-3">
                {items.map((s) => (
                  <SectionCard
                    key={s.key}
                    def={s}
                    state={state[s.key]}
                    project={project}
                    onChange={(p) => update(s.key, p)}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-10 md:bottom-6 md:max-w-xl md:ml-auto z-30">
        <div className="rounded-2xl border bg-card/95 backdrop-blur shadow-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-sm flex items-center gap-2">
            <span className="size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
              {activeCount}
            </span>
            <span>
              {activeCount === 1 ? "ajuste selecionado" : "ajustes selecionados"}
              <span className="text-muted-foreground block text-xs">
                {totalLines} {totalLines === 1 ? "item" : "itens"} no total
              </span>
            </span>
          </div>
          <button
            disabled={!canSubmit}
            onClick={() => setSent(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <Send className="size-4" /> Enviar solicitação
          </button>
        </div>
      </div>
    </div>
  );
}

// =============================================================
// SectionCard: renderiza header + lista de linhas + botões.
// =============================================================

const PARTICIPANT_SECTIONS: SectionKey[] = ["valor", "prorrogacao", "reducao", "carga"];
const RUBRICA_SECTIONS: SectionKey[] = ["suplementacao", "anulacaoRubrica"];

function SectionCard({
  def,
  state,
  project,
  onChange,
}: {
  def: SectionDef;
  state: SectionState;
  project: Project;
  onChange: (p: Partial<SectionState>) => void;
}) {
  const { active, lines } = state;

  function setLines(updater: (prev: Line[]) => Line[]) {
    onChange({ lines: updater(lines) });
  }
  function addBlank() {
    setLines((prev) => [...prev, blankLine(def.key)]);
  }
  function removeLine(id: string) {
    setLines((prev) => prev.filter((l) => l.id !== id));
  }
  function updateLineText(id: string, text: string) {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, text } : l)));
  }

  // ===== Outras seções via ParticipantPicker =====
  function pickParticipant(slot: BolsaSlot) {
    if (!slot.ocupante) return;
    let text = "";
    switch (def.key) {
      case "valor": text = templateValor(slot); break;
      case "prorrogacao": text = templateProrrogacao(slot); break;
      case "reducao": text = templateReducao(slot); break;
      case "carga": text = templateCarga(slot); break;
      default: return;
    }
    setLines((prev) => [
      ...prev,
      { id: uid(), text, source: "slot", slotInfo: `${slot.ocupante!.nome} · ${slot.funcao}` },
    ]);
  }

  // ===== Rubricas =====
  function pickRubrica(sel: RubricaSelection) {
    const text = templateRubrica(sel, def.key === "suplementacao" ? "supl" : "anul");
    setLines((prev) => [
      ...prev,
      { id: uid(), text, source: "rubrica", slotInfo: sel.label, isSubrubrica: !!sel.subrubrica },
    ]);
  }

  return (
    <div
      className={cn(
        "rounded-xl border bg-card transition-all overflow-hidden",
        active ? "border-primary shadow-md ring-1 ring-primary/20" : "hover:border-foreground/20 hover:shadow-sm"
      )}
    >
      <button
        onClick={() => onChange({ active: !active })}
        className="w-full flex items-center gap-4 p-4 text-left"
      >
        <div
          className={cn(
            "size-10 rounded-lg flex items-center justify-center shrink-0 transition-colors",
            active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          )}
        >
          {def.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm md:text-base">{def.title}</span>
            {active && lines.length > 0 && (
              <span className="text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-primary text-primary-foreground">
                {lines.length} {lines.length === 1 ? "item" : "itens"}
              </span>
            )}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">{def.description}</div>
        </div>
        <Switch active={active} />
      </button>

      {active && (
        <div className="px-5 pb-6 pt-5 border-t bg-muted/20 space-y-4">
          <p className="text-xs text-muted-foreground">{def.helper}</p>

          {def.key === "inclusao" ? (
            <InclusionSection
              project={project}
              lines={state.inclusionLines ?? []}
              onChange={(inclusionLines) => onChange({ inclusionLines })}
            />
          ) : null}

          {def.key !== "inclusao" && PARTICIPANT_SECTIONS.includes(def.key) && (
            <ParticipantPicker projectId={project.id} onPick={pickParticipant} />
          )}

          {def.key !== "inclusao" && RUBRICA_SECTIONS.includes(def.key) && <RubricaPicker onPick={pickRubrica} />}

          {/* ===== Lista de linhas (não-Inclusão) ===== */}
          {def.key !== "inclusao" && (lines.length === 0 ? (
            <div className="rounded-lg border border-dashed bg-background p-6 text-center text-xs text-muted-foreground">
              Nenhum item adicionado ainda. Use o seletor acima ou clique em "Adicionar item em branco" abaixo.
            </div>
          ) : (
            <div className="space-y-3">
              {lines.map((line, idx) => (
                <LineCard
                  key={line.id}
                  index={idx + 1}
                  line={line}
                  onChange={(text) => updateLineText(line.id, text)}
                  onRemove={() => removeLine(line.id)}
                />
              ))}
            </div>
          ))}

          {def.key !== "inclusao" && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={addBlank}
                className="group w-full text-left inline-flex items-center gap-4 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/[0.04] via-primary/[0.02] to-transparent px-4 py-3.5 text-sm shadow-sm hover:shadow-md hover:border-primary/40 hover:from-primary/[0.07] transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex items-center justify-center size-11 rounded-lg bg-primary text-primary-foreground shrink-0 shadow-sm group-hover:scale-105 group-hover:shadow-md transition-all duration-300">
                  <FileEdit className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">Adicionar item em branco (template editável)</div>
                  <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">Use o template para preencher texto livremente.</div>
                </div>
                <ChevronRight className="size-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-300 shrink-0" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// =============================================================
// LineCard: textarea editável com template pré-preenchido
// =============================================================

function LineCard({
  index,
  line,
  onChange,
  onRemove,
}: {
  index: number;
  line: Line;
  onChange: (text: string) => void;
  onRemove: () => void;
}) {
  const sourceMeta: Record<Line["source"], { label: string; cls: string }> = {
    slot: { label: "Slot existente", cls: "bg-amber-500 text-white" },
    rubrica: { label: "Rubrica", cls: "bg-purple-600 text-white" },
    blank: { label: "Em branco", cls: "bg-muted-foreground text-background" },
  };
  const meta =
    line.source === "rubrica" && line.isSubrubrica
      ? { label: "Subrubrica", cls: "bg-fuchsia-600 text-white" }
      : sourceMeta[line.source];

  return (
    <div className="rounded-lg border-2 border-primary/20 bg-background p-3 relative">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="size-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
            {index}
          </span>
          <span className={cn("text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded", meta.cls)}>
            {meta.label}
          </span>
          {line.slotInfo && (
            <span className="text-[11px] text-muted-foreground truncate max-w-[280px]">
              {line.slotInfo}
            </span>
          )}
        </div>
        <button
          onClick={onRemove}
          className="text-muted-foreground hover:text-destructive p-1 rounded hover:bg-destructive/10 transition-colors shrink-0"
          title="Remover este item"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
      <HighlightedTextarea
        value={line.text}
        onChange={(v) => onChange(v)}
        rows={2}
        className=""
        placeholder=""
      />
    </div>
  );
}

// =============================================================
// Componentes utilitários
// =============================================================

function Switch({ active, onClick }: { active: boolean; onClick?: (e: React.MouseEvent) => void }) {
  return (
    <span
      onClick={(e) => {
        if (onClick) {
          e.stopPropagation();
          onClick(e);
        }
      }}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors",
        active ? "bg-primary" : "bg-muted-foreground/30"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 size-5 rounded-full bg-background shadow transition-transform",
          active ? "translate-x-5" : "translate-x-0.5"
        )}
      />
    </span>
  );
}
