/**
 * AI Module - Central export point
 *
 * This module provides configuration for RAG features (embeddings, LLM).
 * All features are optional and feature-flagged via Settings.rag_enabled
 * Premium models only: OpenAI GPT-4, Gemini Pro, Claude 3 Opus
 */

// Embedding Configuration (Premium providers)
export { EmbeddingProvider, type EmbeddingConfig, getEmbeddingConfig, openaiLargeEmbeddingConfig, geminiEmbeddingConfig, cohereEmbeddingConfig, searchOnlyEmbeddingConfig, estimateEmbeddingCost, validateEmbeddingConfig } from "./embedding-config";

// LLM Configuration (Premium providers)
export { LLMProvider, type LLMConfig, getLLMConfig, openaiGPT4Config, geminiProConfig, claudeOpusConfig, searchOnlyConfig, validateLLMConfig } from "./llm-config";

// Feature flag
export { isRagEnabled, enableRAG, disableRAG, clearRagCache } from "./rag-feature-flag";
