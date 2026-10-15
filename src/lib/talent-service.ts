import { TALENTS, type Talent } from "@/components/ptr/TalentSearch";

export type CandidateSuggestion = {
  talent: Talent;
  compatibility: number; // 0-100
  summary: string;
};

export async function searchTalents({ q = "", skills = [], page = 1, perPage = 6 }: { q?: string; skills?: string[]; page?: number; perPage?: number; }) {
  // Simple client-side filter using TALENTS mock. Replace with API call later.
  const qq = q.trim().toLowerCase();
  let filtered = TALENTS.filter((t) => {
    if (!qq) return true;
    return (
      t.name.toLowerCase().includes(qq) ||
      t.cpf.includes(qq) ||
      t.email.toLowerCase().includes(qq) ||
      t.formacao.toLowerCase().includes(qq)
    );
  });
  if (skills.length > 0) {
    filtered = filtered.filter((t) => skills.some((s) => t.formacao.toLowerCase().includes(s.toLowerCase())));
  }
  const total = filtered.length;
  const start = (page - 1) * perPage;
  const results = filtered.slice(start, start + perPage);
  // simulate network latency
  await new Promise((r) => setTimeout(r, 120));
  return { results, total } as const;
}

export async function getAiSuggestions({ role = "", page = 1, perPage = 6 }: { role?: string; page?: number; perPage?: number; }) {
  // Stubbed suggestions: pick talents and compute a fake compatibility based on name/role overlap.
  const roleLower = role.toLowerCase();
  const pool = TALENTS.slice();
  const suggestions: CandidateSuggestion[] = pool.map((t, i) => {
    const compatibility = Math.max(40, Math.min(95, Math.round(80 - Math.abs(roleLower.length - t.formacao.length) % 60 + (i % 7))));
    return {
      talent: t,
      compatibility,
      summary: `${t.formacao}. Experiência relevante em projetos similares. Pontos fortes: comunicação, entrega e domínio técnico.`,
    };
  });
  // sort by compatibility desc
  suggestions.sort((a, b) => b.compatibility - a.compatibility);
  const total = suggestions.length;
  const start = (page - 1) * perPage;
  const results = suggestions.slice(start, start + perPage);
  await new Promise((r) => setTimeout(r, 180));
  return { results, total } as const;
}

export default { searchTalents, getAiSuggestions };
