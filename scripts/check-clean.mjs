// Runs in CI. Fails if workflow.json carries credentials, tokens, real sheet IDs or personal
// addresses, or if a connection points at a node that doesn't exist.
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const file = 'workflow.json';
const text = fs.readFileSync(path.join(root, file), 'utf8');
const wf = JSON.parse(text);
const problems = [];

const patterns = [
  [/eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/, 'JWT-like token'],
  [/\bsk-[A-Za-z0-9_-]{16,}/, 'OpenAI-style key'],
  [/\bAIza[A-Za-z0-9_-]{20,}/, 'Google API key'],
  [/[\w.+-]+@(gmail|outlook|hotmail|yahoo|ucas)\.[a-z.]+/i, 'personal email address'],
  [/(docs|drive)\.google\.com\/[^\s"']+/, 'private Google link'],
  [/_sheet_id: '(?!YOUR_)[^']+'/, 'real Google Sheet ID'],
  [/_sheet_id: "[^"]+"/, 'real Google Sheet ID'],
];
for (const [pattern, label] of patterns) if (pattern.test(text)) problems.push(`${file}: ${label}`);

const names = new Set(wf.nodes.map((n) => n.name));
for (const node of wf.nodes) {
  if (node.webhookId) problems.push(`${file} · ${node.name}: webhookId`);
  for (const [type, cred] of Object.entries(node.credentials || {})) if (cred.id) problems.push(`${file} · ${node.name}: ${type} credential id`);
}
for (const [from, conn] of Object.entries(wf.connections)) {
  if (!names.has(from)) problems.push(`${file}: connection from missing node ${from}`);
  for (const t of conn.main.flat()) if (!names.has(t.node)) problems.push(`${file}: connection to missing node ${t.node}`);
}
// The demo CVs must use fictional addresses only
const demo = fs.readFileSync(path.join(root, 'dev/code-nodes/02-collect.js'), 'utf8');
for (const m of demo.matchAll(/'[\w.+-]+@([\w.-]+)'/g)) if (m[1] !== 'example.com') problems.push(`02-collect.js: demo address on ${m[1]}`);

console.log(`${file}: ${wf.nodes.length} nodes`);
if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
console.log('All clean.');
