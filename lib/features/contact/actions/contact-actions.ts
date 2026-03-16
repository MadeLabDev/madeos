"use server";

/**
 * Contact server actions - Thin wrapper around service layer
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { emailService } from "@/lib/email/service";
import type { ActionResult } from "@/lib/types";

import * as contactService from "../services/contact-service";
import type { ContactFormData } from "../types/contact.types";
import { contactSchema } from "../types/contact.types";

/**
 * Submit contact form (no permission check needed - public form)
 */
export async function submitContactForm(formData: ContactFormData): Promise<ActionResult> {
	try {
		// Validate the form data
		const validatedData = contactSchema.parse(formData);

		// Send confirmation email to user
		const userEmailResult = await emailService.sendContactConfirmationEmail(formData.email, formData.firstName, formData.lastName);

		if (!userEmailResult.success) {
			console.error("Failed to send confirmation email to user:", userEmailResult.error);
			// Continue with admin notification even if user email fails
		}

		// Send notification email to admin
		const adminEmail = process.env.ADMIN_EMAIL;
		if (adminEmail) {
			const adminEmailResult = await emailService.sendAdminContactNotification(adminEmail, formData.firstName, formData.lastName, formData.email, formData.phone, formData.company, formData.subject, formData.content);

			if (!adminEmailResult.success) {
				console.error("Failed to send notification email to admin:", adminEmailResult.error);
				// Don't fail the whole submission if admin email fails
			}
		} else {
			console.warn("ADMIN_EMAIL not configured, skipping admin notification");
		}

		// Call service layer for any additional business logic
		const result = await contactService.submitContactForm(validatedData);

		if (result.success) {
			revalidatePath("/contact-us");
		}

		return result;
	} catch (error) {
		if (error instanceof z.ZodError) {
			return {
				success: false,
				message: "Please check the form for errors.",
			};
		}

		console.error("Contact form submission error:", error);
		return {
			success: false,
			message: "Something went wrong. Please try again later.",
		};
	}
}
