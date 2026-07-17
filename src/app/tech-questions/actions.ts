'use server';

import { getCurrentUser } from '@/lib/supabase/server';
import { techOptions, GENERAL_TOPIC_ID } from '@/lib/tech-options';
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

// No difficulty picker yet (spec: difficulty rubric is a Phase 3 project skill) —
// for now every question is biased toward this fixed level.
const DIFFICULTY_INSTRUCTION = `This question should be advanced: it should require deep understanding and genuine judgment, not something answerable from surface-level familiarity or memorized trivia. Assume the candidate has several years of professional experience.`;

const GENERAL_FOCUS_AREAS = [
  'system design and architectural tradeoffs',
  'debugging methodology and root-cause analysis',
  'code quality, maintainability, and review judgment',
  'testing strategy and how to validate correctness',
  'performance and scalability tradeoffs',
  'technical decision-making under ambiguity or incomplete information',
];

async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('You must be signed in.');
  }
}

function resolveTech(techId: string, version: string) {
  const tech = techOptions.find((t) => t.id === techId);
  if (!tech || (tech.versions.length > 0 && !tech.versions.includes(version))) {
    throw new Error('Unknown technology or version.');
  }
  return tech;
}

function generateGeneralQuestionPrompt(): string {
  const focus = GENERAL_FOCUS_AREAS[Math.floor(Math.random() * GENERAL_FOCUS_AREAS.length)];

  return `You are generating a single scenario-based technical interview question testing general software engineering judgment — not tied to any specific programming language or framework.

Center this question on: ${focus}.

${DIFFICULTY_INSTRUCTION}

Respond with at most one lead-in sentence, then end your response with exactly one fenced code block containing JSON in this exact shape, and nothing after it:

\`\`\`json
{"title": "...", "scenario": "...", "question": "..."}
\`\`\`

"title": a short (3-8 word) title. "scenario": 2-4 sentences of realistic context. "question": the actual question, one or two sentences.`;
}

function generateTechQuestionPrompt(techLabel: string, version: string): string {
  // Decided server-side, not left to the model: a single stateless call reliably
  // anchors on the single most famous version delta (e.g. React 19 + forwardRef)
  // every time if merely told to do that "sometimes" — so we force the odds instead.
  const isVersionSpecificFocus = Math.random() < 0.25;
  const focusInstruction = isVersionSpecificFocus
    ? `Center this question specifically on something introduced, changed, or removed in ${techLabel} ${version} — a genuine version delta, not a generic question.`
    : `Center this question on a broad, foundational ${techLabel} concept that applies across versions — state management, rendering behavior, effects, common patterns, performance, architecture, anything a working candidate should know. It must NOT be about something unique to ${version}; pick a concept that would also make sense to ask about an earlier version.`;

  return `You are generating a single scenario-based technical interview question for a candidate working in ${techLabel} ${version}.

${focusInstruction}

${DIFFICULTY_INSTRUCTION}

Regardless of focus, the framing and expected answer must be version-correct: assume the candidate is working in ${techLabel} ${version} specifically, use APIs and idioms current to that version, and don't test against patterns that are stale, deprecated, or superseded in that version. Use the web_search tool if you're not sure how ${techLabel} ${version} behaves — don't guess at version-specific behavior from memory alone when it affects the question or its correct answer.

Respond with at most one lead-in sentence, then end your response with exactly one fenced code block containing JSON in this exact shape, and nothing after it:

\`\`\`json
{"title": "...", "scenario": "...", "question": "..."}
\`\`\`

"title": a short (3-8 word) title. "scenario": 2-4 sentences of realistic context. "question": the actual question, one or two sentences.`;
}

export async function generateQuestion(
  techId: string,
  version: string,
): Promise<GeneratedQuestion> {
  await requireUser();
  const tech = resolveTech(techId, version);

  const system =
    tech.id === GENERAL_TOPIC_ID
      ? generateGeneralQuestionPrompt()
      : generateTechQuestionPrompt(tech.label, version);

  const userContent =
    tech.id === GENERAL_TOPIC_ID
      ? 'Generate one scenario-based general software engineering interview question.'
      : `Generate one scenario-based interview question about ${tech.label} ${version}.`;

  const text = await generateWithSearch(system, userContent);
  return extractJson<GeneratedQuestion>(text);
}

function feedbackSystemPrompt(techLabel: string | null, version: string | null): string {
  const subject = techLabel
    ? `a ${techLabel} ${version} interview question`
    : 'a technical interview question';
  const correctnessGrounding = techLabel
    ? `does the answer's technical content hold up for ${techLabel} ${version} specifically? Use the web_search tool if you need to verify a version-specific claim.`
    : `does the answer's technical content and reasoning hold up? Use the web_search tool if you need to verify a claim about current tooling or practice.`;
  const modelAnswerVersion = techLabel ? ` correct for ${techLabel} ${version} specifically` : '';

  return `You are grading a candidate's answer to ${subject}.

Score the answer on exactly two dimensions:
- "correctness": ${correctnessGrounding} Reference the candidate's actual statements — quote or closely paraphrase what they said, and state plainly whether each part is right, wrong, or incomplete. Never give feedback generic enough to apply to any answer.
- "communication": did the candidate explain their reasoning, not just state a conclusion?

Do not hedge ("it depends", "there are many ways to think about this") unless immediately followed by the concrete answer for this specific case.

Also provide a model answer: a strong reference answer to the question${modelAnswerVersion}. If the question is code-shaped (a bugfix, API usage, a refactor), include a code sample — use a fenced code block with a language tag (e.g. \`\`\`tsx) inside the "modelAnswer" string, not just prose. Escape newlines and other control characters properly so the field is valid JSON.

Respond with exactly one fenced code block containing JSON in this exact shape, and nothing else:

\`\`\`json
{"correctness": "...", "communication": "...", "modelAnswer": "..."}
\`\`\``;
}

export async function generateFeedback(
  techId: string,
  version: string,
  question: GeneratedQuestion,
  answer: string,
): Promise<Feedback> {
  await requireUser();
  const tech = resolveTech(techId, version);
  const isGeneral = tech.id === GENERAL_TOPIC_ID;

  const system = feedbackSystemPrompt(isGeneral ? null : tech.label, isGeneral ? null : version);
  const userContent = `Question: ${question.question}\nScenario: ${question.scenario}\nCandidate's answer: ${answer}`;

  const text = await generateWithSearch(system, userContent);
  return extractJson<Feedback>(text);
}
