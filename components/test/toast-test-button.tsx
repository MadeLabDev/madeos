"use client";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function ToastTestButton() {
	const testToasts = () => {
		// Test different toast types
		toast.success("Success toast", {
			description: "This is a success message",
		});

		setTimeout(() => {
			toast.error("Error toast", {
				description: "This is an error message",
			});
		}, 500);

		setTimeout(() => {
			toast.warning("Warning toast", {
				description: "This is a warning message",
			});
		}, 1000);

		setTimeout(() => {
			toast.info("Info toast", {
				description: "This is an info message",
			});
		}, 1500);

		setTimeout(() => {
			toast("Custom toast", {
				description: "This is a custom message with action",
				action: {
					label: "Undo",
					onClick: () => toast.success("Undo clicked!"),
				},
			});
		}, 2000);
	};

	return (
		<Button
			onClick={testToasts}
			variant="outline">
			Test All Toasts
		</Button>
	);
}
