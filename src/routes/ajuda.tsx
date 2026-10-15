import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/ajuda")({
  head: () => ({ meta: [{ title: "Ajuda — Portal CEIA" }] }),
  component: () => (
    <div className="p-10 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold">Ajuda</h1>
      <p className="text-muted-foreground mt-2">Documentação e suporte em breve.</p>
    </div>
  ),
});