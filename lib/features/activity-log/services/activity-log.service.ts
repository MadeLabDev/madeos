import { prisma } from "@/lib/prisma";

import type { ActivityLogEntry, ActivityLogInput } from "../types/activity-log.types";

/**
 * Log a user activity
 */
export async function logActivity(input: ActivityLogInput): Promise<ActivityLogEntry> {
	return prisma.activityLog.create({
		data: {
			userId: input.userId,
			action: input.action,
			value: input.value || (input.details ? JSON.stringify(input.details) : ""),
			entity: input.entity,
			entityId: input.entityId,
			details: input.details ? JSON.stringify(input.details) : null,
			ipAddress: input.ipAddress,
			userAgent: input.userAgent,
		},
	});
}

/**
 * Get activity logs for a user
 */
export async function getUserActivityLogs(userId: string, limit = 50): Promise<ActivityLogEntry[]> {
	return prisma.activityLog.findMany({
		where: { userId },
		orderBy: { createdAt: "desc" },
		take: limit,
	});
}

/**
 * Get activity logs for an entity
 */
export async function getEntityActivityLogs(entity: string, entityId: string): Promise<ActivityLogEntry[]> {
	return prisma.activityLog.findMany({
		where: { entity, entityId },
		orderBy: { createdAt: "desc" },
		take: 50,
	});
}

/**
 * Get all activity logs with pagination and filters
 */
export async function getAllActivityLogs(
	params: {
		page?: number;
		pageSize?: number;
		userId?: string;
		entity?: string;
		action?: string;
		startDate?: Date;
		endDate?: Date;
	} = {},
): Promise<{ logs: ActivityLogEntry[]; total: number }> {
	const { page = 1, pageSize = 50, userId, entity, action, startDate, endDate } = params;
	const skip = (page - 1) * pageSize;

	const where: any = {};

	if (userId) where.userId = userId;
	if (entity) where.entity = entity;
	if (action) where.action = action;

	if (startDate || endDate) {
		where.createdAt = {};
		if (startDate) where.createdAt.gte = startDate;
		if (endDate) where.createdAt.lte = endDate;
	}

	const [logs, total] = await Promise.all([
		prisma.activityLog.findMany({
			where,
			orderBy: { createdAt: "desc" },
			skip,
			take: pageSize,
		}),
		prisma.activityLog.count({ where }),
	]);

	return { logs, total };
}

/**
 * Clear old activity logs (older than X days)
 */
export async function clearOldActivityLogs(daysOld: number = 30): Promise<{ count: number }> {
	const cutoffDate = new Date();
	cutoffDate.setDate(cutoffDate.getDate() - daysOld);

	const result = await prisma.activityLog.deleteMany({
		where: {
			createdAt: {
				lt: cutoffDate,
			},
		},
	});

	return { count: result.count };
}

/**
 * Common activity actions
 */
export enum ActivityActions {
	USER_CREATED = "user.created",
	USER_UPDATED = "user.updated",
	USER_DELETED = "user.deleted",
	USER_ACTIVATED = "user.activated",
	USER_DEACTIVATED = "user.deactivated",
	ROLE_ASSIGNED = "role.assigned",
	ROLE_REMOVED = "role.removed",
	PERMISSION_GRANTED = "permission.granted",
	PERMISSION_REVOKED = "permission.revoked",
	ORDER_CREATED = "order.created",
	ORDER_UPDATED = "order.updated",
	ORDER_DELETED = "order.deleted",
	ORDER_STATUS_CHANGED = "order.status_changed",
	CUSTOMER_CREATED = "customer.created",
	CUSTOMER_UPDATED = "customer.updated",
	CUSTOMER_DELETED = "customer.deleted",
	LOGIN_SUCCESS = "login.success",
	LOGIN_FAILED = "login.failed",
	LOGOUT = "logout",
	PASSWORD_CHANGED = "password.changed",
	PASSWORD_RESET = "password.reset",
}
