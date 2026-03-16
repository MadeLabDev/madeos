export interface User {
	id: string;
	email: string;
	name?: string;
	roles?: Array<{ id: string; name: string; displayName?: string }>;
	permissions?: Record<string, string[]>;
}

/**
 * Check if user has a specific permission (client-side utility)
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
	if (!user?.permissions || !actions.length) return false;
	const modulePermissions = user.permissions[module] || [];
	return actions.some((action) => modulePermissions.includes(action));
}

/**
 * Check if user has all of the specified permissions
 */
export function hasAllPermissions(user: User | null | undefined, module: string, actions: string[]): boolean {
	if (!user?.permissions) return false;
	if (!actions.length) return true; // If no permissions to check, user "has all" of them
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
	if (!user?.roles || !roleNames.length) return false;
	return user.roles.some((role) => roleNames.includes(role.name));
}

/**
 * Check if user is an admin
 */
export function isAdmin(user: User | null | undefined): boolean {
	return hasRole(user, "admin");
}

/**
 * Check if user is a manager
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
