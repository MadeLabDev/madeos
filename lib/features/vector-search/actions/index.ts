/**
 * Vector Search Actions - Server-Side RAG Integration
 *
 * Exports indexing and search server actions for integrating RAG
 * into feature workflows (Knowledge, Contacts, Opportunities, etc.)
 */

// Export indexing actions
export { indexKnowledgeArticle, indexContact, indexOpportunity, indexEvent, indexInteraction, deleteEntityVectors, batchIndexKnowledgeArticles } from "./index-actions";

// Export search actions
export { searchAcrossModules, submitSearchFeedback } from "./search-actions";
