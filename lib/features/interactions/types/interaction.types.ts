import { InteractionType } from "@/generated/prisma/enums";

/**
 * Interaction Types
 */
export type Interaction = {
	id: string;
	customerId?: string | null;
	contactId?: string | null;
	testOrderId?: string | null;
	type: InteractionType;
	subject: string;
	description?: string | null;
	date: Date;
	duration?: number | null;
	participants?: string | null;
	outcome?: string | null;
	createdAt: Date;
	updatedAt: Date;
	createdBy?: string | null;
	updatedBy?: string | null;
};

export type InteractionResponse = Interaction;

export interface CreateInteractionInput {
	customerId?: string;
	contactId?: string;
	testOrderId?: string;
	type: InteractionType;
	subject: string;
	description?: string;
	date: Date;
	duration?: number;
	participants?: string;
	outcome?: string;
}

export interface UpdateInteractionInput {
	customerId?: string;
	contactId?: string;
	testOrderId?: string;
	type?: InteractionType;
	subject?: string;
	description?: string;
	date?: Date;
	duration?: number;
	participants?: string;
	outcome?: string;
}

export interface InteractionListParams {
	page?: number;
	pageSize?: number;
	search?: string;
	customerId?: string;
	contactId?: string;
	type?: InteractionType;
}

export interface InteractionFilters {
	search?: string;
	customerId?: string;
	contactId?: string;
	type?: string;
	dateFrom?: string;
	dateTo?: string;
}

export interface InteractionFormData {
	type: string;
	subject: string;
	description?: string;
	date: Date;
	duration?: number;
	participants?: string;
	outcome?: string;
	customerId?: string;
	contactId?: string;
}

export interface InteractionListPageProps {
	searchParams: {
		search?: string;
		customerId?: string;
		contactId?: string;
		type?: string;
		dateFrom?: string;
		dateTo?: string;
		page?: string;
		limit?: string;
	};
}

export interface InteractionDetailPageProps {
	params: {
		id: string;
	};
}

export interface EditInteractionPageProps {
	params: {
		id: string;
	};
}
