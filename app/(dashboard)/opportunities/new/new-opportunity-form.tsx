"use client";

import { useTransition } from "react";

import { Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { createOpportunityAction } from "@/lib/features/opportunities/actions";

import { OpportunityForm } from "../components";

export function NewOpportunityForm() {
	const router = useRouter();
	const [isSubmitting, startTransition] = useTransition();

	const handleSubmit = async (data: any) => {
		startTransition(async () => {
			try {
				const result = await createOpportunityAction(data);

				if (!result.success) {
					toast.error("Failed to create opportunity");
				} else {
					toast.success("Opportunity created successfully");
					router.push("/opportunities");
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
					<h1 className="text-3xl font-bold">Create New Opportunity</h1>
					<p className="text-muted-foreground">Add a new sales opportunity to track potential business</p>
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
						Create Opportunity
					</Button>
				</div>
			</div>

			<OpportunityForm
				onSubmit={handleSubmit}
				onCancel={handleCancel}
				hideButtons={true}
			/>
		</div>
	);
}
