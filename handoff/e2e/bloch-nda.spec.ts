/**
 * bloch-NDA — E2E guardrails (Playwright)
 *
 * Encodes the rebrand + reskin acceptance criteria and the end-to-end flow
 * described in ../DESIGN-HANDOFF.md (§7). This targets the *demo bundle's*
 * class names / copy — when porting to the live source, keep the assertions
 * and swap the selectors for your components.
 *
 * Run against a served build:  BASE_URL=http://localhost:5000 npx playwright test
 */
import { test, expect, Page } from '@playwright/test';

const BASE = process.env.BASE_URL ?? 'http://localhost:5000';

/** Seed theme + skip the splash so tests start on the app shell. */
async function boot(page: Page, theme: 'light' | 'dark' | 'default' = 'default') {
  await page.addInitScript((t) => {
    try {
      sessionStorage.setItem('concordia_splash_seen', '1');
      if (t === 'dark') localStorage.setItem('concordia-theme', 'dark');
      else localStorage.removeItem('concordia-theme');
    } catch {}
  }, theme);
  await page.goto(`${BASE}/index.html`, { waitUntil: 'load' });
}

/** Drive setup → viewer so the header + document surface are present. */
async function openViewer(page: Page) {
  await page.setInputFiles('input[type=file]', {
    name: 'sample.docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    buffer: Buffer.from('PK'), // any .docx; the demo ignores content
  });
  const counterparty = page.locator('input[type=text]').nth(1);
  await counterparty.fill('Acme Corporation');
  await page.getByRole('button', { name: /open document viewer/i }).click();
  await expect(page.locator('.app-header')).toBeVisible();
}

test.describe('brand & identity', () => {
  test('splash shows the Grey Qub hero + slogan', async ({ page }) => {
    await page.addInitScript(() => { try { sessionStorage.removeItem('concordia_splash_seen'); } catch {} });
    await page.goto(`${BASE}/index.html`, { waitUntil: 'load' });
    await expect(page.locator('#splashScreen')).toBeVisible();
    await expect(page.locator('.gq-word')).toHaveText(/GREY QUB/);
    await expect(page.locator('.gq-splash-title')).toContainText('Real Expertise');
    await expect(page.locator('.gq-splash-title')).toContainText('Unreal Intelligence');
    await expect(page.getByRole('button', { name: /begin/i })).toBeVisible();
  });

  test('document title and metadata are rebranded', async ({ page }) => {
    await boot(page);
    await expect(page).toHaveTitle(/bloch-NDA/);
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#f1ede6');
    await expect(page.locator('body')).not.toContainText('Concordia');
  });

  test('header lockup reads GREY QUB · bloch-NDA (company left of divider)', async ({ page }) => {
    await boot(page);
    await openViewer(page);
    await expect(page.locator('.brand-concordia')).toHaveText(/grey qub/i);
    await expect(page.locator('.brand-nda')).toContainText('bloch-');
    await expect(page.locator('.brand-plus')).toHaveText(/NDA/);
    // company element sits before the product element in DOM order after the flip
    const order = await page.evaluate(() => {
      const kids = [...document.querySelector('.header-brand')!.children];
      return { company: kids.indexOf(document.querySelector('.brand-concordia')!),
               product: kids.indexOf(document.querySelector('.brand-nda')!) };
    });
    expect(order.company).toBeLessThan(order.product);
  });

  test('redundant header filename chip is hidden', async ({ page }) => {
    await boot(page);
    await openViewer(page);
    await expect(page.locator('.header-file-info')).toBeHidden();
  });
});

test.describe('theme', () => {
  test('defaults to light when no preference is stored', async ({ page }) => {
    await boot(page, 'default');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });

  test('theme toggle flips light ↔ dark', async ({ page }) => {
    await boot(page, 'default');
    await openViewer(page);
    await page.locator('.theme-toggle').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });
});

test.describe('activity indicator', () => {
  test('header shows the rotating Bloch sphere, not tri-bars', async ({ page }) => {
    await boot(page);
    await openViewer(page);
    const bg = await page.locator('.status-tribars').evaluate(
      (el) => getComputedStyle(el, '::before').backgroundImage,
    );
    expect(bg).toContain('spin.svg');
    await expect(page.locator('.status-tribars .tribars-loader')).toBeHidden();
  });
});

test.describe('end-to-end flow', () => {
  test('analyze → decisions → remediate → export surfaces in header', async ({ page }) => {
    await boot(page);
    await openViewer(page);

    await page.getByRole('button', { name: /analyze document/i }).click();
    await expect(page.locator('.provision-card').first()).toBeVisible({ timeout: 30_000 });

    // provision-card pills/flags must be sans (not the mono font), i.e. read as UI
    const pillFont = await page.locator('.pill').first().evaluate((el) => getComputedStyle(el).fontFamily);
    expect(pillFont).toMatch(/Space Grotesk|Inter|system-ui/i);

    // resolve every provision, then remediate
    for (const card of await page.locator('.provision-card').all()) {
      await card.locator('.pill', { hasText: /accept/i }).click().catch(() => {});
    }
    await page.getByRole('button', { name: /remediate document/i }).click();

    // export button appears in the header with the accent glow, and exports the rebranded file
    const exportBtn = page.locator('button[title^="Export modified document"]');
    await expect(exportBtn).toBeVisible({ timeout: 30_000 });
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      exportBtn.click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/^bloch-NDA_/);
  });
});
