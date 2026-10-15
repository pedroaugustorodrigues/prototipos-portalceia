import { useMemo, useState } from "react";
import { UserCircle2, Clock, Wallet, Search } from "lucide-react";
import { useBolsaSlots, type BolsaSlot } from "@/lib/ptr-data";

/**
 * Lista compacta de colaboradores alocados no projeto, com busca por nome/função.
 * Usado por seções como Ajuste de Valor, Prorrogação, Redução, CH e Anulação.
 */
export function ParticipantPicker({
  projectId,
  onPick,
}: {
  projectId: string;
  onPick: (slot: BolsaSlot) => void;
}) {
  const [query, setQuery] = useState("");
  const allSlots = useBolsaSlots();
  const occupied = useMemo(
    () => allSlots.filter((s) => s.projectId === projectId && s.ocupante),
    [allSlots, projectId]
  );
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return occupied;
    return occupied.filter(
      (s) =>
        s.ocupante!.nome.toLowerCase().includes(q) ||
        s.funcao.toLowerCase().includes(q) ||
        s.fonte.toLowerCase().includes(q)
    );
  }, [occupied, query]);

  return (
    <div className="rounded-lg border bg-background p-3 mb-4">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="text-sm font-medium">Colaboradores alocados</div>
        <span className="text-xs text-muted-foreground">{occupied.length} no projeto</span>
      </div>
      <p className="text-xs text-muted-foreground mb-2">
        Clique em um colaborador para adicionar uma linha pré-preenchida com os dados dele.
      </p>
      {occupied.length === 0 ? (
        <div className="text-xs text-muted-foreground italic">
          Nenhum colaborador alocado neste projeto no momento.
        </div>
      ) : (
        <>
          <div className="relative mb-2">
            <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar colaborador por nome ou função..."
              className="w-full h-9 pl-8 pr-3 rounded-md border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="max-h-64 overflow-y-auto pr-1 -mr-1 space-y-1.5">
            {visible.map((s) => (
              <button
                key={s.id}
                onClick={() => onPick(s)}
                className="w-full text-left rounded-md border p-2.5 hover:border-primary hover:bg-primary-soft/30 transition-all bg-card flex items-center gap-3"
              >
                <UserCircle2 className="size-9 text-muted-foreground shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{s.ocupante!.nome}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{s.funcao} • {s.fonte}</div>
                  <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><Clock className="size-3" /> {s.ch}h/mês</span>
                    <span className="inline-flex items-center gap-1"><Wallet className="size-3" /> R$ {s.valor.toLocaleString("pt-BR")}</span>
                    <span>• restam <strong className="text-foreground">{s.ocupante!.mesesRestantes}</strong> {s.ocupante!.mesesRestantes === 1 ? "mês" : "meses"}</span>
                  </div>
                </div>
              </button>
            ))}
            {visible.length === 0 && (
              <div className="text-xs text-muted-foreground italic py-3 text-center">
                Nenhum colaborador encontrado.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
