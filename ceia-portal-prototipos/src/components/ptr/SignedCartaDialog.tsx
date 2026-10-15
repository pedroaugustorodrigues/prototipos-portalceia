import { X, ShieldCheck, Download } from "lucide-react";
import type { AdjustmentRequest } from "@/lib/ptr-data";
import carta from "@/assets/carta.png";

/**
 * Diálogo somente-leitura que exibe a carta de ajuste de PTR já assinada.
 * Mostra a imagem `carta.png` com uma assinatura cursiva sobreposta na
 * área do nome do coordenador.
 */
export function SignedCartaDialog({
  request,
  signerName,
  signedAt,
  onClose,
}: {
  request: AdjustmentRequest;
  signerName: string;
  /** Data de assinatura formatada (ex.: 22/04/2025). Se omitida usa a data da solicitação. */
  signedAt?: string;
  onClose: () => void;
}) {
  const dateLabel = signedAt ?? request.createdAt;
  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-card rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/30">
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-9 rounded-lg bg-[color:var(--status-approved-fg)] text-white flex items-center justify-center shrink-0">
              <ShieldCheck className="size-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Carta assinada via ZapSign
              </div>
              <div className="font-semibold truncate">
                Carta de Ajuste do PTR — {request.id}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={carta}
              download={`carta-assinada-${request.id}.png`}
              className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-accent"
              aria-label="Baixar cópia"
              title="Baixar cópia"
            >
              <Download className="size-5" />
            </a>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-accent"
              aria-label="Fechar"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto p-6">
          <div className="relative max-w-3xl mx-auto rounded-lg border bg-white overflow-hidden shadow-sm">
            <img src={carta} alt="Carta de ajuste do PTR" className="w-full block" />
            {/* Overlay com assinatura cursiva sobre a linha de assinatura da carta */}
            <SignatureOverlay signerName={signerName} dateLabel={dateLabel} />
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
            <div className="inline-flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-[color:var(--status-approved-fg)]" />
              Assinatura digital com validade jurídica (Lei 14.063/2020).
            </div>
            <div>
              Assinado por <span className="font-semibold text-foreground">{signerName}</span> em{" "}
              <span className="font-semibold text-foreground">{dateLabel}</span>.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

/**
 * Assinatura cursiva renderizada em SVG, posicionada absolutamente sobre
 * a linha de assinatura da carta (~10% acima da base). O texto sob a linha
 * recebe o nome do signatário e a data.
 */
function SignatureOverlay({ signerName, dateLabel }: { signerName: string; dateLabel: string }) {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute left-1/2 -translate-x-1/2 bottom-[10%] flex flex-col items-center">
        <svg
          viewBox="0 0 320 90"
          className="w-[200px] md:w-[260px] h-auto -mb-2"
          aria-hidden="true"
        >
          <path
            d="M10 65 C 30 20, 55 20, 70 55 S 95 90, 110 50 C 120 25, 140 25, 150 55 C 158 78, 175 70, 185 45 C 195 20, 215 20, 225 50 S 255 80, 270 45 C 280 22, 300 28, 310 55"
            fill="none"
            stroke="#1e3a8a"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M70 70 q 80 -8 180 -2"
            fill="none"
            stroke="#1e3a8a"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
        <div className="text-[10px] md:text-xs text-slate-700/80 font-medium bg-white/60 px-1.5 rounded">
          {signerName} • Assinado em {dateLabel}
        </div>
      </div>
    </div>
  );
}
