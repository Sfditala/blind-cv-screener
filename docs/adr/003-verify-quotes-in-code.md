# ADR-003: Every score needs a quote, and code checks the quote is really in the CV

- **Status:** Accepted
- **Date:** 2026-11-25

## Context
A score like "Analytics: 4/5" is easy for a model to produce and hard for a person to check. If the model invents a skill, the applicant is ranked on something they never wrote.

## Options
- **(a) Trust the score**, and ask the model to "only use the CV".
- **(b) Ask for a quote** and show it to the reviewer, unchecked.
- **(c) Ask for a quote and check it in code:** the quote has to appear, character for character, in the anonymized CV text the model was given.

## Decision
**(c).** *Verify evidence* normalizes both texts (Unicode NFKC, lower case, quotes and extra spaces removed) and checks the quote is a substring of the CV. A score above 0 without a matching quote becomes **0**, and the row is flagged `quote not in CV`.

The total, out of 25, and the verdict are computed in the same code node, not by the model:
- `shortlist` at 17 or more
- `review` from 11 to 16
- `not a fit` at 10 or less

## Consequences
- ✅ Every number in the candidates sheet has a sentence from the CV next to it, which a reviewer can check in seconds.
- ✅ A hallucinated skill costs the model, not the applicant: it scores 0 and is flagged.
- ⚠️ Strict on purpose: a quote with one changed word fails. That can cost a real applicant points if the model paraphrases. The flag makes those rows easy to find and re-check.
- ⚠️ Depends on ADR-001: without the Arabic repair, Arabic quotes could never match.
