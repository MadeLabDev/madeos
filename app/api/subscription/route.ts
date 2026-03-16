import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { emailService } from "@/lib/email/service";

// Validation schema for class event subscription
const ClassEventSubscriptionSchema = z.object({
	email: z.string().email({ message: "Please enter a valid email address" }),
	firstName: z.string().min(1, "First name is required").max(100),
	lastName: z.string().min(1, "Last name is required").max(100),
	audienID: z.string().min(1, "Audience ID is required"),
});

export async function POST(request: NextRequest) {
	try {
		// Parse and validate request body
		const body = await request.json();
		const validatedData = ClassEventSubscriptionSchema.parse(body);
		const { email, firstName, lastName, audienID } = validatedData;

		// Parse audience IDs safely
		let audienceIds: number[];
		try {
			audienceIds = audienID.split(",").map((item: string) => {
				const parsed = parseInt(item.trim());
				if (isNaN(parsed)) {
					throw new Error("Invalid audience ID format");
				}
				return parsed;
			});
		} catch (error) {
			return NextResponse.json(
				{
					error: "Invalid audience ID format. Please provide comma-separated numbers.",
				},
				{ status: 400 },
			);
		}

		// Prepare Brevo API request for creating contact
		const createContactOptions = {
			method: "POST",
			headers: {
				accept: "application/json",
				"content-type": "application/json",
				"api-key": process.env.BREVO_API ?? "",
			},
			body: JSON.stringify({
				email: email,
				listIds: audienceIds,
				attributes: {
					FIRSTNAME: firstName,
					LASTNAME: lastName,
				},
				emailBlacklisted: false,
				smsBlacklisted: false,
				updateEnabled: true,
				status: "subscribed",
			}),
		};

		// Create contact in Brevo
		const createContactResponse = await fetch("https://api.brevo.com/v3/contacts", createContactOptions);
		if (!createContactResponse.ok) {
			const errorData = await createContactResponse.json().catch(() => ({}));
			console.error("Brevo contact creation failed:", errorData);

			return NextResponse.json(
				{
					message: "Error creating contact. Please try again.",
					success: false,
				},
				{ status: 400 },
			);
		}

		// Send emails in parallel with proper error handling
		const [userEmailResult, adminEmailResult] = await Promise.allSettled([emailService.sendSubscriptionEmail(email, firstName, lastName), emailService.sendAdminSubscriptionNotification(process.env.ADMIN_EMAIL || "admin@madelab.io", firstName, lastName, email)]);

		// Log email results without throwing errors
		if (userEmailResult.status === "fulfilled" && userEmailResult.value.success) {
			console.log("Subscription confirmation email sent to user successfully");
		} else {
			console.error("Failed to send subscription email to user:", userEmailResult.status === "rejected" ? userEmailResult.reason : userEmailResult.value);
		}

		if (adminEmailResult.status === "fulfilled" && adminEmailResult.value.success) {
			console.log("Admin notification email sent successfully");
		} else {
			console.error("Failed to send admin notification email:", adminEmailResult.status === "rejected" ? adminEmailResult.reason : adminEmailResult.value);
		}

		return NextResponse.json(
			{
				message: "Awesome! You have successfully subscribed!",
				success: true,
			},
			{ status: 201 },
		);
	} catch (error) {
		console.error("Class event subscription error:", error);

		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{
					message: "Validation failed",
					errors: error.issues,
					success: false,
				},
				{ status: 400 },
			);
		}

		return NextResponse.json(
			{
				message: "Subscription failed. Please try again.",
				success: false,
			},
			{ status: 500 },
		);
	}
}
