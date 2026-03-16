"use client";

import { Save, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

import { TestSuiteForm } from "../../../components/test-suite-form";

interface EditTestSuiteFormProps {
	suiteId: string;
}

export function EditTestSuiteForm({ suiteId }: EditTestSuiteFormProps) {
	const router = useRouter();

	const handleCancel = () => {
		router.push(`/test-management/suites/${suiteId}`);
	};

	// Handle form submit via button in header
	const handleHeaderSubmit = () => {
		const submitBtn = document.querySelector('form[data-test-suite-form] button[type="submit"]') as HTMLButtonElement;
		submitBtn?.click();
	};

	return (
		<div className="space-y-6">
			{/* Header with Actions */}
			<div className="flex items-center justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Edit Test Suite</h1>
					<p className="text-muted-foreground">Update test suite information and settings</p>
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
						Update Suite
					</Button>
				</div>
			</div>

			{/* Form */}
			<TestSuiteForm
				suiteId={suiteId}
				hideButtons={true}
			/>
		</div>
	);
}
