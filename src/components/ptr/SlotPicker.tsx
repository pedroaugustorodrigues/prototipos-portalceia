import { useMemo, useState } from "react";
import { UserCircle2, Plus, AlertTriangle, Clock, Wallet, CalendarRange, X, Search } from "lucide-react";
import { useBolsaSlots, type BolsaSlot } from "@/lib/ptr-data";
import { cn } from "@/lib/utils";

/**
 * Mostra os slots de bolsa do projeto. Filtro de busca e tabs de status
 * para escalar quando o projeto tem muitos slots.
 */
export function SlotPicker({
  projectId,
  onPickEmpty,
  onPickOccupied,
}: {
  projectId: string;
  onPickEmpty: (slot: BolsaSlot) => void;
  onPickOccupied: (slot: BolsaSlot) => void;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"todas" | "abertas" | "ocupadas">("todas");

  const allSlots = useBolsaSlots();
  const all = useMemo(() => allSlots.filter((s) => s.projectId === projectId), [allSlots, projectId]);
  const empty = all.filter((s) => !s.ocupante).length;
  const occupied = all.length - empty;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter((s) => {
      if (filter === "abertas" && s.ocupante) return false;
      if (filter === "ocupadas" && !s.ocupante) return false;
      if (!q) return true;
      return (
        s.funcao.toLowerCase().includes(q) ||
        s.fonte.toLowerCase().includes(q) ||
        s.ocupante?.nome.toLowerCase().includes(q)
      );
    });
  }, [all, filter, query]);

  return (
    <div className="rounded-lg border bg-background p-3 mb-4">
      <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
        <div className="text-sm font-medium">Vagas do projeto (slots de bolsa)</div>
        <div className="text-xs text-muted-foreground">
          {empty} aberta{empty !== 1 ? "s" : ""} • {occupied} ocupada{occupied !== 1 ? "s" : ""}
        </div>
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
        <div className="inline-flex rounded-md border bg-card p-0.5 text-xs">
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

      <div className="max-h-72 overflow-y-auto pr-1 -mr-1 space-y-1.5">
        {visible.map((s) => {
          const isEmpty = !s.ocupante;
          return (
            <button
              key={s.id}
              onClick={() => (isEmpty ? onPickEmpty(s) : onPickOccupied(s))}
              className={cn(
                "w-full text-left rounded-md border p-2.5 transition-all hover:shadow-sm flex items-center gap-3",
                isEmpty
                  ? "border-dashed border-primary/40 bg-primary-soft/30 hover:border-primary"
                  : "border-amber-400/40 bg-amber-50/40 dark:bg-amber-950/20 hover:border-amber-500"
              )}
            >
              <span
                className={cn(
                  "size-9 rounded-md flex items-center justify-center shrink-0",
                  isEmpty ? "bg-primary/15 text-primary" : "bg-amber-500/20 text-amber-700 dark:text-amber-400"
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
                      isEmpty ? "bg-primary text-primary-foreground" : "bg-amber-500 text-white"
                    )}
                  >
                    {isEmpty ? "Aberta" : "Ocupada"}
                  </span>
                </div>
                <div className="text-[11px] text-muted-foreground flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                  <span className="inline-flex items-center gap-1"><Clock className="size-3" /> {s.ch}h/mês</span>
                  <span className="inline-flex items-center gap-1"><Wallet className="size-3" /> R$ {s.valor.toLocaleString("pt-BR")}</span>
                  <span className="inline-flex items-center gap-1"><CalendarRange className="size-3" /> {s.vigencia}</span>
                  <span>• {s.fonte}</span>
                </div>
                {s.ocupante && (
                  <div className="text-[11px] mt-0.5">
                    <span className="font-medium">{s.ocupante.nome}</span>
                    <span className="text-muted-foreground"> — restam </span>
                    <strong>{s.ocupante.mesesRestantes}</strong>
                    <span className="text-muted-foreground"> {s.ocupante.mesesRestantes === 1 ? "mês" : "meses"}</span>
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

/** Aviso modal-inline para slot ocupado. */
export function OccupiedSlotWarning({
  slot,
  onConfirm,
  onCancel,
}: {
  slot: BolsaSlot;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!slot.ocupante) return null;
  return (
    <div className="rounded-lg border-2 border-amber-400 bg-amber-50 dark:bg-amber-950/30 p-4 mb-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="size-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm">Esta vaga já está ocupada</div>
          <p className="text-xs text-muted-foreground mt-1">
            A vaga <strong>{slot.funcao}</strong> está alocada para{" "}
            <strong>{slot.ocupante.nome}</strong> (restam {slot.ocupante.mesesRestantes} meses de bolsa).
            Para incluir um novo colaborador nesta vaga, é necessário fazer o{" "}
            <strong>distrato/anulação da bolsa atual em conjunto com a substituição</strong>.
            Lembre-se de também ativar a seção <em>"Redução de Vigência (distrato)"</em>.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={onConfirm}
              className="inline-flex items-center gap-1.5 rounded-md bg-amber-600 text-white px-3 py-1.5 text-xs font-semibold hover:bg-amber-700"
            >
              Entendi, prosseguir com substituição
            </button>
            <button
              onClick={onCancel}
              className="inline-flex items-center gap-1.5 rounded-md border bg-background px-3 py-1.5 text-xs font-medium hover:bg-accent"
            >
              <X className="size-3" /> Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
