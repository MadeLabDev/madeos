"use client";

import { useState } from "react";

import { Mail } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { resendActivationEmailsToExpiredUsersAction } from "@/lib/features/users/actions";

export function ResendExpiredActivationButton() {
	const { data: session } = useSession();
	const [isLoading, setIsLoading] = useState(false);

	// Check if user has admin or manager role
	const hasPermission = session?.user?.roles?.some((role) => role.name === "admin" || role.name === "manager");

	if (!hasPermission) {
		return null;
	}

	async function handleResend() {
		if (!confirm("Are you sure you want to resend activation emails to all users with expired links?")) {
			return;
		}

		setIsLoading(true);

		try {
			const result = await resendActivationEmailsToExpiredUsersAction();

			if (result.success) {
				toast.success("Activation emails sent", {
					description: result.message,
				});
			} else {
				toast.error("Failed to send emails", {
					description: result.message,
				});
			}
		} catch (error) {
			toast.error("Failed to send emails", {
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
			disabled={isLoading}
			className="w-full sm:w-auto">
			{isLoading ? (
				<Loader
					size="sm"
					className="mr-1"
				/>
			) : (
				<Mail className="mr-1 h-4 w-4" />
			)}
			{isLoading ? "Sending..." : "Resend All Activation"}
		</Button>
	);
}
