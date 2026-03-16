"use server";

import { activateAccount, validateActivationToken } from "@/lib/features/users/services/user-service";

/**
 * Validate activation token
 */
export async function validateTokenAction(token: string) {
	try {
		const result = await validateActivationToken(token);
		return result;
	} catch (error) {
		return {
			valid: false,
			message: error instanceof Error ? error.message : "Invalid token",
		};
	}
}

/**
 * Activate user account with token and password
 */
export async function activateAccountAction(token: string, password: string) {
	try {
		const result = await activateAccount(token, password);
		return {
			success: true,
			message: result.message,
		};
	} catch (error) {
		return {
			success: false,
			message: error instanceof Error ? error.message : "Failed to activate account",
		};
	}
}
