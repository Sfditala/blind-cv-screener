# ADR-001: Repair Arabic PDF text in code before anything reads it

- **Status:** Accepted
- **Date:** 2026-11-25

## Context
CVs arrive as PDFs. n8n extracts PDF text with pdf.js. I tested the demo CVs with the same library before building anything, and English came out clean. Arabic came out like this:

```
ﺐ ﻴ ﻄ ﺨ ﻟ ا   ﺎ ﻨ ﻴ ﻟ        ← should be: لينا الخطيب
```

Three problems at once: visual (reversed) order, one glyph per piece, and Unicode presentation forms instead of normal letters. The model can partly guess through it, but the evidence check (ADR-003) compares quotes with the text character by character, and that can't work on this.

## Options
- **(a) Send the raw PDF to the model** and let it read the file. Gemini reads PDFs well. But then the model writes the text the evidence is checked against, so the check would verify the model against itself.
- **(b) A PDF service** (OCR or a paid extractor). Another account, another cost, and the CV leaves for one more third party.
- **(c) Repair the text in a Code node.** Reverse the order of the pieces on each Arabic line, then NFKC-normalize the letters.

## Decision
**(c).** About 15 lines of code (`fixArabicLine` in the *Read CV* node). It only touches lines that contain presentation forms, so English CVs pass through unchanged.

Two details that mattered, found by testing on the demo CVs:
- Reverse the **order of the pieces**, never the letters inside a piece. Some pieces (أرد، Meta) already come out in the right order.
- Normalize **after** reversing. Normalizing first splits the ligature ﻼ into two letters, and reversing then turns «الميلاد» into «الميالد».

## Consequences
- ✅ Arabic CVs become readable text: «تاريخ الميلاد»، «إدارة الحملات الإعلانية».
- ✅ The evidence check works on Arabic too, because it compares against real text.
- ⚠️ An English phrase of two or more words inside an Arabic line comes out in reversed word order («Ads Meta»). Readable for the model, but a quote that spans it won't match exactly.
- ⚠️ Tested on PDFs printed from a browser. PDFs exported from Word or scanned CVs may behave differently. A scanned CV has no text at all and needs OCR, which this version doesn't do.

## Update after the first runs on n8n Cloud
n8n's *Extract From File* didn't return what pdf.js returned on my machine. It gave normal Arabic letters, not presentation forms, but with the **letters of each word reversed**, and not on every line:

```
انيل بيطخلا          ← should be: لينا الخطيب
تامولعم ةيصخش        ← should be: معلومات شخصية
```

`fixArabicLine` only runs on lines with presentation forms, so it skipped this, which is correct: reversing again would break the lines that came out right. Reversing every Arabic word in code isn't safe either, because some words on the same line are already in the right order (`إدارة` in Lina's CV came out right).

What works: the anonymizer prompt says the text may contain reversed Arabic words and asks the model to restore them. It is the only change the model is allowed to make besides removing identifiers. The model handles it well, because it reads the whole sentence and knows which spelling is a real word. The code repair stays for PDFs that do come out as presentation forms.

Two side effects:
- **Pre-redaction** looks for each name part in both spellings, `لينا` and `انيل`, so a reversed name never reaches the model.
- **The evidence check (ADR-003)** compares quotes with the *anonymized* text, which is already repaired. Arabic quotes match: in the final run, all of Lina's and Yousef's quotes were verified.
