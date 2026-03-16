import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { broadcastToAll } from "@/lib/realtime/pusher-handler";

/**
 * POST /api/form-data/submit
 *
 * Submit external form data to be stored
 *
 * SECURITY: Accepts requests from madelab.io and localhost (development)
 *
 * Request body:
 * {
 *   key: "phc2025_after_survey",  // Unique form identifier
 *   field: [firstName, lastName, email, questionsArray]  // Form data
 * }
 *
 * Response:
 * {
 *   success: true,
 *   message: "Form data submitted successfully",
 *   data: { id: "...", key: "...", createdAt: "..." }
 * }
 */

// Allowed domains for form submission
const ALLOWED_DOMAINS = ["madelab.io"];

function isAllowedOrigin(origin: string | null): boolean {
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

function getCORSHeaders(origin: string | null) {
	return {
		"Access-Control-Allow-Origin": origin || "*",
		"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type, Authorization",
		"Access-Control-Allow-Credentials": "true",
	};
}

// Handle OPTIONS request (preflight)
export async function OPTIONS(request: NextRequest) {
	const origin = request.headers.get("origin");

	if (isAllowedOrigin(origin)) {
		return new NextResponse(null, {
			status: 200,
			headers: getCORSHeaders(origin),
		});
	}

	return new NextResponse(null, { status: 403 });
}

export async function POST(request: NextRequest) {
	try {
		// Get origin from request headers
		const origin = request.headers.get("origin");
		const referer = request.headers.get("referer");

		console.log(`[Form Submit] Origin: ${origin}, Referer: ${referer}`);

		// Validate origin
		if (!isAllowedOrigin(origin)) {
			console.warn(`[Form Submit] Rejected request from unauthorized origin: ${origin}`);
			return NextResponse.json(
				{
					success: false,
					message: "Unauthorized origin. Requests must come from madelab.io domain or localhost.",
				},
				{
					status: 403,
					headers: getCORSHeaders(origin),
				},
			);
		}
		//   );
		// }

		const body = await request.json();
		const { key, field } = body;

		// Validate required fields
		if (!key) {
			return NextResponse.json(
				{
					success: false,
					message: "Missing required field: key",
				},
				{
					status: 400,
					headers: getCORSHeaders(origin),
				},
			);
		}

		if (!field) {
			return NextResponse.json(
				{
					success: false,
					message: "Missing required field: field",
				},
				{
					status: 400,
					headers: getCORSHeaders(origin),
				},
			);
		}

		// Extract headers for metadata
		const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined;
		const userAgent = request.headers.get("user-agent") || undefined;

		// Store form data
		const formSubmission = await prisma.externalFormData.create({
			data: {
				key,
				data: {
					field,
				},
				ipAddress,
				userAgent,
				referer,
			},
			select: {
				id: true,
				key: true,
				createdAt: true,
			},
		});

		// Broadcast real-time update
		await broadcastToAll("form_data_update", {
			action: "form_data_created",
			formData: formSubmission,
			timestamp: new Date().toISOString(),
		});

		return NextResponse.json(
			{
				success: true,
				message: "Form data submitted successfully",
				data: formSubmission,
			},
			{
				status: 201,
				headers: getCORSHeaders(origin),
			},
		);
	} catch (error) {
		const origin = request.headers.get("origin");
		console.error("[Form Data Submit Error]", error);

		return NextResponse.json(
			{
				success: false,
				message: error instanceof Error ? error.message : "Failed to submit form data",
			},
			{
				status: 500,
				headers: getCORSHeaders(origin),
			},
		);
	}
}
