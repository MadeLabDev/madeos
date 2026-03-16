// Embedding Service
export { generateEmbedding, generateBatchEmbeddings } from "./embedding-service";

// Similarity Utils
export { calculateSimilarity } from "@/lib/utils/similarity";

// Vector Search Service
export { vectorSearch, multiModuleVectorSearch, getVectorsByEntity, deleteVectorsByEntity } from "./vector-search-service";

// RAG Service
export { ragQuery } from "./rag-service";

// Indexing Service
export { indexEntity, batchIndexEntities, reindexEntity, getIndexingStatus, cleanupDuplicateVectors } from "./indexing-service";

// Cross-Feature Service
export { crossFeatureSearch, getAccessibleModules, getSearchSuggestions, logSearchResult } from "./cross-feature-service";
