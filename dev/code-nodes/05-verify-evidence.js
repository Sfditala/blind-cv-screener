// ADR-003: a score only counts if its quote really is in the (anonymized) CV.
// Totals and the verdict are computed here, in code.
const cfg = $('Config').first().json;
const apps = $('Read CV').all();
const anon = $('Check anonymization').all();
const res = $input.all();

const norm = (s) => String(s).normalize('NFKC').toLowerCase().replace(/[“”"«»]/g, '').replace(/\s+/g, ' ').trim();

return apps.map((app, i) => {
  const a = anon[i].json;
  const flags = [...a.anon_flags];
  let parsed = { criteria: [] };
  try { parsed = JSON.parse(res[i].json.choices[0].message.content); } catch (e) { flags.push('scorer returned no JSON'); }
  const byKey = Object.fromEntries((parsed.criteria || []).map((c) => [c.key, c]));
  const haystack = norm(a.anonymized_text);

  const scores = {}; const evidence = [];
  let unverified = 0;
  for (const r of cfg.rubric) {
    const c = byKey[r.key] || {};
    let score = Math.max(0, Math.min(5, Math.round(Number(c.score) || 0)));
    // The model sometimes misspells the field name (seen: "evidence_year"). Any evidence_* field
    // is accepted, because the quote itself is still checked against the CV below.
    const quoteField = c.evidence_quote ?? Object.entries(c).find(([k]) => k.startsWith('evidence'))?.[1];
    const quote = String(quoteField || '').trim();
    const found = quote && haystack.includes(norm(quote));
    if (score > 0 && !found) { unverified++; flags.push(`${r.key}: quote not in CV, scored 0`); score = 0; }
    scores[r.key] = score;
    evidence.push(`${r.name} ${score}/5: ${found ? '«' + quote + '»' : '(no evidence)'}`);
  }
  const total = Object.values(scores).reduce((s, x) => s + x, 0);
  const verdict = total >= cfg.shortlist_at ? 'shortlist' : total >= cfg.review_at ? 'review' : 'not a fit';

  return { json: {
    candidate_id: app.json.candidate_id, submitted_at: app.json.submitted_at, cv_language: app.json.lang,
    total_25: total, verdict, ...scores, evidence: evidence.join('\n'), flags: flags.join('; '),
    // kept for the next steps, not written to the candidates sheet
    _name: app.json.name, _email: app.json.email, _cv_file: app.json.cv_file,
    _summary: parsed.summary || '', _reasons: (parsed.criteria || []).map((c) => `${c.key}: ${c.reason}`).join('\n'),
    _unverified: unverified,
  } };
});
