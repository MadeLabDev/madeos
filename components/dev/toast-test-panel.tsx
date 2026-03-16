"use client";

import { AlertCircle, Bell, CheckCircle2, Info, XCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { isDevMode } from "@/lib/utils/dev-mode";

/**
 * Toast Testing Panel
 * Test all toast variants (only in dev mode)
 */
export function ToastTestPanel() {
	if (!isDevMode()) return null;

	const testToasts = () => {
		// Success toast
		setTimeout(() => {
			toast.success("Success!", {
				description: "Operation completed successfully",
				icon: <CheckCircle2 className="h-5 w-5" />,
			});
		}, 100);

		// Error toast
		setTimeout(() => {
			toast.error("Error!", {
				description: "Something went wrong",
				icon: <XCircle className="h-5 w-5" />,
			});
		}, 600);

		// Warning toast
		setTimeout(() => {
			toast.warning("Warning!", {
				description: "Please check this carefully",
				icon: <AlertCircle className="h-5 w-5" />,
			});
		}, 1100);

		// Info toast
		setTimeout(() => {
			toast.info("Info", {
				description: "Here is some information",
				icon: <Info className="h-5 w-5" />,
			});
		}, 1600);

		// Loading toast
		setTimeout(() => {
			const loadingToast = toast.loading("Loading...", {
				description: "Please wait while we process",
				icon: (
					<Loader
						size="md"
						className="animate-spin"
					/>
				),
			});

			// Dismiss loading toast after 2 seconds
			setTimeout(() => {
				toast.dismiss(loadingToast);
			}, 2000);
		}, 2100);

		// Custom toast with action
		setTimeout(() => {
			toast("Custom Toast", {
				description: "With custom action button",
				icon: <Bell className="h-5 w-5" />,
				action: {
					label: "Undo",
					onClick: () => toast.info("Undo clicked!"),
				},
			});
		}, 4200);

		// Promise toast
		setTimeout(() => {
			const promise = new Promise((resolve) => setTimeout(resolve, 2000));

			toast.promise(promise, {
				loading: "Processing...",
				success: "Process completed!",
				error: "Process failed!",
			});
		}, 4700);
	};

	const testIndividualToast = (type: string) => {
		switch (type) {
			case "success":
				toast.success("Success Toast", { description: "This is a success message" });
				break;
			case "error":
				toast.error("Error Toast", { description: "This is an error message" });
				break;
			case "warning":
				toast.warning("Warning Toast", { description: "This is a warning message" });
				break;
			case "info":
				toast.info("Info Toast", { description: "This is an info message" });
				break;
			case "loading":
				const loadingToast = toast.loading("Loading Toast", { description: "This is loading" });
				setTimeout(() => toast.dismiss(loadingToast), 3000);
				break;
			case "promise":
				const promise = new Promise((resolve) => setTimeout(resolve, 2000));
				toast.promise(promise, {
					loading: "Processing...",
					success: "Done!",
					error: "Failed!",
				});
				break;
		}
	};

	return (
		<Card className="mb-6 border-purple-500 bg-purple-50 dark:border-purple-600 dark:bg-purple-950/20">
			<div className="p-4">
				<h3 className="mb-2 text-sm font-semibold text-purple-800 dark:text-purple-300">🎨 Toast Testing (Development Only)</h3>
				<p className="mb-4 text-xs text-purple-700 dark:text-purple-400">Test all toast notification styles</p>

				<div className="space-y-3">
					<Button
						onClick={testToasts}
						className="w-full bg-purple-600 hover:bg-purple-700"
						size="sm">
						🎭 Test All Toasts (Sequence)
					</Button>

					<div className="grid grid-cols-2 gap-2">
						<Button
							onClick={() => testIndividualToast("success")}
							variant="outline"
							size="sm"
							className="border-green-500 text-green-700 hover:bg-green-50 dark:border-green-600 dark:text-green-400">
							✅ Success
						</Button>
						<Button
							onClick={() => testIndividualToast("error")}
							variant="outline"
							size="sm"
							className="border-red-500 text-red-700 hover:bg-red-50 dark:border-red-600 dark:text-red-400">
							❌ Error
						</Button>
						<Button
							onClick={() => testIndividualToast("warning")}
							variant="outline"
							size="sm"
							className="border-yellow-500 text-yellow-700 hover:bg-yellow-50 dark:border-yellow-600 dark:text-yellow-400">
							Warning
						</Button>
						<Button
							onClick={() => testIndividualToast("info")}
							variant="outline"
							size="sm"
							className="border-blue-500 text-blue-700 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-400">
							ℹ️ Info
						</Button>
						<Button
							onClick={() => testIndividualToast("loading")}
							variant="outline"
							size="sm"
							className="border-gray-500 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400">
							⏳ Loading
						</Button>
						<Button
							onClick={() => testIndividualToast("promise")}
							variant="outline"
							size="sm"
							className="border-purple-500 text-purple-700 hover:bg-purple-50 dark:border-purple-600 dark:text-purple-400">
							🔄 Promise
						</Button>
					</div>
				</div>
			</div>
		</Card>
	);
}
