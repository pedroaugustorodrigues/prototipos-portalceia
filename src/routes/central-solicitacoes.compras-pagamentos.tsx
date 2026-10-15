import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { Send, Plus, History, ChevronLeft, Calendar, Info, User2, Briefcase, ShoppingCart, CreditCard, BookOpen, DollarSign, FileText, BrushCleaning, Upload, Paperclip, X, ShieldCheck, Inbox, ChevronRight, Wallet, Clock, FolderKanban, AlertCircle, CheckCircle2, XCircle, Bell, Check, Eye, AlertTriangle, MessageSquare } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PROJECTS } from "@/lib/ptr-data";
import { cn } from "@/lib/utils";
import { useActiveProfile } from "@/lib/profile";

export const Route = createFileRoute("/central-solicitacoes/compras-pagamentos")({
  head: () => ({
    meta: [
      { title: "Compras & Pagamentos — Portal CEIA" },
      { name: "description", content: "Solicite compras e pagamentos diretamente." },
    ],
  }),
  component: ComprasPagamentosPage,
});

function formatDateDDMMYYYY(v: string) {
  const digits = v.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return digits.slice(0, 2) + "/" + digits.slice(2);
  return digits.slice(0, 2) + "/" + digits.slice(2, 4) + "/" + digits.slice(4);
}

function ComprasPagamentosPage() {
  const profile = useActiveProfile();
  const [requesterName, setRequesterName] = useState(profile.nome);
  const [requesterEmail, setRequesterEmail] = useState(profile.email);
  const [requesterDOB, setRequesterDOB] = useState(profile.dataNascimento);
  const [requesterPhone, setRequesterPhone] = useState(profile.telefone);
  const [projectLinked, setProjectLinked] = useState("");
  const [demandProject, setDemandProject] = useState("");
  const [requestType, setRequestType] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [usageDescription, setUsageDescription] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [neededDate, setNeededDate] = useState("");
  const [over800, setOver800] = useState<boolean | null>(null);
  const [amount, setAmount] = useState("");
  const [hasAttachments, setHasAttachments] = useState<boolean | null>(null);
  const [attachmentsConfirm, setAttachmentsConfirm] = useState(false);
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [noAttachmentsReason, setNoAttachmentsReason] = useState("");
  const [cpf, setCpf] = useState("");
  const [contactEventEmail, setContactEventEmail] = useState("");
  const [eventName, setEventName] = useState("");
  const [activityDesc, setActivityDesc] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [registrationDeadline, setRegistrationDeadline] = useState("");
  const [registrationDone, setRegistrationDone] = useState<boolean | null>(null);
  const [registrationPaid, setRegistrationPaid] = useState<"reembolso" | "pagamento" | null>(null);
  const [registrationNotDoneReason, setRegistrationNotDoneReason] = useState<"requisitos" | "funape" | "tempo" | "abertas" | null>(null);
  const [registrationCeiaSupport, setRegistrationCeiaSupport] = useState<boolean | null>(null);
  const [noSupportDescription, setNoSupportDescription] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyCNPJ, setCompanyCNPJ] = useState("");
  const [bankDetails, setBankDetails] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [serviceDescription, setServiceDescription] = useState("");
  const [otherDescription, setOtherDescription] = useState("");
  const [cpfSolicitante, setCpfSolicitante] = useState("");
  const [rgSolicitante, setRgSolicitante] = useState("");
  const [paymentConfirmation, setPaymentConfirmation] = useState("");
  const [enderecoSolicitante, setEnderecoSolicitante] = useState("");
  const [pixConsent, setPixConsent] = useState(false);
  const [purchasesList, setPurchasesList] = useState("");
  const [justification, setJustification] = useState("");

  const [tab, setTab] = useState<"nova" | "historico">("nova");
  const isAdmin = profile.id === "admin";
  const isCoordenadora = profile.id === "coordenadora";
  const isCorretor = profile.id === "corretor-congressos";
  const [outerTab, setOuterTab] = useState<"aprovacoes" | "minhas">(isCoordenadora || isCorretor ? "aprovacoes" : "minhas");
  const [seenTabs, setSeenTabs] = useState<Set<string>>(() => new Set());
  const markTabSeen = (key: string) => {
    setSeenTabs((prev) => {
      if (prev.has(key)) return prev;
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  };
  const [submissions, setSubmissions] = useState<any[]>(() => SEED_COMPRAS_HISTORY);
  const [saved, setSaved] = useState<any | null>(null);
  const [sent, setSent] = useState(false);

  // Re-preenche os dados do solicitante quando o perfil ativo muda.
  useEffect(() => {
    setRequesterName(profile.nome);
    setRequesterEmail(profile.email);
    setRequesterDOB(profile.dataNascimento);
    setRequesterPhone(profile.telefone);
  }, [profile.id, profile.nome, profile.email, profile.dataNascimento, profile.telefone]);

  const REQUEST_TYPE_META: Record<string, { label: string; icon: any }> = {
    compra_material_servico: { label: "Compra de material/serviço", icon: ShoppingCart },
    pagamento_material_servico: { label: "Pagamento de material/serviço", icon: CreditCard },
    inscricao_publicacao: { label: "Inscrição / Publicação", icon: BookOpen },
    ressarcimento_despesa: { label: "Ressarcimento de despesa", icon: DollarSign },
    outros: { label: "Outros", icon: Info },
  };

  function clear() {
    setRequesterName(profile.nome);
    setRequesterEmail(profile.email);
    setRequesterDOB(profile.dataNascimento);
    setRequesterPhone(profile.telefone);
    setProjectLinked("");
    setRequestType("");
    setSent(false);
    setSaved(null);
    setItemDescription("");
    setUsageDescription("");
    setDeliveryLocation("");
    setNeededDate("");
    setOver800(null);
    setAmount("");
    setHasAttachments(null);
    setAttachmentsConfirm(false);
    setAttachmentFiles([]);
    setNoAttachmentsReason("");
    setCpf("");
    setContactEventEmail("");
    setEventName("");
    setActivityDesc("");
    setEventLocation("");
    setRegistrationDeadline("");
    setRegistrationDone(null);
    setRegistrationPaid(null);
    setRegistrationNotDoneReason(null);
    setRegistrationCeiaSupport(null);
    setNoSupportDescription("");
    setCompanyName("");
    setCompanyCNPJ("");
    setBankDetails("");
    setCompanyAddress("");
    setCompanyPhone("");
    setServiceDescription("");
    setOtherDescription("");
    setCpfSolicitante("");
    setRgSolicitante("");
    setPaymentConfirmation("");
    setEnderecoSolicitante("");
    setPixConsent(false);
    setPurchasesList("");
    setJustification("");
  }

  function submit() {
    const data = {
      requesterName,
      requesterEmail,
      requesterDOB,
      requesterPhone,
      projectLinked,
      requestType,
      itemDescription,
      usageDescription,
      deliveryLocation,
      neededDate,
      over800,
      amount,
      hasAttachments,
      attachmentsConfirm,
      cpf,
      contactEventEmail,
      eventName,
      activityDesc,
      eventLocation,
      registrationDeadline,
      registrationDone,
      companyName,
      companyCNPJ,
      bankDetails,
      companyAddress,
      companyPhone,
      serviceDescription,
      cpfSolicitante,
      rgSolicitante,
      paymentConfirmation,
      enderecoSolicitante,
      pixConsent,
      cargoProjeto,
      purchasesList,
      justification,
      otherDescription,
      createdAt: new Date().toLocaleString(),
      // Campos normalizados para o Histórico (mesmo padrão de Passagens e Diárias)
      _status: "em_analise_corretor",
      tipo: requestType,
      solicitante: requesterName,
      email: requesterEmail,
      projetoSolicitado: projectLinked,
      valor: amount,
      anexos: attachmentFiles.map((f) => f.name),
      campos: buildComprasCampos(requestType, {
        itemDescription, usageDescription, deliveryLocation, neededDate,
        companyName, companyCNPJ, bankDetails, companyAddress, companyPhone, serviceDescription,
        cpf, contactEventEmail, eventName, activityDesc, eventLocation, registrationDeadline,
        cpfSolicitante, rgSolicitante, paymentConfirmation, enderecoSolicitante, cargoProjeto,
        purchasesList, justification, otherDescription,
      }),
    };
    setSaved(data);
    setSent(true);
  }

  const cargoProjeto = PROJECTS.find(p => p.name === projectLinked)?.role ?? "";

  const canSubmit = projectLinked.trim() !== "" && requestType.trim() !== "";

  return (
    <div className="p-6 md:p-10 w-full">
      <Link to="/central-solicitacoes" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground/80 -mt-2 mb-6">
        <ChevronLeft className="size-3" /> Voltar para central de solicitações
      </Link>

      <div className="mb-6">
        <div className="text-xs uppercase tracking-wider text-primary font-semibold">central de solicitações</div>
        <h1 className="text-3xl font-bold tracking-tight mt-1">Compras & Pagamentos</h1>
      </div>

      <div className="border-b mb-6 flex gap-1">
        {!isCoordenadora && !isCorretor ? (
          <>
            <TabButton active={tab === "nova"} onClick={() => { markTabSeen("nova"); setTab("nova"); }} icon={<Plus className="size-4" />}>
              Nova Solicitação
            </TabButton>
            <TabButton active={tab === "historico"} onClick={() => { markTabSeen("historico"); setTab("historico"); }} icon={<History className="size-4" />}>
              Histórico {!seenTabs.has("historico") && <NewTabDot />}
            </TabButton>
          </>
        ) : (
          <>
            {isCorretor ? (
              <TabButton active={outerTab === "aprovacoes"} onClick={() => setOuterTab("aprovacoes")} icon={<ShieldCheck className="size-4" />}>
                Aprovações
              </TabButton>
            ) : (
              <TabButton active={outerTab === "aprovacoes"} onClick={() => setOuterTab("aprovacoes")} icon={<ShieldCheck className="size-4" />}>
                Pedidos de Recurso {COMPRAS_APPROVALS_MOCK.filter(a => a.status === "pendente").length > 0 && (
                  <span className="ml-1 text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-semibold">{COMPRAS_APPROVALS_MOCK.filter(a => a.status === "pendente").length}</span>
                )}
              </TabButton>
            )}
            <TabButton active={outerTab === "minhas"} onClick={() => setOuterTab("minhas")} icon={<Inbox className="size-4" />}>
              Minhas Solicitações
            </TabButton>
          </>
        )}
      </div>

      {outerTab === "aprovacoes" ? (
        isAdmin ? <ComprasAdminFeedPanel /> : <ComprasApprovalsPanel corretorMode={isCorretor} />
      ) : (
      <>
      {(isCoordenadora || isCorretor) && (
        <>
      {/* Informativo da aba */}
      <div className="rounded-xl border bg-card p-4 flex items-start gap-3 mb-5">
        <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Info className="size-4" />
        </div>
        <div className="text-sm">
          <div className="font-semibold text-foreground">Minhas Solicitações</div>
          <p className="mt-1 text-muted-foreground leading-relaxed">
            Crie uma nova solicitação de compras ou pagamentos e acompanhe o histórico dos pedidos que você enviou.
          </p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 p-1 rounded-xl border bg-muted/40 gap-1">
        <SegmentedButton active={tab === "nova"} onClick={() => setTab("nova")} icon={<Plus className="size-4" />}>
          Nova Solicitação
        </SegmentedButton>
        <SegmentedButton active={tab === "historico"} onClick={() => setTab("historico")} icon={<History className="size-4" />}>
          Histórico
          {submissions.length > 0 && (
            <span className={cn(
              "ml-1.5 text-[11px] px-1.5 py-0.5 rounded-full font-semibold",
              tab === "historico" ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
            )}>{submissions.length}</span>
          )}
        </SegmentedButton>
      </div>
        </>
      )}

      {tab === "nova" ? (
        <div className="space-y-6">
          {sent && saved ? (
            <div className="rounded-2xl border bg-card p-10 text-center">
              <div className="size-14 rounded-full bg-[color:color-mix(in_oklab,var(--status-approved)_25%,transparent)] flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="size-7 text-[color:var(--status-approved-fg)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <h3 className="text-xl font-semibold">Solicitação enviada com sucesso!</h3>
              <p className="text-muted-foreground mt-2 max-w-md mx-auto">Sua solicitação de Compras & Pagamentos foi registrada.</p>
              <button onClick={() => { setSubmissions((s) => [saved, ...s]); setTab("historico"); }} className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:bg-primary/90">Ver no Histórico</button>
            </div>
          ) : (
            <>
              <div className="rounded-xl border bg-card p-4 mb-6 flex items-start gap-3">
                <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Info className="size-4" />
                </div>
                <div className="text-sm">
                  <div className="font-semibold text-foreground">Identificação do solicitante</div>
                  <p className="mt-1 text-muted-foreground leading-relaxed">
                    Os dados abaixo são preenchidos automaticamente com as informações do seu perfil — a solicitação é registrada em seu nome.
                  </p>
                </div>
              </div>

                <section className="rounded-xl border bg-card p-6 pb-2 mb-6">
                <div className="flex items-center gap-3 text-base font-semibold mb-2 pb-2 text-foreground leading-tight"><User2 className="size-4 text-primary" /> <span>Identificação</span></div>
                <div className="grid gap-3">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <label className="mb-3">
                      <div className="text-sm font-medium">Nome do solicitante <span className="text-red-500 ml-1">*</span></div>
                      <input value={requesterName} readOnly placeholder="Nome completo" className="mt-2 w-full rounded-lg border px-3 py-2 bg-gray-50 text-foreground cursor-not-allowed" />
                    </label>
                    <label className="mb-3">
                      <div className="text-sm font-medium">E-mail do solicitante <span className="text-red-500 ml-1">*</span></div>
                      <input value={requesterEmail} readOnly placeholder="email@exemplo.com" className="mt-2 w-full rounded-lg border px-3 py-2 bg-gray-50 text-foreground cursor-not-allowed" />
                    </label>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <label className="mb-3">
                      <div className="text-sm font-medium">Telefone de contato <span className="text-red-500 ml-1">*</span></div>
                      <input value={requesterPhone} readOnly placeholder="Telefone" className="mt-2 w-full rounded-lg border px-3 py-2 bg-gray-50 text-foreground cursor-not-allowed" />
                    </label>
                    <label className="mb-3">
                      <div className="text-sm font-medium">Data de nascimento <span className="text-red-500 ml-1">*</span></div>
                      <div className="relative mt-2">
                        <Calendar className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input value={requesterDOB} readOnly placeholder="DD/MM/AAAA" inputMode="numeric" maxLength={10} className="w-full rounded-lg border pl-10 pr-3 py-2 bg-gray-50 text-foreground cursor-not-allowed" />
                      </div>
                    </label>
                  </div>
                </div>
              </section>

              <section className="rounded-xl border bg-card p-6 pb-4 mb-6">
                <div className="flex items-center gap-3 text-base font-semibold mb-2 pb-2 text-foreground leading-tight"><Briefcase className="size-4 text-primary" /> <span>Projeto e Tipo de Solicitação</span></div>
                <div className="grid gap-3">
                  <label className="mb-3">
                    <div className="text-sm font-medium">Nome do projeto que custeará a despesa <span className="text-red-500 ml-1">*</span></div>
                    <select value={projectLinked} onChange={(e) => setProjectLinked(e.target.value)} className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground select-arrow" required>
                      <option value="">Selecionar uma opção</option>
                      {PROJECTS.map((p: any) => (<option key={p.id} value={p.name}>{p.name}</option>))}
                    </select>
                  </label>

                  <label className="mb-3">
                    <div className="text-sm font-medium">Qual projeto gerou a demanda?</div>
                    <select value={demandProject} onChange={(e) => setDemandProject(e.target.value)} className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground select-arrow">
                      <option value="">Selecionar uma opção</option>
                      {PROJECTS.map((p: any) => (<option key={p.id} value={p.name}>{p.name}</option>))}
                    </select>
                  </label>

                  <label className="mb-3">
                    <div className="text-sm font-medium">Qual o tipo de solicitação?</div>
                      <select value={requestType} onChange={(e) => setRequestType(e.target.value)} className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground select-arrow">
                        <option value="">selecione</option>
                        <option value="compra_material_servico">Compra de material/serviço</option>
                        <option value="pagamento_material_servico">Pagamento de material/serviço</option>
                        <option value="inscricao_publicacao">Inscrição/publicação</option>
                        <option value="ressarcimento_despesa">Ressarcimento de despesa</option>
                        <option value="outros">Outros</option>
                      </select>
                  </label>
                </div>
              </section>

              {/* Campos para Inscrição / Publicação */}
              {requestType === "inscricao_publicacao" && (
                <section className="rounded-xl border bg-card p-6 pb-4 mb-6">
                  <div className="flex items-center gap-3 text-sm font-semibold mb-2 pb-2 text-foreground leading-tight"><BookOpen className="size-4 text-primary" /> <span>{REQUEST_TYPE_META['inscricao_publicacao'].label}</span></div>
                  <div className="grid gap-3">
                    <label className="mb-3">
                      <div className="text-sm font-medium">CPF</div>
                      <input value={cpf} onChange={(e) => setCpf(e.target.value)} placeholder="Insira o valor aqui" className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground" />
                    </label>

                    <label className="mb-3">
                      <div className="text-sm font-medium">E-mail de contato do evento</div>
                      <input value={contactEventEmail} onChange={(e) => setContactEventEmail(e.target.value)} placeholder="Insira o valor aqui" className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground" />
                    </label>

                    <label className="mb-3">
                      <div className="text-sm font-medium">Nome do evento, curso ou periódico para publicação em que deseja realizar a inscrição</div>
                      <input value={eventName} onChange={(e) => setEventName(e.target.value)} placeholder="Insira o valor aqui" className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground" />
                    </label>

                    <label className="mb-3">
                      <div className="text-sm font-medium">Qual atividade será realizada?</div>
                      <input value={activityDesc} onChange={(e) => setActivityDesc(e.target.value)} placeholder="Insira o valor aqui" className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground" />
                    </label>

                    <label className="mb-3">
                      <div className="text-sm font-medium">Local onde acontecerá</div>
                      <input value={eventLocation} onChange={(e) => setEventLocation(e.target.value)} placeholder="Insira o valor aqui" className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground" />
                    </label>

                    <label className="mb-3">
                      <div className="text-sm font-medium">Data limite para a inscrição</div>
                      <div className="relative mt-2">
                        <Calendar className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input value={registrationDeadline} onChange={(e) => setRegistrationDeadline(formatDateDDMMYYYY(e.target.value))} placeholder="DD/MM/AAAA" inputMode="numeric" maxLength={10} className="w-full rounded-lg border pl-10 pr-3 py-2 bg-white text-foreground" />
                      </div>
                    </label>

                    <label className="mb-3">
                      <div className="text-sm font-medium">A inscrição já foi feita?</div>
                      <div className="mt-2 grid grid-cols-2 gap-3">
                        <button type="button" className={registrationDone === true ? "w-full rounded-lg border px-3 py-2 bg-primary text-primary-foreground border-transparent transition-colors duration-150 hover:opacity-95" : "w-full rounded-lg border px-3 py-2 bg-gray-100 text-black hover:bg-gray-200 hover:border-gray-200 transition-colors duration-150"} onClick={() => { setRegistrationDone(true); }}>Sim</button>
                        <button type="button" className={registrationDone === false ? "w-full rounded-lg border px-3 py-2 bg-primary text-primary-foreground border-transparent transition-colors duration-150 hover:opacity-95" : "w-full rounded-lg border px-3 py-2 bg-gray-100 text-black hover:bg-gray-200 hover:border-gray-200 transition-colors duration-150"} onClick={() => { setRegistrationDone(false); setRegistrationPaid(null); }}>Não</button>
                      </div>
                    </label>

                    {registrationDone === false && (
                      <>
                        <div className="mb-3">
                          <div className="text-sm font-medium">Qual a razão de não ter realizado a inscrição?</div>
                          <div className="mt-2 rounded-lg border bg-amber-50 border-amber-200 p-3 text-xs text-amber-900 leading-relaxed">
                            <strong>ATENÇÃO:</strong> É responsabilidade do interessado realizar a inscrição. Ele deve fazer com os dados da FUNAPE (Razão social: Fundação de Apoio à Pesquisa — FUNAPE, CNPJ: 00.799.205/0001-89, Endereço: Avenida Esperança, n° 1533, Parque Tecnológico Samambaia, Edifício FUNAPE, Campus Samambaia — UFG — Goiânia - GO — CEP: 74690-612). Depois deve encaminhar o boleto para a equipe administrativa do CEIA por meio desse formulário.
                          </div>
                          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[
                              { id: "requisitos", label: "Não conheço os requisitos necessários" },
                              { id: "funape", label: "Não consegui incluir os dados da FUNAPE" },
                              { id: "tempo", label: "Ainda não tive tempo, mas vou fazer depois" },
                              { id: "abertas", label: "As inscrições ainda não estão abertas" },
                            ].map((r) => (
                              <button
                                key={r.id}
                                type="button"
                                className={cn(
                                  "rounded-lg border px-3 py-2.5 text-sm text-left transition-colors duration-150",
                                  registrationNotDoneReason === r.id
                                    ? "bg-primary text-primary-foreground border-transparent hover:opacity-95"
                                    : "bg-gray-100 text-black hover:bg-gray-200 hover:border-gray-200"
                                )}
                                onClick={() => { setRegistrationNotDoneReason(r.id as any); setRegistrationCeiaSupport(null); }}
                              >
                                {r.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {(registrationNotDoneReason === "requisitos" || registrationNotDoneReason === "funape") && (
                          <label className="mb-3">
                            <div className="text-sm font-medium">Gostaria de apoio da equipe administrativa do CEIA na realização?</div>
                            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                              Se marcar <strong className="text-foreground">sim</strong>, a equipe entrará em contato para ajudá-lo. Se marcar <strong className="text-foreground">não</strong>, ficamos aguardando a conclusão da inscrição para providenciarmos o pagamento.
                            </p>
                            <div className="mt-3 grid grid-cols-2 gap-3">
                              <button type="button" className={registrationCeiaSupport === true ? "w-full rounded-lg border px-3 py-2 bg-primary text-primary-foreground border-transparent transition-colors duration-150 hover:opacity-95" : "w-full rounded-lg border px-3 py-2 bg-gray-100 text-black hover:bg-gray-200 hover:border-gray-200 transition-colors duration-150"} onClick={() => setRegistrationCeiaSupport(true)}>Sim</button>
                              <button type="button" className={registrationCeiaSupport === false ? "w-full rounded-lg border px-3 py-2 bg-primary text-primary-foreground border-transparent transition-colors duration-150 hover:opacity-95" : "w-full rounded-lg border px-3 py-2 bg-gray-100 text-black hover:bg-gray-200 hover:border-gray-200 transition-colors duration-150"} onClick={() => setRegistrationCeiaSupport(false)}>Não</button>
                            </div>
                          </label>
                        )}

                        {registrationNotDoneReason === "requisitos" && registrationCeiaSupport === false && (
                          <>
                            <label className="mb-3">
                              <div className="text-sm font-medium">Descrição detalhada da solicitação</div>
                              <textarea value={noSupportDescription} onChange={(e) => setNoSupportDescription(e.target.value)} placeholder="Insira o valor aqui" className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground" rows={4} />
                            </label>

                            <label className="mb-3">
                              <div className="text-sm font-medium">O valor do(a) pagamento/reembolso/compra é maior que R$ 800,00?</div>
                              <div className="mt-2 grid grid-cols-2 gap-3">
                                <button type="button" className={over800 === true ? "w-full rounded-lg border px-3 py-2 bg-primary text-primary-foreground border-transparent transition-colors duration-150 hover:opacity-95" : "w-full rounded-lg border px-3 py-2 bg-gray-100 text-black hover:bg-gray-200 hover:border-gray-200 transition-colors duration-150"} onClick={() => setOver800(true)}>Sim</button>
                                <button type="button" className={over800 === false ? "w-full rounded-lg border px-3 py-2 bg-primary text-primary-foreground border-transparent transition-colors duration-150 hover:opacity-95" : "w-full rounded-lg border px-3 py-2 bg-gray-100 text-black hover:bg-gray-200 hover:border-gray-200 transition-colors duration-150"} onClick={() => setOver800(false)}>Não</button>
                              </div>
                              <div className="text-xs text-muted-foreground mt-2">Se o valor for superior a R$ 800,00, será necessário apresentar 3 orçamentos. Se a compra for menor que R$ 800,00 o pedido será enviado à equipe administrativa do CEIA.</div>
                            </label>

                            <label className="mb-3">
                              <div className="text-sm font-medium">Qual será o valor?</div>
                              <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Insira o valor aqui" className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground" />
                            </label>

                            <label className="mb-3">
                              <div className="text-sm font-medium">Possui documentos para anexar?</div>
                              <div className="mt-2 grid grid-cols-2 gap-3">
                                <button type="button" className={hasAttachments === true ? "w-full rounded-lg border px-3 py-2 bg-primary text-primary-foreground border-transparent transition-colors duration-150 hover:opacity-95" : "w-full rounded-lg border px-3 py-2 bg-gray-100 text-black hover:bg-gray-200 hover:border-gray-200 transition-colors duration-150"} onClick={() => setHasAttachments(true)}>Sim</button>
                                <button type="button" className={hasAttachments === false ? "w-full rounded-lg border px-3 py-2 bg-primary text-primary-foreground border-transparent transition-colors duration-150 hover:opacity-95" : "w-full rounded-lg border px-3 py-2 bg-gray-100 text-black hover:bg-gray-200 hover:border-gray-200 transition-colors duration-150"} onClick={() => setHasAttachments(false)}>Não</button>
                              </div>
                            </label>

                            {hasAttachments === true && (
                              <AttachmentsUploadBlock files={attachmentFiles} setFiles={setAttachmentFiles} attachmentsConfirm={attachmentsConfirm} setAttachmentsConfirm={setAttachmentsConfirm} />
                            )}
                            {hasAttachments === false && (
                              <NoAttachmentsReasonBlock value={noAttachmentsReason} onChange={setNoAttachmentsReason} />
                            )}
                          </>
                        )}
                      </>
                    )}

                    {registrationDone === true && (
                      <>
                        <label className="mb-3">
                          <div className="text-sm font-medium">A inscrição foi paga?</div>
                          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                            Ressaltamos que caso a inscrição tenha sido paga, os dados da nota fiscal devem estar em nome da <strong className="text-foreground">FUNAPE</strong>. Ainda, para solicitar o pagamento, é preciso que nos envie o boleto bancário em nome da FUNAPE.
                          </p>
                          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <button
                              type="button"
                              className={cn(
                                "rounded-lg border px-3 py-2.5 text-sm text-left transition-colors duration-150",
                                registrationPaid === "reembolso"
                                  ? "bg-primary text-primary-foreground border-transparent hover:opacity-95"
                                  : "bg-gray-100 text-black hover:bg-gray-200 hover:border-gray-200"
                              )}
                              onClick={() => setRegistrationPaid("reembolso")}
                            >
                              Sim, gostaria de solicitar reembolso
                            </button>
                            <button
                              type="button"
                              className={cn(
                                "rounded-lg border px-3 py-2.5 text-sm text-left transition-colors duration-150",
                                registrationPaid === "pagamento"
                                  ? "bg-primary text-primary-foreground border-transparent hover:opacity-95"
                                  : "bg-gray-100 text-black hover:bg-gray-200 hover:border-gray-200"
                              )}
                              onClick={() => setRegistrationPaid("pagamento")}
                            >
                              Não, gostaria de solicitar o pagamento
                            </button>
                          </div>
                        </label>

                        {(registrationPaid === "reembolso" || registrationPaid === "pagamento") && (
                          <>
                            <label className="mb-3">
                              <div className="text-sm font-medium">O valor do(a) pagamento/reembolso/compra é maior que R$ 800,00?</div>
                              <div className="mt-2 grid grid-cols-2 gap-3">
                                <button type="button" className={over800 === true ? "w-full rounded-lg border px-3 py-2 bg-primary text-primary-foreground border-transparent transition-colors duration-150 hover:opacity-95" : "w-full rounded-lg border px-3 py-2 bg-gray-100 text-black hover:bg-gray-200 hover:border-gray-200 transition-colors duration-150"} onClick={() => setOver800(true)}>Sim</button>
                                <button type="button" className={over800 === false ? "w-full rounded-lg border px-3 py-2 bg-primary text-primary-foreground border-transparent transition-colors duration-150 hover:opacity-95" : "w-full rounded-lg border px-3 py-2 bg-gray-100 text-black hover:bg-gray-200 hover:border-gray-200 transition-colors duration-150"} onClick={() => setOver800(false)}>Não</button>
                              </div>
                              <div className="text-xs text-muted-foreground mt-2">Se o valor for superior a R$ 800,00, será necessário apresentar 3 orçamentos. Se a compra for menor que R$ 800,00 o pedido será enviado à equipe administrativa do CEIA.</div>
                            </label>

                            <label className="mb-3">
                              <div className="text-sm font-medium">Qual será o valor?</div>
                              <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Insira o valor aqui" className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground" />
                            </label>

                            <label className="mb-3">
                              <div className="text-sm font-medium">Possui documentos para anexar?</div>
                              <div className="mt-2 grid grid-cols-2 gap-3">
                                <button type="button" className={hasAttachments === true ? "w-full rounded-lg border px-3 py-2 bg-primary text-primary-foreground border-transparent transition-colors duration-150 hover:opacity-95" : "w-full rounded-lg border px-3 py-2 bg-gray-100 text-black hover:bg-gray-200 hover:border-gray-200 transition-colors duration-150"} onClick={() => setHasAttachments(true)}>Sim</button>
                                <button type="button" className={hasAttachments === false ? "w-full rounded-lg border px-3 py-2 bg-primary text-primary-foreground border-transparent transition-colors duration-150 hover:opacity-95" : "w-full rounded-lg border px-3 py-2 bg-gray-100 text-black hover:bg-gray-200 hover:border-gray-200 transition-colors duration-150"} onClick={() => setHasAttachments(false)}>Não</button>
                              </div>
                            </label>

                            {hasAttachments === true && (
                              <AttachmentsUploadBlock files={attachmentFiles} setFiles={setAttachmentFiles} attachmentsConfirm={attachmentsConfirm} setAttachmentsConfirm={setAttachmentsConfirm} />
                            )}
                            {hasAttachments === false && (
                              <NoAttachmentsReasonBlock value={noAttachmentsReason} onChange={setNoAttachmentsReason} />
                            )}
                          </>
                        )}
                      </>
                    )}
                  </div>
                </section>
              )}

              {/* Campos para Ressarcimento de despesa */}
              {requestType === "ressarcimento_despesa" && (
                <section className="rounded-xl border bg-card p-6 pb-4 mb-6">
                  <div className="flex items-center gap-3 text-sm font-semibold mb-2 pb-2 text-foreground leading-tight"><DollarSign className="size-4 text-primary" /> <span>{REQUEST_TYPE_META['ressarcimento_despesa'].label}</span></div>
                  <div className="grid gap-3">
                    <label className="mb-3">
                      <div className="text-sm font-medium">CPF do solicitante</div>
                      <input value={cpfSolicitante} onChange={(e) => setCpfSolicitante(e.target.value)} placeholder="Inserir um número" className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground" />
                    </label>

                    <label className="mb-3">
                      <div className="text-sm font-medium">RG</div>
                      <input value={rgSolicitante} onChange={(e) => setRgSolicitante(e.target.value)} placeholder="Inserir um número" className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground" />
                    </label>

                    <div className="mb-3">
                      <div className="text-sm font-medium">Confirmação de pagamento</div>
                      <label className="mt-2 flex items-start gap-3 rounded-lg border bg-white p-3 cursor-pointer hover:bg-muted/30 transition-colors">
                        <input
                          type="checkbox"
                          checked={pixConsent}
                          onChange={(e) => setPixConsent(e.target.checked)}
                          className="mt-0.5 size-4 rounded border-input accent-primary shrink-0"
                        />
                        <span className="text-sm text-foreground leading-relaxed">Declaro estar ciente de que o pagamento será realizado exclusivamente via transferência PIX.</span>
                      </label>
                    </div>

                    <label className="mb-3">
                      <div className="text-sm font-medium">Endereço do solicitante</div>
                      <input value={enderecoSolicitante} onChange={(e) => setEnderecoSolicitante(e.target.value)} placeholder="Insira o valor aqui" className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground" />
                    </label>

                    <div className="mb-3">
                      <div className="text-sm font-medium">Cargo no projeto</div>
                      <div className="mt-2 w-full rounded-lg border px-3 py-2 bg-muted/40 text-foreground flex items-center justify-between gap-2">
                        <span className={cargoProjeto ? "" : "text-muted-foreground"}>
                          {cargoProjeto || "Selecione um projeto para preencher automaticamente"}
                        </span>
                        {cargoProjeto && (
                          <span className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground font-semibold">Auto</span>
                        )}
                      </div>
                    </div>

                    <label className="mb-3">
                      <div className="text-sm font-medium">Liste a(s) compra(s) que solicita reembolso</div>
                      <textarea value={purchasesList} onChange={(e) => setPurchasesList(e.target.value)} placeholder="Insira o valor aqui" className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground" rows={4} />
                    </label>

                    <label className="mb-3">
                      <div className="text-sm font-medium">Justificativa das despesas</div>
                      <textarea value={justification} onChange={(e) => setJustification(e.target.value)} placeholder="Insira o valor aqui" className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground" rows={4} />
                    </label>

                    <label className="mb-3">
                      <div className="text-sm font-medium">O valor do(a) pagamento/reembolso/compra é maior que R$800,00?</div>
                      <div className="mt-2 grid grid-cols-2 gap-3">
                        <button type="button" className={over800 === true ? "w-full rounded-lg border px-3 py-2 bg-primary text-primary-foreground border-transparent transition-colors duration-150 hover:opacity-95" : "w-full rounded-lg border px-3 py-2 bg-gray-100 text-black hover:bg-gray-200 hover:border-gray-200 transition-colors duration-150"} onClick={() => setOver800(true)}>Sim</button>
                        <button type="button" className={over800 === false ? "w-full rounded-lg border px-3 py-2 bg-primary text-primary-foreground border-transparent transition-colors duration-150 hover:opacity-95" : "w-full rounded-lg border px-3 py-2 bg-gray-100 text-black hover:bg-gray-200 hover:border-gray-200 transition-colors duration-150"} onClick={() => setOver800(false)}>Não</button>
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">Se o valor for superior a R$ 800,00, será necessário apresentar 3 orçamentos. Se a compra for menor que R$ 800,00 o pedido será enviado à equipe administrativa do CEIA.</div>
                    </label>

                    <label className="mb-3">
                      <div className="text-sm font-medium">Qual será o valor?</div>
                      <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Insira o valor aqui" className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground" />
                    </label>

                    <label className="mb-3">
                      <div className="text-sm font-medium">Possui documentos para anexar?</div>
                      <div className="mt-2 grid grid-cols-2 gap-3">
                        <button type="button" className={hasAttachments === true ? "w-full rounded-lg border px-3 py-2 bg-primary text-primary-foreground border-transparent transition-colors duration-150 hover:opacity-95" : "w-full rounded-lg border px-3 py-2 bg-gray-100 text-black hover:bg-gray-200 hover:border-gray-200 transition-colors duration-150"} onClick={() => setHasAttachments(true)}>Sim</button>
                        <button type="button" className={hasAttachments === false ? "w-full rounded-lg border px-3 py-2 bg-primary text-primary-foreground border-transparent transition-colors duration-150 hover:opacity-95" : "w-full rounded-lg border px-3 py-2 bg-gray-100 text-black hover:bg-gray-200 hover:border-gray-200 transition-colors duration-150"} onClick={() => setHasAttachments(false)}>Não</button>
                      </div>
                    </label>

                    {hasAttachments === true && (
                      <AttachmentsUploadBlock files={attachmentFiles} setFiles={setAttachmentFiles} attachmentsConfirm={attachmentsConfirm} setAttachmentsConfirm={setAttachmentsConfirm} />
                    )}
                    {hasAttachments === false && (
                      <NoAttachmentsReasonBlock value={noAttachmentsReason} onChange={setNoAttachmentsReason} />
                    )}
                  </div>
                </section>
              )}

              {/* Campos para Pagamento de material/serviço */}
              {requestType === "pagamento_material_servico" && (
                <section className="rounded-xl border bg-card p-6 pb-4 mb-6">
                  <div className="flex items-center gap-3 text-sm font-semibold mb-2 pb-2 text-foreground leading-tight"><CreditCard className="size-4 text-primary" /> <span>{REQUEST_TYPE_META['pagamento_material_servico'].label}</span></div>
                  <div className="grid gap-3">
                    <label className="mb-3">
                      <div className="text-sm font-medium">Nome da empresa</div>
                      <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Insira o valor aqui" className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground" />
                    </label>

                    <label className="mb-3">
                      <div className="text-sm font-medium">CNPJ</div>
                      <input value={companyCNPJ} onChange={(e) => setCompanyCNPJ(e.target.value)} placeholder="Inserir um número" className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground" />
                    </label>

                    <label className="mb-3">
                      <div className="text-sm font-medium">Dados bancários da empresa</div>
                      <input value={bankDetails} onChange={(e) => setBankDetails(e.target.value)} placeholder="Insira o valor aqui" className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground" />
                    </label>

                    <label className="mb-3">
                      <div className="text-sm font-medium">Endereço da empresa</div>
                      <input value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} placeholder="Insira o valor aqui" className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground" />
                    </label>

                    <label className="mb-3">
                      <div className="text-sm font-medium">Telefone da empresa</div>
                      <input value={companyPhone} onChange={(e) => setCompanyPhone(e.target.value)} placeholder="Inserir um número" className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground" />
                    </label>

                    <label className="mb-3">
                      <div className="text-sm font-medium">Descrição do material ou serviço contratado. Caso haja alguma observação importante, inclua também.</div>
                      <textarea value={serviceDescription} onChange={(e) => setServiceDescription(e.target.value)} placeholder="Insira o valor aqui" className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground" rows={4} />
                      <div className="text-xs text-muted-foreground mt-2">Liste um item abaixo do outro, como se fosse uma tabela. Na descrição, inclua o tipo de item, marca, configuração e outras informações importantes.</div>
                    </label>

                    <label className="mb-3">
                      <div className="text-sm font-medium">O valor do(a) pagamento/reembolso/compra é maior que R$800,00?</div>
                      <div className="mt-2 grid grid-cols-2 gap-3">
                        <button type="button" className={over800 === true ? "w-full rounded-lg border px-3 py-2 bg-primary text-primary-foreground border-transparent transition-colors duration-150 hover:opacity-95" : "w-full rounded-lg border px-3 py-2 bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary/20 transition-colors duration-150"} onClick={() => setOver800(true)}>Sim</button>
                        <button type="button" className={over800 === false ? "w-full rounded-lg border px-3 py-2 bg-primary text-primary-foreground border-transparent transition-colors duration-150 hover:opacity-95" : "w-full rounded-lg border px-3 py-2 bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary/20 transition-colors duration-150"} onClick={() => setOver800(false)}>Não</button>
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">Se o valor for superior a R$ 800,00, será necessário apresentar 3 orçamentos. Se a compra for menor que R$ 800,00 o pedido será enviado à equipe administrativa do CEIA.</div>
                    </label>

                    <label className="mb-3">
                      <div className="text-sm font-medium">Qual será o valor?</div>
                      <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Insira o valor aqui" className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground" />
                    </label>

                    <label className="mb-3">
                      <div className="text-sm font-medium">Possui documentos para anexar?</div>
                      <div className="mt-2 grid grid-cols-2 gap-3">
                        <button type="button" className={hasAttachments === true ? "w-full rounded-lg border px-3 py-2 bg-primary text-primary-foreground border-transparent transition-colors duration-150 hover:opacity-95" : "w-full rounded-lg border px-3 py-2 bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary/20 transition-colors duration-150"} onClick={() => setHasAttachments(true)}>Sim</button>
                        <button type="button" className={hasAttachments === false ? "w-full rounded-lg border px-3 py-2 bg-primary text-primary-foreground border-transparent transition-colors duration-150 hover:opacity-95" : "w-full rounded-lg border px-3 py-2 bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary/20 transition-colors duration-150"} onClick={() => setHasAttachments(false)}>Não</button>
                      </div>
                    </label>

                    {hasAttachments === true && (
                      <AttachmentsUploadBlock files={attachmentFiles} setFiles={setAttachmentFiles} attachmentsConfirm={attachmentsConfirm} setAttachmentsConfirm={setAttachmentsConfirm} />
                    )}
                    {hasAttachments === false && (
                      <NoAttachmentsReasonBlock value={noAttachmentsReason} onChange={setNoAttachmentsReason} />
                    )}
                  </div>
                </section>
              )}

              {/* Campos para Outros */}
              {requestType === "outros" && (
                <section className="rounded-xl border bg-card p-6 pb-4 mb-6">
                  <div className="flex items-center gap-3 text-sm font-semibold mb-2 pb-2 text-foreground leading-tight"><Info className="size-4 text-primary" /> <span>{REQUEST_TYPE_META['outros'].label}</span></div>
                  <div className="grid gap-3">
                    <label className="mb-3">
                      <div className="text-sm font-medium">Descrição detalhada da solicitação</div>
                      <textarea value={otherDescription} onChange={(e) => setOtherDescription(e.target.value)} placeholder="Insira o valor aqui" className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground" rows={4} />
                    </label>

                    <label className="mb-3">
                      <div className="text-sm font-medium">O valor do(a) pagamento/reembolso/compra é maior que R$800,00?</div>
                      <div className="mt-2 grid grid-cols-2 gap-3">
                        <button type="button" className={over800 === true ? "w-full rounded-lg border px-3 py-2 bg-primary text-primary-foreground border-transparent transition-colors duration-150 hover:opacity-95" : "w-full rounded-lg border px-3 py-2 bg-white text-foreground hover:bg-primary/5 hover:border-primary/20 transition-colors duration-150"} onClick={() => setOver800(true)}>Sim</button>
                        <button type="button" className={over800 === false ? "w-full rounded-lg border px-3 py-2 bg-primary text-primary-foreground border-transparent transition-colors duration-150 hover:opacity-95" : "w-full rounded-lg border px-3 py-2 bg-white text-foreground hover:bg-primary/5 hover:border-primary/20 transition-colors duration-150"} onClick={() => setOver800(false)}>Não</button>
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">Se o valor for superior a R$ 800,00, será necessário apresentar 3 orçamentos. Se a compra for menor que R$ 800,00 o pedido será enviado à equipe administrativa do CEIA.</div>
                    </label>

                    <label className="mb-3">
                      <div className="text-sm font-medium">Qual será o valor?</div>
                      <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Insira o valor aqui" className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground" />
                    </label>

                    <label className="mb-3">
                      <div className="text-sm font-medium">Possui documentos para anexar?</div>
                      <div className="mt-2 grid grid-cols-2 gap-3">
                        <button type="button" className={hasAttachments === true ? "w-full rounded-lg border px-3 py-2 bg-primary text-primary-foreground border-transparent transition-colors duration-150 hover:opacity-95" : "w-full rounded-lg border px-3 py-2 bg-white text-foreground hover:bg-primary/5 hover:border-primary/20 transition-colors duration-150"} onClick={() => setHasAttachments(true)}>Sim</button>
                        <button type="button" className={hasAttachments === false ? "w-full rounded-lg border px-3 py-2 bg-primary text-primary-foreground border-transparent transition-colors duration-150 hover:opacity-95" : "w-full rounded-lg border px-3 py-2 bg-white text-foreground hover:bg-primary/5 hover:border-primary/20 transition-colors duration-150"} onClick={() => setHasAttachments(false)}>Não</button>
                      </div>
                    </label>

                    {hasAttachments === true && (
                      <AttachmentsUploadBlock files={attachmentFiles} setFiles={setAttachmentFiles} attachmentsConfirm={attachmentsConfirm} setAttachmentsConfirm={setAttachmentsConfirm} />
                    )}
                    {hasAttachments === false && (
                      <NoAttachmentsReasonBlock value={noAttachmentsReason} onChange={setNoAttachmentsReason} />
                    )}
                  </div>
                </section>
              )}

              {/* Detalhamento específico para Compra de material/serviço */}
              {requestType === "compra_material_servico" && (
                <section className="rounded-xl border bg-card p-6 mb-6">
                  <div className="flex items-center gap-3 text-sm font-semibold mb-2 pb-2 text-foreground leading-tight"><ShoppingCart className="size-4 text-primary" /> <span>{REQUEST_TYPE_META['compra_material_servico'].label}</span></div>
                  <div className="grid gap-3">
                    <label className="mb-3">
                      <div className="text-sm font-medium">Descreva o(s) item(ns), a(s) quantidade(s). Caso haja alguma observação importante, inclua também.</div>
                      <textarea value={itemDescription} onChange={(e) => setItemDescription(e.target.value)} placeholder="Insira o valor aqui" className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground" rows={4} />
                    </label>

                    <label className="mb-3">
                      <div className="text-sm font-medium">Descreva também: local onde o produto ou serviço será utilizado; aderência da compra aos objetivos do projeto financiador da compra, importância de adquirir o produto ou serviço, e deixar explícito que a finalidade da compra é a utilização do bem ou serviço em atividades de pesquisa.</div>
                      <textarea value={usageDescription} onChange={(e) => setUsageDescription(e.target.value)} placeholder="Insira o valor aqui" className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground" rows={4} />
                    </label>

                    <label className="mb-3">
                      <div className="text-sm font-medium">Local de entrega</div>
                      <input value={deliveryLocation} onChange={(e) => setDeliveryLocation(e.target.value)} placeholder="Insira o valor aqui" className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground" />
                    </label>

                    <label className="mb-3">
                      <div className="text-sm font-medium">Data em que necessita do(s) material(is) ou serviço(s)</div>
                      <div className="relative mt-2">
                        <Calendar className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input value={neededDate} onChange={(e) => setNeededDate(formatDateDDMMYYYY(e.target.value))} placeholder="DD/MM/AAAA" inputMode="numeric" maxLength={10} className="w-full rounded-lg border pl-10 pr-3 py-2 bg-white text-foreground" />
                      </div>
                    </label>

                    <label className="mb-3">
                      <div className="text-sm font-medium">O valor do(a) pagamento/reembolso/compra é maior que R$800,00?</div>
                      <div className="mt-2 grid grid-cols-2 gap-3">
                        <button type="button" className={over800 === true ? "w-full rounded-lg border px-3 py-2 bg-primary text-primary-foreground" : "w-full rounded-lg border px-3 py-2 bg-white text-foreground"} onClick={() => setOver800(true)}>Sim</button>
                        <button type="button" className={over800 === false ? "w-full rounded-lg border px-3 py-2 bg-primary text-primary-foreground" : "w-full rounded-lg border px-3 py-2 bg-white text-foreground"} onClick={() => setOver800(false)}>Não</button>
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">Se o valor for superior a R$ 800,00, será necessário apresentar 3 orçamentos. Se a compra for menor que R$ 800,00 o pedido será enviado à equipe administrativa do CEIA.</div>
                    </label>

                    <label className="mb-3">
                      <div className="text-sm font-medium">Qual será o valor?</div>
                      <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Insira o valor aqui" className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground" />
                    </label>

                    <label className="mb-3">
                      <div className="text-sm font-medium">Possui documentos para anexar?</div>
                      <div className="mt-2 grid grid-cols-2 gap-3">
                        <button type="button" className={hasAttachments === true ? "w-full rounded-lg border px-3 py-2 bg-primary text-primary-foreground" : "w-full rounded-lg border px-3 py-2 bg-white text-foreground"} onClick={() => setHasAttachments(true)}>Sim</button>
                        <button type="button" className={hasAttachments === false ? "w-full rounded-lg border px-3 py-2 bg-primary text-primary-foreground" : "w-full rounded-lg border px-3 py-2 bg-white text-foreground"} onClick={() => setHasAttachments(false)}>Não</button>
                      </div>
                    </label>

                    {hasAttachments === true && (
                      <AttachmentsUploadBlock files={attachmentFiles} setFiles={setAttachmentFiles} attachmentsConfirm={attachmentsConfirm} setAttachmentsConfirm={setAttachmentsConfirm} />
                    )}
                    {hasAttachments === false && (
                      <NoAttachmentsReasonBlock value={noAttachmentsReason} onChange={setNoAttachmentsReason} />
                    )}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
          ) : (
            <ComprasHistoryList
              submissions={submissions}
              onResend={(idx, updated) => {
                setSubmissions((prev) => prev.map((s, i) => i === idx ? { ...s, ...updated, _status: "em_analise_corretor", _corretorComment: undefined, createdAt: new Date().toLocaleString() } : s));
              }}
            />
          )}
      </>
      )}

      {outerTab === "minhas" && tab === "nova" && !sent && (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-10 md:bottom-6 md:max-w-xl md:ml-auto z-30">
        <div className="rounded-2xl border bg-card/95 backdrop-blur shadow-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div />
          <div className="flex items-center gap-2">
            <button onClick={clear} className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"><BrushCleaning className="size-4" /> Limpar</button>
            <button onClick={submit} disabled={!canSubmit} className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
              <Send className="size-4" /> Enviar solicitação
            </button>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}

export default ComprasPagamentosPage;

// =============================================================
// Histórico "Minhas Solicitações" — Compras & Pagamentos
// Mesma lógica e design de Passagens e Diárias (status, cards,
// botões e diálogos). Só mudam as informações exibidas.
// =============================================================

type ComprasHistStatus =
  | "em_correcao"
  | "em_analise_coordenador"
  | "em_analise_admin"
  | "em_analise_corretor";

// Monta a lista de campos (label/valor) a partir dos dados do formulário,
// conforme o tipo da solicitação, descartando valores vazios.
function buildComprasCampos(tipo: string, d: Record<string, string>): ComprasFieldEntry[] {
  const mk = (label: string, value: string, multiline?: boolean): ComprasFieldEntry | null =>
    value && value.trim() !== "" ? { label, value, multiline } : null;
  let entries: (ComprasFieldEntry | null)[] = [];
  if (tipo === "compra_material_servico") {
    entries = [
      mk("Descrição do material/serviço", d.itemDescription, true),
      mk("Como será utilizado", d.usageDescription, true),
      mk("Local de entrega", d.deliveryLocation),
      mk("Data limite necessária", d.neededDate),
    ];
  } else if (tipo === "pagamento_material_servico") {
    entries = [
      mk("Nome da empresa", d.companyName),
      mk("CNPJ", d.companyCNPJ),
      mk("Dados bancários", d.bankDetails),
      mk("Endereço da empresa", d.companyAddress),
      mk("Telefone", d.companyPhone),
      mk("Descrição do material/serviço contratado", d.serviceDescription, true),
    ];
  } else if (tipo === "inscricao_publicacao") {
    entries = [
      mk("CPF", d.cpf),
      mk("E-mail de contato do evento", d.contactEventEmail),
      mk("Nome do evento", d.eventName),
      mk("Atividade que será realizada", d.activityDesc, true),
      mk("Local", d.eventLocation),
      mk("Data limite para inscrição", d.registrationDeadline),
    ];
  } else if (tipo === "ressarcimento_despesa") {
    entries = [
      mk("CPF do solicitante", d.cpfSolicitante),
      mk("RG", d.rgSolicitante),
      mk("Confirmação de pagamento", d.paymentConfirmation),
      mk("Endereço do solicitante", d.enderecoSolicitante),
      mk("Cargo no projeto", d.cargoProjeto),
      mk("Compra(s) que solicita reembolso", d.purchasesList, true),
      mk("Justificativa das despesas", d.justification, true),
    ];
  } else {
    entries = [mk("Descrição detalhada da solicitação", d.otherDescription, true)];
  }
  return entries.filter((e): e is ComprasFieldEntry => e !== null);
}

const SEED_COMPRAS_HISTORY: any[] = [
  {
    _status: "em_correcao",
    _corretorComment:
      "Por favor, anexe os 3 orçamentos exigidos para compras acima de R$ 800,00 e detalhe a marca/modelo desejada no campo de descrição do material.",
    solicitante: "Renata Braga",
    email: "renata.braga@ceia.ufg.br",
    tipo: "compra_material_servico",
    projetoSolicitado: "Sistema de Navegação Autônoma para VANTs",
    valor: "R$ 4.580,00",
    over800: true,
    anexos: ["orcamento-tecnoloja.pdf"],
    campos: [
      { label: "Descrição do material/serviço", value: "2x GPU NVIDIA GeForce RTX 4090 24GB GDDR6X.", multiline: true },
      { label: "Local de entrega", value: "CEIA/UFG — Sala 207, Bloco IMTec" },
      { label: "Data limite necessária", value: "30/05/2026" },
    ],
    // Campos brutos do formulário — permitem reabrir o formulário completo na correção
    requesterName: "Renata Braga",
    requesterEmail: "renata.braga@ceia.ufg.br",
    requesterPhone: "(62) 99988-7766",
    requesterDOB: "10/02/1980",
    projectLinked: "Sistema de Navegação Autônoma para VANTs",
    demandProject: "Sistema de Navegação Autônoma para VANTs",
    requestType: "compra_material_servico",
    itemDescription: "2x GPU NVIDIA GeForce RTX 4090 24GB GDDR6X.",
    usageDescription: "Aceleração do treinamento dos modelos de visão computacional embarcados nos VANTs, em atividades de pesquisa do projeto.",
    deliveryLocation: "CEIA/UFG — Sala 207, Bloco IMTec",
    neededDate: "30/05/2026",
    amount: "R$ 4.580,00",
    hasAttachments: true,
    createdAt: "29/04/2026 10:42",
  },
  {
    _status: "em_analise_corretor",
    solicitante: "Renata Braga",
    email: "renata.braga@ceia.ufg.br",
    tipo: "inscricao_publicacao",
    projetoSolicitado: "IA para Detecção de Plágio Acadêmico",
    valor: "R$ 1.200,00",
    over800: true,
    anexos: ["carta-aceite-bracis.pdf", "boleto-funape.pdf"],
    campos: [
      { label: "Nome do evento", value: "BRACIS 2026 — Brazilian Conference on Intelligent Systems" },
      { label: "Atividade que será realizada", value: "Apresentação oral de artigo aceito sobre detecção de plágio.", multiline: true },
      { label: "Local", value: "Recife/PE — Centro de Convenções" },
      { label: "Data limite para inscrição", value: "15/05/2026" },
    ],
    createdAt: "06/05/2026 09:15",
  },
  {
    _status: "em_analise_coordenador",
    solicitante: "Renata Braga",
    email: "renata.braga@ceia.ufg.br",
    tipo: "pagamento_material_servico",
    projetoSolicitado: "Plataforma Wave Testing",
    valor: "R$ 2.800,00",
    over800: true,
    anexos: ["contrato-secauditbr.pdf", "orçamento-1.pdf", "orçamento-2.pdf", "orçamento-3.pdf"],
    campos: [
      { label: "Nome da empresa", value: "SecAuditBR Serviços de Segurança Ltda." },
      { label: "CNPJ", value: "12.345.678/0001-90" },
      { label: "Descrição do material/serviço contratado", value: "Auditoria de segurança em hardware embarcado.", multiline: true },
    ],
    createdAt: "28/04/2026 16:08",
  },
  {
    _status: "em_analise_admin",
    solicitante: "Renata Braga",
    email: "renata.braga@ceia.ufg.br",
    tipo: "ressarcimento_despesa",
    projetoSolicitado: "Portal CEIA — Gestão de Projetos",
    valor: "R$ 380,00",
    over800: false,
    anexos: ["nota-fiscal-jetbrains.pdf", "comprovante-pagamento.pdf"],
    campos: [
      { label: "Compra(s) que solicita reembolso", value: "1x JetBrains All Products Pack — 1 ano (R$ 380,00)", multiline: true },
      { label: "Justificativa das despesas", value: "Licença adquirida com cartão pessoal por urgência.", multiline: true },
    ],
    createdAt: "20/04/2026 11:30",
  },
];

function comprasHistStatusBadge(status: ComprasHistStatus) {
  switch (status) {
    case "em_correcao":
      return { card: "bg-orange-100 text-orange-800 border-orange-200", detail: "bg-orange-50 text-orange-700 border-orange-200", icon: <AlertTriangle className="size-3" />, detailIcon: <AlertTriangle className="size-3.5" />, label: "Devolvida" };
    case "em_analise_coordenador":
      return { card: "bg-sky-100 text-sky-800 border-sky-200", detail: "bg-sky-50 text-sky-700 border-sky-200", icon: <AlertCircle className="size-3" />, detailIcon: <AlertCircle className="size-3.5" />, label: "Em análise (coordenador)" };
    case "em_analise_admin":
      return { card: "bg-violet-100 text-violet-800 border-violet-200", detail: "bg-violet-50 text-violet-700 border-violet-200", icon: <AlertCircle className="size-3" />, detailIcon: <AlertCircle className="size-3.5" />, label: "Em análise (Equipe administrativa)" };
    default:
      return { card: "bg-amber-100 text-amber-800 border-amber-200", detail: "bg-amber-50 text-amber-700 border-amber-200", icon: <AlertCircle className="size-3" />, detailIcon: <AlertCircle className="size-3.5" />, label: "Em análise (corretores)" };
  }
}

function ComprasHistoryList({ submissions, onResend }: { submissions: any[]; onResend?: (idx: number, updated: any) => void }) {
  const [detail, setDetail] = useState<any | null>(null);
  const [correctIdx, setCorrectIdx] = useState<number | null>(null);
  if (submissions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
        Nenhuma solicitação anterior.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {submissions.map((s: any, idx: number) => {
        const status: ComprasHistStatus = s._status ?? "em_analise_corretor";
        const isReturned = status === "em_correcao";
        const badge = comprasHistStatusBadge(status);
        const tipo = (s.tipo ?? s.requestType) as ComprasApprovalKind;
        const meta = COMPRAS_TIPO_META[tipo];
        const TipoIcon = meta?.icon ?? FileText;
        const tipoLabel = meta?.label ?? "Solicitação";
        const valor = s.valor ?? s.amount;
        return (
          <div
            key={idx}
            className="group rounded-xl border bg-card overflow-hidden transition-all duration-200 hover:shadow-sm"
          >
            <div className="px-5 py-4 flex flex-col md:flex-row md:items-center gap-4">
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-base font-semibold text-foreground truncate inline-flex items-center gap-2">
                    <TipoIcon className="size-4 text-muted-foreground" /> {tipoLabel}
                  </span>
                  <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold", badge.card)}>
                    {badge.icon} {badge.label}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground inline-flex items-center gap-2 flex-wrap">
                  <FolderKanban className="size-3.5" /> {s.projetoSolicitado ?? s.projectLinked}
                  <span className="text-muted-foreground/50">•</span>
                  <Calendar className="size-3.5" /> {s.createdAt}
                  {valor && (
                    <>
                      <span className="text-muted-foreground/50">•</span>
                      <Wallet className="size-3.5" /> {valor}
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {isReturned && onResend ? (
                  <button
                    onClick={() => setCorrectIdx(idx)}
                    className="inline-flex items-center gap-2 rounded-lg bg-orange-600 text-white px-4 py-2 text-sm font-semibold hover:bg-orange-700"
                  >
                    <AlertTriangle className="size-4" /> Corrigir
                  </button>
                ) : (
                  <button onClick={() => setDetail(s)} className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-accent"><Eye className="size-4" /> Ver detalhes</button>
                )}
              </div>
            </div>
          </div>
        );
      })}
      {detail && (
        <ComprasHistoryDetailDialog submission={detail} onClose={() => setDetail(null)} />
      )}
      {correctIdx !== null && submissions[correctIdx] && onResend && (
        <CorrigirComprasDialog
          submission={submissions[correctIdx]}
          onClose={() => setCorrectIdx(null)}
          onResend={(updated) => { onResend(correctIdx, updated); setCorrectIdx(null); }}
        />
      )}
    </div>
  );
}

function ComprasHistoryDetailDialog({ submission: s, onClose }: { submission: any; onClose: () => void }) {
  const status: ComprasHistStatus = s._status ?? "em_analise_corretor";
  const badge = comprasHistStatusBadge(status);
  const tipo = (s.tipo ?? s.requestType) as ComprasApprovalKind;
  const meta = COMPRAS_TIPO_META[tipo];
  const labels = COMPRAS_TIPO_LABELS[tipo] ?? { sectionTitle: "Solicitação", valorLabel: "Valor estimado" };
  const TipoIcon = meta?.icon ?? FileText;
  const valor = s.valor ?? s.amount;
  const campos: ComprasFieldEntry[] = s.campos ?? [];
  const inlineFields = campos.filter((c) => !c.multiline);
  const blockFields = campos.filter((c) => c.multiline);
  const anexos: string[] = s.anexos ?? [];

  return (
    <Dialog open={true} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="sticky top-0 bg-background z-10 px-6 pt-6 pb-4 border-b flex items-start justify-between gap-4">
          <DialogHeader className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="size-9 rounded-lg bg-primary/10 text-primary inline-flex items-center justify-center shrink-0">
                <FileText className="size-4" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-base font-semibold leading-tight">
                  Detalhes da solicitação
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Visualização somente leitura dos dados enviados.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <button
            onClick={onClose}
            className="size-8 rounded-md inline-flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground transition-colors shrink-0"
            aria-label="Fechar"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-5">
          {/* Resumo */}
          <section className="rounded-xl border bg-white px-4 pt-3 pb-4 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
              <Info className="size-4 text-primary" /> Resumo
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <CPTile full icon={<FolderKanban className="size-3.5" />} label="Projeto vinculado" value={s.projetoSolicitado ?? s.projectLinked} />
              <CPTile icon={<Wallet className="size-3.5" />} label={labels.valorLabel} value={valor} />
              <div className="rounded-lg border bg-card px-3 py-2.5 min-w-0">
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.08em] text-muted-foreground font-semibold">
                  <ShoppingCart className="size-3.5" />
                  <span>Tipo</span>
                </div>
                <div className="mt-1.5"><ComprasTipoBadge tipo={tipo} /></div>
              </div>
              <div className="rounded-lg border bg-card px-3 py-2.5 min-w-0">
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.08em] text-muted-foreground font-semibold">
                  <CheckCircle2 className="size-3.5" />
                  <span>Status</span>
                </div>
                <div className="mt-1.5">
                  <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wider", badge.detail)}>
                    {badge.detailIcon} {badge.label}
                  </span>
                </div>
              </div>
              <CPTile icon={<Calendar className="size-3.5" />} label="Enviada em" value={s.createdAt} />
              <CPTile icon={<DollarSign className="size-3.5" />} label="Valor > R$ 800,00" value={s.over800 ? "Sim (3 orçamentos)" : "Não"} />
            </div>
          </section>

          {status === "em_correcao" && s._corretorComment && (
            <section className="rounded-xl border border-orange-200 bg-orange-50/60 p-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-orange-800 mb-2">
                <MessageSquare className="size-4" /> Comentário da devolução
              </div>
              <p className="text-sm text-orange-900 leading-relaxed whitespace-pre-line">{s._corretorComment}</p>
            </section>
          )}

          {/* Solicitante */}
          <CPSection title="Identificação do solicitante" icon={<User2 className="size-4" />} tone="sky">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <CPTile full icon={<User2 className="size-3.5" />} label="Nome" value={s.solicitante ?? s.requesterName} />
              <CPTile full icon={<FolderKanban className="size-3.5" />} label="E-mail" value={s.email ?? s.requesterEmail} />
            </div>
          </CPSection>

          {/* Tipo-specific */}
          <CPSection title={labels.sectionTitle} icon={<TipoIcon className="size-4" />} tone="indigo">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <CPTile icon={<Wallet className="size-3.5" />} label={labels.valorLabel} value={valor} />
              <CPTile icon={<DollarSign className="size-3.5" />} label="Valor > R$ 800,00" value={s.over800 ? "Sim (3 orçamentos)" : "Não"} />
              {inlineFields.map((c) => (
                <CPTile key={c.label} label={c.label} value={c.value} />
              ))}
              {blockFields.map((c) => (
                <CPTile key={c.label} full label={c.label} value={<span className="block whitespace-pre-wrap leading-relaxed">{c.value}</span>} />
              ))}
            </div>
          </CPSection>

          {/* Anexos */}
          {anexos.length > 0 && (
            <CPSection title="Anexos" icon={<Paperclip className="size-4" />} tone="gray">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {anexos.map((nome) => (
                  <CPFileTile key={nome} label="Documento anexado" name={nome} />
                ))}
              </div>
            </CPSection>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CorrigirComprasDialog({
  submission,
  onClose,
  onResend,
}: {
  submission: any;
  onClose: () => void;
  onResend: (updated: any) => void;
}) {
  const REQUEST_TYPE_META: Record<string, { label: string }> = {
    compra_material_servico: { label: "Compra de material/serviço" },
    pagamento_material_servico: { label: "Pagamento de material/serviço" },
    inscricao_publicacao: { label: "Inscrição / Publicação" },
    ressarcimento_despesa: { label: "Ressarcimento de despesa" },
    outros: { label: "Outros" },
  };

  // Identificação (somente leitura — preservada do envio original)
  const [requesterName] = useState<string>(submission.requesterName ?? submission.solicitante ?? "");
  const [requesterEmail] = useState<string>(submission.requesterEmail ?? submission.email ?? "");
  const [requesterPhone] = useState<string>(submission.requesterPhone ?? "");
  const [requesterDOB] = useState<string>(submission.requesterDOB ?? "");

  // Projeto e tipo
  const [projectLinked, setProjectLinked] = useState<string>(submission.projectLinked ?? submission.projetoSolicitado ?? "");
  const [demandProject, setDemandProject] = useState<string>(submission.demandProject ?? "");
  const [requestType, setRequestType] = useState<string>(submission.requestType ?? submission.tipo ?? "");

  // Compra de material/serviço
  const [itemDescription, setItemDescription] = useState<string>(submission.itemDescription ?? "");
  const [usageDescription, setUsageDescription] = useState<string>(submission.usageDescription ?? "");
  const [deliveryLocation, setDeliveryLocation] = useState<string>(submission.deliveryLocation ?? "");
  const [neededDate, setNeededDate] = useState<string>(submission.neededDate ?? "");

  // Comuns (valor / anexos)
  const [over800, setOver800] = useState<boolean | null>(submission.over800 ?? null);
  const [amount, setAmount] = useState<string>(submission.amount ?? submission.valor ?? "");
  const [hasAttachments, setHasAttachments] = useState<boolean | null>(submission.hasAttachments ?? null);
  const [attachmentsConfirm, setAttachmentsConfirm] = useState<boolean>(submission.attachmentsConfirm ?? false);
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [noAttachmentsReason, setNoAttachmentsReason] = useState<string>(submission.noAttachmentsReason ?? "");

  // Inscrição / Publicação
  const [cpf, setCpf] = useState<string>(submission.cpf ?? "");
  const [contactEventEmail, setContactEventEmail] = useState<string>(submission.contactEventEmail ?? "");
  const [eventName, setEventName] = useState<string>(submission.eventName ?? "");
  const [activityDesc, setActivityDesc] = useState<string>(submission.activityDesc ?? "");
  const [eventLocation, setEventLocation] = useState<string>(submission.eventLocation ?? "");
  const [registrationDeadline, setRegistrationDeadline] = useState<string>(submission.registrationDeadline ?? "");
  const [registrationDone, setRegistrationDone] = useState<boolean | null>(submission.registrationDone ?? null);
  const [registrationPaid, setRegistrationPaid] = useState<"reembolso" | "pagamento" | null>(submission.registrationPaid ?? null);
  const [registrationNotDoneReason, setRegistrationNotDoneReason] = useState<"requisitos" | "funape" | "tempo" | "abertas" | null>(submission.registrationNotDoneReason ?? null);
  const [registrationCeiaSupport, setRegistrationCeiaSupport] = useState<boolean | null>(submission.registrationCeiaSupport ?? null);
  const [noSupportDescription, setNoSupportDescription] = useState<string>(submission.noSupportDescription ?? "");

  // Pagamento de material/serviço
  const [companyName, setCompanyName] = useState<string>(submission.companyName ?? "");
  const [companyCNPJ, setCompanyCNPJ] = useState<string>(submission.companyCNPJ ?? "");
  const [bankDetails, setBankDetails] = useState<string>(submission.bankDetails ?? "");
  const [companyAddress, setCompanyAddress] = useState<string>(submission.companyAddress ?? "");
  const [companyPhone, setCompanyPhone] = useState<string>(submission.companyPhone ?? "");
  const [serviceDescription, setServiceDescription] = useState<string>(submission.serviceDescription ?? "");

  // Outros
  const [otherDescription, setOtherDescription] = useState<string>(submission.otherDescription ?? "");

  // Ressarcimento de despesa
  const [cpfSolicitante, setCpfSolicitante] = useState<string>(submission.cpfSolicitante ?? "");
  const [rgSolicitante, setRgSolicitante] = useState<string>(submission.rgSolicitante ?? "");
  const [paymentConfirmation, setPaymentConfirmation] = useState<string>(submission.paymentConfirmation ?? "");
  const [enderecoSolicitante, setEnderecoSolicitante] = useState<string>(submission.enderecoSolicitante ?? "");
  const [pixConsent, setPixConsent] = useState<boolean>(submission.pixConsent ?? false);
  const [purchasesList, setPurchasesList] = useState<string>(submission.purchasesList ?? "");
  const [justification, setJustification] = useState<string>(submission.justification ?? "");

  const cargoProjeto = PROJECTS.find((p: any) => p.name === projectLinked)?.role ?? "";
  const canSubmit = projectLinked.trim() !== "" && requestType.trim() !== "";

  function handleResend() {
    const data = {
      requesterName,
      requesterEmail,
      requesterDOB,
      requesterPhone,
      projectLinked,
      demandProject,
      requestType,
      itemDescription,
      usageDescription,
      deliveryLocation,
      neededDate,
      over800,
      amount,
      hasAttachments,
      attachmentsConfirm,
      cpf,
      contactEventEmail,
      eventName,
      activityDesc,
      eventLocation,
      registrationDeadline,
      registrationDone,
      registrationPaid,
      registrationNotDoneReason,
      registrationCeiaSupport,
      noSupportDescription,
      companyName,
      companyCNPJ,
      bankDetails,
      companyAddress,
      companyPhone,
      serviceDescription,
      cpfSolicitante,
      rgSolicitante,
      paymentConfirmation,
      enderecoSolicitante,
      pixConsent,
      cargoProjeto,
      purchasesList,
      justification,
      otherDescription,
      noAttachmentsReason,
      // Normalizados para o Histórico
      tipo: requestType,
      solicitante: requesterName,
      email: requesterEmail,
      projetoSolicitado: projectLinked,
      valor: amount,
      anexos: attachmentFiles.length > 0 ? attachmentFiles.map((f) => f.name) : (submission.anexos ?? []),
      campos: buildComprasCampos(requestType, {
        itemDescription, usageDescription, deliveryLocation, neededDate,
        companyName, companyCNPJ, bankDetails, companyAddress, companyPhone, serviceDescription,
        cpf, contactEventEmail, eventName, activityDesc, eventLocation, registrationDeadline,
        cpfSolicitante, rgSolicitante, paymentConfirmation, enderecoSolicitante, cargoProjeto,
        purchasesList, justification, otherDescription,
      }),
    };
    onResend(data);
  }

  return (
    <Dialog open={true} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="sticky top-0 bg-background z-10 px-6 pt-6 pb-4 border-b flex items-start justify-between gap-4">
          <DialogHeader className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="size-9 rounded-lg bg-orange-100 text-orange-700 inline-flex items-center justify-center shrink-0">
                <AlertTriangle className="size-4" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-base font-semibold leading-tight">Corrigir solicitação</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Ajuste os dados conforme solicitado e reenvie para nova análise.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <button
            onClick={onClose}
            className="size-8 rounded-md inline-flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground transition-colors shrink-0"
            aria-label="Fechar"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body — formulário completo, pré-preenchido */}
        <div className="px-6 py-5 space-y-6">
          {submission._corretorComment && (
            <section className="rounded-xl border border-orange-200 bg-orange-50/60 p-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-orange-800 mb-2">
                <MessageSquare className="size-4" /> Comentário da devolução
              </div>
              <p className="text-sm text-orange-900 leading-relaxed whitespace-pre-line">{submission._corretorComment}</p>
            </section>
          )}

          {/* Identificação (somente leitura) */}
          <section className="rounded-xl border bg-card p-6 pb-2">
            <div className="flex items-center gap-3 text-base font-semibold mb-2 pb-2 text-foreground leading-tight"><User2 className="size-4 text-primary" /> <span>Identificação</span></div>
            <div className="grid gap-3">
              <div className="grid sm:grid-cols-2 gap-4">
                <label className="mb-3">
                  <div className="text-sm font-medium">Nome do solicitante <span className="text-red-500 ml-1">*</span></div>
                  <input value={requesterName} readOnly placeholder="Nome completo" className="mt-2 w-full rounded-lg border px-3 py-2 bg-gray-50 text-foreground cursor-not-allowed" />
                </label>
                <label className="mb-3">
                  <div className="text-sm font-medium">E-mail do solicitante <span className="text-red-500 ml-1">*</span></div>
                  <input value={requesterEmail} readOnly placeholder="email@exemplo.com" className="mt-2 w-full rounded-lg border px-3 py-2 bg-gray-50 text-foreground cursor-not-allowed" />
                </label>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <label className="mb-3">
                  <div className="text-sm font-medium">Telefone de contato <span className="text-red-500 ml-1">*</span></div>
                  <input value={requesterPhone} readOnly placeholder="Telefone" className="mt-2 w-full rounded-lg border px-3 py-2 bg-gray-50 text-foreground cursor-not-allowed" />
                </label>
                <label className="mb-3">
                  <div className="text-sm font-medium">Data de nascimento <span className="text-red-500 ml-1">*</span></div>
                  <div className="relative mt-2">
                    <Calendar className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input value={requesterDOB} readOnly placeholder="DD/MM/AAAA" inputMode="numeric" maxLength={10} className="w-full rounded-lg border pl-10 pr-3 py-2 bg-gray-50 text-foreground cursor-not-allowed" />
                  </div>
                </label>
              </div>
            </div>
          </section>

          {/* Projeto e Tipo de Solicitação */}
          <section className="rounded-xl border bg-card p-6 pb-4">
            <div className="flex items-center gap-3 text-base font-semibold mb-2 pb-2 text-foreground leading-tight"><Briefcase className="size-4 text-primary" /> <span>Projeto e Tipo de Solicitação</span></div>
            <div className="grid gap-3">
              <label className="mb-3">
                <div className="text-sm font-medium">Nome do projeto que custeará a despesa <span className="text-red-500 ml-1">*</span></div>
                <select value={projectLinked} onChange={(e) => setProjectLinked(e.target.value)} className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground select-arrow" required>
                  <option value="">Selecionar uma opção</option>
                  {PROJECTS.map((p: any) => (<option key={p.id} value={p.name}>{p.name}</option>))}
                </select>
              </label>

              <label className="mb-3">
                <div className="text-sm font-medium">Qual projeto gerou a demanda?</div>
                <select value={demandProject} onChange={(e) => setDemandProject(e.target.value)} className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground select-arrow">
                  <option value="">Selecionar uma opção</option>
                  {PROJECTS.map((p: any) => (<option key={p.id} value={p.name}>{p.name}</option>))}
                </select>
              </label>

              <label className="mb-3">
                <div className="text-sm font-medium">Qual o tipo de solicitação?</div>
                <select value={requestType} onChange={(e) => setRequestType(e.target.value)} className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground select-arrow">
                  <option value="">selecione</option>
                  <option value="compra_material_servico">Compra de material/serviço</option>
                  <option value="pagamento_material_servico">Pagamento de material/serviço</option>
                  <option value="inscricao_publicacao">Inscrição/publicação</option>
                  <option value="ressarcimento_despesa">Ressarcimento de despesa</option>
                  <option value="outros">Outros</option>
                </select>
              </label>
            </div>
          </section>

          {/* Campos para Inscrição / Publicação */}
          {requestType === "inscricao_publicacao" && (
            <section className="rounded-xl border bg-card p-6 pb-4">
              <div className="flex items-center gap-3 text-sm font-semibold mb-2 pb-2 text-foreground leading-tight"><BookOpen className="size-4 text-primary" /> <span>{REQUEST_TYPE_META['inscricao_publicacao'].label}</span></div>
              <div className="grid gap-3">
                <label className="mb-3">
                  <div className="text-sm font-medium">CPF</div>
                  <input value={cpf} onChange={(e) => setCpf(e.target.value)} placeholder="Insira o valor aqui" className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground" />
                </label>

                <label className="mb-3">
                  <div className="text-sm font-medium">E-mail de contato do evento</div>
                  <input value={contactEventEmail} onChange={(e) => setContactEventEmail(e.target.value)} placeholder="Insira o valor aqui" className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground" />
                </label>

                <label className="mb-3">
                  <div className="text-sm font-medium">Nome do evento, curso ou periódico para publicação em que deseja realizar a inscrição</div>
                  <input value={eventName} onChange={(e) => setEventName(e.target.value)} placeholder="Insira o valor aqui" className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground" />
                </label>

                <label className="mb-3">
                  <div className="text-sm font-medium">Qual atividade será realizada?</div>
                  <input value={activityDesc} onChange={(e) => setActivityDesc(e.target.value)} placeholder="Insira o valor aqui" className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground" />
                </label>

                <label className="mb-3">
                  <div className="text-sm font-medium">Local onde acontecerá</div>
                  <input value={eventLocation} onChange={(e) => setEventLocation(e.target.value)} placeholder="Insira o valor aqui" className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground" />
                </label>

                <label className="mb-3">
                  <div className="text-sm font-medium">Data limite para a inscrição</div>
                  <div className="relative mt-2">
                    <Calendar className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input value={registrationDeadline} onChange={(e) => setRegistrationDeadline(formatDateDDMMYYYY(e.target.value))} placeholder="DD/MM/AAAA" inputMode="numeric" maxLength={10} className="w-full rounded-lg border pl-10 pr-3 py-2 bg-white text-foreground" />
                  </div>
                </label>

                <label className="mb-3">
                  <div className="text-sm font-medium">A inscrição já foi feita?</div>
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    <button type="button" className={registrationDone === true ? "w-full rounded-lg border px-3 py-2 bg-primary text-primary-foreground border-transparent transition-colors duration-150 hover:opacity-95" : "w-full rounded-lg border px-3 py-2 bg-gray-100 text-black hover:bg-gray-200 hover:border-gray-200 transition-colors duration-150"} onClick={() => { setRegistrationDone(true); }}>Sim</button>
                    <button type="button" className={registrationDone === false ? "w-full rounded-lg border px-3 py-2 bg-primary text-primary-foreground border-transparent transition-colors duration-150 hover:opacity-95" : "w-full rounded-lg border px-3 py-2 bg-gray-100 text-black hover:bg-gray-200 hover:border-gray-200 transition-colors duration-150"} onClick={() => { setRegistrationDone(false); setRegistrationPaid(null); }}>Não</button>
                  </div>
                </label>

                {registrationDone === false && (
                  <>
                    <div className="mb-3">
                      <div className="text-sm font-medium">Qual a razão de não ter realizado a inscrição?</div>
                      <div className="mt-2 rounded-lg border bg-amber-50 border-amber-200 p-3 text-xs text-amber-900 leading-relaxed">
                        <strong>ATENÇÃO:</strong> É responsabilidade do interessado realizar a inscrição. Ele deve fazer com os dados da FUNAPE (Razão social: Fundação de Apoio à Pesquisa — FUNAPE, CNPJ: 00.799.205/0001-89, Endereço: Avenida Esperança, n° 1533, Parque Tecnológico Samambaia, Edifício FUNAPE, Campus Samambaia — UFG — Goiânia - GO — CEP: 74690-612). Depois deve encaminhar o boleto para a equipe administrativa do CEIA por meio desse formulário.
                      </div>
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          { id: "requisitos", label: "Não conheço os requisitos necessários" },
                          { id: "funape", label: "Não consegui incluir os dados da FUNAPE" },
                          { id: "tempo", label: "Ainda não tive tempo, mas vou fazer depois" },
                          { id: "abertas", label: "As inscrições ainda não estão abertas" },
                        ].map((r) => (
                          <button
                            key={r.id}
                            type="button"
                            className={cn(
                              "rounded-lg border px-3 py-2.5 text-sm text-left transition-colors duration-150",
                              registrationNotDoneReason === r.id
                                ? "bg-primary text-primary-foreground border-transparent hover:opacity-95"
                                : "bg-gray-100 text-black hover:bg-gray-200 hover:border-gray-200"
                            )}
                            onClick={() => { setRegistrationNotDoneReason(r.id as any); setRegistrationCeiaSupport(null); }}
                          >
                            {r.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {(registrationNotDoneReason === "requisitos" || registrationNotDoneReason === "funape") && (
                      <label className="mb-3">
                        <div className="text-sm font-medium">Gostaria de apoio da equipe administrativa do CEIA na realização?</div>
                        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                          Se marcar <strong className="text-foreground">sim</strong>, a equipe entrará em contato para ajudá-lo. Se marcar <strong className="text-foreground">não</strong>, ficamos aguardando a conclusão da inscrição para providenciarmos o pagamento.
                        </p>
                        <div className="mt-3 grid grid-cols-2 gap-3">
                          <button type="button" className={registrationCeiaSupport === true ? "w-full rounded-lg border px-3 py-2 bg-primary text-primary-foreground border-transparent transition-colors duration-150 hover:opacity-95" : "w-full rounded-lg border px-3 py-2 bg-gray-100 text-black hover:bg-gray-200 hover:border-gray-200 transition-colors duration-150"} onClick={() => setRegistrationCeiaSupport(true)}>Sim</button>
                          <button type="button" className={registrationCeiaSupport === false ? "w-full rounded-lg border px-3 py-2 bg-primary text-primary-foreground border-transparent transition-colors duration-150 hover:opacity-95" : "w-full rounded-lg border px-3 py-2 bg-gray-100 text-black hover:bg-gray-200 hover:border-gray-200 transition-colors duration-150"} onClick={() => setRegistrationCeiaSupport(false)}>Não</button>
                        </div>
                      </label>
                    )}

                    {registrationNotDoneReason === "requisitos" && registrationCeiaSupport === false && (
                      <>
                        <label className="mb-3">
                          <div className="text-sm font-medium">Descrição detalhada da solicitação</div>
                          <textarea value={noSupportDescription} onChange={(e) => setNoSupportDescription(e.target.value)} placeholder="Insira o valor aqui" className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground" rows={4} />
                        </label>

                        <label className="mb-3">
                          <div className="text-sm font-medium">O valor do(a) pagamento/reembolso/compra é maior que R$ 800,00?</div>
                          <div className="mt-2 grid grid-cols-2 gap-3">
                            <button type="button" className={over800 === true ? "w-full rounded-lg border px-3 py-2 bg-primary text-primary-foreground border-transparent transition-colors duration-150 hover:opacity-95" : "w-full rounded-lg border px-3 py-2 bg-gray-100 text-black hover:bg-gray-200 hover:border-gray-200 transition-colors duration-150"} onClick={() => setOver800(true)}>Sim</button>
                            <button type="button" className={over800 === false ? "w-full rounded-lg border px-3 py-2 bg-primary text-primary-foreground border-transparent transition-colors duration-150 hover:opacity-95" : "w-full rounded-lg border px-3 py-2 bg-gray-100 text-black hover:bg-gray-200 hover:border-gray-200 transition-colors duration-150"} onClick={() => setOver800(false)}>Não</button>
                          </div>
                          <div className="text-xs text-muted-foreground mt-2">Se o valor for superior a R$ 800,00, será necessário apresentar 3 orçamentos. Se a compra for menor que R$ 800,00 o pedido será enviado à equipe administrativa do CEIA.</div>
                        </label>

                        <label className="mb-3">
                          <div className="text-sm font-medium">Qual será o valor?</div>
                          <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Insira o valor aqui" className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground" />
                        </label>

                        <label className="mb-3">
                          <div className="text-sm font-medium">Possui documentos para anexar?</div>
                          <div className="mt-2 grid grid-cols-2 gap-3">
                            <button type="button" className={hasAttachments === true ? "w-full rounded-lg border px-3 py-2 bg-primary text-primary-foreground border-transparent transition-colors duration-150 hover:opacity-95" : "w-full rounded-lg border px-3 py-2 bg-gray-100 text-black hover:bg-gray-200 hover:border-gray-200 transition-colors duration-150"} onClick={() => setHasAttachments(true)}>Sim</button>
                            <button type="button" className={hasAttachments === false ? "w-full rounded-lg border px-3 py-2 bg-primary text-primary-foreground border-transparent transition-colors duration-150 hover:opacity-95" : "w-full rounded-lg border px-3 py-2 bg-gray-100 text-black hover:bg-gray-200 hover:border-gray-200 transition-colors duration-150"} onClick={() => setHasAttachments(false)}>Não</button>
                          </div>
                        </label>

                        {hasAttachments === true && (
                          <AttachmentsUploadBlock files={attachmentFiles} setFiles={setAttachmentFiles} attachmentsConfirm={attachmentsConfirm} setAttachmentsConfirm={setAttachmentsConfirm} />
                        )}
                        {hasAttachments === false && (
                          <NoAttachmentsReasonBlock value={noAttachmentsReason} onChange={setNoAttachmentsReason} />
                        )}
                      </>
                    )}
                  </>
                )}

                {registrationDone === true && (
                  <>
                    <label className="mb-3">
                      <div className="text-sm font-medium">A inscrição foi paga?</div>
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                        Ressaltamos que caso a inscrição tenha sido paga, os dados da nota fiscal devem estar em nome da <strong className="text-foreground">FUNAPE</strong>. Ainda, para solicitar o pagamento, é preciso que nos envie o boleto bancário em nome da FUNAPE.
                      </p>
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          type="button"
                          className={cn(
                            "rounded-lg border px-3 py-2.5 text-sm text-left transition-colors duration-150",
                            registrationPaid === "reembolso"
                              ? "bg-primary text-primary-foreground border-transparent hover:opacity-95"
                              : "bg-gray-100 text-black hover:bg-gray-200 hover:border-gray-200"
                          )}
                          onClick={() => setRegistrationPaid("reembolso")}
                        >
                          Sim, gostaria de solicitar reembolso
                        </button>
                        <button
                          type="button"
                          className={cn(
                            "rounded-lg border px-3 py-2.5 text-sm text-left transition-colors duration-150",
                            registrationPaid === "pagamento"
                              ? "bg-primary text-primary-foreground border-transparent hover:opacity-95"
                              : "bg-gray-100 text-black hover:bg-gray-200 hover:border-gray-200"
                          )}
                          onClick={() => setRegistrationPaid("pagamento")}
                        >
                          Não, gostaria de solicitar o pagamento
                        </button>
                      </div>
                    </label>

                    {(registrationPaid === "reembolso" || registrationPaid === "pagamento") && (
                      <>
                        <label className="mb-3">
                          <div className="text-sm font-medium">O valor do(a) pagamento/reembolso/compra é maior que R$ 800,00?</div>
                          <div className="mt-2 grid grid-cols-2 gap-3">
                            <button type="button" className={over800 === true ? "w-full rounded-lg border px-3 py-2 bg-primary text-primary-foreground border-transparent transition-colors duration-150 hover:opacity-95" : "w-full rounded-lg border px-3 py-2 bg-gray-100 text-black hover:bg-gray-200 hover:border-gray-200 transition-colors duration-150"} onClick={() => setOver800(true)}>Sim</button>
                            <button type="button" className={over800 === false ? "w-full rounded-lg border px-3 py-2 bg-primary text-primary-foreground border-transparent transition-colors duration-150 hover:opacity-95" : "w-full rounded-lg border px-3 py-2 bg-gray-100 text-black hover:bg-gray-200 hover:border-gray-200 transition-colors duration-150"} onClick={() => setOver800(false)}>Não</button>
                          </div>
                          <div className="text-xs text-muted-foreground mt-2">Se o valor for superior a R$ 800,00, será necessário apresentar 3 orçamentos. Se a compra for menor que R$ 800,00 o pedido será enviado à equipe administrativa do CEIA.</div>
                        </label>

                        <label className="mb-3">
                          <div className="text-sm font-medium">Qual será o valor?</div>
                          <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Insira o valor aqui" className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground" />
                        </label>

                        <label className="mb-3">
                          <div className="text-sm font-medium">Possui documentos para anexar?</div>
                          <div className="mt-2 grid grid-cols-2 gap-3">
                            <button type="button" className={hasAttachments === true ? "w-full rounded-lg border px-3 py-2 bg-primary text-primary-foreground border-transparent transition-colors duration-150 hover:opacity-95" : "w-full rounded-lg border px-3 py-2 bg-gray-100 text-black hover:bg-gray-200 hover:border-gray-200 transition-colors duration-150"} onClick={() => setHasAttachments(true)}>Sim</button>
                            <button type="button" className={hasAttachments === false ? "w-full rounded-lg border px-3 py-2 bg-primary text-primary-foreground border-transparent transition-colors duration-150 hover:opacity-95" : "w-full rounded-lg border px-3 py-2 bg-gray-100 text-black hover:bg-gray-200 hover:border-gray-200 transition-colors duration-150"} onClick={() => setHasAttachments(false)}>Não</button>
                          </div>
                        </label>

                        {hasAttachments === true && (
                          <AttachmentsUploadBlock files={attachmentFiles} setFiles={setAttachmentFiles} attachmentsConfirm={attachmentsConfirm} setAttachmentsConfirm={setAttachmentsConfirm} />
                        )}
                        {hasAttachments === false && (
                          <NoAttachmentsReasonBlock value={noAttachmentsReason} onChange={setNoAttachmentsReason} />
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
            </section>
          )}

          {/* Campos para Ressarcimento de despesa */}
          {requestType === "ressarcimento_despesa" && (
            <section className="rounded-xl border bg-card p-6 pb-4">
              <div className="flex items-center gap-3 text-sm font-semibold mb-2 pb-2 text-foreground leading-tight"><DollarSign className="size-4 text-primary" /> <span>{REQUEST_TYPE_META['ressarcimento_despesa'].label}</span></div>
              <div className="grid gap-3">
                <label className="mb-3">
                  <div className="text-sm font-medium">CPF do solicitante</div>
                  <input value={cpfSolicitante} onChange={(e) => setCpfSolicitante(e.target.value)} placeholder="Inserir um número" className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground" />
                </label>

                <label className="mb-3">
                  <div className="text-sm font-medium">RG</div>
                  <input value={rgSolicitante} onChange={(e) => setRgSolicitante(e.target.value)} placeholder="Inserir um número" className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground" />
                </label>

                <div className="mb-3">
                  <div className="text-sm font-medium">Confirmação de pagamento</div>
                  <label className="mt-2 flex items-start gap-3 rounded-lg border bg-white p-3 cursor-pointer hover:bg-muted/30 transition-colors">
                    <input
                      type="checkbox"
                      checked={pixConsent}
                      onChange={(e) => setPixConsent(e.target.checked)}
                      className="mt-0.5 size-4 rounded border-input accent-primary shrink-0"
                    />
                    <span className="text-sm text-foreground leading-relaxed">Declaro estar ciente de que o pagamento será realizado exclusivamente via transferência PIX.</span>
                  </label>
                </div>

                <label className="mb-3">
                  <div className="text-sm font-medium">Endereço do solicitante</div>
                  <input value={enderecoSolicitante} onChange={(e) => setEnderecoSolicitante(e.target.value)} placeholder="Insira o valor aqui" className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground" />
                </label>

                <div className="mb-3">
                  <div className="text-sm font-medium">Cargo no projeto</div>
                  <div className="mt-2 w-full rounded-lg border px-3 py-2 bg-muted/40 text-foreground flex items-center justify-between gap-2">
                    <span className={cargoProjeto ? "" : "text-muted-foreground"}>
                      {cargoProjeto || "Selecione um projeto para preencher automaticamente"}
                    </span>
                    {cargoProjeto && (
                      <span className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground font-semibold">Auto</span>
                    )}
                  </div>
                </div>

                <label className="mb-3">
                  <div className="text-sm font-medium">Liste a(s) compra(s) que solicita reembolso</div>
                  <textarea value={purchasesList} onChange={(e) => setPurchasesList(e.target.value)} placeholder="Insira o valor aqui" className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground" rows={4} />
                </label>

                <label className="mb-3">
                  <div className="text-sm font-medium">Justificativa das despesas</div>
                  <textarea value={justification} onChange={(e) => setJustification(e.target.value)} placeholder="Insira o valor aqui" className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground" rows={4} />
                </label>

                <label className="mb-3">
                  <div className="text-sm font-medium">O valor do(a) pagamento/reembolso/compra é maior que R$800,00?</div>
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    <button type="button" className={over800 === true ? "w-full rounded-lg border px-3 py-2 bg-primary text-primary-foreground border-transparent transition-colors duration-150 hover:opacity-95" : "w-full rounded-lg border px-3 py-2 bg-gray-100 text-black hover:bg-gray-200 hover:border-gray-200 transition-colors duration-150"} onClick={() => setOver800(true)}>Sim</button>
                    <button type="button" className={over800 === false ? "w-full rounded-lg border px-3 py-2 bg-primary text-primary-foreground border-transparent transition-colors duration-150 hover:opacity-95" : "w-full rounded-lg border px-3 py-2 bg-gray-100 text-black hover:bg-gray-200 hover:border-gray-200 transition-colors duration-150"} onClick={() => setOver800(false)}>Não</button>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">Se o valor for superior a R$ 800,00, será necessário apresentar 3 orçamentos. Se a compra for menor que R$ 800,00 o pedido será enviado à equipe administrativa do CEIA.</div>
                </label>

                <label className="mb-3">
                  <div className="text-sm font-medium">Qual será o valor?</div>
                  <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Insira o valor aqui" className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground" />
                </label>

                <label className="mb-3">
                  <div className="text-sm font-medium">Possui documentos para anexar?</div>
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    <button type="button" className={hasAttachments === true ? "w-full rounded-lg border px-3 py-2 bg-primary text-primary-foreground border-transparent transition-colors duration-150 hover:opacity-95" : "w-full rounded-lg border px-3 py-2 bg-gray-100 text-black hover:bg-gray-200 hover:border-gray-200 transition-colors duration-150"} onClick={() => setHasAttachments(true)}>Sim</button>
                    <button type="button" className={hasAttachments === false ? "w-full rounded-lg border px-3 py-2 bg-primary text-primary-foreground border-transparent transition-colors duration-150 hover:opacity-95" : "w-full rounded-lg border px-3 py-2 bg-gray-100 text-black hover:bg-gray-200 hover:border-gray-200 transition-colors duration-150"} onClick={() => setHasAttachments(false)}>Não</button>
                  </div>
                </label>

                {hasAttachments === true && (
                  <AttachmentsUploadBlock files={attachmentFiles} setFiles={setAttachmentFiles} attachmentsConfirm={attachmentsConfirm} setAttachmentsConfirm={setAttachmentsConfirm} />
                )}
                {hasAttachments === false && (
                  <NoAttachmentsReasonBlock value={noAttachmentsReason} onChange={setNoAttachmentsReason} />
                )}
              </div>
            </section>
          )}

          {/* Campos para Pagamento de material/serviço */}
          {requestType === "pagamento_material_servico" && (
            <section className="rounded-xl border bg-card p-6 pb-4">
              <div className="flex items-center gap-3 text-sm font-semibold mb-2 pb-2 text-foreground leading-tight"><CreditCard className="size-4 text-primary" /> <span>{REQUEST_TYPE_META['pagamento_material_servico'].label}</span></div>
              <div className="grid gap-3">
                <label className="mb-3">
                  <div className="text-sm font-medium">Nome da empresa</div>
                  <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Insira o valor aqui" className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground" />
                </label>

                <label className="mb-3">
                  <div className="text-sm font-medium">CNPJ</div>
                  <input value={companyCNPJ} onChange={(e) => setCompanyCNPJ(e.target.value)} placeholder="Inserir um número" className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground" />
                </label>

                <label className="mb-3">
                  <div className="text-sm font-medium">Dados bancários da empresa</div>
                  <input value={bankDetails} onChange={(e) => setBankDetails(e.target.value)} placeholder="Insira o valor aqui" className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground" />
                </label>

                <label className="mb-3">
                  <div className="text-sm font-medium">Endereço da empresa</div>
                  <input value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} placeholder="Insira o valor aqui" className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground" />
                </label>

                <label className="mb-3">
                  <div className="text-sm font-medium">Telefone da empresa</div>
                  <input value={companyPhone} onChange={(e) => setCompanyPhone(e.target.value)} placeholder="Inserir um número" className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground" />
                </label>

                <label className="mb-3">
                  <div className="text-sm font-medium">Descrição do material ou serviço contratado. Caso haja alguma observação importante, inclua também.</div>
                  <textarea value={serviceDescription} onChange={(e) => setServiceDescription(e.target.value)} placeholder="Insira o valor aqui" className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground" rows={4} />
                  <div className="text-xs text-muted-foreground mt-2">Liste um item abaixo do outro, como se fosse uma tabela. Na descrição, inclua o tipo de item, marca, configuração e outras informações importantes.</div>
                </label>

                <label className="mb-3">
                  <div className="text-sm font-medium">O valor do(a) pagamento/reembolso/compra é maior que R$800,00?</div>
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    <button type="button" className={over800 === true ? "w-full rounded-lg border px-3 py-2 bg-primary text-primary-foreground border-transparent transition-colors duration-150 hover:opacity-95" : "w-full rounded-lg border px-3 py-2 bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary/20 transition-colors duration-150"} onClick={() => setOver800(true)}>Sim</button>
                    <button type="button" className={over800 === false ? "w-full rounded-lg border px-3 py-2 bg-primary text-primary-foreground border-transparent transition-colors duration-150 hover:opacity-95" : "w-full rounded-lg border px-3 py-2 bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary/20 transition-colors duration-150"} onClick={() => setOver800(false)}>Não</button>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">Se o valor for superior a R$ 800,00, será necessário apresentar 3 orçamentos. Se a compra for menor que R$ 800,00 o pedido será enviado à equipe administrativa do CEIA.</div>
                </label>

                <label className="mb-3">
                  <div className="text-sm font-medium">Qual será o valor?</div>
                  <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Insira o valor aqui" className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground" />
                </label>

                <label className="mb-3">
                  <div className="text-sm font-medium">Possui documentos para anexar?</div>
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    <button type="button" className={hasAttachments === true ? "w-full rounded-lg border px-3 py-2 bg-primary text-primary-foreground border-transparent transition-colors duration-150 hover:opacity-95" : "w-full rounded-lg border px-3 py-2 bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary/20 transition-colors duration-150"} onClick={() => setHasAttachments(true)}>Sim</button>
                    <button type="button" className={hasAttachments === false ? "w-full rounded-lg border px-3 py-2 bg-primary text-primary-foreground border-transparent transition-colors duration-150 hover:opacity-95" : "w-full rounded-lg border px-3 py-2 bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary/20 transition-colors duration-150"} onClick={() => setHasAttachments(false)}>Não</button>
                  </div>
                </label>

                {hasAttachments === true && (
                  <AttachmentsUploadBlock files={attachmentFiles} setFiles={setAttachmentFiles} attachmentsConfirm={attachmentsConfirm} setAttachmentsConfirm={setAttachmentsConfirm} />
                )}
                {hasAttachments === false && (
                  <NoAttachmentsReasonBlock value={noAttachmentsReason} onChange={setNoAttachmentsReason} />
                )}
              </div>
            </section>
          )}

          {/* Campos para Outros */}
          {requestType === "outros" && (
            <section className="rounded-xl border bg-card p-6 pb-4">
              <div className="flex items-center gap-3 text-sm font-semibold mb-2 pb-2 text-foreground leading-tight"><Info className="size-4 text-primary" /> <span>{REQUEST_TYPE_META['outros'].label}</span></div>
              <div className="grid gap-3">
                <label className="mb-3">
                  <div className="text-sm font-medium">Descrição detalhada da solicitação</div>
                  <textarea value={otherDescription} onChange={(e) => setOtherDescription(e.target.value)} placeholder="Insira o valor aqui" className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground" rows={4} />
                </label>

                <label className="mb-3">
                  <div className="text-sm font-medium">O valor do(a) pagamento/reembolso/compra é maior que R$800,00?</div>
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    <button type="button" className={over800 === true ? "w-full rounded-lg border px-3 py-2 bg-primary text-primary-foreground border-transparent transition-colors duration-150 hover:opacity-95" : "w-full rounded-lg border px-3 py-2 bg-white text-foreground hover:bg-primary/5 hover:border-primary/20 transition-colors duration-150"} onClick={() => setOver800(true)}>Sim</button>
                    <button type="button" className={over800 === false ? "w-full rounded-lg border px-3 py-2 bg-primary text-primary-foreground border-transparent transition-colors duration-150 hover:opacity-95" : "w-full rounded-lg border px-3 py-2 bg-white text-foreground hover:bg-primary/5 hover:border-primary/20 transition-colors duration-150"} onClick={() => setOver800(false)}>Não</button>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">Se o valor for superior a R$ 800,00, será necessário apresentar 3 orçamentos. Se a compra for menor que R$ 800,00 o pedido será enviado à equipe administrativa do CEIA.</div>
                </label>

                <label className="mb-3">
                  <div className="text-sm font-medium">Qual será o valor?</div>
                  <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Insira o valor aqui" className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground" />
                </label>

                <label className="mb-3">
                  <div className="text-sm font-medium">Possui documentos para anexar?</div>
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    <button type="button" className={hasAttachments === true ? "w-full rounded-lg border px-3 py-2 bg-primary text-primary-foreground border-transparent transition-colors duration-150 hover:opacity-95" : "w-full rounded-lg border px-3 py-2 bg-white text-foreground hover:bg-primary/5 hover:border-primary/20 transition-colors duration-150"} onClick={() => setHasAttachments(true)}>Sim</button>
                    <button type="button" className={hasAttachments === false ? "w-full rounded-lg border px-3 py-2 bg-primary text-primary-foreground border-transparent transition-colors duration-150 hover:opacity-95" : "w-full rounded-lg border px-3 py-2 bg-white text-foreground hover:bg-primary/5 hover:border-primary/20 transition-colors duration-150"} onClick={() => setHasAttachments(false)}>Não</button>
                  </div>
                </label>

                {hasAttachments === true && (
                  <AttachmentsUploadBlock files={attachmentFiles} setFiles={setAttachmentFiles} attachmentsConfirm={attachmentsConfirm} setAttachmentsConfirm={setAttachmentsConfirm} />
                )}
                {hasAttachments === false && (
                  <NoAttachmentsReasonBlock value={noAttachmentsReason} onChange={setNoAttachmentsReason} />
                )}
              </div>
            </section>
          )}

          {/* Detalhamento específico para Compra de material/serviço */}
          {requestType === "compra_material_servico" && (
            <section className="rounded-xl border bg-card p-6">
              <div className="flex items-center gap-3 text-sm font-semibold mb-2 pb-2 text-foreground leading-tight"><ShoppingCart className="size-4 text-primary" /> <span>{REQUEST_TYPE_META['compra_material_servico'].label}</span></div>
              <div className="grid gap-3">
                <label className="mb-3">
                  <div className="text-sm font-medium">Descreva o(s) item(ns), a(s) quantidade(s). Caso haja alguma observação importante, inclua também.</div>
                  <textarea value={itemDescription} onChange={(e) => setItemDescription(e.target.value)} placeholder="Insira o valor aqui" className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground" rows={4} />
                </label>

                <label className="mb-3">
                  <div className="text-sm font-medium">Descreva também: local onde o produto ou serviço será utilizado; aderência da compra aos objetivos do projeto financiador da compra, importância de adquirir o produto ou serviço, e deixar explícito que a finalidade da compra é a utilização do bem ou serviço em atividades de pesquisa.</div>
                  <textarea value={usageDescription} onChange={(e) => setUsageDescription(e.target.value)} placeholder="Insira o valor aqui" className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground" rows={4} />
                </label>

                <label className="mb-3">
                  <div className="text-sm font-medium">Local de entrega</div>
                  <input value={deliveryLocation} onChange={(e) => setDeliveryLocation(e.target.value)} placeholder="Insira o valor aqui" className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground" />
                </label>

                <label className="mb-3">
                  <div className="text-sm font-medium">Data em que necessita do(s) material(is) ou serviço(s)</div>
                  <div className="relative mt-2">
                    <Calendar className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input value={neededDate} onChange={(e) => setNeededDate(formatDateDDMMYYYY(e.target.value))} placeholder="DD/MM/AAAA" inputMode="numeric" maxLength={10} className="w-full rounded-lg border pl-10 pr-3 py-2 bg-white text-foreground" />
                  </div>
                </label>

                <label className="mb-3">
                  <div className="text-sm font-medium">O valor do(a) pagamento/reembolso/compra é maior que R$800,00?</div>
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    <button type="button" className={over800 === true ? "w-full rounded-lg border px-3 py-2 bg-primary text-primary-foreground" : "w-full rounded-lg border px-3 py-2 bg-white text-foreground"} onClick={() => setOver800(true)}>Sim</button>
                    <button type="button" className={over800 === false ? "w-full rounded-lg border px-3 py-2 bg-primary text-primary-foreground" : "w-full rounded-lg border px-3 py-2 bg-white text-foreground"} onClick={() => setOver800(false)}>Não</button>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">Se o valor for superior a R$ 800,00, será necessário apresentar 3 orçamentos. Se a compra for menor que R$ 800,00 o pedido será enviado à equipe administrativa do CEIA.</div>
                </label>

                <label className="mb-3">
                  <div className="text-sm font-medium">Qual será o valor?</div>
                  <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Insira o valor aqui" className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground" />
                </label>

                <label className="mb-3">
                  <div className="text-sm font-medium">Possui documentos para anexar?</div>
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    <button type="button" className={hasAttachments === true ? "w-full rounded-lg border px-3 py-2 bg-primary text-primary-foreground" : "w-full rounded-lg border px-3 py-2 bg-white text-foreground"} onClick={() => setHasAttachments(true)}>Sim</button>
                    <button type="button" className={hasAttachments === false ? "w-full rounded-lg border px-3 py-2 bg-primary text-primary-foreground" : "w-full rounded-lg border px-3 py-2 bg-white text-foreground"} onClick={() => setHasAttachments(false)}>Não</button>
                  </div>
                </label>

                {hasAttachments === true && (
                  <AttachmentsUploadBlock files={attachmentFiles} setFiles={setAttachmentFiles} attachmentsConfirm={attachmentsConfirm} setAttachmentsConfirm={setAttachmentsConfirm} />
                )}
                {hasAttachments === false && (
                  <NoAttachmentsReasonBlock value={noAttachmentsReason} onChange={setNoAttachmentsReason} />
                )}
              </div>
            </section>
          )}

          {/* Ações */}
          <div className="mt-2 pt-4 border-t flex flex-col sm:flex-row gap-2">
            <button
              onClick={onClose}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold hover:bg-accent transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleResend}
              disabled={!canSubmit}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Send className="size-4" /> Reenviar solicitação
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function NewTabDot() {
  return (
    <span aria-label="Novidades" title="Novidades" className="relative ml-1.5 inline-flex size-2 text-sky-500 align-middle">
      <span className="absolute inline-flex h-full w-full rounded-full bg-current opacity-75 animate-ping" />
      <span className="relative inline-flex size-2 rounded-full bg-current" />
    </span>
  );
}

function TabButton({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={cn("flex-1 relative flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium -mb-px")}>
      <div className={cn("flex items-center gap-2", active ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
        {icon}
        <span className="whitespace-nowrap">{children}</span>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-[2px] overflow-hidden">
        <span style={{ display: "block", height: "100%", backgroundColor: "var(--primary)", transform: active ? "scaleX(1)" : "scaleX(0)", transformOrigin: "center", transition: "transform 360ms cubic-bezier(.2,.9,.2,1)", }} />
      </div>
    </button>
  );
}

function NoAttachmentsReasonBlock({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="mb-3 space-y-2">
      <div>
        <div className="text-sm font-medium text-foreground">Justifique o fato de não haver um documento</div>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Insira o valor aqui"
        rows={4}
        className="w-full rounded-lg border px-3 py-2 bg-white text-foreground"
      />
      <p className="text-xs text-muted-foreground leading-relaxed">
        Seja ele relacionado à contratação ou pagamento do material, serviço ou inscrição.
      </p>
    </div>
  );
}

function AttachmentsUploadBlock({
  files,
  setFiles,
  attachmentsConfirm,
  setAttachmentsConfirm,
}: {
  files: File[];
  setFiles: (f: File[]) => void;
  attachmentsConfirm: boolean;
  setAttachmentsConfirm: (b: boolean) => void;
}) {
  const [dragOver, setDragOver] = useState(false);

  function addFiles(list: FileList | null) {
    if (!list) return;
    const incoming = Array.from(list);
    setFiles([...files, ...incoming]);
  }

  function removeFile(idx: number) {
    setFiles(files.filter((_, i) => i !== idx));
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div className="mb-3 space-y-3">
      <div>
        <div className="text-sm font-medium text-foreground">Anexe os documentos necessários</div>
        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
          Nota fiscal, invoice, fatura, recibo, cupons fiscais, extrato bancário, etc. Anexe <strong className="text-foreground">TODOS</strong> os arquivos necessários! No caso de compra, lembre-se de anexar <strong className="text-foreground">3 orçamentos</strong>.
        </p>
      </div>

      <label
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center cursor-pointer transition-all duration-200",
          dragOver ? "border-primary bg-primary/5" : "border-border bg-muted/30 hover:border-primary/40 hover:bg-primary/5"
        )}
      >
        <div className="size-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          <Upload className="size-5" />
        </div>
        <div className="text-sm font-semibold text-foreground">Clique para selecionar ou arraste os arquivos aqui</div>
        <div className="text-xs text-muted-foreground">PDF, JPG, PNG, DOCX — múltiplos arquivos permitidos</div>
        <input
          type="file"
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </label>

      {files.length > 0 && (
        <ul className="space-y-1.5">
          {files.map((f, idx) => (
            <li key={idx} className="flex items-center gap-3 rounded-lg border bg-card px-3 py-2 text-sm">
              <div className="size-8 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Paperclip className="size-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{f.name}</div>
                <div className="text-xs text-muted-foreground">{formatSize(f.size)}</div>
              </div>
              <button
                type="button"
                onClick={() => removeFile(idx)}
                className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                title="Remover"
              >
                <X className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SegmentedButton({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors w-full",
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground hover:bg-card"
      )}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}

// =============================================================
// Pedidos de Recurso — Compras & Pagamentos
// =============================================================

type ComprasApprovalStatus = "pendente" | "aprovado" | "rejeitado" | "em_correcao";
type ComprasApprovalKind = "compra_material_servico" | "pagamento_material_servico" | "inscricao_publicacao" | "ressarcimento_despesa" | "outros";

type ComprasFieldEntry = { label: string; value: string; multiline?: boolean };

export type ComprasApprovalItem = {
  id: string;
  solicitante: string;
  email: string;
  projetoSolicitado: string;
  tipo: ComprasApprovalKind;
  dataSolicitacao: string;
  status: ComprasApprovalStatus;
  valor: string;
  descricao: string;
  campos: ComprasFieldEntry[];
  over800: boolean;
  anexos: string[];
  // Comentário do corretor ao solicitar correção (volta para o solicitante ajustar).
  corretorComment?: string;
};

const COMPRAS_TIPO_META: Record<ComprasApprovalKind, { label: string; icon: React.ComponentType<{ className?: string }>; classes: string }> = {
  compra_material_servico: { label: "Compra Material/Serviço", icon: ShoppingCart, classes: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200" },
  pagamento_material_servico: { label: "Pagamento Material/Serviço", icon: CreditCard, classes: "bg-violet-50 text-violet-700 border-violet-200" },
  inscricao_publicacao: { label: "Inscrição/Publicação", icon: BookOpen, classes: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  ressarcimento_despesa: { label: "Ressarcimento", icon: DollarSign, classes: "bg-teal-50 text-teal-700 border-teal-200" },
  outros: { label: "Outros", icon: FileText, classes: "bg-slate-50 text-slate-700 border-slate-200" },
};

export const COMPRAS_APPROVALS_MOCK: ComprasApprovalItem[] = [
  {
    id: "CP-2026-0231",
    solicitante: "Pedro Henrique Lima",
    email: "pedro.lima@ceia.ufg.br",
    projetoSolicitado: "Sistema de Navegação Autônoma para VANTs",
    tipo: "compra_material_servico",
    dataSolicitacao: "03/05/2026",
    status: "pendente",
    valor: "R$ 4.580,00",
    descricao: "Compra de 2 GPUs NVIDIA RTX 4090 para acelerar treinamento dos modelos de visão computacional.",
    over800: true,
    anexos: ["orcamento-tecnoloja.pdf", "orcamento-kabum.pdf", "orcamento-pichau.pdf"],
    campos: [
      { label: "Descrição do material/serviço", value: "2x GPU NVIDIA GeForce RTX 4090 24GB GDDR6X. Marca de preferência: ASUS ROG Strix ou MSI Gaming X Trio.", multiline: true },
      { label: "Local de entrega", value: "CEIA/UFG — Sala 207, Bloco IMTec" },
      { label: "Data limite necessária", value: "30/05/2026" },
    ],
  },
  {
    id: "CP-2026-0228",
    solicitante: "Larissa Fernandes",
    email: "larissa.fernandes@ceia.ufg.br",
    projetoSolicitado: "IA para Detecção de Plágio Acadêmico",
    tipo: "inscricao_publicacao",
    dataSolicitacao: "02/05/2026",
    status: "pendente",
    valor: "R$ 1.200,00",
    descricao: "Inscrição no congresso BRACIS 2026 para apresentação de artigo aceito.",
    over800: true,
    anexos: ["carta-aceite-bracis.pdf", "boleto-funape.pdf"],
    campos: [
      { label: "CPF", value: "123.456.789-00" },
      { label: "E-mail de contato do evento", value: "contato@bracis2026.org" },
      { label: "Nome do evento", value: "BRACIS 2026 — Brazilian Conference on Intelligent Systems" },
      { label: "Atividade que será realizada", value: "Apresentação oral de artigo aceito sobre detecção de plágio com modelos transformer.", multiline: true },
      { label: "Local", value: "Recife/PE — Centro de Convenções" },
      { label: "Data limite para inscrição", value: "15/05/2026" },
      { label: "A inscrição já foi feita?", value: "Sim — Pagamento solicitado (boleto em nome da FUNAPE)" },
    ],
  },
  {
    id: "CP-2026-0225",
    solicitante: "Gabriel Souza",
    email: "gabriel.souza@externo.com",
    projetoSolicitado: "Plataforma Wave Testing",
    tipo: "pagamento_material_servico",
    dataSolicitacao: "30/04/2026",
    status: "pendente",
    valor: "R$ 2.800,00",
    descricao: "Pagamento de serviço de auditoria especializada em testes de penetração em hardware.",
    over800: true,
    anexos: ["contrato-secauditbr.pdf", "orçamento-1.pdf", "orçamento-2.pdf", "orçamento-3.pdf"],
    campos: [
      { label: "Nome da empresa", value: "SecAuditBR Serviços de Segurança Ltda." },
      { label: "CNPJ", value: "12.345.678/0001-90" },
      { label: "Dados bancários", value: "Banco do Brasil — Ag. 1234-5 / CC 67890-1" },
      { label: "Endereço da empresa", value: "Rua das Aclírias, 250 — Sala 12, Goiânia/GO" },
      { label: "Telefone", value: "(62) 3025-7788" },
      { label: "Descrição do material/serviço contratado", value: "Auditoria de segurança em hardware embarcado, incluindo testes de penetração, análise de firmware e relatório executivo.", multiline: true },
    ],
  },
  {
    id: "CP-2026-0210",
    solicitante: "Camila Rocha",
    email: "camila.rocha@ceia.ufg.br",
    projetoSolicitado: "Portal CEIA — Gestão de Projetos",
    tipo: "ressarcimento_despesa",
    dataSolicitacao: "20/04/2026",
    status: "aprovado",
    valor: "R$ 380,00",
    descricao: "Ressarcimento de licenças de software para desenvolvimento.",
    over800: false,
    anexos: ["nota-fiscal-jetbrains.pdf", "comprovante-pagamento.pdf"],
    campos: [
      { label: "CPF do solicitante", value: "987.654.321-00" },
      { label: "RG", value: "5.123.456 SSP/GO" },
      { label: "Confirmação de pagamento", value: "Ciente de que o pagamento será realizado exclusivamente via transferência PIX" },
      { label: "Endereço do solicitante", value: "Rua T-30, nº 1500, Apto 1402 — Setor Bueno, Goiânia/GO" },
      { label: "Cargo no projeto", value: "Coordenador" },
      { label: "Compra(s) que solicita reembolso", value: "1x JetBrains All Products Pack — 1 ano (R$ 380,00)", multiline: true },
      { label: "Justificativa das despesas", value: "Licença necessária para acelerar o desenvolvimento do portal. Foi adquirida com cartão pessoal por urgência.", multiline: true },
    ],
  },
  {
    id: "CP-2026-0205",
    solicitante: "Bruno Carvalho",
    email: "bruno.carvalho@ceia.ufg.br",
    projetoSolicitado: "Análise de Imagens Médicas com Deep Learning",
    tipo: "outros",
    dataSolicitacao: "15/04/2026",
    status: "rejeitado",
    valor: "R$ 750,00",
    descricao: "Solicitação avulsa não classificada.",
    over800: false,
    anexos: [],
    campos: [
      { label: "Descrição detalhada da solicitação", value: "Necessidade de contratação de serviço pontual de tradução juramentada de documentação médica para anonimização de dataset.", multiline: true },
    ],
  },
];

function ComprasTipoBadge({ tipo }: { tipo: ComprasApprovalKind }) {
  const meta = COMPRAS_TIPO_META[tipo];
  const Icon = meta.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold", meta.classes)}>
      <Icon className="size-3.5" /> {meta.label}
    </span>
  );
}

function ComprasStatusBadge({ status }: { status: ComprasApprovalStatus }) {
  if (status === "pendente") {
    return <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 text-xs font-semibold"><AlertCircle className="size-3.5" /> Pendente</span>;
  }
  if (status === "aprovado") {
    return <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 text-xs font-semibold"><CheckCircle2 className="size-3.5" /> Aprovado</span>;
  }
  if (status === "em_correcao") {
    return <span className="inline-flex items-center gap-1.5 rounded-md bg-sky-50 text-sky-800 border border-sky-200 px-2.5 py-1 text-xs font-semibold"><AlertCircle className="size-3.5" /> Em correção</span>;
  }
  return <span className="inline-flex items-center gap-1.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200 px-2.5 py-1 text-xs font-semibold"><XCircle className="size-3.5" /> Rejeitado</span>;
}

function ComprasFilterChip({ active, onClick, children, count, tone }: { active: boolean; onClick: () => void; children: React.ReactNode; count?: number; tone?: "amber" | "emerald" | "rose" | "sky" }) {
  const toneActive = {
    amber: "bg-amber-50 text-amber-800 border-amber-200",
    emerald: "bg-emerald-50 text-emerald-800 border-emerald-200",
    rose: "bg-rose-50 text-rose-800 border-rose-200",
    sky: "bg-sky-50 text-sky-800 border-sky-200",
  } as const;
  const toneInactive = {
    amber: "border-border text-foreground hover:bg-accent",
    emerald: "border-border text-foreground hover:bg-accent",
    rose: "border-border text-foreground hover:bg-accent",
    sky: "border-border text-foreground hover:bg-accent",
  } as const;
  const toneCountInactive = {
    amber: "bg-muted text-foreground",
    emerald: "bg-muted text-foreground",
    rose: "bg-muted text-foreground",
    sky: "bg-muted text-foreground",
  } as const;

  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium border transition-colors",
        active
          ? tone ? toneActive[tone] : "bg-primary text-primary-foreground border-transparent"
          : cn("bg-card", tone ? toneInactive[tone] : "hover:bg-accent")
      )}
    >
      <span>{children}</span>
      {typeof count === "number" && (
        <span className={cn(
          "inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full text-[11px] font-bold",
          active
            ? tone === "amber" ? "bg-amber-200 text-amber-900"
              : tone === "emerald" ? "bg-emerald-200 text-emerald-900"
              : tone === "rose" ? "bg-rose-200 text-rose-900"
              : tone === "sky" ? "bg-sky-200 text-sky-900"
              : "bg-primary/20 text-primary"
            : tone ? toneCountInactive[tone] : "bg-muted text-foreground"
        )}>
          {count}
        </span>
      )}
    </button>
  );
}

function ComprasDetailRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="size-9 rounded-lg bg-muted text-muted-foreground flex items-center justify-center shrink-0">{icon}</div>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground font-semibold">{label}</div>
        <div className="mt-0.5 text-sm font-medium text-foreground min-w-0 flex">{children}</div>
      </div>
    </div>
  );
}

// Tile do "Resumo" (mesmo design do PDInfoTile de Passagens e Diárias)
function CPTile({ icon, label, value, full }: { icon?: React.ReactNode; label: string; value: React.ReactNode; full?: boolean }) {
  return (
    <div className={cn("rounded-lg border bg-card px-3 py-2.5 min-w-0", full && "sm:col-span-3")}>
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.08em] text-muted-foreground font-semibold">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-1 text-sm font-medium text-foreground break-words">
        {value === undefined || value === null || value === "" ? <span className="text-muted-foreground">—</span> : value}
      </div>
    </div>
  );
}

// Seção colorida (mesmo design do PDSection de Passagens e Diárias)
function CPSection({
  title,
  icon,
  tone = "sky",
  children,
}: {
  title: string;
  icon: React.ReactNode;
  tone?: "sky" | "emerald" | "violet" | "amber" | "indigo" | "teal" | "rose" | "gray";
  children: React.ReactNode;
}) {
  const tones: Record<string, { bg: string; fg: string }> = {
    sky: { bg: "bg-sky-50", fg: "text-sky-700" },
    emerald: { bg: "bg-emerald-50", fg: "text-emerald-700" },
    violet: { bg: "bg-violet-50", fg: "text-violet-700" },
    amber: { bg: "bg-amber-50", fg: "text-amber-800" },
    indigo: { bg: "bg-indigo-50", fg: "text-indigo-700" },
    teal: { bg: "bg-teal-50", fg: "text-teal-700" },
    rose: { bg: "bg-rose-50", fg: "text-rose-700" },
    gray: { bg: "bg-gray-100", fg: "text-gray-700" },
  };
  const t = tones[tone];
  return (
    <section className="rounded-xl border bg-white shadow-sm overflow-hidden">
      <header className={cn("flex items-center gap-2 px-4 py-3 border-b", t.bg, t.fg)}>
        <div className="size-7 rounded-md bg-white/70 inline-flex items-center justify-center">{icon}</div>
        <h3 className="text-sm font-semibold">{title}</h3>
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}

function CPFileTile({ label, name }: { label: string; name: string }) {
  return (
    <div className="rounded-lg border bg-card px-3 py-2.5 min-w-0">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.08em] text-muted-foreground font-semibold">
        <span>{label}</span>
      </div>
      <div className="mt-1.5 flex items-center gap-2.5">
        <div className="size-9 rounded-md bg-primary/10 text-primary inline-flex items-center justify-center shrink-0">
          <FileText className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="text-sm font-medium text-sky-600 underline underline-offset-2 truncate hover:text-sky-700 block cursor-pointer"
            title={name}
          >
            {name}
          </a>
        </div>
      </div>
    </div>
  );
}

const COMPRAS_TIPO_LABELS: Record<ComprasApprovalKind, { sectionTitle: string; valorLabel: string }> = {
  compra_material_servico: { sectionTitle: "Compra de Material/Serviço", valorLabel: "Valor estimado" },
  pagamento_material_servico: { sectionTitle: "Pagamento de Material/Serviço", valorLabel: "Valor a pagar" },
  inscricao_publicacao: { sectionTitle: "Inscrição/Publicação", valorLabel: "Valor da inscrição/taxa" },
  ressarcimento_despesa: { sectionTitle: "Ressarcimento de Despesa", valorLabel: "Valor a ressarcir" },
  outros: { sectionTitle: "Solicitação", valorLabel: "Valor estimado" },
};

function ComprasApprovalCard({ item, onOpen }: { item: ComprasApprovalItem; onOpen: () => void }) {
  const isPending = item.status === "pendente";
  const initials = item.solicitante
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
  return (
    <div
      className={cn(
        "group rounded-xl border bg-card overflow-hidden border-l-4",
        "transition-all duration-300 ease-out",
        "hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/30",
        item.status === "pendente" && "border-l-amber-500 hover:border-l-amber-500",
        item.status === "aprovado" && "border-l-emerald-500 hover:border-l-emerald-500",
        item.status === "rejeitado" && "border-l-rose-500 hover:border-l-rose-500",
        item.status === "em_correcao" && "border-l-sky-500 hover:border-l-sky-500",
      )}
    >
      {/* Header com gradiente sutil */}
      <div className="relative px-5 pt-5 pb-3 bg-gradient-to-b from-muted/20 to-transparent">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <ComprasTipoBadge tipo={item.tipo} />
            <ComprasStatusBadge status={item.status} />
          </div>
        </div>
      </div>

      {/* Detalhes */}
      <div className="px-5 py-4 space-y-3">
        {/* Solicitante */}
        <div className="flex items-start gap-3">
          <div className="size-9 rounded-lg bg-muted text-muted-foreground flex items-center justify-center font-semibold text-[11px] shrink-0 transition-all duration-300">
            {initials || <User2 className="size-4" />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground font-semibold">Solicitante</div>
            <div className="mt-0.5 text-sm font-semibold text-foreground truncate">{item.solicitante}</div>
            <div className="text-xs text-muted-foreground truncate">{item.email}</div>
          </div>
        </div>

        <ComprasDetailRow icon={<FolderKanban className="size-4" />} label="Projeto vinculado">
          <span className="truncate">{item.projetoSolicitado || <span className="text-muted-foreground italic">Não informado</span>}</span>
        </ComprasDetailRow>

        <ComprasDetailRow icon={<Wallet className="size-4" />} label="Valor estimado">
          <span className="truncate tabular-nums">{item.valor}</span>
        </ComprasDetailRow>
      </div>

      {/* Footer: data + ação */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-t bg-muted/20">
        <div className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
          <Clock className="size-3.5" /> Solicitado em <span className="font-medium text-foreground">{item.dataSolicitacao}</span>
        </div>
        <button
          onClick={onOpen}
          className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold hover:bg-primary/90 shadow-sm transition-all duration-200 hover:shadow-md hover:gap-3 whitespace-nowrap"
        >
          {!isPending && <Eye className="size-4" />}
          {isPending ? "Analisar pedido" : "Ver detalhes"}
          <ChevronRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
}

function ComprasApprovalsPanel({ corretorMode = false }: { corretorMode?: boolean }) {
  const [items, setItems] = useState<ComprasApprovalItem[]>(COMPRAS_APPROVALS_MOCK);
  const [filter, setFilter] = useState<ComprasApprovalStatus>("pendente");
  const [detail, setDetail] = useState<ComprasApprovalItem | null>(null);
  const [correcaoOpen, setCorrecaoOpen] = useState(false);
  const [correcaoText, setCorrecaoText] = useState("");

  const pendentes = items.filter(i => i.status === "pendente").length;
  const aprovadas = items.filter(i => i.status === "aprovado").length;
  const rejeitadas = items.filter(i => i.status === "rejeitado").length;
  const emCorrecao = items.filter(i => i.status === "em_correcao").length;
  const filtered = items.filter(i => i.status === filter);

  function decidir(id: string, novo: ComprasApprovalStatus) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, status: novo } : i));
    setDetail(null);
  }

  function solicitarCorrecao(id: string, comment: string) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, status: "em_correcao", corretorComment: comment } : i));
    setDetail(null);
    setCorrecaoOpen(false);
    setCorrecaoText("");
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border bg-card p-4 flex items-start gap-3">
        <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
          {corretorMode ? <ShieldCheck className="size-4" /> : <Info className="size-4" />}
        </div>
        <div className="text-sm">
          <div className="font-semibold text-foreground">{corretorMode ? "Aprovações" : "Pedidos de Recurso"}</div>
          <p className="mt-1 text-muted-foreground leading-relaxed">
            {corretorMode
              ? <>As solicitações de compras e pagamentos passam por uma análise inicial aqui. Você pode <span className="font-semibold text-foreground">aprovar</span> (a solicitação segue adiante) ou <span className="font-semibold text-foreground">solicitar correção</span> (volta para o solicitante ajustar e reenviar).</>
              : "Aqui você visualiza as solicitações de compras e pagamentos feitas por colaboradores que desejam utilizar recursos dos projetos sob sua coordenação."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 [&>button]:w-full [&>button]:justify-center">
        <ComprasFilterChip active={filter === "pendente"} onClick={() => setFilter("pendente")} count={pendentes} tone="amber">Pendentes</ComprasFilterChip>
        {corretorMode ? (
          <ComprasFilterChip active={filter === "em_correcao"} onClick={() => setFilter("em_correcao")} count={emCorrecao} tone="sky">Em correção</ComprasFilterChip>
        ) : (
          <ComprasFilterChip active={filter === "rejeitado"} onClick={() => setFilter("rejeitado")} count={rejeitadas} tone="rose">Rejeitadas</ComprasFilterChip>
        )}
        <ComprasFilterChip active={filter === "aprovado"} onClick={() => setFilter("aprovado")} count={aprovadas} tone="emerald">Aprovadas</ComprasFilterChip>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
          Nenhuma solicitação nesta categoria.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((it) => (
            <ComprasApprovalCard key={it.id} item={it} onOpen={() => setDetail(it)} />
          ))}
        </div>
      )}

      {detail && (
        <Dialog open={true} onOpenChange={(o) => { if (!o) { setDetail(null); setCorrecaoOpen(false); setCorrecaoText(""); } }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
            <div className="sticky top-0 bg-background z-10 px-6 pt-6 pb-4 border-b flex items-start justify-between gap-4">
              <DialogHeader className="flex-1 min-w-0">
                <DialogTitle>{corretorMode && detail.status === "pendente" ? "Analisar pedido" : "Detalhes da Solicitação"}</DialogTitle>
                <DialogDescription>Recebida em {detail.dataSolicitacao}</DialogDescription>
              </DialogHeader>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setDetail(null)}
                  className="size-8 rounded-md inline-flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                  aria-label="Fechar"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            <div className="px-6 pb-6 pt-4 space-y-5">
              {detail.status === "em_correcao" && detail.corretorComment && (
                <section className="rounded-xl border border-orange-200 bg-orange-50/60 p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-sm font-semibold text-orange-800 mb-2">
                    <AlertCircle className="size-4" /> Correção solicitada
                  </div>
                  <p className="text-sm text-orange-900 leading-relaxed whitespace-pre-line">{detail.corretorComment}</p>
                </section>
              )}

              {/* Resumo */}
              {(() => {
                const labels = COMPRAS_TIPO_LABELS[detail.tipo];
                return (
                  <section className="rounded-xl border bg-white px-4 pt-3 pb-4 shadow-sm">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                      <Info className="size-4 text-primary" /> Resumo
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <CPTile full icon={<FolderKanban className="size-3.5" />} label="Projeto vinculado" value={detail.projetoSolicitado} />
                      <CPTile icon={<Wallet className="size-3.5" />} label={labels.valorLabel} value={detail.valor} />
                      <div className="rounded-lg border bg-card px-3 py-2.5 min-w-0">
                        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.08em] text-muted-foreground font-semibold">
                          <ShoppingCart className="size-3.5" />
                          <span>Tipo</span>
                        </div>
                        <div className="mt-1.5"><ComprasTipoBadge tipo={detail.tipo} /></div>
                      </div>
                      <div className="rounded-lg border bg-card px-3 py-2.5 min-w-0">
                        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.08em] text-muted-foreground font-semibold">
                          <CheckCircle2 className="size-3.5" />
                          <span>Status</span>
                        </div>
                        <div className="mt-1.5"><ComprasStatusBadge status={detail.status} /></div>
                      </div>
                      <CPTile icon={<Calendar className="size-3.5" />} label="Recebida em" value={detail.dataSolicitacao} />
                      <CPTile icon={<DollarSign className="size-3.5" />} label="Valor > R$ 800,00" value={detail.over800 ? "Sim (3 orçamentos)" : "Não"} />
                    </div>
                  </section>
                );
              })()}

              {/* Solicitante */}
              <CPSection title="Identificação do solicitante" icon={<User2 className="size-4" />} tone="sky">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <CPTile full icon={<User2 className="size-3.5" />} label="Nome" value={detail.solicitante} />
                  <CPTile full icon={<FolderKanban className="size-3.5" />} label="E-mail" value={detail.email} />
                </div>
              </CPSection>

              {/* Tipo-specific */}
              {(() => {
                const meta = COMPRAS_TIPO_META[detail.tipo];
                const labels = COMPRAS_TIPO_LABELS[detail.tipo];
                const Icon = meta.icon;
                const inlineFields = detail.campos.filter(c => !c.multiline);
                const blockFields = detail.campos.filter(c => c.multiline);
                return (
                  <CPSection title={labels.sectionTitle} icon={<Icon className="size-4" />} tone="indigo">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <CPTile icon={<Wallet className="size-3.5" />} label={labels.valorLabel} value={detail.valor} />
                      <CPTile icon={<DollarSign className="size-3.5" />} label="Valor > R$ 800,00" value={detail.over800 ? "Sim (3 orçamentos)" : "Não"} />
                      {inlineFields.map((c) => (
                        <CPTile key={c.label} label={c.label} value={c.value} />
                      ))}
                      {blockFields.map((c) => (
                        <CPTile key={c.label} full label={c.label} value={<span className="block whitespace-pre-wrap leading-relaxed">{c.value}</span>} />
                      ))}
                    </div>
                  </CPSection>
                );
              })()}

              {/* Anexos */}
              {detail.anexos.length > 0 && (
                <CPSection title="Anexos" icon={<Paperclip className="size-4" />} tone="gray">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {detail.anexos.map((nome) => (
                      <CPFileTile key={nome} label="Documento anexado" name={nome} />
                    ))}
                  </div>
                </CPSection>
              )}

              {detail.status === "pendente" ? (
                corretorMode ? (
                  correcaoOpen ? (
                    <div className="mt-4 pt-6 border-t space-y-3">
                      <div className="text-sm font-semibold text-foreground inline-flex items-center gap-2">
                        <AlertCircle className="size-4 text-orange-600" /> Solicitar correção ao solicitante
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Descreva claramente o que precisa ser ajustado. O solicitante verá esta mensagem no histórico e poderá reenviar a solicitação após a correção.
                      </p>
                      <textarea
                        value={correcaoText}
                        onChange={(e) => setCorrecaoText(e.target.value)}
                        placeholder="Ex.: Anexar os 3 orçamentos exigidos e corrigir o valor informado."
                        className="w-full min-h-[120px] rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => { setCorrecaoOpen(false); setCorrecaoText(""); }}
                          className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold hover:bg-accent transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => solicitarCorrecao(detail.id, correcaoText.trim())}
                          disabled={correcaoText.trim().length < 5}
                          className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 text-white px-4 py-2.5 text-sm font-semibold hover:bg-orange-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          <Send className="size-4" /> Enviar para correção
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 pt-6 border-t flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => { setCorrecaoOpen(true); setCorrecaoText(detail.corretorComment ?? ""); }}
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-orange-300 text-orange-700 px-4 py-2.5 text-sm font-semibold hover:bg-orange-50 transition-colors"
                      >
                        <AlertCircle className="size-4" /> Solicitar correção
                      </button>
                      <button
                        onClick={() => decidir(detail.id, "aprovado")}
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 text-white px-4 py-2.5 text-sm font-semibold hover:bg-emerald-700 transition-colors"
                      >
                        <CheckCircle2 className="size-4" /> Aprovar
                      </button>
                    </div>
                  )
                ) : (
                  <div className="mt-4 pt-6 border-t flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => decidir(detail.id, "rejeitado")}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-rose-300 text-rose-700 px-4 py-2.5 text-sm font-semibold hover:bg-rose-50 transition-colors"
                    >
                      <XCircle className="size-4" /> Rejeitar
                    </button>
                    <button
                      onClick={() => decidir(detail.id, "aprovado")}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 text-white px-4 py-2.5 text-sm font-semibold hover:bg-emerald-700 transition-colors"
                    >
                      <CheckCircle2 className="size-4" /> Aprovar
                    </button>
                  </div>
                )
              ) : (
                <div className="mt-4 pt-6 border-t">
                  <div className="rounded-lg bg-muted/40 border p-3 text-sm text-muted-foreground">
                    {detail.status === "aprovado"
                      ? "Esta solicitação já foi aprovada."
                      : detail.status === "em_correcao"
                      ? "Esta solicitação foi devolvida ao solicitante para correção."
                      : "Esta solicitação já foi rejeitada."}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// =============================================================
// Histórico geral — Equipe Administrativa (Compras & Pagamentos)
// =============================================================

const CP_SEEN_IDS_KEY = "ceia.compras.adminSeenIds";
const CP_LAST_VISIT_KEY = "ceia.compras.adminLastVisit";

function cpParseBR(d: string): number {
  const [dd, mm, yyyy] = d.split("/").map((x) => parseInt(x, 10));
  if (!dd || !mm || !yyyy) return 0;
  return new Date(yyyy, mm - 1, dd).getTime();
}

function cpTodayBR(): string {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

function cpReadLastVisit(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(CP_LAST_VISIT_KEY) || "";
}

function cpReadSeenIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(CP_SEEN_IDS_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function ComprasNewSinceLastVisitBadge() {
  const seen = cpReadSeenIds();
  const sortedAll = [...COMPRAS_APPROVALS_MOCK].sort((a, b) => cpParseBR(b.dataSolicitacao) - cpParseBR(a.dataSolicitacao));
  sortedAll.slice(3).forEach((it) => seen.add(it.id));
  const novos = COMPRAS_APPROVALS_MOCK.filter((a) => !seen.has(a.id)).length;
  if (novos === 0) return null;
  return (
    <span className="ml-1 text-xs bg-primary/15 text-primary px-1.5 py-0.5 rounded font-semibold">{novos} novo{novos > 1 ? "s" : ""}</span>
  );
}

function ComprasAdminFeedPanel() {
  const sorted = useMemo(
    () => [...COMPRAS_APPROVALS_MOCK].sort((a, b) => cpParseBR(b.dataSolicitacao) - cpParseBR(a.dataSolicitacao)),
    []
  );
  const seenAtMount = useMemo(() => {
    const stored = cpReadSeenIds();
    const sortedAll = [...COMPRAS_APPROVALS_MOCK].sort((a, b) => cpParseBR(b.dataSolicitacao) - cpParseBR(a.dataSolicitacao));
    sortedAll.slice(3).forEach((it) => stored.add(it.id));
    return stored;
  }, []);
  const lastVisit = useMemo(() => cpReadLastVisit(), []);
  const novos = useMemo(() => sorted.filter((it) => !seenAtMount.has(it.id)), [sorted, seenAtMount]);
  const novosCount = novos.length;

  // On unmount (admin switches profile / leaves the screen), persist all
  // currently displayed IDs as "seen" so that returning to this tab shows
  // everything as already read.
  useEffect(() => {
    if (typeof window === "undefined") return;
    return () => {
      const allIds = COMPRAS_APPROVALS_MOCK.map((a) => a.id);
      window.localStorage.setItem(CP_SEEN_IDS_KEY, JSON.stringify(allIds));
      window.localStorage.setItem(CP_LAST_VISIT_KEY, cpTodayBR());
    };
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof sorted>();
    for (const it of sorted) {
      const arr = map.get(it.dataSolicitacao) ?? [];
      arr.push(it);
      map.set(it.dataSolicitacao, arr);
    }
    return Array.from(map.entries());
  }, [sorted]);

  const showAlert = novosCount > 0;
  const todayStr = cpTodayBR();

  return (
    <div className="space-y-5">
      {/* Info card */}
      <div className="rounded-xl border bg-card p-4 flex items-start gap-3">
        <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Info className="size-4" />
        </div>
        <div className="text-sm">
          <div className="font-semibold text-foreground">Histórico geral</div>
          <p className="mt-1 text-muted-foreground leading-relaxed">
            Todas as solicitações de compras e pagamentos enviadas para o List. Use este histórico para acompanhar novos pedidos desde a sua última visita.
          </p>
        </div>
      </div>

      {/* Alert banner */}
      {showAlert && (
        <div className="relative overflow-hidden rounded-xl border border-primary/30 bg-primary/[0.06]">
          <div className="p-4 sm:p-5 flex items-center gap-4">
            <div className="relative shrink-0">
              <div className="size-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
                <Bell className="size-5" />
              </div>
              <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping [animation-duration:2.5s] scale-90" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-foreground">
                {novosCount === 1 ? "Há 1 nova solicitação" : `Há ${novosCount} novas solicitações`} desde sua última visita
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {lastVisit ? <>Última vez que você acessou: <span className="font-medium text-foreground tabular-nums">{lastVisit}</span></> : "Você ainda não tinha acessado este histórico."}
              </div>
            </div>
            <div className="hidden sm:inline-flex items-center gap-1 rounded-full bg-primary text-primary-foreground px-3 py-1.5 text-xs font-bold shrink-0 tabular-nums">
              {novosCount}
            </div>
          </div>
        </div>
      )}

      {/* Total counter */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        {!showAlert && novosCount === 0 ? (
          <span className="inline-flex items-center gap-1.5 text-emerald-700 font-medium">
            <Check className="size-3.5" /> Você está em dia
          </span>
        ) : <span />}
        <div>
          <span className="font-semibold text-foreground tabular-nums">{sorted.length}</span> solicitaç{sorted.length === 1 ? "ão" : "ões"} no total
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-5">
        {grouped.map(([date, items]) => {
          const dayHasNew = items.some((it) => !seenAtMount.has(it.id));
          const isToday = date === todayStr;
          return (
            <section key={date}>
              <div className="flex items-center gap-3 mb-3">
                <div className={cn(
                  "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold border",
                  dayHasNew ? "bg-primary/10 text-primary border-primary/20" : "bg-muted/40 text-muted-foreground border-transparent"
                )}>
                  <Calendar className="size-3.5" />
                  <span className="tabular-nums">{date}</span>
                  {isToday && <span className="text-[10px] uppercase tracking-wider opacity-80">• Hoje</span>}
                </div>
                <div className="flex-1 h-px bg-border" />
                <div className="text-[11px] text-muted-foreground tabular-nums">
                  {items.length} {items.length === 1 ? "item" : "itens"}
                </div>
              </div>

              <ul className="rounded-xl border bg-card overflow-hidden divide-y">
                {items.map((it) => {
                  const isNew = !seenAtMount.has(it.id);
                  const initials = it.solicitante.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0]?.toUpperCase()).join("");
                  return (
                    <li
                      key={it.id}
                      className={cn(
                        "relative flex items-center gap-4 px-4 sm:px-5 py-3.5 transition-colors",
                        isNew ? "bg-primary/[0.04] hover:bg-primary/[0.07]" : "hover:bg-muted/30"
                      )}
                    >
                      <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-xs shrink-0">{initials}</div>

                      <div className="min-w-0 flex-1 grid sm:grid-cols-[1fr_auto] gap-x-6 gap-y-0.5 items-center">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-foreground truncate">{it.solicitante}</span>
                            {isNew && <span className="size-1.5 rounded-full bg-primary shrink-0" aria-hidden />}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">{it.email}</div>
                        </div>
                        <div className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold text-foreground tabular-nums whitespace-nowrap">
                          <Wallet className="size-3.5 text-muted-foreground" /> {it.valor}
                        </div>
                      </div>

                      {isNew && (
                        <span className="inline-flex items-center text-[10px] font-bold bg-primary text-primary-foreground px-2 py-1 rounded-md uppercase tracking-wider shrink-0">
                          Novo
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
