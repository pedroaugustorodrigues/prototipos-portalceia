import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { Send, Calendar, Plane, Info, Plus, History, ChevronLeft, User2, MapPin, Clock, Settings, Briefcase, Search, Inbox, ShieldCheck, CheckCircle2, XCircle, AlertCircle, Bell, Paperclip, FileText, BadgeCheck, Link2, ArrowRight, Wallet, ChevronRight, Check, X, HelpCircle, Briefcase as ProjectIcon, Luggage, FolderKanban, Route as RouteIcon, BrushCleaning, Mail, Phone, IdCard, Cake, Bus, Globe, ShieldAlert, MessageSquare, AlertTriangle, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { type Talent } from "@/components/ptr/TalentSearch";
import TalentPickerModal from "@/components/ptr/TalentPickerModal";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { PROJECTS } from "@/lib/ptr-data";
import { useActiveProfile } from "@/lib/profile";

export const Route = createFileRoute("/central-solicitacoes/passagens-diarias")({
  head: () => ({
    meta: [
      { title: "Passagens e Diárias — Portal CEIA" },
      { name: "description", content: "Solicite passagens e diárias diretamente." },
    ],
  }),
  component: PassagensDiariasPage,
});

function PassagensDiariasPage() {
  const profile = useActiveProfile();
  const isAdmin = profile.id === "admin";
  const isCorretor = profile.id === "corretor-congressos";
  const isCoordenadora = profile.id === "coordenadora";
  const [projectLinked, setProjectLinked] = useState("");
  const [demandProject, setDemandProject] = useState("");
  const [passengerName, setPassengerName] = useState(profile.nome);
  const [passengerEmail, setPassengerEmail] = useState(profile.email);
  const [passengerRG, setPassengerRG] = useState(profile.rg);
  const [passengerCPF, setPassengerCPF] = useState(profile.cpf);
  const [passengerDOB, setPassengerDOB] = useState(profile.dataNascimento);
  const [passengerPhone, setPassengerPhone] = useState(profile.telefone);
  const [paymentConfirmation, setPaymentConfirmation] = useState(false);

  const [localPartida, setLocalPartida] = useState("");
  const [localChegada, setLocalChegada] = useState("");
  const [missionStart, setMissionStart] = useState("");
  const [missionEnd, setMissionEnd] = useState("");
  const [expenseType, setExpenseType] = useState("");
  const [expenseTypeOther, setExpenseTypeOther] = useState("");
  const [requestKind, setRequestKind] = useState("");

  const [diariaCount, setDiariaCount] = useState("");
  const [includeDesloc, setIncludeDesloc] = useState<boolean | null>(null);

  const [idaDate, setIdaDate] = useState("");
  const [voltaDate, setVoltaDate] = useState("");
  const [international, setInternational] = useState<boolean | null>(null);
  const [transportType, setTransportType] = useState("");
  const [includeBaggage, setIncludeBaggage] = useState(false);
  const [travelInsurance, setTravelInsurance] = useState<boolean | null>(null);
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");
  const [emergencyContactAddress, setEmergencyContactAddress] = useState("");
  const [passportNumberIntl, setPassportNumberIntl] = useState("");
  const [passportUploadedConfirm, setPassportUploadedConfirm] = useState(false);
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [pesquisaFile, setPesquisaFile] = useState<File | null>(null);

  const [flightRestriction, setFlightRestriction] = useState<boolean | null>(null);
  const [preferredTimes, setPreferredTimes] = useState("");
  const [flightPreference, setFlightPreference] = useState(false);
  const [uploadedConfirm, setUploadedConfirm] = useState(false);

  const [observation, setObservation] = useState("");
  const [activitiesDesc, setActivitiesDesc] = useState("");
  const [tripPurpose, setTripPurpose] = useState("");
  const [justification, setJustification] = useState("");

  const [outerTab, setOuterTab] = useState<"aprovacoes" | "pedidos" | "minhas">(isCoordenadora || isCorretor ? "aprovacoes" : "minhas");
  const [seenTabs, setSeenTabs] = useState<Set<string>>(() => new Set());
  const markTabSeen = (key: string) => {
    setSeenTabs((prev) => {
      if (prev.has(key)) return prev;
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  };
  const goToTab = (key: "aprovacoes" | "pedidos" | "minhas") => {
    markTabSeen(key);
    setOuterTab(key);
  };
  const [tab, setTab] = useState<"nova" | "historico">("nova");
  const [submissions, setSubmissions] = useState<any[]>(() => SEED_PASSAGENS_HISTORY);
  const [sent, setSent] = useState(false);
  const [saved, setSaved] = useState<any | null>(null);
  const [talentOpen, setTalentOpen] = useState(false);

  // Re-prefill passenger data when the active profile changes.
  useEffect(() => {
    setPassengerName(profile.nome);
    setPassengerEmail(profile.email);
    setPassengerRG(profile.rg);
    setPassengerCPF(profile.cpf);
    setPassengerDOB(profile.dataNascimento);
    setPassengerPhone(profile.telefone);
  }, [profile.id, profile.nome, profile.email, profile.rg, profile.cpf, profile.dataNascimento, profile.telefone]);

  function formatDateDDMMYYYY(v: string) {
    const digits = v.replace(/\D/g, "").slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return digits.slice(0, 2) + "/" + digits.slice(2);
    return digits.slice(0, 2) + "/" + digits.slice(2, 4) + "/" + digits.slice(4);
  }

  function clear() {
    setProjectLinked("");
    setDemandProject("");
    setPassengerName(profile.nome);
    setPassengerEmail(profile.email);
    setPassengerRG(profile.rg);
    setPassengerCPF(profile.cpf);
    setPassengerDOB(profile.dataNascimento);
    setPassengerPhone(profile.telefone);
    setPaymentConfirmation(false);
    setLocalPartida("");
    setLocalChegada("");
    setMissionStart("");
    setMissionEnd("");
    setExpenseType("");
    setExpenseTypeOther("");
    setRequestKind("");
    setDiariaCount("");
    setIncludeDesloc(null);
    setIdaDate("");
    setVoltaDate("");
    setInternational(false);
    setTransportType("");
    setIncludeBaggage(false);
    setFlightRestriction(false);
    setPreferredTimes("");
    setFlightPreference(false);
    setUploadedConfirm(false);
    setPassportFile(null);
    setPesquisaFile(null);
    setObservation("");
    setActivitiesDesc("");
    setTripPurpose("");
    setJustification("");
  }

  function submit() {
    const data = {
      projectLinked,
      demandProject,
      tripPurpose,
      passengerName,
      passengerEmail,
      passengerRG,
      passengerCPF,
      passengerDOB,
      passengerPhone,
      paymentConfirmation,
      localPartida,
      localChegada,
      missionStart,
      missionEnd,
      expenseType,
      expenseTypeOther,
      requestKind,
      diariaCount,
      includeDesloc,
      idaDate,
      voltaDate,
      international,
      travelInsurance,
      transportType,
      includeBaggage,
      passportNumberIntl,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactAddress,
      flightRestriction,
      preferredTimes,
      flightPreference,
      uploadedConfirm,
      observation,
      activitiesDesc,
      justification,
      passportFile,
      pesquisaFile,
      createdAt: new Date().toLocaleString(),
    };
    setSaved(data);
    setSent(true);
  }

  

  const needsDiarias = requestKind !== 'apenas_passagens';
  const needsFlights = requestKind !== 'apenas_diarias';
  const canSubmit = projectLinked.trim() !== "" && passengerName.trim() !== "" && passengerEmail.trim() !== "" && passengerRG.trim() !== "" && passengerCPF.trim() !== "" && passengerDOB.trim() !== "" && passengerPhone.trim() !== "" && paymentConfirmation === true && localPartida.trim() !== "" && localChegada.trim() !== "" && missionStart.trim() !== "" && missionEnd.trim() !== "" && expenseType.trim() !== "" && requestKind.trim() !== "" && (!needsDiarias || includeDesloc !== null) && (!needsFlights || (idaDate.trim() !== "" && voltaDate.trim() !== "")) && (!international || travelInsurance !== null);

  // require expenseTypeOther when expenseType === 'outra'
  const canSubmitWithOther = canSubmit && (expenseType !== 'outra' || expenseTypeOther.trim() !== '');

  return (
    <div className="p-6 md:p-10 w-full">
      <Link to="/central-solicitacoes" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground/80 -mt-2 mb-6">
        <ChevronLeft className="size-3" /> Voltar para central de solicitações
      </Link>

      <div className="mb-6">
        <div className="text-xs uppercase tracking-wider text-primary font-semibold">central de solicitações</div>
        <h1 className="text-3xl font-bold tracking-tight mt-1">Passagens e Diárias</h1>
      </div>
      <div className="w-full max-w-full">
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
                <>
                  <TabButton active={outerTab === "aprovacoes"} onClick={() => goToTab("aprovacoes")} icon={<ShieldCheck className="size-4" />}>
                    Aprovações {!seenTabs.has("aprovacoes") && <NewTabDot />}
                  </TabButton>
                </>
              ) : (
                <TabButton active={outerTab === "aprovacoes"} onClick={() => goToTab("aprovacoes")} icon={<ShieldCheck className="size-4" />}>
                  Pedidos de Recurso {!seenTabs.has("aprovacoes") && <NewTabDot />}
                </TabButton>
              )}
              <TabButton active={outerTab === "minhas"} onClick={() => goToTab("minhas")} icon={<Inbox className="size-4" />}>
                Minhas Solicitações {!seenTabs.has("minhas") && <NewTabDot />}
              </TabButton>
            </>
          )}
        </div>

        {outerTab === "aprovacoes" ? (
          isAdmin ? <AdminFeedPanel /> : isCorretor ? <CorretorPanel /> : <ApprovalsPanel />
        ) : outerTab === "pedidos" ? (
          <ApprovalsPanel />
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
              Crie uma nova solicitação de passagens e/ou diárias e acompanhe o histórico dos pedidos que você enviou.
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
                <p className="text-muted-foreground mt-2 max-w-md mx-auto">Sua solicitação de passagens e diárias foi registrada.</p>
                <button
                  onClick={() => {
                    setSubmissions((s) => [saved, ...s]);
                    setTab("historico");
                  }}
                  className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:bg-primary/90"
                >
                  Ver no Histórico
                </button>
              </div>
            ) : (
              <>
                

                <section className="rounded-xl border bg-white p-6 mb-6 shadow-sm">
                  <div className="flex items-center gap-3 text-base font-semibold mb-6 text-foreground leading-tight"><User2 className="size-4 text-primary" /> <span>Identificação e destino</span></div>
                  <div className="grid gap-3">
                    <label className="mb-3">
                      <div className="text-sm font-medium">Qual projeto gerou a demanda?</div>
                      <select value={demandProject} onChange={(e) => setDemandProject(e.target.value)} className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground select-arrow">
                        <option value="">Selecione</option>
                        {PROJECTS.filter((p: any) => p.status === "em_execucao").map((p: any) => (
                          <option key={p.id} value={p.name}>{p.name}</option>
                        ))}
                      </select>
                    </label>

                    <label className="mb-3">
                      <div className="text-sm font-medium">Projeto que arcará com os custos <span className="text-red-500 ml-1">*</span></div>
                      <select value={projectLinked} onChange={(e) => setProjectLinked(e.target.value)} className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground select-arrow" required>
                        <option value="">Selecione</option>
                        <option value="GESTÃO CEIA: CONTA FUNDO LOCAL">GESTÃO CEIA: CONTA FUNDO LOCAL</option>
                        {PROJECTS.map((p: any) => (
                          <option key={p.id} value={p.name}>{p.name}</option>
                        ))}
                      </select>
                    </label>

                    <div className="border-t mt-4 mb-4" />

                    <div className="grid sm:grid-cols-3 gap-4">
                      <label className="mb-3">
                        <div className="text-sm font-medium">Nome do passageiro <span className="text-red-500 ml-1">*</span></div>
                        <input value={passengerName} readOnly placeholder="Nome completo" className="mt-2 w-full rounded-lg border px-3 py-2 bg-gray-50 text-foreground cursor-not-allowed" required />
                      </label>
                      <label className="mb-3">
                        <div className="text-sm font-medium">E-mail do passageiro <span className="text-red-500 ml-1">*</span></div>
                        <input value={passengerEmail} readOnly placeholder="email@exemplo.com" className="mt-2 w-full rounded-lg border px-3 py-2 bg-gray-50 text-foreground cursor-not-allowed" required />
                      </label>
                      <label className="mb-3">
                        <div className="text-sm font-medium">Telefone de contato <span className="text-red-500 ml-1">*</span></div>
                        <input value={passengerPhone} readOnly placeholder="Telefone" className="mt-2 w-full rounded-lg border px-3 py-2 bg-gray-50 text-foreground cursor-not-allowed" required />
                      </label>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-4">
                      <label className="mb-3">
                        <div className="text-sm font-medium">RG do passageiro <span className="text-red-500 ml-1">*</span></div>
                        <input value={passengerRG} readOnly placeholder="RG" className="mt-2 w-full rounded-lg border px-3 py-2 bg-gray-50 text-foreground cursor-not-allowed" required />
                      </label>
                      <label className="mb-3">
                        <div className="text-sm font-medium">CPF do passageiro <span className="text-red-500 ml-1">*</span></div>
                        <input value={passengerCPF} readOnly placeholder="000.000.000-00" className="mt-2 w-full rounded-lg border px-3 py-2 bg-gray-50 text-foreground cursor-not-allowed" required />
                      </label>
                      <label className="mb-3">
                        <div className="text-sm font-medium">Data de nascimento do passageiro <span className="text-red-500 ml-1">*</span></div>
                        <div className="relative mt-2">
                          <Calendar className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <input value={passengerDOB} readOnly placeholder="DD/MM/AAAA" inputMode="numeric" maxLength={10} className="w-full rounded-lg border pl-10 pr-3 py-2 bg-gray-50 text-foreground cursor-not-allowed" required />
                        </div>
                      </label>
                    </div>

                    <div className="border-t mt-3 mb-3" />

                    <label className="mb-3">
                      <div className="text-sm font-medium">Confirmação de Pagamento <span className="text-red-500 ml-1">*</span></div>
                      <div className="mt-2 text-sm">
                        <label className="inline-flex items-baseline gap-2"><input className="mt-2" type="checkbox" checked={paymentConfirmation} onChange={(e) => setPaymentConfirmation(e.target.checked)} required /> <span>Declaro estar ciente de que o pagamento será realizado exclusivamente via transferência PIX, utilizando como chave o CPF informado nesta solicitação.</span></label>
                      </div>
                    </label>
                  </div>
                </section>

                  {/* Objetivo da viagem (movido para logo abaixo de Identificação e destino) */}
                  <section className="rounded-xl border bg-white p-6 mb-6 shadow-sm">
                    <div className="flex items-center gap-3 text-base font-semibold mb-6 text-foreground leading-tight"><Briefcase className="size-4 text-primary" /> <span>Objetivo da viagem</span></div>
                    <div className="grid gap-3">
                      <label className="mb-3">
                        <div className="text-sm font-medium">Motivo da viagem <span className="text-red-500 ml-1">*</span></div>
                        <select value={tripPurpose} onChange={(e) => setTripPurpose(e.target.value)} className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground select-arrow" required>
                          <option value="">Selecione</option>
                          <option value="participacao_congresso">Participação em congresso acadêmico</option>
                          <option value="apresentacao_trabalhos">Apresentação de trabalhos</option>
                          <option value="participacao_eventos">Participação em eventos</option>
                          <option value="prospeccao">Prospecção</option>
                          <option value="kickoff_projeto">Kickoff de projeto</option>
                          <option value="macroentrega">Macroentrega</option>
                          <option value="encerramento">Encerramento de projeto</option>
                        </select>
                      </label>
                      <label className="mb-3">
                        <div className="text-sm font-medium">Observação importante ou comentário</div>
                        <input value={observation} onChange={(e) => setObservation(e.target.value)} placeholder="Insira sua resposta" className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground" />
                      </label>
                      <label className="mb-3">
                        <div className="text-sm font-medium">Descrição das atividades a serem executadas <span className="text-red-500 ml-1">*</span></div>
                        <textarea required value={activitiesDesc} onChange={(e) => setActivitiesDesc(e.target.value)} placeholder="Insira sua resposta" className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground" rows={4} />
                      </label>
                      <label className="mb-3">
                        <div className="text-sm font-medium">Justificativa para solicitação com menos de 20 dias <span className="text-red-500 ml-1">*</span></div>
                        <input required value={justification} onChange={(e) => setJustification(e.target.value)} placeholder='Caso não seja a sua situação, escreva "NÃO SE APLICA"' className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground" />
                      </label>
                    </div>
                  </section>

                <section className="rounded-xl border bg-white p-6 mb-6 shadow-sm">
                  <div className="flex items-center gap-3 text-base font-semibold mb-6 text-foreground leading-tight"><MapPin className="size-4 text-primary" /> <span>Definição da missão e do destino</span></div>
                  <div className="grid gap-3">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <label className="mb-3">
                        <div className="text-sm font-medium">Local de partida <span className="text-red-500 ml-1">*</span></div>
                        <div className="text-xs text-muted-foreground mt-1">Informe o local onde iniciará a viagem.</div>
                        <input value={localPartida} onChange={(e) => setLocalPartida(e.target.value)} placeholder="Insira sua resposta" className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground" required />
                      </label>
                      <label className="mb-3">
                        <div className="text-sm font-medium">Local de chegada <span className="text-red-500 ml-1">*</span></div>
                        <div className="text-xs text-muted-foreground mt-1">Informe o local onde será concluída a viagem.</div>
                        <input value={localChegada} onChange={(e) => setLocalChegada(e.target.value)} placeholder="Insira sua resposta" className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground" required />
                      </label>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <label className="mb-3">
                        <div className="text-sm font-medium">Data de início da missão/evento <span className="text-red-500 ml-1">*</span></div>
                        <div className="relative mt-2">
                          <Calendar className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <input value={missionStart} onChange={(e) => setMissionStart(formatDateDDMMYYYY(e.target.value))} placeholder="DD/MM/AAAA" inputMode="numeric" maxLength={10} className="w-full rounded-lg border pl-10 pr-3 py-2 bg-white text-foreground" required />
                        </div>
                      </label>
                      <label className="mb-3">
                        <div className="text-sm font-medium">Data de término da missão/evento <span className="text-red-500 ml-1">*</span></div>
                        <div className="relative mt-2">
                          <Calendar className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <input value={missionEnd} onChange={(e) => setMissionEnd(formatDateDDMMYYYY(e.target.value))} placeholder="DD/MM/AAAA" inputMode="numeric" maxLength={10} className="w-full rounded-lg border pl-10 pr-3 py-2 bg-white text-foreground" required />
                        </div>
                      </label>
                    </div>

                    <label className="mb-3">
                      <div className="text-sm font-medium">Selecione o tipo da sua solicitação <span className="text-red-500 ml-1">*</span></div>
                      <select value={requestKind} onChange={(e) => {
                        const v = e.target.value;
                        setRequestKind(v);
                        if (v === 'apenas_passagens') {
                          setDiariaCount('');
                          setIncludeDesloc(null);
                        } else if (v === 'apenas_diarias') {
                          // clear flight-related fields
                          setIdaDate('');
                          setVoltaDate('');
                          setInternational(false);
                          setTransportType('');
                          setIncludeBaggage(false);
                          setTravelInsurance(false);
                          setPassportNumberIntl('');
                          setPassportUploadedConfirm(false);
                          setFlightRestriction(false);
                          setPreferredTimes('');
                          setFlightPreference(false);
                          setUploadedConfirm(false);
                        }
                      }} className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground select-arrow" required>
                        <option value="">Selecione</option>
                        <option value="passagens_e_diarias">Passagens e Diárias</option>
                        <option value="apenas_passagens">Apenas Passagens</option>
                        <option value="apenas_diarias">Apenas Diárias</option>
                      </select>
                    </label>
                  </div>
                </section>

                {requestKind && requestKind !== 'apenas_passagens' && (
                <section className="rounded-xl border bg-white p-6 mb-6 shadow-sm">
                  <div className="flex items-center gap-3 text-base font-semibold mb-6 text-foreground leading-tight"><Clock className="size-4 text-primary" /> <span>Diárias</span></div>
                  <div className="grid gap-3">
                    <label className="mb-3">
                      <div className="text-sm font-medium">Estime a quantidade de diárias</div>
                      <div className="text-xs text-muted-foreground mt-1">A quantidade de diárias será calculada exclusivamente com base no início e fim do evento acrescido do período de deslocamento. Dias extras no destino não serão contabilizados. O valor definitivo será calculada pelo sistema da Funape.</div>
                      <input value={diariaCount} onChange={(e) => setDiariaCount(e.target.value)} placeholder="Quantidade de diárias" className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground" />
                    </label>

                    <label className="mb-3">
                      <div className="text-sm font-medium">Incluir adicional de deslocamento? <span className="text-red-500 ml-1">*</span></div>
                      <div className="text-xs text-muted-foreground mt-1">Destinado a cobrir despesas de deslocamento até o local de embarque e do desembarque até o local de trabalho ou de hospedagem e vice-versa. Atualmente o valor é de R$ 95,00. Se for solicitado adicional de deslocamento, não será possível solicitar reembolso de uber.</div>
                      <div className="mt-2 grid grid-cols-2 gap-3">
                        <button type="button" className={includeDesloc === true ? "w-full rounded-lg border px-3 py-2 bg-primary text-primary-foreground border-transparent transition-colors duration-150 hover:opacity-95" : "w-full rounded-lg border px-3 py-2 bg-gray-100 text-black hover:bg-gray-200 hover:border-gray-200 transition-colors duration-150"} onClick={() => setIncludeDesloc(true)}>Sim</button>
                        <button type="button" className={includeDesloc === false ? "w-full rounded-lg border px-3 py-2 bg-primary text-primary-foreground border-transparent transition-colors duration-150 hover:opacity-95" : "w-full rounded-lg border px-3 py-2 bg-gray-100 text-black hover:bg-gray-200 hover:border-gray-200 transition-colors duration-150"} onClick={() => setIncludeDesloc(false)}>Não</button>
                      </div>
                    </label>
                  </div>
                </section>
                )}

                {requestKind && requestKind !== 'apenas_diarias' && (
                <section className="rounded-xl border bg-white p-6 mb-6 shadow-sm">
                  <div className="flex items-center gap-3 text-base font-semibold mb-6 text-foreground leading-tight"><Plane className="size-4 text-primary" /> <span>Passagens e voos</span></div>
                  <div className="grid gap-3">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <label className="mb-3">
                          <div className="text-sm font-medium">Data de Ida <span className="text-red-500 ml-1">*</span></div>
                          <div className="relative mt-2">
                            <Calendar className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input value={idaDate} onChange={(e) => setIdaDate(formatDateDDMMYYYY(e.target.value))} placeholder="DD/MM/AAAA" inputMode="numeric" maxLength={10} required className="w-full rounded-lg border pl-10 pr-3 py-2 bg-white text-foreground" />
                          </div>
                        </label>
                      <label className="mb-3">
                        <div className="text-sm font-medium">Data de Volta <span className="text-red-500 ml-1">*</span></div>
                        <div className="relative mt-2">
                          <Calendar className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <input value={voltaDate} onChange={(e) => setVoltaDate(formatDateDDMMYYYY(e.target.value))} placeholder="DD/MM/AAAA" inputMode="numeric" maxLength={10} required className="w-full rounded-lg border pl-10 pr-3 py-2 bg-white text-foreground" />
                        </div>
                      </label>
                    </div>

                    <label className="mb-3">
                      <div className="text-sm font-medium">Sua viagem é internacional?</div>
                      <div className="mt-2 grid grid-cols-2 gap-3">
                        <button type="button" className={international === true ? "w-full rounded-lg border px-3 py-2 bg-primary text-primary-foreground border-transparent transition-colors duration-150 hover:opacity-95" : "w-full rounded-lg border px-3 py-2 bg-gray-100 text-black hover:bg-gray-200 hover:border-gray-200 transition-colors duration-150"} onClick={() => setInternational(true)}>Sim</button>
                        <button type="button" className={international === false ? "w-full rounded-lg border px-3 py-2 bg-primary text-primary-foreground border-transparent transition-colors duration-150 hover:opacity-95" : "w-full rounded-lg border px-3 py-2 bg-gray-100 text-black hover:bg-gray-200 hover:border-gray-200 transition-colors duration-150"} onClick={() => setInternational(false)}>Não</button>
                      </div>
                    </label>

                    {international === true && (
                      <div className="mt-4 space-y-4">
                        <div className="space-y-3">
                          <label className="mb-3">
                            <div className="text-sm font-medium pt-4">Número do passaporte: <span className="text-red-500 ml-1">*</span></div>
                            <div className="pb-4">
                              <input required value={passportNumberIntl} onChange={(e) => setPassportNumberIntl(e.target.value)} placeholder="Insira sua resposta" className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground" />
                            </div>
                          </label>

                          <label className="mb-3">
                            <div className="text-sm font-medium pt-4">Envio da imagem do passaporte <span className="text-red-500 ml-1">*</span></div>
                            <div className="text-xs text-muted-foreground mt-1">O arquivo deve ser nomeado como: Passaporte</div>
                            <div className="pb-4">
                              <FileAttachInput
                                file={passportFile}
                                onChange={setPassportFile}
                                accept="image/*,application/pdf"
                                hint="Envie a imagem do passaporte do passageiro (JPG, PNG ou PDF)."
                                buttonLabel="Anexar imagem do passaporte"
                                required
                              />
                            </div>
                          </label>
                        </div>

                        <div>
                          <div className="text-sm font-medium">Irá precisar de seguro viagem? <span className="text-red-500 ml-1">*</span></div>
                          <div className="mt-2 grid grid-cols-2 gap-3">
                            <button type="button" className={travelInsurance === true ? "w-full rounded-lg border px-3 py-2 bg-primary text-primary-foreground border-transparent transition-colors duration-150 hover:opacity-95" : "w-full rounded-lg border px-3 py-2 bg-gray-100 text-black hover:bg-gray-200 hover:border-gray-200 transition-colors duration-150"} onClick={() => setTravelInsurance(true)}>Sim</button>
                            <button type="button" className={travelInsurance === false ? "w-full rounded-lg border px-3 py-2 bg-primary text-primary-foreground border-transparent transition-colors duration-150 hover:opacity-95" : "w-full rounded-lg border px-3 py-2 bg-gray-100 text-black hover:bg-gray-200 hover:border-gray-200 transition-colors duration-150"} onClick={() => setTravelInsurance(false)}>Não</button>
                          </div>
                        </div>

                        {travelInsurance === true && (
                          <div className="space-y-3">
                            <label className="mb-3">
                              <div className="text-sm font-medium pt-4">Informe o nome do seu contato de emergência: <span className="text-red-500 ml-1">*</span></div>
                              <div className="pb-4">
                                <input required value={emergencyContactName} onChange={(e) => setEmergencyContactName(e.target.value)} placeholder="Insira sua resposta" className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground" />
                              </div>
                            </label>

                            <label className="mb-3">
                              <div className="text-sm font-medium pt-4">Informe o número do seu contato de emergência: <span className="text-red-500 ml-1">*</span></div>
                              <div className="pb-4">
                                <input required value={emergencyContactPhone} onChange={(e) => setEmergencyContactPhone(e.target.value)} placeholder="Insira sua resposta" className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground" />
                              </div>
                            </label>

                            <label className="mb-3">
                              <div className="text-sm font-medium pt-4">Informe o endereço com CEP do seu contato de emergência: <span className="text-red-500 ml-1">*</span></div>
                              <div className="pb-4">
                                <input required value={emergencyContactAddress} onChange={(e) => setEmergencyContactAddress(e.target.value)} placeholder="Insira sua resposta" className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground" />
                              </div>
                            </label>
                          </div>
                        )}

                        {travelInsurance !== null && (
                          <>
                            <label className="mb-3" aria-required="true">
                              <div className="text-sm font-medium pt-4">Tipo de Transporte: <span className="text-red-500 ml-1">*</span></div>
                              <div className="text-xs text-muted-foreground">A passagem de transporte rodoviário é adquirida pelo passageiro e reembolsada posteriormente.</div>
                              <div className="pb-4">
                                <select required value={transportType} onChange={(e) => setTransportType(e.target.value)} className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground select-arrow">
                                  <option value="">Selecionar sua resposta</option>
                                  <option value="aereo">Aéreo</option>
                                  <option value="aereo_rodoviario">Aéreo e rodoviário</option>
                                  <option value="rodoviario">Rodoviário</option>
                                  <option value="carro_proprio">Carro próprio</option>
                                </select>
                              </div>
                            </label>

                            <label className="mb-3" aria-required="true">
                              <div className="text-sm font-medium pt-4">Incluir franquia de bagagem? <span className="text-red-500 ml-1">*</span></div>
                              <div className="mt-2 text-xs text-muted-foreground">Após a compra da passagem não é mais possível incluir bagagens pagas com recurso do projeto, apenas com recurso próprio do passageiro.</div>
                              <div className="pb-4 mt-2 grid grid-cols-2 gap-3">
                                <button type="button" className={includeBaggage === true ? "w-full rounded-lg border px-3 py-2 bg-primary text-primary-foreground border-transparent transition-colors duration-150 hover:opacity-95" : "w-full rounded-lg border px-3 py-2 bg-gray-100 text-black hover:bg-gray-200 hover:border-gray-200 transition-colors duration-150"} onClick={() => setIncludeBaggage(true)}>Sim</button>
                                <button type="button" className={includeBaggage === false ? "w-full rounded-lg border px-3 py-2 bg-primary text-primary-foreground border-transparent transition-colors duration-150 hover:opacity-95" : "w-full rounded-lg border px-3 py-2 bg-gray-100 text-black hover:bg-gray-200 hover:border-gray-200 transition-colors duration-150"} onClick={() => setIncludeBaggage(false)}>Não</button>
                              </div>
                            </label>
                          </>
                        )}
                      </div>
                    )}

                    {international === false && (
                      <>
                        <label className="" aria-required="true">
                          <div className="text-sm font-medium pt-4">Tipo de Transporte: <span className="text-red-500 ml-1">*</span></div>
                          <div className="text-xs text-muted-foreground">A passagem de transporte rodoviário é adquirida pelo passageiro e reembolsada posteriormente.</div>
                          <div className="pb-4">
                            <select required value={transportType} onChange={(e) => setTransportType(e.target.value)} className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground select-arrow">
                              <option value="">Selecionar sua resposta</option>
                              <option value="aereo">Aéreo</option>
                              <option value="aereo_rodoviario">Aéreo e rodoviário</option>
                              <option value="rodoviario">Rodoviário</option>
                              <option value="carro_proprio">Carro próprio</option>
                            </select>
                          </div>
                        </label>

                        <label className="" aria-required="true">
                          <div className="text-sm font-medium pt-4">Incluir franquia de bagagem? <span className="text-red-500 ml-1">*</span></div>
                          <div className="mt-2 text-xs text-muted-foreground">Após a compra da passagem não é mais possível incluir bagagens pagas com recurso do projeto, apenas com recurso próprio do passageiro.</div>
                          <div className="pb-4 mt-2 grid grid-cols-2 gap-3">
                            <button type="button" className={includeBaggage === true ? "w-full rounded-lg border px-3 py-2 bg-primary text-primary-foreground border-transparent transition-colors duration-150 hover:opacity-95" : "w-full rounded-lg border px-3 py-2 bg-gray-100 text-black hover:bg-gray-200 hover:border-gray-200 transition-colors duration-150"} onClick={() => setIncludeBaggage(true)}>Sim</button>
                            <button type="button" className={includeBaggage === false ? "w-full rounded-lg border px-3 py-2 bg-primary text-primary-foreground border-transparent transition-colors duration-150 hover:opacity-95" : "w-full rounded-lg border px-3 py-2 bg-gray-100 text-black hover:bg-gray-200 hover:border-gray-200 transition-colors duration-150"} onClick={() => setIncludeBaggage(false)}>Não</button>
                          </div>
                        </label>
                      </>
                    )}
                  </div>
                </section>
                )}

                {requestKind && requestKind !== 'apenas_diarias' && (
                <section className="rounded-xl border bg-white p-6 mb-6 shadow-sm">
                  <div className="flex items-center gap-3 text-base font-semibold mb-6 text-foreground leading-tight"><Settings className="size-4 text-primary" /> <span>Restrições e preferências</span></div>
                  <div className="grid gap-3">
                    <label aria-required="true">
                      <div className="text-sm font-medium">Possui restrição de Voo? <span className="text-red-500 ml-1">*</span></div>
                      <div className="mt-2 grid grid-cols-2 gap-3">
                        <button type="button" className={flightRestriction === true ? "w-full rounded-lg border px-3 py-2 bg-primary text-primary-foreground border-transparent transition-colors duration-150 hover:opacity-95" : "w-full rounded-lg border px-3 py-2 bg-gray-100 text-black hover:bg-gray-200 hover:border-gray-200 transition-colors duration-150"} onClick={() => setFlightRestriction(true)}>Sim</button>
                        <button type="button" className={flightRestriction === false ? "w-full rounded-lg border px-3 py-2 bg-primary text-primary-foreground border-transparent transition-colors duration-150 hover:opacity-95" : "w-full rounded-lg border px-3 py-2 bg-gray-100 text-black hover:bg-gray-200 hover:border-gray-200 transition-colors duration-150"} onClick={() => setFlightRestriction(false)}>Não</button>
                      </div>
                    </label>

                    {flightRestriction === true && (
                      <>
                              <label className="mb-3">
                              <div className="text-sm font-medium pt-4">Informe os horários preferenciais <span className="text-red-500 ml-1">*</span></div>
                              <div className="pb-4">
                                <input required value={preferredTimes} onChange={(e) => setPreferredTimes(e.target.value)} placeholder="Insira sua resposta" className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground" />
                              </div>
                            </label>

                          <label className="mb-3" aria-required="true">
                          <div className="text-sm font-medium">Possui preferência de voo? <span className="text-red-500 ml-1">*</span></div>
                          <div className="text-xs text-muted-foreground mt-1">Se tiver preferência, deverá adicionar sugestão de voos.</div>
                          <div className="mt-2 grid grid-cols-2 gap-3">
                            <button type="button" className={flightPreference === true ? "w-full rounded-lg border px-3 py-2 bg-primary text-primary-foreground border-transparent transition-colors duration-150 hover:opacity-95" : "w-full rounded-lg border px-3 py-2 bg-gray-100 text-black hover:bg-gray-200 hover:border-gray-200 transition-colors duration-150"} onClick={() => setFlightPreference(true)}>Sim</button>
                            <button type="button" className={flightPreference === false ? "w-full rounded-lg border px-3 py-2 bg-primary text-primary-foreground border-transparent transition-colors duration-150 hover:opacity-95" : "w-full rounded-lg border px-3 py-2 bg-gray-100 text-black hover:bg-gray-200 hover:border-gray-200 transition-colors duration-150"} onClick={() => setFlightPreference(false)}>Não</button>
                          </div>
                        </label>

                        {flightPreference === true && (
                          <label className="mb-3">
                            <div className="text-sm font-medium pt-4">Por favor, anexe o arquivo com a pesquisa, contendo: data, companhia aérea, horário e valor do voo. <span className="text-red-500 ml-1">*</span></div>
                            <div className="text-xs text-muted-foreground mt-1">O arquivo deve ser nomeado como: Pesquisa.pdf</div>
                            <div className="pb-4 mt-2">
                              <FileAttachInput
                                file={pesquisaFile}
                                onChange={setPesquisaFile}
                                accept="image/jpeg,image/png,application/pdf"
                                hint="Anexe o arquivo da pesquisa (JPG, PNG ou PDF) (data, companhia, horário e valor do voo)."
                                buttonLabel="Anexar arquivo da pesquisa"
                                required
                              />
                            </div>
                          </label>
                        )}
                      </>
                    )}

                    {flightRestriction === false && (
                      <>
                        <label className="mb-3" aria-required="true">
                          <div className="text-sm font-medium pt-4">Possui preferência de voo? <span className="text-red-500 ml-1">*</span></div>
                          <div className="text-xs text-muted-foreground mt-1">Se tiver preferência, deverá adicionar sugestão de voos.</div>
                          <div className="pb-4 mt-2 grid grid-cols-2 gap-3">
                            <button type="button" className={flightPreference === true ? "w-full rounded-lg border px-3 py-2 bg-primary text-primary-foreground border-transparent transition-colors duration-150 hover:opacity-95" : "w-full rounded-lg border px-3 py-2 bg-gray-100 text-black hover:bg-gray-200 hover:border-gray-200 transition-colors duration-150"} onClick={() => setFlightPreference(true)}>Sim</button>
                            <button type="button" className={flightPreference === false ? "w-full rounded-lg border px-3 py-2 bg-primary text-primary-foreground border-transparent transition-colors duration-150 hover:opacity-95" : "w-full rounded-lg border px-3 py-2 bg-gray-100 text-black hover:bg-gray-200 hover:border-gray-200 transition-colors duration-150"} onClick={() => setFlightPreference(false)}>Não</button>
                          </div>
                        </label>

                        {flightPreference === true && (
                          <label>
                            <div className="text-sm font-medium pt-4">Por favor, anexe o arquivo com a pesquisa, contendo: data, companhia aérea, horário e valor do voo. <span className="text-red-500 ml-1">*</span></div>
                            <div className="text-xs text-muted-foreground mt-1">O arquivo deve ser nomeado como: Pesquisa.pdf</div>
                            <div className="pb-4 mt-2">
                              <FileAttachInput
                                file={pesquisaFile}
                                onChange={setPesquisaFile}
                                accept="image/jpeg,image/png,application/pdf"
                                hint="Anexe o arquivo da pesquisa (JPG, PNG ou PDF) (data, companhia, horário e valor do voo)."
                                buttonLabel="Anexar arquivo da pesquisa"
                                required
                              />
                            </div>
                          </label>
                        )}
                      </>
                    )}
                  </div>
                </section>
                )}
                
              </>
            )}
          </div>
        ) : (
          <PassagensHistoryList
            submissions={submissions}
            onResend={(idx, updated) => {
              setSubmissions((prev) => prev.map((s, i) => i === idx ? { ...s, ...updated, _status: "pendente", _corretorComment: undefined, createdAt: new Date().toLocaleString() } : s));
            }}
          />
        )}
        </>
        )}
      </div>

      {outerTab === "minhas" && tab === "nova" && !sent && (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-10 md:bottom-6 md:max-w-xl md:ml-auto z-30">
            <div className="rounded-2xl border bg-white/95 backdrop-blur shadow-sm p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div />
          <div className="flex items-center gap-2">
            <button onClick={clear} className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"><BrushCleaning className="size-4" /> Limpar</button>
            <button onClick={submit} disabled={!canSubmitWithOther} className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
              <Send className="size-4" /> Enviar solicitação
            </button>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}

export default PassagensDiariasPage;

function FileAttachInput({
  file,
  onChange,
  accept,
  hint,
  buttonLabel,
  required,
}: {
  file: File | null;
  onChange: (f: File | null) => void;
  accept?: string;
  hint?: string;
  buttonLabel: string;
  required?: boolean;
}) {
  const inputId = `file-${Math.random().toString(36).slice(2, 9)}`;
  return (
    <div className="mt-2">
      <input
        id={inputId}
        type="file"
        accept={accept}
        required={required && !file}
        className="sr-only"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
      {file ? (
        <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-3 py-2.5">
          <div className="size-9 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Paperclip className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-foreground truncate">{file.name}</div>
            <div className="text-[11px] text-muted-foreground">
              {(file.size / 1024).toFixed(1)} KB
            </div>
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="size-7 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground inline-flex items-center justify-center shrink-0"
            aria-label="Remover arquivo"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          className="group flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-input hover:border-primary/40 hover:bg-primary/[0.03] px-4 py-6 cursor-pointer transition-colors text-center"
        >
          <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
            <Paperclip className="size-5" />
          </div>
          <div className="text-sm font-semibold text-foreground">{buttonLabel}</div>
          {hint && <div className="text-xs text-muted-foreground max-w-md">{hint}</div>}
        </label>
      )}
    </div>
  );
}

function TabButton({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn("flex-1 relative flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium -mb-px")}
    >
      <div className={cn("flex items-center gap-2", active ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
        {icon}
        <span className="whitespace-nowrap">{children}</span>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-[2px] overflow-hidden">
        <span
          style={{
            display: "block",
            height: "100%",
            backgroundColor: "var(--primary)",
            transform: active ? "scaleX(1)" : "scaleX(0)",
            transformOrigin: "center",
            transition: "transform 360ms cubic-bezier(.2,.9,.2,1)",
          }}
        />
      </div>
    </button>
  );
}

function PassagensHistoryList({ submissions, onResend }: { submissions: any[]; onResend?: (idx: number, updated: any) => void }) {
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
        const isReturned = s._status === "em_correcao";
        const isApproved = s._status === "aprovado";
        const isAnaliseCoord = s._status === "em_analise_coordenador";
        const isAnaliseAdmin = s._status === "em_analise_admin";
        const tipoLabel =
          s.requestKind === "apenas_passagens" ? "Passagens" :
          s.requestKind === "apenas_diarias" ? "Diárias" : "Passagens e Diárias";
        return (
        <div
          key={idx}
          className={cn(
            "group rounded-xl border bg-card overflow-hidden transition-all duration-200 hover:shadow-sm"
          )}
        >
          <div className="px-5 py-4 flex flex-col md:flex-row md:items-center gap-4">
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-base font-semibold text-foreground truncate">
                  {s.localPartida} <ArrowRight className="inline size-3.5 text-muted-foreground mx-1" /> {s.localChegada}
                </span>
                {isReturned && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 text-orange-800 border border-orange-200 px-2 py-0.5 text-[11px] font-semibold">
                    <AlertTriangle className="size-3" /> Devolvida
                  </span>
                )}
                {isApproved && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 text-[11px] font-semibold">
                    <CheckCircle2 className="size-3" /> Aprovada
                  </span>
                )}
                {isAnaliseCoord && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 text-sky-800 border border-sky-200 px-2 py-0.5 text-[11px] font-semibold">
                    <AlertCircle className="size-3" /> Em análise (coordenador)
                  </span>
                )}
                {isAnaliseAdmin && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 text-violet-800 border border-violet-200 px-2 py-0.5 text-[11px] font-semibold">
                    <AlertCircle className="size-3" /> Em análise (Equipe administrativa)
                  </span>
                )}
                {!isReturned && !isApproved && !isAnaliseCoord && !isAnaliseAdmin && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 text-[11px] font-semibold">
                    <AlertCircle className="size-3" /> Em análise (corretores)
                  </span>
                )}
              </div>
              <div className="text-sm text-muted-foreground inline-flex items-center gap-2">
                <Calendar className="size-3.5" /> {s.missionStart} — {s.missionEnd}
                <span className="text-muted-foreground/50">•</span>
                <span>{tipoLabel}</span>
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
        <PassagensDetailDialog submission={detail} onClose={() => setDetail(null)} />
      )}
      {correctIdx !== null && submissions[correctIdx] && onResend && (
        <CorrigirSolicitacaoDialog
          submission={submissions[correctIdx]}
          onClose={() => setCorrectIdx(null)}
          onResend={(updated) => { onResend(correctIdx, updated); setCorrectIdx(null); }}
        />
      )}
    </div>
  );
}

const SEED_PASSAGENS_HISTORY: any[] = [
  {
    _status: "em_correcao",
    _corretorComment:
      "Por favor, anexe a carta de aceite oficial do congresso e ajuste a data de retorno: a programação do evento se encerra em 16/05, então o retorno deve ser a partir de 17/05.",
    passengerName: "Renata Braga",
    passengerEmail: "renata.braga@ceia.ufg.br",
    passengerPhone: "(62) 99988-7766",
    passengerRG: "1.234.567 SSP-GO",
    passengerCPF: "111.222.333-44",
    passengerDOB: "10/02/1980",
    paymentConfirmation: true,
    demandProject: "Sistema de Navegação Autônoma para VANTs",
    projectLinked: "GESTÃO CEIA: CONTA FUNDO LOCAL",
    tripPurpose: "congressos",
    localPartida: "Goiânia - GO",
    localChegada: "Belo Horizonte - MG",
    missionStart: "14/05/2026",
    missionEnd: "16/05/2026",
    expenseType: "pessoal_pdi",
    expenseTypeOther: "",
    requestKind: "passagens_e_diarias",
    diariaCount: "3",
    includeDesloc: true,
    idaDate: "14/05/2026",
    voltaDate: "16/05/2026",
    international: false,
    travelInsurance: false,
    transportType: "aereo",
    includeBaggage: true,
    passportNumberIntl: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactAddress: "",
    flightRestriction: false,
    preferredTimes: "",
    flightPreference: false,
    uploadedConfirm: false,
    observation: "Preferência por voos pela manhã.",
    activitiesDesc: "Apresentação de paper no SBES 2026 e participação em painéis técnicos.",
    justification: "NÃO SE APLICA",
    createdAt: "29/04/2026 10:42",
  },
  {
    _status: "em_analise_coordenador",
    passengerName: "Renata Braga",
    passengerEmail: "renata.braga@ceia.ufg.br",
    passengerPhone: "(62) 99988-7766",
    passengerRG: "1.234.567 SSP-GO",
    passengerCPF: "111.222.333-44",
    passengerDOB: "10/02/1980",
    paymentConfirmation: true,
    demandProject: "IA para Detecção de Plágio Acadêmico",
    projectLinked: "IA para Detecção de Plágio Acadêmico",
    tripPurpose: "reuniao_cliente",
    localPartida: "Goiânia - GO",
    localChegada: "São Paulo - SP",
    missionStart: "22/05/2026",
    missionEnd: "23/05/2026",
    expenseType: "pessoal_pdi",
    expenseTypeOther: "",
    requestKind: "passagens_e_diarias",
    diariaCount: "2",
    includeDesloc: true,
    idaDate: "22/05/2026",
    voltaDate: "23/05/2026",
    international: false,
    travelInsurance: false,
    transportType: "aereo",
    includeBaggage: false,
    observation: "",
    activitiesDesc: "Reunião de alinhamento técnico com a empresa parceira sobre o entregável Q2.",
    justification: "NÃO SE APLICA",
    createdAt: "06/05/2026 09:15",
  },
  {
    _status: "em_analise_admin",
    passengerName: "Renata Braga",
    passengerEmail: "renata.braga@ceia.ufg.br",
    passengerPhone: "(62) 99988-7766",
    passengerRG: "1.234.567 SSP-GO",
    passengerCPF: "111.222.333-44",
    passengerDOB: "10/02/1980",
    paymentConfirmation: true,
    demandProject: "Portal CEIA — Gestão de Projetos",
    projectLinked: "Portal CEIA — Gestão de Projetos",
    tripPurpose: "congressos",
    localPartida: "Goiânia - GO",
    localChegada: "Curitiba - PR",
    missionStart: "10/06/2026",
    missionEnd: "13/06/2026",
    expenseType: "pessoal_pdi",
    expenseTypeOther: "",
    requestKind: "passagens_e_diarias",
    diariaCount: "4",
    includeDesloc: true,
    idaDate: "10/06/2026",
    voltaDate: "13/06/2026",
    international: false,
    travelInsurance: false,
    transportType: "aereo",
    includeBaggage: true,
    observation: "",
    activitiesDesc: "Apresentação de artigo no SBSC 2026.",
    justification: "NÃO SE APLICA",
    createdAt: "28/04/2026 16:08",
  },
  {
    _status: "em_analise_corretor",
    passengerName: "Renata Braga",
    passengerEmail: "renata.braga@ceia.ufg.br",
    passengerPhone: "(62) 99988-7766",
    passengerRG: "1.234.567 SSP-GO",
    passengerCPF: "111.222.333-44",
    passengerDOB: "10/02/1980",
    paymentConfirmation: true,
    demandProject: "Sistema de Navegação Autônoma para VANTs",
    projectLinked: "Sistema de Navegação Autônoma para VANTs",
    tripPurpose: "congressos",
    localPartida: "Goiânia - GO",
    localChegada: "Florianópolis - SC",
    missionStart: "05/04/2026",
    missionEnd: "08/04/2026",
    expenseType: "pessoal_pdi",
    expenseTypeOther: "",
    requestKind: "passagens_e_diarias",
    diariaCount: "4",
    includeDesloc: true,
    idaDate: "05/04/2026",
    voltaDate: "08/04/2026",
    international: false,
    travelInsurance: false,
    transportType: "aereo",
    includeBaggage: true,
    observation: "",
    activitiesDesc: "Apresentação no ENIAC 2026.",
    justification: "NÃO SE APLICA",
    createdAt: "12/03/2026 14:22",
  },
];

// =============================================================
// Passagens & Diárias — Diálogo "Ver detalhes" (somente leitura)
// Mesmo padrão visual do RequestDetailsDialog do Ajuste de PTR.
// =============================================================

const TRIP_PURPOSE_LABEL: Record<string, string> = {
  congressos: "Congressos",
  evento: "Evento",
  reuniao_cliente: "Reunião com cliente",
};
const EXPENSE_TYPE_LABEL: Record<string, string> = {
  pessoal_pdi: "Pessoal da equipe de PD&I, relacionadas á execução dos projetos.",
  unidade_embrapii: "Pessoal da Unidade EMBRAPII-CEIA, relativas á participação em reuniões de prospecção e negociação de projetos, eventos...",
  outra: "Outra",
};
const REQUEST_KIND_LABEL: Record<string, string> = {
  passagens_e_diarias: "Passagens e Diárias",
  apenas_passagens: "Apenas Passagens",
  apenas_diarias: "Apenas Diárias",
};
const TRANSPORT_LABEL: Record<string, string> = {
  aereo: "Aéreo",
  aereo_rodoviario: "Aéreo e rodoviário",
  rodoviario: "Rodoviário",
  carro_proprio: "Carro próprio",
};

function PDInfoTile({ icon, label, value, full }: { icon: React.ReactNode; label: string; value: React.ReactNode; full?: boolean }) {
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

function PDFileTile({ label, file }: { label: string; file: File | { name: string; size?: number } }) {
  const sizeKB = (file as File).size ? `${((file as File).size / 1024).toFixed(1)} KB` : null;
  let href: string | null = null;
  try {
    if (file instanceof File) href = URL.createObjectURL(file);
  } catch {
    href = null;
  }
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
          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-sky-600 underline underline-offset-2 truncate hover:text-sky-700 block"
              title={file.name}
            >
              {file.name}
            </a>
          ) : (
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="text-sm font-medium text-sky-600 underline underline-offset-2 truncate hover:text-sky-700 block cursor-pointer"
              title={file.name}
            >
              {file.name}
            </a>
          )}
          {sizeKB && <div className="text-[11px] text-muted-foreground">{sizeKB}</div>}
        </div>
      </div>
    </div>
  );
}

function PDSection({
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

function PassagensDetailDialog({ submission: s, onClose }: { submission: any; onClose: () => void }) {
  const tipoLabel = REQUEST_KIND_LABEL[s.requestKind] ?? s.requestKind ?? "—";
  const showDiarias = s.requestKind !== "apenas_passagens";
  const showPassagens = s.requestKind !== "apenas_diarias";
  const isInternational = s.international === true;
  const needsInsurance = isInternational && s.travelInsurance === true;

  const statusInfo =
    s._status === "em_correcao"
      ? { cls: "bg-orange-50 text-orange-700 border-orange-200", icon: <AlertTriangle className="size-3.5" />, label: "Devolvida" }
      : s._status === "aprovado"
      ? { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: <CheckCircle2 className="size-3.5" />, label: "Aprovada" }
      : s._status === "em_analise_coordenador"
      ? { cls: "bg-sky-50 text-sky-700 border-sky-200", icon: <AlertCircle className="size-3.5" />, label: "Em análise (coordenador)" }
      : s._status === "em_analise_admin"
      ? { cls: "bg-violet-50 text-violet-700 border-violet-200", icon: <AlertCircle className="size-3.5" />, label: "Em análise (Equipe administrativa)" }
      : { cls: "bg-amber-50 text-amber-700 border-amber-200", icon: <AlertCircle className="size-3.5" />, label: "Em análise (corretores)" };

  return (
    <Dialog open={true} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="sticky top-0 bg-background z-10 px-6 pt-6 pb-4 border-b flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
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
          </div>
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
              <PDInfoTile full icon={<RouteIcon className="size-3.5" />} label="Trecho" value={
                <span className="inline-flex items-center gap-1.5">
                  {s.localPartida || "—"} <ArrowRight className="size-3.5 text-muted-foreground" /> {s.localChegada || "—"}
                </span>
              } />
              <PDInfoTile icon={<Calendar className="size-3.5" />} label="Período" value={`${s.missionStart || "—"} — ${s.missionEnd || "—"}`} />
              <PDInfoTile icon={<Luggage className="size-3.5" />} label="Tipo" value={tipoLabel} />
              <div className="rounded-lg border bg-card px-3 py-2.5 min-w-0">
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.08em] text-muted-foreground font-semibold">
                  <CheckCircle2 className="size-3.5" />
                  <span>Status</span>
                </div>
                <div className="mt-1.5">
                  <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wider", statusInfo.cls)}>
                    {statusInfo.icon} {statusInfo.label}
                  </span>
                </div>
              </div>
              <PDInfoTile icon={<Calendar className="size-3.5" />} label="Enviada em" value={s.createdAt} />
              <PDInfoTile icon={<FolderKanban className="size-3.5" />} label="Projeto que custeia" value={s.projectLinked} />
              {s.demandProject && (
                <PDInfoTile icon={<Briefcase className="size-3.5" />} label="Projeto que demanda" value={s.demandProject} />
              )}
            </div>
          </section>

          {s._status === "em_correcao" && s._corretorComment && (
            <section className="rounded-xl border border-orange-200 bg-orange-50/60 p-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-orange-800 mb-2">
                <MessageSquare className="size-4" /> Comentário da devolução
              </div>
              <p className="text-sm text-orange-900 leading-relaxed">{s._corretorComment}</p>
            </section>
          )}

          {/* Passageiro */}
          <PDSection title="Identificação do passageiro" icon={<User2 className="size-4" />} tone="sky">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <PDInfoTile full icon={<User2 className="size-3.5" />} label="Nome" value={s.passengerName} />
              <PDInfoTile icon={<Mail className="size-3.5" />} label="E-mail" value={s.passengerEmail} />
              <PDInfoTile icon={<Phone className="size-3.5" />} label="Telefone" value={s.passengerPhone} />
              <PDInfoTile icon={<Cake className="size-3.5" />} label="Data de nascimento" value={s.passengerDOB} />
              <PDInfoTile icon={<IdCard className="size-3.5" />} label="RG" value={s.passengerRG} />
              <PDInfoTile icon={<IdCard className="size-3.5" />} label="CPF" value={s.passengerCPF} />
              <PDInfoTile icon={<Wallet className="size-3.5" />} label="Confirmou forma de pagamento" value={s.paymentConfirmation ? "Sim" : "Não"} />
            </div>
          </PDSection>

          {/* Objetivo da viagem */}
          <PDSection title="Objetivo da viagem" icon={<Briefcase className="size-4" />} tone="indigo">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <PDInfoTile full icon={<Briefcase className="size-3.5" />} label="Motivo" value={TRIP_PURPOSE_LABEL[s.tripPurpose] ?? s.tripPurpose} />
              <PDInfoTile full icon={<FileText className="size-3.5" />} label="Descrição das atividades" value={
                s.activitiesDesc ? <span className="block whitespace-pre-wrap leading-relaxed">{s.activitiesDesc}</span> : null
              } />
              <PDInfoTile full icon={<AlertCircle className="size-3.5" />} label="Justificativa (menos de 20 dias)" value={s.justification} />
              {s.observation && (
                <PDInfoTile full icon={<MessageSquare className="size-3.5" />} label="Observação / comentário" value={s.observation} />
              )}
            </div>
          </PDSection>

          {/* Missão e destino */}
          <PDSection title="Missão e destino" icon={<MapPin className="size-4" />} tone="teal">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <PDInfoTile icon={<MapPin className="size-3.5" />} label="Local de partida" value={s.localPartida} />
              <PDInfoTile icon={<MapPin className="size-3.5" />} label="Local de chegada" value={s.localChegada} />
              <PDInfoTile icon={<Luggage className="size-3.5" />} label="Tipo da solicitação" value={tipoLabel} />
              <PDInfoTile icon={<Calendar className="size-3.5" />} label="Início da missão" value={s.missionStart} />
              <PDInfoTile icon={<Calendar className="size-3.5" />} label="Término da missão" value={s.missionEnd} />
              <PDInfoTile
                icon={<Wallet className="size-3.5" />}
                label="Tipo de despesa"
                value={
                  s.expenseType === "outra"
                    ? s.expenseTypeOther || "Outra"
                    : EXPENSE_TYPE_LABEL[s.expenseType] ?? s.expenseType
                }
              />
            </div>
          </PDSection>

          {/* Diárias */}
          {showDiarias && (
            <PDSection title="Diárias" icon={<Clock className="size-4" />} tone="amber">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <PDInfoTile icon={<Clock className="size-3.5" />} label="Quantidade estimada" value={s.diariaCount} />
                <PDInfoTile icon={<Bus className="size-3.5" />} label="Adicional de deslocamento" value={s.includeDesloc === true ? "Sim" : s.includeDesloc === false ? "Não" : null} />
              </div>
            </PDSection>
          )}

          {/* Passagens e voos */}
          {showPassagens && (
            <PDSection title="Passagens e voos" icon={<Plane className="size-4" />} tone="sky">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <PDInfoTile icon={<Calendar className="size-3.5" />} label="Data de ida" value={s.idaDate} />
                <PDInfoTile icon={<Calendar className="size-3.5" />} label="Data de volta" value={s.voltaDate} />
                <PDInfoTile icon={<Globe className="size-3.5" />} label="Internacional" value={s.international === true ? "Sim" : s.international === false ? "Não" : null} />
                <PDInfoTile icon={<Bus className="size-3.5" />} label="Tipo de transporte" value={TRANSPORT_LABEL[s.transportType] ?? s.transportType} />
                <PDInfoTile icon={<Luggage className="size-3.5" />} label="Franquia de bagagem" value={s.includeBaggage === true ? "Sim" : s.includeBaggage === false ? "Não" : null} />
                {isInternational && (
                  <>
                    <PDInfoTile icon={<ShieldAlert className="size-3.5" />} label="Seguro viagem" value={s.travelInsurance === true ? "Sim" : s.travelInsurance === false ? "Não" : null} />
                    <PDInfoTile icon={<IdCard className="size-3.5" />} label="Passaporte" value={s.passportNumberIntl} />
                  </>
                )}
                {needsInsurance && (
                  <>
                    <PDInfoTile icon={<User2 className="size-3.5" />} label="Contato de emergência — nome" value={s.emergencyContactName} />
                    <PDInfoTile icon={<Phone className="size-3.5" />} label="Contato de emergência — telefone" value={s.emergencyContactPhone} />
                    <PDInfoTile icon={<MapPin className="size-3.5" />} label="Contato de emergência — endereço" value={s.emergencyContactAddress} />
                  </>
                )}
              </div>
            </PDSection>
          )}

          {/* Restrições e preferências */}
          {showPassagens && (s.flightRestriction !== null || s.preferredTimes || s.flightPreference !== null) && (
            <PDSection title="Restrições e preferências" icon={<ShieldAlert className="size-4" />} tone="violet">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <PDInfoTile icon={<ShieldAlert className="size-3.5" />} label="Restrição de voo" value={s.flightRestriction === true ? "Sim" : s.flightRestriction === false ? "Não" : null} />
                <PDInfoTile icon={<Clock className="size-3.5" />} label="Horários preferidos" value={s.preferredTimes} />
                <PDInfoTile icon={<Plane className="size-3.5" />} label="Preferência de companhia aérea" value={s.flightPreference === true ? "Sim" : s.flightPreference === false ? "Não" : null} />
              </div>
            </PDSection>
          )}

          {/* Anexos */}
          {(s.passportFile || s.pesquisaFile) && (
            <PDSection title="Anexos" icon={<Paperclip className="size-4" />} tone="gray">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {s.passportFile && (
                  <PDFileTile label="Imagem do passaporte" file={s.passportFile} />
                )}
                {s.pesquisaFile && (
                  <PDFileTile label="Pesquisa de voos" file={s.pesquisaFile} />
                )}
              </div>
            </PDSection>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CorrigirSolicitacaoDialog({
  submission,
  onClose,
  onResend,
}: {
  submission: any;
  onClose: () => void;
  onResend: (updated: any) => void;
}) {
  // Identificação
  const [demandProject, setDemandProject] = useState(submission.demandProject ?? "");
  const [projectLinked, setProjectLinked] = useState(submission.projectLinked ?? "GESTÃO CEIA: CONTA FUNDO LOCAL");
  const [passengerName, setPassengerName] = useState(submission.passengerName ?? "");
  const [passengerEmail, setPassengerEmail] = useState(submission.passengerEmail ?? "");
  const [passengerPhone, setPassengerPhone] = useState(submission.passengerPhone ?? "");
  const [passengerRG, setPassengerRG] = useState(submission.passengerRG ?? "");
  const [passengerCPF, setPassengerCPF] = useState(submission.passengerCPF ?? "");
  const [passengerDOB, setPassengerDOB] = useState(submission.passengerDOB ?? "");
  const [paymentConfirmation, setPaymentConfirmation] = useState<boolean>(submission.paymentConfirmation ?? false);

  // Objetivo
  const [tripPurpose, setTripPurpose] = useState(submission.tripPurpose ?? "");
  const [observation, setObservation] = useState(submission.observation ?? "");
  const [activitiesDesc, setActivitiesDesc] = useState(submission.activitiesDesc ?? "");
  const [justification, setJustification] = useState(submission.justification ?? "NÃO SE APLICA");

  // Missão e destino
  const [localPartida, setLocalPartida] = useState(submission.localPartida ?? "");
  const [localChegada, setLocalChegada] = useState(submission.localChegada ?? "");
  const [missionStart, setMissionStart] = useState(submission.missionStart ?? "");
  const [missionEnd, setMissionEnd] = useState(submission.missionEnd ?? "");
  const [expenseType, setExpenseType] = useState(submission.expenseType ?? "");
  const [expenseTypeOther, setExpenseTypeOther] = useState(submission.expenseTypeOther ?? "");
  const [requestKind, setRequestKind] = useState(submission.requestKind ?? "passagens_e_diarias");

  // Diárias
  const [diariaCount, setDiariaCount] = useState(submission.diariaCount ?? "");
  const [includeDesloc, setIncludeDesloc] = useState<boolean | null>(submission.includeDesloc ?? null);

  // Passagens e voos
  const [idaDate, setIdaDate] = useState(submission.idaDate ?? "");
  const [voltaDate, setVoltaDate] = useState(submission.voltaDate ?? "");
  const [international, setInternational] = useState<boolean | null>(submission.international ?? null);
  const [travelInsurance, setTravelInsurance] = useState<boolean | null>(submission.travelInsurance ?? null);
  const [transportType, setTransportType] = useState(submission.transportType ?? "");
  const [includeBaggage, setIncludeBaggage] = useState<boolean | null>(submission.includeBaggage ?? null);
  const [passportNumberIntl, setPassportNumberIntl] = useState(submission.passportNumberIntl ?? "");
  const [emergencyContactName, setEmergencyContactName] = useState(submission.emergencyContactName ?? "");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(submission.emergencyContactPhone ?? "");
  const [emergencyContactAddress, setEmergencyContactAddress] = useState(submission.emergencyContactAddress ?? "");

  // Restrições e preferências
  const [flightRestriction, setFlightRestriction] = useState<boolean | null>(submission.flightRestriction ?? null);
  const [preferredTimes, setPreferredTimes] = useState(submission.preferredTimes ?? "");
  const [flightPreference, setFlightPreference] = useState<boolean | null>(submission.flightPreference ?? null);

  // Anexos (mantidos do envio anterior; usuário pode substituir)
  const [passportFile, setPassportFile] = useState<File | { name: string; size?: number } | null>(submission.passportFile ?? null);
  const [pesquisaFile, setPesquisaFile] = useState<File | { name: string; size?: number } | null>(submission.pesquisaFile ?? null);

  const needsDiarias = requestKind !== "apenas_passagens";
  const needsFlights = requestKind !== "apenas_diarias";

  const canSubmit =
    projectLinked.trim() !== "" &&
    tripPurpose.trim() !== "" &&
    passengerName.trim() !== "" &&
    passengerEmail.trim() !== "" &&
    passengerPhone.trim() !== "" &&
    passengerRG.trim() !== "" &&
    passengerCPF.trim() !== "" &&
    passengerDOB.trim() !== "" &&
    paymentConfirmation === true &&
    localPartida.trim() !== "" &&
    localChegada.trim() !== "" &&
    missionStart.trim() !== "" &&
    missionEnd.trim() !== "" &&
    expenseType.trim() !== "" &&
    (expenseType !== "outra" || expenseTypeOther.trim() !== "") &&
    activitiesDesc.trim() !== "" &&
    justification.trim() !== "" &&
    (!needsDiarias || includeDesloc !== null) &&
    (!needsFlights || (idaDate.trim() !== "" && voltaDate.trim() !== ""));

  function handleResend() {
    onResend({
      demandProject,
      projectLinked,
      tripPurpose,
      passengerName,
      passengerEmail,
      passengerPhone,
      passengerRG,
      passengerCPF,
      passengerDOB,
      paymentConfirmation,
      localPartida,
      localChegada,
      missionStart,
      missionEnd,
      expenseType,
      expenseTypeOther,
      requestKind,
      diariaCount,
      includeDesloc,
      idaDate,
      voltaDate,
      international,
      travelInsurance,
      transportType,
      includeBaggage,
      passportNumberIntl,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactAddress,
      flightRestriction,
      preferredTimes,
      flightPreference,
      activitiesDesc,
      justification,
      observation,
      passportFile,
      pesquisaFile,
    });
  }

  const yesNoBtn = (active: boolean) =>
    active
      ? "w-full rounded-lg border px-3 py-2 bg-primary text-primary-foreground border-transparent transition-colors duration-150 hover:opacity-95"
      : "w-full rounded-lg border px-3 py-2 bg-gray-100 text-black hover:bg-gray-200 hover:border-gray-200 transition-colors duration-150";

  return (
    <Dialog open={true} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto p-0">
        <div className="sticky top-0 bg-background z-10 px-6 pt-6 pb-4 border-b flex items-start justify-between gap-4">
          <DialogHeader className="flex-1 min-w-0">
            <DialogTitle className="inline-flex items-center gap-2">
              <AlertTriangle className="size-5 text-orange-600" /> Corrigir solicitação
            </DialogTitle>
            <DialogDescription>
              Ajuste os dados conforme a orientação do corretor e clique em <span className="font-semibold">Reenviar</span> para que a solicitação volte para análise.
            </DialogDescription>
          </DialogHeader>
          <button
            onClick={onClose}
            className="size-8 rounded-md inline-flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground transition-colors shrink-0"
            aria-label="Fechar"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="px-6 pb-6 pt-4 space-y-5">
          {/* Banner com motivo da correção */}
          {submission._corretorComment && (
            <div className="rounded-xl border border-orange-200 bg-orange-50/70 p-4">
              <div className="flex items-start gap-3">
                <div className="size-9 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
                  <MessageSquare className="size-4" />
                </div>
                <div className="text-sm flex-1 min-w-0">
                  <div className="font-semibold text-orange-900">Motivo da devolução pelo corretor</div>
                  <p className="mt-1 text-orange-900 leading-relaxed whitespace-pre-line">{submission._corretorComment}</p>
                </div>
              </div>
            </div>
          )}

          {/* Identificação */}
          <section className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-base font-semibold mb-4 text-foreground"><User2 className="size-4 text-primary" /> Identificação e destino</div>
            <div className="grid gap-6">
              <label>
                <div className="text-sm font-medium">Qual projeto gerou a demanda?</div>
                <select value={demandProject} onChange={(e) => setDemandProject(e.target.value)} className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground select-arrow">
                  <option value="">Selecione</option>
                  {PROJECTS.filter((p: any) => p.status === "em_execucao").map((p: any) => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </label>
              <label>
                <div className="text-sm font-medium">Projeto que arcará com os custos <span className="text-red-500 ml-1">*</span></div>
                <select value={projectLinked} onChange={(e) => setProjectLinked(e.target.value)} className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground select-arrow" required>
                  <option>GESTÃO CEIA: CONTA FUNDO LOCAL</option>
                  {PROJECTS.map((p: any) => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </label>

              <div className="grid sm:grid-cols-3 gap-3">
                <label>
                  <div className="text-sm font-medium">Nome do passageiro <span className="text-red-500 ml-1">*</span></div>
                  <input value={passengerName} readOnly className="mt-2 w-full rounded-lg border px-3 py-2 bg-gray-50 text-foreground cursor-not-allowed" required />
                </label>
                <label>
                  <div className="text-sm font-medium">E-mail do passageiro <span className="text-red-500 ml-1">*</span></div>
                  <input value={passengerEmail} readOnly className="mt-2 w-full rounded-lg border px-3 py-2 bg-gray-50 text-foreground cursor-not-allowed" required />
                </label>
                <label>
                  <div className="text-sm font-medium">Telefone <span className="text-red-500 ml-1">*</span></div>
                  <input value={passengerPhone} readOnly className="mt-2 w-full rounded-lg border px-3 py-2 bg-gray-50 text-foreground cursor-not-allowed" required />
                </label>
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                <label>
                  <div className="text-sm font-medium">RG <span className="text-red-500 ml-1">*</span></div>
                  <input value={passengerRG} readOnly className="mt-2 w-full rounded-lg border px-3 py-2 bg-gray-50 text-foreground cursor-not-allowed" required />
                </label>
                <label>
                  <div className="text-sm font-medium">CPF <span className="text-red-500 ml-1">*</span></div>
                  <input value={passengerCPF} readOnly className="mt-2 w-full rounded-lg border px-3 py-2 bg-gray-50 text-foreground cursor-not-allowed" required />
                </label>
                <label>
                  <div className="text-sm font-medium">Data de nascimento <span className="text-red-500 ml-1">*</span></div>
                  <div className="relative mt-2">
                    <Calendar className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input value={passengerDOB} readOnly placeholder="DD/MM/AAAA" inputMode="numeric" maxLength={10} className="w-full rounded-lg border pl-10 pr-3 py-2 bg-gray-50 text-foreground cursor-not-allowed" required />
                  </div>
                </label>
              </div>

              <label>
                <div className="text-sm font-medium">Confirmação de Pagamento <span className="text-red-500 ml-1">*</span></div>
                <div className="mt-2 text-sm">
                  <label className="inline-flex items-baseline gap-2">
                    <input type="checkbox" checked={paymentConfirmation} onChange={(e) => setPaymentConfirmation(e.target.checked)} required />
                    <span>Declaro estar ciente de que o pagamento será realizado exclusivamente via transferência PIX, utilizando como chave o CPF informado nesta solicitação.</span>
                  </label>
                </div>
              </label>
            </div>
          </section>

          {/* Objetivo */}
          <section className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-base font-semibold mb-4 text-foreground"><Briefcase className="size-4 text-primary" /> Objetivo da viagem</div>
            <div className="grid gap-6">
              <label>
                <div className="text-sm font-medium">Motivo da viagem <span className="text-red-500 ml-1">*</span></div>
                <select value={tripPurpose} onChange={(e) => setTripPurpose(e.target.value)} className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground select-arrow" required>
                  <option value="">Selecione</option>
                  <option value="participacao_congresso">Participação em congresso acadêmico</option>
                  <option value="apresentacao_trabalhos">Apresentação de trabalhos</option>
                  <option value="participacao_eventos">Participação em eventos</option>
                  <option value="prospeccao">Prospecção</option>
                  <option value="kickoff_projeto">Kickoff de projeto</option>
                  <option value="macroentrega">Macroentrega</option>
                  <option value="encerramento">Encerramento de projeto</option>
                </select>
              </label>
              <label>
                <div className="text-sm font-medium">Observação importante ou comentário</div>
                <input value={observation} onChange={(e) => setObservation(e.target.value)} className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground" />
              </label>
              <label>
                <div className="text-sm font-medium">Descrição das atividades a serem executadas <span className="text-red-500 ml-1">*</span></div>
                <textarea value={activitiesDesc} onChange={(e) => setActivitiesDesc(e.target.value)} rows={4} className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground" required />
              </label>
              <label>
                <div className="text-sm font-medium">Justificativa para solicitação com menos de 20 dias <span className="text-red-500 ml-1">*</span></div>
                <input value={justification} onChange={(e) => setJustification(e.target.value)} className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground" required />
              </label>
            </div>
          </section>

          {/* Missão e destino */}
          <section className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-base font-semibold mb-4 text-foreground"><MapPin className="size-4 text-primary" /> Definição da missão e do destino</div>
            <div className="grid gap-6">
              <div className="grid sm:grid-cols-2 gap-3">
                <label>
                  <div className="text-sm font-medium">Local de partida <span className="text-red-500 ml-1">*</span></div>
                  <input value={localPartida} onChange={(e) => setLocalPartida(e.target.value)} className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground" required />
                </label>
                <label>
                  <div className="text-sm font-medium">Local de chegada <span className="text-red-500 ml-1">*</span></div>
                  <input value={localChegada} onChange={(e) => setLocalChegada(e.target.value)} className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground" required />
                </label>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <label>
                  <div className="text-sm font-medium">Início da missão/evento <span className="text-red-500 ml-1">*</span></div>
                  <div className="relative mt-2">
                    <Calendar className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input value={missionStart} onChange={(e) => setMissionStart(formatDateDDMMYYYY(e.target.value))} placeholder="DD/MM/AAAA" inputMode="numeric" maxLength={10} className="w-full rounded-lg border pl-10 pr-3 py-2 bg-white text-foreground" required />
                  </div>
                </label>
                <label>
                  <div className="text-sm font-medium">Término da missão/evento <span className="text-red-500 ml-1">*</span></div>
                  <div className="relative mt-2">
                    <Calendar className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input value={missionEnd} onChange={(e) => setMissionEnd(formatDateDDMMYYYY(e.target.value))} placeholder="DD/MM/AAAA" inputMode="numeric" maxLength={10} className="w-full rounded-lg border pl-10 pr-3 py-2 bg-white text-foreground" required />
                  </div>
                </label>
              </div>
              <label>
                <div className="text-sm font-medium">Tipo da solicitação <span className="text-red-500 ml-1">*</span></div>
                <select value={requestKind} onChange={(e) => setRequestKind(e.target.value)} className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground select-arrow" required>
                  <option value="passagens_e_diarias">Passagens e Diárias</option>
                  <option value="apenas_passagens">Apenas Passagens</option>
                  <option value="apenas_diarias">Apenas Diárias</option>
                </select>
              </label>
            </div>
          </section>

          {/* Diárias */}
          {needsDiarias && (
            <section className="rounded-xl border bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 text-base font-semibold mb-4 text-foreground"><Clock className="size-4 text-primary" /> Diárias</div>
              <div className="grid gap-6">
                <label>
                  <div className="text-sm font-medium">Estime a quantidade de diárias</div>
                  <input value={diariaCount} onChange={(e) => setDiariaCount(e.target.value)} placeholder="Quantidade" className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground" />
                </label>
                <div>
                  <div className="text-sm font-medium">Incluir adicional de deslocamento? <span className="text-red-500 ml-1">*</span></div>
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    <button type="button" className={yesNoBtn(includeDesloc === true)} onClick={() => setIncludeDesloc(true)}>Sim</button>
                    <button type="button" className={yesNoBtn(includeDesloc === false)} onClick={() => setIncludeDesloc(false)}>Não</button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Passagens e voos */}
          {needsFlights && (
            <section className="rounded-xl border bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 text-base font-semibold mb-4 text-foreground"><Plane className="size-4 text-primary" /> Passagens e voos</div>
              <div className="grid gap-6">
                <div className="grid sm:grid-cols-2 gap-3">
                  <label>
                    <div className="text-sm font-medium">Data de Ida <span className="text-red-500 ml-1">*</span></div>
                    <div className="relative mt-2">
                      <Calendar className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input value={idaDate} onChange={(e) => setIdaDate(formatDateDDMMYYYY(e.target.value))} placeholder="DD/MM/AAAA" inputMode="numeric" maxLength={10} className="w-full rounded-lg border pl-10 pr-3 py-2 bg-white text-foreground" required />
                    </div>
                  </label>
                  <label>
                    <div className="text-sm font-medium">Data de Volta <span className="text-red-500 ml-1">*</span></div>
                    <div className="relative mt-2">
                      <Calendar className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input value={voltaDate} onChange={(e) => setVoltaDate(formatDateDDMMYYYY(e.target.value))} placeholder="DD/MM/AAAA" inputMode="numeric" maxLength={10} className="w-full rounded-lg border pl-10 pr-3 py-2 bg-white text-foreground" required />
                    </div>
                  </label>
                </div>

                <div>
                  <div className="text-sm font-medium">Sua viagem é internacional?</div>
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    <button type="button" className={yesNoBtn(international === true)} onClick={() => setInternational(true)}>Sim</button>
                    <button type="button" className={yesNoBtn(international === false)} onClick={() => setInternational(false)}>Não</button>
                  </div>
                </div>

                {international === true && (
                  <div className="grid gap-6">
                    <label>
                      <div className="text-sm font-medium">Número do passaporte <span className="text-red-500 ml-1">*</span></div>
                      <input value={passportNumberIntl} onChange={(e) => setPassportNumberIntl(e.target.value)} className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground" required />
                    </label>
                    <label>
                      <div className="text-sm font-medium">Envio da imagem do passaporte <span className="text-red-500 ml-1">*</span></div>
                      <div className="text-xs text-muted-foreground mt-1">O arquivo deve ser nomeado como: Passaporte</div>
                      <div className="mt-2">
                        <FileAttachInput
                          file={passportFile as any}
                          onChange={(f) => setPassportFile(f)}
                          accept="image/*,application/pdf"
                          hint="Envie a imagem do passaporte do passageiro (JPG, PNG ou PDF)."
                          buttonLabel="Anexar imagem do passaporte"
                          required
                        />
                      </div>
                    </label>
                    <div>
                      <div className="text-sm font-medium">Irá precisar de seguro viagem? <span className="text-red-500 ml-1">*</span></div>
                      <div className="mt-2 grid grid-cols-2 gap-3">
                        <button type="button" className={yesNoBtn(travelInsurance === true)} onClick={() => setTravelInsurance(true)}>Sim</button>
                        <button type="button" className={yesNoBtn(travelInsurance === false)} onClick={() => setTravelInsurance(false)}>Não</button>
                      </div>
                    </div>
                    {travelInsurance === true && (
                      <div className="grid gap-6">
                        <label>
                          <div className="text-sm font-medium">Nome do contato de emergência <span className="text-red-500 ml-1">*</span></div>
                          <input value={emergencyContactName} onChange={(e) => setEmergencyContactName(e.target.value)} className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground" />
                        </label>
                        <label>
                          <div className="text-sm font-medium">Telefone do contato de emergência <span className="text-red-500 ml-1">*</span></div>
                          <input value={emergencyContactPhone} onChange={(e) => setEmergencyContactPhone(e.target.value)} className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground" />
                        </label>
                        <label>
                          <div className="text-sm font-medium">Endereço com CEP do contato de emergência <span className="text-red-500 ml-1">*</span></div>
                          <input value={emergencyContactAddress} onChange={(e) => setEmergencyContactAddress(e.target.value)} className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground" />
                        </label>
                      </div>
                    )}
                  </div>
                )}

                {(international === true || international === false) && (
                  <>
                    <label>
                      <div className="text-sm font-medium">Tipo de Transporte <span className="text-red-500 ml-1">*</span></div>
                      <select value={transportType} onChange={(e) => setTransportType(e.target.value)} className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground select-arrow" required>
                        <option value="">Selecionar sua resposta</option>
                        <option value="aereo">Aéreo</option>
                        <option value="aereo_rodoviario">Aéreo e rodoviário</option>
                        <option value="rodoviario">Rodoviário</option>
                        <option value="carro_proprio">Carro próprio</option>
                      </select>
                    </label>

                    <div>
                      <div className="text-sm font-medium">Incluir franquia de bagagem? <span className="text-red-500 ml-1">*</span></div>
                      <div className="mt-2 grid grid-cols-2 gap-3">
                        <button type="button" className={yesNoBtn(includeBaggage === true)} onClick={() => setIncludeBaggage(true)}>Sim</button>
                        <button type="button" className={yesNoBtn(includeBaggage === false)} onClick={() => setIncludeBaggage(false)}>Não</button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </section>
          )}

          {/* Restrições e preferências */}
          <section className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-base font-semibold mb-4 text-foreground"><Settings className="size-4 text-primary" /> Restrições e preferências</div>
            <div className="grid gap-6">
              <div>
                <div className="text-sm font-medium">Possui restrição de Voo? <span className="text-red-500 ml-1">*</span></div>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <button type="button" className={yesNoBtn(flightRestriction === true)} onClick={() => setFlightRestriction(true)}>Sim</button>
                  <button type="button" className={yesNoBtn(flightRestriction === false)} onClick={() => setFlightRestriction(false)}>Não</button>
                </div>
              </div>
              {flightRestriction === true && (
                <label>
                  <div className="text-sm font-medium">Informe os horários preferenciais <span className="text-red-500 ml-1">*</span></div>
                  <input value={preferredTimes} onChange={(e) => setPreferredTimes(e.target.value)} className="mt-2 w-full rounded-lg border px-3 py-2 bg-white text-foreground" />
                </label>
              )}
              {(flightRestriction === true || flightRestriction === false) && (
                <div>
                  <div className="text-sm font-medium">Possui preferência de voo? <span className="text-red-500 ml-1">*</span></div>
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    <button type="button" className={yesNoBtn(flightPreference === true)} onClick={() => setFlightPreference(true)}>Sim</button>
                    <button type="button" className={yesNoBtn(flightPreference === false)} onClick={() => setFlightPreference(false)}>Não</button>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">Se tiver preferência, deverá adicionar sugestão de voos.</div>
                </div>
              )}
              {flightPreference === true && (
                <label>
                  <div className="text-sm font-medium">Por favor, anexe o arquivo com a pesquisa, contendo: data, companhia aérea, horário e valor do voo. <span className="text-red-500 ml-1">*</span></div>
                  <div className="text-xs text-muted-foreground mt-1">O arquivo deve ser nomeado como: Pesquisa.pdf</div>
                  <div className="mt-2">
                    <FileAttachInput
                      file={pesquisaFile as any}
                      onChange={(f) => setPesquisaFile(f)}
                      accept="image/jpeg,image/png,application/pdf"
                      hint="Anexe o arquivo da pesquisa (JPG, PNG ou PDF) (data, companhia, horário e valor do voo)."
                      buttonLabel="Anexar arquivo da pesquisa"
                      required
                    />
                  </div>
                </label>
              )}
            </div>
          </section>
        </div>

        <div className="sticky bottom-0 bg-background border-t px-6 py-4 flex flex-col sm:flex-row gap-2 justify-end">
          <button onClick={onClose} className="inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold hover:bg-accent transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleResend}
            disabled={!canSubmit}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <Send className="size-4" /> Reenviar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export type ApprovalStatus = "pendente" | "aprovado" | "rejeitado" | "em_correcao" | "aprovado_corretor";
export type ApprovalKind = "passagens" | "diarias" | "passagens_e_diarias";
type TripPurpose = "congressos" | "evento" | "reuniao_cliente";

export type ApprovalItem = {
  id: string;
  solicitante: string;
  email: string;
  projetoSolicitado?: string;
  projetoCustos: string;
  tipo: ApprovalKind;
  motivoViagem?: TripPurpose;
  dataSolicitacao: string;
  status: ApprovalStatus;
  cadastradoNoPortal: boolean;
  vinculadoAoProjeto: boolean;
  origem: string;
  destino: string;
  periodo: string;
  tipoDespesa: string;
  atividades: string;
  justificativa: string;
  anexos: string[];
  // Comentário do corretor quando solicitar correção.
  corretorComment?: string;
  // Corretor responsável pela aprovação. Toda solicitação que chega ao coordenador
  // obrigatoriamente já passou pelo corretor.
  corretorAprovador: string;
  // Dados opcionais derivados do formulário
  rg?: string;
  cpf?: string;
  dataNascimento?: string;
  telefone?: string;
  diariaCount?: string;
  idaDate?: string;
  voltaDate?: string;
  internacional?: boolean;
  transporte?: string;
  bagagem?: boolean;
  seguroViagem?: boolean;
  contatoEmergenciaNome?: string;
  contatoEmergenciaTelefone?: string;
  observacao?: string;
};

export const APPROVALS_MOCK: ApprovalItem[] = [
  {
    id: "REQ-2026-0142",
    solicitante: "Carlos Eduardo Almeida",
    email: "carlos.almeida@ceia.ufg.br",
    projetoSolicitado: "Sistema de Navegação Autônoma para VANTs",
    projetoCustos: "GESTÃO CEIA: CONTA FUNDO LOCAL",
    tipo: "passagens_e_diarias",
    motivoViagem: "congressos",
    dataSolicitacao: "02/05/2026",
    status: "pendente",
    cadastradoNoPortal: true,
    vinculadoAoProjeto: false,
    origem: "Goiânia - GO",
    destino: "São Paulo - SP",
    periodo: "12/05/2026 — 15/05/2026",
    tipoDespesa: "Pessoal da equipe de PD&I",
    atividades: "Apresentação de artigo no workshop de IA aplicada à indústria 4.0 e participação em painéis técnicos.",
    justificativa: "Carta de aceite recebida com prazo inferior a 20 dias.",
    anexos: ["Carta_Aceite.pdf", "Programacao_Evento.pdf"],
    rg: "3.456.789 SSP-GO",
    cpf: "123.456.789-00",
    dataNascimento: "15/03/1985",
    telefone: "(62) 98123-4567",
    diariaCount: "3",
    idaDate: "12/05/2026",
    voltaDate: "15/05/2026",
    internacional: false,
    transporte: "Aéreo",
    bagagem: true,
    seguroViagem: false,
    contatoEmergenciaNome: "Juliana Almeida",
    contatoEmergenciaTelefone: "(62) 99888-7766",
    observacao: "Preferência por voos diretos no período da manhã.",
    corretorAprovador: "Daniel Pacheco",
  },
  {
    id: "REQ-2026-0141",
    solicitante: "Mariana Costa Ribeiro",
    email: "mariana.ribeiro@ceia.ufg.br",
    projetoSolicitado: "IA para Detecção de Plágio Acadêmico",
    projetoCustos: "IA para Detecção de Plágio Acadêmico",
    tipo: "diarias",
    motivoViagem: "reuniao_cliente",
    dataSolicitacao: "01/05/2026",
    status: "pendente",
    cadastradoNoPortal: true,
    vinculadoAoProjeto: false,
    origem: "Anápolis - GO",
    destino: "Goiânia - GO",
    periodo: "08/05/2026 — 09/05/2026",
    tipoDespesa: "Pessoal da Unidade EMBRAPII-CEIA",
    atividades: "Reunião técnica com equipe parceira para alinhamento do entregável Q2.",
    justificativa: "NÃO SE APLICA",
    anexos: ["Convocacao.pdf"],
    rg: "4.789.012 SSP-GO",
    cpf: "234.567.890-11",
    dataNascimento: "22/07/1990",
    telefone: "(62) 98765-4321",
    diariaCount: "2",
    transporte: "Próprio",
    contatoEmergenciaNome: "Carlos Ribeiro",
    contatoEmergenciaTelefone: "(62) 99777-1122",
    observacao: "",
    corretorAprovador: "Daniel Pacheco",
  },
  {
    id: "REQ-2026-0138",
    solicitante: "João Pedro Souza",
    email: "joao.souza@externo.com",
    projetoSolicitado: "Plataforma Wave Testing",
    projetoCustos: "GESTÃO CEIA: CONTA FUNDO LOCAL",
    tipo: "passagens",
    motivoViagem: "evento",
    dataSolicitacao: "29/04/2026",
    status: "pendente",
    cadastradoNoPortal: false,
    vinculadoAoProjeto: false,
    origem: "Goiânia - GO",
    destino: "Rio de Janeiro - RJ",
    periodo: "20/05/2026 — 22/05/2026",
    tipoDespesa: "Outra",
    atividades: "Visita técnica a laboratório parceiro para coleta de dados experimentais.",
    justificativa: "NÃO SE APLICA",
    anexos: [],
    cpf: "345.678.901-22",
    telefone: "(21) 97654-3210",
    idaDate: "20/05/2026",
    voltaDate: "22/05/2026",
    internacional: false,
    transporte: "Aéreo",
    bagagem: false,
    seguroViagem: false,
    corretorAprovador: "Daniel Pacheco",
  },
  {
    id: "REQ-2026-0130",
    solicitante: "Ana Beatriz Lima",
    email: "ana.lima@ceia.ufg.br",
    projetoSolicitado: "Portal CEIA — Gestão de Projetos",
    projetoCustos: "Portal CEIA — Gestão de Projetos",
    tipo: "passagens_e_diarias",
    dataSolicitacao: "22/04/2026",
    status: "aprovado",
    cadastradoNoPortal: true,
    vinculadoAoProjeto: true,
    origem: "Goiânia - GO",
    destino: "Brasília - DF",
    periodo: "28/04/2026 — 30/04/2026",
    tipoDespesa: "Pessoal da equipe de PD&I",
    atividades: "Reunião com órgão de fomento.",
    justificativa: "NÃO SE APLICA",
    anexos: ["Oficio_Convite.pdf"],
    corretorAprovador: "Daniel Pacheco",
  },
  {
    id: "REQ-2026-0125",
    solicitante: "Rafael Mendes",
    email: "rafael.mendes@ceia.ufg.br",
    projetoSolicitado: "Análise de Imagens Médicas com Deep Learning",
    projetoCustos: "GESTÃO CEIA: CONTA FUNDO LOCAL",
    tipo: "diarias",
    dataSolicitacao: "18/04/2026",
    status: "rejeitado",
    cadastradoNoPortal: true,
    vinculadoAoProjeto: true,
    origem: "Goiânia - GO",
    destino: "Anápolis - GO",
    periodo: "20/04/2026 — 21/04/2026",
    tipoDespesa: "Pessoal da equipe de PD&I",
    atividades: "Visita técnica.",
    justificativa: "NÃO SE APLICA",
    anexos: [],
    corretorAprovador: "Daniel Pacheco",
  },
  {
    id: "REQ-2026-0143",
    solicitante: "Beatriz Nogueira",
    email: "beatriz.nogueira@ceia.ufg.br",
    projetoCustos: "GESTÃO CEIA: CONTA FUNDO LOCAL",
    tipo: "passagens",
    motivoViagem: "congressos",
    dataSolicitacao: "02/05/2026",
    status: "pendente",
    cadastradoNoPortal: false,
    vinculadoAoProjeto: false,
    origem: "Goiânia - GO",
    destino: "Recife - PE",
    periodo: "18/05/2026 — 21/05/2026",
    tipoDespesa: "Pessoal da equipe de PD&I",
    atividades: "Apresentação de pôster no congresso BRACIS 2026.",
    justificativa: "NÃO SE APLICA",
    anexos: ["Carta_Aceite.pdf"],
    cpf: "456.789.012-33",
    telefone: "(62) 98222-1234",
    idaDate: "18/05/2026",
    voltaDate: "21/05/2026",
    internacional: false,
    transporte: "Aéreo",
    bagagem: true,
    seguroViagem: false,
    corretorAprovador: "Daniel Pacheco",
  },
  {
    id: "REQ-2026-0144",
    solicitante: "Thiago Reis",
    email: "thiago.reis@ceia.ufg.br",
    projetoSolicitado: "Portal CEIA — Gestão de Projetos",
    projetoCustos: "Portal CEIA — Gestão de Projetos",
    tipo: "diarias",
    motivoViagem: "congressos",
    dataSolicitacao: "02/05/2026",
    status: "pendente",
    cadastradoNoPortal: true,
    vinculadoAoProjeto: true,
    origem: "Goiânia - GO",
    destino: "Brasília - DF",
    periodo: "10/05/2026 — 11/05/2026",
    tipoDespesa: "Pessoal da equipe de PD&I",
    atividades: "Reunião com equipe de governança digital.",
    justificativa: "NÃO SE APLICA",
    anexos: [],
    diariaCount: "2",
    transporte: "Próprio",
    corretorAprovador: "Daniel Pacheco",
  },
  {
    id: "REQ-2026-0131",
    solicitante: "Patrícia Veloso",
    email: "patricia.veloso@ceia.ufg.br",
    projetoSolicitado: "Sistema de Navegação Autônoma para VANTs",
    projetoCustos: "Sistema de Navegação Autônoma para VANTs",
    tipo: "passagens_e_diarias",
    motivoViagem: "congressos",
    dataSolicitacao: "22/04/2026",
    status: "aprovado",
    cadastradoNoPortal: true,
    vinculadoAoProjeto: true,
    origem: "Goiânia - GO",
    destino: "Florianópolis - SC",
    periodo: "05/05/2026 — 08/05/2026",
    tipoDespesa: "Pessoal da equipe de PD&I",
    atividades: "Visita à empresa parceira para validação do protótipo.",
    justificativa: "NÃO SE APLICA",
    anexos: ["Agenda_Visita.pdf"],
    corretorAprovador: "Daniel Pacheco",
  },
  {
    id: "REQ-2026-0145",
    solicitante: "Lucas Andrade",
    email: "lucas.andrade@ceia.ufg.br",
    projetoSolicitado: "Análise de Imagens Médicas com Deep Learning",
    projetoCustos: "GESTÃO CEIA: CONTA FUNDO LOCAL",
    tipo: "passagens_e_diarias",
    motivoViagem: "congressos",
    dataSolicitacao: "03/05/2026",
    status: "em_correcao",
    cadastradoNoPortal: true,
    vinculadoAoProjeto: true,
    origem: "Goiânia - GO",
    destino: "Salvador - BA",
    periodo: "25/05/2026 — 28/05/2026",
    tipoDespesa: "Pessoal da equipe de PD&I",
    atividades: "Apresentação de paper no congresso ENIAC 2026.",
    justificativa: "NÃO SE APLICA",
    anexos: ["Carta_Aceite.pdf"],
    corretorComment: "Anexar comprovante de inscrição no congresso e atualizar o nome do evento exatamente como está na carta de aceite.",
    cpf: "567.890.123-44",
    telefone: "(62) 98111-2233",
    idaDate: "25/05/2026",
    voltaDate: "28/05/2026",
    internacional: false,
    transporte: "Aéreo",
    bagagem: true,
    seguroViagem: false,
    corretorAprovador: "Daniel Pacheco",
  },
  {
    id: "REQ-2026-0146",
    solicitante: "Helena Barros",
    email: "helena.barros@ceia.ufg.br",
    projetoSolicitado: "Portal CEIA — Gestão de Projetos",
    projetoCustos: "GESTÃO CEIA: CONTA FUNDO LOCAL",
    tipo: "passagens_e_diarias",
    motivoViagem: "congressos",
    dataSolicitacao: "30/04/2026",
    status: "aprovado_corretor",
    cadastradoNoPortal: true,
    vinculadoAoProjeto: true,
    origem: "Goiânia - GO",
    destino: "Curitiba - PR",
    periodo: "12/06/2026 — 15/06/2026",
    tipoDespesa: "Pessoal da equipe de PD&I",
    atividades: "Apresentação no SBSC 2026.",
    justificativa: "NÃO SE APLICA",
    anexos: ["Carta_Aceite.pdf", "Programa.pdf"],
    cpf: "678.901.234-55",
    telefone: "(62) 98777-6655",
    idaDate: "12/06/2026",
    voltaDate: "15/06/2026",
    internacional: false,
    transporte: "Aéreo",
    bagagem: true,
    seguroViagem: false,
    corretorAprovador: "Daniel Pacheco",
  },
];

function TipoBadge({ tipo }: { tipo: ApprovalKind; emphasized?: boolean }) {
  if (tipo === "passagens_e_diarias") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-200 px-2.5 py-1 text-xs font-semibold">
        <Luggage className="size-3.5" /> Passagens e Diárias
      </span>
    );
  }
  if (tipo === "passagens") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-sky-100 text-sky-800 border border-sky-200 px-2.5 py-1 text-xs font-semibold">
        <Plane className="size-3.5" /> Passagens
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-violet-100 text-violet-800 border border-violet-200 px-2.5 py-1 text-xs font-semibold">
      <Clock className="size-3.5" /> Diárias
    </span>
  );
}

function StatusBadge({ status }: { status: ApprovalStatus }) {
  if (status === "pendente") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-1 text-xs font-semibold">
        <AlertCircle className="size-3.5" /> Pendente
      </span>
    );
  }
  if (status === "aprovado") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-1 text-xs font-semibold">
        <CheckCircle2 className="size-3.5" /> Aprovado
      </span>
    );
  }
  if (status === "em_correcao") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 text-sky-800 border border-sky-200 px-2.5 py-1 text-xs font-semibold">
        <AlertCircle className="size-3.5" /> Em correção (solicitante)
      </span>
    );
  }
  if (status === "aprovado_corretor") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-1 text-xs font-semibold">
        <BadgeCheck className="size-3.5" /> Aprovado pelo corretor
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200 px-2.5 py-1 text-xs font-semibold">
      <XCircle className="size-3.5" /> Rejeitado
    </span>
  );
}

function NeutralIndicator({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      {ok ? (
        <Check className="size-3.5 text-foreground" />
      ) : (
        <X className="size-3.5 text-foreground/60" />
      )}
      <span className={cn(ok ? "text-foreground" : "text-muted-foreground line-through decoration-foreground/30")}>{label}</span>
    </span>
  );
}

const PD_SEEN_IDS_KEY = "ceia.passagens.adminSeenIds";
const PD_LAST_VISIT_KEY = "ceia.passagens.adminLastVisit";

function parseBR(d: string): number {
  const [dd, mm, yyyy] = d.split("/").map((x) => parseInt(x, 10));
  if (!dd || !mm || !yyyy) return 0;
  return new Date(yyyy, mm - 1, dd).getTime();
}

function todayBR(): string {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

function readLastVisit(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(PD_LAST_VISIT_KEY) || "";
}

function readSeenIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(PD_SEEN_IDS_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function NewTabDot() {
  return (
    <span aria-label="Novidades" title="Novidades" className="relative ml-1.5 inline-flex size-2 text-sky-500 align-middle">
      <span className="absolute inline-flex h-full w-full rounded-full bg-current opacity-75 animate-ping" />
      <span className="relative inline-flex size-2 rounded-full bg-current" />
    </span>
  );
}

function NewSinceLastVisitBadge() {
  const seen = readSeenIds();
  const sortedAll = [...APPROVALS_MOCK].sort((a, b) => parseBR(b.dataSolicitacao) - parseBR(a.dataSolicitacao));
  sortedAll.slice(3).forEach((it) => seen.add(it.id));
  const novos = APPROVALS_MOCK.filter((a) => !seen.has(a.id)).length;
  if (novos === 0) return null;
  return (
    <span
      aria-label={`${novos} novo${novos > 1 ? "s" : ""}`}
      title={`${novos} novo${novos > 1 ? "s" : ""}`}
      className="ml-1.5 inline-block size-2 rounded-full bg-blue-500 animate-pulse"
    />
  );
}

function AdminFeedPanel() {
  const sorted = useMemo(
    () => [...APPROVALS_MOCK].sort((a, b) => parseBR(b.dataSolicitacao) - parseBR(a.dataSolicitacao)),
    []
  );
  // Capture seen IDs from previous session — these stay frozen during this
  // visit so badges remain visible until the user leaves.
  // Para a demonstração, garantimos que somente as 3 solicitações mais
  // recentes apareçam como "novas"; as demais já são consideradas vistas.
  const seenAtMount = useMemo(() => {
    const stored = readSeenIds();
    const sortedAll = [...APPROVALS_MOCK].sort((a, b) => parseBR(b.dataSolicitacao) - parseBR(a.dataSolicitacao));
    sortedAll.slice(3).forEach((it) => stored.add(it.id));
    return stored;
  }, []);
  const lastVisit = useMemo(() => readLastVisit(), []);
  const novos = useMemo(() => sorted.filter((it) => !seenAtMount.has(it.id)), [sorted, seenAtMount]);
  const novosCount = novos.length;

  // On unmount (admin switches profile / leaves the screen), persist all
  // currently displayed IDs as "seen" so that returning to this tab shows
  // everything as already read.
  useEffect(() => {
    if (typeof window === "undefined") return;
    return () => {
      const allIds = APPROVALS_MOCK.map((a) => a.id);
      window.localStorage.setItem(PD_SEEN_IDS_KEY, JSON.stringify(allIds));
      window.localStorage.setItem(PD_LAST_VISIT_KEY, todayBR());
    };
  }, []);

  // Group by date
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

  return (
    <div className="space-y-5">
      {/* Info card — same pattern used in other tabs */}
      <div className="rounded-xl border bg-card p-4 flex items-start gap-3">
        <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Info className="size-4" />
        </div>
        <div className="text-sm">
          <div className="font-semibold text-foreground">Histórico geral</div>
          <p className="mt-1 text-muted-foreground leading-relaxed">
            Todas as solicitações de passagens e diárias enviadas para o List. Use este histórico para acompanhar novos pedidos desde a sua última visita.
          </p>
        </div>
      </div>

      {/* Alert banner — only when there are new items AND user hasn't visited today */}
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
          const isToday = date === todayBR();
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

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-foreground truncate">{it.solicitante}</span>
                          {isNew && <span className="size-1.5 rounded-full bg-primary shrink-0" aria-hidden />}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">{it.email}</div>
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

function ApprovalsPanel() {
  const [items, setItems] = useState<ApprovalItem[]>(APPROVALS_MOCK);
  const [detail, setDetail] = useState<ApprovalItem | null>(null);
  const [filter, setFilter] = useState<"todos" | ApprovalStatus>("pendente");

  // Itens visíveis para o coordenador:
  // - Itens em correção (em_correcao) ficam fora — estão com o solicitante.
  // - Itens aprovados pelo corretor (aprovado_corretor) também ficam fora desta tela.
  // - Solicitações de congressos só chegam após o corretor aprovar.
  const visible = items.filter((i) => {
    if (i.status === "em_correcao") return false;
    if (i.status === "aprovado_corretor") return false;
    if (i.motivoViagem === "congressos" && i.status === "pendente") return false;
    return true;
  });
  const filtered = visible.filter((i) => {
    if (filter === "todos") return true;
    return i.status === filter;
  });
  const pendentes = visible.filter((i) => i.status === "pendente").length;
  const aprovadas = visible.filter((i) => i.status === "aprovado").length;
  const rejeitadas = visible.filter((i) => i.status === "rejeitado").length;

  function decidir(id: string, novo: ApprovalStatus) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: novo } : i)));
    setDetail(null);
  }

  return (
    <div className="space-y-5">
      {/* Informativo neutro: contexto da tela */}
      <div className="rounded-xl border bg-card p-4 flex items-start gap-3 animate-slide-up" style={{ animationDelay: "0ms" }}>
        <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Info className="size-4" />
        </div>
        <div className="text-sm">
          <div className="font-semibold text-foreground">Pedidos de Recurso</div>
          <p className="mt-1 text-muted-foreground leading-relaxed">
            Aqui você visualiza as solicitações de passagens e diárias feitas por colaboradores que desejam utilizar recursos dos projetos sob sua coordenação.
          </p>
        </div>
      </div>

      {/* Filtros com contagem ao lado */}
      <div className="grid grid-cols-3 gap-2 animate-slide-up [&>button]:w-full [&>button]:justify-center" style={{ animationDelay: "80ms" }}>
        <FilterChip active={filter === "pendente"} onClick={() => setFilter("pendente")} count={pendentes} tone="amber">Pendentes</FilterChip>
        <FilterChip active={filter === "aprovado"} onClick={() => setFilter("aprovado")} count={aprovadas} tone="emerald">Aprovadas</FilterChip>
        <FilterChip active={filter === "rejeitado"} onClick={() => setFilter("rejeitado")} count={rejeitadas} tone="rose">Rejeitadas</FilterChip>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground animate-fade-in">
          Nenhuma solicitação nesta categoria.
        </div>
      ) : (
        <div key={filter} className="space-y-3">
          {filtered.map((it, idx) => (
            <div
              key={it.id}
              className="animate-slide-up"
              style={{ animationDelay: `${120 + idx * 70}ms` }}
            >
              <ApprovalCard item={it} onOpen={() => setDetail(it)} showCorretor />
            </div>
          ))}
        </div>
      )}

      {detail && (
        <Dialog open={true} onOpenChange={(o) => { if (!o) setDetail(null); }}>
          <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto p-0">
            <div className="sticky top-0 bg-background z-10 px-6 pt-6 pb-4 border-b flex items-start justify-between gap-4">
              <DialogHeader className="flex-1 min-w-0">
                <DialogTitle>
                  {detail.status === "pendente"
                    ? "Analisar pedido — Congressos"
                    : "Visualizar pedido — Congressos"}
                </DialogTitle>
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
              {/* Resumo */}
              <section className="rounded-xl border bg-white px-4 pt-3 pb-4 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                  <Info className="size-4 text-primary" /> Resumo
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <PDInfoTile full icon={<RouteIcon className="size-3.5" />} label="Trecho" value={
                    <span className="inline-flex items-center gap-1.5">
                      {detail.origem} <ArrowRight className="size-3.5 text-muted-foreground" /> {detail.destino}
                    </span>
                  } />
                  <PDInfoTile icon={<Calendar className="size-3.5" />} label="Período" value={detail.periodo} />
                  <div className="rounded-lg border bg-card px-3 py-2.5 min-w-0">
                    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.08em] text-muted-foreground font-semibold">
                      <Luggage className="size-3.5" />
                      <span>Tipo</span>
                    </div>
                    <div className="mt-1.5"><TipoBadge tipo={detail.tipo} /></div>
                  </div>
                  <div className="rounded-lg border bg-card px-3 py-2.5 min-w-0">
                    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.08em] text-muted-foreground font-semibold">
                      <CheckCircle2 className="size-3.5" />
                      <span>Status</span>
                    </div>
                    <div className="mt-1.5"><StatusBadge status={detail.status} /></div>
                  </div>
                  <PDInfoTile icon={<Calendar className="size-3.5" />} label="Recebida em" value={detail.dataSolicitacao} />
                  {detail.projetoSolicitado && (
                    <PDInfoTile icon={<Briefcase className="size-3.5" />} label="Projeto que demanda" value={detail.projetoSolicitado} />
                  )}
                  {detail.projetoSolicitado && detail.projetoSolicitado !== detail.projetoCustos && (
                    <PDInfoTile
                      icon={<User2 className="size-3.5" />}
                      label="Coordenador do projeto que demanda"
                      value={(PROJECTS.find((p: any) => p.name === detail.projetoSolicitado) as any)?.coordinator ?? "Não identificado"}
                    />
                  )}
                  <PDInfoTile icon={<FolderKanban className="size-3.5" />} label="Projeto que custeia" value={detail.projetoCustos} />
                  {detail.corretorAprovador && (
                    <PDInfoTile icon={<User2 className="size-3.5" />} label="Corretor responsável" value={detail.corretorAprovador} />
                  )}
                </div>
              </section>

              {/* Solicitante */}
              <PDSection title="Identificação do solicitante" icon={<User2 className="size-4" />} tone="sky">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <PDInfoTile full icon={<User2 className="size-3.5" />} label="Nome" value={detail.solicitante} />
                  <PDInfoTile icon={<Mail className="size-3.5" />} label="E-mail" value={detail.email} />
                  <PDInfoTile icon={<Phone className="size-3.5" />} label="Telefone" value={detail.telefone} />
                  <PDInfoTile icon={<Cake className="size-3.5" />} label="Data de nascimento" value={detail.dataNascimento} />
                  <PDInfoTile icon={<IdCard className="size-3.5" />} label="RG" value={detail.rg} />
                  <PDInfoTile icon={<IdCard className="size-3.5" />} label="CPF" value={detail.cpf} />
                  <div className="rounded-lg border bg-card px-3 py-2.5 min-w-0 sm:col-span-3">
                    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.08em] text-muted-foreground font-semibold">
                      <ShieldCheck className="size-3.5" />
                      <span>Vínculos</span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
                      <VinculosRow
                        cadastradoNoPortal={detail.cadastradoNoPortal}
                        vinculadoAoProjeto={detail.vinculadoAoProjeto}
                        projetoCustos={detail.projetoCustos}
                        projetoSolicitado={detail.projetoSolicitado}
                      />
                    </div>
                  </div>
                </div>
              </PDSection>

              {/* Objetivo da viagem */}
              <PDSection title="Objetivo da viagem" icon={<Briefcase className="size-4" />} tone="indigo">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <PDInfoTile full icon={<Briefcase className="size-3.5" />} label="Motivo" value={
                    detail.motivoViagem === "congressos" ? "Congressos" :
                    detail.motivoViagem === "evento" ? "Evento" :
                    detail.motivoViagem === "reuniao_cliente" ? "Reunião com cliente" :
                    detail.motivoViagem
                  } />
                  <PDInfoTile full icon={<FileText className="size-3.5" />} label="Descrição das atividades" value={
                    detail.atividades ? <span className="block whitespace-pre-wrap leading-relaxed">{detail.atividades}</span> : null
                  } />
                  <PDInfoTile full icon={<AlertCircle className="size-3.5" />} label="Justificativa (menos de 20 dias)" value={detail.justificativa} />
                  {detail.observacao && (
                    <PDInfoTile full icon={<MessageSquare className="size-3.5" />} label="Observação / comentário" value={detail.observacao} />
                  )}
                </div>
              </PDSection>

              {/* Missão e destino */}
              <PDSection title="Missão e destino" icon={<MapPin className="size-4" />} tone="teal">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <PDInfoTile icon={<MapPin className="size-3.5" />} label="Local de partida" value={detail.origem} />
                  <PDInfoTile icon={<MapPin className="size-3.5" />} label="Local de chegada" value={detail.destino} />
                  <PDInfoTile icon={<Calendar className="size-3.5" />} label="Período da missão" value={detail.periodo} />
                  <PDInfoTile full icon={<Wallet className="size-3.5" />} label="Tipo de despesa" value={detail.tipoDespesa} />
                </div>
              </PDSection>

              {/* Diárias */}
              {(detail.tipo === "diarias" || detail.tipo === "passagens_e_diarias") && (
                <PDSection title="Diárias" icon={<Clock className="size-4" />} tone="amber">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <PDInfoTile icon={<Clock className="size-3.5" />} label="Quantidade estimada" value={detail.diariaCount} />
                  </div>
                </PDSection>
              )}

              {/* Passagens e voos */}
              {(detail.tipo === "passagens" || detail.tipo === "passagens_e_diarias") && (
                <PDSection title="Passagens e voos" icon={<Plane className="size-4" />} tone="sky">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <PDInfoTile icon={<Calendar className="size-3.5" />} label="Data de ida" value={detail.idaDate} />
                    <PDInfoTile icon={<Calendar className="size-3.5" />} label="Data de volta" value={detail.voltaDate} />
                    <PDInfoTile icon={<Globe className="size-3.5" />} label="Internacional" value={detail.internacional === undefined ? null : detail.internacional ? "Sim" : "Não"} />
                    <PDInfoTile icon={<Bus className="size-3.5" />} label="Transporte" value={detail.transporte} />
                    <PDInfoTile icon={<Luggage className="size-3.5" />} label="Franquia de bagagem" value={detail.bagagem === undefined ? null : detail.bagagem ? "Sim" : "Não"} />
                    {detail.internacional && (
                      <PDInfoTile icon={<ShieldAlert className="size-3.5" />} label="Seguro viagem" value={detail.seguroViagem === undefined ? null : detail.seguroViagem ? "Sim" : "Não"} />
                    )}
                    {detail.contatoEmergenciaNome && (
                      <PDInfoTile icon={<User2 className="size-3.5" />} label="Contato de emergência — nome" value={detail.contatoEmergenciaNome} />
                    )}
                    {detail.contatoEmergenciaTelefone && (
                      <PDInfoTile icon={<Phone className="size-3.5" />} label="Contato de emergência — telefone" value={detail.contatoEmergenciaTelefone} />
                    )}
                  </div>
                </PDSection>
              )}

              {/* Anexos */}
              {detail.anexos.length > 0 && (
                <PDSection title="Anexos" icon={<Paperclip className="size-4" />} tone="gray">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <PDFileTile label="Imagem do passaporte" file={{ name: detail.anexos[0] ?? "Passaporte.pdf" }} />
                    <PDFileTile label="Pesquisa de voos" file={{ name: detail.anexos[1] ?? detail.anexos[0] ?? "Pesquisa.pdf" }} />
                  </div>
                </PDSection>
              )}

              {detail.status === "pendente" ? (
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
              ) : null}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function CorretorPanel() {
  const [items, setItems] = useState<ApprovalItem[]>(APPROVALS_MOCK);
  const [detail, setDetail] = useState<ApprovalItem | null>(null);
  const [filter, setFilter] = useState<"todos" | ApprovalStatus>("pendente");
  const [correcaoOpen, setCorrecaoOpen] = useState(false);
  const [correcaoText, setCorrecaoText] = useState("");

  // O corretor de Congressos só vê solicitações cujo motivo de viagem é "congressos".
  const visible = items.filter((i) => i.motivoViagem === "congressos");

  const filtered = visible.filter((i) => {
    if (filter === "todos") return true;
    return i.status === filter;
  });
  const pendentes = visible.filter((i) => i.status === "pendente").length;
  const emCorrecao = visible.filter((i) => i.status === "em_correcao").length;
  const aprovadas = visible.filter((i) => i.status === "aprovado_corretor" || i.status === "aprovado").length;

  function aprovarCorretor(id: string) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: "aprovado_corretor" } : i)));
    setDetail(null);
  }

  function solicitarCorrecao(id: string, comment: string) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: "em_correcao", corretorComment: comment } : i)));
    setDetail(null);
    setCorrecaoOpen(false);
    setCorrecaoText("");
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border bg-card p-4 flex items-start gap-3 animate-slide-up" style={{ animationDelay: "0ms" }}>
        <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <ShieldCheck className="size-4" />
        </div>
        <div className="text-sm">
          <div className="font-semibold text-foreground">Triagem — Congressos</div>
          <p className="mt-1 text-muted-foreground leading-relaxed">
            Solicitações de passagens e diárias com motivo <span className="font-semibold text-foreground">Congressos</span> passam por uma análise inicial aqui. Você pode <span className="font-semibold text-foreground">aprovar</span> (a solicitação segue para a coordenação) ou <span className="font-semibold text-foreground">solicitar correção</span> (volta para o solicitante ajustar e reenviar).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 animate-slide-up [&>button]:w-full [&>button]:justify-center" style={{ animationDelay: "80ms" }}>
        <FilterChip active={filter === "pendente"} onClick={() => setFilter("pendente")} count={pendentes} tone="amber">Pendentes</FilterChip>
        <FilterChip active={filter === "em_correcao"} onClick={() => setFilter("em_correcao")} count={emCorrecao} tone="sky">Em correção (solicitante)</FilterChip>
        <FilterChip active={filter === "aprovado_corretor"} onClick={() => setFilter("aprovado_corretor")} count={aprovadas} tone="emerald">Aprovadas</FilterChip>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground animate-fade-in">
          Nenhuma solicitação nesta categoria.
        </div>
      ) : (
        <div key={filter} className="space-y-3">
          {filtered.map((it, idx) => (
            <div
              key={it.id}
              className="animate-slide-up"
              style={{ animationDelay: `${120 + idx * 70}ms` }}
            >
              <ApprovalCard item={it} onOpen={() => setDetail(it)} />
            </div>
          ))}
        </div>
      )}

      {detail && (
        <Dialog open={true} onOpenChange={(o) => { if (!o) { setDetail(null); setCorrecaoOpen(false); setCorrecaoText(""); } }}>
          <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto p-0">
            <div className="sticky top-0 bg-background z-10 px-6 pt-6 pb-4 border-b flex items-start justify-between gap-4">
              <DialogHeader className="flex-1 min-w-0">
                <DialogTitle>
                  {detail.status === "pendente"
                    ? "Analisar pedido — Congressos"
                    : "Visualizar pedido — Congressos"}
                </DialogTitle>
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
                    <MessageSquare className="size-4" /> Correção solicitada
                  </div>
                  <p className="text-sm text-orange-900 leading-relaxed whitespace-pre-line">{detail.corretorComment}</p>
                </section>
              )}

              {/* Resumo */}
              <section className="rounded-xl border bg-white px-4 pt-3 pb-4 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                  <Info className="size-4 text-primary" /> Resumo
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <PDInfoTile full icon={<RouteIcon className="size-3.5" />} label="Trecho" value={
                    <span className="inline-flex items-center gap-1.5">
                      {detail.origem} <ArrowRight className="size-3.5 text-muted-foreground" /> {detail.destino}
                    </span>
                  } />
                  <PDInfoTile icon={<Calendar className="size-3.5" />} label="Período" value={detail.periodo} />
                  <div className="rounded-lg border bg-card px-3 py-2.5 min-w-0">
                    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.08em] text-muted-foreground font-semibold">
                      <Luggage className="size-3.5" />
                      <span>Tipo</span>
                    </div>
                    <div className="mt-1.5"><TipoBadge tipo={detail.tipo} /></div>
                  </div>
                  <div className="rounded-lg border bg-card px-3 py-2.5 min-w-0">
                    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.08em] text-muted-foreground font-semibold">
                      <CheckCircle2 className="size-3.5" />
                      <span>Status</span>
                    </div>
                    <div className="mt-1.5"><StatusBadge status={detail.status} /></div>
                  </div>
                  <PDInfoTile icon={<Calendar className="size-3.5" />} label="Recebida em" value={detail.dataSolicitacao} />
                  {detail.projetoSolicitado && (
                    <PDInfoTile icon={<Briefcase className="size-3.5" />} label="Projeto que demanda" value={detail.projetoSolicitado} />
                  )}
                  {detail.projetoSolicitado && detail.projetoSolicitado !== detail.projetoCustos && (
                    <PDInfoTile
                      icon={<User2 className="size-3.5" />}
                      label="Coordenador do projeto que demanda"
                      value={(PROJECTS.find((p: any) => p.name === detail.projetoSolicitado) as any)?.coordinator ?? "Não identificado"}
                    />
                  )}
                  <PDInfoTile icon={<FolderKanban className="size-3.5" />} label="Projeto que custeia" value={detail.projetoCustos} />
                  {(detail.status === "aprovado_corretor" || detail.status === "em_correcao") && detail.corretorAprovador && (
                    <PDInfoTile icon={<User2 className="size-3.5" />} label="Corretor responsável" value={detail.corretorAprovador} />
                  )}
                </div>
              </section>

              {/* Solicitante */}
              <PDSection title="Identificação do solicitante" icon={<User2 className="size-4" />} tone="sky">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <PDInfoTile full icon={<User2 className="size-3.5" />} label="Nome" value={detail.solicitante} />
                  <PDInfoTile icon={<Mail className="size-3.5" />} label="E-mail" value={detail.email} />
                  <PDInfoTile icon={<Phone className="size-3.5" />} label="Telefone" value={detail.telefone} />
                  <PDInfoTile icon={<Cake className="size-3.5" />} label="Data de nascimento" value={detail.dataNascimento} />
                  <PDInfoTile icon={<IdCard className="size-3.5" />} label="RG" value={detail.rg} />
                  <PDInfoTile icon={<IdCard className="size-3.5" />} label="CPF" value={detail.cpf} />
                  <div className="rounded-lg border bg-card px-3 py-2.5 min-w-0 sm:col-span-3">
                    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.08em] text-muted-foreground font-semibold">
                      <ShieldCheck className="size-3.5" />
                      <span>Vínculos</span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
                      <VinculosRow
                        cadastradoNoPortal={detail.cadastradoNoPortal}
                        vinculadoAoProjeto={detail.vinculadoAoProjeto}
                        projetoCustos={detail.projetoCustos}
                        projetoSolicitado={detail.projetoSolicitado}
                      />
                    </div>
                  </div>
                </div>
              </PDSection>

              {/* Objetivo da viagem */}
              <PDSection title="Objetivo da viagem" icon={<Briefcase className="size-4" />} tone="indigo">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <PDInfoTile full icon={<Briefcase className="size-3.5" />} label="Motivo" value={
                    detail.motivoViagem === "congressos" ? "Congressos" :
                    detail.motivoViagem === "evento" ? "Evento" :
                    detail.motivoViagem === "reuniao_cliente" ? "Reunião com cliente" :
                    detail.motivoViagem
                  } />
                  <PDInfoTile full icon={<FileText className="size-3.5" />} label="Descrição das atividades" value={
                    detail.atividades ? <span className="block whitespace-pre-wrap leading-relaxed">{detail.atividades}</span> : null
                  } />
                  <PDInfoTile full icon={<AlertCircle className="size-3.5" />} label="Justificativa (menos de 20 dias)" value={detail.justificativa} />
                  {detail.observacao && (
                    <PDInfoTile full icon={<MessageSquare className="size-3.5" />} label="Observação / comentário" value={detail.observacao} />
                  )}
                </div>
              </PDSection>

              {/* Missão e destino */}
              <PDSection title="Missão e destino" icon={<MapPin className="size-4" />} tone="teal">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <PDInfoTile icon={<MapPin className="size-3.5" />} label="Local de partida" value={detail.origem} />
                  <PDInfoTile icon={<MapPin className="size-3.5" />} label="Local de chegada" value={detail.destino} />
                  <PDInfoTile icon={<Calendar className="size-3.5" />} label="Período da missão" value={detail.periodo} />
                  <PDInfoTile full icon={<Wallet className="size-3.5" />} label="Tipo de despesa" value={detail.tipoDespesa} />
                </div>
              </PDSection>

              {/* Diárias */}
              {(detail.tipo === "diarias" || detail.tipo === "passagens_e_diarias") && (
                <PDSection title="Diárias" icon={<Clock className="size-4" />} tone="amber">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <PDInfoTile icon={<Clock className="size-3.5" />} label="Quantidade estimada" value={detail.diariaCount} />
                  </div>
                </PDSection>
              )}

              {/* Passagens e voos */}
              {(detail.tipo === "passagens" || detail.tipo === "passagens_e_diarias") && (
                <PDSection title="Passagens e voos" icon={<Plane className="size-4" />} tone="sky">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <PDInfoTile icon={<Calendar className="size-3.5" />} label="Data de ida" value={detail.idaDate} />
                    <PDInfoTile icon={<Calendar className="size-3.5" />} label="Data de volta" value={detail.voltaDate} />
                    <PDInfoTile icon={<Globe className="size-3.5" />} label="Internacional" value={detail.internacional === undefined ? null : detail.internacional ? "Sim" : "Não"} />
                    <PDInfoTile icon={<Bus className="size-3.5" />} label="Transporte" value={detail.transporte} />
                    <PDInfoTile icon={<Luggage className="size-3.5" />} label="Franquia de bagagem" value={detail.bagagem === undefined ? null : detail.bagagem ? "Sim" : "Não"} />
                    {detail.internacional && (
                      <PDInfoTile icon={<ShieldAlert className="size-3.5" />} label="Seguro viagem" value={detail.seguroViagem === undefined ? null : detail.seguroViagem ? "Sim" : "Não"} />
                    )}
                    {detail.contatoEmergenciaNome && (
                      <PDInfoTile icon={<User2 className="size-3.5" />} label="Contato de emergência — nome" value={detail.contatoEmergenciaNome} />
                    )}
                    {detail.contatoEmergenciaTelefone && (
                      <PDInfoTile icon={<Phone className="size-3.5" />} label="Contato de emergência — telefone" value={detail.contatoEmergenciaTelefone} />
                    )}
                  </div>
                </PDSection>
              )}

              {/* Anexos */}
              {detail.anexos.length > 0 && (
                <PDSection title="Anexos" icon={<Paperclip className="size-4" />} tone="gray">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <PDFileTile label="Imagem do passaporte" file={{ name: detail.anexos[0] ?? "Passaporte.pdf" }} />
                    <PDFileTile label="Pesquisa de voos" file={{ name: detail.anexos[1] ?? detail.anexos[0] ?? "Pesquisa.pdf" }} />
                  </div>
                </PDSection>
              )}

              {detail.status === "pendente" ? (
                correcaoOpen ? (
                  <div className="mt-4 pt-6 border-t space-y-3">
                    <div className="text-sm font-semibold text-foreground inline-flex items-center gap-2">
                      <AlertTriangle className="size-4 text-orange-600" /> Solicitar correção ao solicitante
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Descreva claramente o que precisa ser ajustado. O solicitante verá esta mensagem no histórico e poderá reenviar a solicitação após a correção.
                    </p>
                    <textarea
                      value={correcaoText}
                      onChange={(e) => setCorrecaoText(e.target.value)}
                      placeholder="Ex.: Anexar carta de aceite oficial do congresso e corrigir as datas conforme programação."
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
                      <AlertTriangle className="size-4" /> Solicitar correção
                    </button>
                    <button
                      onClick={() => aprovarCorretor(detail.id)}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 text-white px-4 py-2.5 text-sm font-semibold hover:bg-emerald-700 transition-colors"
                    >
                      <CheckCircle2 className="size-4" /> Aprovar
                    </button>
                  </div>
                )
              ) : (
                detail.status !== "em_correcao" && detail.status !== "aprovado_corretor" && (
                  <div className="mt-4 pt-6 border-t">
                    <div className="rounded-lg bg-muted/40 border p-3 text-sm text-muted-foreground">
                      {detail.status === "aprovado" && "Solicitação aprovada pela coordenação."}
                      {detail.status === "rejeitado" && "Solicitação rejeitada."}
                    </div>
                  </div>
                )
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function ApprovalCard({ item, onOpen, showCorretor }: { item: ApprovalItem; onOpen: () => void; showCorretor?: boolean }) {
  const isPending = item.status === "pendente" || item.status === "aprovado_corretor";
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
        item.status === "aprovado_corretor" && "border-l-emerald-500 hover:border-l-emerald-500"
      )}
    >
      {/* Header com gradiente sutil */}
      <div className="relative px-5 pt-5 pb-3 bg-gradient-to-b from-muted/20 to-transparent">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <TipoBadge tipo={item.tipo} />
            <StatusBadge status={item.status} />
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
            <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="text-sm font-semibold text-foreground truncate">{item.solicitante}</span>
              <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <VinculosRow
                  cadastradoNoPortal={item.cadastradoNoPortal}
                  vinculadoAoProjeto={item.vinculadoAoProjeto}
                  projetoCustos={item.projetoCustos}
                  projetoSolicitado={item.projetoSolicitado}
                />
              </span>
            </div>
          </div>
        </div>

        <DetailRow
          icon={<FolderKanban className="size-4" />}
          label="Projeto que demanda"
        >
          <span className="truncate">{item.projetoSolicitado || <span className="text-muted-foreground italic">Não informado</span>}</span>
        </DetailRow>

        {item.projetoSolicitado && item.projetoSolicitado !== item.projetoCustos && (
          <DetailRow
            icon={<User2 className="size-4" />}
            label="Coordenador do projeto que demanda"
          >
            <span className="truncate">
              {(PROJECTS.find((p: any) => p.name === item.projetoSolicitado) as any)?.coordinator ?? "Não identificado"}
            </span>
          </DetailRow>
        )}

        <DetailRow
          icon={<Wallet className="size-4" />}
          label="Projeto que custeia"
        >
          <span className="truncate">{item.projetoCustos}</span>
        </DetailRow>

        <DetailRow
          icon={<RouteIcon className="size-4" />}
          label="Trajeto"
        >
          <span className="inline-flex items-center gap-2 truncate">
            <span className="truncate">{item.origem}</span>
            <ArrowRight className="size-3.5 text-muted-foreground shrink-0" />
            <span className="truncate">{item.destino}</span>
          </span>
        </DetailRow>

        <DetailRow
          icon={<Calendar className="size-4" />}
          label="Período"
        >
          <span className="truncate">{item.periodo}</span>
        </DetailRow>

        {(showCorretor || item.status !== "pendente") && item.corretorAprovador && (
          <DetailRow
            icon={<BadgeCheck className="size-4" />}
            label="Corretor responsável"
          >
            <span className="truncate">{item.corretorAprovador}</span>
          </DetailRow>
        )}
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
          {item.status !== "pendente" && <Eye className="size-4" />}
          {item.status === "pendente" ? "Analisar pedido" : "Ver detalhes"}
          <ChevronRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
}

function DetailRow({ icon, iconClass, label, children }: { icon: React.ReactNode; iconClass?: string; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className={cn("size-9 rounded-lg flex items-center justify-center shrink-0", iconClass ?? "bg-muted text-muted-foreground")}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground font-semibold">{label}</div>
        <div className="mt-0.5 text-sm font-medium text-foreground min-w-0 flex">
          {children}
        </div>
      </div>
    </div>
  );
}

function ModalSection({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-2">
        {icon && (
          <div className="size-7 rounded-md bg-muted text-muted-foreground inline-flex items-center justify-center">
            {icon}
          </div>
        )}
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function ReadField({ label, icon, value }: { label?: string; icon?: React.ReactNode; value?: string }) {
  const empty = value === undefined || value === null || value === "";
  return (
    <div className="min-w-0">
      {label && (
        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.08em] text-muted-foreground font-semibold mb-1">
          {icon}
          <span>{label}</span>
        </div>
      )}
      <div
        className={cn(
          "w-full rounded-lg border bg-background px-3 py-2 text-sm",
          empty ? "text-muted-foreground italic" : "text-foreground font-medium"
        )}
      >
        {empty ? "Não informado" : value}
      </div>
    </div>
  );
}

function CredChip({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium border transition-colors",
      ok
        ? "bg-card text-foreground border-border"
        : "bg-muted/40 text-muted-foreground border-dashed"
    )}>
      {ok ? <Check className="size-3" /> : <X className="size-3" />} {label}
    </span>
  );
}

function CredDot({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1 text-[11px] font-medium",
      ok ? "text-emerald-700" : "text-muted-foreground"
    )}>
      <span className={cn(
        "inline-flex items-center justify-center size-3.5 rounded-full",
        ok ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"
      )}>
        {ok ? <Check className="size-2.5" strokeWidth={3} /> : <X className="size-2.5" strokeWidth={3} />}
      </span>
      {label}
    </span>
  );
}

function VinculosRow({
  cadastradoNoPortal,
  vinculadoAoProjeto,
  projetoCustos,
  projetoSolicitado,
}: {
  cadastradoNoPortal: boolean;
  vinculadoAoProjeto: boolean;
  projetoCustos?: string;
  projetoSolicitado?: string;
}) {
  // Regras de negócio:
  // - Para informar "projeto que demanda" o solicitante precisa, obrigatoriamente,
  //   estar cadastrado no Portal (o seletor de projeto só aparece para usuários do Portal).
  // - Se o projeto que demanda é o mesmo que custeia, ele também está vinculado ao
  //   projeto (o seletor só lista projetos em que ele está vinculado).
  const hasDemandProject = !!projetoSolicitado;
  const mustBeLinked = hasDemandProject && projetoSolicitado === projetoCustos;
  const isOnPortal = cadastradoNoPortal || hasDemandProject;
  const isLinked = vinculadoAoProjeto || mustBeLinked;
  const linkLabel = isLinked
    ? "Vinculado ao projeto que custeia"
    : "Não vinculado ao projeto que custeia";
  return (
    <>
      <CredDot ok={isOnPortal} label={isOnPortal ? "No Portal" : "Não cadastrado no Portal"} />
      <CredDot ok={isLinked} label={linkLabel} />
    </>
  );
}

function SummaryStat(_: { label: string; value: number; tone: "amber" | "emerald" | "rose" }) {
  return null;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{children}</div>;
}

function FilterChip({ active, onClick, children, count, tone }: { active: boolean; onClick: () => void; children: React.ReactNode; count?: number; tone?: "amber" | "emerald" | "rose" | "sky" }) {
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
