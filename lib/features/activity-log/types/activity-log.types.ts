/**
 * Activity log feature types
 */

export interface ActivityLogInput {
	userId?: string;
	action: string;
	value?: string;
	entity: string;
	entityId: string;
	details?: Record<string, any>;
	ipAddress?: string;
	userAgent?: string;
}

export interface ActivityLogEntry {
	id: string;
	userId: string | null;
	action: string;
	value: string;
	entity: string;
	entityId: string;
	details: string | null;
	ipAddress: string | null;
	userAgent: string | null;
	createdAt: Date;
}

// Legacy type - kept for backward compatibility
export interface ActivityLog {
	id: string;
	userId: string;
	action: string;
	resource: string;
	resourceId?: string;
	details?: Record<string, any>;
	createdAt: Date;
}
