/**
 * User feature types
 */

export interface CreateUserInput {
	email: string;
	username?: string;
	name?: string;
	password?: string; // Optional - if not provided, send activation email
	roleIds?: string[];
	createdBy?: string;
}

export interface UpdateUserInput {
	email?: string;
	username?: string;
	name?: string;
	password?: string;
	image?: string;
	updatedBy?: string;
}

export interface MassCreateUserData {
	emails: string[];
	roleIds: string[];
}

export interface MassCreateResult {
	email: string;
	success: boolean;
	message: string;
}

export interface MassCreateResponse {
	totalCount: number;
	successCount: number;
	skipCount: number;
	failureCount: number;
	results: MassCreateResult[];
}
