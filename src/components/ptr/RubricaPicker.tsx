import { useState } from "react";
import { Coins, ChevronDown, ChevronRight } from "lucide-react";
import { RUBRICAS_TREE, type RubricaSelection } from "@/lib/ptr-data";
import { cn } from "@/lib/utils";

/**
 * Seletor hierárquico de rubricas. O usuário pode selecionar uma rubrica
 * inteira (todo o bloco) ou uma subrubrica específica dentro dela.
 */
export function RubricaPicker({ onPick }: { onPick: (sel: RubricaSelection) => void }) {
  const [open, setOpen] = useState<Record<string, boolean>>({});

  function toggle(r: string) {
    setOpen((prev) => ({ ...prev, [r]: !prev[r] }));
  }

  return (
    <div className="rounded-lg border bg-background p-3 mb-4">
      <div className="flex items-center gap-2 mb-2">
        <Coins className="size-4 text-primary" />
        <div className="text-sm font-medium">Rubricas do projeto</div>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Clique na rubrica para selecioná-la inteira, ou expanda para escolher uma subrubrica específica.
      </p>
      <div className="space-y-1.5">
        {RUBRICAS_TREE.map((node) => {
          const expanded = !!open[node.rubrica];
          return (
            <div key={node.rubrica} className="rounded-md border bg-card overflow-hidden">
              <div className="flex items-stretch">
                <button
                  onClick={() => toggle(node.rubrica)}
                  className="px-2 hover:bg-accent transition-colors border-r flex items-center"
                  title={expanded ? "Recolher subrubricas" : "Expandir subrubricas"}
                >
                  {expanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                </button>
                <button
                  onClick={() =>
                    onPick({ rubrica: node.rubrica, label: node.rubrica })
                  }
                  className="flex-1 text-left px-3 py-2 text-xs font-medium hover:bg-primary-soft transition-colors flex items-center gap-2"
                >
                  <Coins className="size-3 text-primary" />
                  {node.rubrica}
                  <span className="text-[10px] text-muted-foreground ml-auto">
                    {node.subrubricas.length} subrubrica{node.subrubricas.length !== 1 ? "s" : ""}
                  </span>
                </button>
              </div>
              {expanded && (
                <div className="border-t bg-muted/30 divide-y">
                  {node.subrubricas.map((sub) => (
                    <button
                      key={sub}
                      onClick={() =>
                        onPick({ rubrica: node.rubrica, subrubrica: sub, label: sub })
                      }
                      className={cn(
                        "w-full text-left px-9 py-1.5 text-xs hover:bg-primary-soft hover:text-primary transition-colors"
                      )}
                    >
                      ↳ {sub}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
