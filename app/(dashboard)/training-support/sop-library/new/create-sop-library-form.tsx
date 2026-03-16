"use client";

import { useState } from "react";

import { Save, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";

import { SOPLibraryForm } from "../../components/sop-library-form";

export function CreateSOPLibraryForm() {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleCancel = () => {
		router.back();
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Create SOP Library Entry</h1>
					<p className="text-muted-foreground">Add a new standard operating procedure to the library</p>
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
						onClick={() => {
							const form = document.querySelector("form[data-sop-form]") as HTMLFormElement | null;
							if (form) {
								form.requestSubmit();
							}
						}}
						disabled={isSubmitting}>
						{isSubmitting && (
							<Loader
								size="sm"
								className="mr-2"
							/>
						)}
						{!isSubmitting && <Save className="mr-2 h-4 w-4" />}
						Create SOP
					</Button>
				</div>
			</div>

			<SOPLibraryForm
				hideButtons={true}
				onSubmittingChange={setIsSubmitting}
			/>
		</div>
	);
}
