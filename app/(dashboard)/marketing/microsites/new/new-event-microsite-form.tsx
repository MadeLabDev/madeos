"use client";

import { useState } from "react";

import { Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { createEventMicrositeAction } from "@/lib/features/marketing/actions";

import { EventMicrositeForm } from "../../components/event-microsite-form";

interface NewEventMicrositeFormProps {
	event: {
		id: string;
		title: string;
		description?: string | null;
		startDate: Date;
		endDate: Date;
		status: string;
		location?: string | null;
	};
}

export function NewEventMicrositeForm({ event }: NewEventMicrositeFormProps) {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (formData: any) => {
		setIsSubmitting(true);
		try {
			const result = await createEventMicrositeAction(formData);

			if (result.success) {
				toast.success("Success", {
					description: result.message || "Event microsite created successfully",
				});
				router.push(`/marketing/microsites/${event.id}`);
			} else {
				toast.error("Error", {
					description: result.message || "Failed to create microsite",
				});
			}
			return result;
		} catch (error) {
			toast.error("Error", {
				description: error instanceof Error ? error.message : "An error occurred",
			});
			return { success: false, message: "An error occurred" };
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleCancel = () => {
		router.push(`/marketing/microsites/${event.id}`);
	};

	// Handle form submit via button in header
	const handleHeaderSubmit = async () => {
		const submitBtn = document.querySelector('form[data-microsite-form] button[type="submit"]') as HTMLButtonElement;
		submitBtn?.click();
	};

	return (
		<div className="space-y-6">
			{/* Header with Actions */}
			<div className="flex items-center justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">New Event Microsite</h1>
					<p className="text-muted-foreground">
						Create a public microsite for the event: <strong>{event.title}</strong>
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
						Create Microsite
					</Button>
				</div>
			</div>

			{/* Form */}
			<EventMicrositeForm
				event={event}
				onSubmit={handleSubmit}
				onCancel={handleCancel}
				hideButtons
			/>
		</div>
	);
}
