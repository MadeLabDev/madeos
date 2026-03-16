"use client";

import { useEffect, useState } from "react";

import { Save, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";

import { TestReportForm } from "../../components/test-report-form";

export function NewTestReportForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [testOrderId, setTestOrderId] = useState<string | undefined>();

	useEffect(() => {
		const testOrderIdParam = searchParams.get("testOrderId");
		if (testOrderIdParam) {
			setTestOrderId(testOrderIdParam);
		}
	}, [searchParams]);

	function handleCancel() {
		router.push("/test-management/reports");
	}

	// Handle form submit via button in header
	const handleHeaderSubmit = async () => {
		setIsSubmitting(true);
		try {
			const submitBtn = document.querySelector('form[data-test-report-form] button[type="submit"]') as HTMLButtonElement;
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
					<h1 className="text-3xl font-bold tracking-tight">Create Test Report</h1>
					<p className="text-muted-foreground">Generate a new test report with findings and recommendations</p>
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
						Create Report
					</Button>
				</div>
			</div>

			{/* Form */}
			<TestReportForm
				hideButtons={true}
				testOrderId={testOrderId}
			/>
		</div>
	);
}
