// ADR-002: check the anonymizer's output in code before the scorer sees anything.
// If an identifier slipped through, code removes it and the row is flagged.
const cfg = $('Config').first().json;
const apps = $('Read CV').all();
const res = $input.all();

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const LEAK_PATTERNS = [
  [/[\w.+-]+@[\w-]+\.[\w.]+/g, 'email'],
  [/\+?\d[\d\s-]{7,}\d/g, 'phone'],
  [/\b(male|female)\b|ذكر|أنثى/gi, 'gender'],
  [/(date of birth|born on|تاريخ الميلاد)\s*:?\s*[\d/.-]{6,}/gi, 'date of birth'],
  [/\b\d{2}\s*(years old)\b|العمر\s*:?\s*\d+/gi, 'age'],
  [/(marital status|الحالة الاجتماعية)\s*:(?![ \t]*\[removed\])[^\n]+/gi, 'marital status'],
  [/(nationality|الجنسية)\s*:(?![ \t]*\[removed\])[^\n]+/gi, 'nationality'],
];

const rubricText = cfg.rubric.map((r) => `- ${r.key} (${r.name}): ${r.guide}`).join('\n');
const system = `You score an anonymized CV against one job. You never see who the applicant is.
Job: ${cfg.job_title}. ${cfg.job_description}
Rubric, each criterion 0-5:
${rubricText}

For EVERY criterion return: key, score (integer 0-5), evidence_quote, reason.
- evidence_quote: copied EXACTLY, character for character, from the CV text: one sentence or fragment, max 25 words. No paraphrasing, no "...", no translation.
- No evidence in the CV → score 0 and evidence_quote "".
- Judge only what is written. Vague claims without specifics ("results-driven", "improved significantly") score at most 2.
- reason: one short sentence, in English.
Return JSON: {"criteria":[{"key","score","evidence_quote","reason"}], "summary": "one sentence"}`;

return apps.map((app, i) => {
  const flags = [];
  let text = '';
  try {
    const parsed = JSON.parse(res[i].json.choices[0].message.content);
    text = String(parsed.anonymized_text || '');
  } catch (e) { /* handled below */ }
  if (text.length < app.json.cv_chars * 0.4) throw new Error(`Anonymizer returned too little text for ${app.json.candidate_id}`);

  // Leak check: the applicant's own name parts, then generic identifiers
  for (const part of String(app.json.name).split(/\s+/).filter((p) => p.length >= 3)) {
    const re = new RegExp(esc(part), 'gi');
    if (re.test(text)) { flags.push('name leaked, removed by code'); text = text.replace(re, '[removed]'); }
  }
  for (const [re, label] of LEAK_PATTERNS) {
    if (text.match(re)) { flags.push(`${label} leaked, removed by code`); text = text.replace(re, '[removed]'); }
  }

  return { json: { candidate_id: app.json.candidate_id, anonymized_text: text, anon_flags: flags,
    score_body: {
      messages: [{ role: 'system', content: system }, { role: 'user', content: text }] } } };
});
