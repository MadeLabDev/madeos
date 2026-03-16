/**
 * Settings service - Business logic for settings management
 */

import { unstable_cache } from "next/cache";

import { CACHE_ENABLED, CACHE_TAGS } from "@/lib/cache/cache-helpers";
import { setMediaCache, setPaginationCache, setSiteInfoCache } from "@/lib/config/site";
import { broadcastToAll } from "@/lib/realtime/pusher-handler";

import * as settingsRepository from "../repositories/settings-repository";
import type { PaymentSettingsInput, Setting, SettingsRecord } from "../types/settings.types";
import { PAYMENT_PROVIDERS, SETTING_KEYS } from "../types/settings.types";

/**
 * Get all settings as record object
 * Cached version if CACHE_ENABLED is true
 */
export const getAllSettingsAsRecord = CACHE_ENABLED
	? unstable_cache(
			async (): Promise<SettingsRecord> => {
				return settingsRepository.findAllSettingsAsRecord();
			},
			["settings-record"],
			{
				tags: [CACHE_TAGS.SETTINGS],
				revalidate: 3600, // 1 hour
			},
		)
	: async (): Promise<SettingsRecord> => {
			return settingsRepository.findAllSettingsAsRecord();
		};

/**
 * Get all settings as array
 * Cached version if CACHE_ENABLED is true
 */
export const getAllSettings = CACHE_ENABLED
	? unstable_cache(
			async (): Promise<Setting[]> => {
				return settingsRepository.findAllSettings();
			},
			["settings-all"],
			{
				tags: [CACHE_TAGS.SETTINGS],
				revalidate: 3600, // 1 hour
			},
		)
	: async (): Promise<Setting[]> => {
			return settingsRepository.findAllSettings();
		};

/**
 * Get single setting by key
 * Cached version if CACHE_ENABLED is true
 */
export const getSettingByKey = CACHE_ENABLED
	? unstable_cache(
			async (key: string): Promise<Setting | null> => {
				return settingsRepository.findSettingByKey(key);
			},
			["setting-by-key"],
			{
				tags: [CACHE_TAGS.SETTINGS],
				revalidate: 3600, // 1 hour
			},
		)
	: async (key: string): Promise<Setting | null> => {
			return settingsRepository.findSettingByKey(key);
		};

/**
 * Update single setting with validation and broadcast
 */
export async function updateSetting(key: string, value: string, description?: string): Promise<Setting> {
	if (!key || !value) {
		throw new Error("Setting key and value are required");
	}

	const setting = await settingsRepository.updateSetting(key, {
		value,
		description,
	});

	// ✅ Update cache if it's a pagination, media or siteinfo setting
	if (key === "pagesize") {
		setPaginationCache({ pagesize: parseInt(value, 10) } as any);
	} else if (key === "media_pagesize") {
		setPaginationCache({ media_pagesize: parseInt(value, 10) } as any);
	} else if (key === "media_max_file_size_mb") {
		setMediaCache({ max_file_size_mb: parseInt(value, 10) });
	} else if (key.startsWith("company_")) {
		// Update company info cache
		if (key === "company_name") setSiteInfoCache({ companyName: value } as any);
		else if (key === "company_email") setSiteInfoCache({ companyEmail: value } as any);
		else if (key === "company_phone") setSiteInfoCache({ companyPhone: value } as any);
		else if (key === "company_address") setSiteInfoCache({ companyAddress: value } as any);
		else if (key === "company_website") setSiteInfoCache({ companyWebsite: value } as any);
		else if (key === "company_logo") setSiteInfoCache({ companyLogo: value } as any);
		else if (key === "company_description") setSiteInfoCache({ companyDescription: value } as any);
	}

	// Broadcast update to all clients
	await broadcastToAll("settings_update", {
		action: "setting_updated",
		key,
		value,
		timestamp: new Date().toISOString(),
	});

	return setting;
}

/**
 * Update company settings (batch update)
 */
export async function updateCompanySettings(data: { company_name?: string; company_address?: string; company_phone?: string; company_email?: string }): Promise<Setting[]> {
	const updates: Array<{ key: string; value: string; description: string }> = [];

	if (data.company_name) {
		updates.push({
			key: "company_name",
			value: data.company_name,
			description: "Company Name",
		});
	}
	if (data.company_address) {
		updates.push({
			key: "company_address",
			value: data.company_address,
			description: "Company Address",
		});
	}
	if (data.company_phone) {
		updates.push({
			key: "company_phone",
			value: data.company_phone,
			description: "Company Phone Number",
		});
	}
	if (data.company_email) {
		updates.push({
			key: "company_email",
			value: data.company_email,
			description: "Company Email Address",
		});
	}

	if (updates.length === 0) {
		throw new Error("No company settings provided for update");
	}

	const results = await settingsRepository.batchUpdateSettings(updates);

	// Broadcast batch update to all clients
	await broadcastToAll("settings_update", {
		action: "company_settings_updated",
		count: updates.length,
		timestamp: new Date().toISOString(),
	});

	return results;
}

/**
 * Update system settings (page sizes)
 */
export async function updateSystemSettings(data: { pagesize?: number; media_pagesize?: number; datetime_format?: string }): Promise<Setting[]> {
	const updates: Array<{ key: string; value: string; description: string }> = [];

	if (data.pagesize !== undefined) {
		if (data.pagesize < 1 || data.pagesize > 100) {
			throw new Error("Page size must be between 1 and 100");
		}
		updates.push({
			key: "pagesize",
			value: String(data.pagesize),
			description: "Default page size for list views",
		});
	}

	if (data.media_pagesize !== undefined) {
		if (data.media_pagesize < 1 || data.media_pagesize > 100) {
			throw new Error("Media page size must be between 1 and 100");
		}
		updates.push({
			key: "media_pagesize",
			value: String(data.media_pagesize),
			description: "Page size for media gallery",
		});
	}

	if (data.datetime_format !== undefined) {
		if (!data.datetime_format.trim()) {
			throw new Error("DateTime format cannot be empty");
		}
		updates.push({
			key: "datetime_format",
			value: data.datetime_format,
			description: "Date and time format for display",
		});
	}

	if (updates.length === 0) {
		throw new Error("No system settings provided for update");
	}

	const results = await settingsRepository.batchUpdateSettings(updates);

	// ✅ Update pagination cache with new values
	const newCacheValues: Partial<Record<"pagesize" | "media_pagesize", number>> = {};
	if (data.pagesize !== undefined) {
		newCacheValues.pagesize = data.pagesize;
	}
	if (data.media_pagesize !== undefined) {
		newCacheValues.media_pagesize = data.media_pagesize;
	}
	setPaginationCache(newCacheValues as any);

	// Broadcast batch update
	await broadcastToAll("settings_update", {
		action: "system_settings_updated",
		count: updates.length,
		timestamp: new Date().toISOString(),
	});

	return results;
}

/**
 * Update media settings
 */
export async function updateMediaSettings(data: { media_max_file_size_mb?: number; media_allowed_types?: string }): Promise<Setting[]> {
	const updates: Array<{ key: string; value: string; description: string }> = [];

	if (data.media_max_file_size_mb !== undefined) {
		if (data.media_max_file_size_mb < 1 || data.media_max_file_size_mb > 1000) {
			throw new Error("Max file size must be between 1 and 1000 MB");
		}
		updates.push({
			key: "media_max_file_size_mb",
			value: String(data.media_max_file_size_mb),
			description: "Maximum file size in MB for media uploads",
		});
	}

	if (data.media_allowed_types) {
		if (!data.media_allowed_types.trim()) {
			throw new Error("At least one file type must be allowed");
		}
		updates.push({
			key: "media_allowed_types",
			value: data.media_allowed_types,
			description: "Comma-separated list of allowed media types",
		});
	}

	if (updates.length === 0) {
		throw new Error("No media settings provided for update");
	}

	const results = await settingsRepository.batchUpdateSettings(updates);

	// ✅ Update media cache if max file size changed
	if (data.media_max_file_size_mb !== undefined) {
		setMediaCache({ max_file_size_mb: data.media_max_file_size_mb });
	}

	// Broadcast batch update
	await broadcastToAll("settings_update", {
		action: "media_settings_updated",
		count: updates.length,
		timestamp: new Date().toISOString(),
	});

	return results;
}

/**
 * Update payment settings (provider + default currency)
 */
export async function updatePaymentSettings(data: PaymentSettingsInput): Promise<Setting[]> {
	if (!PAYMENT_PROVIDERS.includes(data.provider)) {
		throw new Error("Unsupported payment provider");
	}

	const currency = data.currency.trim().toUpperCase();
	if (!/^[A-Z]{3}$/.test(currency)) {
		throw new Error("Currency must be a 3-letter ISO code (e.g., USD)");
	}

	const updates = [
		{
			key: SETTING_KEYS.PAYMENT_PROVIDER,
			value: data.provider,
			description: "Active payment provider",
		},
		{
			key: SETTING_KEYS.PAYMENT_CURRENCY,
			value: currency,
			description: "Default payment currency",
		},
	];

	const results = await settingsRepository.batchUpdateSettings(updates);

	await broadcastToAll("settings_update", {
		action: "payment_settings_updated",
		provider: data.provider,
		currency,
		timestamp: new Date().toISOString(),
	});

	return results;
}

/**
 * Delete setting
 */
export async function deleteSetting(key: string): Promise<Setting> {
	const setting = await settingsRepository.deleteSetting(key);

	// Broadcast deletion
	await broadcastToAll("settings_update", {
		action: "setting_deleted",
		key,
		timestamp: new Date().toISOString(),
	});

	return setting;
}
