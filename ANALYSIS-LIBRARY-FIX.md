# Analysis saved-library selector fix — October 24, 2026

Reconciled Atlas commit aae747aaa7a2660c77ee51e7425f925a8b7e70e6 on the active release branch. Analysis now receives App's same corpus state as Library and exposes saved-conversation checkboxes, search, Select all/Clear, exact selected-source preview, optional pasted text and review export. No assets or developer-login script are missing for this manual flow.

Corrected an additional stale-prompt defect in the supplied patch: the ChatGPT prompt memo now depends on combinedSource and overLimit, and the second-opinion prompt depends on the same current source. Selection/deselection therefore recomputes content immediately. Replaced Workspace's disabled direct-connection-pending button with a working anchor to the selected-message manual workflow.

Browser QA used three explicitly synthetic imported conversations on localhost, preserving its existing record; no synthetic conversations were added to production. Selected 1 and 2: both titles and message IDs appeared, third omitted. Deselected 1: it disappeared immediately. Clear emptied prompt; search showed only matching source. Optional pasted text appeared separately; source changes reset consent. Copy button reported success, but the automation clipboard read did not independently return matching text, so clipboard content roundtrip is not certified. Optional second-opinion prompt included both selected sources and supplied answer. JSON download was opened from disk and verified to include exactly the two selected IDs/sources and exclude third. At 390px no horizontal document overflow; desktop/mobile screenshots retained under ignored evidence/analysis-fix.

TypeScript, both production builds and 24 existing automated tests passed. No real provider inference was performed or implied.

Library scope: both views share the same App corpus. Guests load browser-local storage at this origin. Optional configured cloud auth replaces that corpus with the signed-in owner's records. Different browser profiles, localhost versus production, or account state can have different libraries. This QA did not inspect or certify David's actual three production grabs or provision cloud credentials.

Rollback: d3151fa2310ee0ec721b3018da6e5b7b9981df14 / dpl_3j5qg7N8UBPFAWenFmu2UNXwtvwy. No data migration, reset or deletions.
