/**
 * CORS Configuration Helper
 * Centralized CORS settings for API routes
 */

const ALLOWED_DOMAINS = ["madelab.io"];

export function isAllowedOrigin(origin: string | null): boolean {
	if (!origin) return false;

	try {
		const url = new URL(origin);
		const hostname = url.hostname;

		// Allow localhost and 127.0.0.1 in development
		if (process.env.NODE_ENV === "development" && (hostname === "localhost" || hostname === "127.0.0.1")) {
			return true;
		}

		// Check if hostname is or ends with allowed domain
		return ALLOWED_DOMAINS.some((domain) => hostname === domain || hostname.endsWith("." + domain));
	} catch {
		return false;
	}
}

export function getCORSHeaders(origin: string | null) {
	const safeOrigin = isAllowedOrigin(origin) ? origin : "*";
	return {
		"Access-Control-Allow-Origin": safeOrigin,
		"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
		"Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
		"Access-Control-Allow-Credentials": "true",
		"Access-Control-Max-Age": "86400", // 24 hours
	};
}

export function corsResponse(status = 200, headers?: Record<string, string>) {
	return new Response(null, {
		status,
		headers: {
			...getCORSHeaders(null),
			...(headers || {}),
		} as Record<string, string>,
	});
}
