import { prisma } from "@/lib/prisma";

import { CreateUserGroupInput, UpdateUserGroupInput, UserGroupWithMembers } from "../types";

// MySQL không hỗ trợ mode: 'insensitive', chỉ PostgreSQL
// Kiểm tra database type từ DATABASE_URL
const IS_POSTGRESQL = process.env.DATABASE_URL?.includes("postgresql");
const CASE_INSENSITIVE_SEARCH = process.env.DATABASE_CASE_INSENSITIVE === "true" && IS_POSTGRESQL;

export class UserGroupRepository {
	async findMany(
		options: {
			skip?: number;
			take?: number;
			where?: {
				name?: {
					contains: string;
				};
			};
			include?: {
				members: {
					include: {
						user: true;
					};
				};
			};
		} = {},
	) {
		// Build where clause with conditional mode for PostgreSQL only
		const where = options.where
			? {
					name: options.where.name
						? {
								contains: options.where.name.contains,
								...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }),
							}
						: undefined,
				}
			: undefined;

		return prisma.userGroup.findMany({
			skip: options.skip,
			take: options.take,
			where: where && Object.values(where).some((v) => v !== undefined) ? where : undefined,
			include: options.include,
			orderBy: { createdAt: "desc" },
		});
	}

	async findManyWithMemberCount(
		options: {
			skip?: number;
			take?: number;
			where?: {
				name?: {
					contains: string;
				};
			};
		} = {},
	) {
		// Build where clause with conditional mode for PostgreSQL only
		const where = options.where
			? {
					name: options.where.name
						? {
								contains: options.where.name.contains,
								...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }),
							}
						: undefined,
				}
			: undefined;

		return prisma.userGroup.findMany({
			skip: options.skip,
			take: options.take,
			where: where && Object.values(where).some((v) => v !== undefined) ? where : undefined,
			orderBy: { createdAt: "desc" },
			include: {
				_count: {
					select: {
						members: true,
					},
				},
			},
		});
	}

	async findById(id: string): Promise<UserGroupWithMembers | null> {
		return prisma.userGroup.findUnique({
			where: { id },
			include: {
				members: {
					include: {
						user: true,
					},
				},
			},
		});
	}

	async findByName(name: string): Promise<UserGroupWithMembers | null> {
		return prisma.userGroup.findUnique({
			where: { name },
			include: {
				members: {
					include: {
						user: true,
					},
				},
			},
		});
	}

	async create(data: CreateUserGroupInput): Promise<UserGroupWithMembers> {
		return prisma.userGroup.create({
			data,
			include: {
				members: {
					include: {
						user: true,
					},
				},
			},
		});
	}

	async update(id: string, data: UpdateUserGroupInput): Promise<UserGroupWithMembers> {
		return prisma.userGroup.update({
			where: { id },
			data,
			include: {
				members: {
					include: {
						user: true,
					},
				},
			},
		});
	}

	async delete(id: string): Promise<UserGroupWithMembers> {
		return prisma.userGroup.delete({
			where: { id },
			include: {
				members: {
					include: {
						user: true,
					},
				},
			},
		});
	}

	async count(where?: { name?: { contains: string } }): Promise<number> {
		// For count queries, don't use mode: 'insensitive' as it's not supported in MySQL
		// Use case-insensitive search via database collation instead
		return prisma.userGroup.count({
			where: where && Object.values(where).some((v) => v !== undefined) ? where : undefined,
		});
	}

	async findManyMembers(
		groupId: string,
		options: {
			skip?: number;
			take?: number;
			where?: {
				user?: {
					OR: Array<{
						name?: {
							contains: string;
						};
						email?: {
							contains: string;
						};
					}>;
				};
			};
		} = {},
	) {
		// Build where clause with conditional mode for PostgreSQL only
		const where = options.where?.user?.OR
			? {
					user: {
						OR: options.where.user.OR.map((condition: any) => ({
							name: condition.name
								? {
										contains: condition.name.contains,
										...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }),
									}
								: undefined,
							email: condition.email
								? {
										contains: condition.email.contains,
										...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }),
									}
								: undefined,
						})),
					},
				}
			: undefined;

		return prisma.userGroupMember.findMany({
			where: {
				groupId,
				...where,
			},
			include: {
				user: true,
			},
			skip: options.skip,
			take: options.take,
			orderBy: { assignedAt: "desc" },
		});
	}

	async countMembers(
		groupId: string,
		where?: {
			user?: {
				OR: Array<{
					name?: {
						contains: string;
					};
					email?: {
						contains: string;
					};
				}>;
			};
		},
	): Promise<number> {
		// Build where clause with conditional mode for PostgreSQL only
		const processedWhere = where?.user?.OR
			? {
					user: {
						OR: where.user.OR.map((condition: any) => ({
							name: condition.name
								? {
										contains: condition.name.contains,
										...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }),
									}
								: undefined,
							email: condition.email
								? {
										contains: condition.email.contains,
										...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }),
									}
								: undefined,
						})),
					},
				}
			: undefined;

		return prisma.userGroupMember.count({
			where: {
				groupId,
				...processedWhere,
			},
		});
	}

	async assignUsersToGroup(groupId: string, userEmails: string[]): Promise<void> {
		// Find users by emails
		const users = await prisma.user.findMany({
			where: {
				email: {
					in: userEmails,
				},
			},
		});

		// Get existing members
		const existingMembers = await prisma.userGroupMember.findMany({
			where: {
				groupId,
			},
			select: {
				userId: true,
			},
		});

		const existingUserIds = existingMembers.map((m) => m.userId);

		// Filter out users who are already members
		const newUsers = users.filter((user) => !existingUserIds.includes(user.id));

		// Create member records for new users only
		const memberData = newUsers.map((user) => ({
			userId: user.id,
			groupId,
		}));

		// Use transaction to ensure consistency
		return prisma.$transaction(async (tx) => {
			// Add new members only (don't remove existing ones)
			for (const member of memberData) {
				await tx.userGroupMember.upsert({
					where: {
						userId_groupId: {
							userId: member.userId,
							groupId: member.groupId,
						},
					},
					update: {},
					create: member,
				});
			}

			// Transaction completed successfully
		});
	}

	async removeUserFromGroup(groupId: string, userId: string): Promise<void> {
		// Use transaction to ensure consistency
		await prisma.$transaction(async (tx) => {
			// Remove user from group
			await tx.userGroupMember.deleteMany({
				where: {
					groupId,
					userId,
				},
			});

			// Delete email logs for articles assigned to this group
			// This allows the user to receive the email again if re-added to the group
			const knowledgeArticles = await tx.knowledgeAssignedGroup.findMany({
				where: {
					groupId,
				},
				select: {
					knowledgeId: true,
				},
			});

			const knowledgeIds = knowledgeArticles.map((ka) => ka.knowledgeId);

			if (knowledgeIds.length > 0) {
				await tx.knowledgeEmailLog.deleteMany({
					where: {
						knowledgeId: {
							in: knowledgeIds,
						},
						recipientId: userId,
					},
				});
			}
		});
	}

	async bulkDelete(ids: string[]): Promise<number> {
		const result = await prisma.userGroup.deleteMany({
			where: {
				id: {
					in: ids,
				},
			},
		});
		return result.count;
	}

	/**
	 * Get all knowledge articles assigned to a user group
	 */
	async getKnowledgeArticlesForGroup(groupId: string): Promise<any[]> {
		return prisma.knowledgeAssignedGroup.findMany({
			where: { groupId },
			include: {
				knowledge: {
					select: {
						id: true,
						title: true,
						slug: true,
					},
				},
			},
		});
	}
}

export const userGroupRepository = new UserGroupRepository();
