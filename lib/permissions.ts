import { Session } from "next-auth";

import { auth } from "@/lib/auth";

/**
 * Check if user has permission in Server Actions
 * This complements middleware protection by validating permissions when
 * actions are called directly (not just when routes are accessed)
 */
export async function checkPermission(module: string, action: string): Promise<{ allowed: boolean; user?: Session["user"] }> {
	const session = await auth();

	if (!session?.user) {
		return { allowed: false };
	}

	const userPermissions = session.user.permissions || {};
	const modulePermissions = userPermissions[module] || [];

	const hasPermission = modulePermissions.includes(action);

	if (!hasPermission) {
		console.warn(`[Permission Denied] User ${session.user.email} attempted ${action} on ${module}`);
		return { allowed: false };
	}

	return { allowed: true, user: session.user };
}

/**
 * Verify permission or throw error (for use in Server Actions)
 */
export async function requirePermission(module: string, action: string): Promise<Session["user"]> {
	const check = await checkPermission(module, action);

	if (!check.allowed) {
		throw new Error(`Insufficient permissions: You do not have ${action} permission on ${module} module`);
	}

	return check.user!;
}

// Client-side permission checking functions

export interface User {
	id: string;
	email: string;
	name?: string;
	roles: Array<{
		id: string;
		name: string;
		displayName: string;
	}>;
	permissions: Record<string, string[]>;
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(user: User | null | undefined, module: string, action: string): boolean {
	if (!user?.permissions) return false;

	const modulePermissions = user.permissions[module] || [];
	return modulePermissions.includes(action);
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(user: User | null | undefined, module: string, actions: string[]): boolean {
	if (!user?.permissions) return false;

	const modulePermissions = user.permissions[module] || [];
	return actions.some((action) => modulePermissions.includes(action));
}

/**
 * Check if user has all of the specified permissions
 */
export function hasAllPermissions(user: User | null | undefined, module: string, actions: string[]): boolean {
	if (!user?.permissions) return false;

	const modulePermissions = user.permissions[module] || [];
	return actions.every((action) => modulePermissions.includes(action));
}

/**
 * Check if user has a specific role
 */
export function hasRole(user: User | null | undefined, roleName: string): boolean {
	if (!user?.roles) return false;

	return user.roles.some((role) => role.name === roleName);
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(user: User | null | undefined, roleNames: string[]): boolean {
	if (!user?.roles) return false;

	return roleNames.some((roleName) => user.roles.some((role) => role.name === roleName));
}

/**
 * Check if user is admin
 */
export function isAdmin(user: User | null | undefined): boolean {
	return hasRole(user, "admin");
}

/**
 * Check if user is manager
 */
export function isManager(user: User | null | undefined): boolean {
	return hasRole(user, "manager");
}

/**
 * Get permissions for a specific module
 */
export function getModulePermissions(user: User | null | undefined, module: string): string[] {
	if (!user?.permissions) return [];

	return user.permissions[module] || [];
}

/**
 * Get all modules the user has access to
 */
export function getAccessibleModules(user: User | null | undefined): string[] {
	if (!user?.permissions) return [];

	return Object.keys(user.permissions);
}
