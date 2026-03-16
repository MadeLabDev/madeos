import { NextRequest, NextResponse } from "next/server";

import { getCORSHeaders, isAllowedOrigin } from "@/lib/cors";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/form-data/retrieve?key=phc2025_after_survey
 *
 * Retrieve all form submissions for a specific key (OLD FORMAT - backward compatible)
 * Matches the format from old cdn.madelaboratory.net API
 *
 * SECURITY: PUBLIC ACCESS - No authentication required
 * CORS: Allowed from localhost (dev) and *.madelab.io (prod)
 *
 * Query params:
 * - key: Form identifier (required)
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "success": true,
 *     "data": [
 *       [firstName, lastName, email, questionsArray],
 *       [firstName, lastName, email, questionsArray],
 *       ...
 *     ]
 *   }
 * }
 *
 * Example:
 * GET /api/form-data/retrieve?key=phc2025_after_survey
 *
 * {
 *   "success": true,
 *   "data": {
 *     "success": true,
 *     "data": [
 *       ["Ben", "Thompson", "ben@example.com", [{id, rating, range, comments}, ...]],
 *       ["John", "Johnson", "john@example.com", [{id, rating, range, comments}, ...]]
 *     ]
 *   }
 * }
 */

// Handle OPTIONS request (preflight)
export async function OPTIONS(request: NextRequest) {
	const origin = request.headers.get("origin");

	if (isAllowedOrigin(origin)) {
		return new NextResponse(null, {
			status: 200,
			headers: getCORSHeaders(origin) as Record<string, string>,
		});
	}

	return new NextResponse(null, { status: 403 });
}

export async function GET(request: NextRequest) {
	try {
		const origin = request.headers.get("origin");
		const { searchParams } = new URL(request.url);
		const key = searchParams.get("key");

		if (!key) {
			return NextResponse.json(
				{
					success: false,
					message: "Missing required query parameter: key",
				},
				{
					status: 400,
					headers: getCORSHeaders(origin) as Record<string, string>,
				},
			);
		}

		// Fetch all data for this key
		const submissions = await prisma.externalFormData.findMany({
			where: { key },
			select: {
				data: true,
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		// Transform to match old API format: extract field array from each submission
		// Each submission has { field: [firstName, lastName, email, questionsArray] }
		const formattedData = submissions.map((submission) => {
			return (submission.data as any)?.field || [];
		});

		return NextResponse.json(
			{
				success: true,
				data: {
					success: true,
					data: formattedData,
				},
			},
			{
				status: 200,
				headers: getCORSHeaders(origin) as Record<string, string>,
			},
		);
	} catch (error) {
		const origin = request.headers.get("origin");
		console.error("[Form Data Retrieve Error]", error);

		return NextResponse.json(
			{
				success: false,
				message: error instanceof Error ? error.message : "Failed to retrieve form data",
			},
			{
				status: 500,
				headers: getCORSHeaders(origin) as Record<string, string>,
			},
		);
	}
}
