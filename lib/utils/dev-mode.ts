/**
 * Development Mode Utilities
 * Check if app is running in development mode
 */

/**
 * Check if development mode is enabled
 * Set NEXT_PUBLIC_DEV_MODE=true in .env to enable
 */
export const isDevMode = (): boolean => {
	return process.env.NEXT_PUBLIC_DEV_MODE === "true";
};

/**
 * Demo accounts for testing (only visible in dev mode)
 */
export const DEMO_ACCOUNTS = [
	{
		role: "Admin",
		email: "admin",
		password: "password123",
		description: "Full system access",
	},
	{
		role: "Manager",
		email: "manager",
		password: "password123",
		description: "Multi-department oversight",
	},
	{
		role: "Test User",
		email: "test",
		password: "password123",
		description: "For testing forgot password",
	},
];

/**
 * Dev mode banner message
 */
export const DEV_MODE_MESSAGE = "Development Mode - Demo features enabled";
