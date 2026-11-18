# ChatGrab functional release — November 18, 2026

David explicitly authorized publication of ready work on November 18, starting with ChatGrab. This supersedes earlier preview-only instructions. Payments remain excluded. Private source material is not published.

## What changes

- Reviewed JSON import recognizes governed continuity capsules and preserves the entire source text exactly as one source-document record. It does not invent conversation turns, claim completeness, fetch source links or call an AI provider.
- Arbitrary JSON documents have an explicit import option; malformed conversation exports still fail validation. Original JSON is downloadable, searchable and included in complete backups.
- All capture file/text paths use review and confirmation. A single sidebar holds the tools; the header has a tour shortcut. White floating tiles sit on a slate canvas with readable type.
- Includes the pending explanatory workflow copy, source-linked packet categories and rationale, and corrected engineering-overview tour PDF from PRs 18–20.
- Current main's older workspace cards and uploaded archives are preserved in history; their duplicate application entry point is superseded by the current workspace implementation.

## Verification

67 unit tests passed. TypeScript and production build passed. Browser prototype acceptance passed seven groups: contextual search, source-linked review archive and revisions, responsive comparison, downloaded backup/fresh-browser restore, stale-source labels, source switching, and quota-failure preservation. Existing release regression passed five groups covering reviewed import, library/reload, actual downloads, supplied artwork and responsive destinations, and capability/payment boundaries.

The supplied private capsule passed browser import, reload/reopen, exact original download and fresh-browser backup restore. Only counts, a source fingerprint and test results are retained here. No private source text, URLs or screenshots are published. Capsule: 47,703 UTF-8 bytes, 26 fields, 16 reconstructed events, 15,641 excerpt characters. These are supplied-source counts, not original full-transcript counts.

Production verification is recorded separately after deployment. Rollback target is dpl_CscpyvSTL1dnRDPcrNjJVcuT98Zs / source 5ef8998eb5f28cae71584d6d6c8d31df45fb6dba.

## Still separate

Automatic access to private ChatGPT conversations, authenticated cloud synchronization, integrated AI replies, and live payments are not activated. The tool connection remains read-only. The private capsule is not a full conversation export; its claims remain imported assertions. ReviewStudio and the new protected Mothership split-pane assignment require their own verification and are not represented as completed by this release.
