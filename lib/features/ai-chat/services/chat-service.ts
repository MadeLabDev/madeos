/**
 * AI Chat Service - Business Logic
 */

import * as chatRepository from "@/lib/features/ai-chat/repositories/chat-repository";
import type { SendMessageInput } from "@/lib/features/ai-chat/types/chat.types";
import { VectorSearchRepository } from "@/lib/features/vector-search/repositories";
import { generateEmbedding } from "@/lib/features/vector-search/services";
import { getLogger } from "@/lib/utils/logger";
import { calculateSimilarity } from "@/lib/utils/similarity";

const logger = getLogger("chat-service");

/**
 * Extract plain text from Lexical editor JSON format
 * Handles knowledge content that's stored as JSON structure
 */
function extractPlainText(content: string): string {
	try {
		// Try to parse as JSON (Lexical format)
		const parsed = JSON.parse(content);
		const texts: string[] = [];

		function extractFromNode(node: any) {
			if (!node) return;

			// If it's a text node, get the text
			if (node.type === "text" && node.text) {
				texts.push(node.text);
			}

			// Recursively process children
			if (node.children && Array.isArray(node.children)) {
				for (const child of node.children) {
					extractFromNode(child);
				}
			}

			// If it's an object with children property at root level
			if (node.root && node.root.children) {
				for (const child of node.root.children) {
					extractFromNode(child);
				}
			}
		}

		// Start extraction
		extractFromNode(parsed);

		return texts.join(" ");
	} catch {
		// If not JSON, return as-is
		return content;
	}
}

// ============================================================================
// CHAT SERVICE
// ============================================================================

export async function getChatSessions(userId: string) {
	return chatRepository.getChatSessions(userId);
}

export async function createChatSession(userId: string) {
	return chatRepository.createChatSession(userId);
}

export async function deleteChatSession(sessionId: string, userId: string) {
	// Verify ownership
	const session = await chatRepository.getChatSessionById(sessionId);
	if (!session || session.userId !== userId) {
		throw new Error("Chat session not found");
	}

	return chatRepository.deleteChatSession(sessionId);
}

export async function getChatMessages(sessionId: string, userId: string) {
	// Verify ownership
	const session = await chatRepository.getChatSessionById(sessionId);
	if (!session || session.userId !== userId) {
		throw new Error("Chat session not found");
	}

	return chatRepository.getChatMessages(sessionId);
}

export async function sendChatMessage(sessionId: string, userId: string, data: SendMessageInput) {
	// Verify ownership
	const session = await chatRepository.getChatSessionById(sessionId);
	if (!session || session.userId !== userId) {
		throw new Error("Chat session not found");
	}

	if (!data.content?.trim()) {
		throw new Error("Message content is required");
	}

	// Save user message
	await chatRepository.createChatMessage({
		sessionId,
		role: "user",
		content: data.content.trim(),
	});

	// Generate AI response with RAG context
	const aiResponse = await generateAIResponse(data.content.trim(), userId);

	// Save AI message
	await chatRepository.createChatMessage({
		sessionId,
		role: "assistant",
		content: aiResponse,
	});

	// Update session title if it's the first message
	const messageCount = await chatRepository.getMessageCount(sessionId);
	if (messageCount === 2) {
		// User message + AI response
		const title = data.content.trim().slice(0, 50) + (data.content.length > 50 ? "..." : "");
		await chatRepository.updateChatSessionTitle(sessionId, title);
	}

	// Update session updatedAt
	await chatRepository.updateChatSessionUpdatedAt(sessionId);

	return chatRepository.getChatMessages(sessionId);
}

/**
 * Generate AI response using vector search for context
 * Searches knowledge base for relevant information
 */
async function generateAIResponse(userMessage: string, userId: string): Promise<string> {
	try {
		// Try to generate embedding for the user message
		const embeddingResult = await generateEmbedding(userMessage);

		if (!embeddingResult.success || !embeddingResult.embedding) {
			logger.warn("Failed to generate embedding for user message", {
				error: embeddingResult.error,
			});
			// Fallback to simple response if embedding fails
			return getFallbackResponse(userMessage);
		}

		// Search for similar vectors in knowledge base
		const searchStartTime = Date.now();
		const queryEmbedding = embeddingResult.embedding;
		const vectors = await VectorSearchRepository.findSimilarVectors(JSON.parse(queryEmbedding) as number[], {
			topK: 3,
			minSimilarity: 0.5,
			sourceModule: "knowledge", // Focus on knowledge base
		});

		const searchTimeMs = Date.now() - searchStartTime;

		// Log the search
		const resultKnowledgeIds = vectors
			.filter((v) => v.knowledgeId)
			.map((v) => v.knowledgeId)
			.filter(Boolean);

		const similarityScores = vectors.map((v) => {
			const similarity = calculateSimilarity(queryEmbedding, v.embedding || "");
			return similarity;
		});

		await VectorSearchRepository.createSearchLog({
			query: userMessage,
			topK: 3,
			minSimilarity: 0.5,
			resultKnowledgeIds: resultKnowledgeIds.length > 0 ? JSON.stringify(resultKnowledgeIds) : undefined,
			similarityScores: similarityScores.length > 0 ? JSON.stringify(similarityScores) : undefined,
			responseTimeMs: searchTimeMs,
			modelUsed: embeddingResult.model ?? "unknown",
			status: vectors.length > 0 ? "success" : "no_results",
			userId: userId ?? undefined,
		});

		logger.debug("Vector search completed", {
			query: userMessage,
			resultsFound: vectors.length,
			responseTimeMs: searchTimeMs,
			avgSimilarity: vectors.length > 0 ? (similarityScores.reduce((a, b) => a + b, 0) / similarityScores.length).toFixed(3) : 0,
		});

		// Build context from found vectors
		if (vectors.length > 0) {
			// Extract plain text from Lexical JSON if needed
			const rawContext = vectors.map((v) => v.content).join("\n\n");
			const cleanContext = extractPlainText(rawContext);
			return buildContextualResponse(userMessage, cleanContext);
		}

		// No vectors found, return generic response
		return getFallbackResponse(userMessage);
	} catch (error) {
		logger.error("Error in generateAIResponse", {
			error: error instanceof Error ? error.message : "Unknown error",
			userMessage,
		});
		return getFallbackResponse(userMessage);
	}
}

/**
 * Build a response using knowledge context
 */
function buildContextualResponse(userMessage: string, context: string): string {
	// Clean up context - remove excessive line breaks, trim, limit length
	const cleanContext = context.replace(/\s+/g, " ").slice(0, 300).trim();

	if (!cleanContext) {
		return getFallbackResponse(userMessage);
	}

	const responses = [`Based on your knowledge base: ${cleanContext}`, `I found relevant information about your question: ${cleanContext}`, `Here's what I found in your system: ${cleanContext}`, `From your documentation: ${cleanContext}`];

	return responses[Math.floor(Math.random() * responses.length)] || cleanContext;
}

/**
 * Fallback response when no context is found
 */
function getFallbackResponse(userMessage: string): string {
	const responses = [`I don't have specific information about "${userMessage.slice(0, 50)}" in the knowledge base yet. Would you like to add this information to the system?`, `That's a great question about "${userMessage.slice(0, 50)}". Unfortunately, I don't have matching documentation. Can we create some documentation for this topic?`, `I'm not finding specific information about "${userMessage.slice(0, 50)}" right now. What specific information would be helpful?`, `Regarding "${userMessage.slice(0, 50)}", I don't have that in my current knowledge base. Let me help you find the answer or create documentation for this.`];

	return responses[Math.floor(Math.random() * responses.length)] || `I don't have information about "${userMessage.slice(0, 50)}" yet.`;
}
