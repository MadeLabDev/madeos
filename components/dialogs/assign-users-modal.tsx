"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Loader } from "@/components/ui/loader";
import { Textarea } from "@/components/ui/textarea";

interface AssignUsersModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: (emails: string[]) => void;
	isLoading?: boolean;
}

export function AssignUsersModal({ isOpen, onClose, onConfirm, isLoading = false }: AssignUsersModalProps) {
	const [pasteText, setPasteText] = useState("");
	const [pasteError, setPasteError] = useState("");
	const [parsedEmails, setParsedEmails] = useState<string[]>([]);
	const [invalidEmails, setInvalidEmails] = useState<string[]>([]);

	// Clear when modal closes
	useEffect(() => {
		if (!isOpen) {
			setPasteText("");
			setPasteError("");
			setParsedEmails([]);
			setInvalidEmails([]);
		}
	}, [isOpen]);

	// Email validation function
	const isValidEmail = (email: string): boolean => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	};

	// Computed parsed emails
	const parsedEmailData = useMemo(() => {
		if (!pasteText.trim()) {
			return { parsedEmails: [], invalidEmails: [], pasteError: "" };
		}

		const emails = pasteText
			.split(/[\n,\s]+/)
			.map((email) => email.trim())
			.filter((email) => email.length > 0);

		const validEmails: string[] = [];
		const invalidEmails: string[] = [];

		emails.forEach((email) => {
			if (isValidEmail(email)) {
				validEmails.push(email);
			} else {
				invalidEmails.push(email);
			}
		});

		return {
			parsedEmails: validEmails,
			invalidEmails,
			pasteError: invalidEmails.length > 0 ? `Invalid emails: ${invalidEmails.join(", ")}` : "",
		};
	}, [pasteText]);

	// Sync computed data with state
	useEffect(() => {
		setParsedEmails(parsedEmailData.parsedEmails);
		setInvalidEmails(parsedEmailData.invalidEmails);
		setPasteError(parsedEmailData.pasteError);
	}, [parsedEmailData]);

	const handleConfirm = () => {
		if (parsedEmails.length === 0) {
			setPasteError("Please enter at least one valid email address");
			return;
		}

		if (invalidEmails.length > 0) {
			setPasteError(`Please fix invalid emails: ${invalidEmails.join(", ")}`);
			return;
		}

		onConfirm(parsedEmails);
		setPasteText("");
		setParsedEmails([]);
		setInvalidEmails([]);
		setPasteError("");
	};

	return (
		<Dialog
			open={isOpen}
			onOpenChange={onClose}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>Assign Users</DialogTitle>
					<DialogDescription>Paste email addresses to assign users to this knowledge article. Separate multiple emails with commas or newlines.</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					<div>
						<Label htmlFor="emails">Email Addresses</Label>
						<Textarea
							id="emails"
							placeholder="user1@example.com, user2@example.com&#10;user3@example.com"
							value={pasteText}
							onChange={(e) => setPasteText(e.target.value)}
							rows={4}
							className="mt-1"
						/>
						{pasteError && <p className="mt-1 text-sm text-red-600">{pasteError}</p>}
						{parsedEmails.length > 0 && (
							<p className="mt-1 text-sm text-green-600">
								Found {parsedEmails.length} valid email{parsedEmails.length !== 1 ? "s" : ""}
							</p>
						)}
					</div>
				</div>

				<DialogFooter>
					<Button
						variant="outline"
						onClick={onClose}
						disabled={isLoading}>
						Cancel
					</Button>
					<Button
						onClick={handleConfirm}
						disabled={isLoading || parsedEmails.length === 0}>
						{isLoading ? <Loader className="mr-2 h-4 w-4" /> : null}
						Assign Users
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
