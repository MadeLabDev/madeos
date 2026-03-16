import { Suspense } from "react";

import Loader from "@/components/ui/loader";
import { generateAuthMetadata } from "@/lib/utils/metadata";

import { ResetPasswordForm } from "./reset-password-form";

function ResetPasswordSkeleton() {
	return (
		<div className="bg-background flex min-h-screen items-center justify-center">
			<div className="text-center">
				<Loader size="lg" />
				<p className="text-muted-foreground mt-4">Loading...</p>
			</div>
		</div>
	);
}

export const metadata = generateAuthMetadata("Reset Password", "Set a new password for your MADE Laboratory account");

export default function ResetPasswordPage() {
	return (
		<Suspense fallback={<ResetPasswordSkeleton />}>
			<ResetPasswordForm />
		</Suspense>
	);
}
