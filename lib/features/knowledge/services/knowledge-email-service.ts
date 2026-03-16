import { emailService } from "@/lib/email/service";
import { prisma } from "@/lib/prisma";

import { knowledgeEmailLogRepository } from "../repositories/knowledge-email-log-repository";

export interface EmailSendResult {
	userId: string;
	email: string;
	name: string | null;
	sent: boolean;
	reason?: string; // "already_sent" | "error" | "success"
}

export class KnowledgeEmailService {
	/**
	 * Send emails to assigned users
	 * Only sends to users who haven't received email for this article yet
	 */
	async sendAssignmentEmails(knowledgeId: string, userIds: string[], courseLink: string, triggeredBy?: string): Promise<EmailSendResult[]> {
		const results: EmailSendResult[] = [];

		// Fetch user details
		const users = await prisma.user.findMany({
			where: {
				id: { in: userIds },
			},
			select: {
				id: true,
				email: true,
				name: true,
			},
		});

		// Get article details for email
		const knowledge = await prisma.knowledge.findUnique({
			where: { id: knowledgeId },
			select: { title: true },
		});

		if (!knowledge) {
			throw new Error("Knowledge article not found");
		}

		// Send emails
		for (const user of users) {
			try {
				// Check if email already sent
				const alreadySent = await knowledgeEmailLogRepository.emailExists(knowledgeId, user.id);

				if (alreadySent) {
					results.push({
						userId: user.id,
						email: user.email,
						name: user.name,
						sent: false,
						reason: "already_sent",
					});
					continue;
				}

				// Send email (match the emailService signature)
				await emailService.sendKnowledgeAssignmentEmail(user.email, user.name || user.email, knowledge.title, courseLink);

				// Log email sent
				await knowledgeEmailLogRepository.create({
					knowledgeId,
					recipientId: user.id,
					recipient_email: user.email,
					subject: `New article available: ${knowledge.title}`,
					type: "assignment",
					triggeredBy: triggeredBy || "system",
				});

				results.push({
					userId: user.id,
					email: user.email,
					name: user.name,
					sent: true,
					reason: "success",
				});
			} catch (error) {
				console.error(`Failed to send email to ${user.email}:`, error);
				results.push({
					userId: user.id,
					email: user.email,
					name: user.name,
					sent: false,
					reason: "error",
				});
			}
		}

		return results;
	}

	/**
	 * Send emails to users in assigned groups
	 * Only sends to users who haven't received email for this article yet
	 */
	async sendGroupAssignmentEmails(knowledgeId: string, groupIds: string[], courseLink: string, triggeredBy?: string): Promise<EmailSendResult[]> {
		// Get all users in these groups
		const groupMembers = await prisma.userGroupMember.findMany({
			where: {
				groupId: { in: groupIds },
			},
			select: {
				userId: true,
			},
		});

		const userIds = [...new Set(groupMembers.map((m) => m.userId))];

		// Send to all users in groups
		return this.sendAssignmentEmails(knowledgeId, userIds, courseLink, triggeredBy);
	}

	/**
	 * Get recently sent emails for an article
	 */
	async getRecentlysentEmails(knowledgeId: string, hoursBack: number = 24) {
		return knowledgeEmailLogRepository.getRecentlySent(knowledgeId, hoursBack);
	}

	/**
	 * Get email history for an article
	 */
	async getEmailHistory(knowledgeId: string, limit?: number) {
		return knowledgeEmailLogRepository.getByKnowledgeId(knowledgeId, limit);
	}
}

export const knowledgeEmailService = new KnowledgeEmailService();
