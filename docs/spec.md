# Interview Prep Platform — v1 Spec

Status: **draft, pending approval**. Locked via interview on 2026-07-16. Nothing in
this document should be treated as a build order until the user has signed off
on it — see `CLAUDE.md` for the phased-plan gate.

## 1. What it is

A web app for preparing for software engineering job interviews, across five
sections:

1. **General coding exercises** — user picks a language/framework _and version_
   (e.g. React 19, not "React"); backend generates a current, version-correct
   exercise, the user solves it in-browser, backend gives detailed feedback.
2. **Code review exercises** — same picker; backend presents intentionally
   flawed code, user reviews it, backend scores what they caught vs. missed.
3. **General tech questions** — scenario-based, either per chosen tech or
   general engineering judgment.
4. **Behavioural / culture questions** — STAR/CAR-framed.
5. **Company-specific** — user names a company and pastes a job spec (raw
   text, not a URL). Backend researches the company + role, then generates
   personalised questions that route into modes 1–4 (see §6).

## 2. Stack

| Concern                    | Decision                                                                       |
| -------------------------- | ------------------------------------------------------------------------------ |
| Framework                  | Next.js (App Router) + TypeScript                                              |
| UI                         | MUI + a custom typed `tokens.ts` feeding `createTheme`                         |
| Package manager            | pnpm                                                                           |
| Unit/component tests       | Vitest + React Testing Library                                                 |
| E2E tests                  | Playwright (see `webapp-testing` skill)                                        |
| Live-coding editor         | CodeMirror 6                                                                   |
| Live-coding execution      | JS/TS-only, sandboxed in-browser Web Worker (no backend sandbox)               |
| Auth + DB + storage        | Supabase (Postgres, Auth, Storage), deployed on Vercel                         |
| LLM                        | Claude Sonnet 5, called server-side only, for all generation/feedback/research |
| Company research grounding | Anthropic's server-side web search tool only (no Firecrawl/Exa/Tavily in v1)   |
| Job-market data            | Deferred past v1 (Adzuna is the plan when it's picked back up)                 |

### Why these, briefly

- **Supabase over separate Neon+Auth.js**: bundles Postgres + auth + row-level
  security + storage in one place, native to Vercel, least glue code for a
  solo-built v1.
- **Web Worker over WebContainers/Piston/Judge0**: v1 exercise scope is
  JS/TS/React/Next.js only (see §3), so a full Node runtime or polyglot
  sandbox buys nothing yet. Zero backend infra, zero per-execution cost,
  instant startup. Revisit if/when non-JS languages are added — that is a
  distinct, larger decision (self-hosted Piston vs. hosted Judge0/e2b), not
  a v1 default.
- **CodeMirror 6 over Monaco**: much lighter bundle, better mobile behavior,
  easier to theme against MUI tokens. Traded away Monaco's slightly stronger
  out-of-box TS IntelliSense.
- **Sonnet 5 for everything**: one model to reason about for cost/latency
  across generation, feedback, and research synthesis. If company-research
  synthesis quality proves insufficient once real usage exists, Opus 4.8 is
  the specific upgrade path for that one path only — not a v1 default.

## 3. v1 language/framework scope

JavaScript, TypeScript, React, and Next.js only — across both the coding and
code-review sections. No other frameworks (Vue/Angular/Svelte), no non-JS
languages, no separate Node-backend-only track in v1. This scope is directly
coupled to the Web Worker execution decision above; expanding it later means
revisiting execution, not just adding a picker option.

Version-awareness is a hard requirement, not a nice-to-have: the chosen
version is pinned into prompt context, and prompts must instruct the model to
reason from official docs/changelogs for that specific version rather than
producing version-agnostic output. React 19 and React 17 are different
contexts, never merged into one "React" bucket.

## 4. Feedback rubric (coding + code-review sections)

v1 scores against two dimensions:

- **Correctness** — does the solution work; for review exercises, did the
  user's review actually catch the real bugs.
- **Communication / reasoning clarity** — particularly for code review: did
  the user explain _why_ something is a problem, not just flag it.

Explicitly deferred past v1 (not dropped, just not v1 scope): code
quality/idiom-fit scoring (e.g. stale React 17 habits inside React 19 code)
and efficiency/complexity awareness. Add these as additional rubric
dimensions once the two-dimension version is proven against real usage.

## 5. Data layer (v1 scope)

Only accounts/auth persist in v1, via Supabase Auth. Everything else —
generated exercises, user answers, feedback, company profiles, progress — is
session-only and not saved across sessions in v1.

Explicitly deferred, in likely order of future value:

1. Exercise/attempt history (avoid regenerating duplicates, let users review
   past sessions).
2. Saved company/job-spec profiles (avoid re-pasting/re-researching a company
   the user returns to).
3. Progress tracking / spaced repetition (meaningfully more schema and
   product surface — treat as its own phase, not an incremental add).

## 6. Company-specific section — routing into the other four modes

Section 5 does **not** get its own dedicated generator per mode. Instead:

1. User pastes a job spec (plain text) and names a company.
2. Backend parses the pasted job spec (no scraping — it's just text
   extraction/structuring of what the user gave us).
3. Backend runs company research via the Anthropic web search tool
   (server-side), grounded and current.
4. These two outputs are merged into a single structured **company context
   object** — tech stack, likely interview-round types, culture/values
   signals, seniority cues, anything else the four generators need.
5. Each of the four existing generators (coding, code-review, tech-questions,
   behavioural) accepts this company context object as additional prompt
   input alongside its normal inputs (language/version picker, etc.).

This keeps exactly one generation path per mode (four total), with company
mode being "the same four generators, with richer context" rather than a
fifth parallel implementation to maintain.

## 7. Architecture principles (non-negotiable — flag before violating)

- **Two layers of skills.** Skills under `.claude/skills` help _build_ this
  app. Question/feedback generation is a **runtime** concern: the deployed
  backend calls the Claude API at request time, grounded with search. Do not
  bake question banks, fixed scenario lists, or canned feedback into static
  skills — that defeats the entire point of "current and relevant."
- **No raw scraping.** LinkedIn/Glassdoor scraping is out, full stop. Job
  specs are user-pasted text, parsed, not fetched. Company research is
  grounded retrieval via the Anthropic web search tool; deeper-extraction
  vendors (Firecrawl/Exa/Tavily) are an explicitly-deferred upgrade, added
  only if search-snippet grounding proves insufficient in practice. Job-market
  data, if/when added, goes through Adzuna's real API, never scraped.
- **Version-aware generation, always.** Every generation prompt in scope
  (§3) pins the exact version selected and instructs the model to check
  official docs/changelogs for that version. Version-agnostic output is a
  bug, not an acceptable fallback.
- **Execution sandboxing is JS/TS-only for v1.** In-browser Web Worker, no
  backend code-execution service. This is a scope decision tied to §3, not
  an oversight — do not casually add a backend sandbox for a "quick" language
  addition without re-opening that decision explicitly.

## 8. Content quality bar (generated text)

Because this app's entire value is AI-generated exercises, questions, and
feedback, generated content is held to an explicit anti-slop bar:

- No generic, could-apply-to-anyone feedback ("good effort, keep practicing").
  Feedback must reference the user's actual code/answer specifically.
- No hedging filler in generated questions or feedback ("it depends", "there
  are many ways to think about this") unless immediately followed by the
  concrete answer for _this_ case.
- Company-specific generation must visibly use the researched context (tech
  stack, role specifics) — if a generated question could have been produced
  without the company research, the prompt has failed its job.

## 9. Skills

### Consumed from `anthropics/skills` (vetted, copied into `.claude/skills`)

- `frontend-design` — aesthetic/UI decision guidance.
- `skill-creator` — for iterating on this project's own authored skills.
- `webapp-testing` — Playwright-based testing, pairs with the e2e stack in §2.

Note: `grill-me` and an anti-slop/"Karpathy-rules" skill were requested but do
not exist in `anthropics/skills` (repo searched directly, no match). Dropped
per user decision; this session's interview already followed grill-me's
walk-each-branch/recommend/resolve-dependencies pattern, and §8 above encodes
the anti-slop bar directly instead of depending on an unlocated skill.

### To be authored as project skills (in a future phase, not before spec approval)

- Per-section generation logic + the difficulty rubric.
- The version-aware prompt pattern (how version pinning + doc-grounding
  instructions get assembled into every generation prompt).
- The code-review feedback rubric (§4), as a reusable scoring pattern.

These are deliberately not authored yet: they encode implementation detail
that should be derived from writing the actual generation engine, not
speculated ahead of it.

## 10. Explicit open items / deferred decisions

These are known and intentionally not v1 scope — listed so they don't get
silently forgotten:

- Non-JS language support (and the resulting execution-sandbox change).
- Firecrawl/Exa/Tavily for deeper company research extraction.
- Adzuna job-market data integration.
- Exercise history, saved company profiles, progress tracking/spaced
  repetition (data layer expansion, in that order).
- Code-quality/idiom-fit and efficiency rubric dimensions.
- Opus 4.8 for company-research synthesis, if Sonnet 5 proves insufficient.
