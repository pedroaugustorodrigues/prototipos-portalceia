import { createFileRoute, Navigate } from "@tanstack/react-router";
import { AdminGeneralHistory } from "@/components/AdminGeneralHistory";
import { useActiveProfile } from "@/lib/profile";

export const Route = createFileRoute("/central-solicitacoes/historico-geral")({
  head: () => ({
    meta: [
      { title: "Histórico geral — Central de Solicitações" },
      { name: "description", content: "Histórico unificado de solicitações da Equipe Administrativa." },
    ],
  }),
  component: HistoricoGeralPage,
});

function HistoricoGeralPage() {
  const profile = useActiveProfile();
  if (profile.id !== "admin") {
    return <Navigate to="/central-solicitacoes" />;
  }
  return (
    <div className="p-6 md:p-10 w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight uppercase">Histórico Geral</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Acompanhe todas as solicitações dos projetos em um só lugar.
        </p>
      </div>
      <AdminGeneralHistory hideHeader />
    </div>
  );
}
