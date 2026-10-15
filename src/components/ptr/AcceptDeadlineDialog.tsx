import { useEffect, useState } from "react";
import { CalendarClock, X, AlertTriangle } from "lucide-react";
import type { Project } from "@/lib/ptr-data";

export function AcceptDeadlineDialog({
  project,
  onClose,
  onAccept,
}: {
  project: Project | null;
  onClose: () => void;
  onAccept: (p: Project) => void;
}) {
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    if (project) setAccepted(false);
  }, [project]);

  if (!project) return null;

  const today = new Date();
  const day = today.getDate();
  const isAfterDeadline = day > 10;
  const monthName = today.toLocaleDateString("pt-BR", { month: "long" });
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1).toLocaleDateString("pt-BR", { month: "long" });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-sm" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl bg-background shadow-2xl overflow-hidden"
      >
        <div className="flex items-start justify-between p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-xl bg-primary-soft flex items-center justify-center text-primary">
              <CalendarClock className="size-6" />
            </div>
            <div>
              <h2 className="font-semibold text-lg leading-tight">Aceite do prazo — Dia 10</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{project.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground rounded-md p-1 hover:bg-accent">
            <X className="size-4" />
          </button>
        </div>

        <div className="px-6 pb-2 text-sm text-muted-foreground space-y-3">
          <p>
            Solicitações de ajuste de PTR enviadas <strong className="text-foreground">até o dia 10</strong> de cada mês entram em vigência no <strong className="text-foreground">próprio mês</strong>. Após essa data, o ajuste vigora apenas no mês seguinte.
          </p>

          {isAfterDeadline ? (
            <div className="flex items-start gap-2 rounded-lg border border-[color:var(--status-pending)] bg-[color:color-mix(in_oklab,var(--status-pending)_15%,transparent)] p-3 text-[color:var(--status-pending-fg)]">
              <AlertTriangle className="size-4 mt-0.5 shrink-0" />
              <div className="text-sm">
                Hoje é dia <strong>{day}</strong>. Sua solicitação será implementada apenas em <strong className="capitalize">{nextMonth}</strong>.
              </div>
            </div>
          ) : (
            <div className="rounded-lg border bg-primary-soft p-3 text-sm text-foreground">
              Você está dentro do prazo. Solicitação válida para <strong className="capitalize">{monthName}</strong>.
            </div>
          )}
        </div>

        <label className="flex items-start gap-3 mx-6 my-4 p-4 rounded-lg border cursor-pointer hover:bg-accent/40 transition-colors">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-0.5 size-4 accent-[color:var(--primary)]"
          />
          <span className="text-sm">
            <strong>Estou ciente</strong> do prazo e das condições para vigência da solicitação.
          </span>
        </label>

        <div className="flex justify-end gap-2 p-6 pt-6 mt-2 bg-muted/30 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border bg-background text-sm font-medium hover:bg-accent transition-colors"
          >
            Cancelar
          </button>
          <button
            disabled={!accepted}
            onClick={() => onAccept(project)}
            className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continuar para a solicitação
          </button>
        </div>
      </div>
    </div>
  );
}