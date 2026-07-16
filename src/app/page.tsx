'use client';

import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Link from 'next/link';
import { sections } from '@/lib/sections';

export default function Home() {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Interview Prep
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 6 }}>
        Practice grounded, version-aware interview questions across five modes.
      </Typography>
      <Grid container spacing={2}>
        {sections.map((section) => (
          <Grid key={section.slug} size={{ xs: 12, sm: 6 }}>
            <Card variant="outlined">
              <CardActionArea component={Link} href={`/${section.slug}`}>
                <CardContent>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {section.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {section.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
