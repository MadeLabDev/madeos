"use server";

import bcrypt from "bcryptjs";
import crypto from "crypto";

import { emailService } from "@/lib/email/service";
import { prisma } from "@/lib/prisma";

import { ForgotPasswordInput, ForgotPasswordResult, ResetPasswordInput, ResetPasswordResult, ValidateResetTokenResult } from "../types/auth.types";

/**
 * Initiate password reset process
 * Generates a reset token and sends email to user
 */
export async function forgotPassword(input: ForgotPasswordInput): Promise<ForgotPasswordResult> {
	try {
		const { email } = input;

		if (!email) {
			return {
				success: false,
				message: "Email is required",
			};
		}

		// Find user by email
		const user = await prisma.user.findUnique({
			where: { email: email.toLowerCase() },
		});

		// Always return success to prevent email enumeration
		// But only send email if user exists
		if (user) {
			// Generate reset token
			const resetToken = crypto.randomBytes(32).toString("hex");
			const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

			// Save token to database
			await prisma.user.update({
				where: { id: user.id },
				data: {
					resetToken,
					resetTokenExpiry,
				},
			});

			// Send email
			await emailService.sendResetPasswordEmail(user.email, user.name || "User", resetToken);
		}

		return {
			success: true,
			message: "If an account exists with this email, you will receive a password reset link",
		};
	} catch (error) {
		console.error("Forgot password error:", error);
		return {
			success: false,
			message: "Failed to process request",
		};
	}
}

/**
 * Validate reset token
 * Checks if token exists and is not expired
 */
export async function validateResetToken(token: string): Promise<ValidateResetTokenResult> {
	try {
		if (!token) {
			return { valid: false };
		}

		const user = await prisma.user.findFirst({
			where: {
				resetToken: token,
				resetTokenExpiry: {
					gte: new Date(), // Token must not be expired
				},
			},
		});

		return { valid: !!user };
	} catch (error) {
		console.error("Validate token error:", error);
		return { valid: false };
	}
}

/**
 * Reset password with valid token
 * Updates password and clears reset token
 */
export async function resetPassword(input: ResetPasswordInput): Promise<ResetPasswordResult> {
	try {
		const { token, password } = input;

		if (!token || !password) {
			return {
				success: false,
				message: "Token and password are required",
			};
		}

		if (password.length < 8) {
			return {
				success: false,
				message: "Password must be at least 8 characters",
			};
		}

		// Find user with valid token
		const user = await prisma.user.findFirst({
			where: {
				resetToken: token,
				resetTokenExpiry: {
					gte: new Date(), // Token must not be expired
				},
			},
		});

		if (!user) {
			return {
				success: false,
				message: "Invalid or expired reset token",
			};
		}

		// Hash new password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Update password and clear reset token
		await prisma.user.update({
			where: { id: user.id },
			data: {
				password: hashedPassword,
				resetToken: null,
				resetTokenExpiry: null,
				updatedAt: new Date(),
			},
		});

		// Send confirmation email
		await emailService.sendPasswordChangedEmail(user.email, user.name || "User");

		return {
			success: true,
			message: "Password reset successfully",
		};
	} catch (error) {
		console.error("Reset password error:", error);
		return {
			success: false,
			message: "Failed to reset password",
		};
	}
}
