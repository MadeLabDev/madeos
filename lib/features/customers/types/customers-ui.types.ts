/**
 * Customer UI Component Types
 * Types for components in app/(dashboard)/customers/*
 */

// ============================================================================
// DISPLAY TYPES
// ============================================================================

export interface Customer {
	id: string;
	companyName: string;
	email: string;
	phone?: string;
	website?: string;
	address: string;
	city: string;
	state: string;
	zipCode: string;
	country?: string;
	contactName: string;
	contactTitle?: string;
	contactEmail?: string;
	contactPhone?: string;
	type?: string;
	taxId?: string;
	discountPercent?: number;
	paymentTermsDays?: number;
	creditLimit?: number;
	parentId?: string | null;
	isActive: boolean;
	createdAt: string;
	metaData?: Record<string, any>;
}

export interface CustomerDetail extends Customer {
	locations?: Customer[];
}

// ============================================================================
// LIST COMPONENT TYPES
// ============================================================================

export interface CustomerListProps {
	page: number;
	search: string;
	pageSize: number;
	type?: string;
}

// ============================================================================
// FORM COMPONENT TYPES
// ============================================================================

export interface CustomerFormData {
	companyName: string;
	email: string;
	phone?: string;
	website?: string;
	address: string;
	city: string;
	state: string;
	zipCode: string;
	country?: string;
	contactName: string;
	contactTitle?: string;
	contactEmail?: string;
	contactPhone?: string;
	type?: string;
	taxId?: string;
	discountPercent?: number;
	paymentTermsDays?: number;
	creditLimit?: number;
	notes?: string;
	metaData?: Record<string, any>;
}

export interface CustomerFormProps {
	customer?: Customer;
	parentCustomers?: Array<{ id: string; companyName: string }>;
	onSubmit: (data: CustomerFormData) => Promise<{ success: boolean; message: string }>;
	onCancel?: () => void;
	isLoading?: boolean;
	error?: string | null;
	hideButtons?: boolean;
	type?: string;
	moduleTypes?: any[];
}

export interface CreateCustomerFormProps extends CustomerFormProps {
	customer?: undefined;
}

export interface EditCustomerFormProps {
	customer: Customer;
	parentCustomers?: Array<{ id: string; companyName: string }>;
	moduleTypes?: any[];
}

export interface NewCustomerFormProps {
	parentCustomers?: Array<{ id: string; companyName: string }>;
	type?: string;
	moduleTypes?: any[];
}

// ============================================================================
// DETAIL VIEW TYPES
// ============================================================================

export interface CustomerDetailProps {
	customerId: string;
	initialCustomer: CustomerDetail;
}

export interface CustomerDetailWrapperProps {
	customerId: string;
	initialCustomer: CustomerDetail;
}

export interface CustomerDetailPageProps {
	params: Promise<{ id: string }>;
}

export interface EditCustomerPageProps {
	params: Promise<{ id: string }>;
}

// ============================================================================
// PARENT COMPANY SEARCH TYPES
// ============================================================================

export interface ParentCustomer {
	id: string;
	companyName: string;
}

export interface ParentCompanySearchProps {
	value: string | null;
	onSelect: (customerId: string | null) => void;
	currentCustomerId?: string;
	allCustomers: ParentCustomer[];
}
