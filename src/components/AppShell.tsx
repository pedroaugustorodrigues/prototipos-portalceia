import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  FileEdit,
  LogOut,
  FolderKanban,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronsUpDown,
  Check,
  BarChart3,
  ChevronRight,
  Inbox,
  UserPlus,
  Wallet,
  Rocket,
  UserRound,
  HelpCircle,
  MessageSquare,
  Menu,
  ClipboardList,
  Receipt,
} from "lucide-react";
import logo from "@/assets/logo.png";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { PROFILES, setActiveProfile, useActiveProfile } from "@/lib/profile";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type ProfileFilter = "coordenadora" | "administrador" | "admin" | "corretor-congressos" | "pesquisador" | "pmo";

type NavChild = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  onlyFor?: Array<ProfileFilter>;
};

type NavItem = {
  to?: string;
  label: string;
  icon: typeof LayoutDashboard;
  /** Se true, mostra como item de menu em destaque, mas sem navegação. */
  disabled?: boolean;
  /** Se definido, o item só aparece para os perfis listados. */
  onlyFor?: Array<ProfileFilter>;
  /** Submenus colapsáveis. */
  children?: NavChild[];
};

const nav: NavItem[] = [
  { to: "/projetos-pmo", label: "Projetos (coordenador)", icon: FolderKanban, onlyFor: ["pmo"] },
  { to: "/onboarding-projeto", label: "Painel PMO", icon: Rocket, onlyFor: ["pmo"] },
  // Itens fictícios exclusivos do pesquisador (sem navegação real — disabled).
  { label: "Dashboard", icon: LayoutDashboard, onlyFor: ["pesquisador"], disabled: true },
  { label: "Projetos", icon: FolderKanban, onlyFor: ["pesquisador"], disabled: true },
  { to: "/projetos", label: "Contrato Final (Nova)", icon: FolderKanban, onlyFor: ["coordenadora", "administrador", "admin", "corretor-congressos"] },
  { to: "/carta-sebrae", label: "Carta SEBRAE", icon: FolderKanban, onlyFor: ["coordenadora", "administrador", "admin", "corretor-congressos"] },
  { to: "/projeto-pesquisa", label: "Projeto de Pesquisa", icon: FolderKanban, onlyFor: ["coordenadora", "administrador", "admin", "corretor-congressos"] },
  {
    to: "/central-solicitacoes",
    label: "Central de Solicitações",
    icon: FileEdit,
    onlyFor: ["coordenadora", "administrador", "admin", "corretor-congressos", "pesquisador"],
    children: [
      {
        to: "/central-solicitacoes/historico-geral",
        label: "Histórico geral",
        icon: Inbox,
        onlyFor: ["admin"],
      },
    ],
  },
  { to: "/relatorio-bolsas", label: "Equipe Administrativa", icon: BarChart3, onlyFor: ["administrador"] },
  { to: "/proposta-1-ajuste-ptr", label: "Proposta 1 Ajuste de PTR", icon: ClipboardList, onlyFor: ["admin"] },
  { to: "/proposta-2-ajuste-ptr", label: "Proposta 2 Ajuste de PTR", icon: ClipboardList, onlyFor: ["admin"] },
  { to: "/fluxo-pagamento", label: "Fluxo de Pagamento", icon: Wallet, onlyFor: ["admin"] },
  { to: "/cadastro-bolsistas", label: "Controle de Cadastramento de Bolsistas", icon: UserPlus, onlyFor: ["admin"] },
  { to: "/notas-fiscais", label: "Notas Fiscais", icon: Receipt, onlyFor: ["admin"] },
  // Itens fictícios exclusivos do pesquisador, após a Central de Solicitações.
  { label: "Meu Perfil", icon: UserRound, onlyFor: ["pesquisador"], disabled: true },
];

export function AppShell() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const profile = useActiveProfile();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  // Auto-abre o submenu quando a rota corresponde a um pai com filhos.
  useEffect(() => {
    const next: Record<string, boolean> = {};
    for (const item of nav) {
      if (!item.children || !item.to) continue;
      const isOnBranch =
        pathname === item.to ||
        pathname.startsWith(item.to + "/") ||
        pathname.startsWith(item.to + "?");
      if (isOnBranch) next[item.to] = true;
    }
    if (Object.keys(next).length > 0) {
      setOpenMenus((prev) => ({ ...prev, ...next }));
    }
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-muted/25">
      <aside
        className={cn(
          "hidden md:flex flex-col text-[color:var(--sidebar-fg)] sticky top-0 h-screen transition-[width] duration-200",
          collapsed ? "w-16" : "w-64"
        )}
        style={{ background: "var(--sidebar-bg)" }}
      >
        {!collapsed && (
          <button
            type="button"
            className="absolute top-2 right-2 z-10 size-7 rounded-md flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            title="Minimizar menu"
            aria-label="Minimizar menu"
          >
            <Menu className="size-4" />
          </button>
        )}
        <div className={cn("-my-4 py-0 flex items-center gap-0", collapsed ? "px-3 justify-center" : "px-6")}>
          <div className="flex items-center justify-center shrink-0 leading-none">
            <img
              src={logo}
              alt="Logo"
              className={cn(collapsed ? "h-12 w-12" : "h-45 w-45", "rounded-lg object-contain block leading-none -my-2")}
            />
          </div>
        </div>
        

        {!collapsed && (
          <div className="px-4 mb-4">
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="w-full rounded-xl bg-white/5 hover:bg-white/10 transition-colors p-3 flex items-center gap-3 text-left"
                >
                  <div className="relative shrink-0">
                    <div className="size-10 rounded-full bg-primary/30 flex items-center justify-center font-semibold">{profile.iniciais}</div>
                    <span
                      className="absolute bottom-0 right-0 size-2 rounded-full bg-sky-400 ring-1 ring-[color:var(--sidebar-bg)]"
                      aria-hidden
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{profile.nome}</div>
                    <div className="text-[10px] uppercase tracking-wider font-semibold text-sky-400 truncate mt-0.5">{profile.cargo}</div>
                  </div>
                  <ChevronsUpDown className="size-4 opacity-60 shrink-0" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" sideOffset={8} className="w-64 p-1">
                <div className="px-2 py-1.5 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Trocar perfil</div>
                {PROFILES.map((p) => {
                  const active = p.id === profile.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setActiveProfile(p.id);
                        navigate({ to: p.id === "pmo" ? "/projetos-pmo" : "/central-solicitacoes" });
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 rounded-md px-2 py-2 text-left text-sm transition-colors",
                        active ? "bg-accent" : "hover:bg-accent"
                      )}
                    >
                      <div className="size-9 rounded-full bg-primary/15 text-primary flex items-center justify-center font-semibold text-xs shrink-0">{p.iniciais}</div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium truncate text-foreground">{p.nome}</div>
                        <div className="text-xs text-muted-foreground truncate">{p.cargo}</div>
                      </div>
                      {active && <Check className="size-4 text-primary shrink-0" />}
                    </button>
                  );
                })}
              </PopoverContent>
            </Popover>
          </div>
        )}

        <nav className={cn("space-y-1 flex-1 min-h-0 overflow-y-auto", collapsed ? "px-2" : "px-3")}>
          {!collapsed && (
            <div className="px-3 pb-2 text-[11px] uppercase tracking-wider opacity-60">Menu</div>
          )}
          {nav.map((item) => {
            if (profile.id === "pesquisador" && (item.to === "/projetos" || item.to === "/projetos-pesquisa")) {
              return null;
            }
            if (item.onlyFor && !item.onlyFor.includes(profile.id)) {
              return null;
            }
            const visibleChildren = (item.children ?? []).filter(
              (c) => !c.onlyFor || c.onlyFor.includes(profile.id)
            );
            // Se a rota atual corresponde a um submenu deste item, o pai não
            // deve ficar marcado como ativo — apenas o submenu fica destacado.
            const onChildRoute = visibleChildren.some(
              (c) =>
                pathname === c.to ||
                pathname.startsWith(c.to + "/") ||
                pathname.startsWith(c.to + "?")
            );
            const active =
              !!item.to &&
              !onChildRoute &&
              (pathname === item.to ||
                (item.to !== "/" &&
                  (pathname.startsWith(item.to + "/") ||
                    pathname.startsWith(item.to + "?"))));
            const Icon = item.icon;
            const hasChildren = visibleChildren.length > 0;
            const isOpen = item.to ? !!openMenus[item.to] : false;
            const baseClass = cn(
              "relative flex items-center rounded-lg text-sm transition-colors w-full",
              collapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5",
              active
                ? "bg-white/10 text-white font-medium before:content-[''] before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-[3px] before:bg-white"
                : item.disabled
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-white/5 opacity-90"
            );
            const inner = (
              <>
                <Icon className="size-4 shrink-0" />
                {!collapsed && <span className="truncate flex-1 text-left">{item.label}</span>}
                {!collapsed && hasChildren && (
                  <ChevronRight
                    className={cn(
                      "size-4 shrink-0 opacity-70 transition-transform",
                      isOpen && "rotate-90"
                    )}
                  />
                )}
              </>
            );
            if (item.disabled || !item.to) {
              return (
                <div key={item.label} className={baseClass} title={collapsed ? item.label : undefined}>
                  {inner}
                </div>
              );
            }
            // Item com submenu colapsável (apenas quando a sidebar está expandida).
            if (hasChildren && !collapsed) {
              const toggle = (e: React.MouseEvent) => {
                // Permite navegar ao clicar; o chevron alterna abrir/fechar.
                if ((e.target as HTMLElement).closest("[data-submenu-toggle]")) {
                  e.preventDefault();
                  setOpenMenus((prev) => ({ ...prev, [item.to!]: !prev[item.to!] }));
                }
              };
              return (
                <div key={item.to}>
                  <Link
                    to={item.to}
                    className={baseClass}
                    onClick={toggle}
                    title={item.label}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span className="truncate flex-1 text-left">{item.label}</span>
                    <button
                      type="button"
                      data-submenu-toggle
                      aria-label={isOpen ? "Recolher" : "Expandir"}
                      aria-expanded={isOpen}
                      className="-mr-1 p-1 rounded hover:bg-white/10"
                    >
                      <ChevronRight
                        className={cn(
                          "size-4 opacity-80 transition-transform",
                          isOpen && "rotate-90"
                        )}
                      />
                    </button>
                  </Link>
                  {isOpen && (
                    <div className="mt-1 ml-4 pl-3 border-l border-white/10 space-y-1">
                      {visibleChildren.map((child) => {
                        const ChildIcon = child.icon;
                        const childActive =
                          pathname === child.to ||
                          pathname.startsWith(child.to + "/") ||
                          pathname.startsWith(child.to + "?");
                        return (
                          <Link
                            key={child.to}
                            to={child.to}
                            className={cn(
                              "relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                              childActive
                                ? "bg-white/10 text-white font-medium before:content-[''] before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-[3px] before:bg-white"
                                : "hover:bg-white/5 opacity-85"
                            )}
                          >
                            <ChildIcon className="size-3.5 shrink-0" />
                            <span className="truncate">{child.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }
            return (
              <Link
                key={item.to}
                to={item.to}
                className={baseClass}
                title={collapsed ? item.label : undefined}
              >
                {inner}
              </Link>
            );
          })}
        </nav>

        {/* Itens secundários fictícios do pesquisador (Ajuda / Feedback) —
            renderizados acima da linha do botão 'Sair', com seu próprio separador. */}
        {profile.id === "pesquisador" && (
          <div className={cn("border-t border-white/10", collapsed ? "p-2" : "px-3 py-3")}>
            <div className="space-y-1">
              <div
                className={cn(
                  "flex items-center rounded-lg text-sm transition-colors w-full opacity-50 cursor-not-allowed",
                  collapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5",
                )}
                title={collapsed ? "Central de Ajuda" : undefined}
              >
                <HelpCircle className="size-4 shrink-0" />
                {!collapsed && <span className="truncate flex-1 text-left">Central de Ajuda</span>}
              </div>
              <div
                className={cn(
                  "flex items-center rounded-lg text-sm transition-colors w-full opacity-50 cursor-not-allowed",
                  collapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5",
                )}
                title={collapsed ? "Enviar Feedback" : undefined}
              >
                <MessageSquare className="size-4 shrink-0" />
                {!collapsed && <span className="truncate flex-1 text-left">Enviar Feedback</span>}
              </div>
            </div>
          </div>
        )}

        <div className={cn("border-t border-white/10", collapsed ? "p-2" : "px-3 py-3")}>
          <button
            className={cn(
              "flex items-center rounded-lg text-sm transition-colors w-full hover:bg-white/5 opacity-90",
              collapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5"
            )}
            title="Sair"
          >
            <LogOut className="size-4 shrink-0" />
            {!collapsed && <span className="truncate flex-1 text-left">Sair</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}