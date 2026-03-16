"use client";

import { Save, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

import { TestReportForm } from "../../../components/test-report-form";

interface EditTestReportFormProps {
	reportId: string;
}

export function EditTestReportForm({ reportId }: EditTestReportFormProps) {
	const router = useRouter();

	const handleCancel = () => {
		router.push(`/test-management/reports/${reportId}`);
	};

	// Handle form submit via button in header
	const handleHeaderSubmit = () => {
		const submitBtn = document.querySelector('form[data-test-report-form] button[type="submit"]') as HTMLButtonElement;
		submitBtn?.click();
	};

	return (
		<div className="space-y-6">
			{/* Header with Actions */}
			<div className="flex items-center justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Edit Test Report</h1>
					<p className="text-muted-foreground">Update report information and findings</p>
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
						Update Report
					</Button>
				</div>
			</div>

			{/* Form */}
			<TestReportForm
				reportId={reportId}
				hideButtons={true}
			/>
		</div>
	);
}
