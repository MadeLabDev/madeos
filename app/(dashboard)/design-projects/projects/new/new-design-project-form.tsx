"use client";

import { useState } from "react";

import { Save, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";

import { DesignProjectForm } from "../../components/design-project-form";

export function NewDesignProjectForm() {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);

	function handleCancel() {
		router.push("/design-projects/projects");
	}

	// Handle form submit via button in header
	const handleHeaderSubmit = async () => {
		setIsSubmitting(true);
		try {
			const submitBtn = document.querySelector('form[data-design-project-form] button[type="submit"]') as HTMLButtonElement;
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
					<h1 className="text-3xl font-bold tracking-tight">Create Design Project</h1>
					<p className="text-muted-foreground">Create a new design project from an engagement</p>
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
						Create Design Project
					</Button>
				</div>
			</div>

			{/* Form */}
			<DesignProjectForm
				hideButtons={true}
				hideHeader={true}
			/>
		</div>
	);
}
