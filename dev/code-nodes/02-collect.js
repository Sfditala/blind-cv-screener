// One item per applicant, from the form or from the demo ZIP. The CV goes to binary.data.
const now = $now.toFormat('yyyy-MM-dd HH:mm');
const out = [];
if ($('Apply (form)').isExecuted) {
  const f = $('Apply (form)').first();
  const key = Object.keys(f.binary || {})[0];
  if (!key) throw new Error('No CV file in the form submission');
  out.push({ json: { name: String(f.json.name || '').trim(), email: String(f.json.email || '').trim(),
    cv_file: f.binary[key].fileName || 'cv.pdf', submitted_at: now, source: 'form' }, binary: { data: f.binary[key] } });
} else {
  // Demo identities: fictional people, emails on example.com (drafts only, never sent)
  const DEMO = {
    'cv-01-rami.pdf': ['Rami Haddad', 'rami.haddad@example.com'], 'cv-02-lina.pdf': ['لينا الخطيب', 'lina.k@example.com'],
    'cv-03-omar.pdf': ['Omar Saleh', 'omar.saleh@example.com'], 'cv-04-hiba.pdf': ['Hiba Nasser', 'hiba.nasser@example.com'],
    'cv-05-yousef.pdf': ['يوسف عبيدات', 'yousef.o@example.com'], 'cv-06-dana.pdf': ['Dana Qasem', 'dana.q@example.com'],
    'cv-07-ahmad.pdf': ['Ahmad Mansour', 'ahmad.mansour@example.com'], 'cv-08-sara.pdf': ['Sara Mansour', 'sara.mansour@example.com'],
  };
  const z = $('Unzip demo CVs').first();
  for (const [, bin] of Object.entries(z.binary || {}).sort((a, b) => (a[1].fileName > b[1].fileName ? 1 : -1))) {
    const [name, email] = DEMO[bin.fileName] || ['Unknown', ''];
    out.push({ json: { name, email, cv_file: bin.fileName, submitted_at: now, source: 'demo' }, binary: { data: bin } });
  }
}
return out;
