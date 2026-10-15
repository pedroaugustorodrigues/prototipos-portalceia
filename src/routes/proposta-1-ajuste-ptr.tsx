import { createFileRoute } from "@tanstack/react-router";
import { PropostaAjustePtrView } from "@/components/ptr/PropostaAjustePtrView";

export const Route = createFileRoute("/proposta-1-ajuste-ptr")({
  head: () => ({
    meta: [
      { title: "Proposta 1 — Ajuste de PTR — Portal CEIA" },
      { name: "description", content: "Proposta 1 de ajuste do Plano de Trabalho." },
    ],
  }),
  component: () => <PropostaAjustePtrView propostaNumero={1} />,
});
