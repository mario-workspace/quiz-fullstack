import { test, expect } from '@playwright/test';

test.describe('SPECS.md — UI flows', () => {
  test('home redirects or links to login', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/(login)?$/);
  });

  test('login page has email/password and GitHub OAuth', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'School Portal' })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Continue with GitHub' })).toBeVisible();
  });

  test('admin can sign in and reach dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@school.edu');
    await page.getByLabel('Password').fill('admin123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page).toHaveURL(/\/dashboard\/admin/, { timeout: 20000 });
    await expect(page.getByRole('heading', { name: 'User Management' })).toBeVisible();
  });

  test('unauthenticated user cannot access dashboard', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/, { timeout: 15000 });
  });
});
