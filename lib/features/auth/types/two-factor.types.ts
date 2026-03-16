/**
 * Two-Factor Authentication Types
 */

export interface TwoFactorSetupData {
	secret: string;
	qrCodeDataURL: string;
	backupCodes: string[];
}

export interface Enable2FAInput {
	token: string; // Verification token from authenticator app
}

export interface Verify2FAInput {
	token: string; // Token or backup code
	isBackupCode?: boolean;
}

export interface TwoFactorStatus {
	enabled: boolean;
	backupCodesCount: number;
}
