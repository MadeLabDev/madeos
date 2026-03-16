/**
 * Design Actions Index
 */

// Legacy actions
export * from "./design-project.actions";
export * from "./design-brief.actions";
export * from "./product-design.actions";
export * from "./tech-pack.actions";
export * from "./design-deck.actions";
export * from "./design-review.actions";
export * from "./search.actions";

// New server actions (preferred)
export * from "./design-projects";
export * from "./design-briefs";
export * from "./product-designs";
export * from "./tech-packs";
export * from "./design-decks";

// Aliases for backward compatibility
export { getDesignDeckById as getDesignDeck } from "./design-deck.actions";
export { getDesignReviewById as getDesignReview } from "./design-review.actions";
