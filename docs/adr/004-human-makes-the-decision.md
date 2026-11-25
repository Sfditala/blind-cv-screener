# ADR-004: The system prepares, a person decides: feedback is a Gmail draft

- **Status:** Accepted
- **Date:** 2026-11-25

## Context
The plan said: if the total is below the threshold, email the applicant feedback. 95% of applicants never hear back, and that email is half the point of the project. But an automatic rejection decided by a model, sent to a real person, is a decision about someone's job.

## Options
- **(a) Send automatically** when the score is low.
- **(b) Send nothing**, and leave feedback to HR.
- **(c) Write the feedback automatically, but save it as a Gmail draft.** A person reads the score, the evidence and the draft, then sends, edits or deletes it.

## Decision
**(c).** For `not a fit`, the workflow writes two specific improvement points with the model (which sees the anonymized CV, never the name), builds a polite email in the CV's language, and saves it as a **draft** in the HR Gmail. Nothing is sent to an applicant automatically. The verdict is a suggestion in the sheet, not an outcome.

## Consequences
- ✅ Applicants can still hear back, with something useful, at the cost of one click per email.
- ✅ A wrong score (see ADR-003's strictness) can be caught before anyone is told no.
- ⚠️ If HR never opens the drafts, nobody hears back. The drafts make the right thing easy, they don't force it.
- ⚠️ `review` candidates get no draft. They need a person to look at them either way.
