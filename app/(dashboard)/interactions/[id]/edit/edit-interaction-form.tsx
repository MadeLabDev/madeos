"use client";

import { useTransition } from "react";

import { Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { updateInteractionAction } from "@/lib/features/interactions/actions";
import type { Interaction, InteractionFormData } from "@/lib/features/interactions/types";

import { InteractionForm } from "../../components/interaction-form";

interface EditInteractionFormProps {
	interaction: Interaction;
	contacts: any[];
}

export function EditInteractionForm({ interaction, contacts }: EditInteractionFormProps) {
	const router = useRouter();
	const [isSubmitting, startTransition] = useTransition();

	const handleSubmit = async (data: InteractionFormData) => {
		startTransition(async () => {
			try {
				const result = await updateInteractionAction(interaction.id, {
					...data,
					type: data.type as any,
				});

				if (!result.success) {
					toast.error("Failed to update interaction");
				} else {
					toast.success("Interaction updated successfully");
					router.push(`/interactions/${interaction.id}`);
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
		const submitBtn = document.querySelector('form[data-interaction-form] button[type="submit"]') as HTMLButtonElement;
		submitBtn?.click();
	};

	return (
		<div className="space-y-6">
			{/* Header with Actions */}
			<div className="flex items-center justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold">Edit Interaction</h1>
					<p className="text-muted-foreground">Update interaction details for {interaction.subject}</p>
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
						Update Interaction
					</Button>
				</div>
			</div>

			<InteractionForm
				interaction={interaction}
				contacts={contacts}
				onSubmit={handleSubmit}
				onCancel={handleCancel}
				hideButtons
			/>
		</div>
	);
}
