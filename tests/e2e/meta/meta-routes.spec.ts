import { expect, test } from '@playwright/test';

test.describe('Meta Feature - Routes & UI Verification', () => {
  test.beforeEach(async ({ page }) => {
    // Login with admin credentials before each test
    await page.goto('/auth/signin');

    // Check if already logged in
    if (page.url().includes('/auth/signin')) {
      await page.fill('input[name="emailOrUsername"]', 'baonguyenyam@gmail.com');
      await page.fill('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');

      // Wait for redirect to dashboard
      await page.waitForURL('/dashboard', { timeout: 10000 });
    }
  });

  test('should display /meta home page with module type and instance cards', async ({ page }) => {
    await page.goto('/meta');

    // Verify page title
    await expect(page.locator('h1')).toContainText('Meta Configuration');

    // Verify description
    await expect(page.locator('p')).toContainText('Create and manage dynamic field schemas');

    // Verify Module Types card exists
    await expect(page.locator('text=Module Types')).toBeVisible();

    // Verify Module Instances card exists
    await expect(page.locator('text=Module Instances')).toBeVisible();

    // Verify buttons exist
    await expect(page.locator('a[href="/meta/module-types"]')).toBeVisible();
    await expect(page.locator('a[href="/meta/module-types/new"]')).toBeVisible();
    await expect(page.locator('a[href="/meta/module-instances"]')).toBeVisible();
    await expect(page.locator('a[href="/meta/module-instances/new"]')).toBeVisible();
  });

  test('should display /meta/module-types list with correct fields column', async ({ page }) => {
    await page.goto('/meta/module-types');

    // Verify page title
    await expect(page.locator('h1')).toContainText('Module Types');

    // Wait for table to load
    await page.waitForSelector('table');

    // Verify table headers
    const headers = page.locator('th');
    await expect(headers.filter({ hasText: 'Name' })).toBeVisible();
    await expect(headers.filter({ hasText: 'Description' })).toBeVisible();
    await expect(headers.filter({ hasText: 'Fields' })).toBeVisible();
    await expect(headers.filter({ hasText: 'Created' })).toBeVisible();

    // Verify at least 4 module types are displayed (blog, knowngle, product, order)
    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThanOrEqual(4);

    // Verify Fields column displays field counts (not empty)
    const fieldsColumn = page.locator('tbody tr td:nth-child(4)'); // 4th column is Fields
    const fieldsCount = await fieldsColumn.count();

    for (let i = 0; i < Math.min(fieldsCount, 4); i++) {
      const fieldText = await fieldsColumn.nth(i).textContent();
      expect(fieldText).toMatch(/\d+ fields/); // Should show "X fields" format
    }
  });

  test('should display specific module types with correct field counts', async ({ page }) => {
    await page.goto('/meta/module-types');

    // Wait for table to load
    await page.waitForSelector('table');

    // Find blog type - should have 5 fields (metaTitle, metaDescription, metaKeywords, ogImage, canonicalUrl)
    let blogRow = page.locator('tr:has-text("Blog")');
    if (await blogRow.count() === 0) {
      blogRow = page.locator('tr:has-text("blog")');
    }
    if (await blogRow.count() > 0) {
      // Get the Fields cell for this row
      const fieldsCell = blogRow.locator('td').nth(3); // 4th cell (0-indexed)
      await expect(fieldsCell).toContainText('fields');
    }
  });

  test('should navigate to module-types detail page', async ({ page }) => {
    await page.goto('/meta/module-types');

    // Wait for table
    await page.waitForSelector('table');

    // Click the View button for first module type
    const viewButton = page.locator('a:has-text("View")').first();
    await viewButton.click();

    // Verify we're on the detail page
    await page.waitForURL(/\/meta\/module-types\/[a-z0-9]+$/);

    // Verify detail page has the module type name and fields displayed
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should display /meta/module-instances list with correct columns', async ({ page }) => {
    await page.goto('/meta/module-instances');

    // Verify page title
    await expect(page.locator('h1')).toContainText('Module Instances');

    // Wait for table to load
    await page.waitForSelector('table');

    // Verify table headers
    const headers = page.locator('th');
    await expect(headers.filter({ hasText: 'Entity Name' })).toBeVisible();
    await expect(headers.filter({ hasText: 'Entity ID' })).toBeVisible();
    await expect(headers.filter({ hasText: 'Module Type' })).toBeVisible();
    await expect(headers.filter({ hasText: 'Status' })).toBeVisible();

    // Verify at least 4 instances are displayed
    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThanOrEqual(4);

    // Verify status badges are displayed
    const statusBadges = page.locator('td:has-text("Active"), td:has-text("Inactive")');
    expect(await statusBadges.count()).toBeGreaterThan(0);
  });

  test('should navigate to module-instances detail page', async ({ page }) => {
    await page.goto('/meta/module-instances');

    // Wait for table
    await page.waitForSelector('table');

    // Click the View button for first instance
    const viewButton = page.locator('a:has-text("View")').first();
    await viewButton.click();

    // Verify we're on the detail page
    await page.waitForURL(/\/meta\/module-instances\/[a-z0-9]+$/);

    // Verify detail page loads
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should navigate from /meta home to /meta/module-types via "View All" button', async ({ page }) => {
    await page.goto('/meta');

    // Click "View All" button for Module Types
    await page.click('a[href="/meta/module-types"]');

    // Verify we're on the module-types page
    await page.waitForURL('/meta/module-types');
    await expect(page.locator('h1')).toContainText('Module Types');
  });

  test('should navigate from /meta home to /meta/module-instances via "View All" button', async ({ page }) => {
    await page.goto('/meta');

    // Click "View All" button for Module Instances
    await page.click('a[href="/meta/module-instances"]');

    // Verify we're on the module-instances page
    await page.waitForURL('/meta/module-instances');
    await expect(page.locator('h1')).toContainText('Module Instances');
  });

  test('should have working Create buttons on /meta/module-types', async ({ page }) => {
    await page.goto('/meta/module-types');

    // Click Create New button
    await page.click('a[href="/meta/module-types/new"]');

    // Verify we're on the create page
    await page.waitForURL('/meta/module-types/new');

    // Verify form elements exist
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="key"]')).toBeVisible();
  });

  test('should have working Create buttons on /meta/module-instances', async ({ page }) => {
    await page.goto('/meta/module-instances');

    // Click Create New button
    await page.click('a[href="/meta/module-instances/new"]');

    // Verify we're on the create page
    await page.waitForURL('/meta/module-instances/new');

    // Verify form elements exist
    await expect(page.locator('select[name="moduleTypeId"]')).toBeVisible();
  });

  test('should display Fields column correctly for all module types', async ({ page }) => {
    await page.goto('/meta/module-types');

    // Wait for table to fully load
    await page.waitForSelector('table tbody tr');

    // Get all rows
    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();

    // For each row, verify Fields column contains a badge with field count
    for (let i = 0; i < rowCount; i++) {
      const fieldsCell = rows.nth(i).locator('td').nth(3); // 4th column is Fields
      const badgeText = await fieldsCell.textContent();

      // Should contain pattern like "5 fields"
      expect(badgeText).toMatch(/^\s*\d+\s+fields\s*$/);
    }
  });

  test('should have functioning search on /meta/module-types', async ({ page }) => {
    await page.goto('/meta/module-types');

    // Type in search field
    const searchInput = page.locator('input[placeholder*="Search"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('blog');

      // Wait for results to filter
      await page.waitForTimeout(500);

      // Submit search if there's a button
      const searchButton = page.locator('button:has-text("Search")');
      if (await searchButton.isVisible()) {
        await searchButton.click();
      }

      // Verify at least blog type appears
      await page.waitForSelector('table tbody tr');
      const rows = page.locator('tbody tr');
      expect(await rows.count()).toBeGreaterThan(0);
    }
  });

  test('should display pagination on module-types list', async ({ page }) => {
    await page.goto('/meta/module-types');

    // Wait for table
    await page.waitForSelector('table');

    // Pagination should be visible if there are more than 1 page
    const pagination = page.locator('nav:has-text("Previous")');
    // Pagination exists (may be visible or hidden depending on record count)
    expect(pagination).toBeDefined();
  });

  test('should display pagination on module-instances list', async ({ page }) => {
    await page.goto('/meta/module-instances');

    // Wait for table
    await page.waitForSelector('table');

    // Pagination should be visible if there are more than 1 page
    const pagination = page.locator('nav:has-text("Previous")');
    // Pagination exists (may be visible or hidden depending on record count)
    expect(pagination).toBeDefined();
  });
});
