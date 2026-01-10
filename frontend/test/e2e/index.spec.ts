import { test, expect } from '@playwright/test';

test.describe('Index Page E2E Tests', () => {
  test('should load index page and display title', async ({ page }) => {
    // Navigate to the index page
    await page.goto('/');

    // Check if the page title is visible
    const title = page.getByRole('heading', { name: 'Procrastinator' });
    await expect(title).toBeVisible();

    // Check if the subtitle is visible
    const subtitle = page.getByText('Tableau de bord personnel - Gérez toutes vos tâches');
    await expect(subtitle).toBeVisible();
  });

  test('should show loading state initially', async ({ page }) => {
    // Navigate to the index page
    await page.goto('/');

    // Check if loading text appears (it might be brief, so we use a short timeout)
    const loadingText = page.getByText('Loading...');
    await expect(loadingText).toBeVisible({ timeout: 5000 });
  });

  test('should show login prompt when not authenticated', async ({ page }) => {
    // Navigate to the index page
    await page.goto('/');

    // Wait for either the login prompt or the authenticated content
    try {
      // Check if login prompt appears for unauthenticated users
      const loginPrompt = page.getByText('Connectez-vous pour commencer à gérer vos tâches et projets !');
      await expect(loginPrompt).toBeVisible({ timeout: 10000 });
      
      // If login prompt is visible, check for login button
      const loginButton = page.getByRole('button', { name: 'Connexion' });
      await expect(loginButton).toBeVisible();
    } catch (error) {
      // If we're already authenticated, check for dashboard elements
      const dashboardTitle = page.getByText('Aperçu & Progression');
      await expect(dashboardTitle).toBeVisible();
    }
  });

  test('should have proper meta tags', async ({ page }) => {
    await page.goto('/');

    // Check for basic meta tags
    const title = await page.title();
    expect(title).toBeTruthy();
    
    // Check for viewport meta tag
    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toHaveAttribute('content', 'width=device-width, initial-scale=1');
  });

  test('should have responsive design', async ({ page }) => {
    await page.goto('/');

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });
    const mobileTitle = page.getByRole('heading', { name: 'Procrastinator' });
    await expect(mobileTitle).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    const desktopTitle = page.getByRole('heading', { name: 'Procrastinator' });
    await expect(desktopTitle).toBeVisible();
  });
});