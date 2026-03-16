import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

// MySQL không hỗ trợ mode: 'insensitive', chỉ PostgreSQL
// Kiểm tra database type từ DATABASE_URL
const IS_POSTGRESQL = process.env.DATABASE_URL?.includes("postgresql");
const CASE_INSENSITIVE_SEARCH = process.env.DATABASE_CASE_INSENSITIVE === "true" && IS_POSTGRESQL;

/**
 * User repository - Database operations for users
 */

// Include user with roles and permissions
const userWithRolesInclude = {
	userRoles: {
		include: {
			role: {
				include: {
					rolePermissions: {
						include: {
							module: true,
							permission: true,
						},
					},
				},
			},
		},
	},
} satisfies Prisma.UserInclude;

/**
 * Find user by ID with roles and permissions
 */
export async function findUserById(id: string) {
	return prisma.user.findUnique({
		where: { id },
		include: userWithRolesInclude,
	});
}

/**
 * Find user by email with roles and permissions
 */
export async function findUserByEmail(email: string) {
	return prisma.user.findUnique({
		where: { email },
		include: userWithRolesInclude,
	});
}

/**
 * Find user by username with roles and permissions
 */
export async function findUserByUsername(username: string) {
	return prisma.user.findUnique({
		where: { username },
		include: userWithRolesInclude,
	});
}

/**
 * Find user by activation token
 */
export async function findUserByActivationToken(token: string) {
	return prisma.user.findUnique({
		where: { activationToken: token },
		include: userWithRolesInclude,
	});
}

/**
 * Find all users with pagination
 */
export async function findAllUsers(params?: { skip?: number; take?: number; search?: string; roleId?: string }) {
	const { skip = 0, take = 50, search, roleId } = params || {};

	const where: Prisma.UserWhereInput = {
		AND: [
			search
				? {
						OR: [{ email: { contains: search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { username: { contains: search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }, { name: { contains: search, ...(CASE_INSENSITIVE_SEARCH && { mode: "insensitive" as const }) } }],
					}
				: {},
			roleId
				? {
						userRoles: {
							some: {
								roleId,
							},
						},
					}
				: {},
		],
	};

	const [users, total] = await Promise.all([
		prisma.user.findMany({
			where,
			skip,
			take,
			include: userWithRolesInclude,
			orderBy: { createdAt: "desc" },
		}),
		prisma.user.count({ where }),
	]);

	return { users, total };
}

/**
 * Create new user
 */
export async function createUser(data: { email: string; username?: string; name?: string; password?: string; activationToken?: string; activationTokenExpiry?: Date; isActive?: boolean; createdBy?: string }) {
	return prisma.user.create({
		data: {
			email: data.email,
			username: data.username,
			name: data.name,
			password: data.password,
			activationToken: data.activationToken,
			activationTokenExpiry: data.activationTokenExpiry,
			isActive: data.isActive ?? false,
			createdBy: data.createdBy,
		},
		include: userWithRolesInclude,
	});
}

/**
 * Update user
 */
export async function updateUser(
	id: string,
	data: {
		email?: string;
		username?: string;
		name?: string;
		password?: string | null;
		image?: string;
		activationToken?: string | null;
		activationTokenExpiry?: Date | null;
		isActive?: boolean;
		updatedBy?: string;
	},
) {
	return prisma.user.update({
		where: { id },
		data: {
			...data,
			updatedAt: new Date(),
		},
		include: userWithRolesInclude,
	});
}

/**
 * Delete user
 */
export async function deleteUser(id: string) {
	return prisma.user.delete({
		where: { id },
	});
}

/**
 * Assign role to user
 */
export async function assignRoleToUser(userId: string, roleId: string) {
	// Check if already assigned
	const existing = await prisma.userRole.findUnique({
		where: {
			userId_roleId: {
				userId,
				roleId,
			},
		},
	});

	if (existing) {
		return existing;
	}

	return prisma.userRole.create({
		data: {
			userId,
			roleId,
		},
	});
}

/**
 * Remove role from user
 */
export async function removeRoleFromUser(userId: string, roleId: string) {
	return prisma.userRole.delete({
		where: {
			userId_roleId: {
				userId,
				roleId,
			},
		},
	});
}

/**
 * Get user's roles
 */
export async function getUserRoles(userId: string) {
	return prisma.userRole.findMany({
		where: { userId },
		include: {
			role: true,
		},
	});
}

/**
 * Update user's roles (replace all roles)
 */
export async function updateUserRoles(userId: string, roleIds: string[]) {
	// Delete all existing roles
	await prisma.userRole.deleteMany({
		where: { userId },
	});

	// Create new role assignments
	if (roleIds.length > 0) {
		await prisma.userRole.createMany({
			data: roleIds.map((roleId) => ({
				userId,
				roleId,
			})),
		});
	}

	return getUserRoles(userId);
}

/**
 * Find all roles
 */
export async function findAllRoles() {
	return prisma.role.findMany({
		orderBy: { displayName: "asc" },
	});
}

/**
 * Find role by name
 */
export async function findRoleByName(name: string) {
	return prisma.role.findUnique({
		where: { name },
	});
}

/**
 * Count users by role
 */
export async function countUsersByRole(roleId: string) {
	return prisma.userRole.count({
		where: { roleId },
	});
}

/**
 * Remove all roles from a user
 */
export async function removeAllUserRoles(userId: string) {
	return prisma.userRole.deleteMany({
		where: { userId },
	});
}

/**
 * Find users with expired activation tokens
 */
export async function findUsersWithExpiredActivationTokens() {
	const now = new Date();
	return prisma.user.findMany({
		where: {
			isActive: false,
			activationToken: { not: null },
			activationTokenExpiry: {
				lt: now,
			},
		},
		include: userWithRolesInclude,
	});
}

/**
 * Add a role to a user
 */
export async function addUserRole(userId: string, roleId: string) {
	return prisma.userRole.create({
		data: {
			userId,
			roleId,
		},
	});
}
