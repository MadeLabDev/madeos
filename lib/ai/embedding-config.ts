/**
 * Embedding Configuration - Enterprise RAG Grade
 *
 * Premium embedding models for production RAG:
 * - OpenAI text-embedding-3-large (PRIMARY - 3072 dims, best quality)
 * - Google Gemini embeddings (SECONDARY - 1408 dims, competitive)
 * - Cohere embeddings (RERANKING - for advanced filtering)
 *
 * All models require valid API keys
 * EmbeddingCache optimizes costs through deduplication
 * Feature-flagged: Only used when Settings.rag_enabled = true
 */

export enum EmbeddingProvider {
	OPENAI = "openai", // PRIMARY: text-embedding-3-large, 3072 dims
	GEMINI = "gemini", // SECONDARY: Gemini embeddings, 1408 dims
	COHERE = "cohere", // RERANKING: For advanced filtering, 1024 dims
}

export interface EmbeddingConfig {
	provider: EmbeddingProvider;
	model: string;
	dimensions: number;
	maxTokens: number;
	batchSize: number;
	normalizationScale?: number; // For cosine similarity
	apiKey?: string;
}

// OpenAI text-embedding-3-large (PRIMARY RECOMMENDATION)
// - 3072 dimensions (highest quality)
// - Cost: $0.13/1M input tokens (very competitive for quality)
// - Excellent for semantic search
// - Use with pgvector for efficient similarity
export const openaiLargeEmbeddingConfig: EmbeddingConfig = {
	provider: EmbeddingProvider.OPENAI,
	model: "text-embedding-3-large",
	dimensions: 3072,
	maxTokens: 8191,
	batchSize: 100,
	normalizationScale: 1.0,
	apiKey: process.env.OPENAI_API_KEY,
};

// Google Gemini Embeddings (SECONDARY - GOOD VALUE)
// - 1408 dimensions
// - Multilingual support
// - Competitive pricing
// - Fast response times
export const geminiEmbeddingConfig: EmbeddingConfig = {
	provider: EmbeddingProvider.GEMINI,
	model: "embedding-001",
	dimensions: 1408,
	maxTokens: 2048,
	batchSize: 50,
	normalizationScale: 1.0,
	apiKey: process.env.GOOGLE_GEMINI_API_KEY,
};

// Cohere Embeddings (RERANKING & ADVANCED FILTERING)
// - 1024 dimensions (efficient)
// - Native support for semantic search
// - Built-in reranking capability
// - Excellent for multi-lingual use cases
export const cohereEmbeddingConfig: EmbeddingConfig = {
	provider: EmbeddingProvider.COHERE,
	model: "embed-english-v3.0",
	dimensions: 1024,
	maxTokens: 512,
	batchSize: 100,
	normalizationScale: 1.0,
	apiKey: process.env.COHERE_API_KEY,
};

// Search-only mode (no embeddings, uses text search only)
export const searchOnlyEmbeddingConfig: EmbeddingConfig = {
	provider: EmbeddingProvider.OPENAI,
	model: "none",
	dimensions: 0,
	maxTokens: 0,
	batchSize: 0,
};

// Get active embedding config based on configured provider
// LOCALHOST STRATEGY:
// - Default: LOCAL (free) for development (EMBEDDING_PROVIDER="local")
// - Production: Switch to paid providers (OpenAI, Gemini, Cohere) via EMBEDDING_PROVIDER env var
// - No automatic fallback - explicit provider selection only
export function getEmbeddingConfig(): EmbeddingConfig {
	const provider = process.env.EMBEDDING_PROVIDER?.toLowerCase() || "local";

	// LOCALHOST: Use free local embeddings by default
	if (provider === "local") {
		return {
			provider: "local" as EmbeddingProvider, // Use "local" for local embeddings
			model: process.env.EMBEDDING_MODEL || "all-MiniLM-L6-v2",
			dimensions: 384, // all-MiniLM-L6-v2 uses 384 dimensions
			maxTokens: 512,
			batchSize: 100,
			normalizationScale: 1.0,
		} as EmbeddingConfig;
	}

	// PRODUCTION: Use explicitly configured paid provider
	if (provider === "openai") {
		if (!process.env.OPENAI_API_KEY) {
			throw new Error("OPENAI_API_KEY not set. Set EMBEDDING_PROVIDER=local for localhost or configure OPENAI_API_KEY for production.");
		}
		return openaiLargeEmbeddingConfig;
	}

	if (provider === "gemini") {
		if (!process.env.GOOGLE_GEMINI_API_KEY) {
			throw new Error("GOOGLE_GEMINI_API_KEY not set. Set EMBEDDING_PROVIDER=local for localhost or configure GOOGLE_GEMINI_API_KEY for production.");
		}
		return geminiEmbeddingConfig;
	}

	if (provider === "cohere") {
		if (!process.env.COHERE_API_KEY) {
			throw new Error("COHERE_API_KEY not set. Set EMBEDDING_PROVIDER=local for localhost or configure COHERE_API_KEY for production.");
		}
		return cohereEmbeddingConfig;
	}

	throw new Error(`Invalid EMBEDDING_PROVIDER: ${provider}. Use: local, openai, gemini, or cohere.`);
}

// Get embedding cost estimation
export function estimateEmbeddingCost(inputTokens: number): number {
	const config = getEmbeddingConfig();

	switch (config.provider) {
		case EmbeddingProvider.OPENAI:
			// OpenAI: $0.13/1M input tokens (text-embedding-3-large)
			return (inputTokens / 1000000) * 0.13;

		case EmbeddingProvider.GEMINI:
			// Gemini: Free tier includes embeddings
			return 0;

		case EmbeddingProvider.COHERE:
			// Cohere: $0.10/1M input tokens
			return (inputTokens / 1000000) * 0.1;

		default:
			return 0;
	}
}

// Validate embedding configuration
export function validateEmbeddingConfig(): { valid: boolean; errors: string[] } {
	const errors: string[] = [];
	const config = getEmbeddingConfig();

	// Check that at least one API key is set (unless search-only)
	const hasAnyApiKey = process.env.OPENAI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY || process.env.COHERE_API_KEY;

	if (!hasAnyApiKey && config.dimensions > 0) {
		errors.push("At least one embedding API key required: OPENAI_API_KEY, GOOGLE_GEMINI_API_KEY, or COHERE_API_KEY");
	}

	// Validate dimensions
	if (config.dimensions < 0 || config.dimensions > 4000) {
		errors.push(`Embedding dimensions must be 0-4000, got ${config.dimensions}`);
	}

	// Validate batch size
	if (config.batchSize < 1 || config.batchSize > 1000) {
		errors.push(`Batch size must be 1-1000, got ${config.batchSize}`);
	}

	// Provider-specific checks
	if (config.provider === EmbeddingProvider.OPENAI && !process.env.OPENAI_API_KEY) {
		errors.push("OPENAI_API_KEY required for text-embedding-3-large");
	}

	if (config.provider === EmbeddingProvider.GEMINI && !process.env.GOOGLE_GEMINI_API_KEY) {
		errors.push("GOOGLE_GEMINI_API_KEY required for Gemini embeddings");
	}

	if (config.provider === EmbeddingProvider.COHERE && !process.env.COHERE_API_KEY) {
		errors.push("COHERE_API_KEY required for Cohere embeddings");
	}

	return {
		valid: errors.length === 0,
		errors,
	};
}
