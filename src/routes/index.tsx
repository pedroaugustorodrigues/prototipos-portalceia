import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    const raw =
      typeof window !== "undefined"
        ? window.localStorage.getItem("ceia.activeProfile")
        : null;
    throw redirect({
      to: raw === "pmo" ? "/projetos-pmo" : "/central-solicitacoes",
    });
  },
});
