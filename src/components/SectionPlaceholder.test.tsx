import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SectionPlaceholder } from './SectionPlaceholder';

describe('SectionPlaceholder', () => {
  it('renders the section title and description for a known slug', () => {
    render(<SectionPlaceholder slug="coding" />);

    expect(screen.getByRole('heading', { name: 'Coding Exercises' })).toBeInTheDocument();
    expect(screen.getByText(/Pick a language, framework, and version/)).toBeInTheDocument();
  });

  it('throws for an unknown slug', () => {
    expect(() => render(<SectionPlaceholder slug="not-a-real-section" />)).toThrow(
      'Unknown section slug: not-a-real-section',
    );
  });
});
