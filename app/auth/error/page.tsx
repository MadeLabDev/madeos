import { AlertCircle } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

interface ErrorPageProps {
	searchParams: Promise<{
		error?: string;
		error_description?: string;
	}>;
}

const ERROR_MESSAGES: Record<string, { title: string; description: string }> = {
	access_denied: {
		title: "Access Denied",
		description: "You do not have permission to access this resource.",
	},
	invalid_grant: {
		title: "Invalid Credentials",
		description: "The email or password you provided is incorrect.",
	},
	invalid_request: {
		title: "Invalid Request",
		description: "The request is missing required parameters or is malformed.",
	},
	server_error: {
		title: "Server Error",
		description: "An unexpected error occurred. Please try again later.",
	},
	temporarily_unavailable: {
		title: "Service Unavailable",
		description: "The authentication service is temporarily unavailable. Please try again later.",
	},
	unauthorized_client: {
		title: "Unauthorized Client",
		description: "The application is not authorized to perform this action.",
	},
	unsupported_response_type: {
		title: "Unsupported Response Type",
		description: "The requested response type is not supported.",
	},
};

export default async function ErrorPage({ searchParams }: ErrorPageProps) {
	const params = await searchParams;
	const errorCode = params.error || "unknown";
	const errorDescription = params.error_description;

	const errorInfo = ERROR_MESSAGES[errorCode] || {
		title: "Authentication Error",
		description: errorDescription || "An error occurred during authentication. Please try again.",
	};

	return (
		<div className="bg-background flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
			<div className="w-full max-w-md space-y-8">
				<div>
					<h2 className="text-foreground mt-6 text-center text-3xl font-extrabold">Authentication Error</h2>
				</div>

				<div className="bg-card border-border space-y-6 rounded-lg border px-6 py-8 shadow">
					{/* Error Icon */}
					<div className="flex justify-center">
						<AlertCircle className="text-muted-foreground h-12 w-12" />
					</div>

					{/* Error Title */}
					<h3 className="text-foreground text-center text-xl font-semibold">{errorInfo.title}</h3>

					{/* Error Description */}
					<p className="text-muted-foreground text-center text-sm">{errorInfo.description}</p>

					{/* Error Code */}
					{errorCode !== "unknown" && (
						<div className="bg-muted rounded-md p-3">
							<p className="text-muted-foreground text-center font-mono text-sm">
								Error Code: <span className="font-semibold">{errorCode}</span>
							</p>
						</div>
					)}

					{/* Action Buttons */}
					<div className="flex flex-col gap-3 sm:flex-row">
						<Button
							asChild
							className="flex-1">
							<Link href="/auth/signin">Back to Sign In</Link>
						</Button>
						<Button
							asChild
							variant="outline"
							className="flex-1">
							<Link href="/">Go Home</Link>
						</Button>
					</div>
				</div>

				{/* Help Text */}
				<div className="text-center">
					<p className="text-muted-foreground text-sm">
						Need help?{" "}
						<Link
							href="/contact-us"
							className="text-primary hover:text-primary/80 font-medium">
							Contact support
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}
