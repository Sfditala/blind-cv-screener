// For "not a fit" only: ask the model for two concrete, kind improvement points.
// The model sees the anonymized CV and the scores, never the name (ADR-002).
const cfg = $('Config').first().json;
const anon = Object.fromEntries($('Check anonymization').all().map((i) => [i.json.candidate_id, i.json.anonymized_text]));

return $input.all().map(({ json: c }) => {
  const scores = cfg.rubric.map((r) => `${r.name}: ${c[r.key]}/5`).join(', ');
  const language = c.cv_language === 'ar' ? 'Arabic (clear, warm Levantine-friendly Modern Standard Arabic)' : 'English';
  const system = `You write feedback for a job applicant who was not selected for "${cfg.job_title}".
Write in ${language}. Be respectful and specific to THIS CV. No generic advice, no false hope, no mention of scores or AI.
Return JSON: {"points": [two strings, each one concrete thing they could add or improve for this kind of role, max 30 words each], "closing": "one encouraging sentence"}`;
  return { json: { ...c, feedback_body: {
    messages: [{ role: 'system', content: system }, { role: 'user', content: `Scores: ${scores}\nScorer notes:\n${c._reasons}\n\nCV:\n${anon[c.candidate_id] || ''}` }] } } };
});
