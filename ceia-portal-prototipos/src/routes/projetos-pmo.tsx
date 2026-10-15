import { createFileRoute } from "@tanstack/react-router";
import { ProjetosPage } from "./projetos.index";

export const Route = createFileRoute("/projetos-pmo")({
  component: () => <ProjetosPage status="execucao" />,
});
