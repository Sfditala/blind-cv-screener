// Assembles ../workflow.json from the Code-node sources in ./code-nodes.
// Edit the .js files, then run:  node dev/build.mjs
// If dev/local.json (git-ignored) exists, it also writes ../workflow.local.json with my own
// sheet IDs and credential IDs for import. The committed workflow.json keeps placeholders.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const code = (f) => readFileSync(join(here, 'code-nodes', f), 'utf8');
// Stable ids, so rebuilding doesn't change every line of workflow.json
const id = (name) => { const h = createHash('sha1').update(name).digest('hex'); return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`; };
const localPath = join(here, 'local.json');
const local = existsSync(localPath) ? JSON.parse(readFileSync(localPath, 'utf8')) : null;

const X = 224;
const nodes = [];
const add = (name, type, typeVersion, [col, row], parameters, extra = {}) =>
  nodes.push({ id: id(name), name, type, typeVersion, position: [col * X, row * 220], parameters, ...extra });
const codeNode = (name, file, pos) => add(name, 'n8n-nodes-base.code', 2, pos, { jsCode: code(file) });
const cfg = (k) => `={{ $('Config').first().json.${k} }}`;
const sheetsCred = { googleSheetsOAuth2Api: { name: 'Google Sheets account' } };
const retry = { retryOnFail: true, maxTries: 3, waitBetweenTries: 5000 };

// AI steps: Google Gemini node. On n8n Cloud it can run on n8n's free AI credits (ADR-005).
const gemini = (name, body, pos, temperature) => add(name, '@n8n/n8n-nodes-langchain.googleGemini', 1.2, pos, {
  resource: 'text', operation: 'message',
  modelId: { __rl: true, mode: 'id', value: 'models/gemini-3-flash-preview' },
  messages: { values: [{ role: 'user', content: `={{ $json.${body}.messages[1].content }}` }] },
  simplify: true, jsonOutput: true,
  options: { systemMessage: `={{ $json.${body}.messages[0].content }}`, maxOutputTokens: 16000, temperature, thinkingBudget: 0 },
}, { credentials: { googlePalmApi: { name: 'Gateway credits' } }, ...retry });

const columns = (map) => ({
  mappingMode: 'defineBelow', matchingColumns: [], value: map,
  schema: Object.keys(map).map((k) => ({ id: k, displayName: k, required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true })),
});
const appendTo = (name, sheetKey, map, pos) => add(name, 'n8n-nodes-base.googleSheets', 4.5, pos, {
  operation: 'append',
  documentId: { __rl: true, mode: 'id', value: cfg(sheetKey) },
  sheetName: { __rl: true, mode: 'name', value: cfg('sheet_tab') },
  columns: columns(map), options: { cellFormat: 'RAW' },
}, { credentials: sheetsCred });
const j = (k) => `={{ $json.${k} }}`;

add('Note · Setup', 'n8n-nodes-base.stickyNote', 1, [-1, -2.2], {
  width: 520, height: 330, color: 4,
  content: [
    '## ⚙️ Before the first run · قبل أول تشغيل',
    '1. **Config** ← the two sheet IDs (blind scores + identities). Each sheet needs the column headers from the README.',
    '2. **Save scores** + **Save identity** ← Google Sheets OAuth2',
    '3. **Save as Gmail draft** ← Gmail OAuth2 (drafts only, nothing is sent)',
    '4. **Anonymize / Score / Write feedback (AI)** ← Google Gemini. On n8n Cloud pick **n8n free credits**; or your own Gemini key.',
    '',
    '▶ **Run demo batch** downloads 8 fictional CVs from the repo. The form is for real applicants.',
  ].join('\n'),
});

add('Apply (form)', 'n8n-nodes-base.formTrigger', 2.7, [0, 0], {
  formTitle: 'Digital Marketing Officer · مسؤول/ة تسويق رقمي',
  formDescription: 'Upload your CV as a PDF. Your name and contact details are kept separate from your CV while it is reviewed. · ارفع/ي سيرتك الذاتية PDF. اسمك وبيانات التواصل بتنفصل عن السيرة وقت المراجعة.',
  formFields: { values: [
    { fieldLabel: 'Full name · الاسم الكامل', fieldName: 'name', fieldType: 'text', requiredField: true },
    { fieldLabel: 'Email · البريد الإلكتروني', fieldName: 'email', fieldType: 'email', requiredField: true },
    { fieldLabel: 'CV (PDF) · السيرة الذاتية', fieldName: 'cv', fieldType: 'file', multipleFiles: false, acceptFileTypes: '.pdf', requiredField: true },
  ] },
  responseMode: 'onReceived',
  options: { appendAttribution: false, buttonLabel: 'Send · إرسال', respondWithOptions: { values: { respondWith: 'text', formSubmittedText: 'Thank you, we received your application. · شكراً، وصلنا طلبك.' } } },
});
add('Run demo batch (8 CVs)', 'n8n-nodes-base.manualTrigger', 1, [0, 1], {});
add('Download demo CVs', 'n8n-nodes-base.httpRequest', 4.2, [1, 1], {
  url: 'https://raw.githubusercontent.com/Sfditala/blind-cv-screener/main/data/demo-cvs.zip',
  options: { response: { response: { responseFormat: 'file' } } },
});
add('Unzip demo CVs', 'n8n-nodes-base.compression', 1.1, [2, 1], { operation: 'decompress', binaryPropertyName: 'data', outputPrefix: 'file_' });
codeNode('Config', '01-config.js', [3, 0]);
codeNode('Collect applicants', '02-collect.js', [4, 0]);
add('Extract PDF text', 'n8n-nodes-base.extractFromFile', 1.2, [5, 0], { operation: 'pdf', binaryPropertyName: 'data', options: {} });
codeNode('Read CV', '03-read-cv.js', [6, 0]);
gemini('Anonymize (AI)', 'anon_body', [7, 0], 0);
codeNode('Read anonymizer answer', 'read-answer.js', [8, 0]);
codeNode('Check anonymization', '04-check-anonymized.js', [9, 0]);
gemini('Score (AI)', 'score_body', [10, 0], 0);
codeNode('Read scorer answer', 'read-answer.js', [11, 0]);
codeNode('Verify evidence', '05-verify-evidence.js', [12, 0]);
appendTo('Save scores (blind sheet)', 'candidates_sheet_id', Object.fromEntries(
  ['candidate_id', 'submitted_at', 'cv_language', 'total_25', 'verdict', 'paid_ads', 'content_social', 'analytics', 'bilingual_writing', 'relevant_experience', 'evidence', 'flags'].map((k) => [k, j(k)])), [13, -1]);
appendTo('Save identity (HR only)', 'identities_sheet_id',
  { candidate_id: j('candidate_id'), name: j('_name'), email: j('_email'), submitted_at: j('submitted_at'), cv_file: j('_cv_file') }, [13, 0]);
add('Not a fit?', 'n8n-nodes-base.if', 2.2, [13, 1], { conditions: {
  options: { caseSensitive: true, leftValue: '', typeValidation: 'strict', version: 2 },
  conditions: [{ id: id('cond'), leftValue: j('verdict'), rightValue: 'not a fit', operator: { type: 'string', operation: 'equals' } }],
  combinator: 'and' }, options: {} });
codeNode('Feedback request', '06-feedback-request.js', [14, 1]);
gemini('Write feedback (AI)', 'feedback_body', [15, 1], 0.3);
codeNode('Read feedback answer', 'read-answer.js', [16, 1]);
codeNode('Build feedback email', '07-build-draft.js', [17, 1]);
add('Save as Gmail draft (HR sends)', 'n8n-nodes-base.gmail', 2.1, [18, 1], {
  resource: 'draft', subject: j('subject'), emailType: 'html', message: j('html'), options: { sendTo: j('to') },
}, { credentials: { gmailOAuth2: { name: 'Gmail account' } } });

const chain = [
  ['Apply (form)', 'Config'], ['Run demo batch (8 CVs)', 'Download demo CVs'], ['Download demo CVs', 'Unzip demo CVs'], ['Unzip demo CVs', 'Config'],
  ['Config', 'Collect applicants'], ['Collect applicants', 'Extract PDF text'], ['Extract PDF text', 'Read CV'], ['Read CV', 'Anonymize (AI)'],
  ['Anonymize (AI)', 'Read anonymizer answer'], ['Read anonymizer answer', 'Check anonymization'], ['Check anonymization', 'Score (AI)'],
  ['Score (AI)', 'Read scorer answer'], ['Read scorer answer', 'Verify evidence'],
  ['Verify evidence', 'Save scores (blind sheet)'], ['Verify evidence', 'Save identity (HR only)'], ['Verify evidence', 'Not a fit?'],
  ['Not a fit?', 'Feedback request'], ['Feedback request', 'Write feedback (AI)'], ['Write feedback (AI)', 'Read feedback answer'],
  ['Read feedback answer', 'Build feedback email'], ['Build feedback email', 'Save as Gmail draft (HR sends)'],
];
const connections = {};
for (const [from, to] of chain) {
  connections[from] ??= { main: [[]] };
  connections[from].main[0].push({ node: to, type: 'main', index: 0 });
}

const wf = { name: 'D2 · blind-cv-screener', nodes, connections, settings: { executionOrder: 'v1' }, pinData: {} };
writeFileSync(join(here, '..', 'workflow.json'), JSON.stringify(wf, null, 2) + '\n');
console.log(`workflow.json: ${nodes.length} nodes`);

if (local) {
  const mine = JSON.parse(JSON.stringify(wf));
  for (const n of mine.nodes) {
    if (n.name === 'Config') n.parameters.jsCode = n.parameters.jsCode
      .replace("'YOUR_CANDIDATES_SHEET_ID'", JSON.stringify(local.candidates_sheet_id))
      .replace("'YOUR_IDENTITIES_SHEET_ID'", JSON.stringify(local.identities_sheet_id));
    for (const [type, c] of Object.entries(n.credentials || {})) if (local.credentials?.[type]) n.credentials[type] = local.credentials[type];
  }
  writeFileSync(join(here, '..', 'workflow.local.json'), JSON.stringify(mine, null, 2) + '\n');
  console.log('workflow.local.json: with my sheet IDs and credentials (git-ignored)');
}
