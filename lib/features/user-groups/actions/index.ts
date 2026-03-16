"use server";

import { requirePermission } from "@/lib/permissions";
import type { ActionResult } from "@/lib/types";

import { UserGroupService } from "../services/user-group-service";
import { AssignUsersToGroupInput, CreateUserGroupInput, UpdateUserGroupInput } from "../types";

// Initialize service
const userGroupService = new UserGroupService();

// Get user groups with pagination and search
export async function getUserGroupsAction(
	options: {
		page?: number;
		search?: string;
		pageSize?: number;
	} = {},
): Promise<ActionResult<{ userGroups: any[]; total: number }>> {
	try {
		await requirePermission("users", "read");

		const result = await userGroupService.getUserGroupsWithMemberCount(options);
		return {
			success: true,
			data: result,
			message: "User groups retrieved successfully",
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to retrieve user groups",
		};
	}
}

// Get single user group by ID
export async function getUserGroupAction(id: string): Promise<ActionResult<any>> {
	try {
		await requirePermission("users", "read");

		const userGroup = await userGroupService.getUserGroupById(id);
		if (!userGroup) {
			return {
				success: false,
				message: "User group not found",
			};
		}

		return {
			success: true,
			data: userGroup,
			message: "User group retrieved successfully",
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to retrieve user group",
		};
	}
}

// Create new user group
export async function createUserGroupAction(data: CreateUserGroupInput): Promise<ActionResult<any>> {
	try {
		await requirePermission("users", "create");

		const userGroup = await userGroupService.createUserGroup(data);
		return {
			success: true,
			data: userGroup,
			message: "User group created successfully",
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to create user group",
		};
	}
}

// Update user group
export async function updateUserGroupAction(id: string, data: UpdateUserGroupInput): Promise<ActionResult<any>> {
	try {
		await requirePermission("users", "update");

		const userGroup = await userGroupService.updateUserGroup(id, data);
		return {
			success: true,
			data: userGroup,
			message: "User group updated successfully",
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to update user group",
		};
	}
}

// Delete user group
export async function deleteUserGroupAction(id: string): Promise<ActionResult<any>> {
	try {
		await requirePermission("users", "delete");

		const userGroup = await userGroupService.deleteUserGroup(id);
		return {
			success: true,
			data: userGroup,
			message: "User group deleted successfully",
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to delete user group",
		};
	}
}

// Assign users to group
export async function assignUsersToGroupAction(data: AssignUsersToGroupInput): Promise<ActionResult<any>> {
	try {
		await requirePermission("users", "update");

		await userGroupService.assignUsersToGroup(data.groupId, data.userEmails);
		return {
			success: true,
			message: "Users added to group successfully",
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to assign users to group",
		};
	}
}

// Remove user from group
export async function removeUserFromGroupAction(groupId: string, userId: string): Promise<ActionResult<void>> {
	try {
		await requirePermission("users", "update");

		await userGroupService.removeUserFromGroup(groupId, userId);
		return {
			success: true,
			message: "User removed from group successfully",
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to remove user from group",
		};
	}
}

// Get members of a user group with pagination
export async function getUserGroupMembersAction(
	groupId: string,
	options: {
		page?: number;
		search?: string;
		pageSize?: number;
	} = {},
): Promise<ActionResult<{ members: any[]; total: number }>> {
	try {
		await requirePermission("users", "read");

		const result = await userGroupService.getUserGroupMembers(groupId, options);
		return {
			success: true,
			data: result,
			message: "Members retrieved successfully",
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to retrieve members",
		};
	}
}

// Bulk delete user groups
export async function bulkDeleteUserGroupsAction(ids: string[]): Promise<ActionResult<{ deletedCount: number }>> {
	try {
		await requirePermission("users", "delete");

		const deletedCount = await userGroupService.bulkDeleteUserGroups(ids);
		return {
			success: true,
			data: { deletedCount },
			message: `${deletedCount} user group(s) deleted successfully`,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to delete user groups",
		};
	}
}

// Search user groups for autocomplete (returns all matching groups without pagination)
export async function searchUserGroupsAction(searchQuery: string): Promise<ActionResult<any[]>> {
	try {
		await requirePermission("users", "read");

		const result = await userGroupService.getUserGroups({
			search: searchQuery,
			pageSize: 50, // Return more results for search
		});

		return {
			success: true,
			data: result.userGroups,
			message: "User groups retrieved successfully",
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to search user groups",
		};
	}
}

// Get all user groups (for dropdown selection)
export async function getAllUserGroupsAction(): Promise<ActionResult<any[]>> {
	try {
		await requirePermission("users", "read");

		const result = await userGroupService.getUserGroups({
			pageSize: 1000, // Get all groups
		});

		return {
			success: true,
			data: result.userGroups,
			message: "User groups retrieved successfully",
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to retrieve user groups",
		};
	}
}
