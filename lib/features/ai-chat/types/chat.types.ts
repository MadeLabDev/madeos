/**
 * AI Chat Types
 */

export interface ChatSession {
	id: string;
	title: string;
	userId?: string; // Optional for responses
	createdAt: Date;
	updatedAt: Date;
}

export interface ChatMessage {
	id: string;
	sessionId: string;
	role: "user" | "assistant";
	content: string;
	createdAt: Date;
}

export interface SendMessageInput {
	content: string;
}
