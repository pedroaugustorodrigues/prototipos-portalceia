import { createFileRoute, Link } from "@tanstack/react-router";
import { FileEdit, Plane, DollarSign, Award, ChevronRight } from "lucide-react";
import { useActiveProfile } from "@/lib/profile";

export const Route = createFileRoute("/central-solicitacoes/")({
  head: () => ({
    meta: [
      { title: "Central de Solicitações — Portal CEIA" },
      { name: "description", content: "Acesse os tipos de solicitação disponíveis para os seus projetos." },
    ],
  }),
  component: CentralSolicitacoesPage,
});

type Option = {
  to: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  onlyFor?: Array<"coordenadora" | "administrador" | "admin" | "corretor-congressos" | "pesquisador">;
};

const OPTIONS: Option[] = [
  {
    to: "/central-solicitacoes/ajuste-ptr",
    title: "Ajuste de Plano de Trabalho",
    description: "Solicite ajustes no plano de trabalho do projeto",
    icon: <FileEdit className="size-5" />,
    enabled: true,
    onlyFor: ["coordenadora", "administrador", "admin", "corretor-congressos"],
  },
  // 'Cadastro de Macroentregas' removido — não existe mais
  {
    to: "/central-solicitacoes/passagens-diarias",
    title: "Passagens e Diárias",
    description: "Solicite passagens e diárias para deslocamentos",
    icon: <Plane className="size-5" />,
    enabled: true,
  },
  {
    to: "/central-solicitacoes/compras-pagamentos",
    title: "Compras e Pagamentos",
    description: "Gerencie compras e pagamentos do projeto",
    icon: <DollarSign className="size-5" />,
    enabled: true,
    onlyFor: ["coordenadora", "administrador", "admin", "corretor-congressos", "pesquisador"],
  },
  {
    to: "/central-solicitacoes/certificado",
    title: "Certificado de Participação em Projetos",
    description: "Solicite seu certificado de participação",
    icon: <Award className="size-5" />,
    enabled: true,
    onlyFor: ["coordenadora", "pesquisador"],
  },
];

function CentralSolicitacoesPage() {
  const profile = useActiveProfile();
  const visibleOptions = OPTIONS.filter((opt) => !opt.onlyFor || opt.onlyFor.includes(profile.id));
  const describe = (opt: (typeof OPTIONS)[number]) => {
    if (opt.to === "/central-solicitacoes/certificado" && profile.id === "coordenadora") {
      return "Assine os certificados de participação dos seus bolsistas e voluntários";
    }
    return opt.description;
  };
  return (
    <div className="p-6 md:p-10 w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight uppercase">Central de Solicitações</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Selecione o tipo de solicitação que deseja abrir.
        </p>
      </div>

      <div className="space-y-3">
        {visibleOptions.map((opt) => {
          const inner = (
            <div className="flex items-center gap-4 p-4 md:p-5">
              <div className="size-11 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                {opt.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-base text-foreground">{opt.title}</h3>
                  {!opt.enabled && (
                    <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-semibold">
                      Em breve
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{describe(opt)}</p>
              </div>
              <ChevronRight className="size-5 text-muted-foreground shrink-0" />
            </div>
          );
          return opt.enabled ? (
            <Link
              key={opt.title}
              to={opt.to}
              className="block rounded-xl border bg-card hover:border-primary/40 hover:shadow-md transition-all"
            >
              {inner}
            </Link>
          ) : (
            <div
              key={opt.title}
              className="block rounded-xl border bg-card opacity-60 cursor-not-allowed"
              title="Em breve"
            >
              {inner}
            </div>
          );
        })}
      </div>
    </div>
  );
}