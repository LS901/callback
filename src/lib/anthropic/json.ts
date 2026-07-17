/** Extracts the trailing ```json fenced block every generation prompt is instructed to end with. */
export function extractJson<T>(text: string): T {
  const fenced = text.match(/```json\s*([\s\S]*?)```/i);
  const raw = fenced ? fenced[1] : text.match(/\{[\s\S]*\}/)?.[0];
  if (!raw) {
    throw new Error('The model did not return a parseable response. Try again.');
  }
  try {
    return JSON.parse(raw.trim()) as T;
  } catch {
    throw new Error('The model returned malformed output. Try again.');
  }
}
