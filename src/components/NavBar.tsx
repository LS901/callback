'use client';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Link from 'next/link';
import { sections } from '@/lib/sections';
import { signOut } from '@/app/login/actions';

export function NavBar({ userEmail }: { userEmail: string | null }) {
  return (
    <AppBar position="static" color="transparent" elevation={0}>
      <Toolbar sx={{ gap: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography
          variant="h6"
          component={Link}
          href="/"
          sx={{ fontFamily: 'var(--font-mono)', color: 'text.primary', flexGrow: 1 }}
        >
          interview-prep
        </Typography>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          {sections.map((section) => (
            <Button key={section.slug} component={Link} href={`/${section.slug}`} color="inherit">
              {section.title}
            </Button>
          ))}
          {userEmail ? (
            <form action={signOut}>
              <Button type="submit" color="inherit">
                {userEmail} · Sign out
              </Button>
            </form>
          ) : (
            <Button component={Link} href="/login" color="inherit">
              Sign in
            </Button>
          )}
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
