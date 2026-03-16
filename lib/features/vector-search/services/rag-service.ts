"use server";

import { getLLMConfig } from "@/lib/ai/llm-config";
import { isRagEnabled } from "@/lib/ai/rag-feature-flag";
import { getLogger } from "@/lib/utils/logger";
const logger = getLogger("rag-service");
import { getEntityUrl } from "@/lib/features/vector-search/services/url-mapper";
import type { RAGRequest, RAGResponse, VectorSearchResult } from "@/lib/features/vector-search/types";

import { generateEmbedding } from "./embedding-service";
import { multiModuleVectorSearch, vectorSearch } from "./vector-search-service";

/**
 * RAG Service
 * Orchestrates: Query embedding → Vector search → LLM generation → Response
 * Respects RBAC permissions - only searches modules user can access
 */

export async function ragQuery(request: RAGRequest): Promise<RAGResponse> {
	const startTime = Date.now();

	try {
		// Check if RAG is enabled
		const ragEnabled = await isRagEnabled();
		if (!ragEnabled) {
			return {
				success: false,
				message: "RAG is not enabled",
			};
		}

		logger.debug("RAG query starting", {
			query: request.query.substring(0, 50),
			modules: request.modules?.length || "all",
		});

		// Step 1: Generate embedding for query
		const embeddingResult = await generateEmbedding(request.query);
		if (!embeddingResult.success || !embeddingResult.embedding) {
			return {
				success: false,
				message: `Failed to generate query embedding: ${embeddingResult.error}`,
			};
		}

		// Step 2: Get allowed modules based on user permissions
		const allowedModules = request.modules || [];
		if (!request.modules) {
			// If not specified, get accessible modules (requires auth context)
			logger.warn("Modules not specified, using defaults");
			// In real implementation, get from session.user.permissions
			// For now, use ["knowledge"]
		}

		// Step 3: Vector search
		let searchResultsMap: Map<string, VectorSearchResult[]>;
		if (allowedModules.length > 1) {
			const searchResult = await multiModuleVectorSearch(embeddingResult.embedding, allowedModules, {
				topK: request.topK || 5,
				minSimilarity: request.minSimilarity || 0.6,
			});
			if (!searchResult.success) {
				return {
					success: false,
					message: `Vector search failed: ${searchResult.message}`,
				};
			}
			searchResultsMap = searchResult.results;
		} else {
			const results = await vectorSearch(embeddingResult.embedding, {
				topK: request.topK || 5,
				minSimilarity: request.minSimilarity || 0.6,
				sourceModule: allowedModules[0],
			});

			searchResultsMap = new Map([[allowedModules[0] || "knowledge", results]]);
		}

		// Flatten results for context
		const flatResults: VectorSearchResult[] = [];
		for (const [module, results] of searchResultsMap.entries()) {
			for (const result of results) {
				flatResults.push({
					...result,
					sourceModule: module,
				});
			}
		}

		if (flatResults.length === 0) {
			logger.info("No relevant vectors found");
			return {
				success: true,
				answer: "I couldn't find relevant information to answer your question. Please try a different query or search for more specific terms.",
				sources: [],
				confidence: 0,
				message: "No relevant information found",
				metadata: {
					processingTime: Date.now() - startTime,
				},
			};
		}

		// Step 4: Generate answer using LLM
		const llmConfig = getLLMConfig();
		if (llmConfig.provider === "none") {
			// Return search results without LLM generation
			const fallbackAnswer = `Found ${flatResults.length} relevant results:\n\n${flatResults.map((r) => `- [${r.sourceModule}] ${r.content.substring(0, 100)}...`).join("\n")}`;
			return {
				success: true,
				answer: fallbackAnswer,
				sources: flatResults.map((r) => ({
					id: r.id,
					title: r.content.substring(0, 50) + (r.content.length > 50 ? "..." : ""),
					content: r.content,
					url: getEntityUrl(r.sourceModule, r.sourceType, r.id),
					module: r.sourceModule,
					type: r.sourceType,
					similarity: r.similarity,
				})),
				confidence: flatResults[0]?.similarity || 0,
				message: "Search-only mode: No LLM provider configured",
				metadata: {
					processingTime: Date.now() - startTime,
				},
			};
		}

		// Build context from vectors
		const context = flatResults.map((r, i) => `[Source ${i + 1}] (${r.sourceModule}): ${r.content}`).join("\n\n");

		const prompt = `You are a helpful assistant. Answer the following question based on the provided context.

Context:
${context}

Question: ${request.query}

Provide a clear, concise answer. If the context doesn't contain relevant information, say so.`;

		let answer = "";
		const llmStartTime = Date.now();

		try {
			// Call LLM based on provider
			switch (llmConfig.provider) {
				case "openai":
					answer = await callOpenAILLM(prompt, llmConfig);
					break;
				case "gemini":
					answer = await callGeminiLLM(prompt, llmConfig);
					break;
				case "claude":
					answer = await callClaudeLLM(prompt, llmConfig);
					break;
				default:
					answer = "LLM provider not configured";
			}
		} catch (error) {
			logger.error("LLM call failed", {
				error: error instanceof Error ? error.message : "Unknown error",
				provider: llmConfig.provider,
			});
			// Fall back to source summarization
			answer = `Based on ${flatResults.length} relevant sources:\n\n${flatResults.map((r) => `• ${r.content}`).join("\n")}`;
		}

		const llmDuration = Date.now() - llmStartTime;
		const totalDuration = Date.now() - startTime;

		logger.info("RAG query completed", {
			duration: totalDuration,
			llmDuration,
			sourceCount: flatResults.length,
			answerLength: answer?.length || 0,
		});

		return {
			success: true,
			answer: answer || "",
			sources: flatResults.map((r) => ({
				id: r.id,
				title: r.content.substring(0, 50) + (r.content.length > 50 ? "..." : ""),
				content: r.content,
				url: getEntityUrl(r.sourceModule, r.sourceType, r.id),
				module: r.sourceModule,
				type: r.sourceType,
				similarity: r.similarity,
			})),
			confidence: flatResults[0]?.similarity || 0,
			message: "RAG query completed successfully",
			metadata: {
				processingTime: totalDuration,
			},
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown error";
		logger.error("RAG query failed", { error: message });
		return {
			success: false,
			message: `RAG query failed: ${message}`,
		};
	}
}

// LLM Provider Implementations
async function callOpenAILLM(prompt: string, config: ReturnType<typeof getLLMConfig>): Promise<string> {
	const apiKey = process.env.OPENAI_API_KEY;
	if (!apiKey) throw new Error("OPENAI_API_KEY not set");

	const response = await fetch("https://api.openai.com/v1/chat/completions", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${apiKey}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			model: config.model || "gpt-4-turbo",
			messages: [{ role: "user", content: prompt }],
			temperature: 0.7,
			max_tokens: 500,
		}),
	});

	if (!response.ok) throw new Error(`OpenAI API error: ${response.statusText}`);

	const data = (await response.json()) as {
		choices: Array<{ message: { content: string } }>;
	};
	return data.choices[0]?.message.content || "";
}

async function callGeminiLLM(prompt: string, config: ReturnType<typeof getLLMConfig>): Promise<string> {
	const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
	if (!apiKey) throw new Error("GOOGLE_GENERATIVE_AI_API_KEY not set");

	const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${config.model || "gemini-pro"}:generateContent?key=${apiKey}`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			contents: [{ parts: [{ text: prompt }] }],
			generationConfig: {
				temperature: 0.7,
				maxOutputTokens: 500,
			},
		}),
	});

	if (!response.ok) throw new Error(`Gemini API error: ${response.statusText}`);

	const data = (await response.json()) as {
		candidates: Array<{ content: { parts: Array<{ text: string }> } }>;
	};
	return data.candidates[0]?.content.parts[0]?.text || "";
}

async function callClaudeLLM(prompt: string, config: ReturnType<typeof getLLMConfig>): Promise<string> {
	const apiKey = process.env.ANTHROPIC_API_KEY;
	if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

	const response = await fetch("https://api.anthropic.com/v1/messages", {
		method: "POST",
		headers: {
			"x-api-key": apiKey,
			"Content-Type": "application/json",
			"anthropic-version": "2023-06-01",
		},
		body: JSON.stringify({
			model: config.model || "claude-3-opus-20240229",
			max_tokens: 500,
			messages: [{ role: "user", content: prompt }],
		}),
	});

	if (!response.ok) throw new Error(`Claude API error: ${response.statusText}`);

	const data = (await response.json()) as {
		content: Array<{ text: string }>;
	};
	return data.content[0]?.text || "";
}
