import { test, expect } from '@playwright/test';

test.describe('Basic E2E Test', () => {
  test('should load the homepage', async ({ page }) => {
    // Navigate to the home page
    const response = await page.goto('/');
    
    // Wait a bit for the page to load (Nuxt hydration)
    await page.waitForTimeout(2000);
    
    // Check if we got a successful response
    if (response) {
      expect(response.status()).toBeLessThan(400);
    }
    
    // Check if the page has some basic content
    const title = await page.title();
    expect(title).toBeTruthy();
    
    // Check if the body contains some text
    const bodyContent = await page.textContent('body');
    expect(bodyContent?.length).toBeGreaterThan(100); // Basic check for content
  });
});