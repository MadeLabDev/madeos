"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { emailService } from "@/lib/email/service";
import { prisma } from "@/lib/prisma";

import { knowledgeEmailLogRepository } from "../repositories/knowledge-email-log-repository";
import { type EmailSendResult, KnowledgeEmailService } from "../services/knowledge-email-service";

const knowledgeEmailService = new KnowledgeEmailService();

export interface AssignKnowledgeResult {
	success: boolean;
	message: string;
	assignedUsers?: {
		userId: string;
		email: string;
	}[];
	emailResults?: EmailSendResult[];
	errors?: string[];
}

/**
 * Assign knowledge article to users and send emails
 */
export async function assignKnowledgeToUsers(knowledgeId: string, userIds: string[]): Promise<AssignKnowledgeResult> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { success: false, message: "Not authenticated" };
		}

		if (!knowledgeId || userIds.length === 0) {
			return { success: false, message: "Knowledge ID and user IDs are required" };
		}

		// Verify knowledge exists
		const knowledge = await prisma.knowledge.findUnique({
			where: { id: knowledgeId },
			select: { id: true, title: true, slug: true },
		});

		if (!knowledge) {
			return { success: false, message: "Knowledge article not found" };
		}

		// Assign to users
		const assignmentResults = [];
		for (const userId of userIds) {
			try {
				await prisma.knowledgeAssignedUser.upsert({
					where: { knowledgeId_userId: { knowledgeId, userId } },
					update: {},
					create: {
						knowledgeId,
						userId,
						assignedBy: session.user.id,
					},
				});
				const user = await prisma.user.findUnique({
					where: { id: userId },
					select: { id: true, email: true },
				});
				if (user) {
					assignmentResults.push({ userId: user.id, email: user.email });
				}
			} catch (error) {
				console.error(`Failed to assign to user ${userId}:`, error);
			}
		}

		// Build course link
		const courseLink = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/course/${knowledge.slug}`;

		// Send emails
		const emailResults = await knowledgeEmailService.sendAssignmentEmails(knowledgeId, userIds, courseLink, session.user.id);

		// Count results
		const sentCount = emailResults.filter((r) => r.sent).length;
		const alreadySentCount = emailResults.filter((r) => r.reason === "already_sent").length;
		const failedCount = emailResults.filter((r) => r.reason === "error").length;

		revalidatePath(`/knowledge/${knowledge.slug}`);

		return {
			success: true,
			message: `Assigned to ${assignmentResults.length} user(s). ${sentCount} email(s) sent, ${alreadySentCount} already sent, ${failedCount} failed.`,
			assignedUsers: assignmentResults,
			emailResults,
		};
	} catch (error) {
		console.error("Error assigning knowledge:", error);
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to assign knowledge",
		};
	}
}

/**
 * Assign knowledge article to user groups and send emails to all members
 */
export async function assignKnowledgeToGroups(knowledgeId: string, groupIds: string[]): Promise<AssignKnowledgeResult> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { success: false, message: "Not authenticated" };
		}

		if (!knowledgeId || groupIds.length === 0) {
			return { success: false, message: "Knowledge ID and group IDs are required" };
		}

		// Verify knowledge exists
		const knowledge = await prisma.knowledge.findUnique({
			where: { id: knowledgeId },
			select: { id: true, title: true, slug: true },
		});

		if (!knowledge) {
			return { success: false, message: "Knowledge article not found" };
		}

		// Assign to groups
		for (const groupId of groupIds) {
			try {
				await prisma.knowledgeAssignedGroup.upsert({
					where: { knowledgeId_groupId: { knowledgeId, groupId } },
					update: {},
					create: {
						knowledgeId,
						groupId,
						assignedBy: session.user.id,
					},
				});
			} catch (error) {
				console.error(`Failed to assign to group ${groupId}:`, error);
			}
		}

		// Build course link
		const courseLink = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/course/${knowledge.slug}`;

		// Send emails to all group members
		const emailResults = await knowledgeEmailService.sendGroupAssignmentEmails(knowledgeId, groupIds, courseLink, session.user.id);

		// Count results
		const sentCount = emailResults.filter((r) => r.sent).length;
		const alreadySentCount = emailResults.filter((r) => r.reason === "already_sent").length;
		const failedCount = emailResults.filter((r) => r.reason === "error").length;

		revalidatePath(`/knowledge/${knowledge.slug}`);

		return {
			success: true,
			message: `Assigned to ${groupIds.length} group(s) (${emailResults.length} member(s)). ${sentCount} email(s) sent, ${alreadySentCount} already sent, ${failedCount} failed.`,
			emailResults,
		};
	} catch (error) {
		console.error("Error assigning knowledge to groups:", error);
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to assign knowledge",
		};
	}
}

/**
 * Get recently sent emails for an article
 */
export async function getRecentlysentKnowledgeEmails(knowledgeId: string, hoursBack?: number) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { success: false, message: "Not authenticated", data: [] };
		}

		const emails = await knowledgeEmailService.getRecentlysentEmails(knowledgeId, hoursBack);

		return {
			success: true,
			message: "Emails retrieved successfully",
			data: emails,
		};
	} catch (error) {
		console.error("Error fetching recently sent emails:", error);
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to fetch emails",
			data: [],
		};
	}
}

/**
 * Resend knowledge assignment email to a specific user
 */
export async function resendKnowledgeAssignmentEmail(knowledgeId: string, userId: string): Promise<{ success: boolean; message: string; emailResult?: EmailSendResult }> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { success: false, message: "Not authenticated" };
		}

		// Verify knowledge exists
		const knowledge = await prisma.knowledge.findUnique({
			where: { id: knowledgeId },
			select: { id: true, title: true, slug: true },
		});

		if (!knowledge) {
			return { success: false, message: "Knowledge article not found" };
		}

		// Verify user exists and is assigned
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: { id: true, email: true, name: true },
		});

		if (!user) {
			return { success: false, message: "User not found" };
		}

		// Check if user is assigned to this knowledge
		const assignment = await prisma.knowledgeAssignedUser.findUnique({
			where: { knowledgeId_userId: { knowledgeId, userId } },
		});

		if (!assignment) {
			return { success: false, message: "User is not assigned to this knowledge article" };
		}

		// Build course link
		const courseLink = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/course/${knowledge.slug}`;

		// Send email (force resend)
		try {
			const emailResult = await emailService.sendKnowledgeAssignmentEmail(user.email, user.name || user.email, knowledge.title, courseLink);

			if (emailResult.success) {
				// Log email sent (create new log entry for resend)
				await knowledgeEmailLogRepository.create({
					knowledgeId,
					recipientId: user.id,
					recipient_email: user.email,
					subject: `New article available: ${knowledge.title} (Resent)`,
					type: "assignment_resend",
					triggeredBy: session.user.id,
				});

				revalidatePath(`/knowledge/${knowledge.slug}`);

				return {
					success: true,
					message: `Email resent to ${user.email}`,
					emailResult: {
						userId: user.id,
						email: user.email,
						name: user.name,
						sent: true,
						reason: "resent",
					},
				};
			} else {
				return {
					success: false,
					message: `Failed to resend email to ${user.email}`,
					emailResult: {
						userId: user.id,
						email: user.email,
						name: user.name,
						sent: false,
						reason: "error",
					},
				};
			}
		} catch (error) {
			console.error(`Failed to resend email to ${user.email}:`, error);
			return {
				success: false,
				message: `Failed to resend email to ${user.email}`,
				emailResult: {
					userId: user.id,
					email: user.email,
					name: user.name,
					sent: false,
					reason: "error",
				},
			};
		}
	} catch (error) {
		console.error("Error resending knowledge email:", error);
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to resend email",
		};
	}
}

/**
 * Assign knowledge article to users by email addresses
 */
export async function assignKnowledgeToUsersByEmails(knowledgeId: string, emails: string[]): Promise<AssignKnowledgeResult> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { success: false, message: "Not authenticated" };
		}

		if (!knowledgeId || emails.length === 0) {
			return { success: false, message: "Knowledge ID and emails are required" };
		}

		// Find users by emails
		const users = await prisma.user.findMany({
			where: {
				email: { in: emails },
			},
			select: { id: true, email: true, name: true },
		});

		if (users.length === 0) {
			return { success: false, message: "No users found with the provided email addresses" };
		}

		const userIds = users.map((u) => u.id);

		// Use existing assignKnowledgeToUsers function
		return await assignKnowledgeToUsers(knowledgeId, userIds);
	} catch (error) {
		console.error("Error assigning knowledge by emails:", error);
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to assign knowledge",
		};
	}
}
