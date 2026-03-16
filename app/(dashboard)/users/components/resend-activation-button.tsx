"use client";

import { useState } from "react";

import { Mail } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { resendActivationEmailAction } from "@/lib/features/users/actions";
import type { ResendActivationButtonProps } from "@/lib/features/users/types";

export function ResendActivationButton({ userId, userEmail }: ResendActivationButtonProps) {
	const [isLoading, setIsLoading] = useState(false);

	async function handleResend() {
		setIsLoading(true);

		try {
			const result = await resendActivationEmailAction(userId);

			if (result.success) {
				toast.success("Activation email sent", {
					description: `Sent to ${userEmail}`,
				});
			} else {
				toast.error("Failed to send email", {
					description: result.message,
				});
			}
		} catch (error) {
			toast.error("Failed to send email", {
				description: error instanceof Error ? error.message : "An error occurred",
			});
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<Button
			variant="outline"
			size="sm"
			onClick={handleResend}
			disabled={isLoading}>
			{isLoading ? (
				<Loader
					size="sm"
					className="mr-1"
				/>
			) : (
				<Mail className="mr-1 h-4 w-4" />
			)}
			Resend Activation Email
		</Button>
	);
}
