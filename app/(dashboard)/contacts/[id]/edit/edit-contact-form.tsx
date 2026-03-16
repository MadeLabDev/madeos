"use client";

import { useState, useTransition } from "react";

import { Loader, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { updateContactAction } from "@/lib/features/contacts/actions";
import type { Contact, ContactFormData } from "@/lib/features/contacts/types";

import { ContactForm } from "../../components/contact-form";

interface EditContactFormProps {
	contact: Contact;
}

export function EditContactForm({ contact }: EditContactFormProps) {
	const router = useRouter();
	const [, startTransition] = useTransition();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (data: ContactFormData) => {
		setIsSubmitting(true);
		startTransition(async () => {
			try {
				const result = await updateContactAction(contact.id, {
					...data,
				});

				if (!result.success) {
					toast.error("Failed to update contact");
				} else {
					toast.success("Contact updated successfully");
					router.push(`/contacts/${contact.id}`);
				}
			} catch (error) {
				toast.error("An unexpected error occurred");
			} finally {
				setIsSubmitting(false);
			}
		});
	};

	const handleCancel = () => {
		router.back();
	};

	// Handle form submit via button in header
	const handleHeaderSubmit = async () => {
		const submitBtn = document.querySelector('form[data-contact-form] button[type="submit"]') as HTMLButtonElement;
		submitBtn?.click();
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold">Edit Contact</h1>
					<p className="text-muted-foreground">
						Update contact information for {contact.firstName} {contact.lastName}
					</p>
				</div>
				<div className="flex gap-3">
					<Button
						type="button"
						variant="outline"
						onClick={handleCancel}
						disabled={isSubmitting}>
						<X className="mr-2 h-4 w-4" />
						Cancel
					</Button>
					<Button
						type="button"
						onClick={handleHeaderSubmit}
						disabled={isSubmitting}>
						{isSubmitting && (
							<Loader
								size="sm"
								className="mr-2"
							/>
						)}
						<Save className="mr-2 h-4 w-4" />
						Update Contact
					</Button>
				</div>
			</div>

			<ContactForm
				contact={contact}
				hideButtons
				onSubmit={handleSubmit}
				onCancel={handleCancel}
			/>
		</div>
	);
}
