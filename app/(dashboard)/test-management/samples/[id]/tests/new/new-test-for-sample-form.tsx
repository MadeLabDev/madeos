"use client";

import { useState } from "react";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";

import { TestForm } from "../../../../components";

interface NewTestForSampleFormProps {
	sampleId: string;
}

export function NewTestForSampleForm({ sampleId }: NewTestForSampleFormProps) {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);

	function handleCancel() {
		router.push(`/test-management/samples/${sampleId}`);
	}

	// Handle form submit via button in header
	const handleHeaderSubmit = async () => {
		setIsSubmitting(true);
		try {
			const submitBtn = document.querySelector('form[data-test-form] button[type="submit"]') as HTMLButtonElement;
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
			{/* Header with Actions */}
			<div className="flex items-center justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Create Test</h1>
					<p className="text-muted-foreground">Create a new test for this sample</p>
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
						Create Test
					</Button>
				</div>
			</div>

			{/* Form */}
			<TestForm
				sampleId={sampleId}
				hideButtons={true}
			/>
		</div>
	);
}
