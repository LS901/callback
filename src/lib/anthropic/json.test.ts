import { describe, expect, it } from 'vitest';
import { extractJson } from './json';

describe('extractJson', () => {
  it('parses a fenced json block with a lead-in sentence', () => {
    const text = [
      "Here's a question grounded in the latest docs.",
      '',
      '```json',
      '{"title": "Suspense boundaries", "scenario": "A dashboard streams data.", "question": "What happens?"}',
      '```',
    ].join('\n');

    expect(extractJson(text)).toEqual({
      title: 'Suspense boundaries',
      scenario: 'A dashboard streams data.',
      question: 'What happens?',
    });
  });

  it('falls back to a bare JSON object with no fence', () => {
    const text = '{"correctness": "Right about hooks.", "communication": "Clear."}';

    expect(extractJson(text)).toEqual({
      correctness: 'Right about hooks.',
      communication: 'Clear.',
    });
  });

  it('throws a clear error when there is nothing parseable', () => {
    expect(() => extractJson('Sorry, I could not generate that.')).toThrow(
      'The model did not return a parseable response.',
    );
  });

  it('throws a clear error when the fenced content is malformed JSON', () => {
    const text = ['```json', '{title: missing quotes}', '```'].join('\n');

    expect(() => extractJson(text)).toThrow('The model returned malformed output.');
  });
});
