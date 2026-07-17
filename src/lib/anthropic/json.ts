/**
 * Extracts the trailing ```json fenced block every generation prompt is
 * instructed to end with. Anchors on the LAST ```json marker and the LAST
 * ``` in the remainder, rather than a naive non-greedy match — a naive match
 * truncates early if a JSON string value (e.g. a model answer) contains its
 * own nested code fence, since the first ``` it finds isn't necessarily the
 * outer block's closing fence.
 */
export function extractJson<T>(text: string): T {
  const fenceMarker = '```json';
  const fenceStart = text.lastIndexOf(fenceMarker);
  let raw: string | undefined;

  if (fenceStart !== -1) {
    const afterFenceStart = text.slice(fenceStart + fenceMarker.length);
    const fenceEnd = afterFenceStart.lastIndexOf('```');
    raw = fenceEnd !== -1 ? afterFenceStart.slice(0, fenceEnd) : afterFenceStart;
  } else {
    raw = text.match(/\{[\s\S]*\}/)?.[0];
  }

  if (!raw) {
    throw new Error('The model did not return a parseable response. Try again.');
  }
  try {
    return JSON.parse(raw.trim()) as T;
  } catch {
    throw new Error('The model returned malformed output. Try again.');
  }
}
