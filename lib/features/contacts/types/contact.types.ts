/**
 * Contact Types
 */
export type Contact = {
	id: string;
	customerId: string;
	firstName: string;
	lastName: string;
	email: string;
	phone?: string | null;
	title?: string | null;
	isPrimary: boolean;
	tags?: string | null;
	metaData?: any;
	createdAt: Date;
	updatedAt: Date;
	createdBy?: string | null;
	updatedBy?: string | null;
};

export type ContactResponse = Contact;

export interface CreateContactInput {
	firstName: string;
	lastName: string;
	email: string;
	phone?: string;
	title?: string;
	customerId: string;
	isPrimary?: boolean;
	tags?: string;
	metaData?: Record<string, any>;
}

export interface UpdateContactInput {
	firstName?: string;
	lastName?: string;
	email?: string;
	phone?: string;
	title?: string;
	customerId?: string;
	isPrimary?: boolean;
	tags?: string;
	metaData?: Record<string, any>;
}

export interface ContactListParams {
	page?: number;
	pageSize?: number;
	search?: string;
	customerId?: string;
}

export type ContactFilters = {
	search?: string;
	customerId?: string;
	tags?: string;
	isPrimary?: boolean;
};

export type ContactListPageProps = {
	searchParams: {
		search?: string;
		customerId?: string;
		tags?: string;
		isPrimary?: string;
		page?: string;
		limit?: string;
	};
};

export type ContactDetailPageProps = {
	params: {
		id: string;
	};
};

export type EditContactPageProps = {
	params: {
		id: string;
	};
};

export type ContactFormData = {
	firstName: string;
	lastName: string;
	email: string;
	phone?: string;
	title?: string;
	customerId: string;
	isPrimary: boolean;
	tags?: string;
};
