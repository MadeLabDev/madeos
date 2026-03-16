"use client";

import { useState } from "react";

import { Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { createCustomerAction } from "@/lib/features/customers/actions/customer-actions";
import { NewCustomerFormProps } from "@/lib/features/customers/types/customers-ui.types";
import { getCustomerTypeLabels } from "@/lib/utils/metadata";

import { CustomerForm } from "../components";

export function NewCustomerForm({ parentCustomers = [], type = "customer", moduleTypes }: NewCustomerFormProps) {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const labels = getCustomerTypeLabels(type);

	const handleSubmit = async (formData: any) => {
		setIsSubmitting(true);
		try {
			const result = await createCustomerAction(formData);

			if (result.success) {
				toast.success("Success", {
					description: result.message || "Customer created successfully",
				});
				router.push(`/customers?type=${type}`);
			} else {
				toast.error("Error", {
					description: result.message || "Failed to create customer",
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
		router.push(`/customers?type=${type}`);
	};

	// Handle form submit via button in header
	const handleHeaderSubmit = async () => {
		const submitBtn = document.querySelector('form[data-customer-form] button[type="submit"]') as HTMLButtonElement;
		submitBtn?.click();
	};

	return (
		<div className="space-y-6">
			{/* Header with Actions */}
			<div className="flex items-center justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">{labels.createTitle}</h1>
					<p className="text-muted-foreground">{labels.createDescription}</p>
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
						{isSubmitting ? (
							<Loader
								size="sm"
								className="mr-2"
							/>
						) : (
							<Save className="mr-2 h-4 w-4" />
						)}
						{labels.createButton}
					</Button>
				</div>
			</div>

			{/* Form */}
			<CustomerForm
				parentCustomers={parentCustomers}
				onSubmit={handleSubmit}
				onCancel={handleCancel}
				hideButtons
				type={type}
				moduleTypes={moduleTypes}
			/>
		</div>
	);
}
