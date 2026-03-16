import { prisma } from "@/lib/prisma";

type KnowledgeEmailLog = {
	id: string;
	knowledgeId: string;
	recipientId: string;
	subject: string;
	recipient_email: string;
	type: string;
	sentAt: Date;
	status: string;
	errorMessage?: string | null;
	triggeredBy: string;
	createdAt: Date;
	updatedAt: Date;
	knowledge?: {
		id: string;
		title: string;
		slug: string;
	};
	recipient?: {
		id: string;
		email: string;
		name: string | null;
	};
};

export class KnowledgeEmailLogRepository {
	/**
	 * Create email log entry
	 */
	async create(data: { knowledgeId: string; recipientId: string; recipient_email: string; subject: string; type?: string; triggeredBy: string }): Promise<KnowledgeEmailLog> {
		return prisma.knowledgeEmailLog.create({
			data: {
				...data,
				type: data.type || "assignment",
				status: "sent",
				sentAt: new Date(),
			},
		});
	}

	/**
	 * Get all email logs for an article
	 */
	async getByKnowledgeId(knowledgeId: string, limit?: number): Promise<KnowledgeEmailLog[]> {
		return prisma.knowledgeEmailLog.findMany({
			where: { knowledgeId },
			orderBy: { sentAt: "desc" },
			take: limit,
			include: {
				recipient: {
					select: { id: true, email: true, name: true },
				},
			},
		});
	}

	/**
	 * Check if email already sent to user for this article
	 */
	async emailExists(knowledgeId: string, recipientId: string): Promise<boolean> {
		const log = await prisma.knowledgeEmailLog.findFirst({
			where: {
				knowledgeId,
				recipientId,
				status: "sent",
			},
		});
		return !!log;
	}

	/**
	 * Get recently sent emails (last 24 hours)
	 */
	async getRecentlySent(knowledgeId: string, hoursBack: number = 24): Promise<KnowledgeEmailLog[]> {
		const since = new Date(Date.now() - hoursBack * 60 * 60 * 1000);
		return prisma.knowledgeEmailLog.findMany({
			where: {
				knowledgeId,
				sentAt: {
					gte: since,
				},
				status: "sent",
			},
			orderBy: { sentAt: "desc" },
			include: {
				recipient: {
					select: { id: true, email: true, name: true },
				},
			},
		});
	}

	/**
	 * Mark email as failed
	 */
	async markFailed(logId: string, errorMessage: string): Promise<KnowledgeEmailLog> {
		return prisma.knowledgeEmailLog.update({
			where: { id: logId },
			data: {
				status: "failed",
				errorMessage,
			},
		});
	}

	/**
	 * Get all logs for recipient
	 */
	async getByRecipientId(recipientId: string, limit: number = 50): Promise<KnowledgeEmailLog[]> {
		return prisma.knowledgeEmailLog.findMany({
			where: { recipientId },
			orderBy: { sentAt: "desc" },
			take: limit,
			include: {
				knowledge: {
					select: { id: true, title: true, slug: true },
				},
			},
		});
	}
}

export const knowledgeEmailLogRepository = new KnowledgeEmailLogRepository();
