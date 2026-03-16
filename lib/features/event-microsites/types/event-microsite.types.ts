import type { EventMicrosite } from "@/generated/prisma/client";

// EventMicrosite with relations
export interface EventMicrositeWithRelations extends EventMicrosite {
	event?: {
		id: string;
		title: string;
		eventType: string;
	};
	heroImage?: {
		id: string;
		url: string;
	} | null;
	createdBy: {
		id: string;
		name: string | null;
		email: string;
	};
	updatedBy: {
		id: string;
		name: string | null;
		email: string;
	};
}

// List result with pagination
export interface EventMicrositeListResult {
	microsites: EventMicrositeWithRelations[];
	total: number;
	page: number;
	pageSize: number;
}

// Create input
export interface CreateEventMicrositeInput {
	eventId: string;
	heroTitle: string;
	heroSubtitle?: string;
	heroImageId?: string;
	description: string;
	agenda?: string;
	speakers?: string;
	sponsors?: string;
	ctaText?: string;
	ctaUrl?: string;
	isPublished?: boolean;
}

// Update input
export interface UpdateEventMicrositeInput {
	heroTitle?: string;
	heroSubtitle?: string;
	heroImageId?: string;
	description?: string;
	agenda?: string;
	speakers?: string;
	sponsors?: string;
	ctaText?: string;
	ctaUrl?: string;
	isPublished?: boolean;
	publishedAt?: Date;
}

// Get options with filters
export interface GetEventMicrositesOptions {
	page?: number;
	pageSize?: number;
	eventId?: string;
	isPublished?: boolean;
	search?: string;
}
