import { useState } from "react";
import {
  Plus,
  Trash2,
  X,
  Search,
  UserPlus,
  UserCheck,
  FileEdit,
  ListChecks,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  Handshake,
  Database,
  UserCircle2,
  Info,
  RotateCcw,
  ChevronRight,
} from "lucide-react";
import type { Project, BolsaSlot } from "@/lib/ptr-data";
import { useBolsaSlots } from "@/lib/ptr-data";
import { useActiveProfile } from "@/lib/profile";
import { cn } from "@/lib/utils";
import HighlightedTextarea from "@/components/ui/highlighted-textarea";
import { TALENTS, type Talent } from "./TalentSearch";
import TalentPickerModal from "./TalentPickerModal";
// NewSlotDraft copied here to support inline novo-slot editing (removed modal)
export type NewSlotDraft = {
  areaCompetencia: string;
  cargoFuncao: string;
  nivel: string;
  titulacao: string;
  chMensal: string;
  mesInicio: string;
  duracao: string;
  fonte: string;
  replicar: string;
  voluntaria: boolean;
  valorHora: number;
  atividades: string[];
};

function emptyDraft(): NewSlotDraft {
  return {
    areaCompetencia: "",
    cargoFuncao: "",
    nivel: "",
    titulacao: "",
    chMensal: "",
    mesInicio: "",
    duracao: "",
    fonte: "",
    replicar: "1",
    voluntaria: false,
    valorHora: 20,
    atividades: [],
  };
}

/**
 * Linha de inclusão. Cada linha representa UM colaborador a incluir.
 * Quatro origens:
 *  - "slot-vazio": coordenador escolheu um slot livre.
 *  - "slot-ocupado": coordenador escolheu um slot ocupado (substituição/distrato).
 *  - "blank": linha avulsa, sem slot.
 *  - "novo-slot": proposta de criação de novo slot + alocação.
 */
export type InclusionLine = {
  id: string;
  source: "slot-vazio" | "slot-ocupado" | "blank" | "novo-slot";
  /** Texto livre do template editável (frase única). */
  text: string;
  /** Slot relacionado quando aplicável. */
  slot?: BolsaSlot;
  /** Talento selecionado do banco (se houver). */
  talent?: Talent;
  /** Proposta de novo slot. */
  novoSlot?: NewSlotDraft;
  /** Atividades obrigatórias para este novo colaborador. */
  atividades: string[];
  /** Para externo: bloco de justificativa em texto único. */
  externoText?: string;
};

const uid = () => Math.random().toString(36).slice(2, 9);
const brl = (v: number) => v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/**
 * Retorna o trecho de e-mail a ser incluído na descrição.
 * - Sem talento (manual): mantém placeholder `[email]` para o coordenador editar.
 * - Talento com vínculo Discente (candidato): preenche com o e-mail real.
 * - Talento com qualquer outro vínculo (colaborador): não inclui, pois já está
 *   cadastrado no portal.
 */
function emailFragment(talent?: Talent): string {
  if (!talent) return " E-mail: [email].";
  if (talent.vinculo === "Discente") return ` E-mail: ${talent.email}.`;
  return "";
}

// ============= Templates =============
function templateSlot(slot: BolsaSlot, talent?: Talent): string {
  const nome = talent?.name ?? "[Nome do colaborador]";
  const cpf = talent?.cpf ?? "[CPF]";
  const vinc = talent?.vinculo ?? "[Vínculo]";
  // Tentar extrair número de meses da string de vigência (ex: "12 meses")
  const m = slot.vigencia.match(/(\d+)/);
  let vigenciaStr = "[mês/ano] a [mês/ano] ([nº] parcelas)";
  if (m) {
    const months = Number(m[1]);
    // calcular início como mês atual e fim como mês atual + months - 1
    const now = new Date();
    const startMonth = String(now.getMonth() + 1).padStart(2, "0");
    const startYear = now.getFullYear();
    const end = new Date(now.getFullYear(), now.getMonth() + months - 1, 1);
    const endMonth = String(end.getMonth() + 1).padStart(2, "0");
    const endYear = end.getFullYear();
    vigenciaStr = `${startMonth}/${startYear} a ${endMonth}/${endYear} (${months} parcelas)`;
  }
  return `${nome} (${vinc}): incluir bolsa de R$ ${brl(slot.valor)}, carga horária mensal de ${slot.ch}h e vigência de ${vigenciaStr}. CPF ${cpf}.${emailFragment(talent)} Fonte ${slot.fonte}.`;
}
function templateSubstituicao(slot: BolsaSlot, talent?: Talent): string {
  const nome = talent?.name ?? "[Nome do novo colaborador]";
  const vinc = talent?.vinculo ?? "[Vínculo]";
  const cpf = talent?.cpf ?? "[CPF]";
  const m = slot.vigencia.match(/(\d+)/);
  let vigenciaStr = "[mês/ano] a [mês/ano] ([nº] parcelas)";
  if (m) {
    const months = Number(m[1]);
    const now = new Date();
    const startMonth = String(now.getMonth() + 1).padStart(2, "0");
    const startYear = now.getFullYear();
    const end = new Date(now.getFullYear(), now.getMonth() + months - 1, 1);
    const endMonth = String(end.getMonth() + 1).padStart(2, "0");
    const endYear = end.getFullYear();
    vigenciaStr = `${startMonth}/${startYear} a ${endMonth}/${endYear} (${months} parcelas)`;
  }
  return `SUBSTITUIÇÃO da vaga atualmente ocupada por ${slot.ocupante!.nome}: realizar o distrato da bolsa atual (R$ ${brl(slot.valor)}, ${slot.ch}h/mês, fonte ${slot.fonte}) e incluir ${nome} (${vinc}), CPF ${cpf}${!talent || talent.vinculo === "Discente" ? `, e-mail: ${talent ? talent.email : "[email]"}` : ""}, com bolsa de R$ ${brl(slot.valor)}, carga horária mensal de ${slot.ch}h e vigência de ${vigenciaStr}. Fonte ${slot.fonte}.`;
}
function templateBlank(): string {
  return "[Nome do colaborador] ([Vínculo]): incluir bolsa de R$ [valor], carga horária mensal de [00]h e vigência de [mês/ano] a [mês/ano] ([nº] parcelas). CPF [000.000.000-00]. E-mail: [email]. Fonte [FONTE].";
}
function templateNovoSlot(d: NewSlotDraft, talent?: Talent): string {
  const nome = talent?.name ?? "[Nome do colaborador]";
  const cpf = talent?.cpf ?? "[CPF]";
  const vinc = talent?.vinculo ?? "[Vínculo]";
  const valor = d.voluntaria ? "voluntária (sem bolsa)" : `R$ ${brl(Number(d.chMensal || 0) * d.valorHora)}`;
  const area = d.areaCompetencia || "[Área]";
  const cargo = d.cargoFuncao || "[Cargo/Função]";
  const nivel = d.nivel || "[Nível]";
  const titulacao = d.titulacao || "[Titulação]";
  const ch = d.chMensal || "[CH]";
  const inicio = d.mesInicio || "[mês]";
  const dur = d.duracao || "[duração]";
  const fonte = d.fonte || "[FONTE]";

  return `NOVO SLOT — Área: ${area}; Cargo/Função: ${cargo}; Nível: ${nivel}; Titulação mínima: ${titulacao}. Incluir: ${nome} (${vinc}), CPF ${cpf}${talent && talent.vinculo !== "Discente" ? "" : `, e-mail: ${talent ? talent.email : "[email]"}`}; Remuneração: ${valor}/mês; Carga horária mensal: ${ch}h; Duração: ${dur} meses a partir do mês ${inicio}. Fonte: ${fonte}.`;
}
function templateExterno(talent?: Talent): string {
  const nome = talent?.name ?? "[Nome do pesquisador externo]";
  const formacao = talent?.formacao ?? "[Formação acadêmica]";
  return `${nome} — Formação: ${formacao}. Qualificação: [descreva a experiência relacionada às atividades do projeto, conforme exigência da FUNAPE].`;
}

// ============= Componente principal =============
export function InclusionSection({
  project,
  lines,
  onChange,
}: {
  project: Project;
  lines: InclusionLine[];
  onChange: (lines: InclusionLine[]) => void;
}) {
  const [picker, setPicker] = useState<"none" | "slot">("none");
  const [confirmOccupied, setConfirmOccupied] = useState<BolsaSlot | null>(null);
  const [editingActivitiesFor, setEditingActivitiesFor] = useState<string | null>(null);

  // Externos: derivado de lines (qualquer linha com talent.externo OU externoText preenchido)
  const externoLines = lines.filter((l) => l.talent?.externo || l.externoText !== undefined);

  function addLine(line: Omit<InclusionLine, "id" | "atividades">) {
    onChange([...lines, { ...line, id: uid(), atividades: [] }]);
  }
  function updateLine(id: string, patch: Partial<InclusionLine>) {
    onChange(lines.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }
  function removeLine(id: string) {
    onChange(lines.filter((l) => l.id !== id));
  }

  function pickSlot(slot: BolsaSlot) {
    setPicker("none");
    if (slot.ocupante) {
      setConfirmOccupied(slot);
      return;
    }
    addLine({ source: "slot-vazio", slot, text: templateSlot(slot) });
  }
  function confirmOccupiedSlot() {
    if (!confirmOccupied) return;
    addLine({ source: "slot-ocupado", slot: confirmOccupied, text: templateSubstituicao(confirmOccupied) });
    setConfirmOccupied(null);
  }
  function addBlank() {
    // Agora a ação "Linha em branco" cria um novo-slot inline (substitui o modal)
    const draft = emptyDraft();
    addLine({ source: "novo-slot", novoSlot: draft, text: templateNovoSlot(draft) });
  }

  function attachTalent(lineId: string, talent: Talent) {
    const line = lines.find((l) => l.id === lineId);
    if (!line) return;
    let newText = line.text;
    if (line.source === "slot-vazio" && line.slot) newText = templateSlot(line.slot, talent);
    else if (line.source === "slot-ocupado" && line.slot) newText = templateSubstituicao(line.slot, talent);
    else if (line.source === "novo-slot" && line.novoSlot) newText = templateNovoSlot(line.novoSlot, talent);
    else if (line.source === "blank") {
      newText = `${talent.name} (${talent.vinculo}): incluir bolsa de R$ [valor], carga horária mensal de [00]h e vigência de [mês/ano] a [mês/ano] ([nº] parcelas). CPF ${talent.cpf}.${emailFragment(talent)} Fonte [FONTE].`;
    }
    updateLine(lineId, {
      talent,
      text: newText,
      externoText: talent.externo ? templateExterno(talent) : line.externoText,
    });
  }

  function detachTalent(lineId: string) {
    const line = lines.find((l) => l.id === lineId);
    if (!line) return;
    let newText = line.text;
    if (line.source === "slot-vazio" && line.slot) newText = templateSlot(line.slot);
    else if (line.source === "slot-ocupado" && line.slot) newText = templateSubstituicao(line.slot);
    else if (line.source === "novo-slot" && line.novoSlot) newText = templateNovoSlot(line.novoSlot);
    else if (line.source === "blank") newText = templateBlank();
    updateLine(lineId, { talent: undefined, text: newText, externoText: undefined });
  }

  // Helpers para externos
  function toggleExternoManual(lineId: string) {
    const line = lines.find((l) => l.id === lineId);
    if (!line) return;
    updateLine(lineId, { externoText: line.externoText === undefined ? templateExterno(line.talent) : undefined });
  }

  return (
    <div className="space-y-4">
      {/* Painel de orientação */}
      

      {/* Botões de ação principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <ActionButton
          icon={<UserPlus className="size-4" />}
          title="Slot existente"
          subtitle="Vazio ou ocupado"
          onClick={() => setPicker(picker === "slot" ? "none" : "slot")}
          active={picker === "slot"}
        />
        <ActionButton
          icon={<FileEdit className="size-4" />}
          title="Linha em branco"
          subtitle="Propor novo slot"
          onClick={addBlank}
        />
        
      </div>

      {/* Slot picker inline */}
      {picker === "slot" && (
        <SlotPickerInline
          projectId={project.id}
          onPick={pickSlot}
          onClose={() => setPicker("none")}
        />
      )}

      {/* Confirmação de slot ocupado */}
      {confirmOccupied && (
        <div className="rounded-xl border-2 border-amber-400 bg-amber-50 dark:bg-amber-950/30 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="size-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-semibold text-sm">Esta vaga já está ocupada</div>
              <p className="text-xs text-muted-foreground mt-1">
                A vaga <strong>{confirmOccupied.funcao}</strong> está alocada para{" "}
                <strong>{confirmOccupied.ocupante!.nome}</strong> (restam {confirmOccupied.ocupante!.mesesRestantes} meses).
                Para incluir um novo colaborador, será gerada uma <strong>substituição</strong> (distrato da bolsa atual + inclusão do novo).
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={confirmOccupiedSlot}
                  className="rounded-md bg-amber-600 text-white px-3 py-1.5 text-xs font-semibold hover:bg-amber-700"
                >
                  Prosseguir com substituição
                </button>
                <button
                  onClick={() => setConfirmOccupied(null)}
                  className="rounded-md border bg-background px-3 py-1.5 text-xs font-medium hover:bg-accent inline-flex items-center gap-1"
                >
                  <X className="size-3" /> Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de novo slot removido: o formulário foi incorporado na "Linha em branco" */}

      {/* Lista de linhas */}
      {lines.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          Nenhum colaborador adicionado ainda. Use uma das 2 opções acima para começar.
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
            {lines.length} colaborador{lines.length > 1 ? "es" : ""} a incluir
          </div>
          {lines.map((line, idx) => (
            <InclusionLineCard
              key={line.id}
              index={idx + 1}
              line={line}
              onChangeText={(t) => updateLine(line.id, { text: t })}
              onChangeExterno={(t) => updateLine(line.id, { externoText: t })}
              onAttachTalent={(t) => attachTalent(line.id, t)}
              onDetachTalent={() => detachTalent(line.id)}
              onToggleExterno={() => toggleExternoManual(line.id)}
              onOpenActivities={() => setEditingActivitiesFor(line.id)}
              onRemove={() => removeLine(line.id)}
              onChangeNovoSlot={(d) => updateLine(line.id, { novoSlot: d, text: templateNovoSlot(d) })}
            />
          ))}
        </div>
      )}

      {/* Bloco resumo de externos */}
      {externoLines.length > 0 && (
        <div className="rounded-xl border-2 border-primary/30 bg-primary-soft/30 p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="size-4 text-primary" />
            <div className="text-sm font-semibold">
              Serão incluídos {externoLines.length} colaborador{externoLines.length > 1 ? "es" : ""} externo{externoLines.length > 1 ? "s" : ""}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            A justificativa aparece dentro de cada linha de colaborador externo (campo "Colaborador externo — justificativa para FUNAPE"). Edite o texto livremente.
          </p>
        </div>
      )}

      {/* Modal lista de atividades */}
      {editingActivitiesFor && (
        <ActivitiesDialog
          initial={lines.find((l) => l.id === editingActivitiesFor)?.atividades ?? []}
          onClose={() => setEditingActivitiesFor(null)}
          onSave={(atividades) => {
            updateLine(editingActivitiesFor, { atividades });
            setEditingActivitiesFor(null);
          }}
        />
      )}
    </div>
  );
}

// ============= Subcomponents =============

function ActionButton({
  icon,
  title,
  subtitle,
  onClick,
  active,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full rounded-lg border-2 px-3 py-3 text-left transition-all hover:shadow-sm",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-primary/30 bg-background hover:border-primary hover:bg-primary-soft/30"
      )}
    >
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm font-semibold">{title}</span>
      </div>
      <div className={cn("text-[11px] mt-0.5", active ? "text-primary-foreground/80" : "text-muted-foreground")}>
        {subtitle}
      </div>
    </button>
  );
}

function SlotPickerInline({
  projectId,
  onPick,
  onClose,
}: {
  projectId: string;
  onPick: (slot: BolsaSlot) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"todas" | "abertas" | "ocupadas">("todas");
  const allSlots = useBolsaSlots();
  const profile = useActiveProfile();
  const all = allSlots.filter((s) => s.projectId === projectId);
  const empty = all.filter((s) => !s.ocupante).length;
  const occupied = all.length - empty;
  const q = query.trim().toLowerCase();
  const visible = all
    .filter((s) => {
      if (filter === "abertas" && s.ocupante) return false;
      if (filter === "ocupadas" && !s.ocupante) return false;
      if (!q) return true;
      return s.funcao.toLowerCase().includes(q) || s.fonte.toLowerCase().includes(q) || s.ocupante?.nome.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      // Para o perfil Equipe Administrativa, mostrar primeiro as ocupadas, depois as abertas.
      if (profile.id !== "admin") return 0;
      const aOcc = a.ocupante ? 0 : 1;
      const bOcc = b.ocupante ? 0 : 1;
      return aOcc - bOcc;
    });

  return (
    <div className="rounded-xl border-2 border-primary bg-card p-4 shadow-md">
      <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
        <div>
          <div className="text-sm font-semibold">Selecionar slot do projeto</div>
          <div className="text-xs text-muted-foreground">
            {empty} aberta{empty !== 1 ? "s" : ""} • {occupied} ocupada{occupied !== 1 ? "s" : ""}
          </div>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-accent">
          <X className="size-4" />
        </button>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por função, fonte ou ocupante..."
            className="w-full h-9 pl-8 pr-3 rounded-md border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="inline-flex rounded-md border bg-background p-0.5 text-xs">
          {(["todas", "abertas", "ocupadas"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1.5 rounded font-medium capitalize transition-colors",
                filter === f ? "bg-primary text-primary-foreground" : "hover:bg-accent"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className="max-h-72 overflow-y-auto space-y-1.5">
        {visible.map((s) => {
          const isEmpty = !s.ocupante;
          return (
            <button
              key={s.id}
              onClick={() => onPick(s)}
              className={cn(
                "w-full text-left rounded-md border-2 p-2.5 transition-all hover:shadow-sm flex items-center gap-3",
                isEmpty
                  ? "border-dashed border-emerald-400/60 bg-emerald-50/40 dark:bg-emerald-950/20 hover:border-emerald-500"
                  : "border-amber-400/50 bg-amber-50/40 dark:bg-amber-950/20 hover:border-amber-500"
              )}
            >
              <span
                className={cn(
                  "size-9 rounded-md flex items-center justify-center shrink-0",
                  isEmpty ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400" : "bg-amber-500/20 text-amber-700 dark:text-amber-400"
                )}
              >
                {isEmpty ? <Plus className="size-4" /> : <UserCircle2 className="size-5" />}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium truncate">{s.funcao}</span>
                  <span
                    className={cn(
                      "text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded",
                      isEmpty ? "bg-emerald-600 text-white" : "bg-amber-600 text-white"
                    )}
                  >
                    {isEmpty ? "Aberta" : "Ocupada"}
                  </span>
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  {s.ch}h/mês • R$ {brl(s.valor)} • {s.vigencia} • {s.fonte}
                </div>
                {s.ocupante && (
                  <div className="text-[11px] mt-0.5">
                    <span className="font-medium">{s.ocupante.nome}</span>
                    <span className="text-muted-foreground"> — restam {s.ocupante.mesesRestantes} {s.ocupante.mesesRestantes === 1 ? "mês" : "meses"}</span>
                  </div>
                )}
              </div>
            </button>
          );
        })}
        {visible.length === 0 && (
          <div className="text-xs text-muted-foreground italic py-4 text-center">
            Nenhuma vaga encontrada com esses filtros.
          </div>
        )}
      </div>
    </div>
  );
}

function InclusionLineCard({
  index,
  line,
  onChangeText,
  onChangeExterno,
  onAttachTalent,
  onDetachTalent,
  onToggleExterno,
  onOpenActivities,
  onRemove,
  onChangeNovoSlot,
}: {
  index: number;
  line: InclusionLine;
  onChangeText: (t: string) => void;
  onChangeExterno: (t: string) => void;
  onAttachTalent: (t: Talent) => void;
  onDetachTalent: () => void;
  onToggleExterno: () => void;
  onOpenActivities: () => void;
  onRemove: () => void;
  onChangeNovoSlot?: (d: NewSlotDraft) => void;
}) {
  const [talentOpen, setTalentOpen] = useState(false);
  const [novoSlotCollapsed, setNovoSlotCollapsed] = useState(false);

  // Constants for inline novo-slot form (kept local to avoid importing the modal)
  const AREAS = ["Engenharia de Software", "Ciência de Dados", "Visão Computacional", "Robótica", "Gestão de Projetos"];
  const CARGOS_BY_AREA: Record<string, string[]> = {
    "Engenharia de Software": ["Desenvolvedor Pleno", "Tech Lead", "Arquiteto de Soluções"],
    "Ciência de Dados": ["Cientista de Dados Jr.", "Cientista de Dados Pleno", "Engenheiro de ML"],
    "Visão Computacional": ["Pesquisador VC Jr.", "Pesquisador VC Pleno"],
    Robótica: ["Engenheiro de Robótica", "Pesquisador em VANTs"],
    "Gestão de Projetos": ["PMO Jr.", "PMO Pleno", "Coordenador Adjunto"],
  };
  const NIVEIS = ["Júnior", "Pleno", "Sênior", "Especialista"];
  const TITULACOES = ["Graduação", "Especialização", "Mestrado", "Doutorado"];

  function getInitials(name: string) {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0) return "";
    const first = parts[0][0] ?? "";
    const last = parts.length > 1 ? parts[parts.length - 1][0] ?? "" : (parts[0][1] ?? "");
    return (first + last).toUpperCase();
  }

  function parseFormacao(formacao: string) {
    const parts = formacao.split(" — ").map((s) => s.trim());
    const institution = parts[1] ?? "";
    const degreeAndCourse = parts[0] ?? formacao;
    let degree = "";
    let course = "";
    const m = degreeAndCourse.match(/^(.*?) em (.*)$/i);
    if (m) {
      degree = m[1].trim();
      course = m[2].trim();
    } else {
      const m2 = degreeAndCourse.match(/^(.*?)[\-–:]\s*(.*)$/);
      if (m2) {
        degree = m2[1].trim();
        course = m2[2].trim();
      } else {
        degree = degreeAndCourse;
      }
    }
    return { degree, course, institution };
  }

  

  const sourceMeta: Record<InclusionLine["source"], { label: string; cls: string }> = {
    "slot-vazio": { label: "Slot vazio", cls: "bg-emerald-600 text-white" },
    "slot-ocupado": { label: "Substituição", cls: "bg-amber-600 text-white" },
    blank: { label: "Em branco", cls: "bg-muted-foreground text-background" },
    "novo-slot": { label: "Novo slot (proposta)", cls: "bg-primary text-primary-foreground" },
  };
  const meta = sourceMeta[line.source];
  const slotInfo =
    line.source === "novo-slot" && line.novoSlot
      ? `${line.novoSlot.cargoFuncao || "Novo cargo"} · ${line.novoSlot.chMensal || "?"}h · ${line.novoSlot.fonte || "?"}`
      : line.slot
        ? `${line.slot.funcao} · ${line.slot.ch}h · R$ ${brl(line.slot.valor)} · ${line.slot.fonte}`
        : "";

  const hasActivities = line.atividades.length > 0;

  return (
    <div className="rounded-xl border-2 border-primary/20 bg-background overflow-hidden">
      {/* Cabeçalho da linha */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 bg-muted/40 border-b">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <span className="size-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0">
            {index}
          </span>
          <span className={cn("text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded", meta.cls)}>
            {meta.label}
          </span>
          {line.talent?.externo && (
            <span className="text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-blue-600 text-white">
              Externo
            </span>
          )}
          {slotInfo && <span className="text-[11px] text-muted-foreground truncate">{slotInfo}</span>}
        </div>
        <button
          onClick={onRemove}
          className="text-muted-foreground hover:text-destructive p-1 rounded hover:bg-destructive/10 transition-colors shrink-0"
          title="Remover este colaborador"
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      <div className="p-3 space-y-3">
        {/* Texto editável principal (mover para cima) */}
        {/* Inline novo-slot form (substitui modal) */}
        {line.source === "novo-slot" && (
          <div className="mt-3 mb-4">
            <button
              type="button"
              onClick={() => setNovoSlotCollapsed((v) => !v)}
              className={cn(
                "group w-full flex items-center gap-4 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/[0.04] via-primary/[0.02] to-transparent px-4 py-3.5 text-sm text-left shadow-sm hover:shadow-md hover:border-primary/40 hover:from-primary/[0.07] transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                novoSlotCollapsed && "border-2 border-blue-400/40 bg-blue-50/40 dark:bg-blue-950/20 from-transparent via-transparent to-transparent rounded-lg shadow-none hover:bg-blue-50/70 dark:hover:bg-blue-950/30 hover:border-blue-400/60 hover:shadow-none",
                !novoSlotCollapsed && "rounded-b-none"
              )}
              aria-expanded={!novoSlotCollapsed}
              title={novoSlotCollapsed ? "Expandir" : "Minimizar"}
            >
              <div
                className={cn(
                  "flex items-center justify-center shrink-0 transition-all duration-300",
                  novoSlotCollapsed
                    ? "size-10 rounded-full bg-blue-100 text-blue-700"
                    : "size-11 rounded-lg bg-primary text-primary-foreground shadow-sm group-hover:scale-105 group-hover:shadow-md"
                )}
              >
                <FileEdit className="size-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className={cn(
                    "truncate transition-colors",
                    novoSlotCollapsed
                      ? "font-medium text-foreground"
                      : "font-semibold text-sm text-foreground group-hover:text-primary"
                  )}
                >
                  {"Proposta de novo slot"}
                </div>
                <div
                  className={cn(
                    "truncate",
                    novoSlotCollapsed
                      ? "text-xs text-muted-foreground"
                      : "text-xs text-muted-foreground mt-0.5 leading-relaxed"
                  )}
                >
                  {(() => {
                    const d = line.novoSlot;
                    const parts: string[] = [];
                    if (d?.cargoFuncao) parts.push(d.cargoFuncao);
                    if (d?.areaCompetencia) parts.push(d.areaCompetencia);
                    if (d?.nivel) parts.push(d.nivel);
                    if (d?.titulacao) parts.push(d.titulacao);
                    if (d?.chMensal) parts.push(`${d.chMensal}h/mês`);
                    if (d?.mesInicio) parts.push(`Início: mês ${d.mesInicio}`);
                    if (d?.duracao) parts.push(`${d.duracao} meses`);
                    if (d?.fonte) parts.push(d.fonte);
                    if (d?.voluntaria) parts.push("Voluntária");
                    else if (d?.chMensal && d?.valorHora)
                      parts.push(`R$ ${brl(Number(d.chMensal) * Number(d.valorHora))}/mês`);
                    return parts.length > 0
                      ? parts.join(" · ")
                      : "Configure os dados do novo slot proposto.";
                  })()}
                </div>
              </div>
              <ChevronDown
                className={cn(
                  "size-5 shrink-0 transition-all duration-300",
                  novoSlotCollapsed
                    ? "-rotate-90 text-muted-foreground"
                    : "text-muted-foreground group-hover:text-primary"
                )}
              />
            </button>
            {!novoSlotCollapsed && (
            <div className="p-3 border border-t-0 border-primary/20 rounded-b-xl bg-background">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-1">Área de Competência <span className="text-destructive">*</span></label>
                <div className="relative">
                  <select
                    value={line.novoSlot?.areaCompetencia ?? ""}
                    onChange={(e) => onChangeNovoSlot?.({ ...(line.novoSlot ?? emptyDraft()), areaCompetencia: e.target.value })}
                    className="appearance-none w-full h-9 rounded-md border bg-background px-2 pr-10 text-sm"
                  >
                  <option value="">Selecione</option>
                  {AREAS.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                  </select>
                  <ChevronDown className="size-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-1">Cargo / Função <span className="text-destructive">*</span></label>
                <div className="relative">
                  <select
                    value={line.novoSlot?.cargoFuncao ?? ""}
                    onChange={(e) => onChangeNovoSlot?.({ ...(line.novoSlot ?? emptyDraft()), cargoFuncao: e.target.value })}
                    className="appearance-none w-full h-9 rounded-md border bg-background px-2 pr-10 text-sm"
                  >
                    <option value="">Selecione</option>
                    {(CARGOS_BY_AREA[line.novoSlot?.areaCompetencia || ""] ?? []).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <ChevronDown className="size-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-1">Nível de Maturidade em Carreira <span className="text-destructive">*</span></label>
                <div className="relative">
                  <select
                    value={line.novoSlot?.nivel ?? ""}
                    onChange={(e) => onChangeNovoSlot?.({ ...(line.novoSlot ?? emptyDraft()), nivel: e.target.value })}
                    className="appearance-none w-full h-9 rounded-md border bg-background px-2 pr-10 text-sm"
                  >
                    <option value="">Selecione</option>
                    {NIVEIS.map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                  <ChevronDown className="size-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-1">Titulação Mínima <span className="text-destructive">*</span></label>
                <div className="relative">
                  <select
                    value={line.novoSlot?.titulacao ?? ""}
                    onChange={(e) => onChangeNovoSlot?.({ ...(line.novoSlot ?? emptyDraft()), titulacao: e.target.value })}
                    className="appearance-none w-full h-9 rounded-md border bg-background px-2 pr-10 text-sm"
                  >
                    <option value="">Selecione</option>
                    {TITULACOES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <ChevronDown className="size-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-1">Carga Horária Mensal <span className="text-destructive">*</span></label>
                <input
                  value={line.novoSlot?.chMensal ?? ""}
                  onChange={(e) => onChangeNovoSlot?.({ ...(line.novoSlot ?? emptyDraft()), chMensal: e.target.value })}
                  placeholder="ex: 50"
                  className="w-full h-9 rounded-md border bg-background px-2 text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-1">Mês de Início <span className="text-destructive">*</span></label>
                <input
                  value={line.novoSlot?.mesInicio ?? ""}
                  onChange={(e) => onChangeNovoSlot?.({ ...(line.novoSlot ?? emptyDraft()), mesInicio: e.target.value })}
                  placeholder="ex: 1"
                  className="w-full h-9 rounded-md border bg-background px-2 text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-1">Duração (meses) <span className="text-destructive">*</span></label>
                <input
                  value={line.novoSlot?.duracao ?? ""}
                  onChange={(e) => onChangeNovoSlot?.({ ...(line.novoSlot ?? emptyDraft()), duracao: e.target.value })}
                  placeholder="ex: 6"
                  className="w-full h-9 rounded-md border bg-background px-2 text-sm"
                />
              </div>

            {/* Voluntária + Valor/Hora (slider) + bolsa estimada: checkbox em linha, slider abaixo (full-width) */}
            <div className="sm:col-span-3 mt-3 space-y-3">
              <div className="flex items-center gap-2 mb-8">
                <input
                  id={`voluntaria-${line.id}`}
                  type="checkbox"
                  checked={Boolean(line.novoSlot?.voluntaria)}
                  onChange={(e) => onChangeNovoSlot?.({ ...(line.novoSlot ?? emptyDraft()), voluntaria: e.target.checked })}
                  className="size-4 rounded border-input"
                />
                <label htmlFor={`voluntaria-${line.id}`} className="text-sm">Participação voluntária</label>
              </div>

              {line.novoSlot?.voluntaria && (
                <div className="rounded-lg border border-blue-200 p-4 bg-blue-50/40 flex flex-col items-center gap-2">
                  <Handshake className="size-8 text-primary" />
                  <div className="text-sm text-muted-foreground">nenhuma remuneração associada a esse slot</div>
                </div>
              )}

              {/* Slider + estimativa só aparecem quando NÃO for voluntária */}
              {!line.novoSlot?.voluntaria && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-0.5">Valor/Hora <span className="text-destructive">*</span></label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="flex-1">
                      <input
                        type="range"
                        min={20}
                        max={200}
                        step={5}
                        value={line.novoSlot?.valorHora ?? 20}
                        onChange={(e) => onChangeNovoSlot?.({ ...(line.novoSlot ?? emptyDraft()), valorHora: Number(e.target.value) })}
                        className="w-full accent-primary"
                      />
                      <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
                        <span>R$ 20,00 - R$ 200,00</span>
                        <span className="text-primary font-medium">Selecionado: R$ {(Number(line.novoSlot?.valorHora ?? 20)).toFixed(2).replace('.', ',')}</span>
                      </div>
                    </div>

                    <div className="flex-shrink-0 w-full sm:w-40">
                      <div className="rounded-lg bg-primary text-primary-foreground p-2 flex flex-col items-center justify-center text-center">
                        <span className="text-[10px] uppercase tracking-wider opacity-90">Bolsa Mensal Estimada</span>
                        <span className="text-base font-bold">R$ {(() => {
                          const ch = Number(line.novoSlot?.chMensal || 0);
                          const vh = Number(line.novoSlot?.valorHora || 0);
                          const val = ch * vh;
                          return brl(val);
                        })()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            </div>
          </div>
            )}
          </div>
        )}

        {/* Botão de buscar no banco de talentos (esconde quando já houver talento) */}
        <div>
          {!line.talent && (
            <>
              <button
                onClick={() => setTalentOpen(true)}
                className="group w-full mt-2 text-left inline-flex items-center gap-4 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/[0.04] via-primary/[0.02] to-transparent px-4 py-3.5 text-sm shadow-sm hover:shadow-md hover:border-primary/40 hover:from-primary/[0.07] transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex items-center justify-center size-11 rounded-lg bg-primary text-primary-foreground shrink-0 shadow-sm group-hover:scale-105 group-hover:shadow-md transition-all duration-300">
                  <Search className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">Buscar no Banco de Talentos</div>
                  <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">Sugestão da IA ou busca manual.</div>
                </div>
                <ChevronRight className="size-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-300 shrink-0" />
              </button>
            </>
          )}

          {talentOpen && (
            <TalentPickerModal
              open={talentOpen}
              onClose={() => setTalentOpen(false)}
              roleTitle={line.slot?.funcao || line.novoSlot?.cargoFuncao || "Colaborador"}
              onSelect={(t) => {
                onAttachTalent(t);
                setTalentOpen(false);
              }}
            />
          )}

          {/* Se houver talento anexado, mostrar cartão reduzido abaixo (sem o botão de busca) */}
          {line.talent && (
            <div className="mt-3 flex items-center gap-3 rounded-lg border-2 border-blue-400/40 bg-blue-50/40 px-4 py-3 text-sm">
              <div className="flex items-center justify-center size-10 rounded-full bg-blue-100 text-blue-700 shrink-0 font-semibold">
                {getInitials(line.talent.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{line.talent.name}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {(() => {
                    const p = parseFormacao(line.talent.formacao || "");
                    const parts = [] as string[];
                    if (p.degree) parts.push(p.degree);
                    if (p.course && p.course !== p.degree) parts.push(p.course);
                    if (p.institution) parts.push(p.institution);
                    const edu = parts.join(" · ");
                    return `${line.talent.vinculo}${edu ? ` · ${edu}` : ""} · ${line.talent.cpf}`;
                  })()}
                </div>
              </div>
              <button
                onClick={onDetachTalent}
                className="rounded-full p-1 text-muted-foreground hover:bg-muted/10 transition duration-150 ease-out transform hover:scale-105 motion-reduce:transform-none"
                title="Remover"
              >
                <X className="size-4" />
              </button>
            </div>
          )}
        </div>

        {/* Externo: linha única editável */}
        {line.externoText !== undefined && (
          <div className="rounded-md border-2 border-blue-400/40 bg-blue-50/40 dark:bg-blue-950/20 p-3">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <label className="text-[11px] uppercase tracking-wider font-bold text-blue-700 dark:text-blue-400">
                Colaborador externo — justificativa para FUNAPE
              </label>
              {!line.talent?.externo && (
                <button
                  onClick={onToggleExterno}
                  className="rounded-full p-1 text-muted-foreground hover:bg-muted/10 transition duration-150 ease-out transform hover:scale-105 motion-reduce:transform-none"
                  title="Remover"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
            <HighlightedTextarea
              value={line.externoText || ""}
              onChange={(v) => onChangeExterno(v)}
              rows={2}
              placeholder="Nome — Formação acadêmica. Qualificação relacionada às atividades do projeto."
              highlightClass="px-1 rounded bg-blue-100 text-blue-800"
            />
          </div>
        )}

        {/* Toggle externo manual como botão em largura total com descrição */}
        {line.externoText === undefined && !line.talent?.externo && (
          <div>
            <button
              onClick={onToggleExterno}
              className="group w-full mt-1 text-left inline-flex items-center gap-4 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/[0.04] via-primary/[0.02] to-transparent px-4 py-3.5 text-sm shadow-sm hover:shadow-md hover:border-primary/40 hover:from-primary/[0.07] transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="flex items-center justify-center size-11 rounded-lg bg-primary text-primary-foreground shrink-0 shadow-sm group-hover:scale-105 group-hover:shadow-md transition-all duration-300">
                <UserCheck className="size-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">Marcar como colaborador externo</div>
                <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">Adicione o bloco de justificativa exigido pela FUNAPE.</div>
              </div>
              <ChevronRight className="size-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-300 shrink-0" />
            </button>
          </div>
        )}

        <div className="pt-3">
          <label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground block mb-1">
            Descrição da inclusão
          </label>
          <HighlightedTextarea value={line.text} onChange={(v) => onChangeText(v)} rows={3} />
        </div>

        {/* Atividades */}
        <div
          className={cn(
            "rounded-md border p-2.5 flex items-center justify-between gap-2 flex-wrap",
            hasActivities ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300/50" : "bg-amber-50 dark:bg-amber-950/20 border-amber-300/50"
          )}
        >
          <div className="flex items-center gap-2 min-w-0">
            <ListChecks className={cn("size-4 shrink-0", hasActivities ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400")} />
            <div className="text-xs">
              <span className="font-semibold">Lista de atividades</span>
              <span className="text-muted-foreground">
                {hasActivities
                  ? ` — ${line.atividades.length} cadastrada${line.atividades.length > 1 ? "s" : ""}`
                  : " — obrigatória antes da aprovação"}
              </span>
            </div>
          </div>
          <button
            onClick={onOpenActivities}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
              hasActivities
                ? "border bg-background hover:bg-accent"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
          >
            {hasActivities ? "Editar atividades" : "Definir atividades"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============= Talent search compacto inline =============

function TalentInlineSearch({ onPick }: { onPick: (t: Talent) => void }) {
  const [q, setQ] = useState("");
  const list = q.trim()
    ? TALENTS.filter(
        (t) =>
          t.name.toLowerCase().includes(q.toLowerCase()) ||
          t.cpf.includes(q) ||
          t.email.toLowerCase().includes(q.toLowerCase()) ||
          t.formacao.toLowerCase().includes(q.toLowerCase())
      )
    : TALENTS.slice(0, 5);
  return (
    <div className="rounded-md border bg-card p-2">
      <div className="relative mb-2">
        <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nome, CPF, e-mail ou formação..."
          className="w-full h-8 pl-8 pr-3 rounded-md border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div className="max-h-56 overflow-auto space-y-1">
        {list.map((t) => (
          <button
            key={t.id}
            onClick={() => onPick(t)}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-accent text-left"
          >
            <UserCircle2 className="size-7 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium truncate flex items-center gap-1.5">
                {t.name}
                {t.externo && (
                  <span className="text-[9px] uppercase font-bold px-1 py-0.5 rounded bg-blue-600 text-white">
                    Externo
                  </span>
                )}
              </div>
              <div className="text-[10px] text-muted-foreground truncate">
                {t.vinculo} • {t.cpf} • {t.formacao}
              </div>
            </div>
            <Plus className="size-3.5 text-primary shrink-0" />
          </button>
        ))}
        {list.length === 0 && (
          <div className="text-[11px] text-muted-foreground italic text-center py-2">Nenhum talento encontrado.</div>
        )}
      </div>
    </div>
  );
}

// ============= Modal de atividades (reutilizado / simplificado) =============

const SUGESTAO_IA = [
  "Revisar e refinar o modelo de classificação para melhorar a precisão",
  "Desenvolver e implementar uma solução de processamento de imagens",
  "Treinar e ajustar um modelo de visão computacional",
  "Conduzir análise exploratória de dados (EDA) do dataset do projeto",
  "Documentar arquitetura e fluxos para entrega da macroentrega",
];

function ActivitiesDialog({
  initial,
  onClose,
  onSave,
}: {
  initial: string[];
  onClose: () => void;
  onSave: (list: string[]) => void;
}) {
  const [list, setList] = useState<string[]>(initial);

  function update(i: number, v: string) {
    setList((p) => p.map((x, idx) => (idx === i ? v : x)));
  }
  function remove(i: number) {
    setList((p) => p.filter((_, idx) => idx !== i));
  }
  function add() {
    setList((p) => [...p, `Atividade ${p.length + 1}`]);
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-5 border-b">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-primary-soft text-primary flex items-center justify-center">
              <ListChecks className="size-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base">Lista de atividades do colaborador</h3>
              <p className="text-xs text-muted-foreground">
                Obrigatória antes da aprovação. Edite, use sugestão de IA ou adicione manualmente.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-muted">
            <X className="size-4" />
          </button>
        </div>

        <div className="p-5 space-y-2">
          {list.length === 0 && (
            <div className="rounded-lg border border-dashed p-6 text-center text-xs text-muted-foreground">
              Nenhuma atividade ainda. Use "Sugestão IA" ou "Adicionar Atividade".
            </div>
          )}
          {list.map((a, i) => (
            <div key={i} className="flex items-center gap-2 rounded-lg bg-primary-soft/40 px-3 py-2 group">
              <span className="size-7 shrink-0 rounded-full bg-background text-primary text-xs font-bold flex items-center justify-center border border-primary/30">
                {i + 1}
              </span>
              <input
                value={a}
                onChange={(e) => update(i, e.target.value)}
                className="flex-1 bg-transparent text-sm focus:outline-none"
              />
              <button
                onClick={() => remove(i)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}

          <button
            onClick={add}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground py-2.5 text-sm font-semibold hover:bg-primary/90"
          >
            <Plus className="size-4" /> Adicionar Atividade
          </button>
        </div>

        <div className="flex items-center justify-between gap-2 px-5 py-4 border-t bg-muted/20 rounded-b-2xl">
          <button
            onClick={() => setList(SUGESTAO_IA)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:bg-primary/90 shadow-sm"
          >
            <Sparkles className="size-4" /> Sugestão IA
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setList([])}
              className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:bg-primary/90 shadow-sm"
            >
              <RotateCcw className="size-4" /> Limpar
            </button>
            <button
              onClick={() => onSave(list)}
              className="inline-flex items-center gap-2 rounded-lg bg-[color:var(--status-approved)] text-white px-4 py-2 text-sm font-semibold hover:opacity-90 shadow-sm"
            >
              <CheckCircle2 className="size-4" /> Salvar atividades
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

