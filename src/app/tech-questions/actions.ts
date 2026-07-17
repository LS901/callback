'use server';

import { getCurrentUser } from '@/lib/supabase/server';
import { techOptions } from '@/lib/tech-options';
import { generateWithSearch } from '@/lib/anthropic/generation';
import { extractJson } from '@/lib/anthropic/json';

export type GeneratedQuestion = {
  title: string;
  scenario: string;
  question: string;
};

export type Feedback = {
  correctness: string;
  communication: string;
  modelAnswer: string;
};

async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('You must be signed in.');
  }
}

function resolveTech(techId: string, version: string) {
  const tech = techOptions.find((t) => t.id === techId);
  if (!tech || !tech.versions.includes(version)) {
    throw new Error('Unknown technology or version.');
  }
  return tech;
}

export async function generateQuestion(
  techId: string,
  version: string,
): Promise<GeneratedQuestion> {
  await requireUser();
  const tech = resolveTech(techId, version);

  // Decided server-side, not left to the model: a single stateless call reliably
  // anchors on the single most famous version delta (e.g. React 19 + forwardRef)
  // every time if merely told to do that "sometimes" — so we force the odds instead.
  const isVersionSpecificFocus = Math.random() < 0.25;
  const focusInstruction = isVersionSpecificFocus
    ? `Center this question specifically on something introduced, changed, or removed in ${tech.label} ${version} — a genuine version delta, not a generic question.`
    : `Center this question on a broad, foundational ${tech.label} concept that applies across versions — state management, rendering behavior, effects, common patterns, performance, architecture, anything a working candidate should know. It must NOT be about something unique to ${version}; pick a concept that would also make sense to ask about an earlier version.`;

  const system = `You are generating a single scenario-based technical interview question for a candidate working in ${tech.label} ${version}.

${focusInstruction}

Regardless of focus, the framing and expected answer must be version-correct: assume the candidate is working in ${tech.label} ${version} specifically, use APIs and idioms current to that version, and don't test against patterns that are stale, deprecated, or superseded in that version. Use the web_search tool if you're not sure how ${tech.label} ${version} behaves — don't guess at version-specific behavior from memory alone when it affects the question or its correct answer.

Respond with at most one lead-in sentence, then end your response with exactly one fenced code block containing JSON in this exact shape, and nothing after it:

\`\`\`json
{"title": "...", "scenario": "...", "question": "..."}
\`\`\`

"title": a short (3-8 word) title. "scenario": 2-4 sentences of realistic context. "question": the actual question, one or two sentences.`;

  const text = await generateWithSearch(
    system,
    `Generate one scenario-based interview question about ${tech.label} ${version}.`,
  );
  return extractJson<GeneratedQuestion>(text);
}

export async function generateFeedback(
  techId: string,
  version: string,
  question: GeneratedQuestion,
  answer: string,
): Promise<Feedback> {
  await requireUser();
  const tech = resolveTech(techId, version);

  const system = `You are grading a candidate's answer to a ${tech.label} ${version} interview question.

Score the answer on exactly two dimensions:
- "correctness": does the answer's technical content hold up for ${tech.label} ${version} specifically? Use the web_search tool if you need to verify a version-specific claim. Reference the candidate's actual statements — quote or closely paraphrase what they said, and state plainly whether each part is right, wrong, or incomplete. Never give feedback generic enough to apply to any answer.
- "communication": did the candidate explain their reasoning, not just state a conclusion?

Do not hedge ("it depends", "there are many ways to think about this") unless immediately followed by the concrete answer for this specific case.

Also provide a model answer: a strong reference answer to the question, correct for ${tech.label} ${version} specifically. If the question is code-shaped (a bugfix, API usage, a refactor), include a code sample — use a fenced code block with a language tag (e.g. \`\`\`tsx) inside the "modelAnswer" string, not just prose. Escape newlines and other control characters properly so the field is valid JSON.

Respond with exactly one fenced code block containing JSON in this exact shape, and nothing else:

\`\`\`json
{"correctness": "...", "communication": "...", "modelAnswer": "..."}
\`\`\``;

  const userContent = `Question: ${question.question}\nScenario: ${question.scenario}\nCandidate's answer: ${answer}`;

  const text = await generateWithSearch(system, userContent);
  return extractJson<Feedback>(text);
}
