"use client";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Loader } from "@/components/ui/loader";

export interface DeleteDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description: React.ReactNode;
	itemName?: string;
	isDeleting?: boolean;
	onConfirm: () => Promise<void> | void;
	isDangerous?: boolean; // If true, action button becomes red
}

export function DeleteDialog({ open, onOpenChange, title, description, isDeleting = false, onConfirm, isDangerous = true }: DeleteDialogProps) {
	return (
		<AlertDialog
			open={open}
			onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{title}</AlertDialogTitle>
					<AlertDialogDescription>{description}</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={onConfirm}
						disabled={isDeleting}
						className={isDangerous ? "bg-red-600 hover:bg-red-700" : ""}>
						{isDeleting && (
							<Loader
								size="sm"
								className="mr-2"
							/>
						)}
						Delete
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
