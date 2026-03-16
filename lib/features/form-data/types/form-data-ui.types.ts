/**
 * Form Data UI Component Types
 * Types for components in app/(dashboard)/form-data/*
 */

/**
 * Form Data UI Component Types
 * Types for components in app/(dashboard)/form-data/*
 */

type JsonValue = any; // Prisma JSON type
import type { FormDataItem, FormDataListProps, FormDataResponse } from "./form-data.types";

// ============================================================================
// LIST COMPONENT TYPES
// ============================================================================

/**
 * FormDataListWithKeyProps - Extended list props with selected key
 */
export interface FormDataListWithKeyProps extends FormDataListProps {
	selectedKey?: string;
}

/**
 * FormKeysListProps - Props for form keys list component
 */
export interface FormKeysListProps {
	onSelectKey: (key: string) => void;
	selectedKey?: string;
}

/**
 * DynamicTableProps - Props for dynamic table component
 */
export interface DynamicTableProps {
	data: Array<{
		id: string;
		data: JsonValue;
		createdAt: Date;
		ipAddress?: string | null;
	}>;
}

/**
 * StatisticsProps - Props for statistics component
 */
export interface StatisticsProps {
	data: Array<{
		id: string;
		data: JsonValue;
	}>;
}

// ============================================================================
// RE-EXPORTS (For convenience)
// ============================================================================

export type { FormDataListProps, FormDataResponse, FormDataItem };
