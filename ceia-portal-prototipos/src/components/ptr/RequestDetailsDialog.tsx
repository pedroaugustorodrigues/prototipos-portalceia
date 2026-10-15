import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AdjustmentRequest, STATUS_LABEL, RequestStatus } from "@/lib/ptr-data";
import {
  X,
  FileText,
  FolderKanban,
  Calendar,
  Hash,
  UserPlus,
  Wallet,
  CalendarPlus,
  CalendarMinus,
  Clock,
  PlusCircle,
  Receipt,
  CheckCircle2,
  AlertCircle,
  FileSignature,
  IdCard,
  Briefcase,
  Coins,
  ListChecks,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SECTION_META: Record<
  string,
  { title: string; icon: React.ReactNode; tone: string }
> = {
  inclusao: { title: "Inclusão de Colaborador", icon: <UserPlus className="size-4" />, tone: "emerald" },
  valor: { title: "Ajuste no Valor da Bolsa", icon: <Wallet className="size-4" />, tone: "sky" },
  prorrogacao: { title: "Prorrogação de Vigência", icon: <CalendarPlus className="size-4" />, tone: "sky" },
  reducao: { title: "Redução de Vigência (distrato)", icon: <CalendarMinus className="size-4" />, tone: "sky" },
  carga: { title: "Ajuste de Carga Horária", icon: <Clock className="size-4" />, tone: "sky" },
  suplementacao: { title: "Suplementação de Rubrica", icon: <PlusCircle className="size-4" />, tone: "sky" },
  anulacaoRubrica: { title: "Anulação em Rubrica", icon: <Receipt className="size-4" />, tone: "rose" },
};

const TONE_CLASSES: Record<string, { bg: string; fg: string }> = {
  emerald: { bg: "bg-emerald-50", fg: "text-emerald-700" },
  sky: { bg: "bg-sky-50", fg: "text-sky-700" },
  violet: { bg: "bg-violet-50", fg: "text-violet-700" },
  amber: { bg: "bg-amber-50", fg: "text-amber-800" },
  indigo: { bg: "bg-indigo-50", fg: "text-indigo-700" },
  teal: { bg: "bg-teal-50", fg: "text-teal-700" },
  rose: { bg: "bg-rose-50", fg: "text-rose-700" },
};

function StatusPill({ status }: { status: RequestStatus }) {
  const map: Record<RequestStatus, { cls: string; icon: React.ReactNode }> = {
    em_analise: {
      cls: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900",
      icon: <Clock className="size-3.5" />,
    },
    aguardando_assinatura: {
      cls: "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-900",
      icon: (
        <span className="relative flex size-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-current opacity-75 animate-ping" />
          <span className="relative inline-flex size-2 rounded-full bg-current" />
        </span>
      ),
    },
    pendente: {
      cls: "bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-900",
      icon: <Clock className="size-3.5" />,
    },
    aprovado: {
      cls: "bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-900",
      icon: <Clock className="size-3.5" />,
    },
    concluido: {
      cls: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900",
      icon: <CheckCircle2 className="size-3.5" />,
    },
    recusado: {
      cls: "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900",
      icon: <AlertCircle className="size-3.5" />,
    },
  };
  const s = map[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wider", s.cls)}>
      {s.icon} {STATUS_LABEL[status]}
    </span>
  );
}

function formatBRL(v: any): string {
  if (v === undefined || v === null || v === "") return "—";
  const num = typeof v === "number" ? v : Number(String(v).replace(/\./g, "").replace(",", "."));
  if (Number.isNaN(num)) return String(v);
  return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function InfoTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-card px-3 py-2.5 min-w-0">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.08em] text-muted-foreground font-semibold">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-1 text-sm font-medium text-foreground truncate">{value}</div>
    </div>
  );
}

export function RequestDetailsDialog({
  request,
  open,
  onClose,
}: {
  request: AdjustmentRequest | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!request) return null;
  const payload = request.payload ?? {};
  const sectionEntries = Object.entries(payload).filter(
    ([, v]: [string, any]) => v && (v.active ?? true)
  );

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="sticky top-0 bg-background z-10 px-6 pt-6 pb-4 border-b flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="size-9 rounded-lg bg-primary/10 text-primary inline-flex items-center justify-center shrink-0">
                <FileText className="size-4" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-semibold leading-tight inline-flex items-center gap-2 flex-wrap">
                  Detalhes da solicitação
                  <span className="text-xs font-mono text-muted-foreground">{request.id}</span>
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Visualize todos os dados e itens enviados nesta solicitação de ajuste.
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="size-8 rounded-md inline-flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground transition-colors shrink-0"
            aria-label="Fechar"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-2 space-y-5">
          {/* Resumo geral */}
          <section className="rounded-xl border bg-white px-4 pt-3 pb-4 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
              <ListChecks className="size-4 text-primary" /> Resumo
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-3">
                <InfoTile
                  icon={<FolderKanban className="size-3.5" />}
                  label="Projeto"
                  value={<span title={request.projectName}>{request.projectName}</span>}
                />
              </div>
              <InfoTile
                icon={<Hash className="size-3.5" />}
                label="Identificador"
                value={<span className="font-mono">{request.id}</span>}
              />
              <InfoTile
                icon={<Calendar className="size-3.5" />}
                label="Enviada em"
                value={request.createdAt}
              />
              <div className="rounded-lg border bg-card px-3 py-2.5 min-w-0">
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.08em] text-muted-foreground font-semibold">
                  <CheckCircle2 className="size-3.5" />
                  <span>Status</span>
                </div>
                <div className="mt-1.5">
                  <StatusPill status={request.status} />
                </div>
              </div>

              {request.topics?.length > 0 && (
                <div className="rounded-lg border bg-card px-3 py-2.5 min-w-0 sm:col-span-3">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.08em] text-muted-foreground font-semibold">
                    <Briefcase className="size-3.5" />
                    <span>Tópicos abordados</span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {request.topics.map((t, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center rounded-full border bg-muted/40 px-2.5 py-0.5 text-xs font-medium text-foreground"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Seções enviadas */}
          {sectionEntries.length === 0 && (
            <div className="rounded-xl border border-dashed bg-muted/30 p-8 text-center text-sm text-muted-foreground">
              Nenhum detalhe disponível para esta solicitação.
            </div>
          )}

          {sectionEntries.map(([key, section]: [string, any]) => {
            const meta = SECTION_META[key] ?? {
              title: key,
              icon: <FileText className="size-4" />,
              tone: "sky",
            };
            const tone = TONE_CLASSES[meta.tone] ?? TONE_CLASSES.sky;

            return (
              <section
                key={key}
                className="rounded-xl border bg-white shadow-sm overflow-hidden"
              >
                <header className={cn("flex items-center gap-2 px-4 py-3 border-b", tone.bg, tone.fg)}>
                  <div className="size-7 rounded-md bg-white/70 inline-flex items-center justify-center">
                    {meta.icon}
                  </div>
                  <h3 className="text-sm font-semibold">{meta.title}</h3>
                </header>

                <div className="p-4 space-y-3">
                  {/* Inclusão de colaborador — texto corrido numerado */}
                  {Array.isArray(section.inclusionLines) && section.inclusionLines.length > 0 && (
                    <ul className="space-y-2">
                      {section.inclusionLines.map((l: any, idx: number) => {
                        const partes: string[] = [];
                        if (l.nome) partes.push(`Incluir ${l.nome}`);
                        if (l.vinculo) partes.push(`vínculo ${l.vinculo}`);
                        if (l.cpf) partes.push(`CPF ${l.cpf}`);
                        if (l.ch) partes.push(`${l.ch}h`);
                        if (l.parcelas) partes.push(`${l.parcelas} parcelas`);
                        if (l.valor) partes.push(`valor mensal ${formatBRL(l.valor)}`);
                        if (l.inicio) partes.push(`início em ${l.inicio}`);
                        const texto = partes.join(", ") + ".";
                        return (
                          <li
                            key={idx}
                            className="flex items-start gap-2.5 rounded-lg border bg-muted/20 px-3 py-2.5 text-sm"
                          >
                            <div className="size-5 rounded-full bg-primary/10 text-primary inline-flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                              {idx + 1}
                            </div>
                            <span className="text-foreground leading-relaxed">{texto}</span>
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  {/* Lines genéricas (texto) */}
                  {Array.isArray(section.lines) && section.lines.length > 0 && (
                    <ul className="space-y-2">
                      {section.lines.map((ln: any, idx: number) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2.5 rounded-lg border bg-muted/20 px-3 py-2.5 text-sm"
                        >
                          <div className="size-5 rounded-full bg-primary/10 text-primary inline-flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                            {idx + 1}
                          </div>
                          <span className="text-foreground leading-relaxed">{ln.text}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {!(Array.isArray(section.inclusionLines) && section.inclusionLines.length) &&
                    !(Array.isArray(section.lines) && section.lines.length) && (
                      <div className="text-sm text-muted-foreground italic">
                        Seção ativa, sem itens detalhados.
                      </div>
                    )}
                </div>
              </section>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default RequestDetailsDialog;
