import bcrypt from "bcryptjs";
import crypto from "crypto";
import { unstable_cache } from "next/cache";

import { SITE_CONFIG } from "@/lib";
import { CACHE_ENABLED, CACHE_TAGS } from "@/lib/cache/cache-helpers";
import { emailService } from "@/lib/email/service";

import * as userRepository from "../repositories/user-repository";
import type { CreateUserInput, UpdateUserInput } from "../types/users.types";

/**
 * User service - Business logic for user management
 */

/**
 * Get user by ID with roles and permissions
 * Cached version if CACHE_ENABLED is true
 */
export const getUserById = CACHE_ENABLED
	? unstable_cache(
			async (id: string) => {
				const user = await userRepository.findUserById(id);
				if (!user) {
					throw new Error("User not found");
				}
				return user;
			},
			["user-by-id"],
			{
				tags: [CACHE_TAGS.USERS],
				revalidate: 3600, // 1 hour
			},
		)
	: async (id: string) => {
			const user = await userRepository.findUserById(id);
			if (!user) {
				throw new Error("User not found");
			}
			return user;
		};

/**
 * Get user by email with roles and permissions
 * Cached version if CACHE_ENABLED is true
 */
export const getUserByEmail = CACHE_ENABLED
	? unstable_cache(
			async (email: string) => {
				const user = await userRepository.findUserByEmail(email);
				if (!user) {
					throw new Error("User not found");
				}
				return user;
			},
			["user-by-email"],
			{
				tags: [CACHE_TAGS.USERS],
				revalidate: 3600, // 1 hour
			},
		)
	: async (email: string) => {
			const user = await userRepository.findUserByEmail(email);
			if (!user) {
				throw new Error("User not found");
			}
			return user;
		};

/**
 * Get all users with pagination and filters
 */
export async function getUsers(params?: { page?: number; pageSize?: number; search?: string; roleId?: string }) {
	const { page = 1, pageSize = SITE_CONFIG.pagination.getPageSize("pagesize"), search, roleId } = params || {};
	const skip = (page - 1) * pageSize;

	const result = await userRepository.findAllUsers({
		skip,
		take: pageSize,
		search,
		roleId,
	});

	return {
		users: result.users,
		total: result.total,
		page,
		pageSize,
		totalPages: Math.ceil(result.total / pageSize),
	};
}

/**
 * Create new user
 */
export async function createUser(input: CreateUserInput) {
	// Validate email
	const existingUser = await userRepository.findUserByEmail(input.email);
	if (existingUser) {
		throw new Error("User with this email already exists");
	}

	// Validate username uniqueness if provided
	if (input.username) {
		// Validate username format
		if (!/^[a-zA-Z0-9_-]{3,20}$/.test(input.username)) {
			throw new Error("Username must be 3-20 characters (letters, numbers, underscore, hyphen)");
		}

		const existingUsername = await userRepository.findUserByUsername(input.username);
		if (existingUsername) {
			throw new Error("Username already taken");
		}
	}

	let hashedPassword: string | undefined;
	let activationToken: string | undefined;
	let activationTokenExpiry: Date | undefined;
	let isActive = false;

	// If password provided, hash it and mark as active
	if (input.password) {
		hashedPassword = await bcrypt.hash(input.password, 10);
		isActive = true;
	} else {
		// No password - generate activation token
		activationToken = crypto.randomBytes(32).toString("hex");
		activationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
	}

	// Create user
	const user = await userRepository.createUser({
		email: input.email,
		username: input.username,
		name: input.name,
		password: hashedPassword,
		activationToken,
		activationTokenExpiry,
		isActive,
		createdBy: input.createdBy,
	});

	// Assign roles if provided
	if (input.roleIds && input.roleIds.length > 0) {
		await userRepository.updateUserRoles(user.id, input.roleIds);
	}

	// Send appropriate email
	if (activationToken) {
		// Send activation email (user must set password)
		emailService.sendActivationEmail(user.email, user.name || user.email, activationToken).catch((error) => {
			console.error("Failed to send activation email:", error);
		});
	} else {
		// Send welcome email (password already set)
		emailService.sendWelcomeEmail(user.email, user.name || user.email).catch((error) => {
			console.error("Failed to send welcome email:", error);
		});
	}

	return getUserById(user.id);
}

/**
 * Update user
 */
export async function updateUser(id: string, input: UpdateUserInput) {
	// Check if user exists
	await getUserById(id);

	// If email is being updated, check for duplicates
	if (input.email) {
		const existingUser = await userRepository.findUserByEmail(input.email);
		if (existingUser && existingUser.id !== id) {
			throw new Error("User with this email already exists");
		}
	}

	// If username is being updated, validate and check for duplicates
	if (input.username) {
		// Validate username format
		if (!/^[a-zA-Z0-9_-]{3,20}$/.test(input.username)) {
			throw new Error("Username must be 3-20 characters (letters, numbers, underscore, hyphen)");
		}

		const existingUsername = await userRepository.findUserByUsername(input.username);
		if (existingUsername && existingUsername.id !== id) {
			throw new Error("Username already taken");
		}
	}

	// Hash password if provided
	let hashedPassword: string | undefined;
	if (input.password) {
		hashedPassword = await bcrypt.hash(input.password, 10);
	}

	return userRepository.updateUser(id, {
		...input,
		password: hashedPassword,
	});
}

/**
 * Delete user
 */
export async function deleteUser(id: string) {
	// Check if user exists
	await getUserById(id);

	// Prevent deleting the last admin
	const user = await getUserById(id);
	const isAdmin = user.userRoles.some((ur) => ur.role.name === "admin");

	if (isAdmin) {
		const allUsers = await userRepository.findAllUsers();
		const adminCount = allUsers.users.filter((u) => u.userRoles.some((ur) => ur.role.name === "admin")).length;

		if (adminCount <= 1) {
			throw new Error("Cannot delete the last admin user");
		}
	}

	return userRepository.deleteUser(id);
}

/**
 * Assign roles to user (replaces all existing roles)
 */
export async function updateUserRoles(userId: string, roleIds: string[]) {
	// Check if user exists
	await getUserById(userId);

	// Validate all role IDs exist
	const allRoles = await userRepository.findAllRoles();
	const validRoleIds = allRoles.map((r) => r.id);
	const invalidRoleIds = roleIds.filter((id) => !validRoleIds.includes(id));

	if (invalidRoleIds.length > 0) {
		throw new Error(`Invalid role IDs: ${invalidRoleIds.join(", ")}`);
	}

	// Prevent removing admin role from the last admin
	const user = await getUserById(userId);
	const isCurrentlyAdmin = user.userRoles.some((ur) => ur.role.name === "admin");
	const willBeAdmin = roleIds.some((roleId) => {
		const role = allRoles.find((r) => r.id === roleId);
		return role?.name === "admin";
	});

	if (isCurrentlyAdmin && !willBeAdmin) {
		const allUsers = await userRepository.findAllUsers();
		const adminCount = allUsers.users.filter((u) => u.userRoles.some((ur) => ur.role.name === "admin")).length;

		if (adminCount <= 1) {
			throw new Error("Cannot remove admin role from the last admin user");
		}
	}

	return userRepository.updateUserRoles(userId, roleIds);
}

/**
 * Get all available roles
 */
export async function getAllRoles() {
	return userRepository.findAllRoles();
}

/**
 * Get role by name
 */
export async function getRoleByName(name: string) {
	return userRepository.findRoleByName(name);
}

/**
 * Change user password
 */
export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
	const user = await getUserById(userId);

	if (!user.password) {
		throw new Error("User does not have a password (OAuth user)");
	}

	// Verify current password
	const isValid = await bcrypt.compare(currentPassword, user.password);
	if (!isValid) {
		throw new Error("Current password is incorrect");
	}

	// Hash new password
	const hashedPassword = await bcrypt.hash(newPassword, 10);

	return userRepository.updateUser(userId, {
		password: hashedPassword,
	});
}

/**
 * Resend activation email (Admin function)
 */
export async function resendActivationEmail(userId: string) {
	const user = await getUserById(userId);

	// Check if user is already active
	if (user.isActive) {
		throw new Error("User account is already active");
	}

	// Generate new activation token
	const activationToken = crypto.randomBytes(32).toString("hex");
	const activationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

	// Update user with new token
	await userRepository.updateUser(userId, {
		activationToken,
		activationTokenExpiry,
	} as any);

	// Send activation email
	const result = await emailService.sendActivationEmail(user.email, user.name || user.email, activationToken);

	if (!result.success) {
		throw new Error("Failed to send activation email");
	}

	return { success: true, message: "Activation email sent successfully" };
}

/**
 * Activate account with token and set password
 */
export async function activateAccount(activationToken: string, newPassword: string) {
	// Find user by activation token
	const user = await userRepository.findUserByActivationToken(activationToken);

	if (!user) {
		throw new Error("Invalid or expired activation token");
	}

	// Check if token is expired
	if (!user.activationTokenExpiry || user.activationTokenExpiry < new Date()) {
		throw new Error("Activation token has expired");
	}

	// Hash password
	const hashedPassword = await bcrypt.hash(newPassword, 10);

	// Update user: set password, mark as active, clear activation token
	await userRepository.updateUser(user.id, {
		password: hashedPassword,
		isActive: true,
		activationToken: null,
		activationTokenExpiry: null,
	} as any);

	// Send welcome email after successful activation
	emailService
		.sendWelcomeEmail(
			user.email,
			user.name || user.email,
			true, // isActivation = true
		)
		.catch((error) => {
			console.error("Failed to send welcome email:", error);
			// Don't throw - activation succeeded, email is secondary
		});

	return { success: true, message: "Account activated successfully" };
}

/**
 * Validate activation token
 */
export async function validateActivationToken(token: string) {
	const user = await userRepository.findUserByActivationToken(token);

	if (!user) {
		return { valid: false, message: "Invalid activation token" };
	}

	if (!user.activationTokenExpiry || user.activationTokenExpiry < new Date()) {
		return { valid: false, message: "Activation token has expired" };
	}

	if (user.isActive) {
		return { valid: false, message: "Account is already active" };
	}

	return {
		valid: true,
		user: {
			email: user.email,
			name: user.name,
		},
	};
}

/**
 * Activate user by admin (without token)
 */
export async function activateUserByAdmin(userId: string) {
	const user = await getUserById(userId);

	if (user.isActive) {
		throw new Error("User is already active");
	}

	await userRepository.updateUser(userId, {
		isActive: true,
		activationToken: null,
		activationTokenExpiry: null,
	} as any);

	return { success: true, message: "User activated successfully" };
}

/**
 * Deactivate user by admin
 */
export async function deactivateUserByAdmin(userId: string) {
	const user = await getUserById(userId);

	if (!user.isActive) {
		throw new Error("User is already inactive");
	}

	await userRepository.updateUser(userId, {
		isActive: false,
	} as any);

	return { success: true, message: "User deactivated successfully" };
}

/**
 * Bulk delete users
 */
export async function bulkDeleteUsers(userIds: string[]) {
	if (userIds.length === 0) {
		throw new Error("No users selected");
	}

	// Get all users to check if any are admins
	const users = await Promise.all(userIds.map((id) => getUserById(id)));

	// Check for admin users
	const adminUsers = users.filter((user) => user.userRoles.some((ur) => ur.role.name === "admin"));

	if (adminUsers.length > 0) {
		// Count total admins in system
		const allUsers = await userRepository.findAllUsers();
		const totalAdmins = allUsers.users.filter((u) => u.userRoles.some((ur) => ur.role.name === "admin")).length;

		// If we're trying to delete all admins, prevent it
		if (adminUsers.length >= totalAdmins) {
			throw new Error("Cannot delete all admin users. At least one admin must remain.");
		}

		// If some (but not all) admins in selection, skip them
		const adminEmails = adminUsers.map((u) => u.email).join(", ");
		const nonAdminIds = userIds.filter((id) => !adminUsers.some((admin) => admin.id === id));

		if (nonAdminIds.length === 0) {
			throw new Error(`Cannot delete admin users: ${adminEmails}`);
		}

		// Delete only non-admin users
		await Promise.all(nonAdminIds.map((id) => userRepository.deleteUser(id)));

		return {
			success: true,
			message: `Deleted ${nonAdminIds.length} user(s). Skipped ${adminUsers.length} admin user(s).`,
			deleted: nonAdminIds.length,
			skipped: adminUsers.length,
			skippedUsers: adminEmails,
		};
	}

	// No admins in selection, delete all
	await Promise.all(userIds.map((id) => userRepository.deleteUser(id)));

	return {
		success: true,
		message: `Successfully deleted ${userIds.length} user(s)`,
		deleted: userIds.length,
		skipped: 0,
	};
}

/**
 * Bulk activate users
 */
export async function bulkActivateUsers(userIds: string[]) {
	if (userIds.length === 0) {
		throw new Error("No users selected");
	}

	// Get all users
	const users = await Promise.all(userIds.map((id) => getUserById(id)));

	// Filter only inactive users
	const inactiveUsers = users.filter((user) => !user.isActive);

	if (inactiveUsers.length === 0) {
		return {
			success: true,
			message: "All selected users are already active",
			activated: 0,
			skipped: users.length,
		};
	}

	// Activate users
	await Promise.all(
		inactiveUsers.map((user) =>
			userRepository.updateUser(user.id, {
				isActive: true,
				activationToken: null,
				activationTokenExpiry: null,
			} as any),
		),
	);

	const skipped = users.length - inactiveUsers.length;

	return {
		success: true,
		message: skipped > 0 ? `Activated ${inactiveUsers.length} user(s). ${skipped} already active.` : `Successfully activated ${inactiveUsers.length} user(s)`,
		activated: inactiveUsers.length,
		skipped,
	};
}

/**
 * Get user permissions for session (merged from all roles)
 */
export async function getUserSessionPermissions(userId: string) {
	const user = await getUserById(userId);

	if (!user.isActive) {
		return {};
	}

	// Get role IDs
	const roleIds = user.userRoles.map((ur) => ur.roleId);

	if (roleIds.length === 0) {
		return {};
	}

	// Get merged permissions from all roles
	const { getMultiRolePermissions } = await import("@/lib/features/permissions/services/permission-service");
	const permissions = await getMultiRolePermissions(roleIds);

	return permissions;
}

/**
 * Bulk update user roles
 */
export async function bulkUpdateUserRoles(userIds: string[], roleId: string) {
	if (userIds.length === 0) {
		throw new Error("No users selected");
	}

	// Get the role to assign
	const { getRoleById } = await import("@/lib/features/roles/services/role-service");
	const role = await getRoleById(roleId);

	// Get all users
	const users = await Promise.all(userIds.map((id) => getUserById(id)));

	// Check for admin users (prevent changing admin roles)
	const adminUsers = users.filter((user) => user.userRoles.some((ur) => ur.role.name === "admin"));

	if (adminUsers.length > 0) {
		throw new Error(`Cannot update roles for admin users: ${adminUsers.map((u) => u.email).join(", ")}`);
	}

	// Update roles for each user (replace all existing roles with the new role)
	await Promise.all(
		users.map(async (user) => {
			// First, remove all existing roles
			await userRepository.removeAllUserRoles(user.id);

			// Then add the new role
			await userRepository.addUserRole(user.id, roleId);
		}),
	);

	return {
		success: true,
		message: `Successfully updated roles for ${userIds.length} user(s) to "${role.displayName}"`,
		updated: userIds.length,
		roleName: role.displayName,
	};
}

/**
 * Bulk resend activation emails
 */
export async function bulkResendActivationEmails(userIds: string[]) {
	if (userIds.length === 0) {
		throw new Error("No users selected");
	}

	// Get all users
	const users = await Promise.all(userIds.map((id) => getUserById(id)));

	// Filter only inactive users
	const inactiveUsers = users.filter((user) => !user.isActive);

	if (inactiveUsers.length === 0) {
		return {
			success: true,
			message: "All selected users are already active. No emails sent.",
			sent: 0,
			skipped: users.length,
		};
	}

	let successCount = 0;
	let failCount = 0;

	// Resend activation emails with rate limiting
	for (let i = 0; i < inactiveUsers.length; i++) {
		const user = inactiveUsers[i]!;

		try {
			// Generate new activation token
			const activationToken = crypto.randomBytes(32).toString("hex");
			const activationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

			// Update user with new token
			await userRepository.updateUser(user.id, {
				activationToken,
				activationTokenExpiry,
			} as any);

			// Send activation email
			const result = await emailService.sendActivationEmail(user.email, user.name || user.email, activationToken);

			if (result.success) {
				successCount++;
			} else {
				failCount++;
			}
		} catch (error) {
			console.error(`Failed to resend activation email for ${user.email}:`, error);
			failCount++;
		}

		// Rate limiting: 1.5 seconds between emails
		if (i < inactiveUsers.length - 1) {
			await new Promise((resolve) => setTimeout(resolve, 1500));
		}
	}

	const skipped = users.length - inactiveUsers.length;

	return {
		success: true,
		message: skipped > 0 ? `Sent ${successCount} activation email(s), ${failCount} failed. ${skipped} user(s) already active.` : failCount > 0 ? `Sent ${successCount} activation email(s), ${failCount} failed.` : `Successfully sent ${successCount} activation email(s)`,
		sent: successCount,
		failed: failCount,
		skipped,
	};
}

/**
 * Resend activation emails to all users with expired activation tokens
 */
export async function resendActivationEmailsToExpiredUsers() {
	const expiredUsers = await userRepository.findUsersWithExpiredActivationTokens();

	if (expiredUsers.length === 0) {
		return {
			success: true,
			message: "No users with expired activation tokens found",
			sent: 0,
			failed: 0,
			skipped: 0,
		};
	}

	let successCount = 0;
	let failCount = 0;

	for (let i = 0; i < expiredUsers.length; i++) {
		const user = expiredUsers[i]!;

		try {
			// Generate new activation token
			const activationToken = crypto.randomBytes(32).toString("hex");
			const activationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

			// Update user with new token
			await userRepository.updateUser(user.id, {
				activationToken,
				activationTokenExpiry,
			} as any);

			// Send activation email
			const result = await emailService.sendActivationEmail(user.email, user.name || user.email, activationToken);

			if (result.success) {
				successCount++;
			} else {
				failCount++;
			}
		} catch (error) {
			console.error(`Failed to resend activation email to ${user.email}:`, error);
			failCount++;
		}

		// Rate limiting: 1.5 seconds between emails
		if (i < expiredUsers.length - 1) {
			await new Promise((resolve) => setTimeout(resolve, 1500));
		}
	}

	return {
		success: true,
		message: failCount > 0 ? `Sent ${successCount} activation email(s), ${failCount} failed.` : `Successfully sent ${successCount} activation email(s)`,
		sent: successCount,
		failed: failCount,
		skipped: 0,
	};
}
