import { test, expect } from '@playwright/test';

const allSections = [
  { slug: 'coding', title: 'Coding Exercises' },
  { slug: 'code-review', title: 'Code Review' },
  { slug: 'tech-questions', title: 'Tech Questions' },
  { slug: 'behavioural', title: 'Behavioural' },
  { slug: 'company', title: 'Company-Specific' },
];

// tech-questions is a real, auth-gated feature now — covered separately below.
const placeholderSections = allSections.filter((section) => section.slug !== 'tech-questions');

test('home page lists all five sections', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Interview Prep', level: 1 })).toBeVisible();

  for (const section of allSections) {
    await expect(page.getByRole('link', { name: section.title, exact: true })).toBeVisible();
  }
});

for (const section of placeholderSections) {
  test(`navigating to ${section.slug} shows its placeholder`, async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: section.title, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/${section.slug}$`));
    await expect(page.getByRole('heading', { name: section.title, level: 1 })).toBeVisible();
  });
}

test('navigating to tech-questions while logged out redirects to login', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Tech Questions', exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
});
