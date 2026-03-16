/**
 * Settings repository - Database operations for settings
 */

import { prisma } from "@/lib/prisma";

import type { CreateSettingInput, Setting, SettingsRecord, UpdateSettingInput } from "../types/settings.types";

/**
 * Find setting by key
 */
export async function findSettingByKey(key: string): Promise<Setting | null> {
	return prisma.settings.findUnique({
		where: { key },
	});
}

/**
 * Get all settings as an array
 */
export async function findAllSettings(): Promise<Setting[]> {
	return prisma.settings.findMany({
		orderBy: { key: "asc" },
	});
}

/**
 * Get all settings as key-value pairs object
 */
export async function findAllSettingsAsRecord(): Promise<SettingsRecord> {
	const settings = await findAllSettings();
	return settings.reduce((acc, s) => {
		acc[s.key] = s.value;
		return acc;
	}, {} as SettingsRecord);
}

/**
 * Create new setting
 */
export async function createSetting(input: CreateSettingInput): Promise<Setting> {
	const existing = await findSettingByKey(input.key);
	if (existing) {
		throw new Error(`Setting with key "${input.key}" already exists`);
	}

	return prisma.settings.create({
		data: {
			key: input.key,
			value: input.value,
			description: input.description || null,
		},
	});
}

/**
 * Update setting by key (create if doesn't exist)
 */
export async function updateSetting(key: string, input: UpdateSettingInput): Promise<Setting> {
	return prisma.settings.upsert({
		where: { key },
		update: {
			value: input.value,
			description: input.description !== undefined ? input.description : undefined,
		},
		create: {
			key,
			value: input.value,
			description: input.description || null,
		},
	});
}

/**
 * Delete setting by key
 */
export async function deleteSetting(key: string): Promise<Setting> {
	return prisma.settings.delete({
		where: { key },
	});
}

/**
 * Batch update multiple settings
 */
export async function batchUpdateSettings(updates: Array<{ key: string; value: string; description?: string }>): Promise<Setting[]> {
	return Promise.all(
		updates.map((u) =>
			updateSetting(u.key, {
				value: u.value,
				description: u.description,
			}),
		),
	);
}

/**
 * Delete all settings (cleanup)
 */
export async function deleteAllSettings(): Promise<{ count: number }> {
	return prisma.settings.deleteMany({});
}
