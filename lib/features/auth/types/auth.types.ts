export interface ForgotPasswordInput {
	email: string;
}

export interface ForgotPasswordResult {
	success: boolean;
	message: string;
}

export interface ResetPasswordInput {
	token: string;
	password: string;
}

export interface ResetPasswordResult {
	success: boolean;
	message: string;
}

export interface ValidateResetTokenResult {
	valid: boolean;
}
