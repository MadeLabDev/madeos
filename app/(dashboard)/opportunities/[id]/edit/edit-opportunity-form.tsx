"use client";

import { useTransition } from "react";

import { Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { updateOpportunityAction } from "@/lib/features/opportunities/actions";
import type { Opportunity, OpportunityFormData } from "@/lib/features/opportunities/types";

import { OpportunityForm } from "../../components/opportunity-form";

interface EditOpportunityFormProps {
	opportunity: Opportunity;
}

export function EditOpportunityForm({ opportunity }: EditOpportunityFormProps) {
	const router = useRouter();
	const [isSubmitting, startTransition] = useTransition();

	const handleSubmit = async (data: OpportunityFormData) => {
		startTransition(async () => {
			try {
				const result = await updateOpportunityAction(opportunity.id, {
					...data,
					stage: data.stage as any,
				});

				if (!result.success) {
					toast.error("Failed to update opportunity");
				} else {
					toast.success("Opportunity updated successfully");
					router.push(`/opportunities/${opportunity.id}`);
				}
			} catch (error) {
				toast.error("An unexpected error occurred");
			}
		});
	};

	const handleCancel = () => {
		router.back();
	};

	// Handle form submit via button in header
	const handleHeaderSubmit = async () => {
		const submitBtn = document.querySelector('form[data-opportunity-form] button[type="submit"]') as HTMLButtonElement;
		submitBtn?.click();
	};

	return (
		<div className="space-y-6">
			{/* Header with Actions */}
			<div className="flex items-center justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold">Edit Opportunity</h1>
					<p className="text-muted-foreground">Update opportunity details for {opportunity.title}</p>
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
						Update Opportunity
					</Button>
				</div>
			</div>

			<OpportunityForm
				opportunity={opportunity}
				onSubmit={handleSubmit}
				onCancel={handleCancel}
				hideButtons
			/>
		</div>
	);
}
