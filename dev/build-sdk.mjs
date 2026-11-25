// Writes dev/out/workflow-sdk.js: the n8n Workflow SDK code for this workflow, with the
// Code-node sources from dev/code-nodes inlined.   node dev/build-sdk.mjs [--local]
// --local fills in my own sheet IDs from dev/local.json (git-ignored).
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const SKELETON = process.argv.includes('--skeleton');
const code = (f) => (SKELETON ? 'return $input.all();' : readFileSync(join(here, 'code-nodes', f), 'utf8'));
let config = code('01-config.js');
const local = process.argv.includes('--local') && existsSync(join(here, 'local.json')) ? JSON.parse(readFileSync(join(here, 'local.json'), 'utf8')) : null;
if (local) {
  config = config.replace("'YOUR_CANDIDATES_SHEET_ID'", JSON.stringify(local.candidates_sheet_id)).replace("'YOUR_IDENTITIES_SHEET_ID'", JSON.stringify(local.identities_sheet_id));
}
const C = local ? local.credentials : {};
const cred = (type, fallbackName) => (C[type] ? `{ ${type}: { id: ${JSON.stringify(C[type].id)}, name: ${JSON.stringify(C[type].name)} } }` : `{ ${type}: newCredential(${JSON.stringify(fallbackName)}) }`);
const J = JSON.stringify;
const cols = (names) => `{ mappingMode: 'defineBelow', matchingColumns: [], value: { ${names.map((n) => `${n}: expr('{{ $json.${n} }}')`).join(', ')} }, schema: [${names.map((n) => `{ id: ${J(n)}, displayName: ${J(n)}, required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true }`).join(', ')}] }`;
const llm = (name, field, batch) => `node({ type: 'n8n-nodes-base.httpRequest', version: 4.2, config: { name: ${J(name)}, retryOnFail: true, maxTries: 3, waitBetweenTries: 5000,
  parameters: { method: 'POST', url: expr("{{ $('Config').first().json.llm_url }}"), authentication: 'genericCredentialType', genericAuthType: 'httpHeaderAuth',
    sendBody: true, specifyBody: 'json', jsonBody: expr('{{ JSON.stringify($json.${field}) }}'),
    options: { timeout: 120000${batch ? ", batching: { batch: { batchSize: 1, batchInterval: 4000 } }" : ''} } },
  credentials: ${cred('httpHeaderAuth', 'Model API key (Header Auth)')} } })`;

const sdk = `import { workflow, node, trigger, ifElse, newCredential, expr } from '@n8n/workflow-sdk';

const form = trigger({ type: 'n8n-nodes-base.formTrigger', version: 2.7, config: { name: 'Apply (form)', parameters: {
  formTitle: 'Digital Marketing Officer · مسؤول/ة تسويق رقمي',
  formDescription: 'Upload your CV as a PDF. Your name and contact details are kept separate from your CV while it is reviewed. · ارفع/ي سيرتك الذاتية PDF. اسمك وبيانات التواصل بتنفصل عن السيرة وقت المراجعة.',
  formFields: { values: [
    { fieldLabel: 'Full name · الاسم الكامل', fieldName: 'name', fieldType: 'text', requiredField: true },
    { fieldLabel: 'Email · البريد الإلكتروني', fieldName: 'email', fieldType: 'email', requiredField: true },
    { fieldLabel: 'CV (PDF) · السيرة الذاتية', fieldName: 'cv', fieldType: 'file', multipleFiles: false, acceptFileTypes: '.pdf', requiredField: true },
  ] },
  responseMode: 'onReceived',
  options: { appendAttribution: false, buttonLabel: 'Send · إرسال', respondWithOptions: { values: { respondWith: 'text', formSubmittedText: 'Thank you, we received your application. · شكراً، وصلنا طلبك.' } } },
} } });
const demo = trigger({ type: 'n8n-nodes-base.manualTrigger', version: 1, config: { name: 'Run demo batch (8 CVs)' } });
const download = node({ type: 'n8n-nodes-base.httpRequest', version: 4.2, config: { name: 'Download demo CVs', parameters: {
  url: 'https://raw.githubusercontent.com/Sfditala/blind-cv-screener/main/data/demo-cvs.zip', options: { response: { response: { responseFormat: 'file' } } } } } });
const unzip = node({ type: 'n8n-nodes-base.compression', version: 1.1, config: { name: 'Unzip demo CVs', parameters: {
  operation: 'decompress', binaryPropertyName: 'data', outputPrefix: 'file_' } } });
const configForm = node({ type: 'n8n-nodes-base.code', version: 2, config: { name: 'Config', parameters: { jsCode: ${J(config)} } } });
const collect = node({ type: 'n8n-nodes-base.code', version: 2, config: { name: 'Collect applicants', parameters: { jsCode: ${J(code('02-collect.js'))} } } });
const extract = node({ type: 'n8n-nodes-base.extractFromFile', version: 1.2, config: { name: 'Extract PDF text', parameters: { operation: 'pdf', binaryPropertyName: 'data' } } });
const readCv = node({ type: 'n8n-nodes-base.code', version: 2, config: { name: 'Read CV', parameters: { jsCode: ${J(code('03-read-cv.js'))} } } });
const anonymize = ${llm('Anonymize (LLM)', 'anon_body', true)};
const checkAnon = node({ type: 'n8n-nodes-base.code', version: 2, config: { name: 'Check anonymization', parameters: { jsCode: ${J(code('04-check-anonymized.js'))} } } });
const score = ${llm('Score against rubric (LLM)', 'score_body', true)};
const verify = node({ type: 'n8n-nodes-base.code', version: 2, config: { name: 'Verify evidence', parameters: { jsCode: ${J(code('05-verify-evidence.js'))} } } });
const saveScores = node({ type: 'n8n-nodes-base.googleSheets', version: 4.5, config: { name: 'Save scores (blind sheet)', parameters: {
  operation: 'append', documentId: { __rl: true, mode: 'id', value: expr("{{ $('Config').first().json.candidates_sheet_id }}") },
  sheetName: { __rl: true, mode: 'name', value: expr("{{ $('Config').first().json.sheet_tab }}") },
  columns: ${cols(['candidate_id', 'submitted_at', 'cv_language', 'total_25', 'verdict', 'paid_ads', 'content_social', 'analytics', 'bilingual_writing', 'relevant_experience', 'evidence', 'flags'])},
  options: { cellFormat: 'RAW' } }, credentials: ${cred('googleSheetsOAuth2Api', 'Google Sheets')} } });
const saveIdentity = node({ type: 'n8n-nodes-base.googleSheets', version: 4.5, config: { name: 'Save identity (HR only)', parameters: {
  operation: 'append', documentId: { __rl: true, mode: 'id', value: expr("{{ $('Config').first().json.identities_sheet_id }}") },
  sheetName: { __rl: true, mode: 'name', value: expr("{{ $('Config').first().json.sheet_tab }}") },
  columns: { mappingMode: 'defineBelow', matchingColumns: [], value: { candidate_id: expr('{{ $json.candidate_id }}'), name: expr('{{ $json._name }}'), email: expr('{{ $json._email }}'), submitted_at: expr('{{ $json.submitted_at }}'), cv_file: expr('{{ $json._cv_file }}') },
    schema: [${['candidate_id', 'name', 'email', 'submitted_at', 'cv_file'].map((n) => `{ id: ${J(n)}, displayName: ${J(n)}, required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true }`).join(', ')}] },
  options: { cellFormat: 'RAW' } }, credentials: ${cred('googleSheetsOAuth2Api', 'Google Sheets')} } });
const notAFit = ifElse({ version: 2.2, config: { name: 'Not a fit?', parameters: { conditions: {
  options: { caseSensitive: true, leftValue: '', typeValidation: 'strict' },
  conditions: [{ leftValue: expr('{{ $json.verdict }}'), operator: { type: 'string', operation: 'equals' }, rightValue: 'not a fit' }],
  combinator: 'and' } } } });
const feedbackReq = node({ type: 'n8n-nodes-base.code', version: 2, config: { name: 'Feedback request', parameters: { jsCode: ${J(code('06-feedback-request.js'))} } } });
const feedback = ${llm('Write feedback (LLM)', 'feedback_body', true)};
const buildDraft = node({ type: 'n8n-nodes-base.code', version: 2, config: { name: 'Build feedback email', parameters: { jsCode: ${J(code('07-build-draft.js'))} } } });
const draft = node({ type: 'n8n-nodes-base.gmail', version: 2.1, config: { name: 'Save as Gmail draft (HR sends)', parameters: {
  resource: 'draft', operation: 'create', subject: expr('{{ $json.subject }}'), emailType: 'html', message: expr('{{ $json.html }}'),
  options: { sendTo: expr('{{ $json.to }}') } }, credentials: ${cred('gmailOAuth2', 'Gmail')} } });

export default workflow('blind-cv-screener', 'D2 · blind-cv-screener')
  .add(form).to(configForm)
  .add(demo).to(download).to(unzip).to(configForm)
  .add(configForm).to(collect).to(extract).to(readCv).to(anonymize).to(checkAnon).to(score).to(verify)
  .add(verify).to(saveScores)
  .add(verify).to(saveIdentity)
  .add(verify).to(notAFit.onTrue(feedbackReq.to(feedback.to(buildDraft.to(draft)))));
`;
mkdirSync(join(here, 'out'), { recursive: true });
writeFileSync(join(here, 'out', SKELETON ? 'workflow-sdk.skeleton.js' : local ? 'workflow-sdk.local.js' : 'workflow-sdk.js'), sdk);
// update_workflow operations that put the real code into an existing skeleton
if (!SKELETON) {
  const nodes = { 'Config': config, 'Collect applicants': code('02-collect.js'), 'Read CV': code('03-read-cv.js'), 'Check anonymization': code('04-check-anonymized.js'),
    'Verify evidence': code('05-verify-evidence.js'), 'Feedback request': code('06-feedback-request.js'), 'Build feedback email': code('07-build-draft.js') };
  writeFileSync(join(here, 'out', 'code-ops.json'), JSON.stringify(Object.entries(nodes).map(([nodeName, value]) => ({ type: 'setNodeParameter', nodeName, path: '/jsCode', value }))));
}
console.log('SDK code:', sdk.length, 'chars', local ? '(local)' : '');
