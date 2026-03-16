"use client";

import { Save, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

import { TestOrderForm } from "../../../components/test-order-form";

interface EditTestOrderFormProps {
	testOrderId: string;
}

export function EditTestOrderForm({ testOrderId }: EditTestOrderFormProps) {
	const router = useRouter();

	const handleCancel = () => {
		router.push(`/test-management/orders/${testOrderId}`);
	};

	// Handle form submit via button in header
	const handleHeaderSubmit = () => {
		const submitBtn = document.querySelector('form[data-test-order-form] button[type="submit"]') as HTMLButtonElement;
		submitBtn?.click();
	};

	return (
		<div className="space-y-6">
			{/* Header with Actions */}
			<div className="flex items-center justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Edit Test Order</h1>
					<p className="text-muted-foreground">Update test order information and settings</p>
				</div>
				<div className="flex gap-3">
					<Button
						type="button"
						variant="outline"
						onClick={handleCancel}>
						<X className="mr-2 h-4 w-4" />
						Cancel
					</Button>
					<Button
						type="button"
						onClick={handleHeaderSubmit}>
						<Save className="mr-2 h-4 w-4" />
						Update Order
					</Button>
				</div>
			</div>

			{/* Form */}
			<TestOrderForm
				testOrderId={testOrderId}
				hideButtons={true}
			/>
		</div>
	);
}
