/**
 * Settings types and interfaces
 */

export interface Setting {
	id: string;
	key: string;
	value: string;
	description?: string | null;
	createdAt: Date;
	updatedAt: Date;
}

export type SettingsRecord = Record<string, string>;

export interface CreateSettingInput {
	key: string;
	value: string;
	description?: string;
}

export interface UpdateSettingInput {
	value: string;
	description?: string;
}

export const PAYMENT_PROVIDERS = ["stripe", "square", "paypal"] as const;
export type PaymentProvider = (typeof PAYMENT_PROVIDERS)[number];

export interface PaymentSettingsInput {
	provider: PaymentProvider;
	currency: string;
}

// ActionResult is now imported from @/lib/types

/**
 * Settings categories for organization
 */
export enum SettingCategory {
	COMPANY = "company",
	SYSTEM = "system",
	MEDIA = "media",
	PAYMENT = "payment",
}

/**
 * Predefined setting keys
 */
export const SETTING_KEYS = {
	// Company info
	COMPANY_NAME: "company_name",
	COMPANY_ADDRESS: "company_address",
	COMPANY_PHONE: "company_phone",
	COMPANY_EMAIL: "company_email",

	// Page sizes
	PAGE_SIZE: "pagesize",
	MEDIA_PAGE_SIZE: "media_pagesize",

	// Media config
	MEDIA_MAX_FILE_SIZE_MB: "media_max_file_size_mb",
	MEDIA_ALLOWED_TYPES: "media_allowed_types",

	// AI features
	AI_ASSISTANT_ENABLED: "ai_assistant_enabled",
	RAG_ENABLED: "rag_enabled",

	// Payment configuration
	PAYMENT_PROVIDER: "payment_provider",
	PAYMENT_CURRENCY: "payment_currency",
} as const;

export const PAYMENT_PROVIDER_LABELS: Record<PaymentProvider, string> = {
	stripe: "Stripe",
	square: "Square",
	paypal: "PayPal",
};

/**
 * Get category for a setting key
 */
export function getSettingCategory(key: string): SettingCategory {
	if (key.startsWith("company_")) return SettingCategory.COMPANY;
	if (["pagesize", "media_pagesize"].includes(key)) return SettingCategory.SYSTEM;
	if (key.startsWith("media_")) return SettingCategory.MEDIA;
	if (key.startsWith("payment_")) return SettingCategory.PAYMENT;
	return SettingCategory.SYSTEM;
}
