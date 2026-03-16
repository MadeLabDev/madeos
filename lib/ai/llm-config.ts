/**
 * LLM Configuration - Enterprise RAG Grade
 *
 * Premium LLM providers for production RAG:
 * - OpenAI GPT-4 Turbo (PRIMARY - highest quality, recommended)
 * - Google Gemini Pro (SECONDARY - excellent reasoning, lower cost)
 * - Anthropic Claude 3 Opus (TERTIARY - specialized tasks, long context)
 *
 * Feature-flagged: Only used when Settings.rag_enabled = true
 * All providers require valid API keys
 */

export enum LLMProvider {
	OPENAI = "openai", // PRIMARY: GPT-4 Turbo, $0.03/1K tokens
	GEMINI = "gemini", // SECONDARY: Gemini Pro, excellent reasoning
	CLAUDE = "claude", // TERTIARY: Claude 3 Opus, best for long context
	NONE = "none", // Search-only mode (no LLM)
}

export interface LLMConfig {
	provider: LLMProvider;
	model: string;
	temperature: number;
	maxTokens: number;
	topP?: number;
	frequencyPenalty?: number;
	presencePenalty?: number;
	apiKey?: string;
}

// Search-only mode (no LLM answer generation)
export const searchOnlyConfig: LLMConfig = {
	provider: LLMProvider.NONE,
	model: "none",
	temperature: 0,
	maxTokens: 0,
};

// OpenAI GPT-4 Turbo (PRIMARY RECOMMENDATION)
// - 128K context window
// - Excellent instruction following
// - Best for complex reasoning
// - Cost: ~$0.03/1K output tokens (varies by input)
export const openaiGPT4Config: LLMConfig = {
	provider: LLMProvider.OPENAI,
	model: "gpt-4-turbo",
	temperature: 0.3, // Lower for RAG consistency
	maxTokens: 2048,
	topP: 1,
	frequencyPenalty: 0.2,
	presencePenalty: 0.2,
	apiKey: process.env.OPENAI_API_KEY,
};

// Google Gemini Pro (SECONDARY - EXCELLENT VALUE)
// - Good reasoning capability
// - Fast response times
// - Competitive pricing
// - 32K context window
export const geminiProConfig: LLMConfig = {
	provider: LLMProvider.GEMINI,
	model: "gemini-pro",
	temperature: 0.3,
	maxTokens: 2048,
	topP: 1,
	apiKey: process.env.GOOGLE_GEMINI_API_KEY,
};

// Anthropic Claude 3 Opus (TERTIARY - FOR SPECIALIZED TASKS)
// - Excellent for very long contexts (200K tokens)
// - Superior reasoning for complex prompts
// - Best for document analysis
// - Cost: Higher per token, best for specialized use
export const claudeOpusConfig: LLMConfig = {
	provider: LLMProvider.CLAUDE,
	model: "claude-3-opus-20240229",
	temperature: 0.3,
	maxTokens: 2048,
	apiKey: process.env.ANTHROPIC_API_KEY,
};

// Get active LLM config based on environment
// Priority: OPENAI > GEMINI > CLAUDE > NONE
export function getLLMConfig(): LLMConfig {
	// Try providers in priority order
	if (process.env.OPENAI_API_KEY) {
		return openaiGPT4Config;
	}

	if (process.env.GOOGLE_GEMINI_API_KEY) {
		console.warn("OpenAI API key not set, using Google Gemini Pro as fallback");
		return geminiProConfig;
	}

	if (process.env.ANTHROPIC_API_KEY) {
		console.warn("OpenAI and Gemini API keys not set, using Claude 3 Opus as fallback");
		return claudeOpusConfig;
	}

	console.warn("No premium LLM API keys configured. Running in search-only mode. " + "Set OPENAI_API_KEY, GOOGLE_GEMINI_API_KEY, or ANTHROPIC_API_KEY.");
	return searchOnlyConfig;
}

// Validate LLM configuration
export function validateLLMConfig(): { valid: boolean; errors: string[] } {
	const errors: string[] = [];
	const config = getLLMConfig();

	// Check that at least one API key is set
	const hasAnyApiKey = process.env.OPENAI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY || process.env.ANTHROPIC_API_KEY;

	if (!hasAnyApiKey && config.provider !== LLMProvider.NONE) {
		errors.push("At least one premium LLM API key required: OPENAI_API_KEY, GOOGLE_GEMINI_API_KEY, or ANTHROPIC_API_KEY");
	}

	// Validate temperature range
	if (config.temperature < 0 || config.temperature > 2) {
		errors.push(`Temperature must be 0-2, got ${config.temperature}`);
	}

	// Validate max tokens
	if (config.maxTokens < 1 || config.maxTokens > 4096) {
		errors.push(`maxTokens must be 1-4096, got ${config.maxTokens}`);
	}

	// Additional checks for specific providers
	if (config.provider === LLMProvider.OPENAI && !process.env.OPENAI_API_KEY) {
		errors.push("OPENAI_API_KEY required for GPT-4 Turbo");
	}

	if (config.provider === LLMProvider.GEMINI && !process.env.GOOGLE_GEMINI_API_KEY) {
		errors.push("GOOGLE_GEMINI_API_KEY required for Gemini Pro");
	}

	if (config.provider === LLMProvider.CLAUDE && !process.env.ANTHROPIC_API_KEY) {
		errors.push("ANTHROPIC_API_KEY required for Claude 3 Opus");
	}

	return {
		valid: errors.length === 0,
		errors,
	};
}
