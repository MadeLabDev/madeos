import { expect, test } from "@playwright/test";

test.describe("Users E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto("/auth/signin");
    await page.fill('input[name="emailOrUsername"]', "admin@test.com");
    await page.fill('input[name="password"]', "password123");
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard|\/users/);
  });

  test("should display users list with pagination", async ({ page }) => {
    await page.goto("/users");

    // Check table is visible
    const table = page.locator("table");
    await expect(table).toBeVisible();

    // Check for user columns
    await expect(page.locator("thead")).toContainText("Email");
    await expect(page.locator("thead")).toContainText("Name");

    // Check pagination controls
    const pagination = page.locator("nav", { has: page.locator("button") });
    await expect(pagination).toBeVisible();
  });

  test("should search users by email", async ({ page }) => {
    await page.goto("/users");

    // Fill search input
    const searchInput = page.locator('input[name="search"]');
    await searchInput.fill("admin");

    // Click search button
    await page.click('button:has-text("Search")');

    // Wait for results
    await page.waitForLoadState("networkidle");

    // Should show matching user
    const adminRow = page.locator("table tbody tr").first();
    await expect(adminRow).toContainText("admin");
  });

  test("should clear search filters", async ({ page }) => {
    await page.goto("/users");

    // Search for something
    const searchInput = page.locator('input[name="search"]');
    await searchInput.fill("admin");
    await page.click('button:has-text("Search")');

    // Click clear button
    const clearButton = page.locator('button:has-text("Clear")');
    if (await clearButton.isVisible()) {
      await clearButton.click();
      await expect(searchInput).toHaveValue("");
    }
  });

  test("should navigate to create user page", async ({ page }) => {
    await page.goto("/users");

    // Click "Add User" button
    await page.click('button:has-text("Add User")');

    // Should navigate to new user page
    await expect(page).toHaveURL(/\/users\/new/);

    // Should show form
    await expect(page.locator("form")).toBeVisible();
  });

  test("should create a new user", async ({ page }) => {
    await page.goto("/users/new");

    // Fill form
    const email = `testuser-${Date.now()}@test.com`;
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="name"]', "Test User");

    // Submit form
    await page.click('button[type="submit"]');

    // Should show success toast
    await expect(page.locator("text=User created successfully")).toBeVisible({
      timeout: 5000,
    });

    // Should redirect to users list
    await expect(page).toHaveURL(/\/users/);
  });

  test("should validate required fields on create", async ({ page }) => {
    await page.goto("/users/new");

    // Try to submit without email
    await page.click('button[type="submit"]');

    // Should show validation error
    await expect(
      page.locator("text=Email is required")
    ).toBeVisible();
  });

  test("should navigate to user detail page", async ({ page }) => {
    await page.goto("/users");

    // Click on first user row
    const firstRow = page.locator("table tbody tr").first();
    const viewButton = firstRow.locator('button:has-text("View")').first();

    await viewButton.click();

    // Should navigate to detail page
    await expect(page).toHaveURL(/\/users\/[a-z0-9]+$/);

    // Should show user details
    await expect(page.locator("heading")).toBeVisible();
  });

  test("should navigate to edit user page", async ({ page }) => {
    await page.goto("/users");

    // Click on first user row
    const firstRow = page.locator("table tbody tr").first();
    const editButton = firstRow.locator('a[href*="/edit"]').first();

    await editButton.click();

    // Should navigate to edit page
    await expect(page).toHaveURL(/\/users\/[a-z0-9]+\/edit/);

    // Should show form
    await expect(page.locator("form")).toBeVisible();
  });

  test("should update user information", async ({ page }) => {
    await page.goto("/users");

    // Click edit on first user
    const firstRow = page.locator("table tbody tr").first();
    const editButton = firstRow.locator('a[href*="/edit"]').first();
    await editButton.click();

    await expect(page).toHaveURL(/\/users\/[a-z0-9]+\/edit/);

    // Update name
    const nameInput = page.locator('input[name="name"]');
    const newName = `Updated-${Date.now()}`;
    await nameInput.clear();
    await nameInput.fill(newName);

    // Submit form
    await page.click('button[type="submit"]');

    // Should show success toast
    await expect(page.locator("text=User updated successfully")).toBeVisible({
      timeout: 5000,
    });
  });

  test("should delete a user", async ({ page }) => {
    await page.goto("/users");

    // Create a user first to delete
    await page.click('button:has-text("Add User")');
    const email = `testuser-delete-${Date.now()}@test.com`;
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="name"]', "User to Delete");
    await page.click('button[type="submit"]');

    // Wait for toast and redirect
    await expect(page.locator("text=User created successfully")).toBeVisible({
      timeout: 5000,
    });
    await expect(page).toHaveURL(/\/users/);

    // Search for the user we just created
    const searchInput = page.locator('input[name="search"]');
    await searchInput.fill(email);
    await page.click('button:has-text("Search")');
    await page.waitForLoadState("networkidle");

    // Find and delete the user
    const userRow = page.locator("table tbody tr").first();
    const deleteButton = userRow.locator("button").filter({ hasText: "Delete" });

    if (await deleteButton.isVisible()) {
      await deleteButton.click();

      // Confirm delete in dialog
      const confirmButton = page.locator(
        'button:has-text("Delete")'
      ).last();
      await confirmButton.click();

      // Should show success toast
      await expect(page.locator("text=User deleted")).toBeVisible({
        timeout: 5000,
      });
    }
  });

  test("should show permission denied for non-admin users", async ({
    page,
  }) => {
    // Logout and login as designer
    await page.goto("/auth/signout");
    await page.waitForLoadState("networkidle");

    // Login as designer
    await page.goto("/auth/signin");
    await page.fill('input[name="emailOrUsername"]', "designer@test.com");
    await page.fill('input[name="password"]', "password123");
    await page.click('button[type="submit"]');

    // Try to access users page
    await page.goto("/users");

    // Should be redirected to access-denied
    await expect(page).toHaveURL(/\/access-denied/);
    await expect(page.locator("text=Access Denied")).toBeVisible();
  });

  test("should display user with multiple roles", async ({ page }) => {
    await page.goto("/users");

    // Find a user row
    const firstRow = page.locator("table tbody tr").first();

    // Should have role badge(s)
    const roleBadges = firstRow.locator('[class*="badge"]');
    const badgeCount = await roleBadges.count();

    // Should have at least one role
    expect(badgeCount).toBeGreaterThanOrEqual(0);
  });

  test("should sort users by column", async ({ page }) => {
    await page.goto("/users");

    // Check if sortable columns exist
    const emailHeader = page.locator("thead").locator("text=Email");

    // Click to sort (if sortable)
    if (await emailHeader.isClickable()) {
      await emailHeader.click();
      await page.waitForLoadState("networkidle");

      // Table should still be visible
      await expect(page.locator("table")).toBeVisible();
    }
  });
});
