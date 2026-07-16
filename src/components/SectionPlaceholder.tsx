import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { sections } from '@/lib/sections';

export function SectionPlaceholder({ slug }: { slug: string }) {
  const section = sections.find((s) => s.slug === slug);
  if (!section) {
    throw new Error(`Unknown section slug: ${slug}`);
  }

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {section.title}
      </Typography>
      <Typography variant="body1" color="text.secondary">
        {section.description}
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mt: 4, fontFamily: 'var(--font-mono)' }}
      >
        Not built yet — see docs/spec.md for the phased plan.
      </Typography>
    </Container>
  );
}
