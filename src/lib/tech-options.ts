export type TechOption = {
  id: string;
  label: string;
  versions: string[];
};

/** Sentinel id for "general engineering judgment" — not tied to any language/framework/version. */
export const GENERAL_TOPIC_ID = 'general';

/**
 * Curated, not exhaustive — v1 scope is JS/TS/React/Next.js only (spec §3).
 * Review periodically; the generation prompt still grounds itself via live
 * web search regardless of which entry is picked here.
 */
export const techOptions: TechOption[] = [
  { id: 'javascript', label: 'JavaScript', versions: ['ES2024', 'ES2023', 'ES2022'] },
  { id: 'typescript', label: 'TypeScript', versions: ['5.9', '5.6', '5.4'] },
  { id: 'react', label: 'React', versions: ['19', '18'] },
  { id: 'nextjs', label: 'Next.js', versions: ['16', '15', '14'] },
  { id: GENERAL_TOPIC_ID, label: 'General Engineering', versions: [] },
];
