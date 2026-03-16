"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import * as chatService from "@/lib/features/ai-chat/services/chat-service";
import type { ChatMessage, ChatSession } from "@/lib/features/ai-chat/types/chat.types";
import type { ActionResult } from "@/lib/types";

// ============================================================================
// CHAT SESSION ACTIONS
// ============================================================================

export async function getChatSessionsAction(): Promise<ActionResult<ChatSession[]>> {
	try {
		// Check RAG feature flag
		// const ragEnabled = await isRagEnabled();
		// if (!ragEnabled) {
		// 	return {
		// 		success: false,
		// 		message: "AI Chat feature is not enabled",
		// 	};
		// }

		// Note: Permission check might be added later based on requirements
		// await requirePermission("ai-chat", "read");

		const session = await auth();
		if (!session?.user?.id) {
			return {
				success: false,
				message: "Authentication required",
			};
		}

		const sessions = await chatService.getChatSessions(session.user.id);

		return {
			success: true,
			message: "Chat sessions retrieved successfully",
			data: sessions,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to retrieve chat sessions",
		};
	}
}

export async function createChatSessionAction(): Promise<ActionResult<ChatSession>> {
	try {
		// Check RAG feature flag
		// const ragEnabled = await isRagEnabled();
		// if (!ragEnabled) {
		// 	return {
		// 		success: false,
		// 		message: "AI Chat feature is not enabled",
		// 	};
		// }

		const session = await auth();
		if (!session?.user?.id) {
			return {
				success: false,
				message: "Authentication required",
			};
		}

		// Verify user exists in database
		const { prisma } = await import("@/lib/prisma");
		const userExists = await prisma.user.findUnique({
			where: { id: session.user.id },
			select: { id: true },
		});

		if (!userExists) {
			return {
				success: false,
				message: "User session is invalid. Please log out and log back in.",
			};
		}

		const newSession = await chatService.createChatSession(session.user.id);

		revalidatePath("/ai-chat");

		return {
			success: true,
			message: "Chat session created successfully",
			data: newSession,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to create chat session",
		};
	}
}

export async function deleteChatSessionAction(sessionId: string): Promise<ActionResult> {
	try {
		// Check RAG feature flag
		// const ragEnabled = await isRagEnabled();
		// if (!ragEnabled) {
		// 	return {
		// 		success: false,
		// 		message: "AI Chat feature is not enabled",
		// 	};
		// }

		const session = await auth();
		if (!session?.user?.id) {
			return {
				success: false,
				message: "Authentication required",
			};
		}

		await chatService.deleteChatSession(sessionId, session.user.id);

		revalidatePath("/ai-chat");

		return {
			success: true,
			message: "Chat session deleted successfully",
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to delete chat session",
		};
	}
}

// ============================================================================
// CHAT MESSAGE ACTIONS
// ============================================================================

export async function getChatMessagesAction(sessionId: string): Promise<ActionResult<ChatMessage[]>> {
	try {
		// Check RAG feature flag
		// const ragEnabled = await isRagEnabled();
		// if (!ragEnabled) {
		// 	return {
		// 		success: false,
		// 		message: "AI Chat feature is not enabled",
		// 	};
		// }

		const session = await auth();
		if (!session?.user?.id) {
			return {
				success: false,
				message: "Authentication required",
			};
		}

		const messages = await chatService.getChatMessages(sessionId, session.user.id);

		return {
			success: true,
			message: "Chat messages retrieved successfully",
			data: messages,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to retrieve chat messages",
		};
	}
}

export async function sendChatMessageAction(sessionId: string, content: string): Promise<ActionResult<ChatMessage[]>> {
	try {
		// Check RAG feature flag
		// const ragEnabled = await isRagEnabled();
		// if (!ragEnabled) {
		// 	return {
		// 		success: false,
		// 		message: "AI Chat feature is not enabled",
		// 	};
		// }

		const session = await auth();
		if (!session?.user?.id) {
			return {
				success: false,
				message: "Authentication required",
			};
		}

		if (!content?.trim()) {
			return {
				success: false,
				message: "Message content is required",
			};
		}

		const messages = await chatService.sendChatMessage(sessionId, session.user.id, { content: content.trim() });

		revalidatePath("/ai-chat");

		return {
			success: true,
			message: "Message sent successfully",
			data: messages,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to send message",
		};
	}
}
