import { test, expect } from '@playwright/test';

test.describe('Playwright Setup Check', () => {
  test('should have Playwright working', async ({ browser }) => {
    // This test just verifies that Playwright can launch a browser
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Navigate to a simple page that should always work
    await page.goto('https://example.com');
    
    // Verify page loaded
    const title = await page.title();
    expect(title).toContain('Example');
    
    // Verify content
    const heading = await page.textContent('h1');
    expect(heading).toContain('Example Domain');
    
    await context.close();
  });

  test('should have browser capabilities', async ({ browser }) => {
    // Verify browser info
    const browserName = browser.browserType().name();
    expect(browserName).toBeTruthy();
    expect(['chromium', 'firefox', 'webkit']).toContain(browserName.toLowerCase());
  });
});