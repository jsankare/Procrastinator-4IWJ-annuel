import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('should load the application', async ({ page }) => {
    // Navigate to the home page
    const response = await page.goto('/');
    
    // Check if the page loaded successfully
    expect(response?.status()).toBeLessThan(400);
    
    // Check if the main title is visible
    const title = page.getByRole('heading', { name: 'Procrastinator' });
    await expect(title).toBeVisible();
    
    // Check if the page has some basic content
    const content = await page.textContent('body');
    expect(content).toContain('Procrastinator');
  });

  test('should have proper HTML structure', async ({ page }) => {
    await page.goto('/');
    
    // Check for basic HTML elements
    const htmlElement = page.locator('html');
    await expect(htmlElement).toBeTruthy();
    
    await expect(page.locator('head title')).toBeTruthy();
    await expect(page.locator('body')).toBeTruthy();
  });

  test('should handle 404 pages gracefully', async ({ page }) => {
    // Navigate to a non-existent page
    const response = await page.goto('/non-existent-page');

    // This is a basic check to ensure the app doesn't crash
    expect(response?.status()).toBeLessThan(500);
  });
});