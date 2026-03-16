"use client";

import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export interface InfoModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description?: React.ReactNode;
	content?: React.ReactNode;
	actionLabel?: string;
	onAction?: () => void;
}

export function InfoModal({ open, onOpenChange, title, description, content, actionLabel = "Close", onAction }: InfoModalProps) {
	return (
		<AlertDialog
			open={open}
			onOpenChange={onOpenChange}>
			<AlertDialogContent className="max-w-md">
				<AlertDialogHeader>
					<AlertDialogTitle>{title}</AlertDialogTitle>
					{description && <AlertDialogDescription>{description}</AlertDialogDescription>}
				</AlertDialogHeader>
				{content && <div className="text-foreground py-4 text-sm">{content}</div>}
				<AlertDialogFooter>
					<AlertDialogAction
						onClick={() => {
							onAction?.();
							onOpenChange(false);
						}}>
						{actionLabel}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
