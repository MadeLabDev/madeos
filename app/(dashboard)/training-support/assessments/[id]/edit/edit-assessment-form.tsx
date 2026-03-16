"use client";

import { useState } from "react";

import { Save, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import type { AssessmentWithRelations } from "@/lib/features/assessments";

import { AssessmentForm } from "../../../components/assessment-form";

interface EditAssessmentFormProps {
	assessment: AssessmentWithRelations;
}

export function EditAssessmentForm({ assessment }: EditAssessmentFormProps) {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleCancel = () => {
		router.back();
	};

	const handleHeaderSubmit = () => {
		setIsSubmitting(true);
		try {
			const submitBtn = document.querySelector('form[data-assessment-form] button[type="submit"]') as HTMLButtonElement | null;
			submitBtn?.click();
		} catch (error) {
			console.error("Error submitting form:", error);
		} finally {
			setTimeout(() => setIsSubmitting(false), 1000);
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Edit Assessment</h1>
					<p className="text-muted-foreground">Update assessment details and settings</p>
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
						onClick={handleHeaderSubmit}
						disabled={isSubmitting}>
						{isSubmitting && <Loader className="mr-2 h-4 w-4 animate-spin" />}
						<Save className="mr-2 h-4 w-4" />
						Save Changes
					</Button>
				</div>
			</div>

			<AssessmentForm
				initialData={assessment}
				isEditing={true}
			/>
		</div>
	);
}
