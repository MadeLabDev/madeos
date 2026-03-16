/**
 * Two-Factor Authentication Server Actions
 * All operations require authenticated user
 */

"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { decryptSecret, encryptSecret, generateBackupCodes, generateQRCodeDataURL, generateTOTPSecret, validateTOTPSetup, verifyBackupCode, verifyTOTPToken } from "../services/two-factor-service";
import type { Enable2FAInput, TwoFactorSetupData, TwoFactorStatus, Verify2FAInput } from "../types/two-factor.types";

/**
 * Setup 2FA - Generate secret and QR code for user
 * Returns secret, QR code, and backup codes for user to save
 */
export async function setup2FAAction(): Promise<{
	success: boolean;
	message: string;
	data?: TwoFactorSetupData;
}> {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return { success: false, message: "Unauthorized" };
		}

		const user = await prisma.user.findUnique({
			where: { id: session.user.id },
			select: { email: true, name: true, twoFactorEnabled: true },
		});

		if (!user) {
			return { success: false, message: "User not found" };
		}

		if (user.twoFactorEnabled) {
			return { success: false, message: "2FA is already enabled. Please disable it first." };
		}

		// Generate TOTP secret
		const { secret, uri } = generateTOTPSecret(user.email, user.name || undefined);

		// Generate QR code
		const qrCodeDataURL = await generateQRCodeDataURL(uri);

		// Generate backup codes
		const { codes } = await generateBackupCodes(10);

		return {
			success: true,
			message: "Setup data generated successfully",
			data: {
				secret, // Plain secret for manual entry
				qrCodeDataURL, // QR code image
				backupCodes: codes, // Plain backup codes (show only once)
			},
		};
	} catch (error) {
		console.error("Setup 2FA error:", error);
		return { success: false, message: "Failed to setup 2FA" };
	}
}

/**
 * Enable 2FA - Verify token and save encrypted secret to database
 * @param input - Verification token and secret
 */
export async function enable2FAAction(
	secret: string,
	backupCodes: string[],
	input: Enable2FAInput,
): Promise<{
	success: boolean;
	message: string;
}> {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return { success: false, message: "Unauthorized" };
		}

		// Validate token
		if (!validateTOTPSetup(secret, input.token)) {
			return { success: false, message: "Invalid verification code. Please try again." };
		}

		// Encrypt secret before storing
		const encryptedSecret = encryptSecret(secret);

		// Hash backup codes
		const bcrypt = await import("bcryptjs");
		const hashedCodes = await Promise.all(backupCodes.map((code) => bcrypt.hash(code, 10)));

		// Save to database
		await prisma.user.update({
			where: { id: session.user.id },
			data: {
				twoFactorEnabled: true,
				twoFactorSecret: encryptedSecret,
				backupCodes: JSON.stringify(hashedCodes),
			},
		});

		revalidatePath("/profile");

		return {
			success: true,
			message: "Two-factor authentication enabled successfully",
		};
	} catch (error) {
		console.error("Enable 2FA error:", error);
		return { success: false, message: "Failed to enable 2FA" };
	}
}

/**
 * Disable 2FA - Remove 2FA settings from user
 * Requires current password or valid 2FA token for security
 */
export async function disable2FAAction(input: { password?: string; token?: string }): Promise<{
	success: boolean;
	message: string;
}> {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return { success: false, message: "Unauthorized" };
		}

		const user = await prisma.user.findUnique({
			where: { id: session.user.id },
			select: {
				password: true,
				twoFactorEnabled: true,
				twoFactorSecret: true,
			},
		});

		if (!user) {
			return { success: false, message: "User not found" };
		}

		if (!user.twoFactorEnabled) {
			return { success: false, message: "2FA is not enabled" };
		}

		// Verify password OR 2FA token
		let isVerified = false;

		if (input.password && user.password) {
			const bcrypt = await import("bcryptjs");
			isVerified = await bcrypt.compare(input.password, user.password);
		} else if (input.token && user.twoFactorSecret) {
			const plainSecret = decryptSecret(user.twoFactorSecret);
			isVerified = verifyTOTPToken(input.token, plainSecret);
		}

		if (!isVerified) {
			return { success: false, message: "Invalid password or verification code" };
		}

		// Remove 2FA settings
		await prisma.user.update({
			where: { id: session.user.id },
			data: {
				twoFactorEnabled: false,
				twoFactorSecret: null,
				backupCodes: null,
			},
		});

		revalidatePath("/profile");

		return {
			success: true,
			message: "Two-factor authentication disabled successfully",
		};
	} catch (error) {
		console.error("Disable 2FA error:", error);
		return { success: false, message: "Failed to disable 2FA" };
	}
}

/**
 * Get 2FA status for current user
 */
export async function get2FAStatusAction(): Promise<{
	success: boolean;
	message: string;
	data?: TwoFactorStatus;
}> {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return { success: false, message: "Unauthorized" };
		}

		const user = await prisma.user.findUnique({
			where: { id: session.user.id },
			select: {
				twoFactorEnabled: true,
				backupCodes: true,
			},
		});

		if (!user) {
			return { success: false, message: "User not found" };
		}

		const backupCodesArray = user.backupCodes ? JSON.parse(user.backupCodes) : [];

		return {
			success: true,
			message: "Status retrieved",
			data: {
				enabled: user.twoFactorEnabled,
				backupCodesCount: backupCodesArray.length,
			},
		};
	} catch (error) {
		console.error("Get 2FA status error:", error);
		return { success: false, message: "Failed to get 2FA status" };
	}
}

/**
 * Regenerate backup codes (requires current password or 2FA token)
 */
export async function regenerateBackupCodesAction(input: { password?: string; token?: string }): Promise<{
	success: boolean;
	message: string;
	data?: { backupCodes: string[] };
}> {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return { success: false, message: "Unauthorized" };
		}

		const user = await prisma.user.findUnique({
			where: { id: session.user.id },
			select: {
				password: true,
				twoFactorEnabled: true,
				twoFactorSecret: true,
			},
		});

		if (!user) {
			return { success: false, message: "User not found" };
		}

		if (!user.twoFactorEnabled) {
			return { success: false, message: "2FA is not enabled" };
		}

		// Verify password OR 2FA token
		let isVerified = false;

		if (input.password && user.password) {
			const bcrypt = await import("bcryptjs");
			isVerified = await bcrypt.compare(input.password, user.password);
		} else if (input.token && user.twoFactorSecret) {
			const plainSecret = decryptSecret(user.twoFactorSecret);
			isVerified = verifyTOTPToken(input.token, plainSecret);
		}

		if (!isVerified) {
			return { success: false, message: "Invalid password or verification code" };
		}

		// Generate new backup codes
		const { codes, hashedCodes } = await generateBackupCodes(10);

		// Update database
		await prisma.user.update({
			where: { id: session.user.id },
			data: {
				backupCodes: JSON.stringify(hashedCodes),
			},
		});

		revalidatePath("/profile");

		return {
			success: true,
			message: "Backup codes regenerated successfully",
			data: { backupCodes: codes },
		};
	} catch (error) {
		console.error("Regenerate backup codes error:", error);
		return { success: false, message: "Failed to regenerate backup codes" };
	}
}

/**
 * Verify 2FA token during login (used by auth flow)
 * This is called from the login process, not from profile
 */
export async function verify2FALoginAction(
	userId: string,
	input: Verify2FAInput,
): Promise<{
	success: boolean;
	message: string;
}> {
	try {
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: {
				twoFactorEnabled: true,
				twoFactorSecret: true,
				backupCodes: true,
			},
		});

		if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
			return { success: false, message: "2FA not enabled for this user" };
		}

		// Verify using backup code
		if (input.isBackupCode) {
			const backupCodesArray = user.backupCodes ? JSON.parse(user.backupCodes) : [];

			const { isValid, remainingCodes } = await verifyBackupCode(input.token, backupCodesArray);

			if (isValid) {
				// Update remaining backup codes
				await prisma.user.update({
					where: { id: userId },
					data: {
						backupCodes: JSON.stringify(remainingCodes),
					},
				});

				return {
					success: true,
					message: "Backup code verified successfully",
				};
			}

			return { success: false, message: "Invalid backup code" };
		}

		// Verify using TOTP token
		const plainSecret = decryptSecret(user.twoFactorSecret);
		const isValid = verifyTOTPToken(input.token, plainSecret);

		if (isValid) {
			return {
				success: true,
				message: "Verification successful",
			};
		}

		return { success: false, message: "Invalid verification code" };
	} catch (error) {
		console.error("Verify 2FA login error:", error);
		return { success: false, message: "Verification failed" };
	}
}
