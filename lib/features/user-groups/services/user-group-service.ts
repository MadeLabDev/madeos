import { prisma } from "@/lib/prisma";
import { getPusher } from "@/lib/realtime/pusher-handler";

import { userGroupRepository } from "../repositories/user-group-repository";
import { CreateUserGroupInput, UpdateUserGroupInput, UserGroupWithMembers } from "../types";

// MySQL không hỗ trợ mode: 'insensitive', chỉ PostgreSQL
// Kiểm tra database type từ DATABASE_URL
const IS_POSTGRESQL = process.env.DATABASE_URL?.includes("postgresql");
const CASE_INSENSITIVE_SEARCH = process.env.DATABASE_CASE_INSENSITIVE === "true" && IS_POSTGRESQL;

export class UserGroupService {
	async getUserGroups(
		options: {
			page?: number;
			search?: string;
			pageSize?: number;
		} = {},
	): Promise<{ userGroups: UserGroupWithMembers[]; total: number }> {
		const { page = 1, search = "", pageSize = 10 } = options;

		const skip = (page - 1) * pageSize;

		// Build where clause with conditional mode for PostgreSQL only
		const findManyWhere = search
			? {
					name: {
						contains: search,
						...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }),
					},
				}
			: undefined;

		// For count query, use simple contains without mode
		const countWhere = search
			? {
					name: {
						contains: search,
					},
				}
			: undefined;

		const [userGroups, total] = await Promise.all([
			userGroupRepository.findMany({
				skip,
				take: pageSize,
				where: findManyWhere,
				include: {
					members: {
						include: {
							user: true,
						},
					},
				},
			}) as Promise<UserGroupWithMembers[]>,
			userGroupRepository.count(countWhere),
		]);

		return { userGroups, total };
	}

	async getUserGroupsWithMemberCount(
		options: {
			page?: number;
			search?: string;
			pageSize?: number;
		} = {},
	): Promise<{ userGroups: any[]; total: number }> {
		const { page = 1, search = "", pageSize = 10 } = options;

		const skip = (page - 1) * pageSize;

		// Build where clause with conditional mode for PostgreSQL only
		const findManyWhere = search
			? {
					name: {
						contains: search,
						...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }),
					},
				}
			: undefined;

		// For count query, use simple contains without mode
		const countWhere = search
			? {
					name: {
						contains: search,
					},
				}
			: undefined;

		const [userGroups, total] = await Promise.all([
			userGroupRepository.findManyWithMemberCount({
				skip,
				take: pageSize,
				where: findManyWhere,
			}),
			userGroupRepository.count(countWhere),
		]);

		return { userGroups, total };
	}

	async getUserGroupById(id: string): Promise<UserGroupWithMembers | null> {
		return userGroupRepository.findById(id);
	}

	async getUserGroupMembers(
		groupId: string,
		options: {
			page?: number;
			search?: string;
			pageSize?: number;
		} = {},
	): Promise<{ members: any[]; total: number }> {
		const { page = 1, search = "", pageSize = 10 } = options;

		const skip = (page - 1) * pageSize;
		const where = search
			? {
					user: {
						OR: [
							{
								name: {
									contains: search,
									...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }),
								},
							},
							{
								email: {
									contains: search,
									...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }),
								},
							},
						],
					},
				}
			: undefined;

		const [members, total] = await Promise.all([
			userGroupRepository.findManyMembers(groupId, {
				skip,
				take: pageSize,
				where,
			}),
			userGroupRepository.countMembers(groupId, where),
		]);

		return { members, total };
	}

	async createUserGroup(data: CreateUserGroupInput): Promise<UserGroupWithMembers> {
		// Check if name already exists
		const existing = await userGroupRepository.findByName(data.name);
		if (existing) {
			throw new Error("User group with this name already exists");
		}

		const userGroup = await userGroupRepository.create(data);

		// Broadcast event
		await getPusher().trigger("private-global", "user_group_update", {
			action: "user_group_created",
			userGroup,
			timestamp: new Date().toISOString(),
		});

		return userGroup;
	}

	async updateUserGroup(id: string, data: UpdateUserGroupInput): Promise<UserGroupWithMembers> {
		// Check if name conflicts with other groups
		if (data.name) {
			const existing = await userGroupRepository.findByName(data.name);
			if (existing && existing.id !== id) {
				throw new Error("User group with this name already exists");
			}
		}

		const userGroup = await userGroupRepository.update(id, data);

		// Broadcast event
		await getPusher().trigger("private-global", "user_group_update", {
			action: "user_group_updated",
			userGroup,
			timestamp: new Date().toISOString(),
		});

		return userGroup;
	}

	async deleteUserGroup(id: string): Promise<UserGroupWithMembers> {
		const userGroup = await userGroupRepository.delete(id);

		// Broadcast event
		await getPusher().trigger("private-global", "user_group_update", {
			action: "user_group_deleted",
			userGroup,
			timestamp: new Date().toISOString(),
		});

		return userGroup;
	}

	async assignUsersToGroup(groupId: string, userEmails: string[]): Promise<void> {
		// Get existing members before assignment
		const existingMembers = await prisma.userGroupMember.findMany({
			where: {
				groupId,
			},
			select: {
				userId: true,
			},
		});

		const existingUserIds = existingMembers.map((m) => m.userId);

		await userGroupRepository.assignUsersToGroup(groupId, userEmails);

		// Get all user IDs from the emails in this request
		const allUsers = await prisma.user.findMany({
			where: {
				email: {
					in: userEmails,
				},
			},
			select: { id: true },
		});

		const allUserIds = allUsers.map((u) => u.id);

		// Find newly added users (not in existing members)
		const newUserIds = allUserIds.filter((id) => !existingUserIds.includes(id));

		// Send "New Article Available" emails only to newly added members for articles assigned to this group
		if (newUserIds.length > 0) {
			await this.sendNewArticleEmailsToNewMembers(groupId, newUserIds);
		}

		// Broadcast event
		await getPusher().trigger("private-global", "user_group_update", {
			action: "user_group_members_updated",
			groupId,
			timestamp: new Date().toISOString(),
		});
	}

	async removeUserFromGroup(groupId: string, userId: string): Promise<void> {
		await userGroupRepository.removeUserFromGroup(groupId, userId);

		// Broadcast event
		await getPusher().trigger("private-global", "user_group_update", {
			action: "user_group_members_updated",
			groupId,
			timestamp: new Date().toISOString(),
		});
	}

	async bulkDeleteUserGroups(ids: string[]): Promise<number> {
		const deletedCount = await userGroupRepository.bulkDelete(ids);

		// Broadcast event
		await getPusher().trigger("private-global", "user_group_update", {
			action: "user_groups_bulk_deleted",
			deletedIds: ids,
			timestamp: new Date().toISOString(),
		});

		return deletedCount;
	}

	/**
	 * Send "New Article Available" emails to newly added members
	 * Finds all knowledge articles assigned to this group and sends email to new users
	 */
	async sendNewArticleEmailsToNewMembers(groupId: string, newUserIds: string[], triggeredBy?: string): Promise<{ success: boolean; message: string; emailResults?: any[] }> {
		try {
			if (newUserIds.length === 0) {
				return { success: true, message: "No new users to notify" };
			}

			// Dynamically import to avoid loading nodemailer on client side
			const { knowledgeEmailService } = await import("@/lib/features/knowledge/services/knowledge-email-service");

			// Get all knowledge articles assigned to this group
			const knowledgeAssignments = await userGroupRepository.getKnowledgeArticlesForGroup(groupId);

			if (knowledgeAssignments.length === 0) {
				return { success: true, message: "No articles assigned to this group" };
			}

			// Send emails for each article to each new user
			const allEmailResults = [];

			for (const assignment of knowledgeAssignments) {
				const knowledgeId = assignment.knowledge.id;
				// Slug
				const courseLink = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/course/${assignment.knowledge.slug}`;

				// Send emails to new users for this article
				const emailResults = await knowledgeEmailService.sendAssignmentEmails(knowledgeId, newUserIds, courseLink, triggeredBy);

				allEmailResults.push(...emailResults);
			}

			const sentCount = allEmailResults.filter((r) => r.sent).length;

			return {
				success: true,
				message: `Notified ${newUserIds.length} new member(s) about ${knowledgeAssignments.length} article(s). ${sentCount} email(s) sent.`,
				emailResults: allEmailResults,
			};
		} catch (error) {
			console.error("Error sending new article emails:", error);
			return {
				success: false,
				message: error instanceof Error ? error.message : "Failed to send emails",
			};
		}
	}
}
