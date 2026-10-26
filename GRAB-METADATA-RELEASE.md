# Grab card metadata — October 26, 2026
Cards on Capture workspace, Library grid/details/inspector and saved-conversation chooser now show saved chat date range, capture timestamp beneath it, and a short topic preview. Uses originalCreatedAt plus saved message timestamps; missing dates are explicitly unavailable, never inferred from capturedAt. Older captures without original timestamps cannot have their historical dates reconstructed by this UI change.

Existing insights.summary is preferred; otherwise local rules identify specific ChatGrab subjects from user text, or an extractive preview uses the first user messages for other topics. This is a topic preview, not a new model-generated semantic analysis. No API, credential, transcript upload, storage mutation or original transcript change. Shared memoized component avoids rescan on unrelated renders.

Three focused tests cover unavailable/partial dates, message range independent of capture, and ChatGrab topic descriptions/existing summaries. TypeScript and both builds checked. Browser attached but its library contains zero records; owner records were not accessed or deleted. Rendered populated-card QA not claimed.
