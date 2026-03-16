import { Suspense } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { generateAuthMetadata } from "@/lib/utils/metadata";

import { ActivateAccountForm } from "./activate-form";

export const metadata = generateAuthMetadata("Activate");

export default function ActivateAccountPage() {
	return (
		<div className="bg-background flex min-h-screen items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle className="text-center text-2xl">Activate Your Account</CardTitle>
					<CardDescription className="text-center">Set your password to activate your account</CardDescription>
				</CardHeader>
				<CardContent>
					<Suspense fallback={<Loader size="sm" />}>
						<ActivateAccountForm />
					</Suspense>
				</CardContent>
			</Card>
		</div>
	);
}
