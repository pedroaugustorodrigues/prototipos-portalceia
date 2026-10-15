import { useEffect, useState } from "react";
import { X, Search, ArrowLeft, ArrowRight, Star, RotateCcw } from "lucide-react";
import type { Talent } from "./TalentSearch";
import { searchTalents, getAiSuggestions, type CandidateSuggestion } from "@/lib/talent-service";
import { cn } from "@/lib/utils";

export function TalentPickerModal({
  open,
  onClose,
  onSelect,
  roleTitle,
  onlyManual,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (t: Talent) => void;
  roleTitle?: string;
  onlyManual?: boolean;
}) {
  const [tab, setTab] = useState<"ai" | "manual">(onlyManual ? "manual" : "ai");
  // AI suggestions
  const [aiPage, setAiPage] = useState(1);
  const [aiList, setAiList] = useState<CandidateSuggestion[]>([]);
  const [loadingAi, setLoadingAi] = useState(false);

  // Manual search
  const [q, setQ] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [cpfQuery, setCpfQuery] = useState("");
  const [page, setPage] = useState(1);
  const [list, setList] = useState<Talent[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    // reset pages
    setAiPage(1);
    setPage(1);
    // load initial data depending on mode
    if (!onlyManual) {
      refreshAi();
    }
    runSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, onlyManual]);

  // Debounced auto-search when query or skills change
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      setPage(1);
      runSearch(1);
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, skills]);

  async function refreshAi(pageParam = aiPage) {
    setLoadingAi(true);
    const res = await getAiSuggestions({ role: roleTitle || "", page: pageParam, perPage: 6 });
    setAiList(res.results);
    setAiPage(pageParam);
    setLoadingAi(false);
  }

  async function runSearch(p = page) {
    setLoading(true);
    const res = await searchTalents({ q, skills, page: p, perPage: 6 });
    setList(res.results);
    setTotal(res.total);
    setLoading(false);
  }

  function selectTalent(t: Talent) {
    onSelect(t);
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-3xl max-h-[85vh] overflow-auto rounded-2xl bg-card shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            {onlyManual ? (
              <h3 className="font-semibold">Busca manual</h3>
            ) : (
              <>
                <h3 className="font-semibold">Alocar para: {roleTitle ?? "[Função]"}</h3>
                <p className="text-xs text-muted-foreground">Busque um colaborador ou veja as sugestões da IA para esta função.</p>
              </>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-muted"><X className="size-5" /></button>
        </div>

        <div className="p-4">
          {!onlyManual && (
            <div className="w-full rounded-lg border bg-background p-1 flex">
              <>
                <button
                  onClick={() => setTab("ai")}
                  className={cn(
                    "flex-1 text-center px-4 py-2 text-sm rounded-lg inline-flex items-center justify-center gap-2",
                    tab === "ai" ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                  )}
                >
                  <Star className={cn("size-4", tab === "ai" ? "text-current" : "text-muted-foreground")} />
                  <span>Sugestão da IA</span>
                </button>
                <button
                  onClick={() => setTab("manual")}
                  className={cn(
                    "flex-1 text-center px-4 py-2 text-sm rounded-lg inline-flex items-center justify-center gap-2",
                    tab === "manual" ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                  )}
                >
                  <Search className={cn("size-4", tab === "manual" ? "text-current" : "text-muted-foreground")} />
                  <span>Busca Manual</span>
                </button>
              </>
            </div>
          )}

          {tab === "ai" && (
            <div className="mt-4">
              <div className="flex items-center justify-start gap-2 mb-3">
                <button onClick={() => refreshAi(1)} className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-3 py-2 text-sm font-semibold">
                  <RotateCcw className="size-4" />
                  Atualizar sugestões
                </button>
              </div>
              <p className="text-xs text-muted-foreground mb-3">Com base nos requisitos do projeto e na função de <strong>{roleTitle ?? "Cargo"}</strong>, estes são os candidatos mais compatíveis:</p>

              {loadingAi ? (
                <div className="text-center py-6 text-sm text-muted-foreground">Carregando sugestões…</div>
              ) : (
                <div className="space-y-3">
                  {aiList.map((s) => (
                    <div key={s.talent.id} className="rounded-lg border p-3 flex items-center gap-3">
                      <div className="flex-shrink-0 flex items-center justify-center">
                        {s.talent.photo ? (
                          <div className="size-10 rounded-full bg-primary-soft p-0.5 overflow-hidden">
                            <img src={s.talent.photo} alt={`${s.talent.name} foto`} className="w-full h-full rounded-full object-cover" />
                          </div>
                        ) : (
                          <div className="size-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                            {(() => {
                              const parts = s.talent.name.split(" ").filter(Boolean);
                              if (parts.length === 1) return parts[0][0];
                              return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
                            })()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="font-medium truncate">{s.talent.name}</div>
                          <span className={cn(
                            "text-[11px] px-2 py-0.5 rounded-full font-semibold capitalize",
                            s.talent.vinculo === "Discente"
                              ? "bg-blue-100 border border-blue-200 text-blue-700"
                              : "bg-blue-700 text-white"
                          )}>
                            {s.talent.vinculo === "Discente" ? "candidato" : "colaborador"}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground truncate">{s.talent.vinculo} • {s.talent.formacao}{s.talent.cargaHoraria ? ` • ${s.talent.cargaHoraria.replace(/\s*/g, "").replace(/(\d+)h/i, "$1h")} disponíveis` : ""}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          <span>Compatibilidade:</span>
                          <span className={cn(
                            s.compatibility >= 75 ? "text-green-600" : s.compatibility >= 50 ? "text-amber-600" : "text-red-600",
                            "font-semibold ml-1"
                          )}>{s.compatibility}%</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                          {s.summary.slice(0, 120)}{s.summary.length > 120 ? "… " : ""}
                          <button className="text-primary text-xs ml-1">Ver mais</button>
                        </div>
                      </div>
                      <div className="flex flex-col items-center justify-center gap-2 ml-3">
                        <button className="rounded-md border px-3 py-1 text-xs transition transform hover:scale-105 hover:shadow-sm">Ver Perfil</button>
                        <button onClick={() => selectTalent(s.talent)} className="rounded-md bg-primary text-primary-foreground px-3 py-1 text-xs transition transform hover:scale-105 hover:shadow-sm">Selecionar</button>
                      </div>
                    </div>
                  ))}
                  {aiList.length === 0 && <div className="text-xs text-muted-foreground italic text-center py-4">Nenhuma sugestão disponível.</div>}

                  <div className="flex items-center justify-between mt-3">
                    <div className="text-xs text-muted-foreground">Página {aiPage}</div>
                    <div className="flex gap-2">
                      <button disabled={aiPage === 1} onClick={() => refreshAi(Math.max(1, aiPage - 1))} className="inline-flex items-center gap-1 px-3 py-1 rounded border"> <ArrowLeft className="size-4" /> </button>
                      <button disabled={aiList.length < 6} onClick={() => refreshAi(aiPage + 1)} className="inline-flex items-center gap-1 px-3 py-1 rounded border"> <ArrowRight className="size-4" /> </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

              {tab === "manual" && (
            <div className="mt-4">
                <div className="flex gap-2 mb-3">
                <div className="relative flex-1">
                  <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { setPage(1); runSearch(1); } }}
                    placeholder="Buscar por nome..."
                    className="w-full h-10 pl-10 pr-3 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <input
                  value={onlyManual ? cpfQuery : skills.join(", ")}
                  onChange={(e) => {
                    if (onlyManual) {
                      setCpfQuery(e.target.value);
                    } else {
                      setSkills(e.target.value.split(",").map((s) => s.trim()).filter(Boolean));
                    }
                  }}
                  placeholder={onlyManual ? "Pesquisar por CPF" : "Buscar por Competência"}
                  className="w-56 h-10 pl-3 pr-3 rounded-md border bg-background text-sm"
                />
              </div>

              {loading ? (
                <div className="text-center py-6 text-sm text-muted-foreground">Buscando…</div>
              ) : (
                <div className="space-y-3">
                  {list.map((t) => (
                    <div key={t.id} className="rounded-lg border p-3 flex items-center gap-3">
                      <div className="flex-shrink-0 flex items-center justify-center">
                        <div className="size-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                          {(() => {
                            const parts = t.name.split(" ").filter(Boolean);
                            if (parts.length === 1) return parts[0][0];
                            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
                          })()}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="font-medium truncate">{t.name}</div>
                          <span className={cn(
                            "text-[11px] px-2 py-0.5 rounded-full font-semibold capitalize",
                            t.vinculo === "Discente"
                              ? "bg-blue-100 border border-blue-200 text-blue-700"
                              : "bg-blue-700 text-white"
                          )}>
                            {t.vinculo === "Discente" ? "candidato" : "colaborador"}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {t.vinculo} • {t.formacao}
                          {t.cargaHoraria && (
                            <>
                              {' '}
                              • {t.cargaHoraria.replace(/\s*/g, "").replace(/(\d+)h/i, "$1h")} disponíveis
                            </>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">{(t as any).skills?.join(", ") ?? "Lógica de programação, Engenharia de prompts, Linguagem Python, Análise de séries temporais, Redes Neurais Convolu"}</div>
                      </div>
                      <div className="flex flex-col items-center justify-center gap-2 ml-3">
                        <button className="rounded-md border px-3 py-1 text-xs transition transform hover:scale-105 hover:shadow-sm">Ver Perfil</button>
                        <button onClick={() => selectTalent(t)} className="rounded-md bg-primary text-primary-foreground px-3 py-1 text-xs transition transform hover:scale-105 hover:shadow-sm">Selecionar</button>
                      </div>
                    </div>
                  ))}
                  {list.length === 0 && <div className="text-xs text-muted-foreground italic text-center py-4">Nenhum talento encontrado.</div>}

                  <div className="flex items-center justify-between mt-3">
                    <div className="text-xs text-muted-foreground">{total} resultado{total !== 1 ? "s" : ""}</div>
                    <div className="flex gap-2">
                      <button disabled={page === 1} onClick={() => { const p = Math.max(1, page - 1); setPage(p); runSearch(p); }} className="inline-flex items-center gap-1 px-3 py-1 rounded border"> <ArrowLeft className="size-4" /> </button>
                      <button disabled={page * 6 >= total} onClick={() => { const p = page + 1; setPage(p); runSearch(p); }} className="inline-flex items-center gap-1 px-3 py-1 rounded border"> <ArrowRight className="size-4" /> </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TalentPickerModal;
