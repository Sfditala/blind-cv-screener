# ADR-005: Run the AI steps on n8n's free AI credits, through the Gemini node

- **Status:** Accepted (replaces the HTTP + own API key setup of the first build)
- **Date:** 2026-11-25

## Context
The first build called Gemini through its OpenAI-compatible endpoint with an HTTP Request node and my own free-tier key. Each CV needs two model calls (anonymize, score), plus one for feedback on rejected CVs, so the 8-CV demo makes about 19 calls. The free tier stopped every run:

| Run | Model | What happened |
|---|---|---|
| #12 | gemini-3.5-flash | 429 after 5 calls: the limit is 5 requests per minute |
| #13 | gemini-3.5-flash | 429 again after pacing to one call every 13 s: only 20 requests per **day** |
| #14 | gemini-3.5-flash-lite | 503 "high demand" |
| #15 | gemini-3.1-flash-lite | still running 15 minutes later on retries |

A screener that stops on the third applicant is not a screener.

## Options
- **(a) Keep my key and slow down further.** 20 requests a day is about 9 CVs a day. Fine for a demo, useless for a real job post.
- **(b) A paid key.** Works, but anyone who imports the workflow needs one before the first run.
- **(c) n8n's free AI credits.** n8n Cloud provides managed credentials ("Gateway credits") for some AI nodes, with no key to create.

## Decision
**(c), through the Google Gemini node.** Getting there took three tries:

1. **OpenAI node, Responses API, `gpt-4.1-mini`:** rejected with *"Gateway credits don't currently support this operation"*. n8n's coverage list says `text → response` is supported, so the operation wasn't the problem.
2. **Same node, without JSON mode:** same error. So it was the model: the credits only cover some models, and the error message doesn't say so.
3. **Google Gemini node, `gemini-3-flash-preview`:** worked. All 8 CVs went through in under a minute, with no pacing and no 429s.

One more change was needed. The first full run cut off an Arabic CV halfway through, because the model's *thinking* used up the output budget. `thinkingBudget: 0` and `maxOutputTokens: 16000` fixed it. Neither task needs reasoning: one copies text without identifiers, the other matches quotes to a rubric.

The node's answer comes back in Gemini's shape (`content.parts[].text`), so each AI node is followed by a small *Read … answer* Code node that turns it into one shape, the same one the HTTP version used. The rest of the workflow didn't change.

## Consequences
- ✅ No API key to set up. On n8n Cloud the three AI nodes pick "n8n free credits" by themselves.
- ✅ The whole demo runs in about 55 seconds instead of stopping partway.
- ⚠️ The credits are limited and belong to the n8n account. A busy job post would use them up, and then you need your own Gemini key on the same node, with no other change.
- ⚠️ Self-hosted n8n doesn't have the credits; it needs your own key.
- ⚠️ JSON mode is "attempt to return JSON", not a schema. In run #19 the scorer once wrote `evidence_year` instead of `evidence_quote`. That cost one of the matched pair a criterion, until *Verify evidence* learned to accept any `evidence_*` field. The quote itself is still checked against the CV (ADR-003), so the fix doesn't loosen anything.
