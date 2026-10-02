import { chromium } from 'file:///C:/Users/Administrator/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs';
import { mkdir } from 'node:fs/promises';

const output = 'E:/Skill_swap project/screenshots';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
page.setDefaultTimeout(8000);

async function settle() {
  await page.waitForTimeout(900);
}

async function capture(name) {
  await settle();
  await page.screenshot({ path: `${output}/${name}.png`, fullPage: true, animations: 'disabled' });
  console.log(name, await page.locator('h1').allTextContents().catch(() => []));
}

async function click(selector) {
  await page.locator(selector).first().click();
  await settle();
}

async function returnToDashboard() {
  if (await page.locator('#screen-dashboard').count()) return;
  const dashboard = page.getByRole('button', { name: 'Dashboard', exact: true }).first();
  if (await dashboard.count()) {
    await dashboard.click();
    await settle();
  }
}

await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle' });
await capture('01-home');

await click('#header-btn-login');
await capture('02-login');
await page.getByRole('button', { name: 'Back to Get Started & Platform Overview' }).click();
await settle();
await click('#header-btn-get-started');
await capture('03-sign-up');

await page.getByRole('button', { name: 'Back to Get Started' }).click().catch(async () => {
  await page.goto('http://127.0.0.1:3000/');
});
await settle();
await page.getByRole('button', { name: 'Explore Live Demo' }).click();
await page.locator('#screen-dashboard').waitFor();
await capture('04-dashboard');

await click('#dash-nav-sessions');
await capture('05-sessions');
await returnToDashboard();

await click('#dash-nav-requests');
await capture('06-requests-incoming');
await click('#tab-outgoing-requests');
await capture('07-requests-outgoing');
await returnToDashboard();

await page.getByRole('button', { name: 'Discover', exact: true }).first().click();
await settle();
await capture('08-discover');
const profileButton = page.locator('#peers-grid-container button[aria-label^="View "]').first();
if (await profileButton.count()) {
  await profileButton.click();
  await settle();
  await capture('09-scholar-profile');
  await returnToDashboard();
}

await page.getByRole('button', { name: 'Skill Manager', exact: true }).first().click();
await settle();
await capture('10-skill-manager');
await returnToDashboard();

await page.getByRole('button', { name: 'My Schedule', exact: true }).first().click();
await settle();
await capture('11-schedule');
await returnToDashboard();

await page.locator('[title="Edit Profile"]').first().click();
await settle();
await capture('12-profile-setup');

await browser.close();
