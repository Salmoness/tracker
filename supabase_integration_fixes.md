# Supabase Integration Fixes

## Purpose

This document validates the reported Supabase concerns against the repository on 2026-08-24 and provides an execution-ready plan for bringing the implemented Phase 2 task, routine, and Must-Win 3 features onto the checked-in Supabase schema safely. It also separates immediate integration blockers from later roadmap infrastructure.

`PROJECT_PLAN.md`, especially Sections 5.4-5.6, is the source of truth for database names and transactional behavior. The database schema names win when the current frontend model disagrees with them.

For this private-project decision, this document overrides the timing of the RLS requirements in `PROJECT_PLAN.md`: do not implement RLS during MVP development; schedule it only in the post-MVP hardening phase.

## MVP security boundary

RLS is deliberately moved to post-MVP. This is a private personal project with one owner, so the MVP should support full Supabase functionality without row-level policies. Disable RLS on the MVP application tables, revoke browser access from the `anon` role, and grant the required table access to `authenticated`. `user_id` filters remain useful for correctness and future migration, but they are not an MVP security boundary. Do not expose the project publicly or add additional users until the post-MVP RLS phase passes.

## Finding review

| Observation | Verdict | Repository evidence and impact |
| --- | --- | --- |
| `.env` contains placeholder Supabase credentials, so the app is in local-storage mode | **Not currently valid; the observation is stale** | The current `.env` contains non-placeholder values with the expected URL/key shapes. With those values, `src/lib/supabase.ts` sets `isConfiguredSupabase` to `true`, so Auth, task, routine, and priority services take their Supabase branches. `.env.example` correctly contains placeholders. The remote project and key were not contacted, so their validity and migration state remain unverified. |
| Credential handling is production-ready | **Not valid; an adjacent issue exists** | `.env` is untracked but is not ignored by `.gitignore`, so it can be committed accidentally. The current configuration check only rejects two known placeholder substrings; it does not reject malformed values or make local/mock mode explicit. |
| The required routine, priority, timer, and bill RPCs are missing | **Valid, but incomplete** | The migration defines only `handle_new_user()`. All six reported RPCs are absent. Section 5.5 also requires `archive_task(...)` and `save_manual_time_entry(...)`; those are absent too. Routine apply, priority compaction, and task archive are already used by the Phase 2 UI, so their missing RPCs are immediate blockers. Timer and bill RPCs are valid missing roadmap work but are not blocking the current Phase 2 UI. |
| Task status is `pending` in the service but `todo` in SQL | **Valid** | `taskService.ts` and `task.types.ts` use `pending`; the migration and `database.types.ts` allow `todo`, `in_progress`, `completed`, and `archived`. Supabase task creation/reopening would violate the status check. |
| Task duration is `estimated_duration_minutes` in the service but `estimated_minutes` in SQL | **Valid** | Supabase inserts and updates reference a nonexistent task column. |
| Subtask order is `sort_order` in the service but `position` in SQL | **Valid, but incomplete** | Subtask completion also drifts: the service uses `completed`, while SQL uses `is_completed`. Both Supabase writes and returned UI shapes are affected. |
| Edge Function and Cron infrastructure are missing | **Valid roadmap gap; extrapolated as a current defect** | `send-bill-reminders` and its Cron trigger are required by Phase 7. The repository is a Phase 2 prototype and has no implemented bill/reminder UI. These should be scheduled after the bill-payment RPC and notification outbox exist, not treated as a prerequisite for making current task features use Supabase. |
| Two-user RLS integration tests are missing | **Valid security gap; deferred to post-MVP** | There is no automated test suite, and Section 5.6/Phase 1 require two-user isolation. Product scope now explicitly defers that work. The MVP is intentionally a private, one-owner Supabase deployment with RLS disabled. |

## Additional confirmed integration gaps

These were not all included in the original observations but must be addressed in the same integration effort:

| Area | Current frontend | Authoritative SQL | Result |
| --- | --- | --- | --- |
| Routine template | Inserts `description` | No template `description` column | Template creation fails. The UI does not display stored template descriptions, so remove this unsupported field from the Phase 2 model and form. |
| Routine item foreign key | `template_id` | `routine_template_id` | Item creation fails. |
| Routine item owner | Omitted | Required `user_id` | Item creation fails. |
| Routine item duration/order | `estimated_duration_minutes`, `sort_order` | `estimated_minutes`, `position` | Item creation fails. The frontend starts order at 0, while SQL requires positions 1-10. |
| Routine run foreign key | `template_id` | `routine_template_id` | Duplicate checks and run insertion fail. |
| Daily priority date/slot | `target_date`, `slot_number` | `priority_date`, `position` | Every Supabase priority query and mutation uses nonexistent columns. |
| Task subtask editing | Changes are only merged in the local-storage branch | Supabase branch updates only `tasks` | Subtask edits/toggles are not persisted in Supabase. |
| Generated database types | Partial hand-written file and not passed to `createClient` | Full generated schema expected | TypeScript cannot catch the drift listed above. |
| RLS coverage | Six broad `FOR ALL` policies | Separate least-privilege policies on every table | Several enabled tables have no policies and existing task, bill, and template delete behavior is too permissive. Disable RLS for the private MVP and defer least-privilege policies to post-MVP; this is an intentional single-owner deployment decision. |
| Security/integrity triggers | Only profile creation | Updated timestamps, owner consistency, completion, and priority compaction required | Keep timestamp, completion, and current-feature invariant triggers in MVP. Defer cross-owner enforcement with RLS; do not represent MVP as secure multi-user storage. |
| Notification delivery outbox | Missing | `notification_deliveries` required by Sections 5.4-5.6 | The future reminder worker cannot claim, retry, or deduplicate deliveries safely. |
| Supporting indexes/checks | Most plan indexes and the bill-payment state consistency check are absent | Defined in Section 5.4 | Query and data-integrity requirements are incomplete. |

## Implementation decisions

1. Preserve the existing migration as migration history. Add follow-up migrations instead of rewriting `20260816000000_phase1_auth_schema.sql`, because the repository does not prove whether it has already been applied remotely.
2. Use the column names and status values from `PROJECT_PLAN.md` and SQL in frontend domain types, Supabase payloads, and the local adapter: `todo`, `estimated_minutes`, `is_completed`, `position`, `routine_template_id`, `priority_date`.
3. Keep local/demo persistence, but make backend selection explicit. Missing or malformed Supabase configuration must not silently switch a production build to local storage.
4. Move multi-row invariants into RPCs. The browser must not implement routine idempotency, priority compaction, task-archive compaction, or timer exclusivity.
5. Apply and test changes against a local Supabase stack first, then a private single-tenant Supabase project. Do not use production as the first migration target.
6. Disable RLS for MVP application tables and grant the authenticated role the access needed for full functionality. Treat row isolation, owner-consistency enforcement, and two-user tests as post-MVP work.
7. Defer Edge Function/Cron deployment until bill tracking, notification preferences, the outbox, and the bill-generation RPC pass local and staging tests.

## Atomic execution plan

### Phase A — Establish a safe, reproducible baseline

1. Run `git status --short` and record the pre-existing dirty files; do not discard or rewrite unrelated user changes.
2. Run `npm run lint` and `npm run build`; record any pre-existing failures before changing code.
3. Add the Supabase CLI as a pinned development dependency so every agent uses the same version.
4. Initialize `supabase/config.toml` if it does not exist; keep project-specific remote IDs out of committed configuration.
5. Add package scripts for local database start, stop, reset, database tests, generated types, lint, and build.
6. Start the local Supabase stack and run a clean database reset to prove the existing migration applies before adding repair migrations.
7. If the existing migration does not apply cleanly, fix only the minimum migration syntax/bootstrap issue needed for a fresh local reset and document why editing migration history was unavoidable.

Exit gate: a clean local database can apply the current migration, and baseline lint/build outcomes are recorded.

### Phase B — Secure environment selection

8. Add `.env*` to `.gitignore` and add an exception for `.env.example`.
9. Confirm `git check-ignore .env` succeeds and `.env.example` remains visible to Git.
10. Never print, copy into this plan, commit, or expose the current key while changing configuration.
11. Add `VITE_DATA_BACKEND=local|supabase` to `.env.example` with comments explaining both modes.
12. Update `src/vite-env.d.ts` with the three supported variables and their types.
13. Replace the placeholder-substring check in `src/lib/supabase.ts` with a parser that validates the explicit backend mode, an HTTPS Supabase URL, and a nonempty publishable/anon key.
14. Make `local` mode construct no operational Supabase data path; keep the placeholder client only if an existing import requires a client object.
15. Make `supabase` mode fail immediately with a clear configuration error when either value is missing or malformed.
16. Make a production build reject `VITE_DATA_BACKEND=local` unless an explicitly documented demo build is intended.
17. Replace service/context checks of `isConfiguredSupabase` with the explicit backend-mode result.
18. Add focused configuration tests for valid Supabase mode, explicit local mode, missing URL, missing key, placeholders, malformed URL, and forbidden production-local mode.

Exit gate: backend choice is explicit, `.env` cannot be committed accidentally, and invalid production configuration cannot silently persist user data in local storage.

### Phase C — Add MVP database repair migrations (RLS disabled)

19. Create a new timestamped migration for MVP schema and invariant repairs; do not append repairs to the historical Phase 1 migration.
20. Add the Section 5.4 supporting indexes with `IF NOT EXISTS`.
21. Add the bill-payment state consistency check as `NOT VALID`, validate existing rows, and then validate the constraint so an already-populated development database fails safely on bad data.
22. Add one reusable `set_updated_at()` trigger function with a fixed `search_path`.
23. Attach the timestamp trigger to every table with an `updated_at` column.
24. Add a task-status trigger that sets `completed_at` when entering `completed` and clears it when leaving `completed`.
25. Keep database constraints required by current MVP invariants, including priority slot uniqueness, timer single-running uniqueness, foreign keys, and valid status/date/amount checks.
26. Harden `handle_new_user()` with `SET search_path = public, pg_temp` and explicit qualification; this protects the trigger function itself but does not provide row isolation.
27. Disable RLS on every MVP application table created by the historical migration: `profiles`, `categories`, `routine_templates`, `routine_template_items`, `daily_routine_runs`, `tasks`, `subtasks`, `daily_priorities`, `calendar_blocks`, `time_entries`, `bills`, `bill_payments`, and `notification_preferences`.
28. Revoke table privileges from `anon` for the MVP application tables so an unauthenticated browser cannot use the public client key to read or write data.
29. Grant the authenticated role the table privileges required by the current services (`SELECT`, `INSERT`, `UPDATE`, and `DELETE` where the service uses it); do not rely on RLS policies to provide access.
30. Do not add cross-owner consistency triggers in the MVP migration. Keep `user_id` filters in services and RPC predicates as correctness checks only.
31. Document that disabling RLS is intentional for this private one-owner deployment and that the database is unsafe for additional users until post-MVP hardening.
32. Create `notification_deliveries` when the reminder worker is implemented, with browser privileges revoked and worker/service-role privileges granted explicitly; do not enable RLS on it during MVP.
33. Keep RPC execution grants narrow and revoke unneeded function execution from `PUBLIC`; this is separate from row-level isolation.
34. Add SQL comments to security-definer RPCs explaining that MVP privacy depends on the project remaining private and single-owner.
35. Add a migration check that records the expected MVP security mode: RLS disabled, `anon` denied, and `authenticated` granted required table access.
36. Reset the local database from scratch and inspect the schema, grants, and function lists to verify full authenticated access and no anonymous table access.
37. Run the MVP schema and invariant tests without asserting two-user isolation; tag the omitted checks as post-MVP.
38. Verify deployment configuration documents that public exposure or additional users require the post-MVP RLS phase.

Exit gate: MVP schema and current-feature invariants pass on a clean reset, authenticated Supabase access supports all implemented workflows, anonymous table access is revoked, and the deployment remains private and single-owner.

### Phase D — Implement and test the required RPCs

Create one migration per coherent RPC group so failures and rollbacks are easy to isolate.

39. Implement `apply_daily_routine(p_template_id uuid, p_target_date date)` with the exact idempotency, ownership, active-template, ordered-copy, snapshot-link, and return behavior in Section 5.5.
40. Add routine RPC tests for first apply, repeat apply, archived template, foreign-owned template, ordered item copying, zero-item template, and two concurrent calls.
41. Implement a shared locked priority-compaction helper that defers `daily_priorities_slot_unique` and always leaves positions contiguous from 1.
42. Implement `set_daily_priority(p_task_id uuid, p_priority_date date, p_position smallint)` using that helper and all Section 5.5 ownership/status rules.
43. Implement `remove_daily_priority(p_task_id uuid, p_priority_date date)` using the same lock and compaction path.
44. Implement `archive_task(p_task_id uuid)` so every date containing the task is compacted before the task becomes archived.
45. Add priority/archive tests for empty days, slots 1-3, insert, move, displacement, removal, completed tasks, archived tasks, foreign tasks, archive compaction across multiple dates, and concurrent mutations.
46. Implement `start_time_entry(p_task_id uuid, p_calendar_block_id uuid, p_title text)` with database time, owner validation, explicit-block precedence, deterministic active-block auto-linking, and second-running-entry rejection.
47. Implement `stop_time_entry(p_time_entry_id uuid)` with owned-row validation and idempotent repeated-stop behavior.
48. Implement `save_manual_time_entry(...)` with completed-interval validation and same-owner task/block compatibility.
49. Add timer RPC tests for unlinked starts, explicit links, deterministic auto-links, foreign links, duplicate starts, repeated stops, invalid intervals, and concurrent starts.
50. Implement `generate_bill_payments_for_month(p_month date)` from the authoritative SQL in Section 5.5 rather than reimplementing date arithmetic.
51. Add bill RPC tests for January 31 into February 28/29, April 30, first-due boundaries, one-time bills, archived bills, amount override preservation, repeat calls, foreign ownership, and concurrent calls.
52. Revoke all RPC execution from `PUBLIC`; grant browser RPCs only to `authenticated`; keep worker-only functions restricted to `service_role`.
53. Run all SQL/RPC tests after a clean database reset.

Exit gate: every Section 5.5 RPC exists, has explicit grants, and passes ownership, idempotency, edge-case, and concurrency tests.

### Phase E — Generate types and align the Phase 2 frontend

54. Generate `src/types/database.types.ts` from the reset local schema; replace the current partial hand-written file.
55. Type the Supabase singleton as `createClient<Database>(...)` so invalid tables, columns, values, and RPC arguments fail TypeScript compilation.
56. Change `TaskStatus` and every initial/reopen comparison from `pending` to `todo`.
57. Rename the task model and form payload field from `estimated_duration_minutes` to `estimated_minutes` across types, components, services, and local fixtures.
58. Rename subtask fields from `completed`/`sort_order` to `is_completed`/`position` across types, UI, services, and local fixtures.
59. Ensure task fetches return subtasks ordered by `position` and never rely on a missing client-only alias.
60. Update task create and update payloads to use only generated `tasks` insert/update fields.
61. Implement Supabase subtask persistence for task editing: insert new rows, update owned existing rows, delete removed owned rows, and then refetch the authoritative task.
62. Add failure handling so a subtask mutation error is surfaced and the UI refetches server state instead of presenting an optimistic local-only result.
63. Replace direct task archive updates with `archive_task` RPC calls.
64. Remove unsupported routine-template `description` from `RoutineBar`, defaults, inputs, service payloads, and domain types.
65. Rename routine item fields to `routine_template_id`, `estimated_minutes`, and one-based `position`; include required `user_id` on insert.
66. Rename routine-run `template_id` to `routine_template_id` everywhere.
67. Replace the browser-side routine duplicate-check/task loop/run insert with one `apply_daily_routine` RPC call.
68. Make repeat routine application return the already-created task set as a successful idempotent result rather than a client-side error.
69. Change routine-template removal to set `archived_at` and filter archived templates from normal fetches; remove direct hard deletion.
70. Rename priority fields to `priority_date` and `position` across types, UI-facing adapters, and local fixtures.
71. Replace priority delete/reinsert logic with `set_daily_priority` and `remove_daily_priority` RPC calls.
72. Refetch ordered priorities after each RPC; if the UI uses optimistic state, restore the previous state on RPC failure.
73. Keep local mode behavior aligned with the canonical Supabase names and RPC outcomes so switching backends does not change domain shapes.
74. Search the entire repository for the retired names `pending`, `estimated_duration_minutes`, `sort_order`, subtask `completed`, routine `template_id`, priority `target_date`, and `slot_number`; classify and remove every persistence/domain occurrence.
75. Run TypeScript/build and lint. Treat generated-client errors as unresolved schema drift rather than casting database results to domain types.

Exit gate: the typed client compiles without casts that conceal schema drift, and the implemented Phase 2 features use RPCs and canonical database names.

### Post-MVP Phase F — Add RLS and service integration coverage

Do not execute this phase as part of the MVP integration. It is the release gate for converting the single-tenant Supabase preview into a multi-user backend.

76. Create deterministic SQL fixtures for two auth users and owned rows in every public table.
77. Add a helper that runs each assertion as the `authenticated` role with the selected user's JWT claims; do not test RLS as `postgres` or `service_role`.
78. For every direct-owner table, assert User A can perform each permitted operation on A's row.
79. For every direct-owner table, assert User A cannot select, insert as, update, or delete User B's row.
80. Add equivalent parent-derived ownership tests for subtasks.
81. Assert browser roles cannot directly mutate `daily_priorities` or running `time_entries` and can mutate them only through their RPCs.
82. Assert browser roles cannot select, insert, update, or delete `notification_deliveries`.
83. Assert cross-owner foreign-key combinations are rejected by owner-consistency triggers even when a direct table policy would otherwise allow the row.
84. Assert task/template/bill archive behavior works while direct hard deletion is denied.
85. Add service integration tests against local Supabase for category seed, task CRUD/subtasks, routine create/apply/reapply/archive, priority set/move/remove, and task archive compaction.
86. Add an Auth smoke test that registers two local users, obtains two real sessions, and repeats one representative cross-user read and write through Supabase JS.
87. Add unit tests for the local adapter using the same canonical domain fixtures as the Supabase integration tests.
88. Add CI steps for local database reset, SQL tests, type generation drift check, service integration tests, lint, and build.

Exit gate: explicit least-privilege policies, owner-consistency enforcement, and automated positive/negative two-user tests pass through SQL and the actual Supabase client. Only then may Supabase-backed multi-user or sensitive-data production use be considered.

### Phase G — Verify full MVP functionality against a private Supabase project

89. Create or select a dedicated development/staging Supabase project; do not target production.
90. Link the CLI to that project without committing its project reference or access token.
91. Compare local migrations with the remote migration history and stop if the histories conflict.
92. Apply the repair/RPC migrations to staging.
93. Regenerate database types from staging and confirm there is no meaningful diff from local generated types.
94. Configure a local `.env` with `VITE_DATA_BACKEND=supabase` and the staging URL plus publishable/anon key.
95. Configure approved local and staging Auth redirect URLs and email-confirmation behavior.
96. Configure the private Supabase project with the MVP migration that disables RLS, denies `anon`, and grants the required access to `authenticated`.
97. Register the designated owner account and run the full current Phase 2 task, subtask, routine, priority, archive, logout, password-reset, and session-refresh smoke suite through Supabase mode.
98. Exercise every implemented Supabase service path and confirm no workflow is forced onto local storage solely because RLS is deferred.
99. Do not run or claim cross-user isolation tests in the MVP staging phase; those belong to post-MVP Phase F.
100. Confirm the browser network log contains only publishable/anon credentials and user JWTs, never service-role, Cron, or email-provider secrets.
101. Record the exact staging migration version, grant matrix, and full-functionality test results before using the private project as the MVP environment.

Exit gate: the designated owner can exercise all implemented MVP workflows through Supabase, anonymous table access is denied, and the staging report prominently records that RLS isolation is intentionally not implemented yet.

### Phase H — Implement reminders only when Phase 7 prerequisites exist

This phase addresses a valid roadmap gap and must not be folded into the immediate Phase 2 integration patch.

102. Confirm bill CRUD, payment-state changes, notification settings, and `generate_bill_payments_for_month` are complete.
103. Scaffold `supabase/functions/send-bill-reminders` as a private function with no browser-callable service-role path.
104. Validate the scheduled invocation secret before doing any work.
105. Create `notification_deliveries` with browser privileges revoked and service-role access granted; leave RLS disabled under the private-project MVP policy.
106. Use a service-role client only inside the function to identify eligible users and retrieve verified account email addresses through the Admin API.
107. Evaluate eligibility using each profile's IANA timezone, configured local reminder time, look-ahead days, opt-in state, and existing delivery row.
108. Call `generate_bill_payments_for_month` for all months required by the Section 6.5 look-ahead contract.
109. Atomically claim one frozen `notification_deliveries` payload per user/local date before sending.
110. Send one digest through Resend using the stable delivery idempotency key.
111. Store provider ID/sent state on success and bounded attempt/error state on failure; retries must reuse the frozen payload and key.
112. Add function tests with mocked Supabase Admin/Resend boundaries for no-op, DST/timezone eligibility, paid/archived suppression, opt-out, concurrent claim, timeout/429/5xx, retry, and duplicate prevention.
113. Store provider and service-role credentials only in Edge Function secrets.
114. Store the function URL and scheduled invocation secret in Supabase Vault.
115. Add a migration that schedules the private function every 15 minutes through Supabase Cron without embedding a secret in SQL.
116. Add observable final-failure reporting and a staging-only manual invocation path.
117. Deploy the function and Cron schedule to the private staging project, then run one monitored delivery smoke test to a controlled inbox.
118. Verify disabled users and users with no actionable bills receive no message.
119. Document rollback commands that unschedule Cron first and then disable the function without deleting delivery audit rows.

Exit gate: the private single-owner staging account proves one digest at most per local date, correct suppression, stable retries, no browser secrets, and a reversible Cron rollout. Multi-user or public reminder deployment remains blocked until post-MVP RLS passes.

## Final acceptance checklist

- `.env` is ignored; `.env.example` is safe and complete.
- Backend mode is explicit and production cannot silently fall back to local storage.
- A clean local Supabase reset applies all migrations.
- All Section 5.5 RPCs exist with least-privilege grants.
- Frontend and local-adapter models use authoritative database names and `todo` status.
- `createClient<Database>` uses freshly generated complete types.
- Routine application, priority mutation, and task archive use RPCs rather than multi-step browser writes.
- Supabase subtask edits persist and refetch correctly.
- MVP Supabase use is explicitly private and single-owner while RLS is deferred.
- RLS is disabled for MVP tables, `anon` table access is revoked, and `authenticated` has the access required for full functionality.
- The release checklist blocks public exposure or additional users until post-MVP RLS work passes.
- SQL edge/concurrency tests, service integration tests, lint, and build pass.
- All implemented Phase 2 workflows pass through Supabase mode for the designated owner.
- Edge Function/Cron work remains gated behind completed bill/reminder prerequisites and a staging delivery test.

Post-MVP release criteria:

- Every public table has intentional least-privilege RLS behavior.
- Two authenticated users cannot read or mutate each other's rows or exploit cross-owner references.
- Owner-consistency triggers and negative cross-user integration tests pass.
- The Supabase-backed deployment is approved for additional users or public exposure only after those checks pass.

## Stop conditions for the executing agent

Stop and request direction instead of guessing if any of these occurs:

1. The remote project contains applied migrations not represented in this repository.
2. Existing remote rows violate a new payment-state constraint.
3. The product owner wants to preserve routine-template descriptions; that requires an explicit schema and `PROJECT_PLAN.md` change instead of silently adding a column.
4. The private-project assumption changes, or someone proposes public exposure/additional users before RLS is complete.
5. A requested migration would expose a service-role, Cron, or provider secret to browser code or committed SQL.
6. Concurrent RPC tests cannot be run in the available environment; do not mark the transactional work complete based only on sequential tests.
7. The MVP Supabase migration cannot disable RLS, revoke `anon`, and grant the required `authenticated` privileges without risking unrelated data.
