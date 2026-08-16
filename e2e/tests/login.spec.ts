import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = 'alice@company.com';
const ADMIN_NAME = 'Alice Admin';
const ADMIN_PASSWORD = 'password123';

test.describe('Login (Admin role)', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any session left over from a previous test/manual run.
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('logs in via the credential form and lands on the dashboard', async ({ page }) => {
    await page.goto('/#/login');
    await page.getByPlaceholder('nama@company.com').fill(ADMIN_EMAIL);
    await page.getByPlaceholder('••••••••').fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: 'Masuk' }).click();

    await expect(page).toHaveURL(/#\/dashboard$/);
    await expect(page.getByRole('complementary').getByText(ADMIN_NAME, { exact: true })).toBeVisible();
    await expect(page.getByText('System Administrator')).toBeVisible();
  });

  test('logs in via the Admin quick sign-in card', async ({ page }) => {
    await page.goto('/#/login');
    await page.getByRole('button', { name: new RegExp(ADMIN_NAME) }).click();

    await expect(page).toHaveURL(/#\/dashboard$/);
    await expect(page.getByText('System Administrator')).toBeVisible();
  });

  test('rejects an incorrect password and stays on the login screen', async ({ page }) => {
    await page.goto('/#/login');
    await page.getByPlaceholder('nama@company.com').fill(ADMIN_EMAIL);
    await page.getByPlaceholder('••••••••').fill('wrong-password');
    await page.getByRole('button', { name: 'Masuk' }).click();

    await expect(page).toHaveURL(/#\/login$/);
    await expect(page.getByText(/Kredensial tidak valid|Gagal melakukan proses login/)).toBeVisible();
  });

  test('keeps the session after a page reload', async ({ page }) => {
    await page.goto('/#/login');
    await page.getByRole('button', { name: new RegExp(ADMIN_NAME) }).click();
    await expect(page).toHaveURL(/#\/dashboard$/);

    await page.reload();

    await expect(page).toHaveURL(/#\/dashboard$/);
    await expect(page.getByRole('complementary').getByText(ADMIN_NAME, { exact: true })).toBeVisible();
  });

  test('logout clears the session and blocks re-entry to the dashboard', async ({ page }) => {
    await page.goto('/#/login');
    await page.getByRole('button', { name: new RegExp(ADMIN_NAME) }).click();
    await expect(page).toHaveURL(/#\/dashboard$/);

    await page.getByRole('button', { name: 'Keluar (Logout)' }).click();
    await expect(page).toHaveURL(/#\/login$/);

    await page.goto('/#/dashboard');
    await expect(page).toHaveURL(/#\/login$/);
  });
});
