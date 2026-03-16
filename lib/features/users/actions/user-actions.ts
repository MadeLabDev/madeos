"use server";

import { auth } from "@/lib/auth";
import { SITE_CONFIG } from "@/lib/config/site";
import * as userService from "@/lib/features/users/services/user-service";
import { requirePermission } from "@/lib/permissions";
import { broadcastToAll } from "@/lib/realtime/pusher-handler";
import type { ActionResult } from "@/lib/types";

/**
 * Server Actions for user management
 */

/**
 * Get current user session with permissions
 */
async function getCurrentUser() {
	const session = await auth();
	if (!session?.user?.email) {
		throw new Error("Not authenticated");
	}

	return userService.getUserByEmail(session.user.email);
}

/**
 * Get all users (with pagination and filters)
 */
export async function getUsersAction(params?: { page?: number; pageSize?: number; search?: string; roleId?: string }): Promise<ActionResult> {
	try {
		const result = await userService.getUsers({
			page: params?.page || 1,
			pageSize: params?.pageSize || SITE_CONFIG.pagination.getPageSize("pagesize"),
			search: params?.search,
			roleId: params?.roleId,
		});

		return {
			success: true,
			message: "Users retrieved successfully",
			data: result,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to retrieve users",
		};
	}
}

/**
 * Search users by name or email (for async selects)
 */
export async function searchUsersAction(query: string): Promise<ActionResult> {
	try {
		const result = await userService.getUsers({
			page: 1,
			pageSize: 20,
			search: query,
		});

		return {
			success: true,
			message: "Users search completed",
			data: result,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to search users",
		};
	}
}

/**
 * Get user by ID
 */
export async function getUserByIdAction(id: string): Promise<ActionResult> {
	try {
		const user = await userService.getUserById(id);

		return {
			success: true,
			message: "User retrieved successfully",
			data: user,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to retrieve user",
		};
	}
}

/**
 * Create new user
 */
export async function createUserAction(data: {
	email: string;
	username?: string;
	name?: string;
	password?: string; // Optional - if not provided, sends activation email
	roleIds?: string[];
	groupId?: string; // Optional - assign user to group
}): Promise<ActionResult> {
	try {
		// Check permission
		await requirePermission("users", "create");

		const currentUser = await getCurrentUser();

		// If no roles selected, get default "user" role
		let roleIds = data.roleIds && data.roleIds.length > 0 ? data.roleIds : undefined;

		if (!roleIds) {
			const userRole = await userService.getRoleByName("user");
			if (userRole) {
				roleIds = [userRole.id];
			} else {
				// If default "user" role doesn't exist, return error
				throw new Error('Default "user" role not found. Please select at least one role.');
			}
		}

		const user = await userService.createUser({
			...data,
			roleIds,
			createdBy: currentUser.id,
		});

		// Assign to group if specified
		if (data.groupId) {
			try {
				const { UserGroupService } = await import("@/lib/features/user-groups/services/user-group-service");
				const userGroupService = new UserGroupService();
				await userGroupService.assignUsersToGroup(data.groupId, [user.email]);
			} catch (error) {
				console.error("Failed to assign user to group:", error);
				// Don't fail the whole operation if group assignment fails
			}
		}

		// Broadcast to all clients - new user created
		await broadcastToAll("user_update", {
			action: "user_created",
			user: {
				id: user.id,
				email: user.email,
				username: user.username,
				name: user.name,
				isActive: user.isActive,
			},
		});

		return {
			success: true,
			message: data.password ? "User created successfully" : "User created successfully. Activation email sent.",
			data: user,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to create user",
		};
	}
}

/**
 * Create multiple users from email list (with rate limiting to prevent spam detection)
 */
export async function createMultipleUsersAction(data: {
	emails: string[];
	roleIds?: string[];
	userGroupId?: string; // Optional: assign created users to this group
}): Promise<ActionResult> {
	try {
		// Check permission
		await requirePermission("users", "create");

		const currentUser = await getCurrentUser();

		// Filter out empty emails and ensure all are strings
		const validEmails: string[] = data.emails
			.filter((e) => e && e.trim && e.trim().length > 0)
			.map((e) => (typeof e === "string" ? e.trim() : ""))
			.filter((e) => e.length > 0);

		if (validEmails.length === 0) {
			throw new Error("No valid emails provided");
		}

		// Get default role if not specified
		let roleIds = data.roleIds && data.roleIds.length > 0 ? data.roleIds : undefined;
		if (!roleIds) {
			const userRole = await userService.getRoleByName("user");
			if (userRole) {
				roleIds = [userRole.id];
			} else {
				throw new Error('Default "user" role not found. Please select at least one role.');
			}
		}

		// Process emails with rate limiting (delay between creates to avoid spam detection)
		const results = [];
		let successCount = 0;
		let skipCount = 0;
		let failureCount = 0;
		const createdEmails: string[] = []; // Track created emails for group assignment

		for (let i = 0; i < validEmails.length; i++) {
			const email: string = validEmails[i]!;

			try {
				// Check if user already exists
				const existingUser = await userService.getUserByEmail(email).catch(() => null);
				if (existingUser) {
					results.push({
						email,
						success: false,
						message: "User already exists",
					});
					skipCount++;
					continue;
				}

				// Create user
				const user = await userService.createUser({
					email,
					roleIds,
					createdBy: currentUser.id,
				});

				results.push({
					email,
					success: true,
					message: "User created successfully. Activation email sent.",
				});

				createdEmails.push(email);
				successCount++;

				// Broadcast user creation
				await broadcastToAll("user_update", {
					action: "user_created",
					user: {
						id: user.id,
						email: user.email,
						username: user.username,
						name: user.name,
						isActive: user.isActive,
					},
				});
			} catch (error) {
				results.push({
					email,
					success: false,
					message: error instanceof Error ? error.message : "Failed to create user",
				});
				failureCount++;
			}

			// Rate limiting: Add delay between creates to prevent spam detection
			// Using 1.5 seconds per email for most email providers (Gmail, Outlook, SMTP servers)
			// This prevents rate limiting and spam detection from email providers
			if (i < validEmails.length - 1) {
				const delayMs = 1500; // 1.5 seconds per email
				await new Promise((resolve) => setTimeout(resolve, delayMs));
			}
		}

		// Assign created users to group if specified
		if (data.userGroupId && createdEmails.length > 0) {
			try {
				const userGroupService = (await import("@/lib/features/user-groups/services/user-group-service")).UserGroupService;
				const groupService = new userGroupService();

				await groupService.assignUsersToGroup(data.userGroupId, createdEmails);
			} catch (error) {
				console.error("Failed to assign users to group:", error);
				// Don't fail the entire operation if group assignment fails
			}
		}

		return {
			success: true,
			message: `Batch creation complete: ${successCount} created, ${skipCount} skipped, ${failureCount} failed`,
			data: {
				totalCount: validEmails.length,
				successCount,
				skipCount,
				failureCount,
				results,
			},
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to create multiple users",
		};
	}
}

/**
 * Update user
 */
export async function updateUserAction(
	id: string,
	data: {
		email?: string;
		username?: string;
		name?: string;
		password?: string;
		image?: string;
	},
): Promise<ActionResult> {
	try {
		// Check permission
		await requirePermission("users", "update");

		const currentUser = await getCurrentUser();

		const user = await userService.updateUser(id, {
			...data,
			updatedBy: currentUser.id,
		});

		// Broadcast to all clients - specific user updated
		await broadcastToAll("user_update", {
			userId: id,
			action: "user_updated",
			user: {
				id: user.id,
				email: user.email,
				username: user.username,
				name: user.name,
				isActive: user.isActive,
			},
		});

		return {
			success: true,
			message: "User updated successfully",
			data: user,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to update user",
		};
	}
}

/**
 * Delete user
 */
export async function deleteUserAction(id: string): Promise<ActionResult> {
	try {
		// Check permission
		await requirePermission("users", "delete");

		const currentUser = await getCurrentUser();

		// Prevent users from deleting themselves
		if (currentUser.id === id) {
			throw new Error("Cannot delete your own account");
		}

		// Prevent deleting admin users
		const userToDelete = await userService.getUserById(id);
		const isAdmin = userToDelete.userRoles.some((ur: any) => ur.role.name === "admin");
		if (isAdmin) {
			throw new Error("Cannot delete admin users");
		}

		await userService.deleteUser(id);

		// Broadcast to all clients
		await broadcastToAll("user_update", {
			action: "deleted",
			user: { id },
		});

		return {
			success: true,
			message: "User deleted successfully",
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to delete user",
		};
	}
}

/**
 * Update user roles
 */
export async function updateUserRolesAction(userId: string, roleIds: string[]): Promise<ActionResult> {
	try {
		const currentUser = await getCurrentUser();

		// Prevent users from modifying their own roles
		if (currentUser.id === userId) {
			throw new Error("Cannot modify your own roles");
		}

		// If no roles selected, get default "user" role
		let finalRoleIds = roleIds && roleIds.length > 0 ? roleIds : undefined;

		if (!finalRoleIds) {
			const userRole = await userService.getRoleByName("user");
			if (userRole) {
				finalRoleIds = [userRole.id];
			} else {
				throw new Error('Default "user" role not found. Please select at least one role.');
			}
		}

		await userService.updateUserRoles(userId, finalRoleIds);

		return {
			success: true,
			message: "User roles updated successfully",
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to update user roles",
		};
	}
}

/**
 * Get all roles
 */
export async function getAllRolesAction(): Promise<ActionResult> {
	try {
		const roles = await userService.getAllRoles();

		return {
			success: true,
			message: "Roles retrieved successfully",
			data: roles,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to retrieve roles",
		};
	}
}

/**
 * Change password (for current user)
 */
export async function changePasswordAction(currentPassword: string, newPassword: string): Promise<ActionResult> {
	try {
		const currentUser = await getCurrentUser();

		await userService.changePassword(currentUser.id, currentPassword, newPassword);

		return {
			success: true,
			message: "Password changed successfully",
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to change password",
		};
	}
}

/**
 * Resend activation email (Admin only)
 */
export async function resendActivationEmailAction(userId: string): Promise<ActionResult> {
	try {
		const result = await userService.resendActivationEmail(userId);

		return {
			success: true,
			message: result.message,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to resend activation email",
		};
	}
}

/**
 * Activate user account (Admin only)
 */
export async function activateUserAction(userId: string): Promise<ActionResult> {
	try {
		await userService.activateUserByAdmin(userId);

		// Get updated user data
		const user = await userService.getUserById(userId);

		// Broadcast to all clients with updated user data
		await broadcastToAll("user_update", {
			userId,
			user: {
				id: user.id,
				email: user.email,
				isActive: user.isActive,
			},
			timestamp: new Date().toISOString(),
		});

		return {
			success: true,
			message: "User activated successfully",
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to activate user",
		};
	}
}

/**
 * Deactivate user account (Admin only)
 */
export async function deactivateUserAction(userId: string): Promise<ActionResult> {
	try {
		await userService.deactivateUserByAdmin(userId);

		// Get updated user data
		const user = await userService.getUserById(userId);

		// Broadcast to all clients with updated user data
		await broadcastToAll("user_update", {
			userId,
			user: {
				id: user.id,
				email: user.email,
				isActive: user.isActive,
			},
			timestamp: new Date().toISOString(),
		});

		return {
			success: true,
			message: "User deactivated successfully",
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to deactivate user",
		};
	}
}

/**
 * Bulk delete users (Admin only)
 */
export async function bulkDeleteUsersAction(userIds: string[]): Promise<ActionResult> {
	try {
		const currentUser = await getCurrentUser();

		// Prevent deleting self
		if (userIds.includes(currentUser.id)) {
			throw new Error("Cannot delete your own account");
		}

		// Check if any user is an admin
		const usersToDelete = await Promise.all(userIds.map((id) => userService.getUserById(id)));
		const adminUsers = usersToDelete.filter((user) => user.userRoles.some((ur: any) => ur.role.name === "admin"));

		if (adminUsers.length > 0) {
			throw new Error(`Cannot delete admin users: ${adminUsers.map((u) => u.email).join(", ")}`);
		}

		const result = await userService.bulkDeleteUsers(userIds);

		// Broadcast individual user deletions
		for (const userId of userIds) {
			await broadcastToAll("user_update", {
				userId,
				action: "deleted",
				user: { id: userId },
			});
		}

		return {
			success: true,
			message: result.message,
			data: result,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to delete users",
		};
	}
}

/**
 * Bulk activate users (Admin only)
 */
export async function bulkActivateUsersAction(userIds: string[]): Promise<ActionResult> {
	try {
		const result = await userService.bulkActivateUsers(userIds);

		// Broadcast individual user activations
		const updatedUsers = await Promise.all(userIds.map((id) => userService.getUserById(id)));

		for (const user of updatedUsers) {
			await broadcastToAll("user_update", {
				userId: user.id,
				action: "activated",
				user: {
					id: user.id,
					email: user.email,
					isActive: user.isActive,
				},
			});
		}

		return {
			success: true,
			message: result.message,
			data: result,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to activate users",
		};
	}
}

/**
 * Bulk update user roles (Admin only)
 */
export async function bulkUpdateUserRolesAction(userIds: string[], roleId: string): Promise<ActionResult> {
	try {
		const currentUser = await getCurrentUser();

		// Prevent updating own roles
		if (userIds.includes(currentUser.id)) {
			throw new Error("Cannot update your own roles");
		}

		// Check if any user is an admin (prevent changing admin roles)
		const usersToUpdate = await Promise.all(userIds.map((id) => userService.getUserById(id)));
		const adminUsers = usersToUpdate.filter((user) => user.userRoles.some((ur: any) => ur.role.name === "admin"));

		if (adminUsers.length > 0) {
			throw new Error(`Cannot update roles for admin users: ${adminUsers.map((u) => u.email).join(", ")}`);
		}

		const result = await userService.bulkUpdateUserRoles(userIds, roleId);

		// Broadcast individual user updates
		for (const userId of userIds) {
			await broadcastToAll("user_update", {
				userId,
				action: "updated",
				user: { id: userId },
			});
		}

		return {
			success: true,
			message: result.message,
			data: result,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to update user roles",
		};
	}
}

/**
 * Bulk resend activation emails (Admin only)
 */
export async function bulkResendActivationEmailsAction(userIds: string[]): Promise<ActionResult> {
	try {
		await requirePermission("users", "update");

		const result = await userService.bulkResendActivationEmails(userIds);

		return {
			success: true,
			message: result.message,
			data: result,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to resend activation emails",
		};
	}
}

/**
 * Resend activation emails to all users with expired activation tokens (Admin only)
 */
export async function resendActivationEmailsToExpiredUsersAction(): Promise<ActionResult> {
	try {
		await requirePermission("users", "update");

		const result = await userService.resendActivationEmailsToExpiredUsers();

		return {
			success: true,
			message: result.message,
			data: result,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to resend activation emails to expired users",
		};
	}
}
