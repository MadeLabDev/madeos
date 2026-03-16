"use client";

import { useState } from "react";

import { Save, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";

import { TechPackForm } from "../../../components/tech-pack-form";

interface EditTechPackFormProps {
	id: string;
}

export function EditTechPackForm({ id }: EditTechPackFormProps) {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);

	function handleCancel() {
		router.push(`/design-projects/tech-packs/${id}`);
	}

	// Handle form submit via button in header
	const handleHeaderSubmit = async () => {
		setIsSubmitting(true);
		try {
			const submitBtn = document.querySelector('form[data-tech-pack-form] button[type="submit"]') as HTMLButtonElement;
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
					<h1 className="text-3xl font-bold tracking-tight">Edit Tech Pack</h1>
					<p className="text-muted-foreground">Update the tech pack information</p>
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
						Update Tech Pack
					</Button>
				</div>
			</div>

			{/* Form */}
			<TechPackForm
				techPackId={id}
				hideButtons={true}
				hideHeader={true}
			/>
		</div>
	);
}
