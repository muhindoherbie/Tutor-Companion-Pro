# Tutor Companion — Implementation Plan

**Version 1.0 · 2026-10-18 · Status: awaiting product-owner approval**

This document is the deliverable of "Command 1: Architecture and project planning" from the [master specification](SPECIFICATION.md). It defines the recommended architecture, database design, and phased implementation plan. No application code has been written yet, per the specification's instruction to plan before building.

---

## 1. Environment findings

| Item | Finding |
|---|---|
| Source of truth | Specification v1.0 (transcribed into `docs/SPECIFICATION.md`; the paste was truncated during §11, Command 1) |
| Code hosting | GitHub, account `muhindoherbie`, repository `tutor-companion` (private), `gh` CLI authenticated with `repo` scope |
| Development model | All work committed and pushed to GitHub; a local clone is used only as the git working copy |
| Dev toolchains (Flutter, Android SDK, etc.) | Not yet audited on any machine — deliberately deferred; **Phase 0 begins with a toolchain audit and CI setup** so that builds are verified by GitHub Actions rather than assumed |

The specification's engineering instruction A ("inspect the existing project files and development environment") is satisfied as far as planning requires: the project is greenfield (empty repository), so there are no existing files or constraints to preserve. Toolchain validation moves into Phase 0 where it is verified continuously by CI instead of once on one machine.

---

## 2. Architecture decisions

### 2.1 Client framework: Flutter (single codebase for all three platforms)

**Decision:** one Flutter application targeting Windows, Android, and Web.

| Alternative | Why not chosen |
|---|---|
| .NET MAUI | Good Windows/Android, no web target |
| React Native | Windows support weak, web still needs React web app (two codebases) |
| Tauri + web | Windows strong, Android immature |
| Electron + Capacitor | Two runtimes, heavy Windows installer, poor mobile story |

Flutter is the only mainstream option with first-class Windows, Android, and Web targets from one codebase, which the specification requires "from the beginning." Known trade-offs and mitigations:

- **Flutter Web file/storage limits** → structured data in IndexedDB-backed SQLite; library files as IndexedDB blobs; visible storage-quota metering; prominent export/backup prompts (spec §8.3).
- **Flutter Web initial load size** → deferred loading, PWA caching of the app shell.
- **Plugin gaps on Windows** → verify each plugin's Windows support in Phase 0 before adoption; fallback to platform channels.

### 2.2 Application architecture (inside the Flutter app)

- **Feature-first structure** (`features/classes`, `features/library`, …) with a `core/` layer for database, files, sync, export, theming, routing.
- **Riverpod** for dependency injection and state; **go_router** for navigation.
- **Repository layer** isolates every feature from its data sources (local DB, cloud, AI service). This is what keeps the backend swappable (decision 2.4) and makes features testable with fake repositories.
- Every write goes to the **local database first**; cloud operations are separate, explicit user actions.

### 2.3 Local storage (offline-first core)

| Platform | Structured data | Files |
|---|---|---|
| Windows | SQLite via **drift** (typed schema, versioned migrations) | App documents directory via `path_provider` |
| Android | Same drift database | App-private storage / app documents |
| Web | drift over **IndexedDB** (sqlite3 WASM or IndexedDB driver) | IndexedDB blobs + quota display |

Drift is chosen because it compiles to all three targets from one schema definition, supports reactive queries (live dashboard), and has a real migration system (spec instruction F).

### 2.4 Backend: Supabase (recommended), interfaces kept swappable

**Decision:** [Supabase](https://supabase.com) (managed PostgreSQL + Auth + Storage + Row Level Security + Edge Functions), with the client talking to it only through the repository layer so a self-hosted NestJS + PostgreSQL backend remains a documented escape hatch.

Rationale: the cloud side of Tutor Companion is intentionally thin (accounts, sharing, backup, AI/research proxying). Supabase provides all of it as managed infrastructure with per-row security enforced in the database itself, removing months of backend work while keeping PostgreSQL's model. Estimated cost at start: free/low tier, scaling with user count.

What runs server-side:

1. **OpenAI proxy (Edge Function)** — the only holder of the OpenAI key (spec instruction G). Client authenticates with its session; the function enforces per-workspace quotas and returns generated content for in-app review.
2. **YouTube Data API v3 proxy** — server-side key, response caching.
3. **Web/article search + image search proxy** — returns real URLs with source metadata (spec §6).

### 2.5 AI content generation pattern (all generators)

One pipeline, reused by lecture notes, exams, quizzes, assignments, and presentations:

```
Tutor selects: class → course unit → topics → reference materials → options
        │
        ▼
Server extracts text from selected library documents (PDF/DOCX/PPTX),
chunks + embeds them (pgvector), retrieves the most relevant passages
        │
        ▼
OpenAI prompt = retrieved passages + tutor's instructions
        │
        ▼
Result opens in the REVIEW EDITOR:
  - passages drawn from the tutor's sources are labelled "from your sources"
  - AI-authored explanations are labelled "AI-generated"
  - tutor edits, then marks Reviewed → saved locally as a generated document
```

This enforces spec §3.1 ("prioritize uploaded source materials and distinguish verified source information") and instruction I ("require tutor review before finalized"). Citations produced by the AI are always flagged *unverified* until the tutor checks them (spec §6.1).

### 2.6 Document export strategy (spec §4)

| Format | Where generated | Offline? | Library |
|---|---|---|---|
| PDF | Client | ✅ Always | Dart `pdf` package (mature) |
| XLSX | Client | ✅ Always | Dart `excel` package |
| DOCX | Client | ✅ Always | `docx_template`-based engine (template + structured content injection) |
| PPTX | Server (Edge Function, `pptxgenjs`) | ⚠️ Online only | No mature Dart PPTX writer exists |

Mitigation for PPTX offline: when offline, the presentation generator offers a **PDF slide-deck export** instead, and the PPTX is generated when connectivity returns. Honest messaging is mandatory — the app never reports an export as successful unless the file was actually written (spec §4).

---

## 3. Repository layout

```
tutor-companion/
├── app/                          # Flutter application (Windows, Android, Web)
│   ├── lib/
│   │   ├── core/
│   │   │   ├── database/         # drift schema, DAOs, migrations
│   │   │   ├── files/            # local file store (per-platform)
│   │   │   ├── sync/             # backup, restore, conflict resolution
│   │   │   ├── export/           # pdf, xlsx, docx, pptx pipelines
│   │   │   ├── ai/               # client for the server AI proxy
│   │   │   ├── theme/  routing/  network/  (connectivity, status)
│   │   └── features/
│   │       ├── dashboard/  classes/  library/  students/
│   │       ├── ai_generators/  research/  backup/  sharing/  settings/
│   ├── test/                     # unit + widget tests (CI-enforced)
│   └── integration_test/
├── supabase/
│   ├── migrations/               # Postgres schema + RLS policies (versioned)
│   └── functions/                # openai-proxy, youtube-proxy, search-proxy
├── docs/
│   ├── SPECIFICATION.md
│   ├── IMPLEMENTATION-PLAN.md
│   └── reports/                  # phase-N.md reports (spec instruction L)
└── .github/workflows/            # CI: analyze, test, build windows/android/web
```

---

## 4. Database schema (design)

One logical schema, realized twice: drift/SQLite locally (master copy, offline-first) and PostgreSQL in Supabase (backup/sharing copy). Every row carries `id (uuid)`, `workspace_id`, `created_at`, `updated_at`, `updated_by`, `sync_version`, `deleted_at` (soft delete) — these columns power backup, restore, and conflict detection without silent overwrites (spec §8.5).

Core tables (abbreviated):

- **users** (auth) → **profiles**: full_name, institution, avatar_url
- **workspaces**: owner_user_id, name, is_personal — one per tutor by default (spec §7.2)
- **classes**: name, description, academic_level — *≤ 20 per workspace, enforced in app UI **and** by a database trigger/constraint with a clear message (spec §2.2)*
- **course_units**: class_id → title, code, description, curriculum_ref, outline, objectives, teaching_hours
- **topics**: unit_id, parent_topic_id (subtopics), name, description, sort_order
- **library_resources**: title, author, year, edition, subject, class_id?, unit_id?, doc_type, source, storage_ref, size_bytes, notes, tags[]
- **students**: name, student_no, email?, notes — workspace-scoped
- **enrollments**: student_id ↔ class_id, enrolled_at
- **assessments**: unit_id, title, type (coursework|assignment|quiz|practical|midterm|final|custom), max_score, weight, due_date
- **scores**: assessment_id, student_id, value — CHECK (`0 ≤ value ≤ max_score`); invalid entries blocked at UI and DB (spec §5.2)
- **grading_schemes** + **grade_bands**: min/max/grade/points/note; weights stored as config JSON; **the UI always shows the formula used** (spec §5.3); never hard-coded to one institution
- **generated_documents**: unit_id?, type (notes|exam|quiz|assignment|slides), title, content_json, status (draft→reviewed→final), source_refs[]
- **ai_generations**: document_id, prompt, model, token counts, created_at — audit trail
- **links / videos**: unit_id?, topic_id?, document_id?, title, url, provider — associable with classes, units, topics, notes (spec §6.3)
- **backups**: workspace_id, scope, created_at, size_bytes, checksum, storage_ref (versioned)
- **sync_conflicts**: table, row_id, local_hash, remote_hash, status (pending|resolved) — the review queue
- **orgs**, **org_members** (role), **shares** (resource_type, resource_id, grantee, permission) — permission-based collaboration (spec §7.3–7.4)

Row Level Security on the Postgres side: a tutor can read/write only rows in workspaces they own or are explicitly granted access to. An org admin gets only what the documented permission model allows — never blanket access (spec §7.4).

---

## 5. Offline, backup, restore, and sync behaviour

1. **Offline default.** All CRUD works against the local database with zero connectivity. Dashboard shows connection + backup status (spec §2.1).
2. **Backup is opt-in and scoped.** Tutor signs in → opens Backup settings → picks scopes (classes, units, library, students, marks, generated documents) → upload produces a versioned, checksummed snapshot in Supabase Storage. Restores list available versions, preview contents, and require confirmation (spec §8.4).
3. **Sign-in never auto-uploads** local data (spec §7.2).
4. **Sync is manual.** Rows changed on both sides since the last sync (compared via `sync_version`/hashes) land in a **conflict review queue** showing local vs remote values side by side. Nothing is ever silently overwritten (spec §8.5, instruction J).

---

## 6. Security model

- Email/password auth via Supabase Auth (JWT sessions); OAuth providers optional later.
- RLS on every cloud table; sharing grants are explicit rows in `shares`.
- OpenAI / YouTube / search keys exist **only** in server-side functions; `.env` files are git-ignored (already in `.gitignore`); CI injects secrets from GitHub encrypted secrets.
- Student records protected by workspace isolation + explicit share grants only.

---

## 7. Phased roadmap

Each phase ends with: code + tests green in CI, and a `docs/reports/phase-N.md` report listing files touched, features, tests + results, known limitations, run instructions, and next steps (spec instruction L). A phase is not "complete" until its exit criteria are demonstrated.

| Phase | Deliverable | Exit criteria (tested) |
|---|---|---|
| **0 — Foundations** | Toolchain audit + CI; Flutter scaffold (Windows/Android/Web); drift DB + first migration; theme, navigation shell, CI runs `analyze` + `test` + debug builds | App launches on Windows + Web from CI-built artifacts; a smoke test writes/reads the local DB |
| **1 — Classes & course units** | Class CRUD with the 20-class limit and clear message; course units with code, curriculum, outline, objectives, topics/subtopics, teaching hours | Limit enforcement test; CRUD round-trip tests; deep-link navigation class→unit→topic |
| **2 — Digital library** | Import PDF/DOCX/PPTX/XLSX/TXT/images; metadata editor; tags; organize by class/unit/topic/type; offline availability; Web quota metering + export | Files open offline after restart on Windows; web quota shown; metadata round-trip tests |
| **3 — Students, marks, grading, analytics** | Students, enrollment, class rosters (import/export), assessments with max scores, validated mark entry, configurable grading schemes with visible formulas, totals/weights/rankings/trends, at-risk/high-performer reports from real data only | Invalid scores rejected (UI + DB tests); grading formula matches UI display; analytics figures reconcile against fixture marks |
| **4 — Local export (PDF/XLSX)** | Offline export pipelines: marksheets, class lists, reports, printable documents; user-chosen save location | Exported files verified non-empty and openable in test; never reports success without a written file |
| **5 — Accounts, backup, restore, sync** | Supabase project + Auth + migrations + RLS; backup settings UI; versioned snapshots; restore-to-new-device flow; conflict review queue | E2E test: backup on device A → restore on device B → data reconciles; conflicting edits surface in queue, nothing auto-overwritten |
| **6 — AI teaching assistant** | `openai-proxy` function; lecture-note generator (source-grounded, labelled source-vs-AI content, editable, review step); exam/quiz/assignment generators with model answers, marking guides, rubrics; per-workspace quota metering | Generated docs enter as draft and require explicit "Reviewed" action; source-labelled passages traced to real chunks; quota enforced; offline UI degrades gracefully |
| **7 — Presentations + DOCX/PPTX export** | Presentation generator (title/objectives/points/tables/discussion/references; length + level controls); DOCX offline via template engine; PPTX via server with offline PDF fallback | DOCX/PPTX open in Word/PowerPoint in test; offline path produces PDF deck with honest messaging |
| **8 — Research & multimedia** | `search-proxy` + `youtube-proxy`; article search with title/author/date/source/URL; image search with attribution/licensing; associate videos with classes/units/topics/notes; save links for offline reference | All results carry real URLs; AI citations display "unverified" badge until checked; no offline-playback claims |
| **9 — Sharing & institutions** | Orgs, org members, roles; share classes/units/resources; admin console (memberships, shared classes, teaching assignments, authorized reports) | Permission matrix tests: private stays private; admin access limited to granted scopes |
| **10 — Hardening & release** | PWA polish; Windows MSIX installer; Android Play build; offline drills; seeded demo data; user docs; beta | Installers produced by CI; offline drill scenario passes; spec §1–10 checklist reviewed line-by-line |

Dependencies: 5 needs 1–4 data structures stable; 6 needs 5 (server functions) and 2 (source documents); 7 needs 6; 8 needs 5; 9 needs 5. Phases 1–4 deliver a genuinely useful offline product before any cloud spend.

---

## 8. Testing strategy

- **Unit tests** for every rule: class limit, score validation, grading formulas, conflict detection, export writers.
- **Widget tests** per feature screen; golden tests for dashboard/report layouts.
- **Integration tests** (Android emulator / Windows runner in GitHub Actions) for critical flows: create class → unit → library import → marks → export.
- **E2E sync test** in Phase 5+ (two database instances simulating two devices).
- CI gates every PR: `flutter analyze`, `flutter test`, debug builds for windows + web (+ android when the toolchain is in place).

---

## 9. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Flutter Web storage quotas confuse users | Quota metering, export prompts, documented expectations (spec §8.3) |
| Dart DOCX/PPTX library immaturity | PDF/XLSX fully offline; DOCX via template engine; PPTX server-side with PDF fallback (§2.6); never fake export success |
| OpenAI cost/abuse | Server-side proxy, per-workspace quotas, caching, streaming |
| YouTube API quota | Server-side response caching |
| Windows plugin gaps | Plugin audit in Phase 0 before any feature adopts one |
| Scope creep before first usable release | Phases 1–4 are a coherent offline MVP; cloud/AI phases strictly layered after |
| Spec source truncated (§11) | Roadmap covers §1–10 fully; remaining step-commands can be appended and mapped onto phases without re-planning |

---

## 10. Decisions requested from the product owner

These have recommended defaults and proceed as recommended unless overruled:

1. **Backend: Supabase (recommended)** vs self-hosted NestJS + PostgreSQL. (Swappable later via repository layer.)
2. **PPTX generation: server-side online with offline PDF fallback (recommended)** vs delaying presentations entirely.
3. **Repository visibility: private (chosen)** — say the word to make it public.
4. **App identity**: package id `com.muhindoherbie.tutorcompanion` (placeholder — confirm or supply a preferred id before Phase 0 locks it in).

---

## 11. Next step

Approve this plan (or amend the decisions above), then issue the Phase 0 command:

> *"Begin Phase 0: foundations"* — toolchain audit, CI, Flutter scaffold, local database, navigation shell; ending with the Phase 0 report per spec instruction L.
