"use client";

import { useState } from "react";

import { Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { createSponsorMaterialAction } from "@/lib/features/marketing/actions";

import SponsorMaterialForm from "../../components/sponsor-material-form";

interface NewSponsorMaterialFormProps {
	event: {
		id: string;
		title: string;
		startDate: Date;
		endDate: Date;
	};
}

export function NewSponsorMaterialForm({ event }: NewSponsorMaterialFormProps) {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (formData: any) => {
		setIsSubmitting(true);
		try {
			const result = await createSponsorMaterialAction(formData);

			if (result.success) {
				toast.success("Success", {
					description: result.message || "Sponsor material created successfully",
				});
				router.push(`/marketing/sponsors/${event.id}`);
			} else {
				toast.error("Error", {
					description: result.message || "Failed to create sponsor material",
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
		router.push(`/marketing/sponsors/${event.id}`);
	};

	// Handle form submit via button in header
	const handleHeaderSubmit = async () => {
		const submitBtn = document.querySelector('form[data-sponsor-form] button[type="submit"]') as HTMLButtonElement;
		submitBtn?.click();
	};

	return (
		<div className="space-y-6">
			{/* Header with Actions */}
			<div className="flex items-center justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">New Sponsor Material</h1>
					<p className="text-muted-foreground">
						Create sponsor material for the event: <strong>{event.title}</strong>
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
						Create Material
					</Button>
				</div>
			</div>

			{/* Form */}
			<SponsorMaterialForm
				event={event}
				onSubmit={handleSubmit}
				onCancel={handleCancel}
				hideButtons
			/>
		</div>
	);
}
