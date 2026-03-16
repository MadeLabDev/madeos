/**
 * Vector Search Types - RAG Foundation
 * Complete type definitions for vector search, RAG, embedding, and indexing
 */

// Re-export shared types for convenience

// ============= EMBEDDING TYPES =============

export type EmbeddingProvider = "openai" | "gemini" | "cohere" | "local";

export interface EmbeddingResult {
	success: boolean;
	embedding?: string; // JSON string of number[]
	model?: string;
	dimension?: number;
	tokenCount?: number;
	error?: string;
}

export interface EmbeddingChunk {
	index: number;
	text: string;
	success: boolean;
	embedding?: string;
	model?: string;
	dimension?: number;
	tokenCount?: number;
	error?: string;
}

// ============= VECTOR SEARCH TYPES =============

export interface VectorSearchParams {
	topK?: number;
	minSimilarity?: number;
	sourceModule?: string;
	sourceId?: string;
	embeddingModel?: string;
}

export interface VectorSearchResult {
	id: string;
	sourceModule: string;
	sourceId: string;
	sourceType: string;
	content: string;
	similarity: number;
	chunkIndex: number;
}

// ============= RAG TYPES =============

export type LLMProvider = "openai" | "groq" | "anthropic" | "ollama" | "none";

export interface RAGQuery {
	query: string;
	context?: VectorSearchResult[];
	topK?: number;
	minSimilarity?: number;
	llmProvider?: LLMProvider;
	llmModel?: string;
	temperature?: number;
	maxTokens?: number;
	modules?: string[];
}

export type RAGRequest = RAGQuery; // Alias for backward compatibility

export interface RAGSource {
	id: string;
	title: string;
	content: string;
	url?: string;
	module: string;
	type: string;
	similarity: number;
	metadata?: Record<string, any>;
}

export interface RAGResponse {
	success: boolean;
	message?: string;
	answer?: string;
	sources?: RAGSource[];
	confidence?: number;
	tokenUsage?: {
		prompt: number;
		completion: number;
		total: number;
	};
	metadata?: {
		llmProvider?: LLMProvider;
		llmModel?: string;
		embeddingModel?: string;
		queryTime?: number;
		processingTime?: number;
	};
}

export interface RAGAnswer {
	answer: string;
	sources: VectorSearchResult[];
	confidence?: number;
	tokenUsage?: {
		prompt: number;
		completion: number;
		total: number;
	};
	metadata?: {
		llmProvider: LLMProvider;
		llmModel: string;
		embeddingModel?: string;
		queryTime: number;
	};
}

// ============= KNOWLEDGE VECTOR TYPES =============

export interface KnowledgeVector {
	id: string;
	knowledgeId: string;
	chunkIndex: number;
	content: string;
	embedding: string; // JSON string
	model: string;
	dimension: number;
	tokenCount: number;
	createdAt: Date;
	updatedAt: Date;
}

// ============= VECTOR SEARCH LOG TYPES =============

export interface VectorSearchLog {
	id: string;
	userId?: string;
	query: string;
	resultsCount: number;
	topK: number;
	minSimilarity: number;
	llmProvider?: LLMProvider;
	llmModel?: string;
	tokenUsage?: number;
	responseTime: number;
	createdAt: Date;
}

// ============= INDEXING TYPES =============

export interface IndexingParams {
	sourceModule: string;
	sourceId: string;
	content: string;
	sourceType?: string;
	chunkIndex?: number;
}

export interface IndexingResult {
	success: boolean;
	vectorId?: string;
	model?: string;
	dimension?: number;
	error?: string;
}

// ============= CROSS-FEATURE SEARCH TYPES =============

export interface CrossFeatureSearchOptions {
	modules?: string[];
	topK?: number;
	minSimilarity?: number;
	includeContent?: boolean;
}

// ============= ADDITIONAL UTILITY TYPES =============

export interface RAGSearchResult {
	results: VectorSearchResult[];
	total: number;
	queryTime: number;
}

export interface RAGAnswerResult {
	answer: RAGAnswer;
	searchResults: RAGSearchResult;
}

export interface VectorQuery {
	query: string;
	topK?: number;
	minSimilarity?: number;
	sourceModule?: string;
	sourceId?: string;
}

// ActionResult is now imported from @/lib/types

export interface EmbeddingConfig {
	provider: EmbeddingProvider;
	model: string;
	apiKey?: string;
	baseURL?: string;
	dimension?: number;
}

export interface LLMConfig {
	provider: LLMProvider;
	model: string;
	apiKey?: string;
	baseURL?: string;
	temperature?: number;
	maxTokens?: number;
}

// ============= ACTION TYPES =============

export interface SearchKnowledgeActionInput {
	query: string;
	topK?: number;
	minSimilarity?: number;
}

export interface GenerateAnswerActionInput {
	query: string;
	context?: VectorSearchResult[];
	llmProvider?: LLMProvider;
	llmModel?: string;
	temperature?: number;
	maxTokens?: number;
}

// ============= SERVICE TYPES =============

export interface EmbeddingService {
	generateEmbedding(text: string): Promise<EmbeddingResult>;
	generateEmbeddings(chunks: string[]): Promise<EmbeddingChunk[]>;
}

export interface VectorSearchService {
	search(params: VectorSearchParams & { query: string }): Promise<VectorSearchResult[]>;
	indexDocument(knowledgeId: string, chunks: EmbeddingChunk[]): Promise<void>;
	deleteDocument(knowledgeId: string): Promise<void>;
}

export interface RAGService {
	generateAnswer(query: RAGQuery): Promise<RAGAnswer>;
}

// ============= REPOSITORY TYPES =============

export interface KnowledgeVectorRepository {
	create(data: Omit<KnowledgeVector, "id" | "createdAt" | "updatedAt">): Promise<KnowledgeVector>;
	findByKnowledgeId(knowledgeId: string): Promise<KnowledgeVector[]>;
	deleteByKnowledgeId(knowledgeId: string): Promise<void>;
	searchSimilar(embedding: number[], topK: number, minSimilarity: number, excludeKnowledgeId?: string): Promise<VectorSearchResult[]>;
}

export interface VectorSearchLogRepository {
	create(data: Omit<VectorSearchLog, "id" | "createdAt">): Promise<VectorSearchLog>;
	findRecent(limit: number): Promise<VectorSearchLog[]>;
}
