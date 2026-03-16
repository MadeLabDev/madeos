/**
 * AI Chat Repository - Database Operations
 */

import { prisma } from "@/lib/prisma";

// ============================================================================
// CHAT SESSION OPERATIONS
// ============================================================================

export async function getChatSessions(userId: string) {
	return prisma.chatSession.findMany({
		where: { userId },
		orderBy: { updatedAt: "desc" },
		select: {
			id: true,
			title: true,
			createdAt: true,
			updatedAt: true,
		},
	});
}

export async function getChatSessionById(sessionId: string) {
	return prisma.chatSession.findUnique({
		where: { id: sessionId },
		select: {
			id: true,
			title: true,
			userId: true,
			createdAt: true,
			updatedAt: true,
		},
	});
}

export async function createChatSession(userId: string) {
	return prisma.chatSession.create({
		data: { userId },
		select: {
			id: true,
			title: true,
			createdAt: true,
			updatedAt: true,
		},
	});
}

export async function updateChatSessionTitle(sessionId: string, title: string) {
	return prisma.chatSession.update({
		where: { id: sessionId },
		data: { title },
	});
}

export async function updateChatSessionUpdatedAt(sessionId: string) {
	return prisma.chatSession.update({
		where: { id: sessionId },
		data: { updatedAt: new Date() },
	});
}

export async function deleteChatSession(sessionId: string) {
	return prisma.chatSession.delete({
		where: { id: sessionId },
	});
}

// ============================================================================
// CHAT MESSAGE OPERATIONS
// ============================================================================

export async function getChatMessages(sessionId: string) {
	return prisma.chatMessage.findMany({
		where: { sessionId },
		orderBy: { createdAt: "asc" },
		select: {
			id: true,
			sessionId: true,
			role: true,
			content: true,
			createdAt: true,
		},
	}) as Promise<
		Array<{
			id: string;
			sessionId: string;
			role: "user" | "assistant";
			content: string;
			createdAt: Date;
		}>
	>;
}

export async function createChatMessage(data: { sessionId: string; role: "user" | "assistant"; content: string }) {
	return prisma.chatMessage.create({
		data,
		select: {
			id: true,
			role: true,
			content: true,
			createdAt: true,
		},
	});
}

export async function getMessageCount(sessionId: string) {
	return prisma.chatMessage.count({
		where: { sessionId },
	});
}
