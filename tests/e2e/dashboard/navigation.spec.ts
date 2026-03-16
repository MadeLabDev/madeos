import { expect, test } from '@playwright/test';

test.describe('Dashboard Navigation - E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin user
    await page.goto('/auth/signin');
    await page.fill('input[name="emailOrUsername"]', 'baonguyenyam@gmail.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should display dashboard after successful login', async ({ page }) => {
    // Check dashboard elements are visible
    await expect(page.getByText('Dashboard')).toBeVisible();
    await expect(page.getByText('MADE App')).toBeVisible();
  });

  test('should toggle sidebar when clicking hamburger menu', async ({ page }) => {
    const sidebar = page.locator('aside');

    // Sidebar should be open by default (16rem width)
    await expect(sidebar).toHaveClass(/w-64/);

    // Click toggle button
    await page.click('button[aria-label="Toggle sidebar"]');

    // Sidebar should now be collapsed (4rem width)
    await expect(sidebar).toHaveClass(/w-16/);

    // Click again to expand
    await page.click('button[aria-label="Toggle sidebar"]');
    await expect(sidebar).toHaveClass(/w-64/);
  });

  test('should switch theme when clicking theme toggle', async ({ page }) => {
    const html = page.locator('html');

    // Click theme toggle button
    await page.click('button:has-text("Toggle theme")');

    // Click Dark option
    await page.click('text=Dark');

    // Check if dark class is applied
    await expect(html).toHaveClass(/dark/);

    // Switch back to light
    await page.click('button:has-text("Toggle theme")');
    await page.click('text=Light');
    await expect(html).not.toHaveClass(/dark/);
  });

  test('should display user info in header dropdown', async ({ page }) => {
    // Click user menu button
    await page.click('button:has-text("baonguyenyam@gmail.com")');

    // Check dropdown content
    await expect(page.getByText('Administrator')).toBeVisible();
    await expect(page.getByText('baonguyenyam@gmail.com')).toBeVisible();
    await expect(page.getByText('Profile')).toBeVisible();
    await expect(page.getByText('Settings')).toBeVisible();
    await expect(page.getByText('Logout')).toBeVisible();
  });

  test('should logout when clicking logout button', async ({ page }) => {
    // Click user menu
    await page.click('button:has-text("baonguyenyam@gmail.com")');

    // Click logout
    await page.click('text=Logout');

    // Should redirect to signin page
    await expect(page).toHaveURL('/auth/signin');
  });

  test('should update breadcrumb when navigating', async ({ page }) => {
    // Start at dashboard
    await expect(page.getByText('Home')).toBeVisible();

    // Navigate to orders (if menu is visible to admin)
    const ordersLink = page.locator('a[href="/orders"]').first();
    if (await ordersLink.isVisible()) {
      await ordersLink.click();

      // Check breadcrumb updates
      await expect(page.getByText('Orders')).toBeVisible();
    }
  });

  test('should show only permitted menu items based on user role', async ({ page }) => {
    // Admin should see all menu items
    await expect(page.getByText('Orders')).toBeVisible();
    await expect(page.getByText('Customers')).toBeVisible();
    await expect(page.getByText('Inventory')).toBeVisible();
    await expect(page.getByText('Settings')).toBeVisible();
  });
});

test.describe('Permission-based Access - E2E Tests', () => {
  test('sales user should only see permitted menu items', async ({ page }) => {
    // Login as sales user
    await page.goto('/auth/signin');
    await page.fill('input[name="emailOrUsername"]', 'sales@madelab.io');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');

    // Should see orders and customers
    await expect(page.getByText('Orders')).toBeVisible();
    await expect(page.getByText('Customers')).toBeVisible();

    // Should NOT see settings (no permission)
    const settingsLink = page.locator('a[href="/settings"]');
    await expect(settingsLink).not.toBeVisible();
  });

  test('designer user should only see design-related items', async ({ page }) => {
    // Login as designer
    await page.goto('/auth/signin');
    await page.fill('input[name="emailOrUsername"]', 'designer@madelab.io');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');

    // Should see design menu
    await expect(page.getByText('Design')).toBeVisible();

    // Should NOT see customers (no permission)
    const customersLink = page.locator('a[href="/customers"]');
    await expect(customersLink).not.toBeVisible();
  });
});
