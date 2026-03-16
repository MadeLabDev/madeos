"use server";

import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

/**
 * Get all unique form keys with count of submissions
 */
export async function getFormKeysAction(): Promise<{ success: boolean; data?: Array<{ key: string; count: number }>; message?: string }> {
	try {
		// Check permission
		await requirePermission("meta", "read");

		const keys = await prisma.externalFormData.groupBy({
			by: ["key"],
			_count: {
				id: true,
			},
			orderBy: {
				_count: {
					id: "desc",
				},
			},
		});

		return {
			success: true,
			data: keys.map((k) => ({
				key: k.key,
				count: k._count.id,
			})),
		};
	} catch (error) {
		console.error("[Form Keys Action Error]", error);
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to fetch form keys",
		};
	}
}
