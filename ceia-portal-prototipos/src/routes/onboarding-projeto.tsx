import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  ArrowLeft,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  CircleDashed,
  Loader2,
  CalendarClock,
  CalendarDays,
  CalendarCheck,
  FileSignature,
  FileText,
  FileCheck2,
  Mail,
  Github,
  Send,
  UserCircle2,
  Hash,
  Flag,
  Bell,
  Download,
  Upload,
  Eye,
  ListChecks,
  Target,
  Rocket,
  PenLine,
  Activity,
  Check,
  LayoutDashboard,
  ShieldAlert,
  Sparkles,
  ArrowUpRight,
  ClipboardList,
  Copy,
  ScanSearch,
  Lightbulb,
  Gauge,
  Heart,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { parseYearMonth, nextMonth, monthsBetween } from "@/lib/equipe-bolsas-data";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/onboarding-projeto")({
  head: () => ({
    meta: [
      { title: "Painel PMO — Portal CEIA" },
      { name: "description", content: "Central operacional do PMO para acompanhamento dos projetos." },
    ],
  }),
  component: OnboardingPmoPage,
});

// ─── Tipos & Dados Mock ────────────────────────────────────────────────────────

type ProjectStatus =
  | "onboarding"
  | "em_execucao"
  | "aguardando_assinatura"
  | "macroentrega_pendente"
  | "atrasado"
  | "finalizado";

type EtapaStatus = "pendente" | "em_andamento" | "agendado" | "realizado" | "concluido" | "atrasado";

type EtapaTimeline = {
  id: string;
  titulo: string;
  responsavel: string;
  data?: string;
  status: EtapaStatus;
  descricao?: string;
};

type Macroentrega = {
  id: string;
  nome: string;
  vencimento: string;
  diasParaVencer: number;
  status: "no_prazo" | "alerta" | "critica" | "vencida" | "concluida";
  termoStatus: "nao_gerado" | "rascunho" | "aguardando_assinatura" | "assinado" | "subido_sr";
  assinaturaStatus: "nao_enviado" | "aguardando" | "assinado" | "atrasado";
  prazoCritico: boolean;
  descricao?: string;
  indicadorFisico?: string;
  inicioPlanejado?: string;
  finalPlanejado?: string;
  inicioReal?: string;
  finalReal?: string;
  dataAssinatura?: string;
  naoIniciada?: boolean;
};

type ProjetoOperacional = {
  id: string;
  codigo: string;
  nome: string;
  coordenador: string;
  empresa: string;
  fase: string;
  status: ProjectStatus;
  proximaAcao: string;
  proximoPrazo: string;
  diasParaPrazo: number;
  alertasCount: number;
  alertaCritico: boolean;
  timeline: EtapaTimeline[];
  macroentregas: Macroentrega[];
  vigencia: string;
  dataAssinatura?: string;
  githubUrl?: string;
  termoEncerramentoConcluido?: boolean;
  avaliacaoFinalConcluida?: boolean;
  novoParaPmo?: boolean;
};

const PROJETOS: ProjetoOperacional[] = [
  {
    id: "p1",
    codigo: "PEIA-2025.0014",
    nome: "Sistema de Navegação Autônoma para VANTs",
    coordenador: "Erika Morais",
    empresa: "AeroVision Tecnologia S.A.",
    fase: "Onboarding",
    status: "onboarding",
    proximaAcao: "Agendar reunião de onboarding com o coordenador",
    proximoPrazo: "30/05/2026",
    diasParaPrazo: 3,
    alertasCount: 3,
    alertaCritico: true,
    vigencia: "01/03/2026 — 28/02/2028",
    dataAssinatura: "12/03/2026",
    timeline: [
      { id: "e2", titulo: "Cadastro das macroentregas no SRINFO", responsavel: "PMO", data: "18/03/2026", status: "concluido" },
      { id: "e3", titulo: "Criação da organização GitHub", responsavel: "PMO / TI", data: "22/03/2026", status: "concluido" },
      { id: "e4", titulo: "Envio do e-mail de onboarding", responsavel: "PMO", data: "01/04/2026", status: "realizado" },
      { id: "e5", titulo: "Agendamento do onboarding", responsavel: "PMO", status: "em_andamento", descricao: "Coordenador retornou disponibilidade — confirmar horário." },
      { id: "e6", titulo: "Onboarding realizado", responsavel: "PMO + Coordenador", status: "pendente" },
      { id: "e7", titulo: "Projeto em execução", responsavel: "Coordenador", status: "pendente" },
      { id: "e8", titulo: "Encerramento do projeto", responsavel: "Coordenador + PMO", status: "pendente" },
    ],
    macroentregas: [
      { id: "m1", nome: "M1 — Especificação técnica", vencimento: "30/06/2026", diasParaVencer: 34, status: "no_prazo", termoStatus: "nao_gerado", assinaturaStatus: "nao_enviado", prazoCritico: false },
      { id: "m2", nome: "M2 — Protótipo de navegação", vencimento: "30/09/2026", diasParaVencer: 126, status: "no_prazo", termoStatus: "nao_gerado", assinaturaStatus: "nao_enviado", prazoCritico: false },
    ],
  },
  {
    id: "p2",
    codigo: "PEIA-2025.0008",
    nome: "IA para Detecção de Plágio Acadêmico",
    coordenador: "Renata Braga",
    empresa: "EduTrust Soluções Educacionais",
    fase: "Execução",
    status: "macroentrega_pendente",
    proximaAcao: "Coordenador deve gerar termo de aceite da M3",
    proximoPrazo: "31/05/2026",
    diasParaPrazo: 4,
    alertasCount: 2,
    alertaCritico: true,
    vigencia: "01/06/2025 — 31/05/2027",
    timeline: [
      { id: "e2", titulo: "Cadastro das macroentregas no SRINFO", responsavel: "PMO", data: "25/05/2025", status: "concluido" },
      { id: "e3", titulo: "Criação da organização GitHub", responsavel: "PMO / TI", data: "28/05/2025", status: "concluido" },
      { id: "e4", titulo: "Envio do e-mail de onboarding", responsavel: "PMO", data: "30/05/2025", status: "concluido" },
      { id: "e5", titulo: "Agendamento do onboarding", responsavel: "PMO", data: "02/06/2025", status: "concluido" },
      { id: "e6", titulo: "Onboarding realizado", responsavel: "PMO + Coordenador", data: "10/06/2025", status: "concluido" },
      { id: "e7", titulo: "Projeto em execução", responsavel: "Coordenador", data: "10/06/2025", status: "em_andamento" },
      { id: "e8", titulo: "Encerramento do projeto", responsavel: "Coordenador + PMO", status: "pendente" },
    ],
    macroentregas: [
      { id: "m1", nome: "M1 — Levantamento de requisitos", vencimento: "30/11/2025", diasParaVencer: -178, status: "concluida", termoStatus: "subido_sr", assinaturaStatus: "assinado", prazoCritico: false },
      { id: "m2", nome: "M2 — Modelo de detecção v1", vencimento: "28/02/2026", diasParaVencer: -88, status: "concluida", termoStatus: "subido_sr", assinaturaStatus: "assinado", prazoCritico: false },
      { id: "m3", nome: "M3 — Integração com plataforma", vencimento: "31/05/2026", diasParaVencer: 4, status: "critica", termoStatus: "nao_gerado", assinaturaStatus: "nao_enviado", prazoCritico: true },
      { id: "m4", nome: "M4 — Validação em campo", vencimento: "31/08/2026", diasParaVencer: 96, status: "no_prazo", termoStatus: "nao_gerado", assinaturaStatus: "nao_enviado", prazoCritico: false },
    ],
  },
  {
    id: "p3",
    codigo: "PEIA-2024.0031",
    nome: "Plataforma Wave Testing",
    coordenador: "Juliana Costa",
    empresa: "WaveCorp Engenharia",
    fase: "Execução",
    status: "aguardando_assinatura",
    proximaAcao: "Aguardando assinatura da empresa principal (M2)",
    proximoPrazo: "28/05/2026",
    diasParaPrazo: 1,
    alertasCount: 4,
    alertaCritico: true,
    vigencia: "15/01/2025 — 14/01/2027",
    timeline: [
      { id: "e2", titulo: "Cadastro das macroentregas no SRINFO", responsavel: "PMO", data: "15/01/2025", status: "concluido" },
      { id: "e3", titulo: "Criação da organização GitHub", responsavel: "PMO / TI", data: "18/01/2025", status: "concluido" },
      { id: "e4", titulo: "Envio do e-mail de onboarding", responsavel: "PMO", data: "20/01/2025", status: "concluido" },
      { id: "e5", titulo: "Agendamento do onboarding", responsavel: "PMO", data: "23/01/2025", status: "concluido" },
      { id: "e6", titulo: "Onboarding realizado", responsavel: "PMO + Coordenador", data: "29/01/2025", status: "concluido" },
      { id: "e7", titulo: "Projeto em execução", responsavel: "Coordenador", data: "29/01/2025", status: "em_andamento" },
      { id: "e8", titulo: "Encerramento do projeto", responsavel: "Coordenador + PMO", status: "pendente" },
    ],
    macroentregas: [
      { id: "m1", nome: "M1 — Arquitetura da plataforma", vencimento: "15/06/2025", diasParaVencer: -346, status: "concluida", termoStatus: "subido_sr", assinaturaStatus: "assinado", prazoCritico: false },
      { id: "m2", nome: "M2 — Módulo de testes A/B", vencimento: "28/05/2026", diasParaVencer: 1, status: "critica", termoStatus: "aguardando_assinatura", assinaturaStatus: "aguardando", prazoCritico: true },
      { id: "m3", nome: "M3 — Integração com CRM", vencimento: "31/10/2026", diasParaVencer: 157, status: "no_prazo", termoStatus: "nao_gerado", assinaturaStatus: "nao_enviado", prazoCritico: false },
    ],
  },
  {
    id: "p4",
    codigo: "PEIA-2024.0022",
    nome: "Portal CEIA — Gestão de Projetos",
    coordenador: "Anderson Lima",
    empresa: "CEIA / UFG",
    fase: "Execução",
    status: "em_execucao",
    proximaAcao: "Acompanhar entrega M2 (em desenvolvimento)",
    proximoPrazo: "30/07/2026",
    diasParaPrazo: 64,
    alertasCount: 0,
    alertaCritico: false,
    vigencia: "01/02/2025 — 31/01/2027",
    timeline: [
      { id: "e2", titulo: "Cadastro das macroentregas no SRINFO", responsavel: "PMO", data: "02/02/2025", status: "concluido" },
      { id: "e3", titulo: "Criação da organização GitHub", responsavel: "PMO / TI", data: "04/02/2025", status: "concluido" },
      { id: "e4", titulo: "Envio do e-mail de onboarding", responsavel: "PMO", data: "05/02/2025", status: "concluido" },
      { id: "e5", titulo: "Agendamento do onboarding", responsavel: "PMO", data: "07/02/2025", status: "concluido" },
      { id: "e6", titulo: "Onboarding realizado", responsavel: "PMO + Coordenador", data: "12/02/2025", status: "concluido" },
      { id: "e7", titulo: "Projeto em execução", responsavel: "Coordenador", data: "12/02/2025", status: "em_andamento" },
      { id: "e8", titulo: "Encerramento do projeto", responsavel: "Coordenador + PMO", status: "pendente" },
    ],
    macroentregas: [
      { id: "m1", nome: "M1 — Cadastro de projetos", vencimento: "31/07/2025", diasParaVencer: -300, status: "concluida", termoStatus: "subido_sr", assinaturaStatus: "assinado", prazoCritico: false },
      { id: "m2", nome: "M2 — Central de Solicitações", vencimento: "30/07/2026", diasParaVencer: 64, status: "no_prazo", termoStatus: "nao_gerado", assinaturaStatus: "nao_enviado", prazoCritico: false },
    ],
  },
  {
    id: "p5",
    codigo: "PEIA-2024.0007",
    nome: "Plataforma de Logística Inteligente",
    coordenador: "Marcos Antunes",
    empresa: "TransLog Brasil",
    fase: "Onboarding",
    status: "atrasado",
    proximaAcao: "Reenviar e-mail de onboarding (sem resposta há 12 dias)",
    proximoPrazo: "15/05/2026",
    diasParaPrazo: -12,
    alertasCount: 5,
    alertaCritico: true,
    vigencia: "01/04/2026 — 31/03/2028",
    dataAssinatura: "15/04/2026",
    timeline: [
      { id: "e2", titulo: "Cadastro das macroentregas no SRINFO", responsavel: "PMO", data: "20/04/2026", status: "concluido" },
      { id: "e3", titulo: "Criação da organização GitHub", responsavel: "PMO / TI", data: "25/04/2026", status: "concluido" },
      { id: "e4", titulo: "Envio do e-mail de onboarding", responsavel: "PMO", data: "03/05/2026", status: "atrasado", descricao: "Sem retorno do coordenador há 12 dias." },
      { id: "e5", titulo: "Agendamento do onboarding", responsavel: "PMO", status: "pendente" },
      { id: "e6", titulo: "Onboarding realizado", responsavel: "PMO + Coordenador", status: "pendente" },
      { id: "e7", titulo: "Projeto em execução", responsavel: "Coordenador", status: "pendente" },
      { id: "e8", titulo: "Encerramento do projeto", responsavel: "Coordenador + PMO", status: "pendente" },
    ],
    macroentregas: [
      { id: "m1", nome: "M1 — Diagnóstico operacional", vencimento: "31/07/2026", diasParaVencer: 65, status: "no_prazo", termoStatus: "nao_gerado", assinaturaStatus: "nao_enviado", prazoCritico: false },
    ],
  },
  {
    id: "p6",
    codigo: "PEIA-2023.0019",
    nome: "Visão Computacional para Indústria 4.0",
    coordenador: "Patrícia Lemos",
    empresa: "MetalForge S.A.",
    fase: "Encerramento",
    status: "finalizado",
    proximaAcao: "Nenhuma — projeto finalizado",
    proximoPrazo: "—",
    diasParaPrazo: 0,
    alertasCount: 0,
    alertaCritico: false,
    vigencia: "01/06/2023 — 31/05/2025",
    timeline: [
      { id: "e2", titulo: "Cadastro das macroentregas no SRINFO", responsavel: "PMO", data: "29/05/2023", status: "concluido" },
      { id: "e3", titulo: "Criação da organização GitHub", responsavel: "PMO / TI", data: "30/05/2023", status: "concluido" },
      { id: "e4", titulo: "Envio do e-mail de onboarding", responsavel: "PMO", data: "01/06/2023", status: "concluido" },
      { id: "e5", titulo: "Agendamento do onboarding", responsavel: "PMO", data: "05/06/2023", status: "concluido" },
      { id: "e6", titulo: "Onboarding realizado", responsavel: "PMO + Coordenador", data: "12/06/2023", status: "concluido" },
      { id: "e7", titulo: "Projeto em execução", responsavel: "Coordenador", data: "31/05/2025", status: "concluido" },
      { id: "e8", titulo: "Encerramento do projeto", responsavel: "Coordenador + PMO", data: "15/06/2025", status: "concluido" },
    ],
    macroentregas: [
      { id: "m1", nome: "M1 — Sistema de inspeção visual", vencimento: "30/11/2023", diasParaVencer: -908, status: "concluida", termoStatus: "subido_sr", assinaturaStatus: "assinado", prazoCritico: false },
      { id: "m2", nome: "M2 — Integração com PLC", vencimento: "31/05/2025", diasParaVencer: -361, status: "concluida", termoStatus: "subido_sr", assinaturaStatus: "assinado", prazoCritico: false },
    ],
  },
  {
    id: "p7",
    codigo: "PEIA-2026.0003",
    nome: "Modelagem Preditiva de Demanda Energética",
    coordenador: "Felipe Andrade",
    empresa: "Eletro Sul Distribuidora",
    fase: "Onboarding",
    status: "onboarding",
    proximaAcao: "Cadastrar macroentregas no SRINFO",
    proximoPrazo: "05/06/2026",
    diasParaPrazo: 9,
    alertasCount: 1,
    alertaCritico: false,
    novoParaPmo: true,
    vigencia: "15/05/2026 — 14/05/2028",
    dataAssinatura: "15/05/2026",
    timeline: [
      { id: "e2", titulo: "Cadastro das macroentregas no SRINFO", responsavel: "PMO", status: "em_andamento" },
      { id: "e3", titulo: "Criação da organização GitHub", responsavel: "PMO / TI", status: "pendente" },
      { id: "e4", titulo: "Envio do e-mail de onboarding", responsavel: "PMO", status: "pendente" },
      { id: "e5", titulo: "Agendamento do onboarding", responsavel: "PMO", status: "pendente" },
      { id: "e6", titulo: "Onboarding realizado", responsavel: "PMO + Coordenador", status: "pendente" },
      { id: "e7", titulo: "Projeto em execução", responsavel: "Coordenador", status: "pendente" },
      { id: "e8", titulo: "Encerramento do projeto", responsavel: "Coordenador + PMO", status: "pendente" },
    ],
    macroentregas: [
      { id: "m1", nome: "M1 — Coleta e tratamento de dados", vencimento: "30/09/2026", diasParaVencer: 126, status: "no_prazo", termoStatus: "nao_gerado", assinaturaStatus: "nao_enviado", prazoCritico: false, naoIniciada: true },
      { id: "m2", nome: "M2 — Modelo preditivo de consumo", vencimento: "31/03/2027", diasParaVencer: 308, status: "no_prazo", termoStatus: "nao_gerado", assinaturaStatus: "nao_enviado", prazoCritico: false },
      { id: "m3", nome: "M3 — Painel de projeção energética", vencimento: "30/09/2027", diasParaVencer: 491, status: "no_prazo", termoStatus: "nao_gerado", assinaturaStatus: "nao_enviado", prazoCritico: false },
    ],
  },
  {
    id: "p8",
    codigo: "PEIA-2026.0005",
    nome: "Assistente Virtual para Atendimento Hospitalar",
    coordenador: "Bruna Rocha",
    empresa: "RedeSaúde Hospitais",
    fase: "Onboarding",
    status: "onboarding",
    proximaAcao: "Criar organização no GitHub",
    proximoPrazo: "02/06/2026",
    diasParaPrazo: 6,
    alertasCount: 0,
    alertaCritico: false,
    vigencia: "01/05/2026 — 30/04/2028",
    dataAssinatura: "28/04/2026",
    timeline: [
      { id: "e2", titulo: "Cadastro das macroentregas no SRINFO", responsavel: "PMO", data: "05/05/2026", status: "concluido" },
      { id: "e3", titulo: "Criação da organização GitHub", responsavel: "PMO / TI", status: "em_andamento", descricao: "TI aguardando aprovação do nome da organização." },
      { id: "e4", titulo: "Envio do e-mail de onboarding", responsavel: "PMO", status: "pendente" },
      { id: "e5", titulo: "Agendamento do onboarding", responsavel: "PMO", status: "pendente" },
      { id: "e6", titulo: "Onboarding realizado", responsavel: "PMO + Coordenador", status: "pendente" },
      { id: "e7", titulo: "Projeto em execução", responsavel: "Coordenador", status: "pendente" },
      { id: "e8", titulo: "Encerramento do projeto", responsavel: "Coordenador + PMO", status: "pendente" },
    ],
    macroentregas: [
      { id: "m1", nome: "M1 — Mapeamento dos fluxos clínicos", vencimento: "31/08/2026", diasParaVencer: 96, status: "no_prazo", termoStatus: "nao_gerado", assinaturaStatus: "nao_enviado", prazoCritico: false },
      { id: "m2", nome: "M2 — MVP do assistente", vencimento: "31/12/2026", diasParaVencer: 218, status: "no_prazo", termoStatus: "nao_gerado", assinaturaStatus: "nao_enviado", prazoCritico: false },
    ],
  },
  {
    id: "p9",
    codigo: "PEIA-2026.0001",
    nome: "Plataforma de Telemetria Agrícola",
    coordenador: "Diego Vasconcelos",
    empresa: "AgroNova Sementes",
    fase: "Onboarding",
    status: "onboarding",
    proximaAcao: "Realizar reunião de onboarding com o coordenador",
    proximoPrazo: "29/05/2026",
    diasParaPrazo: 2,
    alertasCount: 0,
    alertaCritico: false,
    vigencia: "01/04/2026 — 31/03/2028",
    dataAssinatura: "25/03/2026",
    timeline: [
      { id: "e2", titulo: "Cadastro das macroentregas no SRINFO", responsavel: "PMO", data: "30/03/2026", status: "concluido" },
      { id: "e3", titulo: "Criação da organização GitHub", responsavel: "PMO / TI", data: "02/04/2026", status: "concluido" },
      { id: "e4", titulo: "Envio do e-mail de onboarding", responsavel: "PMO", data: "08/04/2026", status: "concluido" },
      { id: "e5", titulo: "Agendamento do onboarding", responsavel: "PMO", data: "20/05/2026", status: "concluido" },
      { id: "e6", titulo: "Onboarding realizado", responsavel: "PMO + Coordenador", status: "agendado", descricao: "Reunião marcada para 29/05/2026 às 14h." },
      { id: "e7", titulo: "Projeto em execução", responsavel: "Coordenador", status: "pendente" },
      { id: "e8", titulo: "Encerramento do projeto", responsavel: "Coordenador + PMO", status: "pendente" },
    ],
    macroentregas: [
      { id: "m1", nome: "M1 — Arquitetura da telemetria", vencimento: "31/07/2026", diasParaVencer: 65, status: "no_prazo", termoStatus: "nao_gerado", assinaturaStatus: "nao_enviado", prazoCritico: false },
      { id: "m2", nome: "M2 — Piloto em fazenda parceira", vencimento: "30/11/2026", diasParaVencer: 187, status: "no_prazo", termoStatus: "nao_gerado", assinaturaStatus: "nao_enviado", prazoCritico: false },
    ],
  },
  {
    id: "p10",
    codigo: "PEIA-2026.0004",
    nome: "Reconhecimento de Fraudes em Tempo Real",
    coordenador: "Lucas Pereira",
    empresa: "FinSecure Pagamentos",
    fase: "Onboarding",
    status: "onboarding",
    proximaAcao: "Enviar e-mail de onboarding ao coordenador",
    proximoPrazo: "30/05/2026",
    diasParaPrazo: 3,
    alertasCount: 0,
    alertaCritico: false,
    vigencia: "10/05/2026 — 09/05/2028",
    dataAssinatura: "08/05/2026",
    timeline: [
      { id: "e2", titulo: "Cadastro das macroentregas no SRINFO", responsavel: "PMO", data: "12/05/2026", status: "concluido" },
      { id: "e3", titulo: "Criação da organização GitHub", responsavel: "PMO / TI", data: "18/05/2026", status: "concluido" },
      { id: "e4", titulo: "Envio do e-mail de onboarding", responsavel: "PMO", status: "em_andamento", descricao: "Aguardando template revisado antes do envio." },
      { id: "e5", titulo: "Agendamento do onboarding", responsavel: "PMO", status: "pendente" },
      { id: "e6", titulo: "Onboarding realizado", responsavel: "PMO + Coordenador", status: "pendente" },
      { id: "e7", titulo: "Projeto em execução", responsavel: "Coordenador", status: "pendente" },
      { id: "e8", titulo: "Encerramento do projeto", responsavel: "Coordenador + PMO", status: "pendente" },
    ],
    macroentregas: [
      { id: "m1", nome: "M1 — Pipeline de ingestão de eventos", vencimento: "30/09/2026", diasParaVencer: 126, status: "no_prazo", termoStatus: "nao_gerado", assinaturaStatus: "nao_enviado", prazoCritico: false },
      { id: "m2", nome: "M2 — Modelo de detecção em produção", vencimento: "28/02/2027", diasParaVencer: 277, status: "no_prazo", termoStatus: "nao_gerado", assinaturaStatus: "nao_enviado", prazoCritico: false },
    ],
  },
  // ─── Em encerramento — casos ───────────────────────────────────────────────
  {
    id: "p11",
    codigo: "PEIA-2024.0012",
    nome: "Análise Semântica de Documentos Jurídicos",
    coordenador: "Helena Vieira",
    empresa: "LexAI Consultoria",
    fase: "Encerramento",
    status: "em_execucao",
    proximaAcao: "Coordenador deve preencher Termo de Encerramento e Avaliação Final",
    proximoPrazo: "10/06/2026",
    diasParaPrazo: 14,
    alertasCount: 0,
    alertaCritico: false,
    vigencia: "01/06/2024 — 31/05/2026",
    termoEncerramentoConcluido: false,
    avaliacaoFinalConcluida: false,
    timeline: [
      { id: "e2", titulo: "Cadastro das macroentregas no SRINFO", responsavel: "PMO", data: "05/06/2024", status: "concluido" },
      { id: "e3", titulo: "Criação da organização GitHub", responsavel: "PMO / TI", data: "10/06/2024", status: "concluido" },
      { id: "e4", titulo: "Envio do e-mail de onboarding", responsavel: "PMO", data: "12/06/2024", status: "concluido" },
      { id: "e5", titulo: "Agendamento do onboarding", responsavel: "PMO", data: "18/06/2024", status: "concluido" },
      { id: "e6", titulo: "Onboarding realizado", responsavel: "PMO + Coordenador", data: "25/06/2024", status: "concluido" },
      { id: "e7", titulo: "Projeto em execução", responsavel: "Coordenador", data: "25/06/2024", status: "concluido" },
      { id: "e8", titulo: "Encerramento do projeto", responsavel: "Coordenador + PMO", status: "em_andamento", descricao: "Todas as macroentregas concluídas. Aguardando termo e avaliação." },
    ],
    macroentregas: [
      { id: "m1", nome: "M1 — Corpus jurídico anotado", vencimento: "30/11/2024", diasParaVencer: -544, status: "concluida", termoStatus: "subido_sr", assinaturaStatus: "assinado", prazoCritico: false },
      { id: "m2", nome: "M2 — Modelo de classificação", vencimento: "30/05/2026", diasParaVencer: 3, status: "concluida", termoStatus: "subido_sr", assinaturaStatus: "assinado", prazoCritico: false },
    ],
  },
  {
    id: "p12",
    codigo: "PEIA-2024.0015",
    nome: "Otimização de Rotas para Frotas Urbanas",
    coordenador: "Eduardo Sampaio",
    empresa: "MoveCity Logística",
    fase: "Encerramento",
    status: "em_execucao",
    proximaAcao: "Aguardando coordenador responder a Avaliação Final",
    proximoPrazo: "05/06/2026",
    diasParaPrazo: 9,
    alertasCount: 0,
    alertaCritico: false,
    vigencia: "15/05/2024 — 14/05/2026",
    termoEncerramentoConcluido: true,
    avaliacaoFinalConcluida: false,
    timeline: [
      { id: "e2", titulo: "Cadastro das macroentregas no SRINFO", responsavel: "PMO", data: "20/05/2024", status: "concluido" },
      { id: "e3", titulo: "Criação da organização GitHub", responsavel: "PMO / TI", data: "22/05/2024", status: "concluido" },
      { id: "e4", titulo: "Envio do e-mail de onboarding", responsavel: "PMO", data: "23/05/2024", status: "concluido" },
      { id: "e5", titulo: "Agendamento do onboarding", responsavel: "PMO", data: "28/05/2024", status: "concluido" },
      { id: "e6", titulo: "Onboarding realizado", responsavel: "PMO + Coordenador", data: "04/06/2024", status: "concluido" },
      { id: "e7", titulo: "Projeto em execução", responsavel: "Coordenador", data: "04/06/2024", status: "concluido" },
      { id: "e8", titulo: "Encerramento do projeto", responsavel: "Coordenador + PMO", status: "em_andamento", descricao: "Termo de encerramento entregue. Aguardando avaliação final do coordenador." },
    ],
    macroentregas: [
      { id: "m1", nome: "M1 — Algoritmo de roteirização", vencimento: "30/11/2024", diasParaVencer: -544, status: "concluida", termoStatus: "subido_sr", assinaturaStatus: "assinado", prazoCritico: false },
      { id: "m2", nome: "M2 — Integração com frota piloto", vencimento: "14/05/2026", diasParaVencer: -13, status: "concluida", termoStatus: "subido_sr", assinaturaStatus: "assinado", prazoCritico: false },
    ],
  },
  {
    id: "p13",
    codigo: "PEIA-2024.0020",
    nome: "Classificação Automática de Imagens Médicas",
    coordenador: "Rafael Monteiro",
    empresa: "MediScan Diagnósticos",
    fase: "Encerramento",
    status: "em_execucao",
    proximaAcao: "Coordenador deve gerar Termo de Encerramento",
    proximoPrazo: "31/05/2026",
    diasParaPrazo: 4,
    alertasCount: 1,
    alertaCritico: false,
    vigencia: "01/07/2024 — 30/06/2026",
    termoEncerramentoConcluido: false,
    avaliacaoFinalConcluida: true,
    timeline: [
      { id: "e2", titulo: "Cadastro das macroentregas no SRINFO", responsavel: "PMO", data: "05/07/2024", status: "concluido" },
      { id: "e3", titulo: "Criação da organização GitHub", responsavel: "PMO / TI", data: "08/07/2024", status: "concluido" },
      { id: "e4", titulo: "Envio do e-mail de onboarding", responsavel: "PMO", data: "10/07/2024", status: "concluido" },
      { id: "e5", titulo: "Agendamento do onboarding", responsavel: "PMO", data: "15/07/2024", status: "concluido" },
      { id: "e6", titulo: "Onboarding realizado", responsavel: "PMO + Coordenador", data: "22/07/2024", status: "concluido" },
      { id: "e7", titulo: "Projeto em execução", responsavel: "Coordenador", data: "22/07/2024", status: "concluido" },
      { id: "e8", titulo: "Encerramento do projeto", responsavel: "Coordenador + PMO", status: "em_andamento", descricao: "Avaliação final entregue. Aguardando termo de encerramento." },
    ],
    macroentregas: [
      { id: "m1", nome: "M1 — Dataset anotado e protocolo", vencimento: "31/01/2025", diasParaVencer: -482, status: "concluida", termoStatus: "subido_sr", assinaturaStatus: "assinado", prazoCritico: false },
      { id: "m2", nome: "M2 — Modelo validado em piloto", vencimento: "30/04/2026", diasParaVencer: -27, status: "concluida", termoStatus: "subido_sr", assinaturaStatus: "assinado", prazoCritico: false },
    ],
  },
  {
    id: "p14",
    codigo: "PEIA-2023.0028",
    nome: "Detecção de Anomalias em Redes Industriais",
    coordenador: "Sandra Albuquerque",
    empresa: "PetroNet Engenharia",
    fase: "Encerramento",
    status: "atrasado",
    proximaAcao: "Encerramento em atraso — escalar com coordenação",
    proximoPrazo: "30/04/2026",
    diasParaPrazo: -27,
    alertasCount: 3,
    alertaCritico: true,
    vigencia: "01/04/2024 — 31/03/2026",
    termoEncerramentoConcluido: false,
    avaliacaoFinalConcluida: false,
    timeline: [
      { id: "e2", titulo: "Cadastro das macroentregas no SRINFO", responsavel: "PMO", data: "08/04/2024", status: "concluido" },
      { id: "e3", titulo: "Criação da organização GitHub", responsavel: "PMO / TI", data: "12/04/2024", status: "concluido" },
      { id: "e4", titulo: "Envio do e-mail de onboarding", responsavel: "PMO", data: "15/04/2024", status: "concluido" },
      { id: "e5", titulo: "Agendamento do onboarding", responsavel: "PMO", data: "20/04/2024", status: "concluido" },
      { id: "e6", titulo: "Onboarding realizado", responsavel: "PMO + Coordenador", data: "28/04/2024", status: "concluido" },
      { id: "e7", titulo: "Projeto em execução", responsavel: "Coordenador", data: "28/04/2024", status: "concluido" },
      { id: "e8", titulo: "Encerramento do projeto", responsavel: "Coordenador + PMO", status: "atrasado", descricao: "Encerramento previsto para 30/04/2026 — sem retorno do coordenador." },
    ],
    macroentregas: [
      { id: "m1", nome: "M1 — Mapeamento da rede SCADA", vencimento: "31/10/2024", diasParaVencer: -574, status: "concluida", termoStatus: "subido_sr", assinaturaStatus: "assinado", prazoCritico: false },
      { id: "m2", nome: "M2 — Detector de anomalias em produção", vencimento: "31/03/2026", diasParaVencer: -57, status: "concluida", termoStatus: "subido_sr", assinaturaStatus: "assinado", prazoCritico: false },
    ],
  },
];

// ─── Tokens visuais (alinhados ao tema do app) ─────────────────────────────────

type StatusMeta = { label: string; pill: string; dot: string; soft: string; ring: string };

const STATUS_META: Record<ProjectStatus, StatusMeta> = {
  onboarding: {
    label: "Onboarding",
    pill: "bg-sky-100 text-sky-700",
    dot: "bg-sky-500",
    soft: "bg-sky-50 text-sky-700 border-sky-200",
    ring: "ring-sky-200",
  },
  em_execucao: {
    label: "Em execução",
    pill: "bg-emerald-100 text-emerald-700",
    dot: "bg-emerald-500",
    soft: "bg-emerald-50 text-emerald-700 border-emerald-200",
    ring: "ring-emerald-200",
  },
  aguardando_assinatura: {
    label: "Aguardando assinatura",
    pill: "bg-violet-100 text-violet-700",
    dot: "bg-violet-500",
    soft: "bg-violet-50 text-violet-700 border-violet-200",
    ring: "ring-violet-200",
  },
  macroentrega_pendente: {
    label: "Macroentrega pendente",
    pill: "bg-amber-100 text-amber-700",
    dot: "bg-amber-500",
    soft: "bg-amber-50 text-amber-700 border-amber-200",
    ring: "ring-amber-200",
  },
  atrasado: {
    label: "Atrasado",
    pill: "bg-rose-100 text-rose-700",
    dot: "bg-rose-500",
    soft: "bg-rose-50 text-rose-700 border-rose-200",
    ring: "ring-rose-200",
  },
  finalizado: {
    label: "Finalizado",
    pill: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground/60",
    soft: "bg-muted text-muted-foreground border-border",
    ring: "ring-border",
  },
};

const ETAPA_META: Record<
  EtapaStatus,
  { label: string; pill: string; ringOuter: string; Icon: typeof CheckCircle2; iconClass: string }
> = {
  pendente: { label: "Pendente", pill: "bg-muted text-muted-foreground", ringOuter: "border-border bg-card text-muted-foreground", Icon: CircleDashed, iconClass: "" },
  em_andamento: { label: "Em andamento", pill: "bg-sky-100 text-sky-700", ringOuter: "border-sky-400 bg-sky-50 text-sky-600", Icon: Loader2, iconClass: "animate-spin" },
  agendado: { label: "Agendado", pill: "bg-indigo-100 text-indigo-700", ringOuter: "border-indigo-400 bg-indigo-50 text-indigo-600", Icon: CalendarClock, iconClass: "" },
  realizado: { label: "Realizado", pill: "bg-emerald-100 text-emerald-700", ringOuter: "border-emerald-400 bg-emerald-50 text-emerald-600", Icon: CheckCircle2, iconClass: "" },
  concluido: { label: "Concluído", pill: "bg-emerald-100 text-emerald-700", ringOuter: "border-primary bg-primary text-primary-foreground", Icon: Check, iconClass: "" },
  atrasado: { label: "Atrasado", pill: "bg-rose-100 text-rose-700", ringOuter: "border-rose-400 bg-rose-50 text-rose-600", Icon: AlertTriangle, iconClass: "" },
};

function PrazoBadge({ dias, label }: { dias: number; label: string }) {
  if (label === "—") return <span className="text-xs text-muted-foreground">—</span>;
  const atrasado = dias < 0;
  const critico = dias >= 0 && dias <= 5;
  const cls = atrasado
    ? "bg-rose-50 text-rose-700 border-rose-200"
    : critico
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : "bg-card text-muted-foreground border-border";
  const txt = atrasado ? `${Math.abs(dias)} dias em atraso` : dias === 0 ? "vence hoje" : `em ${dias} dia${dias > 1 ? "s" : ""}`;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium", cls)}>
      <CalendarClock className="size-3" />
      <span>{txt}</span>
    </span>
  );
}

// ─── Página raiz ───────────────────────────────────────────────────────────────

function OnboardingPmoPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [projetosNovosAcessados, setProjetosNovosAcessados] = useState<Set<string>>(() => new Set());
  const selected = selectedId ? PROJETOS.find((p) => p.id === selectedId) ?? null : null;

  function abrirProjeto(id: string) {
    const projeto = PROJETOS.find((p) => p.id === id);
    if (projeto?.novoParaPmo) {
      setProjetosNovosAcessados((prev) => {
        if (prev.has(id)) return prev;
        const next = new Set(prev);
        next.add(id);
        return next;
      });
    }
    setSelectedId(id);
  }

  return (
    <div className="w-full">
      {selected ? (
        <ProjetoDetalhe projeto={selected} onVoltar={() => setSelectedId(null)} />
      ) : (
        <ProjetosLista projetos={PROJETOS} projetosNovosAcessados={projetosNovosAcessados} onAbrir={abrirProjeto} />
      )}
    </div>
  );
}

// ─── TELA 1 — Lista operacional ────────────────────────────────────────────────

type KanbanColuna = {
  key: "onboarding" | "em_execucao" | "encerramento";
  label: string;
  descricao: string;
  Icon: typeof Rocket;
  match: (p: ProjetoOperacional) => boolean;
  accentBar: string;     // barra superior (cor sólida)
  laneBg: string;        // fundo da lane
  headerBorder: string;  // borda inferior do header
  iconBox: string;       // chip do ícone no header
  countChip: string;     // chip do contador
};

function isEmEncerramento(p: ProjetoOperacional) {
  const e8 = p.timeline.find((e) => e.id === "e8");
  return p.status === "finalizado" || e8?.status === "em_andamento" || e8?.status === "concluido" || e8?.status === "realizado";
}

function isProjetoEmExecucao(p: ProjetoOperacional) {
  return p.status === "em_execucao" || p.status === "aguardando_assinatura" || p.status === "macroentrega_pendente" || p.status === "atrasado";
}

function getMacroentregaAtual(projeto: ProjetoOperacional) {
  const index = projeto.macroentregas.findIndex((m) => m.status !== "concluida");
  if (index < 0) return null;
  return { macro: projeto.macroentregas[index], indicador: index + 1 };
}

function getMacroentregaAtualStatusMeta(projeto: ProjetoOperacional): StatusMeta | null {
  const atual = getMacroentregaAtual(projeto);
  if (!atual) {
    return {
      label: "Macroentregas concluídas",
      pill: "bg-emerald-100 text-emerald-700",
      dot: "bg-emerald-500",
      soft: "bg-emerald-50 text-emerald-700 border-emerald-200",
      ring: "ring-emerald-200",
    };
  }

  const { macro, indicador } = atual;
  const prefix = `M${indicador}`;
  const atrasada = macro.status === "vencida" || macro.diasParaVencer < 0 || macro.assinaturaStatus === "atrasado";
  const critica = macro.status === "critica" || macro.prazoCritico || macro.diasParaVencer <= 5;

  if (atrasada) {
    return {
      label: `${prefix} · Macroentrega vencida`,
      pill: "bg-rose-100 text-rose-700",
      dot: "bg-rose-500",
      soft: "bg-rose-50 text-rose-700 border-rose-200",
      ring: "ring-rose-200",
    };
  }

  if (macro.assinaturaStatus === "aguardando" || macro.termoStatus === "aguardando_assinatura") {
    return {
      label: `${prefix} · Aguardando assinatura`,
      pill: "bg-violet-100 text-violet-700",
      dot: "bg-violet-500",
      soft: "bg-violet-50 text-violet-700 border-violet-200",
      ring: "ring-violet-200",
    };
  }

  if (macro.termoStatus === "nao_gerado") {
    return {
      label: `${prefix} · Macroentrega pendente`,
      pill: critica ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700",
      dot: critica ? "bg-rose-500" : "bg-amber-500",
      soft: critica ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-amber-50 text-amber-700 border-amber-200",
      ring: critica ? "ring-rose-200" : "ring-amber-200",
    };
  }

  if (macro.termoStatus === "rascunho") {
    return {
      label: `${prefix} · Termo em rascunho`,
      pill: "bg-amber-100 text-amber-700",
      dot: "bg-amber-500",
      soft: "bg-amber-50 text-amber-700 border-amber-200",
      ring: "ring-amber-200",
    };
  }

  if (macro.termoStatus === "assinado") {
    return {
      label: `${prefix} · Aguardando SRINFO`,
      pill: "bg-sky-100 text-sky-700",
      dot: "bg-sky-500",
      soft: "bg-sky-50 text-sky-700 border-sky-200",
      ring: "ring-sky-200",
    };
  }

  return {
    label: `${prefix} · Em andamento`,
    pill: "bg-sky-100 text-sky-700",
    dot: "bg-sky-500",
    soft: "bg-sky-50 text-sky-700 border-sky-200",
    ring: "ring-sky-200",
  };
}

function getProjetoStatusMeta(projeto: ProjetoOperacional, emEncerramento = isEmEncerramento(projeto)): StatusMeta {
  if (emEncerramento) {
    return {
      label: "Em encerramento",
      pill: "bg-violet-100 text-violet-700",
      dot: "bg-violet-500",
      soft: "bg-violet-50 text-violet-700 border-violet-200",
      ring: "ring-violet-200",
    };
  }

  if (isProjetoEmExecucao(projeto)) {
    return getMacroentregaAtualStatusMeta(projeto) ?? STATUS_META[projeto.status];
  }

  return STATUS_META[projeto.status];
}

const KANBAN_COLUNAS: KanbanColuna[] = [
  {
    key: "onboarding",
    label: "Projetos em Onboarding",
    descricao: "Preparação inicial",
    Icon: Rocket,
    match: (p) => p.status === "onboarding" && !isEmEncerramento(p),
    accentBar: "bg-sky-200",
    laneBg: "bg-sky-50/60 dark:bg-sky-950/15",
    headerBorder: "border-border",
    iconBox: "bg-background text-primary border border-border",
    countChip: "bg-background text-foreground border border-border",
  },
  {
    key: "em_execucao",
    label: "Projetos em Execução",
    descricao: "Acompanhamento de macroentregas",
    Icon: Activity,
    match: (p) => !isEmEncerramento(p) && isProjetoEmExecucao(p),
    accentBar: "bg-cyan-200",
    laneBg: "bg-cyan-50/60 dark:bg-cyan-950/15",
    headerBorder: "border-border",
    iconBox: "bg-background text-primary border border-border",
    countChip: "bg-background text-foreground border border-border",
  },
  {
    key: "encerramento",
    label: "Projetos em Encerramento",
    descricao: "Termo de encerramento e avaliação final",
    Icon: FileCheck2,
    match: isEmEncerramento,
    accentBar: "bg-violet-200",
    laneBg: "bg-violet-50/60 dark:bg-violet-950/15",
    headerBorder: "border-border",
    iconBox: "bg-background text-primary border border-border",
    countChip: "bg-background text-foreground border border-border",
  },
];

function ProjetosLista({
  projetos,
  projetosNovosAcessados,
  onAbrir,
}: {
  projetos: ProjetoOperacional[];
  projetosNovosAcessados: Set<string>;
  onAbrir: (id: string) => void;
}) {
  const [busca, setBusca] = useState("");

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return projetos;
    return projetos.filter((p) =>
      p.nome.toLowerCase().includes(q) ||
      p.codigo.toLowerCase().includes(q) ||
      p.coordenador.toLowerCase().includes(q) ||
      p.empresa.toLowerCase().includes(q)
    );
  }, [projetos, busca]);

  const colunas = useMemo(() => {
    const onboardingEtapaIds = ["e2", "e3", "e4", "e5", "e6"];
    const onboardingProgresso = (p: ProjetoOperacional) =>
      p.timeline.filter(
        (e) => onboardingEtapaIds.includes(e.id) && (e.status === "concluido" || e.status === "realizado"),
      ).length;
    return KANBAN_COLUNAS.map((col) => {
      let lista = filtrados.filter((p) => col.match(p));
      if (col.key === "onboarding") {
        lista = [...lista].sort((a, b) => onboardingProgresso(a) - onboardingProgresso(b));
      }
      if (col.key === "encerramento") {
        lista = [...lista].sort((a, b) => Number(a.status === "finalizado") - Number(b.status === "finalizado"));
      }
      return { ...col, projetos: lista };
    });
  }, [filtrados]);

  const resumo = useMemo(() => {
    const atrasados = projetos.filter((p) => p.status === "atrasado" || p.diasParaPrazo < 0).length;
    const assinaturaPendente = projetos.filter((p) => p.status === "aguardando_assinatura").length;
    const macroPendente = projetos.filter((p) => p.status === "macroentrega_pendente").length;
    const encerramentoPendente = projetos.filter(
      (p) => isEmEncerramento(p) && (p.termoEncerramentoConcluido === false || p.avaliacaoFinalConcluida === false),
    ).length;
    return { atrasados, assinaturaPendente, macroPendente, encerramentoPendente };
  }, [projetos]);

  return (
    <div className="p-6 md:p-10 w-full">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight uppercase">Painel PMO</h1>
          <p className="text-muted-foreground mt-2 max-w-none whitespace-nowrap">
            Central operacional do PMO — acompanhe projetos por fase, status da macroentrega atual, pendências e encerramentos.
          </p>
        </div>
      </div>



      {/* Busca */}
      <div className="mb-5">
        <div className="relative">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome, código, coordenador ou empresa..."
            className="w-full h-11 pl-10 pr-4 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Kanban */}
      <div className="grid gap-5 lg:grid-cols-3">
        {colunas.map((col) => (
          <section
            key={col.key}
            className={cn(
              "flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm",
              col.laneBg
            )}
          >
            {/* Header da coluna */}
            <header
              className={cn(
                "flex items-center gap-3 border-b px-4 py-3.5",
                col.headerBorder
              )}
            >
              <span
                className={cn(
                  "inline-flex size-9 shrink-0 items-center justify-center rounded-lg",
                  col.iconBox
                )}
              >
                <col.Icon className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-semibold leading-tight text-foreground">
                  {col.label}
                </h3>
                <p className="truncate text-[11px] text-muted-foreground">{col.descricao}</p>
              </div>
              <span
                className={cn(
                  "inline-flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-[11px] font-bold tabular-nums",
                  col.countChip
                )}
              >
                {col.projetos.length}
              </span>
            </header>

            {/* Corpo da lane — cards */}
            <div className="flex flex-1 flex-col gap-3 p-3 min-h-[420px]">
              {col.projetos.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed bg-card/40 px-4 py-8 text-center">
                  <CircleDashed className="size-5 text-muted-foreground/60" />
                  <p className="mt-2 text-xs font-medium text-muted-foreground">
                    Nenhum projeto
                  </p>
                  <p className="text-[11px] text-muted-foreground/70">
                    nesta fase
                  </p>
                </div>
              ) : (
                col.projetos.map((p) => (
                  <ProjetoLinhaCard
                    key={p.id}
                    projeto={{ ...p, novoParaPmo: !!p.novoParaPmo && !projetosNovosAcessados.has(p.id) }}
                    coluna={col.key}
                    onAbrir={() => onAbrir(p.id)}
                  />
                ))
              )}
            </div>
          </section>
        ))}
      </div>

      {filtrados.length === 0 && busca.trim() && (
        <div className="mt-4 rounded-xl border bg-card p-10 text-center">
          <Search className="mx-auto size-6 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            Nenhum projeto encontrado para "{busca}".
          </p>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  hint,
  value,
  tone,
  pulse,
}: {
  icon: React.ReactNode;
  label: string;
  hint?: string;
  value: number;
  tone: "primary" | "warning" | "info" | "muted" | "purple" | "success" | "danger";
  pulse?: boolean;
}) {
  const toneClasses: Record<typeof tone, string> = {
    primary: "bg-primary-soft text-primary border-primary/20",
    warning:
      "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900",
    info: "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-900",
    purple:
      "bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-900",
    success:
      "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900",
    danger:
      "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900",
    muted: "bg-muted text-muted-foreground border-border",
  };
  return (
    <div className="rounded-xl border bg-card p-4 flex items-center gap-3 hover:shadow-sm transition-shadow">
      <div
        className={cn(
          "size-10 rounded-lg border flex items-center justify-center shrink-0 relative",
          toneClasses[tone]
        )}
      >
        {icon}
        {pulse && value > 0 && (
          <span className="absolute -top-1 -right-1 flex size-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
            <span className="relative inline-flex rounded-full size-2.5 bg-current" />
          </span>
        )}
      </div>
      <div className="min-w-0">
        <div className="text-2xl font-bold leading-none text-foreground">{value}</div>
        <div className="text-xs font-medium text-foreground mt-1 leading-tight">{label}</div>
        {hint && (
          <div className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{hint}</div>
        )}
      </div>
    </div>
  );
}

function ProjetoLinhaCard({
  projeto,
  coluna,
  onAbrir,
}: {
  projeto: ProjetoOperacional;
  coluna: "onboarding" | "em_execucao" | "encerramento";
  onAbrir: () => void;
}) {
  // Sinal único e essencial por coluna — ícone, label curto e métrica compacta.
  const sinal = useMemo(() => {
    if (coluna === "onboarding") {
      const labels: Record<string, { label: string; Icon: typeof Mail }> = {
        e2: { label: "Cadastrar MEs no SRINFO", Icon: ListChecks },
        e3: { label: "Criar organização no GitHub", Icon: Github },
        e4: { label: "Enviar e-mail de onboarding", Icon: Mail },
        e5: { label: "Agendar reunião de onboarding", Icon: CalendarClock },
        e6: { label: "Realizar reunião de onboarding", Icon: CheckCircle2 },
      };
      const ids = ["e2", "e3", "e4", "e5", "e6"];
      const etapas = ids
        .map((id) => projeto.timeline.find((e) => e.id === id))
        .filter(Boolean) as EtapaTimeline[];
      const proximaIdx = etapas.findIndex((e) => !(e.status === "concluido" || e.status === "realizado"));
      const proxima = proximaIdx >= 0 ? etapas[proximaIdx] : null;
      const info = proxima ? labels[proxima.id] : { label: "Pronto para iniciar", Icon: CheckCircle2 };
      // Posição da etapa atual no fluxo (e2 = 0, e3 = 1, ... e6 = 4). Quando tudo concluído, exibe total/total.
      const posicao = proxima ? proximaIdx : etapas.length;
      return {
        Icon: info.Icon,
        label: info.label,
        metric: `${posicao}/${etapas.length}`,
        accent: "text-sky-700",
      };
    }
    if (coluna === "em_execucao") {
      const total = projeto.macroentregas.length;
      const concluidas = projeto.macroentregas.filter((m) => m.status === "concluida").length;
      const proxima = projeto.macroentregas.find((m) => m.status !== "concluida");
      const dias = proxima?.diasParaVencer ?? 0;
      const prazo = !proxima
        ? "Todas entregues"
        : dias < 0
          ? `${Math.abs(dias)}d em atraso`
          : dias <= 7
            ? `vence em ${dias}d`
            : `${dias}d restantes`;
      const accent =
        proxima && dias < 0
          ? "text-rose-700"
          : proxima && dias <= 7
            ? "text-amber-700"
            : "text-emerald-700";
      return {
        Icon: Target,
        label: proxima ? `${proxima.nome.split(" — ")[0]} · ${prazo}` : prazo,
        metric: `${concluidas}/${total}`,
        accent,
      };
    }
    // encerramento
    const e8 = projeto.timeline.find((e) => e.id === "e8");
    const finalizado = e8?.status === "concluido" || e8?.status === "realizado";
    const atrasadoE8 = e8?.status === "atrasado";
    const termoOk = projeto.termoEncerramentoConcluido ?? finalizado;
    const avalOk = projeto.avaliacaoFinalConcluida ?? finalizado;
    const feitos = (termoOk ? 1 : 0) + (avalOk ? 1 : 0);

    let icon: typeof Mail;
    let label: string;
    let accent: string;

    if (finalizado || feitos === 2) {
      icon = CheckCircle2;
      label = `Finalizado em ${e8?.data ?? "—"}`;
      accent = "text-emerald-700";
    } else if (atrasadoE8) {
      icon = AlertTriangle;
      label = "Encerramento em atraso";
      accent = "text-rose-700";
    } else if (termoOk && !avalOk) {
      icon = ClipboardList;
      label = "Avaliação Final pendente";
      accent = "text-violet-700";
    } else if (!termoOk && avalOk) {
      icon = FileCheck2;
      label = "Termo de Encerramento pendente";
      accent = "text-violet-700";
    } else {
      icon = FileCheck2;
      label = "Termo e Avaliação pendentes";
      accent = "text-violet-700";
    }

    return {
      Icon: icon,
      label,
      metric: `${feitos}/2`,
      accent,
    };
  }, [projeto, coluna]);

  const urgente = useMemo(() => {
    if (coluna === "em_execucao") {
      // macroentrega vencida/crítica/com prazo apertado ou marcada como crítica
      return projeto.macroentregas.some(
        (m) =>
          m.status !== "concluida" &&
          (m.diasParaVencer < 0 ||
            m.diasParaVencer <= 5 ||
            m.status === "critica" ||
            m.status === "vencida" ||
            m.prazoCritico),
      );
    }
    if (coluna === "encerramento") {
      // passou do tempo de encerramento
      const e8 = projeto.timeline.find((e) => e.id === "e8");
      return e8?.status === "atrasado";
    }
    return false;
  }, [projeto, coluna]);

  return (
    <button
      type="button"
      onClick={onAbrir}
      className={cn(
        "group relative flex w-full flex-col overflow-hidden rounded-xl border bg-card p-4 text-left shadow-xs transition-all hover:-translate-y-0.5 hover:border-foreground/15 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        projeto.novoParaPmo && "border-primary/40 shadow-md hover:border-primary/60"
      )}
    >
      {/* Linha 1 — código + indicador discreto de urgência */}
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] tracking-wide text-muted-foreground">
          {projeto.codigo}
        </span>
        <div className="flex items-center gap-1.5">
          {projeto.novoParaPmo && (
            <span
              className="inline-flex items-center gap-1 rounded-full border border-primary/25 bg-primary/5 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary"
              title="Novo projeto ainda não acessado pelo PMO"
            >
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
              </span>
              Novo
            </span>
          )}
          {urgente && (
            <span
              className="inline-flex items-center gap-1 rounded-full border border-rose-500/25 bg-rose-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-rose-700"
              title="Requer atenção"
            >
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-500 opacity-75" />
                <span className="relative inline-flex size-1.5 rounded-full bg-rose-500" />
              </span>
              Atenção
            </span>
          )}
        </div>
      </div>

      {/* Linha 2 — título */}
      <h3 className="mt-1.5 line-clamp-2 text-[15px] font-semibold leading-snug text-foreground">
        {projeto.nome}
      </h3>

      {/* Linha 3 — coordenador (única meta visível) */}
      <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
        Coord. {projeto.coordenador} · {projeto.empresa}
      </p>

      {/* Linha de sinal — única informação operacional do card */}
      <div className="mt-3 flex items-center gap-2 border-t pt-3">
        <sinal.Icon className={cn("size-3.5 shrink-0", sinal.accent)} />
        <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-foreground">
          {sinal.label}
        </span>
        <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 font-mono text-[11px] font-semibold tabular-nums text-foreground">
          {sinal.metric}
        </span>
      </div>
    </button>
  );
}

// ─── TELA 2 — Detalhe operacional ──────────────────────────────────────────────

type DetailTabKey = "visao-geral" | "macroentregas";

const DETAIL_TABS: { key: DetailTabKey; label: string; icon: typeof LayoutDashboard }[] = [
  { key: "visao-geral", label: "Visão geral", icon: LayoutDashboard },
  { key: "macroentregas", label: "Macroentregas", icon: Target },
];

function ProjetoDetalhe({
  projeto: projetoInicial,
  onVoltar,
}: {
  projeto: ProjetoOperacional;
  onVoltar: () => void;
}) {
  const [tab, setTab] = useState<DetailTabKey>("visao-geral");
  const [projeto, setProjeto] = useState<ProjetoOperacional>(projetoInicial);
  const [githubDialogOpen, setGithubDialogOpen] = useState(false);
  const emEncerramento = isEmEncerramento(projeto);
  const statusMeta = getProjetoStatusMeta(projeto, emEncerramento);
  const alertasGerados = useMemo(() => gerarAlertas(projeto), [projeto]);
  const detailTabs = DETAIL_TABS;

  const hoje = useMemo(() => {
    const d = new Date();
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  }, []);

  function marcarEtapa(etapaId: string, extra?: { githubUrl?: string }) {
    setProjeto((prev) => {
      const timeline = prev.timeline.map((e) =>
        e.id === etapaId ? { ...e, status: "concluido" as EtapaStatus, data: hoje } : e
      );
      let novoStatus = prev.status;
      let novaFase = prev.fase;
      let macroentregas = prev.macroentregas;
      // e6 concluído → projeto entra em execução
      if (etapaId === "e6") {
        const idx = timeline.findIndex((e) => e.id === "e7");
        if (idx >= 0) {
          timeline[idx] = { ...timeline[idx], status: "em_andamento", data: hoje };
        }
        novoStatus = "em_execucao";
        novaFase = "Execução";
        // Define automaticamente o início planejado da primeira macroentrega
        if (prev.macroentregas.length > 0) {
          macroentregas = prev.macroentregas.map((m, i) =>
            i === 0 && !m.inicioPlanejado ? { ...m, inicioPlanejado: hoje } : m
          );
        }
      }
      return {
        ...prev,
        timeline,
        macroentregas,
        status: novoStatus,
        fase: novaFase,
        githubUrl: extra?.githubUrl ?? prev.githubUrl,
      };
    });
  }

  function anexarTermoMacro(macroId: string) {
    setProjeto((prev) => {
      const macroentregas = prev.macroentregas.map((m) =>
        m.id === macroId
          ? { ...m, termoStatus: "subido_sr" as Macroentrega["termoStatus"], assinaturaStatus: "assinado" as Macroentrega["assinaturaStatus"], status: "concluida" as Macroentrega["status"] }
          : m
      );
      // Se todas as macroentregas estão com termo no SRINFO → encerramento entra em andamento
      const todasConcluidas = macroentregas.every(
        (m) => m.termoStatus === "subido_sr" || m.termoStatus === "assinado"
      );
      let timeline = prev.timeline;
      if (todasConcluidas) {
        timeline = prev.timeline.map((e) =>
          e.id === "e8" && (e.status === "pendente" || e.status === "atrasado")
            ? { ...e, status: "em_andamento" as EtapaStatus }
            : e
        );
      }
      return { ...prev, macroentregas, timeline };
    });
  }

  return (
    <div className="p-6 md:p-10 w-full">
      {/* Voltar */}
      <button
        type="button"
        onClick={onVoltar}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Voltar para a central
      </button>

      {/* Header do projeto (mesmo padrão das outras telas) */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Hash className="size-3" />
            <span className="font-mono">{projeto.codigo}</span>
          </div>
          <h1 className="mt-1 text-2xl md:text-3xl font-bold tracking-tight">{projeto.nome}</h1>
          <div className="text-sm text-muted-foreground mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>Empresa: {projeto.empresa}</span>
            <span className="size-1 rounded-full bg-muted-foreground/60" />
            <span>Coordenador: {projeto.coordenador}</span>
            <span className="size-1 rounded-full bg-muted-foreground/60" />
            <span>Vigência: {projeto.vigencia}</span>
            {projeto.dataAssinatura && projeto.status !== "onboarding" && (
              <>
                <span className="size-1 rounded-full bg-muted-foreground/60" />
                <span>Assinado em {projeto.dataAssinatura}</span>
              </>
            )}
          </div>
        </div>
        <div className={cn("shrink-0 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide", statusMeta.pill)}>
          <span className={cn("size-1.5 rounded-full", statusMeta.dot)} />
          {statusMeta.label}
        </div>
      </div>

      {/* Tab bar (padrão projetos.index.tsx) */}
      <div
        className="border-b mb-6 flex overflow-x-auto"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" } as React.CSSProperties}
      >
        {detailTabs.map((t) => {
          const isActive = t.key === tab;
          const Icon = t.icon;
          let badge: number | null = null;
          if (t.key === "macroentregas" && projeto.macroentregas.length > 0) badge = projeto.macroentregas.length;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className="relative flex flex-1 min-w-[160px] items-center justify-center gap-2 px-4 py-3 text-sm font-medium -mb-px whitespace-nowrap"
            >
              <div className={cn("flex items-center gap-2", isActive ? "text-primary" : "text-muted-foreground")}>
                <Icon className="size-4" />
                <span>{t.label}</span>
                {badge !== null && (
                  <span
                    className={cn(
                      "ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold",
                      isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {badge}
                  </span>
                )}
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-[2px] overflow-hidden">
                <span
                  style={{
                    display: "block",
                    height: "100%",
                    backgroundColor: "var(--primary)",
                    transform: isActive ? "scaleX(1)" : "scaleX(0)",
                    transformOrigin: "center",
                    transition: "transform 360ms cubic-bezier(.2,.9,.2,1)",
                  }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {tab === "visao-geral" && (
        <VisaoGeralTab
          projeto={projeto}
          alertas={alertasGerados}
          onMarcarEtapa={marcarEtapa}
          onAbrirGithubDialog={() => setGithubDialogOpen(true)}
        />
      )}
      {tab === "macroentregas" && (
        <MacroentregasView projeto={projeto} onAnexarTermo={anexarTermoMacro} />
      )}

      <GithubUrlDialog
        open={githubDialogOpen}
        onOpenChange={setGithubDialogOpen}
        onConfirm={(url) => {
          marcarEtapa("e3", { githubUrl: url });
          setGithubDialogOpen(false);
        }}
      />
    </div>
  );
}

// ─── Tab: Visão Geral ──────────────────────────────────────────────────────────

function VisaoGeralTab({
  projeto,
  alertas,
  onMarcarEtapa,
  onAbrirGithubDialog,
}: {
  projeto: ProjetoOperacional;
  alertas: AlertaItem[];
  onMarcarEtapa: (etapaId: string) => void;
  onAbrirGithubDialog: () => void;
}) {
  const emOnboarding = projeto.status === "onboarding" && !isEmEncerramento(projeto);

  if (emOnboarding) {
    return (
      <OnboardingVisaoGeral
        projeto={projeto}
        alertas={alertas}
        onMarcarEtapa={onMarcarEtapa}
        onAbrirGithubDialog={onAbrirGithubDialog}
      />
    );
  }

  const emEncerramento = isEmEncerramento(projeto);

  return (
    <div className="space-y-6">
      {emEncerramento && (
        <EncerramentoSection projeto={projeto} />
      )}

      <div>
        {/* Em encerramento: foca em Termo + Avaliação Final (acima).
            Em execução: mostra a linha do tempo das macroentregas. */}
        {!emEncerramento && <MacroentregasTimelineSection projeto={projeto} />}

        <div className={cn(!emEncerramento && "mt-6")}>
          <TimelineSection projeto={projeto} />
        </div>
      </div>
    </div>
  );
}

// ── Visão Geral — versão Onboarding ─────────────────────────────────────────

function OnboardingVisaoGeral({
  projeto,
  alertas,
  onMarcarEtapa,
  onAbrirGithubDialog,
}: {
  projeto: ProjetoOperacional;
  alertas: AlertaItem[];
  onMarcarEtapa: (etapaId: string) => void;
  onAbrirGithubDialog: () => void;
}) {
  const etapas = useMemo(() => {
    const byId = new Map(projeto.timeline.map((e) => [e.id, e]));
    return CHECKLIST_BASE.map((c, idx) => {
      const etapa = byId.get(c.etapaId);
      return {
        ...c,
        index: idx,
        status: (etapa?.status ?? "pendente") as EtapaStatus,
        data: etapa?.data,
        descricao: etapa?.descricao,
        responsavel: etapa?.responsavel ?? "PMO",
      };
    });
  }, [projeto]);

  const done = etapas.filter((e) => e.status === "concluido" || e.status === "realizado").length;
  const total = etapas.length;
  const pct = Math.round((done / total) * 100);
  const proximaIdx = etapas.findIndex((e) => !(e.status === "concluido" || e.status === "realizado"));

  // Envio automatizado do e-mail de onboarding (etapa e4)
  const e4 = etapas.find((e) => e.etapaId === "e4");
  const e4Concluida = e4?.status === "concluido" || e4?.status === "realizado";
  const e4Ativa = proximaIdx >= 0 && etapas[proximaIdx].etapaId === "e4";
  useEffect(() => {
    if (!e4Ativa || e4Concluida) return;
    const t = setTimeout(() => {
      onMarcarEtapa("e4");
    }, 3500);
    return () => clearTimeout(t);
  }, [e4Ativa, e4Concluida, onMarcarEtapa]);

  return (
    <div className="space-y-6">
      <ProximaAcaoBanner projeto={projeto} qtdAlertas={alertas.length} hideAction />

      <div>
        {/* Roadmap central */}
        <section className="rounded-xl border bg-card overflow-hidden">
          <div className="px-5 py-4 border-b bg-muted/30 flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Rocket className="size-4 text-primary" />
                <h3 className="text-sm font-semibold">Roadmap de onboarding</h3>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                Cinco etapas até o projeto começar a executar.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="tabular-nums">
                <span className="font-semibold text-foreground">{done}</span>/{total} concluídas
              </span>
              <div className="h-1.5 w-28 overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
              </div>
              <span className="font-semibold tabular-nums text-foreground">{pct}%</span>
            </div>
          </div>

          <ol className="relative px-5 py-5">
            {/* linha conectora */}
            <span
              aria-hidden
              className="pointer-events-none absolute left-[38px] top-8 bottom-8 w-px bg-border"
            />
            {etapas.map((etapa) => {
              const concluido = etapa.status === "concluido" || etapa.status === "realizado";
              const ativa = etapa.index === proximaIdx;
              // Normaliza visualmente: "realizado" → concluido; etapa ativa não concluída → em_andamento (loader girando)
              const metaKey: EtapaStatus = concluido
                ? "concluido"
                : ativa
                  ? "em_andamento"
                  : etapa.status;
              const meta = ETAPA_META[metaKey];
              const Icon = meta.Icon;
              const atrasada = etapa.status === "atrasado";
              const isGithub = etapa.etapaId === "e3";
              const StepIcon = etapa.icon;
              return (
                <li key={etapa.id} className="relative flex gap-4 pb-5 last:pb-0">
                  {/* círculo da etapa */}
                  <div
                    className={cn(
                      "relative z-10 mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-full border-2 shadow-xs",
                      meta.ringOuter,
                      ativa && "ring-4 ring-primary/15"
                    )}
                  >
                    <Icon className={cn("size-4", meta.iconClass)} strokeWidth={concluido ? 3 : 2} />
                  </div>

                  <div
                    className={cn(
                      "min-w-0 flex-1 rounded-lg border p-4 transition-colors",
                      ativa
                        ? "border-primary/30 bg-primary-soft"
                        : atrasada
                          ? "border-rose-200 bg-rose-50/60"
                          : concluido
                            ? "border-emerald-200/70 bg-emerald-50/40"
                            : "border-border bg-muted/20"
                    )}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono uppercase text-muted-foreground">
                            Etapa {String(etapa.index + 1).padStart(2, "0")}
                          </span>
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                              meta.pill
                            )}
                          >
                            {meta.label}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <StepIcon className="size-4 text-foreground/80" />
                          <h4
                            className={cn(
                              "text-sm font-semibold leading-tight",
                              concluido ? "text-muted-foreground line-through" : "text-foreground"
                            )}
                          >
                            {etapa.label}
                          </h4>
                        </div>
                      </div>
                      {ativa && !concluido && (
                        etapa.etapaId === "e4" ? (
                          <span className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border border-sky-200 bg-sky-50 px-3 text-xs font-medium text-sky-700">
                            <Loader2 className="size-3.5 animate-spin" />
                            Enviando e-mail...
                          </span>
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            className="h-8 shrink-0 gap-1.5"
                            onClick={() => (isGithub ? onAbrirGithubDialog() : onMarcarEtapa(etapa.etapaId))}
                          >
                            <Check className="size-3.5" />
                            Marcar como concluída
                          </Button>
                        )
                      )}
                    </div>

                    {etapa.data && (
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="size-3" />
                          {etapa.data}
                        </span>
                      </div>
                    )}

                    {ativa && !concluido && isGithub && projeto.githubUrl && (
                      <a
                        href={projeto.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <Github className="size-3" />
                        <span className="truncate max-w-[260px]">{projeto.githubUrl}</span>
                      </a>
                    )}

                    {concluido && isGithub && projeto.githubUrl && (
                      <a
                        href={projeto.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <Github className="size-3" />
                        <span className="truncate max-w-[260px]">{projeto.githubUrl}</span>
                      </a>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        <div className="mt-6">
          <TimelineSection projeto={projeto} />
        </div>
      </div>
    </div>
  );
}

function ProximaAcaoBanner({ projeto, qtdAlertas, hideAction }: { projeto: ProjetoOperacional; qtdAlertas: number; hideAction?: boolean }) {
  const atrasado = projeto.diasParaPrazo < 0;
  const critico = projeto.diasParaPrazo >= 0 && projeto.diasParaPrazo <= 5;
  // Em onboarding (hideAction), padroniza tom amarelinho claro independente de prazo/alertas.
  const tone = hideAction ? "amber" : atrasado || critico ? "rose" : qtdAlertas > 0 ? "amber" : "primary";
  const tones: Record<string, { ring: string; bg: string; icon: string; iconBg: string }> = {
    rose: { ring: "border-rose-200", bg: "bg-rose-50/60", icon: "text-rose-600", iconBg: "bg-rose-100" },
    amber: { ring: "border-amber-200", bg: "bg-amber-50/60", icon: "text-amber-600", iconBg: "bg-amber-100" },
    primary: { ring: "border-primary/30", bg: "bg-primary-soft", icon: "text-primary", iconBg: "bg-primary/10" },
  };
  const t = tones[tone];
  const etapaAtual = projeto.timeline.find(
    (e) => e.status !== "concluido" && e.status !== "realizado"
  );
  const roadmapLabel = etapaAtual
    ? CHECKLIST_BASE.find((c) => c.etapaId === etapaAtual.id)?.label
    : undefined;
  const acaoAtual = roadmapLabel ?? etapaAtual?.titulo ?? projeto.proximaAcao;
  return (
    <div className={cn("rounded-xl border p-5", t.ring, t.bg)}>
      <div className="flex flex-wrap items-start gap-4">
        <div className={cn("inline-flex size-10 shrink-0 items-center justify-center rounded-lg", t.iconBg)}>
          <Rocket className={cn("size-5", t.icon)} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Ação operacional atual
          </div>
          <p className="mt-0.5 text-base font-semibold text-foreground">{acaoAtual}</p>
        </div>
        {!hideAction && (
          <Button size="sm" className="gap-1.5">
            Executar ação
            <ArrowUpRight className="size-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}

// ── Timeline ─────────────────────────────────────────────────────────────────

function TimelineSection({ projeto }: { projeto: ProjetoOperacional }) {
  const concluidas = projeto.timeline.filter((e) => e.status === "concluido" || e.status === "realizado").length;
  const total = projeto.timeline.length;
  const pct = Math.round((concluidas / total) * 100);
  const proximaIdx = projeto.timeline.findIndex((e) => e.status !== "concluido" && e.status !== "realizado");

  return (
    <section className="rounded-xl border bg-card overflow-hidden">
      <div className="px-5 py-4 border-b bg-muted/30 flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="size-4 text-primary" />
            <h3 className="text-sm font-semibold">Timeline operacional do projeto</h3>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Fluxo padrão do PMO — do contrato até a execução do projeto.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="tabular-nums">{concluidas}/{total}</span>
          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
          </div>
          <span className="font-semibold tabular-nums text-foreground">{pct}%</span>
        </div>
      </div>

      {/* Desktop: stepper horizontal */}
      <div className="hidden md:block p-5">
        <ol className="flex items-start justify-between gap-2">
          {projeto.timeline.map((etapa, idx) => {
            const isDone = etapa.status === "concluido" || etapa.status === "realizado";
            const ativa = idx === proximaIdx;
            const metaKey: EtapaStatus = isDone ? "concluido" : ativa ? "em_andamento" : etapa.status;
            const meta = ETAPA_META[metaKey];
            const Icon = meta.Icon;
            const next = projeto.timeline[idx + 1];
            const nextDone = next ? (next.status === "concluido" || next.status === "realizado") : false;
            const connectorDone = isDone || (nextDone && etapa.status !== "atrasado");
            return (
              <li key={etapa.id} className="flex-1 flex flex-col items-center min-w-0 relative">
                {idx < projeto.timeline.length - 1 && (
                  <span
                    aria-hidden
                    className={cn(
                      "absolute top-4 left-1/2 w-full h-[2px]",
                      connectorDone ? "bg-primary" : "bg-border"
                    )}
                  />
                )}
                <div
                  className={cn(
                    "relative z-10 size-8 rounded-full flex items-center justify-center border-2",
                    meta.ringOuter
                  )}
                  title={etapa.titulo}
                >
                  <Icon className={cn("size-4", meta.iconClass)} strokeWidth={isDone ? 3 : 2} />
                </div>
                <div className="mt-2 px-1 text-center">
                  <div className="text-[10px] font-mono uppercase text-muted-foreground">
                    Etapa {String(idx + 1).padStart(2, "0")}
                  </div>
                  <div className="text-xs font-medium leading-tight text-foreground">
                    {etapa.titulo}
                  </div>
                  {etapa.data && (
                    <div className="mt-0.5 text-[10px] text-muted-foreground">{etapa.data}</div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Mobile: stepper vertical */}
      <ol className="md:hidden relative px-5 py-5">
        <span className="pointer-events-none absolute left-[34px] top-6 bottom-6 w-px bg-border" aria-hidden />
        {projeto.timeline.map((etapa, i) => {
          const isDone = etapa.status === "concluido" || etapa.status === "realizado";
          const ativa = i === proximaIdx;
          const metaKey: EtapaStatus = isDone ? "concluido" : ativa ? "em_andamento" : etapa.status;
          const meta = ETAPA_META[metaKey];
          const Icon = meta.Icon;
          return (
            <li key={etapa.id} className="relative flex gap-4 pb-5 last:pb-0">
              <div className={cn("relative z-10 mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full border-2", meta.ringOuter)}>
                <Icon className={cn("size-3.5", meta.iconClass)} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-mono text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-sm font-medium text-foreground">{etapa.titulo}</span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground">
                  <span>{etapa.responsavel}</span>
                  {etapa.data && <span>· {etapa.data}</span>}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

// ── Checklist ────────────────────────────────────────────────────────────────

const CHECKLIST_BASE: { id: string; label: string; icon: typeof Mail; etapaId: string }[] = [
  { id: "c1", label: "Cadastrar macroentregas no SRINFO", icon: ListChecks, etapaId: "e2" },
  { id: "c2", label: "Criar organização GitHub", icon: Github, etapaId: "e3" },
  { id: "c3", label: "Enviar e-mail de onboarding", icon: Mail, etapaId: "e4" },
  { id: "c4", label: "Agendar onboarding", icon: CalendarClock, etapaId: "e5" },
  { id: "c5", label: "Realizar onboarding", icon: CheckCircle2, etapaId: "e6" },
];

function ChecklistSection({
  projeto,
  onMarcarEtapa,
  onAbrirGithubDialog,
}: {
  projeto: ProjetoOperacional;
  onMarcarEtapa: (etapaId: string) => void;
  onAbrirGithubDialog: () => void;
}) {
  const estado = useMemo(() => {
    const byId = new Map(projeto.timeline.map((e) => [e.id, e]));
    return CHECKLIST_BASE.map((c) => {
      const etapa = byId.get(c.etapaId);
      const status: EtapaStatus = etapa?.status ?? "pendente";
      return { ...c, status, data: etapa?.data };
    });
  }, [projeto]);
  const done = estado.filter((e) => e.status === "concluido" || e.status === "realizado").length;

  return (
    <section className="rounded-xl border bg-card overflow-hidden">
      <div className="px-5 py-4 border-b bg-muted/30">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ListChecks className="size-4 text-primary" />
            <h3 className="text-sm font-semibold">Checklist operacional</h3>
          </div>
          <span className="text-xs font-semibold tabular-nums text-muted-foreground">{done}/{estado.length}</span>
        </div>
      </div>
      <ul className="divide-y">
        {estado.map((item) => {
          const concluido = item.status === "concluido" || item.status === "realizado";
          const atrasado = item.status === "atrasado";
          const andamento = item.status === "em_andamento" || item.status === "agendado";
          const Icon = item.icon;
          const acionavel = !concluido;
          const isGithub = item.etapaId === "e3";
          return (
            <li key={item.id} className="flex items-start gap-3 px-5 py-3">
              <div
                className={cn(
                  "mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full border-2",
                  concluido && "border-primary bg-primary text-primary-foreground",
                  atrasado && "border-rose-400 bg-rose-50 text-rose-600",
                  andamento && "border-sky-400 bg-sky-50 text-sky-600",
                  !concluido && !atrasado && !andamento && "border-border bg-card text-muted-foreground"
                )}
              >
                {concluido ? (
                  <Check className="size-3" strokeWidth={3} />
                ) : atrasado ? (
                  <AlertTriangle className="size-3" />
                ) : andamento ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <CircleDashed className="size-3" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Icon className="size-3.5 text-muted-foreground" />
                    <span className={cn("leading-tight", concluido ? "text-muted-foreground line-through" : "text-foreground")}>
                      {item.label}
                    </span>
                  </div>
                  {item.data && (
                    <span className="shrink-0 text-[10px] text-muted-foreground tabular-nums">{item.data}</span>
                  )}
                </div>
                {/* Mostra URL do GitHub quando salva */}
                {item.etapaId === "e3" && concluido && projeto.githubUrl && (
                  <a
                    href={projeto.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
                  >
                    <Github className="size-3" />
                    <span className="truncate max-w-[200px]">{projeto.githubUrl}</span>
                  </a>
                )}
                {acionavel && (
                  <div className="mt-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-7 gap-1 text-xs"
                      onClick={() => (isGithub ? onAbrirGithubDialog() : onMarcarEtapa(item.etapaId))}
                    >
                      {isGithub ? (
                        <>
                          <Github className="size-3.5" />
                          Informar URL
                        </>
                      ) : (
                        <>
                          <Check className="size-3.5" />
                          Marcar como pronto
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

// ── Linha do tempo das macroentregas ─────────────────────────────────────────

// Data "atual" da plataforma (mesma referência do Gantt da Equipe Administrativa).
const TIMELINE_TODAY_YM = "2026-05";

function dateToYm(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function dateToMonthYearBR(d: Date): string {
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function ymCompareLocal(a: string, b: string): number {
  return a.localeCompare(b);
}

function ymToIndexLocal(ym: string, originYm: string): number {
  const o = parseYearMonth(originYm);
  const t = parseYearMonth(ym);
  return (t.year - o.year) * 12 + (t.month - o.month);
}

function MacroentregasTimelineSection({ projeto }: { projeto: ProjetoOperacional }) {
  const macros = projeto.macroentregas;

  // vigência: "DD/MM/YYYY — DD/MM/YYYY"
  const [vigIni, vigFim] = useMemo(() => {
    const parts = projeto.vigencia.split(/[—–-]/).map((s) => s.trim());
    return [parseDateBR(parts[0] ?? ""), parseDateBR(parts[1] ?? "")] as const;
  }, [projeto.vigencia]);

  // calcula intervalos (start → end) de cada macro como YM
  const bars = useMemo(() => {
    if (!vigIni || !vigFim) return [];
    const out: {
      id: string;
      nome: string;
      curto: string;
      status: Macroentrega["status"];
      startYm: string;
      endYm: string;
      vencimentoStr: string;
    }[] = [];
    let previousEndDate = vigIni;
    for (const [index, macro] of macros.entries()) {
      const fim =
        parseDateBR(macro.finalPlanejado ?? "") ??
        parseDateBR(macro.vencimento) ??
        vigFim;
      const plannedStartDate = index === 0
        ? parseDateBR(macro.inicioPlanejado ?? "") ?? vigIni
        : addDays(previousEndDate, 1);
      const startDate = plannedStartDate > fim ? fim : plannedStartDate;
      out.push({
        id: macro.id,
        nome: macro.nome,
        curto: macro.nome.split(/[—–-]/)[0]?.trim() || macro.nome,
        status: macro.status,
        startYm: dateToYm(startDate),
        endYm: dateToYm(fim),
        vencimentoStr: dateToMonthYearBR(fim),
      });
      previousEndDate = fim;
    }
    return out;
  }, [macros, vigIni, vigFim]);

  // janela de meses: cobre vigência + todas as barras
  const { originYm, months, totalCols } = useMemo(() => {
    if (!vigIni || !vigFim || bars.length === 0) {
      return { originYm: "", months: [] as string[], totalCols: 0 };
    }
    let minYm = dateToYm(vigIni);
    let maxYm = dateToYm(vigFim);
    for (const b of bars) {
      if (ymCompareLocal(b.startYm, minYm) < 0) minYm = b.startYm;
      if (ymCompareLocal(b.endYm, maxYm) > 0) maxYm = b.endYm;
    }
    const out: string[] = [];
    let { year, month } = parseYearMonth(minYm);
    const end = parseYearMonth(maxYm);
    while (year < end.year || (year === end.year && month <= end.month)) {
      out.push(`${year}-${String(month).padStart(2, "0")}`);
      const n = nextMonth(year, month);
      year = n.year;
      month = n.month;
    }
    return { originYm: minYm, months: out, totalCols: out.length };
  }, [bars, vigIni, vigFim]);

  const todayIdx = totalCols > 0 ? ymToIndexLocal(TIMELINE_TODAY_YM, originYm) : -1;
  const todayInsideWindow = todayIdx >= 0 && todayIdx < totalCols;

  // cor OKLCH por status (alinhada à paleta da página)
  function statusCor(s: Macroentrega["status"]): string {
    switch (s) {
      case "concluida":
        return "oklch(0.7 0.15 156)"; // emerald
      case "critica":
      case "vencida":
        return "oklch(0.62 0.22 25)"; // rose
      case "alerta":
        return "oklch(0.78 0.16 80)"; // amber
      default:
        return "oklch(0.62 0.18 240)"; // sky
    }
  }

  function statusLabel(s: Macroentrega["status"]) {
    return s === "concluida"
      ? "Concluída"
      : s === "critica"
        ? "Crítica"
        : s === "alerta"
          ? "Em alerta"
          : s === "vencida"
            ? "Vencida"
            : "No prazo";
  }

  // Agrupar anos para cabeçalho de ano
  const yearHeaders: { year: number; span: number }[] = [];
  months.forEach((ym) => {
    const { year } = parseYearMonth(ym);
    const last = yearHeaders[yearHeaders.length - 1];
    if (last && last.year === year) last.span += 1;
    else yearHeaders.push({ year, span: 1 });
  });

  const COL_W = 64;
  const LEFT_W = 220;
  const ROW_H = 44;

  return (
    <section className="rounded-2xl border bg-card overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b bg-muted/30 flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Target className="size-4 text-primary" />
            <h3 className="text-sm font-semibold">Linha do tempo das macroentregas</h3>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Visão geral do cronograma das macroentregas dentro da vigência do projeto.
          </p>
        </div>
        <span className="text-xs text-muted-foreground">
          {macros.length} no total
        </span>
      </div>

      {bars.length === 0 || totalCols === 0 ? (
        <div className="p-5 text-sm text-muted-foreground">
          Nenhuma macroentrega cadastrada para exibir na linha do tempo.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <div style={{ minWidth: LEFT_W + totalCols * COL_W }}>
              {/* HEADER ANOS */}
              <div className="flex border-b bg-muted/40 sticky top-0 z-10">
                <div
                  className="shrink-0 px-4 py-2 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold border-r flex items-center justify-center sticky left-0 z-[6]"
                  style={{
                    width: LEFT_W,
                    background: "color-mix(in oklch, var(--muted) 40%, var(--card))",
                  }}
                >
                  Macroentrega
                </div>
                <div className="flex">
                  {yearHeaders.map((yh, i) => (
                    <div
                      key={i}
                      className="border-r text-center py-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider"
                      style={{ width: yh.span * COL_W }}
                    >
                      {yh.year}
                    </div>
                  ))}
                </div>
              </div>

              {/* HEADER MESES */}
              <div className="flex border-b bg-muted/20">
                <div
                  className="shrink-0 border-r sticky left-0 z-[6]"
                  style={{
                    width: LEFT_W,
                    background: "color-mix(in oklch, var(--muted) 20%, var(--card))",
                  }}
                />
                <div className="flex">
                  {months.map((ym, i) => {
                    const { month } = parseYearMonth(ym);
                    const isToday = ym === TIMELINE_TODAY_YM;
                    return (
                      <div
                        key={i}
                        className={cn(
                          "border-r text-center py-1.5 text-[10.5px] font-medium tabular-nums",
                          isToday ? "text-primary font-bold" : "text-muted-foreground",
                        )}
                        style={{ width: COL_W }}
                      >
                        {["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"][month - 1]}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ROWS */}
              <div className="relative">
                {/* Linha vertical de HOJE */}
                {todayInsideWindow && (
                  <div
                    className="absolute top-0 bottom-0 pointer-events-none z-[5]"
                    style={{
                      left: LEFT_W + todayIdx * COL_W + COL_W / 2 - 1,
                      width: 2,
                    }}
                  >
                    <div
                      className="w-[2px] h-full bg-primary/70"
                      style={{ boxShadow: "0 0 0 1px var(--background)" }}
                    />
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 size-2.5 rounded-full bg-primary border-2 border-background" />
                  </div>
                )}

                {bars.map((b, mi) => {
                  const startIdx = ymToIndexLocal(b.startYm, originYm);
                  const endIdx = ymToIndexLocal(b.endYm, originYm);
                  const visStart = Math.max(0, startIdx);
                  const visEnd = Math.min(totalCols - 1, endIdx);
                  const cor = statusCor(b.status);
                  const clippedStart = visStart > startIdx;
                  const clippedEnd = visEnd < endIdx;
                  const left = visStart * COL_W + 4;
                  const width = (visEnd - visStart + 1) * COL_W - 8;

                  // estados auxiliares
                  const monthsToEnd = monthsBetween(TIMELINE_TODAY_YM, b.endYm);
                  const endingSoon =
                    b.status !== "concluida" &&
                    monthsToEnd > 0 &&
                    monthsToEnd <= 2 &&
                    ymCompareLocal(b.endYm, TIMELINE_TODAY_YM) >= 0;
                  const finalizada =
                    b.status === "concluida" || ymCompareLocal(b.endYm, TIMELINE_TODAY_YM) < 0;
                  const naoIniciada = ymCompareLocal(b.startYm, TIMELINE_TODAY_YM) > 0;
                  const dateLabel = b.status === "concluida" ? b.vencimentoStr : `vence ${b.vencimentoStr}`;
                  const titleDateLabel = b.status === "concluida" ? `concluída em ${b.vencimentoStr}` : `vencimento ${b.vencimentoStr}`;

                  return (
                    <div
                      key={b.id}
                      className={cn(
                        "flex border-b last:border-b-0",
                        mi % 2 === 1 && "bg-muted/15",
                      )}
                    >
                      {/* Coluna fixa do rótulo */}
                      <div
                        className="shrink-0 border-r p-3 sticky left-0 z-[7] flex items-center"
                        style={{
                          width: LEFT_W,
                          background:
                            mi % 2 === 1
                              ? "color-mix(in oklch, var(--muted) 15%, var(--card))"
                              : "var(--card)",
                        }}
                      >
                        <div className="flex items-center gap-2 w-full min-w-0">
                          <div
                            className="size-9 rounded-full flex items-center justify-center font-semibold text-xs shrink-0"
                            style={{
                              background: `color-mix(in oklch, ${cor} 18%, white)`,
                              color: `color-mix(in oklch, ${cor} 55%, black)`,
                            }}
                          >
                            {mi + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div
                              className="font-semibold text-sm text-foreground truncate"
                              title={b.nome}
                            >
                              {b.nome}
                            </div>
                            <div
                              className="text-[11px] font-medium mt-0.5 truncate"
                              style={{ color: `color-mix(in oklch, ${cor} 55%, black)` }}
                            >
                              {statusLabel(b.status)} · {dateLabel}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Faixa do Gantt */}
                      <div className="relative flex-1" style={{ minHeight: ROW_H }}>
                        {/* Grid de fundo */}
                        <div className="absolute inset-0 flex pointer-events-none">
                          {months.map((ym, i) => {
                            const isToday = ym === TIMELINE_TODAY_YM;
                            return (
                              <div
                                key={i}
                                className={cn("border-r", isToday ? "bg-primary/[0.04]" : "")}
                                style={{
                                  width: COL_W,
                                  borderColor:
                                    "color-mix(in oklch, var(--border) 70%, transparent)",
                                }}
                              />
                            );
                          })}
                        </div>

                        {/* Barra */}
                        {visEnd >= 0 && visStart <= totalCols - 1 && (
                          <div
                            className={cn(
                              "absolute h-9 rounded-lg flex items-center px-2.5 transition-all hover:brightness-110 hover:shadow-md",
                              finalizada && b.status !== "concluida" && "opacity-55",
                            )}
                            style={{
                              top: (ROW_H - 36) / 2,
                              left,
                              width: Math.max(width, 24),
                              background: `color-mix(in oklch, ${cor} 22%, white)`,
                              color: `color-mix(in oklch, ${cor} 55%, black)`,
                              borderTopLeftRadius: clippedStart ? 2 : 8,
                              borderBottomLeftRadius: clippedStart ? 2 : 8,
                              borderTopRightRadius: clippedEnd ? 2 : 8,
                              borderBottomRightRadius: clippedEnd ? 2 : 8,
                              borderLeft: `3px solid ${cor}`,
                            }}
                            title={`${b.nome} — ${statusLabel(b.status)} · ${titleDateLabel}`}
                          >
                            <span className="text-[11px] font-semibold truncate flex-1">
                              {b.curto}
                            </span>
                            {endingSoon && (
                              <span
                                className="ml-1 inline-flex items-center justify-center size-4 rounded-full bg-white shrink-0"
                                title="Encerra em breve"
                              >
                                <AlertTriangle className="size-2.5 text-amber-600" />
                              </span>
                            )}
                            {naoIniciada && (
                              <span className="ml-1 inline-flex items-center justify-center text-[9px] font-bold bg-black/10 rounded px-1 py-px shrink-0">
                                EM BREVE
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Legenda */}
          <div className="px-5 py-3 border-t bg-muted/20 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
            <LegendDot cor="oklch(0.7 0.15 156)" label="Concluída" />
            <LegendDot cor="oklch(0.62 0.18 240)" label="No prazo" />
            <LegendDot cor="oklch(0.78 0.16 80)" label="Em alerta" />
            <LegendDot cor="oklch(0.62 0.22 25)" label="Crítica / vencida" />
            {todayInsideWindow && (
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-3 w-[2px] bg-primary" /> Hoje
              </span>
            )}
          </div>
        </>
      )}
    </section>
  );
}

function LegendDot({ cor, label }: { cor: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="size-2.5 rounded-sm"
        style={{
          background: `color-mix(in oklch, ${cor} 22%, white)`,
          borderLeft: `2px solid ${cor}`,
        }}
      />
      {label}
    </span>
  );
}

// ─── Encerramento ────────────────────────────────────────────────────────────

type AvaliacaoPergunta =
  | { tipo: "radio"; numero: number; pergunta: string; opcoes: string[]; resposta: string }
  | { tipo: "texto"; numero: number; pergunta: string; helper?: string; resposta: string };

type AvaliacaoBloco = {
  titulo: string;
  subtitulo: string;
  Icon: typeof ScanSearch;
  perguntas: AvaliacaoPergunta[];
};

function gerarAvaliacaoFinal(projeto: ProjetoOperacional): AvaliacaoBloco[] {
  const totalMacros = projeto.macroentregas.length;
  const concluidas = projeto.macroentregas.filter((m) => m.status === "concluida").length;
  return [
    {
      titulo: "Avaliação técnica e julgamento profissional",
      subtitulo: "Bloco 1",
      Icon: ScanSearch,
      perguntas: [
        {
          tipo: "radio",
          numero: 1,
          pergunta:
            "Quão familiar a equipe executora estava com os problemas técnicos do projeto?",
          opcoes: [
            "Domínio pleno e com muita experiência prévia.",
            "Experiência prévia relevante.",
            "Pouca experiência prévia.",
            "Sem experiência prévia",
          ],
          resposta: "Experiência prévia relevante.",
        },
        {
          tipo: "radio",
          numero: 2,
          pergunta:
            "O projeto gerou algum resultado técnico relevante não previsto nos objetivos contratados?",
          opcoes: ["Não", "Sim"],
          resposta: "Sim",
        },
        {
          tipo: "texto",
          numero: 3,
          pergunta: "Descreva o resultado técnico relevante não previsto.",
          resposta: `Durante a execução de ${concluidas} de ${totalMacros} macroentregas, foi observada a possibilidade de aplicação da tecnologia em um segundo cenário operacional não previsto inicialmente, abrindo oportunidade para um desdobramento futuro.`,
        },
      ],
    },
    {
      titulo: "Inovação e impacto",
      subtitulo: "Bloco 2",
      Icon: Lightbulb,
      perguntas: [
        {
          tipo: "radio",
          numero: 4,
          pergunta:
            "Indique a abrangência ou alcance da inovação resultado do projeto concluído:",
          opcoes: [
            "Novo para vários mercados mundiais",
            "Novo para um determinado mercado no mundo",
            "Novo para um determinado mercado nacional",
            "Novo para a empresa",
            "Não é novidade",
            "Não sei avaliar o real alcance",
          ],
          resposta: "Novo para um determinado mercado nacional",
        },
        {
          tipo: "radio",
          numero: 5,
          pergunta:
            "Com relação a principal tecnologia envolvida no projeto, informe a opção que melhor a caracteriza:",
          opcoes: [
            "Foi criada uma nova tecnologia.",
            "A tecnologia foi modificada/derivada.",
            "A tecnologia foi adaptada para utilização em um novo ambiente.",
            "Foi estabelecido um novo nível de desempenho para a tecnologia.",
            "Foi estabelecido um novo nível de confiabilidade para a tecnologia.",
            "A tecnologia foi escalonada.",
            "A tecnologia foi utilizada.",
          ],
          resposta: "A tecnologia foi adaptada para utilização em um novo ambiente.",
        },
        {
          tipo: "radio",
          numero: 6,
          pergunta:
            "Indique a perspectiva de geração de inovação a partir dos resultados técnicos do projeto:",
          opcoes: [
            "Gerou ou irá gerar inovação que permite avanço da fronteira tecnológica.",
            "Gerou ou irá gerar inovação compatível com o limite da fronteira tecnológica.",
            "Gerou ou irá gerar inovação que permite aproximação da fronteira tecnológica.",
            "Gerou ou irá gerar inovação, porém aquém da fronteira tecnológica.",
            "Sem perspectiva de gerar inovação",
          ],
          resposta:
            "Gerou ou irá gerar inovação compatível com o limite da fronteira tecnológica.",
        },
      ],
    },
    {
      titulo: "Otimização e maturidade técnica",
      subtitulo: "Bloco 3",
      Icon: Gauge,
      perguntas: [
        {
          tipo: "radio",
          numero: 7,
          pergunta: "Foram realizadas tarefas com o intuito de otimização dos resultados?",
          opcoes: ["Não", "Sim, de forma não sistêmica.", "Sim"],
          resposta: "Sim",
        },
        {
          tipo: "texto",
          numero: 8,
          pergunta: "Descreva as tarefas realizadas com intuito de otimização",
          resposta:
            "Refinamento iterativo dos parâmetros do modelo, validação em bancada e ajustes de desempenho a partir de feedback técnico da equipe da empresa parceira.",
        },
      ],
    },
    {
      titulo: "Avaliação relacional e satisfação",
      subtitulo: "Bloco 4",
      Icon: Heart,
      perguntas: [
        {
          tipo: "radio",
          numero: 9,
          pergunta: "Informe seu nível de satisfação com os resultados/entregas do projeto.",
          opcoes: [
            "Muito acima do esperado.",
            "Acima do esperado.",
            "Conforme esperado.",
            "Abaixo do esperado.",
            "Muito abaixo do esperado.",
          ],
          resposta: "Acima do esperado.",
        },
        {
          tipo: "radio",
          numero: 10,
          pergunta: "Como foi a qualidade da interação com a empresa?",
          opcoes: ["Excelente", "Muito boa", "Boa", "Ruim", "Péssima"],
          resposta: "Muito boa",
        },
      ],
    },
    {
      titulo: "Sugestão institucional (qualitativo)",
      subtitulo: "Bloco 5",
      Icon: MessageSquare,
      perguntas: [
        {
          tipo: "texto",
          numero: 11,
          pergunta:
            "Na sua visão, como o modelo EMBRAPII poderia potencializar ainda mais a intensidade tecnológica na indústria?",
          helper: "Ex.: Novos modelos de financiamento / novas rubricas / etc",
          resposta:
            "Ampliar instrumentos de financiamento de longo prazo para escalonamento pós-projeto e criar rubricas específicas para validação industrial em ambiente real.",
        },
      ],
    },
  ];
}

function AvaliacaoFinalDialog({
  open,
  onOpenChange,
  projeto,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  projeto: ProjetoOperacional;
}) {
  const blocos = useMemo(() => gerarAvaliacaoFinal(projeto), [projeto]);
  const todasPerguntas = useMemo(() => blocos.flatMap((b) => b.perguntas), [blocos]);
  const total = todasPerguntas.length;
  const respondidas = todasPerguntas.filter((p) => p.resposta.trim().length > 0).length;

  const [copiadoTudo, setCopiadoTudo] = useState(false);
  const [copiadoIdx, setCopiadoIdx] = useState<number | null>(null);

  function textoCompleto(): string {
    const linhas: string[] = [
      `Avaliação Final — ${projeto.nome} (${projeto.codigo})`,
      `Respondidas: ${respondidas}/${total}`,
      "",
    ];
    blocos.forEach((b) => {
      linhas.push(`[${b.subtitulo}] ${b.titulo}`);
      b.perguntas.forEach((p) => {
        linhas.push(`${p.numero}. ${p.pergunta}`);
        linhas.push(`   ${p.resposta}`);
      });
      linhas.push("");
    });
    return linhas.join("\n").trim();
  }

  async function copiarTudo() {
    try {
      await navigator.clipboard.writeText(textoCompleto());
      setCopiadoTudo(true);
      setTimeout(() => setCopiadoTudo(false), 1800);
    } catch {
      // noop
    }
  }

  async function copiarItem(p: AvaliacaoPergunta) {
    try {
      await navigator.clipboard.writeText(`${p.numero}. ${p.pergunta}\n${p.resposta}`);
      setCopiadoIdx(p.numero);
      setTimeout(() => setCopiadoIdx((v) => (v === p.numero ? null : v)), 1500);
    } catch {
      // noop
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ListChecks className="size-4 text-primary" />
            Avaliação Final do projeto
          </DialogTitle>
          <DialogDescription>
            Respostas do coordenador ao questionário de encerramento do projeto{" "}
            <span className="font-medium text-foreground">{projeto.codigo}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border bg-muted/30 p-3 flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">
              Perguntas respondidas
            </div>
            <div className="mt-0.5 text-2xl font-bold tracking-tight tabular-nums">
              {respondidas}
              <span className="text-sm font-medium text-muted-foreground"> / {total}</span>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide">
            <CheckCircle2 className="size-3" />
            {respondidas === total ? "Completa" : "Parcial"}
          </span>
        </div>

        <div className="space-y-6">
          {blocos.map((bloco, blocoIndex) => (
            <section key={blocoIndex}>
              <ol className="space-y-3">
                {bloco.perguntas.map((p) => (
                  <li key={p.numero} className="group rounded-lg border bg-card p-3">
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-primary-soft text-[10px] font-mono font-semibold text-primary">
                        {p.numero}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-foreground">{p.pergunta}</p>
                          <button
                            type="button"
                            onClick={() => copiarItem(p)}
                            title="Copiar pergunta e resposta"
                            className="shrink-0 inline-flex items-center gap-1 rounded-md border border-transparent px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground opacity-0 transition group-hover:opacity-100 hover:bg-muted hover:text-foreground"
                          >
                            {copiadoIdx === p.numero ? (
                              <>
                                <Check className="size-3 text-emerald-600" />
                                Copiado
                              </>
                            ) : (
                              <>
                                <Copy className="size-3" />
                                Copiar
                              </>
                            )}
                          </button>
                        </div>
                        {p.tipo === "texto" && p.helper && (
                          <p className="mt-0.5 text-[11px] text-muted-foreground italic">
                            {p.helper}
                          </p>
                        )}
                        {p.tipo === "radio" ? (
                          <div className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-emerald-50 border border-emerald-200 px-2 py-1 text-xs font-medium text-emerald-700">
                            <CheckCircle2 className="size-3.5" />
                            {p.resposta}
                          </div>
                        ) : (
                          <p className="mt-2 text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                            {p.resposta}
                          </p>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button onClick={copiarTudo}>
            {copiadoTudo ? (
              <>
                <Check className="size-4" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="size-4" />
                Copiar questionário
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EncerramentoSection({ projeto }: { projeto: ProjetoOperacional }) {
  const e8 = projeto.timeline.find((e) => e.id === "e8");
  const status: EtapaStatus = e8?.status ?? "pendente";
  const finalizado = status === "concluido" || status === "realizado";
  const emAndamento = status === "em_andamento" || status === "agendado";
  const atrasado = status === "atrasado";

  const [openAval, setOpenAval] = useState(false);

  function baixarTermo() {
    const fileName = `Termo_Encerramento_${projeto.codigo.replace(/[^a-zA-Z0-9-]/g, "_")}.pdf`;
    const conteudo = `Termo de Encerramento\nProjeto: ${projeto.nome}\nCódigo: ${projeto.codigo}\nEmpresa: ${projeto.empresa}\nCoordenador: ${projeto.coordenador}\nVigência: ${projeto.vigencia}\nEncerrado em: ${e8?.data ?? "—"}\n`;
    const blob = new Blob([conteudo], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const termoOk = projeto.termoEncerramentoConcluido ?? finalizado;
  const avalOk = projeto.avaliacaoFinalConcluida ?? finalizado;

  const termoMeta = termoOk
    ? { label: "Concluído", cls: "bg-emerald-100 text-emerald-700", desc: `Termo de encerramento entregue${e8?.data ? ` em ${e8.data}` : ""}.`, done: true }
    : atrasado
      ? { label: "Atrasado", cls: "bg-rose-100 text-rose-700", desc: "Termo de encerramento pendente — prazo vencido.", done: false }
      : emAndamento
        ? { label: "Em preenchimento", cls: "bg-sky-100 text-sky-700", desc: "Coordenador preparando o termo de encerramento.", done: false }
        : { label: "Aguardando", cls: "bg-muted text-muted-foreground", desc: "Etapa será liberada ao final do projeto.", done: false };

  const avaliacaoMeta = avalOk
    ? { label: "Concluído", cls: "bg-emerald-100 text-emerald-700", desc: "Avaliação final preenchida pelo coordenador.", done: true }
    : atrasado
      ? { label: "Atrasada", cls: "bg-rose-100 text-rose-700", desc: "Avaliação final pendente — prazo vencido.", done: false }
      : emAndamento
        ? { label: "Em preenchimento", cls: "bg-sky-100 text-sky-700", desc: "Coordenador respondendo o questionário de encerramento.", done: false }
        : { label: "Aguardando", cls: "bg-muted text-muted-foreground", desc: "Liberada após o término das macroentregas.", done: false };

  const feitos = (termoMeta.done ? 1 : 0) + (avaliacaoMeta.done ? 1 : 0);
  const pct = (feitos / 2) * 100;
  const fimVigencia = projeto.vigencia.split("—").pop()?.trim() ?? "—";

  return (
    <>
      <section className="rounded-xl border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b bg-gradient-to-r from-violet-50 via-card to-card dark:from-violet-950/30">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center dark:bg-violet-900/60 dark:text-violet-300">
                <Flag className="size-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold leading-tight">Encerramento do projeto</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Fim da vigência em <span className="font-medium text-foreground">{fimVigencia}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-3">
            <div className="flex items-center justify-between text-[11px] mb-1.5">
              <span className="text-muted-foreground">Artefatos de encerramento</span>
              <span className="font-semibold text-foreground">{feitos} de 2</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all rounded-full",
                  feitos === 2 ? "bg-emerald-500" : feitos === 1 ? "bg-sky-500" : "bg-muted-foreground/30"
                )}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => termoMeta.done && baixarTermo()}
            disabled={!termoMeta.done}
            className={cn(
              "group text-left rounded-lg border bg-card p-4 transition",
              termoMeta.done ? "hover:border-primary/60 hover:shadow-sm cursor-pointer" : "opacity-80 cursor-not-allowed"
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn("size-9 shrink-0 rounded-lg flex items-center justify-center", termoMeta.done ? "bg-emerald-50 text-emerald-600" : "bg-primary-soft text-primary")}>
                <FileSignature className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold text-foreground">Termo de Encerramento</h4>
                  <span className={cn("shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide", termoMeta.cls)}>
                    {termoMeta.label}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{termoMeta.desc}</p>
                {termoMeta.done && (
                  <div className="mt-3 inline-flex items-center gap-1 text-xs text-primary font-medium group-hover:underline">
                    <Download className="size-3.5" />
                    Baixar termo
                  </div>
                )}
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setOpenAval(true)}
            className="group text-left rounded-lg border bg-card p-4 transition hover:border-primary/60 hover:shadow-sm cursor-pointer"
          >
            <div className="flex items-start gap-3">
              <div className={cn("size-9 shrink-0 rounded-lg flex items-center justify-center", avaliacaoMeta.done ? "bg-emerald-50 text-emerald-600" : "bg-primary-soft text-primary")}>
                <ListChecks className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold text-foreground">Avaliação Final</h4>
                  <span className={cn("shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide", avaliacaoMeta.cls)}>
                    {avaliacaoMeta.label}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{avaliacaoMeta.desc}</p>
                <div className="mt-3 inline-flex items-center gap-1 text-xs text-primary font-medium group-hover:underline">
                  Ver respostas do questionário
                  <ArrowUpRight className="size-3.5" />
                </div>
              </div>
            </div>
          </button>
        </div>
      </section>

      <AvaliacaoFinalDialog
        open={openAval}
        onOpenChange={setOpenAval}
        projeto={projeto}
      />
    </>
  );
}

// --- Tab: Macroentregas --------------------------------------------------------
function MacroentregasView({
  projeto,
  onAnexarTermo,
}: {
  projeto: ProjetoOperacional;
  onAnexarTermo: (macroId: string) => void;
}) {
  // Só a primeira macro não-concluída fica "em andamento"; as seguintes ficam "não iniciada".
  const proximaIdx = projeto.macroentregas.findIndex((m) => m.status !== "concluida");
  return (
    <section className="rounded-xl border bg-card overflow-hidden">
      <div className="px-5 py-4 border-b bg-muted/30 flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Target className="size-4 text-primary" />
            <h3 className="text-sm font-semibold">Macroentregas do projeto</h3>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {projeto.status === "onboarding"
              ? "Acompanhe o cadastro e o planejamento inicial das macroentregas."
              : "Acompanhe o status de cada macroentrega, seus termos e assinaturas."}
          </p>
        </div>
        <span className="text-xs text-muted-foreground">
          {projeto.macroentregas.length} no total
        </span>
      </div>
      <div className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projeto.macroentregas.map((m, idx) => {
            const isConcluida = m.status === "concluida";
            const isEmAndamento = !isConcluida && idx === proximaIdx && !m.naoIniciada;
            const effectiveStatus: EffectiveMacroStatus = isConcluida
              ? "concluida"
              : isEmAndamento
                ? "em_andamento"
                : "nao_iniciada";
            return (
              <MacroentregaCard
                key={m.id}
                macro={m}
                indicador={idx + 1}
                  emOnboarding={projeto.status === "onboarding"}
                effectiveStatus={effectiveStatus}
                onAnexarTermo={() => onAnexarTermo(m.id)}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

type EffectiveMacroStatus = "concluida" | "em_andamento" | "nao_iniciada";

function parseDateBR(s: string): Date | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s);
  if (!m) return null;
  return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
}

function formatDateBR(d: Date): string {
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

function MacroentregaCard({
  macro,
  indicador,
  emOnboarding,
  effectiveStatus,
  onAnexarTermo: _onAnexarTermo,
}: {
  macro: Macroentrega;
  indicador: number;
  emOnboarding: boolean;
  effectiveStatus: EffectiveMacroStatus;
  onAnexarTermo: () => void;
}) {
  type StatusVisual = {
    pill: string;
    stripe: string;
    accentText: string;
    accentBg: string;
    accentBorder: string;
    label: string;
    icon: React.ReactNode;
  };

  const statusVisual: StatusVisual = (() => {
    if (effectiveStatus === "concluida") {
      return {
        pill: "bg-emerald-100 text-emerald-700",
        stripe: "bg-emerald-500",
        accentText: "text-emerald-700",
        accentBg: "bg-emerald-50",
        accentBorder: "border-emerald-200",
        label: "Concluída",
        icon: <CheckCircle2 className="size-3" />,
      };
    }
    if (effectiveStatus === "em_andamento") {
      return {
        pill: "bg-sky-100 text-sky-700",
        stripe: "bg-sky-500",
        accentText: "text-sky-700",
        accentBg: "bg-sky-50",
        accentBorder: "border-sky-200",
        label: "Em andamento",
        icon: <Loader2 className="size-3 animate-spin" />,
      };
    }
    return {
      pill: "bg-amber-100 text-amber-700",
      stripe: "bg-amber-400",
      accentText: "text-amber-700",
      accentBg: "bg-amber-50",
      accentBorder: "border-amber-200",
      label: "Não iniciada",
      icon: <CircleDashed className="size-3" />,
    };
  })();

  const concluida = effectiveStatus === "concluida";
  const vencimentoDate = parseDateBR(macro.vencimento);
  const finalPlanejado = macro.finalPlanejado ?? macro.vencimento;
  const inicioPlanejado = macro.inicioPlanejado
    ?? (vencimentoDate
      ? formatDateBR(new Date(vencimentoDate.getFullYear(), vencimentoDate.getMonth() - 3, vencimentoDate.getDate()))
      : macro.vencimento);
  const inicioReal = macro.inicioReal
    ?? (effectiveStatus === "concluida" || effectiveStatus === "em_andamento"
      ? inicioPlanejado
      : "—");
  const finalReal = macro.finalReal ?? (concluida ? macro.vencimento : "—");
  const dataAssinatura = macro.dataAssinatura ?? macro.vencimento;
  const descricao = macro.descricao
    ?? "Macroentrega vinculada ao plano de trabalho e aos desembolsos da empresa parceira.";
  const indicadorFisico = macro.indicadorFisico ?? "Termo de aceite assinado pela empresa";

  return (
    <div className="group relative rounded-xl border bg-card overflow-hidden flex flex-col transition-shadow hover:shadow-md">
      <span
        className={cn(
          "absolute right-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider shadow-sm",
          statusVisual.pill,
        )}
      >
        {statusVisual.icon}
        {statusVisual.label}
      </span>
      <div className="p-4 flex flex-col gap-4 flex-1">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className={cn(
            "size-10 rounded-lg flex items-center justify-center shrink-0 border border-blue-900 bg-blue-900",
          )}>
            <span className="text-base font-bold leading-none text-white">
              {indicador}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              Macroentrega
            </p>
            <h4 className="text-sm font-semibold text-foreground leading-snug">
              {macro.nome}
            </h4>
          </div>
        </div>

        {/* Descrição */}
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
          {descricao}
        </p>

        {/* Indicador físico */}
        <div className="rounded-lg border bg-muted/30 p-3 flex items-start gap-2.5">
          <div className="size-7 rounded-md bg-card border flex items-center justify-center shrink-0 text-muted-foreground">
            <Target className="size-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground leading-tight">
              Indicador físico
            </p>
            <p className="text-xs font-semibold text-foreground mt-0.5 leading-snug">
              {indicadorFisico}
            </p>
          </div>
        </div>

        {/* Timeline planejado x realizado */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border bg-muted/30 p-2.5">
            <p className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              <CalendarDays className="size-3" />
              Planejado
            </p>
            <div className="mt-2 space-y-1 text-[11px] tabular-nums">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[9px] uppercase tracking-wide text-muted-foreground">Início</span>
                <span className="font-semibold text-foreground">{inicioPlanejado}</span>
              </div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-[9px] uppercase tracking-wide text-muted-foreground">Fim</span>
                <span className="font-semibold text-foreground">{finalPlanejado}</span>
              </div>
            </div>
          </div>
          <div className={cn(
            "rounded-lg border p-2.5",
            inicioReal !== "—" ? "bg-card" : "bg-muted/30 border-dashed",
          )}>
            <p className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              <CalendarCheck className="size-3" />
              Realizado
            </p>
            {inicioReal !== "—" ? (
              <div className="mt-2 space-y-1 text-[11px] tabular-nums">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[9px] uppercase tracking-wide text-muted-foreground">Início</span>
                  <span className="font-semibold text-foreground">{inicioReal}</span>
                </div>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[9px] uppercase tracking-wide text-muted-foreground">Fim</span>
                  <span className={cn(
                    "font-semibold",
                    finalReal !== "—" ? "text-foreground" : "text-muted-foreground",
                  )}>
                    {finalReal !== "—" ? finalReal : "—"}
                  </span>
                </div>
              </div>
            ) : (
              <p className="mt-2 text-[11px] text-muted-foreground italic">
                aguardando início
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        {!emOnboarding && (concluida ? (
          <div className="mt-auto flex items-center gap-2.5 rounded-lg border border-emerald-500/30 bg-emerald-50 p-2.5 shadow-sm">
            <div className="flex-1 min-w-0">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-900 leading-tight">
                <FileSignature className="size-3.5 text-emerald-600 shrink-0" />
                Termo de Aceite Assinado
              </p>
              <p className="text-[11px] text-emerald-700/80 leading-tight mt-1 tabular-nums">
                Data de assinatura: {dataAssinatura}
              </p>
            </div>
            <button
              type="button"
              aria-label="Baixar documento assinado"
              title="Baixar documento assinado"
              className="inline-flex items-center justify-center size-8 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 shrink-0"
            >
              <Download className="size-4" />
            </button>
          </div>
        ) : (
          <div className="mt-auto flex items-center gap-2.5 rounded-lg border border-dashed bg-muted/30 p-2.5 min-h-[3.5rem]">
            <div className="flex-1 min-w-0">
              <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground italic leading-tight">
                <FileSignature className="size-3.5 shrink-0" />
                {macro.termoStatus === "nao_gerado"
                  ? "Sem documento"
                  : macro.termoStatus === "aguardando_assinatura"
                    ? "Aguardando assinatura"
                    : macro.termoStatus === "assinado"
                      ? "Assinado — aguardando SRINFO"
                      : macro.termoStatus === "subido_sr"
                        ? "Disponível no SRINFO"
                        : "Rascunho"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tab: Alertas ──────────────────────────────────────────────────────────────

type AlertaItem = {
  id: string;
  tipo: "onboarding_atrasado" | "macroentrega_vencendo" | "assinatura_pendente" | "documento_nao_enviado" | "prazo_critico" | "acao_coordenador";
  titulo: string;
  detalhe: string;
  data: string;
  severidade: "critico" | "alto" | "medio";
};

const ALERTA_META: Record<AlertaItem["severidade"], { pill: string; chip: string; label: string; Icon: typeof AlertTriangle; iconBg: string; iconColor: string }> = {
  critico: { pill: "bg-rose-100 text-rose-700", chip: "bg-rose-50 border-rose-200 text-rose-700", label: "Crítico", Icon: ShieldAlert, iconBg: "bg-rose-100", iconColor: "text-rose-600" },
  alto: { pill: "bg-amber-100 text-amber-700", chip: "bg-amber-50 border-amber-200 text-amber-700", label: "Alto", Icon: AlertTriangle, iconBg: "bg-amber-100", iconColor: "text-amber-600" },
  medio: { pill: "bg-sky-100 text-sky-700", chip: "bg-sky-50 border-sky-200 text-sky-700", label: "Médio", Icon: Bell, iconBg: "bg-sky-100", iconColor: "text-sky-600" },
};

function gerarAlertas(projeto: ProjetoOperacional): AlertaItem[] {
  const out: AlertaItem[] = [];
  const e4 = projeto.timeline.find((e) => e.id === "e4");
  if (projeto.status === "atrasado" && e4?.status === "atrasado") {
    out.push({
      id: "a1",
      tipo: "onboarding_atrasado",
      titulo: "Onboarding atrasado",
      detalhe: e4.descricao ?? "Coordenador não respondeu ao e-mail de onboarding.",
      data: "12 dias sem resposta",
      severidade: "critico",
    });
  }
  projeto.macroentregas.forEach((m) => {
    if (m.status === "critica") {
      out.push({
        id: `a-m-${m.id}-c`,
        tipo: "macroentrega_vencendo",
        titulo: `${m.nome} vence em ${m.diasParaVencer}d`,
        detalhe: m.termoStatus === "nao_gerado"
          ? "Coordenador ainda não gerou o termo de aceite."
          : "Termo em fluxo — acompanhar próximos passos.",
        data: `Vence em ${m.vencimento}`,
        severidade: "critico",
      });
    }
    if (m.assinaturaStatus === "aguardando") {
      out.push({
        id: `a-m-${m.id}-s`,
        tipo: "assinatura_pendente",
        titulo: "Assinatura pendente",
        detalhe: `Aguardando assinatura da ${projeto.empresa} no termo da ${m.nome}.`,
        data: `Limite ${m.vencimento}`,
        severidade: "alto",
      });
    }
    if (m.assinaturaStatus === "atrasado") {
      out.push({
        id: `a-m-${m.id}-sa`,
        tipo: "assinatura_pendente",
        titulo: "Assinatura atrasada",
        detalhe: `Empresa não assinou o termo da ${m.nome} no prazo.`,
        data: `Vencido em ${m.vencimento}`,
        severidade: "critico",
      });
    }
  });
  if (projeto.status === "macroentrega_pendente") {
    out.push({
      id: "a-coord",
      tipo: "acao_coordenador",
      titulo: "Ação pendente do coordenador",
      detalhe: projeto.proximaAcao,
      data: `Prazo ${projeto.proximoPrazo}`,
      severidade: "alto",
    });
  }
  return out;
}

function AlertasView({ alertas }: { alertas: AlertaItem[] }) {
  return (
    <section className="rounded-xl border bg-card overflow-hidden">
      <div className="px-5 py-4 border-b bg-muted/30 flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="size-4 text-primary" />
            <h3 className="text-sm font-semibold">Alertas operacionais</h3>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Pendências que exigem ação do PMO ou do coordenador.
          </p>
        </div>
        <span className="text-xs text-muted-foreground">{alertas.length} alerta(s) ativos</span>
      </div>
      {alertas.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <div className="mx-auto inline-flex size-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="size-5" />
          </div>
          <p className="mt-3 text-sm font-medium text-foreground">Nenhuma pendência operacional</p>
          <p className="text-xs text-muted-foreground">Tudo em ordem para este projeto.</p>
        </div>
      ) : (
        <ul className="divide-y">
          {alertas.map((a) => {
            const meta = ALERTA_META[a.severidade];
            const Icon = meta.Icon;
            return (
              <li key={a.id} className="flex items-start gap-3 px-5 py-4">
                <div className={cn("inline-flex size-10 shrink-0 items-center justify-center rounded-lg", meta.iconBg)}>
                  <Icon className={cn("size-5", meta.iconColor)} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-sm font-semibold text-foreground">{a.titulo}</div>
                    <span className={cn("shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide", meta.pill)}>
                      {meta.label}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{a.detalhe}</p>
                  <div className="mt-2 flex items-center gap-3">
                    <span className={cn("inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium", meta.chip)}>
                      <CalendarClock className="size-3" />
                      {a.data}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

// ─── Dialog: URL do GitHub ──────────────────────────────────────────────────

function GithubUrlDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (url: string) => void;
}) {
  const [url, setUrl] = useState("");

  function handleConfirm() {
    const trimmed = url.trim();
    if (!trimmed) return;
    onConfirm(trimmed);
    setUrl("");
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) setUrl("");
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Github className="size-4 text-primary" />
            Criação da organização GitHub
          </DialogTitle>
          <DialogDescription>
            Informe a URL da organização criada para o projeto. Ela ficará visível para os
            colaboradores desse projeto.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 pb-4">
          <label htmlFor="github-url" className="text-xs font-medium text-foreground">
            URL da organização
          </label>
          <input
            id="github-url"
            type="url"
            autoFocus
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://github.com/empresa-projeto"
            className="w-full h-10 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleConfirm();
            }}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!url.trim()}>
            <Check className="size-4" />
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
