"use client";

import { useEffect, useState } from "react";

import { Save, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";

import { DesignReviewForm } from "../../components/design-review-form";

export function NewDesignReviewForm() {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);

	function handleCancel() {
		router.push("/design-projects/design-reviews");
	}

	// Handle form submit via button in header
	const handleHeaderSubmit = async () => {
		setIsSubmitting(true);
		try {
			const submitBtn = document.querySelector('form[data-design-review-form] button[type="submit"]') as HTMLButtonElement;
			submitBtn?.click();
		} catch (error) {
			console.error("Error submitting form:", error);
		} finally {
			// Reset submitting state after a short delay to allow form to handle submission
			setTimeout(() => setIsSubmitting(false), 1000);
		}
	};

	// Listen for form success event
	useEffect(() => {
		const handleSuccess = (event: CustomEvent) => {
			const { data } = event.detail;
			if (data?.id) {
				router.push(`/design-projects/design-reviews/${data.id}`);
			}
		};

		window.addEventListener("design-review-form-success", handleSuccess as EventListener);
		return () => {
			window.removeEventListener("design-review-form-success", handleSuccess as EventListener);
		};
	}, [router]);

	return (
		<div className="space-y-6">
			{/* Header with Actions */}
			<div className="flex items-center justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Create Design Review</h1>
					<p className="text-muted-foreground">Create a new design review for feedback and approval</p>
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
						Create Design Review
					</Button>
				</div>
			</div>

			{/* Form */}
			<DesignReviewForm
				hideButtons={true}
				hideHeader={true}
			/>
		</div>
	);
}
