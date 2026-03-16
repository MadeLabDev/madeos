/**
 * Media UI Component Types
 * Types for components in app/(dashboard)/medias/*
 */

export interface MediaGridProps {
	page: number;
	search: string;
	pageSize: number;
}

export interface MediaItemProps {
	id: string;
	name: string;
	url: string;
	type: string;
	size: number;
	visibility: string;
	uploadedBy?: { name: string | null; email: string };
	onVisibilityChange?: (id: string, visibility: string) => void;
	onDelete?: (id: string) => void;
	onRefresh?: () => void;
	isSelected?: boolean;
	onSelect?: (id: string, selected: boolean) => void;
}

export interface MediaUploadProps {
	onSuccess?: (files: UploadedFile[]) => void;
}

export interface UploadedFile {
	id: string;
	name: string;
	url: string;
	size: number;
	type: string;
}

// ============================================================================
// PAGE HEADER COMPONENT TYPES
// ============================================================================

export interface MediaPageHeaderProps {
	title: string;
	description: string;
	searchPlaceholder?: string;
	search?: string;
	showUploadButton?: boolean;
	uploadMediaAction?: (formData: FormData) => Promise<any>;
}

export interface MediaGridItemsProps {
	items: any[];
	onSelectChange?: (selectedIds: string[]) => void;
}

export interface MediaPageWrapperProps {
	children: React.ReactNode;
	uploadMediaAction?: (formData: FormData) => Promise<any>;
}
