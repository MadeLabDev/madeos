/**
 * Settings UI Component Types
 * Types for components in app/(dashboard)/settings/*
 */

// ============================================================================
// FORM COMPONENT TYPES
// ============================================================================

export interface SettingsFormProps {
	settingsObj?: Record<string, string>;
	onSuccess?: () => void;
	hideButtons?: boolean;
	onLoadingChange?: (loading: boolean) => void;
}

export interface SystemSettingsFormProps {
	settingsObj: Record<string, string>;
	onSuccess?: () => void;
	hideButtons?: boolean;
	onLoadingChange?: (loading: boolean) => void;
}

export interface MediaSettingsFormProps {
	settingsObj: Record<string, string>;
	onSuccess?: () => void;
	hideButtons?: boolean;
	onLoadingChange?: (loading: boolean) => void;
}

export interface PaymentSettingsFormProps {
	settingsObj: Record<string, string>;
	onSuccess?: () => void;
	hideButtons?: boolean;
	onLoadingChange?: (loading: boolean) => void;
}

// ============================================================================
// TABS & LAYOUT TYPES
// ============================================================================

export interface SettingsTabsProps {
	settingsObj: Record<string, string>;
	onSuccess?: () => void;
}

export interface SettingsContentProps {
	initialSettings: Record<string, string>;
}

// ============================================================================
// TABLE COMPONENT TYPES
// ============================================================================

export interface SettingsTableProps {
	data?: Array<{
		id: string;
		key: string;
		value: string;
		description?: string | null;
		updatedAt: Date;
	}>;
}
