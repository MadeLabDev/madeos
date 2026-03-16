import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Validation schema for site verification
const SiteVerifySchema = z.object({
	token: z.string().min(1, "Token is required"),
});

// Standard Next.js POST handler for site verification
export async function POST(request: NextRequest) {
	try {
		// Parse and validate request body
		const body = await request.json();
		const validationResult = SiteVerifySchema.safeParse(body);

		if (!validationResult.success) {
			return NextResponse.json(
				{
					message: "Validation error",
					success: "error",
					errors: validationResult.error.issues,
				},
				{ status: 400 },
			);
		}

		const { token } = validationResult.data;

		// Add debugging in development
		if (process.env.NODE_ENV === "development") {
			console.log("Received token:", token);
			console.log("Token length:", token?.length);
			console.log("Token type:", typeof token);
		}

		const endpoint = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
		const secret = process.env.TURNSTILE_API_KEY || "";

		if (!secret) {
			console.error("TURNSTILE_API_KEY is not configured");
			return NextResponse.json(
				{
					message: "Server configuration error",
					success: "error",
				},
				{ status: 500 },
			);
		}

		const requestBody = `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}`;

		const response = await fetch(endpoint, {
			method: "POST",
			body: requestBody,
			headers: {
				"content-type": "application/x-www-form-urlencoded",
			},
		});

		const data = await response.json();

		// Add debugging in development
		if (process.env.NODE_ENV === "development") {
			console.log("Turnstile response:", data);
		}

		if (!data.success) {
			return NextResponse.json(
				{
					message: "Invalid Turnstile token",
					success: "error",
					...(process.env.NODE_ENV === "development" && { debug: data }), // Include debug info in dev
				},
				{ status: 400 },
			);
		}

		return NextResponse.json(
			{
				message: "Turnstile token is valid",
				success: "success",
			},
			{ status: 200 },
		);
	} catch (error) {
		console.error("Site verify error:", error);
		return NextResponse.json(
			{
				message: "Internal server error",
				success: "error",
			},
			{ status: 500 },
		);
	}
}
