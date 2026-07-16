import { test, expect } from '@playwright/test';

test('login page shows a configuration notice when Supabase env vars are unset', async ({
  page,
}) => {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
  await expect(page.getByText(/Supabase isn.t configured yet/)).toBeVisible();
});

test('nav shows a Sign in link when logged out', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Sign in' })).toBeVisible();
});
