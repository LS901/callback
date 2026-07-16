import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { signIn, signUp } from './actions';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;

  return (
    <Container maxWidth="xs" sx={{ py: 10 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Sign in
      </Typography>

      {!isSupabaseConfigured ? (
        <Alert severity="warning">
          Supabase isn&apos;t configured yet. Set <code>NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
          <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in <code>.env.local</code> to enable sign
          in/up.
        </Alert>
      ) : (
        <>
          {params.error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {params.error}
            </Alert>
          )}
          {params.message && (
            <Alert severity="info" sx={{ mb: 2 }}>
              {params.message}
            </Alert>
          )}
          <Stack component="form" spacing={2}>
            <TextField label="Email" name="email" type="email" required autoComplete="email" />
            <TextField
              label="Password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
            />
            <Stack direction="row" spacing={2}>
              <Button type="submit" formAction={signIn} variant="contained" fullWidth>
                Sign in
              </Button>
              <Button type="submit" formAction={signUp} variant="outlined" fullWidth>
                Sign up
              </Button>
            </Stack>
          </Stack>
        </>
      )}
    </Container>
  );
}
