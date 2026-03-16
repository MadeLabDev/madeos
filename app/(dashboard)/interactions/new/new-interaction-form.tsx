"use client";

import { useTransition } from "react";

import { Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { createInteractionAction } from "@/lib/features/interactions/actions";

import { InteractionForm } from "../components";

interface NewInteractionFormProps {
	contacts: any[];
}

export function NewInteractionForm({ contacts }: NewInteractionFormProps) {
	const router = useRouter();
	const [isSubmitting, startTransition] = useTransition();

	const handleSubmit = async (data: any) => {
		startTransition(async () => {
			try {
				const result = await createInteractionAction(data);

				if (!result.success) {
					toast.error("Failed to create interaction");
				} else {
					toast.success("Interaction created successfully");
					router.push("/interactions");
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
					<h1 className="text-3xl font-bold">Create New Interaction</h1>
					<p className="text-muted-foreground">Log a new customer or contact interaction</p>
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
						Create Interaction
					</Button>
				</div>
			</div>

			<InteractionForm
				contacts={contacts}
				onSubmit={handleSubmit}
				onCancel={handleCancel}
				hideButtons={true}
			/>
		</div>
	);
}
