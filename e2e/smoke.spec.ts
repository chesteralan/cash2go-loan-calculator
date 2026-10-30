import { expect, test } from '@playwright/test';
import path from 'path';

test('full smoke: calculate, save, export, import, compare', async ({ page }) => {
  await page.goto('/');

  // Shell renders
  await expect(page.getByRole('banner').getByText('LoanMatrix')).toBeVisible();

  // Calculator computes from the seeded fixed add-on preset
  await expect(page.getByText('Loan Parameters & Structure')).toBeVisible();
  await expect(page.getByText('Total Amount to be Paid Back', { exact: true })).toBeVisible();

  // Save the current loan — its id already exists in the saved list, so no dialog
  await page.getByRole('button', { name: /Save to My Calculations/i }).click();
  const savedButton = page.getByRole('button', { name: /Saved Loan Calculations:/i });
  await expect(savedButton).toContainText(/\d+/);

  // Trigger the duplicate-title dialog: save fixed add-on preset under a new title, then
  // apply the PH Mortgage preset and rename it to the same title (different id).
  const titleInput = page.getByLabel(/Loan Title \/ Description/i);
  await titleInput.fill('Smoke Test Loan');
  await page.getByRole('button', { name: /Save to My Calculations/i }).click();
  await page.getByRole('button', { name: /PH Mortgage \(₱5M\)/i }).click();
  await titleInput.fill('Smoke Test Loan');
  await page.getByRole('button', { name: /Save to My Calculations/i }).click();
  const dialog = page.getByRole('dialog', { name: /"Smoke Test Loan" already exists/i });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: /Save as copy/i }).click();

  // Drawer shows the copy
  await page.getByRole('button', { name: /Saved Loan Calculations:/i }).click();
  await expect(page.getByText(/My Saved Loan Calculations \(/)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Smoke Test Loan (copy)' })).toBeVisible();

  // Export a backup file (wait for the toast to clear first)
  await page.waitForTimeout(3500);
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: /Export Backup/i }).click({ force: true }),
  ]);
  const savedPath = path.join(process.cwd(), '.e2e-artifacts', download.suggestedFilename());
  await download.saveAs(savedPath);

  // Import the same backup back in, review and apply the diff
  await page.getByTestId('import-backup-input').setInputFiles(savedPath);
  await expect(page.getByText(/Review backup before applying/i)).toBeVisible();
  await page.getByRole('button', { name: /Apply Import/i }).click();

  // Close the drawer, then switch to compare view and confirm the verdict strip
  await page.getByRole('button', { name: /Close saved loans drawer/i }).click();
  await page.getByRole('button', { name: /Side-by-Side Comparison/i }).click();
  await expect(page.getByText(/Side-by-Side Loan Calculation Comparison/i)).toBeVisible();
  await expect(page.getByText(/saves you/i).first()).toBeVisible();
});
