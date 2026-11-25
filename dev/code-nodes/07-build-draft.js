// ADR-004: the email becomes a Gmail DRAFT. A person reads it and decides whether to send it.
const cfg = $('Config').first().json;
const reqs = $('Feedback request').all();
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));

return $input.all().map((r, i) => {
  const c = reqs[i].json;
  let fb = { points: [], closing: '' };
  try { fb = JSON.parse(r.json.choices[0].message.content); } catch (e) { /* empty points → draft says so */ }
  const ar = c.cv_language === 'ar';
  const first = String(c._name || '').split(/\s+/)[0];
  const points = (fb.points || []).slice(0, 2).map((p) => `<li style="margin:0 0 8px;">${esc(p)}</li>`).join('');
  const html = ar
    ? `<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;font-size:15px;line-height:1.8;color:#1f2937;">
<p>مرحباً ${esc(first)}،</p>
<p>شكراً لتقديمك على وظيفة <b>${esc(cfg.job_title)}</b> وللوقت اللي أعطيته لطلبك.</p>
<p>بعد مراجعة الطلبات، قررنا ما نكمل بطلبك لهالوظيفة. وحابين نشاركك نقطتين ممكن يقووا ملفك بفرص مشابهة:</p>
<ol>${points}</ol>
<p>${esc(fb.closing)}</p>
<p>مع التحية،<br>${esc(cfg.company_ar)}</p></div>`
    : `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.7;color:#1f2937;">
<p>Hi ${esc(first)},</p>
<p>Thank you for applying for the <b>${esc(cfg.job_title)}</b> role, and for the time you put into your application.</p>
<p>We've decided not to move forward with your application for this role. Here are two things that could strengthen your profile for similar roles:</p>
<ol>${points}</ol>
<p>${esc(fb.closing)}</p>
<p>Best regards,<br>${esc(cfg.company_en)}</p></div>`;
  return { json: { to: c._email, candidate_id: c.candidate_id,
    subject: ar ? `بخصوص طلبك لوظيفة ${cfg.job_title}` : `Your application for ${cfg.job_title}`, html } };
});
