"use client";

import { createContext, ReactNode, useContext, useEffect, useState } from "react";

import { createChatSessionAction, deleteChatSessionAction, getChatMessagesAction, getChatSessionsAction, sendChatMessageAction } from "@/lib/features/ai-chat/actions/chat-actions";
import type { ChatMessage, ChatSession } from "@/lib/features/ai-chat/types/chat.types";

interface ChatContextType {
	sessions: ChatSession[];
	currentSession: ChatSession | null;
	messages: ChatMessage[];
	isLoading: boolean;
	createNewSession: () => Promise<void>;
	selectSession: (sessionId: string) => void;
	sendMessage: (content: string) => Promise<void>;
	deleteSession: (sessionId: string) => Promise<void>;
	refreshSessions: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
	const [sessions, setSessions] = useState<ChatSession[]>([]);
	const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	const refreshSessions = async () => {
		try {
			const result = await getChatSessionsAction();
			if (result.success && result.data) {
				setSessions(result.data);
			}
		} catch (error) {
			console.error("Failed to refresh sessions:", error);
		}
	};

	const createNewSession = async () => {
		try {
			setIsLoading(true);
			const result = await createChatSessionAction();
			if (result.success && result.data) {
				setCurrentSession(result.data);
				setMessages([]);
				await refreshSessions();
			}
		} catch (error) {
			console.error("Failed to create session:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const selectSession = async (sessionId: string) => {
		try {
			setIsLoading(true);
			const session = sessions.find((s) => s.id === sessionId);
			if (session) {
				setCurrentSession(session);

				// Load messages for this session
				const result = await getChatMessagesAction(sessionId);
				if (result.success && result.data) {
					setMessages(result.data);
				}
			}
		} catch (error) {
			console.error("Failed to select session:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const sendMessage = async (content: string) => {
		if (!currentSession) return;

		try {
			setIsLoading(true);

			// Add user message immediately
			const userMessage: ChatMessage = {
				id: `temp-${Date.now()}`,
				sessionId: currentSession.id,
				role: "user",
				content,
				createdAt: new Date(),
			};
			setMessages((prev) => [...prev, userMessage]);

			// Send to server action
			const result = await sendChatMessageAction(currentSession.id, content);
			if (result.success && result.data) {
				// Update messages with real data
				setMessages(result.data);

				// Refresh sessions to update titles
				await refreshSessions();
			} else {
				// Remove temp message on error
				setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
			}
		} catch (error) {
			console.error("Failed to send message:", error);
			// Remove temp message on error
			setMessages((prev) => prev.filter((m) => m.id.startsWith("temp-")));
		} finally {
			setIsLoading(false);
		}
	};

	const deleteSession = async (sessionId: string) => {
		try {
			const result = await deleteChatSessionAction(sessionId);
			if (result.success) {
				if (currentSession?.id === sessionId) {
					setCurrentSession(null);
					setMessages([]);
				}
				await refreshSessions();
			}
		} catch (error) {
			console.error("Failed to delete session:", error);
		}
	};

	// Load sessions on mount
	useEffect(() => {
		refreshSessions();
	}, []);

	return (
		<ChatContext.Provider
			value={{
				sessions,
				currentSession,
				messages,
				isLoading,
				createNewSession,
				selectSession,
				sendMessage,
				deleteSession,
				refreshSessions,
			}}>
			{children}
		</ChatContext.Provider>
	);
}

export function useChat() {
	const context = useContext(ChatContext);
	if (context === undefined) {
		throw new Error("useChat must be used within a ChatProvider");
	}
	return context;
}
