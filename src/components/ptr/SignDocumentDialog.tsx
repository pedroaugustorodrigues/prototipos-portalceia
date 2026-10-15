import { useEffect, useRef, useState } from "react";
import { X, FileText, Eraser, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import type { AdjustmentRequest } from "@/lib/ptr-data";
import { cn } from "@/lib/utils";

type Step = "review" | "sign" | "processing" | "done";

export function SignDocumentDialog({
  request,
  projectName,
  signerName,
  onClose,
  onSigned,
  customDocumentUrl,
}: {
  request: AdjustmentRequest;
  projectName: string;
  signerName: string;
  onClose: () => void;
  onSigned: (id: string) => void;
  customDocumentUrl?: string;
}) {
  const [step, setStep] = useState<Step>("review");
  const [hasDrawn, setHasDrawn] = useState(false);
  const [agree, setAgree] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c || step !== "sign") return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = c.getBoundingClientRect();
    c.width = rect.width * dpr;
    c.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#0f172a";
  }, [step]);

  function pos(e: React.PointerEvent) {
    const c = canvasRef.current!;
    const r = c.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }
  function start(e: React.PointerEvent) {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawing.current = true;
    const p = pos(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  }
  function move(e: React.PointerEvent) {
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const p = pos(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    setHasDrawn(true);
  }
  function end() {
    drawing.current = false;
  }
  function clear() {
    const c = canvasRef.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    ctx.clearRect(0, 0, c.width, c.height);
    setHasDrawn(false);
  }

  function confirmSign() {
    setStep("processing");
    setTimeout(() => {
      setStep("done");
      onSigned(request.id);
    }, 1600);
  }

  const today = new Date().toLocaleDateString("pt-BR");

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-card rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/30">
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-9 rounded-lg bg-[color:var(--status-signature-fg)] text-white flex items-center justify-center shrink-0">
              <FileText className="size-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">ZapSign</div>
              <div className="font-semibold truncate">Carta de Ajuste do PTR — {request.id}</div>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-accent">
            <X className="size-5" />
          </button>
        </div>

        {/* Stepper */}
        <div className="px-6 py-3 border-b flex items-center justify-center text-xs">
          <div className="inline-flex items-center gap-3">
            <Pill active={step === "review"} done={step !== "review"}>1. Revisar</Pill>
            <span className="text-muted-foreground">→</span>
            <Pill active={step === "sign"} done={step === "processing" || step === "done"}>2. Assinar</Pill>
            <span className="text-muted-foreground">→</span>
            <Pill active={step === "processing" || step === "done"} done={step === "done"}>3. Concluído</Pill>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto">
          {step === "review" && (
            <div className="p-6">
              {customDocumentUrl ? (
                <div className="max-w-3xl mx-auto">
                  {/\.(png|jpe?g|gif|bmp|webp|svg)$/i.test(customDocumentUrl) ? (
                    <img src={customDocumentUrl} alt="Carta" className="w-full rounded-lg border bg-white" />
                  ) : (
                    <iframe src={customDocumentUrl} title="Carta" className="w-full h-[70vh] rounded-lg border bg-white" />
                  )}
                </div>
              ) : (
                <div className="rounded-xl border bg-white text-foreground p-8 shadow-sm font-serif leading-relaxed text-[13px] max-w-2xl mx-auto">
                  <div className="text-center mb-6">
                    <div className="text-xs tracking-widest text-muted-foreground">CENTRO DE EXCELÊNCIA EM INTELIGÊNCIA ARTIFICIAL — CEIA / UFG</div>
                    <h2 className="text-base font-bold mt-2 uppercase">Carta de Solicitação de Ajuste de PTR</h2>
                    <div className="text-xs text-muted-foreground mt-1">Goiânia, {today}</div>
                  </div>
                  <p className="mb-3">À <strong>Fundação de Apoio à Pesquisa — FUNAPE</strong>,</p>
                  <p className="mb-3">
                    Eu, <strong>{signerName}</strong>, na qualidade de coordenação do projeto <strong>"{projectName}"</strong>, venho por meio desta solicitar formalmente os ajustes abaixo no Plano de Trabalho (PTR) vigente, registrados sob o protocolo <strong>{request.id}</strong> em {request.createdAt}:
                  </p>
                  <ul className="list-disc pl-6 mb-3 space-y-1">
                    {request.topics.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                  <p className="mb-3">
                    Os ajustes solicitados foram analisados e aprovados pela equipe administrativa do CEIA, conforme registros do Portal SEIA. Solicito a gentileza de proceder com a execução das alterações junto aos sistemas da FUNAPE.
                  </p>
                  <p className="mt-8 text-center">_____________________________________</p>
                  <p className="text-center text-xs text-muted-foreground">{signerName} — Coordenação do Projeto</p>
                </div>
              )}
            </div>
          )}

          {step === "sign" && (
            <div className="p-6">
              <h3 className="font-semibold mb-1">Desenhe sua assinatura</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Use o mouse ou o dedo (em telas touch) para assinar dentro do quadro abaixo.
              </p>
              <div className="rounded-xl border-2 border-dashed border-primary/40 bg-white relative overflow-hidden">
                <canvas
                  ref={canvasRef}
                  onPointerDown={start}
                  onPointerMove={move}
                  onPointerUp={end}
                  onPointerLeave={end}
                  className="w-full h-56 touch-none cursor-crosshair block"
                />
                {!hasDrawn && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-muted-foreground/60 text-sm">
                    Assine aqui ✍️
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between mt-3">
                <button onClick={clear} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                  <Eraser className="size-3.5" /> Limpar
                </button>
                <span className="text-xs text-muted-foreground">{signerName} — {today}</span>
              </div>

              <label className="mt-5 flex items-start gap-3 rounded-lg border bg-muted/30 p-3 cursor-pointer">
                <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 size-4 accent-[color:var(--status-signature-fg)]" />
                <span className="text-xs text-muted-foreground">
                  Declaro que li e concordo com o conteúdo da carta. A assinatura digital tem validade jurídica conforme a <strong className="text-foreground">Lei 14.063/2020</strong> e os termos do <strong className="text-foreground">ZapSign</strong>.
                </span>
              </label>
            </div>
          )}

          {step === "processing" && (
            <div className="p-12 text-center">
              <Loader2 className="size-10 mx-auto text-primary animate-spin" />
              <p className="mt-4 text-sm text-muted-foreground">Enviando assinatura ao ZapSign e registrando no Portal CEIA…</p>
            </div>
          )}

          {step === "done" && (
            <div className="p-10 text-center">
              <div className="size-16 mx-auto rounded-full bg-[color:color-mix(in_oklab,var(--status-approved)_25%,transparent)] flex items-center justify-center">
                <CheckCircle2 className="size-9 text-[color:var(--status-approved-fg)]" />
              </div>
              <h3 className="text-xl font-semibold mt-4">Carta assinada com sucesso!</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                Sua assinatura foi registrada via ZapSign e a solicitação <strong className="text-foreground">{request.id}</strong> foi marcada como <strong className="text-foreground">Concluída</strong>. Uma cópia será enviada ao seu e-mail.
              </p>
              <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck className="size-3.5 text-[color:var(--status-approved-fg)]" />
                Validade jurídica conforme Lei 14.063/2020
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-muted/30 flex items-center justify-between gap-3">
          {step === "review" && (
            <>
              <button onClick={onClose} className="px-4 py-2 rounded-lg border text-sm hover:bg-accent">Cancelar</button>
              <button
                onClick={() => setStep("sign")}
                className="inline-flex items-center gap-2 rounded-lg bg-[color:var(--status-signature-fg)] text-white px-5 py-2 text-sm font-semibold hover:opacity-90"
              >
                Avançar para assinatura
              </button>
            </>
          )}
          {step === "sign" && (
            <>
              <button onClick={() => setStep("review")} className="px-4 py-2 rounded-lg border text-sm hover:bg-accent">Voltar</button>
              <button
                disabled={!hasDrawn || !agree}
                onClick={confirmSign}
                className="inline-flex items-center gap-2 rounded-lg bg-[color:var(--status-signature-fg)] text-white px-5 py-2 text-sm font-semibold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <CheckCircle2 className="size-4" /> Confirmar assinatura
              </button>
            </>
          )}
          {step === "processing" && <div className="text-xs text-muted-foreground mx-auto">Aguarde…</div>}
          {step === "done" && (
            <button onClick={onClose} className="ml-auto px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90">
              Fechar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Pill({ active, done, children }: { active: boolean; done: boolean; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider",
        done && "bg-[color:color-mix(in_oklab,var(--status-approved)_22%,transparent)] text-[color:var(--status-approved-fg)]",
        !done && active && "bg-primary text-primary-foreground",
        !done && !active && "bg-muted text-muted-foreground"
      )}
    >
      {children}
    </span>
  );
}