// Reads the model's answer (Gemini or OpenAI shape) and passes it on in one shape.
return $input.all().map((i) => {
  const j = i.json;
  let t;
  const parts = j.content?.parts || j.candidates?.[0]?.content?.parts;
  if (Array.isArray(parts)) t = parts.filter((p) => !p.thought && typeof p.text === 'string').map((p) => p.text).join('');
  else t = j.output_text ?? j.text ?? j.content;
  if (typeof t !== 'string') t = JSON.stringify(t ?? '');
  t = t.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  return { json: { choices: [{ message: { content: t } }] }, pairedItem: i.pairedItem };
});
