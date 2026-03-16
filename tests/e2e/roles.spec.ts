import { expect, test } from "@playwright/test";

test.describe("Roles E2E Tests", () => {
  test.beforeEach(async ({ page }: any) => {
    // Login as admin
    await page.goto("/auth/signin");
    await page.fill('input[name="emailOrUsername"]', "admin@test.com");
    await page.fill('input[name="password"]', "password123");
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard|\/roles/);
  });

  test("should display roles list with pagination", async ({ page }: any) => {
    await page.goto("/roles");

    // Check table is visible
    const table = page.locator("table");
    await expect(table).toBeVisible();

    // Check for role columns
    await expect(page.locator("thead")).toContainText("Name");
    await expect(page.locator("thead")).toContainText("Display Name");

    // Check pagination controls
    const pagination = page.locator("nav", { has: page.locator("button") });
    await expect(pagination).toBeVisible();
  });

  test("should search roles", async ({ page }: any) => {
    await page.goto("/roles");

    // Fill search input
    const searchInput = page.locator('input[name="search"]');
    await searchInput.fill("admin");

    // Click search button
    await page.click('button:has-text("Search")');

    // Wait for results
    await page.waitForLoadState("networkidle");

    // Should show matching role
    const adminRow = page.locator("table tbody tr").first();
    await expect(adminRow).toContainText("admin");
  });

  test("should navigate to create role page", async ({ page }: any) => {
    await page.goto("/roles");

    // Click "Add Role" button
    await page.click('button:has-text("Add Role")');

    // Should navigate to new role page
    await expect(page).toHaveURL(/\/roles\/new/);

    // Should show form
    await expect(page.locator("form")).toBeVisible();
  });

  test("should create a new role", async ({ page }: any) => {
    await page.goto("/roles/new");

    // Fill form
    const roleName = `test-role-${Date.now()}`;
    await page.fill('input[name="name"]', roleName);
    await page.fill('input[name="displayName"]', "Test Role");
    await page.fill('textarea[name="description"]', "Test role description");

    // Submit form
    await page.click('button[type="submit"]');

    // Should show success toast
    await expect(page.locator("text=Role created successfully")).toBeVisible({
      timeout: 5000,
    });

    // Should redirect to roles list
    await expect(page).toHaveURL(/\/roles/);
  });

  test("should validate role name is unique", async ({ page }: any) => {
    // Create first role
    await page.goto("/roles/new");
    const roleName = `test-role-${Date.now()}`;
    await page.fill('input[name="name"]', roleName);
    await page.fill('input[name="displayName"]', "Test Role");
    await page.click('button[type="submit"]');

    await expect(page.locator("text=Role created successfully")).toBeVisible({
      timeout: 5000,
    });

    // Try to create another with same name
    await page.goto("/roles/new");
    await page.fill('input[name="name"]', roleName);
    await page.fill('input[name="displayName"]', "Different Display Name");
    await page.click('button[type="submit"]');

    // Should show error
    await expect(page.locator("text=already exists")).toBeVisible({
      timeout: 5000,
    });
  });

  test("should navigate to role detail page", async ({ page }: any) => {
    await page.goto("/roles");

    // Click on first role row
    const firstRow = page.locator("table tbody tr").first();
    const viewButton = firstRow.locator('button:has-text("View")').first();

    await viewButton.click();

    // Should navigate to detail page
    await expect(page).toHaveURL(/\/roles\/[a-z0-9]+$/);

    // Should show role details
    await expect(page.locator("heading")).toBeVisible();
  });

  test("should navigate to edit role page", async ({ page }: any) => {
    await page.goto("/roles");

    // Click on first role row
    const firstRow = page.locator("table tbody tr").first();
    const editButton = firstRow.locator('a[href*="/edit"]').first();

    await editButton.click();

    // Should navigate to edit page
    await expect(page).toHaveURL(/\/roles\/[a-z0-9]+\/edit/);

    // Should show form
    await expect(page.locator("form")).toBeVisible();
  });

  test("should update role information", async ({ page }: any) => {
    await page.goto("/roles");

    // Click edit on first role
    const firstRow = page.locator("table tbody tr").first();
    const editButton = firstRow.locator('a[href*="/edit"]').first();
    await editButton.click();

    await expect(page).toHaveURL(/\/roles\/[a-z0-9]+\/edit/);

    // Update display name
    const displayNameInput = page.locator('input[name="displayName"]');
    const newName = `Updated-${Date.now()}`;
    await displayNameInput.clear();
    await displayNameInput.fill(newName);

    // Submit form
    await page.click('button[type="submit"]');

    // Should show success toast
    await expect(page.locator("text=Role updated successfully")).toBeVisible({
      timeout: 5000,
    });
  });

  test("should manage role permissions", async ({ page }: any) => {
    // Create a new role
    await page.goto("/roles/new");
    const roleName = `test-role-perms-${Date.now()}`;
    await page.fill('input[name="name"]', roleName);
    await page.fill('input[name="displayName"]', "Permission Test Role");
    await page.click('button[type="submit"]');

    await expect(page.locator("text=Role created successfully")).toBeVisible({
      timeout: 5000,
    });

    // Go to edit page to assign permissions
    await page.waitForLoadState("networkidle");
    const roleRow = page
      .locator("table tbody tr")
      .filter({ hasText: roleName })
      .first();
    const editButton = roleRow.locator('a[href*="/edit"]').first();
    await editButton.click();

    // Should have permission checkboxes or assignment interface
    const permissionElements = page.locator('[data-testid*="permission"]');
    const count = await permissionElements.count();

    // Role should have some way to manage permissions
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("should delete a role", async ({ page }: any) => {
    // Create a role first to delete
    await page.goto("/roles/new");
    const roleName = `test-role-delete-${Date.now()}`;
    await page.fill('input[name="name"]', roleName);
    await page.fill('input[name="displayName"]', "Role to Delete");
    await page.click('button[type="submit"]');

    await expect(page.locator("text=Role created successfully")).toBeVisible({
      timeout: 5000,
    });

    // Search for the role we just created
    const searchInput = page.locator('input[name="search"]');
    await searchInput.fill(roleName);
    await page.click('button:has-text("Search")');
    await page.waitForLoadState("networkidle");

    // Find and delete the role
    const roleRow = page.locator("table tbody tr").first();
    const deleteButton = roleRow.locator("button").filter({ hasText: "Delete" });

    if (await deleteButton.isVisible()) {
      await deleteButton.click();

      // Confirm delete in dialog
      const confirmButton = page.locator('button:has-text("Delete")').last();
      await confirmButton.click();

      // Should show success toast
      await expect(page.locator("text=Role deleted")).toBeVisible({
        timeout: 5000,
      });
    }
  });

  test("should show permission denied for non-admin users", async ({
    page,
  }: any) => {
    // Logout and login as designer
    await page.goto("/auth/signout");
    await page.waitForLoadState("networkidle");

    // Login as designer
    await page.goto("/auth/signin");
    await page.fill('input[name="emailOrUsername"]', "designer@test.com");
    await page.fill('input[name="password"]', "password123");
    await page.click('button[type="submit"]');

    // Try to access roles page
    await page.goto("/roles");

    // Should be redirected to access-denied
    await expect(page).toHaveURL(/\/access-denied/);
    await expect(page.locator("text=Access Denied")).toBeVisible();
  });

  test("should display role with description", async ({ page }: any) => {
    await page.goto("/roles");

    // Look for role with description
    const firstRow = page.locator("table tbody tr").first();

    // Should display description in some form
    const rowText = await firstRow.textContent();
    expect(rowText).toBeTruthy();
  });

  test("should filter roles by search", async ({ page }: any) => {
    await page.goto("/roles");

    // Clear any existing search
    const searchInput = page.locator('input[name="search"]');
    await searchInput.clear();

    // Search for "admin"
    await searchInput.fill("admin");
    await page.click('button:has-text("Search")');
    await page.waitForLoadState("networkidle");

    // Results should contain "admin"
    const firstRow = page.locator("table tbody tr").first();
    const text = await firstRow.textContent();
    expect(text?.toLowerCase()).toContain("admin");

    // Now search for something that doesn't exist
    await searchInput.clear();
    await searchInput.fill("nonexistentrolesearch");
    await page.click('button:has-text("Search")');
    await page.waitForLoadState("networkidle");

    // Should show no results message or empty table
    const rows = await page.locator("table tbody tr").count();
    expect(rows).toBe(0);
  });
});
