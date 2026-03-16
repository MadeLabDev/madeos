import { Suspense } from "react";

import { Loader } from "@/components/ui/loader";
import { generateAuthMetadata } from "@/lib/utils/metadata";

import ForgotPasswordForm from "./forgot-password-form";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = generateAuthMetadata("Forgot Password", "Reset your MADE Laboratory account password");

export default function ForgotPasswordPage() {
	return (
		<Suspense fallback={<Loader size="sm" />}>
			<ForgotPasswordForm />
		</Suspense>
	);
}
