/**
 * Two-Factor Authentication (2FA) Service
 * Handles TOTP generation, verification, and backup codes
 */

import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Secret, TOTP } from "otpauth";
import QRCode from "qrcode";

// Environment variables
const APP_ISSUER = process.env.NEXT_PUBLIC_APP_ISSUER || "madelab.io";

/**
 * Generate a new TOTP secret for a user
 * @param userEmail - User's email address
 * @param userName - User's display name
 * @returns Object containing secret and otpauth URL
 */
export function generateTOTPSecret(userEmail: string, userName?: string) {
	// Generate random secret
	const secret = new Secret();

	// Create TOTP instance
	const totp = new TOTP({
		issuer: APP_ISSUER,
		label: userName || userEmail,
		algorithm: "SHA1",
		digits: 6,
		period: 30, // 30 seconds validity
		secret, // Use generated secret
	});

	return {
		secret: totp.secret.base32, // Base32 encoded secret (store this encrypted)
		uri: totp.toString(), // otpauth:// URI for QR code
	};
}

/**
 * Generate QR code as data URL for TOTP setup
 * @param otpauthUri - otpauth:// URI from TOTP
 * @returns Promise<string> - Data URL of QR code image
 */
export async function generateQRCodeDataURL(otpauthUri: string): Promise<string> {
	try {
		const qrCodeDataURL = await QRCode.toDataURL(otpauthUri, {
			errorCorrectionLevel: "H",
			type: "image/png",
			width: 300,
			margin: 2,
		});
		return qrCodeDataURL;
	} catch (error) {
		console.error("Error generating QR code:", error);
		throw new Error("Failed to generate QR code");
	}
}

/**
 * Verify TOTP token against secret
 * @param token - 6-digit token from authenticator app
 * @param secret - Base32 encoded secret
 * @param window - Time window tolerance (default 1 = ±30 seconds)
 * @returns boolean - True if token is valid
 */
export function verifyTOTPToken(token: string, secret: string, window: number = 1): boolean {
	try {
		const totp = new TOTP({
			secret: Secret.fromBase32(secret),
			algorithm: "SHA1",
			digits: 6,
			period: 30,
		});

		// Validate token within time window
		const delta = totp.validate({
			token,
			window, // Allow ±1 period (±30 seconds tolerance)
		});

		return delta !== null; // null means invalid, number means valid
	} catch (error) {
		console.error("Error verifying TOTP token:", error);
		return false;
	}
}

/**
 * Generate backup codes for 2FA recovery
 * @param count - Number of backup codes to generate (default 10)
 * @returns Object with plain codes and hashed codes
 */
export async function generateBackupCodes(count: number = 10) {
	const codes: string[] = [];
	const hashedCodes: string[] = [];

	for (let i = 0; i < count; i++) {
		// Generate 8-character alphanumeric code
		const code = crypto.randomBytes(4).toString("hex").toUpperCase();

		// Format as XXXX-XXXX for better readability
		const formattedCode = `${code.slice(0, 4)}-${code.slice(4, 8)}`;
		codes.push(formattedCode);

		// Hash the code before storing
		const hashedCode = await bcrypt.hash(formattedCode, 10);
		hashedCodes.push(hashedCode);
	}

	return {
		codes, // Plain codes to show to user (only once)
		hashedCodes, // Hashed codes to store in database
	};
}

/**
 * Verify backup code against stored hashed codes
 * @param inputCode - Backup code entered by user
 * @param hashedCodes - Array of hashed backup codes from database
 * @returns Object with isValid flag and remaining hashed codes
 */
export async function verifyBackupCode(inputCode: string, hashedCodes: string[]): Promise<{ isValid: boolean; remainingCodes: string[] }> {
	// Normalize input (remove spaces, convert to uppercase)
	const normalizedInput = inputCode.replace(/\s+/g, "").toUpperCase();

	// Try to match against each stored code
	for (let i = 0; i < hashedCodes.length; i++) {
		const hashedCode = hashedCodes[i];
		if (!hashedCode) continue;

		const isMatch = await bcrypt.compare(normalizedInput, hashedCode);

		if (isMatch) {
			// Remove used code
			const remainingCodes = hashedCodes.filter((_, index) => index !== i);
			return { isValid: true, remainingCodes };
		}
	}

	return { isValid: false, remainingCodes: hashedCodes };
}

/**
 * Encrypt TOTP secret before storing in database
 * @param secret - Plain text secret
 * @returns Encrypted secret
 */
export function encryptSecret(secret: string): string {
	const algorithm = "aes-256-cbc";
	const key = Buffer.from(process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString("hex"), "hex").slice(0, 32);
	const iv = crypto.randomBytes(16);

	const cipher = crypto.createCipheriv(algorithm, key, iv);
	let encrypted = cipher.update(secret, "utf8", "hex");
	encrypted += cipher.final("hex");

	return `${iv.toString("hex")}:${encrypted}`;
}

/**
 * Decrypt TOTP secret from database
 * @param encryptedSecret - Encrypted secret (iv:encrypted format)
 * @returns Plain text secret
 */
export function decryptSecret(encryptedSecret: string): string {
	const algorithm = "aes-256-cbc";
	const key = Buffer.from(process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString("hex"), "hex").slice(0, 32);

	const parts = encryptedSecret.split(":");
	if (parts.length !== 2) {
		throw new Error("Invalid encrypted secret format");
	}

	const [ivHex, encrypted] = parts;
	if (!ivHex || !encrypted) {
		throw new Error("Invalid encrypted secret format");
	}

	const iv = Buffer.from(ivHex, "hex");

	const decipher = crypto.createDecipheriv(algorithm, key, iv);
	const decrypted = decipher.update(encrypted, "hex", "utf8") + decipher.final("utf8");

	return decrypted;
}

/**
 * Validate 2FA setup by checking secret and token
 * @param secret - Base32 encoded secret
 * @param token - 6-digit verification token
 * @returns boolean - True if setup is valid
 */
export function validateTOTPSetup(secret: string, token: string): boolean {
	if (!secret || !token || token.length !== 6) {
		return false;
	}

	return verifyTOTPToken(token, secret);
}
