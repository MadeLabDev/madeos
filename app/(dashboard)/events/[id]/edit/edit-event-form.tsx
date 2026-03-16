"use client";

import { useState } from "react";

import { Save, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";

import { EventForm } from "../../components/event-form";

interface EditEventFormProps {
	eventId: string;
}

export function EditEventForm({ eventId }: EditEventFormProps) {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleCancel = () => {
		router.back();
	};

	const handleHeaderSubmit = () => {
		setIsSubmitting(true);
		try {
			const submitBtn = document.querySelector('form[data-event-form] button[type="submit"]') as HTMLButtonElement | null;
			submitBtn?.click();
		} catch (error) {
			console.error("Error submitting form:", error);
		} finally {
			// Reset submitting state after a short delay to allow form to handle submission
			setTimeout(() => setIsSubmitting(false), 1000);
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Edit Event</h1>
					<p className="text-muted-foreground">Update event information and settings</p>
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
						{!isSubmitting && <Save className="mr-2 h-4 w-4" />}
						Update Event
					</Button>
				</div>
			</div>

			<EventForm
				eventId={eventId}
				hideButtons={true}
			/>
		</div>
	);
}
