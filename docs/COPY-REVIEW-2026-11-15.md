# ChatGrab explanatory copy review — November 15, 2026

Status: preview source and review artifacts ready; not merged or published.

## Editorial direction

Keep the user's terminology, including context, provenance, reintegration and continuity. Explain a term at the point where someone first needs it. Connect what the tool does with why it helps, the actual steps to use it, and a concrete example. “Simpler” must not mean stripping away the reasons and meaning.

Context includes goals, reasons, limits, changes and the circumstances surrounding an answer. AI may retain a conclusion without all of that background; avoid claiming that all AI always forgets why, or that ChatGrab grants automatic memory, awareness or cognition. The current reintegration workflow is user-directed selection, review, save, and manual copy/attachment into the next AI chat. A saved record alone does not transmit anything.

Put useful explanations first. Retain precise privacy/storage limits and distinguish working functions from features in development. Do not turn missing capabilities into claims of completed development. Preserve stable route, schema, storage and analysis IDs. This change does not implement projects, accounts, admin roles or new model connections.

## Applied changes

Updated primary instructions and descriptions across 23 React component files plus App and headline copy (24 tracked files total before adding new content/docs). The seven-stage guide now has shared content in `src/content/workflow-copy.ts`, reused by the Media chapter navigation. Every stage explains the term, purpose, steps and everyday use. Updated capture, library, dashboard, source counts, AI review, review history, reintegration, packet preparation introduction, supporting files, export, backup, connection and plugin introductions. Removed unqualified automatic-analysis implications from the capture introduction. Existing AI prompt templates, validation, persistence and execution behavior are retained.

Some concise control labels and precise validation errors remain intentionally brief. Existing approved graphics, embedded image lettering, the historical PDF and MP4 have not been redrawn or re-recorded; expanded live captions guide readers through their terminology. The narration drafts are ready for review before new recordings replace historical media. This is a broad explanatory pass, not a claim that every string or embedded media asset was replaced.

`docs/WORKFLOW-EXPLAINER-SCRIPTS.md` contains seven roughly one-minute verbatim narration drafts with visual directions. They cover ChatGrab's seven guide stages, not AIChatLab's separate nine-step site navigation. Recording duration must be timed at the chosen voice pace.

## Review delivery

`docs/copy-review/ChatGrab-Copy-Review.html` is a self-contained interactive review, using the unchanged official logo. Switch between the complete seven-stage copy and 77 before/after wording entries, filter by topic, add notes, and export copy plus notes as JSON. Notes remain in the tab until exported; they are preserved when switching views. No production data is read or changed.

Schema `chatgrab-copy-review/1` is a documented Atlas handoff format, not a verified import format for the existing AIChatLab admin editor. The existing admin review site collects annotations and exports requests; neither that export nor this review export automatically edits production.

## Verification

- `npm run lint`: passed.
- `npm run build`: passed.
- `npm test`: 61 passed, zero failed.
- Local built-app browser smoke: capture, workspace, analysis, library, artifacts, export, media, guide, plugin, settings, bridge; no page errors or horizontal overflow at 1440px.
- Expanded guide: all seven stages present with steps; no overflow at 1280, 768, 390 and 320px.
- Standalone review: seven stages, retained notes across views, downloaded JSON containing the exact entered note, phone layout; passed.
- React review: shared static content outside render; no new network request, hook, dependency, injected HTML or storage migration in app components. Existing illustrations, accessible dialogs and IDs retained.
- Existing nested main landmarks on the analysis route were observed, unchanged by this copy pass. These smoke checks are not a new full functional/security or hosted-production acceptance run.

Production is unchanged. Design/navigation publication remains gated by David's visual review under CG-NAV-TOUR-001. This copy work is isolated from native-plugin PR #15 and payment work.
