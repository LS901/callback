import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CodeAwareText } from './CodeAwareText';

describe('CodeAwareText', () => {
  it('renders plain text with no code fence as a paragraph', () => {
    render(<CodeAwareText text="Just use a functional state update." />);

    expect(screen.getByText('Just use a functional state update.')).toBeInTheDocument();
  });

  it('renders a fenced code block in a <pre><code> element, separate from surrounding text', () => {
    const text = [
      'Use a functional update:',
      '',
      '```tsx',
      'setCount((c) => c + 1);',
      '```',
      '',
      'This avoids stale closures.',
    ].join('\n');

    render(<CodeAwareText text={text} />);

    expect(screen.getByText('Use a functional update:')).toBeInTheDocument();
    expect(screen.getByText('This avoids stale closures.')).toBeInTheDocument();
    const code = screen.getByText('setCount((c) => c + 1);', { selector: 'code' });
    expect(code.closest('pre')).toBeInTheDocument();
  });
});
