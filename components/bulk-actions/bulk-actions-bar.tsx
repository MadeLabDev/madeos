"use client";

import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";

export interface BulkAction {
	label: string;
	icon?: React.ComponentType<{ className?: string }>;
	onClick: () => void;
	variant?: "default" | "destructive" | "outline" | "ghost" | "secondary";
	disabled?: boolean;
}

export interface BulkActionsBarProps {
	selectedCount: number;
	itemName?: string; // e.g., "user", "pantone", "role" - will be pluralized automatically
	isLoading?: boolean;
	actions: BulkAction[];
	onClear: () => void;
}

export function BulkActionsBar({ selectedCount, itemName = "item", isLoading = false, actions, onClear }: BulkActionsBarProps) {
	if (selectedCount === 0) return null;

	return (
		<div className="bg-muted/50 mb-4 flex items-center justify-between rounded-lg border p-4">
			<div className="flex items-center gap-2">
				<span className="text-sm font-medium">
					{selectedCount} {itemName}(s) selected
				</span>
			</div>
			<div className="flex items-center gap-2">
				{actions.map((action, idx) => (
					<Button
						key={idx}
						variant={action.variant || "default"}
						size="sm"
						onClick={action.onClick}
						disabled={action.disabled || isLoading}>
						{isLoading && (
							<Loader
								size="sm"
								className="mr-2"
							/>
						)}
						{!isLoading && action.icon && <>{action.icon && <action.icon className="mr-2 h-4 w-4" />}</>}
						{action.label}
					</Button>
				))}
				<Button
					variant="ghost"
					size="sm"
					onClick={onClear}
					disabled={isLoading}>
					Clear
				</Button>
			</div>
		</div>
	);
}
