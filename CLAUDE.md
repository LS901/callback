# Interview Prep Platform

Full spec: [docs/spec.md](docs/spec.md). Read it before making architectural
decisions — this file is conventions and guardrails, not the spec itself.

**Current status: Phase 2 (one section end-to-end) complete.** Tech Questions
is a real, working feature: picker (tech + curated version) → server action
calls Sonnet 5 with web search enabled → generated scenario question →
user answer → server action scores Correctness + Communication → feedback
displayed. Gated behind Supabase auth, which is itself gated by an
`ALLOWED_EMAILS` allowlist (`src/lib/auth-allowlist.ts`) restricting sign-in/up
to specific addresses while this stays pre-launch. Verified end-to-end with a
real Claude API call — confirmed the model actually uses web search and
returns parseable output, not just that the code compiles. Real Supabase +
Anthropic credentials are live in `.env.local`.
Phase 3 (generalize into the shared engine, extend to the other three
non-company sections) is next — see "Build sequencing" below.

## Stack

- Next.js (App Router) + TypeScript
- MUI + custom typed `tokens.ts` → `createTheme` (no ad-hoc inline styling —
  route new values through tokens)
- pnpm (never npm/yarn commands or lockfiles)
- Vitest + React Testing Library (unit/component), Playwright (e2e)
- Supabase (Postgres + Auth + Storage), deployed on Vercel
- CodeMirror 6 for the live-coding editor, executed in an in-browser Web
  Worker sandbox (JS/TS only — see spec §2)
- Claude Sonnet 5 called server-side for all generation/feedback/research

## Dev commands

```
pnpm install
pnpm dev           # local dev server (Turbopack)
pnpm build         # production build
pnpm start         # serve the production build
pnpm lint          # eslint
pnpm typecheck     # tsc --noEmit
pnpm format        # prettier --write .
pnpm format:check  # prettier --check .
pnpm test          # vitest run (unit/component)
pnpm test:watch    # vitest, watch mode
pnpm test:e2e      # playwright (builds + starts the app itself)
```

Copy `.env.example` to `.env.local` and fill in real values to exercise auth
and generation locally:

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase
  project settings. Without these, auth degrades to a "not configured" notice
  rather than crashing (see `src/lib/supabase/env.ts`).
- `ANTHROPIC_API_KEY` — console.anthropic.com → Settings → API Keys.
  Server-side only; without it, generation calls throw a clear configuration
  error rather than a raw SDK error (see `src/lib/anthropic/client.ts`).
- `ALLOWED_EMAILS` — comma-separated allowlist gating sign-in/up while
  pre-launch (see `src/lib/auth-allowlist.ts`). Leave unset to open sign-up to
  anyone.

This list is authoritative — check `package.json` scripts before running
anything not listed here, and update this list the moment scripts are added
or renamed.

## Architecture principles — do not violate without flagging to the user first

1. **Skills vs. runtime, kept separate.** `.claude/skills` skills help build
   this app. Question/exercise/feedback generation is a runtime concern —
   the deployed backend calls the Claude API at request time, grounded with
   search. Never bake question banks, fixed scenarios, or canned feedback
   into a static skill.
2. **No raw scraping, ever.** Job specs are user-pasted text, parsed — never
   fetched from LinkedIn/Glassdoor/anywhere else. Company research goes
   through the Anthropic web search tool server-side (Firecrawl/Exa/Tavily
   only if that proves insufficient — ask before adding). Job-market data,
   if added, is via Adzuna's real API, never scraped.
3. **Version-aware generation, always.** Every generation prompt pins the
   exact language/framework version selected and instructs the model to
   check official docs/changelogs for that version. Version-agnostic output
   is a bug. React 19 and React 17 are different contexts — never merge them.
4. **Execution sandbox is JS/TS-only, in-browser, for v1.** No backend
   code-execution service exists or should be added casually. If a task
   seems to require running non-JS code or a heavier Node runtime, stop and
   flag it — that reopens a deliberate architecture decision (spec §2), it's
   not a small addition.
5. **Company section reuses the four generators.** It is not a fifth
   generation path. Company research + parsed job spec merge into one
   context object that gets passed as extra input to whichever of the four
   generators (coding/code-review/tech-questions/behavioural) is invoked.
   Don't build company-specific duplicate prompts per mode.
6. **v1 data layer is auth-only.** Supabase Auth is the only thing that
   persists per user in v1. Don't add exercise history, saved profiles, or
   progress tracking tables without an explicit go-ahead — they're sequenced
   deferrals (spec §5), not oversights.

## Content quality bar (generated text)

This app's entire value is its generated content, so hold it to a real bar:

- No generic feedback that could apply to any answer — it must reference the
  user's actual submitted code/answer specifically.
- No hedging filler ("it depends", "there are many ways to think about this")
  unless immediately followed by the concrete answer for the case at hand.
- Company-mode generation must visibly use the researched context. If a
  question could have been generated without the company research, the
  prompt has failed.

## Don't-touch / ask-first list

- Don't add a backend code-execution sandbox (Piston/Judge0/e2b/WebContainers)
  without confirming — this is a deliberate, costed decision (spec §2), not a
  drive-by dependency add.
- Don't add scraping of any kind, for any source.
- Don't wire up Firecrawl/Exa/Tavily or Adzuna without confirming — both are
  explicit v1 deferrals (spec §10).
- Don't add persistence beyond Supabase Auth (no new tables) without
  confirming.
- Don't switch package managers, or run npm/yarn install commands, in a pnpm
  repo.
- Don't call the Claude API from client-side code — server-side only, so keys
  never reach the browser.

## Skills

Installed in `.claude/skills` (copied from `anthropics/skills`, vetted):

- `frontend-design` — aesthetic/UI decisions.
- `skill-creator` — for authoring/iterating this project's own skills.
- `webapp-testing` — Playwright-based testing.

Planned project skills (author during implementation, not before — see spec
§9 for why): per-section generation logic + difficulty rubric, the
version-aware prompt pattern, the code-review feedback rubric.

## Build sequencing

1. ~~Interview / lock spec~~ (done — `docs/spec.md`).
2. ~~Get explicit user approval on the spec~~ (done).
3. ~~Phase 1 — scaffold~~ (done): Next.js/TS/MUI/tokens, nav shell across all
   five section routes, Vitest+RTL, Playwright, Supabase auth wiring,
   `frontend-design`/`skill-creator`/`webapp-testing` skills installed.
4. ~~Phase 2 — one section end-to-end~~ (done): Tech Questions is a real
   working feature — picker → server-side Sonnet 5 call (web search enabled)
   → generated question → user answer → feedback call scored on Correctness +
   Communication. Gated behind Supabase auth + an `ALLOWED_EMAILS` allowlist.
   Verified with a real API call, not just compiled.
5. **Phase 3 (next)** — generalize into the shared generation/feedback
   engine; author the version-aware prompt pattern, difficulty rubric, and
   code-review rubric project skills; extend to Coding Exercises (no live
   execution yet), Code Review, and Behavioural.
6. Phase 4 — company section: job-spec parsing, web-search research, the
   shared company context object, wired into all four generators.
7. Phase 5 — live coding: CodeMirror 6 + Web Worker sandbox upgrade for the
   Coding Exercises section.

Each phase gates on lint + typecheck + unit tests + e2e + build all passing
before moving to the next. Confirm with the user before starting a new phase
rather than assuming a go-ahead.
