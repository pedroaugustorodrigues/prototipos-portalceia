import { useMemo, useState } from "react";
import { Search, UserCircle2, Plus, X, Database } from "lucide-react";
import { cn } from "@/lib/utils";

type Talent = {
  id: string;
  name: string;
  cpf: string;
  vinculo: "Docente" | "Discente" | "Técnico" | "Externo";
  formacao: string;
  email: string;
  /** True quando o colaborador não tem vínculo com a instituição. */
  externo?: boolean;
  /** Carga horária disponível/exercida (ex: "20h", "40h") */
  cargaHoraria?: string;
  rg?: string;
  dob?: string; // DD/MM/AAAA
  phone?: string;
};

export const TALENTS: Talent[] = [
  { id: "t1", name: "João da Silva", cpf: "111.111.111-11", vinculo: "Discente", formacao: "Mestrando em Engenharia de Software — UFG", email: "joao.silva@discente.ufg.br", cargaHoraria: "20h", rg: "12.345.678-9", dob: "10/02/1996", phone: "(62) 99999-1111" },
  { id: "t2", name: "Maria Rezende", cpf: "222.222.222-22", vinculo: "Docente", formacao: "Doutora em Ciência da Computação — UFG", email: "maria.rezende@ufg.br", cargaHoraria: "40h", rg: "98.765.432-1", dob: "05/06/1980", phone: "(62) 98888-2222" },
  { id: "t3", name: "Luiz Miguel Costa", cpf: "333.333.333-33", vinculo: "Discente", formacao: "Graduando em Engenharia de Computação — UFG", email: "luiz.miguel@discente.ufg.br", cargaHoraria: "20h", rg: "23.456.789-0", dob: "20/11/1998", phone: "(62) 97777-3333" },
  { id: "t4", name: "Ana Paula Souza", cpf: "444.444.444-44", vinculo: "Técnico", formacao: "Especialista em Gestão de Projetos — UFG", email: "ana.souza@ufg.br", cargaHoraria: "30h", rg: "34.567.890-1", dob: "01/03/1985", phone: "(62) 96666-4444" },
  { id: "t5", name: "Carlos Henrique Lima", cpf: "555.555.555-55", vinculo: "Externo", formacao: "Mestre em IA — PUC-GO", email: "carlos.lima@externo.com", externo: true, cargaHoraria: "10h", rg: "45.678.901-2", dob: "15/07/1987", phone: "(62) 95555-5555" },
  { id: "t6", name: "Renata Oliveira", cpf: "666.666.666-66", vinculo: "Docente", formacao: "Doutora em Engenharia Elétrica — UFG", email: "renata.oliveira@ufg.br", cargaHoraria: "40h", rg: "56.789.012-3", dob: "22/09/1978", phone: "(62) 94444-6666" },
  { id: "t7", name: "Bruno Albuquerque", cpf: "777.777.777-77", vinculo: "Externo", formacao: "Doutor em Visão Computacional — USP", email: "bruno.alb@externo.com", externo: true, cargaHoraria: "12h", rg: "67.890.123-4", dob: "30/12/1982", phone: "(62) 93333-7777" },
  { id: "t8", name: "Fernanda Tavares", cpf: "888.888.888-88", vinculo: "Discente", formacao: "Doutoranda em IA — UFG", email: "fernanda.tavares@discente.ufg.br", cargaHoraria: "20h", rg: "78.901.234-5", dob: "07/04/1994", phone: "(62) 92222-8888" },
  { id: "t9", name: "Patrícia Mendonça (Externa)", cpf: "999.111.222-33", vinculo: "Externo", formacao: "Doutora em Aprendizado de Máquina — UnB", email: "patricia.mendonca@externo.com", externo: true, cargaHoraria: "8h", rg: "89.012.345-6", dob: "12/01/1981", phone: "(62) 91111-9999" },
  { id: "t10", name: "Felipinho Fernandes (Externo)", cpf: "321.654.987-00", vinculo: "Externo", formacao: "Mestre em Engenharia da Computação — UTFPR", email: "felipinho.fernandes@externo.com", externo: true, cargaHoraria: "15h", rg: "90.123.456-7", dob: "03/10/1990", phone: "(62) 90000-1111" },
  { id: "t11", name: "Thiago Neto (Externo)", cpf: "456.789.123-00", vinculo: "Externo", formacao: "Doutor em Ciência da Computação — UFMG", email: "thiago.neto@externo.com", externo: true, cargaHoraria: "20h", rg: "11.222.333-4", dob: "28/02/1983", phone: "(62) 98888-3333" },
];

export function TalentSearch({ onPick }: { onPick: (talent: Talent) => void }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<Talent[]>([]);

  const results = useMemo(() => {
    if (!query.trim()) return TALENTS.slice(0, 4);
    const q = query.toLowerCase();
    return TALENTS.filter(
      (t) => t.name.toLowerCase().includes(q) || t.cpf.includes(q) || t.email.toLowerCase().includes(q) || t.formacao.toLowerCase().includes(q)
    );
  }, [query]);

  function handlePick(t: Talent) {
    if (picked.some((p) => p.id === t.id)) return;
    setPicked((prev) => [...prev, t]);
    onPick(t);
    setQuery("");
    setOpen(false);
  }

  return (
    <div className="rounded-lg border bg-background p-3 mb-4">
      <div className="flex items-center gap-2 mb-2">
        <Database className="size-4 text-primary" />
        <span className="text-sm font-medium">Buscar colaborador</span>
        <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary-soft text-primary font-semibold">
          Auto-preenchimento
        </span>
      </div>
      <p className="text-xs text-muted-foreground mb-2">
        Pesquise por nome, CPF, e-mail ou formação. Ao selecionar, os dados básicos serão pré-preenchidos abaixo.
      </p>

      <div className="relative">
        <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Digite o nome, CPF ou e-mail..."
          className="w-full h-10 pl-10 pr-4 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />

        {open && results.length > 0 && (
          <div className="absolute z-10 left-0 right-0 mt-1 rounded-md border bg-popover shadow-lg max-h-72 overflow-auto">
            {results.map((t) => {
              const isPicked = picked.some((p) => p.id === t.id);
              return (
                <button
                  key={t.id}
                  onClick={() => handlePick(t)}
                  disabled={isPicked}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-accent transition-colors border-b last:border-b-0",
                    isPicked && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <UserCircle2 className="size-8 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{t.name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {t.vinculo} • {t.cpf} • {t.formacao}
                    </div>
                  </div>
                  {isPicked ? (
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground">Adicionado</span>
                  ) : (
                    <Plus className="size-4 text-primary" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {picked.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {picked.map((p) => (
            <span
              key={p.id}
              className="inline-flex items-center gap-2 text-xs bg-primary-soft text-primary border border-primary/20 rounded-full pl-2 pr-1 py-1 font-medium"
            >
              {p.name}
              <button
                onClick={() => setPicked((prev) => prev.filter((x) => x.id !== p.id))}
                className="rounded-full p-0.5 text-muted-foreground hover:bg-muted/10 transition duration-150 ease-out transform hover:scale-105 motion-reduce:transform-none"
                title="Remover"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export type { Talent };