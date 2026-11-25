# ADR-002: Anonymize before scoring, and check the result in code

- **Status:** Accepted
- **Date:** 2026-11-25

## Context
Small companies screen CVs by eye, and the name, gender, age, photo and nationality on the page shape the decision before the experience does. If one model reads the whole CV and scores it, it sees the same things a person sees.

## Options
- **(a) One model call:** "ignore personal details and score". The details are still in the prompt, and nothing proves they were ignored.
- **(b) Code-only redaction.** Reliable for the applicant's own name, email and phone, which the form gives us. It can't find an address, an age written in words, or «متزوج وأب لطفلين».
- **(c) Three layers:** code removes what it knows for sure, a separate model call anonymizes the rest, then code checks the anonymized text again before anything scores it.

## Decision
**(c).**
1. *Read CV* (code) removes the applicant's own name parts, every email and every phone number.
2. *Anonymize (LLM)* removes address, age and date of birth, gender, nationality, religion, marital status and photo mentions, and makes gendered titles neutral. It is told to keep everything else word for word.
3. *Check anonymization* (code) searches the result for the name parts and for patterns like `Gender:`, `Date of birth`, `الحالة الاجتماعية:`. Anything found is removed by code and the row is flagged.

The scorer and the feedback writer only ever see the output of step 3. Names and emails live in a separate *identities* sheet. The *candidates* sheet that a reviewer works from has only an anonymous ID such as `C-1K9X2Q`.

## Consequences
- ✅ The scoring model never receives a name, email, phone or the personal-details block.
- ✅ The demo includes a matched pair (Ahmad and Sara: same experience, different name, gender, age, nationality and marital status) to test that the score doesn't move.
- ⚠️ Arabic carries gender in grammar («مسوّقة»، «أخصائية»). The anonymizer is asked to neutralize titles, but verb and adjective forms can still hint at gender. This is a known residual risk.
- ⚠️ Facts that correlate with identity stay, because they are the job evidence: university, company names, years of experience. A blind screen hides who someone is, not where they've been.
- ⚠️ Three model calls per CV instead of one.
