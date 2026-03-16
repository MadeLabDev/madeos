/**
 * Contact service - Business logic for contact form handling
 */

import type { ActionResult } from "@/lib/types";

import type { ContactFormData } from "../types/contact.types";

/**
 * Process contact form submission
 */
export async function submitContactForm(formData: ContactFormData): Promise<ActionResult> {
	try {
		// Log the submission for debugging
		console.log("Contact form submitted:", {
			...formData,
			submittedAt: new Date().toISOString(),
		});

		// Here you could add additional business logic:
		// - Save to database for tracking
		// - Integration with CRM systems
		// - Spam filtering
		// - etc.

		return {
			success: true,
			message: "Thank you for your message! We'll get back to you soon.",
		};
	} catch (error) {
		console.error("Contact form submission error:", error);
		return {
			success: false,
			message: "Something went wrong. Please try again later.",
		};
	}
}
