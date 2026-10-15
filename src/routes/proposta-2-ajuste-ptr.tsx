import { createFileRoute } from "@tanstack/react-router";
import { PropostaAjustePtrView } from "@/components/ptr/PropostaAjustePtrView";

export const Route = createFileRoute("/proposta-2-ajuste-ptr")({
  head: () => ({
    meta: [
      { title: "Proposta 2 — Ajuste de PTR — Portal CEIA" },
      { name: "description", content: "Proposta 2 de ajuste do Plano de Trabalho." },
    ],
  }),
  component: () => <PropostaAjustePtrView propostaNumero={2} />,
});
