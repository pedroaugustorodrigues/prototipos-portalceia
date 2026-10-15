import { useState } from "react";
import { X, Sparkles, Plus, Trash2, ListChecks, RotateCcw, CheckCircle2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Modal de proposta de criação de novo slot. Espelha o formulário institucional
 * (Área de Competência, Cargo/Função, Nível, Titulação Mínima, CH, etc.)
 * e inclui o botão "Lista de Atividades" para descrever as atividades do slot.
 */
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
const FONTES = ["EMBRAPII", "SEBRAE", "EMPRESA", "CEIA", "FUNAPE"];

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

export type ActivityListOption = {
  id: string;
  cargo: string;
  nome?: string;
  atividades: string[];
};

export function NewSlotDialog({
  open,
  onClose,
  onSave,
  activityListOptions,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (draft: NewSlotDraft) => void;
  activityListOptions?: ActivityListOption[];
}) {
  const [draft, setDraft] = useState<NewSlotDraft>(emptyDraft);
  const [activitiesOpen, setActivitiesOpen] = useState(false);
  const [selectedListId, setSelectedListId] = useState<string>("");
  const selectorMode = !!activityListOptions && activityListOptions.length > 0;
  const selectedList = selectorMode
    ? activityListOptions!.find((o) => o.id === selectedListId)
    : undefined;

  if (!open) return null;

  const bolsaEstimada = draft.voluntaria
    ? 0
    : Number(draft.chMensal || 0) * draft.valorHora;

  const cargos = draft.areaCompetencia ? CARGOS_BY_AREA[draft.areaCompetencia] ?? [] : [];

  function set<K extends keyof NewSlotDraft>(k: K, v: NewSlotDraft[K]) {
    setDraft((d) => ({ ...d, [k]: v }));
  }

  function handleSave() {
    onSave(draft);
    setDraft(emptyDraft());
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-5 border-b">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-primary-soft text-primary flex items-center justify-center">
              <Plus className="size-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base">Propor criação de novo slot</h3>
              <p className="text-xs text-muted-foreground">
                Defina o perfil da nova vaga. Após enviar, a proposta segue para análise junto com a solicitação.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-muted">
            <X className="size-4" />
          </button>
        </div>

        <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Área de Competência" required>
            <Select value={draft.areaCompetencia} onChange={(v) => set("areaCompetencia", v)} options={AREAS} placeholder="Selecione" />
          </Field>
          <Field label="Cargo / Função" required>
            <Select
              value={draft.cargoFuncao}
              onChange={(v) => set("cargoFuncao", v)}
              options={cargos}
              placeholder={cargos.length ? "Selecione" : "Selecione uma área primeiro"}
              disabled={!cargos.length}
            />
          </Field>
          <Field label="Nível de Maturidade em Carreira" required>
            <Select value={draft.nivel} onChange={(v) => set("nivel", v)} options={NIVEIS} placeholder="Selecione" />
          </Field>

          <Field label="Titulação Mínima" required>
            <Select value={draft.titulacao} onChange={(v) => set("titulacao", v)} options={TITULACOES} placeholder="Selecione" />
          </Field>
          <Field label="Carga Horária Mensal" required>
            <input
              value={draft.chMensal}
              onChange={(e) => set("chMensal", e.target.value)}
              placeholder="ex: 40"
              className="w-full h-10 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </Field>
          <Field label="Mês de Início" required>
            <input
              value={draft.mesInicio}
              onChange={(e) => set("mesInicio", e.target.value)}
              placeholder="ex: 1"
              className="w-full h-10 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </Field>

          <Field label="Duração (meses)" required>
            <input
              value={draft.duracao}
              onChange={(e) => set("duracao", e.target.value)}
              placeholder="ex: 6"
              className="w-full h-10 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </Field>

          <div className="sm:col-span-3 flex items-center gap-2">
            <input
              id="voluntaria"
              type="checkbox"
              checked={draft.voluntaria}
              onChange={(e) => set("voluntaria", e.target.checked)}
              className="size-4 rounded border-input"
            />
            <label htmlFor="voluntaria" className="text-sm">Participação voluntária</label>
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-muted-foreground block mb-2">Valor/Hora *</label>
            <input
              type="range"
              min={20}
              max={200}
              step={5}
              value={draft.valorHora}
              onChange={(e) => set("valorHora", Number(e.target.value))}
              disabled={draft.voluntaria}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
              <span>R$ 20,00 - R$ 200,00</span>
              <span className="text-primary font-medium">Selecionado: R$ {draft.valorHora.toFixed(2).replace(".", ",")}</span>
            </div>
          </div>
          <div className="rounded-lg bg-primary text-primary-foreground p-3 flex flex-col items-center justify-center text-center">
            <span className="text-[11px] uppercase tracking-wider opacity-90">Bolsa Mensal Estimada</span>
            <span className="text-lg font-bold">R$ {bolsaEstimada.toFixed(2).replace(".", ",")}</span>
          </div>
        </div>

        <div className="px-5 pb-5">
          {selectorMode ? (
            <div className="rounded-lg border bg-muted/30 p-3 space-y-3">
              <div className="flex items-center gap-2">
                <ListChecks className="size-4 text-primary" />
                <div className="text-sm">
                  <div className="font-medium">Lista de Atividades</div>
                  <div className="text-xs text-muted-foreground">
                    Selecione qual lista de atividades deve ser vinculada a este slot.
                    O cargo correspondente é exibido em cada opção.
                  </div>
                </div>
              </div>

              <div className="relative">
                <select
                  value={selectedListId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setSelectedListId(id);
                    const opt = activityListOptions!.find((o) => o.id === id);
                    set("atividades", opt?.atividades ?? []);
                  }}
                  className={cn(
                    "w-full h-10 rounded-md border bg-background pl-3 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-ring appearance-none",
                    !selectedListId && "text-muted-foreground"
                  )}
                >
                  <option value="">Selecione a lista de atividades</option>
                  {activityListOptions!.map((o) => (
                    <option key={o.id} value={o.id} className="text-foreground">
                      {o.cargo}
                      {o.nome ? ` — ${o.nome}` : ""}
                      {` (${o.atividades.length} atividade${o.atividades.length === 1 ? "" : "s"})`}
                    </option>
                  ))}
                </select>
                <ChevronDown className="size-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>

              {selectedList && (
                <div className="rounded-md border bg-background p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center rounded-full bg-primary-soft text-primary px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider">
                        {selectedList.cargo}
                      </span>
                      {selectedList.nome && (
                        <span className="text-sm font-medium">{selectedList.nome}</span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {selectedList.atividades.length} atividade
                      {selectedList.atividades.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  {selectedList.atividades.length > 0 && (
                    <ul className="list-disc pl-5 text-xs text-muted-foreground space-y-1 max-h-40 overflow-y-auto">
                      {selectedList.atividades.map((a, i) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-lg border bg-muted/30 p-3 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <ListChecks className="size-4 text-primary" />
                <div className="text-sm">
                  <div className="font-medium">Lista de Atividades</div>
                  <div className="text-xs text-muted-foreground">
                    {draft.atividades.length > 0
                      ? `${draft.atividades.length} atividade${draft.atividades.length > 1 ? "s" : ""} cadastrada${draft.atividades.length > 1 ? "s" : ""}`
                      : "Nenhuma atividade ainda."}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setActivitiesOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-md border bg-background px-3 py-1.5 text-xs font-semibold hover:bg-accent"
              >
                <ListChecks className="size-3.5" /> {draft.atividades.length ? "Editar atividades" : "Abrir lista de atividades"}
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t bg-muted/20 rounded-b-2xl">
          <button onClick={onClose} className="rounded-md border-2 border-primary text-primary px-4 py-2 text-sm font-semibold hover:bg-primary-soft">
            Cancelar
          </button>
          <button onClick={handleSave} className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:bg-primary/90">
            Salvar proposta
          </button>
        </div>
      </div>

      {activitiesOpen && (
        <ActivitiesDialog
          initial={draft.atividades}
          onClose={() => setActivitiesOpen(false)}
          onSave={(list) => {
            set("atividades", list);
            setActivitiesOpen(false);
          }}
        />
      )}
    </div>
  );
}

/* -------- Subcomponents -------- */

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium block mb-1.5 text-muted-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      {children}
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
  placeholder,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={cn(
        "w-full h-10 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed",
        !value && "text-muted-foreground"
      )}
    >
      <option value="">{placeholder ?? "Selecione"}</option>
      {options.map((o) => (
        <option key={o} value={o} className="text-foreground">
          {o}
        </option>
      ))}
    </select>
  );
}

/* -------- Modal Lista de Atividades (sugestão IA mock) -------- */

const SUGESTAO_IA = [
  "Revisar e refinar o modelo de classificação para melhorar a precisão em Módulo 0",
  "Desenvolver e implementar uma solução de processamento de imagens para otimizar o tempo de processamento",
  "Treinar e ajustar um modelo de visão computacional para melhorar a precisão em detecção de objetos",
  "Desenvolver e implementar uma solução de análise exploratória de dados (EDA) para identificar padrões e tendências",
  "Revisar e refinar a arquitetura do modelo de machine learning para melhorar a escalabilidade e a eficiência",
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
  const [list, setList] = useState<string[]>(initial.length ? initial : []);

  function update(i: number, v: string) {
    setList((prev) => prev.map((x, idx) => (idx === i ? v : x)));
  }
  function remove(i: number) {
    setList((prev) => prev.filter((_, idx) => idx !== i));
  }
  function add() {
    setList((prev) => [...prev, `Atividade ${prev.length + 1}`]);
  }
  function applyIA() {
    setList(SUGESTAO_IA);
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
              <h3 className="font-semibold text-base">Descrição das atividades</h3>
              <p className="text-xs text-muted-foreground">
                Edite o texto diretamente, use a sugestão de IA ou adicione manualmente.
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
            onClick={applyIA}
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
              className="inline-flex items-center gap-1.5 rounded-md bg-[color:var(--status-approved)] text-[color:var(--status-approved-fg)] px-4 py-2 text-xs font-semibold hover:opacity-90"
            >
              <CheckCircle2 className="size-3.5" /> Aprovar Atividades
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}