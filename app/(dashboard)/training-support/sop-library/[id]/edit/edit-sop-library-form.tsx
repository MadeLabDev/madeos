"use client";

import { useState } from "react";

import { Save, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import type { SOPLibraryWithRelations } from "@/lib/features/sop-library";

import { SOPLibraryForm } from "../../../components/sop-library-form";

interface EditSOPLibraryFormProps {
	sop: SOPLibraryWithRelations;
}

export function EditSOPLibraryForm({ sop }: EditSOPLibraryFormProps) {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleCancel = () => {
		router.back();
	};

	const handleHeaderSubmit = () => {
		setIsSubmitting(true);
		try {
			const submitBtn = document.querySelector('form[data-sop-form] button[type="submit"]') as HTMLButtonElement | null;
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
					<h1 className="text-3xl font-bold tracking-tight">Edit SOP Library Entry</h1>
					<p className="text-muted-foreground">Update SOP library information and content</p>
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
						Update SOP
					</Button>
				</div>
			</div>

			<SOPLibraryForm
				initialData={sop}
				isEditing={true}
			/>
		</div>
	);
}
