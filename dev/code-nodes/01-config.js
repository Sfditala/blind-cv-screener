// ============================================================
//  ⚙️ CONFIG: the only node you need to edit
// ============================================================
return [{
  json: {
    company_en: 'Ufuq Marketing',
    company_ar: 'وكالة أفق للتسويق',
    job_title: 'Digital Marketing Officer · مسؤول/ة تسويق رقمي',
    job_description: 'Plan and run paid social and search campaigns, create bilingual content, and report results to management. Full time, Amman.',

    // Rubric: 5 criteria, each scored 0–5 by the model, and only with a quote from the CV as evidence.
    rubric: [
      { key: 'paid_ads', name: 'Paid ads', guide: '0 none · 3 ran campaigns · 5 managed budgets with measured results (ROAS, CPA)' },
      { key: 'content_social', name: 'Content & social media', guide: '0 none · 3 regular content work · 5 content with measured growth' },
      { key: 'analytics', name: 'Analytics & reporting', guide: '0 none · 3 used GA4 or reports · 5 built dashboards or regular reports for decisions' },
      { key: 'bilingual_writing', name: 'Arabic + English writing', guide: '0 no sign · 3 writes in one language · 5 writes copy in both' },
      { key: 'relevant_experience', name: 'Relevant experience', guide: '0 none · 2 under 1 year or internship · 3 1–2 years · 5 3+ years in marketing roles' },
    ],
    // Out of 25. At or above shortlist_at → shortlist. Below review_at → "not a fit" (a feedback DRAFT is prepared).
    shortlist_at: 17,
    review_at: 11,

    // Sheets (tab name as shown at the bottom of each sheet)
    candidates_sheet_id: 'YOUR_CANDIDATES_SHEET_ID',
    identities_sheet_id: 'YOUR_IDENTITIES_SHEET_ID',
    sheet_tab: 'Untitled',

    // Model, through the OpenAI-compatible chat API (Header Auth: Authorization = Bearer <key>)
    llm_url: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
    // Free tier: flash-lite has its own daily quota (gemini-3.5-flash allows only 20 requests/day)
    model: 'gemini-3.5-flash-lite',
  },
}];
