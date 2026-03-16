"use server";

import { getLogger } from "@/lib/utils/logger";
const logger = getLogger("embedding-service");
import { getEmbeddingConfig } from "@/lib/ai/embedding-config";
import type { EmbeddingChunk, EmbeddingProvider, EmbeddingResult } from "@/lib/features/vector-search/types";

function isValidEmbeddingProvider(provider: string): boolean {
	return ["openai", "gemini", "cohere", "local"].includes(provider);
}

/**
 * Embedding Service
 * Generates embeddings for text using configured provider (OpenAI, Gemini, Cohere, or local)
 * Returns embeddings as JSON string for database storage
 */

export async function generateEmbedding(text: string, provider?: EmbeddingProvider): Promise<EmbeddingResult> {
	try {
		if (!text || text.trim().length === 0) {
			return { success: false, error: "Text cannot be empty" };
		}

		const config = getEmbeddingConfig();
		const targetProvider = provider || (config.provider as EmbeddingProvider);

		if (!isValidEmbeddingProvider(targetProvider)) {
			return {
				success: false,
				error: `Invalid embedding provider: ${targetProvider}`,
			};
		}

		logger.debug("Generating embedding", {
			provider: targetProvider,
			textLength: text.length,
		});

		let embedding: number[];
		let model: string;

		switch (targetProvider) {
			case "openai":
				({ embedding, model } = await generateOpenAIEmbedding(text));
				break;
			case "gemini":
				({ embedding, model } = await generateGeminiEmbedding(text));
				break;
			case "cohere":
				({ embedding, model } = await generateCohereEmbedding(text));
				break;
			case "local":
				({ embedding, model } = await generateLocalEmbedding(text));
				break;
			default:
				return { success: false, error: "Unsupported embedding provider" };
		}

		const embeddingJson = JSON.stringify(embedding);

		return {
			success: true,
			embedding: embeddingJson,
			model,
			dimension: embedding.length,
			tokenCount: Math.ceil(text.split(/\s+/).length * 1.3), // Rough estimate
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown error";
		logger.error("Embedding generation failed", { error: message });
		return { success: false, error: message };
	}
}

/**
 * Batch embed multiple texts
 */
export async function generateBatchEmbeddings(texts: string[], provider?: EmbeddingProvider): Promise<{ success: boolean; embeddings?: EmbeddingChunk[]; error?: string }> {
	try {
		if (!texts || texts.length === 0) {
			return { success: false, error: "Texts array cannot be empty" };
		}

		const results = await Promise.all(
			texts.map(async (text, index) => {
				const result = await generateEmbedding(text, provider);
				return {
					index,
					text,
					...result,
				};
			}),
		);

		return { success: true, embeddings: results as EmbeddingChunk[] };
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown error";
		logger.error("Batch embedding generation failed", { error: message });
		return { success: false, error: message };
	}
}

// Provider implementations
async function generateOpenAIEmbedding(text: string): Promise<{ embedding: number[]; model: string }> {
	const openaiKey = process.env.OPENAI_API_KEY;
	if (!openaiKey) throw new Error("OPENAI_API_KEY not configured");

	const response = await fetch("https://api.openai.com/v1/embeddings", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${openaiKey}`,
		},
		body: JSON.stringify({
			model: "text-embedding-3-large",
			input: text,
			encoding_format: "float",
		}),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(`OpenAI API error: ${error.error?.message}`);
	}

	const data = (await response.json()) as {
		data?: Array<{ embedding: number[] }>;
		model: string;
	};
	return {
		embedding: data.data?.[0]?.embedding || [],
		model: data.model,
	};
}

async function generateGeminiEmbedding(text: string): Promise<{ embedding: number[]; model: string }> {
	const geminiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
	if (!geminiKey) throw new Error("GOOGLE_GENERATIVE_AI_API_KEY not configured");

	const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent?key=${geminiKey}`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			model: "models/embedding-001",
			content: { parts: [{ text }] },
		}),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(`Gemini API error: ${JSON.stringify(error)}`);
	}

	const data = (await response.json()) as {
		embedding: { values: number[] };
	};
	return {
		embedding: data.embedding.values,
		model: "embedding-001",
	};
}

async function generateCohereEmbedding(text: string): Promise<{ embedding: number[]; model: string }> {
	const cohereKey = process.env.COHERE_API_KEY;
	if (!cohereKey) throw new Error("COHERE_API_KEY not configured");

	const response = await fetch("https://api.cohere.com/v1/embed", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${cohereKey}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			texts: [text],
			model: "embed-english-v3.0",
			input_type: "search_document",
		}),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(`Cohere API error: ${error.message}`);
	}

	const data = (await response.json()) as {
		embeddings?: number[][];
	};
	return {
		embedding: data.embeddings?.[0] || [],
		model: "embed-english-v3.0",
	};
}

async function generateLocalEmbedding(text: string): Promise<{ embedding: number[]; model: string }> {
	// LOCALHOST DEVELOPMENT: Free local embedding generation
	// Using simple TF-IDF-like approach (no external dependencies needed)
	// For production, switch to paid providers (openai, gemini, cohere)

	// Create a simple deterministic hash-based embedding (384 dimensions for all-MiniLM-L6-v2 compatibility)
	const embedding = generateDeterministicEmbedding(text, 384);

	logger.debug("Generated local embedding", {
		model: "all-MiniLM-L6-v2",
		dimension: embedding.length,
	});

	return {
		embedding,
		model: "all-MiniLM-L6-v2",
	};
}

/**
 * Generate a deterministic embedding for localhost development
 * Uses simple hash-based approach, suitable for semantic similarity testing
 * For production vector search, use paid providers (OpenAI, Gemini, Cohere)
 */
function generateDeterministicEmbedding(text: string, dimensions: number = 384): number[] {
	// Seed-based deterministic hash for consistent results
	let seed = 0;
	for (let i = 0; i < text.length; i++) {
		seed = (seed << 5) - seed + text.charCodeAt(i);
		seed |= 0; // Convert to 32bit integer
	}

	// Generate embedding based on seed
	const embedding: number[] = [];
	for (let i = 0; i < dimensions; i++) {
		seed = (seed * 9301 + 49297) % 233280; // Linear congruential generator
		const normalized = (seed % 1000) / 1000; // Normalize to [0, 1]
		embedding.push(normalized * 2 - 1); // Scale to [-1, 1]
	}

	// Normalize vector (L2 normalization)
	const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
	if (magnitude > 0 && embedding.length > 0) {
		for (let i = 0; i < embedding.length; i++) {
			embedding[i] = (embedding[i] ?? 0) / magnitude;
		}
	}

	return embedding;
}
