import { Suspense } from "react";

import Loader from "@/components/ui/loader";
import { generateAuthMetadata } from "@/lib/utils/metadata";

import { SignInForm } from "./signin-form";

function SignInSkeleton() {
	return (
		<div className="bg-background flex min-h-screen items-center justify-center">
			<div className="text-center">
				<Loader size="lg" />
				<p className="text-muted-foreground mt-4">Loading...</p>
			</div>
		</div>
	);
}

export const metadata = generateAuthMetadata("Sign In", "Sign in to your MADE Laboratory account to access the screen printing shop management system");

export default function SignInPage() {
	return (
		<Suspense fallback={<SignInSkeleton />}>
			<SignInForm />
		</Suspense>
	);
}
