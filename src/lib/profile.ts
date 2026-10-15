import { useSyncExternalStore } from "react";

export type ProfileId = "coordenadora" | "administrador" | "admin" | "corretor-congressos" | "pesquisador" | "pmo";

export type Profile = {
  id: ProfileId;
  nome: string;
  cargo: string;
  iniciais: string;
  email: string;
  telefone: string;
  rg: string;
  cpf: string;
  dataNascimento: string;
};

export const PROFILES: Profile[] = [
  {
    id: "coordenadora",
    nome: "Renata Braga",
    cargo: "Coordenadora",
    iniciais: "RB",
    email: "renata.braga@ceia.ufg.br",
    telefone: "(62) 98123-4567",
    rg: "4.852.369 SSP/GO",
    cpf: "987.123.456-00",
    dataNascimento: "12/03/1985",
  },
  {
    id: "administrador",
    nome: "Patrícia",
    cargo: "Administrador",
    iniciais: "P",
    email: "patricia@ceia.ufg.br",
    telefone: "(62) 98712-3344",
    rg: "3.987.654 SSP/GO",
    cpf: "654.321.789-00",
    dataNascimento: "05/02/1980",
  },
  {
    id: "admin",
    nome: "Mariana Alves",
    cargo: "Equipe Administrativa",
    iniciais: "MA",
    email: "mariana.alves@ceia.ufg.br",
    telefone: "(62) 99876-5432",
    rg: "5.123.798 SSP/GO",
    cpf: "123.456.789-00",
    dataNascimento: "27/07/1992",
  },
  {
    id: "corretor-congressos",
    nome: "Daniel Pacheco",
    cargo: "Corretor — Congressos",
    iniciais: "DP",
    email: "daniel.pacheco@ceia.ufg.br",
    telefone: "(62) 98321-6677",
    rg: "6.234.567 SSP/GO",
    cpf: "321.654.987-11",
    dataNascimento: "03/11/1988",
  },
  {
    id: "pesquisador",
    nome: "Lucas Oliveira",
    cargo: "Pesquisador",
    iniciais: "LO",
    email: "lucas.oliveira@ceia.ufg.br",
    telefone: "(62) 99654-3210",
    rg: "7.345.678 SSP/GO",
    cpf: "456.789.123-22",
    dataNascimento: "19/09/1994",
  },
  {
    id: "pmo",
    nome: "Paulo",
    cargo: "PMO",
    iniciais: "P",
    email: "paulo@ceia.ufg.br",
    telefone: "(62) 98000-0000",
    rg: "8.456.789 SSP/GO",
    cpf: "789.123.456-33",
    dataNascimento: "01/01/1990",
  },
];

const STORAGE_KEY = "ceia.activeProfile";
const EVENT_NAME = "ceia.profilechange";

function read(): ProfileId {
  if (typeof window === "undefined") return "coordenadora";
  const raw = window.localStorage.getItem(STORAGE_KEY) as ProfileId | null;
  return raw === "admin" || raw === "administrador" || raw === "coordenadora" || raw === "corretor-congressos" || raw === "pesquisador" || raw === "pmo" ? raw : "coordenadora";
}

function subscribe(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT_NAME, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT_NAME, cb);
    window.removeEventListener("storage", cb);
  };
}

export function useActiveProfile(): Profile {
  const id = useSyncExternalStore(subscribe, read, () => "coordenadora" as ProfileId);
  return PROFILES.find((p) => p.id === id) ?? PROFILES[0];
}

export function setActiveProfile(id: ProfileId) {
  if (typeof window === "undefined") return;
  const previous = window.localStorage.getItem(STORAGE_KEY);
  window.localStorage.setItem(STORAGE_KEY, id);
  // Ao trocar de perfil, zera o estado de "vistas" do Histórico Geral da
  // Equipe Administrativa, para que ao retornar como admin existam novamente
  // solicitações sinalizadas como não vistas desde a última visita.
  if (previous !== id) {
    window.localStorage.removeItem("ceia.adminGeneral.seenIds");
    window.localStorage.removeItem("ceia.adminGeneral.lastVisit");
  }
  window.dispatchEvent(new Event(EVENT_NAME));
}
