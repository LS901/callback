export type Section = {
  slug: string;
  title: string;
  description: string;
};

export const sections: Section[] = [
  {
    slug: 'coding',
    title: 'Coding Exercises',
    description:
      'Pick a language, framework, and version — solve a current, version-correct exercise.',
  },
  {
    slug: 'code-review',
    title: 'Code Review',
    description: 'Review intentionally flawed code and see what you caught versus missed.',
  },
  {
    slug: 'tech-questions',
    title: 'Tech Questions',
    description: 'Scenario-based questions, per technology or general engineering judgment.',
  },
  {
    slug: 'behavioural',
    title: 'Behavioural',
    description: 'STAR/CAR-framed culture and behavioural questions.',
  },
  {
    slug: 'company',
    title: 'Company-Specific',
    description:
      'Paste a job spec and company name for personalised questions across every mode above.',
  },
];
