import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/central-solicitacoes")({
  component: () => <Outlet />,
});