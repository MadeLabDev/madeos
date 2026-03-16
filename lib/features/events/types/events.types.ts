import { EventType, ProcessStatus, PublishStatus, RegistrationStatus, TicketingMode, TicketSource, TransactionStatus } from "@/generated/prisma/enums";
import type { ActionResult, PaginatedResult } from "@/lib/types";

// Re-export shared types for convenience
export type { ActionResult, PaginatedResult };

/**
 * Event Types
 */
export type Event = {
	id: string;
	title: string;
	slug: string;
	description: string;
	startDate: Date;
	endDate: Date;
	location?: string | null;
	capacity?: number | null;
	status: PublishStatus;
	eventType: EventType;
	ticketingMode: TicketingMode;
	externalTicketUrl?: string | null;
	externalTicketProvider?: string | null;
	thumbnailId?: string | null;
	enableCheckIn: boolean;
	metaData?: any;
	createdById: string;
	updatedById: string;
	createdAt: Date;
	updatedAt: Date;
};

export type EventSession = {
	id: string;
	eventId: string;
	title: string;
	description?: string | null;
	startTime: Date;
	endTime: Date;
	speaker?: string | null;
	capacity?: number | null;
	room?: string | null;
	createdAt: Date;
	updatedAt: Date;
};

export type TicketType = {
	id: string;
	eventId: string;
	name: string;
	description?: string | null;
	price: number;
	quantity: number;
	maxPerUser: number;
	saleStart?: Date | null;
	saleEnd?: Date | null;
	isActive: boolean;
	isExternal: boolean;
	createdAt: Date;
	updatedAt: Date;
};

export type Payment = {
	id: string;
	userId: string;
	amount: number;
	currency: string;
	status: TransactionStatus;
	paymentMethod?: string | null;
	paymentId?: string | null;
	description?: string | null;
	metadata?: any;
	createdAt: Date;
	updatedAt: Date;
};

export type Ticket = {
	id: string;
	ticketTypeId: string;
	userId: string;
	qrCode: string;
	status: TicketStatus;
	purchasedAt: Date;
	usedAt?: Date | null;
	paymentId?: string | null;
	registrationId?: string | null;
	createdAt: Date;
	updatedAt: Date;
};

export type Registration = {
	id: string;
	eventId: string;
	userId?: string | null;
	status: RegistrationStatus;
	ticketSource: TicketSource;
	externalTicketId?: string | null;
	customData?: any;
	registeredAt: Date;
	checkedInAt?: Date | null;
	checkedInById?: string | null;
	createdAt: Date;
	updatedAt: Date;
};

export type CheckIn = {
	id: string;
	registrationId: string;
	checkedInAt: Date;
	checkedInById: string;
	location?: string | null;
	deviceInfo?: any;
	createdAt: Date;
};

// Re-export Prisma enums for convenience
export { PublishStatus, TransactionStatus, EventType, TicketingMode, ProcessStatus, TicketSource, RegistrationStatus };

// Legacy type aliases for backward compatibility
export type EventStatus = PublishStatus;
export type PaymentStatus = TransactionStatus;
export type TicketStatus = "SOLD" | "USED" | "REFUNDED" | "CANCELLED";

// Add missing enums
export enum CheckInStatus {
	NOT_CHECKED_IN = "NOT_CHECKED_IN",
	CHECKED_IN = "CHECKED_IN",
}

// Base types with relations
export type EventWithRelations = Event & {
	sessions?: EventSession[];
	ticketTypes?: TicketType[];
	registrations?: Registration[];
	knowledge?: any[]; // Knowledge articles related to this event
	thumbnail?: any; // Media
	createdBy?: any; // User
	updatedBy?: any; // User
};

export type RegistrationWithRelations = Registration & {
	event?: Event;
	user?: any; // User
	tickets?: (Ticket & { ticketType: TicketType })[]; // Add tickets relation with populated ticketType
	totalAmount?: number; // Calculated field
	checkInStatus?: CheckInStatus; // Calculated field
	checkedInBy?: any; // User
	checkIns?: CheckIn[];
};

export type PaymentWithRelations = Payment & {
	user?: any; // User
	tickets?: Ticket[];
};

// Form types for API
export type CreateEventInput = {
	title: string;
	slug: string;
	description: string;
	startDate: Date;
	endDate: Date;
	location?: string;
	capacity?: number;
	eventType: EventType;
	ticketingMode: TicketingMode;
	externalTicketUrl?: string;
	externalTicketProvider?: string;
	thumbnailId?: string;
	enableCheckIn?: boolean;
	metaData?: any;
};

export type UpdateEventInput = Partial<CreateEventInput> & {
	status?: PublishStatus;
};

export type CreateEventSessionInput = {
	eventId: string;
	title: string;
	description?: string;
	startTime: Date;
	endTime: Date;
	speaker?: string;
	capacity?: number;
	room?: string;
};

export type UpdateEventSessionInput = Partial<CreateEventSessionInput>;

export type CreateTicketTypeInput = {
	eventId: string;
	name: string;
	description?: string;
	price: number;
	quantity: number;
	maxPerUser?: number;
	saleStart?: Date;
	saleEnd?: Date;
	isActive?: boolean;
	isExternal?: boolean;
};

export type UpdateTicketTypeInput = Partial<CreateTicketTypeInput>;

export type CreateRegistrationInput = {
	eventId: string;
	userId?: string;
	ticketSource?: TicketSource;
	externalTicketId?: string;
	customData?: any;
};

export type CreatePaymentInput = {
	userId: string;
	amount: number;
	currency?: string;
	paymentMethod?: string;
	paymentId?: string;
	description?: string;
	metadata?: any;
};

export type CreateTicketInput = {
	ticketTypeId: string;
	userId: string;
	paymentId?: string;
};

export type CheckInInput = {
	registrationId: string;
	checkedInById: string;
	location?: string;
	deviceInfo?: any;
};

// Resilience types
export type RetryConfig = {
	maxAttempts: number;
	backoffMs: number;
	exponential?: boolean;
};

export type DraftData = {
	id?: string;
	eventId: string;
	userId?: string;
	data: any;
	expiresAt: Date;
};

// Error types
export class EventError extends Error {
	constructor(
		message: string,
		public code: string,
		public statusCode: number = 400,
	) {
		super(message);
		this.name = "EventError";
	}
}

export class PaymentError extends EventError {
	constructor(
		message: string,
		public paymentId?: string,
	) {
		super(message, "PAYMENT_ERROR", 402);
		this.name = "PaymentError";
	}
}

export class QuotaExceededError extends EventError {
	constructor(message: string = "API quota exceeded") {
		super(message, "QUOTA_EXCEEDED", 429);
		this.name = "QuotaExceededError";
	}
}

export class NetworkError extends EventError {
	constructor(message: string = "Network error occurred") {
		super(message, "NETWORK_ERROR", 503);
		this.name = "NetworkError";
	}
}

// Utility types
export type EventFilters = {
	status?: EventStatus;
	eventType?: EventType;
	ticketingMode?: TicketingMode;
	startDate?: Date;
	endDate?: Date;
	createdById?: string;
};

export type RegistrationFilters = {
	eventId?: string;
	userId?: string;
	status?: RegistrationStatus;
	ticketSource?: TicketSource;
	checkedIn?: boolean;
	createdAfter?: Date;
	createdBefore?: Date;
	search?: string;
};

export type PaymentFilters = {
	userId?: string;
	status?: TransactionStatus;
	paymentMethod?: string;
	createdAfter?: Date;
	createdBefore?: Date;
};

// ============================================================================
// UTILITY TYPES
// ============================================================================

// ActionResult and PaginatedResult are now imported from @/lib/types

/**
 * EventPaginatedResult - Event-specific paginated result
 */
export interface EventPaginatedResult<T> {
	data: T[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
}
