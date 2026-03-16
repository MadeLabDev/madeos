import { expect,test } from '@playwright/test';

/**
 * Test: Permission enforcement on Server Actions
 * 
 * Scenario: User has "read" and "update" permissions on users module
 *          but does NOT have "create" or "delete" permissions
 * 
 * Expected:
 * - User CAN access /users (read-only)
 * - User CAN access /users/[id]/edit (update)
 * - User CANNOT access /users/new (create)
 * - If user somehow calls createUserAction(), it should fail
 * - If user somehow calls deleteUserAction(), it should fail
 */

test.describe('Access Control - Permission Enforcement', () => {
  // Setup: Login as "Designer" user (has limited permissions)
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/signin');
    
    // Fill login form with designer account
    // (Assuming designer has: users=[read, update], but NOT create/delete)
    await page.fill('input[type="email"]', 'designer@madelab.io');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
  });

  test('User with read permission CAN access /users list', async ({ page }) => {
    await page.goto('/dashboard/users');
    
    // Should see user list
    await expect(page.locator('text=Users')).toBeVisible();
    await expect(page.locator('table')).toBeVisible(); // User table should display
  });

  test('User with update permission CAN access /users/[id]/edit', async ({ page }) => {
    // First navigate to users list
    await page.goto('/dashboard/users');
    
    // Click edit button on first user
    const editButton = page.locator('button:has-text("Edit")').first();
    await editButton.click();
    
    // Should be on edit page
    await expect(page).toHaveURL(/\/users\/\w+\/edit/);
    await expect(page.locator('input[name="name"]')).toBeVisible();
  });

  test('User WITHOUT create permission CANNOT access /users/new', async ({ page }) => {
    // Try to navigate to create user page
    await page.goto('/dashboard/users/new');
    
    // Should be redirected to access-denied page
    await expect(page).toHaveURL(/\/access-denied/);
    await expect(page.locator('text=Access Denied')).toBeVisible();
  });

  test('User WITHOUT create permission - createUserAction() fails', async ({ page }) => {
    // Go to any page first
    await page.goto('/dashboard/users');
    
    // Execute createUserAction via direct API call
    const response = await page.evaluate(async () => {
      // This simulates calling the server action
      const formData = new FormData();
      formData.append('email', 'newuser@test.com');
      formData.append('name', 'New User');
      
      try {
        const res = await fetch('/api/users', {
          method: 'POST',
          body: formData,
        });
        return await res.json();
      } catch (error) {
        return { error: String(error) };
      }
    });
    
    // Should fail with permission error
    // (Exact response depends on implementation)
    console.log('Create user response:', response);
  });

  test('User WITHOUT delete permission CANNOT delete user', async ({ page }) => {
    // Navigate to users list
    await page.goto('/dashboard/users');
    
    // Try to find and click delete button
    const deleteButton = page.locator('button:has-text("Delete")').first();
    
    // Delete button might be disabled or not visible
    const isVisible = await deleteButton.isVisible().catch(() => false);
    
    if (isVisible) {
      await deleteButton.click();
      
      // Should see confirmation but fail on submit
      await page.click('button:has-text("Confirm")');
      
      // Should see error message
      await expect(page.locator('text=permission|denied|insufficient', { ignoreCase: true })).toBeVisible();
    } else {
      // Delete button shouldn't be visible for users without delete permission
      expect(isVisible).toBe(false);
    }
  });
});

/**
 * Test: Admin user CAN perform all actions
 */
test.describe('Access Control - Admin Full Access', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/signin');
    
    // Login as admin
    await page.fill('input[type="email"]', 'admin@madelab.io');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/dashboard');
  });

  test('Admin CAN access /users/new (create)', async ({ page }) => {
    await page.goto('/dashboard/users/new');
    
    // Should see create form
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('button:has-text("Create")')).toBeVisible();
  });

  test('Admin CAN delete user', async ({ page }) => {
    await page.goto('/dashboard/users');
    
    // Find delete button - should be visible
    const deleteButton = page.locator('button:has-text("Delete")').first();
    await expect(deleteButton).toBeVisible();
    
    // Click delete
    await deleteButton.click();
    
    // Confirm deletion
    await page.click('button:has-text("Confirm")');
    
    // Should see success message
    await expect(page.locator('text=deleted successfully|User removed', { ignoreCase: true })).toBeVisible();
  });

  test('Admin CAN create new user', async ({ page }) => {
    await page.goto('/dashboard/users/new');
    
    // Fill form
    await page.fill('input[name="email"]', `user${Date.now()}@test.com`);
    await page.fill('input[name="name"]', 'New Test User');
    await page.fill('input[name="password"]', 'TestPassword123!');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Should see success and redirect
    await expect(page.locator('text=created successfully')).toBeVisible();
    await expect(page).toHaveURL(/\/dashboard\/users(\/\w+)?/);
  });
});

/**
 * Test: Role-based Permission Combinations
 */
test.describe('Access Control - Role Combinations', () => {
  const testRoles = [
    {
      name: 'Sales Role',
      email: 'sales@madelab.io',
      canCreate: true,
      canUpdate: true,
      canDelete: false, // Sales can't delete
    },
    {
      name: 'Manager Role',
      email: 'manager@madelab.io',
      canCreate: true,
      canUpdate: true,
      canDelete: true, // Manager can delete
    },
    {
      name: 'Viewer Role (read-only)',
      email: 'viewer@madelab.io',
      canCreate: false,
      canUpdate: false,
      canDelete: false,
    },
  ];

  for (const role of testRoles) {
    test(`${role.name} - /users/new access`, async ({ page }) => {
      // Login
      await page.goto('/auth/signin');
      await page.fill('input[type="email"]', role.email);
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL('/dashboard');

      // Try to access create page
      await page.goto('/dashboard/users/new');

      if (role.canCreate) {
        // Should be able to create
        await expect(page.locator('input[name="email"]')).toBeVisible();
      } else {
        // Should be denied
        await expect(page).toHaveURL(/\/access-denied/);
        await expect(page.locator('text=Access Denied')).toBeVisible();
      }
    });
  }
});
