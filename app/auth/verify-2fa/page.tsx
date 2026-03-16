import { Suspense } from "react";

import { ShieldCheck } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { generateCrudMetadata } from "@/lib/utils/metadata";

import { Verify2FAForm } from "./verify-2fa-form";

export const metadata = generateCrudMetadata("Two-Factor Authentication");

export default function Verify2FAPage() {
	return (
		<div className="flex min-h-screen items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-1 text-center">
					<div className="mb-4 flex justify-center">
						<div className="bg-primary/10 rounded-full p-3">
							<ShieldCheck className="text-primary h-10 w-10" />
						</div>
					</div>
					<CardTitle className="text-2xl">Two-Factor Authentication</CardTitle>
					<CardDescription>Enter the verification code from your authenticator app to continue</CardDescription>
				</CardHeader>
				<CardContent>
					<Suspense fallback={<Loader size="sm" />}>
						<Verify2FAForm />
					</Suspense>
				</CardContent>
			</Card>
		</div>
	);
}
