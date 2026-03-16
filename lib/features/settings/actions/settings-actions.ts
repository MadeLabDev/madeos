"use server";

/**
 * Settings server actions - Thin wrapper around service layer with permission checks
 */

import { invalidateSettingsCache, invalidateSettingsCacheByKey } from "@/lib/cache/cache-invalidate";
import { countArticlesAction } from "@/lib/features/knowledge/actions/knowledge.actions";
import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/lib/types";

import * as settingsService from "../services/settings-service";
import type { PaymentSettingsInput, SettingsRecord } from "../types/settings.types";

/**
 * Get all settings (permission checked)
 */
export async function getSettingsAction(): Promise<ActionResult<SettingsRecord>> {
	try {
		await requirePermission("settings", "read");

		const settings = await settingsService.getAllSettingsAsRecord();

		if (!settings || Object.keys(settings).length === 0) {
			return {
				success: false,
				message: "No settings found",
			};
		}

		return {
			success: true,
			message: "Settings retrieved successfully",
			data: settings,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to retrieve settings",
		};
	}
}

/**
 * Update single setting (permission checked)
 */
export async function updateSettingAction(key: string, value: string, description?: string): Promise<ActionResult> {
	try {
		await requirePermission("settings", "update");

		const setting = await settingsService.updateSetting(key, value, description);

		// Invalidate cache for this specific setting
		await invalidateSettingsCacheByKey(key);

		return {
			success: true,
			message: "Setting updated successfully",
			data: setting,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to update setting",
		};
	}
}

/**
 * Update company settings (permission checked)
 */
export async function updateCompanySettingsAction(data: { company_name?: string; company_address?: string; company_phone?: string; company_email?: string }): Promise<ActionResult> {
	try {
		await requirePermission("settings", "update");

		const results = await settingsService.updateCompanySettings(data);

		// Invalidate cache for all settings
		await invalidateSettingsCache();

		return {
			success: true,
			message: "Company settings updated successfully",
			data: results,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to update company settings",
		};
	}
}

/**
 * Update system settings (permission checked)
 */
export async function updateSystemSettingsAction(data: { pagesize?: number; media_pagesize?: number; datetime_format?: string }): Promise<ActionResult> {
	try {
		await requirePermission("settings", "update");

		const results = await settingsService.updateSystemSettings(data);

		// Invalidate cache for all settings
		await invalidateSettingsCache();

		return {
			success: true,
			message: "System settings updated successfully",
			data: results,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to update system settings",
		};
	}
}

/**
 * Update media settings (permission checked)
 */
export async function updateMediaSettingsAction(data: { media_max_file_size_mb?: number; media_allowed_types?: string }): Promise<ActionResult> {
	try {
		await requirePermission("settings", "update");

		const results = await settingsService.updateMediaSettings(data);

		// Invalidate cache for all settings
		await invalidateSettingsCache();

		return {
			success: true,
			message: "Media settings updated successfully",
			data: results,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to update media settings",
		};
	}
}

/**
 * Update payment settings (provider + currency)
 */
export async function updatePaymentSettingsAction(data: PaymentSettingsInput): Promise<ActionResult> {
	try {
		await requirePermission("settings", "update");

		const currency = data.currency.trim().toUpperCase();
		await settingsService.updatePaymentSettings({ ...data, currency });

		await invalidateSettingsCache();

		return {
			success: true,
			message: "Payment settings updated successfully",
			data: { provider: data.provider, currency },
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to update payment settings",
		};
	}
}

/**
 * Delete setting (permission checked)
 */
export async function deleteSettingAction(key: string): Promise<ActionResult> {
	try {
		await requirePermission("settings", "delete");

		const setting = await settingsService.deleteSetting(key);

		// Invalidate cache for this setting
		await invalidateSettingsCacheByKey(key);

		return {
			success: true,
			message: "Setting deleted successfully",
			data: setting,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to delete setting",
		};
	}
}

/**
 * Send test email (permission checked)
 */
export async function sendTestEmailAction(email: string): Promise<ActionResult> {
	try {
		await requirePermission("settings", "update");

		if (!email || !email.trim()) {
			throw new Error("Email address is required");
		}

		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			throw new Error("Invalid email address format");
		}

		// Import email service dynamically to avoid client-side bundling
		const { emailService } = await import("@/lib/email/service");

		const result = await emailService.sendTestEmail(email.trim(), "This is a test email sent from your MADE Laboratory settings page.");

		if (result.success) {
			return {
				success: true,
				message: "Test email sent successfully",
			};
		} else {
			return {
				success: false,
				message: "Failed to send test email",
			};
		}
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to send test email",
		};
	}
}

/**
 * Toggle RAG feature (permission checked)
 * Enable or disable RAG (vector search + LLM) features
 */
export async function toggleRAGAction(enable: boolean): Promise<ActionResult> {
	try {
		await requirePermission("settings", "update");

		const { enableRAG, disableRAG } = await import("@/lib/ai");

		if (enable) {
			await enableRAG();
		} else {
			await disableRAG();
		}

		// Invalidate cache for RAG setting
		await invalidateSettingsCacheByKey("rag_enabled");

		return {
			success: true,
			message: `RAG ${enable ? "enabled" : "disabled"} successfully`,
			data: { rag_enabled: enable.toString() },
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to toggle RAG",
		};
	}
}

/**
 * Get RAG status (permission checked)
 * Check if RAG is currently enabled
 */
export async function getRAGStatusAction(): Promise<ActionResult<{ enabled: boolean }>> {
	try {
		await requirePermission("settings", "read");

		const { isRagEnabled } = await import("@/lib/ai");
		const enabled = await isRagEnabled();

		return {
			success: true,
			message: `RAG is currently ${enabled ? "enabled" : "disabled"}`,
			data: { enabled },
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to get RAG status",
		};
	}
}

/**
 * Batch index existing knowledge articles (permission checked)
 */
export async function batchIndexKnowledgeAction(): Promise<ActionResult<{ indexed: number; total: number }>> {
	try {
		await requirePermission("settings", "update");

		const { batchIndexKnowledgeArticles } = await import("@/lib/features/vector-search/actions/index-actions");

		const result = await batchIndexKnowledgeArticles();

		return {
			success: true,
			message: `Successfully indexed ${result.success} out of ${result.total} knowledge articles`,
			data: {
				indexed: result.success,
				total: result.total,
			},
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to index knowledge articles",
		};
	}
}

/**
 * Batch index existing tasks (permission checked)
 */
export async function batchIndexTasksAction(): Promise<ActionResult<{ indexed: number; total: number }>> {
	try {
		await requirePermission("settings", "update");

		const { batchIndexTasks } = await import("@/lib/features/vector-search/actions/index-actions");

		const result = await batchIndexTasks();

		return {
			success: true,
			message: `Successfully indexed ${result.success} out of ${result.total} tasks`,
			data: {
				indexed: result.success,
				total: result.total,
			},
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to index tasks",
		};
	}
}

/**
 * Batch index existing training sessions (permission checked)
 */
export async function batchIndexTrainingAction(): Promise<ActionResult<{ indexed: number; total: number }>> {
	try {
		await requirePermission("settings", "update");

		const { batchIndexTraining } = await import("@/lib/features/vector-search/actions/index-actions");

		const result = await batchIndexTraining();

		return {
			success: true,
			message: `Successfully indexed ${result.success} out of ${result.total} training sessions`,
			data: {
				indexed: result.success,
				total: result.total,
			},
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to index training sessions",
		};
	}
}

/**
 * Batch index existing test reports (permission checked)
 */
export async function batchIndexTestReportsAction(): Promise<ActionResult<{ indexed: number; total: number }>> {
	try {
		await requirePermission("settings", "update");

		const { batchIndexTestReports } = await import("@/lib/features/vector-search/actions/index-actions");

		const result = await batchIndexTestReports();

		return {
			success: true,
			message: `Successfully indexed ${result.success} out of ${result.total} test reports`,
			data: {
				indexed: result.success,
				total: result.total,
			},
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to index test reports",
		};
	}
}

/**
 * Batch index existing design projects (permission checked)
 */
export async function batchIndexDesignProjectsAction(): Promise<ActionResult<{ indexed: number; total: number }>> {
	try {
		await requirePermission("settings", "update");

		const { batchIndexDesignProjects } = await import("@/lib/features/vector-search/actions/index-actions");

		const result = await batchIndexDesignProjects();

		return {
			success: true,
			message: `Successfully indexed ${result.success} out of ${result.total} design projects`,
			data: {
				indexed: result.success,
				total: result.total,
			},
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to index design projects",
		};
	}
}

/**
 * Batch index existing marketing campaigns (permission checked)
 */
export async function batchIndexMarketingCampaignsAction(): Promise<ActionResult<{ indexed: number; total: number }>> {
	try {
		await requirePermission("settings", "update");

		const { batchIndexMarketingCampaigns } = await import("@/lib/features/vector-search/actions/index-actions");

		const result = await batchIndexMarketingCampaigns();

		return {
			success: true,
			message: `Successfully indexed ${result.success} out of ${result.total} marketing campaigns`,
			data: {
				indexed: result.success,
				total: result.total,
			},
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to index marketing campaigns",
		};
	}
}

/**
 * Get AI Assistant status (no permission required for menu visibility)
 */
export async function getAIAssistantStatusAction(): Promise<ActionResult<{ enabled: boolean }>> {
	try {
		const settings = await settingsService.getAllSettingsAsRecord();
		// Default to enabled if setting doesn't exist (for backward compatibility)
		const enabled = settings.ai_assistant_enabled !== "false";

		return {
			success: true,
			message: "AI Assistant status retrieved successfully",
			data: { enabled },
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to get AI Assistant status",
		};
	}
}

/**
 * Toggle AI Assistant (permission checked)
 */
export async function toggleAIAssistantAction(enable: boolean): Promise<ActionResult> {
	try {
		await requirePermission("settings", "update");

		await settingsService.updateSetting("ai_assistant_enabled", enable.toString(), "Enable/disable AI Assistant globally");

		// Invalidate cache for AI Assistant setting
		await invalidateSettingsCacheByKey("ai_assistant_enabled");

		return {
			success: true,
			message: `AI Assistant ${enable ? "enabled" : "disabled"} successfully`,
			data: { ai_assistant_enabled: enable.toString() },
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to toggle AI Assistant",
		};
	}
}

/**
 * Get indexing statistics for data indexing tab
 */
export async function getIndexingStatsAction(): Promise<ActionResult<{ knowledgeArticles: number; indexedVectors: number; lastIndexedAt?: Date }>> {
	try {
		await requirePermission("settings", "read");

		// Get knowledge articles count
		const knowledgeResult = await countArticlesAction();
		if (!knowledgeResult.success) {
			return {
				success: false,
				message: knowledgeResult.message || "Failed to count knowledge articles",
			};
		}

		// Get indexed vectors count
		const vectorCount = await prisma.knowledgeVector.count();

		// Get last indexed timestamp
		const lastVector = await prisma.knowledgeVector.findFirst({
			orderBy: { createdAt: "desc" },
			select: { createdAt: true },
		});

		return {
			success: true,
			message: "Indexing stats retrieved successfully",
			data: {
				knowledgeArticles: knowledgeResult.data || 0,
				indexedVectors: vectorCount,
				lastIndexedAt: lastVector?.createdAt,
			},
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to get indexing stats",
		};
	}
}
