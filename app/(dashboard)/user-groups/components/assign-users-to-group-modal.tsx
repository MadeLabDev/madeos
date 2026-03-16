"use client";

import { useEffect, useState } from "react";

import { X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Loader } from "@/components/ui/loader";
import { assignUsersToGroupAction } from "@/lib/features/user-groups/actions";
import { AssignUsersToGroupModalProps } from "@/lib/features/user-groups/types";

export function AssignUsersToGroupModal({ isOpen, onClose, userGroup }: AssignUsersToGroupModalProps) {
	const [pasteText, setPasteText] = useState("");
	const [pasteError, setPasteError] = useState("");
	const [parsedEmails, setParsedEmails] = useState<string[]>([]);
	const [invalidEmails, setInvalidEmails] = useState<string[]>([]);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Clear when modal closes
	useEffect(() => {
		if (!isOpen) {
			setPasteText("");
			setPasteError("");
			setParsedEmails([]);
			setInvalidEmails([]);
		}
	}, [isOpen]);

	// Parse emails in real-time
	useEffect(() => {
		if (!pasteText.trim()) {
			setParsedEmails([]);
			setInvalidEmails([]);
			setPasteError("");
			return;
		}

		// Parse emails: split by comma and newline
		const emailList = pasteText
			.split(/[,\n]/)
			.map((email) => email.trim())
			.filter((email) => email.length > 0);

		const validEmails: string[] = [];
		const invalidEmailsList: string[] = [];

		emailList.forEach((email) => {
			// Basic email validation
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (emailRegex.test(email)) {
				validEmails.push(email);
			} else if (email.length > 0) {
				invalidEmailsList.push(email);
			}
		});

		setParsedEmails(validEmails);
		setInvalidEmails(invalidEmailsList);

		if (invalidEmailsList.length > 0) {
			setPasteError(`${invalidEmailsList.length} invalid email(s) found: ${invalidEmailsList.slice(0, 3).join(", ")}${invalidEmailsList.length > 3 ? "..." : ""}`);
		} else {
			setPasteError("");
		}
	}, [pasteText]);

	/**
	 * Confirm assignment and close modal
	 */
	const handleConfirm = async () => {
		if (parsedEmails.length === 0) {
			setPasteError("Please enter at least one valid email address");
			return;
		}

		if (invalidEmails.length > 0) {
			setPasteError("Please fix invalid email addresses first");
			return;
		}

		setIsSubmitting(true);
		try {
			const result = await assignUsersToGroupAction({
				groupId: userGroup.id,
				userEmails: parsedEmails,
			});

			if (result.success) {
				toast.success(result.message);
				onClose();
				// The list will be updated via Pusher
			} else {
				toast.error(result.message);
			}
		} catch (error) {
			toast.error("Failed to assign users to group");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog
			open={isOpen}
			onOpenChange={onClose}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>Assign Users to {userGroup.name}</DialogTitle>
					<DialogDescription>Paste email addresses to add new users to this group (existing members will be preserved)</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					{/* Paste Emails */}
					<div className="space-y-2">
						<Label htmlFor="paste-emails">Email Addresses</Label>
						<textarea
							id="paste-emails"
							placeholder="Paste multiple emails (comma or newline separated)&#10;Example:&#10;user1@example.com, user2@example.com&#10;or&#10;user1@example.com&#10;user2@example.com"
							value={pasteText}
							onChange={(e) => {
								setPasteText(e.target.value);
								setPasteError("");
							}}
							disabled={isSubmitting}
							rows={6}
							className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[120px] w-full rounded-md border px-3 py-2 text-base focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
						/>

						{/* Email Preview */}
						{parsedEmails.length > 0 && (
							<div className="space-y-2">
								<Label className="text-xs text-green-600">Valid Emails ({parsedEmails.length})</Label>
								<div className="max-h-[100px] overflow-y-auto rounded-md border bg-green-50 p-2 dark:bg-green-950/20">
									<div className="flex flex-wrap gap-1">
										{parsedEmails.map((email, index) => (
											<span
												key={index}
												className="rounded bg-green-100 px-2 py-1 text-xs text-green-800 dark:bg-green-900 dark:text-green-200">
												{email}
											</span>
										))}
									</div>
								</div>
							</div>
						)}

						{/* Invalid Emails Warning */}
						{invalidEmails.length > 0 && (
							<div className="space-y-2">
								<Label className="text-xs text-red-600">Invalid Emails ({invalidEmails.length})</Label>
								<div className="max-h-[60px] overflow-y-auto rounded-md border border-red-200 bg-red-50 p-2 dark:border-red-800 dark:bg-red-950/20">
									<div className="flex flex-wrap gap-1">
										{invalidEmails.map((email, index) => (
											<span
												key={index}
												className="rounded bg-red-100 px-2 py-1 text-xs text-red-800 dark:bg-red-900 dark:text-red-200">
												{email}
											</span>
										))}
									</div>
								</div>
							</div>
						)}

						{pasteError && <p className="text-xs text-red-500">{pasteError}</p>}
					</div>
				</div>

				<DialogFooter>
					<Button
						variant="outline"
						onClick={onClose}
						disabled={isSubmitting}>
						<X className="mr-2 h-4 w-4" />
						Cancel
					</Button>
					<Button
						onClick={handleConfirm}
						disabled={parsedEmails.length === 0 || invalidEmails.length > 0 || isSubmitting}>
						{isSubmitting ? (
							<>
								<Loader className="mr-2 h-4 w-4 animate-spin" />
								Updating...
							</>
						) : (
							`Update (${parsedEmails.length})`
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
