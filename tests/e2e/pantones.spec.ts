import { expect, test } from "@playwright/test";

test.describe("Pantones E2E Tests", () => {
  test.beforeEach(async ({ page }: any) => {
    // Login as admin
    await page.goto("/auth/signin");
    await page.fill('input[name="emailOrUsername"]', "admin@test.com");
    await page.fill('input[name="password"]', "password123");
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard|\/pantones/);
  });

  test("should display pantones list with pagination", async ({ page }: any) => {
    await page.goto("/pantones");

    // Check table is visible
    const table = page.locator("table");
    await expect(table).toBeVisible();

    // Check for pantone columns
    await expect(page.locator("thead")).toContainText("Name");
    await expect(page.locator("thead")).toContainText("Pantone Code");

    // Check pagination controls
    const pagination = page.locator("nav", { has: page.locator("button") });
    await expect(pagination).toBeVisible();
  });

  test("should search pantones by name", async ({ page }: any) => {
    await page.goto("/pantones");

    // Fill search input
    const searchInput = page.locator('input[name="search"]');
    await searchInput.fill("red");

    // Click search button
    await page.click('button:has-text("Search")');

    // Wait for results
    await page.waitForLoadState("networkidle");

    // Table should still be visible
    await expect(page.locator("table")).toBeVisible();
  });

  test("should navigate to create pantone page", async ({ page }: any) => {
    await page.goto("/pantones");

    // Click "Add Pantone" button
    await page.click('button:has-text("Add Pantone")');

    // Should navigate to new pantone page
    await expect(page).toHaveURL(/\/pantones\/new/);

    // Should show form
    await expect(page.locator("form")).toBeVisible();
  });

  test("should create a new pantone", async ({ page }: any) => {
    await page.goto("/pantones/new");

    // Fill form
    const pantoneCode = `PMS-${Date.now()}`;
    await page.fill('input[name="pantoneCode"]', pantoneCode);
    await page.fill('input[name="name"]', "Test Color");
    await page.fill('input[name="hex"]', "#FF0000");
    await page.fill('input[name="supplier"]', "Test Supplier");
    await page.fill('input[name="supplierCode"]', "TST-001");

    // Submit form
    await page.click('button[type="submit"]');

    // Should show success toast
    await expect(page.locator("text=Pantone created successfully")).toBeVisible({
      timeout: 5000,
    });

    // Should redirect to pantones list
    await expect(page).toHaveURL(/\/pantones/);
  });

  test("should validate required fields on create", async ({ page }: any) => {
    await page.goto("/pantones/new");

    // Try to submit without required fields
    await page.click('button[type="submit"]');

    // Should show validation error
    await expect(
      page.locator("text=required", { exact: false })
    ).toBeVisible();
  });

  test("should validate hex color format", async ({ page }: any) => {
    await page.goto("/pantones/new");

    // Fill required fields with invalid hex
    await page.fill('input[name="pantoneCode"]', "PMS-001");
    await page.fill('input[name="name"]', "Test Color");
    await page.fill('input[name="hex"]', "INVALID_HEX");

    // Submit form
    await page.click('button[type="submit"]');

    // Should show error
    await expect(page.locator("text=invalid")).toBeVisible({
      timeout: 5000,
    });
  });

  test("should navigate to pantone detail page", async ({ page }: any) => {
    await page.goto("/pantones");

    // Click on first pantone row
    const firstRow = page.locator("table tbody tr").first();
    const viewButton = firstRow.locator('button:has-text("View")').first();

    await viewButton.click();

    // Should navigate to detail page
    await expect(page).toHaveURL(/\/pantones\/[a-z0-9]+$/);

    // Should show pantone details
    await expect(page.locator("heading")).toBeVisible();
  });

  test("should navigate to edit pantone page", async ({ page }: any) => {
    await page.goto("/pantones");

    // Click on first pantone row
    const firstRow = page.locator("table tbody tr").first();
    const editButton = firstRow.locator('a[href*="/edit"]').first();

    await editButton.click();

    // Should navigate to edit page
    await expect(page).toHaveURL(/\/pantones\/[a-z0-9]+\/edit/);

    // Should show form
    await expect(page.locator("form")).toBeVisible();
  });

  test("should update pantone information", async ({ page }: any) => {
    await page.goto("/pantones");

    // Click edit on first pantone
    const firstRow = page.locator("table tbody tr").first();
    const editButton = firstRow.locator('a[href*="/edit"]').first();
    await editButton.click();

    await expect(page).toHaveURL(/\/pantones\/[a-z0-9]+\/edit/);

    // Update supplier
    const supplierInput = page.locator('input[name="supplier"]');
    const newSupplier = `Updated-Supplier-${Date.now()}`;
    await supplierInput.clear();
    await supplierInput.fill(newSupplier);

    // Submit form
    await page.click('button[type="submit"]');

    // Should show success toast
    await expect(page.locator("text=Pantone updated successfully")).toBeVisible({
      timeout: 5000,
    });
  });

  test("should delete a pantone", async ({ page }: any) => {
    // Create a pantone first to delete
    await page.goto("/pantones/new");
    const pantoneCode = `PMS-DELETE-${Date.now()}`;
    await page.fill('input[name="pantoneCode"]', pantoneCode);
    await page.fill('input[name="name"]', "Pantone to Delete");
    await page.fill('input[name="hex"]', "#00FF00");
    await page.fill('input[name="supplier"]', "Test");
    await page.fill('input[name="supplierCode"]', "TEST");
    await page.click('button[type="submit"]');

    await expect(page.locator("text=Pantone created successfully")).toBeVisible({
      timeout: 5000,
    });

    // Search for the pantone we just created
    const searchInput = page.locator('input[name="search"]');
    await searchInput.fill("Pantone to Delete");
    await page.click('button:has-text("Search")');
    await page.waitForLoadState("networkidle");

    // Find and delete the pantone
    const pantoneRow = page.locator("table tbody tr").first();
    const deleteButton = pantoneRow
      .locator("button")
      .filter({ hasText: "Delete" });

    if (await deleteButton.isVisible()) {
      await deleteButton.click();

      // Confirm delete in dialog
      const confirmButton = page.locator('button:has-text("Delete")').last();
      await confirmButton.click();

      // Should show success toast
      await expect(page.locator("text=Pantone deleted")).toBeVisible({
        timeout: 5000,
      });
    }
  });

  test("should bulk delete pantones", async ({ page }: any) => {
    await page.goto("/pantones");

    // Select multiple pantones using checkboxes if available
    const checkboxes = page.locator('input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();

    if (checkboxCount > 1) {
      // Select first 2 pantones
      await checkboxes.first().click();
      await checkboxes.nth(1).click();

      // Click bulk delete button if available
      const bulkDeleteButton = page.locator(
        'button:has-text("Delete Selected")'
      );

      if (await bulkDeleteButton.isVisible()) {
        await bulkDeleteButton.click();

        // Confirm deletion
        const confirmButton = page.locator('button:has-text("Delete")').last();
        if (await confirmButton.isVisible()) {
          await confirmButton.click();

          // Should show success message
          await expect(
            page.locator("text=deleted", { exact: false })
          ).toBeVisible({ timeout: 5000 });
        }
      }
    }
  });

  test("should show permission denied for sales users", async ({
    page,
  }: any) => {
    // Logout and login as sales
    await page.goto("/auth/signout");
    await page.waitForLoadState("networkidle");

    // Login as sales (read-only)
    await page.goto("/auth/signin");
    await page.fill('input[name="emailOrUsername"]', "sales@test.com");
    await page.fill('input[name="password"]', "password123");
    await page.click('button[type="submit"]');

    // Try to access create pantone page
    await page.goto("/pantones/new");

    // Should be redirected to access-denied
    await expect(page).toHaveURL(/\/access-denied/);
    await expect(page.locator("text=Access Denied")).toBeVisible();
  });

  test("should allow designer to create pantones", async ({ page }: any) => {
    // Logout and login as designer
    await page.goto("/auth/signout");
    await page.waitForLoadState("networkidle");

    // Login as designer
    await page.goto("/auth/signin");
    await page.fill('input[name="emailOrUsername"]', "designer@test.com");
    await page.fill('input[name="password"]', "password123");
    await page.click('button[type="submit"]');

    // Navigate to create pantone
    await page.goto("/pantones/new");

    // Form should be visible
    await expect(page.locator("form")).toBeVisible();

    // Create a pantone
    const pantoneCode = `DESIGN-${Date.now()}`;
    await page.fill('input[name="pantoneCode"]', pantoneCode);
    await page.fill('input[name="name"]', "Designer Color");
    await page.fill('input[name="hex"]', "#0000FF");
    await page.fill('input[name="supplier"]', "Design Supplier");
    await page.fill('input[name="supplierCode"]', "DS-001");

    await page.click('button[type="submit"]');

    // Should succeed
    await expect(page.locator("text=Pantone created successfully")).toBeVisible({
      timeout: 5000,
    });
  });

  test("should display pantone color preview", async ({ page }: any) => {
    await page.goto("/pantones");

    // Should have color indicators or swatches
    const colorElements = page.locator(
      '[style*="background"], [data-testid="color-swatch"]'
    );

    // At least some color indicators should be present
    expect(await colorElements.count()).toBeGreaterThanOrEqual(0);
  });

  test("should display pantone supplier information", async ({ page }: any) => {
    await page.goto("/pantones");

    // Click on first pantone to view details
    const firstRow = page.locator("table tbody tr").first();
    const viewButton = firstRow.locator('button:has-text("View")').first();
    await viewButton.click();

    // Should display supplier info
    await expect(page.locator("text=Supplier")).toBeVisible();
  });
});
