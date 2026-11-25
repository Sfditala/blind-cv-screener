// Repair the extracted text (ADR-001), give the applicant an anonymous ID, remove the
// identifiers code can find for sure, and build the anonymizer request (ADR-002).
const cfg = $('Config').first().json;
const apps = $('Collect applicants').all();
const texts = $input.all();

// ---- ADR-001: Arabic from PDFs arrives reversed, glyph by glyph, in presentation forms ----
const PRESENTATION = /[\uFB50-\uFDFF\uFE70-\uFEFF]/;
function fixArabicLine(line) {
  if (!PRESENTATION.test(line)) return line;
  const words = line.trim().split(/\s{2,}/).map((w) => {
    const parts = w.split(' ').filter(Boolean);
    const glyphy = parts.filter((p) => [...p].length <= 2).length / parts.length > 0.6;
    return parts.reverse().join(glyphy ? '' : ' ');
  });
  return words.reverse().join(' ').normalize('NFKC').replace(/ ([\u064B-\u0652])/g, '$1'); // no space before diacritics
}
function fixArabic(text) {
  return String(text).split('\n').map(fixArabicLine).join('\n');
}

function shortId(s) { let h = 2166136261; for (const c of s) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619); } return 'C-' + (h >>> 0).toString(36).toUpperCase().slice(0, 6); }
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Removes what code can find for certain: the applicant's own name, email and phone numbers.
function preRedact(text, name, email) {
  let t = text;
  if (email) t = t.replace(new RegExp(esc(email), 'gi'), '[email removed]');
  t = t.replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, '[email removed]');
  t = t.replace(/(\+?\d[\d\s-]{7,}\d)/g, '[phone removed]');
  // n8n's PDF reader can return Arabic words with their letters reversed, so look for both spellings
  for (const part of String(name).split(/\s+/).filter((p) => p.length >= 3)) {
    for (const form of [part, [...part].reverse().join('')]) t = t.replace(new RegExp(esc(form), 'gi'), '[name removed]');
  }
  return t;
}

const system = `You anonymize CVs before they are scored, so the scorer cannot be influenced by who the applicant is.
Remove: name, email, phone, address or city of residence, date of birth and age, gender, nationality, religion, marital status and children, photo mentions, social profile links.
Replace each removed value with [removed]. Make gendered references to the applicant neutral (English: "they"; Arabic: rewrite feminine forms that refer to the applicant into the masculine-generic form, for verbs, job titles and adjectives alike, e.g. "مسوقة رقمية" → "مسوق رقمي", "أدارت" → "أدار", "كتبت" → "كتب").
The text was extracted from a PDF. Arabic words may come out with their letters in reverse order (e.g. "انيل بيطخلا" for "لينا الخطيب", "ةيصخش تامولعم" for "معلومات شخصية"). Restore every Arabic word to its correct spelling and keep the words in reading order. This repair is the only change you may make besides removing identifiers.
Keep EVERYTHING else exactly as written: same words, same numbers, same order, same language. Do not summarize, translate, fix spelling or add anything. Experience, skills, education, company names and dates of jobs stay.
Return JSON: {"anonymized_text": string, "removed": [string]} where "removed" lists the categories you removed.`;

return apps.map((app, i) => {
  const raw = fixArabic(String(texts[i].json.text || ''));
  const arabic = (raw.match(/[\u0600-\u06FF]/g) || []).length;
  const lang = arabic > raw.length * 0.2 ? 'ar' : 'en';
  const pre = preRedact(raw, app.json.name, app.json.email);
  const candidate_id = shortId(app.json.email + '|' + app.json.cv_file + '|' + app.json.submitted_at);
  return { json: { ...app.json, candidate_id, lang, cv_text: raw, cv_chars: raw.length,
    anon_body: { model: cfg.model, temperature: 0, response_format: { type: 'json_object' },
      messages: [{ role: 'system', content: system }, { role: 'user', content: pre }] } } };
});
