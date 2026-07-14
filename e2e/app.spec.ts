import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('MatchMarshal Application Flow & Accessibility Scans', () => {
  test('should pass accessibility scan on Landing view', async ({ page }) => {
    await page.goto('/');
    // Scan Landing tab
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('should pass accessibility scan on Console view', async ({ page }) => {
    await page.goto('/');
    // Click Console tab
    await page.getByRole('button', { name: /^Console$/i }).click();
    
    // Scan Console tab
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('should pass accessibility scan on Methodology view', async ({ page }) => {
    await page.goto('/');
    // Click Methodology tab
    await page.getByRole('button', { name: /^Methodology$/i }).click();
    
    // Wait for the dynamic MethodologyView to load and settle
    await expect(page.getByRole('heading', { level: 2, name: /Deterministic Engine/i })).toBeVisible();
    await page.waitForTimeout(300);
    
    // Scan Methodology tab
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('user can complete a happy-path incident report and triage journey', async ({ page }) => {
    await page.goto('/');

    // 1. Verify Landing view heading and text
    await expect(page.getByRole('heading', { level: 1, name: /Empowering World Cup Volunteers/i })).toBeVisible();

    // 2. Click CTA to go to Console tab
    await page.getByRole('button', { name: /Start Demo Console/i }).click();

    // 3. Verify Console inputs
    const textarea = page.getByLabel('Describe the situation on the ground:');
    await expect(textarea).toBeVisible();

    // 4. Click a preset chip (Lost Child) and check value
    await page.getByRole('button', { name: /^Lost Child$/i }).click();
    await expect(textarea).toContainText('Gate 4 food kiosk');

    // 5. Explicitly type in textarea to trigger onChange so state is populated
    await textarea.fill('Lost child crying alone near the Gate 4 food kiosk.');

    // 6. Submit incident analysis
    await page.getByRole('button', { name: /Analyze Incident/i }).click();

    // 7. Verify result displays correctly
    await expect(page.getByRole('heading', { level: 3, name: /Lost child/i })).toBeVisible();
    await expect(page.getByText(/Secure the child with you/i)).toBeVisible();
    await expect(page.getByText(/Ch 1 — Security/i)).toBeVisible();

    // 8. Test scenario cycler
    const cycleBtn = page.getByRole('button', { name: /Load Seeded Scenario/i });
    await cycleBtn.click();
    const cycleValue = await textarea.inputValue();
    expect(cycleValue.length).toBeGreaterThan(0);
  });
});
