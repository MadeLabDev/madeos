"use client";

import { useState } from "react";

import { UserCheck, UserX } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { activateUserAction, deactivateUserAction } from "@/lib/features/users/actions";
import type { ActivateUserButtonProps } from "@/lib/features/users/types";

export function ActivateUserButton({ userId, userEmail, isActive, variant = "default", className = "" }: ActivateUserButtonProps) {
	const [isLoading, setIsLoading] = useState(false);

	async function handleActivate() {
		if (!confirm(`Activate user ${userEmail}? This will mark the account as active.`)) {
			return;
		}

		setIsLoading(true);

		try {
			const result = await activateUserAction(userId);

			if (result.success) {
				toast.success("User activated", {
					description: result.message,
				});
				// Component parent will handle state update via Pusher
			} else {
				toast.error("Failed to activate", {
					description: result.message,
				});
			}
		} catch (error) {
			toast.error("Failed to activate", {
				description: error instanceof Error ? error.message : "An error occurred",
			});
		} finally {
			setIsLoading(false);
		}
	}

	async function handleDeactivate() {
		if (!confirm(`Deactivate user ${userEmail}? This will mark the account as inactive.`)) {
			return;
		}

		setIsLoading(true);

		try {
			const result = await deactivateUserAction(userId);

			if (result.success) {
				toast.success("User deactivated", {
					description: result.message,
				});
				// Component parent will handle state update via Pusher
			} else {
				toast.error("Failed to deactivate", {
					description: result.message,
				});
			}
		} catch (error) {
			toast.error("Failed to deactivate", {
				description: error instanceof Error ? error.message : "An error occurred",
			});
		} finally {
			setIsLoading(false);
		}
	}

	if (!isActive) {
		return (
			<Button
				variant={variant}
				size="sm"
				onClick={handleActivate}
				disabled={isLoading}
				className={`${className}`}>
				{isLoading ? (
					<Loader
						size="sm"
						className="mr-1"
					/>
				) : (
					<UserCheck className="mr-1 h-4 w-4" />
				)}
				Activate
			</Button>
		);
	}

	return (
		<Button
			variant={variant}
			size="sm"
			onClick={handleDeactivate}
			disabled={isLoading}
			className={`text-orange-600 hover:text-orange-700 ${className}`}>
			{isLoading ? (
				<Loader
					size="sm"
					className="mr-2"
				/>
			) : (
				<UserX className="mr-2 h-4 w-4" />
			)}
			Deactivate
		</Button>
	);
}
