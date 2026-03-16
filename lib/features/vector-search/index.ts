/**
 * Vector Search Feature - Main export
 *
 * RAG Foundation: Ready for future implementation of semantic search,
 * embeddings, and LLM-powered Q&A over Knowledge Base.
 *
 * Currently all features are feature-flagged and non-breaking.
 * When Settings.rag_enabled = true, activate the services below.
 */

// Types
export * from "./types";

// Services (placeholder, ready for implementation)
export { generateEmbedding, generateBatchEmbeddings, calculateSimilarity, vectorSearch, multiModuleVectorSearch, getVectorsByEntity, deleteVectorsByEntity, ragQuery, indexEntity, batchIndexEntities, reindexEntity, getIndexingStatus, cleanupDuplicateVectors, crossFeatureSearch, getAccessibleModules, getSearchSuggestions, logSearchResult } from "./services";
export type { EmbeddingProvider, EmbeddingResult, EmbeddingChunk, VectorSearchParams, VectorSearchResult, RAGRequest, RAGSource, RAGResponse, RAGAnswer, IndexingParams, IndexingResult, CrossFeatureSearchOptions, VectorQuery } from "./types";

// Actions - Indexing and search server actions
export { indexKnowledgeArticle, indexContact, indexOpportunity, indexEvent, indexInteraction, deleteEntityVectors, batchIndexKnowledgeArticles, searchAcrossModules, submitSearchFeedback } from "./actions";

// Repository (placeholder, ready for implementation)
export { VectorSearchRepository } from "./repositories";
