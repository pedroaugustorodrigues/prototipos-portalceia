import { useState, Fragment } from "react";
import {
  LayoutDashboard,
  BarChart3,
  Users,
  FileText,
  Target,
  ClipboardList,
  Wallet,
  LayoutGrid,
  UserCircle2,
  Network,
  GraduationCap,
  Receipt,
  PiggyBank,
  Plus,
  Pencil,
  Trash2,
  UsersRound,
  Briefcase,
  ChevronDown,
  Check,
  X,
  Link2,
  FileSignature,
  Inbox,
  History,
  Calendar,
  ArrowRight,
  UserPlus,
  RefreshCw,
  UserMinus,
  User,
  FileDown,
  Coins,
} from "lucide-react";
import { MOCK_REQUESTS, PROJECTS, STATUS_LABEL, type AdjustmentRequest } from "@/lib/ptr-data";
import { cn } from "@/lib/utils";
import { NewSlotDialog } from "@/components/ptr/NewSlotDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const PROPOSTA_TABS_DEFAULT: { key: string; label: string; icon: React.ReactNode }[] = [
  { key: "sumario", label: "Sumário", icon: <LayoutDashboard className="size-4" /> },
  { key: "financeiro", label: "Financeiro", icon: <BarChart3 className="size-4" /> },
  { key: "equipe", label: "Equipe", icon: <Users className="size-4" /> },
  { key: "documentos", label: "Documentos", icon: <FileText className="size-4" /> },
  { key: "macroentregas", label: "Macroentregas", icon: <Target className="size-4" /> },
  { key: "plano-trabalho", label: "Plano de Trabalho", icon: <ClipboardList className="size-4" /> },
];

const PROPOSTA_1_TABS: { key: string; label: string; icon: React.ReactNode }[] = [
  { key: "sumario", label: "Sumário", icon: <LayoutDashboard className="size-4" /> },
  { key: "financeiro-equipe", label: "Financeiro e Equipe", icon: <BarChart3 className="size-4" /> },
  { key: "documentos", label: "Documentos", icon: <FileText className="size-4" /> },
  { key: "macroentregas", label: "Macroentregas", icon: <Target className="size-4" /> },
  { key: "plano-trabalho", label: "Plano de Trabalho", icon: <ClipboardList className="size-4" /> },
];

export function PropostaAjustePtrView({ propostaNumero }: { propostaNumero: 1 | 2 }) {
  const project = PROJECTS[0];
  const tabs = propostaNumero === 1 ? PROPOSTA_1_TABS : PROPOSTA_TABS_DEFAULT;
  const [activeTabKey, setActiveTabKey] = useState<string>(
    propostaNumero === 1 ? "financeiro-equipe" : "financeiro"
  );

  const statusBadge = {
    label: "EM EXECUÇÃO",
    bg: "bg-emerald-100",
    text: "text-emerald-600",
    dot: "bg-emerald-500",
  };

  return (
    <div className="p-6 md:p-10 w-full">
      {/* Header */}
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
        <div
          className={cn(
            "shrink-0 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold",
            statusBadge.bg,
            statusBadge.text
          )}
        >
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
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTabKey(t.key)}
              className="relative flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium -mb-px whitespace-nowrap flex-1 min-w-0"
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

      {/* Conteúdo da aba ativa */}
      {propostaNumero === 1 && activeTabKey === "financeiro-equipe" && (
        <FinanceiroEquipeTab mode="ambos" />
      )}
      {propostaNumero === 1 && activeTabKey === "plano-trabalho" && (
        <PlanoTrabalhoTab propostaNumero={1} />
      )}
      {propostaNumero === 2 && activeTabKey === "financeiro" && (
        <FinanceiroEquipeTab mode="financeiro" />
      )}
      {propostaNumero === 2 && activeTabKey === "equipe" && (
        <FinanceiroEquipeTab mode="equipe" />
      )}
      {propostaNumero === 2 && activeTabKey === "plano-trabalho" && (
        <PlanoTrabalhoTab propostaNumero={2} />
      )}
    </div>
  );
}

// ── Aba Financeiro e Equipe (Proposta 1) ───────────────────────────────────────
type FinanceiroEquipeMode = "ambos" | "equipe" | "financeiro";

function FinanceiroEquipeTab({ mode = "ambos" }: { mode?: FinanceiroEquipeMode }) {
  const initialSubTab: "equipe" | "despesas" = mode === "financeiro" ? "despesas" : "equipe";
  const [subTab, setSubTab] = useState<"equipe" | "despesas">(initialSubTab);
  const [equipeView, setEquipeView] = useState<"slots" | "membros" | "squads">("slots");
  const [financeiroView, setFinanceiroView] = useState<"despesas" | "orcamento">("despesas");
  const [editing, setEditing] = useState(false);
  const [vinculoOpen, setVinculoOpen] = useState(false);
  const [solicitacaoVinculada, setSolicitacaoVinculada] = useState<AdjustmentRequest | null>(null);
  const [resumoOpen, setResumoOpen] = useState(false);
  const [cartaToast, setCartaToast] = useState<string | null>(null);

  const showSubToggle = mode === "ambos";
  const showEditButton = mode === "ambos";
  const headerTitle =
    mode === "equipe"
      ? "Equipe"
      : mode === "financeiro"
      ? "Financeiro"
      : "Financeiro e Equipe";

  const subTabs = [
    { key: "equipe" as const, label: "Equipe", icon: <Users className="size-4" /> },
    { key: "despesas" as const, label: "Financeiro", icon: <Wallet className="size-4" /> },
  ];

  const equipeMenus = [
    { key: "slots" as const, label: "Slots Criados", icon: <LayoutGrid className="size-4" /> },
    { key: "membros" as const, label: "Membros do Projeto", icon: <UserCircle2 className="size-4" /> },
    { key: "squads" as const, label: "Estrutura de Equipe (Squads)", icon: <Network className="size-4" /> },
  ];

  const financeiroMenus = [
    { key: "despesas" as const, label: "Despesas", icon: <Receipt className="size-4" /> },
    { key: "orcamento" as const, label: "Orçamento", icon: <PiggyBank className="size-4" /> },
  ];

  const vinculoBanner =
    editing && solicitacaoVinculada ? (
      <div className="relative overflow-hidden rounded-xl border border-sky-200 bg-gradient-to-r from-sky-50 to-white shadow-sm">
        <div className="flex items-center gap-4 px-5 py-4">
          <span className="inline-flex size-10 items-center justify-center rounded-lg bg-sky-600 text-white shadow-sm shrink-0">
            <Link2 className="size-5" />
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] uppercase tracking-wider text-sky-700 font-semibold">
                Edição vinculada à solicitação
              </span>
              <span className="font-mono text-sm font-bold text-foreground">
                {solicitacaoVinculada.id}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5 truncate">
              {solicitacaoVinculada.topics.join(" • ")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setVinculoOpen(true)}
            className="shrink-0 inline-flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm font-medium hover:bg-muted transition-colors"
          >
            <Pencil className="size-4" />
            Alterar
          </button>
        </div>
      </div>
    ) : null;

  return (
    <div className="space-y-6">
      {mode !== "financeiro" && mode !== "equipe" && vinculoBanner}
      <section className="rounded-xl border bg-card overflow-hidden">
        <div className="px-5 pt-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold">{headerTitle}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {mode === "equipe" ? (
                <>
                  Aqui você visualiza os slots criados, os membros do projeto e a
                  estrutura das squads vinculadas.
                </>
              ) : mode === "financeiro" ? (
                <>Custos Estimados do Projeto.</>
              ) : (
                <>
                  Clique em <span className="font-medium text-foreground">Editar</span>{" "}
                  para ajustar slots na aba{" "}
                  <span className="font-medium text-foreground">Equipe</span> ou
                  sub-rubricas na aba{" "}
                  <span className="font-medium text-foreground">Financeiro</span>.
                </>
              )}
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-2">
            {showEditButton && (
              <>
                {editing && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setSolicitacaoVinculada(null);
                    }}
                    className="inline-flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm font-medium hover:bg-muted transition-colors"
                  >
                    <X className="size-4" />
                    Cancelar
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (editing) {
                      setResumoOpen(true);
                    } else {
                      setVinculoOpen(true);
                    }
                  }}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    editing
                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
                      : "bg-sky-700 text-white hover:bg-sky-800"
                  )}
                >
                  {editing ? (
                    <>
                      <Check className="size-4" />
                      Concluir edição
                    </>
                  ) : (
                    <>
                      <Pencil className="size-4" />
                      Editar
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
        {showSubToggle && (
          <div className="p-5">
            <div className="flex w-full rounded-lg border bg-muted p-1 gap-1">
              {subTabs.map((t) => {
                const active = t.key === subTab;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setSubTab(t.key)}
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
          </div>
        )}
        {mode === "financeiro" && (
          <div className="p-5">
            <div className="flex w-full rounded-lg border bg-muted p-1 gap-1">
              {financeiroMenus.map((m) => {
                const active = m.key === financeiroView;
                return (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setFinanceiroView(m.key)}
                    className={cn(
                      "flex-1 inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                      active
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-background/40"
                    )}
                  >
                    {m.icon}
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        {mode === "equipe" && (
          <div className="p-5">
            <div className="flex w-full rounded-lg border bg-muted p-1 gap-1">
              {equipeMenus.map((m) => {
                const active = m.key === equipeView;
                return (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setEquipeView(m.key)}
                    className={cn(
                      "flex-1 inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                      active
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-background/40"
                    )}
                  >
                    {m.icon}
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        {!showSubToggle && mode !== "financeiro" && mode !== "equipe" && <div className="pb-2" />}
      </section>

      {(mode === "financeiro" || mode === "equipe") && vinculoBanner}

      {subTab === "equipe" && (
        <section className="rounded-xl border bg-card overflow-hidden">
          {showSubToggle ? (
            <div
              className="border-b flex overflow-x-auto w-full"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" } as React.CSSProperties}
            >
              {equipeMenus.map((m) => {
                const active = m.key === equipeView;
                return (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setEquipeView(m.key)}
                    className="relative flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium -mb-px whitespace-nowrap flex-1 min-w-0"
                  >
                    <div
                      className={cn(
                        "flex items-center gap-2",
                        active ? "text-primary" : "text-muted-foreground"
                      )}
                    >
                      {m.icon}
                      <span>{m.label}</span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] overflow-hidden">
                      <span
                        style={{
                          display: "block",
                          height: "100%",
                          backgroundColor: "var(--primary)",
                          transform: active ? "scaleX(1)" : "scaleX(0)",
                          transformOrigin: "center",
                          transition: "transform 360ms cubic-bezier(.2,.9,.2,1)",
                        }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          ) : null}

          {equipeView === "slots" && (
            <div className="p-5">
              <SlotsCriadosView
                editing={editing}
                mode={mode}
                onEditClick={() => {
                  if (editing) {
                    setResumoOpen(true);
                  } else {
                    setVinculoOpen(true);
                  }
                }}
                onCancelClick={() => {
                  setEditing(false);
                  setSolicitacaoVinculada(null);
                }}
              />
            </div>
          )}
          {equipeView === "membros" && (
            <div className="p-5">
              <PlaceholderContent
                icon={<UserCircle2 className="size-5" />}
                titulo="Conteúdo da tela"
                descricao="Membros do Projeto"
              />
            </div>
          )}
          {equipeView === "squads" && (
            <div className="p-5">
              <PlaceholderContent
                icon={<Network className="size-5" />}
                titulo="Conteúdo da tela"
                descricao="Estrutura de Equipe (Squads)"
              />
            </div>
          )}
        </section>
      )}

      {subTab === "despesas" && (
        <section className="rounded-xl border bg-card overflow-hidden">
          {showSubToggle ? (
            <div
              className="border-b flex overflow-x-auto w-full"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" } as React.CSSProperties}
            >
              {financeiroMenus.map((m) => {
                const active = m.key === financeiroView;
                return (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setFinanceiroView(m.key)}
                    className="relative flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium -mb-px whitespace-nowrap flex-1 min-w-0"
                  >
                    <div
                      className={cn(
                        "flex items-center gap-2",
                        active ? "text-primary" : "text-muted-foreground"
                      )}
                    >
                      {m.icon}
                      <span>{m.label}</span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] overflow-hidden">
                      <span
                        style={{
                          display: "block",
                          height: "100%",
                          backgroundColor: "var(--primary)",
                          transform: active ? "scaleX(1)" : "scaleX(0)",
                          transformOrigin: "center",
                          transition: "transform 360ms cubic-bezier(.2,.9,.2,1)",
                        }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          ) : null}

          {financeiroView === "despesas" && (
            <div className="p-5">
              <DespesasView
                editing={editing}
                mode={mode}
                onEditClick={() => {
                  if (editing) {
                    setResumoOpen(true);
                  } else {
                    setVinculoOpen(true);
                  }
                }}
                onCancelClick={() => {
                  setEditing(false);
                  setSolicitacaoVinculada(null);
                }}
              />
            </div>
          )}
          {financeiroView === "orcamento" && (
            <div className="p-5">
              <PlaceholderContent
                icon={<PiggyBank className="size-5" />}
                titulo="Conteúdo da tela"
                descricao="Orçamento"
              />
            </div>
          )}
        </section>
      )}

      <VincularSolicitacaoDialog
        open={vinculoOpen}
        onOpenChange={setVinculoOpen}
        atual={solicitacaoVinculada?.id}
        onConfirm={(req) => {
          setSolicitacaoVinculada(req);
          setEditing(true);
          setVinculoOpen(false);
        }}
      />

      <ResumoEdicaoDialog
        open={resumoOpen}
        onOpenChange={setResumoOpen}
        solicitacao={solicitacaoVinculada}
        mode={mode}
        onConfirm={() => {
          const id = solicitacaoVinculada?.id;
          setResumoOpen(false);
          setEditing(false);
          setSolicitacaoVinculada(null);
          if (mode === "ambos") {
            setCartaToast(
              id
                ? `Carta gerada para a solicitação ${id}. Enviada ao coordenador. Acompanhe em Plano de Trabalho › Alterações de PTR.`
                : "Carta gerada e enviada ao coordenador. Acompanhe em Plano de Trabalho › Alterações de PTR."
            );
          } else {
            setCartaToast(
              id
                ? `Alterações da solicitação ${id} salvas. Para gerar a carta de ajuste, acesse Plano de Trabalho › Ajuste de PTR após concluir todas as edições.`
                : "Alterações salvas. Para gerar a carta de ajuste, acesse Plano de Trabalho › Ajuste de PTR após concluir todas as edições."
            );
          }
          window.setTimeout(() => setCartaToast(null), 6000);
        }}
      />

      {cartaToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm rounded-lg border border-emerald-200 bg-white shadow-lg px-4 py-3 flex items-start gap-3">
          <span className="inline-flex size-8 items-center justify-center rounded-md bg-emerald-100 text-emerald-700 shrink-0">
            <FileSignature className="size-4" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">
              {mode === "ambos" ? "Carta gerada" : "Alterações salvas"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{cartaToast}</p>
          </div>
          <button
            type="button"
            onClick={() => setCartaToast(null)}
            className="shrink-0 text-muted-foreground hover:text-foreground"
            aria-label="Fechar"
          >
            <X className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function ResumoEdicaoDialog({
  open,
  onOpenChange,
  solicitacao,
  onConfirm,
  mode = "ambos",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  solicitacao: AdjustmentRequest | null;
  onConfirm: () => void;
  mode?: FinanceiroEquipeMode;
}) {
  // Resumo mock — em produção, viria dos diffs reais do que foi editado.
  const allAlteracoes = [
    {
      categoria: "Equipe",
      titulo: "Slot atualizado",
      detalhe: "Colaborador DTI-A — bolsista alterado para Ana Beatriz Souza",
    },
    {
      categoria: "Equipe",
      titulo: "Slot adicionado",
      detalhe: "Colaborador DTI-B — vaga em aberto (Mês 3, 9 meses)",
    },
    {
      categoria: "Financeiro",
      titulo: "Sub-rubrica adicionada",
      detalhe: "Material de Consumo — Notebook Dell · R$ 6.500,00 · Fonte EMBRAPII",
    },
  ];
  const alteracoes =
    mode === "equipe"
      ? allAlteracoes.filter((a) => a.categoria === "Equipe")
      : mode === "financeiro"
      ? allAlteracoes.filter((a) => a.categoria === "Financeiro")
      : allAlteracoes;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="inline-flex size-8 items-center justify-center rounded-md bg-emerald-100 text-emerald-700">
              <Check className="size-4" />
            </span>
            Confirmar alterações
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {mode === "ambos" ? (
              <>
                Revise abaixo o que foi alterado nesta edição. Ao confirmar, será
                gerada a carta de ajuste para o coordenador assinar. Você poderá
                acompanhar o andamento na aba{" "}
                <span className="font-medium text-foreground">
                  Plano de Trabalho › Alterações de PTR
                </span>
                .
              </>
            ) : (
              <>
                Revise abaixo o que foi alterado nesta aba. Ao confirmar, as
                alterações serão salvas, mas{" "}
                <span className="font-medium text-foreground">
                  a carta de ajuste ainda não será gerada
                </span>
                . Quando todas as edições da solicitação estiverem prontas (despesas
                e/ou slots), acesse{" "}
                <span className="font-medium text-foreground">
                  Plano de Trabalho › Ajuste de PTR
                </span>{" "}
                para solicitar a geração da carta.
              </>
            )}
          </p>

          {solicitacao && (
            <div className="rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-sm flex items-center gap-2">
              <Link2 className="size-4 text-sky-700 shrink-0" />
              <span className="text-muted-foreground">Vinculada à solicitação</span>
              <span className="font-mono font-semibold text-foreground">
                {solicitacao.id}
              </span>
            </div>
          )}

          <hr className="border-t border-border" />

          <div>
            <h4 className="text-sm font-semibold mb-2">
              Alterações realizadas ({alteracoes.length})
            </h4>
            <ul className="divide-y rounded-md border max-h-[40vh] overflow-y-auto">
              {alteracoes.map((a, i) => (
                <li key={i} className="p-3 flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{a.titulo}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{a.detalhe}</p>
                  </div>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider shrink-0 mt-0.5",
                      a.categoria === "Equipe"
                        ? "bg-sky-100 text-sky-800"
                        : "bg-amber-100 text-amber-800"
                    )}
                  >
                    {a.categoria}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <hr className="border-t border-border" />

        <DialogFooter className="gap-2 sm:gap-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="inline-flex items-center justify-center rounded-md border bg-background px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
          >
            Voltar para edição
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
          >
            {mode === "ambos" ? (
              <>
                <FileSignature className="size-4" />
                Confirmar e gerar carta
              </>
            ) : (
              <>
                <Check className="size-4" />
                Confirmar alterações
              </>
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function VincularSolicitacaoDialog({
  open,
  onOpenChange,
  atual,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  atual?: string;
  onConfirm: (req: AdjustmentRequest) => void;
}) {
  const requests = MOCK_REQUESTS.slice(0, 3);
  const [selectedId, setSelectedId] = useState<string | undefined>(atual);
  const [busca, setBusca] = useState("");

  const filtered = requests.filter((r) => {
    const q = busca.trim().toLowerCase();
    if (!q) return true;
    return (
      r.id.toLowerCase().includes(q) ||
      r.topics.some((t) => t.toLowerCase().includes(q))
    );
  });

  function handleConfirm() {
    const req = requests.find((r) => r.id === selectedId);
    if (req) onConfirm(req);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="inline-flex size-8 items-center justify-center rounded-md bg-sky-100 text-sky-700">
              <Link2 className="size-4" />
            </span>
            Vincular a uma solicitação existente
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Associe esta edição a uma solicitação já enviada. Identifique-a pelo número
            de identificação encaminhada para o LIST junto à solicitação.
          </p>

          <hr className="border-t border-border" />

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Buscar solicitação</label>
            <div className="relative">
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Digite o número de identificação. Ex: REQ-2025-024"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>

          <div className="max-h-[55vh] overflow-y-auto rounded-md border divide-y">
            {filtered.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                Nenhuma solicitação encontrada para este projeto.
              </div>
            ) : (
              filtered.map((r) => {
                const checked = r.id === selectedId;
                return (
                  <label
                    key={r.id}
                    className={cn(
                      "flex items-start gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors",
                      checked && "bg-sky-50"
                    )}
                  >
                    <input
                      type="radio"
                      name="solicitacao"
                      value={r.id}
                      checked={checked}
                      onChange={() => setSelectedId(r.id)}
                      className="sr-only peer"
                    />
                    <span
                      aria-hidden
                      className={cn(
                        "mt-0.5 inline-flex size-5 items-center justify-center rounded-full border-2 transition-colors shrink-0",
                        checked
                          ? "bg-sky-700 border-sky-700 text-white"
                          : "border-input bg-background text-transparent"
                      )}
                    >
                      <Check className="size-3" strokeWidth={3} />
                    </span>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-base font-semibold text-foreground">
                          {r.id}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {r.createdAt}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {r.topics.join(" • ")}
                      </div>
                    </div>
                  </label>
                );
              })
            )}
          </div>
        </div>

        <hr className="border-t border-border" />

        <DialogFooter className="gap-2 sm:gap-2 sm:justify-between items-center">
          <div className="text-sm text-muted-foreground min-h-[1.25rem]">
            {selectedId && (
              <>
                Vinculado a{" "}
                <span className="font-mono font-semibold text-sky-700">
                  {selectedId}
                </span>
              </>
            )}
          </div>
          <div className="flex flex-col-reverse sm:flex-row sm:items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="inline-flex items-center justify-center rounded-md border bg-background px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!selectedId}
              className="inline-flex items-center justify-center rounded-md bg-sky-700 px-4 py-2 text-sm font-medium text-white hover:bg-sky-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Vincular e editar
            </button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PlaceholderContent({
  icon,
  titulo,
  descricao,
}: {
  icon: React.ReactNode;
  titulo: string;
  descricao: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
      <div className="size-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
        {icon}
      </div>
      <div>
        <h4 className="text-sm font-semibold text-foreground">{titulo}</h4>
        <p className="text-sm text-muted-foreground mt-1">{descricao}</p>
      </div>
    </div>
  );
}

// ── Despesas ───────────────────────────────────────────────────────────────────
type Fonte = {
  nome: string;
  totalGasto: number;
  limite: number;
};

const FONTES: Fonte[] = [
  { nome: "EMBRAPII", totalGasto: 103526, limite: 585421.36 },
  { nome: "EMPRESA", totalGasto: 78420, limite: 320000 },
  { nome: "SEBRAE", totalGasto: 145800, limite: 280000 },
];

function DespesasView({
  editing,
  mode = "ambos",
  onEditClick,
  onCancelClick,
}: {
  editing: boolean;
  mode?: FinanceiroEquipeMode;
  onEditClick?: () => void;
  onCancelClick?: () => void;
}) {
  const showInlineEdit = mode === "financeiro";
  return (
    <section className="space-y-4">
      <div className="flex items-start justify-between gap-4 pb-2">
        <div className="min-w-0">
          <h3 className="text-base font-semibold">Despesas do Projeto</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            {mode === "financeiro" ? (
              <>
                Visualização das despesas. Clique em{" "}
                <span className="font-medium text-foreground">Editar</span>{" "}
                para gerenciar sub-rubricas das despesas do projeto.
              </>
            ) : (
              "Visualização das despesas"
            )}
          </p>
        </div>
        {showInlineEdit && (
          <div className="shrink-0 flex items-center gap-2">
            {editing && (
              <button
                type="button"
                onClick={onCancelClick}
                className="inline-flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm font-medium hover:bg-muted transition-colors"
              >
                <X className="size-4" />
                Cancelar
              </button>
            )}
            <button
              type="button"
              onClick={onEditClick}
              className={cn(
                "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                editing
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "bg-sky-700 text-white hover:bg-sky-800"
              )}
            >
              {editing ? (
                <>
                  <Check className="size-4" />
                  Concluir edição
                </>
              ) : (
                <>
                  <Pencil className="size-4" />
                  Editar
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
        {FONTES.map((f) => (
          <FonteCard key={f.nome} fonte={f} />
        ))}
      </div>

      <PessoalCard />
      <MaterialConsumoCard editing={editing} />
    </section>
  );
}

// ── I - Pessoal ────────────────────────────────────────────────────────────────
type PessoalLinha = { fonte: string; valor: number };

const PESSOAL_LINHAS: PessoalLinha[] = [
  { fonte: "EMBRAPII", valor: 99000 },
  { fonte: "SEBRAE", valor: 0 },
  { fonte: "EMPRESA", valor: 600 },
];

function PessoalCard() {
  const [open, setOpen] = useState(true);
  const total = PESSOAL_LINHAS.reduce((s, l) => s + l.valor, 0);

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full px-4 py-3 border-b bg-muted/50 text-foreground flex items-center justify-between gap-2 hover:bg-muted/70 transition-colors"
      >
        <h4 className="text-base font-semibold leading-tight flex items-center gap-2">
          <UsersRound className="size-4" />
          I - PESSOAL
        </h4>
        <ChevronDown
          className={cn(
            "size-4 text-muted-foreground transition-transform",
            !open && "-rotate-90"
          )}
        />
      </button>
      {open && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm table-fixed">
            <thead>
              <tr className="text-center text-xs uppercase text-muted-foreground bg-muted/30 border-b">
                {PESSOAL_LINHAS.map((l) => (
                  <th key={l.fonte} className="px-4 py-2 font-medium">{l.fonte}</th>
                ))}
                <th className="px-4 py-2 font-medium">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              <tr className="text-center">
                {PESSOAL_LINHAS.map((l) => (
                  <td key={l.fonte} className="px-4 py-3 tabular-nums">{formatBRL(l.valor)}</td>
                ))}
                <td className="px-4 py-3 tabular-nums font-semibold">{formatBRL(total)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── II - Material de Consumo ───────────────────────────────────────────────────
type SubRubrica = {
  id: string;
  subrubrica: string;
  valorUnitario: number;
  quantidade: number;
  fonte: string;
  /** Quando "em-analise", o item aparece esmaecido (fantasma) com selo de status. */
  status?: "em-analise";
};

const MATERIAL_CONSUMO_LINHAS: SubRubrica[] = [
  {
    id: "mc-1",
    subrubrica: "Material de Consumo",
    valorUnitario: 100,
    quantidade: 2,
    fonte: "EMBRAPII",
    status: "em-analise",
  },
];

function MaterialConsumoCard({ editing }: { editing: boolean }) {
  const [open, setOpen] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const total = MATERIAL_CONSUMO_LINHAS.reduce(
    (s, l) => s + l.valorUnitario * l.quantidade,
    0
  );

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full px-4 py-3 border-b bg-muted/50 text-foreground flex items-center justify-between gap-2 hover:bg-muted/70 transition-colors"
      >
        <h4 className="text-base font-semibold leading-tight flex items-center gap-2">
          <Briefcase className="size-4" />
          II - MATERIAL DE CONSUMO
        </h4>
        <ChevronDown
          className={cn(
            "size-4 text-muted-foreground transition-transform",
            !open && "-rotate-90"
          )}
        />
      </button>
      {open && (
        <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm table-fixed">
          <thead>
            <tr className="text-center text-xs uppercase text-muted-foreground bg-muted/30 border-b">
              <th className="px-4 py-2 font-medium">Sub-rubrica</th>
              <th className="px-4 py-2 font-medium">Valor Unitário</th>
              <th className="px-4 py-2 font-medium">Quantidade</th>
              <th className="px-4 py-2 font-medium">Total</th>
              <th className="px-4 py-2 font-medium">Fonte de Recurso</th>
              {editing && <th className="px-4 py-2 font-medium">Ações</th>}
            </tr>
          </thead>
          <tbody className="divide-y">
            {MATERIAL_CONSUMO_LINHAS.map((l) => {
              const emAnalise = l.status === "em-analise";
              return (
                <tr
                  key={l.id}
                  className={cn(
                    "text-center",
                    emAnalise &&
                      "outline outline-2 outline-amber-400 [outline-offset:-2px]"
                  )}
                >
                  <td className={cn("px-4 py-3", emAnalise && "opacity-50")}>
                    {l.subrubrica}
                  </td>
                  <td className={cn("px-4 py-3 tabular-nums", emAnalise && "opacity-50")}>
                    {formatBRL(l.valorUnitario)}
                  </td>
                  <td className={cn("px-4 py-3 tabular-nums", emAnalise && "opacity-50")}>
                    {l.quantidade}
                  </td>
                  <td className={cn("px-4 py-3 tabular-nums", emAnalise && "opacity-50")}>
                    {formatBRL(l.valorUnitario * l.quantidade)}
                  </td>
                  <td className={cn("px-4 py-3", emAnalise && !editing && "relative")}>
                    {emAnalise && !editing && <EmAnaliseBadge />}
                    <span className={cn(emAnalise && "opacity-50")}>{l.fonte}</span>
                  </td>
                  {editing && (
                    <td className={cn("px-4 py-3", emAnalise && "relative")}>
                      {emAnalise && <EmAnaliseBadge />}
                      <div className={cn("inline-flex items-center gap-1", emAnalise && "opacity-50")}>
                        <button
                          type="button"
                          aria-label="Editar"
                          title="Editar"
                          className="inline-flex items-center justify-center size-7 rounded-md text-muted-foreground hover:text-sky-700 hover:bg-sky-50"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          type="button"
                          aria-label="Excluir"
                          title="Excluir"
                          className="inline-flex items-center justify-center size-7 rounded-md text-muted-foreground hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
            <tr className="bg-muted/30 font-semibold text-center">
              <td className="px-4 py-3">TOTAL</td>
              <td className="px-4 py-3" colSpan={2} />
              <td className="px-4 py-3 tabular-nums">{formatBRL(total)}</td>
              <td className="px-4 py-3" colSpan={editing ? 2 : 1} />
            </tr>
          </tbody>
        </table>
      </div>
      {editing && (
        <div className="p-4 border-t flex justify-center">
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-md bg-sky-700 px-4 py-2 text-sm font-medium text-white hover:bg-sky-800 transition-colors"
          >
            <Plus className="size-4" />
            Adicionar Sub-rubrica
          </button>
        </div>
      )}
        </>
      )}
      <AdicionarSubRubricaDialog open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
}

// ── Selo "Em análise" (canto superior direito, topo e direita retos) ───────────
function EmAnaliseBadge() {
  return (
    <span className="absolute top-0 right-0 z-20 inline-flex items-center gap-1.5 rounded-md rounded-tr-none bg-amber-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-amber-800 shadow-sm">
      <span className="size-1.5 rounded-full bg-amber-500" />
      Em análise
    </span>
  );
}

// ── Modal: Adicionar Sub-rubrica ───────────────────────────────────────────────
function AdicionarSubRubricaDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [subrubrica, setSubrubrica] = useState("");
  const [valorUnitario, setValorUnitario] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [fonte, setFonte] = useState("");

  const baseSelectClass =
    "w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
  const baseInputClass =
    "w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  function handleSave() {
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Sub-rubrica</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Sub-rubrica<span className="text-red-600">*</span>
            </label>
            <select
              className={baseSelectClass}
              value={subrubrica}
              onChange={(e) => setSubrubrica(e.target.value)}
            >
              <option value="">Selecione</option>
              <option value="Material de Consumo">Material de Consumo</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Valor Unitário<span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                inputMode="decimal"
                className={baseInputClass}
                value={valorUnitario}
                onChange={(e) => setValorUnitario(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Quantidade<span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                min={0}
                className={baseInputClass}
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Fonte de Recurso<span className="text-red-600">*</span>
            </label>
            <select
              className={baseSelectClass}
              value={fonte}
              onChange={(e) => setFonte(e.target.value)}
            >
              <option value="">Selecione</option>
              <option value="EMBRAPII">EMBRAPII</option>
              <option value="SEBRAE">SEBRAE</option>
              <option value="EMPRESA">EMPRESA</option>
              <option value="EMPRESA PEQUENA">EMPRESA PEQUENA</option>
            </select>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="inline-flex items-center justify-center rounded-md border bg-background px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center justify-center rounded-md bg-sky-700 px-4 py-2 text-sm font-medium text-white hover:bg-sky-800 transition-colors"
          >
            Salvar
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function FonteCard({ fonte }: { fonte: Fonte }) {
  const saldo = fonte.limite - fonte.totalGasto;
  const pct = fonte.limite > 0 ? (fonte.totalGasto / fonte.limite) * 100 : 0;

  return (
    <div className="rounded-xl border bg-card overflow-hidden flex flex-col">
      <div className="px-4 pt-4 pb-3 border-b bg-sky-700 text-white">
        <h4 className="text-base font-semibold leading-tight">{fonte.nome}</h4>
      </div>

      <div className="p-4 space-y-2 text-sm flex-1">
        <div className="flex items-baseline justify-between gap-4">
          <span className="text-xs tracking-wider text-muted-foreground font-medium">
            Total por Fonte de Recurso
          </span>
          <span className="text-right font-medium tabular-nums">{formatBRL(fonte.totalGasto)}</span>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <span className="text-xs tracking-wider text-muted-foreground font-medium">
            Limite Previsto no Contrato
          </span>
          <span className="text-right font-medium tabular-nums">{formatBRL(fonte.limite)}</span>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            Saldo/Déficit
          </span>
          <span
            className={cn(
              "text-right font-semibold tabular-nums",
              saldo >= 0 ? "text-emerald-700" : "text-red-700"
            )}
          >
            {formatBRL(saldo)}
          </span>
        </div>
      </div>

      <div className="px-4 pt-3 pb-3 border-t bg-muted/20 space-y-1.5">
        <div className="flex items-center justify-between text-xs font-medium">
          <span className="text-muted-foreground">{pct.toFixed(1)}% utilizado</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full",
              pct < 70 ? "bg-emerald-500" : pct < 90 ? "bg-amber-500" : "bg-red-500"
            )}
            style={{ width: `${Math.min(100, pct)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ── Slots Criados ──────────────────────────────────────────────────────────────
type Slot = {
  cargo: string;
  formacao: string;
  obrigatorio: boolean;
  bolsista: string;
  inicio: string;
  duracao: string;
  cargaHoraria: string;
  maturidade: string;
  vinculo: string;
  fonte: string;
  competencia: string;
  bolsa: string;
};

const SLOTS: Slot[] = [
  {
    cargo: "Coordenador",
    formacao: "Pós-Doutorado",
    obrigatorio: true,
    bolsista: "Stephano Soares Viglio",
    inicio: "Mês 1",
    duracao: "12 meses",
    cargaHoraria: "10h/mês",
    maturidade: "Pesquisador Líder",
    vinculo: "Interno UFG",
    fonte: "EMBRAPII",
    competencia: "Gestão",
    bolsa: "R$ 3.000,00",
  },
  {
    cargo: "Vice-Coordenador",
    formacao: "Doutorado",
    obrigatorio: false,
    bolsista: "Renata Braga",
    inicio: "Mês 1",
    duracao: "12 meses",
    cargaHoraria: "10h/mês",
    maturidade: "Pesquisador Sênior",
    vinculo: "Interno UFG",
    fonte: "EMBRAPII",
    competencia: "Gestão",
    bolsa: "R$ 2.500,00",
  },
  {
    cargo: "Pesquisador Sênior",
    formacao: "Doutorado",
    obrigatorio: false,
    bolsista: "Pedro Augusto Lima",
    inicio: "Mês 2",
    duracao: "10 meses",
    cargaHoraria: "20h/mês",
    maturidade: "Pesquisador Sênior",
    vinculo: "Externo",
    fonte: "EMBRAPII",
    competencia: "Pesquisa",
    bolsa: "R$ 4.000,00",
  },
  {
    cargo: "Colaborador DTI-A",
    formacao: "Mestrado",
    obrigatorio: false,
    bolsista: "Ana Beatriz Souza",
    inicio: "Mês 3",
    duracao: "9 meses",
    cargaHoraria: "40h/mês",
    maturidade: "Pleno",
    vinculo: "Externo",
    fonte: "EMBRAPII",
    competencia: "Desenvolvimento",
    bolsa: "R$ 3.000,00",
  },
  {
    cargo: "Colaborador DTI-B",
    formacao: "Graduação",
    obrigatorio: false,
    bolsista: "Vaga em aberto",
    inicio: "Mês 3",
    duracao: "9 meses",
    cargaHoraria: "30h/mês",
    maturidade: "Júnior",
    vinculo: "Externo",
    fonte: "EMBRAPII",
    competencia: "Desenvolvimento",
    bolsa: "R$ 2.200,00",
  },
  {
    cargo: "Colaborador IC",
    formacao: "Iniciação Científica",
    obrigatorio: false,
    bolsista: "Luiz Miguel Costa",
    inicio: "Mês 2",
    duracao: "10 meses",
    cargaHoraria: "20h/mês",
    maturidade: "Iniciante",
    vinculo: "Interno UFG",
    fonte: "EMBRAPII",
    competencia: "Apoio Técnico",
    bolsa: "R$ 700,00",
  },
];

// Slot proposto, aguardando análise (exibido como card "fantasma").
const SLOT_EM_ANALISE: Slot = {
  cargo: "Colaborador DTI-C",
  formacao: "Mestrado",
  obrigatorio: false,
  bolsista: "Vaga em aberto",
  inicio: "Mês 4",
  duracao: "8 meses",
  cargaHoraria: "40h/mês",
  maturidade: "Pleno",
  vinculo: "Externo",
  fonte: "EMBRAPII",
  competencia: "Desenvolvimento",
  bolsa: "R$ 3.000,00",
};

const ATIVIDADES_POR_CARGO: Record<string, string[]> = {
  Coordenador: [
    "Coordenar a execução técnica e administrativa do projeto",
    "Acompanhar entregas, prazos e indicadores de desempenho",
    "Reportar status à EMBRAPII e à empresa parceira",
    "Aprovar contratações e ajustes de equipe",
  ],
  "Vice-Coordenador": [
    "Apoiar a coordenação na gestão técnica das macroentregas",
    "Substituir o coordenador em reuniões e decisões pontuais",
    "Acompanhar a execução das atividades dos pesquisadores",
  ],
  "Pesquisador Sênior": [
    "Definir a arquitetura técnica das soluções propostas",
    "Orientar pesquisadores júnior e bolsistas DTI",
    "Conduzir experimentos e validações de modelos",
    "Redigir relatórios técnicos e artigos científicos",
  ],
  "Colaborador DTI-A": [
    "Implementar módulos de software conforme especificação",
    "Realizar revisão de código e testes automatizados",
    "Documentar componentes e APIs desenvolvidos",
  ],
  "Colaborador DTI-B": [
    "Apoiar o desenvolvimento de protótipos funcionais",
    "Executar tarefas de integração e configuração de ambientes",
    "Auxiliar na coleta e tratamento de dados",
  ],
  "Colaborador IC": [
    "Apoiar atividades de pesquisa sob supervisão",
    "Realizar levantamento bibliográfico e documentação",
    "Auxiliar na execução de experimentos",
  ],
};

const ACTIVITY_LIST_OPTIONS: { id: string; cargo: string; nome?: string; atividades: string[] }[] =
  SLOTS.map((s, i) => ({
    id: `${i}-${s.cargo}`,
    cargo: s.cargo,
    nome: s.bolsista !== "Vaga em aberto" ? s.bolsista : undefined,
    atividades: ATIVIDADES_POR_CARGO[s.cargo] ?? [],
  }));

function SlotsCriadosView({
  editing,
  mode = "ambos",
  onEditClick,
  onCancelClick,
}: {
  editing: boolean;
  mode?: FinanceiroEquipeMode;
  onEditClick?: () => void;
  onCancelClick?: () => void;
}) {
  const [slotDialogOpen, setSlotDialogOpen] = useState(false);
  const showInlineEdit = mode === "equipe";

  return (
    <section className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-base font-semibold">Slots Criados</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            {showInlineEdit ? (
              <>
                Clique em <span className="font-medium text-foreground">Editar</span>{" "}
                para ajustar slots da equipe do projeto.
              </>
            ) : (
              "Gerencie os slots de equipe do projeto."
            )}
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          {showInlineEdit && editing && (
            <button
              type="button"
              onClick={onCancelClick}
              className="inline-flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm font-medium hover:bg-muted transition-colors"
            >
              <X className="size-4" />
              Cancelar
            </button>
          )}
          {showInlineEdit && (
            <button
              type="button"
              onClick={onEditClick}
              className={cn(
                "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                editing
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "bg-sky-700 text-white hover:bg-sky-800"
              )}
            >
              {editing ? (
                <>
                  <Check className="size-4" />
                  Concluir edição
                </>
              ) : (
                <>
                  <Pencil className="size-4" />
                  Editar
                </>
              )}
            </button>
          )}
          {editing && (
            <button
              type="button"
              onClick={() => setSlotDialogOpen(true)}
              className="shrink-0 inline-flex items-center gap-2 rounded-md bg-sky-700 px-3 py-2 text-sm font-medium text-white hover:bg-sky-800 transition-colors"
            >
              <Plus className="size-4" />
              Adicionar Slot
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {SLOTS.map((s, i) => {
          const lastObrigatorioIdx = SLOTS.reduce(
            (acc, slot, idx) => (slot.obrigatorio ? idx : acc),
            -1
          );
          return (
            <Fragment key={i}>
              <SlotCard
                slot={s}
                editing={editing}
                onEdit={() => setSlotDialogOpen(true)}
              />
              {i === lastObrigatorioIdx && (
                <SlotCard slot={SLOT_EM_ANALISE} editing={editing} emAnalise />
              )}
            </Fragment>
          );
        })}
      </div>

      <NewSlotDialog
        open={slotDialogOpen}
        onClose={() => setSlotDialogOpen(false)}
        onSave={() => setSlotDialogOpen(false)}
        activityListOptions={ACTIVITY_LIST_OPTIONS}
      />
    </section>
  );
}

function SlotCard({
  slot,
  editing,
  onEdit,
  emAnalise = false,
}: {
  slot: Slot;
  editing: boolean;
  onEdit?: () => void;
  emAnalise?: boolean;
}) {
  const fields: { label: string; value: string }[] = [
    { label: "Início", value: slot.inicio },
    { label: "Duração", value: slot.duracao },
    { label: "Carga Horária", value: slot.cargaHoraria },
    { label: "Maturidade", value: slot.maturidade },
    { label: "Vínculo", value: slot.vinculo },
    { label: "Fonte", value: slot.fonte },
    { label: "Competência", value: slot.competencia },
  ];

  return (
    <div
      className={cn(
        "group relative rounded-xl border bg-card overflow-hidden flex flex-col transition-shadow hover:shadow-md",
        editing && "ring-2 ring-primary/30",
        emAnalise && "ring-2 ring-amber-400"
      )}
    >
      {emAnalise && <EmAnaliseBadge />}
      {editing && !emAnalise && (
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
          <button
            type="button"
            onClick={onEdit}
            aria-label="Editar slot"
            title="Editar slot"
            className="inline-flex items-center justify-center size-7 rounded-md border bg-card shadow-sm hover:bg-accent"
          >
            <Pencil className="size-3.5" />
          </button>
          <button
            type="button"
            aria-label="Remover slot"
            title="Remover slot"
            className="inline-flex items-center justify-center size-7 rounded-md border bg-card shadow-sm text-destructive hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      <div className={cn("px-4 pt-4 pb-3 border-b bg-sky-700 text-white", emAnalise && "opacity-50")}>
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-base font-semibold leading-tight">{slot.cargo}</h4>
          <div
            className={cn(
              "flex flex-wrap items-center justify-end gap-1.5 shrink-0",
              editing && "pr-16"
            )}
          >
            <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[11px] font-medium text-white/90">
              <GraduationCap className="size-3" />
              {slot.formacao}
            </span>
            {slot.obrigatorio && (
              <span className="inline-flex items-center rounded-full bg-red-600 px-2 py-0.5 text-[11px] font-semibold text-white">
                OBRIGATÓRIO
              </span>
            )}
          </div>
        </div>
      </div>

      <div className={cn("p-4 space-y-2 text-sm flex-1", emAnalise && "opacity-50")}>
        <div className="flex items-baseline justify-between gap-4">
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            Bolsista
          </span>
          <span
            className={cn(
              "text-right font-medium truncate",
              slot.bolsista === "Vaga em aberto" && "text-muted-foreground italic font-normal"
            )}
          >
            {slot.bolsista}
          </span>
        </div>
        {fields.map((f) => (
          <div key={f.label} className="flex items-baseline justify-between gap-4">
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
              {f.label}
            </span>
            <span className="text-right truncate">{f.value}</span>
          </div>
        ))}
      </div>

      <div className={cn("px-4 py-3 border-t flex items-center justify-between", emAnalise && "opacity-50")}>
        <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          Bolsa
        </span>
        <span className="inline-flex items-center rounded-md bg-emerald-100 px-2 py-0.5 text-base font-semibold tabular-nums text-emerald-900">
          {slot.bolsa}
        </span>
      </div>
    </div>
  );
}

// ── Aba Plano de Trabalho (Proposta 2) ─────────────────────────────────────────
type PtrVersion = {
  versao: string;
  data: string;
  autor: string;
  resumo: string;
  origem?: string;
  atual?: boolean;
};

const PTR_VERSIONS: PtrVersion[] = [
  {
    versao: "v1.4",
    data: "12/05/2026",
    autor: "Mariana Alves",
    resumo: "Inclusão do colaborador DTI-B e ajuste de sub-rubrica em Material de Consumo.",
    origem: "REQ-2025-014",
    atual: true,
  },
  {
    versao: "v1.3",
    data: "20/03/2026",
    autor: "Mariana Alves",
    resumo: "Suplementação de R$ 10.000 na rubrica Material de Consumo (Fonte EMBRAPII).",
    origem: "REQ-2025-009",
  },
  {
    versao: "v1.2",
    data: "08/01/2026",
    autor: "Mariana Alves",
    resumo: "Prorrogação de vigência em 6 parcelas para Renata Braga.",
    origem: "REQ-2024-042",
  },
  {
    versao: "v1.1",
    data: "15/10/2025",
    autor: "Mariana Alves",
    resumo: "Ajuste de carga horária do bolsista Lucas Andrade.",
    origem: "REQ-2024-031",
  },
  {
    versao: "v1.0",
    data: "01/08/2025",
    autor: "Mariana Alves",
    resumo: "Versão inicial do PTR submetida no kick-off do projeto.",
  },
];

function PlanoTrabalhoTab({ propostaNumero = 2 }: { propostaNumero?: 1 | 2 }) {
  const [subTab, setSubTab] = useState<"solicitacoes" | "historico">("solicitacoes");

  const subTabs = [
    {
      key: "solicitacoes" as const,
      label: "Solicitações de Alteração",
      icon: <Inbox className="size-4" />,
    },
    {
      key: "historico" as const,
      label: "Histórico de Plano de Trabalho (PTR)",
      icon: <History className="size-4" />,
    },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-xl border bg-card overflow-hidden">
        <div className="px-5 pt-4">
          <h3 className="text-sm font-semibold">Plano de Trabalho (PTR)</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Acompanhe o histórico de versões do PTR e as solicitações de alteração em
            análise. Ao salvar uma atualização no PTR, uma nova versão será criada e
            listada na aba de histórico.
          </p>
        </div>
        <div className="p-5">
          <div className="flex w-full rounded-lg border bg-muted p-1 gap-1">
            {subTabs.map((t) => {
              const active = t.key === subTab;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setSubTab(t.key)}
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
        </div>
      </section>

      {subTab === "solicitacoes" && (
        <SolicitacoesAlteracaoView propostaNumero={propostaNumero} />
      )}
      {subTab === "historico" && <HistoricoPtrView />}
    </div>
  );
}

function SolicitacoesAlteracaoView({
  propostaNumero = 2,
}: {
  propostaNumero?: 1 | 2;
}) {
  const ajustes: AjusteSolicitacao[] = MOCK_AJUSTES_SOLICITACAO;

  return (
    <section className="space-y-4">
      {ajustes.length === 0 ? (
        <div className="rounded-xl border bg-card p-10 flex flex-col items-center text-center gap-2 text-muted-foreground">
          <span className="inline-flex size-12 items-center justify-center rounded-full bg-muted">
            <Inbox className="size-5" />
          </span>
          <p className="text-sm">Nenhuma solicitação de ajuste no momento.</p>
        </div>
      ) : (
        ajustes.map((a) => (
          <AjusteSolicitacaoCard
            key={a.id}
            ajuste={a}
            aguardandoAssinatura={propostaNumero === 1}
          />
        ))
      )}
    </section>
  );
}

type AjusteItem = {
  titulo: string;
  detalhe: string;
  /** Cor de destaque opcional por item (sobrepõe o accent da seção). */
  accent?: "emerald" | "sky" | "rose" | "amber";
};
type AjusteSolicitacao = {
  id: string;
  ordinal: string;
  data: string;
  solicitante: string;
  inclusoes: AjusteItem[];
  alteracoes: AjusteItem[];
  exclusoes: AjusteItem[];
  rubricas: AjusteItem[];
  documentos: string[];
};

const MOCK_AJUSTES_SOLICITACAO: AjusteSolicitacao[] = [
  {
    id: "ajuste-1",
    ordinal: "1ª Ajuste",
    data: "14/03/2024",
    solicitante: "Maria Silva Santos",
    inclusoes: [
      {
        titulo: "Inclusão de Bolsista - Maria José",
        detalhe:
          "Maria José, CPF: 111.111.111-11, Discente, 20h, 12 parcelas no valor de R$ 1.000, a partir de 01/01/22, EMBRAPII",
      },
      {
        titulo: "Inclusão de Bolsista - João da Silva",
        detalhe:
          "João da Silva, CPF: 111.111.111-11, Discente, 20h, 12 parcelas no valor de R$ 1.000, a partir de 01/01/22, EMBRAPII",
      },
      {
        titulo: "Inclusão de Bolsista - Mariazinha Silva",
        detalhe:
          "Mariazinha Silva, CPF: 111.111.111-11, Discente, 20h, 12 parcelas no valor de R$ 1.000, a partir de 01/01/22, EMBRAPII",
      },
    ],
    alteracoes: [
      {
        titulo: "Prorrogação da vigência - Joãozinho Silva",
        detalhe: "[nome_bolsista], acrescentar X parcelas - Fonte F",
      },
    ],
    exclusoes: [
      {
        titulo: "Distrato de Bolsista - Carol Carolina",
        detalhe: "Carol Carolina, reduzir 05 parcelas de R$ 1.000, Fonte EMBRAPII",
      },
    ],
    rubricas: [
      {
        titulo: "Suplementação de Rubrica - Material de Consumo",
        detalhe: "Acrescentar R$ 6.500,00 na fonte EMBRAPII",
        accent: "emerald",
      },
      {
        titulo: "Anulação em Outras Rubricas - Serviços de Terceiros (PJ)",
        detalhe: "Reduzir R$ 6.500,00 na fonte EMBRAPII",
        accent: "rose",
      },
    ],
    documentos: ["Carta de Readequação do Plano de Trabalho", "Plano de Trabalho"],
  },
];

function AjusteSolicitacaoCard({
  ajuste,
  aguardandoAssinatura = false,
}: {
  ajuste: AjusteSolicitacao;
  aguardandoAssinatura?: boolean;
}) {
  const [docsGerados, setDocsGerados] = useState(aguardandoAssinatura);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const statusBadge = aguardandoAssinatura
    ? {
        label: "Aguardando assinatura",
        bg: "bg-sky-100 text-sky-800",
        dot: "bg-sky-500",
      }
    : docsGerados
    ? {
        label: "Aguardando assinatura",
        bg: "bg-sky-100 text-sky-800",
        dot: "bg-sky-500",
      }
    : {
        label: "Aguardando geração",
        bg: "bg-amber-100 text-amber-800",
        dot: "bg-amber-500",
      };

  return (
    <article className="rounded-xl border bg-card overflow-hidden">
      <header className="px-5 py-4 border-b bg-muted/30">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <h3 className="text-base font-semibold">{ajuste.ordinal}</h3>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="size-3.5" />
                Solicitado em {ajuste.data}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <User className="size-3.5" />
                Solicitante {ajuste.solicitante}
              </span>
            </div>
          </div>
          <span
            className={cn(
              "shrink-0 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider",
              statusBadge.bg
            )}
          >
            <span className={cn("size-1.5 rounded-full", statusBadge.dot)} />
            {statusBadge.label}
          </span>
        </div>
      </header>

      <div className="p-5 space-y-5">
        <AjusteSection
          titulo="Inclusões"
          itens={ajuste.inclusoes}
          icon={<UserPlus className="size-3" />}
          accent="emerald"
        />
        <AjusteSection
          titulo="Alterações"
          itens={ajuste.alteracoes}
          icon={<RefreshCw className="size-3" />}
          accent="sky"
        />
        <AjusteSection
          titulo="Exclusões"
          itens={ajuste.exclusoes}
          icon={<UserMinus className="size-3" />}
          accent="rose"
        />
        <AjusteSection
          titulo="Rubricas"
          itens={ajuste.rubricas}
          icon={<Coins className="size-3" />}
          accent="amber"
        />

        <hr className="border-t border-border" />

        {!docsGerados ? (
          <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-5 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-5">
              <div className="size-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-sm">
                <FileSignature className="size-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-semibold">
                  Pronto para gerar os documentos?
                </h4>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Confira se as edições nas abas{" "}
                  <span className="font-medium text-foreground">Financeiro</span> e{" "}
                  <span className="font-medium text-foreground">Equipe</span> já
                  refletem todos os itens desta solicitação. Em seguida, emita a
                  Carta de Readequação e o Plano de Trabalho atualizado.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-3 text-sm font-semibold transition-all shrink-0 w-full md:w-auto hover:opacity-90 shadow-md hover:shadow-lg"
              >
                <FileSignature className="size-4" />
                Gerar carta e plano de trabalho
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h4 className="text-sm font-semibold mb-2">Documentos Gerados</h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ajuste.documentos.map((doc) => (
                <li
                  key={doc}
                  className="flex items-center justify-between gap-3 rounded-lg border bg-background px-3 py-2"
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <FileText className="size-4 text-sky-700 shrink-0" />
                    <span className="text-sm font-medium text-foreground truncate">
                      {doc}
                    </span>
                  </span>
                  <button
                    type="button"
                    aria-label={`Baixar ${doc}`}
                    title="Baixar"
                    className="shrink-0 inline-flex items-center justify-center rounded-md bg-sky-700 text-white p-2 hover:bg-sky-800 transition-colors"
                  >
                    <FileDown className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <GerarCartaConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        ajuste={ajuste}
        onConfirm={() => {
          setConfirmOpen(false);
          setDocsGerados(true);
        }}
      />
    </article>
  );
}

function GerarCartaConfirmDialog({
  open,
  onOpenChange,
  ajuste,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  ajuste: AjusteSolicitacao;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="inline-flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
              <FileSignature className="size-4" />
            </span>
            Gerar carta e plano de trabalho
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Confirme se todas as edições nas abas{" "}
            <span className="font-medium text-foreground">Financeiro</span> e{" "}
            <span className="font-medium text-foreground">Equipe</span> já foram
            concluídas e refletem os itens desta solicitação. A carta seguirá para
            assinatura do coordenador. Se ainda houver edições pendentes, volte às
            abas correspondentes antes de gerar.
          </p>
          <p className="text-sm text-muted-foreground">
            Ao confirmar, serão gerados:
          </p>
          <ul className="space-y-1.5 rounded-lg border bg-muted/30 px-3 py-2">
            {ajuste.documentos.map((doc) => (
              <li
                key={doc}
                className="flex items-center gap-2 text-sm text-foreground"
              >
                <FileText className="size-4 text-sky-700 shrink-0" />
                {doc}
              </li>
            ))}
          </ul>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="inline-flex items-center justify-center rounded-md border bg-background px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 shadow-sm transition-all"
          >
            <FileSignature className="size-4" />
            Confirmar e gerar
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AjusteSection({
  titulo,
  itens,
  icon,
  accent,
}: {
  titulo: string;
  itens: AjusteItem[];
  icon: React.ReactNode;
  accent: "emerald" | "sky" | "rose" | "amber";
}) {
  if (itens.length === 0) return null;

  const accentClass = {
    emerald: "bg-emerald-100 text-emerald-700",
    sky: "bg-sky-100 text-sky-700",
    rose: "bg-rose-100 text-rose-700",
    amber: "bg-amber-100 text-amber-700",
  }[accent];

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span
          className={cn(
            "inline-flex size-5 items-center justify-center rounded-sm",
            accentClass
          )}
        >
          {icon}
        </span>
        <h4 className="text-sm font-semibold">
          {titulo}{" "}
          <span className="text-muted-foreground font-normal tabular-nums">
            ({itens.length})
          </span>
        </h4>
      </div>
      <ul className="space-y-2">
        {itens.map((item, i) => (
          <AjusteItemRow key={i} item={item} accent={accent} />
        ))}
      </ul>
    </div>
  );
}

function AjusteItemRow({
  item,
  accent,
}: {
  item: AjusteItem;
  accent: "emerald" | "sky" | "rose" | "amber";
}) {
  const resolvedAccent = item.accent ?? accent;
  const accentStyles = {
    emerald: {
      container: "border-l-4 border-l-emerald-700 bg-emerald-50/60",
      title: "text-emerald-700",
    },
    sky: {
      container: "border-l-4 border-l-sky-700 bg-sky-50/60",
      title: "text-sky-700",
    },
    rose: {
      container: "border-l-4 border-l-rose-700 bg-rose-50/60",
      title: "text-rose-700",
    },
    amber: {
      container: "border-l-4 border-l-amber-600 bg-amber-50/60",
      title: "text-amber-700",
    },
  }[resolvedAccent];

  return (
    <li
      className={cn(
        "rounded-lg border overflow-hidden px-3 py-2.5",
        accentStyles.container
      )}
    >
      <p className={cn("text-sm font-semibold", accentStyles.title)}>
        {item.titulo}
      </p>
      <p className="text-xs text-muted-foreground leading-relaxed mt-1">
        {item.detalhe}
      </p>
    </li>
  );
}

function HistoricoPtrView() {
  return (
    <section className="rounded-xl border bg-card overflow-hidden">
      <div className="p-5">
        <PlaceholderContent
          icon={<History className="size-5" />}
          titulo="Conteúdo da tela"
          descricao="Histórico de Plano de Trabalho (PTR)"
        />
      </div>
    </section>
  );
}

