import { z } from "zod";

// Contact form validation schema
export const contactSchema = z.object({
	firstName: z.string().min(1, "First name is required"),
	lastName: z.string().min(1, "Last name is required"),
	email: z.string().email("Please enter a valid email address"),
	phone: z.string().min(1, "Phone number is required"),
	company: z.string().optional(),
	subject: z.string().min(1, "Subject is required"),
	content: z.string().min(10, "Message must be at least 10 characters"),
});

export type ContactFormData = z.infer<typeof contactSchema>;

export type ActionResult<T = any> = {
	success: boolean;
	message?: string;
	data?: T;
	errors?: Record<string, string[]>;
};
