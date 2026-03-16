"use client";

import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";

interface PageHeaderWithActionsProps {
	title: string;
	subtitle?: string;
	isLoading?: boolean;
	onSubmit?: () => void | Promise<void>;
	onCancel?: () => void;
	submitLabel?: string;
	cancelLabel?: string;
}

export function PageHeaderWithActions({ title, subtitle, isLoading = false, onSubmit, onCancel, submitLabel = "Save", cancelLabel = "Cancel" }: PageHeaderWithActionsProps) {
	return (
		<div className="flex items-center justify-between gap-4">
			<div className="flex-1">
				<h1 className="text-3xl font-bold tracking-tight">{title}</h1>
				{subtitle && <p className="text-muted-foreground">{subtitle}</p>}
			</div>

			{/* Action Buttons */}
			{(onCancel || onSubmit) && (
				<div className="flex gap-3">
					{onCancel && (
						<Button
							type="button"
							variant="outline"
							onClick={onCancel}
							disabled={isLoading}>
							{cancelLabel}
						</Button>
					)}
					{onSubmit && (
						<Button
							type="button"
							onClick={onSubmit}
							disabled={isLoading}>
							{isLoading && (
								<Loader
									size="sm"
									className="mr-2"
								/>
							)}
							{submitLabel}
						</Button>
					)}
				</div>
			)}
		</div>
	);
}
